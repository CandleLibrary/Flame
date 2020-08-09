import { DOMLiteral, Component, RuntimeComponent } from "@candlefw/wick";
import { Action } from "../types/action.js";
import { ActionType } from "../types/action_type.js";
import { FlameSystem } from "../types/flame_system.js";
import { HistoryArtifact } from "../types/history_artifact.js";
import {
	getElementIndex,
	getElementFromIndex,
	getComponentDataFromName,
	getActiveComponentInstances
} from "../common_functions.js";

function histSetAttribute(sys: FlameSystem, history: HistoryArtifact, FOREWARD = true) {

	const { comp_data_name, ele_index, valueA, valueB } = FOREWARD ? history.progress : history.regress;

	const component_data = getComponentDataFromName(sys, comp_data_name);

	const ele = getComponentDataHTMLNode(component_data, ele_index);

	if (!ele) throw new ReferenceError("Missing element when trying to apply attribute information.");

	if (!valueA)
		deleteDomLiteralAttribute(ele, <string>valueB);
	else
		setDomLiteralAttribute(ele, <string>valueA, <string>valueB);

	//Apply value to all components of type;
	getActiveComponentInstances(sys, history.progress.comp_data_name)
		.forEach(comp => {
			const ele = getElementFromIndex(comp, ele_index);

			if (!ele) throw new ReferenceError("Missing element when trying to apply attribute information.");

			if (!valueA)
				ele.removeAttribute(<string>valueB);
			else
				ele.setAttribute(<string>valueA, <string>valueB);
		});

	return [];
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
			{ tag, data, target } = crate.data,
			{ ele, comp } = crate;

		let target_element = ele, target_parent = ele.parentElement, INSERT_IN_ELEMENT = false;

		switch (target) {
			case "after":
				target_element = <HTMLElement>ele.nextSibling;
				break;

			case "before":
				target_element = <HTMLElement>ele;
				break;

			case "self":
			default:
				target_element = <HTMLElement>ele;
				INSERT_IN_ELEMENT = true;
				break;
		}

		//Index of element 
		const
			ele_index = getElementIndex(comp, target_element),
			history = {
				type: ActionType.CREATE_ELEMENT,
				progress: {
					comp_data_name: comp.name,
					ele_index: ele_index,
					valueA: tag.toLowerCase(),
					valueB: "Test DATA MASNT",
					valueC: (+INSERT_IN_ELEMENT)
				},
				regress: {
					comp_data_name: comp.name,
					ele_index: ele_index + (+INSERT_IN_ELEMENT)
				},
				DO_NOT_CALL_AFTER_UPDATE: true
			};

		CREATE_ELEMENT.historyProgress(sys, history, true);

		return [history];
	},

	updateFN: (sys, crate) => { },
	historyProgress: (sys, history) => {

		const {
			comp_data_name: name,
			ele_index,
			valueA: tag,
			valueB: inner_html,
			valueC: INSERT_INTO_COMPONENT
		} = history.progress,
			comp = getComponentDataFromName(sys, name);

		insertHTMLNodeIntoIndexSlot(comp, ele_index, {
			tag_name: history.progress.valueA,
			attributes: [],
			children: [{
				tag_name: "",
				data: inner_html
			}]
		});

		//find the element with existing index.
		for (const comp of getActiveComponentInstances(sys, name,)) {
			const ele = sys.document.createElement(<string>tag);
			ele.innerHTML = <string>inner_html;
			insertComponentElementAtIndex(comp, ele_index, ele, !!INSERT_INTO_COMPONENT);
		}

		return [history.progress.comp_data_name];
	},
	historyRegress: (sys, history) => {

		const {
			comp_data_name: name,
			ele_index,
		} = history.regress,
			comp = getComponentDataFromName(sys, name);

		removeHTMLNodeFromeIndexSlot(comp, ele_index);

		//find the element with existing index.
		for (const comp of getActiveComponentInstances(sys, name,))
			removeComponentElementAtIndex(comp, ele_index);

		return [history.regress.comp_data_name];
	}
};

export function insertComponentElementAtIndex(comp: RuntimeComponent, index: number, ele: HTMLElement, APPEND_TO_ELEMENT: boolean = false;) {

	const
		elu = comp.elu,
		target_ele = elu[index],
		parent = target_ele.parentElement;

	if (APPEND_TO_ELEMENT) {
		target_ele.insertBefore(ele, target_ele.firstChild);
		elu.splice(index + 1, 0, ele);
	} else if (index > elu.length) {
		elu.push(ele);
		comp.ele.appendChild(ele);
	} else if (index == 0) {
		elu.unshift(ele);
		comp.ele.insertBefore(ele, comp.ele.firstChild);
	} else {
		elu.splice(index, 0, ele);
		parent.insertBefore(ele, target_ele);
	}
}

export function removeComponentElementAtIndex(comp: RuntimeComponent, index: number) {

	const
		elu = comp.elu,
		target_ele = elu[index];

	target_ele.parentElement.removeChild(target_ele);

	elu.splice(index, 1);
}

function insertHTMLNodeIntoIndexSlot(comp: Component, insert_before_index, ele: DOMLiteral, actual = { i: 0 }, node: DOMLiteral = null) {

	if (!node)
		node = comp.HTML;

	if (insert_before_index == 0) {
		if (!node.children)
			node.children = [];
		node.children.unshift(ele);
		return true;
	} else if (node.children) {
		actual.i++;

		for (let i = 0; i < node.children.length; i++, actual.i++) {

			if (actual.i == insert_before_index)
				return node.children.splice(i, 0, ele), true;

			if (insertHTMLNodeIntoIndexSlot(comp, insert_before_index, ele, actual, node.children[i]))
				return true;
		}

		node.children.push(ele);

		return true;
	}

	return false;
}


function removeHTMLNodeFromeIndexSlot(comp: Component, index_to_remove: number, actual = { i: 0 }, node: DOMLiteral = null) {

	if (!node)
		node = comp.HTML;

	if (index_to_remove == 0) {
		if (!node.children)
			node.children = [];
		node.children.shift();
		return true;
	} else if (node.children) {
		actual.i++;

		for (let i = 0; i < node.children.length; i++, actual.i++) {

			if (actual.i == index_to_remove)
				return node.children.splice(i, 1), true;

			if (removeHTMLNodeFromeIndexSlot(comp, index_to_remove, actual, node.children[i]))
				return true;
		}
	}

	return false;
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

export async function UPDATE_ELEMENT_OUTERHTML(system, component, element, outer_html) {
	//TODO - Collect old html data and store as history
	if (await element.wick_node.reparse(outer_html))
		system.ui.update();
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