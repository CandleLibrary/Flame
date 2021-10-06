import {
    applyAction,
    sealAction
} from "./actions/update.js";
import { CSSCacheFactory } from "./cache/css_cache.js";
import { HTMLCacheFactory } from "./cache/html_cache.js";
import { Action } from "./types/action.js";
import { ObjectCrate } from "./types/object_crate.js";
import { revealEventIntercept, active_system as system, activeSys, hideEventIntercept } from "./system.js";
import { getActiveSelections, getActiveSelectionsCount } from "./common_functions.js";
import { FlameSystem } from "./types/flame_system.js";

/**
 * Collection of functions that can be called by
 * ui-components and event handlers to apply
 * actions to selected elements and components.
 */

let ACTIVE_ACTIONS: Action[] = [], crates: ObjectCrate[];

export function START_ACTION(sys: FlameSystem, actions: Action[], data?: ObjectCrate["data"]) {
    //Enable event intercept object.
    revealEventIntercept(sys);

    //Make sure all actions in slug are actions.
    //arrange the actions based on their ordering precedence

    const sabot = actions
        .filter(a => typeof a == "object"
            && typeof a.type == "number"
            && typeof a.priority == "number")
        .sort((a, b) => a.priority > b.priority ? -1 : 1);

    if (sabot.length !== actions.length) {
        ACTIVE_ACTIONS.length = 0;
    } else {

        ACTIVE_ACTIONS.length = sabot.length;

        let i = 0;

        for (const action of sabot)
            ACTIVE_ACTIONS[i++] = action;
    }

    UPDATE_ACTION(sys, true, data);
}

export function areActionsRunning() { return (ACTIVE_ACTIONS.length > 0); }

export function UPDATE_ACTION(sys: FlameSystem, INITIAL_PASS = false, data?: ObjectCrate["data"]): boolean {

    if (!areActionsRunning()) return false;

    const { dx, dy, ui: { transform: { scale } } } = sys;

    if (!crates) { //TODO Setup crate information for each selected object.

        crates = [];

        if (getActiveSelectionsCount(sys) == 0) {
            const crate = <ObjectCrate>{
                sel: null,
                css_cache: null,
                html_cache: null,
                limits: {
                    min_x: -Infinity,
                    max_x: Infinity,
                    min_y: -Infinity,
                    max_y: Infinity,
                },
                data: Object.assign({
                    abs_x: 0,
                    abs_y: 0,
                    curr_comp: "",
                    data: "",
                }, data || {}),
                action_list: ACTIVE_ACTIONS.slice(),
                ratio_list: []
            };

            crates.push(crate);
        } else {


            for (const sel of getActiveSelections(sys)) {

                const { comp, ele } = sel,
                    crate = <ObjectCrate>{
                        sel,
                        css_cache: null,
                        html_cache: null,
                        limits: {
                            min_x: -Infinity,
                            max_x: Infinity,
                            min_y: -Infinity,
                            max_y: Infinity,
                        },
                        data: Object.assign({
                            abs_x: 0,
                            abs_y: 0,
                            curr_comp: comp?.name ?? "",
                            data: "",
                        }, data || {}),
                        action_list: ACTIVE_ACTIONS.slice(),
                        ratio_list: []
                    };

                crate.css_cache = CSSCacheFactory(system, comp, ele, crate);
                crate.html_cache = HTMLCacheFactory(system, comp, ele);

                crates.push(crate);
            }
        }
    }

    let adx = dx / scale, ady = dy / scale;

    for (const crate of crates) {
        crate.data.dx = adx;
        crate.data.dy = ady;
    }

    applyAction(system, crates, INITIAL_PASS);

    for (const crate of crates) {
        crate.data.dx = 0;
        crate.data.dy = 0;
    }

    return true;
}

export function END_ACTION(sys: FlameSystem, event?): boolean {

    if (!areActionsRunning()) return false;

    hideEventIntercept(sys);

    const { editor_model } = activeSys();

    editor_model.POINTER_DN = false;

    sealAction(sys, crates);

    ACTIVE_ACTIONS.length = 0;

    /****************************************************** */
    //history.WriteBack(system);
    /****************************************************** */

    for (const { sel, css_cache, html_cache } of crates) {

        if (css_cache)
            CSSCacheFactory.destroy(css_cache);

        if (html_cache)
            html_cache.destroy();
    }

    crates = null;

    return true;
}

/**
 * Calls actions and seals it in one step. Use when elements values need to updated
 * without continuous user input (such as with a click-&-drag action).
 * @param act 
 * @param data 
 */
export function APPLY_ACTION(sys: FlameSystem, act: Action[], data: ObjectCrate["data"]) {

    const { editor_model } = sys;

    editor_model.POINTER_DN = true;

    //Make sure all actions in slug are actions.
    //arrange the actions based on their ordering precedence

    const sabot = act
        .filter(a => typeof a == "object"
            && typeof a.type == "number"
            && typeof a.priority == "number")
        .sort((a, b) => a.priority > b.priority ? -1 : 1);

    if (sabot.length !== act.length) {
        ACTIVE_ACTIONS = [];
    } else {
        ACTIVE_ACTIONS = sabot;
    }

    UPDATE_ACTION(sys, true, data);
    END_ACTION(sys);
}