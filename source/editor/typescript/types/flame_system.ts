import { wickOutput } from "@candlefw/wick";

import { HistoryState } from "./history_state";
import { EditorModel } from "../editor_model";

export interface FlameSystem {
    editor_model: EditorModel;
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
        transform: {
            scale: number;
        };
    },
    edit_css: any,
    edit_wick: any;
}
