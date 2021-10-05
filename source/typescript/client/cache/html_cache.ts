/* Cache collects info about the CSS state of an element and provides methods to create new properties. */

import { RuntimeComponent } from "@candlelib/wick";
import { FlameSystem } from "../types/flame_system";
import { getIndexOfElementInRTInstance } from "../common_functions.js";

export class HTMLCache {
    ele: HTMLElement;
    comp: RuntimeComponent;
    index: number;

    getElementIndex(): number {
        return getIndexOfElementInRTInstance(this.comp, this.ele);
    }

    init(sys: FlameSystem, comp: RuntimeComponent, ele: HTMLElement) {
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

export function HTMLCacheFactory(sys: FlameSystem, comp: RuntimeComponent, ele: HTMLElement): HTMLCache {

    let cache: HTMLCache = null;

    cache = new HTMLCache();

    cache.init(sys, comp, ele);

    return cache;
}