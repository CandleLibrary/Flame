import wick from "wick";

let CSS_Rule_Constructor = wick.core.css.prop;


let cache_de_cache = null;

function getApplicableRules(system, element, component) {
    return system.css.aquireCSS(element, component);
}

export function getUniqueRule(system, element, component) {
    return system.css.getUnique(element, component);
}

function mergeRules(css) {
    let rule = new CSS_Rule_Constructor();
    for (let i = 0; i < css.length; i++)
        rule.merge(css[i].r);
    return rule;
}

class Cache {
    constructor() {
        this.rules = null;
        this.element = null;
        this.cssflagsA = 0;
        this.cssflagsB = 0;
        this.next = null;
        this.valueA = 0;
        this.valueB = 0;
        this.valueC = 0;
        this.valueD = 0;
        this.move_vert_type = "";
        this.move_hori_type = "";
    }

    destroy() {
        this.rules = null;
        this.element = null;
        this.cssflagsA = 0;
        this.cssflagsB = 0;
        this.move_type = "";
        this.valueA = 0;
        this.valueB = 0;
        this.valueC = 0;
        this.valueD = 0;
        this.next = cache_de_cache;
        cache_de_cache = this;
    }

    generateMovementCache(system, element, component) {

        let move_type = system.project.settings.move_type;

        let unique_rule = getUniqueRule(system, element, component),
            css_r = getApplicableRules(system, element, component),
            css = mergeRules(css_r);

        //test for presence of rules. 
        let POS_R = false,
            POS_A = false,
            HT = false,
            HL = false,
            HB = false,
            HR = false,
            HMR = false,
            HMT = false,
            HMB = false,
            HML = false,
            W = false,
            H = false;

        if (css.props.position) {
            if (css.props.position == "relative")
                POS_R = true;
            else
                POS_A = true;
        }

        if (css.props.left)
            HL = true;
        if (css.props.right)
            HR = true;
        if (css.props.top)
            HT = true;
        if (css.props.bottom)
            HB = true;

        if (css.props.margin_left)
            HML = true;
        if (css.props.margin_right)
            HMR = true;
        if (css.props.margin_top)
            HMT = true;
        if (css.props.margin_bottom)
            HMB = true;

        if (css.props.width)
            W = true;
        if (css.props.height)
            H = true;

        //      1                     2                   4                 8                 16                
        let v = ((POS_R | 0) << 0) | ((POS_A | 0) << 1) | ((HT | 0) << 2) | ((HR | 0) << 3) | ((HB | 0) << 4) |
            //32                64                 128                256                512                1024              2048
            ((HL | 0) << 5) | ((HMT | 0) << 6) | ((HMR | 0) << 7) | ((HMB | 0) << 8) | ((HML | 0) << 9) | ((W | 0) << 10) | ((H | 0) << 11);


        if ((60 & v) > 0) { //

            if ((v & 40) == 0) { // HT + HL
                //missing left / right position value.
                //Add left
                unique_rule.addProp(`left:0px`);
                v |= 1 << 5;
            }

            if ((v & 20) == 0) { // HT + HR
                //missing top / bottom position value
                //Add top
                unique_rule.addProp(`top:0px`);
                v |= 1 << 2;
            }
        } else if ((960 & v) > 0) {
            //using margin
        } else {

            //Create left and top positions or us margin depending on current user preferences.
            unique_rule.addProp(`left:0px;top:0px`);
            v |= 4 | 32;
        }

        console.log(v)

        if ((v & 3) == 0) {

            if (move_type == "absolute") {
                v |= 2;
                unique_rule.addProp('position:absolute');
            } else if (move_type == "relative") {
                v |= 1;
                unique_rule.addProp('position:relative');
            }
        }


        //Setup move systems. 
        while (true) {

            //horizontal types
            if (2 & v) {
                let p = [];

                if ((32 & v))
                    p.push("left");
                if ((8 & v) && (p.length < 1) || !(v & 1024))
                    p.push("right");

                if (p.length > 0)
                    this.move_hori_type = p.join(" ");
            }

            if (1 & v) {
                let p = [];

                if ((32 & v))
                    p.push("left");
                if ((8 & v) && (p.length < 1))
                    p.push("right");

                if (p.length > 0)
                    this.move_hori_type = p.join(" ");
                else {
                    if ((v & (128 + 512) == (128 + 512))) {
                        if (css.props.margin_left == "auto" && css.props.margin_left == "auto")
                            this.move_hori_type = "margin centered";
                        else
                            this.move_hori_type = "margin";
                    } else if (v & 128) {
                        this.move_hori_type = "margin-left";
                    } else if (v & 512) {
                        this.move_hori_type = "margin-right";
                    }
                }
            }

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

        css_r = getApplicableRules(system, element, component);
        this.rules = mergeRules(css_r);
        this.cssflagsA = v;
        //calculate horizontal and vertical rations. also width and height ratios.  
    }
}

export function CacheFactory(system, element, component) {

    if (element.flame_cache)
        return element.flame_cache;

    let cache;

    if (cache_de_cache) {
        cache = cache_de_cache;
        cache_de_cache = cache_de_cache.next;
    } else
        cache = new Cache();

    cache.generateMovementCache(system, element, component);

    element.flame_cache = cache;

    return cache;
}