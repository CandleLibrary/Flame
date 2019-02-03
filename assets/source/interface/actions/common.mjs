import css from "@candlefw/css";
let types = css.types;

import { CacheFactory } from "./cache";

function getContentBox(ele, win = window) {

    let rect = ele.getBoundingClientRect();
    let par_prop = win.getComputedStyle(ele);

    let border_l = parseFloat(par_prop.getPropertyValue("border-left"));
    let border_r = parseFloat(par_prop.getPropertyValue("border-right"));
    let border_t = parseFloat(par_prop.getPropertyValue("border-top"));
    let border_b = parseFloat(par_prop.getPropertyValue("border-bottom"));

    let top = rect.top + border_t;
    let left = rect.left + border_l;
    let width = rect.width - border_l - border_r;
    let height = rect.height - border_t - border_b;

    return { top, left, width, height };
}

/** 
    Handles the rbuild routine of wick elements 
*/
export function prepRebuild(element, LINKED = false) {
    element.wick_node.prepRebuild();
    if (!LINKED) {
        console.log(1)
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

export function setNumericValue(propname, system, component, element, value, relative_type = 0) {
    let cache = CacheFactory(system, component, element);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    let props = css.props;
    let prop = props[propname];
    let css_name = propname.replace(/_/g, "-");

    if (!prop) {
        if (cache.unique.r.props[propname]) {
            props = cache.unique.r.props;
            prop = props[propname];
        }
        if (!KEEP_UNIQUE) {
            let type = (system.project.components.default_unit || "px");
            let value = (type == "%") ? new types.percentage(0) : new types.length(0, type);
            cache.unique.addProp(`${css_name}:${value}`);
            props = cache.unique.r.props;
            prop = props[propname];
        } else {
            let type = (system.project.components.default_unit || "px");
            let value = (type == "%") ? new types.percentage(0) : new types.length(0, type);
            cache.unique.addProp(`${css_name}:${value}`);
            props = cache.unique.r.props;
            prop = props[propname];
        }
    }


    if (prop == "auto") {
        //convert to numerical form;
        props[propname] = new types.length(value, "px");
    } else if (prop instanceof types.percentage) {
        //get the nearest positioned ancestor

        let denominator = 0,
            ele;

        switch (relative_type) {
            case setNumericValue.parent_width:
                ele = element.parentElement; //getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window).width;
                break;
            case setNumericValue.parent_height:
                ele = element.parentElement; //getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window).height;
                break;
            case setNumericValue.positioned_ancestor_width:
                ele = getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window).width;
                break;
            case setNumericValue.positioned_ancestor_height:
                ele = getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window).height;
                break;
            case setNumericValue.height:
                denominator = getContentBox(component, element.window).width;
                break;
            case setNumericValue.width:
                denominator = getContentBox(component, element.window).width;
                break;
        }

        let np = value / denominator;

        props[propname] = prop.copy(np * 100);
    } else {
        if (prop.copy)
            props[propname] = prop.copy(value);
        else {
            if (value !== 0)
                props[propname] = new types.length(value, "px");
            else
                props[propname] = 0;
        }
    }
}

setNumericValue.parent_width = 0;
setNumericValue.parent_height = 1;
setNumericValue.positioned_ancestor_width = 2;
setNumericValue.positioned_ancestor_height = 3;
setNumericValue.height = 4;
setNumericValue.width = 5;



export function getRatio(system, component, element, funct, original_value, delta_value, css_name) {
    let ratio = 0;
    funct(system, component, element, original_value + delta_value);
    let end_x = parseFloat(component.window.getComputedStyle(element)[css_name]);
    let diff_x = end_x - original_value;
    if (false && Math.abs(diff_x - delta_value) > 0.0005 && delta_value !== 0) {
        ratio = (diff_x / delta_value);
        let diff = delta_value / ratio;
        if (diff !== 0) {
            funct(system, component, element, original_value + diff, true);
        }
    }
    return ratio;
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
