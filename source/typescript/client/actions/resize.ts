import { CSSCacheFactory } from "../cache/css_cache.js";
import {
    resizeTop,
    resizeBottom,
    resizeLeft,
    resizeRight
} from "./common.js";

export function SCALETL(system, element, dx, dy, IS_COMPONENT) {
    let cache = CSSCacheFactory(system, element);
    resizeLeft(element, cache.rules, dx, cache);
    resizeTop(system, element, cache.rules, dy, cache);

}

export function SCALEBL(system, element, dx, dy, IS_COMPONENT) {
    let cache = CSSCacheFactory(system, element);
    let css = cache.rules;
    resizeLeft(element, css, dx, cache);
    resizeBottom(element, css, dy, cache);
}


export const SCALETR = {
    apply: (system, element, dx, dy, IS_COMPONENT) => {
        let cache = CSSCacheFactory(system, element);
        let css = cache.rules;
        resizeRight(element, css, dx, cache);
        resizeTop(system, element, css, dy, cache);
    },
    seal: (history_state, sys, comp, ele) => {
        debugger;
        let cache = CSSCacheFactory(system, element);
        let css = cache.rules;
        history_state.type = "CSS";
        history.state.insert = sys.css.render;
    }
};
export function SCALEBR(system, element, dx, dy, IS_COMPONENT) {
    let cache = CSSCacheFactory(system, element);
    let css = cache.rules;
    resizeRight(element, css, dx, cache);
    resizeBottom(element, css, dy, cache);
}
export function SCALEL(system, element, d, nn, IS_COMPONENT) {
    let cache = CSSCacheFactory(system, element);
    resizeLeft(element, cache.rules, d, cache);
}
export function SCALER(system, element, d, nn, IS_COMPONENT) {
    let cache = CSSCacheFactory(system, element);
    resizeRight(element, cache.rules, d, cache);
}
export function SCALET(system, element, d, nn, IS_COMPONENT) {
    let cache = CSSCacheFactory(system, element);
    resizeTop(system, element, cache.rules, d, cache);
}
export function SCALEB(system, element, d, nn, IS_COMPONENT) {
    let cache = CSSCacheFactory(system, element);
    resizeBottom(element, cache.rules, d, cache);
}
