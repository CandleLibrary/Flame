import { copy } from '@candlelib/conflagrate';
import {
    attachParents,
    createRulePath, CSSProperty,
    CSSRuleNode,
    CSS_String,
    getLastRuleWithMatchingSelector,
    parse,
    parseProperty,
    PrecedenceFlags, property, renderCompressed
} from "@candlelib/css";
import { Logger } from '@candlelib/log';
import URI from '@candlelib/uri';
import { Lexer } from "@candlelib/wind";
import { EditorCommand } from '../../types/editor_types.js';
import { Change, ChangeType } from '../../types/transition.js';
import {
    getApplicableProps,
    getComponentNameFromElement,
    getContemporaryElements,
    getMatchedRulesFromComponentData,
    getRuntimeComponentsFromName
} from "../common_functions.js";
import { FlameSystem, StyleSheet } from "../types/flame_system.js";
import { ObjectCrate } from "../types/object_crate.js";
import { TrackedCSSProp } from "../types/tracked_css_prop.js";

const cache_logger = Logger.get("flame").get("css").activate();

let global_cache = null;

const unset_string = new CSS_String("unset"), unset_pos = {
    slice() { return "unset"; }
};

export const enum CSSFlags {
    // Positioning
    RELATIVE = (1 << 0),
    ABSOLUTE = (1 << 1),
    STATIC = (1 << 2) | (1 << 1),
    STICKY = (1 << 3) | (1 << 1),
    FIXED = (1 << 4) | (1 << 1),
    POSITION_MASK = (1 << 5) - 1,

    //DISPLAY
    BLOCK = (1 << 5),
    INLINE = (1 << 6),
    INLINE_BLOCK = (1 << 7),
    LIST_ITEM = (1 << 8),
    TABLE = (1 << 9),
    DISPLAY_MASK = ((1 << 10) - 1) ^ CSSFlags.POSITION_MASK,

    //BOX MODEL 

    /**
     * Set if width has a val other than "auto"
     */
    WIDTH_VAL = (1 << 10),
    /**
     * Set if left has a val other than "auto"
     */
    LEFT_VAL = (1 << 11),
    /**
     * Set if right has a val other than "auto"
     */
    RIGHT_VAL = (1 << 12),
    /**
     * Set if margin-left has a val other than "auto"
     */
    MARGIN_L_VAL = (1 << 13),
    /**
     * Set if margin-right has a val other than "auto"
     */
    MARGIN_R_VAL = (1 << 14),
    /**
     * Set if padding-left has a val other than "auto"
     */
    PADDING_L_VAL = (1 << 15),
    /**
     * Set if padding-right has a val other than "auto"
     */
    PADDING_R_VAL = (1 << 16),
    /**
     * Set if border-left has a val other than "auto"
     */
    BORDER_L_VAL = (1 << 17),
    /**
     * Set if border-right has a val other than "auto"
     */
    BORDER_R_VAL = (1 << 18),

    HORIZONTAL_BOX_MASK = ((1 << 19) - 1) ^ (CSSFlags.POSITION_MASK | CSSFlags.DISPLAY_MASK),

    /**
     * Set if height has a val other than "auto"
     */
    HEIGHT_VAL = (1 << 19),
    /**
     * Set if top has a val other than "auto"
     */
    TOP_VAL = (1 << 20),
    /**
     * Set if bottom has a val other than "auto"
     */
    BOTTOM_VAL = (1 << 21),
    /**
     * Set if margin-top has a val other than "auto"
     */
    MARGIN_T_VAL = (1 << 22),
    /**
     * Set if margin-bottom has a val other than "auto"
     */
    MARGIN_B_VAL = (1 << 23),
    /**
     * Set if padding-top has a val other than "auto"
     */
    PADDING_T_VAL = (1 << 24),
    /**
     * Set if padding-bottom has a val other than "auto"
     */
    PADDING_B_VAL = (1 << 25),
    /**
     * Set if border-top has a val other than "auto"
     */
    BORDER_T_VAL = (1 << 26),
    /**
     * Set if border-bottom has a val other than "auto"
     */
    BORDER_B_VAL = (1 << 27),

    VERTICAL_BOX_MASK = ((1 << 28) - 1) ^ (CSSFlags.POSITION_MASK | CSSFlags.DISPLAY_MASK | CSSFlags.HORIZONTAL_BOX_MASK)

}
/**  
 * Cache collects info about the CSS state of an element and provides methods to create new properties.
 * It maintains a connection to the Component Data of an element.
*/

export class CSSCache {

    element: HTMLElement;
    next: CSSCache;

    box_model_flags: CSSFlags;
    cssflagsB: CSSFlags;

    move_vert_type: string;
    move_hori_type: string;

    changed: Set<string>;

    unique: Map<string, TrackedCSSProp>;
    unique_selector: string;
    original_props: Map<string, TrackedCSSProp>;
    _computed: any;

    component: string;

    rules: any;

    crate: ObjectCrate;

    move_type: string;

    LOCKED: boolean;

    system: FlameSystem;

    computed: CSSStyleDeclaration;

    styles: StyleSheet[];

    rule_ref: CSSRule;


    /**
     * The file location in which the active rule lives
     */
    location: string;

    /**
     * A string of the selectors from the remote target 
     * rule which will be updated. 
     */
    source_selectors: string;

    target_rule: CSSRuleNode;

    load: Promise<void>;

    COMPONENT_ELEMENT: boolean;

    DIRTY: boolean;

    DIRTY_ID: boolean;

    constructor() {
        this.setup();
    }

    destroy() {
        this.removeUniqueSelector();

        this.setup();

        this.next = global_cache;

        global_cache = this;
    }

    setup() {
        this.DIRTY = false;
        this.rules = null;
        this.element = null;
        this.component = null;
        this.next = null;
        this.box_model_flags = 0;
        this.cssflagsB = 0;
        this.move_vert_type = "";
        this.move_hori_type = "";
        this.unique = null;
        this._computed = null;
        this.changed = null;
        this.styles = null;
        this.LOCKED = false;
        this.rule_ref = null;
        this.target_rule = null;
    }
    createRule() {

    }

    async loadStyles() {

        let comp = getComponentNameFromElement(this.element);

        const names = getComponentHierarchyNames(this.system, comp);

        const styles: StyleSheet[] = [];

        for (const { name, depth } of names) {

            const response = await this.system.session.send_awaitable_command<
                EditorCommand.GET_COMPONENT_STYLE,
                EditorCommand.GET_COMPONENT_STYLE_RESPONSE
            >({
                command: EditorCommand.GET_COMPONENT_STYLE,
                component_name: name
            });

            let index = 0;

            for (const style of response.styles) {
                styles.push({
                    index: index++,
                    comp_name: name,
                    location: new URI(style.location),
                    styles: attachParents(parse(style.string))
                });
            }
        }

        this.component = comp;

        this.COMPONENT_ELEMENT = this.element.hasAttribute("w:c");

        this.computed = window.getComputedStyle(this.element);

        this.styles = styles;

        this.setupStyle();
    }

    init(system: FlameSystem, ele: HTMLElement) {
        this.setup();

        this.element = ele;
        this.system = system;
        this.source_selectors = "";
        this.location = "";

        this.load = this.loadStyles();
    }


    lock(lock: boolean = false) {
        if (lock)
            this.LOCKED = true;
        return this.LOCKED;
    }

    setupStyle() {
        const
            element = this.element,
            system = this.system;

        // The unique rule either exists within the edit style sheet cache,
        // or a new one needs to be made.

        this.original_props = getApplicableProps(system, element, this.styles);
        this.changed = new Set();
        this.unique = new Map();
        this.rules = this.unique;
    }

    getRuleList() {
        const
            ele = this.element,
            sys = this.system;

        const rules = getMatchedRulesFromComponentData(sys, ele, this.styles);

        this.rule_list = rules.map((r, i) => ({

            path: createRulePath(r),

            index: i,

            id: r.selectors.map(s => renderCompressed(s)).join(" "),

            rule: r,
        }));

        return this.rule_list;
    }

    setTargetRule(index) {

        this.uploadChanges();

        this.target_rule = this.rule_list[index].rule;
    }
    setUniqueSelector() {

        if (!this.unique_selector && this.target_rule) {

            //if at this point there is no suitable rule,
            //create a new ID, assign to ele and
            //use the id for the selector for the element.

            this.unique_selector = "A" + ((Math.random() * 12565845322) + "").slice(0, 5);

            for (const ele of getContemporaryElements(
                this.element,
                this.system.page_wick)
            ) {
                ele.classList.add(this.unique_selector);
            }
        }

        this.DIRTY = true;
    }

    removeUniqueSelector() {
        if (this.unique_selector) {
            console.log({
                s: getContemporaryElements(
                    this.element,
                    this.system.page_wick)
            });
            for (const ele of getContemporaryElements(
                this.element,
                this.system.page_wick)
            ) {
                ele.classList.remove(this.unique_selector);
            }
        }
        this.unique_selector = null;
    }

    clearChanges(system: FlameSystem) {
        this.removeRule(system);
    }

    applyChanges(system: FlameSystem, nonce: number) {


        if (this.changed.size > 0 && this.component) {

            const rule_string =
                this.generateRuleString(!this.COMPONENT_ELEMENT);

            const index = this.removeRule(system);

            this.rule_ref = system.scratch_stylesheet.rules[
                system.scratch_stylesheet.insertRule(
                    rule_string,
                    index
                )
            ];
        }
    }

    uploadChanges() {
        if (this.DIRTY)
            this.load = this.__uploadChanges__();

    }

    async __uploadChanges__() {

        const changes: (Change[ChangeType.CSSRule] | Change[ChangeType.Attribute])[]
            = this.generateClientCSSChanges();

        /* if (this.DIRTY_ID) {
            changes.push(<Change[ChangeType.Attribute]>{
                type: ChangeType.Attribute,
                attribute_index: 0,
                ele_id: parseInt(this.element.getAttribute("w:u")),
                name: "id",
                new_value: this.element.id,
                old_value: "",
            });
        } */

        const response = await this.system.session.send_awaitable_command<
            EditorCommand.APPLY_COMPONENT_CHANGES,
            EditorCommand.OK
        >({
            command: EditorCommand.APPLY_COMPONENT_CHANGES,
            component_changes: [{
                old_component: this.component,
                changes
            }]
        });

        if (response.command != EditorCommand.OK) {
            return;
        }

        this.DIRTY = false;
        this.DIRTY_ID = false;
    }

    generateClientCSSChanges():
        Change[ChangeType.CSSRule][] {

        this.location = "";

        const patch: Change[ChangeType.CSSRule][] = [{
            type: ChangeType.CSSRule,
            location: this.location,
            CSS_index: 0,
            new_selectors: this.target_rule.selectors.map(renderCompressed).join(","),
            old_selectors: this.target_rule.selectors.map(renderCompressed).join(","),
            old_rule_path: createRulePath(this.target_rule),
            new_rule_path: createRulePath(this.target_rule),
            new_properties: [...this.unique.values()]
                .filter(e => this.changed.has(e.prop.name))
                .map(e => ({ name: e.prop.name, val: e.prop.value_string }))
        }];

        return patch;
    }

    generateRuleString(USE_COMPONENT_CLASS: boolean = true): string {

        //Retrieve all components with that match the selector
        const props = [...this.unique.values()]
            .filter(e => this.changed.has(e.prop.name)).map(e => e.prop);

        return `.${this.unique_selector} {\n  ${props.map(p => p.toString() + " !important").join(";\n  ")}\n}`;
    }

    private removeRule(system: FlameSystem) {

        let index = undefined;

        if (this.rule_ref) {

            index = Array.prototype.indexOf.call(
                system.scratch_stylesheet.rules,
                this.rule_ref
            );

            system.scratch_stylesheet.removeRule(index);
        }
        return index;
    }

    getPositionType(): CSSFlags {
        if ((this.box_model_flags & CSSFlags.POSITION_MASK) == 0)

            switch (this.getProp("position").value_string) {
                case "absolute": {
                    this.box_model_flags |= CSSFlags.ABSOLUTE;
                } break;
                case "static": {
                    this.box_model_flags |= CSSFlags.STATIC;
                } break;
                case "fixed": {
                    this.box_model_flags |= CSSFlags.FIXED;
                } break;
                case "sticky": {
                    this.box_model_flags |= CSSFlags.STATIC;
                } break;
                case "relative":
                default: {
                    this.box_model_flags |= CSSFlags.RELATIVE;
                }
            }
        return this.box_model_flags;
    }

    getDisplayType(): CSSFlags {
        if ((this.box_model_flags & CSSFlags.DISPLAY_MASK) == 0)
            switch (this.getProp("display").value_string) {
                case "block": {
                    this.box_model_flags |= CSSFlags.BLOCK;
                } break;
                case "inline-block": {
                    this.box_model_flags |= CSSFlags.INLINE_BLOCK;
                } break;
                case "static": {
                    this.box_model_flags |= CSSFlags.STATIC;
                } break;
                case "table": {
                    this.box_model_flags |= CSSFlags.TABLE;
                } break;
                case "inline":
                default: {
                    this.box_model_flags |= CSSFlags.INLINE;
                }
            }
        return this.box_model_flags;
    };

    isPropSet(prop_name: string): boolean {
        const prop = this.getProp(prop_name, false);
        return this.isValuePresent(prop ? prop.value_string : "");
    }

    isValuePresent(str: string): boolean {
        return !!str && str !== "auto" && str !== "unset" && str !== "inherit";
    }

    getHorizontalBoxFlag(): CSSFlags {
        this.getPositionType();
        this.getDisplayType();

        if ((this.box_model_flags & CSSFlags.HORIZONTAL_BOX_MASK) == 0) {
            //width
            if (this.isPropSet("width"))
                this.box_model_flags |= CSSFlags.WIDTH_VAL;

            if (this.isPropSet("left"))
                this.box_model_flags |= CSSFlags.LEFT_VAL;

            if (this.isPropSet("right"))
                this.box_model_flags |= CSSFlags.RIGHT_VAL;

            //Determine if border right has been set 
            //Check to see the precedence of the border right property
            // Border
            const
                left_border =
                    [
                        this.getProp("border", false),
                        this.getProp("border_left", false),
                        this.getProp("border_left_width", false)
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                right_border =
                    [
                        this.getProp("border", false),
                        this.getProp("border_right", false),
                        this.getProp("border_right_width", false)
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                left_margin =
                    [
                        this.getProp("margin", false),
                        this.getProp("margin_left", false),
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                right_margin =
                    [
                        this.getProp("margin", false),
                        this.getProp("margin_right", false),
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                left_padding =
                    [
                        this.getProp("padding", false),
                        this.getProp("padding_left", false),
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                right_padding =
                    [
                        this.getProp("padding", false),
                        this.getProp("padding_right", false),
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                multi_selection = [0, 1, 1, 3];


            let val = "";

            if (left_border) {
                switch (left_border.name) {
                    case "border":
                    case "border_left": val = left_border.val[0] + ""; break;
                    default: val = left_border.value_string;
                }

                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.BORDER_L_VAL;
            }

            if (right_border) {
                switch (right_border.name) {
                    case "border":
                    case "border_right": val = right_border.val[0] + ""; break;
                    default: val = right_border.value_string;
                }

                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.BORDER_R_VAL;
            }

            if (left_margin) {
                switch (left_margin.name) {
                    case "margin":
                        val = left_margin.val[multi_selection[left_margin.val.length]];
                    default: val = left_margin.value_string;
                        break;
                }
                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.MARGIN_L_VAL;
            }

            if (right_margin) {
                switch (right_margin.name) {
                    case "margin":
                        val = right_margin.val[multi_selection[right_margin.val.length]];
                    default: val = right_margin.value_string;
                        break;
                }
                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.MARGIN_R_VAL;
            }

            if (left_padding) {
                switch (left_padding.name) {
                    case "padding":
                        val = left_padding.val[multi_selection[left_padding.val.length]];
                    default: val = left_padding.value_string;
                        break;
                }
                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.PADDING_L_VAL;
            }

            if (right_padding) {
                switch (right_padding.name) {
                    case "padding":
                        val = right_padding.val[multi_selection[right_padding.val.length]];
                    default: val = right_padding.value_string;
                        break;
                }
                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.PADDING_R_VAL;
            }
        }
        return this.box_model_flags;
    }

    getVerticalBoxFlag(): CSSFlags {
        this.getPositionType();
        this.getDisplayType();

        if ((this.box_model_flags & CSSFlags.VERTICAL_BOX_MASK) == 0) {

            if (this.isPropSet("height"))
                this.box_model_flags |= CSSFlags.HEIGHT_VAL;

            if (this.isPropSet("top"))
                this.box_model_flags |= CSSFlags.TOP_VAL;

            if (this.isPropSet("bottom"))
                this.box_model_flags |= CSSFlags.BOTTOM_VAL;

            //Determine if border right has been set 
            //Check to see the precedence of the border right property
            // Border
            const
                top_border =
                    [
                        this.getProp("border", false),
                        this.getProp("border_top", false),
                        this.getProp("border_top_width", false)
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                bottom_border =
                    [
                        this.getProp("border", false),
                        this.getProp("border_bottom", false),
                        this.getProp("border_bottom_width", false)
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                top_margin =
                    [
                        this.getProp("margin", false),
                        this.getProp("margin_top", false),
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                bottom_margin =
                    [
                        this.getProp("margin", false),
                        this.getProp("margin_bottom", false),
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                top_padding =
                    [
                        this.getProp("padding", false),
                        this.getProp("padding_top", false),
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                bottom_padding =
                    [
                        this.getProp("padding", false),
                        this.getProp("padding_bottom", false),
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                multi_selection = [0, 1, 1, 3];


            let val = "";

            if (top_border) {
                switch (top_border.name) {
                    case "border":
                    case "border_top": val = top_border.val[0] + ""; break;
                    default: val = top_border.value_string;
                }

                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.BORDER_T_VAL;
            }

            if (bottom_border) {
                switch (bottom_border.name) {
                    case "border":
                    case "border_right": val = bottom_border.val[0] + ""; break;
                    default: val = bottom_border.value_string;
                }

                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.BORDER_B_VAL;
            }

            if (top_margin) {
                switch (top_margin.name) {
                    case "margin":
                        val = top_margin.val[multi_selection[top_margin.val.length]];
                    default: val = top_margin.value_string;
                        break;
                }
                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.MARGIN_T_VAL;
            }

            if (bottom_margin) {
                switch (bottom_margin.name) {
                    case "margin":
                        val = bottom_margin.val[multi_selection[bottom_margin.val.length]];
                    default: val = bottom_margin.value_string;
                        break;
                }
                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.MARGIN_B_VAL;
            }

            if (top_padding) {
                switch (top_padding.name) {
                    case "padding":
                        val = top_padding.val[multi_selection[top_padding.val.length]];
                    default: val = top_padding.value_string;
                        break;
                }
                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.PADDING_T_VAL;
            }

            if (bottom_padding) {
                switch (bottom_padding.name) {
                    case "padding":
                        val = bottom_padding.val[multi_selection[bottom_padding.val.length]];
                    default: val = bottom_padding.value_string;
                        break;
                }
                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.PADDING_B_VAL;
            }
        }
        return this.box_model_flags;
    }

    //Need a way to keep check of changed properties.
    getProp(name: string, INCLUDE_COMPUTED: boolean = true): CSSProperty {

        // Check to see if the property is already queued in the
        // Prop cache, if it is not, then pull property information
        // from the computed property, parse, and place the new prop
        // into the cache. 

        let prop = null;

        if (this.unique.has(name))
            prop = this.unique.get(name).prop;
        else if (this.original_props.has(name))
            prop = this.original_props.get(name).prop;
        else if (this.element.style[CSSProperty.camelName(name)]) {

            const
                prop_value = this.element.style[CSSProperty.camelName(name)] + "",
                prop = parseProperty(name, prop_value, false);

            prop.precedence |= PrecedenceFlags.A_BIT_SET;

            this.original_props.set(name, { prop, sel: null, unique: false });

            return this.getProp(name);

        } else if (INCLUDE_COMPUTED) {


            const
                prop_value = this.computed[name] + "",
                prop = parseProperty(name, prop_value, false);

            this.original_props.set(name, { prop, sel: null, unique: false });

            return this.getProp(name);
        }

        return prop ? prop.copy() : prop;
    }

    setProp(prop: CSSProperty) {

        this.setUniqueSelector();

        const name = prop.name;

        this.changed.add(name);

        if (!this.unique.has(name)) {
            this.unique.set(name, { prop, sel: this.unique_selector, unique: true });
        } else {
            this.unique.get(name).prop.setValue(prop);
        }
    }
    /**
     * Create an unset property and apply to the changed cache.
     * @param prop_name - name of property to unset
     * @param FORCE - If true, for unset even if the property is not defined within 
     * the current cascade. Defaults to false
     */
    unsetProp(prop_name: string, FORCE: boolean = false) {

        this.setUniqueSelector();

        if (this.original_props.has(prop_name) || FORCE) {
            this.changed.add(prop_name);
            this.unique.set(prop_name, {
                sel: this.unique_selector,
                prop: new CSSProperty(prop_name, "unset", [unset_string], true, <Lexer>unset_pos)
            });
        }
    }

    createProp(prop_string: string): CSSProperty {
        return property(prop_string);
    }

    setPropFromString(string: string) {

        for (const str of string.split(";"))
            if (str)
                this.setProp(this.createProp(str));
    }

}

export function updateLastOccurrenceOfRuleInStyleSheet(stylesheet: any, rule: CSSRuleNode) {

    const selector_string = renderCompressed(rule.selectors[0]);
    let matching_rule = getLastRuleWithMatchingSelector(stylesheet, rule.selectors[0]);

    if (!matching_rule) {
        matching_rule = copy(rule);
        stylesheet.nodes.push(matching_rule);
    } else {
        for (const [name, prop] of rule.props.entries()) {
            matching_rule.props.set(name, prop);
        }
    }
}

const cache_array: { e: HTMLElement, cache: CSSCache; }[] = [];

export function getCSSCache(
    sys: FlameSystem,
    ele: HTMLElement
): CSSCache {

    let eligible: { e: HTMLElement, cache: CSSCache; } = null;

    for (const cache of cache_array) {

        const { e, cache: c } = cache;

        if (ele == e) return c;

        if (c.load) continue;

        else if (!eligible && !e) eligible = cache;
    }

    if (!eligible) {
        eligible = { e: ele, cache: new CSSCache };
        cache_array.push(eligible);
    }

    eligible.cache.init(sys, ele);

    return eligible.cache;
}

export function releaseCSSCache(cache: CSSCache) {

    cache_logger.debug(`Releasing css cache for ${cache.component} element:${cache.element.getAttribute("w:u")}`);

    cache.uploadChanges();
    cache.load.then(() => cache.destroy());

    for (const c of cache_array)
        if (c.cache == cache) {
            c.e = null;
            return;
        }
};

function getComponentHierarchyNames(
    sys: FlameSystem,
    name: string
) {
    const components = getRuntimeComponentsFromName(name, sys.page_wick);
    const list = [{
        name,
        depth: 0
    }], seen = new Set();

    for (let comp of components) {

        let depth = 1;

        while (comp.par) {
            if (!seen.has(comp.par.name)) {
                list.push({
                    name: comp.par.name,
                    depth
                });
            }

            depth++;

            seen.add(comp.par.name);

            comp = comp.par;
        }

    }

    return list;
}