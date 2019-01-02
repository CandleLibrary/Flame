import {
    setNumericalValue,
    getRatio,
    ensureBlocklike,
    setRebuild
} from "./common";

import {
    CacheFactory
} from "./cache";

import {
    SETDELTAHEIGHT,
    SETDELTAWIDTH
} from "./dimensions";

function resetPadding(system, element, component) {
    let cache = CacheFactory(system, element, component);
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

export function SETPADDINGLEFT(system, element, component, x, LINKED = false) {
    resetPadding(system, element, component);
    ensureBlocklike(system, component, element);
    setNumericalValue("padding_left", system, element, component, x, setNumericalValue.parent_width);
    setRebuild(element, LINKED);
}

export function SETDELTAPADDINGLEFT(system, element, component, dx, ratio = 0, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let start_x = parseFloat(cache.computed.get("padding-left")) || 0;
    let width = (parseFloat(cache.computed.width) || 0) + start_x;

    if (dx > 0 && start_x + dx > width - 20) return ratio;

    if (start_x + dx > 0) {

        if (ratio > 0)
            SETPADDINGLEFT(system, element, component, start_x + dx / ratio, true);
        else {
            ensureBlocklike(system, component, element);
            ratio = getRatio(system, element, component, SETPADDINGLEFT, start_x, dx, "padding-left");
        }

        SETDELTAWIDTH(system, element, component, -dx, true);

        setRebuild(element, LINKED);
    }

    return ratio;
}

export function SETPADDINGTOP(system, element, component, x, LINKED = false) {
    resetPadding(system, element, component);
    ensureBlocklike(system, component, element);
    setNumericalValue("padding_top", system, element, component, x, setNumericalValue.parent_height);
    setRebuild(element, LINKED);
}

export function SETDELTAPADDINGTOP(system, element, component, dy, ratio = 0, LINKED = false) {
    let style = component.window.getComputedStyle(element);
    let start_y = parseFloat(style.paddingTop) || 0;
    let height = (parseFloat(style.height) || 0) + start_y;

    if (dy > 0 && start_y + dy > height - 20) return ratio;

    if (start_y + dy > 0) {
        if (ratio > 0)
            SETPADDINGTOP(system, element, component, start_y + dy / ratio, true);
        else {
            ensureBlocklike(system, component, element);
            ratio = getRatio(system, element, component, SETPADDINGTOP, start_y, dy, "padding-top");
        }

        SETDELTAHEIGHT(system, element, component, -dy, true);

        setRebuild(element, LINKED);
    }

    return ratio;
}

export function SETPADDINGRIGHT(system, element, component, x, LINKED = false) {
    resetPadding(system, element, component);
    ensureBlocklike(system, component, element);
    setNumericalValue("padding_right", system, element, component, x, setNumericalValue.parent_height);
    setRebuild(element, LINKED);
}


export function SETDELTAPADDINGRIGHT(system, element, component, dx, ratio = 0, LINKED = false) {
    let style = component.window.getComputedStyle(element);
    let start_x = parseFloat(style.paddingRight) || 0;
    let width = (parseFloat(style.width) || 0) + start_x;

    if (dx > 0 && start_x + dx > width - 20) return ratio;

    if (start_x + dx > 0) {

        if (ratio > 0)
            SETPADDINGRIGHT(system, element, component, start_x + dx / ratio, true);
        else {
            ensureBlocklike(system, component, element);
            ratio = getRatio(system, element, component, SETPADDINGRIGHT, start_x, dx, "padding-right");
        }

        SETDELTAWIDTH(system, element, component, -dx, true);
setRebuild(element,LINKED);
    }
    return ratio;
}

export function SETPADDINGBOTTOM(system, element, component, x, LINKED = false) {
    resetPadding(system, element, component);
    ensureBlocklike(system, component, element);
    setNumericalValue("padding_bottom", system, element, component, x, setNumericalValue.parent_height);
    setRebuild(element, LINKED);
}


export function SETDELTAPADDINGBOTTOM(system, element, component, dy, ratio = 0, LINKED = false) {
    let style = component.window.getComputedStyle(element);
    let start_y = parseFloat(style.paddingBottom) || 0;
    let height = (parseFloat(style.height) || 0) + start_y;

    if (dy > 0 && dy + start_y > height - 20) return ratio;

    if (start_y + dy >= 0) {
        if (ratio > 0)
            SETPADDINGBOTTOM(system, element, component, start_y + dy / ratio, true);
        else {
            ensureBlocklike(system, component, element);
            ratio = getRatio(system, element, component, SETPADDINGBOTTOM, start_y, dy, "padding-bottom");
        }

        SETDELTAHEIGHT(system, element, component, -dy, true);

    setRebuild(element,LINKED);}

    return ratio;
}

export function RESIZEPADDINGT(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGTOP(system, element, component, dy, 0, true);
    setRebuild(element, LINKED);
}

export function RESIZEPADDINGR(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGRIGHT(system, element, component, -dx, 0, true);
    setRebuild(element, LINKED);
}

export function RESIZEPADDINGL(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGLEFT(system, element, component, dx, 0, true);
    setRebuild(element, LINKED);
}

export function RESIZEPADDINGB(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGBOTTOM(system, element, component, -dy, 0, true);
    setRebuild(element, LINKED);
}

export function RESIZEPADDINGTL(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGLEFT(system, element, component, dx, 0, true);
    SETDELTAPADDINGTOP(system, element, component, dy, 0, true);
    setRebuild(element, LINKED);
}

export function RESIZEPADDINGTR(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGRIGHT(system, element, component, -dx, 0, true);
    SETDELTAPADDINGTOP(system, element, component, dy, 0, true);
    setRebuild(element, LINKED);
}

export function RESIZEPADDINGBL(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGLEFT(system, element, component, dx, 0, true);
    SETDELTAPADDINGBOTTOM(system, element, component, -dy, 0, true);
    setRebuild(element, LINKED);
}

export function RESIZEPADDINGBR(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGRIGHT(system, element, component, -dx, 0, true);
    SETDELTAPADDINGBOTTOM(system, element, component, -dy, 0, true);
    setRebuild(element, LINKED);
}