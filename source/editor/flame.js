var flame = (function () {
    'use strict';

    /**
     * Common CandleFW libraries.
     * 
     * Pulled in from the global object. Libraries assigned to 
     * global object by @candlefw/cfw library.
     */

    const url = cfw.url, wick = cfw.wick, glow = cfw.glow, css = cfw.css;

    let global_cache = null;

    function getApplicableProps(system, component, element) {
        return system.css.getApplicableProps(system, component, element);
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
            } else if ((960 & v) > 0) ; else {

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

    function CacheFactory(system, component, element) {

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

    function TEXTEDITOR(system, component, element, x, y){}

    let types = css.types;

    function getContentBox(ele, win = window, system) {
        const
            scale = system.ui.transform.scale,

            rect = ele.getBoundingClientRect(),
            par_prop = win.getComputedStyle(ele),

            border_l = parseFloat(par_prop.getPropertyValue("border-left")),
            border_r = parseFloat(par_prop.getPropertyValue("border-right")),
            border_t = parseFloat(par_prop.getPropertyValue("border-top")),
            border_b = parseFloat(par_prop.getPropertyValue("border-bottom")),

            top = rect.top / scale + border_t,
            left = rect.left / scale + border_l,
            width = rect.width / scale - border_l - border_r,
            height = rect.height / scale - border_t - border_b;
        return { top, left, width, height };
    }

    function prepUIUpdate$1(system, component, element, type) {
        switch (type) {
            case "STYLE":
                system.edit_css.innerHTML = css.render(element.flame_cache.unique);
                break;
        }
    }

    /** 
        Handles the rebuild routine of wick elements 
    */
    function prepRebuild(system, component, element, LINKED = true) {
        prepUIUpdate$1(system, component, element, "STYLE");
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

    const adjust_data = { RELATIVE: false, value: 0, denominator: 0, prop: null };

    function numericAdjust(ALLOW_NEGATIVE = false) {
        let excess = 0, value = adjust_data.value;

        if (!ALLOW_NEGATIVE && value < 0) {
            excess = value;
            value = 0;
        }

        const prop = adjust_data.prop;

        if (adjust_data.RELATIVE) {
            const np = adjust_data.value / adjust_data.denominator;
            prop.setValue(prop.value.copy(np * 100));
        } else {
            if (prop.value.copy)
                prop.setValue(prop.value.copy(adjust_data.value));
            else {
                if (value !== 0)
                    prop.setValue(new types.length(adjust_data.value, "px"));
                else
                    prop.setValue(0);
            }
        }

        return excess;
    }

    function setNumericValue(propname, system, component, element, value, relative_type = 0, ALLOW_NEGATIVE = false) {
        let
            cache = CacheFactory(system, component, element),
            css = cache.rules,
            KEEP_UNIQUE = system.flags.KEEP_UNIQUE,
            props = css.props,
            prop = props.get(propname),
            css_name = propname.replace(/_/g, "-");

        if (!prop) {
            if (cache.unique.props.has(propname)) {
                props = cache.unique.props;
                prop = props.get(propname);
            } else if (!KEEP_UNIQUE || true) {
                let type = (system.global.default_pos_unit || "px");
                let value = (type == "%") ? new types.percentage(0) : new types.length(0, type);
                cache.setCSSProp(`${css_name}:${value + type}`);
                props = cache.unique.props;
                prop = props.get(propname);
            }
        }

        adjust_data.RELATIVE = false;
        adjust_data.prop = prop;
        adjust_data.value = value;

        if (prop == "auto") {

            //convert to numerical form;
            prop.setValue(new types.length(value, "px"));

            return excess;

        } else if (prop.value.type === "%") {
            //get the nearest positioned ancestor
            let denominator = 1,
                ele = null;

            switch (relative_type) {
                case setNumericValue.parent_width:
                    ele = element.parentElement;
                    if (ele) denominator = getContentBox(ele, system.window, system).width;
                    break;
                case setNumericValue.parent_height:
                    ele = element.parentElement;
                    if (ele) denominator = getContentBox(ele, system.window, system).height;
                    break;
                case setNumericValue.positioned_ancestor_width:
                    ele = getFirstPositionedAncestor(element);
                    if (ele) denominator = getContentBox(ele, system.window, system).width;
                    break;
                case setNumericValue.positioned_ancestor_height:
                    ele = getFirstPositionedAncestor(element);
                    if (ele) denominator = getContentBox(ele, system.window, system).height;
                    break;
                case setNumericValue.height:
                    denominator = getContentBox(component, element.window, system).width;
                    break;
                case setNumericValue.width:
                    denominator = getContentBox(component, element.window, system).width;
                    break;
            }

            adjust_data.denominator = denominator;
            adjust_data.RELATIVE = true;
        }

        return numericAdjust(ALLOW_NEGATIVE);
    }

    setNumericValue.parent_width = 0;
    setNumericValue.parent_height = 1;
    setNumericValue.positioned_ancestor_width = 2;
    setNumericValue.positioned_ancestor_height = 3;
    setNumericValue.height = 4;
    setNumericValue.width = 5;

    function getRatio(system, component, element, funct, original_value, delta_value, delta_measure, ALLOW_NEGATIVE = false, NO_ADJUST = false) {
        let excess = 0,
            ratio = 0,
            scale = system.ui.transform.scale;

        let begin_x = element.getBoundingClientRect()[delta_measure] / scale;

        ///*
        if (!ALLOW_NEGATIVE && original_value + delta_value < 0) {
            excess = original_value + delta_value;
            delta_value = -original_value;
        }
        //*/


        funct(system, component, element, original_value + delta_value);

        let end_x = element.getBoundingClientRect()[delta_measure] / scale;

        let diff_x = end_x - begin_x;

        if (Math.abs(diff_x - delta_value) > 0.0005 && delta_value !== 0) {

            ratio = (diff_x / delta_value);

            let diff = delta_value / Math.round(ratio);

            if (diff !== 0 && !NO_ADJUST) {
                adjust_data.value = original_value + diff;
                let out = numericAdjust();
                //let out = funct(system, component, element, original_value + diff, true);
                excess += out;
                //console.log(ratio)
            }
        }
        return { ratio, excess };
    }

    function setValue(system, component, element, value_name, value) {
        let cache = CacheFactory(system, component, element);

        let props = cache.rules.props;

        if (props.has(value_name)) {
            props.get(value_name).setValue(value);
        } else {
            cache.setCSSProp(`${value_name.replace(/\_/g, "-")}:${value}`);
        }
    }

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
        let start_x = parseFloat(system.window.getComputedStyle(element).width),
            excess = 0;

        if (ratio > 0) {
            let { ratio: r, excess_x: e } = SETWIDTH(system, component, element, start_x + dx / ratio, true);
            ratio = r;
            excess = e;
        } else {
            let { ratio: r, excess: e } = getRatio(system, component, element, SETWIDTH, start_x, dx, "width");
            ratio = r;
            excess = e;
        }

        prepRebuild(system, component, element, LINKED);

        return { excess_x: excess, ratio };
    }

    function SETDELTAHEIGHT(system, component, element, dy, ratio = 0, LINKED = false) {
        let start_y = parseFloat(system.window.getComputedStyle(element).height),
            excess = 0;

        if (ratio > 0) {
            let { ratio: r, excess_y: e } = SETHEIGHT(system, component, element, start_y + dy / ratio, true);
            ratio = r;
            excess = e;
        } else {
            let { ratio: r, excess: e } = getRatio(system, component, element, SETHEIGHT, start_y, dy, "height");
            ratio = r;
            excess = e;
        }

        prepRebuild(system, component, element, LINKED);

        return { excess_y: excess, ratio };
    }

    const types$1 = css.types;

    /***************************************************************************************/
    /********************************** POSITION SUB ACTIONS *************************************/
    /***************************************************************************************/

    function SETLEFT(system, component, element, x, LINKED = false) {
        let cache = CacheFactory(system, component, element),
            excess = 0;

        if (x.type) {
            cache.rules.props.left.setValue(x);
        } else {
            if (cache.cssflagsA & 1)
                excess = setNumericValue("left", system, component, element, x, setNumericValue.parent_width, true);
            else
                excess = setNumericValue("left", system, component, element, x, setNumericValue.positioned_ancestor_width, true);
        }

        prepRebuild(system, component, element, LINKED);

        return { excess_x: excess };
    }

    function SETRIGHT(system, component, element, x, LINKED = false) {
        let cache = CacheFactory(system, component, element),
            excess = 0;

        if (cache.cssflagsA & 1)
            excess = setNumericValue("right", system, component, element, x, setNumericValue.parent_width, true);
        else
            excess = setNumericValue("right", system, component, element, x, setNumericValue.positioned_ancestor_width, true);

        prepRebuild(system, component, element, LINKED);

        return { excess_x: excess };
    }

    function SETTOP(system, component, element, y, LINKED = false) {
        let cache = CacheFactory(system, component, element),
            excess = 0;

        if (y.type) {
            cache.rules.props.top.setValue(y);
        } else {
            if (cache.cssflagsA & 1)
                excess = setNumericValue("top", system, component, element, y, setNumericValue.parent_height, true);
            else
                excess = setNumericValue("top", system, component, element, y, setNumericValue.positioned_ancestor_height, true);
        }

        prepRebuild(system, component, element, LINKED);

        return { excess_y: excess };
    }

    function SETBOTTOM(system, component, element, y, LINKED = false) {
        let cache = CacheFactory(system, component, element),
            excess = 0;

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
        let start_x = parseFloat(system.window.getComputedStyle(element).left),
            excess_x = 0;

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
        let start_x = parseFloat(system.window.getComputedStyle(element).right),
            excess_x = 0;

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

        let start_x = parseFloat(system.window.getComputedStyle(element).top),
            excess_y = 0;

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
        let start_x = parseFloat(system.window.getComputedStyle(element).bottom),
            excess_y = 0;

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


    function RESIZEL(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT) return (component.x += dx, component.width -= dx);
        let cache = CacheFactory(system, component, element),
            excess_x = 0;
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

    function RESIZET(system, component, element, dx, dy, IS_COMPONENT) {

        if (IS_COMPONENT) return (component.y += dy, component.height -= dy);
        let cache = CacheFactory(system, component, element),
            excess_y = 0;
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
        if (IS_COMPONENT) return (component.width += dx);
        let cache = CacheFactory(system, component, element),
            excess_x = 0;

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
        if (IS_COMPONENT) return (component.height += dy);
        let cache = CacheFactory(system, component, element),
            excess_y = 0;
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

    function RESIZETL(system, component, element, dx, dy, IS_COMPONENT) {
        let { excess_x } = RESIZEL(system, component, element, dx, dy, IS_COMPONENT);
        let { excess_y } = RESIZET(system, component, element, dx, dy, IS_COMPONENT);

        if (!IS_COMPONENT)
            prepRebuild(system, component, element, false);

        return { excess_x, excess_y };
    }

    function RESIZETR(system, component, element, dx, dy, IS_COMPONENT) {

        let { excess_x } = RESIZER(system, component, element, dx, dy, IS_COMPONENT);
        let { excess_y } = RESIZET(system, component, element, dx, dy, IS_COMPONENT);
        if (!IS_COMPONENT)
            prepRebuild(system, component, element, false);

        return { excess_x, excess_y };
    }

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

    const types$2 = css.types;

    /**
     * Actions provide mechanisms for updating an element, document, and component through user input. 
     */
    function MOVE(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {

        if (IS_COMPONENT) {
            if (!component) debugger;
            component.x += dx;
            component.y += dy;
        } else {

            // Get CSS information on element and update appropriate records
            let cache = CacheFactory(system, component, element);

            let css = cache.rules;

            if (!css.props.position)
                cache.setCSSProp("position:relative");

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
                cache.setCSSProp(`margin-left:auto; margin-right:auto`);
                break;
            case "left":
                cache.setCSSProp(`margin-left:auto; margin-right:auto;left:0px;right:0px`);
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

    function COMPLETE(system, element) {
    	
    	//Diff changed documents, clear caches, close opened dialogs if necessary
    	if(element)
    		CacheFactory.clear(element);

    	system.data.docs.seal();
    	//system.history.seal();
    }

    let types$3 = css.types;

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

    function MOVE_PANEL(system, panel, dx, dy) {
        panel.x -= dx;
        panel.y -= dy;

        if (panel.x < 0) panel.x = 0;
        if (panel.y < 0) panel.y = 0;
        if (panel.x + panel.width > window.screen.width) panel.x = window.screen.width - panel.width;
        if (panel.y + panel.height > window.screen.height) panel.y = window.screen.height - panel.height;
    }

    function UNDO(system){
    	system.history.undo();
    }

    function REDO(system){
    	system.history.redo();
    }

    function resetPadding(system, component, element) {
        let cache = CacheFactory(system, component, element);
        let css = cache.rules;
        if (css.props.padding) {
            let val = css.props.padding;

            if (!Array.isArray(val)) {
                cache.setCSSProp(`
                padding-top:${val};
                padding-right:${val};
                padding-bottom:${val};
                padding-left:${val};
            `);
            } else {
                switch (val.length) {
                    case 2:
                        cache.setCSSProp(`
                        padding-top:${val[0]};
                        padding-right:${val[1]};
                        padding-bottom:${val[0]};
                        padding-left:${val[1]};
                    `);
                        break;
                    case 3:
                        cache.setCSSProp(`
                        padding-top:${val[0]};
                        padding-right:${val[2]};
                        padding-bottom:${val[1]};
                        padding-left:${val[2]};
                    `);
                        break;
                    case 4:
                        cache.setCSSProp(`
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

        if (dx > 0 && start_x + dx > width - 20) return ratio;

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

        if (dy > 0 && start_y + dy > height - 20) return ratio;

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

        if (dx > 0 && start_x + dx > width - 20) return ratio;

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

        if (dy > 0 && dy + start_y > height - 20) return ratio;

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
        if (IS_COMPONENT) return;
        SETDELTAPADDINGTOP(system, component, element, dy, 0, true);
        prepRebuild(system, component, element, LINKED);
    }

    function RESIZEPADDINGR(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
        if (IS_COMPONENT) return;
        SETDELTAPADDINGRIGHT(system, component, element, -dx, 0, true);
        prepRebuild(system, component, element, LINKED);
    }

    function RESIZEPADDINGL(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
        if (IS_COMPONENT) return;
        SETDELTAPADDINGLEFT(system, component, element, dx, 0, true);
        prepRebuild(system, component, element, LINKED);
    }

    function RESIZEPADDINGB(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
        if (IS_COMPONENT) return;
        SETDELTAPADDINGBOTTOM(system, component, element, -dy, 0, true);
        prepRebuild(system, component, element, LINKED);
    }

    function RESIZEPADDINGTL(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
        if (IS_COMPONENT) return;
        SETDELTAPADDINGLEFT(system, component, element, dx, 0, true);
        SETDELTAPADDINGTOP(system, component, element, dy, 0, true);
        prepRebuild(system, component, element, LINKED);
    }

    function RESIZEPADDINGTR(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
        if (IS_COMPONENT) return;
        SETDELTAPADDINGRIGHT(system, component, element, -dx, 0, true);
        SETDELTAPADDINGTOP(system, component, element, dy, 0, true);
        prepRebuild(system, component, element, LINKED);
    }

    function RESIZEPADDINGBL(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
        if (IS_COMPONENT) return;
        SETDELTAPADDINGLEFT(system, component, element, dx, 0, true);
        SETDELTAPADDINGBOTTOM(system, component, element, -dy, 0, true);
        prepRebuild(system, component, element, LINKED);
    }

    function RESIZEPADDINGBR(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
        if (IS_COMPONENT) return;
        SETDELTAPADDINGRIGHT(system, component, element, -dx, 0, true);
        SETDELTAPADDINGBOTTOM(system, component, element, -dy, 0, true);
        prepRebuild(system, component, element, LINKED);
    }

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
        if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
    }

    function SETDELTAMARGINLEFT(system, component, element, dx, ratio = 0, LINKED = false) {
        let start_x = parseFloat(system.window.getComputedStyle(element)["margin-left"]);

        if (ratio > 0)
            SETMARGINLEFT(system, component, element, start_x + dx / ratio, true);
        else
            ratio = getRatio(system, component, element, SETMARGINLEFT, start_x, dx, "margin-left");

        if (!LINKED) prepUIUpdate(system, component, element, "STYLE");

        return ratio;
    }

    function SETMARGINTOP(system, component, element, x, LINKED = false) {
        resetMargin(system, component, element);
        setNumericValue("margin_top", system, component, element, x, setNumericValue.parent_height);
        if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
    }

    function SETDELTAMARGINTOP(system, component, element, dx, ratio = 0, LINKED = false) {
        let start_x = parseFloat(system.window.getComputedStyle(element)["margin-top"]);

        if (ratio > 0)
            SETMARGINTOP(system, component, element, start_x + dx / ratio, true);
        else
            ratio = getRatio(system, component, element, SETMARGINTOP, start_x, dx, "margin-top");

        if (!LINKED) prepUIUpdate(system, component, element, "STYLE");

        return ratio;
    }

    function SETMARGINRIGHT(system, component, element, x, LINKED = false) {
        resetMargin(system, component, element);
        setNumericValue("margin_right", system, component, element, x, setNumericValue.parent_height);
        if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
    }


    function SETDELTAMARGINRIGHT(system, component, element, dx, ratio = 0, LINKED = false) {
        let start_x = parseFloat(system.window.getComputedStyle(element)["margin-right"]);

        if (ratio > 0)
            SETMARGINRIGHT(system, component, element, start_x + dx / ratio, true);
        else
            ratio = getRatio(system, component, element, SETMARGINRIGHT, start_x, dx, "margin-right");

        if (!LINKED) prepUIUpdate(system, component, element, "STYLE");

        return ratio;
    }

    function SETMARGINBOTTOM(system, component, element, x, LINKED = false) {
        resetMargin(system, component, element);
        setNumericValue("margin_bottom", system, component, element, x, setNumericValue.parent_height);
        if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
    }


    function SETDELTAMARGINBOTTOM(system, component, element, dx, ratio = 0, LINKED = false) {
        let start_x = parseFloat(system.window.getComputedStyle(element)["margin-bottom"]);

        if (ratio > 0)
            SETMARGINBOTTOM(system, component, element, start_x + dx / ratio, true);
        else
            ratio = getRatio(system, component, element, SETMARGINBOTTOM, start_x, dx, "margin-bottom");

        if (!LINKED) prepUIUpdate(system, component, element, "STYLE");

        return ratio;
    }

    function RESIZEMARGINT(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT) return;
        SETDELTAMARGINTOP(system, component, element, dy, 0, true);
        prepUIUpdate(system, component, element, "STYLE");
    }

    function RESIZEMARGINR(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT) return;
        SETDELTAMARGINRIGHT(system, component, element, -dx, 0, true);
        prepUIUpdate(system, component, element, "STYLE");
    }

    function RESIZEMARGINL(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT) return;
        SETDELTAMARGINLEFT(system, component, element, dx, 0, true);
        prepUIUpdate(system, component, element, "STYLE");
    }

    function RESIZEMARGINB(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT) return;
        SETDELTAMARGINBOTTOM(system, component, element, -dy, 0, true);
        prepUIUpdate(system, component, element, "STYLE");
    }

    function RESIZEMARGINTL(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT) return;
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
        if (IS_COMPONENT) return;

        SETDELTAMARGINRIGHT(system, component, element, dx, 0, true);
        SETDELTAMARGINTOP(system, component, element, dy, 0, true);
        prepUIUpdate(system, component, element, "STYLE");
    }

    function RESIZEMARGINBL(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT) return;
        SETDELTAMARGINLEFT(system, component, element, dx, 0, true);
        SETDELTAMARGINBOTTOM(system, component, element, dy, 0, true);
        prepUIUpdate(system, component, element, "STYLE");
    }

    function RESIZEMARGINBR(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT) return;
        SETDELTAMARGINRIGHT(system, component, element, dx, 0, true);
        SETDELTAMARGINBOTTOM(system, component, element, dy, 0, true);
        prepUIUpdate(system, component, element, "STYLE");
    }

    function CLEARLEFT(system, component, element, LINKED = false) {
        let cache = CacheFactory(system, component, element);
        let css = cache.rules;
        let KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
        if (css.props.left) {
            if (KEEP_UNIQUE) cache.setCSSProp(`left:auto`);
            else css.props.left = "auto";
        }
        if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
    }
    //clear top
    function CLEARTOP(system, component, element, LINKED = false) {
        let cache = CacheFactory(system, component, element);
        let css = cache.rules;
        let KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
        if (css.props.top) {
            if (KEEP_UNIQUE) cache.setCSSProp(`top:auto`);
            else css.props.top = "auto";
        }
        if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
    }

    //clear margin-top
    function CLEARMARGINTOP(system, component, element, LINKED = false) {
        let cache = CacheFactory(system, component, element);
        let css = cache.rules;
        let KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
        if (css.props.margin_left) {
            if (KEEP_UNIQUE) cache.setCSSProp(`margin-top:0`);
            else css.props.margin_left = 0;
        }
        if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
    }
    //clear margin-left
    function CLEARMARGINLEFT(system, component, element, LINKED = false) {
        let cache = CacheFactory(system, component, element);
        let css = cache.rules;
        let KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
        if (css.props.margin_left) {
            if (KEEP_UNIQUE) cache.setCSSProp(`margin-left:0`);
            else css.props.margin_left = 0;
        }
        if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
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

    let types$4 = css.types;

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
            if (cache.unique.r.props.position) css.props.position = "absolute";
            else cache.setCSSProp("position:absolute");
        } else {
            if (css.props.position) css.props.position = "absolute";
            else cache.setCSSProp("position:absolute");
        }
    }

    function setToRelative(cache, KEEP_UNIQUE) {
        const css = cache.rules;
        if (KEEP_UNIQUE) {
            if (cache.unique.r.props.position) css.props.position = "relative";
            else cache.setCSSProp("position:relative");
        } else {
            if (css.props.position) css.props.position = "relative";
            else cache.setCSSProp("position:relative");
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

                if (ele_in_dis == "inline")//force inline-block positioning
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
    function TOPOSITIONSTICKY() { /* NO OP */ }
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
                    } else {
                        css.props.right.setValue(new types$4.length(rect.width * (css.props.right / 100), "px"));
                    } /** Intentional fall through **/
                case "left":
                    if (css.props.left.value instanceof types$4.length) {
                        css.props.left.setValue(new types$4.percentage((css.props.left / rect.width) * 100));
                    } else {
                        css.props.left.setValue(new types$4.length(rect.width * (css.props.left / 100), "px"));
                    }
                    break;
                case "right":
                    if (css.props.right.value instanceof types$4.length) {
                        css.props.right.setValue(new types$4.percentage((css.props.right / rect.width) * 100));
                    } else {
                        css.props.right.setValue(new types$4.length(rect.width * (css.props.right / 100), "px"));
                    }
                    break;
            }
        }
        prepUIUpdate(system, component, element, "STYLE");
    }

    const types$5 = css.types;

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

        let start_x = parseFloat(system.window.getComputedStyle(element)["border-left-width"]),
            width = parseFloat(system.window.getComputedStyle(element)["width"]),
            excess_x = 0,
            excess_x_extra = 0;

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

        let start_x = parseFloat(system.window.getComputedStyle(element)["border-right-width"]),
            width = parseFloat(system.window.getComputedStyle(element)["width"]),
            excess_x = 0,
            excess_x_extra = 0;

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
        let start_x = parseFloat(system.window.getComputedStyle(element)["border-top-width"]),
            height = parseFloat(system.window.getComputedStyle(element)["height"]),
            excess_y = 0,
            excess_y_extra = 0;

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
        let start_x = parseFloat(system.window.getComputedStyle(element)["border-bottom-width"]),
            height = parseFloat(system.window.getComputedStyle(element)["height"]),
            excess_y = 0,
            excess_y_extra = 0;

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
        if (IS_COMPONENT) return;
        SETDELTABORDERTOP(system, component, element, dy, 0, true);
        prepRebuild(element);
    }

    function RESIZEBORDERR(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT) return;
        SETDELTABORDERRIGHT(system, component, element, -dx, 0, true);
        prepRebuild(element);
    }

    function RESIZEBORDERL(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT) return;
        SETDELTABORDERLEFT(system, component, element, dx, 0, true);
        prepRebuild(element);
    }

    function RESIZEBORDERB(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT) return;
        SETDELTABORDERBOTTOM(system, component, element, -dy, 0, true);
        prepRebuild(element);
    }

    function RESIZEBORDERTL(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT) return;
        let { excess_x } = SETDELTABORDERLEFT(system, component, element, dx, 0, true);
        let { excess_y } = SETDELTABORDERTOP(system, component, element, dy, 0, true);

        prepRebuild(element);

        return { excess_x, excess_y };
    }

    function RESIZEBORDERTR(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT) return;
        let { excess_x } = SETDELTABORDERRIGHT(system, component, element, -dx, 0, true);
        let { excess_y } = SETDELTABORDERTOP(system, component, element, dy, 0, true);

        prepRebuild(element);

        return { excess_x, excess_y };
    }

    function RESIZEBORDERBL(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT) return;
        let { excess_x } = SETDELTABORDERLEFT(system, component, element, dx, 0, true);
        let { excess_y } = SETDELTABORDERBOTTOM(system, component, element, -dy, 0, true);

        prepRebuild(element);

        return { excess_x, excess_y };
    }

    function RESIZEBORDERBR(system, component, element, dx, dy, IS_COMPONENT) {
        if (IS_COMPONENT) return;
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

    async function UPDATE_ELEMENT_OUTERHTML (system, component, element, outer_html){
    	//TODO - Collect old html data and store as history
    	if(await element.wick_node.reparse(outer_html))
    		system.ui.update();
    }

    function SETCSSPROP(system, component, element, value_string) {

            // Get CSS information on element and update appropriate records
            let cache = CacheFactory(system, component, element);

            cache.setCSSProp(value_string);

            prepRebuild(element);
    }



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

    var css_sys = {
        getUnique(system, component, element) {
            return null;
        },

        getApplicableProps(system, component, element) {
            return css.mergeRulesIntoOne(
                ...getComponentHierarchy(component)
                    .map(c => getComponentData(c, system.edit_wick.rt.presets))
                    .flatMap(c => c.CSS || [])
                    .flatMap(e => css.getApplicableRules(element, e))
            );
        }
    };

    async function initFlame(editor_cfw, comp_cfw, comp_window) { //For Isolation

        const
            component_map = new Map,
            wick = comp_cfw.wick,
            css = comp_cfw.css,
            rt = wick.rt,
            edit_rt = editor_cfw.wick.rt,
            edit_wick = editor_cfw.wick,
            editor_model = { comp: null, ele: null, sc: 0, selected_ele: null, selected_element: null, ACTIONS };

        //Root UI element in document markup.
        let
            ui_root = null;
        /**
         * Integrate Flame editing system into every component instance. 
         */
        cfw.wick.rt.OVERRIDABLE_onComponentCreate = function (comp) {

            //Register all components within a tracker based on their instance type. 
            if (component_map.has(comp.name) == false) component_map.set(comp.name, new Set);
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
            if (!comp) return null;
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
            while (comp.par) { list.push(comp.par); comp = comp.par; }
            return list.reverse();
        }

        function getComponentData(...comp) {
            return comp.flatMap(e => e).map(getComponentDataFromComponent);
        }

        function ISElementUI(ele) {
            while (ele) {
                if (ele == ui_root) { return true; }
                ele = ele.parentNode;
            }
            return false;
        }

        function selectElementEventResponder(e) {

            const comp = getComponentFromEvent(event),
                ele = getElementFromEvent(event);

            if (ISElementUI(ele))
                return;

            editor_model.selected_comp = comp;
            editor_model.selected_ele = ele;
            editor_model.comp = null;
            editor_model.ele = null;

            const roots = getComponentData(getComponentHierarchy(comp));

            for (const comp of roots) {
                for (const CSS of (comp.CSS || [])) {
                    resume:
                    for (const node of (CSS.nodes || [])) {
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
            move_type: "relative",
            css: css_sys,
            window: comp_window,
            document: comp_window.document,
            body: comp_window.document.body,
            head: comp_window.document.head,
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

        function START_ACTION(act) {
            ACTIVE_ACTION = act;
            px = cx;
            py = cy;
            UPDATE_ACTION();
        }

        function UPDATE_ACTION() {

            const dx = cx - px;
            const dy = cy - py;

            const
                ele = editor_model.selected_ele,
                comp = editor_model.selected_comp;

            ACTIVE_ACTION(system, comp, ele, dx, dy, false);
            editor_model.sc++;
        }

        function END_ACTION(event) {
            ACTIVE_ACTION = null;
        }

        function pointerReleaseElementEventResponder(e) {
            if (ACTIVE_ACTION) return END_ACTION();
            selectElementEventResponder();
        }

        function pointerMoveEventResponder(e) {

            px = cx;
            cx = e.x;
            py = cy;
            cy = e.y;

            if (ACTIVE_ACTION) return UPDATE_ACTION();

            const ele = comp_window.document.elementFromPoint(e.x, e.y);

            if (!ele || ISElementUI(ele))
                return;

            if (ele !== prev) {
                prev = ele;
            } else
                return;

            const comp = retrieveComponentFromElement(ele);
            editor_model.comp = comp;
            editor_model.ele = ele;
        }

        function globalScrollEventListener(e) {
            editor_model.sc++;
        }

        //document.addEventListener("pointermove", pointerExitElementEventResponder);
        comp_window.addEventListener("pointermove", pointerMoveEventResponder);
        comp_window.addEventListener("pointerup", pointerReleaseElementEventResponder);

        comp_window.document.addEventListener("scroll", globalScrollEventListener);
        comp_window.addEventListener("resize", globalScrollEventListener);

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

    return initFlame;

}());
