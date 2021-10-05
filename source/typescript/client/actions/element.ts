import { Action } from "../types/action.js";
import { ActionType } from "../types/action_type.js";
import { FlameSystem } from "../types/flame_system.js";
import { HistoryArtifact } from "../types/history_artifact.js";
import {
	getIndexOfElementInRTInstance,
	getElementAtIndexInRTInstance,
	getComponentDataFromName,
	getRTInstances,
	getComponentDataFromRTInstance,
	cloneComponentData,
	replaceRTInstances,
	getLastIndexInDOMLiteralTree,
	removeBindingsWithinDOMLiteralIndexRange,
	removeUnmatchedRulesMatchingElement,
	createRTComponentFromComponentData,
	insertDOMLiteralAtIndex,
	removeDOMLiteralAtIndex,
	insertElementAtIndexInRTInstance,
	removeElementAtIndexInRTInstance,
	getDOMLiteralAtIndex,
	removeDOMLiteralAttribute,
	setDOMLiteralAttribute
} from "../common_functions.js";
import { noop } from "./common.js";

function histSetAttribute(sys: FlameSystem, history: HistoryArtifact, FOREWARD = true) {

	const { comp_data_name, ele_index, valueA, valueB } = FOREWARD ? history.progress : history.regress;

	let ele = null;

	if (sys.harness.name == comp_data_name) {

		const ele = sys.edited_components.components[ele_index].frame;

		if (!ele) throw new ReferenceError("Missing frame element when trying to apply attribute information.");

		if (!valueA)
			ele.removeAttribute(<string>valueB);
		else
			ele.setAttribute(<string>valueA, <string>valueB);

	} else {

		const component_data = getComponentDataFromName(sys, comp_data_name);

		ele = getDOMLiteralAtIndex(component_data, ele_index);

		if (!ele) throw new ReferenceError("Missing element when trying to apply attribute information.");

		if (!valueA)
			removeDOMLiteralAttribute(ele, <string>valueB);
		else
			setDOMLiteralAttribute(ele, <string>valueA, <string>valueB);

		for (const comp of getRTInstances(sys, history.progress.comp_data_name)) {

			const ele = getElementAtIndexInRTInstance(comp, ele_index);

			if (!ele) throw new ReferenceError("Missing element when trying to apply attribute information.");

			if (!valueA)
				ele.removeAttribute(<string>valueB);
			else
				ele.setAttribute(<string>valueA, <string>valueB);
		};
	}

	return [];
}

export const SET_ATTRIBUTE = <Action>{
	type: ActionType.SET_ATTRIBUTE,
	priority: -20,
	sealFN: (sys, crate) => { },
	initFN: (sys, crate) => {
		const
			{ key, val } = crate.data,
			{ ele, comp } = crate.sel,
			ele_index = getIndexOfElementInRTInstance(comp, ele, sys),
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
			{ ele, comp } = crate.sel,
			ele_index = getIndexOfElementInRTInstance(comp, ele, sys),
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
 * Delete existing element, except the root element.
 * 
 * Remove any listeners that may be on the element.
 * 
 * Any function that updates the element or it's descendants must be removed.
 * 
 * Moving an element will cause the 
 */
export const DELETE_ELEMENT = <Action>{
	type: ActionType.DELETE_ELEMENT,
	priority: -500000, //Should always come first. except for delete element
	sealFN: noop,
	initFN: (sys, crate) => {
		const { comp, ele } = crate.sel;
		if (comp.ele == ele) return;

		const
			old_comp_data = getComponentDataFromRTInstance(sys, comp),
			clone_comp_data = cloneComponentData(old_comp_data),
			start_index = getIndexOfElementInRTInstance(comp, ele, sys),
			{ cloned_root: clone_root, removed_node: old_node } = removeDOMLiteralAtIndex(clone_comp_data, start_index),
			end_index = getLastIndexInDOMLiteralTree(old_node) + start_index;


		clone_comp_data.HTML = clone_root;

		removeBindingsWithinDOMLiteralIndexRange(clone_comp_data, start_index, end_index);

		removeUnmatchedRulesMatchingElement(clone_comp_data, old_node);

		createRTComponentFromComponentData(sys, clone_comp_data);

		replaceRTInstances(sys, comp.name, clone_comp_data.name);

		//remove the element from the source component

		const history = <HistoryArtifact>{
			type: ActionType.DELETE_ELEMENT,
			progress: {
				comp_data_name: comp.name,
				ele_index: start_index,
				valueA: clone_comp_data.name
			},
			regress: {
				comp_data_name: clone_comp_data.name,
				ele_index: start_index,
				valueA: comp.name
			},
			DO_NOT_CALL_AFTER_UPDATE: true
		};

		return [history];
	},
	updateFN: noop,
	historyProgress: (sys, history) => { replaceRTInstances(sys, history.progress.comp_data_name, <string>history.progress.valueA); },
	historyRegress: (sys, history) => { replaceRTInstances(sys, history.regress.comp_data_name, <string>history.regress.valueA); }
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
			{ ele, comp } = crate.sel;

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
			ele_index = getIndexOfElementInRTInstance(comp, target_element),
			history = <HistoryArtifact>{
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

		insertDOMLiteralAtIndex(comp, ele_index, {
			tag_name: <string>history.progress.valueA,
			attributes: [],
			children: [{
				tag_name: "",
				data: <string>inner_html,
			}]
		});

		//find the element with existing index.
		for (const comp of getRTInstances(sys, name)) {
			const ele = sys.document.createElement(<string>tag);
			ele.innerHTML = <string>inner_html;
			insertElementAtIndexInRTInstance(comp, ele_index, ele, !!INSERT_INTO_COMPONENT);
		}

		return [history.progress.comp_data_name];
	},
	historyRegress: (sys, history) => {

		const {
			comp_data_name: name,
			ele_index,
		} = history.regress,
			comp = getComponentDataFromName(sys, name);

		removeDOMLiteralAtIndex(comp, ele_index);

		//find the element with existing index.
		for (const comp of getRTInstances(sys, name))
			removeElementAtIndexInRTInstance(comp, ele_index);

		return [history.regress.comp_data_name];
	}
};
