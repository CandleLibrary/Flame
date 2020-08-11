import { noop } from "./common.js";
import { ActionType } from "../types/action_type";
import { Action } from "../types/action";
import { getComponentDataFromRTInstance, cloneComponentData, getIndexOfElementInRTInstance, getLastIndexInDOMLiteralTree, removeDOMLiteralAtIndex, createComponentData, removeBindingsWithinDOMLiteralIndexRange, removeUnmatchedRulesMatchingElement, createRTComponentFromComponentData, insertDOMLiteralAtIndex, replaceRTInstances, componentDataToSourceString, createNewFileURL, addComponentImport } from "../common_functions.js";
import { url } from "../env.js";
import { HistoryArtifact } from "../types/history_artifact.js";

/**
 * Creates a new component from an existing element within an existing 
 * component. If the element is already the root node of a component then
 * this action should do nothing.
 */
export const CREATE_COMPONENT = <Action>{
    type: ActionType.CREATE_COMPONENT,
    priority: -500001,
    initFN: (sys, crate) => {

        /*
         * The existing node needs to be modified with a new component that has the element replaced with 
         * a component entry.
         */
        const { comp, ele } = crate;

        if (comp.ele == ele) return;

        //Create two new components. One for the completely brand new component from element data
        //and another from the existing component that has been modified to reference the new component.
        const
            old_comp_data = getComponentDataFromRTInstance(sys, comp),
            clone_comp_data = cloneComponentData(old_comp_data),
            new_comp_data = createComponentData(),
            start_index = getIndexOfElementInRTInstance(comp, ele),
            { cloned_root, removed_node } = removeDOMLiteralAtIndex(clone_comp_data, start_index),
            end_index = getLastIndexInDOMLiteralTree(removed_node) + start_index;


        removeBindingsWithinDOMLiteralIndexRange(clone_comp_data, start_index, end_index);

        const css = removeUnmatchedRulesMatchingElement(clone_comp_data, removed_node);

        clone_comp_data.HTML = cloned_root;
        new_comp_data.HTML = removed_node;

        createRTComponentFromComponentData(sys, new_comp_data);

        //Insert a new component node into the cloned comp_data 
        const name = "comp" + sys.comp_name_counter++;
        new_comp_data.location = createNewFileURL(sys, old_comp_data.location.dir + "/" + name + sys.comp_ext);

        addComponentImport(name, clone_comp_data, new_comp_data);

        insertDOMLiteralAtIndex(clone_comp_data, start_index, {
            component_name: new_comp_data.name,
            pos: removed_node.pos,
            tag_name: name,
            attributes: removed_node.attributes
        });

        console.log(componentDataToSourceString(sys, clone_comp_data));

        console.log(componentDataToSourceString(sys, new_comp_data));

        createRTComponentFromComponentData(sys, clone_comp_data);

        replaceRTInstances(sys, comp.name, clone_comp_data.name);

        const history = <HistoryArtifact>{
            type: ActionType.CREATE_COMPONENT,
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
    sealFN: noop,
    updateFN: noop,
    historyProgress: (sys, history) => { replaceRTInstances(sys, history.progress.comp_data_name, <string>history.progress.valueA); },
    historyRegress: (sys, history) => { replaceRTInstances(sys, history.regress.comp_data_name, <string>history.regress.valueA); }

};



export const DELETE_COMPONENT = <Action>{
    type: ActionType.DELETE_COMPONENT,
    priority: -500001,
    initFN: (sys, crate) => {
        /*
            The existing node needs to be modified with a new component that has the element replaced with 
            a component entry.
        */

        const { comp, ele } = crate;

        if (comp.ele == ele) return;

        //Create two new components. One for the completely brand new component from element data
        //and another from the existing component that has been modified to reference the new component.
        const
            old_comp_data = getComponentDataFromRTInstance(sys, comp),
            clone_comp_data = cloneComponentData(old_comp_data),
            new_comp_data = createComponentData(),
            start_index = getIndexOfElementInRTInstance(comp, ele),
            { cloned_root, removed_node } = removeDOMLiteralAtIndex(clone_comp_data, start_index),
            end_index = getLastIndexInDOMLiteralTree(removed_node) + start_index;


        removeBindingsWithinDOMLiteralIndexRange(clone_comp_data, start_index, end_index);

        const css = removeUnmatchedRulesMatchingElement(clone_comp_data, removed_node);

        clone_comp_data.HTML = cloned_root;
        new_comp_data.HTML = removed_node;

        createRTComponentFromComponentData(sys, new_comp_data);

        //Insert a new component node into the cloned comp_data 

        insertDOMLiteralAtIndex(clone_comp_data, start_index, {
            component_name: new_comp_data.name,
            pos: removed_node.pos,
            tag_name: new_comp_data.name,
        });

        createRTComponentFromComponentData(sys, clone_comp_data);

        replaceRTInstances(sys, comp.name, clone_comp_data.name);

        const history = <HistoryArtifact>{
            type: ActionType.DELETE_COMPONENT,
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
    sealFN: noop,
    updateFN: noop,
    historyProgress: (sys, history) => { replaceRTInstances(sys, history.progress.comp_data_name, <string>history.progress.valueA); },
    historyRegress: (sys, history) => { replaceRTInstances(sys, history.regress.comp_data_name, <string>history.regress.valueA); }
}
};

