import wick, { ComponentData, ComponentStyle, Context } from '@candlelib/wick';
import { createCompiledComponentClass } from '@candlelib/wick/build/library/compiler/ast-build/build.js';
import { createClassStringObject } from '@candlelib/wick/build/library/compiler/ast-render/js.js';
import { parse_component } from '@candlelib/wick/build/library/compiler/source-code-parse/parse.js';
import { renderNewFormatted } from '@candlelib/wick/build/library/compiler/source-code-render/render.js';
import { JSNodeType } from '@candlelib/js';
import { parse, renderCompressed } from '@candlelib/css';
export const enum EditorCommand {
    /**
     * A null command that should be ignored
     */
    UNDEFINED,

    /**
     * A client instance request for the CSS strings
     * registered for a given component
     */
    GET_COMPONENT_STYLE,
    /**
     * A server response to EditorCommand.GET_COMPONENT_STYLE
     * with a list of style strings registered to the component
     */
    GET_COMPONENT_STYLE_RESPONSE,
    /**
     * A client instance request to update a given component
     * with new style rules. This will result in a new component
     * that has the applied rules. The server should respond
     * with a EditorCommand.APPLY_COMPONENT_PATCH message
     * with StubPatch configure with the new components 
     * hash name
     */
    SET_COMPONENT_STYLE,
    /**
     * A message from a client instance indicating the 
     * client has loaded and is ready to communicate with
     * the server. Should result in the initialization of 
     * file watchers for the source files that were used
     * to render the endpoint.
     */
    REGISTER_CLIENT_ENDPOINT,
    /**
    * A server response to a EditorCommand.GET_COMPONENT_PATCH
    * request. Client instances should use the ComponentPatch
    * object to patch or replace existing components with 
    * modifications made to the latest version.
    */
    APPLY_COMPONENT_PATCH,
    /**
     * A client request to update a givin component to 
     * a newer version. Both `to` and `from` must match
     * components that were derived from the same file.
     */
    GET_COMPONENT_PATCH,

    /**
     * A server broadcast message indicating that local changes
     * have been made to a component. If a client instance has
     * any components with a name that matches the `old_name` it
     * should respond with a EditorCommand.GET_COMPONENT_PATCH message
     * to update the old components to the new version.
     */
    UPDATED_COMPONENT,
    GET_COMPONENT_SOURCE,
    GET_COMPONENT_SOURCE_RESPONSE
}

export interface CommandsMap {

    [EditorCommand.UNDEFINED]: {
        command: EditorCommand.UNDEFINED;
    };

    [EditorCommand.REGISTER_CLIENT_ENDPOINT]: {
        command: EditorCommand.REGISTER_CLIENT_ENDPOINT;
        /**
         * The API endpoint that this page represents
         */
        endpoint: string;
    };


    [EditorCommand.GET_COMPONENT_STYLE]: {
        command: EditorCommand.GET_COMPONENT_STYLE;
        component_name: string,
    };

    [EditorCommand.GET_COMPONENT_STYLE]: {
        command: EditorCommand.GET_COMPONENT_STYLE;
        /**
         * The hash name of the component from which
         * CSS styles should be retrieved
         */
        component_name: string,
    };

    [EditorCommand.GET_COMPONENT_STYLE_RESPONSE]: {
        command: EditorCommand.GET_COMPONENT_STYLE_RESPONSE,
        component_name: string,
        style_strings: string[];
    };

    [EditorCommand.SET_COMPONENT_STYLE]:

    {
        command: EditorCommand.SET_COMPONENT_STYLE;
        /**
         * The hash name of the component that the new
         * style rules should be applied to.
         */
        component_name: string;
        /**
         * A style sheet string of rules to apply to 
         * the component
         */
        rules: string;
    };

    [EditorCommand.GET_COMPONENT_PATCH]: {
        command: EditorCommand.GET_COMPONENT_PATCH;
        /**
         * The component old component hash name 
         */
        from: string;
        /**
         * The new updated component  hash name 
         */
        to: string;
    };

    [EditorCommand.APPLY_COMPONENT_PATCH]: {
        command: EditorCommand.APPLY_COMPONENT_PATCH;
        patch: Patch;
    };

    [EditorCommand.UPDATED_COMPONENT]: {
        command: EditorCommand.UPDATED_COMPONENT;
        new_name: string,
        old_name: string,
        path: string;
    };

    [EditorCommand.GET_COMPONENT_SOURCE]: {
        command: EditorCommand.GET_COMPONENT_SOURCE;
        component_name: string,
    };

    [EditorCommand.GET_COMPONENT_SOURCE_RESPONSE]: {
        command: EditorCommand.GET_COMPONENT_SOURCE_RESPONSE;
        component_name: string,
        source: string,
    };
}


export interface EditMessage<T extends keyof CommandsMap =
    EditorCommand.UNDEFINED
    | EditorCommand.GET_COMPONENT_STYLE
    | EditorCommand.GET_COMPONENT_STYLE_RESPONSE
    | EditorCommand.SET_COMPONENT_STYLE
    | EditorCommand.REGISTER_CLIENT_ENDPOINT
    | EditorCommand.APPLY_COMPONENT_PATCH
    | EditorCommand.GET_COMPONENT_PATCH
    | EditorCommand.UPDATED_COMPONENT
    | EditorCommand.GET_COMPONENT_SOURCE
    | EditorCommand.GET_COMPONENT_SOURCE_RESPONSE
    > {
    nonce: number,
    data: CommandsMap[T];
}




export const enum PatchType {
    /**
     * The patch affects the hash name only 
     * 
     * examples: 
     * - Imported module path gets changed
     * - 
     * 
     * This patch can be issued as a hash name change.
     * 
     * This WILL change the component's hash
     */
    STUB,

    /**
     * The style in an external style sheet is changed.
     * 
     * This patch can be issued as a set of style updates.
     * 
     * This WILL NOT change the component's hash
     */
    EXTERNAL_CSS,

    /**
     * A style defined within the component source file is changed. 
     * 
     * This patch can be issued as a set of style updates and
     * hash name change.
     * 
     * This WILL change the component's hash
     */
    INTERNAL_CSS,

    /**
     * A text section defined within the component source file is changed.
     * 
     * This patch can be issued as a set of text element changes
     * 
     * This WILL change the component's hash
     */
    TEXT,

    /**
     * An element defined within the component source file is changed.
     * 
     * This patch is issued as a complete re-render.
     * 
     * This WILL change the component's hash
     */
    ELEMENT,

    /**
     * A binding or any JS code is changed within the source file.
     * 
     * This patch is issued as a complete re-render.
     * 
     * This WILL change the component's hash
     */
    REPLACE
}

interface ComponentPatch {
    type: PatchType;
    /**
     * The hash name string of the two component
     */
    to: string;
    from: string;
}

interface ReplacePatch extends ComponentPatch {
    type: PatchType.REPLACE;
    patch_scripts: string[];

}

interface TextPatch extends ComponentPatch {
    type: PatchType.TEXT;
    patches: {
        index: number;
        from: string;
        to: string;
    }[];
}

interface StubPatch extends ComponentPatch {
    type: PatchType.STUB;
}

export type Patch = ReplacePatch | TextPatch | StubPatch;

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


    console.log(
        {
            to: component_to.name,
            from: component_from.name,
            html: component_to.ele_hash != component_from.ele_hash,
            css: component_to.css_hash != component_from.css_hash,
            text: component_to.text_hash != component_from.text_hash,
        }
    );

    console.log({ to: component_to.css_hash, from: component_from.css_hash });

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

            if (!to.IS_BINDING) {
                console.log(to);
                if (!to.tag_name)
                    patches.push({ index: 0, to: to.data, from: from.data });

                else if (to.nodes)
                    for (let i = 0; i < to?.nodes.length; i++) {
                        elements.push([
                            to.nodes[i],
                            from.nodes[i],
                        ]);
                    }
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

    const comp = await wick(new_source, context);

    comp.location = component.location;

    return comp;
}