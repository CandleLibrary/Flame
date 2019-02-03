import { setNumericValue, getRatio, ensureBlocklike, prepRebuild} from "./common";

export function SETWIDTH(system, component, element, x, LINKED = false) {

    ensureBlocklike(system, component, element);
    setNumericValue("width", system, component, element, x, setNumericValue.parent_width);
    prepRebuild(element, LINKED);
}

export function SETHEIGHT(system, component, element, x, LINKED = false) {

    ensureBlocklike(system, component, element);
    setNumericValue("height", system, component, element, x, setNumericValue.parent_height);
    prepRebuild(element, LINKED);
}

export function SETDELTAWIDTH(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).width);

    if (ratio > 0)
        SETWIDTH(system, component, element, start_x + dx / ratio, true);
    else {
        ensureBlocklike(system, component, element);
        ratio = getRatio(system, component, element, SETWIDTH, start_x, dx, "width");
    }
    prepRebuild(element, LINKED);

    return ratio;
}

export function SETDELTAHEIGHT(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).height);
    
    if (ratio > 0)
        SETHEIGHT(system, component, element, start_x + dx / ratio, true);
    else {
        ensureBlocklike(system, component, element);
        ratio = getRatio(system, component, element, SETHEIGHT, start_x, dx, "height");
    }
    
    prepRebuild(element, LINKED);
    return ratio;
}
