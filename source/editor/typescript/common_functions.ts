import {
    RuntimeComponent,
    Component,
    DOMLiteral,
    wickOutput, WickRTComponent, VARIABLE_REFERENCE_TYPE
} from "@candlefw/wick";
import { FlameSystem } from "./types/flame_system";
import { activeSys } from "./system.js";
import { wick, js, conflagrate, css } from "./env.js";

const {
    parse: {
        parser,
        render
    },
    types: {
        MinTreeNodeType,
        CSSTreeNodeType,
        WickASTNodeType
    }
} = <wickOutput>wick;


export function retrieveComponentFromElement(ele) {
    do {
        if (ele.wick_component && !ele.hasAttribute("w-o"))
            /* Presence of "w-o" indicates the element belongs to a component that has integrated its 
             * element into the tree of another component.  */
            return ele.wick_component;

        ele = ele.parentNode;
    } while (ele);
    return null;
}

export function getComponentDataFromName(sys: FlameSystem, name: string): Component {
    return sys.edit_wick.rt.presets.components.get(name);
}

export function getComponentDataFromComponent(sys: FlameSystem, comp: RuntimeComponent): Component {

    if (!comp) return null;

    return sys.edit_wick.rt.presets.components.get(comp.name);
}

export function getEditedElementFromPoint(x: number, y: number) {

    const { window } = activeSys();

    window.document.body.style.pointerEvents = "";

    let ele = window.document.elementFromPoint(x, y);

    window.document.body.style.pointerEvents = "none";

    return ele;
}


export function getElementFromEvent(event) {
    return getEditedElementFromPoint(event.x, event.y);
}

export function getComponentFromEvent(event) {
    return retrieveComponentFromElement(getElementFromEvent(event));
}

export function getComponentHierarchy(comp: RuntimeComponent): RuntimeComponent[] {
    const list = [comp];
    //@ts-ignore
    while (comp.par) { if (comp.par) list.push(comp.par); comp = comp.par; }
    return list.reverse();
}

/**
 * Return an array of Component objects from a list of RuntimeComponents
 * @param comps 
 */
export function getComponentData(sys: FlameSystem, ...comps: RuntimeComponent[]): Component[] {
    return comps.flatMap(e => e).map(comp => getComponentDataFromComponent(sys, comp));
}

export function getElementIndex(comp: RuntimeComponent, ele: HTMLElement): number {
    //@ts-ignore
    return comp.elu.indexOf(ele);
}

export function getElementFromIndex(comp: RuntimeComponent, index: number): HTMLElement {
    //@ts-ignore
    return comp.elu[index];
}

export function getActiveComponentInstances(sys: FlameSystem, component_name: string): RuntimeComponent[] {
    return Array.from(sys.document.getElementsByClassName(component_name)).map(comp => comp.wick_component);
}


export function createImportName(b: wickOutput["types"]["BindingVariable"]) {
    if (b.external_name)
        return `${b.external_name} as ${b.internal_name}`;
    else
        return `${b.internal_name}`;
}


export function renderHTMLFromComponentData(component_data: Component, node: DOMLiteral = component_data.HTML) {

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



export function componentDataToSourceString(sys: FlameSystem, component_data: Component): string {

    if (!component_data) return "";

    //Stitch HTML and CSS from current component data

    //destructure original ast and rebuild using the new data.

    //HTML -> keep track of all JS and STYLE scripts. replace original with updated versions.


    // If there are active frames (frames with ast data) then output will be 
    // JS format. If not, then the output will be in html format.
    const
        html = renderHTMLFromComponentData(component_data),
        css_ = component_data.CSS.slice(-1)[0];

    let out_node = {
        type: MinTreeNodeType.Script,
        nodes: [],
    };

    if (component_data.frames.filter(f => f.ast).length > 0) {
        //Go through each import and export and create nodes for them.
        out_node.nodes;

        const types = [...component_data.root_frame.binding_type.values()];

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

        for (const frame of component_data.frames.filter(f => !f.IS_ROOT && !f.IS_TEMP_CLOSURE)) {
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

    return render(<wickOutput["types"]["MinTreeNode"]>out_node) || "";

}

export function cloneComponentData(comp: Component) {
    const clone: Component = <Component>{
        CSS: comp.CSS,
        ERRORS: comp.ERRORS,
        HTML: comp.HTML,
        bindings: [...comp.bindings],
        children: comp.children,
        container_count: comp.container_count,
        frames: comp.frames,
        global_model: comp.global_model,
        local_component_names: comp.local_component_names,
        location: comp.location,
        name: "",
        names: comp.names,
        root_frame: comp.root_frame
    };

    return clone;
}

export function replaceComponents(sys: FlameSystem, old_comp_name: string, new_comp_name: string) {

    const cstr: typeof WickRTComponent = sys.edit_wick.rt.gC(new_comp_name);

    for (const old_comp of getActiveComponentInstances(sys, old_comp_name)) {
        const new_comp = new cstr(old_comp.model, null, null, old_comp.par, null, sys.wick.rt.presets);
        old_comp.ele.parentElement.replaceChild(new_comp.ele, old_comp.ele);
        old_comp.destructor();
    }
}

export function getMaxIndexDOMLiteral(node: DOMLiteral, index = 0): number {
    index++;

    if (node.children)
        for (const child of node.children)
            index = getMaxIndexDOMLiteral(child, index);

    return index;
}

export function removeBindingsWithinIndexRange(comp: Component, start: number, end: number) {
    //Remove bindings that do not have matching indices
    comp.bindings = comp.bindings
        .filter(e => e.html_element_index < start || e.html_element_index >= end)
        .map(
            e => {
                const clone = Object.assign({}, e);

                if (clone.html_element_index > start)
                    clone.html_element_index = clone.html_element_index - (end - start);

                return clone;
            }
        );
}

export function removeUnmatchedRulesMatchingElement(comp: Component, ele: DOMLiteral) {

    const existing_tree = comp.HTML;

    for (let i = 0; i < comp.CSS.length; i++) {
        const css_node = comp.CSS[i], extractor = { ast: null };

        for (
            const { node, meta: { parent, replace } } of conflagrate.traverse(css_node, "nodes")
                .makeReplaceable()
                .extract(extractor)
        ) {
            //Necessary
            node.parent = parent;

            if (node.type == CSSTreeNodeType.Rule) {

                const selectors = css.getMatchedSelectors(node, ele, wick.css_selector_helpers);

                if (selectors.length > 0) {

                    const out = node.selectors.slice();

                    for (const sel of selectors) {
                        //If this rule does not match any elements, remove it.
                        if ([...css.getMatchedElements(existing_tree, sel, wick.css_selector_helpers)].length <= 0) {
                            //remove the selector from the element
                            out.splice(out.indexOf(sel), 1);
                        };
                    }

                    if (out.length !== node.selectors.length) {
                        if (out.length == 0)
                            replace(null);
                        else {
                            const clone = Object.assign({}, node);
                            clone.selectors = out;
                            replace(clone);
                        }
                    }
                }
            }
        }

        comp.CSS[i] = extractor.ast;
    }
};