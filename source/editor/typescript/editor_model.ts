import { RuntimeComponent, ObservableModel, ObservableWatcher } from "@candlelib/wick";
import * as ACTIONS from "./actions/action.js";
import { EditorSelection } from "./types/selection.js";
import { wick } from "./env.js";


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
    type: "horizontal_line" | "vertical_line" | "infinite_line" | "box" | "none",
    px1: number;
    px2: number;
    py1: number;
    py2: number;
}
export class EditorModel {

    data: any;

    selection_box: any;
    comp: RuntimeComponent;
    ele: any;
    sc: number;
    selected_comp: RuntimeComponent;
    selected_ele: HTMLElement;
    selected_element: HTMLElement;
    ACTIONS: any;
    POINTER_DN: boolean;
    selections: EditorSelection[];
    draw_objects: DrawObject[];
    state: EditorToolState;
    constructor() {
        this.comp = null;
        this.ele = null;
        this.sc = 0;
        this.selected_comp = null;
        this.selected_element = null;
        this.selection_box = null;
        this.selections = [<EditorSelection><unknown>{
            model: new wick.objects.ObservableScheme<EditorSelection>({
                frame_ele: null,
                ACTIVE: false,
                VALID: true,
                IS_COMPONENT_FRAME: false,
                comp: null,
                ele: null,
                width: 0,
                height: 0,
                left: 0,
                top: 0,
                max_x: 0,
                max_y: 0,
                min_x: 0,
                min_y: 0,
                px: 0,
                py: 0,
                pz: 0,
                rx: 0,
                ry: 0,
                rz: 0,
                sx: 0,
                sy: 0,
                sz: 0,
            })
        }];
        //this.ACTIONS = ACTIONS;
        this.POINTER_DN = false;
        this.state = EditorToolState.UNSET;
        this.draw_objects = [<DrawObject><unknown>{
            model: new wick.objects.ObservableScheme<DrawObject>({
                px1: 0,
                py1: 0,
                px2: 0,
                py2: 0,
                type: "none"
            })
        }];
    }
};
