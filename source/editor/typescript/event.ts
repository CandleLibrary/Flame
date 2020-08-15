import { InputHandler, ButtonType } from "./types/input";
import { FlameSystem } from "./types/flame_system";

import {
    getListOfRTInstanceAndAncestors,
    getListOfComponentData,
    getRTInstanceFromEvent,
    getElementFromEvent,
    retrieveRTInstanceFromElement,
    getElementFromPoint
} from "./common_functions.js";

import { EditorToolState, DrawObject } from "./editor_model.js";

import history from "./history.js";

import {
    UPDATE_ACTION,
    END_ACTION,
    areActionsRunning
} from "./action_initiators.js";

let prev: HTMLElement = null;

function ISElementUI(ele, sys: FlameSystem) {

    while (ele) {

        if (ele == sys.window.document.firstElementChild) { return true; }

        ele = ele.parentNode;
    }

    return false;
}

const default_handler: InputHandler = <InputHandler>{
    down: (e, sys) => default_handler,
    up(e, sys) {
        selectElementEventResponder(e, sys);
        return default_handler;
    },
    drag(e, button: ButtonType, sys) {

        if (areActionsRunning()) return action_input_handler.move(e, sys);

        if (button == ButtonType.MIDDLE) return drag_handler.drag(e, button, sys);

        return draw_box_handler;

        return default_handler;
    },
    move(e, sys) {

        if (areActionsRunning()) return action_input_handler.move(e, sys);

        let ele = getElementFromPoint(e.x, e.y);

        if (!ele || ele == sys.editor_model.ele || ISElementUI(ele))
            return default_handler;

        if (!ele.namespaceURI.includes("html"))
            ele = getElementInHTMLNamespace(ele);


        if (ele == sys.editor_model.selected_ele) {
            sys.editor_model.comp = null;
            sys.editor_model.ele = null;
            sys.editor_model.update();
        }
        if (ele !== prev)
            prev = ele;
        else
            return default_handler;

        const comp = retrieveRTInstanceFromElement(ele);

        {
            sys.editor_model.comp = comp;
            sys.editor_model.ele = ele;
        }

        return default_handler;
    },
    wheel(e, sys) {
        const { ui: { transform } } = sys,
            { x, y, deltaY } = e,
            { px, py, scale } = transform,
            old_scale = scale,
            new_scale = Math.max(0.2, Math.min(1, old_scale + -deltaY * 0.0005));

        transform.scale = new_scale;
        transform.px -= ((((px - x) * old_scale) - ((px - x) * new_scale))) / (old_scale);
        transform.py -= ((((py - y) * old_scale) - ((py - y) * new_scale))) / (old_scale);

        e.stopPropagation();
        e.stopImmediatePropagation();

        return default_handler;
    }
};

let draw_box: DrawObject = null;

const draw_box_handler: InputHandler = <InputHandler>{
    down(e, sys) { return default_handler; },
    up(e, sys) {
        if (draw_box) {
            sys.editor_model.selection_box = draw_box;
            sys.editor_model.draw_objects.splice(
                sys.editor_model.draw_objects.indexOf(draw_box),
                1
            );
            draw_box = null;
        }
        sys.editor_model.sc++;
        sys.editor_model.update();
        sys.editor_model.selection_box = null;
        return default_handler;
    },
    drag(e, b: ButtonType, sys) {

        const { px, py, scale } = sys.ui.transform,
            { cx, cy, dx, dy } = sys;

        if (!draw_box) {
            draw_box = {
                type: "box",
                px1: (-px + cx) / scale,
                py1: (-py + cy) / scale,
                px2: (-px + cx) / scale,
                py2: (-py + cy) / scale,
            };

            sys.editor_model.draw_objects.push(draw_box);
        } else {
            draw_box.px2 += dx / scale;
            draw_box.py2 += dy / scale;
        }
        sys.editor_model.update();
        return draw_box_handler;
    },
    move(e, sys) { return default_handler; },
    wheel(e, sys) { return default_handler; }
};

const drag_handler: InputHandler = <InputHandler>{
    down(e, sys) { return default_handler; },
    up(e, sys) { return default_handler; },
    drag(e, b, sys) {
        const { dx, dy, ui: { transform } } = sys;

        transform.px += dx;
        transform.py += dy;

        return drag_handler;
    },
    move(e, sys) { return default_handler; },
    wheel(e, sys) { return default_handler; }
};

const action_input_handler: InputHandler = <InputHandler>{
    down(e, sys) { UPDATE_ACTION(true); return action_input_handler; },
    up(e, sys) { END_ACTION(); return default_handler; },
    drag(e, b, sys) {
        UPDATE_ACTION(); return action_input_handler;
    },
    move(e, sys) { return action_input_handler.drag(e, 0, sys); },
    wheel(e, sys) { return action_input_handler; }
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

function selectElementEventResponder(e, sys: FlameSystem) {

    const comp = getRTInstanceFromEvent(event),
        ele = getElementFromEvent(event),
        { css } = sys;

    if (!comp || !ele || ISElementUI(ele)) return;

    sys.editor_model.selected_comp = comp;
    sys.editor_model.selected_ele = getElementInHTMLNamespace(ele);
    sys.editor_model.comp = null;
    sys.editor_model.ele = null;

    const roots = getListOfComponentData(sys, ...getListOfRTInstanceAndAncestors(comp));

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

function keypressEventResponder(e: KeyboardEvent, sys: FlameSystem) {

    if (e.ctrlKey) {
        if (e.key == "z")
            if (e.shiftKey) history.ROLLFORWARD_EDIT_STATE(sys);
            else history.ROLLBACK_EDIT_STATE(sys);
    } else {
        switch (e.key) {
            case "c":
                sys.editor_model.state = EditorToolState.COMPONENT;
                break;
            case "e":
                sys.editor_model.state = EditorToolState.ELEMENT;
                break;
            case "p":
                sys.editor_model.state = EditorToolState.POSITION;
                break;
            case "b":
                sys.editor_model.state = EditorToolState.BORDER;
                break;
            case "m":
                sys.editor_model.state = EditorToolState.MARGIN;
                break;
            case "d":
                sys.editor_model.state = EditorToolState.DIMENSIONS;
                break;
            case "o":
                sys.editor_model.state = EditorToolState.COLOR;
                break;
            case "v":
                sys.editor_model.state = EditorToolState.PADDING;
                break;
        }
    }
    sys.editor_model.sc++;
    sys.editor_model.update();
    e.preventDefault();
};

let POINTER_DOWN = false, DRAG_BUTTON = 0;

function contextMenuEventResponder(e: Event, sys: FlameSystem) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
}


function pointerUpEventResponder(e: PointerEvent, sys: FlameSystem) {
    POINTER_DOWN = false;
    DRAG_BUTTON = 0;

    active_input_handler = active_input_handler.up(e, sys);

    sys.editor_model.update();
    e.stopPropagation();
    e.stopImmediatePropagation();
}

function pointerDownEventResponder(e: PointerEvent, sys: FlameSystem) {
    POINTER_DOWN = true;
    DRAG_BUTTON = e.button + 1;

    active_input_handler = active_input_handler.down(e, sys);

    sys.editor_model.update();;
    e.stopPropagation();
    e.stopImmediatePropagation();
}

function pointerMoveEventResponder(e: PointerEvent, sys: FlameSystem) {
    sys.dx = e.x - sys.cx;
    sys.cx = e.x;
    sys.dy = e.y - sys.cy;
    sys.cy = e.y;

    if (POINTER_DOWN)
        active_input_handler = active_input_handler.drag(e, <ButtonType><unknown>DRAG_BUTTON, sys);
    else
        active_input_handler = active_input_handler.move(e, sys);

    sys.editor_model.sc++;
    sys.editor_model.update();
}

function wheelScrollEventResponder(e: WheelEvent, sys: FlameSystem) {

    active_input_handler = active_input_handler.wheel(e, sys);

    sys.editor_model.sc++;
    sys.editor_model.update();

    e.stopImmediatePropagation();
    e.stopPropagation();
}

function windowResizeEventResponder(e: Event, sys: FlameSystem) {
    sys.editor_model.sc++;
    sys.editor_model.update();
}


export function initializeEvents(
    sys: FlameSystem,
    editor_window: Window,
) {
    const { ui: { event_intercept_frame: event_intercept_ele } } = sys;

    editor_window.document.addEventListener("pointermove", e => pointerMoveEventResponder(e, sys));

    event_intercept_ele.addEventListener("pointermove", e => pointerMoveEventResponder(e, sys));

    editor_window.addEventListener("focusout", e => pointerUpEventResponder(<PointerEvent>e, sys));

    editor_window.addEventListener("contextmenu", e => contextMenuEventResponder(e, sys));

    editor_window.document.addEventListener("pointerdown", e => pointerDownEventResponder(e, sys));

    event_intercept_ele.addEventListener("pointerup", e => pointerUpEventResponder(e, sys));

    editor_window.document.addEventListener("pointerup", e => pointerUpEventResponder(e, sys));

    editor_window.document.addEventListener("wheel", e => wheelScrollEventResponder(e, sys));

    editor_window.addEventListener("resize", e => windowResizeEventResponder(e, sys));

    editor_window.addEventListener("keydown", e => { });

    editor_window.addEventListener("keypress", e => keypressEventResponder(e, sys));
}