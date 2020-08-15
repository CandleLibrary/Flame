import { Component } from "@candlefw/wick";
import {
    setNumericValue,
    prepRebuild
} from "./common.js";
import { getRatio, startRatioMeasure, RatioMarker, markRatioMeasure, clearRatioMeasure } from "./ratio.js";
import {
    CSSCacheFactory
} from "../cache/css_cache.js";
import {
    SETDELTAWIDTH,
    SETDELTAHEIGHT
} from "./dimensions.js";

import { css, wick } from "../env.js";
import { FlameSystem } from "../types/flame_system.js";
import { HistoryArtifact } from "../types/history_artifact.js";
import { ActionType } from "../types/action_type.js";
import { Action } from "../types/action.js";
import { ObjectCrate } from "../types/object_crate.js";
import { getComponentDataFromName } from "../common_functions.js";

const types = css.types;

/***************************************************************************************/
/********************************** POSITION SUB ACTIONS *************************************/
/***************************************************************************************/

export function SETLEFT(sys: FlameSystem, crate: ObjectCrate, val: number = 0) {

    const { comp, ele, css_cache, data: { dx } } = crate, pos = val || dx;

    if (css_cache.cssflagsA & 1)
        setNumericValue(sys, crate, "left", pos, setNumericValue.parent_width, true);
    else
        setNumericValue(sys, crate, "left", pos, setNumericValue.positioned_ancestor_width, true);

    css_cache.applyChanges(sys, 0);
}

export function SETRIGHT(sys: FlameSystem, crate: ObjectCrate, val: number = 0) {

    const { comp, ele, css_cache, data: { dx } } = crate, pos = val || dx;

    if (css_cache.cssflagsA & 1)
        setNumericValue(sys, crate, "right", pos, setNumericValue.parent_width, true);
    else
        setNumericValue(sys, crate, "right", pos, setNumericValue.positioned_ancestor_width, true);

    css_cache.applyChanges(sys, 0);
}

export function SETTOP(sys: FlameSystem, crate: ObjectCrate, val: number = 0) {

    const { comp, ele, css_cache, data: { dy } } = crate, pos = val || dy;

    if (css_cache.cssflagsA & 1)
        setNumericValue(sys, crate, "top", pos, setNumericValue.parent_height, true);
    else
        setNumericValue(sys, crate, "top", pos, setNumericValue.positioned_ancestor_height, true);

    css_cache.applyChanges(sys, 0);
}

export function SETBOTTOM(sys: FlameSystem, crate: ObjectCrate, val: number = 0) {

    const { comp, ele, css_cache, data: { dy } } = crate, pos = val || dy;

    if (css_cache.cssflagsA & 1)
        setNumericValue(sys, crate, "bottom", pos, setNumericValue.parent_height, true);
    else
        setNumericValue(sys, crate, "bottom", pos, setNumericValue.positioned_ancestor_height, true);

    css_cache.applyChanges(sys, 0);
}

/***************************************************************************************/
/********************************** DELTA SUB ACTIONS *************************************/
/***************************************************************************************/

export const SETDELTALEFT = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ delta: crate.data.dx, type: "left" }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {
        const { ele } = crate,
            value = parseFloat(sys.window.getComputedStyle(ele).left),
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;

        SETLEFT(sys, crate, value + delta);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const SETDELTARIGHT = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ delta: crate.data.dx, type: "right" }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {
        const { ele } = crate,
            value = parseFloat(sys.window.getComputedStyle(ele).right),
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;

        SETRIGHT(sys, crate, value + delta);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const SETDELTATOP = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ delta: crate.data.dy, type: "top" }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {
        const { ele } = crate,
            value = parseFloat(sys.window.getComputedStyle(ele).top),
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;

        SETTOP(sys, crate, value + delta);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};


export const SETDELTABOTTOM = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ delta: crate.data.dy, type: "bottom" }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {
        const { ele } = crate,
            value = parseFloat(sys.window.getComputedStyle(ele).bottom),
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;

        SETBOTTOM(sys, crate, value + delta);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

/***************************************************************************************/
/********************************** RESIZE ACTIONS *************************************/
/***************************************************************************************/


export const RESIZER = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ delta: crate.data.dx, type: "right" }),
    updateFN: (sys, crate, ratio) => {

        const { css_cache } = crate;

        switch (css_cache.move_hori_type) {
            case "left right":
                SETDELTARIGHT.updateFN(sys, crate, ratio, true);
                break;
            case "right":
                SETDELTAWIDTH.updateFN(sys, crate, ratio, true);
                SETDELTARIGHT.updateFN(sys, crate, ratio, false);
                break;
            case "left":
                SETDELTAWIDTH.updateFN(sys, crate, ratio, false);
                break;
        }
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const RESIZEL = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ delta: crate.data.dx, type: "left" }),
    updateFN: (sys, crate, ratio) => {

        const { css_cache } = crate;

        switch (css_cache.move_hori_type) {
            case "left right":
                SETDELTALEFT.updateFN(sys, crate, ratio, true);
                break;
            case "left":
                SETDELTAWIDTH.updateFN(sys, crate, ratio, true);
                SETDELTALEFT.updateFN(sys, crate, ratio, false);
                break;
            case "right":
                SETDELTAWIDTH.updateFN(sys, crate, ratio, true);
                break;
        }
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const RESIZET = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ delta: crate.data.dy, type: "top" }),
    updateFN: (sys, crate, ratio) => {

        const { css_cache } = crate;

        switch (css_cache.move_vert_type) {
            case "top bottom":
                SETDELTATOP.updateFN(sys, crate, ratio, true);
                break;
            case "bottom":
                SETDELTAHEIGHT.updateFN(sys, crate, ratio, true);
                break;
            case "top":
                SETDELTATOP.updateFN(sys, crate, ratio, true);
                SETDELTAHEIGHT.updateFN(sys, crate, ratio, true);
                break;
        }
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const RESIZEB = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ delta: crate.data.dy, type: "bottom" }),
    updateFN: (sys, crate, ratio) => {

        const { css_cache } = crate;

        switch (css_cache.move_vert_type) {
            case "top bottom":
                SETDELTABOTTOM.updateFN(sys, crate, ratio, false);
                break;
            case "bottom":
                SETDELTAHEIGHT.updateFN(sys, crate, ratio, false);
                SETDELTABOTTOM.updateFN(sys, crate, ratio, true);
                break;
            case "top":
                SETDELTAHEIGHT.updateFN(sys, crate, ratio, false);
                break;
        }
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export function SUBRESIZEB(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.height += dy);
    let cache = CSSCacheFactory(system, component, element);
    //get the bottom value of the element;

    if (cache.valueB == 0) {
        let rect = element.getBoundingClientRect();
        let bottom = rect.y + rect.height;
        SUBRESIZEB(system, component, element, dx, dy, 1);
        rect = element.getBoundingClientRect();
        let bottom2 = rect.y + rect.height;
        if (bottom2 - bottom !== dy) {
            let ratio = ((bottom2 - bottom) / dy);
            let diff = dy / ratio;
            if (diff !== 0) {
                SUBRESIZEB(system, component, element, dx, -diff, ratio);
                cache.valueB = ratio;
            }
        }
    } else
        SUBRESIZEB(system, component, element, dx, dy, cache.valueB);
}


/***************************************************************************************************/
/********************************** COMBINATION RESIZE ACTIONS *************************************/
/***************************************************************************************************/



export function updateCSS(sys: FlameSystem, history: HistoryArtifact, FORWARD = true) {

    const
        active = FORWARD ? history.progress : history.regress,
        opposite = FORWARD ? history.regress : history.progress,
        names = [];

    if (active) {

        const { comp_data_name: name, valueA: prop_name, valueB: prop_string, valueC: selector_string } = active;
        //Mode Updated data stylesheets.

        // Setup css object in the environment and in the wick component
        const comp_data = getComponentDataFromName(sys, name);

        // For each prop, find rule with correct selector, bottom up. 
        // Insert new prop into rule. 

        //Find matching rule.
        let rule = css.getLastRuleWithMatchingSelector(comp_data.CSS[0], css.selector(selector_string));

        if (!rule) {
            rule = css.rule(`${selector_string}{${prop_string}}`);
            comp_data.CSS[0].nodes.push(rule);
        } else {
            const prop = css.property(prop_string);
            rule.props.set(prop.name, prop);
        }

        names.push(name);
    }


    if (!FORWARD) {
        if (active) {

            const { comp_data_name: name, valueA: prop_name, valueB: prop_string, valueC: selector_string } = active;
            // Setup css object in the environment and in the wick component
            const comp_data = <Component>sys.edit_wick.rt.presets.components.get(name);

            // For each prop, find rule with correct selector, bottom up. 
            // Insert new prop into rule. 

            //Find matching rule.
            const rule = css.getLastRuleWithMatchingSelector(comp_data.CSS[0], css.selector(selector_string));

            if (rule) {
                const prop = css.property(prop_string);
                rule.props.set(prop.name, prop);
            }

            names.push(name);
        } else {
            const { comp_data_name: name, valueA: prop_name, valueB: prop_string, valueC: selector_string } = opposite;


            // Setup css object in the environment and in the wick component
            const comp_data = <Component>sys.edit_wick.rt.presets.components.get(name);

            // For each prop, find rule with correct selector, bottom up. 
            // Insert new prop into rule. 

            //Find matching rule.
            const rule = css.getLastRuleWithMatchingSelector(comp_data.CSS[0], css.selector(selector_string));

            if (rule) {

                rule.props.delete(prop_name);

                if (rule.props.size == 0)
                    css.removeRule(comp_data.CSS[0], rule);
            }

            names.push(name);

        }
    }


    return names;
}


export function sealCSS(sys, crate: ObjectCrate) {

    const { comp, ele, data: { }, css_cache: cache } = crate;

    if (cache.lock()) return;

    //Create change list.
    const
        original = cache.original_props,
        unique = cache.unique,
        selector = cache.unique_selector,
        history: HistoryArtifact[] = [];



    const names = [];


    for (const name of cache.changed.values()) {

        const hist: HistoryArtifact = {
            type: ActionType.SET_CSS,
            progress: null,
            regress: null
        };

        const { prop } = unique.get(name);

        if (original.has(name)) {

            const { prop, unique } = original.get(name);

            if (unique) {
                //do something
                hist.regress = {
                    comp_data_name: comp.name,
                    ele_index: -1,
                    valueA: prop.name,
                    valueB: prop + "",
                    valueC: wick.parse.render(selector),
                    pos: prop.pos,
                };
            }
        }

        hist.progress = {
            comp_data_name: comp.name,
            ele_index: -1,
            valueA: prop.name,
            valueB: prop + "",
            valueC: wick.parse.render(selector),
            pos: prop.pos,
        };

        history.push(hist);
    }

    cache.lock(true);

    return history;
}