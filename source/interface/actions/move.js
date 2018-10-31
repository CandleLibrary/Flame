import wick from "wick";
import { CacheFactory } from "./cache";
import { 
    getFirstPositionedAncestor,
    setRight,
    setLeft,
    setBottom,
    setTop ,
} from "./common";

/**
 * Actions provide mechanisms for updating an element, document, and component through user input. 
 */
export function MOVE(system, element, component, dx, dy) {
    // Get CSS information on element and update appropriate records
    let cache = CacheFactory(system, element, component);

    let css = cache.rules;

    switch (cache.move_hori_type) {
        case "left right":
            cache.valueB = setRight(element, -dx, css, cache.valueB);
        case "left":
            cache.valueA = setLeft(element, dx, css, 0);
            break;
        case "right":
            cache.valueB = setRight(element, -dx, css, cache.valueB);
            break;
    }

    switch (cache.move_vert_type) {
        case "top bottom":
            cache.valueC = setBottom(element, -dy, css, cache.valueC);
        case "top":
            cache.valueD = setTop(element, dy, css, cache.valueD);
            break;
        case "bottom":
            cache.valueC = setBottom(element, -dy, css, cache.valueC);
            break;
    }

    element.wick_node.setRebuild();
}

export function CENTER(system, element, component, HORIZONTAL= true, VERTICAL = true) {
    // Get CSS information on element and update appropriate records
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;

    let ancestor = getFirstPositionedAncestor(element);
    
    let ancestor_box = ancestor.getBoundingClientRect();

    let own_box = element.getBoundingClientRect();

    let w = own_box.width;
    let diff = (ancestor_box.width - w)/2;

    switch (cache.move_hori_type) {
        case "left right":
            //get the width of the parent element
            css.props.left = new wick.core.css.types.length(diff, "px");
            css.props.right = new wick.core.css.types.length(diff, "px");
            break;
        case "left":
            css.props.left = new wick.core.css.types.length(diff, "px");
            break;
        case "right":
            break;
        case "margin-left":
        break;
        case "margin-left margin-right":
        break;
        case "margin":
        break;
    }
    /*
    switch (cache.move_vert_type) {
        case "top bottom":
            cache.valueC = setBottom(element, -dy, css, cache.valueC);
        case "top":
            cache.valueD = setTop(element, dy, css, cache.valueD);
            break;
        case "bottom":
            cache.valueC = setBottom(element, -dy, css, cache.valueC);
            break;
    }
    */

    element.wick_node.setRebuild();
}

export function CLEAR(){
    
}