import history from "../history.js";
import { HistoryState } from "../types/history_state";
import { CSSCacheFactory } from "../cache/css_cache.js";
import { ObjectCrate } from "../types/object_crate.js";
import { Action } from "../types/action.js";
import { FlameSystem } from "../types/flame_system.js";
import { ActionType } from "../types/action_type.js";
import { getComponentData } from "../system.js";


export function prepUIUpdate(system, component, element, type) {
    const cache = CSSCacheFactory(system, component, element);
    cache.applyTempElementChanges();
}

export function setState(FORWARD = true, history_state: HistoryState, system: FlameSystem) {

    const update_components: Set<string> = new Set;

    for (const state of history_state.actions) {

        const handler = action_seal_cache.get(state.type);

        let comp = null;

        if (FORWARD)
            comp = handler.progress(system, state, FORWARD);
        else
            comp = handler.regress(system, state, FORWARD);

        for (const name of comp)
            update_components.add(name);
    }

    for (const comp_name of update_components.values()) {

        const comp = getComponentData(system, comp_name);

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
}

const action_seal_cache: Map<ActionType, { progress: Action["historyProgress"], regress: Action["historyRegress"]; }> = new Map();

export function applyAction(actions: Action[], sys: FlameSystem, crates: ObjectCrate[], INITIAL_PASS: boolean = false) {

    if (INITIAL_PASS) {
        sys.pending_history_state = history.ADD_HISTORY_STATE();

        for (const action of actions) {
            if (!action_seal_cache.has(action.type))
                action_seal_cache.set(action.type, {
                    progress: action.historyProgress,
                    regress: action.historyRegress
                });
        }

        for (const crate of crates)
            for (const action of actions.sort((a, b) => a < b ? -1 : 1)) {

                const history_artifact = action.initFN(sys, crate);

                if (history_artifact) {
                    if (Array.isArray(history_artifact))
                        sys.pending_history_state.actions.push(...history_artifact);
                }
            }
    } else {
        for (const crate of crates)
            for (const action of actions.sort((a, b) => a < b ? -1 : 1))
                action.updateFN(sys, crate);
    }

    for (const crate of crates) {
        crate.css_cache.applyTempElementChanges();
        crate.html_cache.applyTempElementChanges();
    }
}

export function sealAction(actions: Action[], sys: FlameSystem, crates: ObjectCrate[]) {

    for (const crate of crates)
        for (const action of actions.sort((a, b) => a < b ? -1 : 1)) {
            const history_artifact = action.sealFN(sys, crate);

            if (history_artifact) {
                if (Array.isArray(history_artifact))
                    sys.pending_history_state.actions.push(...history_artifact);
            }
        }

    setState(true, sys.pending_history_state, sys);

    sys.pending_history_state = null;
}

/**
 *- nth-child()
 *  Direct attribute
 *
 */