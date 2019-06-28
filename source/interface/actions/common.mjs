import * as css from "@candlefw/css";

let types = css.types;

import { CacheFactory } from "./cache";

function getContentBox(ele, win = window, system) {
    const
        scale = system.ui.manager.transform.scale,

        rect = ele.getBoundingClientRect(),
        par_prop = win.getComputedStyle(ele),

        border_l = parseFloat(par_prop.getPropertyValue("border-left")),
        border_r = parseFloat(par_prop.getPropertyValue("border-right")),
        border_t = parseFloat(par_prop.getPropertyValue("border-top")),
        border_b = parseFloat(par_prop.getPropertyValue("border-bottom")),

        top = rect.top / scale + border_t,
        left = rect.left / scale + border_l,
        width = rect.width / scale - border_l - border_r,
        height = rect.height / scale - border_t - border_b;
    return { top, left, width, height };
}

/** 
    Handles the rbuild routine of wick elements 
*/
export function prepRebuild(element, LINKED = false) {
    element.wick_node.prepRebuild();
    if (!LINKED) {
        element.wick_node.rebuild();
    }
}

/** 
    Ensures the element has a compatible `display` value border-box properties
*/
export function ensureBlocklike(system, component, element) {
    const cache = CacheFactory(system, component, element);
    const display = cache.computed.get("display");
    //Make sure we have an element that's prepared to change it's shape. If it's display type is inline, it needs to be changed to inline block.
    switch (display) {
        case "inline":
            cache.unique.addProp("display:inline-block");
            cache.update(system);
            break;
        default:
            //do nothing
            break;

    }
}

export function getFirstPositionedAncestor(ele) {
    let element = null;

    while (ele.parentElement) {
        ele = ele.parentElement;
        let pos = window.getComputedStyle(ele).getPropertyValue("position");

        if (pos && pos !== "sticky" && pos !== "static") {
            break;
        }
    }

    return ele;
}

export function setNumericValue(propname, system, component, element, value, relative_type = 0, ALLOW_NEGATIVE = false) {
    let cache = CacheFactory(system, component, element);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    let props = css.props;
    let prop = props[propname];
    let css_name = propname.replace(/_/g, "-");
    let excess = 0;

    if (!prop) {
        if (cache.unique.props[propname]) {
            props = cache.unique.props;
            prop = props[propname];
        }
        if (!KEEP_UNIQUE) {
            let type = (system.project.components.default_unit || "px");
            let value = (type == "%") ? new types.percentage(0) : new types.length(0, type);
            cache.unique.addProp(`${css_name}:${value}`);
            props = cache.unique.props;
            prop = props[propname];
        } else {
            let type = (system.project.components.default_unit || "px");
            let value = (type == "%") ? new types.percentage(0) : new types.length(0, type);
            cache.unique.addProp(`${css_name}:${value}`);
            props = cache.unique.props;
            prop = props[propname];
        }
    }

    if (!ALLOW_NEGATIVE && value < 0) {
        excess = value;
        value = 0;
    }

    if (prop == "auto") {
        //convert to numerical form;
        props[propname].val[0] = new types.length(value, "px");
    } else if (prop.value instanceof types.percentage) {
        //get the nearest positioned ancestor

        let denominator = 0,
            ele;

        switch (relative_type) {
            case setNumericValue.parent_width:
                ele = element.parentElement; //getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window, system).width;
                break;
            case setNumericValue.parent_height:
                ele = element.parentElement; //getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window, system).height;
                break;
            case setNumericValue.positioned_ancestor_width:
                ele = getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window, system).width;
                break;
            case setNumericValue.positioned_ancestor_height:
                ele = getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window, system).height;
                break;
            case setNumericValue.height:
                denominator = getContentBox(component, element.window, system).width;
                break;
            case setNumericValue.width:
                denominator = getContentBox(component, element.window, system).width;
                break;
        }

        let np = value / denominator;

        props[propname].val[0] = prop.copy(np * 100);
    } else {
        if (prop.value.copy)
            props[propname].val[0] = prop.value.copy(value);
        else {
            if (value !== 0)
                props[propname].val[0] = new types.length(value, "px");
            else
                props[propname].val[0] = 0;
        }
    }

    return excess;
}

setNumericValue.parent_width = 0;
setNumericValue.parent_height = 1;
setNumericValue.positioned_ancestor_width = 2;
setNumericValue.positioned_ancestor_height = 3;
setNumericValue.height = 4;
setNumericValue.width = 5;



export function getRatio(system, component, element, funct, original_value, delta_value, delta_measure, ALLOW_NEGATIVE = false, NO_ADJUST = false) {
    let excess = 0,
        ratio = 0,
        scale = system.ui.manager.transform.scale;

    let begin_x = element.getBoundingClientRect()[delta_measure] / scale;

    ///*
    if (!ALLOW_NEGATIVE && original_value + delta_value < 0) {
        excess = original_value + delta_value;
        delta_value = -original_value;
    }
    //*/

    funct(system, component, element, original_value + delta_value);

    let end_x = element.getBoundingClientRect()[delta_measure] / scale;

    let diff_x = end_x - begin_x;


    if (Math.abs(diff_x - delta_value) > 0.0005 && delta_value !== 0) {

        ratio = (diff_x / delta_value);
        let diff = delta_value / ratio;
        if (diff !== 0 && !NO_ADJUST) {
            let out = funct(system, component, element, original_value + diff, true);
            excess += (out.excess ? out.excess : out.excess_x ? out.excess_x : out.excess_y);
            //console.log(ratio)
        }
    }
    return { ratio, excess };
}

export function setValue(system, component, element, value_name, value) {
    let cache = CacheFactory(system, component, element);

    let props = cache.rules.props;

    if (props[value_name]) {
        props[value_name] = value;
    } else {
        cache.unique.addProp(`${value_name.replace(/\_/g,"-")}:${value}`);
    }
}
