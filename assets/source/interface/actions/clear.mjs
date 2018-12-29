import { CacheFactory } from "./cache";

export function CLEARLEFT(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.left) {
        if (KEEP_UNIQUE) cache.unique.addProp(`left:auto`);
        else css.props.left = "auto";
    }
    if (!LINKED) element.wick_node.setRebuild();
}
//clear top
export function CLEARTOP(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.top) {
        if (KEEP_UNIQUE) cache.unique.addProp(`top:auto`);
        else css.props.top = "auto";
    }
    if (!LINKED) element.wick_node.setRebuild();
}
//clear right
export function CLEARIGHT(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.right) {
        if (KEEP_UNIQUE) cache.unique.addProp(`right:auto`);
        else css.props.right = "auto";
    }
    if (!LINKED) element.wick_node.setRebuild();
}
//clear bottom
export function CLEABOTTOM(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.bottom) {
        if (KEEP_UNIQUE) cache.unique.addProp(`bottom:auto`);
        else css.props.bottom = "auto";
    }
    if (!LINKED) element.wick_node.setRebuild();
}

//clear margin-top
export function CLEARMARGINTOP(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.margin_left) {
        if (KEEP_UNIQUE) cache.unique.addProp(`margin-top:0`);
        else css.props.margin_left = 0;
    }
    if (!LINKED) element.wick_node.setRebuild();
}
//clear margin-left
export function CLEARMARGINLEFT(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.margin_left) {
        if (KEEP_UNIQUE) cache.unique.addProp(`margin-left:0`);
        else css.props.margin_left = 0;
    }
    if (!LINKED) element.wick_node.setRebuild();
}

//clear margin-right
export function CLEARMARGINRIGHT(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.margin_right) {
        if (KEEP_UNIQUE) cache.unique.addProp(`margin-right:0`);
        else css.props.margin_right = 0;
    }
    if (!LINKED) element.wick_node.setRebuild();
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