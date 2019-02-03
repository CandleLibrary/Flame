import {CSSParser} from "@candlefw/css";

import { setNumericValue, getRatio, setValue,getFirstPositionedAncestor, prepRebuild } from "./common";
import {SETDELTALEFT, SETDELTATOP} from "./position";

import { CacheFactory } from "./cache";



let types = CSSParser.types;

function resetBorder(system, component, element) {
    return 
    let cache = CacheFactory(system, component, element);
    let css = cache.rules;
    if (css.props.border) {
        //Convert border value into 
        css.props.border = null;
    }
}

export function SETBORDERLEFT(system, component, element, x, LINKED = false) {
    resetBorder(system, component, element);
    setNumericValue("border_left_width", system, component, element, x, setNumericValue.parent_width);
    if (!LINKED) element.wick_node.prepRebuild();
}

export function SETDELTABORDERLEFT(system, component, element, dx, ratio = 0, LINKED = false) {


    let start_x = parseFloat(component.window.getComputedStyle(element)["border-left-width"]);


    if (ratio > 0)
        SETBORDERLEFT(system, component, element, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, component, element, SETBORDERLEFT, start_x, dx, "border-left-width");

    if (!LINKED) element.wick_node.prepRebuild();

    return ratio;
}

export function SETBORDERTOP(system, component, element, x, LINKED = false) {
    resetBorder(system, component, element);
    setNumericValue("border_top_width", system, component, element, x, setNumericValue.parent_height);
    if (!LINKED) element.wick_node.prepRebuild();
}

export function SETDELTABORDERTOP(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["border-top-width"]);

    if (ratio > 0)
        SETBORDERTOP(system, component, element, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, component, element, SETBORDERTOP, start_x, dx, "border-top-width");

    if (!LINKED) element.wick_node.prepRebuild();

    return ratio;
}

export function SETBORDERRIGHT(system, component, element, x, LINKED = false) {
    resetBorder(system, component, element);
    setNumericValue("border_right_width", system, component, element, x, setNumericValue.parent_height);
    if (!LINKED) element.wick_node.prepRebuild();
}


export function SETDELTABORDERRIGHT(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["border-right-width"]);

    if (ratio > 0)
        SETBORDERRIGHT(system, component, element, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, component, element, SETBORDERRIGHT, start_x, dx, "border-right-width");

    if (!LINKED) element.wick_node.prepRebuild();

    return ratio;
}

export function SETBORDERBOTTOM(system, component, element, x, LINKED = false) {
    resetBorder(system, component, element);
    setNumericValue("border_bottom_width", system, component, element, x, setNumericValue.parent_height);
    if (!LINKED) element.wick_node.prepRebuild();
}


export function SETDELTABORDERBOTTOM(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["border-bottom-width"]);

    if (ratio > 0)
        SETBORDERBOTTOM(system, component, element, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, component, element, SETBORDERBOTTOM, start_x, dx, "border-bottom-width");

    if (!LINKED) element.wick_node.prepRebuild();

    return ratio;
}

export function RESIZEBORDERT(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERTOP(system, component, element, dy, 0, true);
    element.wick_node.prepRebuild();
}

export function RESIZEBORDERR(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERRIGHT(system, component, element, -dx, 0, true);
    element.wick_node.prepRebuild();
}

export function RESIZEBORDERL(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERLEFT(system, component, element, dx, 0, true);
    element.wick_node.prepRebuild();
}

export function RESIZEBORDERB(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERBOTTOM(system, component, element, -dy, 0, true);
    element.wick_node.prepRebuild();
}

export function RESIZEBORDERTL(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    let cache = CacheFactory(system, component, element);

    if((cache.cssflagsA & 1)){
        SETDELTALEFT(system, component, element, dx, 0, true);
        SETDELTATOP(system, component, element, dy, 0, true);
    }

    SETDELTABORDERLEFT(system, component, element, -dx, 0, true);
    SETDELTABORDERTOP(system, component, element, -dy, 0, true);
    prepRebuild(element)
    //element.wick_node.prepRebuild();
}

export function RESIZEBORDERTR(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERRIGHT(system, component, element, dx, 0, true);
    SETDELTABORDERTOP(system, component, element, dy, 0, true);
    prepRebuild(element)
    //element.wick_node.prepRebuild();
}

export function RESIZEBORDERBL(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERLEFT(system, component, element, dx, 0, true);
    SETDELTABORDERBOTTOM(system, component, element, dy, 0, true);
    element.wick_node.prepRebuild();
}

export function RESIZEBORDERBR(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERRIGHT(system, component, element, dx, 0, true);
    SETDELTABORDERBOTTOM(system, component, element, dy, 0, true);
    element.wick_node.prepRebuild();
}

export  function BORDERRADIUSTL(system, component, element, d){
    setValue(system, component, element, "border_top_left_radius", new types.length(d, "px"));
    element.wick_node.prepRebuild();
}

export  function BORDERRADIUSTR(system, component, element, d){

    setValue(system, component, element, "border_top_right_radius", new types.length(d, "px"));
    element.wick_node.prepRebuild();
}

export  function BORDERRADIUSBL(system, component, element, d){
    setValue(system, component, element, "border_bottom_left_radius", new types.length(d, "px"));
    element.wick_node.prepRebuild();
}

export  function BORDERRADIUSBR(system, component, element, d){
    setValue(system, component, element, "border_bottom_right_radius", new types.length(d, "px"));
    element.wick_node.prepRebuild();
}
