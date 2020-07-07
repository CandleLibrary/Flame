{ //For Isolation
    const
        component_map = new Map,
        wick = cfw.wick,
        rt = wick.rt,
        editor_model = { comp: null, ele: null, sc: 0 };
    /**
     * Integrate Flame editing system into every component instance. 
     */
    cfw.wick.rt.OVERRIDABLE_onComponentCreate = function (comp) {
        //Every Element can have context menu that enables the flame edit runtime.
        integrateElementTree(comp);

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

    function selectElementEventResponder(e) {
        const comp = getComponentFromEvent(event),
            ele = getElementFromEvent(event);
    }

    function pointerEnterElementEventResponder(e) {
        const comp = getComponentFromEvent(event),
            ele = getElementFromEvent(event);
        editor_model.comp = comp;
        editor_model.ele = ele;
    }

    function pointerExitElementEventResponder(e) {
        const comp = getComponentFromEvent(event),
            ele = getElementFromEvent(event);
        editor_model.comp = null;
        editor_model.ele = null;
    }

    function globalScrollEventListener(e) {
        editor_model.sc++;
    }

    /**
     * Adds elementSelectEvent to the document.
     */
    function integrateElementTree(comp) {
        comp.elu.forEach(e => e.addEventListener("pointerleave", pointerExitElementEventResponder));
        comp.elu.forEach(e => e.addEventListener("pointerenter", pointerEnterElementEventResponder));
        comp.elu.forEach(e => e.addEventListener("click", selectElementEventResponder));
    }

    document.addEventListener("scroll", globalScrollEventListener);


    /**
     * Include the editor frame system.
     */
    window.addEventListener("load", async () => {

        rt.presets.models["flame-editor"] = editor_model;

        const editor_frame = await (wick("/flame/editor/editor.jsx").pending);

        document.body.appendChild((new editor_frame.classWithIntegratedCSS()).ele);
    });
}