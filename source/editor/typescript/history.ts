import { setState } from "./actions/update.js";
import { FlameSystem } from "./types/flame_system.js";
import { Component } from "@candlefw/wick";
import { HistoryState } from "./types/history_state";
import { componentDataToSourceString } from "./common_functions.js";

export default (function HISTORY() {

    const stack: HistoryState[] = [];
    let pointer = -1;


    return {

        ADD_HISTORY_STATE(): HistoryState {
            const state = <HistoryState>{ actions: [] };

            stack[++pointer] = state;

            return state;
        },

        /**
         * UPDATE the ui state to reflect the 
         * changes made by the active action(s).
         */
        PUSH_EDIT_STATE(action, env) {

        },
        /**
         * Create a change list for the current
         * UI state and apply, pushing the change
         * list to the history stack.
         */
        FREEZE_EDIT_STATE() {

        },
        /**
         * Decrement the history stack pointer 
         * and apply the rollback
         * changes of the change list the pointer is 
         * now at.
         */
        ROLLBACK_EDIT_STATE(system: FlameSystem) {
            if (pointer > -1) {
                const state = stack[pointer];
                console.log(state);
                setState(false, state, system);
                pointer--;
            }
        },
        /**
         * Increment the history stack pointer
         * and apply the roll-forward
         * changes of the change list the pointer is 
         * now at.
         */
        ROLLFORWARD_EDIT_STATE(system: FlameSystem) {
            if (pointer < stack.length - 1) {
                pointer++;
                const state = stack[pointer];
                console.log(state);
                setState(true, state, system);
            }

        },

        WriteBack(system: FlameSystem) {
            return;
            //Write current changes back to file. 
            const components = <Map<string, Component>>system.edit_wick.rt.presets.components;

            for (const component of components.values()) {

                const changes = stack.slice(0, pointer + 1)
                    .flatMap(s => s.actions)
                    .filter(s => s.progress.comp_data_name == component.name);

                if (changes.length > 0) {

                    const str = componentDataToSourceString(component);

                    // from this ast apply changes that need to occur, then render back to file.

                    //@ts-ignore
                    const url_ = <typeof component.location>new component.location.constructor("/component_sys/t");

                    //@ts-ignore
                    url_.submitJSON({
                        location: component.location + "",
                        source: str,
                        action: "update"
                    });

                }
            }
        }
    };
})();


