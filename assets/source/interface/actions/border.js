import { setNumericalValue, getRatio, setValue } from "./common";
import {SETDELTALEFT, SETDELTATOP} from "./position";

import { CacheFactory } from "./cache";

import wick from "@galactrax/wick";


let types = wick.core.css.types;

function resetBorder(system, element, component) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    if (css.props.border) {
        //Convert border value into 
        css.props.border = null;
    }
}

export function SETBORDERLEFT(system, element, component, x, LINKED = false) {
    resetBorder(system, element, component);
    setNumericalValue("border_left_width", system, element, component, x, setNumericalValue.parent_width);
    if (!LINKED) element.wick_node.setRebuild();
}

export function SETDELTABORDERLEFT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["border-left-width"]);

    if (ratio > 0)
        SETBORDERLEFT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETBORDERLEFT, start_x, dx, "border-left-width");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

export function SETBORDERTOP(system, element, component, x, LINKED = false) {
    resetBorder(system, element, component);
    setNumericalValue("border_top_width", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}

export function SETDELTABORDERTOP(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["border-top-width"]);

    if (ratio > 0)
        SETBORDERTOP(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETBORDERTOP, start_x, dx, "border-top-width");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

export function SETBORDERRIGHT(system, element, component, x, LINKED = false) {
    resetBorder(system, element, component);
    setNumericalValue("border_right_width", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}


export function SETDELTABORDERRIGHT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["border-right-width"]);

    if (ratio > 0)
        SETBORDERRIGHT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETBORDERRIGHT, start_x, dx, "border-right-width");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

export function SETBORDERBOTTOM(system, element, component, x, LINKED = false) {
    resetBorder(system, element, component);
    setNumericalValue("border_bottom_width", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}


export function SETDELTABORDERBOTTOM(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["border-bottom-width"]);

    if (ratio > 0)
        SETBORDERBOTTOM(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETBORDERBOTTOM, start_x, dx, "border-bottom-width");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

export function RESIZEBORDERT(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

export function RESIZEBORDERR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERRIGHT(system, element, component, -dx, 0, true);
    element.wick_node.setRebuild();
}

export function RESIZEBORDERL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERLEFT(system, element, component, dx, 0, true);
    element.wick_node.setRebuild();
}

export function RESIZEBORDERB(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERBOTTOM(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
}

export function RESIZEBORDERTL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    let cache = CacheFactory(system, element, component);

    if((cache.cssflagsA & 1)){
        SETDELTALEFT(system, element, component, dx, 0, true);
        SETDELTATOP(system, element, component, dy, 0, true);
    }

    SETDELTABORDERLEFT(system, element, component, -dx, 0, true);
    SETDELTABORDERTOP(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
}

export function RESIZEBORDERTR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERRIGHT(system, element, component, dx, 0, true);
    SETDELTABORDERTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

export function RESIZEBORDERBL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERLEFT(system, element, component, dx, 0, true);
    SETDELTABORDERBOTTOM(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

export function RESIZEBORDERBR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERRIGHT(system, element, component, dx, 0, true);
    SETDELTABORDERBOTTOM(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

export  function BORDERRADIUSTL(system, element, component, d){
    setValue(system, element, component, "border_top_left_radius", new types.length(d, "px"));
    element.wick_node.setRebuild();
}

export  function BORDERRADIUSTR(system, element, component, d){
    setValue(system, element, component, "border_top_right_radius", new types.length(d, "px"));
    element.wick_node.setRebuild();
}

export  function BORDERRADIUSBL(system, element, component, d){
    setValue(system, element, component, "border_bottom_left_radius", new types.length(d, "px"));
    element.wick_node.setRebuild();
}

export  function BORDERRADIUSBR(system, element, component, d){
    setValue(system, element, component, "border_bottom_right_radius", new types.length(d, "px"));
    element.wick_node.setRebuild();
}