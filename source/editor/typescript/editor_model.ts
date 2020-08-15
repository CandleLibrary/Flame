import { RuntimeComponent, ObservableModel, ObservableWatcher } from "@candlefw/wick";
import * as ACTIONS from "./actions/action.js";


export enum EditorToolState {

    UNSET = "unset",
    COLOR = "color",
    COMPONENT = "component",
    MARGIN = "margin",
    BORDER = "border",
    PADDING = "padding",
    DIMENSIONS = "dimensions",
    POSITION = "position",
    TRANSFORM = "transform",
    ELEMENT = "element"
}

export interface DrawObject {
    type: "horizontal_line" | "vertical_line" | "infinite_line" | "box",
    px1: number;
    px2: number;
    py1: number;
    py2: number;
}
export class EditorModel implements ObservableModel {

    selection_box: any;
    comp: RuntimeComponent;
    ele: any;
    sc: number;
    selected_comp: RuntimeComponent;
    selected_ele: HTMLElement;
    selected_element: HTMLElement;
    ACTIONS: any;
    POINTER_DN: boolean;
    draw_objects: DrawObject[];
    observers: ObservableWatcher[];
    state: EditorToolState;
    OBSERVABLE: true;
    constructor() {
        this.comp = null;
        this.ele = null;
        this.sc = 0;
        this.selected_comp = null;
        this.selected_element = null;
        this.selection_box = null;
        //this.ACTIONS = ACTIONS;
        this.POINTER_DN = false;
        this.observers = [];
        this.state = EditorToolState.UNSET;
        this.draw_objects = [];
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
