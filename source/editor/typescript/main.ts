import * as ACTIONS from "./actions/action.js";

import history from "./history.js";

import { initSystem } from "./system.js";
import { getListOfRTInstanceAndAncestors, getListOfComponentData, getRTInstanceFromEvent, getElementFromEvent, retrieveRTInstanceFromElement, getElementFromPoint } from "./common_functions.js";
import { START_ACTION, APPLY_ACTION, UPDATE_ACTION, END_ACTION, areActionsRunning } from "./action_initiators.js";
import * as common from "./common_functions.js";
import WICK, { RuntimeComponent } from "@candlefw/wick";


export default async function initFlame(editor_cfw, comp_cfw, comp_window: Window) { //For Isolation

    const
        component_map = new Map,
        wick = comp_cfw.wick,
        css = editor_cfw.css,
        edit_rt = editor_cfw.wick.rt,
        edit_wick: typeof WICK = editor_cfw.wick,
        edit_css = comp_window.document.createElement("style"),
        system = initSystem(wick, edit_wick, edit_css, comp_window),
        { event_intercept_frame: event_intercept_ele } = system.ui;

    interface InputHandler {
        down: (e: PointerEvent) => InputHandler;
        up: (e: PointerEvent) => InputHandler;
        drag: (e: PointerEvent, button: ButtonType) => InputHandler;
        move?: (e: PointerEvent) => InputHandler;
        wheel: (e: WheelEvent) => InputHandler;
    }

    //Turn off cursor events for the edited elements
    comp_window.document.body.style.pointerEvents = "none";

    let prev: HTMLElement = null, ui_root: HTMLElement = null;;

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

    const enum ButtonType {
        NONE,
        LEFT,
        MIDDLE,
        RIGHT,
        $4,
        $5,
        $6,
    }


    const default_handler: InputHandler = <InputHandler>{
        down: (e) => default_handler,
        up(e) {
            selectElementEventResponder(e);
            return default_handler;
        },
        drag(e, button: ButtonType) {

            if (areActionsRunning()) return action_input_handler.move(e);

            if (button = ButtonType.MIDDLE) return drag_handler.drag(e, button);

            return default_handler;
        },
        move(e) {

            if (areActionsRunning()) return action_input_handler.move(e);

            let ele = getElementFromPoint(e.x, e.y);

            if (!ele || ele == system.editor_model.ele || ISElementUI(ele))
                return default_handler;

            if (!ele.namespaceURI.includes("html"))
                ele = getElementInHTMLNamespace(ele);

            if (ele !== prev)
                prev = ele;
            else
                return default_handler;

            const comp = retrieveRTInstanceFromElement(ele);
            system.editor_model.comp = comp;
            system.editor_model.ele = ele;
            system.editor_model.update();
            return default_handler;
        },
        wheel(event) {
            const { ui: { transform } } = system,
                { x, y, deltaY } = event,
                { px, py, scale } = transform,
                old_scale = scale,
                new_scale = Math.max(0.4, Math.min(1, old_scale + -deltaY * 0.0005));

            transform.scale = new_scale;
            transform.px -= ((((px - x) * old_scale) - ((px - x) * new_scale))) / (old_scale);
            transform.py -= ((((py - y) * old_scale) - ((py - y) * new_scale))) / (old_scale);

            event.stopPropagation();
            event.stopImmediatePropagation();

            return default_handler;
        }
    };

    const drag_handler: InputHandler = <InputHandler>{
        down(e) { return default_handler; },
        up(e) { return default_handler; },
        drag(e) {
            const { dx, dy, ui: { transform } } = system;

            transform.px += dx;
            transform.py += dy;

            return drag_handler;
        },
        move(e) { return default_handler; },
        wheel(e) { return default_handler; }
    };

    const action_input_handler: InputHandler = <InputHandler>{
        down(e) { UPDATE_ACTION(true); return action_input_handler; },
        up(e) { END_ACTION(); return default_handler; },
        drag(e) {
            UPDATE_ACTION(); return action_input_handler;
        },
        move(e) { return action_input_handler.drag(e, 0); },
        wheel(e) { return action_input_handler; }
    };

    let active_input_handler = default_handler;

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

        const comp = getRTInstanceFromEvent(event),
            ele = getElementFromEvent(event);

        if (!comp || !ele || ISElementUI(ele)) return;

        system.editor_model.selected_comp = comp;
        system.editor_model.selected_ele = getElementInHTMLNamespace(ele);
        system.editor_model.comp = null;
        system.editor_model.ele = null;

        const roots = getListOfComponentData(system, ...getListOfRTInstanceAndAncestors(comp));

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
    }

    let POINTER_DOWN = false;
    let DRAG_BUTTON = 0;

    function pointerUpEventResponder(e: PointerEvent) {
        POINTER_DOWN = false;
        DRAG_BUTTON = 0;

        active_input_handler = active_input_handler.up(e);

        //system.editor_model.sc++;
        system.editor_model.update();
    }

    function pointerDownEventResponder(e: PointerEvent) {
        POINTER_DOWN = true;
        DRAG_BUTTON = e.button + 1;

        active_input_handler = active_input_handler.down(e);

        //system.editor_model.sc++;
        system.editor_model.update();;
    }

    function pointerMoveEventResponder(e: PointerEvent) {
        system.dx = e.x - system.cx;
        system.cx = e.x;
        system.dy = e.y - system.cy;
        system.cy = e.y;

        if (POINTER_DOWN)
            active_input_handler = active_input_handler.drag(e, <ButtonType><unknown>DRAG_BUTTON);
        else
            active_input_handler = active_input_handler.move(e);

        system.editor_model.sc++;
        system.editor_model.update();
    }

    function wheelScrollEventResponder(e: WheelEvent) {
        active_input_handler = active_input_handler.wheel(e);

        system.editor_model.sc++;
        system.editor_model.update();
    }

    function windowResizeEventResponder(e: Event) {
        system.editor_model.sc++;
        system.editor_model.update();
    }


    comp_window.document.head.appendChild(edit_css);

    comp_window.document.addEventListener("pointermove", pointerMoveEventResponder);
    window.document.addEventListener("pointermove", pointerMoveEventResponder);
    window.addEventListener("focusout", pointerUpEventResponder);
    comp_window.document.addEventListener("pointerup", pointerUpEventResponder);
    comp_window.document.addEventListener("pointerdown", pointerDownEventResponder);

    document.body.appendChild(event_intercept_ele);
    event_intercept_ele.addEventListener("pointermove", pointerMoveEventResponder);
    event_intercept_ele.addEventListener("pointerup", pointerUpEventResponder);

    comp_window.document.addEventListener("wheel", wheelScrollEventResponder);
    comp_window.document.addEventListener("scroll", windowResizeEventResponder);
    comp_window.addEventListener("resize", windowResizeEventResponder);


    window.addEventListener("keypress", e => {
        if (e.key == "z") history.ROLLBACK_EDIT_STATE(system);
        if (e.key == "r") history.ROLLFORWARD_EDIT_STATE(system);
        system.editor_model.sc++;
        system.editor_model.update();
    });

    comp_window.addEventListener("keypress", (e: KeyboardEvent) => {
        if (e.ctrlKey) {
            if (e.key == "z")
                if (e.shiftKey) history.ROLLFORWARD_EDIT_STATE(system);
                else history.ROLLBACK_EDIT_STATE(system);
        }
        system.editor_model.sc++;
        system.editor_model.update();
    });

    //Pull out the content of the app and place into a harness component
    const harness_component = await edit_wick("/flame/editor/components/harness.jsx").pending;

    //Every new component will be placed in its own harness, which is used to 
    //represent the component's window and document context.

    const root_component: RuntimeComponent = (<Element & { wick_component: RuntimeComponent; }>comp_window.document.querySelector("[w-s]")).wick_component,
        { ele: root_component_ele } = root_component;

    const harness = new harness_component.classWithIntegratedCSS(root_component, undefined, undefined, undefined, undefined, edit_wick.rt.presets);

    root_component.par = harness;

    harness.ele.appendChild(root_component.ele);

    comp_window.document.body.appendChild(harness.ele);
    comp_window.document.body.style.transformOrigin = "top left";



    /**
     * Include the editor frame system.
     */
    edit_rt.presets.models["flame-editor"] = system.editor_model;
    edit_rt.presets.api.APPLY_ACTION = APPLY_ACTION;
    edit_rt.presets.api.START_ACTION = START_ACTION;
    edit_rt.presets.api.ACTIONS = ACTIONS;
    edit_rt.presets.api.sys = system;
    Object.assign(edit_rt.presets.api, common);

    const editor_frame = await (edit_wick("/flame/editor/components/editor.jsx").pending);

    ui_root = (new editor_frame.classWithIntegratedCSS()).ele;

    document.body.insertBefore(ui_root, document.body.firstElementChild);
}