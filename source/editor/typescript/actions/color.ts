import { css } from "../env.js";
import { setValue } from "./common.js";
import { ActionType } from "../types/action_type.js";
import { sealCSS, updateCSS } from "./position.js";
import { Action } from "../types/action.js";

//set background color

export const SETBACKGROUNDCOLOR = <Action>{
	type: ActionType.SET_CSS,
	priority: 0,
	sealFN: sealCSS,
	initFN: (sys, crate, ratio) => {
		const { r, g, b, a } = crate.data;
		setValue(crate, "background_color", new css.types.color(r, g, b, a));
	},
	updateFN: (sys, crate, ratio) => {
		const { r, g, b, a } = crate.data;
		setValue(crate, "background_color", new css.types.color(r, g, b, a));
	},
	historyProgress: updateCSS,
	historyRegress: updateCSS
};

//set background image
//set font color


export const SETCOLOR = <Action>{
	type: ActionType.SET_CSS,
	priority: 0,
	sealFN: sealCSS,
	initFN: (sys, crate, ratio) => {
		const { r, g, b, a } = crate.data;
		setValue(crate, "color", new css.types.color(r, g, b, a));
	},
	updateFN: (sys, crate, ratio) => {
		const { r, g, b, a } = crate.data;
		setValue(crate, "color", new css.types.color(r, g, b, a));
	},
	historyProgress: updateCSS,
	historyRegress: updateCSS
};
//set font image
