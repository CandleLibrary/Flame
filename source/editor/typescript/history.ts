import { setState, clone_ast } from "./actions/update.js";
import { FlameSystem } from "./types/flame_system.js";
import { Component, wickOutput, DOMLiteral } from "@candlefw/wick";
import { wick, js } from "./env.js";
import { HistoryState } from "./types/history_state";
import { VARIABLE_REFERENCE_TYPE, BindingHandler, BindingVariable } from "@candlefw/wick/build/types/types/types";
import { MinTreeNode } from "../../../../wick/node_modules/@candlefw/js/build/types/ecma.js";

const {
    parse: {
        parser,
        render
    },
    types: {
        MinTreeNodeType,
        CSSTreeNodeType,
        WickASTNodeType,
        WickASTNodeClass
    }
} = <wickOutput>wick;

function renderHTMLFromComponentData(component_data: Component, node: DOMLiteral = component_data.HTML) {

    const out = { type: 0, data: null, attributes: [], tagname: "", nodes: null };

    if (node.tag_name) {
        out.type = WickASTNodeType["HTML_" + node.tag_name.toUpperCase()];

        out.tagname = node.tag_name;

        if (node.attributes)
            out.attributes = node.attributes.map(a => ({
                type: WickASTNodeType.HTMLAttribute,
                name: a[0],
                value: a[1]
            }));

        if (node.children)
            out.nodes = node.children.map(c => renderHTMLFromComponentData(component_data, c));

    } else {

        out.type = WickASTNodeType.HTMLText;

        if (node.is_bindings) {
            const d = component_data.bindings.filter(b => b.html_element_index == node.lookup_index)[0];
            if (d)
                out.data = d.binding_node.pos.slice();
        } else {
            out.data = node.data;
        }
    }

    return out;
};

function createImportName(b: BindingVariable) {
    if (b.external_name)
        return `${b.external_name} as ${b.internal_name}`;
    else
        return `${b.internal_name}`;
}

export default (function HISTORY() {

    const stack: HistoryState[] = [];
    let pointer = -1;


    return {

        ADD_HISTORY_STATE(): HistoryState {
            const state = <HistoryState>{ actions: [] };

            stack[++pointer] = state;

            return state;
        },

        /**
         * UPDATE the ui state to reflect the 
         * changes made by the active action(s).
         */
        PUSH_EDIT_STATE(action, env) {

        },
        /**
         * Create a change list for the current
         * UI state and apply, pushing the change
         * list to the history stack.
         */
        FREEZE_EDIT_STATE() {

        },
        /**
         * Decrement the history stack pointer 
         * and apply the rollback
         * changes of the change list the pointer is 
         * now at.
         */
        ROLLBACK_EDIT_STATE(system: FlameSystem) {
            if (pointer > -1) {
                const state = stack[pointer];
                setState(false, state, system);
                pointer--;
            }
        },
        /**
         * Increment the history stack pointer
         * and apply the roll-forward
         * changes of the change list the pointer is 
         * now at.
         */
        ROLLFORWARD_EDIT_STATE(system: FlameSystem) {
            if (pointer < stack.length - 1) {
                pointer++;
                const state = stack[pointer];
                setState(true, state, system);
            }
        },

        WriteBack(system: FlameSystem) {
            //Write current changes back to file. 
            const components = <Map<string, Component>>system.edit_wick.rt.presets.components;

            for (const component of components.values()) {

                //Stitch HTML and CSS from current component data

                //destructure original ast and rebuild using the new data.

                //HTML -> keep track of all JS and STYLE scripts. replace original with updated versions.

                const changes = stack.slice(0, pointer + 1)
                    .flatMap(s => s.actions)
                    .filter(s => s.progress.comp_data_name == component.name);


                if (changes.length > 0) {

                    // If there are active frames (frames with ast data) then output will be 
                    // JS format. If not, then the output will be in html format.
                    const html = renderHTMLFromComponentData(component);
                    const css_ = component.CSS.slice(-1)[0];

                    let out_node = {
                        type: MinTreeNodeType.Script,
                        nodes: [],
                    };

                    if (component.frames.filter(f => f.ast).length > 0) {
                        //Go through each import and export and create nodes for them.
                        out_node.nodes;

                        const types = [...component.root_frame.binding_type.values()];

                        const api_bindings = types.filter(b => b.type == VARIABLE_REFERENCE_TYPE.API_VARIABLE);
                        const method_bindings = types.filter(b => b.type == VARIABLE_REFERENCE_TYPE.METHOD_VARIABLE);
                        const model_bindings = types.filter(b => b.type == VARIABLE_REFERENCE_TYPE.MODEL_VARIABLE);

                        const parent_bindings = types.filter(b => b.type == VARIABLE_REFERENCE_TYPE.PARENT_VARIABLE);
                        if (parent_bindings.length > 0) {
                            const var_string = `import ${parent_bindings.map(createImportName).join(",")} } from "@parent"`;
                            out_node.nodes.push(js.parse.statement(var_string));
                        }


                        const var_bindings = types.filter(b => b.type == VARIABLE_REFERENCE_TYPE.INTERNAL_VARIABLE);
                        //const global_bindings = types.filter(b => b.type == VARIABLE_REFERENCE_TYPE.GLOBAL_VARIABLE);
                        if (var_bindings.length > 0) {
                            const var_string = "var " + var_bindings.map(b => b.pos.slice()).join(",") + ";";
                            out_node.nodes.push(js.parse.statement(var_string));
                        }

                        for (const frame of component.frames.filter(f => !f.IS_ROOT && !f.IS_TEMP_CLOSURE)) {
                            out_node.nodes.push(frame.backup_ast);
                        }

                        if (html) {
                            const d = js.parse.statement("export default d;");
                            d.nodes[0] = html;
                            out_node.nodes.push(d);
                        }
                    }

                    if (css_)
                        html.nodes.push({
                            attributes: [],
                            tag: "STYLE",
                            type: WickASTNodeType.HTML_STYLE,
                            nodes: [css_]
                        });


                    // from this ast apply changes that need to occur, then render back to file.

                    const out_data = render(<MinTreeNode>out_node);

                    //@ts-ignore
                    const url_ = <typeof component.location>new component.location.constructor("/component_sys/t");

                    //@ts-ignore
                    url_.submitJSON({
                        location: component.location + "",
                        source: out_data,
                        action: "update"
                    });

                }
                //Need to go through the components and rebuild the parts that have changed.
            }
        }
    };
})();


