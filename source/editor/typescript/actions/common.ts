import { css } from "../env.js";

let types = css.types;

import { CSSCacheFactory } from "../cache/css_cache.js";
import { prepUIUpdate } from "./update.js";
import { FlameSystem } from "../types/flame_system.js";
import { ObjectCrate } from "../types/object_crate.js";


export function getContentBox(ele, win: Window = window, system) {
    const
        scale = system.ui.transform.scale,

        rect = ele.getBoundingClientRect(),
        par_prop = win.getComputedStyle(ele),

        border_l = parseFloat(par_prop.getPropertyValue("border-left")),
        border_r = parseFloat(par_prop.getPropertyValue("border-right")),
        border_t = parseFloat(par_prop.getPropertyValue("border-top")),
        border_b = parseFloat(par_prop.getPropertyValue("border-bottom")),

        padding_l = parseFloat(par_prop.getPropertyValue("padding-left")),
        padding_r = parseFloat(par_prop.getPropertyValue("padding-right")),
        padding_t = parseFloat(par_prop.getPropertyValue("padding-top")),
        padding_b = parseFloat(par_prop.getPropertyValue("padding-bottom")),


        top = rect.top / scale + border_t,
        left = rect.left / scale + border_l,
        width = rect.width / scale - border_l - border_r - padding_l - padding_r,
        height = rect.height / scale - border_t - border_b;
    return { top, left, width, height };
}

/** 
    Handles the rebuild routine of wick elements 
*/
export function prepRebuild(system, component, element, LINKED = true) {
    prepUIUpdate(system, component, element, "STYLE");
}

/** 
    Ensures the element has a compatible `display` value border-box properties
*/
export function ensureBlocklike(system, component, element) {
    return;
    const cache = CSSCacheFactory(system, component, element);
    const display = cache.computed.get("display");
    //Make sure we have an element that's prepared to change it's shape. If it's display type is inline, it needs to be changed to inline block.
    switch (display) {
        case "inline":
            cache.setPropFromString("display:inline-block");
            cache.update(system);
            break;
        default:
            //do nothing
            break;

    }
}

export function getFirstPositionedAncestor(ele) {
    while (ele.parentElement) {
        ele = ele.parentElement;
        let pos = window.getComputedStyle(ele).getPropertyValue("position");

        if (pos && pos !== "sticky" && pos !== "static") {
            break;
        }
    }

    return ele;
}

function numericAdjust(ALLOW_NEGATIVE = false, RELATIVE = false, value = 0, denominator = 0, prop = null, cache) {
    let excess = 0;

    if (!ALLOW_NEGATIVE && value < 0) {
        excess = value;
        value = 0;
    }

    if (RELATIVE) {
        const np = value / denominator;
        prop.setValue(prop.value.copy(np * 100));
    } else {
        if (prop.value.copy)
            prop.setValue(prop.value.copy(value));
        else {
            if (value !== 0)
                prop.setValue(new types.length(value, "px"));
            else
                prop.setValue(0);
        }
    }

    cache.setProp(prop);

    return excess;
}

export function setNumericValue(
    propname,
    system: FlameSystem,
    component,
    element: HTMLElement,
    value: number,
    relative_type: number = 0,
    ALLOW_NEGATIVE: boolean = false
): number {
    let
        cache = CSSCacheFactory(system, component, element),
        KEEP_UNIQUE = system.flags.KEEP_UNIQUE,
        prop = cache.getProp(propname),
        css_name = propname.replace(/_/g, "-");

    if (!prop) {
        let type = (system.global.default_pos_unit || "px");
        let value = (type == "%") ? new types.percentage(0) : new types.length(0, type);
        prop = cache.createProp(`${css_name}:${value + type}`);
    }

    let RELATIVE = false, denominator = 1;

    if (prop.value == undefined) return;


    if (prop.value_string == "auto") {

        //convert to numerical form;
        prop.setValue(new types.length(value, "px"));

        cache.setProp(prop);

        return 0;

    } else if (prop.value.type === "%") {

        //get the nearest positioned ancestor
        let ele = null;

        switch (relative_type) {
            case setNumericValue.parent_width:
                ele = element.parentElement;
                if (ele) denominator = getContentBox(ele, system.window, system).width;
                break;
            case setNumericValue.parent_height:
                ele = element.parentElement;
                if (ele) denominator = getContentBox(ele, system.window, system).height;
                break;
            case setNumericValue.positioned_ancestor_width:
                ele = getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, system.window, system).width;
                break;
            case setNumericValue.positioned_ancestor_height:
                ele = getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, system.window, system).height;
                break;
            case setNumericValue.height:
                denominator = getContentBox(component, system.window, system).width;
                break;
            case setNumericValue.width:
                denominator = getContentBox(component, system.window, system).width;
                break;
        }

        RELATIVE = true;
    } else { }

    return numericAdjust(ALLOW_NEGATIVE, RELATIVE, value, denominator, prop, cache);
}

setNumericValue.parent_width = 0;
setNumericValue.parent_height = 1;
setNumericValue.positioned_ancestor_width = 2;
setNumericValue.positioned_ancestor_height = 3;
setNumericValue.height = 4;
setNumericValue.width = 5;

export function setValue(crate: ObjectCrate, value_name, value) {
    const
        { css_cache } = crate,
        props = css_cache.unique;

    if (props.has(value_name))
        props.get(value_name).prop.setValue(value);
    else
        css_cache.setPropFromString(`${value_name.replace(/\_/g, "-")}:${value}`);
}


