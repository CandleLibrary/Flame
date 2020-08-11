import { wickOutput } from "@candlefw/wick";
import { FlameSystem } from "./types/flame_system.js";
import { EditorModel } from "./editor_model.js";


const event_intercept = document.createElement("div");


export function revealEventIntercept() { event_intercept.style.display = "block"; }

export function hideEventIntercept() { event_intercept.style.display = ""; }

export var active_system: FlameSystem = null;

export function activeSys() { return active_system; }

export function initSystem(
    w?: wickOutput,
    edit_wick?: wickOutput,
    edit_css?: any,
    comp_window?: Window,
): FlameSystem {

    if (active_system) return active_system;

    event_intercept.classList.add("flame_editor_fill", "event_intercept");

    active_system = <FlameSystem>{
        editor_model: new EditorModel,
        text_info: "",
        file_dir: ".",
        comp_ext: ".wick",
        comp_name_counter: 0,
        dx: 0,
        dy: 0,
        dz: 0,
        cx: 0,
        cy: 0,
        cz: 0,
        move_type: "relative",
        window: comp_window,
        document: comp_window.document,
        body: comp_window.document.body,
        head: comp_window.document.head,
        wick: w,
        flags: { KEEP_UNIQUE: true },
        global: { default_pos_unit: "px" },
        ui: { event_intercept_frame: event_intercept, transform: { scale: 1 } },
        edit_css,
        edit_wick
    };

    return active_system;
}