import { css } from "../env.js";

let global_cache = null;

function getApplicableProps(system, component, element) {
    return system.css.getApplicableProps(system, component, element);
}

export function getUniqueRule(system, component, element) {
    return system.css.getUnique(system, component, element);
}

function mergeRules(system, ...rules) {
    return system.css.manager.mergeRules(rules);
}

class ComputedStyle {
    constructor(component, element, cache) {
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

/* Cache collects info about the CSS state of an element and provides methods to create new properties. */

class Cache {

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
    }

    destroy() {
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

    generateMovementCache(system, component, element) {

        this.system = system;

        let move_type = system.move_type || "absolute";

        let css_r = getApplicableProps(system, component, element);

        // The unique rule either exists within the edit style sheet cache,
        // or a new one needs to be made.
        this.unique = css_r;

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

        if (css_r.props.position) {
            if (css_r.props.position == "relative")
                POS_R = true;
            else
                POS_A = true;
        }

        if (css_r.props.has("left"))
            HL = true;
        if (css_r.props.has("right"))
            HR = true;
        if (css_r.props.has("top"))
            HT = true;
        if (css_r.props.has("bottom"))
            HB = true;

        if (css_r.props.has("margin_left"))
            HML = true;
        if (css_r.props.has("margin_right"))
            HMR = true;
        if (css_r.props.has("margin_top"))
            HMT = true;
        if (css_r.props.has("margin_bottom"))
            HMB = true;
        if (css_r.props.has("margin"))
            HM = true;

        if (css_r.props.has("width"))
            W = true;
        if (css_r.props.has("height"))
            H = true;

        //      1                     2                   4                 8                 16                
        let v = ((POS_R | 0) << 0) | ((POS_A | 0) << 1) | ((HT | 0) << 2) | ((HR | 0) << 3) | ((HB | 0) << 4) |
            //32                64                 128                256                512                1024              2048            4096
            ((HL | 0) << 5) | ((HMT | 0) << 6) | ((HMR | 0) << 7) | ((HMB | 0) << 8) | ((HML | 0) << 9) | ((W | 0) << 10) | ((H | 0) << 11) | ((HM | 0) << 12);


        if ((60 & v) > 0) { //

            if ((v & 40) == 0) { // HT + HL
                //missing left / right position value.
                //Add left
                this.setCSSProp(`left:0px`);
                v |= 1 << 5;
            }

            if ((v & 20) == 0) { // HT + HR
                //missing top / bottom position value
                //Add top
                this.setCSSProp(`top:0px`);
                v |= 1 << 2;
            }
        } else if ((960 & v) > 0) {
            //using margin
        } else {

            //Create left and top positions or us margin depending on current user preferences.
            this.setCSSProp(`left:0px;top:0px`);
            v |= 4 | 32;
        }

        if ((v & 3) == 0) {

            if (move_type == "absolute") {
                v |= 2;
                this.setCSSProp('position:absolute');
            } else if (move_type == "relative") {
                v |= 1;
                this.setCSSProp('position:relative;');
            }
        }


        //Setup move systems. 
        while (true) {

            let p = [];

            if ((32 & v))
                p.push("left");
            if ((8 & v))
                p.push("right");

            if ((v & 1024) && css_r.props.width !== "auto") {
                if ((v & (128 + 512 + 4096))) {
                    if ((css_r.props.margin_left == "auto" && css_r.props.margin_left == "auto") || css_r.props.margin == "auto")
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

        this.original_rules = css_r;
        //calculate horizontal and vertical rations. also width and height ratios.  
    }

    get position() {
        if (this.cssflagsA & Cache.relative)
            return "relative";
        if (this.cssflagsA & Cache.absolute)
            return "absolute";
        return "auto";

    }

    setCSSProp(string) {
        css.addPropsToRule(this.unique, string);
        this.rules = this.unique;
    }
}

//Flags
Cache.relative = 1;
Cache.absolute = 2;

export function CacheFactory(system, component, element) {

    if (element.flame_cache) {
        return element.flame_cache;
    }

    let cache;

    if (global_cache) {
        cache = global_cache;
        global_cache = global_cache.next;
    } else
        cache = new Cache();

    cache.component = component;
    cache.element = element;

    cache.generateMovementCache(system, component, element);

    element.flame_cache = cache;

    return cache;
}

CacheFactory.clear = function (element) {

    if (element.flame_cache)
        element.flame_cache.destroy();

    element.flame_cache = null;
};
