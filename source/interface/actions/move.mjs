import css from "@candlefw/css";


import { CacheFactory } from "./cache";
import { getFirstPositionedAncestor, prepRebuild } from "./common";
import {
    SETDELTALEFT,
    SETDELTATOP,
    SETDELTARIGHT,
    SETDELTABOTTOM
} from "./position";

const types = css.types;

/**
 * Actions provide mechanisms for updating an element, document, and component through user input. 
 */
export function MOVE(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {

  
    if (IS_COMPONENT) {
        if(!component) debugger;
        component.x += dx;
        component.y += dy;
    } else {

        // Get CSS information on element and update appropriate records
        let cache = CacheFactory(system, component, element);

        let css = cache.rules;
        
        if (css.props.position && css.props.position !== "static") {
            switch (cache.move_hori_type) {
                case "left right margin":
                    //in cases of absolute
                    cache.valueB = SETDELTARIGHT(system, component, element, -dx, cache.valueB);
                    cache.valueA = SETDELTALEFT(system, component, element, dx, cache.valueA);
                    break;
                case "left right":
                    cache.valueB = SETDELTARIGHT(system, component, element, -dx, cache.valueB);
                case "left":
                    cache.valueA = SETDELTALEFT(system, component, element, dx, cache.valueA);
                    break;
                case "right":
                    cache.valueB = SETDELTARIGHT(system, component, element, -dx, cache.valueB);
                    break;
            }

            switch (cache.move_vert_type) {
                case "top bottom":
                    cache.valueC = SETDELTABOTTOM(system, component, element, -dy, cache.valueC);
                case "top":
                    cache.valueD = SETDELTATOP(system, component, element, dy, cache.valueD);
                    break;
                case "bottom":
                    cache.valueC = SETDELTABOTTOM(system, component, element, -dy, cache.valueC);
                    break;
            }
        }
                
        prepRebuild(element, LINKED);
    }
}

export function CENTER(system, component, element, HORIZONTAL = true, VERTICAL = true, LINKED = false) {
    // Get CSS information on element and update appropriate records
    let cache = CacheFactory(system, component, element);
    let css = cache.rules;

    let ancestor = getFirstPositionedAncestor(element);

    let ancestor_box = ancestor.getBoundingClientRect();

    let own_box = element.getBoundingClientRect();

    let w = own_box.width;
    let diff = (ancestor_box.width - w) / 2;

    switch (cache.move_hori_type) {
        case "left right":
            //get the width of the parent element
            css.props.left = new types.length(diff, "px");
            css.props.right = new types.length(diff, "px");
            cache.unique.addProp(`margin-left:auto; margin-right:auto`);
            break;
        case "left":
            cache.unique.addProp(`margin-left:auto; margin-right:auto;left:0px;right:0px`);
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
            cache.valueD = setDeltaTop(element, dy, css, cache.valueD);
            break;
        case "bottom":
            cache.valueC = setBottom(element, -dy, css, cache.valueC);
            break;
    }
    */
                
    prepRebuild(element, LINKED)
}
