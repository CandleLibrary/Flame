import wick from "wick";
import * as clear from "./clear";
import {
    CacheFactory
} from "./cache";
import {
    getFirstPositionedAncestor,
    setRight,
    setLeft,
    setBottom,
    setTop
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
export function TOPOSITIONABSOLUTE(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.settings.KEEP_UNIQUE;
    switch (css.props.position) {
        case "relative":
            /** 
                Need to take margin offset into account when converting to absolute
            */
            let x = element.offsetLeft;
            let y = element.offsetTop;

            if (css.props.margin) {}
            
            clear.CLEARMARGINTOP(system, element, component, true);
            clear.CLEARMARGINLEFT(system, element, component, true);

            if(!KEEP_UNIQUE && css.props.left)
            	setLeft(element, x, css);
            else
            	cache.unique.addProp(`left:${x}`);
            
            if(!KEEP_UNIQUE && css.props.top)
            	setTop(element, y, css);
            else
            	cache.unique.addProp(`top:${y}`);
            
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

    if(!LINKED)
        element.wick_node.setRebuild();
}

/**
 * Convert position to relative
 */
export function TOPOSITIONRELATIVE(system, element, component) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.settings.KEEP_UNIQUE;
    switch (css.props.position) {
        case "relative":
            /*no op*/
            break;
        case "absolute":

            let x = element.offsetLeft;
            let y = element.offsetTop;

            let sib = element.previousSibling;

            if(sib){
            	while(sib && (sib.style.position !== "relative" && sib.style.position !== ""))
            		sib = sib.previousSibling;
            	if(sib){
            		y -= sib.offsetTop + sib.offsetHeight;
            	}
            }

            clear.CLEARLEFT(system, element, component, true);
            clear.CLEARTOP(system, element, component, true);

            if(!KEEP_UNIQUE && css.props.margin_left)
            	css.props.margin_left = css.props.margin_left.copy(x);
            else
            	cache.unique.addProp(`margin-left:${x}px`);
            
            if(!KEEP_UNIQUE && css.props.margin_top)
            	css.props.margin_top = css.props.margin_top.copy(y);
            else
            	cache.unique.addProp(`margin-top:${y}px`);


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

//Converting from unit types
//left
export function LEFTTOPX(){}
export function LEFTTOEM(){}
export function LEFTTOPERCENTAGE(){}
export function LEFTTOVH(){}
export function LEFTTOVW(){}
//right
//top
//bottom
//margin top
//margin bottom
//margin right
//margin left
//border top
//border bottom
//border left
//border right
//padding top
//padding bottom
//padding right
//padding left


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