import { CacheFactory } from "./cache";
import {
    resizeTop,
    resizeBottom,
    resizeLeft,
    resizeRight
} from "./common";

export function SCALETL(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) {
        component.x += dx;
        component.width -= dx;
        component.y += dy;
        component.height -= dy;
    } else {
        let cache = CacheFactory(system, component, element);
        resizeLeft(element, cache.rules, dx, cache);
        resizeTop(system, component, element, cache.rules, dy, cache);
    }
}

export function SCALEBL(system, component, element, dx, dy, IS_COMPONENT) {

    let cache = CacheFactory(system, component, element);
    let css = cache.rules;
    resizeLeft(element, css, dx, cache);
    resizeBottom(element, css, dy, cache);
}
export function SCALETR(system, component, element, dx, dy, IS_COMPONENT) {
    let cache = CacheFactory(system, component, element);
    let css = cache.rules;
    resizeRight(element, css, dx, cache);
    resizeTop(system, component, element, css, dy, cache);
}
export function SCALEBR(system, component, element, dx, dy, IS_COMPONENT) {
    let cache = CacheFactory(system, component, element);
    let css = cache.rules;
    resizeRight(element, css, dx, cache);
    resizeBottom(element, css, dy, cache);
}
export function SCALEL(system, component, element, d, nn, IS_COMPONENT) {
    let cache = CacheFactory(system, component, element);
    resizeLeft(element, cache.rules, d, cache);
}
export function SCALER(system, component, element, d, nn, IS_COMPONENT) {
    let cache = CacheFactory(system, component, element);
    resizeRight(element, cache.rules, d, cache);
}
export function SCALET(system, component, element, d, nn, IS_COMPONENT) {
    let cache = CacheFactory(system, component, element);
    resizeTop(system, component, element, cache.rules, d, cache);
}
export function SCALEB(system, component, element, d, nn, IS_COMPONENT) {
    let cache = CacheFactory(system, component, element);
    resizeBottom(element, cache.rules, d, cache);
}
