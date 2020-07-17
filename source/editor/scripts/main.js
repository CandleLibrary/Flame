import * as ACTIONS from "./actions/action.js";
import css_sys from "./css.js";

export default async function initFlame(editor_cfw, comp_cfw, comp_window) { //For Isolation

    const
        component_map = new Map,
        wick = comp_cfw.wick,
        css = comp_cfw.css,
        rt = wick.rt,
        edit_rt = editor_cfw.wick.rt,
        edit_wick = editor_cfw.wick,
        editor_model = { comp: null, ele: null, sc: 0, selected_ele: null, selected_element: null, ACTIONS };

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
                 * element into the tree of another component.  */
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

    let prev = null, ACTIVE_ACTION = null, cx = 0, cy = 0, px = 0, py = 0;

    const change_stack = [];
    let change_pointer = 0;
    let edit_css = comp_window.document.createElement("style");
    comp_window.document.head.appendChild(edit_css);

    const system = {
        move_type: "relative",
        css: css_sys,
        window: comp_window,
        document: comp_window.document,
        body: comp_window.document.body,
        head: comp_window.document.head,
        flags: {
            KEEP_UNIQUE: true
        },
        global: {
            default_pos_unit: "px"
        },
        ui: {
            transform: {
                scale: 1
            }
        },
        edit_css,
        edit_wick
    };


    /**
     * UPDATE the ui system to reflect the 
     * changes made by the active action.
     */
    function UPDATE_EDIT_STATE() {

    }
    /**
     * Create a change list for the current
     * UI state and apply, pushing the change
     * list to the history stack.
     */
    function FREEZE_EDIT_STATE() {

    }
    /**
     * Decrement the history stack pointer 
     * and apply the rollback
     * changes of the change list the pointer is 
     * currently at.
     */
    function ROLLBACK_EDIT_STATE() {

    }
    /**
     * Increment the history stack pointer
     * and apply the rollforward
     * changes of the change list the pointer is 
     * currently at.
     */
    function ROLLFORWARD_EDIT_STATE() {

    }

    function START_ACTION(act) {
        ACTIVE_ACTION = act;
        px = cx;
        py = cy;
        UPDATE_ACTION();
    }

    function UPDATE_ACTION() {

        const dx = cx - px;
        const dy = cy - py;

        const
            ele = editor_model.selected_ele,
            comp = editor_model.selected_comp;

        ACTIVE_ACTION(system, comp, ele, dx, dy, false);
        UPDATE_EDIT_STATE();
        editor_model.sc++;
    }

    function END_ACTION(event) {
        ACTIVE_ACTION = null;
        FREEZE_EDIT_STATE();
    }

    function pointerReleaseElementEventResponder(e) {
        if (ACTIVE_ACTION) return END_ACTION();
        selectElementEventResponder(e);
    }

    function pointerMoveEventResponder(e) {

        px = cx;
        cx = e.x;
        py = cy;
        cy = e.y;

        if (ACTIVE_ACTION) return UPDATE_ACTION();

        const ele = comp_window.document.elementFromPoint(e.x, e.y);

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
    comp_window.addEventListener("pointermove", pointerMoveEventResponder);
    comp_window.addEventListener("pointerup", pointerReleaseElementEventResponder);

    comp_window.document.addEventListener("scroll", globalScrollEventListener);
    comp_window.addEventListener("resize", globalScrollEventListener);

    /**
     * Include the editor frame system.
     */
    edit_rt.presets.models["flame-editor"] = editor_model;

    edit_rt.presets.api.START_ACTION = START_ACTION;
    edit_rt.presets.api.ACTIONS = ACTIONS;

    const editor_frame = await (edit_wick("/flame/editor/components/editor.jsx").pending);

    ui_root = (new editor_frame.classWithIntegratedCSS()).ele;

    document.body.insertBefore(ui_root, document.body.firstElementChild);
}