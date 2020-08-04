var flame = (function () {
    'use strict';

    /**
     * Common CandleFW libraries.
     *
     * Pulled in from the global object. Libraries assigned to
     * global object by @candlefw/cfw library.
     */
    const url = cfw.url, wick = cfw.wick, glow = cfw.glow, css$1 = cfw.css, conflagrate = cfw.conflagrate;
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LmpzIiwic291cmNlUm9vdCI6Ii9mbGFtZS9lZGl0b3IvdHlwZXNjcmlwdC8iLCJzb3VyY2VzIjpbImVudi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7R0FLRztBQUVILE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsV0FBVyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUM7QUFFcEcsT0FBTyxFQUNILEdBQUcsRUFDSCxJQUFJLEVBQ0osSUFBSSxFQUNKLEdBQUcsRUFDSCxXQUFXLEVBQ2QsQ0FBQyJ9

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
    function getApplicableRulesFromComponentData(system, component, element) {
        return [component]
            .map(c => getComponentData(c, system.edit_wick.rt.presets))
            .flatMap(c => c.CSS || [])
            .flatMap(e => css$1.getApplicableRules(element, e));
    }
    function getApplicableRulesFromFullHierarchy(system, component, element) {
        return getComponentHierarchy(component)
            .map(c => getComponentData(c, system.edit_wick.rt.presets))
            .flatMap(c => c.CSS || [])
            .flatMap(e => css$1.getApplicableRules(element, e));
    }
    function getApplicableProps(system, component, element) {
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
            const s = css$1.getFirstMatchedSelector(r, element);
            for (const [name, val] of r.props.entries())
                if (!m.has(name) || val.IMPORTANT)
                    m.set(name, { sel: s, prop: val.copy() });
            return m;
        }, new Map);
    }
    var css_sys = {
        getUnique(system, component, element) {
            return null;
        },
        getApplicableRulesFromComponentData,
        getApplicableRulesFromFullHierarchy,
        getApplicableProps
    };
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzLmpzIiwic291cmNlUm9vdCI6Ii9mbGFtZS9lZGl0b3IvdHlwZXNjcmlwdC8iLCJzb3VyY2VzIjpbImNzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBTS9CLFNBQVMscUJBQXFCLENBQUMsU0FBUztJQUNwQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDbEIsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVqQixPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUU7UUFDVixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQztLQUNiO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLE9BQU87SUFDeEMsT0FBTyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEQsQ0FBQztBQUVELE1BQU0sVUFBVSxtQ0FBbUMsQ0FDL0MsTUFBbUIsRUFDbkIsU0FBMkIsRUFDM0IsT0FBb0I7SUFFcEIsT0FBTyxDQUFDLFNBQVMsQ0FBQztTQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMxRCxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQztTQUN6QixPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUQsQ0FBQztBQUFBLENBQUM7QUFFRixNQUFNLFVBQVUsbUNB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

    let global_cache = null;
    function isSelectorCapableOfBeingUnique(selector, root_name) {
        let count = 0;
        const { CSSTreeNodeType } = css$1;
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
    function getApplicableProps_(system, component, element) {
        const props = getApplicableProps(system, component, element);
        const selectors = new Set([...props.values()].map(p => p.sel));
        for (const v of props.values()) {
            const { sel } = v;
            const elements = [...css$1.getMatchedElements(component.ele, sel)];
            if (elements.length == 1 && isSelectorCapableOfBeingUnique(sel, component.name)) {
                v.unique = true;
            }
        }
        return props;
    }
    class ComputedStyle {
        constructor(system, component, element, cache) {
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
        get(value) {
            const internal_value = this.cache.rules.props[value];
            if (internal_value)
                return internal_value.toString();
            return this._computed.getPropertyValue(value);
        }
    }
    const ADD_ID_ACTION = {
        act: (sys, comp, ele, id = sys.text) => {
            if (id) {
                ele.prev_id = ele.id;
                ele.id = id;
            }
        },
        prec: 1000,
        seal: (history_state, sys, comp, ele) => {
            history_state.insert.push(["add_id", comp.elu.indexOf(ele), ele.id]);
            history_state.delete.push(["add_id", comp.elu.indexOf(ele), ele.prev_id]);
        }
    };
    /* Cache collects info about the CSS state of an element and provides methods to create new properties. */
    class CSSCache {
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
        }
        destroy() {
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
        update(system) {
            if (!system)
                return;
            this.generateMovementCache(system, this.component, this.element);
        }
        setUniqueSelector(sys, comp, ele) {
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
                    const { CSSTreeNodeType } = css$1;
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
                    if (count == 1 && Array.from(css$1.getMatchedElements(comp.ele, rule)).length == 1)
                        return this.unique_selector = sel;
                }
            }
            //if at this point there is no suitable rule,
            //create a new ID, assign to ele and
            //use the id for the selector for the element.
            if (ele.id) {
                this.unique_selector = css$1.selector(`#${ele.id}`);
            }
            else {
                const id = "A" + ((Math.random() * 12565845322) + "").slice(0, 5);
                sys.action_sabot.push(ADD_ID_ACTION);
                //Immediately apply action.
                ADD_ID_ACTION.act(sys, comp, ele, id);
                this.unique_selector = css$1.selector(`#${id}`);
            }
        }
        generateMovementCache(system, component, element) {
            this.system = system;
            let move_type = system.move_type || "absolute";
            let css_r = getApplicableProps_(system, component, element);
            this.original_props = css_r;
            this.changed = new Set();
            this.unique = new Map();
            for (const [name, val] of this.original_props.entries())
                if (val.unique)
                    this.unique.set(name, { sel: val.sel, prop: val.prop.copy(), unique: true });
            // The unique rule either exists within the edit style sheet cache,
            // or a new one needs to be made.
            this.setUniqueSelector(system, component, element);
            //test for presence of rules. 
            let POS_R = false, POS_A = false, HT = false, HL = false, HB = false, HR = false, HM = false, HMR = false, HMT = false, HMB = false, HML = false, W = false, H = false;
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
            }
            else if ((960 & v) > 0) ;
            else {
                //Create left and top positions or us margin depending on current user preferences.
                this.setPropFromString(`left:0px;top:0px`);
                v |= 4 | 32;
            }
            if ((v & 3) == 0) {
                if (move_type == "absolute") {
                    v |= 2;
                    this.setPropFromString('position:absolute');
                }
                else if (move_type == "relative") {
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
                            css_r.get("width").prop + "" !== "auto")) {
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
            //calculate horizontal and vertical rations. also width and height ratios.  
        }
        //Need a way to keep check of changed properties.
        getProp(name) {
            let prop = null;
            if (this.unique.has(name))
                prop = this.unique.get(name).prop;
            else if (this.original_props.has(name))
                prop = this.original_props.get(name).prop;
            return prop ? prop.copy() : prop;
        }
        setProp(prop) {
            const name = prop.name;
            this.changed.add(name);
            if (!this.unique.has(name)) {
                this.unique.set(name, { prop, sel: this.unique_selector, unique: true });
            }
            else {
                this.unique.get(name).prop.setValue(prop);
            }
        }
        createProp(prop_string) {
            return css$1.property(prop_string);
        }
        get position() {
            if (this.cssflagsA & CSSCache.relative)
                return "relative";
            if (this.cssflagsA & CSSCache.absolute)
                return "absolute";
            return "auto";
        }
        setPropFromString(string) {
            const prop = this.createProp(string);
            this.setProp(prop);
        }
        setElementInlineStyle() {
            const ele = this.element;
            const string = [...this.unique.values()].map(v => v.prop).join(";");
            ele.style = string;
        }
        clearStyle() {
            this.element.style = "";
        }
    }
    //Flags
    CSSCache.relative = 1;
    CSSCache.absolute = 2;
    function CacheFactory(system, component, element) {
        if (element.flame_cache) {
            return element.flame_cache;
        }
        let cache;
        if (global_cache) {
            cache = global_cache;
            global_cache = global_cache.next;
        }
        else
            cache = new CSSCache();
        cache.component = component;
        cache.element = element;
        cache.generateMovementCache(system, component, element);
        element.flame_cache = cache;
        return cache;
    }
    CacheFactory.clear = function (element) {
        if (element.flame_cache) {
            element.flame_cache.clearStyle();
            element.flame_cache.destroy();
        }
        element.flame_cache = null;
    };
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGUuanMiLCJzb3VyY2VSb290IjoiL2ZsYW1lL2VkaXRvci90eXBlc2NyaXB0LyIsInNvdXJjZXMiOlsiYWN0aW9ucy9jYWNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUc3QyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFL0MsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBRXhCLFNBQVMsOEJBQThCLENBQUMsUUFBcUIsRUFBRSxTQUFpQjtJQUM1RSxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFFZCxNQUFNLEVBQUUsZUFBZSxFQUFFLEdBQUcsR0FBRyxDQUFDO0lBRWhDLEtBQUssTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFO1FBQzlFLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNmLEtBQUssZUFBZSxDQUFDLGdCQUFnQixDQUFDO1lBQ3RDLEtBQUssZUFBZSxDQUFDLGVBQWU7Z0JBQ2hDLE1BQU07WUFDVixLQUFLLGVBQWUsQ0FBQyxhQUFhO2dCQUM5QixJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksU0FBUyxJQUFJLE1BQU07b0JBQ2pDLE1BQU07WUFDZCxLQUFLLGVBQWUsQ0FBQyxVQUFVO2dCQUMzQixLQUFLLEVBQUUsQ0FBQztnQkFDUixNQUFNO1lBQ1Y7Z0JBQ0ksS0FBSyxJQUFJLENBQUMsQ0FBQztTQUNsQjtLQUNKO0lBRUQsT0FBTyxLQUFLLElBQUksQ0FBQyxDQUFDO0FBQ3RCLENBQUM7QUFFRCxTQUFTLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTztJQUVuRCxNQUFNLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9B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

    function TEXTEDITOR(system, component, element, x, y) { }
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC5qcyIsInNvdXJjZVJvb3QiOiIvZmxhbWUvZWRpdG9yL3R5cGVzY3JpcHQvIiwic291cmNlcyI6WyJhY3Rpb25zL3RleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsTUFBTSxVQUFVLFVBQVUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFFLENBQUM7QUFFOUQsTUFBTSxVQUFVLElBQUksQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRTtJQUNuRCxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7SUFDM0IsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0IsQ0FBQyJ9

    var history = (function HISTORY() {
        const stack = [];
        let pointer = -1;
        return {
            ADD_HISTORY_STATE() {
                const state = {
                    type: null,
                    insert: [],
                    delete: []
                };
                stack[++pointer] = state;
                return state;
            },
            /**
             * UPDATE the ui state to reflect the
             * changes made by the active action(s).
             */
            PUSH_EDIT_STATE(action, env) {
            },
            /**
             * Create a change list for the current
             * UI state and apply, pushing the change
             * list to the history stack.
             */
            FREEZE_EDIT_STATE() {
            },
            /**
             * Decrement the history stack pointer
             * and apply the rollback
             * changes of the change list the pointer is
             * now at.
             */
            ROLLBACK_EDIT_STATE(system) {
                if (pointer > -1) {
                    const state = stack[pointer];
                    setState(false, state, system);
                    pointer--;
                }
            },
            /**
             * Increment the history stack pointer
             * and apply the roll-forward
             * changes of the change list the pointer is
             * now at.
             */
            ROLLFORWARD_EDIT_STATE(system) {
                if (pointer < stack.length - 1) {
                    pointer++;
                    const state = stack[pointer];
                    setState(true, state, system);
                }
            },
            WriteBack(system) {
                //Write current changes back to file. 
                const components = system.edit_wick.rt.presets.components;
                for (const component of components.values()) {
                    //Need to go through the components and rebuild the parts that have changed.
                    const changes = stack.slice(0, pointer + 1).flatMap(s => s.insert).filter(s => s[1] == component.name);
                    //get unique css changes
                    const css_changes = new Map(changes.filter(s => s[0] == "css_prop").map(s => [s[3], s]));
                    if (css_changes.size > 0) {
                        const css_ = component.CSS[0];
                        let str = css_.pos.str;
                        const start = str.slice(0, css_.pos.pos);
                        const end = str.slice(css_.pos.pos + css_.pos.sl - css_.pos.pos);
                        str = start + css.render(css_) + end;
                    }
                }
            }
        };
    })();

    function prepUIUpdate$1(system, component, element, type) {
        const cache = CacheFactory(system, component, element);
        cache.setElementInlineStyle();
    }
    function sealCSS(history_state, system, component, element) {
        //Create change list.
        const cache = CacheFactory(system, component, element), original = cache.original_props, unique = cache.unique, selector = cache.unique_selector;
        for (const name of cache.changed.values()) {
            const { prop } = unique.get(name);
            if (original.has(name)) {
                const { prop, unique, sel } = original.get(name);
                if (unique) {
                    //do something
                    history_state.delete.push([
                        "css_prop",
                        component.name,
                        css$1.render(selector),
                        prop.name,
                        prop + "",
                        prop.pos.source,
                        prop.pos.line,
                        prop.pos.char
                    ]);
                }
            }
            history_state.insert.push([
                "css_prop",
                component.name,
                css$1.render(selector),
                prop.name,
                prop + "",
                prop.pos.source,
                prop.pos.line,
                prop.pos.char
            ]);
        }
        CacheFactory.clear(element);
    }
    function setState(FORWARD = true, history_state, system) {
        const update_components = new Set;
        const active = FORWARD ? history_state.insert : history_state.delete;
        const opposite = FORWARD ? history_state.delete : history_state.insert;
        for (const state of active) {
            switch (state[0]) {
                case "css_prop":
                    const [, name, selector_string, prop_name, prop_string] = state;
                    //Mode Updated data stylesheets.
                    // Setup css object in the environment and in the wick component
                    const comp_data = system.edit_wick.rt.presets.components.get(name);
                    // For each prop, find rule with correct selector, bottom up. 
                    // Insert new prop into rule. 
                    //Find matching rule.
                    let rule = css$1.getLastRuleWithMatchingSelector(comp_data.CSS[0], css$1.selector(selector_string));
                    if (!rule) {
                        rule = css$1.rule(`${selector_string}{${prop_string}}`);
                        comp_data.CSS[0].nodes.push(rule);
                    }
                    else {
                        const prop = css$1.property(prop_string);
                        rule.props.set(prop.name, prop);
                    }
                    update_components.add(comp_data);
                    break;
            }
        }
        if (!FORWARD) {
            for (const state of opposite.filter(s => !active.filter(e => s[3] == e[3])[0])) {
                switch (state[0]) {
                    case "css_prop":
                        const [, name, selector_string, prop_name, prop_string] = state;
                        //Mode Updated data stylesheets.
                        // Setup css object in the environment and in the wick component
                        const comp_data = system.edit_wick.rt.presets.components.get(name);
                        // For each prop, find rule with correct selector, bottom up. 
                        // Insert new prop into rule. 
                        //Find matching rule.
                        let rule = css$1.getLastRuleWithMatchingSelector(comp_data.CSS[0], css$1.selector(selector_string));
                        if (rule) {
                            rule.props.delete(prop_name);
                            if (rule.props.size == 0)
                                css$1.removeRule(comp_data.CSS[0], rule);
                        }
                        update_components.add(comp_data);
                        break;
                }
            }
        }
        for (const comp of update_components.values()) {
            let ele = null;
            if (system.wick.rt.css_cache[comp.name]) {
                ele = system.wick.rt.css_cache[comp.name];
            }
            else {
                ele = system.document.createElement("style");
                system.head.appendChild(ele);
                system.wick.rt.css_cache[comp.name] = ele;
            }
            //Push node to the document 
            const string = system.edit_wick.componentDataToCSS(comp);
            ele.innerHTML = string;
        }
    }
    function applyAction(action, sys, comp, ele, dx, dy) {
        action.act(sys, comp, ele);
        const cache = CacheFactory(sys, comp, ele);
        cache.setElementInlineStyle();
    }
    function sealAction(actions, sys, comp, ele) {
        const history_state = history.ADD_HISTORY_STATE();
        history_state.insert = [];
        history_state.delete = [];
        for (const action of actions.sort((a, b) => a.precedence > b.precedence ? -1 : 1)) {
            if (action.seal)
                action.seal(history_state, sys, comp, ele);
            else
                switch (action.type) {
                    case "CSS":
                        sealCSS(history_state, sys, comp, ele);
                }
        }
        setState(true, history_state, sys);
        console.log(history_state);
    }
    /**
     *- nth-child()
     *  Direct attribute
     *
     */ 
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLmpzIiwic291cmNlUm9vdCI6Ii9mbGFtZS9lZGl0b3IvdHlwZXNjcmlwdC8iLCJzb3VyY2VzIjpbImFjdGlvbnMvdXBkYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBeUIsTUFBTSxlQUFlLENBQUM7QUFDdEQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNoQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRzFDLE1BQU0sVUFBVSxZQUFZLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSTtJQUN6RCxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN2RCxLQUFLLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUNsQyxDQUFDO0FBRUQsTUFBTSxVQUFVLE9BQU8sQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPO0lBRTdELHFCQUFxQjtJQUNyQixNQUNJLEtBQUssR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsRUFDaEQsUUFBUSxHQUFHLEtBQUssQ0FBQyxjQUFjLEVBQy9CLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxFQUNyQixRQUFRLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQztJQUVyQyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUU7UUFFdkMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbEMsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBRXBCLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENB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

    let types = css$1.types;
    function getContentBox(ele, win = window, system) {
        const scale = system.ui.transform.scale, rect = ele.getBoundingClientRect(), par_prop = win.getComputedStyle(ele), border_l = parseFloat(par_prop.getPropertyValue("border-left")), border_r = parseFloat(par_prop.getPropertyValue("border-right")), border_t = parseFloat(par_prop.getPropertyValue("border-top")), border_b = parseFloat(par_prop.getPropertyValue("border-bottom")), top = rect.top / scale + border_t, left = rect.left / scale + border_l, width = rect.width / scale - border_l - border_r, height = rect.height / scale - border_t - border_b;
        return { top, left, width, height };
    }
    /**
        Handles the rebuild routine of wick elements
    */
    function prepRebuild(system, component, element, LINKED = true) {
        prepUIUpdate$1(system, component, element);
    }
    function getFirstPositionedAncestor(ele) {
        while (ele.parentElement) {
            ele = ele.parentElement;
            let pos = window.getComputedStyle(ele).getPropertyValue("position");
            if (pos && pos !== "sticky" && pos !== "static") {
                break;
            }
        }
        return ele;
    }
    function numericAdjust(ALLOW_NEGATIVE = false, RELATIVE = false, value = 0, denominator = 0, prop = null, cache) {
        let excess = 0;
        if (!ALLOW_NEGATIVE && value < 0) {
            excess = value;
            value = 0;
        }
        if (RELATIVE) {
            const np = value / denominator;
            prop.setValue(prop.value.copy(np * 100));
        }
        else {
            if (prop.value.copy)
                prop.setValue(prop.value.copy(value));
            else {
                if (value !== 0)
                    prop.setValue(new types.length(value, "px"));
                else
                    prop.setValue(0);
            }
        }
        cache.setProp(prop);
        return excess;
    }
    function setNumericValue(propname, system, component, element, value, relative_type = 0, ALLOW_NEGATIVE = false) {
        let cache = CacheFactory(system, component, element), KEEP_UNIQUE = system.flags.KEEP_UNIQUE, prop = cache.getProp(propname), css_name = propname.replace(/_/g, "-");
        if (!prop) {
            let type = (system.global.default_pos_unit || "px");
            let value = (type == "%") ? new types.percentage(0) : new types.length(0, type);
            prop = cache.createProp(`${css_name}:${value + type}`);
        }
        let RELATIVE = false, denominator = 1;
        if (prop.value_string == "auto") {
            //convert to numerical form;
            prop.setValue(new types.length(value, "px"));
            cache.setProp(prop);
            return 0;
        }
        else if (prop.value.type === "%") {
            //get the nearest positioned ancestor
            let ele = null;
            switch (relative_type) {
                case setNumericValue.parent_width:
                    ele = element.parentElement;
                    if (ele)
                        denominator = getContentBox(ele, system.window, system).width;
                    break;
                case setNumericValue.parent_height:
                    ele = element.parentElement;
                    if (ele)
                        denominator = getContentBox(ele, system.window, system).height;
                    break;
                case setNumericValue.positioned_ancestor_width:
                    ele = getFirstPositionedAncestor(element);
                    if (ele)
                        denominator = getContentBox(ele, system.window, system).width;
                    break;
                case setNumericValue.positioned_ancestor_height:
                    ele = getFirstPositionedAncestor(element);
                    if (ele)
                        denominator = getContentBox(ele, system.window, system).height;
                    break;
                case setNumericValue.height:
                    denominator = getContentBox(component, system.window, system).width;
                    break;
                case setNumericValue.width:
                    denominator = getContentBox(component, system.window, system).width;
                    break;
            }
            RELATIVE = true;
        }
        return numericAdjust(ALLOW_NEGATIVE, RELATIVE, value, denominator, prop, cache);
    }
    setNumericValue.parent_width = 0;
    setNumericValue.parent_height = 1;
    setNumericValue.positioned_ancestor_width = 2;
    setNumericValue.positioned_ancestor_height = 3;
    setNumericValue.height = 4;
    setNumericValue.width = 5;
    function getRatio(system, component, element, funct, original_value, delta_value, delta_measure, ALLOW_NEGATIVE = false, NO_ADJUST = false) {
        let excess = 0, ratio = 0, scale = system.ui.transform.scale;
        let begin_x = element.getBoundingClientRect()[delta_measure] / scale;
        if (!ALLOW_NEGATIVE && original_value + delta_value < 0) {
            excess = original_value + delta_value;
            delta_value = -original_value;
        }
        funct(system, component, element, original_value + delta_value);
        let end_x = element.getBoundingClientRect()[delta_measure] / scale;
        let diff_x = end_x - begin_x;
        if (Math.abs(diff_x - delta_value) > 0.0005 && delta_value !== 0) {
            ratio = (diff_x / delta_value);
        }
        return { ratio, excess };
    }
    function setValue(system, component, element, value_name, value) {
        let cache = CacheFactory(system, component, element), props = cache.rules.props;
        if (props.has(value_name))
            props.get(value_name).setValue(value);
        else
            cache.setProp(cache.createProp(`${value_name.replace(/\_/g, "-")}:${value}`));
    }
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6Ii9mbGFtZS9lZGl0b3IvdHlwZXNjcmlwdC8iLCJzb3VyY2VzIjpbImFjdGlvbnMvY29tbW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFHaEMsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztBQUV0QixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFHM0MsU0FBUyxhQUFhLENBQUMsR0FBRyxFQUFFLE1BQWMsTUFBTSxFQUFFLE1BQU07SUFDcEQsTUFDSSxLQUFLLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUVqQyxJQUFJLEdBQUcsR0FBRyxDQUFDLHFCQUFxQixFQUFFLEVBQ2xDLFFBQVEsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEVBRXBDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQy9ELFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQ2hFLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQzlELFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBRWpFLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssR0FBRyxRQUFRLEVBQ2pDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssR0FBRyxRQUFRLEVBQ25DLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssR0FBRyxRQUFRLEdBQUcsUUFBUSxF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

    function SETWIDTH(system, component, element, x, LINKED = false) {
        const excess = setNumericValue("width", system, component, element, x, setNumericValue.parent_width);
        prepRebuild(system, component, element, LINKED);
        return { excess_x: excess, ratio: 0 };
    }
    function SETHEIGHT(system, component, element, y, LINKED = false) {
        let excess = setNumericValue("height", system, component, element, y, setNumericValue.parent_height);
        prepRebuild(system, component, element, LINKED);
        return { excess_y: excess, ratio: 0 };
    }
    function SETDELTAWIDTH(system, component, element, dx, ratio = 0, LINKED = false) {
        let start_x = parseFloat(system.window.getComputedStyle(element).width), excess = 0;
        if (ratio > 0) {
            let { ratio: r, excess_x: e } = SETWIDTH(system, component, element, start_x + dx / ratio, true);
            ratio = r;
            excess = e;
        }
        else {
            let { ratio: r, excess: e } = getRatio(system, component, element, SETWIDTH, start_x, dx, "width");
            ratio = r;
            excess = e;
        }
        prepRebuild(system, component, element, LINKED);
        return { excess_x: excess, ratio };
    }
    function SETDELTAHEIGHT(system, component, element, dy, ratio = 0, LINKED = false) {
        let start_y = parseFloat(system.window.getComputedStyle(element).height), excess = 0;
        if (ratio > 0) {
            let { ratio: r, excess_y: e } = SETHEIGHT(system, component, element, start_y + dy / ratio, true);
            ratio = r;
            excess = e;
        }
        else {
            let { ratio: r, excess: e } = getRatio(system, component, element, SETHEIGHT, start_y, dy, "height");
            ratio = r;
            excess = e;
        }
        prepRebuild(system, component, element, LINKED);
        return { excess_y: excess, ratio };
    }
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGltZW5zaW9ucy5qcyIsInNvdXJjZVJvb3QiOiIvZmxhbWUvZWRpdG9yL3R5cGVzY3JpcHQvIiwic291cmNlcyI6WyJhY3Rpb25zL2RpbWVuc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUV0RixNQUFNLFVBQVUsUUFBUSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEdBQUcsS0FBSztJQUNsRSxlQUFlLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUU1QyxNQUFNLE1BQU0sR0FBRyxlQUFlLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFckcsV0FBVyxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRWhELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUMxQyxDQUFDO0FBRUQsTUFBTSxVQUFVLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSxHQUFHLEtBQUs7SUFDbkUsZUFBZSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFNUMsSUFBSSxNQUFNLEdBQUcsZUFBZSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRXJHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUVoRCxPQUFPLEVBQUUsUUFBUSxFQUFF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

    const types$1 = css$1.types;
    /***************************************************************************************/
    /********************************** POSITION SUB ACTIONS *************************************/
    /***************************************************************************************/
    function SETLEFT(system, component, element, x, LINKED = false) {
        let cache = CacheFactory(system, component, element), excess = 0;
        if (x.type) {
            cache.rules.props.left.setValue(x);
        }
        else {
            if (cache.cssflagsA & 1)
                excess = setNumericValue("left", system, component, element, x, setNumericValue.parent_width, true);
            else
                excess = setNumericValue("left", system, component, element, x, setNumericValue.positioned_ancestor_width, true);
        }
        prepRebuild(system, component, element, LINKED);
        return { excess_x: excess };
    }
    function SETRIGHT(system, component, element, x, LINKED = false) {
        let cache = CacheFactory(system, component, element), excess = 0;
        if (cache.cssflagsA & 1)
            excess = setNumericValue("right", system, component, element, x, setNumericValue.parent_width, true);
        else
            excess = setNumericValue("right", system, component, element, x, setNumericValue.positioned_ancestor_width, true);
        prepRebuild(system, component, element, LINKED);
        return { excess_x: excess };
    }
    function SETTOP(system, component, element, y, LINKED = false) {
        let cache = CacheFactory(system, component, element), excess = 0;
        if (y.type) {
            cache.rules.props.top.setValue(y);
        }
        else {
            if (cache.cssflagsA & 1)
                excess = setNumericValue("top", system, component, element, y, setNumericValue.parent_height, true);
            else
                excess = setNumericValue("top", system, component, element, y, setNumericValue.positioned_ancestor_height, true);
        }
        prepRebuild(system, component, element, LINKED);
        return { excess_y: excess };
    }
    function SETBOTTOM(system, component, element, y, LINKED = false) {
        let cache = CacheFactory(system, component, element), excess = 0;
        if (cache.cssflagsA & 1)
            excess = setNumericValue("bottom", system, component, element, y, setNumericValue.parent_height, true);
        else
            excess = setNumericValue("bottom", system, component, element, y, setNumericValue.positioned_ancestor_height, true);
        prepRebuild(system, component, element, LINKED);
        return { excess_y: excess };
    }
    /***************************************************************************************/
    /********************************** DELTA SUB ACTIONS *************************************/
    /***************************************************************************************/
    function SETDELTALEFT(system, component, element, dx, ratio = 0, LINKED = false) {
        let start_x = parseFloat(system.window.getComputedStyle(element).left), excess_x = 0;
        start_x = isNaN(start_x) ? 0 : start_x;
        if (ratio > 0)
            excess_x = SETLEFT(system, component, element, start_x + dx / ratio, true).excess_x;
        else {
            let r = getRatio(system, component, element, SETLEFT, start_x, dx, "left", true);
            ratio = r.ratio;
            excess_x = r.excess;
        }
        prepRebuild(system, component, element, LINKED);
        return { ratio, excess_x };
    }
    function SETDELTARIGHT(system, component, element, dx, ratio = 0, LINKED = false) {
        let start_x = parseFloat(system.window.getComputedStyle(element).right), excess_x = 0;
        start_x = isNaN(start_x) ? 0 : start_x;
        if (ratio > 0)
            excess_x = SETRIGHT(system, component, element, start_x + dx / ratio, true).excess_x;
        else {
            let r = getRatio(system, component, element, SETRIGHT, start_x, dx, "right", true);
            ratio = r.ratio;
            excess_x = r.excess;
        }
        prepRebuild(system, component, element, LINKED);
        return { ratio, excess_x };
    }
    function SETDELTATOP(system, component, element, dy, ratio = 0, LINKED = false, origin = undefined) {
        let start_x = parseFloat(system.window.getComputedStyle(element).top), excess_y = 0;
        start_x = isNaN(start_x) ? 0 : start_x;
        if (ratio > 0)
            excess_y = SETTOP(system, component, element, start_x + dy / ratio, true).excess_y;
        else {
            let r = getRatio(system, component, element, SETTOP, start_x, dy, "top", true, origin);
            ratio = r.ratio;
            excess_y = r.excess;
        }
        prepRebuild(system, component, element, LINKED);
        return { ratio, excess_y };
    }
    function SETDELTABOTTOM(system, component, element, dy, ratio = 0, LINKED = false) {
        let start_x = parseFloat(system.window.getComputedStyle(element).bottom), excess_y = 0;
        start_x = isNaN(start_x) ? 0 : start_x;
        if (ratio > 0)
            excess_y = SETBOTTOM(system, component, element, start_x + dy / ratio, true).excess_y;
        else {
            let r = getRatio(system, component, element, SETBOTTOM, start_x, dy, "bottom", true);
            ratio = r.ratio;
            excess_y = r.excess;
        }
        prepRebuild(system, component, element, LINKED);
        return { ratio, excess_y };
    }
    /***************************************************************************************/
    /********************************** RESIZE ACTIONS *************************************/
    /***************************************************************************************/
    function RESIZEL(system, component, element, dx = system.dx, dy = system.dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return (component.x += dx, component.width -= dx);
        let cache = CacheFactory(system, component, element), excess_x = 0;
        switch (cache.move_hori_type) {
            case "left right":
                excess_x = SETDELTALEFT(system, component, element, dx, 0, true).excess_x;
                break;
            case "left":
                excess_x = SETDELTAWIDTH(system, component, element, -dx, 0, true).excess_x;
                SETDELTALEFT(system, component, element, dx + excess_x, 0, true);
                break;
            case "right":
                excess_x = SETDELTAWIDTH(system, component, element, -dx, 0, true).excess_x;
                break;
        }
        prepRebuild(system, component, element, false);
        return { excess_x };
    }
    function RESIZET(system, component, element, dx = system.dx, dy = system.dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return (component.y += dy, component.height -= dy);
        let cache = CacheFactory(system, component, element), excess_y = 0;
        switch (cache.move_vert_type) {
            case "top bottom":
                excess_y = SETDELTATOP(system, component, element, dy, 0, true).excess_y;
            case "top":
                excess_y = SETDELTAHEIGHT(system, component, element, -dy, 0, true).excess_y;
                SETDELTATOP(system, component, element, dy + excess_y, 0, true);
                break;
            case "bottom":
                excess_y = SETDELTAHEIGHT(system, component, element, -dy, 0, true).excess_y;
                break;
        }
        prepRebuild(system, component, element, false);
        return { excess_y };
    }
    function RESIZER(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return (component.width += dx);
        let cache = CacheFactory(system, component, element), excess_x = 0;
        switch (cache.move_hori_type) {
            case "left right":
                excess_x = -SETDELTARIGHT(system, component, element, -dx, 0, true).excess_x;
                break;
            case "right":
                excess_x = -SETDELTAWIDTH(system, component, element, -dx, 0, true).excess_x;
                SETDELTARIGHT(system, component, element, -dx - excess_x, 0, true);
                break;
            case "left":
                excess_x = -SETDELTAWIDTH(system, component, element, dx, 0, true).excess_x;
                break;
        }
        prepRebuild(system, component, element, false);
        return { excess_x };
    }
    function RESIZEB(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return (component.height += dy);
        let cache = CacheFactory(system, component, element), excess_y = 0;
        switch (cache.move_vert_type) {
            case "top bottom":
                excess_y = -SETDELTAHEIGHT(system, component, element, dy, 0, true).excess_y;
                //SETDELTABOTTOM(system, component, element, -dy, ratio * 0.5, true);
                break;
            case "bottom":
                excess_y = -SETDELTAHEIGHT(system, component, element, dy, 0, true).excess_y;
                SETDELTABOTTOM(system, component, element, -dy - excess_y, 0, true);
                break;
            case "top":
                excess_y = -SETDELTAHEIGHT(system, component, element, dy, 0, true).excess_y;
                break;
        }
        prepRebuild(system, component, element, false);
        return { excess_y };
    }
    /***************************************************************************************************/
    /********************************** COMBINATION RESIZE ACTIONS *************************************/
    /***************************************************************************************************/
    const RESIZETL = {
        act(system, component, element, dx = system.dx, dy = system.dy, IS_COMPONENT) {
            let { excess_x } = RESIZEL(system, component, element, dx, dy, IS_COMPONENT);
            let { excess_y } = RESIZET(system, component, element, dx, dy, IS_COMPONENT);
            if (!IS_COMPONENT)
                prepRebuild(system, component, element, false);
            return { excess_x, excess_y };
        },
        precedence: 0,
        type: "CSS"
    };
    const RESIZETR = {
        act(system, component, element, dx = system.dx, dy = system.dy, IS_COMPONENT) {
            let { excess_x } = RESIZER(system, component, element, dx, dy, IS_COMPONENT);
            let { excess_y } = RESIZET(system, component, element, dx, dy, IS_COMPONENT);
            if (!IS_COMPONENT)
                prepRebuild(system, component, element, false);
            return { excess_x, excess_y };
        },
        precedence: 0,
        type: "CSS"
    };
    function RESIZEBL(system, component, element, dx, dy, IS_COMPONENT) {
        let { excess_x } = RESIZEL(system, component, element, dx, dy, IS_COMPONENT);
        let { excess_y } = RESIZEB(system, component, element, dx, dy, IS_COMPONENT);
        if (!IS_COMPONENT)
            prepRebuild(system, component, element, false);
        return { excess_x, excess_y };
    }
    function RESIZEBR(system, component, element, dx, dy, IS_COMPONENT) {
        let { excess_x } = RESIZER(system, component, element, dx, dy, IS_COMPONENT);
        let { excess_y } = RESIZEB(system, component, element, dx, dy, IS_COMPONENT);
        if (!IS_COMPONENT)
            prepRebuild(system, component, element, false);
        return { excess_x, excess_y };
    }
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zaXRpb24uanMiLCJzb3VyY2VSb290IjoiL2ZsYW1lL2VkaXRvci90eXBlc2NyaXB0LyIsInNvdXJjZXMiOlsiYWN0aW9ucy9wb3NpdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0gsZUFBZSxFQUNmLFFBQVEsRUFDUixXQUFXLEVBQ2QsTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxFQUNILFlBQVksRUFDZixNQUFNLFlBQVksQ0FBQztBQUNwQixPQUFPLEVBQ0gsYUFBYSxFQUNiLGNBQWMsRUFDakIsTUFBTSxpQkFBaUIsQ0FBQztBQUV6QixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBR2hDLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7QUFFeEIseUZBQXlGO0FBQ3pGLCtGQUErRjtBQUMvRix5RkFBeUY7QUFFekYsTUFBTSxVQUFVLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSxHQUFHLEtBQUs7SUFDakUsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLEVBQ2hELE1BQU0sR0FBRyxDQUFDLENBQUM7SUFFZixJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUU7UUFDUixLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3RDO1NBQU07UUFDSCxJQUFJLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQztZQUNuQixNQUFNLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsZUFBZSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQzs7WUFFcEcsTUFBTSxHQUFHLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUs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

    const types$2 = css$1.types;
    /**
     * Actions provide mechanisms for updating an element, document, and component through user input.
     */
    function MOVE(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
        if (IS_COMPONENT) {
            if (!component)
                debugger;
            component.x += dx;
            component.y += dy;
        }
        else {
            // Get CSS information on element and update appropriate records
            let cache = CacheFactory(system, component, element);
            let css = cache.rules;
            if (!css.props.position)
                cache.setPropFromString("position:relative");
            if (css.props.position.value !== "static") {
                switch (cache.move_hori_type) {
                    case "left right margin":
                        //in cases of absolute
                        cache.valueB = SETDELTARIGHT(system, component, element, -dx, cache.valueB).ratio;
                        cache.valueA = SETDELTALEFT(system, component, element, dx, cache.valueA).ratio;
                        break;
                    case "left right":
                        cache.valueB = SETDELTARIGHT(system, component, element, -dx, cache.valueB).ratio;
                    case "left":
                        cache.valueA = SETDELTALEFT(system, component, element, dx, cache.valueA).ratio;
                        break;
                    case "right":
                        cache.valueB = SETDELTARIGHT(system, component, element, -dx, cache.valueB).ratio;
                        break;
                }
                switch (cache.move_vert_type) {
                    case "top bottom":
                        cache.valueC = SETDELTABOTTOM(system, component, element, -dy, cache.valueC).ratio;
                    case "top":
                        cache.valueD = SETDELTATOP(system, component, element, dy, cache.valueD).ratio;
                        break;
                    case "bottom":
                        cache.valueC = SETDELTABOTTOM(system, component, element, -dy, cache.valueC).ratio;
                        break;
                }
            }
            prepRebuild(system, component, element, LINKED);
        }
    }
    function CENTER(system, component, element, HORIZONTAL = true, VERTICAL = true, LINKED = false) {
        // Get CSS information on element and update appropriate records
        let cache = CacheFactory(system, component, element);
        let css = cache.rules;
        let ancestor = getFirstPositionedAncestor(element);
        let ancestor_box = ancestor.getBoundingClientRect();
        let own_box = element.getBoundingClientRect();
        let w = own_box.width;
        let diff = (ancestor_box.width - w) / 2;
        switch (cache.move_hori_type) {
            case "left right":
                //get the width of the parent element
                css.props.left = new types$2.length(diff, "px");
                css.props.right = new types$2.length(diff, "px");
                cache.setPropFromString(`margin-left:auto; margin-right:auto`);
                break;
            case "left":
                cache.setPropFromString(`margin-left:auto; margin-right:auto;left:0px;right:0px`);
                break;
        }
        /*
        switch (cache.move_vert_type) {
            case "top bottom":
                cache.valueC = setBottom(element, -dy, css, cache.valueC).ratio;
            case "top":
                cache.valueD = setDeltaTop(element, dy, css, cache.valueD);
                break;
            case "bottom":
                cache.valueC = setBottom(element, -dy, css, cache.valueC);
                break;
        }
        */
        prepRebuild(system, component, element, LINKED);
    }
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZS5qcyIsInNvdXJjZVJvb3QiOiIvZmxhbWUvZWRpdG9yL3R5cGVzY3JpcHQvIiwic291cmNlcyI6WyJhY3Rpb25zL21vdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUdoQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzFDLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxXQUFXLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDdEUsT0FBTyxFQUNILFlBQVksRUFDWixXQUFXLEVBQ1gsYUFBYSxFQUNiLGNBQWMsRUFDakIsTUFBTSxlQUFlLENBQUM7QUFFdkIsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztBQUV4Qjs7R0FFRztBQUNILE1BQU0sVUFBVSxJQUFJLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxZQUFZLEdBQUcsS0FBSyxFQUFFLE1BQU0sR0FBRyxLQUFLO0lBRXpGLElBQUksWUFBWSxFQUFFO1FBQ2QsSUFBSSxDQUFDLFNBQVM7WUFBRSxRQUFRLENBQUM7UUFDekIsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbEIsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDckI7U0FBTTtRQUVILGdFQUFnRTtRQUNoRSxJQUFJLEtBQUssR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVyRCxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBRXRCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVE7WUFDbkIsS0FBSyxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFFakQsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUFFO1lB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

    function COMPLETE(system, element) {
        //Diff changed documents, clear caches, close opened dialogs if necessary
        if (element)
            CacheFactory.clear(element);
        system.data.docs.seal();
        //system.history.seal();
    }
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxldGUuanMiLCJzb3VyY2VSb290IjoiL2ZsYW1lL2VkaXRvci90eXBlc2NyaXB0LyIsInNvdXJjZXMiOlsiYWN0aW9ucy9jb21wbGV0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRTFDLE1BQU0sVUFBVSxRQUFRLENBQUMsTUFBTSxFQUFFLE9BQU87SUFFdkMseUVBQXlFO0lBQ3pFLElBQUksT0FBTztRQUNWLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDeEIsd0JBQXdCO0FBQ3pCLENBQUMifQ==

    let types$3 = css$1.types;
    //set background color
    function SETBACKGROUNDCOLOR(system, component, element, r, g, b, a = 1) {
        let color = new types$3.color(r, g, b, a);
        setValue(system, component, element, "background_color", color);
        prepUIUpdate(system, component, element, "STYLE");
    }
    //set background image
    //set font color
    function SETCOLOR(system, component, element, r, g, b, a = 1) {
        let color = new types$3.color(r, g, b, a);
        setValue(system, component, element, "color", color);
        prepUIUpdate(system, component, element, "STYLE");
    }
    //set font image
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3IuanMiLCJzb3VyY2VSb290IjoiL2ZsYW1lL2VkaXRvci90eXBlc2NyaXB0LyIsInNvdXJjZXMiOlsiYWN0aW9ucy9jb2xvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRWhDLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7QUFFdEIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUV2QyxzQkFBc0I7QUFDdEIsTUFBTSxVQUFVLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDO0lBQzVFLElBQUksS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN4QyxRQUFRLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDaEUsWUFBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ25ELENBQUM7QUFDRCxzQkFBc0I7QUFDdEIsZ0JBQWdCO0FBQ2hCLE1BQU0sVUFBVSxRQUFRLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUM7SUFDbEUsSUFBSSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3hDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDckQsWUFBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ25ELENBQUM7QUFDRCxnQkFBZ0IifQ==

    function MOVE_PANEL(system, panel, dx, dy) {
        panel.x -= dx;
        panel.y -= dy;
        if (panel.x < 0)
            panel.x = 0;
        if (panel.y < 0)
            panel.y = 0;
        if (panel.x + panel.width > window.screen.width)
            panel.x = window.screen.width - panel.width;
        if (panel.y + panel.height > window.screen.height)
            panel.y = window.screen.height - panel.height;
    }
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWlfcGFuZWxzLmpzIiwic291cmNlUm9vdCI6Ii9mbGFtZS9lZGl0b3IvdHlwZXNjcmlwdC8iLCJzb3VyY2VzIjpbImFjdGlvbnMvdWlfcGFuZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sVUFBVSxVQUFVLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRTtJQUM1QyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNkLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBRWQsSUFBSSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3QixJQUFJLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzdCLElBQUksS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSztRQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztJQUM3RixJQUFJLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU07UUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDckcsQ0FBQyJ9

    function UNDO(system) {
        system.history.undo();
    }
    function REDO(system) {
        system.history.redo();
    }
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIvZmxhbWUvZWRpdG9yL3R5cGVzY3JpcHQvIiwic291cmNlcyI6WyJhY3Rpb25zL2hpc3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxVQUFVLElBQUksQ0FBQyxNQUFNO0lBQzFCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdkIsQ0FBQztBQUVELE1BQU0sVUFBVSxJQUFJLENBQUMsTUFBTTtJQUMxQixNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3ZCLENBQUMifQ==

    function resetPadding(system, component, element) {
        let cache = CacheFactory(system, component, element);
        let css = cache.rules;
        if (css.props.padding) {
            let val = css.props.padding;
            if (!Array.isArray(val)) {
                cache.setPropFromString(`
                padding-top:${val};
                padding-right:${val};
                padding-bottom:${val};
                padding-left:${val};
            `);
            }
            else {
                switch (val.length) {
                    case 2:
                        cache.setPropFromString(`
                        padding-top:${val[0]};
                        padding-right:${val[1]};
                        padding-bottom:${val[0]};
                        padding-left:${val[1]};
                    `);
                        break;
                    case 3:
                        cache.setPropFromString(`
                        padding-top:${val[0]};
                        padding-right:${val[2]};
                        padding-bottom:${val[1]};
                        padding-left:${val[2]};
                    `);
                        break;
                    case 4:
                        cache.setPropFromString(`
                        padding-top:${val[0]};
                        padding-right:${val[1]};
                        padding-bottom:${val[2]};
                        padding-left:${val[3]};
                    `);
                        break;
                }
            }
            //Convert padding value into 
            css.props.padding = null;
        }
    }
    function SETPADDINGLEFT(system, component, element, x, LINKED = false) {
        resetPadding(system, component, element);
        setNumericValue("padding_left", system, component, element, x, setNumericValue.parent_width);
        prepRebuild(system, component, element, LINKED);
    }
    function SETDELTAPADDINGLEFT(system, component, element, dx, ratio = 0, LINKED = false) {
        let cache = CacheFactory(system, component, element);
        let start_x = parseFloat(cache.computed.get("padding-left")) || 0;
        let width = (parseFloat(cache.computed.width) || 0) + start_x;
        if (dx > 0 && start_x + dx > width - 20)
            return ratio;
        if (start_x + dx > 0) {
            if (ratio > 0)
                SETPADDINGLEFT(system, component, element, start_x + dx / ratio, true);
            else {
                ratio = getRatio(system, component, element, SETPADDINGLEFT, start_x, dx, "padding-left");
            }
            SETDELTAWIDTH(system, component, element, -dx, true);
            prepRebuild(system, component, element, LINKED);
        }
        return ratio;
    }
    function SETPADDINGTOP(system, component, element, x, LINKED = false) {
        resetPadding(system, component, element);
        setNumericValue("padding_top", system, component, element, x, setNumericValue.parent_height);
        prepRebuild(system, component, element, LINKED);
    }
    function SETDELTAPADDINGTOP(system, component, element, dy, ratio = 0, LINKED = false) {
        let style = system.window.getComputedStyle(element);
        let start_y = parseFloat(style.paddingTop) || 0;
        let height = (parseFloat(style.height) || 0) + start_y;
        if (dy > 0 && start_y + dy > height - 20)
            return ratio;
        if (start_y + dy > 0) {
            if (ratio > 0)
                SETPADDINGTOP(system, component, element, start_y + dy / ratio, true);
            else {
                ratio = getRatio(system, component, element, SETPADDINGTOP, start_y, dy, "padding-top");
            }
            SETDELTAHEIGHT(system, component, element, -dy, true);
            prepRebuild(system, component, element, LINKED);
        }
        return ratio;
    }
    function SETPADDINGRIGHT(system, component, element, x, LINKED = false) {
        resetPadding(system, component, element);
        setNumericValue("padding_right", system, component, element, x, setNumericValue.parent_height);
        prepRebuild(system, component, element, LINKED);
    }
    function SETDELTAPADDINGRIGHT(system, component, element, dx, ratio = 0, LINKED = false) {
        let style = system.window.getComputedStyle(element);
        let start_x = parseFloat(style.paddingRight) || 0;
        let width = (parseFloat(style.width) || 0) + start_x;
        if (dx > 0 && start_x + dx > width - 20)
            return ratio;
        if (start_x + dx > 0) {
            if (ratio > 0)
                SETPADDINGRIGHT(system, component, element, start_x + dx / ratio, true);
            else {
                ratio = getRatio(system, component, element, SETPADDINGRIGHT, start_x, dx, "padding-right");
            }
            SETDELTAWIDTH(system, component, element, -dx, true);
            prepRebuild(system, component, element, LINKED);
        }
        return ratio;
    }
    function SETPADDINGBOTTOM(system, component, element, x, LINKED = false) {
        resetPadding(system, component, element);
        setNumericValue("padding_bottom", system, component, element, x, setNumericValue.parent_height);
        prepRebuild(system, component, element, LINKED);
    }
    function SETDELTAPADDINGBOTTOM(system, component, element, dy, ratio = 0, LINKED = false) {
        let style = system.window.getComputedStyle(element);
        let start_y = parseFloat(style.paddingBottom) || 0;
        let height = (parseFloat(style.height) || 0) + start_y;
        if (dy > 0 && dy + start_y > height - 20)
            return ratio;
        if (start_y + dy >= 0) {
            if (ratio > 0)
                SETPADDINGBOTTOM(system, component, element, start_y + dy / ratio, true);
            else {
                ratio = getRatio(system, component, element, SETPADDINGBOTTOM, start_y, dy, "padding-bottom");
            }
            SETDELTAHEIGHT(system, component, element, -dy, true);
            prepRebuild(system, component, element, LINKED);
        }
        return ratio;
    }
    function RESIZEPADDINGT(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
        if (IS_COMPONENT)
            return;
        SETDELTAPADDINGTOP(system, component, element, dy, 0, true);
        prepRebuild(system, component, element, LINKED);
    }
    function RESIZEPADDINGR(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
        if (IS_COMPONENT)
            return;
        SETDELTAPADDINGRIGHT(system, component, element, -dx, 0, true);
        prepRebuild(system, component, element, LINKED);
    }
    function RESIZEPADDINGL(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
        if (IS_COMPONENT)
            return;
        SETDELTAPADDINGLEFT(system, component, element, dx, 0, true);
        prepRebuild(system, component, element, LINKED);
    }
    function RESIZEPADDINGB(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
        if (IS_COMPONENT)
            return;
        SETDELTAPADDINGBOTTOM(system, component, element, -dy, 0, true);
        prepRebuild(system, component, element, LINKED);
    }
    function RESIZEPADDINGTL(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
        if (IS_COMPONENT)
            return;
        SETDELTAPADDINGLEFT(system, component, element, dx, 0, true);
        SETDELTAPADDINGTOP(system, component, element, dy, 0, true);
        prepRebuild(system, component, element, LINKED);
    }
    function RESIZEPADDINGTR(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
        if (IS_COMPONENT)
            return;
        SETDELTAPADDINGRIGHT(system, component, element, -dx, 0, true);
        SETDELTAPADDINGTOP(system, component, element, dy, 0, true);
        prepRebuild(system, component, element, LINKED);
    }
    function RESIZEPADDINGBL(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
        if (IS_COMPONENT)
            return;
        SETDELTAPADDINGLEFT(system, component, element, dx, 0, true);
        SETDELTAPADDINGBOTTOM(system, component, element, -dy, 0, true);
        prepRebuild(system, component, element, LINKED);
    }
    function RESIZEPADDINGBR(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
        if (IS_COMPONENT)
            return;
        SETDELTAPADDINGRIGHT(system, component, element, -dx, 0, true);
        SETDELTAPADDINGBOTTOM(system, component, element, -dy, 0, true);
        prepRebuild(system, component, element, LINKED);
    }
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFkZGluZy5qcyIsInNvdXJjZVJvb3QiOiIvZmxhbWUvZWRpdG9yL3R5cGVzY3JpcHQvIiwic291cmNlcyI6WyJhY3Rpb25zL3BhZGRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNILGVBQWUsRUFDZixRQUFRLEVBQ1IsZUFBZSxFQUNmLFdBQVcsRUFDZCxNQUFNLGFBQWEsQ0FBQztBQUVyQixPQUFPLEVBQ0gsWUFBWSxFQUNmLE1BQU0sWUFBWSxDQUFDO0FBRXBCLE9BQU8sRUFDSCxjQUFjLEVBQ2QsYUFBYSxFQUNoQixNQUFNLGlCQUFpQixDQUFDO0FBRXpCLFNBQVMsWUFBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTztJQUM1QyxJQUFJLEtBQUssR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNyRCxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0lBQ3RCLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7UUFDbkIsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFFNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDckIsS0FBSyxDQUFDLGlCQUFpQixDQUFDOzhCQUNOLEdBQUc7Z0NBQ0QsR0FBRztpQ0FDRixHQUFHOytCQUNMLEdBQUc7YUFDckIsQ0FBQyxDQUFDO1NBQ047YUFBTTtZQUNILFFBQVEsR0FBRyxDQUFDLE1BQU0sRUFBRTtnQkFDaEIsS0FBSyxDQUFDO29CQUNGLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQztzQ0FDTixHQUFHLENBQUMsQ0FBQyxDQUFDO3dDQUNKLEdBQUcsQ0FBQyxDQUFDLENBQUM7eUNBQ0wsR0FBRyxDQUFDLENBQUMsQ0FBQzt1Q0FDUixHQUFHLENBQUMsQ0FBQyxDQUFDO3FCQUN4QixDQUFDLENBQUM7b0JBQ0gsTUFBTTtnQkFD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

    function resetMargin(system, component, element) {
        let cache = CacheFactory(system, component, element);
        let css = cache.rules;
        if (css.props.margin) {
            //Convert margin value into 
            css.props.margin = null;
        }
    }
    function SETMARGINLEFT(system, component, element, x, LINKED = false) {
        resetMargin(system, component, element);
        setNumericValue("margin_left", system, component, element, x, setNumericValue.parent_width);
        if (!LINKED)
            prepUIUpdate(system, component, element, "STYLE");
    }
    function SETDELTAMARGINLEFT(system, component, element, dx, ratio = 0, LINKED = false) {
        let start_x = parseFloat(system.window.getComputedStyle(element)["margin-left"]);
        if (ratio > 0)
            SETMARGINLEFT(system, component, element, start_x + dx / ratio, true);
        else
            ratio = getRatio(system, component, element, SETMARGINLEFT, start_x, dx, "margin-left");
        if (!LINKED)
            prepUIUpdate(system, component, element, "STYLE");
        return ratio;
    }
    function SETMARGINTOP(system, component, element, x, LINKED = false) {
        resetMargin(system, component, element);
        setNumericValue("margin_top", system, component, element, x, setNumericValue.parent_height);
        if (!LINKED)
            prepUIUpdate(system, component, element, "STYLE");
    }
    function SETDELTAMARGINTOP(system, component, element, dx, ratio = 0, LINKED = false) {
        let start_x = parseFloat(system.window.getComputedStyle(element)["margin-top"]);
        if (ratio > 0)
            SETMARGINTOP(system, component, element, start_x + dx / ratio, true);
        else
            ratio = getRatio(system, component, element, SETMARGINTOP, start_x, dx, "margin-top");
        if (!LINKED)
            prepUIUpdate(system, component, element, "STYLE");
        return ratio;
    }
    function SETMARGINRIGHT(system, component, element, x, LINKED = false) {
        resetMargin(system, component, element);
        setNumericValue("margin_right", system, component, element, x, setNumericValue.parent_height);
        if (!LINKED)
            prepUIUpdate(system, component, element, "STYLE");
    }
    function SETDELTAMARGINRIGHT(system, component, element, dx, ratio = 0, LINKED = false) {
        let start_x = parseFloat(system.window.getComputedStyle(element)["margin-right"]);
        if (ratio > 0)
            SETMARGINRIGHT(system, component, element, start_x + dx / ratio, true);
        else
            ratio = getRatio(system, component, element, SETMARGINRIGHT, start_x, dx, "margin-right");
        if (!LINKED)
            prepUIUpdate(system, component, element, "STYLE");
        return ratio;
    }
    function SETMARGINBOTTOM(system, component, element, x, LINKED = false) {
        resetMargin(system, component, element);
        setNumericValue("margin_bottom", system, component, element, x, setNumericValue.parent_height);
        if (!LINKED)
            prepUIUpdate(system, component, element, "STYLE");
    }
    function SETDELTAMARGINBOTTOM(system, component, element, dx, ratio = 0, LINKED = false) {
        let start_x = parseFloat(system.window.getComputedStyle(element)["margin-bottom"]);
        if (ratio > 0)
            SETMARGINBOTTOM(system, component, element, start_x + dx / ratio, true);
        else
            ratio = getRatio(system, component, element, SETMARGINBOTTOM, start_x, dx, "margin-bottom");
        if (!LINKED)
            prepUIUpdate(system, component, element, "STYLE");
        return ratio;
    }
    function RESIZEMARGINT(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return;
        SETDELTAMARGINTOP(system, component, element, dy, 0, true);
        prepUIUpdate(system, component, element, "STYLE");
    }
    function RESIZEMARGINR(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return;
        SETDELTAMARGINRIGHT(system, component, element, -dx, 0, true);
        prepUIUpdate(system, component, element, "STYLE");
    }
    function RESIZEMARGINL(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return;
        SETDELTAMARGINLEFT(system, component, element, dx, 0, true);
        prepUIUpdate(system, component, element, "STYLE");
    }
    function RESIZEMARGINB(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return;
        SETDELTAMARGINBOTTOM(system, component, element, -dy, 0, true);
        prepUIUpdate(system, component, element, "STYLE");
    }
    function RESIZEMARGINTL(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return;
        let cache = CacheFactory(system, component, element);
        if ((cache.cssflagsA & 1)) {
            SETDELTALEFT(system, component, element, dx, 0, true);
            SETDELTATOP(system, component, element, dy, 0, true);
        }
        SETDELTAMARGINLEFT(system, component, element, -dx, 0, true);
        SETDELTAMARGINTOP(system, component, element, -dy, 0, true);
        prepUIUpdate(system, component, element, "STYLE");
    }
    function RESIZEMARGINTR(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return;
        SETDELTAMARGINRIGHT(system, component, element, dx, 0, true);
        SETDELTAMARGINTOP(system, component, element, dy, 0, true);
        prepUIUpdate(system, component, element, "STYLE");
    }
    function RESIZEMARGINBL(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return;
        SETDELTAMARGINLEFT(system, component, element, dx, 0, true);
        SETDELTAMARGINBOTTOM(system, component, element, dy, 0, true);
        prepUIUpdate(system, component, element, "STYLE");
    }
    function RESIZEMARGINBR(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return;
        SETDELTAMARGINRIGHT(system, component, element, dx, 0, true);
        SETDELTAMARGINBOTTOM(system, component, element, dy, 0, true);
        prepUIUpdate(system, component, element, "STYLE");
    }
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFyZ2luLmpzIiwic291cmNlUm9vdCI6Ii9mbGFtZS9lZGl0b3IvdHlwZXNjcmlwdC8iLCJzb3VyY2VzIjpbImFjdGlvbnMvbWFyZ2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3hELE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTFELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFMUMsU0FBUyxXQUFXLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPO0lBQzNDLElBQUksS0FBSyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3JELElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDdEIsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtRQUNsQiw0QkFBNEI7UUFDNUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0tBQzNCO0FBQ0wsQ0FBQztBQUVELE1BQU0sVUFBVSxhQUFhLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE1BQU0sR0FBRyxLQUFLO0lBQ3ZFLFdBQVcsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3hDLGVBQWUsQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM1RixJQUFJLENBQUMsTUFBTTtRQUFFLFlBQVksQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBRUQsTUFBTSxVQUFVLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUs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

    function CLEARLEFT(system, component, element, LINKED = false) {
        let cache = CacheFactory(system, component, element);
        let css = cache.rules;
        let KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
        if (css.props.left) {
            if (KEEP_UNIQUE)
                cache.setPropFromString(`left:auto`);
            else
                css.props.left = "auto";
        }
        if (!LINKED)
            prepUIUpdate(system, component, element, "STYLE");
    }
    //clear top
    function CLEARTOP(system, component, element, LINKED = false) {
        let cache = CacheFactory(system, component, element);
        let css = cache.rules;
        let KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
        if (css.props.top) {
            if (KEEP_UNIQUE)
                cache.setPropFromString(`top:auto`);
            else
                css.props.top = "auto";
        }
        if (!LINKED)
            prepUIUpdate(system, component, element, "STYLE");
    }
    //clear margin-top
    function CLEARMARGINTOP(system, component, element, LINKED = false) {
        let cache = CacheFactory(system, component, element);
        let css = cache.rules;
        let KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
        if (css.props.margin_left) {
            if (KEEP_UNIQUE)
                cache.setPropFromString(`margin-top:0`);
            else
                css.props.margin_left = 0;
        }
        if (!LINKED)
            prepUIUpdate(system, component, element, "STYLE");
    }
    //clear margin-left
    function CLEARMARGINLEFT(system, component, element, LINKED = false) {
        let cache = CacheFactory(system, component, element);
        let css = cache.rules;
        let KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
        if (css.props.margin_left) {
            if (KEEP_UNIQUE)
                cache.setPropFromString(`margin-left:0`);
            else
                css.props.margin_left = 0;
        }
        if (!LINKED)
            prepUIUpdate(system, component, element, "STYLE");
    }
    //clear margin-bottom
    //clear padding-left
    //clear padding-right
    //clear padding-bottom
    //clear padding-top
    //clear border-left
    //clear border-right
    //clear border-bottom
    //clear border-top
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYXIuanMiLCJzb3VyY2VSb290IjoiL2ZsYW1lL2VkaXRvci90eXBlc2NyaXB0LyIsInNvdXJjZXMiOlsiYWN0aW9ucy9jbGVhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRTFDLE1BQU0sVUFBVSxTQUFTLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxHQUFHLEtBQUs7SUFDaEUsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckQsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztJQUN0QixJQUFJLFdBQVcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztJQUMzQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO1FBQ2hCLElBQUksV0FBVztZQUFFLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7WUFDakQsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO0tBQ2hDO0lBQ0QsSUFBSSxDQUFDLE1BQU07UUFBRSxZQUFZLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkUsQ0FBQztBQUNELFdBQVc7QUFDWCxNQUFNLFVBQVUsUUFBUSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sR0FBRyxLQUFLO0lBQy9ELElBQUksS0FBSyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3JELElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDdEIsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7SUFDM0MsSUFBSSxHQUFHLENBQUMsS0FB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

    let types$4 = css$1.types;
    /**
     * Actions for converting position and layout to different forms.
     */
    function TOMARGINLEFT() { }
    function TOMARGINRIGHT() { }
    function TOMARGINLEFTRIGHT() { }
    function TOLEFT() { }
    function TORIGHT() { }
    function TOLEFTRIGHT() { }
    function TOTOP() { }
    function TOTOPBOTTOM() { }
    function getNativeDisplay(element) {
        let display = "block";
        switch (element.tagName) {
            case "A":
            case "SPAN":
                display = "inline";
        }
        return display;
    }
    function setToAbsolute(cache, KEEP_UNIQUE) {
        const css = cache.rules;
        if (KEEP_UNIQUE) {
            if (cache.unique.r.props.position)
                css.props.position = "absolute";
            else
                cache.setCSSProp("position:absolute");
        }
        else {
            if (css.props.position)
                css.props.position = "absolute";
            else
                cache.setCSSProp("position:absolute");
        }
    }
    function setToRelative(cache, KEEP_UNIQUE) {
        const css = cache.rules;
        if (KEEP_UNIQUE) {
            if (cache.unique.r.props.position)
                css.props.position = "relative";
            else
                cache.setCSSProp("position:relative");
        }
        else {
            if (css.props.position)
                css.props.position = "relative";
            else
                cache.setCSSProp("position:relative");
        }
    }
    /**
     * Convert position to ```absolute```
     */
    function TOPOSITIONABSOLUTE(system, component, element, LINKED = false) {
        let cache = CacheFactory(system, component, element);
        let css = cache.rules;
        let KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
        switch (css.props.position) {
            case "relative":
                /**
                    Need to take margin offset into account when converting to absolute
                */
                let rect = element.getBoundingClientRect();
                let par_prop = system.window.getComputedStyle(element);
                rect = element.getBoundingClientRect();
                let x = rect.x;
                let y = rect.y; //- parseFloat(par_prop["margin-top"]);
                if (css.props.margin) ;
                CLEARMARGINTOP(system, component, element, true);
                CLEARMARGINLEFT(system, component, element, true);
                SETLEFT(system, component, element, x, true);
                SETTOP(system, component, element, y, true);
                break;
        }
        setToAbsolute(cache, KEEP_UNIQUE);
        if (!LINKED) {
            prepUIUpdate(system, component, element, "STYLE");
            element.wick_node.rebuild();
        }
    }
    /**
     * Convert position to ```relative```
     */
    function TOPOSITIONRELATIVE(system, component, element) {
        const cache = CacheFactory(system, component, element);
        const css = cache.rules;
        const KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
        switch (css.props.position) {
            case "relative":
                /*no op*/
                break;
            case "absolute":
                //find the last child element that is positioned relative or static
                //get it's offset top and left + margin left and top
                let node = element.previousSibling;
                let offsetX = 0;
                let offsetY = 0;
                let rect = element.getBoundingClientRect();
                //Get Parent display type 
                let par_prop = system.window.getComputedStyle(element.parentElement);
                let ele_css = system.window.getComputedStyle(element);
                let par_out_dis = par_prop.display;
                let ele_in_dis = css.props.display || getNativeDisplay(element);
                const IS_INLINE = ele_in_dis.includes("inline");
                if (ele_in_dis == "inline") //force inline-block positioning
                    setValue(system, component, element, "display", "block");
                //PARENT positining
                //TODO handle grid positioning;
                //TODO handle flex positioning;
                //TODO handle inline and inline block positioning;
                //Outer positioning
                //Assuming Normal box positioning. 
                while (node) {
                    if (node instanceof HTMLElement) {
                        let rect = node.getBoundingClientRect();
                        let style = system.window.getComputedStyle(node);
                        if ((!style.position || style.position == "relative" || style.position == "static") && style.display !== "none") {
                            if (IS_INLINE)
                                offsetX = node.offsetLeft + parseFloat(style.width) + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth) + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
                            offsetY = node.offsetTop + parseFloat(style.height) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth) + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
                            break;
                        }
                    }
                    node = node.previousSibling;
                }
                var rectp = element.parentElement.getBoundingClientRect();
                var innerWidth = rectp.width - ((parseFloat(par_prop.borderLeftWidth) || 0) + (parseFloat(par_prop.paddingLeft) || 0) +
                    (parseFloat(par_prop.borderRightWidth) || 0) + (parseFloat(par_prop.paddingRight) || 0));
                if (IS_INLINE && (offsetX + rect.width) >= innerWidth)
                    offsetX = 0;
                if (offsetX == 0)
                    offsetX += (parseFloat(par_prop.borderLeftWidth) || 0) + (parseFloat(par_prop.paddingLeft) || 0);
                if (offsetY == 0)
                    offsetY += (parseFloat(par_prop.borderTopWidth) || 0) + (parseFloat(par_prop.paddingTop) || 0);
                var x1 = rect.x, y1 = rect.y, x = x1 - offsetX, y = y1 - offsetY;
                CLEARLEFT(system, component, element, true);
                CLEARTOP(system, component, element, true);
                SETMARGINLEFT(system, component, element, x, true);
                SETMARGINTOP(system, component, element, y, true);
                setToRelative(cache, KEEP_UNIQUE);
                prepUIUpdate(system, component, element, "STYLE");
                element.wick_node.rebuild();
                rect = element.getBoundingClientRect();
                //enforce Position
                var x2 = rect.x;
                var y2 = rect.y;
                if (x2 != x1)
                    SETMARGINLEFT(system, component, element, x - (x2 - x1), true);
                if (y2 != y1)
                    SETMARGINTOP(system, component, element, y - (y2 - y1), true);
                break;
        }
        prepUIUpdate(system, component, element, "STYLE");
        element.wick_node.rebuild();
    }
    function CONVERT_TOP(system, component, element, type) {
        let cache = CacheFactory(system, component, element);
        let position = parseFloat(system.window.getComputedStyle(element).top);
        switch (type) {
            case "%":
                cache.rules.props.top.setValue(new types$4.percentage(1));
                break;
            case "em":
                cache.rules.props.top.setValue(new types$4.length(1, "em"));
                break;
            case "vh":
                cache.rules.props.top.setValue(new types$4.length(1, "vh"));
                break;
            case "vw":
                cache.rules.props.top.setValue(new types$4.length(1, "vw"));
                break;
            case "vmin":
                cache.rules.props.top.setValue(new types$4.length(1, "vmin"));
                break;
            case "vmax":
                cache.rules.props.top.setValue(new types$4.length(1, "vmax"));
                break;
            default:
                cache.rules.props.top.setValue(new types$4.length(1, 'px'));
                break;
        }
        SETTOP(system, component, element, position);
        prepUIUpdate(system, component, element, "STYLE");
    }
    function CONVERT_LEFT(system, component, element, type) {
        let cache = CacheFactory(system, component, element);
        let position = parseFloat(system.window.getComputedStyle(element).left);
        switch (type) {
            case "%":
                cache.rules.props.left.setValue(new types$4.percentage(1));
                break;
            case "em":
                cache.rules.props.left.setValue(new types$4.length(1, "em"));
                break;
            case "vh":
                cache.rules.props.left.setValue(new types$4.length(1, "vh"));
                break;
            case "vw":
                cache.rules.props.left.setValue(new types$4.length(1, "vw"));
                break;
            case "vmin":
                cache.rules.props.left.setValue(new types$4.length(1, "vmin"));
                break;
            case "vmax":
                cache.rules.props.left.setValue(new types$4.length(1, "vmax"));
                break;
            default:
                cache.rules.props.left.setValue(new types$4.length(1, 'px'));
                break;
        }
        SETLEFT(system, component, element, position);
        prepUIUpdate(system, component, element, "STYLE");
    }
    //right
    //top
    //bottom
    //margin top
    //margin bottom
    //margin right
    //margin left
    //border top
    //border bottom
    //border left
    //border right
    //padding top
    //padding bottom
    //padding right
    //padding left
    function TOPOSITIONFIXED() { }
    function TOPOSITIONSTICKY() { }
    function TOGGLE_UNIT(system, component, element, horizontal, vertical) {
        // Get CSS information on element and update appropriate records
        let cache = CacheFactory(system, component, element);
        let css = cache.rules;
        let rect = getFirstPositionedAncestor(element).getBoundingClientRect();
        if (horizontal) {
            switch (cache.move_hori_type) {
                case "left right":
                case "left right margin":
                    if (css.props.right.value instanceof types$4.length) {
                        css.props.right.setValue(new types$4.percentage((css.props.right / rect.width) * 100));
                    }
                    else {
                        css.props.right.setValue(new types$4.length(rect.width * (css.props.right / 100), "px"));
                    } /** Intentional fall through **/
                case "left":
                    if (css.props.left.value instanceof types$4.length) {
                        css.props.left.setValue(new types$4.percentage((css.props.left / rect.width) * 100));
                    }
                    else {
                        css.props.left.setValue(new types$4.length(rect.width * (css.props.left / 100), "px"));
                    }
                    break;
                case "right":
                    if (css.props.right.value instanceof types$4.length) {
                        css.props.right.setValue(new types$4.percentage((css.props.right / rect.width) * 100));
                    }
                    else {
                        css.props.right.setValue(new types$4.length(rect.width * (css.props.right / 100), "px"));
                    }
                    break;
            }
        }
        prepUIUpdate(system, component, element, "STYLE");
    }
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVydC5qcyIsInNvdXJjZVJvb3QiOiIvZmxhbWUvZWRpdG9yL3R5cGVzY3JpcHQvIiwic291cmNlcyI6WyJhY3Rpb25zL2NvbnZlcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNILGNBQWMsRUFDZCxlQUFlLEVBQ2YsU0FBUyxFQUNULFFBQVEsRUFDWCxNQUFNLFlBQVksQ0FBQztBQUNwQixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ2hDLE9BQU8sRUFDSCxZQUFZLEVBQ2YsTUFBTSxZQUFZLENBQUM7QUFDcEIsT0FBTyxFQUNILDBCQUEwQixFQUMxQixRQUFRLEVBQ1gsTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxFQUNILE9BQU8sRUFDUCxNQUFNLEVBQ1QsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUNILGFBQWEsRUFDYixZQUFZLEVBQ2YsTUFBTSxhQUFhLENBQUM7QUFDckIsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztBQUV0Qjs7R0FFRztBQUNILE1BQU0sVUFBVSxZQUFZLEtBQUssQ0FBQztBQUNsQyxNQUFNLFVBQVUsYUFBYSxLQUFLLENBQUM7QUFDbkMsTUFBTSxVQUFVLGlCQUFpQixLQUFLLENBQUM7QUFDdkMsTUFBTSxVQUFVLE1BQU0sS0FBSyxDQUFDO0FBQzVCLE1BQU0sVUFBVSxPQUFPLEtBQUssQ0FBQztBQUM3QixNQUFNLFVBQVUsV0FBVyxLQUFLLENBQUM7QUFDakMsTUFBTSxVQUFVLEtBQUssS0FBSyxDQUFDO0FBQzNCLE1BQU0sVUFBVSxXQUFXLEtBQUssQ0FBQztBQUVqQyxTQUFTLGdCQUFnQixDQUFDLE9BQU87SUFDN0IsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBRXRCLFFBQVEsT0FBTyxDQUFDLE9BQU8sRUFBRTtRQUNyQixLQUFLLEdBQUcsQ0FBQztRQUNULEtBQUssTUFBTTtZQUNQLE9BQU8sR0FBRyxRQUFRLENBQUM7S0FDMUI7SUFF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QUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNyRCxJQUFJLFFBQVEsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUV4RSxRQUFRLElBQUksRUFBRTtRQUNWLEtBQUssR0FBRztZQUNKLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekQsTUFBTTtRQUNWLEtBQUssSUFBSTtZQUNMLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNELE1BQU07UUFDVixLQUFLLElBQUk7WUFDTCxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMzRCxNQUFNO1FBQ1YsS0FBSyxJQUFJO1lBQ0wsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDM0QsTUFBTTtRQUNWLEtBQUssTUFBTTtZQUNQLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU07UUFDVixLQUFLLE1BQU07WUFDUCxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksS0FB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

    const types$5 = css$1.types;
    function SETBORDERLEFT(system, component, element, x, LINKED = false) {
        let excess_x = setNumericValue("border_left_width", system, component, element, x, setNumericValue.parent_width);
        prepRebuild(system, component, element, LINKED);
        return { ratio: 0, excess_x };
    }
    function SETBORDERRIGHT(system, component, element, x, LINKED = false) {
        let excess_y = setNumericValue("border_right_width", system, component, element, x, setNumericValue.parent_height);
        prepRebuild(system, component, element, LINKED);
        return { ratio: 0, excess_y };
    }
    function SETBORDERTOP(system, component, element, x, LINKED = false) {
        let excess_y = setNumericValue("border_top_width", system, component, element, x, setNumericValue.parent_height);
        prepRebuild(system, component, element, LINKED);
        return { ratio: 0, excess_y };
    }
    function SETBORDERBOTTOM(system, component, element, x, LINKED = false) {
        let excess_y = setNumericValue("border_bottom_width", system, component, element, x, setNumericValue.parent_height);
        prepRebuild(system, component, element, LINKED);
        return { ratio: 0, excess_y };
    }
    function SETDELTABORDERLEFT(system, component, element, dx, ratio = 0, LINKED = false) {
        let start_x = parseFloat(system.window.getComputedStyle(element)["border-left-width"]), width = parseFloat(system.window.getComputedStyle(element)["width"]), excess_x = 0, excess_x_extra = 0;
        if (dx > 0 && width - dx < 0) {
            excess_x_extra = (width - dx);
            dx = width;
        }
        if (ratio > 0)
            excess_x = -SETBORDERLEFT(system, component, element, start_x + dx / ratio, true).excess_x;
        else
            excess_x = -getRatio(system, component, element, SETBORDERLEFT, start_x, dx, "border-left-width").excess;
        prepRebuild(system, component, element, LINKED);
        SETDELTAWIDTH(system, component, element, -dx - excess_x, 0, true);
        excess_x += excess_x_extra;
        return { excess_x };
    }
    function SETDELTABORDERRIGHT(system, component, element, dx, ratio = 0, LINKED = false) {
        let start_x = parseFloat(system.window.getComputedStyle(element)["border-right-width"]), width = parseFloat(system.window.getComputedStyle(element)["width"]), excess_x = 0, excess_x_extra = 0;
        if (dx > 0 && width - dx < 0) {
            excess_x_extra = -(width - dx);
            dx = width;
        }
        if (ratio > 0)
            excess_x = SETBORDERRIGHT(system, component, element, start_x + dx / ratio, true).excess_x;
        else
            excess_x = getRatio(system, component, element, SETBORDERRIGHT, start_x, dx, "border-right-width").excess;
        prepRebuild(system, component, element, LINKED);
        SETDELTAWIDTH(system, component, element, -dx + excess_x, 0, true);
        excess_x += excess_x_extra;
        return { excess_x };
    }
    function SETDELTABORDERTOP(system, component, element, dy, ratio = 0, LINKED = false) {
        let start_x = parseFloat(system.window.getComputedStyle(element)["border-top-width"]), height = parseFloat(system.window.getComputedStyle(element)["height"]), excess_y = 0, excess_y_extra = 0;
        if (dy > 0 && height - dy < 0) {
            excess_y_extra = (height - dy);
            dy = height;
        }
        if (ratio > 0)
            excess_y = -SETBORDERTOP(system, component, element, start_x + dy / ratio, true).excess_y;
        else
            excess_y = -getRatio(system, component, element, SETBORDERTOP, start_x, dy, "border-top-width").excess;
        prepRebuild(system, component, element, LINKED);
        SETDELTAHEIGHT(system, component, element, -dy - excess_y, 0, true);
        excess_y += excess_y_extra;
        return { excess_y };
    }
    function SETDELTABORDERBOTTOM(system, component, element, dy, ratio = 0, LINKED = false) {
        let start_x = parseFloat(system.window.getComputedStyle(element)["border-bottom-width"]), height = parseFloat(system.window.getComputedStyle(element)["height"]), excess_y = 0, excess_y_extra = 0;
        if (dy > 0 && height - dy < 0) {
            excess_y_extra = -(height - dy);
            dy = height;
        }
        if (ratio > 0)
            excess_y = SETBORDERBOTTOM(system, component, element, start_x + dy / ratio, true).excess_y;
        else
            excess_y = getRatio(system, component, element, SETBORDERBOTTOM, start_x, dy, "border-bottom-width").excess;
        prepRebuild(system, component, element, LINKED);
        SETDELTAHEIGHT(system, component, element, -dy + excess_y, 0, true);
        excess_y += excess_y_extra;
        return { excess_y };
    }
    function RESIZEBORDERT(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return;
        SETDELTABORDERTOP(system, component, element, dy, 0, true);
        prepRebuild(element);
    }
    function RESIZEBORDERR(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return;
        SETDELTABORDERRIGHT(system, component, element, -dx, 0, true);
        prepRebuild(element);
    }
    function RESIZEBORDERL(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return;
        SETDELTABORDERLEFT(system, component, element, dx, 0, true);
        prepRebuild(element);
    }
    function RESIZEBORDERB(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return;
        SETDELTABORDERBOTTOM(system, component, element, -dy, 0, true);
        prepRebuild(element);
    }
    function RESIZEBORDERTL(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return;
        let { excess_x } = SETDELTABORDERLEFT(system, component, element, dx, 0, true);
        let { excess_y } = SETDELTABORDERTOP(system, component, element, dy, 0, true);
        prepRebuild(element);
        return { excess_x, excess_y };
    }
    function RESIZEBORDERTR(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return;
        let { excess_x } = SETDELTABORDERRIGHT(system, component, element, -dx, 0, true);
        let { excess_y } = SETDELTABORDERTOP(system, component, element, dy, 0, true);
        prepRebuild(element);
        return { excess_x, excess_y };
    }
    function RESIZEBORDERBL(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return;
        let { excess_x } = SETDELTABORDERLEFT(system, component, element, dx, 0, true);
        let { excess_y } = SETDELTABORDERBOTTOM(system, component, element, -dy, 0, true);
        prepRebuild(element);
        return { excess_x, excess_y };
    }
    function RESIZEBORDERBR(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT)
            return;
        let { excess_x } = SETDELTABORDERRIGHT(system, component, element, -dx, 0, true);
        let { excess_y } = SETDELTABORDERBOTTOM(system, component, element, -dy, 0, true);
        prepRebuild(element);
        return { excess_x, excess_y };
    }
    function BORDERRADIUSTL(system, component, element, d) {
        setValue(system, component, element, "border_top_left_radius", new types$5.length(d, "px"));
        prepRebuild(element);
    }
    function BORDERRADIUSTR(system, component, element, d) {
        setValue(system, component, element, "border_top_right_radius", new types$5.length(d, "px"));
        prepRebuild(element);
    }
    function BORDERRADIUSBL(system, component, element, d) {
        setValue(system, component, element, "border_bottom_left_radius", new types$5.length(d, "px"));
        prepRebuild(element);
    }
    function BORDERRADIUSBR(system, component, element, d) {
        setValue(system, component, element, "border_bottom_right_radius", new types$5.length(d, "px"));
        prepRebuild(element);
    }
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9yZGVyLmpzIiwic291cmNlUm9vdCI6Ii9mbGFtZS9lZGl0b3IvdHlwZXNjcmlwdC8iLCJzb3VyY2VzIjpbImFjdGlvbnMvYm9yZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFaEMsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztBQUV4QixPQUFPLEVBQUUsZUFBZSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQThCLFdBQVcsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUMzRyxPQUFPLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFMUMsU0FBUyxXQUFXLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPO0lBQzNDLE9BQU87SUFDUCxJQUFJLEtBQUssR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNyRCxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0lBQ3RCLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7UUFDbEIsNEJBQTRCO1FBQzVCLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztLQUMzQjtBQUNMLENBQUM7QUFFRCxNQUFNLFVBQVUsYUFBYSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEdBQUcsS0FBSztJQUN2RSxXQUFXLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN4QyxJQUFJLFFBQVEsR0FBRyxlQUFlLENBQUMsbUJBQW1CLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNqSCxX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

    async function UPDATE_ELEMENT_OUTERHTML(system, component, element, outer_html) {
        //TODO - Collect old html data and store as history
        if (await element.wick_node.reparse(outer_html))
            system.ui.update();
    }
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbC5qcyIsInNvdXJjZVJvb3QiOiIvZmxhbWUvZWRpdG9yL3R5cGVzY3JpcHQvIiwic291cmNlcyI6WyJhY3Rpb25zL2h0bWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLEtBQUssVUFBVSx3QkFBd0IsQ0FBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxVQUFVO0lBQ3JGLG1EQUFtRDtJQUNuRCxJQUFHLE1BQU0sT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO1FBQzdDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDckIsQ0FBQyJ9

    function SETCSSPROP(system, component, element, value_string) {
        // Get CSS information on element and update appropriate records
        let cache = CacheFactory(system, component, element);
        cache.setPropFromString(value_string);
        prepRebuild(element);
    }
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0X2Nzcy5qcyIsInNvdXJjZVJvb3QiOiIvZmxhbWUvZWRpdG9yL3R5cGVzY3JpcHQvIiwic291cmNlcyI6WyJhY3Rpb25zL3NldF9jc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUMxQyxPQUFPLEVBQThCLFdBQVcsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUV0RSxNQUFNLFVBQVUsVUFBVSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFlBQVk7SUFFM0QsZ0VBQWdFO0lBQ2hFLElBQUksS0FBSyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRXJELEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUV0QyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDN0IsQ0FBQyJ9

    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uLmpzIiwic291cmNlUm9vdCI6Ii9mbGFtZS9lZGl0b3IvdHlwZXNjcmlwdC8iLCJzb3VyY2VzIjpbImFjdGlvbnMvYWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDMUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUN2QyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUN6QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLDRJQUE0STtBQUM1SSxPQUFPLEVBQ0gsUUFBUSxFQUNSLFNBQVMsRUFDVCxhQUFhLEVBQ2IsY0FBYyxFQUNqQixNQUFNLGlCQUFpQixDQUFDO0FBQ3pCLE9BQU8sRUFDSCxrQkFBa0IsRUFDbEIsUUFBUSxFQUNYLE1BQU0sWUFBWSxDQUFDO0FBQ3BCLE9BQU8sRUFDSCxVQUFVLEVBQ2IsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QixPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQ0gsT0FBTyxFQUNQLFlBQVksRUFDWixNQUFNLEVBQ04sV0FBVyxFQUNYLFFBQVEsRUFDUixhQUFhLEVBQ2IsU0FBUyxFQUNULGNBQWMsRUFDZCxRQUFRLEVBQ1IsUUFBUSxFQUNSLFFBQVEsRUFDUixRQUFRLEVBQ1IsT0FBTyxFQUNQLE9BQU8sRUFDUCxPQUFPLEVBQ1AsT0FBTyxFQUNWLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFDSCxjQUFjLEVBQ2QsbUJBQW1CLEVBQ25CLGFBQWEsRUFDYixrQkFBa0IsRUFDbEIsZUFBZSxFQUNmLG9CQUFvQixFQUNwQixnQkFBZ0IsRUFDaEIscUJBQXFCLEVBQ3JCLGVBQWUsRUFDZixlQUFlLEVBQ2YsZUFBZSxFQUNmLGVBQWUsRUFDZixjQUFjLEVBQ2QsY0FBYyxFQUNkLGNBQWMsRUFDZCxjQUFjLEVBQ2pCLE1BQU0sY0FBYyxDQUFDO0FBQ3RCLE9BQU8sRUFDSCxhQUFhLEVBQ2Isa0JBQWtCLEVBQ2xCLFlBQVksRUFDWixpQkFBaUIsRUFDakIsY0FBYyxFQUNkLG1CQUFtQixFQUNuQixlQUFlLEVBQ2Ysb0JBQW9CLEVBQ3BCLGNBQWMsRUFDZCxjQUFjLEVBQ2QsY0FBYyxFQUNkLGNBQWMsRUFDZCxhQUFhLEVBQ2IsYUFBYSxFQUNiLGFBQWEsRUFDYixhQUFhLEVBQ2hCLE1BQU0sYUFBYSxDQUFDO0FBQ3JCLE9BQU8sRUFDSCxZQUFZLEVBQ1osYUFBYSxFQUNiLGlCQUFpQixFQUNqQixNQUFNLEVBQ04sT0FBTyxFQUNQLFdBQVcsRUFDWCxLQUFLLEVBQ0wsV0FBVyxFQUNYLFdBQVcsRUFDWCxrQkFBa0IsRUFDbEIsa0JBQWtCLEVBQ2xCLGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIsWUFBWSxFQUNaLFdBQVcsRUFDZCxNQUFNLGNBQWMsQ0FBQztBQUN0QixPQUFPLEVBQ0gsYUFBYSxFQUNiLGtCQUFrQixFQUNsQixZQUFZLEVBQ1osaUJBQWlCLEVBQ2pCLGNBQWMsRUFDZCxtQkFBbUIsRUFDbkIsZUFBZSxFQUNmLG9CQUFvQixFQUNwQixhQUFhLEVBQ2IsYUFBYSxFQUNiLGFBQWEsRUFDYixhQUFhLEVBQ2IsY0FBYyxFQUNkLGNBQWMsRUFDZCxjQUFjLEVBQ2QsY0FBYyxFQUNkLGNBQWMsRUFDZCxjQUFjLEVBQ2QsY0FBYyxFQUNkLGNBQWMsR0FDakIsTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxFQUNILHdCQUF3QixFQUMzQixNQUFNLFdBQVcsQ0FBQztBQUNuQixPQUFPLEVBQ0gsVUFBVSxFQUNiLE1BQU0sY0FBYyxDQUFDIn0=

    var ACTIONS = /*#__PURE__*/Object.freeze({
        __proto__: null,
        CacheFactory: CacheFactory,
        TEXTEDITOR: TEXTEDITOR,
        MOVE: MOVE,
        CENTER: CENTER,
        COMPLETE: COMPLETE,
        SETWIDTH: SETWIDTH,
        SETHEIGHT: SETHEIGHT,
        SETDELTAWIDTH: SETDELTAWIDTH,
        SETDELTAHEIGHT: SETDELTAHEIGHT,
        SETBACKGROUNDCOLOR: SETBACKGROUNDCOLOR,
        SETCOLOR: SETCOLOR,
        MOVE_PANEL: MOVE_PANEL,
        UNDO: UNDO,
        REDO: REDO,
        SETLEFT: SETLEFT,
        SETDELTALEFT: SETDELTALEFT,
        SETTOP: SETTOP,
        SETDELTATOP: SETDELTATOP,
        SETRIGHT: SETRIGHT,
        SETDELTARIGHT: SETDELTARIGHT,
        SETBOTTOM: SETBOTTOM,
        SETDELTABOTTOM: SETDELTABOTTOM,
        RESIZETL: RESIZETL,
        RESIZETR: RESIZETR,
        RESIZEBL: RESIZEBL,
        RESIZEBR: RESIZEBR,
        RESIZET: RESIZET,
        RESIZER: RESIZER,
        RESIZEL: RESIZEL,
        RESIZEB: RESIZEB,
        SETPADDINGLEFT: SETPADDINGLEFT,
        SETDELTAPADDINGLEFT: SETDELTAPADDINGLEFT,
        SETPADDINGTOP: SETPADDINGTOP,
        SETDELTAPADDINGTOP: SETDELTAPADDINGTOP,
        SETPADDINGRIGHT: SETPADDINGRIGHT,
        SETDELTAPADDINGRIGHT: SETDELTAPADDINGRIGHT,
        SETPADDINGBOTTOM: SETPADDINGBOTTOM,
        SETDELTAPADDINGBOTTOM: SETDELTAPADDINGBOTTOM,
        RESIZEPADDINGTL: RESIZEPADDINGTL,
        RESIZEPADDINGTR: RESIZEPADDINGTR,
        RESIZEPADDINGBL: RESIZEPADDINGBL,
        RESIZEPADDINGBR: RESIZEPADDINGBR,
        RESIZEPADDINGT: RESIZEPADDINGT,
        RESIZEPADDINGR: RESIZEPADDINGR,
        RESIZEPADDINGL: RESIZEPADDINGL,
        RESIZEPADDINGB: RESIZEPADDINGB,
        SETMARGINLEFT: SETMARGINLEFT,
        SETDELTAMARGINLEFT: SETDELTAMARGINLEFT,
        SETMARGINTOP: SETMARGINTOP,
        SETDELTAMARGINTOP: SETDELTAMARGINTOP,
        SETMARGINRIGHT: SETMARGINRIGHT,
        SETDELTAMARGINRIGHT: SETDELTAMARGINRIGHT,
        SETMARGINBOTTOM: SETMARGINBOTTOM,
        SETDELTAMARGINBOTTOM: SETDELTAMARGINBOTTOM,
        RESIZEMARGINTL: RESIZEMARGINTL,
        RESIZEMARGINTR: RESIZEMARGINTR,
        RESIZEMARGINBL: RESIZEMARGINBL,
        RESIZEMARGINBR: RESIZEMARGINBR,
        RESIZEMARGINT: RESIZEMARGINT,
        RESIZEMARGINR: RESIZEMARGINR,
        RESIZEMARGINL: RESIZEMARGINL,
        RESIZEMARGINB: RESIZEMARGINB,
        TOMARGINLEFT: TOMARGINLEFT,
        TOMARGINRIGHT: TOMARGINRIGHT,
        TOMARGINLEFTRIGHT: TOMARGINLEFTRIGHT,
        TOLEFT: TOLEFT,
        TORIGHT: TORIGHT,
        TOLEFTRIGHT: TOLEFTRIGHT,
        TOTOP: TOTOP,
        TOTOPBOTTOM: TOTOPBOTTOM,
        TOGGLE_UNIT: TOGGLE_UNIT,
        TOPOSITIONABSOLUTE: TOPOSITIONABSOLUTE,
        TOPOSITIONRELATIVE: TOPOSITIONRELATIVE,
        TOPOSITIONFIXED: TOPOSITIONFIXED,
        TOPOSITIONSTICKY: TOPOSITIONSTICKY,
        CONVERT_LEFT: CONVERT_LEFT,
        CONVERT_TOP: CONVERT_TOP,
        SETBORDERLEFT: SETBORDERLEFT,
        SETDELTABORDERLEFT: SETDELTABORDERLEFT,
        SETBORDERTOP: SETBORDERTOP,
        SETDELTABORDERTOP: SETDELTABORDERTOP,
        SETBORDERRIGHT: SETBORDERRIGHT,
        SETDELTABORDERRIGHT: SETDELTABORDERRIGHT,
        SETBORDERBOTTOM: SETBORDERBOTTOM,
        SETDELTABORDERBOTTOM: SETDELTABORDERBOTTOM,
        RESIZEBORDERT: RESIZEBORDERT,
        RESIZEBORDERR: RESIZEBORDERR,
        RESIZEBORDERL: RESIZEBORDERL,
        RESIZEBORDERB: RESIZEBORDERB,
        RESIZEBORDERTL: RESIZEBORDERTL,
        RESIZEBORDERTR: RESIZEBORDERTR,
        RESIZEBORDERBL: RESIZEBORDERBL,
        RESIZEBORDERBR: RESIZEBORDERBR,
        BORDERRADIUSTL: BORDERRADIUSTL,
        BORDERRADIUSTR: BORDERRADIUSTR,
        BORDERRADIUSBL: BORDERRADIUSBL,
        BORDERRADIUSBR: BORDERRADIUSBR,
        UPDATE_ELEMENT_OUTERHTML: UPDATE_ELEMENT_OUTERHTML,
        SETCSSPROP: SETCSSPROP
    });

    async function initFlame(editor_cfw, comp_cfw, comp_window) {
        const component_map = new Map, wick = comp_cfw.wick, css = comp_cfw.css, rt = wick.rt, edit_rt = editor_cfw.wick.rt, edit_wick = editor_cfw.wick, editor_model = { comp: null, ele: null, sc: 0, selected_ele: null, selected_element: null, ACTIONS, POINTER_DN: false };
        //Root UI element in document markup.
        let ui_root = null;
        /**
         * Integrate Flame editing system into every component instance.
         */
        cfw.wick.rt.OVERRIDABLE_onComponentCreate = function (comp) {
            //Register all components within a tracker based on their instance type. 
            if (component_map.has(comp.name) == false)
                component_map.set(comp.name, new Set);
            component_map.get(comp.name).add(comp);
            //Used to trace elements back to their components.
            if (comp.ele)
                comp.ele.wick_component = comp;
        };
        function retrieveComponentFromElement(ele) {
            do {
                if (ele.wick_component && !ele.hasAttribute("w-o"))
                    /* Presence of "w-o" indicates the element belongs to a component that has integrated it's
                     * element into the tree of another component.  */
                    return ele.wick_component;
                ele = ele.parentNode;
            } while (ele);
            return null;
        }
        function getComponentDataFromComponent(comp) {
            if (!comp)
                return null;
            return cfw.wick.rt.presets.components.get(comp.name);
        }
        function getElementFromEvent(event) {
            return event.target;
        }
        function getComponentFromEvent(event) {
            return retrieveComponentFromElement(getElementFromEvent(event));
        }
        function getComponentHierarchy(comp) {
            const list = [comp];
            while (comp.par) {
                list.push(comp.par);
                comp = comp.par;
            }
            return list.reverse();
        }
        function getComponentData(...comp) {
            return comp.flatMap(e => e).map(getComponentDataFromComponent);
        }
        function ISElementUI(ele) {
            while (ele) {
                if (ele == ui_root) {
                    return true;
                }
                ele = ele.parentNode;
            }
            return false;
        }
        function selectElementEventResponder(e) {
            const comp = getComponentFromEvent(event), ele = getElementFromEvent(event);
            if (ISElementUI(ele))
                return;
            editor_model.selected_comp = comp;
            editor_model.selected_ele = ele;
            editor_model.comp = null;
            editor_model.ele = null;
            const roots = getComponentData(getComponentHierarchy(comp));
            for (const comp of roots) {
                for (const CSS of (comp.CSS || [])) {
                    resume: for (const node of (CSS.nodes || [])) {
                        for (const selector of (node.selectors || [])) {
                            if (css.matchElements(ele, selector, css.DOMHelpers)) {
                                const css_package = {
                                    comp: comp,
                                    root: CSS,
                                    rule: node
                                };
                                console.log(css_package);
                                console.log(selector, selector.pos);
                                break resume;
                            }
                        }
                    }
                }
            }
        }
        let prev = null, ACTIVE_ACTION = null, cx = 0, cy = 0, px = 0, py = 0;
        let edit_css = comp_window.document.createElement("style");
        comp_window.document.head.appendChild(edit_css);
        const system = {
            action_sabot: null,
            text_info: "",
            dx: 0,
            dy: 0,
            dz: 0,
            move_type: "relative",
            css: css_sys,
            window: comp_window,
            document: comp_window.document,
            body: comp_window.document.body,
            head: comp_window.document.head,
            wick,
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
        function START_ACTION(...act) {
            editor_model.POINTER_DN = true;
            //Make sure all actions in slug are actions.
            //arrange the actions based on their ordering precedence
            const sabot = act
                .filter(a => typeof a == "object"
                && typeof a.act == "function"
                && typeof a.precedence == "number"
                && typeof a.type == "string")
                .sort((a, b) => a.precedence > b.precedence ? -1 : 1);
            if (sabot.length !== act.length) {
                ACTIVE_ACTION = null;
                system.action_sabot = null;
            }
            else {
                system.action_sabot = sabot;
                ACTIVE_ACTION = sabot;
            }
            px = cx;
            py = cy;
            UPDATE_ACTION(true);
        }
        function UPDATE_ACTION(INITIAL_PASS = false) {
            if (!ACTIVE_ACTION)
                return;
            system.dx = cx - px;
            system.dy = cy - py;
            const ele = editor_model.selected_ele, comp = editor_model.selected_comp;
            for (const action of ACTIVE_ACTION) {
                if (action.INITIAL_ONLY && !INITIAL_PASS)
                    continue;
                applyAction(action, system, comp, ele);
            }
            system.dx = 0;
            system.dy = 0;
            editor_model.sc++;
        }
        function END_ACTION(event) {
            editor_model.POINTER_DN = false;
            if (!ACTIVE_ACTION)
                return;
            const ele = editor_model.selected_ele, comp = editor_model.selected_comp;
            sealAction(ACTIVE_ACTION, system, comp, ele);
            ACTIVE_ACTION = null;
            system.action_sabot = null;
        }
        function pointerReleaseElementEventResponder(e) {
            if (ACTIVE_ACTION)
                return END_ACTION();
            selectElementEventResponder();
        }
        function pointerMoveEventResponder(e) {
            px = cx;
            cx = e.x;
            py = cy;
            cy = e.y;
            if (ACTIVE_ACTION)
                return UPDATE_ACTION();
            const ele = comp_window.document.elementFromPoint(e.x, e.y);
            if (!ele || ISElementUI(ele))
                return;
            if (ele !== prev) {
                prev = ele;
            }
            else
                return;
            const comp = retrieveComponentFromElement(ele);
            editor_model.comp = comp;
            editor_model.ele = ele;
        }
        function globalScrollEventListener(e) {
            editor_model.sc++;
        }
        comp_window.document.addEventListener("pointermove", pointerMoveEventResponder);
        comp_window.document.addEventListener("pointerup", pointerReleaseElementEventResponder);
        comp_window.document.addEventListener("scroll", globalScrollEventListener);
        comp_window.addEventListener("resize", globalScrollEventListener);
        comp_window.addEventListener("keypress", e => {
            if (e.key == "z")
                history.ROLLBACK_EDIT_STATE(system);
            if (e.key == "r")
                history.ROLLFORWARD_EDIT_STATE(system);
            history.WriteBack(system);
            editor_model.sc++;
        });
        /**
         * Include the editor frame system.
         */
        edit_rt.presets.models["flame-editor"] = editor_model;
        edit_rt.presets.api.START_ACTION = START_ACTION;
        edit_rt.presets.api.ACTIONS = ACTIONS;
        const editor_frame = await (edit_wick("/flame/editor/components/editor.jsx").pending);
        ui_root = (new editor_frame.classWithIntegratedCSS()).ele;
        document.body.insertBefore(ui_root, document.body.firstElementChild);
    }
    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIvZmxhbWUvZWRpdG9yL3R5cGVzY3JpcHQvIiwic291cmNlcyI6WyJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxPQUFPLE1BQU0scUJBQXFCLENBQUM7QUFFL0MsT0FBTyxPQUFPLE1BQU0sVUFBVSxDQUFDO0FBRS9CLE9BQU8sRUFDSCxXQUFXLEVBQ1gsVUFBVSxFQUNiLE1BQU0scUJBQXFCLENBQUM7QUFFN0IsT0FBTyxPQUFPLE1BQU0sY0FBYyxDQUFDO0FBR25DLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxVQUFVLFNBQVMsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLFdBQVc7SUFFckUsTUFDSSxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQ3ZCLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxFQUNwQixHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFDbEIsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQ1osT0FBTyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUM1QixTQUFTLEdBQUcsVUFBVSxDQUFDLElBQUksRUFDM0IsWUFBWSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUU1SCxxQ0FBcUM7SUFDckMsSUFDSSxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ25COztPQUVHO0lBQ0gsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsNkJBQTZCLEdBQUcsVUFBVSxJQUFJO1FBRXRELHlFQUF5RTtRQUN6RSxJQUFJLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUs7WUFBRSxhQUFhLENBQUMsR0FBRyxD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

    return initFlame;

}());
