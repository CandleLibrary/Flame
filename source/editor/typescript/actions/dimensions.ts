import { setNumericValue, ensureBlocklike, prepRebuild } from "./common.js";
import { getRatio, startRatioMeasure, RatioMarker, clearRatioMeasure } from "./ratio.js";
import { ObjectCrate } from "../types/object_crate.js";
import { FlameSystem } from "../types/flame_system.js";
import { sealCSS, updateCSS } from "./position.js";
import { ActionType } from "../types/action_type.js";
import { Action } from "../types/action.js";

function getContentBox(ele, win: Window = window, system) {
    const
        scale = system.ui.transform.scale,

        rect = ele.getBoundingClientRect(),
        par_prop = win.getComputedStyle(ele),

        border_l = parseFloat(par_prop.getPropertyValue("border-left")),
        border_r = parseFloat(par_prop.getPropertyValue("border-right")),
        border_t = parseFloat(par_prop.getPropertyValue("border-top")),
        border_b = parseFloat(par_prop.getPropertyValue("border-bottom")),

        padding_l = parseFloat(par_prop.getPropertyValue("padding-left")),
        padding_r = parseFloat(par_prop.getPropertyValue("padding-right")),
        padding_t = parseFloat(par_prop.getPropertyValue("padding-top")),
        padding_b = parseFloat(par_prop.getPropertyValue("padding-bottom")),

        top = rect.top / scale + border_t,
        left = rect.left / scale + border_l,
        width = rect.width / scale - border_l - border_r - padding_l - padding_r,
        height = rect.height / scale - border_t - border_b - padding_t - padding_b;
    return { top, left, width, height };
}

function getNumericValue(sys: FlameSystem, crate: ObjectCrate, type: string): number {
    const { ele } = crate;
    return getContentBox(ele, sys.window, sys)[type];
}

export function SETWIDTH(system, crate: ObjectCrate, x: number) {
    //ensureBlocklike(system, component, element);
    setNumericValue(system, crate, "width", x, setNumericValue.parent_width);
}

export function SETHEIGHT(system, crate: ObjectCrate, y: number) {
    //ensureBlocklike(system, component, element);
    setNumericValue(system, crate, "height", y, setNumericValue.parent_height);
}

export const SETDELTAWIDTH = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ delta: crate.data.dx, type: "width" }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {

        const start_x = getNumericValue(sys, crate, "width"),

            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;

        SETWIDTH(sys, crate, start_x + delta);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};



export const SETDELTAHEIGHT = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ delta: crate.data.dy, type: "height" }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {

        const start_x = getNumericValue(sys, crate, "height"),

            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;

        SETHEIGHT(sys, crate, start_x + delta);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};
