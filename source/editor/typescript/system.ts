import WICK, { WickLibrary } from "@candlefw/wick";
import { FlameSystem, EditedComponent } from "./types/flame_system.js";
import { EditorModel } from "./editor_model.js";
import { css } from "./env.js";


export function revealEventIntercept() { event_intercept.style.display = "block"; }

export function hideEventIntercept() { event_intercept.style.display = ""; }

export var active_system: FlameSystem = null;

export function activeSys() { return active_system; }

export function CreateTimeStamp(): number { return window.performance.now(); }

export function GetElapsedTimeSinceStamp(stamp: number): number { return window.performance.now() - stamp; };

export function GetElapsedTimeSinceStampInSeconds(stamp: number): number { return GetElapsedTimeSinceStamp(stamp) / 1000; };

export function GetElapsedTimeSinceStampInMilliseconds(stamp: number): number { return GetElapsedTimeSinceStamp(stamp) / 1; };

export function GetElapsedTimeSinceStampInMicroSeconds(stamp: number): number { return GetElapsedTimeSinceStamp(stamp) * 1000; };

export function GetElapsedTimeSinceStampInNanoSeconds(stamp: number): number { return GetElapsedTimeSinceStamp(stamp) * 1000000; };

export function initSystem(
    w?: WickLibrary,
    edit_wick?: WickLibrary,
    edit_css?: typeof css,
    comp_window?: Window,
): FlameSystem {

    if (active_system) return active_system;

    event_intercept.classList.add("flame_editor_fill", "event_intercept");

    active_system = <FlameSystem>{
        metrics: {
            startup_time: 0,
            ui_components_error_count: 0,
            ui_components_load_time: 0
        },
        comp_name_counter: 0,

        edit_view: null,

        editor_model: edit_wick.objects.Observable<EditorModel>(new EditorModel),
        text_info: "",
        file_dir: ".",
        comp_ext: ".wick",

        harness: null,

        //Move these to ui
        dx: 0,
        dy: 0,
        dz: 0,
        cx: 0,
        cy: 0,
        cz: 0,
        move_type: "relative",
        //End move


        pending_history_state: null,
        window: comp_window,
        document: comp_window.document,
        body: comp_window.document.body,
        head: comp_window.document.head,
        edited_components: edit_wick.objects.Observable({
            components: [<EditedComponent><unknown>{
                model: new edit_wick.objects.ObservableScheme<EditedComponent>({
                    comp: "",
                    frame: null,
                    height: 0,
                    px: 0,
                    py: 0,
                    width: 0
                })
            }]
        }),
        wick: w,
        css,
        flags: { CSS_SELECTOR_KEEP_UNIQUE: true },
        global: { default_pos_unit: "px" },
        ui: {
            event_intercept_frame: null,
            transform: new Proxy(
                new css.CSS_Transform2D, {
                set: (obj, prop, val) => {
                    obj[prop] = val;
                    if (active_system.edit_view)
                        active_system.edit_view.style.transform = obj.toString();
                    return true;
                }
            })
        },
        edit_css,
        edit_wick
    };

    return active_system;
}
