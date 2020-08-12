import { wickOutput } from "@candlefw/wick";

import { HistoryState } from "./history_state";
import { EditorModel } from "../editor_model";
import { CSS_Transform2D } from "@candlefw/css";

export interface FlameSystem {
    comp_name_counter: number;
    file_dir: string,
    editor_model: EditorModel;

    /*Default extension name to give new components */
    comp_ext: string;
    pending_history_state: HistoryState;
    text_info: string,
    dx: number,
    dy: number,
    dz: number,
    cx: number,
    cy: number,
    cz: number,
    move_type: string,
    css: any,
    window: Window,
    document: Document,
    body: HTMLElement,
    head: HTMLElement,
    wick: wickOutput,
    flags: {
        KEEP_UNIQUE: boolean;
    },
    global: {
        default_pos_unit: string;
    },
    ui: {
        event_intercept_frame: HTMLDivElement;
        transform: CSS_Transform2D;
    },
    edit_css: any,
    edit_wick: any;
}
