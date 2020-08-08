import { RuntimeComponent } from "@candlefw/wick";
import { FlameSystem } from "../types/flame_system.js";
import { ObjectCrate } from "../types/object_crate.js";

export interface RatioMarker {
    /**
     * Metric to track when determining the
     * rate of change.
     */
    type: string;

    original_delta: number,

    original_value: number,

    delta_value: number,

    adjusted_delta: number,

    input_value: number,
    /**
     * The output value of the metric
     * after delta changes applied. 
     * 
     * Linear ratio [i] implies 
     * 
     * output_value = input_value + delta
     */
    output_value: number,

    ratio: number,

    goal_value: number,

    t1: number,
    t2: number,
    t3: number,
    level: number;
}

const ratio_markers = (new Array(20)).fill({}, 0, 20).map(c => <RatioMarker>{
    type: "",
    input_value: 0,
    output_value: 0,
    ratio: 0
});

let pointer = 0;

export function startRatioMeasure(sys: FlameSystem, crate: ObjectCrate, delta: number, measurement_key: string): RatioMarker {

    const
        { ele } = crate,
        marker = Object.assign(ratio_markers.pop(), <RatioMarker>{
            type: measurement_key,
            original_delta: delta,
            delta_value: delta,
            adjusted_delta: delta,
            goal_value: delta + ele.getBoundingClientRect()[measurement_key] / sys.ui.transform.scale,
            input_value: ele.getBoundingClientRect()[measurement_key] / sys.ui.transform.scale,
            original_value: ele.getBoundingClientRect()[measurement_key] / sys.ui.transform.scale,
            output_value: 0,
            ratio: 1,
            level: 0,
            t1: 0,
            t2: 0,
            t3: 0
        });

    return marker;
}

export function markRatioMeasure(sys: FlameSystem, crate: ObjectCrate, marker: RatioMarker): RatioMarker {

    const
        { ele } = crate,

        {
            delta_value,
            input_value,
            type,
            original_value,
            goal_value,
            level,
            t1, t2, t3
        } = marker,

        actual_value = ele.getBoundingClientRect()[type] / sys.ui.transform.scale,

        actual_delta = actual_value - original_value,

        err = goal_value - actual_value;


    if (actual_delta == 0) //No change !?!
        return;

    marker.input_value = actual_value;

    if (err !== 0) {

        switch (level) {
            case 0:
                marker.t1 = delta_value / actual_delta;
                marker.adjusted_delta = err * marker.t1;
                break;
            case 1:
                marker.t2 = (delta_value / actual_delta);
                marker.adjusted_delta = err * (t1 + (err * marker.t2));
                break;
            case 2:
                marker.t3 = (delta_value / actual_delta) ** 2;
                marker.adjusted_delta = err * (t1 + (err * (marker.t2 + (marker.t3 * err))));
                break;
            default:
                marker.adjusted_delta = err * (t1 + (err * (marker.t2 + (marker.t3 * err))));
        }
        marker.level++;
    } else
        marker.adjusted_delta = 0;
}

export function clearRatioMeasure(marker: RatioMarker) {
    ratio_markers.push(marker);
};

export function getRatio(
    system: FlameSystem,
    component: RuntimeComponent,
    element,
    funct,
    original_value,
    delta_value,
    delta_measure,
    ALLOW_NEGATIVE = false,
    NO_ADJUST = false
) { }
