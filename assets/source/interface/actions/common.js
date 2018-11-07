import wick from "wick";

let types = wick.core.css.types;

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

export function setNumericalValue(propname, system, element, component, value, relative_type = 0) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.settings.KEEP_UNIQUE;
    let props = css.props;
    let prop = props[propname];
    let css_name = propname.replace(/_/g, "-");

    if (!prop) {
        let type = (system.project.settings.default_unit || "px");
        let value = (type == "%") ? new types.percentage(0) : new types.length(0, type);

        cache.unique.addProp(`${css_name}:${value}`);
        props = cache.unique.r.props;
        prop = props[propname];
    } else if (KEEP_UNIQUE && !cache.unique.r.props[propname]) {

        let type = (system.project.settings.default_unit || "px");
        let value = (type == "%") ? new types.percentage(0) : new types.length(0, type);

        cache.unique.addProp(`${css_name}:${value}`);
        props = cache.unique.r.props;
        prop = props[propname];
    }


    if (prop == "auto") {
        //convert to numerical form;
        props[propname] = new types.length(value, "px");
    } else if (prop instanceof types.percentage) {
        //get the nearest positioned ancestor

        let denominator = 0, ele;

        switch(relative_type){
            case setNumericalValue.parent_width :
                ele = element.parentElement; //getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window).width;
            break;
            case setNumericalValue.parent_height :
                ele = element.parentElement; //getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window).height;
            break;
            case setNumericalValue.positioned_ancestor_width :
                ele = getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window).width;
            break;
            case setNumericalValue.positioned_ancestor_height :
                ele = getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window).height;
            break;
            case setNumericalValue.height :
                denominator = getContentBox(element, component.window).width;
            break;
            case setNumericalValue.width :
                denominator = getContentBox(element, component.window).width;
            break;
        }

        let np = value / denominator;
        
        props[propname] = prop.copy(np * 100);
    } else {
        props[propname] = prop.copy(value);
    }
}

setNumericalValue.parent_width = 0;
setNumericalValue.parent_height = 1;
setNumericalValue.positioned_ancestor_width = 2;
setNumericalValue.positioned_ancestor_height = 3;
setNumericalValue.height = 4;
setNumericalValue.width = 5;



export function getRatio(system, element, component, funct, original_value, delta_value, css_name) {
    let ratio = 0;
    funct(system, element, component, original_value + delta_value);
    let end_x = parseFloat(component.window.getComputedStyle(element)[css_name]);
    let diff_x = end_x - original_value;
    if (diff_x !== delta_value && delta_value !== 0) {
        ratio = (diff_x / delta_value);
        let diff = delta_value / ratio;
        // if (diff !== 0) funct(system, element, component, original_value + diff, true);
    }
    return ratio;
}

export function setValue(system, element, component, value_name, value){
    let cache = CacheFactory(system, element, component);
    let props = cache.rules.props;

    if(props[value_name]){
        props[value_name] = value;
    }else{
        cache.unique.addProp(`${value_name.replace(/\_/g,"-")}:${value}`);
    }
}