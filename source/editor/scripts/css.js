import { css } from "./env.js";


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

    getApplicableProps(system, component, element) {
        return css.mergeRulesIntoOne(
            ...getComponentHierarchy(component)
                .map(c => getComponentData(c, system.edit_wick.rt.presets))
                .flatMap(c => c.CSS || [])
                .flatMap(e => css.getApplicableRules(element, e))
        );
    }
};