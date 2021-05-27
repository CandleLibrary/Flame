import { Component, CSSNode, CSSNodeType } from "@candlelib/wick";
import { css, wick } from "../env.js";
import { FlameSystem } from "../types/flame_system.js";
import { HistoryArtifact } from "../types/history_artifact.js";
import { ActionType } from "../types/action_type.js";
import { ObjectCrate } from "../types/object_crate.js";
import { getComponentDataFromName } from "../common_functions.js";


export function updateCSS(sys: FlameSystem, history: HistoryArtifact, FORWARD = true) {

    const
        active = FORWARD ? history.progress : history.regress,
        opposite = FORWARD ? history.regress : history.progress,
        names = [];

    if (active) {


        const { comp_data_name: name, valueA: prop_name, valueB: prop_string, valueC: selector_string } = active;

        //Mode Updated data stylesheets.
        // Setup css object in the environment and in the wick component
        const comp_data = getComponentDataFromName(sys, name);


        //Ensure comp_data has css

        if (comp_data.CSS.length == 0) {
            comp_data.CSS.push(<CSSNode>{
                type: CSSNodeType.Stylesheet,
                nodes: [],
                pos: {}
            });
        }

        // For each prop, find rule with correct selector, bottom up. 
        // Insert new prop into rule. 
        //Find matching rule.
        let rule = css.getLastRuleWithMatchingSelector(comp_data.CSS[0], css.selector(selector_string));

        if (!rule) {
            rule = css.rule(`${selector_string}{${prop_string}}`);
            comp_data.CSS[0].nodes.push(rule);
        }
        else {
            const prop = css.property(prop_string);
            rule.props.set(prop.name, prop);
        }

        names.push(name);

    }


    if (!FORWARD) {
        if (active) {

            const { comp_data_name: name, valueA: prop_name, valueB: prop_string, valueC: selector_string } = active;



            // Setup css object in the environment and in the wick component
            const comp_data = <Component>sys.edit_wick.rt.presets.components.get(name);

            // For each prop, find rule with correct selector, bottom up. 
            // Insert new prop into rule. 
            //Find matching rule.
            const rule = css.getLastRuleWithMatchingSelector(comp_data.CSS[0], css.selector(selector_string));

            if (rule) {
                const prop = css.property(prop_string);
                rule.props.set(prop.name, prop);
            }

            names.push(name);

        }
        else {
            const { comp_data_name: name, valueA: prop_name, valueB: prop_string, valueC: selector_string } = opposite;


            // Setup css object in the environment and in the wick component
            const comp_data = <Component>sys.edit_wick.rt.presets.components.get(name);

            // For each prop, find rule with correct selector, bottom up. 
            // Insert new prop into rule. 
            //Find matching rule.
            const rule = css.getLastRuleWithMatchingSelector(comp_data.CSS[0], css.selector(selector_string));

            if (rule) {

                rule.props.delete(prop_name);

                if (rule.props.size == 0)
                    css.removeRule(comp_data.CSS[0], rule);
            }

            names.push(name);
        }
    }


    return names;
}


export function sealCSS(sys: FlameSystem, crate: ObjectCrate) {

    const { sel: { comp, ele }, data: { }, css_cache: cache } = crate;

    /**
     * Prevent reapplying css information for actions
     * that reference the same css_cache
     */
    if (cache.lock())
        return;

    //Create change list.
    const
        original = cache.original_props,
        unique = cache.unique,
        selector = cache.unique_selector,
        history: HistoryArtifact[] = [];



    const names = [];


    for (const name of cache.changed.values()) {

        const hist: HistoryArtifact = {
            type: ActionType.SET_CSS,
            progress: null,
            regress: null
        };

        const { prop } = unique.get(name);

        if (original.has(name)) {

            const { prop, unique } = original.get(name);

            if (unique) {
                //do something
                hist.regress = {
                    comp_data_name: comp.name,
                    ele_index: -1,
                    valueA: prop.name,
                    valueB: prop + "",
                    valueC: wick.utils.parse.render(selector),
                    pos: prop.pos,
                };
            }
        }

        hist.progress = {
            comp_data_name: comp.name,
            ele_index: -1,
            valueA: prop.name,
            valueB: prop + "",
            valueC: wick.utils.parse.render(selector),
            pos: prop.pos,
        };

        history.push(hist);
    }

    cache.lock(true);

    return history;
}
