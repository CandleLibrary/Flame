import { CacheFactory } from "./cache";

export function CLEARLEFT(system, component, element, LINKED = false) {
    let cache = CacheFactory(system, component, element);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.left) {
        if (KEEP_UNIQUE) cache.setCSSProp(`left:auto`);
        else css.props.left = "auto";
    }
    if (!LINKED) element.wick_node.prepRebuild();
}
//clear top
export function CLEARTOP(system, component, element, LINKED = false) {
    let cache = CacheFactory(system, component, element);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.top) {
        if (KEEP_UNIQUE) cache.setCSSProp(`top:auto`);
        else css.props.top = "auto";
    }
    if (!LINKED) element.wick_node.prepRebuild();
}
//clear right
export function CLEARIGHT(system, component, element, LINKED = false) {
    let cache = CacheFactory(system, component, element);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.right) {
        if (KEEP_UNIQUE) cache.setCSSProp(`right:auto`);
        else css.props.right = "auto";
    }
    if (!LINKED) element.wick_node.prepRebuild();
}
//clear bottom
export function CLEABOTTOM(system, component, element, LINKED = false) {
    let cache = CacheFactory(system, component, element);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.bottom) {
        if (KEEP_UNIQUE) cache.setCSSProp(`bottom:auto`);
        else css.props.bottom = "auto";
    }
    if (!LINKED) element.wick_node.prepRebuild();
}

//clear margin-top
export function CLEARMARGINTOP(system, component, element, LINKED = false) {
    let cache = CacheFactory(system, component, element);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.margin_left) {
        if (KEEP_UNIQUE) cache.setCSSProp(`margin-top:0`);
        else css.props.margin_left = 0;
    }
    if (!LINKED) element.wick_node.prepRebuild();
}
//clear margin-left
export function CLEARMARGINLEFT(system, component, element, LINKED = false) {
    let cache = CacheFactory(system, component, element);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.margin_left) {
        if (KEEP_UNIQUE) cache.setCSSProp(`margin-left:0`);
        else css.props.margin_left = 0;
    }
    if (!LINKED) element.wick_node.prepRebuild();
}

//clear margin-right
export function CLEARMARGINRIGHT(system, component, element, LINKED = false) {
    let cache = CacheFactory(system, component, element);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.margin_right) {
        if (KEEP_UNIQUE) cache.setCSSProp(`margin-right:0`);
        else css.props.margin_right = 0;
    }
    if (!LINKED) element.wick_node.prepRebuild();
}
//clear margin-bottom
//clear padding-left
//clear padding-right
//clear padding-bottom
//clear padding-top
//clear border-left
//clear border-right
//clear border-bottom
//clear border-top
