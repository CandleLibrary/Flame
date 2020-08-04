import {
    setNumericValue,
    getRatio,
    prepRebuild
} from "./common.js";
import {
    CSSCacheFactory
} from "../cache/css_cache.js";
import {
    SETDELTAWIDTH,
    SETDELTAHEIGHT
} from "./dimensions.js";

import { css } from "../env.js";
import { FlameSystem } from "../types/flame_system.js";
import { HistoryArtifact } from "../types/history_artifact.js";
import { Component } from "@candlefw/wick";
import { ActionType } from "../types/action_type.js";
import { Action } from "../types/action.js";
import { getElementIndex, getComponentData } from "../system.js";
import { ObjectCrate } from "../types/object_crate.js";

const types = css.types;

/***************************************************************************************/
/********************************** POSITION SUB ACTIONS *************************************/
/***************************************************************************************/

export function SETLEFT(system, component, element, x, LINKED = false) {
    let cache = CSSCacheFactory(system, component, element),
        excess = 0;

    if (x.type) {
        cache.rules.props.left.setValue(x);
    } else {
        if (cache.cssflagsA & 1)
            excess = setNumericValue("left", system, component, element, x, setNumericValue.parent_width, true);
        else
            excess = setNumericValue("left", system, component, element, x, setNumericValue.positioned_ancestor_width, true);
    }

    prepRebuild(system, component, element, LINKED);

    return { excess_x: excess };
}

export function SETRIGHT(system, component, element, x, LINKED = false) {
    let cache = CSSCacheFactory(system, component, element),
        excess = 0;

    if (cache.cssflagsA & 1)
        excess = setNumericValue("right", system, component, element, x, setNumericValue.parent_width, true);
    else
        excess = setNumericValue("right", system, component, element, x, setNumericValue.positioned_ancestor_width, true);

    prepRebuild(system, component, element, LINKED);

    return { excess_x: excess };
}

export function SETTOP(system, component, element, y, LINKED = false) {
    let cache = CSSCacheFactory(system, component, element),
        excess = 0;

    if (y.type) {
        cache.rules.props.top.setValue(y);
    } else {
        if (cache.cssflagsA & 1)
            excess = setNumericValue("top", system, component, element, y, setNumericValue.parent_height, true);
        else
            excess = setNumericValue("top", system, component, element, y, setNumericValue.positioned_ancestor_height, true);
    }

    prepRebuild(system, component, element, LINKED);

    return { excess_y: excess };
}

export function SETBOTTOM(system, component, element, y, LINKED = false) {
    let cache = CSSCacheFactory(system, component, element),
        excess = 0;

    if (cache.cssflagsA & 1)
        excess = setNumericValue("bottom", system, component, element, y, setNumericValue.parent_height, true);
    else
        excess = setNumericValue("bottom", system, component, element, y, setNumericValue.positioned_ancestor_height, true);

    prepRebuild(system, component, element, LINKED);

    return { excess_y: excess };
}

/***************************************************************************************/
/********************************** DELTA SUB ACTIONS *************************************/
/***************************************************************************************/

export function SETDELTALEFT(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(system.window.getComputedStyle(element).left),
        excess_x = 0;

    start_x = isNaN(start_x) ? 0 : start_x;

    if (ratio > 0)
        excess_x = SETLEFT(system, component, element, start_x + dx / ratio, true).excess_x;
    else {
        let r = getRatio(system, component, element, SETLEFT, start_x, dx, "left", true);
        ratio = r.ratio;
        excess_x = r.excess;
    }

    prepRebuild(system, component, element, LINKED);

    return { ratio, excess_x };
}

export function SETDELTARIGHT(system, component, element, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(system.window.getComputedStyle(element).right),
        excess_x = 0;

    start_x = isNaN(start_x) ? 0 : start_x;

    if (ratio > 0)
        excess_x = SETRIGHT(system, component, element, start_x + dx / ratio, true).excess_x;
    else {
        let r = getRatio(system, component, element, SETRIGHT, start_x, dx, "right", true);
        ratio = r.ratio;
        excess_x = r.excess;
    }

    prepRebuild(system, component, element, LINKED);

    return { ratio, excess_x };
}


export function SETDELTATOP(system, component, element, dy, ratio = 0, LINKED = false, origin = undefined) {

    let start_x = parseFloat(system.window.getComputedStyle(element).top),
        excess_y = 0;

    start_x = isNaN(start_x) ? 0 : start_x;

    if (ratio > 0)
        excess_y = SETTOP(system, component, element, start_x + dy / ratio, true).excess_y;
    else {
        let r = getRatio(system, component, element, SETTOP, start_x, dy, "top", true, origin);
        ratio = r.ratio;
        excess_y = r.excess;
    }

    prepRebuild(system, component, element, LINKED);

    return { ratio, excess_y };
}
export function SETDELTABOTTOM(system, component, element, dy, ratio = 0, LINKED = false) {
    let start_x = parseFloat(system.window.getComputedStyle(element).bottom),
        excess_y = 0;

    start_x = isNaN(start_x) ? 0 : start_x;

    if (ratio > 0)
        excess_y = SETBOTTOM(system, component, element, start_x + dy / ratio, true).excess_y;
    else {
        let r = getRatio(system, component, element, SETBOTTOM, start_x, dy, "bottom", true);
        ratio = r.ratio;
        excess_y = r.excess;
    }

    prepRebuild(system, component, element, LINKED);

    return { ratio, excess_y };
}

/***************************************************************************************/
/********************************** RESIZE ACTIONS *************************************/
/***************************************************************************************/


export function RESIZEL(system, component, element, dx = system.dx, dy = system.dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.x += dx, component.width -= dx);
    let cache = CSSCacheFactory(system, component, element),
        excess_x = 0;
    switch (cache.move_hori_type) {
        case "left right":
            excess_x = SETDELTALEFT(system, component, element, dx, 0, true).excess_x;
            break;
        case "left":
            excess_x = SETDELTAWIDTH(system, component, element, -dx, 0, true).excess_x;
            SETDELTALEFT(system, component, element, dx + excess_x, 0, true);
            break;
        case "right":
            excess_x = SETDELTAWIDTH(system, component, element, -dx, 0, true).excess_x;
            break;
    }

    prepRebuild(system, component, element, false);

    return { excess_x };
}

export function RESIZET(system, component, element, dx = system.dx, dy = system.dy, IS_COMPONENT) {

    if (IS_COMPONENT) return (component.y += dy, component.height -= dy);
    let cache = CSSCacheFactory(system, component, element),
        excess_y = 0;
    switch (cache.move_vert_type) {
        case "top bottom":
            excess_y = SETDELTATOP(system, component, element, dy, 0, true).excess_y;
        case "top":
            excess_y = SETDELTAHEIGHT(system, component, element, -dy, 0, true).excess_y;
            SETDELTATOP(system, component, element, dy + excess_y, 0, true);
            break;
        case "bottom":
            excess_y = SETDELTAHEIGHT(system, component, element, -dy, 0, true).excess_y;
            break;
    }

    prepRebuild(system, component, element, false);

    return { excess_y };
}

export function RESIZER(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.width += dx);
    let cache = CSSCacheFactory(system, component, element),
        excess_x = 0;

    switch (cache.move_hori_type) {
        case "left right":
            excess_x = -SETDELTARIGHT(system, component, element, -dx, 0, true).excess_x;
            break;
        case "right":
            excess_x = -SETDELTAWIDTH(system, component, element, -dx, 0, true).excess_x;
            SETDELTARIGHT(system, component, element, -dx - excess_x, 0, true);
            break;
        case "left":
            excess_x = -SETDELTAWIDTH(system, component, element, dx, 0, true).excess_x;
            break;
    }

    prepRebuild(system, component, element, false);

    return { excess_x };
}

export function RESIZEB(system, component, element, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.height += dy);
    let cache = CSSCacheFactory(system, component, element),
        excess_y = 0;
    switch (cache.move_vert_type) {
        case "top bottom":
            excess_y = -SETDELTAHEIGHT(system, component, element, dy, 0, true).excess_y;
            //SETDELTABOTTOM(system, component, element, -dy, ratio * 0.5, true);
            break;
        case "bottom":
            excess_y = -SETDELTAHEIGHT(system, component, element, dy, 0, true).excess_y;
            SETDELTABOTTOM(system, component, element, -dy - excess_y, 0, true);
            break;
        case "top":
            excess_y = -SETDELTAHEIGHT(system, component, element, dy, 0, true).excess_y;
            break;
    }

    prepRebuild(system, component, element, false);

    return { excess_y };
}

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

export const RESIZETL = {
    act(system, component, element, dx = system.dx, dy = system.dy, IS_COMPONENT) {

    },
    precedence: 0,
    type: "CSS"

};


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
                    valueC: css.render(selector),
                    pos: prop.pos,
                };
            }
        };

        hist.progress = {
            comp_data_name: comp.name,
            ele_index: -1,
            valueA: prop.name,
            valueB: prop + "",
            valueC: css.render(selector),
            pos: prop.pos,
        };

        history.push(hist);
    }

    cache.lock(true);

    return history;
}
/*
export const RESIZETR = {
    act(system, component, element, dx = system.dx, dy = system.dy, IS_COMPONENT) {

        let { excess_x } = RESIZER(system, component, element, dx, dy, IS_COMPONENT);
        let { excess_y } = RESIZET(system, component, element, dx, dy, IS_COMPONENT);
        if (!IS_COMPONENT)
            prepRebuild(system, component, element, false);

        return { excess_x, excess_y };
    },
    precedence: 0,
    type: "CSS"
};
*/


export const RESIZETR = <Action>{
    type: ActionType.SET_CSS,
    priority: 0, //Should always come first. except for delete element
    sealFN: sealCSS,
    initFN: (sys, crate) => {

    },
    updateFN: (sys, crate) => {
        const
            { comp, ele, data: { dx, dy } } = crate,
            { excess_x } = RESIZER(sys, comp, ele, dx, dy, false),
            { excess_y } = RESIZET(sys, comp, ele, dx, dy, false);

        return { excess_x, excess_y };
    }, each dildo
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

function updateCSS(sys: FlameSystem, history: HistoryArtifact, FORWARD = true) {

    const
        active = FORWARD ? history.progress : history.regress,
        opposite = FORWARD ? history.regress : history.progress,
        names = [];

    if (active) {

        const { comp_data_name: name, valueA: prop_name, valueB: prop_string, valueC: selector_string } = active;
        //Mode Updated data stylesheets.

        // Setup css object in the environment and in the wick component
        const comp_data = getComponentData(sys, name);

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


    if (!FORWARD && opposite) {

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


    return names;
}

export function RESIZEBL(system, component, element, dx, dy, IS_COMPONENT) {

    let { excess_x } = RESIZEL(system, component, element, dx, dy, IS_COMPONENT);
    let { excess_y } = RESIZEB(system, component, element, dx, dy, IS_COMPONENT);
    if (!IS_COMPONENT)
        prepRebuild(system, component, element, false);

    return { excess_x, excess_y };
}

export function RESIZEBR(system, component, element, dx, dy, IS_COMPONENT) {
    let { excess_x } = RESIZER(system, component, element, dx, dy, IS_COMPONENT);
    let { excess_y } = RESIZEB(system, component, element, dx, dy, IS_COMPONENT);
    if (!IS_COMPONENT)
        prepRebuild(system, component, element, false);

    return { excess_x, excess_y };
}
