import { CacheFactory } from "./cache";
import {
    resizeTop,
    resizeBottom,
    resizeLeft,
    resizeRight
} from "./common";

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