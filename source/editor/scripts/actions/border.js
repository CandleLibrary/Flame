import { css } from "../env.js";

const types = css.types;

import { setNumericValue, getRatio, setValue, getFirstPositionedAncestor, prepRebuild } from "./common";
import { SETDELTAWIDTH, SETDELTAHEIGHT } from "./dimensions";
import { CacheFactory } from "./cache";

function resetBorder(system, component, element) {
    return;
    let cache = CacheFactory(system, component, element);
    let css = cache.rules;
    if (css.props.border) {
        //Convert border value into 
        css.props.border = null;
    }
}

export function SETBORDERLEFT(system, component, element, x, LINKED = false) {
    resetBorder(system, component, element);
    let excess_x = setNumericValue("border_left_width", system, component, element, x, setNumericValue.parent_width);
    prepRebuild(system, component, element, LINKED);
    return { ratio: 0, excess_x };
}

export function SETBORDERRIGHT(system, component, element, x, LINKED = false) {
    resetBorder(system, component, element);
    let excess_y = setNumericValue("border_right_width", system, component, element, x, setNumericValue.parent_height);
    prepRebuild(system, component, element, LINKED);
    return { ratio: 0, excess_y };
}

export function SETBORDERTOP(system, component, element, x, LINKED = false) {
    resetBorder(system, component, element);
    let excess_y = setNumericValue("border_top_width", system, component, element, x, setNumericValue.parent_height);
    prepRebuild(system, component, element, LINKED);
    return { ratio: 0, excess_y };
}

export function SETBORDERBOTTOM(system, component, element, x, LINKED = false) {
    resetBorder(system, component, element);
    let excess_y = setNumericValue("border_bottom_width", system, component, element, x, setNumericValue.parent_height);
    prepRebuild(system, component, element, LINKED);
    return { ratio: 0, excess_y };
}

export function SETDELTABORDERLEFT(system, component, element, dx, ratio = 0, LINKED = false) {

    let start_x = parseFloat(system.window.getComputedStyle(element)["border-left-width"]),
        width = parseFloat(system.window.getComputedStyle(element)["width"]),
        excess_x = 0,
        excess_x_extra = 0;

    if (dx > 0 && width - dx < 0) {
        excess_x_extra = (width - dx);
        dx = width;
    }

    if (ratio > 0)
        excess_x = -SETBORDERLEFT(system, component, element, start_x + dx / ratio, true).excess_x;
    else
        excess_x = -getRatio(system, component, element, SETBORDERLEFT, start_x, dx, "border-left-width").excess;

    prepRebuild(system, component, element, LINKED);

    SETDELTAWIDTH(system, component, element, -dx - excess_x, 0, true);

    excess_x += excess_x_extra;

    return { excess_x };
}


export function SETDELTABORDERRIGHT(system, component, element, dx, ratio = 0, LINKED = false) {

    let start_x = parseFloat(system.window.getComputedStyle(element)["border-right-width"]),
        width = parseFloat(system.window.getComputedStyle(element)["width"]),
        excess_x = 0,
        excess_x_extra = 0;

    if (dx > 0 && width - dx < 0) {
        excess_x_extra = -(width - dx);
        dx = width;
    }

    if (ratio > 0)
        excess_x = SETBORDERRIGHT(system, component, element, start_x + dx / ratio, true).excess_x;
    else
        excess_x = getRatio(system, component, element, SETBORDERRIGHT, start_x, dx, "border-right-width").excess;

    prepRebuild(system, component, element, LINKED);

    SETDELTAWIDTH(system, component, element, -dx + excess_x, 0, true);

    excess_x += excess_x_extra;

    return { excess_x };
}




export function SETDELTABORDERTOP(system, component, element, dy, ratio = 0, LINKED = false) {
    let start_x = parseFloat(system.window.getComputedStyle(element)["border-top-width"]),
        height = parseFloat(system.window.getComputedStyle(element)["height"]),
        excess_y = 0,
        excess_y_extra = 0;

    if (dy > 0 && height - dy < 0) {
        excess_y_extra = (height - dy);
        dy = height;
    }

    if (ratio > 0)
        excess_y = -SETBORDERTOP(system, component, element, start_x + dy / ratio, true).excess_y;
    else
        excess_y = -getRatio(system, component, element, SETBORDERTOP, start_x, dy, "border-top-width").excess;

    prepRebuild(system, component, element, LINKED);

    SETDELTAHEIGHT(system, component, element, -dy - excess_y, 0, true);

    excess_y += excess_y_extra;

    return { excess_y };
}


export function SETDELTABORDERBOTTOM(system, component, element, dy, ratio = 0, LINKED = false) {
    let start_x = parseFloat(system.window.getComputedStyle(element)["border-bottom-width"]),
        height = parseFloat(system.window.getComputedStyle(element)["height"]),
        excess_y = 0,
        excess_y_extra = 0;

    if (dy > 0 && height - dy < 0) {
        excess_y_extra = -(height - dy);
        dy = height;
    }

    if (ratio > 0)
        excess_y = SETBORDERBOTTOM(system, component, element, start_x + dy / ratio, true).excess_y;
    else
        excess_y = getRatio(system, component, element, SETBORDERBOTTOM, start_x, dy, "border-bottom-width").excess;

    prepRebuild(system, component, element, LINKED);

    SETDELTAHEIGHT(system, component, element, -dy + excess_y, 0, true);

    excess_y += excess_y_extra;

    return { excess_y };
}

export function RESIZEBORDERT(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERTOP(system, component, element, dy, 0, true);
    prepRebuild(element);
}

export function RESIZEBORDERR(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERRIGHT(system, component, element, -dx, 0, true);
    prepRebuild(element);
}

export function RESIZEBORDERL(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERLEFT(system, component, element, dx, 0, true);
    prepRebuild(element);
}

export function RESIZEBORDERB(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERBOTTOM(system, component, element, -dy, 0, true);
    prepRebuild(element);
}

export function RESIZEBORDERTL(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    let { excess_x } = SETDELTABORDERLEFT(system, component, element, dx, 0, true);
    let { excess_y } = SETDELTABORDERTOP(system, component, element, dy, 0, true);

    prepRebuild(element);

    return { excess_x, excess_y };
}

export function RESIZEBORDERTR(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    let { excess_x } = SETDELTABORDERRIGHT(system, component, element, -dx, 0, true);
    let { excess_y } = SETDELTABORDERTOP(system, component, element, dy, 0, true);

    prepRebuild(element);

    return { excess_x, excess_y };
}

export function RESIZEBORDERBL(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    let { excess_x } = SETDELTABORDERLEFT(system, component, element, dx, 0, true);
    let { excess_y } = SETDELTABORDERBOTTOM(system, component, element, -dy, 0, true);

    prepRebuild(element);

    return { excess_x, excess_y };
}

export function RESIZEBORDERBR(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    let { excess_x } = SETDELTABORDERRIGHT(system, component, element, -dx, 0, true);
    let { excess_y } = SETDELTABORDERBOTTOM(system, component, element, -dy, 0, true);

    prepRebuild(element);

    return { excess_x, excess_y };
}

export function BORDERRADIUSTL(system, component, element, d) {
    setValue(system, component, element, "border_top_left_radius", new types.length(d, "px"));
    prepRebuild(element);
}

export function BORDERRADIUSTR(system, component, element, d) {

    setValue(system, component, element, "border_top_right_radius", new types.length(d, "px"));
    prepRebuild(element);
}

export function BORDERRADIUSBL(system, component, element, d) {
    setValue(system, component, element, "border_bottom_left_radius", new types.length(d, "px"));
    prepRebuild(element);
}

export function BORDERRADIUSBR(system, component, element, d) {
    setValue(system, component, element, "border_bottom_right_radius", new types.length(d, "px"));
    prepRebuild(element);
}
