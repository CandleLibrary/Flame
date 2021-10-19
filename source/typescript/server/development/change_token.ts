import { CSSNode, mergeRulesIntoOne, rule as parse_rule, selectMatchingRule } from '@candlelib/css';
import { Token } from '@candlelib/hydrocarbon';
import URI from '@candlelib/uri';
import { ComponentData, renderNew } from "@candlelib/wick";
import { getElementAtIndex } from '@candlelib/wick/build/library/compiler/common/html.js';
import { Change, ChangeType } from '../../types/transition.js';
import { getComponent } from './store.js';

export interface ChangeToken {
    location: string,
    token: Token;
    string: string;
}

export async function getAttributeChangeToken(
    component_name: string,
    change: Change[ChangeType.Attribute]
): Promise<ChangeToken> {

    const { attribute_index, name: old_name, ele_id, new_value, old_value } = change;

    const comp = await getComponent(component_name);

    const ele = getElementAtIndex(comp, ele_id);

    let token_change: ChangeToken = {
        location: "",
        token: null,
        string: ""
    };

    if (!old_value) {

        token_change.token = ele.pos.token_slice(1 + ele.tag.length, 1 + ele.tag.length);
        token_change.string = `${old_name}="${new_value}"`;

    } else
        for (const { name, value, pos } of ele.attributes) {

            if (name == old_name && typeof value == "string") {
                token_change.token = pos.token_slice();

                if (!new_value) {
                    token_change.string = "";
                } else {
                    token_change.string = `${old_name}="${new_value}"`;
                }
                break;
            }
        }

    return token_change;
}


export async function getCSSChangeToken(
    component_name: string,
    change: Change[ChangeType.CSSRule]): Promise<ChangeToken> {

    const {
        location,
        new_rule_path,
        old_rule_path,
        CSS_index,
        new_selectors,
        old_selectors,
        new_properties,
        old_properties
    } = change;

    let token_change: ChangeToken = {
        location: "",
        token: null,
        string: ""
    };

    //Select the appropriate component
    const uri = new URI(location);

    let comp: ComponentData = await getComponent(component_name);

    let rule = null;

    for (const { data, location, container_element_index } of comp.CSS) {

        rule = selectMatchingRule(old_rule_path, data);

        if (rule) {
            token_change.location = location + "";
            break;
        }
    }

    if (rule) {

        const new_rule = parse_rule(`${new_selectors} { ${new_properties.map(({ name, val }) => `${name}:${val}`).join(";")} }`);

        const new_new_rule = mergeRulesIntoOne(rule, new_rule);

        token_change.string = renderNew(new_new_rule);

        token_change.token = rule.pos.token_slice();

    } else {
        if (!comp.CSS[0]) {
            if (comp.HTML) {
                token_change.location = comp.HTML.pos.path;

                token_change.token = comp.HTML.pos.token_slice(-comp.HTML.tag.length + 3);
                token_change.string = `<style> ${new_selectors} { ${new_properties.map(({ name, val }) => `${name}:${val}`).join(";")} } </style>`;
            } else {
                debugger;
            }
        } else {
            const style_sheet = comp.CSS[0].data;
            token_change.string = `${new_selectors} { ${new_properties.map(({ name, val }) => `${name}:${val}`).join(";")} }`;

            token_change.token = style_sheet.pos.token_slice(style_sheet.pos.len);

            token_change.location = comp.CSS[0].location + "";
        }
    }

    return token_change;
}
