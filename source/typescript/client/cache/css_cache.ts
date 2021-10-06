import { copy, renderCompressed, traverse } from '@candlelib/conflagrate';
import {
    CSSNode,
    CSSNodeType,
    CSSProperty,
    CSSRuleNode,
    CSS_String,
    getLastRuleWithMatchingSelector,
    getMatchedElements,
    parseProperty,
    PrecedenceFlags,
    property,
    selector
} from "@candlelib/css";
import { WickRTComponent } from "@candlelib/wick";
import { Lexer } from "@candlelib/wind";
import { getApplicableProps, getMatchedRulesFromComponentData, getRTInstances } from "../common_functions.js";
import { FlameSystem } from "../types/flame_system.js";
import { ObjectCrate } from "../types/object_crate.js";
import { EditorSelection } from "../types/selection.js";
import { TrackedCSSProp } from "../types/tracked_css_prop.js";


let global_cache = null;

const unset_string = new CSS_String("unset"), unset_pos = {
    slice() { return "unset"; }
};

class ComputedStyle {
    cache: CSSCache;
    _computed: CSSStyleDeclaration;
    brect: DOMRect;

    constructor(
        system: FlameSystem,
        component: WickRTComponent,
        element: HTMLElement,
        cache: CSSCache,
    ) {
        this.cache = cache;
        this._computed = system.window.getComputedStyle(element);
        this.brect = element.getBoundingClientRect();
    }

    get width() {
        return this.brect.width;
    }

    get hight() {
        return this.brect.height;
    }

    get(value: string) {

        const internal_value = this.cache.rules.props[value];

        if (internal_value)
            return internal_value.toString();

        return this._computed.getPropertyValue(value);
    }
}

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
 * It maintains a connection to the Component Data of an element, and directly manipulates CSS values
 * within the Component DATA. 
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
    unique_selector: CSSNode;
    original_props: Map<string, TrackedCSSProp>;
    _computed: any;

    component: WickRTComponent;

    rules: any;

    crate: ObjectCrate;

    move_type: string;

    LOCKED: boolean;

    system: FlameSystem;

    sel: EditorSelection;

    computed: CSSStyleDeclaration;

    constructor() {
        this.setup();
    }

    destroy() {
        this.LOCKED = false;
        this.changed = null;
        this.rules = null;
        this.element = null;
        this._computed = null;
        this.next = global_cache;
        this.box_model_flags = 0;
        this.cssflagsB = 0;
        this.move_type = "";
        this.computed = null;
        global_cache = this;
    }

    setup() {
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
        this.LOCKED = false;
    }

    init(system: FlameSystem, crate: ObjectCrate) {
        this.setup();

        const { ele, comp, frame_ele } = crate.sel;

        this.sel = crate.sel;
        this.crate = crate;
        this.element = ele;
        this.system = system;
        this.component = comp;
        this.computed = window.getComputedStyle(ele);
        //calculate horizontal and vertical rations. also width and height ratios.  
        this.setupStyle();
    }

    setUniqueSelector(sys: FlameSystem, comp: WickRTComponent, ele: HTMLElement, crate: ObjectCrate) {

        //get all rules that match selector
        //for all rules that have a single selector 
        //  if the selector is a plain .class rule or @id rule
        //      determine how many elements are affected by this rule
        //      if this number is 1, then select this rule to be 
        //      unique rule for this element.

        const rules = getMatchedRulesFromComponentData(sys, comp, ele).reverse();

        for (const rule of rules) {
            if (rule.selectors.length == 1) {
                const [sel] = rule.selectors;

                let count = -1;

                for (const { node, meta } of traverse(sel, "nodes")) {
                    switch (node.type) {
                        case CSSNodeType.CompoundSelector:
                        case CSSNodeType.ComplexSelector:
                            break;
                        case CSSNodeType.ClassSelector:
                        case CSSNodeType.IdSelector:
                            count++;
                            break;
                        default:
                            count += 2;
                    }
                }

                if (count == 1 && Array.from(getMatchedElements(comp.ele, rule)).length == 1)
                    return this.unique_selector = sel;
            }
        }

        if (ele.id) {
            this.unique_selector = selector(`#${ele.id}`);
        } else {

            //if at this point there is no suitable rule,
            //create a new ID, assign to ele and
            //use the id for the selector for the element.
            debugger;
            const id = "A" + ((Math.random() * 12565845322) + "").slice(0, 5);

            //crate.action_list.unshift(SET_ATTRIBUTE);

            crate.data.key = "id";

            crate.data.val = id;

            this.unique_selector = selector(`#${id}`);
        }
    }

    lock(lock: boolean = false) {
        if (lock)
            this.LOCKED = true;
        return this.LOCKED;
    }

    setupStyle() {
        const
            element = this.element,
            system = this.system,
            component = this.component;

        let move_type = system.move_type || "absolute";

        // The unique rule either exists within the edit style sheet cache,
        // or a new one needs to be made.
        this.setUniqueSelector(system, component, element, this.crate);
        this.original_props = getApplicableProps(system, component, element);
        this.changed = new Set();
        this.unique = new Map();
        this.rules = this.unique;

        /*


        for (const [name, val] of this.original_props.entries())
            if (val.unique)
                this.unique.set(name, { sel: val.sel, prop: val.prop.copy(), unique: true });


        //test for presence of rules. 
        let POS_R = 0,
            POS_A = 0,
            HT = 0,
            HL = 0,
            HB = 0,
            HR = 0,
            HM = 0,
            HMR = 0,
            HMT = 0,
            HMB = 0,
            HML = 0,
            W = 0,
            H = 0;



        if (this.getProp("position").toString() == "relative")
            POS_R = 1;
        else
            POS_A = 1;


        if (this.getProp("left"))
            HL = 1;
        if (this.getProp("right"))
            HR = 1;
        if (this.getProp("top"))
            HT = 1;
        if (this.getProp("bottom"))
            HB = 1;

        if (this.getProp("margin-left"))
            HML = 1;
        if (this.getProp("margin-right"))
            HMR = 1;
        if (this.getProp("margin-top"))
            HMT = 1;
        if (this.getProp("margin-bottom"))
            HMB = 1;
        if (this.getProp("margin"))
            HM = 1;

        if (this.getProp("width"))
            W = 1;
        if (this.getProp("height"))
            H = 1;

        //      1                     2                   4                 8                 16                
        let v = ((POS_R | 0) << 0) | ((POS_A | 0) << 1) | ((HT | 0) << 2) | ((HR | 0) << 3) | ((HB | 0) << 4) |
            //32                64                 128                256                512                1024              2048            4096
            ((HL | 0) << 5) | ((HMT | 0) << 6) | ((HMR | 0) << 7) | ((HMB | 0) << 8) | ((HML | 0) << 9) | ((W | 0) << 10) | ((H | 0) << 11) | ((HM | 0) << 12);

        if ((60 & v) > 0) { //

            if ((v & 40) == 0) { // HT + HL
                //missing left / right position value.original_rules
                //Add left
                this.setPropFromString(`left:0px`);
                v |= 1 << 5;
            }

            if ((v & 20) == 0) { // HT + HR
                //missing top / bottom position value
                //Add top
                this.setPropFromString(`top:0px`);
                v |= 1 << 2;
            }
        } else if ((960 & v) > 0) {
            //using margin
        } else {

            //Create left and top positions or us margin depending on current user preferences.
            this.setPropFromString(`left:0px;top:0px`);
            v |= 4 | 32;
        }

        if ((v & 3) == 0) {

            if (move_type == "absolute") {
                v |= 2;
                this.setPropFromString('position:absolute');
            } else if (move_type == "relative") {
                v |= 1;
                this.setPropFromString('position:relative;');
            }
        }


        //Setup move systems. 
        while (true) {

            let p = [];

            if ((32 & v))
                p.push("left");
            if ((8 & v))
                p.push("right");

            if ((v & 1024)
                && (this.getProp("width")
                    &&
                    this.getProp("width").prop + "" !== "auto"
                )
            ) {
                if ((v & (128 + 512 + 4096))) {
                    if ((
                        this.getProp("margin-left").toString() == "auto"
                        && this.getProp("margin-left").toString() == "auto")
                        || this.getProp("margin").toString() == "auto")
                        p.push("margin");
                }
            }

            if (p.length > 0)
                this.move_hori_type = p.join(" ");

            p = [];


            //vertical types
            if (2 & v) {
                let p = [];

                if ((4 & v))
                    p.push("top");
                if ((16 & v) && (p.length < 1) || !(v & 2048))
                    p.push("bottom");

                if (p.length > 0)
                    this.move_vert_type = p.join(" ");
            }

            if (1 & v) {
                let p = [];

                if ((4 & v))
                    p.push("top");
                if ((16 & v) && (p.length < 1))
                    p.push("bottom");

                if (p.length > 0)
                    this.move_vert_type = p.join(" ");
            }

            break;
        }

        this.cssflagsA = v;

        this.rules = this.unique;
        */
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

    clearChanges(system: FlameSystem) {
        //Retrieve all components with that match the selector
        const props = [...this.unique.values()].filter(e => this.changed.has(e.prop.name)).map(e => e.prop);

        if (this.sel.IS_COMPONENT_FRAME) {

            for (const prop of props)
                this.sel.ele.style[prop.camelName] = "";

        } else {

            for (const c of getRTInstances(system, this.component.name)) {

                for (const e of getMatchedElements(c.ele, this.unique_selector)) {
                    for (const prop of props)
                        e.style[prop.camelName] = "";
                }
            }
        }

        return;
    }

    applyChanges(system: FlameSystem, nonce: number) {

        //Retrieve all components with that match the selector
        const props = [...this.unique.values()].filter(e => this.changed.has(e.prop.name)).map(e => e.prop);

        if (this.sel.IS_COMPONENT_FRAME) {

            for (const prop of props)
                this.sel.ele.style[prop.camelName] = prop.value_string;

        } else {

            for (const c of getRTInstances(system, this.component.name)) {

                for (const e of getMatchedElements(c.ele, this.unique_selector)) {
                    for (const prop of props)
                        e.style[prop.camelName] = prop.value_string;
                }
            }
        }
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

//Flags
CSSCache.relative = 1;
CSSCache.absolute = 2;

const cache_array: { e: HTMLElement, cache: CSSCache; }[] = [];

export function CSSCacheFactory(
    sys: FlameSystem,
    comp: WickRTComponent,
    ele: HTMLElement,
    crate: ObjectCrate
): CSSCache {

    let eligible: { e: HTMLElement, cache: CSSCache; } = null;

    for (const cache of cache_array) {
        const { e, cache: c } = cache;

        if (ele == e) return c;

        else if (!eligible && !e) eligible = cache;
    }

    if (!eligible) {
        eligible = { e: ele, cache: new CSSCache };
        cache_array.push(eligible);
    }

    eligible.cache.init(sys, crate);

    return eligible.cache;
}

CSSCacheFactory.destroy = function (cache: CSSCache) {
    for (const c of cache_array)
        if (c.cache == cache) {
            c.e = null;
            return;
        }
};
