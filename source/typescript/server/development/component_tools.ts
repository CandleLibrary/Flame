import { parse, renderCompressed } from '@candlelib/css';
import { JSNodeType } from '@candlelib/js';
import wick, { ComponentData, Context } from '@candlelib/wick';
import { createCompiledComponentClass } from '@candlelib/wick/build/library/compiler/ast-build/build.js';
import { createClassStringObject } from '@candlelib/wick/build/library/compiler/ast-render/js.js';
import { parse_component } from '@candlelib/wick/build/library/compiler/source-code-parse/parse.js';
import { renderNewFormatted } from '@candlelib/wick/build/library/compiler/source-code-render/render.js';
import { getCSSStringFromComponentStyle } from '@candlelib/wick/build/library/compiler/ast-render/css.js';
import { CSSPatch, Patch, PatchType, StubPatch, TextPatch } from '../../common/editor_types.js';
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
export async function addStyle(
    component: ComponentData,
    context: Context,
    rules: string
): Promise<ComponentData> {

    let new_source = "";

    if (component.CSS.length > 0) {
        // Update the style sheet within the component 
        // then render out a new component;
        const style = parse(rules);

        //Merge Compatible rules instead of appending new rules.

        const new_data = Object.assign(component.CSS[0].data);

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

    return await createNewComponentFromSourceString(new_source, context, component);
}

export async function createNewComponentFromSourceString(new_source: string, context: Context, component: ComponentData) {

    const comp = await wick(new_source, context);

    comp.location = component.location;

    return comp;
}
