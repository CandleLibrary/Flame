import {
    CacheFactory
} from "./cache";
import {
    setMarginTop,
    setMarginBottom,
    setMarginLeft,
    setMarginRight,
    setTop,
    setBottom,
    setLeft,
    setRight,
    setHeight,
    setWidth,
} from "./common";

export function resizeTop(system, element, component, css, dy, cache) {
    let pos = css.props.position;
    if (pos && pos !== "static") {
        /** 
            Resizing a relative positioned object should maintain an expected document flow. 
            When resizing the element width and height value, if correspounding margin values are not adjusted, 
            then static and relative sibling elements positioned after this element will jump arround in 
            ways which a user may not expect. Margin-left and Margin-top adjustments keep other elements in a predictable manner. 
        */
        if (pos == "relative") {
            if (!cache.unique.r.props.margin && !cache.unique.r.props.margin_top) {
                cache.unique.addProp("margin-top:0px");
                cache.destroy();
                cache.generateMovementCache(system, element, component);
                css = cache.rules;
            }
            switch (cache.move_vert_type) {
                case "top bottom":
                    cache.valueD = setMarginTop(element, dy, css, cache.valueD);
                case "top":
                    cache.valueD = setMarginTop(element, dy, css, cache.valueD);
                    setHeight(element, -dy, css, 0);
                    break;
                case "bottom":
                    setHeight(element, -dy, css, 0);
                    break;
            }
        } else {
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
    }
}

export function resizeBottom(element, css, dy, cache) {
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

export function resizeLeft(element, css, dx, cache) {
    switch (cache.move_hori_type) {
        case "left right":
            cache.valueB = setLeft(element, dx, css, cache.valueB);
            break;
        case "left":
            cache.valueA = setLeft(element, dx, css, cache.valueA);
            setWidth(element, dx, css, 1);
            break;
        case "right":
            setWidth(element, dx, css, 1);
            break;
    }
}

export function resizeRight(element, css, dx, cache) {
    switch (cache.move_hori_type) {
        case "left right":
            cache.valueB = setRight(element, -dx, css, cache.valueB);
            break;
        case "left":
            setWidth(element, -dx, css, 1);
            break;
        case "right":
            cache.valueB = setRight(element, -dx, css, cache.valueB);
            setWidth(element, -dx, css, 1);
            break;
    }
}

export function SCALEL(system, element, component, d, nn, IS_COMPONENT) {
    if (IS_COMPONENT) {
        component.x += d;
        component.width -= d;
    } else {
        let cache = CacheFactory(system, element, component);
        resizeLeft(element, cache.rules, d, cache);
    }
}
export function SCALER(system, element, component, d, nn, IS_COMPONENT) {
    if (IS_COMPONENT) {
        component.width += d;
    } else {
        let cache = CacheFactory(system, element, component);
        resizeRight(element, cache.rules, d, cache);
    }
}
export function SCALET(system, element, component, d, nn, IS_COMPONENT) {
    if (IS_COMPONENT) {
        component.y += d;
        component.height -= d;
    } else {
        let cache = CacheFactory(system, element, component);
        resizeTop(system, element, component, cache.rules, d, cache);
    }
}
export function SCALEB(system, element, component, d, nn, IS_COMPONENT) {
    if (IS_COMPONENT) {
        component.height += d;
    } else {
        let cache = CacheFactory(system, element, component);
        resizeBottom(element, cache.rules, d, cache);
    }
}
export function SCALETL(system, element, component, dx, dy, IS_COMPONENT) {
    SCALET(system, element, component, dy, dx, IS_COMPONENT);
    SCALEL(system, element, component, dx, dy, IS_COMPONENT);
}
export function SCALEBL(system, element, component, dx, dy, IS_COMPONENT) {
    SCALEB(system, element, component, dy, dx, IS_COMPONENT);
    SCALEL(system, element, component, dx, dy, IS_COMPONENT);
}
export function SCALETR(system, element, component, dx, dy, IS_COMPONENT) {
    SCALET(system, element, component, dy, dx, IS_COMPONENT);
    SCALER(system, element, component, dx, dy, IS_COMPONENT);
}
export function SCALEBR(system, element, component, dx, dy, IS_COMPONENT) {
    SCALEB(system, element, component, dy, dx, IS_COMPONENT);
    SCALER(system, element, component, dx, dy, IS_COMPONENT);
}