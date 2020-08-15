import { wickOutput, RuntimeComponent } from "@candlefw/wick";
import { CSS_Transform2D } from "@candlefw/css";

import { HistoryState } from "./history_state";
import { EditorModel } from "../editor_model";

export interface FlameSystem {

    metrics: {
        /**
         * Amount of time taken during the entire call to
         * initFlame;
         */
        startup_time: number,

        /**
         * Amount of time taken during the loading
         * of the wick ui components, including 
         * the harness component. 
         */
        ui_components_load_time: number,

        /**
         * Number of error generated when loading
         * ui components. 
         */
        ui_components_error_count: number;


    },

    /**
     * A Model containing a list of all components actively 
     * edited within the editor context. 
     */
    edited_components: {
        components: { comp: string; }[];
    };

    /**
     * Unique counter to assign component
     * names from. Increment once for each
     * new component created.
     */
    comp_name_counter: number;

    /**
     * Server side root directory to place new 
     * component files in.
     */
    file_dir: string,

    /**
     * Primary model storing information used 
     * by all UI runtime components. Is reactive.
     */
    editor_model: EditorModel;

    /*Default extension name to give new components */
    comp_ext: string;

    /**
     * Root element containing the actively edited
     * components.
     */
    edit_view: HTMLElement;

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
        CSS_SELECTOR_KEEP_UNIQUE?: boolean;
        DUBUG_DISPLAY_STARTUP_METRICS?: boolean;
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
