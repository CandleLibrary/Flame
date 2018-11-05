import { setNumericalValue, getRatio } from "./common";
import { CacheFactory } from "./cache";
import { SETDELTAWIDTH, SETDELTAHEIGHT } from "./dimensions"

export function SETLEFT(system, element, component, x, LINKED = false) {
    let cache = CacheFactory(system, element, component);

    if (cache.cssflagsA & 1)
        setNumericalValue("left", system, element, component, x, setNumericalValue.parent_width);
    else
        setNumericalValue("left", system, element, component, x, setNumericalValue.positioned_ancestor_width);


    if (!LINKED) element.wick_node.setRebuild();
}

export function SETTOP(system, element, component, x, LINKED = false) {
    let cache = CacheFactory(system, element, component);

    if (cache.cssflagsA & 1)
        setNumericalValue("top", system, element, component, x, setNumericalValue.parent_height);
    else
        setNumericalValue("top", system, element, component, x, setNumericalValue.positioned_ancestor_height);

    if (!LINKED) element.wick_node.setRebuild();
}
export function SETRIGHT(system, element, component, x, LINKED = false) {
    let cache = CacheFactory(system, element, component);

    if (cache.cssflagsA & 1)
        setNumericalValue("right", system, element, component, x, setNumericalValue.parent_width);
    else
        setNumericalValue("right", system, element, component, x, setNumericalValue.positioned_ancestor_width);

    if (!LINKED) element.wick_node.setRebuild();
}

export function SETBOTTOM(system, element, component, x, LINKED = false) {
    let cache = CacheFactory(system, element, component);

    if (cache.cssflagsA & 1)
        setNumericalValue("bottom", system, element, component, x, setNumericalValue.parent_height);
    else
        setNumericalValue("bottom", system, element, component, x, setNumericalValue.positioned_ancestor_height);

    if (!LINKED) element.wick_node.setRebuild();
}

export function SETDELTALEFT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).left);

    if (ratio > 0)
        SETLEFT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETLEFT, start_x, dx, "left");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

export function SETDELTATOP(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).top);

    if (ratio > 0)
        SETTOP(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETTOP, start_x, dx, "top");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

export function SETDELTARIGHT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).right);

    if (ratio > 0)
        SETRIGHT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETRIGHT, start_x, dx, "right");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

export function SETDELTABOTTOM(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).bottom);

    if (ratio > 0)
        SETBOTTOM(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETBOTTOM, start_x, dx, "bottom");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

export function RESIZET(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    let cache = CacheFactory(system, element, component);
    switch (cache.move_vert_type) {
        case "top bottom":
            SETDELTATOP(system, element, component, dy, 0, true);
        case "top":
            SETDELTATOP(system, element, component, dy, 0, true);
            SETDELTAHEIGHT(system, element, component, -dy, 0, true);
            break;
        case "bottom":
            SETDELTAHEIGHT(system, element, component, -dy, 0, true);
            break;
    }
    element.wick_node.setRebuild();
}

export function RESIZER(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    let cache = CacheFactory(system, element, component);
    switch (cache.move_hori_type) {
        case "left right":
            SETDELTARIGHT(system, element, component, -dx, 0, true);
            break;
        case "left":
            SETDELTAWIDTH(system, element, component, -dx, 0, true);
            break;
        case "right":
            SETDELTARIGHT(system, element, component, -dx, 0, true);
            SETDELTAWIDTH(system, element, component, -dx, 0, true);
            break;
    }
    element.wick_node.setRebuild();
}

export function RESIZEL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    let cache = CacheFactory(system, element, component);
    switch (cache.move_hori_type) {
        case "left right":
            SETDELTALEFT(system, element, component, dx, 0, true);
            break;
        case "left":
            SETDELTALEFT(system, element, component, dx, 0, true);
            SETDELTAWIDTH(system, element, component, -dx, 0, true);
            break;
        case "right":
            SETDELTAWIDTH(system, element, component, -dx, 0, true);
            break;
    }
    element.wick_node.setRebuild();
}

export function RESIZEB(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    let cache = CacheFactory(system, element, component);
    switch (cache.move_vert_type) {
        case "top bottom":
            SETDELTABOTTOM(system, element, component, -dy, 0, true);
        case "top":
            SETDELTAHEIGHT(system, element, component, dy, 0, true);
            break;
        case "bottom":
            SETDELTABOTTOM(system, element, component, -dy, 0, true);
            SETDELTAHEIGHT(system, element, component, dy, 0, true);
            break;
    }
    element.wick_node.setRebuild();
}

export function RESIZETL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    RESIZEL(system, element, component, dx, dy, IS_COMPONENT);
    RESIZET(system, element, component, dx, dy, IS_COMPONENT);
    element.wick_node.setRebuild();
}

export function RESIZETR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    RESIZER(system, element, component, dx, dy, IS_COMPONENT);
    RESIZET(system, element, component, dx, dy, IS_COMPONENT);
    element.wick_node.setRebuild();
}

export function RESIZEBL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    RESIZEL(system, element, component, dx, dy, IS_COMPONENT);
    RESIZEB(system, element, component, dx, dy, IS_COMPONENT);
    element.wick_node.setRebuild();
}

export function RESIZEBR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    RESIZER(system, element, component, dx, dy, IS_COMPONENT);
    RESIZEB(system, element, component, dx, dy, IS_COMPONENT);
    element.wick_node.setRebuild();
}