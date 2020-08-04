import { setNumericValue, getRatio } from "./common.js";
import { SETDELTALEFT, SETDELTATOP } from "./position.js";

import { CSSCacheFactory } from "../cache/css_cache.js";

function resetMargin(system, component, element) {
    let cache = CSSCacheFactory(system, component, element);
    let css = cache.rules;
    if (css.props.margin) {
        //Convert margin value into 
        css.props.margin = null;
    }
}

export function SETMARGINLEFT(system, component, element, x, LINKED = false) {
    resetMargin(system, component, element);
    setNumericValue("margin_left", system, component, element, x, setNumericValue.parent_width);
    if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
}

export function SETDELTAMARGINLEFT(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(system.window.getComputedStyle(element)["margin-left"]);

    if (ratio > 0)
        SETMARGINLEFT(system, component, element, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, component, element, SETMARGINLEFT, start_x, dx, "margin-left");

    if (!LINKED) prepUIUpdate(system, component, element, "STYLE");

    return ratio;
}

export function SETMARGINTOP(system, component, element, x, LINKED = false) {
    resetMargin(system, component, element);
    setNumericValue("margin_top", system, component, element, x, setNumericValue.parent_height);
    if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
}

export function SETDELTAMARGINTOP(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(system.window.getComputedStyle(element)["margin-top"]);

    if (ratio > 0)
        SETMARGINTOP(system, component, element, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, component, element, SETMARGINTOP, start_x, dx, "margin-top");

    if (!LINKED) prepUIUpdate(system, component, element, "STYLE");

    return ratio;
}

export function SETMARGINRIGHT(system, component, element, x, LINKED = false) {
    resetMargin(system, component, element);
    setNumericValue("margin_right", system, component, element, x, setNumericValue.parent_height);
    if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
}


export function SETDELTAMARGINRIGHT(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(system.window.getComputedStyle(element)["margin-right"]);

    if (ratio > 0)
        SETMARGINRIGHT(system, component, element, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, component, element, SETMARGINRIGHT, start_x, dx, "margin-right");

    if (!LINKED) prepUIUpdate(system, component, element, "STYLE");

    return ratio;
}

export function SETMARGINBOTTOM(system, component, element, x, LINKED = false) {
    resetMargin(system, component, element);
    setNumericValue("margin_bottom", system, component, element, x, setNumericValue.parent_height);
    if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
}


export function SETDELTAMARGINBOTTOM(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(system.window.getComputedStyle(element)["margin-bottom"]);

    if (ratio > 0)
        SETMARGINBOTTOM(system, component, element, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, component, element, SETMARGINBOTTOM, start_x, dx, "margin-bottom");

    if (!LINKED) prepUIUpdate(system, component, element, "STYLE");

    return ratio;
}

export function RESIZEMARGINT(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINTOP(system, component, element, dy, 0, true);
    prepUIUpdate(system, component, element, "STYLE");
}

export function RESIZEMARGINR(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINRIGHT(system, component, element, -dx, 0, true);
    prepUIUpdate(system, component, element, "STYLE");
}

export function RESIZEMARGINL(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINLEFT(system, component, element, dx, 0, true);
    prepUIUpdate(system, component, element, "STYLE");
}

export function RESIZEMARGINB(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINBOTTOM(system, component, element, -dy, 0, true);
    prepUIUpdate(system, component, element, "STYLE");
}

export function RESIZEMARGINTL(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    let cache = CSSCacheFactory(system, component, element);

    if ((cache.cssflagsA & 1)) {
        SETDELTALEFT(system, component, element, dx, 0, true);
        SETDELTATOP(system, component, element, dy, 0, true);
    }

    SETDELTAMARGINLEFT(system, component, element, -dx, 0, true);
    SETDELTAMARGINTOP(system, component, element, -dy, 0, true);
    prepUIUpdate(system, component, element, "STYLE");
}

export function RESIZEMARGINTR(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;

    SETDELTAMARGINRIGHT(system, component, element, dx, 0, true);
    SETDELTAMARGINTOP(system, component, element, dy, 0, true);
    prepUIUpdate(system, component, element, "STYLE");
}

export function RESIZEMARGINBL(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINLEFT(system, component, element, dx, 0, true);
    SETDELTAMARGINBOTTOM(system, component, element, dy, 0, true);
    prepUIUpdate(system, component, element, "STYLE");
}

export function RESIZEMARGINBR(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINRIGHT(system, component, element, dx, 0, true);
    SETDELTAMARGINBOTTOM(system, component, element, dy, 0, true);
    prepUIUpdate(system, component, element, "STYLE");
}
