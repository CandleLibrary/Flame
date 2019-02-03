import {
    setNumericValue,
    getRatio,
    prepRebuild
} from "./common";
import {
    CacheFactory
} from "./cache";
import {
    SETDELTAWIDTH,
    SETDELTAHEIGHT
} from "./dimensions";
import css from "@candlefw/css";


const types = css.types;

export function SETLEFT(system, component, element, x, LINKED = false) {
    let cache = CacheFactory(system, component, element);

    if (x.type) {
        cache.rules.props.left = x;
    } else {
        if (cache.cssflagsA & 1)
            setNumericValue("left", system, component, element, x, setNumericValue.parent_width);
        else
            setNumericValue("left", system, component, element, x, setNumericValue.positioned_ancestor_width);
    }

    prepRebuild(element, LINKED);
}

export function SETTOP(system, component, element, x, LINKED = false) {
    let cache = CacheFactory(system, component, element);

    if (x.type) {
        cache.rules.props.top = x;
    } else {
        if (cache.cssflagsA & 1)
            setNumericValue("top", system, component, element, x, setNumericValue.parent_height);
        else
            setNumericValue("top", system, component, element, x, setNumericValue.positioned_ancestor_height);
    }

    prepRebuild(element, LINKED);
}
export function SETRIGHT(system, component, element, x, LINKED = false) {
    let cache = CacheFactory(system, component, element);

    if (cache.cssflagsA & 1)
        setNumericValue("right", system, component, element, x, setNumericValue.parent_width);
    else
        setNumericValue("right", system, component, element, x, setNumericValue.positioned_ancestor_width);

    prepRebuild(element, LINKED);
}

export function SETBOTTOM(system, component, element, x, LINKED = false) {
    let cache = CacheFactory(system, component, element);

    if (cache.cssflagsA & 1)
        setNumericValue("bottom", system, component, element, x, setNumericValue.parent_height);
    else
        setNumericValue("bottom", system, component, element, x, setNumericValue.positioned_ancestor_height);

    prepRebuild(element, LINKED);
}

export function SETDELTALEFT(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).left);

    start_x = isNaN(start_x) ? 0 : start_x;

    if (ratio > 0)
        SETLEFT(system, component, element, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, component, element, SETLEFT, start_x, dx, "left");

    prepRebuild(element, LINKED);

    return ratio;
}

export function SETDELTATOP(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).top);

    start_x = isNaN(start_x) ? 0 : start_x;

    if (ratio > 0)
        SETTOP(system, component, element, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, component, element, SETTOP, start_x, dx, "top");

    prepRebuild(element, LINKED);

    return ratio;
}

export function SETDELTARIGHT(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).right);

    start_x = isNaN(start_x) ? 0 : start_x;

    if (ratio > 0)
        SETRIGHT(system, component, element, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, component, element, SETRIGHT, start_x, dx, "right");

    prepRebuild(element, LINKED);

    return ratio;
}

export function SETDELTABOTTOM(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).bottom);

    start_x = isNaN(start_x) ? 0 : start_x;
    
    if (ratio > 0)
        SETBOTTOM(system, component, element, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, component, element, SETBOTTOM, start_x, dx, "bottom");


    prepRebuild(element, LINKED);

    return ratio;
}

export function RESIZET(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.y += dy, component.height -= dy);
    let cache = CacheFactory(system, component, element);
    switch (cache.move_vert_type) {
        case "top bottom":
            SETDELTATOP(system, component, element, dy, 0, true);
        case "top":
            SETDELTATOP(system, component, element, dy, 0, true);
            SETDELTAHEIGHT(system, component, element, -dy, 0, true);
            break;
        case "bottom":
            SETDELTAHEIGHT(system, component, element, -dy, 0, true);
            break;
    }
    element.wick_node.prepRebuild();
}

export function RESIZER(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.width += dx);
    let cache = CacheFactory(system, component, element);
    switch (cache.move_hori_type) {
        case "left right":
            SETDELTARIGHT(system, component, element, -dx, 0, true);
            break;
        case "left":
            SETDELTAWIDTH(system, component, element, dx, 0, true);
            break;
        case "right":
            SETDELTARIGHT(system, component, element, -dx, 0, true);
            SETDELTAWIDTH(system, component, element, -dx, 0, true);
            break;
    }
    element.wick_node.prepRebuild();
}

export function RESIZEL(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.x += dx, component.width -= dx);
    let cache = CacheFactory(system, component, element);
    switch (cache.move_hori_type) {
        case "left right":
            SETDELTALEFT(system, component, element, dx, 0, true);
            break;
        case "left":
            SETDELTALEFT(system, component, element, dx, 0, true);
            SETDELTAWIDTH(system, component, element, -dx, 0, true);
            break;
        case "right":
            SETDELTAWIDTH(system, component, element, -dx, 0, true);
            break;
    }
    element.wick_node.prepRebuild();
}

function SUBRESIZEB(system, component, element, dx, dy, ratio){
    let cache = CacheFactory(system, component, element);
    switch (cache.move_vert_type) {
        case "top bottom":
            SETDELTABOTTOM(system, component, element, -dy, ratio * 0.5, true);
            SETDELTAHEIGHT(system, component, element, dy, ratio * 0.5, true);
            break;
        case "top":
            SETDELTAHEIGHT(system, component, element, dy, ratio, true);
            break;
        case "bottom":
            SETDELTABOTTOM(system, component, element, -dy, ratio * 0.5, true);
            SETDELTAHEIGHT(system, component, element, dy, ratio * 0.5, true);
            break;
    }

    element.wick_node.prepRebuild();
    element.wick_node.rebuild();
}

export function RESIZEB(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.height += dy);
    let cache = CacheFactory(system, component, element);
    //get the bottom value of the element;

    if (cache.valueB == 0) {
        let rect = element.getBoundingClientRect();
        let bottom = rect.y + rect.height;
        SUBRESIZEB(system, component, element, dx, dy, 1)
        rect = element.getBoundingClientRect();
        let bottom2 = rect.y + rect.height;
        if (bottom2 - bottom !== dy) {
            let ratio = ((bottom2 - bottom) / dy);
            let diff = dy / ratio;
            if (diff !== 0) {
                SUBRESIZEB(system, component, element, dx, -diff, ratio);
                cache.valueB = ratio;
            }
        }
    } else
        SUBRESIZEB(system, component, element, dx, dy, cache.valueB);
}

export function RESIZETL(system, component, element, dx, dy, IS_COMPONENT) {
    RESIZEL(system, component, element, dx, dy, IS_COMPONENT);
    RESIZET(system, component, element, dx, dy, IS_COMPONENT);
    if (IS_COMPONENT) return;
    element.wick_node.prepRebuild();
}

export function RESIZETR(system, component, element, dx, dy, IS_COMPONENT) {
    RESIZER(system, component, element, dx, dy, IS_COMPONENT);
    RESIZET(system, component, element, dx, dy, IS_COMPONENT);
    if (IS_COMPONENT) return;
    element.wick_node.prepRebuild();
}

export function RESIZEBL(system, component, element, dx, dy, IS_COMPONENT) {
    RESIZEL(system, component, element, dx, dy, IS_COMPONENT);
    RESIZEB(system, component, element, dx, dy, IS_COMPONENT);
    if (IS_COMPONENT) return;
    element.wick_node.prepRebuild();
}

export function RESIZEBR(system, component, element, dx, dy, IS_COMPONENT) {
    RESIZER(system, component, element, dx, dy, IS_COMPONENT);
    RESIZEB(system, component, element, dx, dy, IS_COMPONENT);
    if (IS_COMPONENT) return;
    element.wick_node.prepRebuild();
}
