import { CSSProperty, CSSTreeNode, CSSRuleNode } from "@candlefw/css";
import { RuntimeComponent } from "@candlefw/wick";
import { css, conflagrate } from "../env.js";
import { TrackedCSSProp } from "../types/tracked_css_prop.js";
import { FlameSystem } from "../types/flame_system.js";
import { getApplicableProps } from "../css.js";
import { SET_ATTRIBUTE } from "../actions/html.js";
import { ObjectCrate } from "../types/object_crate.js";
import { getComponentData, getActiveComponentInstances } from "../common_functions.js";

let global_cache = null;

function isSelectorCapableOfBeingUnique(selector: CSSTreeNode, root_name: string): boolean {
    let count = 0;

    const { CSSTreeNodeType } = css;

    for (const { node, meta: { parent } } of conflagrate.traverse(selector, "nodes")) {
        switch (node.type) {
            case CSSTreeNodeType.CompoundSelector:
            case CSSTreeNodeType.ComplexSelector:
                break;
            case CSSTreeNodeType.ClassSelector:
                if (node.value == root_name && parent)
                    break;
            case CSSTreeNodeType.IdSelector:
                count++;
                break;
            default:
                count += 2;
        }
    }

    return count == 1;
}

function getApplicableProps_(system: FlameSystem, component: RuntimeComponent, element: HTMLElement, unique_selector: CSSTreeNode) {

    const props = getApplicableProps(system, component, element);

    for (const v of props.values()) {
        const
            { sel } = v,
            elements = [...css.getMatchedElements(component.ele, sel)];

        if (
            css.isSelectorEqual(sel, unique_selector)
            || (
                elements.length == 1
                &&
                isSelectorCapableOfBeingUnique(sel, component.name
                )
            )
        ) {
            v.unique = true;
        }
    }

    return props;
}

class ComputedStyle {
    cache: CSSCache;
    _computed: CSSStyleDeclaration;
    brect: DOMRect;

    constructor(
        system: FlameSystem,
        component: RuntimeComponent,
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

interface ACTION {

}

/**  
 * Cache collects info about the CSS state of an element and provides methods to create new properties.
 * It maintains a connection to the Component Data of an element, and directly manipulates CSS values
 * within the Component DATA. 
*/

export class CSSCache {

    element: HTMLElement;
    next: CSSCache;

    cssflagsA: number;
    cssflagsB: number;
    valueA: number;
    valueB: number;
    valueC: number;
    valueD: number;

    move_vert_type: string;
    move_hori_type: string;

    changed: Set<string>;

    unique: Map<string, TrackedCSSProp>;
    unique_selector: CSSTreeNode;
    original_props: Map<string, TrackedCSSProp>;
    _computed: any;

    component: RuntimeComponent;

    rules: any;

    move_type: string;

    LOCKED: boolean;

    system: FlameSystem;

    constructor() {
        this.rules = null;
        this.element = null;
        this.component = null;
        this.cssflagsA = 0;
        this.cssflagsB = 0;
        this.next = null;
        this.valueA = 0;
        this.valueB = 0;
        this.valueC = 0;
        this.valueD = 0;
        this.move_vert_type = "";
        this.move_hori_type = "";
        this.unique = null;
        this._computed = null;
        this.changed = null;
        this.LOCKED = false;
    }

    destroy() {
        this.LOCKED = false;
        this.changed = null;
        this.rules = null;
        this.element = null;
        this._computed = null;
        this.cssflagsA = 0;
        this.cssflagsB = 0;
        this.move_type = "";
        this.valueA = 0;
        this.valueB = 0;
        this.valueC = 0;
        this.valueD = 0;
        this.next = global_cache;
        global_cache = this;
    }

    get computed() {
        if (!this._computed)
            this._computed = new ComputedStyle(this.component, this.element, this);
        return this._computed;
    }

    update(system: any) {
        if (!system)
            return;

        this.generateMovementCache(system, this.component, this.element);
    }

    setUniqueSelector(sys: FlameSystem, comp: RuntimeComponent, ele: HTMLElement, crate: ObjectCrate) {

        //get all rules that match selector
        //for all rules that have a single selector 
        //  if the selector is a plain .class rule or @id rule
        //      determine how many elements are affected by this rule
        //      if this number is 1, then select this rule to be 
        //      unique rule for this element.

        const rules = sys.css.getApplicableRulesFromComponentData(sys, comp, ele).reverse();

        for (const rule of rules) {
            if (rule.selectors.length == 1) {
                const [sel] = rule.selectors;
                const { CSSTreeNodeType } = css;

                let count = -1;

                for (const { node, meta } of conflagrate.traverse(sel, "nodes")) {
                    switch (node.type) {
                        case CSSTreeNodeType.CompoundSelector:
                        case CSSTreeNodeType.ComplexSelector:
                            break;
                        case CSSTreeNodeType.ClassSelector:
                        case CSSTreeNodeType.IdSelector:
                            count++;
                            break;
                        default:
                            count += 2;
                    }
                }

                if (count == 1 && Array.from(css.getMatchedElements(comp.ele, rule)).length == 1)
                    return this.unique_selector = sel;
            }
        }

        if (ele.id) {
            this.unique_selector = css.selector(`#${ele.id}`);
        } else {

            //if at this point there is no suitable rule,
            //create a new ID, assign to ele and
            //use the id for the selector for the element.
            const id = "A" + ((Math.random() * 12565845322) + "").slice(0, 5);

            crate.action_list.unshift(SET_ATTRIBUTE);

            crate.data.key = "id";

            crate.data.val = id;

            this.unique_selector = css.selector(`#${id}`);
        }
    }

    lock(lock: boolean = false) {
        if (lock)
            this.LOCKED = true;
        return this.LOCKED;
    }

    init(system: FlameSystem, crate: ObjectCrate) {

        this.crate = crate;
        this.element = crate.ele;
        this.system = system;
        this.component = crate.comp;
        //calculate horizontal and vertical rations. also width and height ratios.  
        this.setupStyle();
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

        let css_r = getApplicableProps_(system, component, element, this.unique_selector);

        this.original_props = css_r;
        this.changed = new Set();
        this.unique = new Map();

        for (const [name, val] of this.original_props.entries())
            if (val.unique)
                this.unique.set(name, { sel: val.sel, prop: val.prop.copy(), unique: true });


        //test for presence of rules. 
        let POS_R = false,
            POS_A = false,
            HT = false,
            HL = false,
            HB = false,
            HR = false,
            HM = false,
            HMR = false,
            HMT = false,
            HMB = false,
            HML = false,
            W = false,
            H = false;

        if (css_r.has("position")) {
            if (css_r.position == "relative")
                POS_R = true;
            else
                POS_A = true;
        }

        if (css_r.has("left"))
            HL = true;
        if (css_r.has("right"))
            HR = true;
        if (css_r.has("top"))
            HT = true;
        if (css_r.has("bottom"))
            HB = true;

        if (css_r.has("margin_left"))
            HML = true;
        if (css_r.has("margin_right"))
            HMR = true;
        if (css_r.has("margin_top"))
            HMT = true;
        if (css_r.has("margin_bottom"))
            HMB = true;
        if (css_r.has("margin"))
            HM = true;

        if (css_r.has("width"))
            W = true;
        if (css_r.has("height"))
            H = true;

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
                && (css_r.has("width")
                    &&
                    css_r.get("width").prop + "" !== "auto"
                )
            ) {
                if ((v & (128 + 512 + 4096))) {
                    if ((css_r.margin_left == "auto" && css_r.margin_left == "auto") || css_r.margin == "auto")
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
    }

    //Need a way to keep check of changed properties.
    getProp(name: string): CSSProperty {
        let prop = null;

        if (this.unique.has(name))
            prop = this.unique.get(name).prop;
        else if (this.original_props.has(name))
            prop = this.original_props.get(name).prop;

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

    createProp(prop_string: string): CSSProperty {
        return css.property(prop_string);
    }

    get position() {
        if (this.cssflagsA & CSSCache.relative)
            return "relative";
        if (this.cssflagsA & CSSCache.absolute)
            return "absolute";
        return "auto";

    }



    setPropFromString(string: string) {
        for (const str of string.split(";")) {
            const prop = this.createProp(str);
            this.setProp(prop);
        }
    }

    applyChangesToCSS();

    clearChanges(system: FlameSystem) {
        //Retrieve all components with that match the selector
        const
            comp = getActiveComponentInstances(system, this.component.name),
            props = [...this.unique.values()].filter(e => this.changed.has(e.prop.name)).map(e => e.prop);
        for (const c of comp) {

            for (const e of css.getMatchedElements(c.ele, this.unique_selector)) {
                for (const prop of props)
                    e.style[prop.camelName] = "";
            }
        }

        return;
    }

    applyChanges(system: FlameSystem, nonce: number) {

        //Retrieve all components with that match the selector
        const
            comp = getActiveComponentInstances(system, this.component.name),
            props = [...this.unique.values()].filter(e => this.changed.has(e.prop.name)).map(e => e.prop);
        for (const c of comp) {

            for (const e of css.getMatchedElements(c.ele, this.unique_selector)) {
                for (const prop of props)
                    e.style[prop.camelName] = prop.value_string;
            }
        }
    }

    clearStyle() {
        this.element.style = "";
    }
}

export function updateLastOccurrenceOfRuleInStyleSheet(stylesheet: any, rule: CSSRuleNode) {

    const selector_string = css.render(rule.selectors[0]);
    let matching_rule = css.getLastRuleWithMatchingSelector(stylesheet, rule.selectors[0]);

    if (!matching_rule) {
        matching_rule = conflagrate.copy(rule);
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

const cache_array = [];

export function CSSCacheFactory(
    sys: FlameSystem,
    comp: RuntimeComponent,
    ele: HTMLElement,
    crate: ObjectCrate
): CSSCache {

    for (const { comp: c, cache } of cache_array) {
        if (comp == c) return cache;
    }

    let cache: CSSCache = null;

    cache = new CSSCache();

    cache.init(sys, crate);

    cache_array.push({ comp, cache });

    return cache;
}

CSSCacheFactory.destroy = function (comp: RuntimeComponent) {
    for (let i = 0; i < cache_array.length; i++) {
        const { comp: c, cache } = cache_array[i];

        if (comp == c) {
            cache_array.splice(i, 1);
            return;
        }
    }
};
