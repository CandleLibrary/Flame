import { DOMLiteral, Component } from "@candlefw/wick";
import { Action } from "../types/action.js";
import { ActionType } from "../types/action_type.js";
import { FlameSystem } from "../types/flame_system.js";
import { HistoryArtifact } from "../types/history_artifact.js";
import { getElementIndex, getElementFromIndex, getComponents, getComponentData } from "../system.js";

export async function UPDATE_ELEMENT_OUTERHTML(system, component, element, outer_html) {
	//TODO - Collect old html data and store as history
	if (await element.wick_node.reparse(outer_html))
		system.ui.update();
}

function getComponentDataHTMLNode(component: Component, requested_index: number, actual = { i: 0 }, node: DOMLiteral = null): DOMLiteral {
	if (!node)
		node = component.HTML;

	if (requested_index == actual.i)
		return node;

	let out = null;

	if (node.children)
		for (const c_node of node.children) {
			actual.i++;
			if ((out = getComponentDataHTMLNode(component, requested_index, actual, c_node))) return out;
		}

	return null;
}

export function deleteDomLiteralAttribute(node: DOMLiteral, name: string) {
	if (node.attributes) {
		for (let i = 0; i < node.attributes.length; i++)
			if (node.attributes[i][0] == name)
				return node.attributes.splice(i, 1);
	}
}

export function setDomLiteralAttribute(node: DOMLiteral, name: string, val: string) {

	if (!node.attributes)
		node.attributes = [];

	for (let i = 0; i < node.attributes.length; i++)
		if (node.attributes[i][0] == name)
			return node.attributes[i][1] = val;

	node.attributes.push([name, val]);
}

function histSetAttribute(sys: FlameSystem, history: HistoryArtifact, FOREWARD = true) {

	const { comp_data_name, ele_index, valueA, valueB } = FOREWARD ? history.progress : history.regress;

	const component_data = getComponentData(sys, comp_data_name);

	const ele = getComponentDataHTMLNode(component_data, ele_index);

	if (!ele) throw new ReferenceError("Missing element when trying to apply attribute information.");

	if (!valueA)
		deleteDomLiteralAttribute(ele, <string>valueB);
	else
		setDomLiteralAttribute(ele, <string>valueA, <string>valueB);

	//Apply value to all components of type;
	getComponents(sys, history.progress.comp_data_name)
		.forEach(comp => {
			const ele = getElementFromIndex(comp, ele_index);

			if (!ele) throw new ReferenceError("Missing element when trying to apply attribute information.");

			if (!valueA)
				ele.removeAttribute(<string>valueB);
			else
				ele.setAttribute(<string>valueA, <string>valueB);
		});
}

export const SET_ATTRIBUTE = <Action>{
	type: ActionType.SET_ATTRIBUTE,
	priority: -20,
	sealFN: (sys, crate) => { },
	initFN: (sys, crate) => {
		const
			{ key, val } = crate.data,
			{ ele, comp } = crate,
			ele_index = getElementIndex(comp, ele),
			data = ele.getAttribute(key),
			old_key = data ? key : "",
			old_val = data || key;



		if (key) {
			return [{
				type: ActionType.SET_ATTRIBUTE,
				progress: {
					comp_data_name: comp.name,
					ele_index: ele_index,
					valueA: key,
					valueB: val,
				},
				regress: {
					comp_data_name: comp.name,
					ele_index: ele_index,
					valueA: old_key,
					valueB: old_val,
				}
			}];
		}
	},
	updateFN: (sys, crate) => { },
	historyProgress: histSetAttribute,
	historyRegress: histSetAttribute
};

export const DELETE_ATTRIBUTE = <Action>{
	type: ActionType.DELETE_ATTRIBUTE,
	priority: -20,
	sealFN: (sys, crate) => { },
	initFN: (sys, crate) => {
		const
			{ key, val } = crate.data,
			{ ele, comp } = crate,
			ele_index = getElementIndex(comp, ele),
			data = ele.getAttribute(key),
			old_key = data ? key : "",
			old_val = data || key;

		if (key) {
			return [{
				type: ActionType.DELETE_ATTRIBUTE,
				progress: {
					comp_data_name: comp.name,
					ele_index: ele_index,
					valueA: "",
					valueB: key,
				},
				regress: {
					comp_data_name: comp.name,
					ele_index: ele_index,
					valueA: old_key,
					valueB: old_val,
				}
			}];
		}
	},
	updateFN: (sys, crate) => { },
	historyProgress: histSetAttribute,
	historyRegress: histSetAttribute
};

/**
 * Insert a new element before the selected element, or after the root element of a component
 */
export const CREATE_ELEMENT = <Action>{
	type: ActionType.CREATE_ELEMENT,
	priority: -500000, //Should always come first. except for delete element
	sealFN: (sys, crate) => { },
	initFN: (sys, crate) => {
		const
			{ val, data } = crate.data,
			{ ele, comp } = crate;

		//Index of element 
		const ele_index = getElementIndex(comp, ele);

		//Either root element or immediately adjacent node.
		const new_ele = sys.document.createElement(val);
		new_ele.innerHTML = data;

		if (ele == comp.ele)
			ele.insertBefore(new_ele, comp.ele.firstChild);
		else
			ele.insertBefore(new_ele, ele);

		return [{
			type: ActionType.CREATE_ELEMENT,
			progress: {
				comp_data_name: comp.name,
				ele_index: ele_index,
				valueA: val,
				valueB: key,
			},
			regress: {
				comp_data_name: comp.name,
				ele_index: ele_index,
				valueA: ele_index + 1,
			}
		}];

	},
	updateFN: (sys, crate) => { },
	historyProgress: (sys, history) => {

	},
	historyRegress: (sys, history) => { }
};