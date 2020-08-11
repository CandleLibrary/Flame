import {
    setNumericValue, getContentBox
} from "./common.js";

import {
    SETDELTAHEIGHT,
    SETDELTAWIDTH
} from "./dimensions.js";
import { ActionType } from "../types/action_type.js";
import { sealCSS, updateCSS } from "./position.js";
import { FlameSystem } from "../types/flame_system.js";
import { ObjectCrate } from "../types/object_crate.js";
import { Action } from "../types/action.js";

export function SETPADDINGTOP(sys: FlameSystem, crate: ObjectCrate, x: number) {
    setNumericValue(sys, crate, "padding_top", x, setNumericValue.parent_height);
}

export function SETPADDINGBOTTOM(sys: FlameSystem, crate: ObjectCrate, x: number) {
    setNumericValue(sys, crate, "padding_bottom", x, setNumericValue.parent_height);
}
export function SETPADDINGLEFT(sys: FlameSystem, crate: ObjectCrate, x: number) {
    setNumericValue(sys, crate, "padding_left", x, setNumericValue.parent_width);
}
export function SETPADDINGRIGHT(sys: FlameSystem, crate: ObjectCrate, x: number) {
    setNumericValue(sys, crate, "padding_right", x, setNumericValue.parent_width);
}

export const SETDELTAPADDINGTOP = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {
        const
            style = sys.window.getComputedStyle(crate.ele),
            value = parseFloat(style.paddingTop) || 0,
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;
        SETPADDINGTOP(sys, crate, value + delta);
        SETDELTAHEIGHT.updateFN(sys, crate, ratio, true);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};
export const SETDELTAPADDINGBOTTOM = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {
        const
            style = sys.window.getComputedStyle(crate.ele),
            value = parseFloat(style.paddingBottom) || 0,
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;
        console.log(value);
        SETPADDINGBOTTOM(sys, crate, value + delta);
        SETDELTAHEIGHT.updateFN(sys, crate, ratio, true);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};
export const SETDELTAPADDINGRIGHT = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {
        const
            style = sys.window.getComputedStyle(crate.ele),
            value = parseFloat(style.paddingRight) || 0,
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;
        SETPADDINGRIGHT(sys, crate, value + delta);
        SETDELTAWIDTH.updateFN(sys, crate, ratio, true);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const SETDELTAPADDINGLEFT = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {
        const
            style = sys.window.getComputedStyle(crate.ele),
            value = parseFloat(style.paddingLeft) || 0,
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;
        SETPADDINGLEFT(sys, crate, value + delta);
        SETDELTAWIDTH.updateFN(sys, crate, ratio, true);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const RESIZEPADDINGT = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setLimits: (sys, crate) => {
        const padding_top = parseFloat(sys.window.getComputedStyle(crate.ele).paddingTop) || 0;
        const padding_bottom = parseFloat(sys.window.getComputedStyle(crate.ele).paddingBottom) || 0;
        const height = getContentBox(crate.ele, sys.window, sys).height;
        const min_y = -padding_top;
        const max_y = height - padding_top - padding_bottom;
        return { min_y, max_y };
    },
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio) => {

        if (ratio.adjusted_delta == 0) return;

        SETDELTAPADDINGTOP.updateFN(sys, crate, ratio, false);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const RESIZEPADDINGB = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setLimits: (sys, crate) => {
        const padding_bottom = parseFloat(sys.window.getComputedStyle(crate.ele).paddingBottom) || 0;
        const padding_top = parseFloat(sys.window.getComputedStyle(crate.ele).paddingTop) || 0;
        const height = getContentBox(crate.ele, sys.window, sys).height;
        const min_y = (-height + padding_bottom) + padding_top;
        const max_y = padding_bottom;
        return { min_y, max_y };
    },
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio) => {
        if (ratio.adjusted_delta == 0) return;
        SETDELTAPADDINGBOTTOM.updateFN(sys, crate, ratio, false);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const RESIZEPADDINGL = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setLimits: (sys, crate) => {
        const padding_right = parseFloat(sys.window.getComputedStyle(crate.ele).paddingRight) || 0;
        const padding_left = parseFloat(sys.window.getComputedStyle(crate.ele).paddingLeft) || 0;
        const width = getContentBox(crate.ele, sys.window, sys).width;
        const min_x = -padding_left;
        const max_x = width;
        return { min_x, max_x };
    },
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio) => {
        if (ratio.adjusted_delta == 0) return;
        SETDELTAPADDINGLEFT.updateFN(sys, crate, ratio, false);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const RESIZEPADDINGR = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setLimits: (sys, crate) => {
        const padding_left = parseFloat(sys.window.getComputedStyle(crate.ele).paddingLeft) || 0;
        const padding_right = parseFloat(sys.window.getComputedStyle(crate.ele).paddingRight) || 0;
        const width = getContentBox(crate.ele, sys.window, sys).width;
        const min_x = -width;
        const max_x = padding_right;
        return { min_x, max_x };
    },
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio) => {
        if (ratio.adjusted_delta == 0) return;
        SETDELTAPADDINGRIGHT.updateFN(sys, crate, ratio, false);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};
