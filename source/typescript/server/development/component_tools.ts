import { CSSNode, CSSNodeType, mergeRulesIntoOne, rule as parse_rule } from '@candlelib/css';
import { Logger } from '@candlelib/log';
import URI from '@candlelib/uri';
import wick, { ComponentData, Context, renderNew } from '@candlelib/wick';
import { ComponentHash } from '@candlelib/wick/build/library//compiler/common/hash_name.js';
import { createCompiledComponentClass } from '@candlelib/wick/build/library/compiler/ast-build/build.js';
import { getCSSStringFromComponentStyle } from '@candlelib/wick/build/library/compiler/ast-render/css.js';
import { createClassStringObject } from '@candlelib/wick/build/library/compiler/ast-render/js.js';
import { createComponent } from '@candlelib/wick/build/library/compiler/create_component.js';
import fs from "fs";
import { Session } from '../../common/session.js';
import { CSSPatch, EditorCommand, Patch, PatchType, StubPatch, TextPatch } from '../../types/editor_types.js';
import { store, __sessions__ } from './store.js';

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

        store.updated_components.set(new_comp.name, new_comp);

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
    component_from: ComponentData,
    component_to: ComponentData,
    context: Context
): Promise<Patch> {

    if (component_to.code_hash != component_from.code_hash) {
        return {
            type: PatchType.REPLACE,
            to: component_to.name,
            from: component_from.name,
            patch_scripts: await createReplacePatch(component_to, context)
        };
    }

    if (component_to.ele_hash != component_from.ele_hash) {
        return {
            type: PatchType.REPLACE,
            to: component_to.name,
            from: component_from.name,
            patch_scripts: await createReplacePatch(component_to, context)
        };
    }

    if (component_to.css_hash != component_from.css_hash) {
        return createCSSPatch(component_from, component_to);
    }

    if (component_to.text_hash != component_from.text_hash) {

        const elements = [
            [component_to.HTML, component_from.HTML]
        ];

        const patches: TextPatch["patches"] = [];

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

        return {
            type: PatchType.TEXT,
            to: component_to.name,
            from: component_from.name,
            patches: patches
        };
    }
}

export function createStubPatch(
    component_from: ComponentData,
    component_to: ComponentData,
): StubPatch {
    return {
        type: PatchType.STUB,
        to: component_to.name,
        from: component_from.name
    };
}

export function createCSSPatch(
    component_from: ComponentData,
    component_to: ComponentData,
): CSSPatch {
    return {
        type: PatchType.CSS,
        to: component_to.name,
        from: component_from.name,
        style: component_to.CSS.map(s => getCSSStringFromComponentStyle(s, component_to)).join("\n")
    };
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



/**
 * Creates a new component that has the given stylesheet 
 * attached. 
 */
export async function updateStyle(
    location: string,
    rule_path: string,
    selectors: string,
    properties: string,
    context: Context
): Promise<CSSPatch> {

    //Select the appropriate component
    const uri = new URI(location);

    let style_sheet: CSSNode = null;

    let type: "stylesheet" | "styleeleement" = null;

    let comp = null;

    const create_component = null;

    if (uri.ext == "css") {
        debugger;
        type = "stylesheet";
    } else if (uri.ext == "wick") {
        comp = store.components.get(uri + "").comp;
        style_sheet = comp.CSS.slice(-1)[0]?.data;

        if (!style_sheet) {
            //TODO: Add a new style element to the component
            debugger;
        }

        type = "styleeleement";
    }

    let new_source = "";

    for (const rule of style_sheet.nodes) {
        if (
            rule.type == CSSNodeType.Rule
            &&
            rule.selectors.map(renderNew).join(",") == selectors
        ) {

            const new_rule = parse_rule(`${selectors} { ${properties} }`);

            const new_new_rule = mergeRulesIntoOne(rule, new_rule);

            new_source = rule.pos.replace(renderNew(new_new_rule));

            break;

        }
    }

    if (!new_source) {
        //Add a new rule to the stylesheet
        const insertion_point = style_sheet.pos.token_slice(style_sheet.pos.len);

        new_source = insertion_point.replace(`${selectors} { ${properties} }`);
    }

    if (type == "styleeleement") {

        const new_comp = await createNewComponentFromSourceString(new_source, context, comp.location);

        swap_component_data(new_comp, comp);

        writeComponent(new_comp);

        return createCSSPatch(comp, new_comp);

    } else if (type == "stylesheet") {
        debugger;
    }

    //Add the rule to the LAST style sheet
    /* 
        if (component.CSS.length > 0) {
            // Update the style sheet within the component 
            // then render out a new component;
            const style = parse(rules);
    
            //Merge Compatible rules instead of appending new rules.
    
            const new_data = Object.assign(component.CSS[0].data);
    
            // Find within the existing style sheet the node
            // with the same selector string
    
            for (const node of )
    
                new_data.nodes = new_data.nodes.concat(style.nodes);
    
            new_source = new_data.pos.replace(
                renderCompressed(new_data)
            );
        } else {
            // Render the source as a new file with the given css attached 
            const ast = parse_component(component.source).ast;
    
            if (ast.type == JSNodeType.Module) {
                //Append the style to the end of the document
                ast.nodes.push(parse_component(`<style>${rules}</style>`).ast);
            } else {
                //Append the style within the root component
                ast.nodes.unshift(parse_component(`<style>${rules}</style>`).ast);
            }
    
            //Render source to string
            new_source = renderNewFormatted(ast);
        }
    
        return await createNewComponentFromSourceString(new_source, context, component); */
}