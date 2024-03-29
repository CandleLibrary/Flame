/* Cache collects info about the CSS state of an element and provides methods to create new properties. */

import { WickRTComponent } from "@candlelib/wick";
import { FlameSystem } from "../types/flame_system";
import { getIndexOfElementInRTInstance } from "../common_functions.js";

export class HTMLCache {
    ele: HTMLElement;
    comp: WickRTComponent;
    index: number;

    getElementIndex(): number {
        return getIndexOfElementInRTInstance(this.comp, this.ele);
    }

    init(sys: FlameSystem, comp: WickRTComponent, ele: HTMLElement) {
        this.ele = ele;
    }

    destroy() {
        this.ele = null;
        this.comp = null;
        this.index = -1;
    }

    applyChanges(): void {

    }
}

export function HTMLCacheFactory(sys: FlameSystem, ele: HTMLElement): HTMLCache {

    let cache: HTMLCache = null;

    cache = new HTMLCache();

    cache.init(sys, comp, ele);

    return cache;
}