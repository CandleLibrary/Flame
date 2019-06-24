let cache_de_cache = null;

function getApplicableRules(system, component, element) {
    return system.css.aquireCSS(component, element);
}

export function getUniqueRule(system, component, element) {
    return system.css.getUnique(component, element);
}

function mergeRules(system, css) {
    return system.css.mergeRules(css);
}

class ComputedStyle{
    constructor(component, element, cache){
        this.cache = cache;
        this._computed = component.window.getComputedStyle(element);
        this.brect = element.getBoundingClientRect()
    }

    get width(){
        return this.brect.width;
    }

    get hight(){
        return this.brect.height;
    }

    get(value){

        const internal_value = this.cache.rules.props[value];

        if(internal_value)
            return internal_value.toString();
        
        return this._computed.getPropertyValue(value);
    }
}

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
        this.next = cache_de_cache;
        cache_de_cache = this;
    }

    get computed () {
        if(!this._computed)
            this._computed = new ComputedStyle(this.component, this.element, this);
        return this._computed; 
    }

    update(system){
        if(!system)
            return

        this.generateMovementCache(system, this.component, this.element);
    }

    generateMovementCache(system, component, element) {

        let move_type = system.project.components.move_type;

        let unique_rule = getUniqueRule(system, component, element),
            css_r = getApplicableRules(system, component, element),
            css = mergeRules(system, css_r);

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
        if (css.props.margin)
            HM = true;

        if (css.props.width)
            W = true;
        if (css.props.height)
            H = true;

        //      1                     2                   4                 8                 16                
        let v = ((POS_R | 0) << 0) | ((POS_A | 0) << 1) | ((HT | 0) << 2) | ((HR | 0) << 3) | ((HB | 0) << 4) |
            //32                64                 128                256                512                1024              2048            4096
            ((HL | 0) << 5) | ((HMT | 0) << 6) | ((HMR | 0) << 7) | ((HMB | 0) << 8) | ((HML | 0) << 9) | ((W | 0) << 10) | ((H | 0) << 11) | ((HM | 0) << 12);


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

        if ((v & 3) == 0) {

            if (move_type == "absolute") {
                v |= 2;
                unique_rule.addProp('position:absolute');
            } else if (move_type == "relative") {
                v |= 1;
                unique_rule.addProp('position:relative;');
            }
        }


        //Setup move systems. 
        while (true) {

            let p = [];

            if ((32 & v))
                p.push("left");
            if ((8 & v))
                p.push("right");

            if ((v & 1024) && css.props.width !== "auto") {
                if ((v & (128 + 512 + 4096))) {
                    if ((css.props.margin_left == "auto" && css.props.margin_left == "auto") || css.props.margin == "auto")
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

        this.unique = unique_rule;
        css_r = getApplicableRules(system, component, element);
        this.rules = mergeRules(system, css_r);
        this.cssflagsA = v;
        this.original_rules =css_r;
        //calculate horizontal and vertical rations. also width and height ratios.  
    }

    get position(){
        if(this.cssflagsA & Cache.relative)
            return "relative";
        if(this.cssflagsA & Cache.absolute)
            return "absolute";
        return "auto";

    }
}

//Flags
Cache.relative = 1;
Cache.absolute = 2;

export function CacheFactory(system, component, element) {

    if (element.flame_cache)
        return element.flame_cache;

    let cache;

    if (cache_de_cache) {
        cache = cache_de_cache;
        cache_de_cache = cache_de_cache.next;
    } else
        cache = new Cache();

    cache.component = component;
    cache.element = element;

    cache.generateMovementCache(system, component, element);

    element.flame_cache = cache;

    return cache;
}

CacheFactory.clear = function(element){
    
    if(element.flame_cache){
        element.flame_cache.destroy();
    }

    element.flame_cache = null;
}
