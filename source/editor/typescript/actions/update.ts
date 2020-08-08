import history from "../history.js";
import { HistoryState } from "../types/history_state";
import { CSSCacheFactory } from "../cache/css_cache.js";
import { ObjectCrate } from "../types/object_crate.js";
import { Action } from "../types/action.js";
import { FlameSystem } from "../types/flame_system.js";
import { ActionType } from "../types/action_type.js";
import { getComponentDataFromName } from "../common_functions.js";
import { startRatioMeasure, clearRatioMeasure, markRatioMeasure } from "./ratio.js";


export function prepUIUpdate(system, component, element, type) {
    const cache = CSSCacheFactory(system, component, element);
    cache.applyChanges(system, 0);
}

export function setState(FORWARD = true, history_state: HistoryState, system: FlameSystem, POST_UPDATE: boolean = false) {

    const update_components: Set<string> = new Set;

    for (const state of history_state.actions) {

        if (POST_UPDATE && state.DO_NOT_CALL_AFTER_UPDATE)
            continue;

        const handler = action_seal_cache.get(state.type);

        let comp = null;

        if (FORWARD)
            comp = handler.progress(system, state, FORWARD);
        else
            comp = handler.regress(system, state, FORWARD);

        for (const name of comp)
            update_components.add(name);
    }

    //** APPLY CSS CHANGES

    for (const comp_name of update_components.values()) {

        const comp = getComponentDataFromName(system, comp_name);

        let ele = null;

        if (system.wick.rt.css_cache[comp.name]) {
            ele = system.wick.rt.css_cache[comp.name];
        } else {
            ele = system.document.createElement("style");
            system.head.appendChild(ele);
            system.wick.rt.css_cache[comp.name] = ele;
        }

        //Push node to the document 
        const string = system.edit_wick.componentDataToCSS(comp);

        ele.innerHTML = string;
    }

    //*/
}

const action_seal_cache: Map<ActionType, { progress: Action["historyProgress"], regress: Action["historyRegress"]; }> = new Map();

let change_nonce = 0;
export function applyAction(sys: FlameSystem, crates: ObjectCrate[], INITIAL_PASS: boolean = false) {

    if (INITIAL_PASS) {

        sys.pending_history_state = history.ADD_HISTORY_STATE();

        for (const crate of crates) {

            let i = 0;

            for (const action of crate.action_list.sort((a, b) => a < b ? -1 : 1)) {

                if (!action_seal_cache.has(action.type))
                    action_seal_cache.set(action.type, {
                        progress: action.historyProgress,
                        regress: action.historyRegress
                    });

                if (action.setLimits) {
                    const { max_x, max_y, min_x, min_y } = action.setLimits(sys, crate);
                    if (typeof max_x == "number") crate.limits.max_x = Math.min(max_x, crate.limits.max_x);
                    if (typeof min_x == "number") crate.limits.min_x = Math.max(min_x, crate.limits.min_x);
                    if (typeof max_y == "number") crate.limits.max_y = Math.min(max_y, crate.limits.max_y);
                    if (typeof min_y == "number") crate.limits.min_y = Math.max(min_y, crate.limits.min_y);
                }

                const history_artifact = action.initFN(sys, crate);

                if (history_artifact) {
                    if (Array.isArray(history_artifact))
                        sys.pending_history_state.actions.push(...history_artifact);
                }
                i++;
            }
        }
    } else for (const crate of crates) {

        const { max_x, max_y, min_x, min_y } = crate.limits;

        let { dx, dy, abs_x: ax, abs_y: ay } = crate.data;

        let new_val_x = dx + ax;
        let new_val_y = dy + ay;

        if (new_val_x > max_x)
            dx = Math.max(0, max_x - ax);
        else if (ax > max_x)
            dx = Math.min(0, new_val_x - max_x);

        if (new_val_x < min_x)
            dx = Math.min(0, min_x - ax);
        else if (ax < min_x)
            dx = Math.max(0, new_val_x - min_x);

        if (new_val_y > max_y)
            dy = Math.max(0, max_y - ay);
        else if (ay > max_y)
            dy = Math.min(0, new_val_y - max_y);

        if (new_val_y < min_y)
            dy = Math.min(0, min_y - ay);
        else if (ay < min_y)
            dy = Math.max(0, new_val_y - min_y);

        crate.data.dx = dx;
        crate.data.dy = dy;
        crate.data.abs_x = new_val_x;
        crate.data.abs_y = new_val_y;

        for (const action of crate.action_list.sort((a, b) => a < b ? -1 : 1)) {
            let ratio = null;

            if (action.setRatio) {
                const
                    { delta, type, max_level } = action.setRatio(sys, crate);
                ratio = startRatioMeasure(sys, crate, delta, type, max_level);
            }

            let t = 0;

            if (ratio) {
                while (ratio.adjusted_delta !== 0 && t++ < ratio.max_level) {
                    action.updateFN(sys, crate, ratio);
                    crate.css_cache.applyChanges(sys, 0);
                    markRatioMeasure(sys, crate, ratio);
                }
                clearRatioMeasure(ratio);
            } else action.updateFN(sys, crate, ratio);
        }
    }

    for (const crate of crates) crate.css_cache.applyChanges(sys, change_nonce);

    change_nonce++;
}

export function sealAction(sys: FlameSystem, crates: ObjectCrate[]) {

    for (const crate of crates) {

        crate.css_cache.clearChanges(sys);

        for (const action of crate.action_list.sort((a, b) => a < b ? -1 : 1)) {
            const history_artifact = action.sealFN(sys, crate);

            if (history_artifact) {
                if (Array.isArray(history_artifact))
                    sys.pending_history_state.actions.push(...history_artifact);
            }
        }
    }


    setState(true, sys.pending_history_state, sys, true);

    sys.pending_history_state = null;
}

/**
 *- nth-child()
 *  Direct attribute
 *
 */