import { RuntimeComponent, ObservableModel, ObservableWatcher } from "@candlefw/wick";
import * as ACTIONS from "./actions/action.js";
export class EditorModel implements ObservableModel {
    comp: RuntimeComponent;
    ele: any;
    sc: number;
    selected_comp: RuntimeComponent;
    selected_ele: HTMLElement;
    selected_element: HTMLElement;
    ACTIONS: any;
    POINTER_DN: boolean;

    observers: ObservableWatcher[];

    OBSERVABLE: true;
    constructor() {
        this.comp = null;
        this.ele = null;
        this.sc = 0;
        this.selected_comp = null;
        this.selected_element = null;
        this.ACTIONS = ACTIONS;
        this.POINTER_DN = false;
        this.observers = [];
    }

    update() {
        for (const observer of this.observers)
            observer.onModelUpdate(this);

    }
    subscribe(comp: ObservableWatcher) {
        this.unsubscribe(comp);
        this.observers.push(comp);
        return true;
    };

    unsubscribe(comp: ObservableWatcher) {
        let i = this.observers.indexOf(comp);
        if (i >= 0)
            return this.observers.splice(i, 1), true;
        return false;
    }
};
