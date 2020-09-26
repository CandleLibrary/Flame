import {
    RuntimeComponent,
    Component,
    DOMLiteral,
    WickLibrary,
    WickRTComponent, VARIABLE_REFERENCE_TYPE,
    FunctionFrame,
    JSNode,
    JSNodeType,
} from "@candlefw/wick";
import { CSSNodeType, CSSNode, CSSRuleNode, PrecedenceFlags } from "@candlefw/css";
import { TrackedCSSProp } from "./types/tracked_css_prop";
import { FlameSystem } from "./types/flame_system";
import { wick, js, conflagrate, css, url } from "./env.js";
import { EditorSelection } from "./types/selection";

const {
    utils: {
        parse: {
            parser,
            render
        }
    },
    types: {
        HTMLNodeType
    }
} = <WickLibrary>wick;


export { render };

export function createNewFileURL(sys: FlameSystem, name: string) {
    return new url(sys.file_dir + name);
}

/*
 *  ██████ ███████ ███████ 
 * ██      ██      ██      
 * ██      ███████ ███████ 
 * ██           ██      ██ 
 *  ██████ ███████ ███████ 
 */

const {

} = css;

export function getMatchedRulesFromComponentData(
    sys: FlameSystem,
    comp: RuntimeComponent,
    ele: HTMLElement
) {
    return [comp]
        .map(c => getComponentDataFromRTInstance(sys, c))
        .filter(c => !!c)
        .flatMap(c => c.CSS || [])
        .flatMap(e => css.getArrayOfMatchedRules(ele, e));
};

export function getMatchedRulesFromFullHierarchy(
    sys: FlameSystem,
    comp: RuntimeComponent,
    ele: HTMLElement
) {
    return getListOfRTInstanceAndAncestors(comp)
        .map(c => getComponentDataFromRTInstance(sys, c))
        .flatMap(c => c.CSS || [])
        .flatMap(e => css.getArrayOfMatchedRules(ele, e));
};

export function getListOfApplicableSelectors(
    sys: FlameSystem,
    comp: RuntimeComponent,
    ele: HTMLElement
) {
    return getMatchedRulesFromComponentData(sys, comp, ele)
        .flatMap(r => css.getMatchedSelectors(r, ele));
}

export function getApplicableProps(
    sys: FlameSystem,
    comp: RuntimeComponent,
    ele: HTMLElement
): Map<string, TrackedCSSProp> {


    //Get applicable css files,

    //Then get applicable rules,

    //For each rule -> Identify 1 matching selector.

    //Extract selector, for each prop in rule create
    // sel,prop pairs. 

    //TODO, setup cache clone

    return getMatchedRulesFromFullHierarchy(sys, comp, ele)
        .reverse()
        .reduce((m, r) => {

            const
                s = css.getFirstMatchedSelector(r, ele),
                rp = r.precedence,
                sp: PrecedenceFlags = css.getSelectorPrecedence(s);

            for (const [name, val] of r.props.entries())
                if (!m.has(name) || (m.get(name).prop.precedence) < (val.precedence | rp | sp))
                    m.set(name, { sel: s, prop: val.copy(rp | sp) });

            return m;
        }, <Map<string, TrackedCSSProp>>new Map);
};



export function getUniqueSelector(
    sys: FlameSystem,
    comp: RuntimeComponent,
    ele: HTMLElement
) {
    return null;

    const hierarchy = getListOfRTInstanceAndAncestors(comp),
        comp_css = hierarchy
            .map(c => getComponentDataFromRTInstance(sys, c))
            .map(c => c.CSS);

    for (const css_data of comp_css.flatMap(e => e)) {

        if (css_data) {

            const rules = css.getArrayOfMatchedRules(ele, css_data);

        }
    }

    const rule = css.rule("*{top:0}");

    return rule;
}

export function willPropertyOnSelectorHaveAnEffect(sys: FlameSystem, comp: RuntimeComponent, ele: HTMLElement, selector: CSSNode, prop_name: string): boolean {
    //Boils down to whether the selector is the last selector with the property set.
    let RESULT = true;

    for (const { selectors, props } of getMatchedRules(getComponentDataFromRTInstance(sys, comp), ele, true)) {
        if (props.has(prop_name)) {

            const id = selectors.indexOf(selector);

            if (id >= 0)
                RESULT = true;
            else
                RESULT = false;
        }
    }

    return RESULT;
}

export function isSelectorCapableOfBeingUnique(comp: RuntimeComponent, selector: CSSNode, root_name: string = comp.name): boolean {
    let count = 0;

    for (const { node, meta: { parent } } of conflagrate.traverse(selector, "nodes")) {

        //Only certain selector types are allowed to serve as a unique selector. 
        switch (node.type) {
            case CSSNodeType.CompoundSelector:
            case CSSNodeType.ComplexSelector:
                break;
            case CSSNodeType.ClassSelector:
                if (node.value == root_name && parent)
                    break;
            case CSSNodeType.IdSelector:
                count++;
                break;
            default:
                count += 2;
        }
    }

    const matched_elements = [...css.getMatchedElements(comp.ele, selector)];

    if (matched_elements.length > 1)
        return false;

    return count == 1;
}

export function getComputedStyle() {

}

export function getApplicableProps_(system: FlameSystem, component: RuntimeComponent, element: HTMLElement, unique_selector: CSSNode) {

    const props = getApplicableProps(system, component, element);

    for (const v of props.values()) {
        const
            { sel } = v,
            elements = [...css.getMatchedElements(component.ele, sel)];

        if (
            css.isSelectorEqual(sel, unique_selector)
            || (
                elements.length == 1
                &&
                isSelectorCapableOfBeingUnique(component, sel)
            )
        ) {
            v.unique = true;
        }
    }

    return props;
}

export function removeUnmatchedRulesMatchingElement(comp: Component, ele: DOMLiteral): CSSRuleNode[] {

    const existing_tree = comp.HTML, removed_rules = [];

    for (let i = 0; i < comp.CSS.length; i++) {
        const css_node = comp.CSS[i], extractor = { ast: null };

        for (
            const { node, meta: { parent, replace } } of conflagrate.traverse(css_node, "nodes")
                .makeReplaceable()
                .extract(extractor)
        ) {
            //Necessary
            node.parent = parent;

            if (node.type == CSSNodeType.Rule) {

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
                        if (out.length == 0) {

                            replace(null);
                        } else {
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

    return removed_rules;
};

export function getMatchedRules(comp: Component, ele: DOMLiteral | HTMLElement, USE_REAL_NODE: boolean = false): CSSRuleNode[] {

    const rules = [];

    for (let i = 0; i < comp.CSS.length; i++) {

        const css_node = comp.CSS[i];

        for (
            const { node, meta: { parent, replace } } of conflagrate.traverse(css_node, "nodes")
        ) {
            //Necessary
            node.parent = parent;

            if (node.type == CSSNodeType.Rule)
                if (css.matchAnySelector(ele, USE_REAL_NODE ? undefined : wick.css_selector_helpers, ...node.selectors))
                    rules.push(node);
        }
    }

    return rules;
}

export function getNewCSSArrayWithRulesThatMatchElement(comp: Component, ele: DOMLiteral | HTMLElement, USE_REAL_NODE: boolean = false): CSSRuleNode[] {

    const CSS_SHEETS = [];

    for (let i = 0; i < comp.CSS.length; i++) {

        const css_node = comp.CSS[i], extractor = { ast: null };

        for (
            const { node, meta: { parent, replace } } of conflagrate.traverse(css_node, "nodes")
                .makeReplaceable()
                .extract(extractor)
        ) {
            //Necessary
            node.parent = parent;

            if (node.type == CSSNodeType.Rule)
                if (!css.matchAnySelector(ele, USE_REAL_NODE ? undefined : wick.css_selector_helpers, ...node.selectors))
                    replace(null);

        }

        if (extractor.ast)
            CSS_SHEETS.push(extractor.ast);
    }

    return CSS_SHEETS;
}

/*
 * ██████  ██    ██ ███    ██ ████████ ██ ███    ███ ███████                         
 * ██   ██ ██    ██ ████   ██    ██    ██ ████  ████ ██                              
 * ██████  ██    ██ ██ ██  ██    ██    ██ ██ ████ ██ █████                           
 * ██   ██ ██    ██ ██  ██ ██    ██    ██ ██  ██  ██ ██                              
 * ██   ██  ██████  ██   ████    ██    ██ ██      ██ ███████                         
 *                                                                                   
 *                                                                                   
 *  ██████  ██████  ███    ███ ██████   ██████  ███    ██ ███████ ███    ██ ████████ 
 * ██      ██    ██ ████  ████ ██   ██ ██    ██ ████   ██ ██      ████   ██    ██    
 * ██      ██    ██ ██ ████ ██ ██████  ██    ██ ██ ██  ██ █████   ██ ██  ██    ██    
 * ██      ██    ██ ██  ██  ██ ██      ██    ██ ██  ██ ██ ██      ██  ██ ██    ██    
 *  ██████  ██████  ██      ██ ██       ██████  ██   ████ ███████ ██   ████    ██    
 */



export function setRTInstanceClass(sys: FlameSystem, comp_name: string, comp_class: typeof RuntimeComponent) {
    sys.edit_wick.rt.presets.component_class.set(comp_name, comp_class);
    sys.wick.rt.presets.component_class.set(comp_name, comp_class);
}

export function getListOfRTInstanceAndAncestors(comp: RuntimeComponent): RuntimeComponent[] {
    const list = [comp];
    //@ts-ignore
    while (comp.par) { if (comp.par) list.push(comp.par); comp = comp.par; }
    return list.reverse();
}

export function getRTInstanceFromElement(ele): RuntimeComponent {
    if (ele) {
        do {
            if (ele.wick_component && !ele.hasAttribute("w-o"))
                /* Presence of "w-o" indicates the element belongs to a component that has integrated its 
                * element into the tree of another component.  */
                return ele.wick_component;

            ele = ele.parentNode;
        } while (ele);
    }
    return null;
}

export function* getRTInstances(sys: FlameSystem, component_name: string): Generator<RuntimeComponent> {

    for (const { frame } of sys.edited_components.components) {

        if (!frame) continue;

        const { contentDocument: document } = frame;

        for (const ele of document.getElementsByClassName(component_name))
            yield ele.wick_component;
    }
}

export function getRTInstanceFromEvent(event, sys: FlameSystem) {
    return getRTInstanceFromElement(getElementFromEvent(event, sys));
}


export function replaceRTInstances(sys: FlameSystem, old_comp_name: string, new_comp_name: string) {

    const cstr: typeof WickRTComponent = sys.edit_wick.rt.gC(new_comp_name);

    for (const old_comp of getRTInstances(sys, old_comp_name)) {
        const new_comp = new cstr(old_comp.model, null, null, old_comp.par, null, sys.wick.rt.presets);
        old_comp.ele.parentElement.replaceChild(new_comp.ele, old_comp.ele);
        old_comp.destructor();
    }
}

/*
 *  ██████  ██████  ███    ███ ██████   ██████  ███    ██ ███████ ███    ██ ████████
 * ██      ██    ██ ████  ████ ██   ██ ██    ██ ████   ██ ██      ████   ██    ██   
 * ██      ██    ██ ██ ████ ██ ██████  ██    ██ ██ ██  ██ █████   ██ ██  ██    ██   
 * ██      ██    ██ ██  ██  ██ ██      ██    ██ ██  ██ ██ ██      ██  ██ ██    ██   
 *  ██████  ██████  ██      ██ ██       ██████  ██   ████ ███████ ██   ████    ██   
 * 
 * 
 * ██████   █████  ████████  █████  
 * ██   ██ ██   ██    ██    ██   ██ 
 * ██   ██ ███████    ██    ███████ 
 * ██   ██ ██   ██    ██    ██   ██ 
 * ██████  ██   ██    ██    ██   ██ 
 */

/**
 * Return an array of Component objects from a list of RuntimeComponents
 * @param comps 
 */
export function getListOfComponentData(sys: FlameSystem, ...comps: RuntimeComponent[]): Component[] {
    return comps.flatMap(e => e).map(comp => getComponentDataFromRTInstance(sys, comp));
}

export function getComponentDataFromRTInstance(sys: FlameSystem, comp: RuntimeComponent): Component {

    if (!comp) return null;

    return sys.edit_wick.rt.presets.components.get(comp.name);
}
export function getComponentDataFromName(sys: FlameSystem, name: string): Component {
    return sys.edit_wick.rt.presets.components.get(name);
}

export function setComponentData(sys: FlameSystem, comp: Component) {
    sys.edit_wick.rt.presets.components.set(comp.name, comp);
    sys.wick.rt.presets.components.set(comp.name, comp);
}

export function createImportName(b: WickLibrary["types"]["BindingVariable"]) {
    if (b.external_name)
        return `${b.external_name} as ${b.internal_name}`;
    else
        return `${b.internal_name}`;
}


export function convertDOMLiteralToSourceNode(component_data: Component, node: DOMLiteral = component_data.HTML) {

    const out = { type: 0, data: null, attributes: [], tagname: "", nodes: null };

    if (node.tag_name) {

        out.type = HTMLNodeType["HTML_" + node.tag_name.toUpperCase()] || HTMLNodeType.HTML_Element;

        out.tagname = node.tag_name;

        if (node.attributes)
            out.attributes = node.attributes.map(a => ({
                type: HTMLNodeType.HTMLAttribute,
                name: a[0],
                value: a[1]
            }));

        if (node.children)
            out.nodes = node.children.map(c => convertDOMLiteralToSourceNode(component_data, c));

    } else {

        out.type = HTMLNodeType.HTMLText;

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

    const
        html = convertDOMLiteralToSourceNode(component_data),
        css_ = component_data.CSS.slice(-1)[0];

    let out_node = null;

    if (component_data.frames.filter(f => f.ast).length > 0) {

        out_node = {
            type: JSNodeType.Script,
            nodes: [],
        };
        //Go through each import and export and create nodes for them.
        out_node.nodes;

        const
            types = [...component_data.root_frame.binding_type.values()],
            api_bindings = types.filter(b => b.type == VARIABLE_REFERENCE_TYPE.API_VARIABLE),
            method_bindings = types.filter(b => b.type == VARIABLE_REFERENCE_TYPE.METHOD_VARIABLE),
            model_bindings = types.filter(b => b.type == VARIABLE_REFERENCE_TYPE.MODEL_VARIABLE),
            parent_bindings = types.filter(b => b.type == VARIABLE_REFERENCE_TYPE.PARENT_VARIABLE);


        /**
         * Imported Components
         */
        for (const [internal_name, comp_name] of component_data.local_component_names) {
            const imported_comp = getComponentDataFromName(sys, comp_name),
                var_string = `import ${internal_name} from "${imported_comp.location}"`;
            out_node.nodes.push(js.parse.statement(var_string));
        }

        /**
         * Imported parent data bindings
         */
        if (parent_bindings.length > 0) {
            const var_string = `import ${parent_bindings.map(createImportName).join(",")} } from "@parent"`;
            out_node.nodes.push(js.parse.statement(var_string));
        }

        /**
         * Imported model data
         */
        if (model_bindings.length > 0) {
            const
                gm = component_data.global_model ? ":" + component_data.global_model : "",
                var_string = `import ${model_bindings.map(createImportName).join(",")} } from "@model${gm}"`;
            out_node.nodes.push(js.parse.statement(var_string));
        }

        /**
         * Imported API data bindings
         */
        if (api_bindings.length > 0) {
            const var_string = `import ${api_bindings.map(createImportName).join(",")} } from "@api"`;
            out_node.nodes.push(js.parse.statement(var_string));
        }


        const var_bindings = types.filter(b => b.type == VARIABLE_REFERENCE_TYPE.INTERNAL_VARIABLE);
        //const global_bindings = types.filter(b => b.type == VARIABLE_REFERENCE_TYPE.GLOBAL_VARIABLE);
        if (var_bindings.length > 0) {
            const
                var_string = "var " + var_bindings.map(b => b.pos.slice()).join(",") + ";";
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
    } else if (html) out_node = html;



    if (css_)
        html.nodes.push({
            attributes: [],
            tag: "STYLE",
            type: HTMLNodeType.HTML_STYLE,
            nodes: [css_]
        });


    // from this ast apply changes that need to occur, then render back to file.

    return render(<WickLibrary["types"]["JSNode"]>out_node) || "";
}

export function createRootFrame(IS_ROOT: boolean): FunctionFrame {
    return {
        IS_ROOT: IS_ROOT,
        ast: <JSNode>{
            type: JSNodeType.EmptyStatement,
            pos: null
        },
        binding_type: new Map,
        binding_ref_identifiers: [],
        declared_variables: new Set,
        input_names: new Set,
        output_names: new Set,
        prev: null,
        IS_TEMP_CLOSURE: false,
        ATTRIBUTE: false,
        name: ""
    };
}

export function addRootFrame(comp: Component) {

    if (comp.root_frame) return;

    const frame: FunctionFrame = createRootFrame(true);

    comp.frames.unshift(frame);

    comp.root_frame = frame;
}

export function addComponentImport(tag_name: string, importing_comp: Component, imported_component: Component) {

    addRootFrame(importing_comp);

    importing_comp.local_component_names.set(tag_name, imported_component.name);
}

export function createComponentData() {
    return <Component>{
        CSS: [],
        HAS_ERRORS: false,
        HTML: null,
        bindings: [],
        children: [],
        container_count: 0,
        frames: [],
        global_model: "",
        local_component_names: new Map,
        location: null,
        name: "",
        names: [],
        root_frame: null,
    };
}


export function cloneComponentData(comp: Component) {
    const clone: Component = <Component>{
        CSS: comp.CSS,
        HAS_ERRORS: comp.HAS_ERRORS,
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
export function removeBindingsWithinDOMLiteralIndexRange(comp: Component, start: number, end: number) {
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
export function createRTComponentFromComponentData(sys: FlameSystem, comp: Component): typeof RuntimeComponent {
    //create a new component
    if (!comp.name)
        comp.name = sys.edit_wick.parse.createNameHash(componentDataToSourceString(sys, comp));

    const new_comp_class = sys.edit_wick.componentDataToJSCached(comp, sys.edit_wick.rt.presets);

    setComponentData(sys, comp);
    setRTInstanceClass(sys, comp.name, new_comp_class);

    return new_comp_class;
}



/*
 * ██   ██ ████████ ███    ███ ██          ███    ██  ██████  ██████  ███████ 
 * ██   ██    ██    ████  ████ ██          ████   ██ ██    ██ ██   ██ ██      
 * ███████    ██    ██ ████ ██ ██          ██ ██  ██ ██    ██ ██   ██ █████   
 * ██   ██    ██    ██  ██  ██ ██          ██  ██ ██ ██    ██ ██   ██ ██      
 * ██   ██    ██    ██      ██ ███████     ██   ████  ██████  ██████  ███████                                                                           
 */

export function getValidSelectionsCount(sys: FlameSystem) {

    let count = 0;

    const selections = sys.editor_model.selections;

    for (const sel of selections) {

        if (sel.VALID) count++;


    }

    return count;
}

export function getActiveSelectionsCount(sys: FlameSystem) {

    let count = 0;

    const selections = sys.editor_model.selections;

    for (const sel of selections) {

        if (sel.VALID && sel.ACTIVE) count++;


    }

    return count;
}

export function* getActiveSelections(sys: FlameSystem): Generator<EditorSelection> {

    const selections = sys.editor_model.selections;

    for (const sel of selections) {

        if (sel.ACTIVE && sel.VALID)
            yield sel;
    }
};

export function invalidateSelection(sel: EditorSelection, sys: FlameSystem) {
    const
        selections = sys.editor_model.selections,
        i = selections.indexOf(sel);

    if (i >= 0) {

        sel.ele.style.textDecoration = "";

        sel.VALID = false;
        sel.ACTIVE = false;
        sel.ele = null;
        sel.comp = null;
        //selections.scheduleUpdate();
    } else {
        throw ReferenceError("This selection is out of scope!");
    }

}

export function invalidateInactiveSelections(sys: FlameSystem) {
    const selections = sys.editor_model.selections;

    for (const sel of selections)
        if (!sel.ACTIVE && sel.VALID)
            invalidateSelection(sel, sys);
}

export function invalidateAllSelections(sys: FlameSystem) {
    const selections = sys.editor_model.selections;

    for (const sel of selections) {
        sel.VALID = false;
        sel.ACTIVE = false;
        sel.ele = null;
        sel.comp = null;
    }// invalidateSelection(sel, sys);
}

export function updateSelections(sys: FlameSystem) {
    const selections = sys.editor_model.selections;

    for (const sel of selections)
        updateSelectionCoords(sel, sys);
}

export function getASelection(sys: FlameSystem, ele: HTMLElement, frame_ele: HTMLElement, IS_COMPONENT_FRAME: boolean = false): EditorSelection {

    const selections = sys.editor_model.selections;
    let selection_candidate: EditorSelection = null;

    for (const sel of selections) {
        if (!sel.VALID)
            selection_candidate = sel;

        if (sel.ele == ele)
            return sel;
    }

    if (selection_candidate) {
        selection_candidate.VALID = true;
        selection_candidate.IS_COMPONENT_FRAME = IS_COMPONENT_FRAME;
        selection_candidate.ele = ele;
        selection_candidate.frame_ele = frame_ele;

        if (!IS_COMPONENT_FRAME)
            selection_candidate.comp = getRTInstanceFromElement(ele);
        else selection_candidate.comp = sys.harness;

        ele.style.textDecoration = "underline";

        return selection_candidate;
    }

    const sel = <EditorSelection>{
        ACTIVE: false,
        VALID: false,
        IS_COMPONENT_FRAME,
        comp: null,
        ele: null,
        frame_ele: null,
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        actual_left: 0,
        actual_width: 0,
        actual_top: 0,
        actual_height: 0,
        px: 0,
        py: 0,
        pz: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 0,
        sy: 0,
        sz: 0,
    };

    selections.push(sel);

    return getASelection(sys, ele, frame_ele, IS_COMPONENT_FRAME);
}
export function updateSelectionCoords(sel: EditorSelection, sys: FlameSystem): EditorSelection {

    if (!sel.VALID) return sel;

    const { ui: { transform: { px, py, scale } } } = sys,
        { ele, frame_ele, IS_COMPONENT_FRAME } = sel,
        bb = ele.getBoundingClientRect();

    let min_x = bb.left, min_y = bb.top, max_x = min_x + bb.width, max_y = min_y + bb.height;

    if (!IS_COMPONENT_FRAME) {
        const style = window.getComputedStyle(frame_ele),
            top = parseFloat(style.top) || 0,
            left = parseFloat(style.left) || 0;
        min_x = (min_x + left) * scale + px;
        min_y = (min_y + top) * scale + py;
        max_x = (max_x + left) * scale + px;
        max_y = (max_y + top) * scale + py;
    }

    sel.px = min_x;
    sel.py = min_y;
    sel.left = min_x;
    sel.top = min_y;
    sel.width = max_x - min_x;
    sel.height = max_y - min_y;
    sel.actual_left = bb.left;
    sel.actual_top = bb.top;
    sel.actual_width = bb.width;
    sel.actual_height = bb.height;

    return sel;
}


function getElementInHTMLNamespace(ele: Node) {
    if (ele.parentNode) {
        const par = ele.parentNode;

        if (par.namespaceURI.includes("html"))
            return ele;

        return getElementInHTMLNamespace(par);
    }

    return null;
}

export function getSelectionFromPoint(x: number, y: number, sys: FlameSystem): EditorSelection {

    let selection = null;

    let ele = window.document.elementFromPoint(x, y);



    if (ele.tagName == "IFRAME") // is edited component 
    {

        const
            style = window.getComputedStyle(ele),
            top = parseFloat(style.top) || 0,
            left = parseFloat(style.left) || 0,
            { ui: { transform: { px, py, scale } } } = sys;

        let IS_FRAME_SELECTED = false;

        //Convert screen coords to component coords
        x = (x - px) / scale - left;
        y = (y - py) / scale - top;

        //select from the frame's document
        let selected_ele: HTMLElement = (<any>ele).contentWindow.document.elementFromPoint(x, y);

        //the element may be the frame's window box.
        if (!selected_ele) {
            selected_ele = <HTMLElement>ele;
            IS_FRAME_SELECTED = true;
        }// else
        //   selected_ele = getElementInHTMLNamespace(selected_ele);

        return updateSelectionCoords(getASelection(sys, selected_ele, <HTMLElement>ele, IS_FRAME_SELECTED), sys);
    } else
        return null;


    return selection;
}


export function getElementFromEvent(event: PointerEvent, sys: FlameSystem): EditorSelection {
    return getSelectionFromPoint(event.x, event.y, sys);
}

export function getIndexOfElementInRTInstance(comp: RuntimeComponent, ele: HTMLElement, sys: FlameSystem): number {
    if (comp == sys.harness) {
        for (let i = 0; i < sys.edited_components.components.length; i++)
            if (ele == sys.edited_components.components[i].frame)
                return i;
    } else {
        //@ts-ignore
        return comp.elu.indexOf(ele);
    }
    return -1;
}

export function getElementAtIndexInRTInstance(comp: RuntimeComponent, index: number): HTMLElement {
    //@ts-ignore
    return comp.elu[index];
}
export function insertElementAtIndexInRTInstance(comp: RuntimeComponent, index: number, ele: HTMLElement, APPEND_TO_ELEMENT: boolean = false) {

    const
        elu = comp.elu,
        target_ele = elu[index],
        parent = target_ele.parentElement;

    if (APPEND_TO_ELEMENT) {
        target_ele.insertBefore(ele, target_ele.firstChild);
        elu.splice(index + 1, 0, ele);
    } else if (index > elu.length) {
        elu.push(ele);
        comp.ele.appendChild(ele);
    } else if (index == 0) {
        elu.unshift(ele);
        comp.ele.insertBefore(ele, comp.ele.firstChild);
    } else {
        elu.splice(index, 0, ele);
        parent.insertBefore(ele, target_ele);
    }
}

export function removeElementAtIndexInRTInstance(comp: RuntimeComponent, index: number) {

    const
        elu = comp.elu,
        target_ele = elu[index];

    target_ele.parentElement.removeChild(target_ele);

    elu.splice(index, 1);
}


/*
 * ██████   ██████  ███    ███     ██      ██ ████████ ███████ ██████   █████  ██
 * ██   ██ ██    ██ ████  ████     ██      ██    ██    ██      ██   ██ ██   ██ ██
 * ██   ██ ██    ██ ██ ████ ██     ██      ██    ██    █████   ██████  ███████ ██
 * ██   ██ ██    ██ ██  ██  ██     ██      ██    ██    ██      ██   ██ ██   ██ ██
 * ██████   ██████  ██      ██     ███████ ██    ██    ███████ ██   ██ ██   ██ ███████
 */


export function getDOMLiteralAtIndex(
    component: Component,
    requested_index: number,
    actual = { i: 0 },
    node: DOMLiteral = null
): DOMLiteral {

    if (!node)
        node = component.HTML;

    if (requested_index == actual.i)
        return node;

    let out = null;

    if (node.children)
        for (const c_node of node.children) {
            actual.i++;
            if (
                (
                    out = getDOMLiteralAtIndex(
                        component,
                        requested_index,
                        actual,
                        c_node
                    )
                )
            ) return out;
        }

    return null;
}


export function getLastIndexInDOMLiteralTree(
    node: DOMLiteral,
    index = 0
): number {
    index++;

    if (node.children)
        for (const child of node.children)
            index = getLastIndexInDOMLiteralTree(child, index);

    return index;
}

export function removeDOMLiteralAtIndex(
    comp: Component,
    index_to_remove: number,
    actual = { i: 0 },
    node: DOMLiteral = null
): { removed_node: DOMLiteral, cloned_root: DOMLiteral; } {

    if (!node) node = comp.HTML;

    if (index_to_remove == 0)
        return { removed_node: node, cloned_root: Object.assign({}, node) };

    if (node.children) {
        for (let i = 0; i < node.children.length; i++) {

            actual.i++;

            if (actual.i == index_to_remove) {

                const new_node: DOMLiteral = Object.assign({}, node);

                new_node.children = [...node.children.slice(0, i), ...node.children.slice(i + 1)];

                return { cloned_root: new_node, removed_node: node.children[i] };
            }

            let result = removeDOMLiteralAtIndex(comp, index_to_remove, actual, node.children[i]);

            if (result) {
                const new_node: DOMLiteral = Object.assign({}, node);

                new_node.children = [...node.children.slice(0, i), result.cloned_root, ...node.children.slice(i + 1)];

                return { cloned_root: new_node, removed_node: result.removed_node };
            }

        }
    }

    return null;
}

export function insertDOMLiteralAtIndex(
    comp: Component,
    insert_before_index: number,
    ele: DOMLiteral,
    actual = { i: 0 },
    node: DOMLiteral = null
) {

    if (!node) {

        node = comp.HTML;

        if (insertDOMLiteralAtIndex(comp, insert_before_index, ele, actual, node))
            return true;

        if (!node.children) node.children = [ele];

        else node.children.push(ele);

        return true;

    } else if (insert_before_index == 0) {

        if (!node.children) node.children = [];

        node.children.unshift(ele);

        return true;

    } else if (node.children) {

        for (let i = 0; i < node.children.length; i++) {

            actual.i++;

            if (actual.i == insert_before_index)
                return node.children.splice(i, 0, ele), true;

            if (insertDOMLiteralAtIndex(comp, insert_before_index, ele, actual, node.children[i]))
                return true;
        }
    }

    return false;
}

export function removeDOMLiteralAttribute(node: DOMLiteral, name: string) {
    if (node.attributes) {
        for (let i = 0; i < node.attributes.length; i++)
            if (node.attributes[i][0] == name)
                return node.attributes.splice(i, 1);
    }
}

export function setDOMLiteralAttribute(node: DOMLiteral, name: string, val: string) {

    if (!node.attributes)
        node.attributes = [];

    for (let i = 0; i < node.attributes.length; i++)
        if (node.attributes[i][0] == name)
            return node.attributes[i][1] = val;

    node.attributes.push([name, val]);
}