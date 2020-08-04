import { RuntimeComponent } from "@candlefw/wick";
import { HTMLCache } from "../cache/html_cache.js";
import { CSSCache } from "../cache/css_cache.js";

/**
 * Stores information on object that needs to be updated.
 */
export interface ObjectCrate {
    comp: RuntimeComponent,
    ele: HTMLElement,
    css_cache: CSSCache,
    html_cache: HTMLCache,
    data: {
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
    };
}