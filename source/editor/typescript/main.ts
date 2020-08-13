import WICK, { RuntimeComponent, Presets, WickRuntime } from "@candlefw/wick";

import * as ACTIONS from "./actions/action.js";
import history from "./history.js";
import { initSystem } from "./system.js";
import {
    getListOfRTInstanceAndAncestors,
    getListOfComponentData,
    getRTInstanceFromEvent,
    getElementFromEvent,
    retrieveRTInstanceFromElement,
    getElementFromPoint
} from "./common_functions.js";
import {
    START_ACTION,
    APPLY_ACTION,
    UPDATE_ACTION,
    END_ACTION,
    areActionsRunning
} from "./action_initiators.js";
import * as common from "./common_functions.js";
import { ExtendedComponent } from "@candlefw/wick/build/types/types/extended_component";


export default async function initFlame(editor_cfw, edited_cfw, edited_window: Window) { //For Isolation

    const
        component_map = new Map,
        edited_wick = edited_cfw.wick,
        editor_css = editor_cfw.css,
        editor_rt: WickRuntime = editor_cfw.wick.rt,
        editor_wick: typeof WICK = editor_cfw.wick,
        edited_css = edited_window.document.createElement("style"),
        system = initSystem(edited_wick, editor_wick, edited_css, edited_window),
        { event_intercept_frame: event_intercept_ele } = system.ui;

    interface InputHandler {
        down: (e: PointerEvent) => InputHandler;
        up: (e: PointerEvent) => InputHandler;
        drag: (e: PointerEvent, button: ButtonType) => InputHandler;
        move?: (e: PointerEvent) => InputHandler;
        wheel: (e: WheelEvent) => InputHandler;
    }

    //Turn off cursor events for the edited elements
    edited_window.document.body.style.pointerEvents = "none";

    let prev: HTMLElement = null, ui_root: HTMLElement = null;;

    //Root UI element in document markup.

    /**
     * Integrate Flame editing system into every component instance. 
     */
    edited_cfw.wick.rt.OVERRIDABLE_onComponentCreate = function (comp) {

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

            if (button == ButtonType.MIDDLE) return drag_handler.drag(e, button);

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
                new_scale = Math.max(0.2, Math.min(1, old_scale + -deltaY * 0.0005));

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

                        if (editor_css.matchElements(ele, selector, editor_css.DOMHelpers)) {
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

    async function initializeHarness(wick: typeof WICK): Promise<ExtendedComponent> {
        return await editor_wick("/flame/editor/components/harness.jsx").pending;
    }

    function extractIFrameContentAndPlaceIntoHarness(harness_component: ExtendedComponent, window: Window, edited_presets: Presets) {
        //Pull out the content of the app and place into a harness component
        const
            //Every new component will be placed in its own harness, which is used to 
            //represent the component's window and document context.
            root_component: RuntimeComponent =
                (<Element & { wick_component: RuntimeComponent; }>
                    window.document.querySelector("[w-s]"))
                    .wick_component;
        console.log(harness_component.class_string.class_string);
        const harness = new harness_component.classWithIntegratedCSS(
            root_component,
            undefined,
            undefined,
            undefined,
            undefined,
            edited_presets
        );

        root_component.par = harness;

        harness.ele.appendChild(root_component.ele);
        window.document.body.appendChild(harness.ele);
    }

    edited_window.document.head.appendChild(edited_css);
    document.body.appendChild(event_intercept_ele);

    edited_window.document.addEventListener("pointermove", pointerMoveEventResponder);
    window.document.addEventListener("pointermove", pointerMoveEventResponder);
    event_intercept_ele.addEventListener("pointermove", pointerMoveEventResponder);

    window.addEventListener("focusout", pointerUpEventResponder);
    window.addEventListener("contextmenu", e => {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
    });
    edited_window.addEventListener("contextmenu", e => {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
    });

    edited_window.document.addEventListener("pointerdown", pointerDownEventResponder);
    window.document.addEventListener("pointerdown", pointerDownEventResponder);

    event_intercept_ele.addEventListener("pointerup", pointerUpEventResponder);
    edited_window.document.addEventListener("pointerup", pointerUpEventResponder);
    window.document.addEventListener("pointerup", pointerUpEventResponder);

    edited_window.document.addEventListener("wheel", wheelScrollEventResponder);
    window.document.addEventListener("wheel", wheelScrollEventResponder);
    edited_window.document.addEventListener("scroll", windowResizeEventResponder);
    edited_window.addEventListener("resize", windowResizeEventResponder);


    window.addEventListener("keydown", e => {
        e.preventDefault();
    });

    window.addEventListener("keypress", e => {
        if (e.key == "z") history.ROLLBACK_EDIT_STATE(system);
        if (e.key == "r") history.ROLLFORWARD_EDIT_STATE(system);
        system.editor_model.sc++;
        system.editor_model.update();
        e.preventDefault();
    });

    edited_window.addEventListener("keypress", (e: KeyboardEvent) => {
        if (e.ctrlKey) {
            if (e.key == "z")
                if (e.shiftKey) history.ROLLFORWARD_EDIT_STATE(system);
                else history.ROLLBACK_EDIT_STATE(system);
        }
        system.editor_model.sc++;
        system.editor_model.update();
        e.preventDefault();
    });

    edited_window.document.body.style.transformOrigin = "top left";
    edited_window.document.body.style.overflow = "hidden";

    /**
     * Include the editor frame system.
     */
    editor_rt.presets.models["flame-editor"] = system.editor_model;
    editor_rt.presets.api.APPLY_ACTION = APPLY_ACTION;
    editor_rt.presets.api.START_ACTION = START_ACTION;
    editor_rt.presets.api.ACTIONS = ACTIONS;
    editor_rt.presets.api.sys = system;
    Object.assign(editor_rt.presets.api, common);


    //ALLOW DEBUGGING ON EDITOR COMPONENTS
    //editor_rt.presets.options.GENERATE_SOURCE_MAPS = true;
    editor_rt.presets.options.REMOVE_DEBUGGER_STATEMENTS = false;

    extractIFrameContentAndPlaceIntoHarness(
        await initializeHarness(editor_wick),
        edited_window,
        edited_wick.rt.presets
    );



    const editor_frame = await (editor_wick("/flame/editor/components/editor.jsx").pending);

    //DO NOT DEBUG ON COMPONENTS GENERATED BY EDITING
    editor_rt.presets.options.GENERATE_SOURCE_MAPS = false;
    editor_rt.presets.options.REMOVE_DEBUGGER_STATEMENTS = true;

    ui_root = (new editor_frame.classWithIntegratedCSS()).ele;

    document.body.insertBefore(ui_root, document.body.firstElementChild);
}