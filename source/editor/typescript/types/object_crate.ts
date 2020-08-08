import { RuntimeComponent } from "@candlefw/wick";
import { HTMLCache } from "../cache/html_cache.js";
import { CSSCache } from "../cache/css_cache.js";
import { Action } from "./action.js";
import { RatioMarker } from "../actions/ratio.js";

/**
 * Stores information on object that needs to be updated.
 */
export interface ObjectCrate {
    comp: RuntimeComponent,
    ele: HTMLElement,
    css_cache: CSSCache,
    html_cache: HTMLCache,

    //Max Limits for delta values
    limits: {
        min_x: number,
        max_x: number,
        min_y: number,
        max_y: number;
    };

    data: {
        abs_x?: number,
        abs_y?: number;
        dx?: number,
        dy?: number,
        dz?: number,
        dsx?: number,
        dsy?: number,
        dsz?: number,
        drx?: number,
        dry?: number,
        drz?: number,
        val?: string,
        key?: string,
        data?: string,
        ele_index?: number,
        curr_comp?: string,
        new_comp?: string,
        ref_ele?: HTMLElement;
    },
    action_list: Action[];
    ratio_list: RatioMarker[];
}