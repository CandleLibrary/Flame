import { setNumericalValue, getRatio, ensureBlocklike, setRebuild} from "./common";

export function SETWIDTH(system, element, component, x, LINKED = false) {

    ensureBlocklike(system, component, element);
    setNumericalValue("width", system, element, component, x, setNumericalValue.parent_width);
    setRebuild(element, LINKED);
}

export function SETHEIGHT(system, element, component, x, LINKED = false) {

    ensureBlocklike(system, component, element);
    setNumericalValue("height", system, element, component, x, setNumericalValue.parent_height);
    setRebuild(element, LINKED);
}

export function SETDELTAWIDTH(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).width);

    if (ratio > 0)
        SETWIDTH(system, element, component, start_x + dx / ratio, true);
    else {
        ensureBlocklike(system, component, element);
        ratio = getRatio(system, element, component, SETWIDTH, start_x, dx, "width");
    }
    setRebuild(element, LINKED);

    return ratio;
}

export function SETDELTAHEIGHT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).height);
    
    if (ratio > 0)
        SETHEIGHT(system, element, component, start_x + dx / ratio, true);
    else {
        ensureBlocklike(system, component, element);
        ratio = getRatio(system, element, component, SETHEIGHT, start_x, dx, "height");
    }
    
    setRebuild(element, LINKED);
    return ratio;
}