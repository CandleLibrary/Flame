import { renderCompressed } from "@candlelib/css";
import { Logger } from '@candlelib/log';
import { EditorCommand } from '../../common/editor_types.js';
import { ActionType } from "../types/action_type.js";
import { FlameSystem } from "../types/flame_system.js";
import { HistoryArtifact } from "../types/history_artifact.js";
import { ObjectCrate } from "../types/object_crate.js";


export function updateCSS(sys: FlameSystem, history: HistoryArtifact, FORWARD = true) {

    const
        active = FORWARD ? history.progress : history.regress,
        opposite = FORWARD ? history.regress : history.progress,
        names = [];

    if (active) {


        const { comp_data_name: name, valueA: prop_name, valueB: prop_string, valueC: selector_string } = active;

        //Mode Updated data stylesheets.
        // Setup css object in the environment and in the wick component

        // debugger;

        //TODO: Need to link with the server to update the style of the component

        /*  const comp_data = getComponentDataFromName(sys, name);
 
 
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
         } */

        names.push(name);

    }


    if (!FORWARD) {
        if (active) {

            const { comp_data_name: name, valueA: prop_name, valueB: prop_string, valueC: selector_string } = active;

            //debugger;

            /* // Setup css object in the environment and in the wick component
            const comp_data = <WickRTComponent>sys.editor_wick.rt.context.components.get(name);

            // For each prop, find rule with correct selector, bottom up. 
            // Insert new prop into rule. 
            //Find matching rule.
            const rule = css.getLastRuleWithMatchingSelector(comp_data.CSS[0], css.selector(selector_string));

            if (rule) {
                const prop = css.property(prop_string);
                rule.props.set(prop.name, prop);
            } */

            names.push(name);

        }
        else {
            const { comp_data_name: name, valueA: prop_name, valueB: prop_string, valueC: selector_string } = opposite;

            //debugger;
            /*  // Setup css object in the environment and in the wick component
             const comp_data = <WickRTComponent>sys.editor_wick.rt.context.components.get(name);
 
             // For each prop, find rule with correct selector, bottom up. 
             // Insert new prop into rule. 
             //Find matching rule.
             const rule = css.getLastRuleWithMatchingSelector(comp_data.CSS[0], css.selector(selector_string));
 
             if (rule) {
 
                 rule.props.delete(prop_name);
 
                 if (rule.props.size == 0)
                     css.removeRule(comp_data.CSS[0], rule);
             } */

            names.push(name);
        }
    }


    return names;
}


export async function sealCSS(sys: FlameSystem, crate: ObjectCrate) {

    const { sel: { comp, ele }, data: { }, css_cache: cache } = crate;

    // Connect to backend and get a patch for the updated CSS.
    // Apply patch to the affected components.

    /**
     * Prevent reapplying css information for actions
     * that reference the same css_cache
     */
    if (cache.lock())
        return;

    cache.lock(true);

    //Create change list.

    {
        const response = await sys.session.send_awaitable_command<
            EditorCommand.SET_COMPONENT_ELEMENT_ID,
            EditorCommand.APPLY_COMPONENT_PATCH
        >({
            command: EditorCommand.SET_COMPONENT_ELEMENT_ID,
            component_name: cache.component,
            element_index: parseInt(ele.getAttribute("w:u")),
            id: "test"
        });

        if (response.command == EditorCommand.APPLY_COMPONENT_PATCH) {

            sys.session.applyDefault(response);

            cache.component = response.patch.to;
        }
    }

    const response = await sys.session.send_awaitable_command<
        EditorCommand.SET_COMPONENT_STYLE,
        EditorCommand.APPLY_COMPONENT_PATCH
    >({
        command: EditorCommand.SET_COMPONENT_STYLE,
        component_name: cache.component,
        rules: cache.generateClientPatch(false)
    });

    if (response.command == EditorCommand.APPLY_COMPONENT_PATCH) {
        sys.session.applyDefault(response);
        //Update the style of the target component
    } else
        Logger.get("flame").get("css").error(`Unable to update style of component ${cache.component}`);


    const
        original = cache.original_props,
        unique = cache.unique,
        selector = cache.unique_selector,
        history: HistoryArtifact[] = [];

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
                    comp_data_name: comp,
                    ele_index: -1,
                    valueA: prop.name,
                    valueB: prop + "",
                    valueC: renderCompressed(selector),
                    pos: prop.pos,
                };
            }
        }

        hist.progress = {
            comp_data_name: comp,
            ele_index: -1,
            valueA: prop.name,
            valueB: prop + "",
            valueC: renderCompressed(selector),
            pos: prop.pos,
        };

        history.push(hist);
    }



    return history;
}
