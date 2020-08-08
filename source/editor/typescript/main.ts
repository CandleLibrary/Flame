import * as ACTIONS from "./actions/action.js";
import {
    applyAction,
    sealAction
} from "./actions/update.js";
import css_sys from "./css.js";
import history from "./history.js";
import { ObjectCrate } from "./types/object_crate.js";
import { RuntimeComponent, ObservableWatcher, ObservableModel } from "@candlefw/wick";
import { CSSCacheFactory } from "./cache/css_cache.js";
import { HTMLCacheFactory } from "./cache/html_cache.js";
import { Action } from "./types/action.js";
import { initSystem } from "./system.js";
import { getComponentHierarchy, getComponentData, getComponentFromEvent, getElementFromEvent, retrieveComponentFromElement } from "./common_functions.js";
import { t } from "@candlefw/wind/build/types/ascii_code_points";
import { startRatioMeasure } from "./actions/ratio.js";

export default async function initFlame(editor_cfw, comp_cfw, comp_window) { //For Isolation

    const
        component_map = new Map,
        wick = comp_cfw.wick,
        css = editor_cfw.css,
        rt = wick.rt,
        edit_rt = editor_cfw.wick.rt,
        edit_wick = editor_cfw.wick,
        editor_model = new (class implements ObservableModel {
            comp: RuntimeComponent;
            ele: any;
            sc: number;
            selected_comp: RuntimeComponent;
            selected_ele: HTMLElement;
            selected_element: HTMLElement;
            ACTIONS: any;
            POINTER_DN: boolean;

            observers: ObservableWatcher[];

            OBSERVABLE: true;
            constructor() {
                this.comp = null;
                this.ele = null;
                this.sc = 0;
                this.selected_comp = null;
                this.selected_element = null;
                this.ACTIONS = ACTIONS;
                this.POINTER_DN = false;
                this.observers = [];
            }

            update() {
                for (const observer of this.observers)
                    observer.onModelUpdate(this);

            }
            subscribe(comp: ObservableWatcher) {
                this.unsubscribe(comp);
                this.observers.push(comp);
                return true;
            };

            unsubscribe(comp: ObservableWatcher) {
                let i = this.observers.indexOf(comp);
                if (i >= 0) return this.observers.splice(i, 1), true;
                return false;
            }
        }),
        edit_css = comp_window.document.createElement("style"),
        event_intercept_ele = document.createElement("div"),
        system = initSystem(wick, edit_wick, css_sys, edit_css, comp_window);

    event_intercept_ele.classList.add("flame_editor_fill", "event_intercept");

    document.body.appendChild(event_intercept_ele);

    function revealEventIntercept() {
        event_intercept_ele.style.display = "block";
    }

    function hideEventIntercept() {
        event_intercept_ele.style.display = "";
    }

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



    function ISElementUI(ele) {
        while (ele) {
            if (ele == ui_root) { return true; }
            ele = ele.parentNode;
        }
        return false;
    }

    let ox = 0;
    let oy = 0;

    function START_ACTION(act: Action[], data: ObjectCrate["data"]) {

        //Enable event intercept object.
        revealEventIntercept();

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

        ox = cx;
        oy = cy;

        px = cx;
        py = cy;

        UPDATE_ACTION(true, data);
    }

    function UPDATE_ACTION(INITIAL_PASS = false, data?: ObjectCrate["data"]) {

        if (!ACTIVE_ACTION) return;

        if (!crate) { //TODO Setup crate information for each selected object.

            crate = {
                comp: editor_model.selected_comp,
                ele: editor_model.selected_ele,
                css_cache: null,
                html_cache: null,
                limits: {
                    min_x: -Infinity,
                    max_x: Infinity,
                    min_y: -Infinity,
                    max_y: Infinity,
                },
                data: {
                    abs_x: 0,
                    abs_y: 0,
                    curr_comp: editor_model.selected_comp.name,
                    data: "",
                },
                action_list: ACTIVE_ACTION.slice(),
                ratio_list: []
            };

            crate.css_cache = CSSCacheFactory(system, editor_model.selected_comp, editor_model.selected_ele, crate);
            crate.html_cache = HTMLCacheFactory(system, editor_model.selected_comp, editor_model.selected_ele, crate);

            if (data)
                for (const d in data)
                    crate.data[d] = data[d];

        }

        crate.data.dx = cx - px;
        crate.data.dy = cy - py;

        if (INITIAL_PASS)
            console.log(crate.data.dx);

        applyAction(system, [crate], INITIAL_PASS);

        crate.data.dx = 0;
        crate.data.dy = 0;

        editor_model.sc++;
        editor_model.update();
    }

    function END_ACTION(event?) {

        hideEventIntercept();

        editor_model.POINTER_DN = false;

        if (!ACTIVE_ACTION) return;

        const
            ele = editor_model.selected_ele,
            comp = editor_model.selected_comp;

        sealAction(system, [crate]);

        ACTIVE_ACTION = null;
        system.action_sabot = null;

        history.WriteBack(system);
        CSSCacheFactory.destroy(crate.comp);
        //crate.css_cache.destroy();
        crate.html_cache.destroy();
        crate = null;

        editor_model.sc++;

        editor_model.update();
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

        px = 0;
        py = 0;

        UPDATE_ACTION(true, data);
        END_ACTION();
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

        editor_model.selected_comp = comp;
        editor_model.selected_ele = getElementInHTMLNamespace(ele);
        editor_model.comp = null;
        editor_model.ele = null;

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
        editor_model.update();
    }

    function pointerMoveEventResponder(e) {

        px = cx;
        cx = e.x;
        py = cy;
        cy = e.y;


        if (ACTIVE_ACTION) return UPDATE_ACTION();

        let ele = comp_window.document.elementFromPoint(e.x, e.y);

        if (!ele || ele == editor_model.ele || ISElementUI(ele))
            return;

        if (!ele.namespaceURI.includes("html"))
            ele = getElementInHTMLNamespace(ele);

        if (ele !== prev) {
            prev = ele;
        } else
            return;

        const comp = retrieveComponentFromElement(ele);
        editor_model.comp = comp;
        editor_model.ele = ele;
        editor_model.update();
    }

    function globalScrollEventListener(e) {
        editor_model.sc++;
        editor_model.update();
    }


    comp_window.document.addEventListener("pointermove", pointerMoveEventResponder);
    window.document.addEventListener("pointermove", pointerMoveEventResponder);
    comp_window.document.addEventListener("pointerup", pointerReleaseElementEventResponder);

    //window.addEventListener("pointermove", pointerMoveEventResponder);
    //window.addEventListener("pointerup", pointerReleaseElementEventResponder);

    event_intercept_ele.addEventListener("pointermove", pointerMoveEventResponder);
    event_intercept_ele.addEventListener("pointerup", pointerReleaseElementEventResponder);

    comp_window.document.addEventListener("scroll", globalScrollEventListener);
    comp_window.addEventListener("resize", globalScrollEventListener);
    comp_window.addEventListener("keypress", e => {
        if (e.key == "z") history.ROLLBACK_EDIT_STATE(system);
        if (e.key == "r") history.ROLLFORWARD_EDIT_STATE(system);
        editor_model.sc++;
        editor_model.update();
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