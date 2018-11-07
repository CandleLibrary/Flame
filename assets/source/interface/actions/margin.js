import { setNumericalValue, getRatio } from "./common";
import {SETDELTALEFT, SETDELTATOP} from "./position";

import { CacheFactory } from "./cache";

function resetMargin(system, element, component) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    if (css.props.margin) {
        //Convert margin value into 
        css.props.margin = null;
    }
}

export function SETMARGINLEFT(system, element, component, x, LINKED = false) {
    resetMargin(system, element, component);
    setNumericalValue("margin_left", system, element, component, x, setNumericalValue.parent_width);
    if (!LINKED) element.wick_node.setRebuild();
}

export function SETDELTAMARGINLEFT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["margin-left"]);

    if (ratio > 0)
        SETMARGINLEFT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETMARGINLEFT, start_x, dx, "margin-left");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

export function SETMARGINTOP(system, element, component, x, LINKED = false) {
    resetMargin(system, element, component);
    setNumericalValue("margin_top", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}

export function SETDELTAMARGINTOP(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["margin-top"]);

    if (ratio > 0)
        SETMARGINTOP(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETMARGINTOP, start_x, dx, "margin-top");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

export function SETMARGINRIGHT(system, element, component, x, LINKED = false) {
    resetMargin(system, element, component);
    setNumericalValue("margin_right", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}


export function SETDELTAMARGINRIGHT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["margin-right"]);

    if (ratio > 0)
        SETMARGINRIGHT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETMARGINRIGHT, start_x, dx, "margin-right");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

export function SETMARGINBOTTOM(system, element, component, x, LINKED = false) {
    resetMargin(system, element, component);
    setNumericalValue("margin_bottom", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}


export function SETDELTAMARGINBOTTOM(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["margin-bottom"]);

    if (ratio > 0)
        SETMARGINBOTTOM(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETMARGINBOTTOM, start_x, dx, "margin-bottom");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

export function RESIZEMARGINT(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

export function RESIZEMARGINR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINRIGHT(system, element, component, -dx, 0, true);
    element.wick_node.setRebuild();
}

export function RESIZEMARGINL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINLEFT(system, element, component, dx, 0, true);
    element.wick_node.setRebuild();
}

export function RESIZEMARGINB(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINBOTTOM(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
}

export function RESIZEMARGINTL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    let cache = CacheFactory(system, element, component);

    if((cache.cssflagsA & 1)){
        SETDELTALEFT(system, element, component, dx, 0, true);
        SETDELTATOP(system, element, component, dy, 0, true);
    }

    SETDELTAMARGINLEFT(system, element, component, -dx, 0, true);
    SETDELTAMARGINTOP(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
}

export function RESIZEMARGINTR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINRIGHT(system, element, component, dx, 0, true);
    SETDELTAMARGINTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

export function RESIZEMARGINBL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINLEFT(system, element, component, dx, 0, true);
    SETDELTAMARGINBOTTOM(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

export function RESIZEMARGINBR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINRIGHT(system, element, component, dx, 0, true);
    SETDELTAMARGINBOTTOM(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}