import { InputHandler, ButtonType } from "./types/input";
import { FlameSystem } from "./types/flame_system";

import {
    getListOfRTInstanceAndAncestors,
    getListOfComponentData,
    getRTInstanceFromEvent,
    getElementFromEvent,
    getSelectionFromPoint,
    updateSelections,
    invalidateInactiveSelections,
    invalidateAllSelections
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
        const { ui: { event_intercept_frame: event_intercept_ele } } = sys;

        event_intercept_ele.style.pointerEvents = "none";

        if (e.ctrlKey)
            invalidateInactiveSelections(sys);
        else
            invalidateAllSelections(sys);

        updateSelections(sys);

        const sel = getSelectionFromPoint(e.x, e.y, sys);

        if (sel) sel.ACTIVE = true;

        event_intercept_ele.style.pointerEvents = "";

        return default_handler;
    },
    drag(e, button: ButtonType, sys) {

        if (areActionsRunning()) return action_input_handler.down(e, sys);

        if (button == ButtonType.MIDDLE) return drag_handler.drag(e, button, sys);

        return draw_box_handler;
    },
    move(e, sys) {

        if (areActionsRunning()) return action_input_handler.move(e, sys);

        const { ui: { event_intercept_frame: event_intercept_ele } } = sys;

        event_intercept_ele.style.pointerEvents = "none";

        invalidateInactiveSelections(sys);

        getSelectionFromPoint(e.x, e.y, sys);

        event_intercept_ele.style.pointerEvents = "";

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

        const { ui: { event_intercept_frame: event_intercept_ele } } = sys;

        event_intercept_ele.style.pointerEvents = "none";

        invalidateInactiveSelections(sys);

        getSelectionFromPoint(e.x, e.y, sys);

        updateSelections(sys);

        event_intercept_ele.style.pointerEvents = "";

        sys.editor_model.sc++;

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
        return default_handler;
    },
    drag(e, b: ButtonType, sys) {

        //        sys.editor_model.selection_box = null;

        const { px, py, scale } = sys.ui.transform,
            { cx, cy, dx, dy } = sys;

        if (!draw_box) {
            const len = sys.editor_model.draw_objects.length;

            sys.editor_model.draw_objects.push({
                type: "box",
                px1: (-px + cx) / scale,
                py1: (-py + cy) / scale,
                px2: (-px + cx) / scale,
                py2: (-py + cy) / scale,
            });

            draw_box = sys.editor_model.draw_objects[len];
        } else {
            draw_box.px2 += dx / scale;
            draw_box.py2 += dy / scale;
        }

        updateSelections(sys);

        sys.editor_model.sc++;

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

        updateSelections(sys);

        sys.editor_model.sc++;

        return drag_handler;
    },
    move(e, sys) { return default_handler; },
    wheel(e, sys) { return default_handler; }
};

const action_input_handler: InputHandler = <InputHandler>{
    down(e, sys) {
        const { ui: { event_intercept_frame: event_intercept_ele } } = sys;
        event_intercept_ele.style.zIndex = "100000";
        UPDATE_ACTION(sys, true);
        updateSelections(sys);
        return action_input_handler;
    },
    up(e, sys) {
        const { ui: { event_intercept_frame: event_intercept_ele } } = sys;
        event_intercept_ele.style.zIndex = "";
        END_ACTION(sys);
        updateSelections(sys);
        return default_handler;
    },
    drag(e, b, sys) {
        const { ui: { event_intercept_frame: event_intercept_ele } } = sys;
        event_intercept_ele.style.zIndex = "100000";
        UPDATE_ACTION(sys);
        updateSelections(sys);
        return action_input_handler;
    },
    move(e, sys) { return action_input_handler.drag(e, 0, sys); },
    wheel(e, sys) { return action_input_handler; }
};

let active_input_handler = default_handler;

function keypressEventResponder(e: KeyboardEvent, sys: FlameSystem): boolean {

    if (e.ctrlKey) {
        if (e.key == "z") {

            if (e.shiftKey) history.ROLLFORWARD_EDIT_STATE(sys);
            else history.ROLLBACK_EDIT_STATE(sys);
            return true;
        }
    } else {
        switch (e.key) {
            case "c":
                sys.editor_model.state = EditorToolState.COMPONENT;
                return true;
            case "e":
                sys.editor_model.state = EditorToolState.ELEMENT;
                return true;
            case "p":
                sys.editor_model.state = EditorToolState.POSITION;
                return true;
            case "b":
                sys.editor_model.state = EditorToolState.BORDER;
                return true;
            case "m":
                sys.editor_model.state = EditorToolState.MARGIN;
                return true;
            case "d":
                sys.editor_model.state = EditorToolState.DIMENSIONS;
                return true;
            case "o":
                sys.editor_model.state = EditorToolState.COLOR;
                return true;
            case "v":
                sys.editor_model.state = EditorToolState.PADDING;
                return true;
        }
    }
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

    e.stopPropagation();
    e.stopImmediatePropagation();
}

function pointerDownEventResponder(e: PointerEvent, sys: FlameSystem) {
    POINTER_DOWN = true;
    DRAG_BUTTON = e.button + 1;

    active_input_handler = active_input_handler.down(e, sys);

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
}

function wheelScrollEventResponder(e: WheelEvent, sys: FlameSystem) {

    active_input_handler = active_input_handler.wheel(e, sys);

    e.stopImmediatePropagation();
    e.stopPropagation();
}

function windowResizeEventResponder(e: Event, sys: FlameSystem) {
    sys.editor_model.sc++;
}


export function initializeEvents(
    sys: FlameSystem,
    editor_window: Window,
) {
    const { ui: { event_intercept_frame: event_intercept_ele } } = sys;

    //document.body.appendChild(event_intercept_ele);

    editor_window.document.addEventListener("pointermove", e => pointerMoveEventResponder(e, sys));

    event_intercept_ele.addEventListener("pointermove", e => pointerMoveEventResponder(e, sys));

    editor_window.addEventListener("pointermove", e => pointerMoveEventResponder(e, sys));

    //editor_window.addEventListener("focusout", e => pointerUpEventResponder(<PointerEvent>e, sys));

    editor_window.addEventListener("contextmenu", e => contextMenuEventResponder(e, sys));

    event_intercept_ele.addEventListener("pointerdown", e => pointerDownEventResponder(e, sys));

    event_intercept_ele.addEventListener("pointerup", e => pointerUpEventResponder(e, sys));

    editor_window.document.addEventListener("pointerup", e => pointerUpEventResponder(e, sys));

    editor_window.document.addEventListener("wheel", e => wheelScrollEventResponder(e, sys));

    editor_window.addEventListener("resize", e => windowResizeEventResponder(e, sys));

    window.addEventListener("keydown", e => { });

    window.addEventListener("keypress", e => {
        if (keypressEventResponder(e, sys)) {
            e.preventDefault();
        }

    });
}
