import {
    setNumericValue,
    getRatio,
    ensureBlocklike,
    prepRebuild
} from "./common";

import {
    CacheFactory
} from "./cache";

import {
    SETDELTAHEIGHT,
    SETDELTAWIDTH
} from "./dimensions";

function resetPadding(system, component, element) {
    let cache = CacheFactory(system, component, element);
    let css = cache.rules;
    if (css.props.padding) {
        let val = css.props.padding;

        if (!Array.isArray(val)) {
            cache.unique.addProp(`
                padding-top:${val};
                padding-right:${val};
                padding-bottom:${val};
                padding-left:${val};
            `)
        } else {
            switch (val.length) {
                case 2:
                    cache.unique.addProp(`
                        padding-top:${val[0]};
                        padding-right:${val[1]};
                        padding-bottom:${val[0]};
                        padding-left:${val[1]};
                    `)
                    break;
                case 3:
                    cache.unique.addProp(`
                        padding-top:${val[0]};
                        padding-right:${val[2]};
                        padding-bottom:${val[1]};
                        padding-left:${val[2]};
                    `)
                    break;
                case 4:
                    cache.unique.addProp(`
                        padding-top:${val[0]};
                        padding-right:${val[1]};
                        padding-bottom:${val[2]};
                        padding-left:${val[3]};
                    `)
                    break;
            }
        }
        //Convert padding value into 
        css.props.padding = null;
    }
}

export function SETPADDINGLEFT(system, component, element, x, LINKED = false) {
    resetPadding(system, component, element);
    ensureBlocklike(system, component, element);
    setNumericValue("padding_left", system, component, element, x, setNumericValue.parent_width);
    prepRebuild(element, LINKED);
}

export function SETDELTAPADDINGLEFT(system, component, element, dx, ratio = 0, LINKED = false) {
    let cache = CacheFactory(system, component, element);
    let start_x = parseFloat(cache.computed.get("padding-left")) || 0;
    let width = (parseFloat(cache.computed.width) || 0) + start_x;

    if (dx > 0 && start_x + dx > width - 20) return ratio;

    if (start_x + dx > 0) {

        if (ratio > 0)
            SETPADDINGLEFT(system, component, element, start_x + dx / ratio, true);
        else {
            ensureBlocklike(system, component, element);
            ratio = getRatio(system, component, element, SETPADDINGLEFT, start_x, dx, "padding-left");
        }

        SETDELTAWIDTH(system, component, element, -dx, true);

        prepRebuild(element, LINKED);
    }

    return ratio;
}

export function SETPADDINGTOP(system, component, element, x, LINKED = false) {
    resetPadding(system, component, element);
    ensureBlocklike(system, component, element);
    setNumericValue("padding_top", system, component, element, x, setNumericValue.parent_height);
    prepRebuild(element, LINKED);
}

export function SETDELTAPADDINGTOP(system, component, element, dy, ratio = 0, LINKED = false) {
    let style = component.window.getComputedStyle(element);
    let start_y = parseFloat(style.paddingTop) || 0;
    let height = (parseFloat(style.height) || 0) + start_y;

    if (dy > 0 && start_y + dy > height - 20) return ratio;

    if (start_y + dy > 0) {
        if (ratio > 0)
            SETPADDINGTOP(system, component, element, start_y + dy / ratio, true);
        else {
            ensureBlocklike(system, component, element);
            ratio = getRatio(system, component, element, SETPADDINGTOP, start_y, dy, "padding-top");
        }

        SETDELTAHEIGHT(system, component, element, -dy, true);

        prepRebuild(element, LINKED);
    }

    return ratio;
}

export function SETPADDINGRIGHT(system, component, element, x, LINKED = false) {
    resetPadding(system, component, element);
    ensureBlocklike(system, component, element);
    setNumericValue("padding_right", system, component, element, x, setNumericValue.parent_height);
    prepRebuild(element, LINKED);
}


export function SETDELTAPADDINGRIGHT(system, component, element, dx, ratio = 0, LINKED = false) {
    let style = component.window.getComputedStyle(element);
    let start_x = parseFloat(style.paddingRight) || 0;
    let width = (parseFloat(style.width) || 0) + start_x;

    if (dx > 0 && start_x + dx > width - 20) return ratio;

    if (start_x + dx > 0) {

        if (ratio > 0)
            SETPADDINGRIGHT(system, component, element, start_x + dx / ratio, true);
        else {
            ensureBlocklike(system, component, element);
            ratio = getRatio(system, component, element, SETPADDINGRIGHT, start_x, dx, "padding-right");
        }

        SETDELTAWIDTH(system, component, element, -dx, true);
prepRebuild(element,LINKED);
    }
    return ratio;
}

export function SETPADDINGBOTTOM(system, component, element, x, LINKED = false) {
    resetPadding(system, component, element);
    ensureBlocklike(system, component, element);
    setNumericValue("padding_bottom", system, component, element, x, setNumericValue.parent_height);
    prepRebuild(element, LINKED);
}


export function SETDELTAPADDINGBOTTOM(system, component, element, dy, ratio = 0, LINKED = false) {
    let style = component.window.getComputedStyle(element);
    let start_y = parseFloat(style.paddingBottom) || 0;
    let height = (parseFloat(style.height) || 0) + start_y;

    if (dy > 0 && dy + start_y > height - 20) return ratio;

    if (start_y + dy >= 0) {
        if (ratio > 0)
            SETPADDINGBOTTOM(system, component, element, start_y + dy / ratio, true);
        else {
            ensureBlocklike(system, component, element);
            ratio = getRatio(system, component, element, SETPADDINGBOTTOM, start_y, dy, "padding-bottom");
        }

        SETDELTAHEIGHT(system, component, element, -dy, true);

    prepRebuild(element,LINKED);}

    return ratio;
}

export function RESIZEPADDINGT(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGTOP(system, component, element, dy, 0, true);
    prepRebuild(element, LINKED);
}

export function RESIZEPADDINGR(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGRIGHT(system, component, element, -dx, 0, true);
    prepRebuild(element, LINKED);
}

export function RESIZEPADDINGL(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGLEFT(system, component, element, dx, 0, true);
    prepRebuild(element, LINKED);
}

export function RESIZEPADDINGB(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGBOTTOM(system, component, element, -dy, 0, true);
    prepRebuild(element, LINKED);
}

export function RESIZEPADDINGTL(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGLEFT(system, component, element, dx, 0, true);
    SETDELTAPADDINGTOP(system, component, element, dy, 0, true);
    prepRebuild(element, LINKED);
}

export function RESIZEPADDINGTR(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGRIGHT(system, component, element, -dx, 0, true);
    SETDELTAPADDINGTOP(system, component, element, dy, 0, true);
    prepRebuild(element, LINKED);
}

export function RESIZEPADDINGBL(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGLEFT(system, component, element, dx, 0, true);
    SETDELTAPADDINGBOTTOM(system, component, element, -dy, 0, true);
    prepRebuild(element, LINKED);
}

export function RESIZEPADDINGBR(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGRIGHT(system, component, element, -dx, 0, true);
    SETDELTAPADDINGBOTTOM(system, component, element, -dy, 0, true);
    prepRebuild(element, LINKED);
}
