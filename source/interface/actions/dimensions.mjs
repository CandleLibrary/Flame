import { setNumericValue, getRatio, ensureBlocklike, prepRebuild } from "./common";

export function SETWIDTH(system, component, element, x, LINKED = false) {
    ensureBlocklike(system, component, element);

    const excess = setNumericValue("width", system, component, element, x, setNumericValue.parent_width);

    prepRebuild(element, LINKED);

    return { excess_x: excess, ratio: 0 };
}

export function SETHEIGHT(system, component, element, y, LINKED = false) {
    ensureBlocklike(system, component, element);

    let excess = setNumericValue("height", system, component, element, y, setNumericValue.parent_height);

    prepRebuild(element, LINKED);

    return { excess_y: excess, ratio: 0 };
}

export function SETDELTAWIDTH(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).width),
        excess = 0;

    if (ratio > 0) {
        let { ratio : r, excess_x : e } = SETWIDTH(system, component, element, start_x + dx / ratio, true);
        ratio = r;
        excess = e;
    } else {
        let { ratio: r, excess : e } = getRatio(system, component, element, SETWIDTH, start_x, dx, "width");
        ratio = r;
        excess = e;
    }
    
    prepRebuild(element, LINKED);

    return { excess_x: excess, ratio };
}

export function SETDELTAHEIGHT(system, component, element, dy, ratio = 0, LINKED = false) {
    let start_y = parseFloat(component.window.getComputedStyle(element).height),
        excess = 0;

    if (ratio > 0) {
        let { ratio : r, excess_y : e } = SETHEIGHT(system, component, element, start_y + dy / ratio, true);
        ratio = r;
        excess = e;
    } else {
        let { ratio: r, excess : e } = getRatio(system, component, element, SETHEIGHT, start_y, dy, "height");
        ratio = r;
        excess = e;
    }

    prepRebuild(element, LINKED);

    return { excess_y:excess, ratio };
}
