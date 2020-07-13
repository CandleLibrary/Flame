{ //For Isolation
    const
        component_map = new Map,
        wick = cfw.wick,
        css = cfw.css,
        rt = wick.rt,
        editor_model = { comp: null, ele: null, sc: 0, selected_ele: null, selected_element: null };

    //Root UI element in document markup.
    let
        ui_root = null;
    /**
     * Integrate Flame editing system into every component instance. 
     */
    cfw.wick.rt.OVERRIDABLE_onComponentCreate = function (comp) {

        //Register all components within a tracker based on their instance type. 
        if (component_map.has(comp.name) == false) component_map.set(comp.name, new Set);
        component_map.get(comp.name).add(comp);

        //Used to trace elements back to their components.
        if (comp.ele)
            comp.ele.wick_component = comp;
    };

    function retrieveComponentFromElement(ele) {
        do {
            if (ele.wick_component && !ele.hasAttribute("w-o"))
                /* Presence of "w-o" indicates the element belongs to a component that has integrated it's 
                 * element into the context of another component.  */
                return ele.wick_component;

            ele = ele.parentNode;
        } while (ele);
        return null;
    }

    function getComponentDataFromComponent(comp) {
        if (!comp) return null;
        return cfw.wick.rt.presets.components.get(comp.name);
    }

    function getElementFromEvent(event) {
        return event.target;
    }

    function getComponentFromEvent(event) {
        return retrieveComponentFromElement(getElementFromEvent(event));
    }

    function getComponentHierarchy(comp) {
        const list = [comp];
        while (comp.par) { list.push(comp.par); comp = comp.par; }
        return list.reverse();
    }

    function getComponentData(...comp) {
        return comp.flatMap(e => e).map(getComponentDataFromComponent);
    }

    function ISElementUI(ele) {
        while (ele) {
            if (ele == ui_root) { return true; }
            ele = ele.parentNode;
        }
        return false;
    }

    function selectElementEventResponder(e) {

        const comp = getComponentFromEvent(event),
            ele = getElementFromEvent(event);
        if (ISElementUI(ele))
            return;

        editor_model.selected_comp = comp;
        editor_model.selected_ele = ele;
        editor_model.comp = null;
        editor_model.ele = null;

        const roots = getComponentData(getComponentHierarchy(comp));

        for (const comp of roots) {
            for (const CSS of (comp.CSS || [])) {
                resume:
                for (const node of (CSS.nodes || [])) {
                    for (const selector of (node.selectors || [])) {
                        if (css.matchElements(ele, selector, css.DOMHelpers)) {
                            const css_package = {
                                comp: comp,
                                root: CSS,
                                rule: node
                            };
                            console.log(css_package);
                            console.log(selector, selector.pos);
                            break resume;
                        }
                    }
                }
            }
        }
    }

    let prev = null, ACTIVE_ACTION = null;

    function START_ACTION(act, ele, comp) {
        ACTIVE_ACTION = { test: true };
    }

    function UPDATE_ACTION(event) {

    }

    function END_ACTION(event) {
        ACTIVE_ACTION = null;
    }

    function pointerReleaseElementEventResponder(e) {
        if (ACTIVE_ACTION) return END_ACTION();
        selectElementEventResponder(e);
    }

    function pointerEnterElementEventResponder(e) {

        if (ACTIVE_ACTION) return UPDATE_ACTION(e);

        const ele = document.elementFromPoint(e.x, e.y);

        if (!ele || ISElementUI(ele))
            return;

        if (ele !== prev) {
            prev = ele;
        } else
            return;

        const comp = retrieveComponentFromElement(ele);
        editor_model.comp = comp;
        editor_model.ele = ele;
    }

    function pointerExitElementEventResponder(e) {
        editor_model.comp = null;
        editor_model.ele = null;
    }

    function globalScrollEventListener(e) {
        editor_model.sc++;
    }

    function applyAction(comp, ele, ACTION) {

        switch (ACTION.type) {
            case "JS":
                return JSActionHandler(comp, ele, ACTION);
            case "HTML":
                return HTMLActionHandler(comp, ele, ACTION);
            case "CSS":
                return CSSActionHandler(comp, ele, ACTION);
        }
    }

    function CSSActionHandler() { }
    function HTMLActionHandler() { }

    //document.addEventListener("pointermove", pointerExitElementEventResponder);
    window.addEventListener("pointermove", pointerEnterElementEventResponder);
    window.addEventListener("pointerup", pointerReleaseElementEventResponder);

    document.addEventListener("scroll", globalScrollEventListener);
    window.addEventListener("resize", globalScrollEventListener);

    /**
     * Include the editor frame system.
     */
    window.addEventListener("load", async () => {

        rt.presets.models["flame-editor"] = editor_model;
        rt.presets.api.START_ACTION = START_ACTION;
        rt.presets.ACTIONS = {};

        const editor_frame = await (wick("/flame/editor/editor.jsx").pending);

        ui_root = (new editor_frame.classWithIntegratedCSS()).ele;

        document.body.appendChild(ui_root);
    });
}