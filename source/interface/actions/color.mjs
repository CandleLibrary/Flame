import * as css from "@candlefw/css"

let types = css.types;

import {setValue} from "./common";

//set background color
export function SETBACKGROUNDCOLOR(system, component, element, r, g, b, a = 1){
	let color = new types.color(r,g,b,a);
	setValue(system, component, element, "background_color", color);
	element.wick_node.prepRebuild();
}
//set background image
//set font color
export function SETCOLOR(system, component, element, r, g, b, a = 1){
	let color = new types.color(r,g,b,a);
	setValue(system, component, element, "color", color);
	element.wick_node.prepRebuild();
}
//set font image
