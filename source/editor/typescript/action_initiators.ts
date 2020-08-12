import {
    applyAction,
    sealAction
} from "./actions/update.js";
import { CSSCacheFactory } from "./cache/css_cache.js";
import { HTMLCacheFactory } from "./cache/html_cache.js";
import { Action } from "./types/action.js";
import { ObjectCrate } from "./types/object_crate.js";
import { revealEventIntercept, active_system as system, activeSys, hideEventIntercept } from "./system.js";

/**
 * Collection of functions that can be called by
 * ui-components and event handlers to apply
 * actions to selected elements and components.
 */

let ACTIVE_ACTIONS: Action[] = [], crates: ObjectCrate[], ox = 0, oy = 0, px = 0, py = 0;

export function START_ACTION(actions: Action[], data: ObjectCrate["data"]) {
    //Enable event intercept object.
    revealEventIntercept();

    //Make sure all actions in slug are actions.
    //arrange the actions based on their ordering precedence

    const sys = activeSys(),
        sabot = actions
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

    ox = sys.cx;
    oy = sys.cy;
    px = sys.cx;
    py = sys.cy;

    UPDATE_ACTION(true, data);
}

export function areActionsRunning() { return (ACTIVE_ACTIONS.length > 0); }

export function UPDATE_ACTION(INITIAL_PASS = false, data?: ObjectCrate["data"]): boolean {

    if (!areActionsRunning()) return false;

    const { editor_model, cx, cy } = activeSys();

    if (!crates) { //TODO Setup crate information for each selected object.

        crates = [{
            comp: editor_model.selected_comp,
            ele: editor_model.selected_ele,
            css_cache: null,
            html_cache: null,
            limits: {
                min_x: -Infinity,
                max_x: Infinity,
                min_y: -Infinity,
                max_y: Infinity,
            },
            data: {
                abs_x: 0,
                abs_y: 0,
                curr_comp: editor_model.selected_comp.name,
                data: "",
            },
            action_list: ACTIVE_ACTIONS.slice(),
            ratio_list: []
        }];

        for (const crate of crates) {

            crate.css_cache = CSSCacheFactory(system, editor_model.selected_comp, editor_model.selected_ele, crate);
            crate.html_cache = HTMLCacheFactory(system, editor_model.selected_comp, editor_model.selected_ele, crate);

            if (data)
                for (const d in data)
                    crate.data[d] = data[d];
        }

    }

    for (const crate of crates) {
        crate.data.dx = cx - px;
        crate.data.dy = cy - py;
    }

    applyAction(system, crates, INITIAL_PASS);

    for (const crate of crates) {
        crate.data.dx = 0;
        crate.data.dy = 0;
    }

    px = cx;
    py = cy;

    editor_model.sc++;
    editor_model.update();

    return true;
}

export function END_ACTION(event?): boolean {

    if (!areActionsRunning()) return false;

    hideEventIntercept();

    const { editor_model } = activeSys();

    editor_model.POINTER_DN = false;

    sealAction(system, crates);

    ACTIVE_ACTIONS.length = 0;

    //history.WriteBack(system);

    for (const crate of crates) {
        CSSCacheFactory.destroy(crate.ele);
        //crate.css_cache.destroy();
        crate.html_cache.destroy();
    }

    crates = null;

    editor_model.sc++;

    editor_model.update();

    return true;
}

/**
 * Calls actions and seals it in one step. Use when elements values need to updated
 * without continuous user input (such as with a click-&-drag action).
 * @param act 
 * @param data 
 */
export function APPLY_ACTION(act: Action[], data: ObjectCrate["data"]) {

    const { editor_model } = activeSys();

    editor_model.POINTER_DN = true;

    //Make sure all actions in slug are actions.
    //arrange the actions based on their ordering precedence

    const sabot = act
        .filter(a => typeof a == "object"
            && typeof a.type == "number"
            && typeof a.priority == "number")
        .sort((a, b) => a.priority > b.priority ? -1 : 1);

    if (sabot.length !== act.length) {
        ACTIVE_ACTIONS = null;
    } else {
        ACTIVE_ACTIONS = sabot;
    }

    px = 0;
    py = 0;

    UPDATE_ACTION(true, data);
    END_ACTION();
}