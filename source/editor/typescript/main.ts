import * as ACTIONS from "./actions/action.js";

import css_sys from "./css.js";
import history from "./history.js";

import { initSystem } from "./system.js";
import { getComponentHierarchy, getComponentData, getComponentFromEvent, getElementFromEvent, retrieveComponentFromElement } from "./common_functions.js";
import { START_ACTION, APPLY_ACTION, UPDATE_ACTION, END_ACTION } from "./action_initiators.js";


export default async function initFlame(editor_cfw, comp_cfw, comp_window) { //For Isolation

    const
        component_map = new Map,
        wick = comp_cfw.wick,
        css = editor_cfw.css,
        edit_rt = editor_cfw.wick.rt,
        edit_wick = editor_cfw.wick,
        edit_css = comp_window.document.createElement("style"),
        system = initSystem(wick, edit_wick, css_sys, edit_css, comp_window),
        { event_intercept_frame: event_intercept_ele } = system.ui;

    let prev = null, ACTIVE_ACTION = null, ui_root = null;;

    //Root UI element in document markup.

    /**
     * Integrate Flame editing system into every component instance. 
     */
    comp_cfw.wick.rt.OVERRIDABLE_onComponentCreate = function (comp) {

        //Register all components within a tracker based on their instance type. 
        if (component_map.has(comp.name) == false) component_map.set(comp.name, new Set);
        component_map.get(comp.name).add(comp);

        //Used to trace elements back to their components.
        if (comp.ele) comp.ele.wick_component = comp;
    };

    function ISElementUI(ele) {
        while (ele) {
            if (ele == ui_root) { return true; }
            ele = ele.parentNode;
        }
        return false;
    }

    function pointerReleaseElementEventResponder(e) {

        if (ACTIVE_ACTION) return END_ACTION();

        selectElementEventResponder(e);
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

    function selectElementEventResponder(e) {

        const comp = getComponentFromEvent(event),
            ele = getElementFromEvent(event);

        if (ISElementUI(ele))
            return;

        system.editor_model.selected_comp = comp;
        system.editor_model.selected_ele = getElementInHTMLNamespace(ele);
        system.editor_model.comp = null;
        system.editor_model.ele = null;

        const roots = getComponentData(system, ...getComponentHierarchy(comp));

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

                            break resume;
                        }
                    }
                }
            }
        }
        system.editor_model.update();
    }

    function pointerMoveEventResponder(e) {

        system.cx = e.x;
        system.cy = e.y;

        if (ACTIVE_ACTION) return UPDATE_ACTION();

        let ele = comp_window.document.elementFromPoint(e.x, e.y);

        if (!ele || ele == system.editor_model.ele || ISElementUI(ele))
            return;

        if (!ele.namespaceURI.includes("html"))
            ele = getElementInHTMLNamespace(ele);

        if (ele !== prev) {
            prev = ele;
        } else
            return;

        const comp = retrieveComponentFromElement(ele);
        system.editor_model.comp = comp;
        system.editor_model.ele = ele;
        system.editor_model.update();
    }

    function globalScrollEventListener(e) {
        system.editor_model.sc++;
        system.editor_model.update();
    }

    comp_window.document.head.appendChild(edit_css);

    comp_window.document.addEventListener("pointermove", pointerMoveEventResponder);
    window.document.addEventListener("pointermove", pointerMoveEventResponder);
    comp_window.document.addEventListener("pointerup", pointerReleaseElementEventResponder);

    document.body.appendChild(event_intercept_ele);
    event_intercept_ele.addEventListener("pointermove", pointerMoveEventResponder);
    event_intercept_ele.addEventListener("pointerup", pointerReleaseElementEventResponder);

    comp_window.document.addEventListener("scroll", globalScrollEventListener);
    comp_window.addEventListener("resize", globalScrollEventListener);
    comp_window.addEventListener("keypress", e => {
        if (e.key == "z") history.ROLLBACK_EDIT_STATE(system);
        if (e.key == "r") history.ROLLFORWARD_EDIT_STATE(system);
        system.editor_model.sc++;
        system.editor_model.update();
    });

    /**
     * Include the editor frame system.
     */
    edit_rt.presets.models["flame-editor"] = system.editor_model;
    edit_rt.presets.api.APPLY_ACTION = APPLY_ACTION;
    edit_rt.presets.api.START_ACTION = START_ACTION;
    edit_rt.presets.api.ACTIONS = ACTIONS;

    const editor_frame = await (edit_wick("/flame/editor/components/editor.jsx").pending);

    ui_root = (new editor_frame.classWithIntegratedCSS()).ele;

    document.body.insertBefore(ui_root, document.body.firstElementChild);
}