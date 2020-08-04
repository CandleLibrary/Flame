import * as ACTIONS from "./actions/action.js";
import {
    applyAction,
    sealAction
} from "./actions/update.js";
import css_sys from "./css.js";
import history from "./history.js";
import { ObjectCrate } from "./types/object_crate.js";
import { RuntimeComponent } from "@candlefw/wick";
import { CSSCacheFactory } from "./cache/css_cache.js";
import { HTMLCacheFactory } from "./cache/html_cache.js";
import { Action } from "./types/action.js";
import { initSystem } from "./system.js";

export default async function initFlame(editor_cfw, comp_cfw, comp_window) { //For Isolation

    const
        component_map = new Map,
        wick = comp_cfw.wick,
        css = comp_cfw.css,
        rt = wick.rt,
        edit_rt = editor_cfw.wick.rt,
        edit_wick = editor_cfw.wick,
        editor_model = { comp: <RuntimeComponent>null, ele: null, sc: 0, selected_comp: null, selected_ele: null, selected_element: null, ACTIONS, POINTER_DN: false },
        edit_css = comp_window.document.createElement("style"),
        system = initSystem(wick, edit_wick, css_sys, edit_css, comp_window);

    let prev = null, ACTIVE_ACTION = null, cx = 0, cy = 0, px = 0, py = 0;
    let crate: ObjectCrate = null;
    //Root UI element in document markup.
    let
        ui_root = null;

    comp_window.document.head.appendChild(edit_css);
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

    function APPLY_ACTION(act: Action[], data: ObjectCrate["data"]) {

        editor_model.POINTER_DN = true;

        //Make sure all actions in slug are actions.
        //arrange the actions based on their ordering precedence

        const sabot = act
            .filter(a => typeof a == "object"
                && typeof a.type == "number"
                && typeof a.priority == "number")
            .sort((a, b) => a.priority > b.priority ? -1 : 1);

        if (sabot.length !== act.length) {
            ACTIVE_ACTION = null;
            system.action_sabot = null;
        } else {
            system.action_sabot = sabot;
            ACTIVE_ACTION = sabot;
        }

        px = cx;
        py = cy;

        UPDATE_ACTION(true, data);
        END_ACTION();
    }

    function START_ACTION(act: Action[], data: ObjectCrate["data"]) {

        editor_model.POINTER_DN = true;

        //Make sure all actions in slug are actions.
        //arrange the actions based on their ordering precedence

        const sabot = act
            .filter(a => typeof a == "object"
                && typeof a.type == "number"
                && typeof a.priority == "number")
            .sort((a, b) => a.priority > b.priority ? -1 : 1);

        if (sabot.length !== act.length) {
            ACTIVE_ACTION = null;
            system.action_sabot = null;
        } else {
            system.action_sabot = sabot;
            ACTIVE_ACTION = sabot;
        }

        px = cx;
        py = cy;

        UPDATE_ACTION(true, data);
    }

    function UPDATE_ACTION(INITIAL_PASS = false, data?: ObjectCrate["data"]) {

        if (!ACTIVE_ACTION) return;

        if (!crate) {

            crate = {
                comp: editor_model.selected_comp,
                ele: editor_model.selected_ele,
                css_cache: CSSCacheFactory(system, editor_model.selected_comp, editor_model.selected_ele),
                html_cache: HTMLCacheFactory(system, editor_model.selected_comp, editor_model.selected_ele),
                data: {
                    curr_comp: editor_model.selected_comp.name,
                    data: "",
                }
            };

            if (data)
                for (const d in data)
                    crate.data[d] = data[d];
        }

        crate.data.dx = cx - px;
        crate.data.dy = cy - py;

        applyAction(ACTIVE_ACTION, system, [crate], INITIAL_PASS);

        crate.data.dx = 0;
        crate.data.dy = 0;

        editor_model.sc++;
    }

    function END_ACTION(event?) {

        editor_model.POINTER_DN = false;

        if (!ACTIVE_ACTION) return;

        const
            ele = editor_model.selected_ele,
            comp = editor_model.selected_comp;

        sealAction(ACTIVE_ACTION, system, [crate]);

        ACTIVE_ACTION = null;
        system.action_sabot = null;

        history.WriteBack(system);
        CSSCacheFactory.destroy(crate.comp);
        //crate.css_cache.destroy();
        crate.html_cache.destroy();
        crate = null;

        editor_model.sc++;
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

    function globalScrollEventListener(e) {
        editor_model.sc++;
    }


    comp_window.document.addEventListener("pointermove", pointerMoveEventResponder);
    comp_window.document.addEventListener("pointerup", pointerReleaseElementEventResponder);

    comp_window.document.addEventListener("scroll", globalScrollEventListener);
    comp_window.addEventListener("resize", globalScrollEventListener);
    comp_window.addEventListener("keypress", e => {
        if (e.key == "z") history.ROLLBACK_EDIT_STATE(system);
        if (e.key == "r") history.ROLLFORWARD_EDIT_STATE(system);
        editor_model.sc++;
    });

    /**
     * Include the editor frame system.
     */
    edit_rt.presets.models["flame-editor"] = editor_model;
    edit_rt.presets.api.APPLY_ACTION = APPLY_ACTION;
    edit_rt.presets.api.START_ACTION = START_ACTION;
    edit_rt.presets.api.ACTIONS = ACTIONS;

    const editor_frame = await (edit_wick("/flame/editor/components/editor.jsx").pending);

    ui_root = (new editor_frame.classWithIntegratedCSS()).ele;

    document.body.insertBefore(ui_root, document.body.firstElementChild);
}