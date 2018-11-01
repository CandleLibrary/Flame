import wick from "wick";
import {
    CacheFactory
} from "./cache";
import {
    getFirstPositionedAncestor
} from "./common";
let types = wick.core.css.types;
/**
 * Actions for converting position and layout to different forms. 
 */
export function TOMARGINLEFT() {}
export function TOMARGINRIGHT() {}
export function TOMARGINLEFTRIGHT() {}
export function TOLEFT() {}
export function TORIGHT() {}
export function TOLEFTRIGHT() {}
export function TOTOP() {}
export function TOTOPBOTTOM() {}
/**
 * @brief Convert position to absolute
 */
export function TOPOSITIONABSOLUTE(system, element, component) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.settings.KEEP_UNIQUE;
    switch (css.props.position) {
        case "relative":
            /** 
                Need to take margin offset into account when converting to absolute
            */
            let x = 0;
            let y = 0;
            let mgt = 0;
            let mgl = 0;
            if (css.props.margin) {}
            if (css.props.margin_left) {
                mgl = css.props.margin_left;
                if (KEEP_UNIQUE) cache.unique.addProp("margin-left:0")
                else css.props.margin_left = 0;
            }
            if (css.props.margin_top) {
                mgt = css.props.margin_top;
                if (KEEP_UNIQUE) cache.unique.addProp("margin-top:0")
                else css.props.margin_top = 0;
            }
            if (css.props.top) {
                y = css.props.top + element.offsetTop;
                css.props.top = css.props.top.copy(y + mgt);
            }
            if (css.props.left) {}
            break;
        case "absolute":
            /*no op*/
            break;
        case "fixed":
            //add parent offset values to current position to keep it predictably in place. 
            break;
        default:
            //Manually add required data
            break;
    }

    if (KEEP_UNIQUE) {
        if (cache.unique.rules.props.position) cache.unique.rules.props.position = "absolute";
        else cache.unique.addProp("position:absolute");
    } else {
        if (css.props.position) css.props.position = "absolute";
        else cache.unique.addProp("position:absolute");
    }

    element.wick_node.setRebuild();
}

export function TOPOSITIONRELATIVE() {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.settings.KEEP_UNIQUE;
    switch (css.props.position) {
        case "relative":
            break;
        case "absolute":
            /** 
                Get margin offset to element
            */
            
            let x = 0;
            let y = 0;
            let mgt = 0;
            let mgl = 0;
            if (css.props.margin) {}
            if (css.props.margin_left) {
                mgl = css.props.margin_left;
                if (KEEP_UNIQUE) cache.unique.addProp("margin-left:0")
                else css.props.margin_left = 0;
            }
            if (css.props.margin_top) {
                mgt = css.props.margin_top;
                if (KEEP_UNIQUE) cache.unique.addProp("margin-top:0")
                else css.props.margin_top = 0;
            }
            if (css.props.top) {
                y = css.props.top + element.offsetTop;
                css.props.top = css.props.top.copy(y + mgt);
            }
            if (css.props.left) {}
            /*no op*/
            break;
        case "fixed":
            //add parent offset values to current position to keep it predictably in place. 
            break;
        default:
            //Manually add required data
            break;
    }
    if (KEEP_UNIQUE) {
        if (cache.unique.rules.props.position) cache.unique.rules.props.position = "relative";
        else cache.unique.addProp("position:relative");
    } else {
        if (css.props.position) css.props.position = "relative";
        else cache.unique.addProp("position:relative");
    }
    element.wick_node.setRebuild();
}

export function TOPOSITIONFIXED() {}
export function TOPOSITIONSTICKY() { /* NO OP */ }
export function TOGGLE_UNIT(system, element, component, horizontal, vertical) {
    // Get CSS information on element and update appropriate records
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let rect = getFirstPositionedAncestor(element).getBoundingClientRect();
    if (horizontal) {
        switch (cache.move_hori_type) {
            case "left right":
            case "left right margin":
                if (css.props.right instanceof types.length) {
                    css.props.right = new types.percentage((css.props.right / rect.width) * 100);
                } else {
                    css.props.right = new types.length(rect.width * (css.props.right / 100), "px");
                }
            case "left":
                if (css.props.left instanceof types.length) {
                    css.props.left = new types.percentage((css.props.left / rect.width) * 100);
                } else {
                    css.props.left = new types.length(rect.width * (css.props.left / 100), "px");
                }
                break;
            case "right":
                if (css.props.right instanceof types.length) {
                    css.props.right = new types.percentage((css.props.right / rect.width) * 100);
                } else {
                    css.props.right = new types.length(rect.width * (css.props.right / 100), "px");
                }
                break;
        }
    }
    element.wick_node.setRebuild();
}