
import { ComponentData } from "@candlelib/wick";
import { noop } from "./common.js";
import { ActionType } from "../types/action_type";
import { Action } from "../types/action";
import {
    getComponentDataFromRTInstance,
    cloneComponentData,
    getIndexOfElementInRTInstance,
    getLastIndexInDOMLiteralTree,
    removeDOMLiteralAtIndex,
    createComponentData,
    removeBindingsWithinDOMLiteralIndexRange,
    removeUnmatchedRulesMatchingElement,
    createRTComponentFromComponentData,
    insertDOMLiteralAtIndex,
    replaceRTInstances,
    componentDataToSourceString,
    createNewFileURL,
    addComponentImport
} from "../common_functions.js";
import { HistoryArtifact } from "../types/history_artifact.js";
import { DrawObject } from "../editor_model.js";
import { conflagrate, url } from "../env.js";
import { FlameSystem } from "../types/flame_system.js";

const { copy } = conflagrate;



function cloneComponent(comp: ComponentData, name: string, sys: FlameSystem): ComponentData {

    const { edit_wick } = sys;

    return <ComponentData>{
        CSS: comp.CSS ? comp.CSS.map(copy) : [],
        HAS_ERRORS: comp.HAS_ERRORS,
        HTML: comp.HTML ? copy(comp.HTML) : null,
        bindings: comp.bindings,
        children: comp.children.slice(),
        container_count: comp.container_count,
        errors: comp.errors.slice(),
        frames: comp.frames.slice(),
        root_frame: comp.root_frame,
        name: edit_wick.utils.createNameHash(name)
    };
}


/**
 * Creates a new component and places the component into the root of the editor. 
 * The new component will have a unique identifier to separate if from other 
 * components. 
 */
export const CREATE_ROOT_COMPONENT = <Action>{
    type: ActionType.CREATE_ROOT_COMPONENT,
    priority: -500001,
    initFN: (sys, crate) => {


        const { px1, py1, px2, py2 } = (<DrawObject>crate.data),
            { edit_wick: { rt: { presets }, utils: { componentDataToClass } }, edited_components } = sys;

        //retrieve default component
        const DEFAULT = presets.named_components.get("DEFAULT");

        //Copy it and insert mew component into component repo
        const new_component = cloneComponent(DEFAULT, "test", sys);

        new_component.location = new url("/components/unorganized/set.js");

        presets.components.set(new_component.name, new_component);
        presets.component_class.set(new_component.name, componentDataToClass(new_component, presets, true, true));

        const
            min_x = Math.min(px1, px2), min_y = Math.min(py1, py2),
            max_x = Math.max(px1, px2), max_y = Math.max(py1, py2);

        //mount the component to the harness
        edited_components.components.push({
            comp: new_component.name,
            frame: null,
            px: min_x,
            py: min_y,
            width: max_x - min_x,
            height: max_y - min_y
        });

        //Create new component in edit_wick space

        //create new iFrame for the component
        return [];
    },
    sealFN: noop,
    updateFN: noop,
    historyProgress: (sys, history) => { },
    historyRegress: (sys, history) => { }

};

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
            start_index = getIndexOfElementInRTInstance(comp, ele, sys),
            { cloned_root, removed_node } = removeDOMLiteralAtIndex(clone_comp_data, start_index),
            end_index = getLastIndexInDOMLiteralTree(removed_node) + start_index;


        removeBindingsWithinDOMLiteralIndexRange(clone_comp_data, start_index, end_index);

        const css = removeUnmatchedRulesMatchingElement(clone_comp_data, removed_node);

        clone_comp_data.HTML = cloned_root;
        new_comp_data.HTML = removed_node;

        const name = "comp" + sys.comp_name_counter++;

        new_comp_data.location = createNewFileURL(sys, old_comp_data.location.dir + "/" + name + sys.comp_ext);

        createRTComponentFromComponentData(sys, new_comp_data);

        //Insert a new component node into the cloned comp_data 

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
            start_index = getIndexOfElementInRTInstance(comp, ele, sys),
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
};


