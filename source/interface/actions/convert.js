import wick from "wick";
import { CacheFactory } from "./cache";
import { getFirstPositionedAncestor } from "./common";
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

export function TOGGLEPOSITION(system, element, component) {
	let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    
    let rect = getFirstPositionedAncestor(element).getBoundingClientRect();
    let unique = system.css.getUnique(element, component).r;

    if(css.props.position){
    	let own_rect = element.getBoundingClientRect(), pos = 0;
    	if(css.props.position == "relative"){
    		css.props.position = "absolute";
    		switch(cache.move_hori_type){
    			case "left":
    				pos = own_rect.left - rect.left;
    				css.props.left = new types.percentage((pos / rect.width) * 100);
    			break;
    		}
    	}else{
    		css.props.position = "relative";
    		switch(cache.move_hori_type){
    			case "left":
    				css.props.left = new types.percentage((css.props.left / rect.width) * 100);
    			break;
    		}
    	}
    }else{
    	
    	unique.props.addProp("position:relative");
    }

    element.wick_node.setRebuild();
}

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