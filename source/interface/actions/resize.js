import { CacheFactory } from "./cache";
import { getFirstPositionedAncestor } from "./common";
import {
    setLeft,
    setRight,
    setTop,
    setBottom
} from "./move";
let types = require("wick").core.css.types;

export function setWidth(element, dx, rule, ratio = 0) {
    if (rule.props.width instanceof types.percentage) {
        //get the nearest positioned ancestor
        let width = ratio;

        if (ratio == 0) {
            let ele = getFirstPositionedAncestor(element);
            if (ele){
                width = ele.getBoundingClientRect().width;

            }
        }

        let np = ((width * 0.01 * rule.props.width) + dx) / width;
        rule.props.width = rule.props.width.copy(np * 100);

        ratio = width;
    } else {
        let width = rule.props.width;
        let w = element.getBoundingClientRect().width;
        let ow = w / (width / 100);
        let np = ((w - dx * 1) / ow);
        rule.props.width = rule.props.width.copy(np * 100);
    }

    return ratio;
}

export function setHeight(element, dx, rule, ratio = 0) {
    if (rule.props.height instanceof types.percentage) {
        //get the nearest positioned ancestor
        let height = ratio;

        if (ratio == 0) {
            let ele = getFirstPositionedAncestor(element);
            if (ele){
                height = ele.getBoundingClientRect().height;
                console.log(height);
            }
        }

        let np = ((height * 0.01 * rule.props.height) + dx) / height;
        rule.props.height = rule.props.height.copy(np * 100);

        ratio = height;
    } else {
        let height = rule.props.height;
        let w = element.getBoundingClientRect().height;
        let ow = w / (height / 100);
        let np = ((w + dx * 1) / ow);
        rule.props.height = rule.props.height.copy(np * 100);
    }
}

export function resizeTop(element, css, dy, cache){
    switch (cache.move_vert_type) {
        case "top bottom":
            cache.valueD = setTop(element, dy, css, cache.valueD);
        case "top":
            cache.valueD = setTop(element, dy, css, cache.valueD);
            setHeight(element, -dy, css, 0);

            break;
        case "bottom":
            setHeight(element, -dy, css, 0);
            break;
    }
}

export function resizeBottom(element, css, dy, cache){
    switch (cache.move_vert_type) {
        case "top bottom":
            cache.valueC = setBottom(element, -dy, css, cache.valueC);
        case "top":
            setHeight(element, dy, css, 0);
            break;
        case "bottom":
            cache.valueC = setBottom(element, -dy, css, cache.valueC);
            setHeight(element, dy, css, 0);
            break;
    }
}

export function resizeLeft(element, css, dx, cache){
    switch (cache.move_hori_type) {
        case "left right":
            cache.valueB = setLeft(element, dx, css, cache.valueB);
            break;
        case "left":
            cache.valueA = setLeft(element, dx, css, cache.valueA);
            setWidth(element, -dx, css, 1);
            break;
        case "right":
            setWidth(element, -dx, css, 1);
            break;
    }
}

function resizeRight(element, css, dx, cache){
    switch (cache.move_hori_type) {
        case "left right":
            cache.valueB = setRight(element, -dx, css, cache.valueB);
            break;
        case "left":
            setWidth(element, dx, css, 1);
            break;
        case "right":
            cache.valueB = setRight(element, -dx, css, cache.valueB);
            setWidth(element, dx, css, 1);
            break;
    }
}

export function SCALETL(system, element, component, dx, dy) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    resizeLeft(element, css, dx, cache);
    resizeTop(element, css, dy, cache);
}

export function SCALEBL(system, element, component, dx, dy) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    resizeLeft(element, css, dx, cache);
    resizeBottom(element, css, dy, cache);
}
export function SCALETR(system, element, component, dx, dy) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    resizeRight(element, css, dx, cache);
    resizeTop(element, css, dy, cache);
}
export function SCALEBR(system, element, component, dx, dy) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    resizeRight(element, css, dx, cache);
    resizeBottom(element, css, dy, cache);
}

export function SCALEL(system, element, component, d) {
    let cache = CacheFactory(system, element, component);
    resizeLeft(element, cache.rules, d, cache);
}
export function SCALER(system, element, component, d) {
    let cache = CacheFactory(system, element, component);
    resizeRight(element, cache.rules, d, cache);
}
export function SCALET(system, element, component, d) {
    let cache = CacheFactory(system, element, component);
    resizeTop(element, cache.rules, d, cache);
}
export function SCALEB(system, element, component, d) {
    let cache = CacheFactory(system, element, component);
    resizeBottom(element, cache.rules, d, cache);
}
