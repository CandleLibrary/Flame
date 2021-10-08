import { WickLibrary, WickRTComponent } from "@candlelib/wick";
import { EditorCommand, PatchType } from "../common/editor_types.js";
import ActionQueueRunner from './action_initiators.js';
import { getRuntimeComponentsFromName } from './common_functions.js';
import { EditorModel } from "./editor_model.js";
import { Session } from './session.js';
import { EditedComponent, FlameSystem } from "./types/flame_system.js";

const event_intercept = document.createElement("div");
export function revealEventIntercept(sys: FlameSystem) {
    const { ui: { event_intercept_frame: event_intercept_ele } } = sys;
    event_intercept_ele.style.zIndex = "100000";
}

export function hideEventIntercept(sys: FlameSystem) {
    const { ui: { event_intercept_frame: event_intercept_ele } } = sys;
    event_intercept_ele.style.zIndex = "";
}
export var active_system: FlameSystem = null;
export function activeSys() { return active_system; }

export function CreateTimeStamp(): number { return window.performance.now(); }

export function GetElapsedTimeSinceStamp(stamp: number): number { return window.performance.now() - stamp; };

export function GetElapsedTimeSinceStampInSeconds(stamp: number): number { return GetElapsedTimeSinceStamp(stamp) / 1000; };

export function GetElapsedTimeSinceStampInMilliseconds(stamp: number): number { return GetElapsedTimeSinceStamp(stamp) / 1; };

export function GetElapsedTimeSinceStampInMicroSeconds(stamp: number): number { return GetElapsedTimeSinceStamp(stamp) * 1000; };

export function GetElapsedTimeSinceStampInNanoSeconds(stamp: number): number { return GetElapsedTimeSinceStamp(stamp) * 1000000; };

export function initSystem(
    ws_uri: string,
    page_wick?: WickLibrary,
    editor_wick?: WickLibrary,
    edit_css?: any,
    editor_window?: Window,
    editor_frame?: HTMLElement
): FlameSystem {

    if (active_system) return active_system;

    active_system = <FlameSystem>{

        session: new Session(ws_uri),

        metrics: {
            startup_time: 0,
            ui_components_error_count: 0,
            ui_components_load_time: 0
        },

        comp_name_counter: 0,

        edit_view: null,

        editor_model: editor_wick.objects.Observable<EditorModel>(new EditorModel(editor_wick)),
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

        action_runner: null,
        pending_history_state: null,
        scratch_stylesheet: null,
        editor_window: editor_window,
        editor_document: editor_window.document,
        editor_body: editor_window.document.body,
        editor_head: editor_window.document.head,
        editor_iframe: editor_frame,
        edited_components: editor_wick.objects.Observable({
            components: [<EditedComponent><unknown>{
                model: new editor_wick.objects.ObservableScheme<EditedComponent>({
                    comp: "",
                    frame: null,
                    height: 0,
                    px: 0,
                    py: 0,
                    width: 0
                })
            }]
        }),
        page_wick,
        css: edit_css,
        flags: { CSS_SELECTOR_KEEP_UNIQUE: true },
        global: { default_pos_unit: "px" },
        ui: {
            event_intercept_frame: null,
            transform: new Proxy(
                new edit_css.CSS_Transform2D, {
                set: (obj, prop, val) => {
                    obj[prop] = val;
                    if (active_system.edit_view)
                        active_system.edit_view.style.transform = obj.toString();
                    return true;
                }
            })
        },
        edit_css,
        editor_wick
    };

    active_system.action_runner = new ActionQueueRunner(active_system);

    const scratch_sheet = document.createElement("style");

    scratch_sheet.id = "flame-scratch-sheet";

    document.body.appendChild(scratch_sheet);

    active_system.scratch_stylesheet = scratch_sheet.sheet;

    initializeDefualtSessionDispatchHandlers(active_system.session, page_wick);

    return active_system;
}

function initializeDefualtSessionDispatchHandlers(session: Session, page_wick: WickLibrary) {

    session.setHandler(EditorCommand.UPDATED_COMPONENT, (command, session) => {
        const { new_name, old_name, path } = command;

        // Identify all top_level components that need to be update. 
        const matches = getRuntimeComponentsFromName(old_name, page_wick);

        if (matches.length > 0)
            session.send_command({ command: EditorCommand.GET_COMPONENT_PATCH, to: new_name, from: old_name });
    });


    session.setHandler(EditorCommand.APPLY_COMPONENT_PATCH, (command, session) => {

        const patch = command.patch;

        switch (patch.type) {

            case PatchType.CSS: {

                const { to, from, style } = patch;

                const context =
                    page_wick.rt.context;

                const old_css = context.css_cache.get(from);

                const matches = getRuntimeComponentsFromName(from, page_wick);

                session.logger.debug(`Applying CSS patch: ${from}->${to} to ${matches.length} component${matches.length == 1 ? "" : "s"}`);

                if (to != from)
                    for (const match of matches) {
                        match.name = to;
                        match.ele.classList.add(to);
                        match.ele.setAttribute("wrt:c", to);
                    }


                if (old_css) {
                    old_css.css_ele.innerHTML = style;
                    context.css_cache.delete(from);
                    context.css_cache.set(to, old_css);
                } else {
                    const css_ele = document.createElement("style");
                    css_ele.innerHTML = style;
                    document.head.appendChild(css_ele);
                    context.css_cache.set(this.name, { css_ele, count: matches.length });
                }

                if (to != from)
                    for (const match of matches)
                        match.ele.classList.remove(from);

            } break;


            case PatchType.STUB: {


                const { to, from } = patch;

                const matches = getRuntimeComponentsFromName(from, page_wick);

                session.logger.debug(`Applying stub patch: ${from}->${to} to ${matches.length} component${matches.length == 1 ? "" : "s"}`);

                for (const match of matches) {

                    match.name = to;
                    match.ele.setAttribute("wrt:c", to);
                }
            } break;

            case PatchType.TEXT: {

                const { to, from, patches } = patch;

                const matches = getRuntimeComponentsFromName(from, page_wick);

                for (const match of matches) {

                    const ele = match.ele;

                    match.name = to;

                    let eles = [ele];

                    for (const patch of patches) {


                        for (const ele of eles) {
                            if (ele instanceof Text) {
                                if (ele.data.trim() == patch.from.trim()) {
                                    ele.data = patch.to;
                                    break;
                                }
                            }

                            for (const child of Array.from(ele.childNodes)) {
                                eles.push(child);
                            }
                        }
                    }
                }
            } break;

            case PatchType.REPLACE: {

                const { to, from, patch_scripts } = patch;

                //Install the patches
                const classes: typeof WickRTComponent[] = patch_scripts.map(
                    patch => Function("wick", patch)(page_wick)
                );

                const class_ = classes[0];

                const matches = getRuntimeComponentsFromName(from, page_wick);

                for (const match of matches) {

                    // Do some patching magic to replace the old component 
                    // with the new one. 
                    const ele = match.ele;
                    const par_ele = ele.parentElement;
                    const par_comp = match.par;

                    const new_component = new class_(
                        match.model,
                        undefined,
                        undefined,
                        [],
                        undefined,
                        page_wick.rt.context
                    );

                    if (par_ele)
                        par_ele.replaceChild(new_component.ele, ele);

                    if (par_comp) {

                        const index = par_comp.ch.indexOf(match);

                        if (index >= 0) {
                            par_comp.ch.splice(index, 1, new_component);
                            new_component.par = par_comp;
                        }

                        match.par = null;
                    }

                    new_component.initialize(match.model);

                    match.disconnect();
                    match.destructor();

                    if (removeRootComponent(match, page_wick)) {
                        addRootComponent(new_component, page_wick);
                    }
                }
            }
        }
    });
}



export function removeRootComponent(comp: WickRTComponent, wick: WickLibrary): boolean {

    const index = wick.rt.root_components.indexOf(comp);

    if (index >= 0)
        wick.rt.root_components.splice(index, 1);

    return index >= 0;

}

export function addRootComponent(comp: WickRTComponent, wick: WickLibrary) {

    wick.rt.root_components.push(comp);
}