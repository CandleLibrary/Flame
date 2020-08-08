import { RuntimeComponent, Component } from "@candlefw/wick";
import { FlameSystem } from "./types/flame_system";

export function retrieveComponentFromElement(ele) {
    do {
        if (ele.wick_component && !ele.hasAttribute("w-o"))
            /* Presence of "w-o" indicates the element belongs to a component that has integrated it's 
             * element into the tree of another component.  */
            return ele.wick_component;

        ele = ele.parentNode;
    } while (ele);
    return null;
}

export function getComponentDataFromName(sys: FlameSystem, name: string): Component {
    return sys.edit_wick.rt.presets.components.get(name);
}

export function getComponentDataFromComponent(sys: FlameSystem, comp: RuntimeComponent) {

    if (!comp) return null;

    return sys.edit_wick.rt.presets.components.get(comp.name);
}

export function getElementFromEvent(event) {
    return event.target;
}

export function getComponentFromEvent(event) {
    return retrieveComponentFromElement(getElementFromEvent(event));
}

export function getComponentHierarchy(comp: RuntimeComponent): RuntimeComponent[] {
    const list = [comp];
    //@ts-ignore
    while (comp.par) { list.push(comp.par); comp = comp.par; }
    return list.reverse();
}

/**
 * Return an array of Component objects from a list of RuntimeComponents
 * @param comps 
 */
export function getComponentData(sys: FlameSystem, ...comps: RuntimeComponent[]): Component[] {
    return comps.flatMap(e => e).map(comp => getComponentDataFromComponent(sys, comp));
}

export function getElementIndex(comp: RuntimeComponent, ele: HTMLElement): number {
    //@ts-ignore
    return comp.elu.indexOf(ele);
}

export function getElementFromIndex(comp: RuntimeComponent, index: number): HTMLElement {
    //@ts-ignore
    return comp.elu[index];
}

export function getActiveComponentInstances(sys: FlameSystem, component_name: string): RuntimeComponent[] {
    return Array.from(sys.document.getElementsByClassName(component_name)).map(comp => comp.wick_component);
}