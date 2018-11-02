export function CLEARLEFT(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.settings.KEEP_UNIQUE;
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
    let KEEP_UNIQUE = system.project.settings.KEEP_UNIQUE;
    if (css.props.top) {
        if (KEEP_UNIQUE) cache.unique.addProp(`top:auto`);
        else css.props.top = "auto";
    }
    if (!LINKED) element.wick_node.setRebuild();
}
//clear right
//clear bottom

//clear margin-top
export function CLEARMARGINTOP(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.settings.KEEP_UNIQUE;
    if (css.props.margin_left) {
        if (KEEP_UNIQUE) cache.unique.addProp(`margin-left:0`);
        else css.props.margin_left = 0;
    }
    if (!LINKED) element.wick_node.setRebuild();
}
//clear margin-left
export function CLEARMARGINLEFT(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.settings.KEEP_UNIQUE;
    if (css.props.margin_left) {
        if (KEEP_UNIQUE) cache.unique.addProp(`margin-left:0`);
        else css.props.margin_left = 0;
    }
    if (!LINKED) element.wick_node.setRebuild();
}
//clear margin-right
//clear margin-bottom
//clear padding-left
//clear padding-right
//clear padding-bottom
//clear padding-top
//clear border-left
//clear border-right
//clear border-bottom
//clear border-top