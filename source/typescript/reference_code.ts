
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




export function addComponentImport(tag_name: string, importing_comp: ComponentData, imported_component: ComponentData) {

    addRootFrame(importing_comp);

    importing_comp.local_component_names.set(tag_name, imported_component.name);
}

export function addRootFrame(comp: ComponentData) {

    if (comp.root_frame) return;

    const frame: FunctionFrame = createRootFrame(true);

    comp.frames.unshift(frame);

    comp.root_frame = frame;
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
export function setComponentData(sys: FlameSystem, comp: ComponentData) {
    sys.editor_wick.rt.context.components.set(comp.name, comp);
    sys.page_wick.rt.context.components.set(comp.name, comp);
}

/**
 * Return an array of Component objects from a list of RuntimeComponents
 * @param comps 
 */
export function getListOfComponentData(sys: FlameSystem, ...comps: WickRTComponent[]): ComponentData[] {
    return comps.flatMap(e => e).map(comp => getComponentDataFromRTInstance(sys, comp));
}

export function removeBindingsWithinDOMLiteralIndexRange(comp: ComponentData, start: number, end: number) {
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

export function createRTComponentFromComponentData(sys: FlameSystem, comp: ComponentData): typeof WickRTComponent {
    //create a new component
    if (!comp.name)
        comp.name = sys.editor_wick.parse.createNameHash(componentDataToSourceString(sys, comp));

    const new_comp_class = sys.editor_wick.componentDataToJSCached(comp, sys.editor_wick.rt.context);

    setComponentData(sys, comp);
    setRTInstanceClass(sys, comp.name, new_comp_class);

    return new_comp_class;
}

WriteBack(system: FlameSystem) {
    return;
    //Write current changes back to file. 
    const components = <Map<string, Component>>system.editor_wick.rt.presets.components;

    for (const component of components.values()) {

        const changes = stack.slice(0, pointer + 1)
            .flatMap(s => s.actions)
            .filter(s => s.progress.comp_data_name == component.name);

        if (changes.length > 0) {

            const str = componentDataToSourceString(component);

            // from this ast apply changes that need to occur, then render back to file.

            //@ts-ignore
            const url_ = <typeof component.location>new component.location.constructor("/component_sys/t");

            //@ts-ignore
            url_.submitJSON({
                location: component.location + "",
                source: str,
                action: "update"
            });

        }
    }
}



export function componentDataToSourceString(sys: FlameSystem, component_data: ComponentData): string {

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
            api_bindings = types.filter(b => b.type == BINDING_VARIABLE_TYPE.API_VARIABLE),
            method_bindings = types.filter(b => b.type == BINDING_VARIABLE_TYPE.METHOD_VARIABLE),
            model_bindings = types.filter(b => b.type == BINDING_VARIABLE_TYPE.MODEL_VARIABLE),
            parent_bindings = types.filter(b => b.type == BINDING_VARIABLE_TYPE.PARENT_VARIABLE);


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


        const var_bindings = types.filter(b => b.type == BINDING_VARIABLE_TYPE.INTERNAL_VARIABLE);
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

    return render(<WickCompiler["types"]["JSNode"]>out_node) || "";
}

export function convertDOMLiteralToSourceNode(component_data: ComponentData, node: DOMLiteral = component_data.HTML) {

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

export function createImportName(b: WickLibrary["types"]["BindingVariable"]) {
    if (b.external_name)
        return `${b.external_name} as ${b.internal_name}`;
    else
        return `${b.internal_name}`;
}

export function getComponentDataFromName(sys: FlameSystem, name: string): ComponentData {
    return sys.editor_wick.rt.context.components.get(name);
}

export function getUniqueSelector(
    sys: FlameSystem,
    comp: WickRTComponent,
    ele: HTMLElement
) {
    debugger;
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

export function willPropertyOnSelectorHaveAnEffect(sys: FlameSystem, comp: WickRTComponent, ele: HTMLElement, selector: CSSNode, prop_name: string): boolean {
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

export function getApplicableProps_(system: FlameSystem, component: WickRTComponent, element: HTMLElement, unique_selector: CSSNode) {

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

export function removeUnmatchedRulesMatchingElement(comp: ComponentData, ele: DOMLiteral): CSSRuleNode[] {

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

export function getNewCSSArrayWithRulesThatMatchElement(comp: ComponentData, ele: DOMLiteral | HTMLElement, USE_REAL_NODE: boolean = false): CSSRuleNode[] {

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


export function getMatchedRules(comp: ComponentData, ele: DOMLiteral | HTMLElement, USE_REAL_NODE: boolean = false): CSSRuleNode[] {

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
export function getComponentDataFromRTInstance(sys: FlameSystem, comp: WickRTComponent): ComponentData {

    if (!comp) return null;

    return sys.editor_wick.rt.context.components.get(comp.name);
}

/*
 * ██████   ██████  ███    ███     ██      ██ ████████ ███████ ██████   █████  ██
 * ██   ██ ██    ██ ████  ████     ██      ██    ██    ██      ██   ██ ██   ██ ██
 * ██   ██ ██    ██ ██ ████ ██     ██      ██    ██    █████   ██████  ███████ ██
 * ██   ██ ██    ██ ██  ██  ██     ██      ██    ██    ██      ██   ██ ██   ██ ██
 * ██████   ██████  ██      ██     ███████ ██    ██    ███████ ██   ██ ██   ██ ███████
 */
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


export function getDOMLiteralAtIndex(
    component: ComponentData,
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

export function removeDOMLiteralAtIndex(
    comp: ComponentData,
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
    comp: ComponentData,
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
