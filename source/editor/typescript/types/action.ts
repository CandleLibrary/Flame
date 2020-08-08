import { RuntimeComponent, Component } from "@candlefw/wick";
import { FlameSystem } from "./flame_system.js";
import { HistoryArtifact } from "./history_artifact";
import { ObjectCrate } from "./object_crate.js";
import { ActionType } from "./action_type";
import { RatioMarker } from "../actions/ratio.js";
export interface Action {
    type: ActionType,

    /**
     * Order in which to call Actions, with actions
     * with lower priority values being called first.
     */
    priority?: number;

    setLimits: (sys: FlameSystem, crate: ObjectCrate) => {
        min_x?: number,
        max_x?: number,
        min_y?: number,
        max_y?: number,
    };

    /**
     * Called when an action set is first registered
     */
    initFN: (sys: FlameSystem, crate: ObjectCrate) => HistoryArtifact[] | void;
    updateFN: (sys: FlameSystem, crate: ObjectCrate, adjust_marker: RatioMarker, val?: number | boolean) => any;
    /**
     * Assign value to the ratio marker
     */
    setRatio: (sys: FlameSystem, crate: ObjectCrate) => {
        delta: number, type: string;
    } | null;
    sealFN: (sys: FlameSystem, crate: ObjectCrate) => HistoryArtifact[] | void;

    historyProgress(sys: FlameSystem, history: HistoryArtifact, FORWARD: boolean): string[] | void;
    historyRegress(sys: FlameSystem, history: HistoryArtifact, FORWARD: boolean): string[] | void;

}
