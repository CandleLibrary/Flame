import { CacheFactory } from "./cache";
import { getFirstPositionedAncestor } from "./common";
let types = require("wick").core.css.types;
/** Set the left position of an Element. Returns calculated ratio if the ratio argument is not defined. */
export function setLeft(element, dx, rule, ratio = 0) {
    if (rule.props.left instanceof types.percentage) {
        //get the nearest positioned ancestor
        let width = ratio;

        if (ratio == 0) {
            let ele = getFirstPositionedAncestor(element);
            if (ele)
                width = ele.getBoundingClientRect().width;
        }

        let np = ((width * 0.01 * rule.props.left) + dx) / width;
        rule.props.left = rule.props.left.copy(np * 100);

        ratio = width;
    } else
    if (ratio > 0) {
        dx = dx / ratio;
        rule.props.left = rule.props.left.copy(rule.props.left + dx);
    } else {
        let start_x = element.getBoundingClientRect().x;
        let start_left = rule.props.left;
        rule.props.left = rule.props.left.copy(rule.props.left + dx);
        element.wick_node.setRebuild();
        let rec1 = element.getBoundingClientRect();
        let end_x = rec1.x;
        let diff_x = end_x - start_x;
        if (diff_x !== dx && dx !== 0) {
            ratio = (diff_x / dx);
            let diff = dx / ratio;
            if (diff != 0)
                rule.props.left = start_left.copy(start_left + diff);
        }
    }
    return ratio;
}

/** Set the right position of an Element. Returns calculated ratio if the ratio argument is not defined. */
export function setRight(element, dx, rule, ratio = 0) {
    if (rule.props.right instanceof types.percentage) {

        //get the nearest positioned ancestor
        let width = ratio;

        if (ratio == 0) {
            let ele = getFirstPositionedAncestor(element);
            if (ele)
                width = ele.getBoundingClientRect().width;
        }

        let np = ((width * 0.01 * rule.props.right) + dx) / width;

        if (Math.abs(np) !== Infinity && !isNaN(np)) {
            rule.props.right = rule.props.right.copy(np * 100);
            ratio = width;
        }
    } else
    if (ratio > 0) {
        dx = dx / ratio;
        rule.props.right = rule.props.right.copy(rule.props.right - dx);
    } else {
        let start_x = element.getBoundingClientRect().right;
        let start_right = rule.props.right;
        rule.props.right = rule.props.right.copy(rule.props.right - dx);
        element.wick_node.setRebuild();
        let end_x = element.getBoundingClientRect().right;
        let diff_x = end_x - start_x;
        if (diff_x !== dx && dx !== 0) {
            ratio = (diff_x / dx);
            let diff = dx / ratio;
            if (diff != 0)
                rule.props.right = start_right.copy(start_right + diff);
        }
    }

    return ratio;
}

/** Set the top position of an Element. Returns calculated ratio if the ratio argument is not defined. */
export function setTop(element, dy, rule, ratio = 0) {
    if (rule.props.top instanceof types.percentage) {

        //get the nearest positioned ancestor
        let height = ratio;

        if (ratio == 0) {
            let ele = getFirstPositionedAncestor(element);
            if (ele)
                height = ele.getBoundingClientRect().height;
        }

        let np = ((height * 0.01 * rule.props.top) + dy) / height;

        if (Math.abs(np) !== Infinity && !isNaN(np)) {
            rule.props.top = rule.props.top.copy(np * 100);
            ratio = height;
        }

    } else
    if (ratio > 0) {
        dy = dy / ratio;
        rule.props.top = rule.props.top.copy(rule.props.top + dy);
    } else {
        let start_x = element.getBoundingClientRect().top;
        let start_top = rule.props.top;
        rule.props.top = rule.props.top.copy(rule.props.top + dy);
        element.wick_node.setRebuild();
        let end_x = element.getBoundingClientRect().top;
        let diff_x = end_x - start_x;
        if (diff_x !== dy && dy !== 0) {
            ratio = (diff_x / dy);
            let diff = dy / ratio;
            if (diff != 0)
                rule.props.top = start_top.copy(start_top + diff);
        }
    }

    return ratio;
}

/** Set the top position of an Element. Returns calculated ratio if the ratio argument is not defined. */
export function setBottom(element, dy, rule, ratio = 0) {
    if (rule.props.bottom instanceof types.percentage) {

        //get the nearest positioned ancestor
        let height = ratio;

        if (ratio == 0) {
            let ele = getFirstPositionedAncestor(element);
            if (ele)
                height = ele.getBoundingClientRect().height;
        }

        let np = ((height * 0.01 * rule.props.bottom) + dy) / height;

        if (Math.abs(np) !== Infinity && !isNaN(np)) {
            rule.props.bottom = rule.props.bottom.copy(np * 100);
            ratio = height;
        }

    } else
    if (ratio > 0) {
        dy = dy / ratio;
        rule.props.bottom = rule.props.bottom.copy(rule.props.bottom - dy);
    } else {
        let start_x = element.getBoundingClientRect().bottom;
        let start_bottom = rule.props.bottom;
        rule.props.bottom = rule.props.bottom.copy(rule.props.bottom - dy);
        element.wick_node.setRebuild();
        let end_x = element.getBoundingClientRect().bottom;
        let diff_x = end_x - start_x;
        if (diff_x !== dy && dy !== 0) {
            ratio = (diff_x / dy);
            let diff = dy / ratio;
            if (diff != 0)
                rule.props.bottom = start_top.copy(start_top + diff);
        }
    }

    return ratio;
}

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
            cache.valueA = setLeft(element, dx, css, cache.valueA);
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