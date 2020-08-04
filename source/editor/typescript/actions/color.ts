import { css } from "../env.js";

let types = css.types;

import { setValue } from "./common.js";

//set background color
export function SETBACKGROUNDCOLOR(system, component, element, r, g, b, a = 1) {
	let color = new types.color(r, g, b, a);
	setValue(system, component, element, "background_color", color);
	prepUIUpdate(system, component, element, "STYLE");
}
//set background image
//set font color
export function SETCOLOR(system, component, element, r, g, b, a = 1) {
	let color = new types.color(r, g, b, a);
	setValue(system, component, element, "color", color);
	prepUIUpdate(system, component, element, "STYLE");
}
//set font image
