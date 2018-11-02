import wick from "wick";
import {
    CacheFactory
} from "./cache";
import {
    getFirstPositionedAncestor
}from "./common"
let types = wick.core.css.types;

export function SETLEFT(system, element, component, x, LINKED = false) { //x is always in pixels

    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.settings.KEEP_UNIQUE;
    
    let props  = css.props;

    if (!props.left) {

        let type = (system.project.settings.default_unit || "px")

        let value = (type == "%") ? new types.percentage(0) : new types.length(0,type);

        if (KEEP_UNIQUE) {
            if (cache.unique.rules.props.left) cache.unique.rules.props.left = "absolute";
            else cache.unique.addProp(`left:${value}`);
        } else {
            if (css.props.left) css.props.left = value;
            else cache.unique.addProp(`left:${value}`);
        }

        props = cache.unique.rules.props;
    }

    if (props.left == "auto") {
        //convert to numerical form;
        props.left = new types.length(x, "px");
    } else if (props.left instanceof types.percentage) {
        //get the nearest positioned ancestor
        let width = 0;
        let ele = getFirstPositionedAncestor(element);
        if (ele) width = ele.getBoundingClientRect().width;
        let np = x / width;
        props.left = props.left.copy(np * 100);
    } else {
        props.left = props.left.copy(x);
    }

    if (!LINKED) element.wick_node.setRebuild();
}

/** Set the left position of an Element. Returns calculated ratio if the ratio argument is not defined. */
export function SETDELTALEFT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = element.getBoundingClientRect().x;

    start_x = parseFloat(component.window.getComputedStyle(element).left);
    
    if(ratio > 0){
        dx = dx / ratio;
        SETLEFT(system, element, component, start_x + dx, true);
    }else{
        SETLEFT(system, element, component, start_x + dx);
        let end_x = parseFloat(component.window.getComputedStyle(element).left);
        let diff_x = end_x - start_x;
        if (diff_x !== dx && dx !== 0) {
            ratio = (diff_x / dx);
            let diff = dx / ratio;
           // if (diff !== 0) SETLEFT(system, element, component, start_x + diff, true);
        };
    }

    if(!LINKED) element.wick_node.setRebuild();

    return ratio;
}