import wick from "wick";

import { TEXTEDITOR } from "./actions/text";

export { TEXTEDITOR };

class ActionCache {
    constructor() {
        this.css_flags_a = 0;
        this.css_flags_b = 0;
        this.transform_type = 0;
        this.css_props = null;
    }
}

function getApplicableRules(system, element, component) {
    return system.css.aquireCSS(element, component);
}

function getUniqueRule(system, element, component) {
    return system.css.getUnique(element, component);
}

function mergeRules(css) {
    let rule = new CSS_Rule_Constructor();
    for (let i = 0; i < css.length; i++)
        rule.merge(css[i].r);
    return rule;
}

export function RESIZE(system, element, component, dx, dy) {

}

export function BACKGROUND(system, element, component, dx, dy) {

}

export function FONT(system, element, component, dx, dy) {

}

export function MARGIN(system, element, component, dx, dy) {

}

export function PADDING(system, element, component, dx, dy) {

}

export function TRANSFORM(system, element, component, dx, dy) {

}

export function SVG(system, element, component, dx, dy) {

}

