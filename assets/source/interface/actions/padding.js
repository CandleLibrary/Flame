import {
    setNumericalValue,
    getRatio
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
    setNumericalValue("padding_left", system, element, component, x, setNumericalValue.parent_width);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

export function SETDELTAPADDINGLEFT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["padding-left"]);

    if (ratio > 0)
        SETPADDINGLEFT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETPADDINGLEFT, start_x, dx, "padding-left");

    SETDELTAWIDTH(system, element, component, -dx, true);

    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();

    return ratio;
}

export function SETPADDINGTOP(system, element, component, x, LINKED = false) {
    resetPadding(system, element, component);
    setNumericalValue("padding_top", system, element, component, x, setNumericalValue.parent_height);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

export function SETDELTAPADDINGTOP(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["padding-top"]);

    if (ratio > 0)
        SETPADDINGTOP(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETPADDINGTOP, start_x, dx, "padding-top");

    SETDELTAHEIGHT(system, element, component, -dx, true);

    element.wick_node.setRebuild();

    if (!LINKED) element.wick_node.rebuild();

    return ratio;
}

export function SETPADDINGRIGHT(system, element, component, x, LINKED = false) {
    resetPadding(system, element, component);
    setNumericalValue("padding_right", system, element, component, x, setNumericalValue.parent_height);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}


export function SETDELTAPADDINGRIGHT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["padding-right"]);

    if (ratio > 0)
        SETPADDINGRIGHT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETPADDINGRIGHT, start_x, dx, "padding-right");

    SETDELTAWIDTH(system, element, component, -dx, true);

    element.wick_node.setRebuild();
    
    if (!LINKED) element.wick_node.rebuild();

    return ratio;
}

export function SETPADDINGBOTTOM(system, element, component, x, LINKED = false) {
    resetPadding(system, element, component);
    setNumericalValue("padding_bottom", system, element, component, x, setNumericalValue.parent_height);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}


export function SETDELTAPADDINGBOTTOM(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["padding-bottom"]);

    if (ratio > 0)
        SETPADDINGBOTTOM(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETPADDINGBOTTOM, start_x, dx, "padding-bottom");

    SETDELTAHEIGHT(system, element, component, -dx, true);

    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
    
    return ratio;
}

export function RESIZEPADDINGT(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

export function RESIZEPADDINGR(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGRIGHT(system, element, component, -dx, 0, true);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

export function RESIZEPADDINGL(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGLEFT(system, element, component, dx, 0, true);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

export function RESIZEPADDINGB(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGBOTTOM(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

export function RESIZEPADDINGTL(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGLEFT(system, element, component, dx, 0, true);
    SETDELTAPADDINGTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

export function RESIZEPADDINGTR(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGRIGHT(system, element, component, -dx, 0, true);
    SETDELTAPADDINGTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

export function RESIZEPADDINGBL(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGLEFT(system, element, component, dx, 0, true);
    SETDELTAPADDINGBOTTOM(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

export function RESIZEPADDINGBR(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGRIGHT(system, element, component, -dx, 0, true);
    SETDELTAPADDINGBOTTOM(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}