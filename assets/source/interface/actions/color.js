import {CSSParser} from "@galactrax/wick";

let types = CSSParser.types;

import {setValue} from "./common";

//set background color
export function SETBACKGROUNDCOLOR(system, element, component, r, g, b, a = 1){
	let color = new types.color(r,g,b,a);
	setValue(system, element, component, "background_color", color);
	element.wick_node.setRebuild();
}
//set background image
//set font color
export function SETCOLOR(system, element, component, r, g, b, a = 1){
	let color = new types.color(r,g,b,a);
	setValue(system, element, component, "color", color);
	element.wick_node.setRebuild();
}
//set font image
