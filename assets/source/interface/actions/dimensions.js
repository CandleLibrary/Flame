import { setNumericalValue, getRatio } from "./common";

export function SETWIDTH(system, element, component, x, LINKED = false) {
    setNumericalValue("width", system, element, component, x, setNumericalValue.parent_width);
    if (!LINKED) element.wick_node.setRebuild();
}

export function SETHEIGHT(system, element, component, x, LINKED = false) {
    setNumericalValue("height", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}

export function SETDELTAWIDTH(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).width);

    if (ratio > 0)
        SETWIDTH(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETWIDTH, start_x, dx, "width");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

export function SETDELTAHEIGHT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).height);
    
    if (ratio > 0)
        SETHEIGHT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETHEIGHT, start_x, dx, "height");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}