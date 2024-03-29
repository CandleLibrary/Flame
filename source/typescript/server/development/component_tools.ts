import { Logger } from '@candlelib/log';
import URI from '@candlelib/uri';
import wick, { ComponentData, componentDataToCSS, Context } from '@candlelib/wick';
import { ComponentHash } from '@candlelib/wick/build/library//compiler/common/hash_name.js';
import { createCompiledComponentClass } from '@candlelib/wick/build/library/compiler/ast-build/build.js';
import { createClassStringObject } from '@candlelib/wick/build/library/compiler/ast-render/js.js';
import { createComponent } from '@candlelib/wick/build/library/compiler/create_component.js';
import fs from "fs";
import { ChangeType } from '../../types/transition.js';
import { Session } from '../../common/session.js';
import { EditorCommand } from '../../types/editor_types.js';
import { Patch, PatchType } from "../../types/patch";
import { addTransition, getComponent, getTransition, store, __sessions__ } from './store.js';

const fsp = fs.promises;
export const logger = Logger.createLogger("flame");

export async function createNewComponentFromSourceString(new_source: string, context: Context, location: URI) {

    const comp = await createComponent(new_source, context, location);

    comp.location = location;

    return comp;
}

async function writeComponent(component: ComponentData) {

    const location = component.location;

    // const path = URI.resolveRelative("./" + location.filename + ".temp." + location.ext, location);
    //
    // logger.debug(`TODO: Writing temporary component [${path + ""}] instead of overwriting [${location + ""}]`);

    //await fsp.writeFile(path + "", component.source);

    await fsp.writeFile(location + "", component.source);
}
/**
 * Swaps the old component with th enew component. Both components must 
 * be from the same source file path
 * @param new_comp 
 * @param old_comp 
 * @param sessions 
 */
export function swap_component_data(
    new_comp: ComponentData,
    old_comp: ComponentData,
    sessions: Iterable<Session> = __sessions__
) {

    const path = old_comp.location + "";

    if (new_comp.location.toString() != old_comp.location.toString()) {
        logger.critical(`        
Attempt to swap component ${old_comp.name} with ${new_comp.name} failed:
New Component location ${new_comp.location + ""} does not match Old Component
location ${old_comp.location + ""}
        `);
    } else {

        // Check to see if there exists a transition from this component 
        // to new one
        const transition = getTransition(old_comp.name, new_comp.name);

        if (!transition) {
            //Create a general transition for this component 
            addTransition({
                new_id: new_comp.name,
                old_id: old_comp.name,
                new_location: old_comp.location + "",
                old_location: old_comp.location + "",
                changes: [
                    {
                        type: ChangeType.General,
                        component: old_comp.name,
                        changes: [],
                        location: old_comp.location + ""
                    }
                ],
                source: new_comp.source
            });
        }


        for (const endpoint of store.page_components.get(path)?.endpoints ?? [])
            store.endpoints.set(endpoint, { comp: new_comp });

        store.components.set(path, { comp: new_comp });

        logger.log(`Created new component [ ${new_comp.name} ] from path [ ${path} ] `);

        alertSessionsOfComponentTransition(
            sessions,
            old_comp.name,
            new_comp.name,
            old_comp.location
        );
    }
}


export function alertSessionsOfComponentTransition(
    sessions: Iterable<Session>,
    old_comp_name: string,
    new_comp_name: string,
    location: URI
) {

    for (const session of sessions) {
        session.send_command({
            command: EditorCommand.UPDATED_COMPONENT,
            path: location + "",
            old_name: old_comp_name,
            new_name: new_comp_name
        });
    }
}

export function getSourceHash(source: string) {
    return ComponentHash(source);
}

/**
 * Compares two components and issues an appropriate patch
 * object to update the component_from to component_to.
 * 
 * This patch may be as trivial as changing the from component's
 * hash name to match that of the to component's, to as complex
 * as replacing the entire from component object with the to 
 * object. 
 * 
 * @param component_from 
 * @param component_to 
 */

export async function getPatch(
    from: string,
    to: string,
    context: Context
): Promise<Patch[PatchType]> {

    const transition = getTransition(from, to);

    if (transition.patch)
        return transition.patch;

    let patch = null;

    const changes = transition.changes;

    if (changes.some(
        g => g.type == ChangeType.General
            ||
            g.type == ChangeType.Attribute
    )) {
        const component_from = await getComponent(from);
        const component_to = await getComponent(to);

        if (component_to.code_hash != component_from.code_hash) {

            patch = {
                type: PatchType.REPLACE,
                to: component_to.name,
                from: component_from.name,
                patch_scripts: await createReplacePatch(component_to, context)
            };

        } else if (component_to.ele_hash != component_from.ele_hash) {

            patch = {
                type: PatchType.REPLACE,
                to: component_to.name,
                from: component_from.name,
                patch_scripts: await createReplacePatch(component_to, context)
            };

        } else if (component_to.css_hash != component_from.css_hash) {

            patch = await createCSSPatch(patch, from, to);

        } else if (component_to.text_hash != component_from.text_hash) {

            const elements = [
                [component_to.HTML, component_from.HTML]
            ];

            const patches: Patch[PatchType.TEXT]["patches"] = [];

            for (const [to, from] of elements) {

                if (!("IS_BINDING" in to) && !("tag" in to) && "data" in to) {
                    if (to.data != from.data)
                        patches.push({ index: 0, to: to.data, from: from.data });
                } else if (to.nodes)
                    for (let i = 0; i < to?.nodes.length; i++) {
                        elements.push([
                            to.nodes[i],
                            from.nodes[i],
                        ]);
                    }
            }

            patch = {
                type: PatchType.TEXT,
                to: component_to.name,
                from: component_from.name,
                patches: patches
            };
        }
    } else {
        patch = await createCSSPatch(patch, from, to);
    }

    transition.patch = patch;

    return patch;
}

async function createCSSPatch(patch: any, from: string, to: string) {
    patch = {
        type: PatchType.CSS,
        from: from,
        to: to,
        style: componentDataToCSS(await getComponent(to))
    };
    return patch;
}

async function createReplacePatch(
    comp: ComponentData,
    context: Context
): Promise<string[]> {
    const root_component: ComponentData = comp;

    const patches = [];

    for (const comp of getComponentDependencies(root_component, context)) {

        const code_patch = await createRPPatchScript(comp, context);

        patches.push(code_patch);
    }

    return patches;
}

async function createRPPatchScript(
    comp: ComponentData,
    context: Context
) {


    const comp_class = await createCompiledComponentClass(comp, context, true, true);
    const class_strings = `
        const name = "${comp.name}";
        const WickRTComponent = wick.rt.C;
        const components= wick.rt.context.component_class;
        
        if(!components.has(name)){
            const class_ = ${createClassStringObject(comp, comp_class, context).class_string};
            components.set(name, class_);
        }

        return components.get(name);
        `;

    return class_strings;
}

/**
 * Returns a list of all components that are required to
 * properly render the givin root component, 
 * including the root component
 * @param root_component 
 * @returns 
 */
export function getComponentDependencies(
    root_component: ComponentData,
    context: Context = wick.rt.context
): Array<ComponentData> {

    const seen_components: Set<string> = new Set();

    const output = [root_component];

    for (const component of output) {

        seen_components.add(component.name);

        for (const [, comp_name] of component.local_component_names)
            if (!seen_components.has(comp_name))
                output.push(context.components.get(comp_name));
    }

    return output;
}
