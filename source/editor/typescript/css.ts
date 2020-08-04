
import { css } from "./env.js";
import { TrackedCSSProp } from "./types/tracked_css_prop";
import { FlameSystem } from "./types/flame_system.js";
import { RuntimeComponent } from "@candlefw/wick";


function getComponentHierarchy(component) {
    let c = component;
    const list = [c];

    while (c.par) {
        list.push(c.par);
        c = c.par;
    }

    return list;
}

function getComponentData(component, presets) {
    return presets.components.get(component.name);
}

export function getApplicableRulesFromComponentData(
    system: FlameSystem,
    component: RuntimeComponent,
    element: HTMLElement
) {
    return [component]
        .map(c => getComponentData(c, system.edit_wick.rt.presets))
        .flatMap(c => c.CSS || [])
        .flatMap(e => css.getApplicableRules(element, e));
};

export function getApplicableRulesFromFullHierarchy(
    system: FlameSystem,
    component: RuntimeComponent,
    element: HTMLElement
) {
    return getComponentHierarchy(component)
        .map(c => getComponentData(c, system.edit_wick.rt.presets))
        .flatMap(c => c.CSS || [])
        .flatMap(e => css.getApplicableRules(element, e));
};

export function getApplicableProps(
    system: FlameSystem,
    component: RuntimeComponent,
    element: HTMLElement
): Map<string, TrackedCSSProp> {


    //Get applicable css files,

    //Then get applicable rules,

    //For each rule -> Identify 1 matching selector.

    //Extract selector, for each prop in rule create
    // sel,prop pairs. 

    //bottom-up gather props.

    //return array of selector/prop pairs.

    return getApplicableRulesFromFullHierarchy(system, component, element)
        .reverse()
        .reduce((m, r) => {
            const s = css.getFirstMatchedSelector(r, element);

            for (const [name, val] of r.props.entries())
                if (!m.has(name) || val.IMPORTANT)
                    m.set(name, { sel: s, prop: val.copy() });

            return m;
        }, new Map);
};



export default {
    getUnique(system, component, element) {
        return null;

        const hierarchy = getComponentHierarchy(component);

        const comp_css = hierarchy
            .map(c => getComponentData(c, system.edit_wick.rt.presets))
            .map(c => c.CSS);

        for (const css_data of comp_css.flatMap(e => e)) {

            if (css_data) {

                const rules = css.getApplicableRules(element, css_data);

            }
        }

        const rule = css.rule("*{top:0}");

        return rule;
    },

    getApplicableRulesFromComponentData,

    getApplicableRulesFromFullHierarchy,

    getApplicableProps
};