import { wickOutput } from "@candlefw/wick";

import { HistoryState } from "./history_state";

export interface FlameSystem {
    pending_history_state: HistoryState;
    action_sabot: any[],
    text_info: string,
    dx: number,
    dy: number,
    dz: number,
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
        transform: {
            scale: number;
        };
    },
    edit_css: any,
    edit_wick: any;
}
