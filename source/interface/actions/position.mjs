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

import * as css from "@candlefw/css";

const types = css.types;

/***************************************************************************************/
/********************************** POSITION SUB ACTIONS *************************************/
/***************************************************************************************/

export function SETLEFT(system, component, element, x, LINKED = false) {
    let cache = CacheFactory(system, component, element),
        excess = 0;
        
    if (x.type) {
        cache.rules.props.left.val[0] = x;
    } else {
        if (cache.cssflagsA & 1)
            excess = setNumericValue("left", system, component, element, x, setNumericValue.parent_width, true);
        else
            excess = setNumericValue("left", system, component, element, x, setNumericValue.positioned_ancestor_width, true);
    }

    prepRebuild(element, LINKED);

    return { excess_x: excess };
}

export function SETRIGHT(system, component, element, x, LINKED = false) {
    let cache = CacheFactory(system, component, element),
        excess = 0;

    if (cache.cssflagsA & 1)
        excess = setNumericValue("right", system, component, element, x, setNumericValue.parent_width, true);
    else
        excess = setNumericValue("right", system, component, element, x, setNumericValue.positioned_ancestor_width, true);

    prepRebuild(element, LINKED);

    return { excess_x: excess };
}

export function SETTOP(system, component, element, y, LINKED = false) {
    let cache = CacheFactory(system, component, element),
        excess = 0;

    if (y.type) {
        cache.rules.props.top.val[0] = y;
    } else {
        if (cache.cssflagsA & 1)
            excess = setNumericValue("top", system, component, element, y, setNumericValue.parent_height, true);
        else
            excess = setNumericValue("top", system, component, element, y, setNumericValue.positioned_ancestor_height, true);
    }

    prepRebuild(element, LINKED);

    return { excess_y: excess };
}

export function SETBOTTOM(system, component, element, y, LINKED = false) {
    let cache = CacheFactory(system, component, element),
        excess = 0;

    if (cache.cssflagsA & 1)
        excess = setNumericValue("bottom", system, component, element, y, setNumericValue.parent_height, true);
    else
        excess = setNumericValue("bottom", system, component, element, y, setNumericValue.positioned_ancestor_height, true);

    prepRebuild(element, LINKED);

    return { excess_y: excess };
}

/***************************************************************************************/
/********************************** DELTA SUB ACTIONS *************************************/
/***************************************************************************************/

export function SETDELTALEFT(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).left),
        excess_x = 0;

    start_x = isNaN(start_x) ? 0 : start_x;

    if (ratio > 0)
        excess_x = SETLEFT(system, component, element, start_x + dx / ratio, true).excess_x;
    else {
        let { excess, ratio: r } = getRatio(system, component, element, SETLEFT, start_x, dx, "left", true);
        ratio = r;
        excess_x = excess;
    }

    prepRebuild(element, LINKED);

    return { ratio, excess_x };
}

export function SETDELTARIGHT(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).right),
        excess_x = 0;

    start_x = isNaN(start_x) ? 0 : start_x;

    if (ratio > 0)
        excess_x = SETRIGHT(system, component, element, start_x + dx / ratio, true).excess_x;
    else {
        let { excess, ratio: r } = getRatio(system, component, element, SETRIGHT, start_x, dx, "right", true);
        ratio = r;
        excess_x = excess;
    }

    prepRebuild(element, LINKED);

    return { ratio, excess_x };
}


export function SETDELTATOP(system, component, element, dy, ratio = 0, LINKED = false, origin = undefined) {
    let start_x = parseFloat(component.window.getComputedStyle(element).top),
        excess_y = 0;

    start_x = isNaN(start_x) ? 0 : start_x;

    if (ratio > 0)
        excess_y = SETTOP(system, component, element, start_x + dy / ratio, true).excess_y;
    else {
        let { excess, ratio: r } = getRatio(system, component, element, SETTOP, start_x, dy, "top", true, origin);
        ratio = r;
        excess_y = excess;
    }

    prepRebuild(element, LINKED);

    return { ratio, excess_y };
}
export function SETDELTABOTTOM(system, component, element, dy, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).bottom),
        excess_y = 0;

    start_x = isNaN(start_x) ? 0 : start_x;

    if (ratio > 0)
        excess_y = SETBOTTOM(system, component, element, start_x + dy / ratio, true).excess_y;
    else {
        let { excess, r: ratio } = getRatio(system, component, element, SETBOTTOM, start_x, dy, "bottom", true);
        ratio = r;
        excess_y = excess;
    }

    prepRebuild(element, LINKED);

    return { ratio, excess_y };
}

/***************************************************************************************/
/********************************** RESIZE ACTIONS *************************************/
/***************************************************************************************/


export function RESIZEL(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.x += dx, component.width -= dx);
    let cache = CacheFactory(system, component, element),
        excess_x = 0
    switch (cache.move_hori_type) {
        case "left right":
            excess_x = SETDELTALEFT(system, component, element, dx, 0, true).excess_x;
            break;
        case "left":
            excess_x = SETDELTAWIDTH(system, component, element, -dx, 0, true).excess_x;
            SETDELTALEFT(system, component, element, dx + excess_x, 0, true);
            break;
        case "right":
            excess_x = SETDELTAWIDTH(system, component, element, -dx, 0, true).excess_x;
            break;
    }

    prepRebuild(element, false);

    return { excess_x };
}

export function RESIZER(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.width += dx);
    let cache = CacheFactory(system, component, element),
        excess_x = 0;

    switch (cache.move_hori_type) {
        case "left right":
            excess_x = -SETDELTARIGHT(system, component, element, -dx, 0, true).excess_x;
            break;
        case "right":
            excess_x = -SETDELTAWIDTH(system, component, element, -dx, 0, true).excess_x;
            SETDELTARIGHT(system, component, element, -dx - excess_x, 0, true);
            break;
        case "left":
            excess_x = -SETDELTAWIDTH(system, component, element, dx, 0, true).excess_x;
            break;
    }

    prepRebuild(element, false);

    return { excess_x };
}

export function RESIZET(system, component, element, dx, dy, IS_COMPONENT) {
    
    if (IS_COMPONENT) return (component.y += dy, component.height -= dy);
    let cache = CacheFactory(system, component, element),
        excess_y = 0;
    switch (cache.move_vert_type) {
        case "top bottom":
            excess_y = SETDELTATOP(system, component, element, dy, 0, true).excess_y;
        case "top":
            let origin = element.getBoundingClientRect().top / system.ui.interface.transform.scale;
            let out = SETDELTAHEIGHT(system, component, element, -dy, -1, true);
            excess_y = out.excess_y;
            SETDELTATOP(system, component, element, dy+out.excess_y, 1/(out.ratio || 1), true);
            break;
        case "bottom":
            excess_y = SETDELTAHEIGHT(system, component, element, -dy, 0, true).excess_y;
            break;
    }

    prepRebuild(element, false);

    return { excess_y };
}

export function RESIZEB(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.height += dy);
    let cache = CacheFactory(system, component, element),
        excess_y = 0;
    switch (cache.move_vert_type) {
        case "top bottom":
            excess_y = -SETDELTAHEIGHT(system, component, element, dy, 0, true).excess_y;
            //SETDELTABOTTOM(system, component, element, -dy, ratio * 0.5, true);
            break;
        case "bottom":
            excess_y = -SETDELTAHEIGHT(system, component, element, dy, 0, true).excess_y;
            SETDELTABOTTOM(system, component, element, -dy - excess_y, 0, true);
            break;
        case "top":
            excess_y = -SETDELTAHEIGHT(system, component, element, dy, 0, true).excess_y;
            break;
    }

    prepRebuild(element, false);

    return { excess_y }
}

export function SUBRESIZEB(system, component, element, dx, dy, IS_COMPONENT) {
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

/***************************************************************************************************/
/********************************** COMBINATION RESIZE ACTIONS *************************************/
/***************************************************************************************************/

export function RESIZETL(system, component, element, dx, dy, IS_COMPONENT) {
    let { excess_x } = RESIZEL(system, component, element, dx, dy, IS_COMPONENT);
    let { excess_y } = RESIZET(system, component, element, dx, dy, IS_COMPONENT);

    if (!IS_COMPONENT)
        prepRebuild(element, false);

    return { excess_x, excess_y };
}

export function RESIZETR(system, component, element, dx, dy, IS_COMPONENT) {

    let { excess_x } = RESIZER(system, component, element, dx, dy, IS_COMPONENT);
    let { excess_y } = RESIZET(system, component, element, dx, dy, IS_COMPONENT);
    if (!IS_COMPONENT)
        prepRebuild(element, false);

    return { excess_x, excess_y };
}

export function RESIZEBL(system, component, element, dx, dy, IS_COMPONENT) {

    let { excess_x } = RESIZEL(system, component, element, dx, dy, IS_COMPONENT);
    let { excess_y } = RESIZEB(system, component, element, dx, dy, IS_COMPONENT);
    if (!IS_COMPONENT)
        prepRebuild(element, false);

    return { excess_x, excess_y  };
}

export function RESIZEBR(system, component, element, dx, dy, IS_COMPONENT) {
    let { excess_x } = RESIZER(system, component, element, dx, dy, IS_COMPONENT);
    let { excess_y } = RESIZEB(system, component, element, dx, dy, IS_COMPONENT);
    if (!IS_COMPONENT)
        prepRebuild(element, false);

    return { excess_x, excess_y };
}
