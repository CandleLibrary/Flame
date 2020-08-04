import { RuntimeComponent, wickOutput } from "@candlefw/wick";
import { FlameSystem } from "./types/flame_system.js";

export function getElementIndex(comp: RuntimeComponent, ele: HTMLElement): number {
    return comp.elu.indexOf(ele);
}

export function getElementFromIndex(comp: RuntimeComponent, index: number): HTMLElement {
    return comp.elu[index];
}

export function getComponents(sys: FlameSystem, name: string): RuntimeComponent[] {
    return Array.from(sys.document.getElementsByClassName(name)).map(comp => comp.wick_component);
}

export function getComponentData(sys: FlameSystem, name: string): Component {
    return sys.edit_wick.rt.presets.components.get(name);
}

export function initSystem(
    w: wickOutput,
    edit_wick: wickOutput,
    css: any,
    edit_css: any,
    comp_window: Window,
): FlameSystem {

    return <FlameSystem>{
        action_sabot: null,
        text_info: "",
        dx: 0,
        dy: 0,
        dz: 0,
        move_type: "relative",
        css: css,
        window: comp_window,
        document: comp_window.document,
        body: comp_window.document.body,
        head: comp_window.document.head,
        wick: w,
        flags: {
            KEEP_UNIQUE: true
        },
        global: {
            default_pos_unit: "px"
        },
        ui: {
            transform: {
                scale: 1
            }
        },
        edit_css,
        edit_wick
    };
}