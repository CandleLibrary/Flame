'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var wick$1 = _interopDefault(require('wick'));
var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));

let CSS_Rule_Constructor = wick$1.core.css.prop;


let cache_de_cache = null;

function getApplicableRules(system, element, component) {
    return system.css.aquireCSS(element, component);
}

function getUniqueRule(system, element, component) {
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
        this.unique = null;
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
                unique_rule.addProp('position:relative;top:0px;left:0px');
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
        css_r = getApplicableRules(system, element, component);
        this.rules = mergeRules(css_r);
        this.cssflagsA = v;
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

function CacheFactory(system, element, component) {

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

CacheFactory.clear = function(element){
    
    if(element.flame_cache){
        element.flame_cache.destroy();
    }

    element.flame_cache = null;
};

function TEXTEDITOR(system, element, component, x, y){}



function TEXT(system, element, component, dx, dy) {
    let pos = event.cursor;
    let data = event.text_data;
    let text = system.html.aquireTextData(element);
    text.update(pos, data);
}

let types = wick$1.core.css.types;

function getContentBox(ele, win = window) {

    let rect = ele.getBoundingClientRect();
    let par_prop = win.getComputedStyle(ele);

    let border_l = parseFloat(par_prop.getPropertyValue("border-left"));
    let border_r = parseFloat(par_prop.getPropertyValue("border-right"));
    let border_t = parseFloat(par_prop.getPropertyValue("border-top"));
    let border_b = parseFloat(par_prop.getPropertyValue("border-bottom"));

    let top = rect.top + border_t;
    let left = rect.left + border_l;
    let width = rect.width - border_l - border_r;
    let height = rect.height - border_t - border_b;

    return { top, left, width, height };
}

function getFirstPositionedAncestor(ele) {
    let element = null;

    while (ele.parentElement) {
        ele = ele.parentElement;
        let pos = window.getComputedStyle(ele).getPropertyValue("position");

        if (pos && pos !== "sticky" && pos !== "static") {
            break;
        }
    }

    return ele;
}

function setNumericalValue(propname, system, element, component, value, relative_type = 0) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.settings.KEEP_UNIQUE;
    let props = css.props;
    let prop = props[propname] || cache.unique.r.props[propname];
    let css_name = propname.replace(/_/g, "-");

    if (!prop) {
        let type = (system.project.settings.default_unit || "px");
        let value = (type == "%") ? new types.percentage(0) : new types.length(0, type);

        cache.unique.addProp(`${css_name}:${value}`);
        props = cache.unique.r.props;
        prop = props[propname];
    } else if (KEEP_UNIQUE && !cache.unique.r.props[propname]) {

        let type = (system.project.settings.default_unit || "px");
        let value = (type == "%") ? new types.percentage(0) : new types.length(0, type);

        cache.unique.addProp(`${css_name}:${value}`);
        props = cache.unique.r.props;
        prop = props[propname];
    }


    if (prop == "auto") {
        //convert to numerical form;
        props[propname] = new types.length(value, "px");
    } else if (prop instanceof types.percentage) {
        //get the nearest positioned ancestor

        let denominator = 0, ele;

        switch(relative_type){
            case setNumericalValue.parent_width :
                ele = element.parentElement; //getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window).width;
            break;
            case setNumericalValue.parent_height :
                ele = element.parentElement; //getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window).height;
            break;
            case setNumericalValue.positioned_ancestor_width :
                ele = getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window).width;
            break;
            case setNumericalValue.positioned_ancestor_height :
                ele = getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window).height;
            break;
            case setNumericalValue.height :
                denominator = getContentBox(element, component.window).width;
            break;
            case setNumericalValue.width :
                denominator = getContentBox(element, component.window).width;
            break;
        }

        let np = value / denominator;
        
        props[propname] = prop.copy(np * 100);
    } else {
        props[propname] = prop.copy(value);
    }
}

setNumericalValue.parent_width = 0;
setNumericalValue.parent_height = 1;
setNumericalValue.positioned_ancestor_width = 2;
setNumericalValue.positioned_ancestor_height = 3;
setNumericalValue.height = 4;
setNumericalValue.width = 5;



function getRatio(system, element, component, funct, original_value, delta_value, css_name) {
    let ratio = 0;
    funct(system, element, component, original_value + delta_value);
    let end_x = parseFloat(component.window.getComputedStyle(element)[css_name]);
    let diff_x = end_x - original_value;
    if (Math.abs(diff_x - delta_value) > 0.0005 && delta_value !== 0) {        
        ratio = (diff_x / delta_value);
        let diff = delta_value / ratio;
        if (diff !== 0) {
            funct(system, element, component, original_value + diff, true);
        }
    }
    return ratio;
}

function setValue(system, element, component, value_name, value){
    let cache = CacheFactory(system, element, component);
    let props = cache.rules.props;

    if(props[value_name]){
        props[value_name] = value;
    }else{
        cache.unique.addProp(`${value_name.replace(/\_/g,"-")}:${value}`);
    }
}

function SETWIDTH(system, element, component, x, LINKED = false) {
    setNumericalValue("width", system, element, component, x, setNumericalValue.parent_width);
    if (!LINKED) element.wick_node.setRebuild();
}

function SETHEIGHT(system, element, component, x, LINKED = false) {
    setNumericalValue("height", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}

function SETDELTAWIDTH(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).width);

    if (ratio > 0)
        SETWIDTH(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETWIDTH, start_x, dx, "width");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETDELTAHEIGHT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).height);
    
    if (ratio > 0)
        SETHEIGHT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETHEIGHT, start_x, dx, "height");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

const types$1 = wick$1.core.css.types;

function SETLEFT(system, element, component, x, LINKED = false, type = "") {
    let cache = CacheFactory(system, element, component);

    if (x.type) {
        cache.rules.props.left = x;
    } else {
        if (cache.cssflagsA & 1)
            setNumericalValue("left", system, element, component, x, setNumericalValue.parent_width);
        else
            setNumericalValue("left", system, element, component, x, setNumericalValue.positioned_ancestor_width);
    }

    if (!LINKED) element.wick_node.setRebuild();
}

function SETTOP(system, element, component, x, LINKED = false) {
    let cache = CacheFactory(system, element, component);

    if (x.type) {
        cache.rules.props.top = x;
    } else {
        if (cache.cssflagsA & 1)
            setNumericalValue("top", system, element, component, x, setNumericalValue.parent_height);
        else
            setNumericalValue("top", system, element, component, x, setNumericalValue.positioned_ancestor_height);
    }

    if (!LINKED) element.wick_node.setRebuild();
}
function SETRIGHT(system, element, component, x, LINKED = false) {
    let cache = CacheFactory(system, element, component);

    if (cache.cssflagsA & 1)
        setNumericalValue("right", system, element, component, x, setNumericalValue.parent_width);
    else
        setNumericalValue("right", system, element, component, x, setNumericalValue.positioned_ancestor_width);

    if (!LINKED) element.wick_node.setRebuild();
}

function SETBOTTOM(system, element, component, x, LINKED = false) {
    let cache = CacheFactory(system, element, component);

    if (cache.cssflagsA & 1)
        setNumericalValue("bottom", system, element, component, x, setNumericalValue.parent_height);
    else
        setNumericalValue("bottom", system, element, component, x, setNumericalValue.positioned_ancestor_height);

    if (!LINKED) element.wick_node.setRebuild();
}

function SETDELTALEFT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).left);

    if (ratio > 0)
        SETLEFT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETLEFT, start_x, dx, "left");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETDELTATOP(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).top);

    if (ratio > 0)
        SETTOP(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETTOP, start_x, dx, "top");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETDELTARIGHT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).right);

    if (ratio > 0)
        SETRIGHT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETRIGHT, start_x, dx, "right");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETDELTABOTTOM(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).bottom);

    if (ratio > 0)
        SETBOTTOM(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETBOTTOM, start_x, dx, "bottom");


    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function RESIZET(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.y += dy, component.height -= dy);
    let cache = CacheFactory(system, element, component);
    switch (cache.move_vert_type) {
        case "top bottom":
            SETDELTATOP(system, element, component, dy, 0, true);
        case "top":
            SETDELTATOP(system, element, component, dy, 0, true);
            SETDELTAHEIGHT(system, element, component, -dy, 0, true);
            break;
        case "bottom":
            SETDELTAHEIGHT(system, element, component, -dy, 0, true);
            break;
    }
    element.wick_node.setRebuild();
}

function RESIZER(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.width += dx);
    let cache = CacheFactory(system, element, component);
    switch (cache.move_hori_type) {
        case "left right":
            SETDELTARIGHT(system, element, component, -dx, 0, true);
            break;
        case "left":
            SETDELTAWIDTH(system, element, component, dx, 0, true);
            break;
        case "right":
            SETDELTARIGHT(system, element, component, -dx, 0, true);
            SETDELTAWIDTH(system, element, component, -dx, 0, true);
            break;
    }
    element.wick_node.setRebuild();
}

function RESIZEL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.x += dx, component.width -= dx);
    let cache = CacheFactory(system, element, component);
    switch (cache.move_hori_type) {
        case "left right":
            SETDELTALEFT(system, element, component, dx, 0, true);
            break;
        case "left":
            SETDELTALEFT(system, element, component, dx, 0, true);
            SETDELTAWIDTH(system, element, component, -dx, 0, true);
            break;
        case "right":
            SETDELTAWIDTH(system, element, component, -dx, 0, true);
            break;
    }
    element.wick_node.setRebuild();
}

function SUBRESIZEB(system, element, component, dx, dy, ratio){
    let cache = CacheFactory(system, element, component);
    switch (cache.move_vert_type) {
        case "top bottom":
            SETDELTABOTTOM(system, element, component, -dy, ratio * 0.5, true);
            SETDELTAHEIGHT(system, element, component, dy, ratio * 0.5, true);
            break;
        case "top":
            SETDELTAHEIGHT(system, element, component, dy, ratio, true);
            break;
        case "bottom":
            SETDELTABOTTOM(system, element, component, -dy, ratio * 0.5, true);
            SETDELTAHEIGHT(system, element, component, dy, ratio * 0.5, true);
            break;
    }

    element.wick_node.setRebuild();
    element.wick_node.rebuild();
}

function RESIZEB(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.height += dy);
    let cache = CacheFactory(system, element, component);
    //get the bottom value of the element;

    if (cache.valueB == 0) {
        let rect = element.getBoundingClientRect();
        let bottom = rect.y + rect.height;
        SUBRESIZEB(system, element, component, dx, dy, 1);
        rect = element.getBoundingClientRect();
        let bottom2 = rect.y + rect.height;
        if (bottom2 - bottom !== dy) {
            let ratio = ((bottom2 - bottom) / dy);
            let diff = dy / ratio;
            if (diff !== 0) {
                SUBRESIZEB(system, element, component, dx, -diff, ratio);
                cache.valueB = ratio;
            }
        }
    } else
        SUBRESIZEB(system, element, component, dx, dy, cache.valueB);
}

function RESIZETL(system, element, component, dx, dy, IS_COMPONENT) {
    RESIZEL(system, element, component, dx, dy, IS_COMPONENT);
    RESIZET(system, element, component, dx, dy, IS_COMPONENT);
    if (IS_COMPONENT) return;
    element.wick_node.setRebuild();
}

function RESIZETR(system, element, component, dx, dy, IS_COMPONENT) {
    RESIZER(system, element, component, dx, dy, IS_COMPONENT);
    RESIZET(system, element, component, dx, dy, IS_COMPONENT);
    if (IS_COMPONENT) return;
    element.wick_node.setRebuild();
}

function RESIZEBL(system, element, component, dx, dy, IS_COMPONENT) {
    RESIZEL(system, element, component, dx, dy, IS_COMPONENT);
    RESIZEB(system, element, component, dx, dy, IS_COMPONENT);
    if (IS_COMPONENT) return;
    element.wick_node.setRebuild();
}

function RESIZEBR(system, element, component, dx, dy, IS_COMPONENT) {
    RESIZER(system, element, component, dx, dy, IS_COMPONENT);
    RESIZEB(system, element, component, dx, dy, IS_COMPONENT);
    if (IS_COMPONENT) return;
    element.wick_node.setRebuild();
}

/**
 * Actions provide mechanisms for updating an element, document, and component through user input. 
 */
function MOVE(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) {
        component.x += dx;
        component.y += dy;
    } else {

        // Get CSS information on element and update appropriate records
        let cache = CacheFactory(system, element, component);

        let css = cache.rules;

        if (css.props.position && css.props.position !== "static") {
            switch (cache.move_hori_type) {
                case "left right margin":
                    //in cases of absolute
                    cache.valueB = SETDELTARIGHT(system, element, component, -dx, cache.valueB);
                    cache.valueA = SETDELTALEFT(system, element, component, dx, cache.valueA);
                    break;
                case "left right":
                    cache.valueB = SETDELTARIGHT(system, element, component, -dx, cache.valueB);
                case "left":
                    cache.valueA = SETDELTALEFT(system, element, component, dx, cache.valueA);
                    break;
                case "right":
                    cache.valueB = SETDELTARIGHT(system, element, component, -dx, cache.valueB);
                    break;
            }

            switch (cache.move_vert_type) {
                case "top bottom":
                    cache.valueC = SETDELTABOTTOM(system, element, component, -dy, cache.valueC);
                case "top":
                    cache.valueD = SETDELTATOP(system, element, component, dy, cache.valueD);
                    break;
                case "bottom":
                    cache.valueC = SETDELTABOTTOM(system, element, component, -dy, cache.valueC);
                    break;
            }
        }

        element.wick_node.setRebuild();
        element.wick_node.rebuild();
    }
}

function CENTER(system, element, component, HORIZONTAL = true, VERTICAL = true) {
    // Get CSS information on element and update appropriate records
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;

    let ancestor = getFirstPositionedAncestor(element);

    let ancestor_box = ancestor.getBoundingClientRect();

    let own_box = element.getBoundingClientRect();

    let w = own_box.width;
    let diff = (ancestor_box.width - w) / 2;

    switch (cache.move_hori_type) {
        case "left right":
            //get the width of the parent element
            css.props.left = new wick$1.core.css.types.length(diff, "px");
            css.props.right = new wick$1.core.css.types.length(diff, "px");
            cache.unique.addProp(`margin-left:auto; margin-right:auto`);
            break;
        case "left":
            cache.unique.addProp(`margin-left:auto; margin-right:auto;left:0px;right:0px`);
            break;
        case "right":
            break;
        case "margin-left":
            break;
        case "margin-left margin-right":
            break;
        case "margin":
            break;
    }

    /*
    switch (cache.move_vert_type) {
        case "top bottom":
            cache.valueC = setBottom(element, -dy, css, cache.valueC);
        case "top":
            cache.valueD = setDeltaTop(element, dy, css, cache.valueD);
            break;
        case "bottom":
            cache.valueC = setBottom(element, -dy, css, cache.valueC);
            break;
    }
    */

    element.wick_node.setRebuild();
}

function COMPLETE(system, element, component) {
	
	//Diff changed documents, clear caches, close opened dialogs if necessary
	if(element)
		CacheFactory.clear(element);

	system.doc_man.seal();
}

const wick$2 = require("wick");

/**
 * This module is responsible for storing, updating, and caching compents. 
 * In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
 * Any associated stylesheets are managed through this componnent. 
 */
class Component {

    constructor(system) {
        //frame for fancy styling
        this.style_frame = document.createElement("div");
        this.style_frame.classList.add("flame_component");
        this.style_frame.classList.add("style_frame");

        this.dimensions = document.createElement("div");
        this.dimensions.classList.add("flame_component_dimensions");

        this.iframe = document.createElement("iframe");
        this.iframe.src = "component_frame.html";

        this.width = system.project.flame_data.default.component.width;
        this.height = system.project.flame_data.default.component.height;

        this.iframe.onload = (e) => {
            this.mountListeners();
            e.target.contentDocument.body.appendChild(this.data);
            e.target.contentWindow.wick = wick$2;
            this.window = e.target.contentWindow;
        };

        //Label
        this.name = document.createElement("div");
        this.name.innerHTML = "unnamed";
        this.name.classList.add("flame_component_name");


        //HTML Data
        this.data = document.createElement("div");

        this.style_frame.appendChild(this.dimensions);
        this.style_frame.appendChild(this.name);
        this.style_frame.appendChild(this.iframe);

        //Flag for mounted state of component. If a component is accessible anywhere on the main UI, then it is considered mounted. 
        this.mounted = false;

        //Links to local CSS scripts
        this.local_css = [];

        //The file path (relative to project directory), of the component file. 
        this.file_path = "";

        //The file name of the component. 
        this.file_name = "";

        //The source component manager that handles the instantiation and runtime of Wick components. 
        this.manager = null;

        this.system = system;

        this.action = null;
    }

    mountListeners(){
        this.system.ui.integrateIframe(this.iframe, this);
    }

    get element() {
        return this.style_frame;
    }

    addStyle(style, INLINE = false) {
        if (!INLINE) {
            this.local_css.splice(this.css_split, 0, style);
            this.css_split++;
        } else {
            this.local_css.push(style);
        }
    }

    cache() {

    }

    destroy() {
        this.element = null;
    }

    /**
     * @brief Saves file to project directory. 
     * @details [long description]
     */
    saveFile() {

    }

    /**
     * Caches a bitmap image of the component.
     */
    cacheBitmap() {

    }

    load(document) {
        this.name.innerHTML = document.name;
        document.bind(this);
    }

    documentReady(pkg) {

        let css = pkg._skeletons_[0].tree.css;
        
        if (css)
            css.forEach(css => {
                this.local_css.push(css);
            });
        this.manager = pkg.mount(this.data, null, false, this);

    }

    _upImport_(){

    }

    /**
     * Mounts the element to the document. 
     */
    mount() {}

    /**
     * Determines if point is in bounding box. 
     */
    pointInBoundingBox(x, y) {
        this.updateDimensions();
        let min_x = this.dimensions.left;
        let max_x = min_x + this.dimensions.width;
        let min_y = this.dimensions.top;
        let max_y = min_y + this.dimensions.height;
        return x >= min_x && x <= max_x && y >= min_y && y <= max_y;
    }

    set x(x) {
        this.element.style.left = x + "px";
    }

    set y(y) {
        this.element.style.top = y + "px";

    }

    set width(w) {
        this.iframe.width = w;
        this.dimensions.innerHTML = `${Math.round(this.width)}px ${Math.round(this.height)}px`;
    }

    set height(h) {
        this.iframe.height = h;
        this.dimensions.innerHTML = `${Math.round(this.width)}px ${Math.round(this.height)}px`;
    }

    get x() {
        return parseFloat(this.element.style.left);
    }

    get y() {
        return parseFloat(this.element.style.top);
    }

    get width() {
        return parseFloat(this.iframe.width);
    }

    get height() {
        return parseFloat(this.iframe.height);
    }

    get target() {
        return this.element;
    }
}

function CREATE_COMPONENT(system, doc, event) {

    let component = new Component(system);

    component.load(doc);

    let element = component.element;

    document.querySelector("#main_view").appendChild(element);

    component.x = event.x;
    component.y = event.y;
}

function CREATE_CSS_DOC(system, doc, event) {
    let comp = system.css.createComponent(doc);

    let element = comp.element;

    //document.querySelector("#main_view").appendChild(element);

    comp.x = -event.x;
    comp.y = -event.y;
}

let types$2 = wick$1.core.css.types;

//set background color
function SETBACKGROUNDCOLOR(system, element, component, r, g, b, a = 1){
	let color = new types$2.color(r,g,b,a);
	setValue(system, element, component, "background_color", color);
	element.wick_node.setRebuild();
}
//set background image
//set font color
function SETCOLOR(system, element, component, r, g, b, a = 1){
	let color = new types$2.color(r,g,b,a);
	setValue(system, element, component, "color", color);
	element.wick_node.setRebuild();
}
//set font image

function UNDO(system){
	system.doc_man.stepBack();
}

function REDO(system){
	system.doc_man.stepForward();
}

function resetPadding(system, element, component) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    if (css.props.padding) {
        let val = css.props.padding;

        if (!Array.isArray(val)) {
            cache.unique.addProp(`
                padding-top:${val};
                padding-right:${val};
                padding-bottom:${val};
                padding-left:${val};
            `);
        } else {
            switch (val.length) {
                case 2:
                    cache.unique.addProp(`
                        padding-top:${val[0]};
                        padding-right:${val[1]};
                        padding-bottom:${val[0]};
                        padding-left:${val[1]};
                    `);
                    break;
                case 3:
                    cache.unique.addProp(`
                        padding-top:${val[0]};
                        padding-right:${val[2]};
                        padding-bottom:${val[1]};
                        padding-left:${val[2]};
                    `);
                    break;
                case 4:
                    cache.unique.addProp(`
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

function SETPADDINGLEFT(system, element, component, x, LINKED = false) {
    resetPadding(system, element, component);
    setNumericalValue("padding_left", system, element, component, x, setNumericalValue.parent_width);
    if (!LINKED) element.wick_node.setRebuild();
}

function SETDELTAPADDINGLEFT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["padding-left"]);

    if (ratio > 0)
        SETPADDINGLEFT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETPADDINGLEFT, start_x, dx, "padding-left");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETPADDINGTOP(system, element, component, x, LINKED = false) {
    resetPadding(system, element, component);
    setNumericalValue("padding_top", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}

function SETDELTAPADDINGTOP(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["padding-top"]);

    if (ratio > 0)
        SETPADDINGTOP(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETPADDINGTOP, start_x, dx, "padding-top");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETPADDINGRIGHT(system, element, component, x, LINKED = false) {
    resetPadding(system, element, component);
    setNumericalValue("padding_right", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}


function SETDELTAPADDINGRIGHT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["padding-right"]);

    if (ratio > 0)
        SETPADDINGRIGHT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETPADDINGRIGHT, start_x, dx, "padding-right");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETPADDINGBOTTOM(system, element, component, x, LINKED = false) {
    resetPadding(system, element, component);
    setNumericalValue("padding_bottom", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}


function SETDELTAPADDINGBOTTOM(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["padding-bottom"]);

    if (ratio > 0)
        SETPADDINGBOTTOM(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETPADDINGBOTTOM, start_x, dx, "padding-bottom");

    SETDELTAHEIGHT(system, element, component, -dx, true);

    if (!LINKED) element.wick_node.setRebuild();
    
    return ratio;
}

function RESIZEPADDINGT(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEPADDINGR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGRIGHT(system, element, component, -dx, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEPADDINGL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGLEFT(system, element, component, dx, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEPADDINGB(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGBOTTOM(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEPADDINGTL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGLEFT(system, element, component, dx, 0, true);
    SETDELTAPADDINGTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEPADDINGTR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGRIGHT(system, element, component, -dx, 0, true);
    SETDELTAPADDINGTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEPADDINGBL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGLEFT(system, element, component, dx, 0, true);
    SETDELTAPADDINGBOTTOM(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEPADDINGBR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGRIGHT(system, element, component, -dx, 0, true);
    SETDELTAPADDINGBOTTOM(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
}

function resetMargin(system, element, component) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    if (css.props.margin) {
        //Convert margin value into 
        css.props.margin = null;
    }
}

function SETMARGINLEFT(system, element, component, x, LINKED = false) {
    resetMargin(system, element, component);
    setNumericalValue("margin_left", system, element, component, x, setNumericalValue.parent_width);
    if (!LINKED) element.wick_node.setRebuild();
}

function SETDELTAMARGINLEFT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["margin-left"]);

    if (ratio > 0)
        SETMARGINLEFT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETMARGINLEFT, start_x, dx, "margin-left");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETMARGINTOP(system, element, component, x, LINKED = false) {
    resetMargin(system, element, component);
    setNumericalValue("margin_top", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}

function SETDELTAMARGINTOP(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["margin-top"]);

    if (ratio > 0)
        SETMARGINTOP(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETMARGINTOP, start_x, dx, "margin-top");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETMARGINRIGHT(system, element, component, x, LINKED = false) {
    resetMargin(system, element, component);
    setNumericalValue("margin_right", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}


function SETDELTAMARGINRIGHT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["margin-right"]);

    if (ratio > 0)
        SETMARGINRIGHT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETMARGINRIGHT, start_x, dx, "margin-right");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETMARGINBOTTOM(system, element, component, x, LINKED = false) {
    resetMargin(system, element, component);
    setNumericalValue("margin_bottom", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}


function SETDELTAMARGINBOTTOM(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["margin-bottom"]);

    if (ratio > 0)
        SETMARGINBOTTOM(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETMARGINBOTTOM, start_x, dx, "margin-bottom");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function RESIZEMARGINT(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEMARGINR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINRIGHT(system, element, component, -dx, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEMARGINL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINLEFT(system, element, component, dx, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEMARGINB(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINBOTTOM(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEMARGINTL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    let cache = CacheFactory(system, element, component);

    if((cache.cssflagsA & 1)){
        SETDELTALEFT(system, element, component, dx, 0, true);
        SETDELTATOP(system, element, component, dy, 0, true);
    }

    SETDELTAMARGINLEFT(system, element, component, -dx, 0, true);
    SETDELTAMARGINTOP(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEMARGINTR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    console.log({dx,dy});
    SETDELTAMARGINRIGHT(system, element, component, dx, 0, true);
    SETDELTAMARGINTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEMARGINBL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINLEFT(system, element, component, dx, 0, true);
    SETDELTAMARGINBOTTOM(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEMARGINBR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINRIGHT(system, element, component, dx, 0, true);
    SETDELTAMARGINBOTTOM(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function CLEARLEFT(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.settings.KEEP_UNIQUE;
    if (css.props.left) {
        if (KEEP_UNIQUE) cache.unique.addProp(`left:auto`);
        else css.props.left = "auto";
    }
    if (!LINKED) element.wick_node.setRebuild();
}
//clear top
function CLEARTOP(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.settings.KEEP_UNIQUE;
    if (css.props.top) {
        if (KEEP_UNIQUE) cache.unique.addProp(`top:auto`);
        else css.props.top = "auto";
    }
    if (!LINKED) element.wick_node.setRebuild();
}
//clear right
//clear bottom

//clear margin-top
function CLEARMARGINTOP(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.settings.KEEP_UNIQUE;
    if (css.props.margin_left) {
        if (KEEP_UNIQUE) cache.unique.addProp(`margin-left:0`);
        else css.props.margin_left = 0;
    }
    if (!LINKED) element.wick_node.setRebuild();
}
//clear margin-left
function CLEARMARGINLEFT(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.settings.KEEP_UNIQUE;
    if (css.props.margin_left) {
        if (KEEP_UNIQUE) cache.unique.addProp(`margin-left:0`);
        else css.props.margin_left = 0;
    }
    if (!LINKED) element.wick_node.setRebuild();
}
//clear margin-right
//clear margin-bottom
//clear padding-left
//clear padding-right
//clear padding-bottom
//clear padding-top
//clear border-left
//clear border-right
//clear border-bottom
//clear border-top

let types$3 = wick$1.core.css.types;
/**
 * Actions for converting position and layout to different forms. 
 */
function TOMARGINLEFT() {}
function TOMARGINRIGHT() {}
function TOMARGINLEFTRIGHT() {}
function TOLEFT() {}
function TORIGHT() {}
function TOLEFTRIGHT() {}
function TOTOP() {}
function TOTOPBOTTOM() {}

/**
 * @brief Convert position to absolute
 */
function TOPOSITIONABSOLUTE(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.settings.KEEP_UNIQUE;
    switch (css.props.position) {
        case "relative":
            /** 
                Need to take margin offset into account when converting to absolute
            */
            let rect = element.getBoundingClientRect();
            let par_prop = component.window.getComputedStyle(element);

            let x = rect.x;
            let y = rect.y - parseFloat(par_prop["margin-top"]);

            if (css.props.margin) {}

            CLEARMARGINTOP(system, element, component, true);
            CLEARMARGINLEFT(system, element, component, true);

            SETLEFT(system, element, component, x, true);
            SETTOP(system, element, component, y, true);

            break;
        case "absolute":
            /*no op*/
            break;
        case "fixed":
            //add parent offset values to current position to keep it predictably in place. 
            break;
        default:
            //Manually add required data
            break;
    }

    if (KEEP_UNIQUE) {
        if (cache.unique.rules.props.position) cache.unique.rules.props.position = "absolute";
        else cache.unique.addProp("position:absolute");
    } else {
        if (css.props.position) css.props.position = "absolute";
        else cache.unique.addProp("position:absolute");
    }

    if (!LINKED)
        element.wick_node.setRebuild();
}

/**
 * Convert position to relative
 */
function TOPOSITIONRELATIVE(system, element, component) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.settings.KEEP_UNIQUE;
    switch (css.props.position) {
        case "relative":
            /*no op*/
            break;
        case "absolute":

            let rect = element.getBoundingClientRect();
            let par_prop = component.window.getComputedStyle(element);

            let x = rect.x - parseFloat(par_prop["border-left-width"]) + 2;
            let y = rect.y;


            let sib = element.previousSibling;

            if (sib) {
                while (sib && (sib.style.position !== "relative" && sib.style.position !== ""))
                    sib = sib.previousSibling;
                if (sib) {
                    y -= sib.offsetTop + sib.offsetHeight;
                }
            }

            CLEARLEFT(system, element, component, true);
            CLEARTOP(system, element, component, true);
            SETMARGINLEFT(system, element, component, x, true);
            SETMARGINTOP(system, element, component, y, true);
            break;
        case "fixed":
            //add parent offset values to current position to keep it predictably in place. 
            break;
        default:
            //Manually add required data
            break;
    }

    if (KEEP_UNIQUE) {
        if (cache.unique.rules.props.position) cache.unique.rules.props.position = "relative";
        else cache.unique.addProp("position:relative");
    } else {
        if (css.props.position) css.props.position = "relative";
        else cache.unique.addProp("position:relative");
    }

    element.wick_node.setRebuild();
}


function CONVERT_TOP(system, element, component, type) {
    let cache = CacheFactory(system, element, component);
    let position = parseFloat(component.window.getComputedStyle(element).top);
    
    switch (type) {
        case "%":
            cache.rules.props.top = new types$3.percentage(1);
            break;
        case "em":
            cache.rules.props.top = new types$3.length(1, "em");
            break;
        case "vh":
            cache.rules.props.top = new types$3.length(1, "vh");
            break;
        case "vw":
            cache.rules.props.top = new types$3.length(1, "vw");
            break;
        case "vmin":
            cache.rules.props.top = new types$3.length(1, "vmin");
            break;
        case "vmax":
            cache.rules.props.top = new types$3.length(1, "vmax");
            break;
        default:
            cache.rules.props.top = new types$3.length(1, 'px');
            break;
    }
    SETTOP(system, element, component, position);

    element.wick_node.setRebuild();
}

function CONVERT_LEFT(system, element, component, type) {
    let cache = CacheFactory(system, element, component);
    let position = parseFloat(component.window.getComputedStyle(element).left);

    switch (type) {
        case "%":
            cache.rules.props.left = new types$3.percentage(1);
            break;
        case "em":
            cache.rules.props.left = new types$3.length(1, "em");
            break;
        case "vh":
            cache.rules.props.left = new types$3.length(1, "vh");
            break;
        case "vw":
            cache.rules.props.left = new types$3.length(1, "vw");
            break;
        case "vmin":
            cache.rules.props.left = new types$3.length(1, "vmin");
            break;
        case "vmax":
            cache.rules.props.left = new types$3.length(1, "vmax");
            break;
        default:
            cache.rules.props.left = new types$3.length(1, 'px');
            break;
    }
    SETLEFT(system, element, component, position);

    element.wick_node.setRebuild();
}

//Converting from unit types
//left
function LEFTTOPX() {}
function LEFTTOEM() {}
function LEFTTOPERCENTAGE() {}
function LEFTTOVH() {}
function LEFTTOVW() {}
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


function TOPOSITIONFIXED() {}
function TOPOSITIONSTICKY() { /* NO OP */ }
function TOGGLE_UNIT(system, element, component, horizontal, vertical) {
    // Get CSS information on element and update appropriate records
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let rect = getFirstPositionedAncestor(element).getBoundingClientRect();
    if (horizontal) {
        switch (cache.move_hori_type) {
            case "left right":
            case "left right margin":
                if (css.props.right instanceof types$3.length) {
                    css.props.right = new types$3.percentage((css.props.right / rect.width) * 100);
                } else {
                    css.props.right = new types$3.length(rect.width * (css.props.right / 100), "px");
                } /** Intentional fall through **/
            case "left":
                if (css.props.left instanceof types$3.length) {
                    css.props.left = new types$3.percentage((css.props.left / rect.width) * 100);
                } else {
                    css.props.left = new types$3.length(rect.width * (css.props.left / 100), "px");
                }
                break;
            case "right":
                if (css.props.right instanceof types$3.length) {
                    css.props.right = new types$3.percentage((css.props.right / rect.width) * 100);
                } else {
                    css.props.right = new types$3.length(rect.width * (css.props.right / 100), "px");
                }
                break;
        }
    }
    element.wick_node.setRebuild();
}

let types$4 = wick$1.core.css.types;

function resetBorder(system, element, component) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    if (css.props.border) {
        //Convert border value into 
        css.props.border = null;
    }
}

function SETBORDERLEFT(system, element, component, x, LINKED = false) {
    resetBorder(system, element, component);
    setNumericalValue("border_left_width", system, element, component, x, setNumericalValue.parent_width);
    if (!LINKED) element.wick_node.setRebuild();
}

function SETDELTABORDERLEFT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["border-left-width"]);

    if (ratio > 0)
        SETBORDERLEFT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETBORDERLEFT, start_x, dx, "border-left-width");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETBORDERTOP(system, element, component, x, LINKED = false) {
    resetBorder(system, element, component);
    setNumericalValue("border_top_width", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}

function SETDELTABORDERTOP(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["border-top-width"]);

    if (ratio > 0)
        SETBORDERTOP(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETBORDERTOP, start_x, dx, "border-top-width");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETBORDERRIGHT(system, element, component, x, LINKED = false) {
    resetBorder(system, element, component);
    setNumericalValue("border_right_width", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}


function SETDELTABORDERRIGHT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["border-right-width"]);

    if (ratio > 0)
        SETBORDERRIGHT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETBORDERRIGHT, start_x, dx, "border-right-width");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETBORDERBOTTOM(system, element, component, x, LINKED = false) {
    resetBorder(system, element, component);
    setNumericalValue("border_bottom_width", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}


function SETDELTABORDERBOTTOM(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["border-bottom-width"]);

    if (ratio > 0)
        SETBORDERBOTTOM(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETBORDERBOTTOM, start_x, dx, "border-bottom-width");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function RESIZEBORDERT(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEBORDERR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERRIGHT(system, element, component, -dx, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEBORDERL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERLEFT(system, element, component, dx, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEBORDERB(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERBOTTOM(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEBORDERTL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    let cache = CacheFactory(system, element, component);

    if((cache.cssflagsA & 1)){
        SETDELTALEFT(system, element, component, dx, 0, true);
        SETDELTATOP(system, element, component, dy, 0, true);
    }

    SETDELTABORDERLEFT(system, element, component, -dx, 0, true);
    SETDELTABORDERTOP(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEBORDERTR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERRIGHT(system, element, component, dx, 0, true);
    SETDELTABORDERTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEBORDERBL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERLEFT(system, element, component, dx, 0, true);
    SETDELTABORDERBOTTOM(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEBORDERBR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERRIGHT(system, element, component, dx, 0, true);
    SETDELTABORDERBOTTOM(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function BORDERRADIUSTL(system, element, component, d){
    setValue(system, element, component, "border_top_left_radius", new types$4.length(d, "px"));
    element.wick_node.setRebuild();
}

function BORDERRADIUSTR(system, element, component, d){
    setValue(system, element, component, "border_top_right_radius", new types$4.length(d, "px"));
    element.wick_node.setRebuild();
}

function BORDERRADIUSBL(system, element, component, d){
    setValue(system, element, component, "border_bottom_left_radius", new types$4.length(d, "px"));
    element.wick_node.setRebuild();
}

function BORDERRADIUSBR(system, element, component, d){
    setValue(system, element, component, "border_bottom_right_radius", new types$4.length(d, "px"));
    element.wick_node.setRebuild();
}

const actions = {
    CacheFactory,
    COMPLETE,
    TEXTEDITOR,
    MOVE,
    CENTER,
    CREATE_COMPONENT,
    CREATE_CSS_DOC,
    TOMARGINLEFT,
    TOMARGINRIGHT,
    TOMARGINLEFTRIGHT,
    TOLEFT,
    TORIGHT,
    TOLEFTRIGHT,
    TOTOP,
    TOTOPBOTTOM,
    TOGGLE_UNIT,
    TOPOSITIONABSOLUTE,
    TOPOSITIONRELATIVE,
    TOPOSITIONFIXED,
    TOPOSITIONSTICKY,
    //position
    SETLEFT,
    SETDELTALEFT,
    SETTOP,
    SETDELTATOP,
    SETRIGHT,
    SETDELTARIGHT,
    SETBOTTOM,
    SETDELTABOTTOM,
    RESIZETL,
    RESIZETR,
    RESIZEBL,
    RESIZEBR,
    RESIZET,
    RESIZER,
    RESIZEL,
    RESIZEB,
    //Border
    //Margin
    SETMARGINLEFT,
    SETDELTAMARGINLEFT,
    SETMARGINTOP,
    SETDELTAMARGINTOP,
    SETMARGINRIGHT,
    SETDELTAMARGINRIGHT,
    SETMARGINBOTTOM,
    SETDELTAMARGINBOTTOM,
    RESIZEMARGINTL,
    RESIZEMARGINTR,
    RESIZEMARGINBL,
    RESIZEMARGINBR,
    RESIZEMARGINT,
    RESIZEMARGINR,
    RESIZEMARGINL,
    RESIZEMARGINB,
    //Padding
    SETPADDINGLEFT,
    SETDELTAPADDINGLEFT,
    SETPADDINGTOP,
    SETDELTAPADDINGTOP,
    SETPADDINGRIGHT,
    SETDELTAPADDINGRIGHT,
    SETPADDINGBOTTOM,
    SETDELTAPADDINGBOTTOM,
    RESIZEPADDINGTL,
    RESIZEPADDINGTR,
    RESIZEPADDINGBL,
    RESIZEPADDINGBR,
    RESIZEPADDINGT,
    RESIZEPADDINGR,
    RESIZEPADDINGL,
    RESIZEPADDINGB,
    //Border
    SETBORDERLEFT,
    SETDELTABORDERLEFT,
    SETBORDERTOP,
    SETDELTABORDERTOP,
    SETBORDERRIGHT,
    SETDELTABORDERRIGHT,
    SETBORDERBOTTOM,
    SETDELTABORDERBOTTOM,
    RESIZEBORDERT,
    RESIZEBORDERR,
    RESIZEBORDERL,
    RESIZEBORDERB,
    RESIZEBORDERTL,
    RESIZEBORDERTR,
    RESIZEBORDERBL,
    RESIZEBORDERBR,
    BORDERRADIUSTL,
    BORDERRADIUSTR,
    BORDERRADIUSBL,
    BORDERRADIUSBR,
    //color
    SETBACKGROUNDCOLOR,
    SETCOLOR,
    //convert
    CONVERT_LEFT,
    CONVERT_TOP,
    //History
    UNDO,
    REDO
};

const wick$3 = require("wick");
/**
 * This module is responsible for storing, updating, and caching compents. 
 * In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
 * Any associated stylesheets are managed through this componnent. 
 */
class UIComponent extends Component {

    constructor(system, name) {

        super(system);

        //frame for fancy styling
        this.iframe.classList.add("flame_ui_component");

        this.pkg = null;

        this.name = name;

        this.system = system;

        this.width = 180;
        this.height =300;


        this.icon = null;
    }
    mountListeners(){};

    documentReady(pkg) {
        this.mgr = pkg.mount(this.data, this.system.project.flame_data);
        
        let src = this.mgr.sources[0].ast;
        
        if (src._statics_.menu) {
            switch (src._statics_.menu) {
                case "main":
                    this.system.ui.addToMenu("main", this.name, this.mgr.sources[0].badges.icon, this);
                    break;
            }
        }

        let css = pkg._skeletons_[0].tree.css;
        if (css)
            css.forEach(css => {
                this.local_css.push(css);
            });

        this.mgr._upImport_ = (prop_name, data, meta) => {
            this.system.ui.mountComponent(this);
        };
    }

    set(data) {
        this.mgr._update_({
            target: data
        });
    }

    load(doc) {
        doc.bind(this);
    }

    mount(element) {
        element.appendChild(this.element);
    }

    unmount() {};
}

class LineBox {
    get l() {
        return this.rect.x + this.component.x + 4;
    }

    get t() {
        return this.rect.y + this.component.y + 4;
    }

    get b() {
        return this.rect.y + this.rect.height + this.component.y + 4;
    }

    get r() {
        return this.rect.x + this.rect.width + this.component.x + 4;
    }
}

class ElementLineBox extends LineBox {
    constructor(element, component) {
        super();
        this.rect = element.getBoundingClientRect();
        this.component = component;
    }
}

class ComponentLineBox extends LineBox {
    constructor(component) {
    	super();
        this.component = component;
    }

    get l() {
        return this.component.x;
    }

    get t() {
        return this.component.y;
    }

    get b() {
        return this.component.height + this.component.y;
    }

    get r() {
        return this.component.width + this.component.x;
    }
}



function CreateBoxes(ele, c, LineMachine, target) {

    LineMachine.boxes.push(new ElementLineBox(ele, c));

    let children = ele.children;
    for (let i = 0; i < children.length; i++) {
        if (target == children[i]) continue;
        CreateBoxes(children[i], c, LineMachine, target);
    }
}

function CreateComponentBoxes(c, LineMachine, target) {
    if (c == target) return;
    LineMachine.boxes.push(new ComponentLineBox(c));
}

class LineMachine {
    constructor() {
        this.boxes = [];
        this.tolerance = 10;

        this.activex = { id: -1, ot: 0, tt: 0 };
        this.activey = { id: -1, ot: 0, tt: 0 };
    }

    setPotentialBoxes(element, component, components) {
        this.boxes.length = 0;

        if (!element) {
            components.forEach(c => CreateComponentBoxes(c, this, component));
        } else {
            //get tree from component and create boxes from all elements inside the component. 
            let tree = component.window.document.body;

            let ele = tree;

            CreateBoxes(ele, component, this, element);
        }

    }

    getSuggestedLine(box, dx, dy) {

        if (!box) return { dx, dy };

        let mx = this.tolerance;
        let my = this.tolerance;
        let x_set = false;
        let y_set = false;
        const l = box.l;
        const r = box.r;

        const LO = (l - r == 0);

        const t = box.t;
        const b = box.b;
        const ch = (l + r) / 2;
        const cv = (t + b) / 2;
        const tol = this.tolerance;


        for (let i = 0; i < this.boxes.length; i++) {
            let box = this.boxes[i];

            //Make sure the ranges overlap

            //Vertical
            if (!x_set && l <= (box.r + tol + 1) && r >= (box.l - tol - 1)) {
                //There is overlap; find the best alignment
                let c = (box.l + box.r) * 0.5;
                let tol = Math.abs(mx);
                let array = [
                    //left
                    l - box.l, l - box.r, l - c,
                    //right
                    r - box.l, r - box.r, r - c,
                    //center
                    ch - box.l, ch - box.r, ch - c
                ];

                let length = LO ? 3 : 9;

                for (let j = 0; j < length; j++)
                    if (Math.abs(array[j]) < tol) {
                        mx = array[j];
                        this.activex.id = i;
                        this.activex.tt = (j % 3);
                        this.activex.ot = (j / 3) | 0;
                        //x_set = true;
                        //break;
                    }
            }

            //Horizontal
            if (!y_set && t < (box.b + tol + 1) && b > (box.t - tol - 1)) {
                //There is overlap; find the best alignment
                let c = (box.t + box.b) * 0.5;
                let tol = Math.abs(my);
                let array = [
                    /*top*/
                    t - box.t, t - box.b, t - c,
                    /*bottom*/
                    b - box.t, b - box.b, b - c,
                    /*center*/
                    cv - box.t, cv - box.b, cv - c
                ];
                for (let j = 0; j < 9; j++)
                    if (Math.abs(array[j]) < tol) {
                        my = array[j];
                        this.activey.id = i;
                        this.activey.tt = (j % 3);
                        this.activey.ot = (j / 3) | 0;
                        //y_set = true;
                        break;
                    }
            }

            if (x_set && y_set) break;
        }

        if (Math.abs(mx) < tol && Math.abs(dx) < tol)
            dx = mx;
        else
            this.activex.id = -1;

        if (Math.abs(my) < tol && Math.abs(dy) < tol)
            dy = my;
        else
            this.activey.id = -1;

        return { dx, dy };
    }

    render(ctx, transform, boxc) {

        if (!boxc || this.boxes.length == 0) return;

        ctx.save();
        transform.setCTX(ctx);

        if (this.activex.id > -1) {
            //0 = l, 1 = r, 2 = c 
            ctx.strokeStyle = "red";
            let box = this.boxes[this.activex.id];
            let x = [box.l, box.r, (box.r + box.l) / 2][this.activex.tt];
            let y1 = [box.t, box.t, (box.t + box.b) / 2][this.activex.tt];
            let y2 = [boxc.t, boxc.t, (boxc.t + boxc.b) / 2][this.activex.ot];
            ctx.beginPath();
            ctx.moveTo(x, y1);
            ctx.lineTo(x, y2);
            ctx.stroke();
        }

        if (this.activey.id > -1) {
            //0 = t, 1 = b, 2 = c 
            ctx.strokeStyle = "green";
            let box = this.boxes[this.activey.id];
            let y = [box.t, box.b, (box.t + box.b) / 2][this.activey.tt];
            let x1 = [box.l, box.l, (box.r + box.l) / 2][this.activey.tt];
            let x2 = [boxc.l, boxc.l, (boxc.r + boxc.l) / 2][this.activey.ot];
            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.stroke();
        }

        ctx.restore();
    }
}

const paper = require("paper");
const Point = paper.Point;
const Size = paper.Size;
const Path = paper.Path;

/**
 * @brief Provides interface tools for manipulating SVG elements
 */
class SVGManager {
    constructor(system) {
        this.system = system;

        this.target = null;

        this.canvas = document.createElement("canvas");
        this.canvas.style.position = "absolute";
        paper.setup(this.canvas);
        this.proj = paper.project;
        let point = new Point(0, 0);

        this.selection = null;

        let dx = 0;
        let dy = 0;
        let POINTER_DOWN = false;
        let path$$1;


        this.canvas.addEventListener("pointerdown", (e) => {
            let x = e.offsetX - 20;
            let y = e.offsetY - 20;
            dx = x;
            dy = y;
            point.x = x;
            point.y = y;

            if (e.button == 0) {
                if (!path$$1) {
                    path$$1 = new Path();
                    path$$1.strokeColor = "black";
                    path$$1.fullySelected = true;
                } else {
                    path$$1.add(point);
                }
            }else{
            	path$$1.closePath();
            }
            this.proj.view.update();


            return;
            POINTER_DOWN = true;

            console.log(x, y);

            this.selection = this.proj.hitTest(point, { fill: true, stroke: true });

            console.log(this.selection);

            if (this.selection) {
                this.selection.item.selected = true;
                this.proj.view.update();
            }

        });

        this.canvas.addEventListener("pointermove", (e) => {
            if (!POINTER_DOWN) return;
            let x = dx - e.offsetX;
            let y = dy - e.offsetY;
            console.log(x, y, this.selection);
            dx = e.offsetX;
            dy = e.offsetY;
            let selection = this.selection;
            if (selection) {
                let item = selection.item;
                switch (selection.type) {
                    case "fill":
                    case "stroke":
                        item.translate(new Point(-x, -y));
                        break;
                }

                this.proj.view.update();
            }
        });

        this.canvas.addEventListener("pointerup", (e) => {
            POINTER_DOWN = false;
            this.export();
        });


        this.ctx = this.canvas.getContext("2d");
        this.elements = [];
    }

    export () {
        paper.project.view.viewSize.set(this.width, this.height);
        paper.project.view.translate(new Point(-20, -20));
        let output = paper.project.exportSVG({ asString: true });
        console.log(output);
        this.wick_node.reparse(output).then(n => this.wick_node = n);
        paper.project.view.translate(new Point(20, 20));
        paper.project.view.viewSize.set(this.width + 40, this.height + 40);
    }

    mount(ui, target_element, component, x, y) {


        while (target_element && target_element.tagName.toUpperCase() !== "SVG") {
            target_element = target_element.parentElement;
        }

        if (!target_element) return;

        this.wick_node = target_element.wick_node;

        //parse svg elements and build objects from them. 
        let children = target_element.children;


        let rect = target_element.getBoundingClientRect();
        x = component.x + rect.x + 4 - 20;
        y = component.y + rect.y + 4 - 20;
        this.width = rect.width;
        this.height = rect.width;
        paper.project.view.viewSize.set(rect.width + 40, rect.height + 40);
        paper.project.view.translate(new Point(20, 20));
        paper.project.importSVG(target_element.outerHTML);

        this.canvas.style.left = `${x}px`;
        this.canvas.style.top = `${y}px`;

        ui.view_element.appendChild(this.canvas);
    }
}

const pi2 = Math.PI * 2;

function gripPoint(ctx, x, y, r) {
    ctx.beginPath();
    //ctx.moveTo(x,y); 
    ctx.arc(x, y, r, 0, pi2);
    ctx.fill();
    ctx.stroke();
}

class BoxElement {
    constructor() {
        this._ml = 0;
        this._mr = 0;
        this._mt = 0;
        this._mb = 0;

        this._pl = 0;
        this._pr = 0;
        this._pt = 0;
        this._pb = 0;

        this.bl = 0;
        this.br = 0;
        this.bt = 0;
        this.bb = 0;

        this.posl = 0;
        this.posr = 0;
        this.post = 0;
        this.posb = 0;

        this.x = 0; //left of border box
        this.y = 0; //top of border box
        this.w = 0; //width of border box
        this.h = 0; //height of border box
        this.br = 0;
        this.IS_COMPONENT = false;

        this.target = {
            IS_COMPONENT: false,
            component: null,
            element: null,
            action: null,
            box: { l: 0, r: 0, t: 0, b: 0 }
        };
    }

    setBox() {

        const box = (this.target.box) ? this.target.box : { l: 0, r: 0, t: 0, b: 0 };
        this.target.box = box;
        switch (this.target.action) {
            case actions.MOVE:
                box.l = this.cbl;
                box.r = this.cbr;
                box.b = this.cbb;
                box.t = this.cbt;
                break;
            case actions.RESIZETL:
                box.l = this.cbl;
                box.r = this.cbl;
                box.b = this.cbt;
                box.t = this.cbt;
                break;
            case actions.RESIZEBL:
                box.l = this.cbl;
                box.r = this.cbl;
                box.b = this.cbb;
                box.t = this.cbb;
                break;
            case actions.RESIZETR:
                box.l = this.cbr;
                box.r = this.cbr;
                box.b = this.cbt;
                box.t = this.cbt;
                break;
            case actions.RESIZEBR:
                box.l = this.cbr;
                box.r = this.cbr;
                box.b = this.cbb;
                box.t = this.cbb;
                break;
            case actions.RESIZEMARGINTL:
                box.l = this.ml;
                box.r = this.ml;
                box.b = this.mt;
                box.t = this.mt;
                break;
            case actions.RESIZEMARGINBL:
                box.l = this.ml;
                box.r = this.ml;
                box.b = this.mb;
                box.t = this.mb;
                break;
            case actions.RESIZEMARGINTR:
                box.l = this.mr;
                box.r = this.mr;
                box.b = this.mt;
                box.t = this.mt;
                break;
            case actions.RESIZEMARGINBR:
                box.l = this.mr;
                box.r = this.mr;
                box.b = this.mb;
                box.t = this.mb;
                break;
            case actions.RESIZEPADDINGTL:
                break;
            case actions.RESIZEPADDINGBL:
                break;
            case actions.RESIZEPADDINGTR:
                break;
            case actions.RESIZEPADDINGBR:
                break;
        }
    }

    setDimensions(IS_COMPONENT = this.IS_COMPONENT) {
        let component = this.target.component;

        if (IS_COMPONENT) {
            this.IS_COMPONENT = true;
            this.x = component.x + 4;
            this.y = component.y + 4;
            this.w = component.width;
            this.h = component.height;
        } else {
            let rect = this.target.element.getBoundingClientRect();
            this.x = rect.left + component.x + 4;
            this.y = rect.top + component.y + 4;
            this.w = rect.width;
            this.h = rect.height;
        }
        
        let par_prop = component.window.getComputedStyle(this.target.element);

        //margin
        this._ml = parseFloat(par_prop.getPropertyValue("margin-left"));
        this._mr = parseFloat(par_prop.getPropertyValue("margin-right"));
        this._mt = parseFloat(par_prop.getPropertyValue("margin-top"));
        this._mb = parseFloat(par_prop.getPropertyValue("margin-bottom"));

        //border
        this.bl = parseFloat(par_prop.getPropertyValue("border-left"));
        this.br = parseFloat(par_prop.getPropertyValue("border-right"));
        this.bt = parseFloat(par_prop.getPropertyValue("border-top"));
        this.bb = parseFloat(par_prop.getPropertyValue("border-bottom"));

        //padding
        this._pl = parseFloat(par_prop.getPropertyValue("padding-left"));
        this._pr = parseFloat(par_prop.getPropertyValue("padding-right"));
        this._pt = parseFloat(par_prop.getPropertyValue("padding-top"));
        this._pb = parseFloat(par_prop.getPropertyValue("padding-bottom"));

        this.posl = parseFloat(par_prop.getPropertyValue("left"));
        this.posr = parseFloat(par_prop.getPropertyValue("right"));
        this.post = parseFloat(par_prop.getPropertyValue("top"));
        this.posb = parseFloat(par_prop.getPropertyValue("bottom"));

        this.setBox();
    }

    //Margin box
    get ml() { return this.x - this._ml - this.posl; }
    get mt() { return this.y - this._mt - this.post; }
    get mr() { return this.w + this._mr + this._ml + this.ml; }
    get mb() { return this.h + this._mb + this._mt + this.mt; }

    //Padding box
    get pl() { return this.x + this._pl + this.bl; }
    get pt() { return this.y + this._pt + this.bt; }
    get pr() { return this.w - this._pr - this._pl - this.br - this.bl + this.pl; }
    get pb() { return this.h - this._pb - this._pt - this.bb - this.bt + this.pt; }

    //Content box
    get cbl() { return this.x + this.bl; }
    get cbt() { return this.y + this.bt; }
    get cbr() { return this.w - this.br - this.bl + this.cbl; }
    get cbb() { return this.h - this.bb - this.bt + this.cbt; }

    render(ctx, scale) {
        this.setDimensions();

        ctx.strokeStyle = "rgb(0,0,0)";
        ctx.lineWidth = (1 / scale) * 0.95;

        //Border box
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        //Margin box
        let ml = this.ml;
        let mt = this.mt;
        let mr = this.mr;
        let mb = this.mb;

        //Padding box
        let pl = this.pl;
        let pt = this.pt;
        let pr = this.pr;
        let pb = this.pb;

        //Content box
        let cbl = this.cbl;
        let cbt = this.cbt;
        let cbr = this.cbr;
        let cbb = this.cbb;

        ctx.strokeRect(ml, mt, mr - ml, mb - mt);
        ctx.strokeRect(pl, pt, pr - pl, pb - pt);
        ctx.strokeRect(cbl, cbt, cbr - cbl, cbb - cbt);

        //Render Markers

        //Box \ Border Markers 
        ctx.fillStyle = "rgb(0,100,200)";
        ctx.strokeStyle = "rgb(250,250,250)";
        ctx.lineWidth = 2 / scale;
        let r = 5 / scale;

        gripPoint(ctx, cbl, cbt, r);
        gripPoint(ctx, cbr, cbt, r);
        gripPoint(ctx, cbl, cbb, r);
        gripPoint(ctx, cbr, cbb, r);

        //Margin Markers
        gripPoint(ctx, ml, mt, r);
        gripPoint(ctx, mr, mt, r);
        gripPoint(ctx, ml, mb, r);
        gripPoint(ctx, mr, mb, r);

        //Padding Markers
        gripPoint(ctx, pl, pt, r);
        gripPoint(ctx, pr, pt, r);
        gripPoint(ctx, pl, pb, r);
        gripPoint(ctx, pr, pb, r);
    }

    setTarget(element, component, IS_COMPONENT) {
        this.target.element = element;
        this.target.component = component;
        this.target.IS_COMPONENT = IS_COMPONENT;
    }
}

class CanvasManager {
    constructor() {
        //Canvas setup.
        this.element = document.createElement("canvas");
        this.element.classList.add("flame_ui_canvas");
        this.ctx = this.element.getContext("2d");
    }

    setIframeTarget(element, component, IS_COMPONENT = false) {
        let box = new BoxElement(element);
        box.setTarget(element, component, IS_COMPONENT);
        box.setDimensions(IS_COMPONENT);
        this.widget = box;
    }

    render(transform) {
        this.element.width = this.element.width;
        if (this.widget) {
            this.ctx.save();
            transform.setCTX(this.ctx);
            this.widget.render(this.ctx, transform.scale);
            this.ctx.restore();
        }
    }

    pointerDown(e, x, y, transform) {
        let widget = this.widget;
        if (widget) {

            widget.target.action = null;

            let tr = 5 / transform.scale; //touch radius

            //Margin box
            let ml = widget.ml; // widget.x - widget.ml - widget.posl;
            let mt = widget.mt; // widget.y - widget.mt - widget.post;
            let mr = widget.mr; // widget.w + widget.mr + widget.ml + ml;
            let mb = widget.mb; // widget.h + widget.mb + widget.mt + mt;

            //Padding box
            let pl = widget.pl; // widget.x + widget.pl + widget.bl;
            let pt = widget.pt; // widget.y + widget.pt + widget.bt;
            let pr = widget.pr; // widget.w - widget.pr - widget.pl - widget.br - widget.bl + pl;
            let pb = widget.pb; // widget.h - widget.pb - widget.pt - widget.bb - widget.bt + pt;

            //Content box
            let cbl = widget.cbl; // widget.x + widget.bl;
            let cbt = widget.cbt; // widget.y + widget.bt;
            let cbr = widget.cbr; // widget.w - widget.br - widget.bl + cbl;
            let cbb = widget.cbb; // widget.h - widget.bb - widget.bt + cbt;
            //Widget size
            while (true) {

                //Content box first / Can double as border
                if (x >= cbl - tr && x <= cbr + tr) {
                    if (y >= cbt - tr && y <= cbb + tr) {
                        if (x <= cbl + tr) {
                            if (y <= cbt + tr) {
                                this.widget.target.action = actions.RESIZETL;
                                break;
                            } else if (y >= cbb - tr) {
                                this.widget.target.action = actions.RESIZEBL;
                                break;
                            }
                        } else if (x >= cbr - tr) {
                            if (y <= cbt + tr) {
                                this.widget.target.action = actions.RESIZETR;
                                break;
                            } else if (y >= cbb - tr) {
                                this.widget.target.action = actions.RESIZEBR;
                                break;
                            }
                        } else {
                            widget.target.action = actions.MOVE;
                        }
                    }
                }

                //Margin box
                if (x >= ml - tr && x <= mr + tr) {
                    if (y >= mt - tr && y <= mb + tr) {
                        if (x <= ml + tr) {
                            if (y <= mt + tr) {
                                this.widget.target.action = actions.RESIZEMARGINTL;
                                break;
                            } else if (y >= mb - tr) {
                                this.widget.target.action = actions.RESIZEMARGINBL;
                                break;
                            }
                        } else if (x >= mr - tr) {
                            if (y <= mt + tr) {
                                this.widget.target.action = actions.RESIZEMARGINTR;
                                break;
                            } else if (y >= mb - tr) {
                                this.widget.target.action = actions.RESIZEMARGINBR;
                                break;
                            }
                        }
                    }
                }

                //Padding box
                if (x >= pl - tr && x <= pr + tr) {
                    if (y >= pt - tr && y <= pb + tr) {
                        if (x <= pl + tr) {
                            if (y <= pt + tr) {
                                this.widget.target.action = actions.RESIZEPADDINGTL;
                                break;
                            } else if (y >= pb - tr) {
                                this.widget.target.action = actions.RESIZEPADDINGBL;
                                break;
                            }
                        } else if (x >= pr - tr) {
                            if (y <= pt + tr) {
                                this.widget.target.action = actions.RESIZEPADDINGTR;
                                break;
                            } else if (y >= pb - tr) {
                                this.widget.target.action = actions.RESIZEPADDINGBR;
                                break;
                            }
                        }
                    }
                }
                break;
            }
            if (widget.target.action) {

                widget.setBox();
                return widget.target;
            }
            /*
                        if (dx > 0 && dx < w)
                            if (dy > 0 && dy < h) {
                                //Check corners for action;
                                this.widget.target.action = actions.MOVE;

                                if (dx <= ws) {
                                    if (dy <= ws)
                                        this.widget.target.action = actions.SCALETL;
                                    else if (dy >= h - ws)
                                        this.widget.target.action = actions.SCALEBL;
                                }

                                if (dx >= w - ws) {
                                    if (dy <= ws)
                                        this.widget.target.action = actions.SCALETR;
                                    else if (dy >= h - ws)
                                        this.widget.target.action = actions.SCALEBR;
                                }

                                return this.widget.target;
                            }
                            */
        }
        return false;
    }

    resize(transform) {
        this.element.width = window.innerWidth;
        this.element.height = window.innerHeight;
        this.render(transform);
    }

    clearTargets(transform) {
        this.widget = null;
        this.render(transform);
    }
}

//*********** Actions ******************

var DD_Candidate = false;
/**
 * @brief Handles user input and rendering of UI elements
 * 
 * @param  [HTMLElement] Element to map UI components to.
 */
class UI_Manager {

    constructor(UIHTMLElement, ViewElement, system) {

        this.system = system;


        this.element = UIHTMLElement;
        this.view_element = ViewElement;
        this.ACTIVE_POINTER_INPUT = false;
        this.origin_x = 0;
        this.origin_y = 0;
        this.transform = new(wick$1.core.common.Transform2D)();
        this.last_action = Date.now();

        /* 
            UI components serve as UX/UI handlers for all tools that comprise flame.
            These can be modified by the user through project system to create and use custom UI
            elements. 
        */
        this.components = [];
        this.ui_components = new Map();
        this.loadedComponents = [];

        //Menu array
        this.main_menu = document.createElement("div");
        this.main_menu.id = "main_menu";
        this.main_menu.map = new Map();
        this.main_menu.setAttribute("show", "false");
        this.element.appendChild(this.main_menu);

        //Array of components
        this.UI_MOVE = false;

        //CanvasManager provides onscreen transform visual widgets for components and elements.
        this.canvas = new CanvasManager();
        this.canvas.resize(this.transform);
        this.element.appendChild(this.canvas.element);

        /** SYSTEMS *******************************/
        this.svg_manager = new SVGManager(system);
        this.line_machine = new LineMachine();

        // **************** Eventing *****************
        window.addEventListener("resize", e => this.canvas.resize(this.transform));

        // // *********** Mouse *********************
        window.addEventListener("mouseover", e => {});
        window.addEventListener("wheel", e => this.handleScroll(e));

        // // *********** Pointer *********************
        window.addEventListener("pointerdown", e => {
            let x = this.transform.getLocalX(e.pageX);
            let y = this.transform.getLocalY(e.pageY);
            if (this.setTarget(e, null, x, y, false)) {
                this.origin_x = x;
                this.origin_y = y;
                this.ACTIVE_POINTER_INPUT = true;
            } else
                this.handlePointerDownEvent(e, undefined, undefined, !!1);
        });
        window.addEventListener("pointermove", e => this.handlePointerMoveEvent(e));
        window.addEventListener("pointerup", e => this.handlePointerEndEvent(e));

        // // *********** Drag 'n Drop *********************
        document.body.addEventListener("drop", e => this.handleDocumentDrop(e));
        document.body.addEventListener("dragover", e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        });
        document.body.addEventListener("dragstart", e => {});
    }

    mountComponent(component) {
        component.mount(this.element);
        this.loadedComponents.push(component);
        component.set(this.target);
    }

    addToMenu(menu_name, item_name, icon_element, menu) {
        if (menu_name == "main") {
            let element = icon_element.cloneNode(true);
            element.onclick = ()=>{
                this.mountComponent(menu);
            };
            this.main_menu.appendChild(element);
            this.main_menu.map.set(name, icon_element);
        }
    }

    addComponent(wick_component_file_path) {
        
        let doc = this.system.doc_man.get(this.system.doc_man.load(wick_component_file_path));

        if (doc) {
            let component = new UIComponent(this.system, doc.name);
            component.load(doc);
            this.ui_components.set(doc.name, component);
        }
    }

    setTarget(e, component, x, y, SET_MENU = true) {
        let target = null;

        if (target = this.canvas.pointerDown(e, x, y, this.transform)) {

            this.target = target;

            if (SET_MENU) this.main_menu.setAttribute("show", "true");

            this.loadedComponents.forEach(c => c.set(this.target));

            if(component){
                if(this.target.IS_COMPONENT){
                    this.line_machine.setPotentialBoxes(null, component, this.components);
                }else{
                    this.line_machine.setPotentialBoxes(this.target.element, component, this.components);
                }
            }

            return true;
        }


        if (SET_MENU) this.main_menu.setAttribute("show", "false");
        return false;
    }

    integrateIframe(iframe, component) {

        iframe.contentWindow.addEventListener("wheel", e => {
            let x = ((component.x + 4 + e.pageX) * this.transform.scale) + this.transform.px;
            let y = ((component.y + 4 + e.pageY) * this.transform.scale) + this.transform.py;
            this.handleScroll(e, x, y);
        });

        iframe.contentWindow.addEventListener("mousedown", e => {
            
            let x = e.pageX + 4 + component.x ;
            let y = e.pageY + 4 + component.y ;
            this.last_action = Date.now();
            this.handlePointerDownEvent(e, x, y);

            if (e.button == 0) {
                if (!this.setTarget(e, component, x, y)) {
                    if (e.target.tagName == "BODY") {
                        this.canvas.setIframeTarget(component.element, component, true);
                        this.render();
                        this.setTarget(e, component, x, y);
                    } else {
                        this.canvas.setIframeTarget(e.target, component);
                        this.render();
                        this.setTarget(e, component,  x, y);
                    }
                }
            }


            return false;
        });

        iframe.contentWindow.addEventListener("mousemove", e => {
            let x = e.pageX + 4 + component.x;
            let y = e.pageY + 4 + component.y;
            if (e.button !== 1) this.handlePointerMoveEvent(e, x, y);
            return false;
        });

        iframe.contentWindow.addEventListener("mouseup", e => {
            let t = Date.now();
            let x = e.pageX + 4 + component.x;
            let y = e.pageY + 4 + component.y;

            if (t - this.last_action < 200) {
                if (Date.now() - DD_Candidate < 200) {
                    DD_Candidate = 0;
                    this.handleContextMenu(e, x, y, component);
                } else {
                    if (e.target.tagName == "BODY") {
                        this.canvas.setIframeTarget(component.element, component, true);
                        this.render();
                        this.setTarget(e, component, x, y);
                    } else if (this.setTarget(e, component, x, y) && this.target.action == actions.MOVE) {
                        this.canvas.setIframeTarget(e.target, component);
                        this.render();
                        this.setTarget(e, component, x, y);
                    }
                    DD_Candidate = Date.now();
                }
            }
            this.handlePointerEndEvent(e);
        });

        this.components.push(component);
    }

    handlePointerDownEvent(e, x = this.transform.getLocalX(e.pageX), y = this.transform.getLocalY(e.pageY), FROM_MAIN = false) {

        if (e.button == 1) {
            if(x === NaN || y === NaN){
                debugger;
            }
            this.origin_x = x;
            this.origin_y = y;
            this.ACTIVE_POINTER_INPUT = true;
            this.UI_MOVE = true;
            return true;
        }

        if (FROM_MAIN) return false;

        this.origin_x = x;
        this.origin_y = y;
        this.ACTIVE_POINTER_INPUT = true;

        if (e.target !== document.body) {
            return;
        }

        this.canvas.clearTargets(this.transform);
        this.main_menu.setAttribute("show", "false");

        return false;
    }

    handlePointerMoveEvent(e, x = this.transform.getLocalX(e.pageX), y = this.transform.getLocalY(e.pageY)) {

        if (!this.ACTIVE_POINTER_INPUT) return;

        let diffx = this.origin_x - x;
        let diffy = this.origin_y - y;
        if (this.UI_MOVE) {
            this.transform.px -= diffx * this.transform.sx;
            this.transform.py -= diffy * this.transform.sy;
            this.origin_x = x + diffx;
            this.origin_y = y + diffy;
            this.render();
            this.view_element.style.transform = this.transform;
            return;
        } else if (this.target) {
            let {dx, dy} = this.line_machine.getSuggestedLine(this.target.box, diffx, diffy);
            this.origin_x -= dx;
            this.origin_y -= dy;
            //if(this.target.box.l == this.target.box.r && Math.abs(diffx) > 1 && Math.abs(dx) < 0.0001) debugger
            if (this.target.action) this.target.action(this.system, this.target.element, this.target.component, -dx, -dy, this.target.IS_COMPONENT);
            this.render();
        }
    }

    handlePointerEndEvent(e) {
        this.UI_MOVE = false;
        this.ACTIVE_POINTER_INPUT = false;

        //this.target = null;
        if (this.target)
            actions.COMPLETE(this.system, this.target.element, this.target.component);
    }

    handleDocumentDrop(e) {
        e.preventDefault();
        
        Array.prototype.forEach.call(e.dataTransfer.files, f => {
            let doc = this.system.doc_man.get(this.system.doc_man.load(f));

            if (doc) switch (doc.type) {
                case "wick":
                case "html":
                    actions.CREATE_COMPONENT(this.system, doc, {
                        x: this.transform.getLocalX(e.clientX),
                        y: this.transform.getLocalY(e.clientY)
                    });
                    break;
                case "css":
                    actions.CREATE_CSS_DOC(this.system, doc, {
                        x: this.transform.getLocalX(e.clientX),
                        y: this.transform.getLocalY(e.clientY)
                    });
                    break;
                case "js":
                case "svg":
                case "jpg":
                case "png":
                case "gif":
                default:
                    break;
            }
        });
    }

    handleContextMenu(e, x, y, component = null) {
        //Load text editor in the bar.

        switch(e.target.tagName.toUpperCase()){
            case "SVG":
            case "RECT":
            case "PATH":
                this.svg_manager.mount(this, e.target, component, x, y);
                break;
            default:
                let element_editor = this.ui_components.get("element_edit.html");
                element_editor.mount(this.element);
        }
    }

    handleScroll(e, x = e.pageX, y = e.pageY) {
        e.preventDefault();
        let amount = e.deltaY;
        let os = this.transform.scale;
        this.transform.scale = Math.max(0.2, Math.min(2, os + -amount * 0.00005));
        let px = this.transform.px,
            s = this.transform.scale,
            py = this.transform.py;

        this.transform.px -= ((((px - x) * os) - ((px - x) * s))) / (os);
        this.transform.py -= ((((py - y) * os) - ((py - y) * s))) / (os);
        this.render();
        this.view_element.style.transform = this.transform;
    }

    update(){
        this.render();
    }

    render() {
        this.canvas.render(this.transform);
        if(this.target)
            this.line_machine.render(this.canvas.ctx, this.transform, this.target.box);
        this.loadedComponents.forEach(c => c.set(this.target));
    }
}

class JSManager{

}

class CSSComponent{
	constructor(tree, manager){
		debugger
		this.manager = manager;
		this.tree = tree;
		this.doc = null;
		this.element = document.createElement("div");
		this.tree.addObserver(this);
	}

	documentReady(data){
		this.tree._parse_(wick.core.lexer(data, true));
		this.manager.updateStyle("zzz", data);
		this.element.innerHTML = this.tree + "";
	}

	documentUpdate(data){

	}

	updatedCSS(){
		//this.element.innerHTML = this.tree + "";
		this.manager.updateStyle("zzz", this.tree + "");
	}
}

/**
 *  This module maintains CSS documents and handles the updating of their contents. 
 */

let CSS_Root_Constructor = wick$1.core.css.root;

class CSSManager {

	constructor(docs) {
		this.css_files = [];
		this.style_elements = {};
		this.docs = docs;
	}

	/**
	 * Returns an array of CSS rules that match against the element
	 * @param  {[type]} element   [description]
	 * @param  {[type]} component [description]
	 * @return {[type]}           [description]
	 */
	aquireCSS(element, component) {
		if (!component)
			return [];

		let css_docs = component.local_css;

		let selectors = [];

		for (let i = 0; i < css_docs.length; i++) {
			let gen = css_docs[i].getApplicableSelectors(element),
				sel = null;
			while (sel = gen.next().value)
				selectors.push(sel);
		}

		return selectors;
	}

	/**
	 * Returns matching rule that is the most unique to the element. Creates a new rule if one cannot be found. May create a new CSS document if the rule is not found.  
	 * @param  {[type]} element   [description]
	 * @param  {[type]} component [description]
	 * @return {[type]}           [description]
	 */
	getUnique(element, component) {
		let css_docs = component.local_css;

		let selector = null,
			best_score = 0;

		for (let i = 0; i < css_docs.length; i++) {
			let gen = css_docs[i].getApplicableSelectors(element),
				sel = null;
			while (sel = gen.next().value) {
				let score = sel.v.length * -20.5;

				for (let j = 0; j < sel.a.length; j++) {
					let array = sel.a[j];
					let score_multiplier = 1;
					for (let x = 0; x < array.length; x++) {
						let v = array[x];

						for(let y = 0; y < v.ss.length; y++){
							let r = v.ss[y];

							switch(r.t){
								case "class":
									score += 40 * score_multiplier;
									break;
								case "id":
									score += 50 * score_multiplier;
									break;
							}
						}

						switch (v.c) {
							case "child":
								score += 2 * score_multiplier;
								break;
							case "preceded":
								score += 3 * score_multiplier;
								break;
							case "immediately_preceded":
								score += 3 * score_multiplier;
								break;
							case "descendant":
								score += 1 * score_multiplier;
								break;
						}

						score_multiplier -= 0.98;
					}
				}

				if (score > best_score) {
					selector = sel;
					best_score = score;
				}
			}
		}

		if (!selector) {
			//Create new css document and create identifier for this document best matching the element. 
			//Add new class to element if there is none present. 

			//The last selector in the component css has the highest precedent.
			let tree = css_docs[css_docs.length - 1];

			if (css_docs.length == 0) {
				//create new css tree.
				tree = new CSS_Root_Constructor();
				component.addStyle(tree);
			}

			let class_name = "n" +((Math.random() * 10000000) | 0) + "";

			let classes = element.wick_node.getAttrib("class");
			
			if (classes) {
				if (typeof(classes.value) == "string")
					classes.value += ` ${class_name}`;
				else
					classes.value.txt += ` ${class_name}`;
			}else{
				element.wick_node._attributes_.push(element.wick_node._processAttributeHook_("class", wick$1.core.lexer(class_name)));
/*				element.wick_node._attributes_.push({
					name:"class",
					value:class_name,
				})*/
				console.log(element.wick_node.classList);
			}

			element.classList.add(class_name);

			selector = tree.createSelector(`.${class_name}`);

			console.log(selector, selector.r);
		}

		return selector;
	}

	addFile(css_text, scope, file_id) {
		let css_file = new CSS_Root_Constructor();
		css_file._parse_(new wick$1.core.lexer(css_text), true, null, null);
		this.css_file.push(css_text);
		css_file.file_id = file_id;
	}

	addTree(tree, IS_DOCUMENT, url) {
		if (IS_DOCUMENT) {
			let doc = this.docs.get(url);
			if (!doc.tree) {
				doc.tree = tree;
				tree.addObserver(doc);
			} else {
				tree = doc.tree;
			}
		}

		this.css_files.push(tree);

		return tree;
	}

	updateStyle(id, text) {
		let style = this.style_elements[id];

		if (!style) {
			style = this.style_elements[id] = document.createElement("style");
		}

		style.innerHTML = text;
	}

	createComponent(doc) {
		let css_file = new CSS_Root_Constructor();
		let component = new CSSComponent(css_file, this);
		doc.bind(component);
		this.css_files.push(css_file);
		return component;
	}
}

let CSSRule = wick$1.core.css.prop;

/**
 * @brief This will replace the default rule.merge with a reactive system that updates the respective selector. 
 */
CSSRule.prototype.merge = function(rule) {
    if (rule.props) {
        for (let n in rule.props) {
            ((n) => {
                Object.defineProperty(this.props, n, {
                    configurable:true,
                    enumerable: true,
                    get: () => {
                        return rule.props[n];
                    },
                    set: (v) => {
                        rule.props[n] = v;
                        if(rule.root)
                            rule.root.updated();
                    }
                });
            })(n);
        }
        this.LOADED = true;
    }
};

/**
 * This module maintains HTML documents and updates them
 */

 class HTMLManager {}

class Document {

    constructor(file_name, path$$1, system) {
        this.path = path$$1;
        this.name = file_name;
        this.data = null;
        this.LOADED = false;
        this.UPDATED = true;
        this.SAVING = false;
        this.PENDING_SAVE = false;
        this.INITIAL_HISTORY = false;
        this.observers = [];
        this.system = system;
        this.element = document.createElement("div");
        this.old_data = "";
    }

    seal(differ) {
        if (this.PENDING_SAVE) {
            this.PENDING_SAVE = false;

            let new_data = this + "";

            let diff = differ.createDiff(this.old_data, new_data);

            this.old_data = new_data;

            return (diff) ? {
                id: this.id,
                diff
            } : null;
        }

        return null;
    }

    load() {
        fs.open(this.path + "/" + this.name, "r", (err, fd) => {
            if (err) throw err;
            fs.readFile(fd, "utf8", (err, data) => {
                
                fs.close(fd, (err) => {if (err) throw err});
                
                if (err) 
                    throw err;
                
                this.LOADED = true;
                this.fromString(data);    
            });
        });
    }

    save() {
        this.PENDING_SAVE = true;
        return;
        if (this.SAVING) return;
        this.SAVING = true;
        this.PENDING_SAVE = false;
        fs.open(this.path + "/" + this.name, "w", (err, fd) => {
            if (err) throw err;
            fs.write(fd, (this.data._skeletons_[0].tree + ""), 0, "utf8", (err, written, data) => {
                fs.close(fd, (err) => {
                    if (err) throw err
                });
                if (err) {
                    throw err;
                }
                if (this.PENDING_SAVE) this.save();
                else this.PENDING_SAVE = false;
                this.SAVING = false;
            });
        });
    }

    toString(){
        return "[Document]";
    }

    bind(object) {
        if (this.LOADED) object.documentReady(this.data);
        this.observers.push(object);
    }

    get type(){
        return "";
    }

    get id(){
        return `${this.path}/${this.name}`;
    }


}

class WickDocument extends Document{

    updatedWickASTTree(tree) {
        this.element.innerText = tree;
        this.save();
    }

    fromString(string, ALLOW_SEAL = true) {

        (new wick$1.core.source.package(string, this.system.project.presets, true, this.path + "/" + this.name)).then((pkg) => {

            if(this.data)
                this.data.removeObserver(this);

            this.data = pkg;

            pkg._skeletons_[0].tree.addObserver(this);
            
            for (let i = 0; i < this.observers.length; i++) this.observers[i].documentReady(pkg);

            if(ALLOW_SEAL){
                this.PENDING_SAVE = true;
                this.system.doc_man.seal();
            }
        });
    }

    toString() {
        return this.data._skeletons_[0].tree + "";
    }

    get type(){
        return "wick";
    }
}

class CSSDocument extends Document {

	updatedCSS(tree) {
		this.save();
	}

	fromString(string, ALLOW_SEAL = true) {

		this.data = string;

		if(this.tree){
			this.tree._parse_(wick$1.core.lexer(string)).catch((e) => {
		        throw e;
		    }).then((css) => {
		    	this.old = string;
		        this.tree.updated();
		    });
		}else{

			for (let i = 0; i < this.observers.length; i++)
				this.observers[i].documentReady(this.data);

			if (ALLOW_SEAL){
				this.PENDING_SAVE = true;
				this.system.doc_man.seal();
			}
		}
	}

	toString() {
		if(this.tree)
			return this.tree + "";
		return this.data;
	}

	get type() {
		return "css";
	}
}

/**
 * Uses a diff algorithm to create a change map from one document version to another. Vesions are stored in the project as a change history. 
 */
class DocumentDifferentiator{
	createDiff(old, new_){
		if(old == new_) return;

		return {
			old,
			new:new_
		}
	}

	convert(doc, diff){
		doc.fromString(diff.new, false);
	}	

	revert(doc, diff){
		doc.fromString(diff.old, false);
	}
}

/**
 * The Document Manager handles text file operations and text file updating. 
 */
class DocumentManager {
    constructor(system) {
        this.docs = new Map();
        this.system = system;
        this.differ = new DocumentDifferentiator();
        this.diffs = [];
        this.diff_step = 0;
        /**
         * Global `fetch` polyfill - basic support
         */
        global.fetch = (url, data) => new Promise((res, rej) => {
            let p = url;
            if (!path.isAbsolute(p)) p = path.resolve(process.cwd(), (url[0] == ".") ? url + "" : "." + url);
            let doc_id = this.load({
                path: path.dirname(p),
                name: path.basename(p),
                type: "text/css",
            });
            if (doc_id) {
                this.get(doc_id).bind({
                    documentReady: (data) => res({
                        status: 200,
                        text: () => new Promise((res) => res(data))
                    })
                });
            }
        });
    }
    /*
     * Loads file into project
     */
    load(file) {
        switch (typeof(file)) {
            case "string": // Load from file system or DB
                let p = path.parse(file);
                file = {
                    path : p.dir,
                    name: p.base
                };
            case "object": // Load data 
                if (file.name && file.path) {
                    let path$$1 = file.path;
                    let name = file.name;
                    let type = "";
                    if (file.type) type = file.type.split("/")[1].toLowerCase();
                    else type = name.split(".").pop().toLowerCase();
                    if (path$$1.includes(name)) path$$1 = path$$1.replace(name, "");
                    if (path$$1[path$$1.length - 1] == "/" || path$$1[path$$1.length - 1] == "\\") path$$1 = path$$1.slice(0, -1);
                    path$$1 = path$$1.replace(/\\/g, "/");
                    let id = `${path$$1}/${name}`;
                    if (!this.docs.get(id)) {
                        let doc;
                        switch (type) {
                            case "html":
                                doc = new WickDocument(name, path$$1, this.system);
                                break
                            default:
                                doc = new CSSDocument(name, path$$1, this.system);
                        }
                        this.docs.set(id, doc);
                        doc.load();
                    }
                    return id;
                }
                break;
        }
        return "";
    }

    get(id) {
        return this.docs.get(id);
    }

    /** Updates all changes to files and records diffs resulting from user actions */
    seal(){
        let diffs = [];
        this.docs.forEach((d)=>{
            let diff = d.seal(this.differ);
            if(diff)
                diffs.push(diff);
        });

        if(diffs.length > 0){
            this.diffs.push({v:version++,diffs});
            this.diff_step++;
        }

    }

    stepBack(){
        if(this.diff_step == 0) return;
        debugger
        let diffs = this.diffs[--this.diff_step].diffs;

        if(diffs){
            for(let i = 0; i < diffs.length; i++){
                let diff = diffs[i];
                let doc = this.docs.get(diff.id);
                this.differ.revert(doc, diff.diff);
            }
        }
    }

    stepForward(){
        if(this.diff_step == this.diffs.length-1) return;
        let diffs = this.diffs[this.diff_step++];

        if(diffs){
            for(let i = 0; i < diffs.length; i++){
                let diff = diffs[i];
                let doc = this.docs.get(diff.diffs.id);
                this.differ.convert(doc, diff);
            }
        }   
    }
}

var version = 0;

let Source = wick$1.core.source.constructor;

Source.prototype.rebuild = function (){
	this.ast.buildExisting(this.ele, this, this.presets, this.taps);
};

let RootNode = wick$1.core.source.compiler.nodes.root;
let SourceNode = wick$1.core.source.compiler.nodes.source;
let Lexer = wick$1.core.lexer;
let id = 0;

RootNode.id = 0;


SourceNode.prototype.createElement = function(presets, source) {
    let element = document.createElement(this.getAttribute("element") || "div");
    element.wick_source = source;
    element.wick_node = this;
    element.wick_id = id++;
    return element;
};

RootNode.prototype.reparse_type = RootNode;

RootNode.prototype.createElement = function(presets, source) {
    let element = document.createElement(this.tag);
    element.wick_source = source;
    element.wick_node = this;
    element.wick_id = RootNode.id++;
    return element;
};

RootNode.prototype.setSource = function(source) {

    if (!this.observing_sources)
        this.observing_sources = [];

    this.observing_sources.push(source);

    source.ast = this;
};

RootNode.prototype.reparse = function(text, element) {
    let lex = Lexer(text);
    let Root = new this.reparse_type();

    Root.par = this.par;

    let promise = Root._parse_(Lexer(text), false, false, this.par);

    promise.then(node => {

        node.par = null;

        if (this.par)
            this.par.replace(this, node);
        node.BUILT = true;
        node.setRebuild(false, true);
        node.rebuild();
        //replace this node with the new one. 
    });

    return promise;
};

// Rebuild all sources relying on this node
RootNode.prototype.rebuild = function() {

    //if (!this.par)
    //    this.updated();

    if (this.observing_sources) {
        this._linkCSS_();
        for (let i = 0; i < this.observing_sources.length; i++) {
            try {

                this.observing_sources[i].rebuild();
            } catch (e) {
                console.error(e);
            }
        }
        this.resetRebuild();
    } else if (this.par)
        this.par.rebuild();
};

RootNode.prototype.extract = function() {
    if (this.par)
        this.par.replace(this, new DeleteNode());
};


RootNode.prototype.buildExisting = function(element, source, presets, taps, parent_element) {
    if (true || this.CHANGED !== 0) {
        //IO CHANGE 
        //Attributes
        if (this.CHANGED & 4) {

            let span = document.createElement("span");

            this._build_(span, source, presets, [], taps, {});

            let ele = span.firstChild;

            if (this.CHANGED & 8) {
                if (element) {
                    element.parentElement.insertBefore(ele, element);
                } else
                    parent_element.appendChild(ele);
                return true;
            } else {

                element.parentElement.replaceChild(ele, element);
                return true;
            }

        }

        if (this._merged_)
            this._merged_.buildExisting(element, source, presets, taps);

        if (true || this.CHANGED & 1) {
            //redo IOs that have changed (TODO)
            for (let i = 0, l = this._bindings_.length; i < l; i++) {
                this._bindings_[i].binding._bind_(source, [], taps, element, this._bindings_[i].name);
            }
        }

        if (true || this.CHANGED & 2) {
            //rebuild children
            let children = element.childNodes;
            for (let i = 0, node = this.fch; node; node = this.getN(node)) {
                let child = children[i];
                if (node.buildExisting(child, source, presets, taps, element)) i++;
            }
        }
    }

    return true;
};

RootNode.prototype.setRebuild = function(child = false, REBUILT = false, INSERTED = false) {
    if (child) {
        this.CHANGED |= 2;
    } else {
        this.CHANGED |= 1;
    }

    if (REBUILT) {
        this.CHANGED |= 4;
    }

    if (INSERTED) {
        this.CHANGED |= 8;
    }

    if (this.par)
        this.par.setRebuild(true);
    else if (this.merges) {
        for (let i = 0; i < this.merges.length; i++)
            this.merges.setRebuild(true);
    }
};

RootNode.prototype.resetRebuild = function() {
    this.CHANGED = 0;

    if (!this.parent)
        this.updated();

    for (let node = this.fch; node; node = this.getN(node))
        node.resetRebuild();
};

RootNode.prototype.build = RootNode.prototype._build_;
RootNode.prototype._build_ = function(element, source, presets, errors, taps, statics) {
    this.BUILT = true;
    return this.build(element, source, presets, errors, taps, statics);
};


RootNode.prototype._processFetchHook_ = function(lexer, OPENED, IGNORE_TEXT_TILL_CLOSE_TAG, parent, url) {

    let path$$1 = this.url.path,
        CAN_FETCH = true;

    //make sure URL is not already called by a parent.
    while (parent) {
        if (parent.url && parent.url.path == path$$1) {
            console.warn(`Preventing recursion on resource ${this.url.path}`);
            CAN_FETCH = false;
            break;
        }
        parent = parent.par;
    }

    if (CAN_FETCH) {
        return this.url.fetchText().then((text) => {
            let lexer = wick$1.core.lexer(text);
            return this._parseRunner_(lexer, true, IGNORE_TEXT_TILL_CLOSE_TAG, this);
        }).catch((e) => {
            console.log(e);
        });
    }
    return null;
};


RootNode.prototype._mergeComponent_ = function() {
    let component = this._presets_.components[this.tag];

    if (component) {

        this._merged_ = component;

        if (!component.merges)
            component.merges = [];

        component.merges.push(this);
    }
};



RootNode.prototype.addObserver = function(observer) {
    if (!this.observers)
        this.observers = [];
    this.observers.push(observer);
};

RootNode.prototype.addView = function(view) {
    if (!this.views)
        this.views = [];
    this.views.push(view);
    view._model_ = this;
};

RootNode.prototype.removeObserver = function(observer) {
    for (let i = 0; i < this.observers.length; i++)
        if (this.observers[i] == observer) return this.observers.splice(i, 1);
};

RootNode.prototype.removeView = function(view) {
    for (let i = 0; i < this.views.length; i++)
        if (this.views[i] == view) return this.views.splice(i, 1);
};

RootNode.prototype.updated = function() {
    if (this.observers)
        for (let i = 0; i < this.observers.length; i++)
            this.observers[i].updatedWickASTTree(this);

    if (this.views)
        for (let i = 0; i < this.views.length; i++)
            this.views[i]._update_(this);

};

RootNode.prototype.BUILT = false;

/**
 * This node allows an existing element to be removed from DOM trees that were created from the Wick AST. 
 */
class DeleteNode extends SourceNode {
    buildExisting(element) {
        element.parentElement.removeChild(element);
        return false;
    }

    resetRebuild() {

        let nxt = this.nxt;
        if (this.par)
            this.par.remC(this);
        this.nxt = nxt;
    }
}

let SVGNode = wick$1.core.source.compiler.nodes.svg;

SVGNode.prototype.createElement = function(presets, source){
	let element = document.createElementNS("http://www.w3.org/2000/svg", this.tag);
	element.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    element.wick_source = source;
    element.wick_node = this;
    element.wick_id = RootNode.id++;
    return element;
};

SVGNode.prototype.setSource = RootNode.prototype.setSource;
// Rebuild all sources relying on this node
SVGNode.prototype.rebuild = RootNode.prototype.rebuild;
SVGNode.prototype.buildExisting = RootNode.prototype.buildExisting;
SVGNode.prototype.setRebuild = RootNode.prototype.setRebuild;
SVGNode.prototype.resetRebuild = RootNode.prototype.resetRebuild;
SVGNode.prototype.updated = RootNode.prototype.updated;
SVGNode.prototype.reparse_type = SVGNode;

let StyleNode = wick$1.core.source.compiler.nodes.style;

let proto = StyleNode.prototype;
proto.cssInject = proto._processTextNodeHook_;

const path$1 = require("path");
//Hooking into the style systems allows us to track modifications in the DOM and update the appropriate CSS values and documents. 
proto._processTextNodeHook_ = function(lex) {
    //Feed the lexer to a new CSS Builder
    this.css = this.getCSS();
    lex.IWS = true;
    lex.tl = 0;
    lex.n();

    let URL = "";

    let IS_DOCUMENT = !!this.url;

    if (this.url) {
        URL = this.url.path;
        if (!path$1.isAbsolute(URL))
            URL = path$1.resolve(process.cwd(), (URL[0] == ".") ? URL + "" : "." + URL);
    }

    this.css._parse_(lex).catch((e) => {
        throw e;
    }).then((css) => {
        this.css = this.flame_system.css.addTree(css, IS_DOCUMENT, URL);
    });

    this.css.addObserver(this);
};

proto.toString = function(off) {
    let str = `${("    ").repeat(off)}<${this.tag}`,
        atr = this._attributes_,
        i = -1,
        l = atr.length;



    while (++i < l) {
        let attr = atr[i];
        str += ` ${attr.name}="${attr.value}"`;
    }

    if (!this.url && this.css) {
        str += ">\n";
        str += this.css.toString(off + 1);
        str += `${("    ").repeat(off)}</${this.tag}>\n`;
    } else {
        str += `></${this.tag}>\n`;
    }

    return str;
};

proto.updatedCSS = function() {
    this.rebuild();
};

proto.buildExisting = () => { return false };

let RootText = wick$1.core.source.compiler.nodes.text;

RootText.prototype.createElement = RootNode.prototype.createElement;
RootText.prototype.setSource = RootNode.prototype.setSource;
// Rebuild all sources relying on this node
RootText.prototype.rebuild = RootNode.prototype.rebuild;
RootText.prototype.buildExisting = ()=>{return true}; RootNode.prototype.build_existing;
RootText.prototype.setRebuild = RootNode.prototype.setRebuild;
RootText.prototype.resetRebuild = RootNode.prototype.resetRebuild;
RootText.prototype.updated = function(){};

let SourceNode$1 = wick$1.core.source.compiler.nodes.source;
let Lexer$1 = wick$1.core.lexer;

SourceNode$1.prototype.buildExisting = function(element, source, presets, taps) {
    if (true || this.CHANGED !== 0) {
        //IO CHANGE 
        //Attributes
        if (this.CHANGED & 4) {

            let span = document.createElement("span");

            this._build_(span, source, presets, [], taps, {});

            let ele = span.firstChild;

            element.parentElement.replaceChild(ele, element);

            return true;
        }

        if (this._merged_)
            this._merged_.buildExisting(element, source, presets, taps);

        if (true || this.CHANGED & 1) {
            //redo IOs that have changed (TODO)
            for (let i = 0, l = this._bindings_.length; i < l; i++) {
                this._bindings_[i].binding._bind_(source, [], taps, element, this._bindings_[i].name);
            }
        }

        if (true || this.CHANGED & 2) {
            //rebuild children
            let children = element.childNodes;
            for (let i = 0, node = this.fch; node; node = this.getN(node)) {
                let child = children[i];
                if (node.buildExisting(child, source, presets, taps)) i++;
            }
        }
    }

    return true;
};

let SourceTemplateNode = wick$1.core.source.compiler.nodes.template;

let Lexer$2 = wick$1.core.lexer;

SourceTemplateNode.prototype.buildExisting = function(element, source, presets, taps) {
    if (true || this.CHANGED !== 0) {
        //IO CHANGE 
        //Attributes
        if (this.CHANGED & 4) {

            let span = document.createElement("span");

            this._build_(span, source, presets, [], taps, {});

            let ele = span.firstChild;

            element.parentElement.replaceChild(ele, element);

            return true;
        }

        if (this._merged_)
            this._merged_.buildExisting(element, source, presets, taps);

        if (true || this.CHANGED & 1) {
            //redo IOs that have changed (TODO)
            for (let i = 0, l = this._bindings_.length; i < l; i++) {
                this._bindings_[i].binding._bind_(source, [], taps, element, this._bindings_[i].name);
            }
        }

        if (true || this.CHANGED & 2) {
            //rebuild children
            let children = element.childNodes;
            for (let i = 0, node = this.fch; node; node = this.getN(node)) {
                let child = children[i];
                if (node.buildExisting(child, source, presets, taps)) i++;
            }
        }
    }

    return true;
};

let PackageNode = wick$1.core.source.compiler.nodes.package;

let Lexer$3 = wick$1.core.lexer;

PackageNode.prototype.buildExisting = function(element, source, presets, taps) {
    return false;
};

let Script = wick$1.core.source.compiler.nodes.script;

Script.prototype.cssInject = Script.prototype._processTextNodeHook_;

const path$2 = require("path");
//Hooking into the style systems allows us to track modifications in the DOM and update the appropriate CSS values and documents. 
/*Script.prototype._processTextNodeHook_ = function(lex) {
    //Feed the lexer to a new CSS Builder
    this.css = this.getCSS();
    lex.IWS = true;
    lex.tl = 0;
    lex.n();

    let URL = "";

    let IS_DOCUMENT = !!this.url;

    if (this.url) {
        URL = this.url.path;
        if (!path.isAbsolute(URL))
            URL = path.resolve(process.cwd(), (URL[0] == ".") ? URL + "" : "." + URL);
    }

    this.css._parse_(lex).catch((e) => {
        throw e;
    }).then((css) => {
        this.css = this.flame_system.css.addTree(css, IS_DOCUMENT, URL);
    });

    this.css.addObserver(this);
};*/

Script.prototype.toString = function(off) {
    return off + "script";
};

Script.prototype.updatedCSS = function() {
    this.rebuild();
};

Script.prototype.buildExisting = () => { return false };

const scheme = wick$1.scheme;
const core = wick$1.core;

const Model = core.model;
const ModelContainer = core.model.container;
const BinaryTreeModelContainer = core.model.container.btree;
const ArrayModelContainer = core.model.container.array;
const DateModelContainer = core.model.container.btree;
const MultiIndexedContainer = core.model.container.multi;

const EPOCH_Date = scheme.date;
const EPOCH_Time = scheme.time;
const Longitude = scheme.number;
const Latitude = scheme.number;
const $Number = scheme.number;
const $String = scheme.string;
const $Boolean = scheme.bool;

/**
 * Schema for flame_data model
 */
const schemed = wick$1.model.scheme;
const flame_scheme = schemed({
	project : schemed({
		name : $String,
        working_directory : $String,
        temp_directory : $String,
        last_modified : EPOCH_Time,
        creation_date : EPOCH_Time,
	}),
	default  : schemed({
        component  : schemed({
            width: $Number,
            height: $Number
        })
	}),
    settings: schemed({
        KEEP_UNIQUE: $Boolean,
        move_type : $String,
        primary_color: $Number,
        secondary_color : $Number,

    })
});

//Main dna for containing line tokens
class Container_Cell {
	constructor() {
		this.keys = [];
		this.parent = null;
		this.IS_LEAF = true;
		this.min_degree = 20;
		this.index = 0;
		this.num_lines = 0;
		this.num_real_lines = 0;
		this.pixel_offset = 0;
	}

	getLine(offset) {
		if (this.IS_LEAF) {
			if (offset > this.num_lines) offset = this.num_lines - 1;
			return this.keys[offset];
		} else {
			for (var i = 0, l = this.keys.length; i < l; i++) {
				var cell = this.keys[i];

				if (offset < cell.num_lines) {
					return cell.getLine(offset);
				} else offset -= cell.num_lines;
			}
			return this.keys[this.keys.length - 1].getLine(offset);
		}
	}

	getRealLine(offset) {
		if (this.IS_LEAF) {
			for (var i = 0, l = this.keys.length; i < l; i++) {
				var cell = this.keys[i];

				if (offset < cell.size && cell.size > 0) {
					return cell;
				} else offset -= cell.size;
			}
		} else {
			for (var i = 0, l = this.keys.length; i < l; i++) {
				var cell = this.keys[i];
				if (offset < cell.num_real_lines) {
					return cell.getRealLine(offset);
				} else offset -= cell.num_real_lines;
			}
			return this.keys[this.keys.length - 1].getRealLine(offset);
		}
	}

	getLineAtPixelOffset(offset) {
		if (this.IS_LEAF) {
			for (var i = 0, l = this.keys.length; i < l; i++) {
				var cell = this.keys[i];
				if (offset < cell.pixel_height && cell.pixel_height > 0) {
					return cell;
				} else offset -= cell.pixel_height;
			}
			return cell
		} else {
			for (var i = 0, l = this.keys.length; i < l; i++) {
				var cell = this.keys[i];
				if (offset < cell.pixel_offset) {
					return cell.getLineAtPixelOffset(offset);
				} else offset -= cell.pixel_offset;
			}
			return cell.getLineAtPixelOffset(offset);
		}
	}



	getLineIndex(index, line, id) {
		if (this.IS_LEAF) {
			for (var i = 0, l = this.num_lines; i < l; i++) {
				if (this.keys[i] === line) break;
			}
			index = i;
		} else {
			var sibs = this.keys;
			var i = id;
			while (i > 0) {
				i--;
				index += sibs[i].num_lines;
			}
		}

		if (!this.parent.IS_ROOT) return this.parent.getLineIndex(index, null, this.getIndex());


		return index;
	}

	getRealLineIndex(index, line, id) {
		if (this.IS_LEAF) {
			index = -1; //WTF
			for (var i = 0, l = this.num_lines; i < l; i++) {
				var key = this.keys[i];
				index += key.size;
				if (key === line) break;
			}
		} else {
			var sibs = this.keys;
			var i = id;
			while (i > 0) {
				i--;
				index += sibs[i].num_real_lines;
			}
		}

		if (!this.parent.IS_ROOT) return this.parent.getRealLineIndex(index, null, this.getIndex());


		return index;
	}

	getPixelOffset(pixel_top, line, id) {
		if (this.IS_LEAF) {
			//pixel_top = -1; //WTF
			for (var i = 0, l = this.num_lines; i < l; i++) {
				var key = this.keys[i];
				if (key === line) break;
				pixel_top += key.pixel_height;
			}
		} else {
			var sibs = this.keys;
			var i = id;
			while (i > 0) {
				i--;
				pixel_top += sibs[i].pixel_offset;
			}
		}

		if (!this.parent.IS_ROOT) return this.parent.getPixelOffset(pixel_top, null, this.getIndex());

		return pixel_top;
	}

	//Remove sibling on right from parent, combine with its keys and discard sibling and update line
	merge(sib, index) {
		this.parent.keys.splice(index, 1);

		this.keys = this.keys.concat(sib.keys);

		this.getLineCount();

		this.setAsParent();

		this.parent.balance();
	}

	//Take an element from the left and place into head of own keys
	leftRotate(sib) {
		var index = sib.keys.length - 1;
		var element = sib.keys[index];
		sib.keys.splice(index, 1);

		this.keys.splice(0, 0, element);

		this.getLineCount();
		sib.getLineCount();
		this.setAsParent();

		this.parent.balance();
	}

	//Take an element from the right and place into tail of own keys
	rightRotate(sib) {
		var index = 0;
		var element = sib.keys[index];

		sib.keys.splice(index, 1);

		this.keys.push(element);

		this.getLineCount();
		sib.getLineCount();
		this.setAsParent();

		this.parent.balance();
	}

	balance() {
		//debugger
		var siblings = this.parent.keys;

		if (this.checkMinLimit()) {

			if (this.parent.IS_ROOT) return;
			//try left rotate
			var id = this.getIndex();

			//Something went horribly wrong if this happened
			if (id < 0) debugger;

			if (id > 0) {
				if (siblings[id - 1].keys.length > this.min_degree) {
					this.leftRotate(siblings[id - 1]);
				}
				siblings[id - 1].merge(this, id);
			} else if (id < siblings.length - 1) {
				if (siblings[id + 1].keys.length > this.min_degree) {
					this.rightRotate(siblings[id + 1]);
				}
				this.merge(siblings[id + 1], id + 1);
			}
		}
	}

	remove(line) {
		for (var i = 0, l = this.keys.length; i < l; i++) {
			if (this.keys[i] === line) {
				this.keys.splice(i, 1);
				this.decrementNumOfLines();
				this.decrementNumOfRealLines(line.size);
				this.decrementPixelOffset(line.pixel_height);
				this.balance();
				return;
			}
		}
	}

	split() {
		var sib = new Container_Cell();

		sib.parent = this.parent;

		sib.IS_LEAF = this.IS_LEAF;

		sib.keys = this.keys.slice(this.min_degree);

		this.keys = this.keys.slice(0, this.min_degree);

		this.getLineCount();
		sib.getLineCount();
		sib.setAsParent();

		return sib;
	}

	insert(line, index) {
		//if leaf, insert line at index position
		if (this.IS_LEAF) {
			line.parent = this;
			this.keys.splice(index, 0, line);
			this.incrementNumOfLines();
			this.incrementNumOfRealLines(line.size);
			this.incrementPixelOffset(line.pixel_height);
		} else {
			for (var i = 0, l = this.keys.length; i < l; i++) {
				var cell = this.keys[i];
				//Check to see if cell needs to be split. 
				if (cell.checkMaxLimit()) {
					//Insert the resulting operation, which transferes half the keys/lines of 
					//current cell into a new cell and returns that new cell, into the current array
					//right after the current cell.
					this.keys.splice(i + 1, 0, cell.split());
					//Increment the length so we don't miss out on the last cell
					l++;
				}
				if (index < cell.num_lines) {
					cell.insert(line, index);

					return;
				} else index -= cell.num_lines;
			}
			//If here then index is greater than number of current lines.
			//Line should be inserted into the last cell anyways, extending the number of lines in the entire tree
			this.keys[this.keys.length - 1].insert(line, Infinity);
		}
	}

	checkMaxLimit() {
		return this.keys.length >= this.min_degree * 2 - 1;
	}

	checkMinLimit() {
		return this.keys.length < this.min_degree;
	}

	getLineCount() {
		var num = 0,
			num2 = 0,
			num3 = 0;
		if (this.IS_LEAF) {
			for (var i = 0, l = this.keys.length; i < l; i++) {
				num += this.keys[i].size;
				num2 += this.keys[i].pixel_height;

			}
			this.num_lines = this.keys.length;
			this.num_real_lines = num;
			this.pixel_offset = num2;
		} else {
			for (var i = 0, l = this.keys.length; i < l; i++) {
				num += this.keys[i].num_lines;
				num2 += this.keys[i].num_real_lines;
				num3 += this.keys[i].pixel_offset;
			}
			this.num_real_lines = num2;
			this.num_lines = num;
			this.pixel_offset = num3;
		}

		return this.num_lines;
	}

	getIndex() {
		var keys = this.parent.keys;
		for (var i = 0, l = keys.length; i < l; i++) {
			if (keys[i] === this) return i;
		}
		return -1;
	}

	setAsParent() {
		for (var i = 0, l = this.keys.length; i < l; i++) {
			this.keys[i].parent = this;
		}
	}

	incrementNumOfRealLines(i) {
		if (i < 1) return;
		this.num_real_lines += i;
		this.parent.incrementNumOfRealLines(i);
	}

	decrementNumOfRealLines(i) {
		if (i < 1) return;
		this.num_real_lines -= i;
		this.parent.decrementNumOfRealLines(i);
	}

	incrementNumOfLines() {
		this.num_lines++;
		this.parent.incrementNumOfLines();
	}

	decrementNumOfLines() {
		this.num_lines--;
		this.parent.decrementNumOfLines();
	}

	incrementPixelOffset(px) {
		this.pixel_offset += px;
		this.parent.incrementPixelOffset(px);
	}

	decrementPixelOffset(px) {
		this.pixel_offset -= px;
		this.parent.decrementPixelOffset(px);
	}
}



class Token_Container {
	constructor() {
		this.root = null;
		this.IS_ROOT = true;
		this.num_lines = 0;
		this.num_real_lines = 0;
		this.pixel_height = 0;
	}

	incrementNumOfLines() {
		this.num_lines++;
	}

	decrementNumOfLines() {
		this.num_lines--;
	}

	incrementNumOfRealLines(i) {
		this.num_real_lines += i;
	}

	decrementNumOfRealLines(i) {
		this.num_real_lines -= i;
	}

	incrementPixelOffset(px) {
		this.pixel_height += px;
	}

	decrementPixelOffset(px) {
		this.pixel_height -= px;
	}

	getLine(index) {
		if (index >= this.num_lines) index = this.num_lines - 1;
		return this.root.getLine(index);
	}
	getRealLine(index) {
		if (index >= this.num_real_lines) index = this.num_real_lines - 1;
		return this.root.getRealLine(index);
	}

	getLineAtPixelOffset(pixel_height) {
		if (pixel_height >= this.pixel_height) {
			pixel_height = this.pixel_height - 1;
		}

		return this.root.getLineAtPixelOffset(pixel_height);
	}

	//Transition kludges ****************************
	getIndexedLine(offset) {
		return this.getLine(offset);
	}

	get count() {
		return this.num_lines;
	}

	get countWL() {
		return this.num_lines;
	}
	setIndexes() {}
	getHeight() {
		return this.num_lines;
	}

	get height() {
		return this.num_lines;
	}
	//**********************************************************
	get length() {
		return this.num_lines;
	}

	insert(line, index = Infinity) {
		//If index is not defined, use infinity to ensure that line is placed in the last position;

		var root = this.root;

		if (!root) {
			this.root = new Container_Cell();
			this.root.parent = this;
			this.root.insert(line, index);
		} else {
			if (root.checkMaxLimit()) {
				var new_root = new Container_Cell();

				new_root.parent = this;

				new_root.IS_LEAF = false;

				root.parent = new_root;

				new_root.keys = [root, root.split()];

				root = this.root = new_root;

				root.getLineCount();
			}

			root.insert(line, index);
		}
	}

	remove(line) {
		var cell = line.parent;
		cell.remove(line);
	}
}

//[Singleton]  Store unused tokens, preventing garbage collection of tokens
var TEXT_POOL = new(function() {
	this.pool = null;
	//this.token_pool = new TEXT_TOKEN();

	function Text(index, text) {
		this.text = text || "";
		this.index = index || 0;
		this.prev_sib = null;
		this.next_sib = null;
	}

	this.aquire = function(index, text) {
		var temp = this.pool;
		if (temp) {
			this.pool = temp.prev_sib;
			temp.index = index;
			temp.text = text;
			temp.prev_sib = null;
			return temp;
		} else {
			return new Text(index, text);
		}
	};

	this.release = function(object) {
		object.prev_sib = this.pool;
		this.pool = object;
	};

	for (var i = 0; i < 50; i++) {
		var temp = new Text();
		temp.prev_sib = this.pool;
		this.pool = temp;
	}
})();

//Releases given token to pool and returns that token's previous sibling.
function releaseToken(token) {
	var prev_line = token.prev_line;
	var next_line = token.next_line;

	var prev_sib = token.prev_sib;
	var next_sib = token.next_sib;

	if (prev_sib) {
		prev_sib.next_sib = next_sib;
	}
	if (next_sib) {
		next_sib.prev_sib = prev_sib;
	}
	if (prev_line) {
		if (next_sib && next_sib.IS_NEW_LINE) {
			prev_line.next_line = next_sib;
		} else {
			prev_line.next_line = next_line;
		}
	}
	if (next_line) {
		if (prev_sib && prev_sib.IS_NEW_LINE) {
			next_line.prev_line = prev_sib;
		} else {
			next_line.prev_line = prev_line;
		}
	}

	if (token.IS_NEW_LINE) {
		this.token_container.remove(token);
		this.setIndexes();
	}

	var t = token.prev_sib;
	token.reset();
	token.next_sib = this.token_pool;
	token.prev_sib = null;
	token.text = "";
	this.token_pool = token;
	return t;
}

//Either returns an existing token from pool or creates a new one and returns that.
function aquireToken(prev_token) {
	var t = this.token_pool;

	if (t) {
		if (t.next_sib) {
			this.token_pool = t.next_sib;
			this.token_pool.prev_sib = null;
		} else {
			this.token_pool = new TEXT_TOKEN(this, null);
		}
	} else {
		t = new TEXT_TOKEN(this, null);
	}

	t.reset();

	if (prev_token) {
		t.prev_line = prev_token.prev_line;
		t.next_line = prev_token.next_line;

		if (prev_token.IS_NEW_LINE) {
			t.prev_line = prev_token;
		}

		t.next_sib = prev_token.next_sib;
		t.prev_sib = prev_token;
		prev_token.next_sib = t;
		if (t.next_sib) {
			t.next_sib.prev_sib = t;
		}
	}
	return t;
}

//Token represents a single text unit, which either can be a new line, or any the symbols defined in the token parse and format array object which maintained by the text_fw object
//Special consideration is given to new line tokens, as they are considered the root element for each line. 
class TEXT_TOKEN {
	constructor(text_fw) {

		this.text_insert = null;

		this.text = "";
		this.style = "";
		this.type = "new_line";
		this.html_cache = "";
		this.CACHED = false;
		this.HTML_CACHED = false;

		this.char_start = 0;
		this.text_fw = text_fw;

		this.prev_sib = null;
		this.next_sib = null;

		//Token as line
		this.next_line = null;
		this.prev_line = null;
		this.IS_NEW_LINE = false;

		//container variables
		this.line_size = 1;
		this.size = 1;
		this.pixel_height = 30;

		this.NEED_PARSE = true;
		this.IS_NEW_LINE = false;
		this.IS_LINKED_LINE = false;
	}

	//Resets vaules to unbiased defaults
	reset() {
		this.pixel_height = 30;
		this.char_start = 0;
		this.next_line = null;
		this.prev_line = null;
		this.prev_sib = null;
		this.next_sib = null;
		this.NEED_PARSE = true;
		this.HTML_CACHED = false;
		this.IS_LINKED_LINE = false;
		this.IS_NEW_LINE = false;
		this.text_insert = null;
		this.type = "";
		this.size = 1;
		this.setText("");
		this.color = "black";
	}

	setText(text) {
		this.text = text;
		this.NEED_PARSE = true;
	}

	//Removes siblings of a new line token and appends their strings to the new line text
	flushTokens(offset) {
		if (!this.IS_NEW_LINE) {
			//Jump to head of line
			if (this.prev_line) {
				return this.prev_line.flushTokens();
			} else {
				//The top most token should always be a new line. If here, something went really wrong
				throw (this)
			}
		}

		var text = this.text;

		var token = this.next_sib;

		var offsets = this.length - 1;

		if (this.IS_LINKED_LINE) {
			while (token && !(token.IS_NEW_LINE)) {
				text += token.text;
				token = this.text_fw.releaseToken(token).next_sib;
			}
		} else {
			while (token && !(token.IS_NEW_LINE && !token.IS_LINKED_LINE)) {
				if (token.IS_LINKED_LINE) {

					//merge texts
					if (token.text_insert) {
						token.setTempTextOffsets(offsets).prev_sib = this.text_insert;
						this.text_insert = token.text_insert;
						token.text_insert = null;
					}

					offsets += token.length;
					text += token.text;
				} else {
					text += token.text;
				}

				token = this.text_fw.releaseToken(token).next_sib;
			}
		}


		this.setText(text);

		return this;
	}

	setTempTextOffsets(offset) {
		var temp = this.text_insert;
		var last = null;
		while (temp) {
			temp.index += offset;
			last = temp;
			temp = temp.prev_sib;
		}
		return last
	}

	mergeLeft() {
		if (!this.IS_NEW_LINE) {
			return this.prev_line.mergeLeft();
		}
		if (!this.prev_line) return;

		if (this.IS_LINKED_LINE) {
			if (this.prev_line.IS_LINKED_LINE) {
				return this.prev_line.mergeLeft();
			} else {
				return this.prev_line.flushTokens();
			}
		}
		this.flushTokens();

		if (this.prev_line === this) {
			return this;
		}

		this.prev_line.flushTokens();

		var text = this.prev_line.text + this.text.slice((this.text[0] === this.text_fw.new_line) | 0);

		this.prev_line.setText(text);

		return this.text_fw.releaseToken(this);
	}

	//Store new inserted text into tempory tokens, whose contents will be merged into the actaul token list when parsed.
	insertText(text, char_pos) {
		var l = this.cache.length;
			//Account for new line character

		if (char_pos > l) {
			if (this.next_line) {
				return this.next_line.insertText(text, char_pos - l)
			} else {
				char_pos = this.text.length;
			}
		} else if (char_pos < 0) {
			if (this.prev_line) {
				return this.prev_line.insertText(text, this.prev_line.length - char_pos);
			} else {
				char_pos = 0;
			}
		}
		return this.addTextCell(text, char_pos);
	}

	addTextCell(text, index) {
		var temp = TEXT_POOL.aquire(index, text);
		temp.prev_sib = null;
		var temp_prev = null;
		var temp_next = this.text_insert;

		if (!this.text_insert) {
			this.text_insert = temp;
		} else {
			while (true) {
				if (temp_next) {
					if (temp_next.index <= temp.index) {
						//insert before;
						if (temp_prev) {
							temp.prev_sib = temp_next;
							temp_prev.prev_sib = temp;
						} else {
							temp.prev_sib = temp_next;
							this.text_insert = temp;
						}
						break;
					}
					if (!temp_next.prev_sib) {
						temp_next.prev_sib = temp;
						break;
					}
					temp_prev = temp_next;
					temp_next = temp_prev.prev_sib;
				}
			}
		}
		var token = this;
		while (token.IS_LINKED_LINE) {
			token = token.prev_line;
		}

		token.NEED_PARSE = true;
		return token;
	}

	get index() {
		if(!this.IS_NEW_LINE) return this.prev_line.index;
		return this.parent.getLineIndex(0, this);
	}

	set index(e) {
		//this.parent.remove(this);
	}

	get real_index() {
		if(!this.IS_NEW_LINE) return this.prev_line.real_index;
		return this.parent.getRealLineIndex(0, this);
	}

	set real_index(e) {

	}

	get pixel_offset() {
		return this.parent.getPixelOffset(0, this);
	}

	setPixelOffset() {

	}
	//Takes the token text string and breaks it down into individaul pieces, linking resulting tokens into a linked list.
	parse(FORCE) {
		if (!this.NEED_PARSE && !FORCE) return this.next_sib;



		//debugger
		if (this.IS_NEW_LINE) {
			this.flushTokens();
		}

		//CACHE parse functions variables
		var
			SPF = this.text_fw.SPF,
			SPF_length = SPF.length,
			SPF_function = null,
			text_length = 0,
			code = 0,
			token_length = 0,
			text = null,
			temp = null;

		//Reset token type	
		this.type = "generic";

		//This function will change structure of tokens, thus resetting cache.
		this.CACHED = false;
		this.HTML_CACHED = false;
		this.IS_WHITESPACE = false;
		this.NEED_PARSE = false;



		var del_char = this.text_fw.del_char;

		//Walk the temporary text chain and insert strings into the text variable : History is also appended to through here
		if (this.text_insert) {
			//These get added to history

			var fw = this.text_fw;

			var i = 0,
				temp = this.text_insert;
			while (temp) {
				var text = temp.text;
				var index = temp.index + 1;
				var prev_sib = temp.prev_sib;

				TEXT_POOL.release(temp);

				//add saved text to history object in framework

				//text inserts get seperated as character insertions, delete characters, and cursors

				if (index < this.text.length && index > 0) {
					this.text = this.text.slice(0, index) + text + this.text.slice(index);
				} else if (index > 0) {
					this.text = this.text + text;
				} else {
					this.text = text + this.text;
				}

				temp = prev_sib;
			}

			this.text_insert = null;

			//Perform a lookahead for delete characters
			for (i = 1; i < this.text.length; i++) {
				if (i === 0) continue;
				var s = this.text.charCodeAt(i);
				var f = this.text.charCodeAt(i - 1);
				if (( /*f !== this.text_fw.new_line_code && */ f !== this.text_fw.del_code) && s === this.text_fw.del_code) {					
					if(f === this.text_fw.new_line_code && !this.prev_sib){
						break;
					}


					i--;
					this.text = this.text.slice(0, i) + this.text.slice(i + 2);
					i--;
				}
			}
		}

		//Check for wrapping
		//if (this.char_start > 80 && this.text.charCodeAt(0) !== 28) {
		//	this.text = this.text_fw.linked_line + this.text;
		//}


		text_length = this.text.length;
		text = this.text;
		code = this.text.charCodeAt(0);



		//Check for existence of mismatched new line tokens
		if (this.IS_NEW_LINE && !(code === this.text_fw.new_line_code || code === this.text_fw.linked_line_code)) {
			//Merge back into last line;
			return this.mergeLeft();
		}

		//Default parse functions
		router: switch (code) {
			case this.text_fw.del_code: // Backspace Character
				//reinsert this into the previous line
				//get text of previous sibling
				var prev_sib = this.prev_sib;
				if (prev_sib) {
					//debugger	
					if (prev_sib.IS_NEW_LINE) {

						//Linked lines don't have a length, so the delete character would not be exausted.
						if (!prev_sib.IS_LINKED_LINE) {
							this.text = this.text.slice(1);

							if(!prev_sib.prev_sib){
								return this.mergeLeft();
							}
						}

						//insert into the previous line and flush it
						prev_sib = this.text_fw.releaseToken(prev_sib);

						var prev_line = prev_sib;
						
						if (!prev_line.IS_NEW_LINE) {
							prev_line = prev_sib.prev_line;
						}

						var root = prev_sib.prev_line.addTextCell(this.text, prev_line.length + 1);

						this.text_fw.releaseToken(this);

						return root.parse();
					} else {
						this.text = this.text.slice(1);
						prev_sib.setText(prev_sib.text.slice(0, -1) + this.text);
						return this.text_fw.releaseToken(this).parse();
					}
				} else {
					debugger
					this.text = this.text.slice(1);
				}
				break;
			case this.text_fw.linked_line_code: // Carriage Return // Linked Lines for text wrap
				this.size = 0;
				this.pixel_height = 10;
				this.IS_LINKED_LINE = true;
				if (!this.IS_NEW_LINE) {
					this.text_fw.insertLine(this.prev_line, this);
				}
				this.text = this.text.slice(1);
				this.char_start = 0;
				token_length = 0;
				break;
			case this.text_fw.new_line_code: // Line Feed
				//this.pixel_height = 30
				this.IS_LINKED_LINE = false;
				if (!this.IS_NEW_LINE) {
					this.text_fw.insertLine(this.prev_line, this);
				}
				this.char_start = 0;
				token_length = 1;
				break;
				//Cursor Character - Tells token to move specific cursor to line and character offset
			case this.text_fw.curs_code:
				//Update cursor position;
				var cursor = this.text_fw.aquireCursor();
				if (cursor) {
					cursor.y = this.prev_line.index;
					cursor.x = this.char_start + ((this.prev_line.IS_LINKED_LINE | 0) - 1);
				}
				//Remove cursor section from text
				var text = text.slice(1);
				var prev_sib = this.text_fw.releaseToken(this);
				//Reparse or move on to next token
				if (text.length > 0) { 
					//Reconnect string to the previous token and parse it
					prev_sib.text += text;
					return prev_sib.parse(true);
				} else {
					//Remove this token from linup. It contained only the cursor section and is not needed for any other purpose
					return prev_sib.next_sib;
				}
			default:
				token_length = 1;

				for (i = 0; i < SPF_length; i++) {
					SPF_function = SPF[i];
					let test_index = SPF_function.check(code, text);
					if (test_index > 0) {
						this.type = SPF_function.type;

						for (i = test_index; i < text_length; i++) {
							if (!SPF_function.scanToEnd(text.charCodeAt(i))) {
								token_length = i;
								break router;
							}
						}
						token_length = i;
						break router;
					}
				}
		}


		//If not at end of string, split off last part of string and pass off into new token for further processing
		if (token_length < text_length) {
			temp = this.text_fw.aquireToken(this);
			temp.setText(this.text.slice(token_length, this.text.length));

			//Split happens here
			this.text = this.text.slice(0, token_length);
			temp.char_start = this.char_start + token_length;
		}

		this.token_length = token_length;

		//cache format function for faster testing and executing

		//Format function will apply color and other text formatting attributes for specific type
		if (SPF_function) SPF_function.format(this);

		if (this.prev_line.IS_LINKED_LINE) this.color = "red";


		//Continue down chain of cells
		return this.next_sib;
	}

	charAt(index) {
		//get root line
		if (!this.IS_NEW_LINE) return this.prev_line.charAt(index);

		if (index <= 0) return this.text;
		return this.renderDOM(true, this.text)[index];
	}

	get cache() {
		if (!this.CACHED) {
			this.CACHED = true;

			var text = "";
			var token = this.next_sib;

			while (token && !(token.IS_NEW_LINE)) {
				text += token.text;
				token = token.next_sib;
			}

			this.plain_text = text;
		}
		return this.plain_text;
	}
	set cache(p) {

	}


	get length() {
		if (this.IS_NEW_LINE) {
			var token = this.next_sib;
			var length = this.text.length;
			while (token && !token.IS_NEW_LINE) {
				length += token.length;
				token = token.next_sib;
			}
			return length;
		} else return this.text.length;
	}
	set length(p) {

	}


	//Creates, or appends, a string that contains <PRE> enclosed formatted text ready for insertion into the DOM.
	renderDOM(plain_text, text) {
		if (this.IS_NEW_LINE) {
			if (plain_text) {
				return this.cache;
			} else {
				if (!this.HTML_CACHED) {

					this.cached_html = "";

					var token = this.next_sib;

					//Only non New Line tokens will have their strings appended
					while (token && !token.IS_NEW_LINE) {
						this.cached_html += token.renderDOM(plain_text);
						token = token.next_sib;
					}

					this.HTML_CACHED = true;
				}
				return this.cached_html;
			}
		} else {
			if (plain_text) {
				return this.text;
			} else {
				if (this.color !== "black") {

					return `<span style="color:${this.color}">${this.text}</span>`;
				}
				return this.text;
			}
		}
	}

	renderToBuffer(buffer, offsets, line) {
		if (this.IS_NEW_LINE) {

			offsets = {
				buffer: offsets,
				line,
				x: 0,
				count: 0
			};

			var token = this.next_sib;
			while (token && !token.IS_NEW_LINE) {
				token.renderToBuffer(buffer, offsets);
				token = token.next_sib;
			}
			return offsets.count;
		} else {
			for (var i = 0; i < this.text.length; i++) {
				//pos x
				var code = this.text.charCodeAt(i);
				var font = this.text_fw.font;
				var index = code - 33;


				//
				// offsets.x += 6
				//position
				buffer[offsets.buffer + 0] = offsets.x;
				buffer[offsets.buffer + 1] = 0; //offsets.line
				//texture index
				buffer[offsets.buffer + 2] = code - 33;

				offsets.buffer += 3;

				if (index > 0) {
					if (font.props.length === 94) offsets.x += font.props[code - 33].width * 0.5 + 0.5;
				} else {
					offsets.x += 1;
				}

				offsets.count++;
			}
		}
	}
}

class TEXT_CURSOR {
	constructor(text_fw) {
		//On screen HTML representation of cursor
		this.HTML_ELEMENT = null;
		//this.HTML_ELEMENT = document.createElement("div");
		//this.HTML_ELEMENT.classList.add("txt_cursor");
		

		//Character and Line position of cursor
		this.x = 0;
		this.y = 0;

		//Character and Line position of cursor selection bound
		this.selection_x = -1;
		this.selection_y = -1;


		//Real position of cursor line and character. These values is related to the total number of non Linked Lines found in the
		//line container object. Lines that are linked are treated as character indexes extending from non Linked Lines.

		this.rpx = 0;
		this.rpy = 0;



		//Same for selection bounds. 
		this.rpsx = 0;
		this.rpsy = 0;


		this.index = 0;
		this.text_fw = text_fw;
		this.line_container = text_fw.token_container;
		this.char_code = text_fw.curs_char;
		this.selections = [];
		this.line_height = 0;

		//FLAGS
		this.IU = false;
		this.REAL_POSITION_NEEDS_UPDATE = true;
		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;
	}

	toString() {
		this.text_fw.token_container.getRealLine(this.real_position_y).insertText(this.char_code, this.real_position_x);
	}

	get HAS_SELECTION() {
		return (this.selection_x > -1 && this.selection_y > -1);
	}

	set HAS_SELECTION(p) {

	}

	get IN_USE() {
		return this.IU;
	}

	set IN_USE(bool) {
		if (bool !== this.IU) {
			if (bool) {
			//	this.text_fw.parent_element.appendChild(this.HTML_ELEMENT);
			} else {
			//	this.text_fw.parent_element.removeChild(this.HTML_ELEMENT);
				this.resetSelection();
				this.REAL_POSITION_NEEDS_UPDATE = true;
				this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;
			}
			this.IU = bool;
		}
	}

	resetSelection() {
		this.selection_x = -1;
		this.selection_y = -1;

		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;

		for (var i = 0; i < this.selections.length; i++) {
			var div = this.selections[i];
			div.hide();
		}
	}

	set size(scale) {
		this.HTML_ELEMENT.style.width = 1 * scale + "px";
		this.HTML_ELEMENT.style.height = this.line_height * scale + "px";
	}

	get id() {
		return this.x | (this.y << 10);
	}

	get lineLength() {
		var line = this.text_fw.token_container.getLine(this.y);
		if (line) {
			return line.length + ((line.IS_LINKED_LINE | 0) - 1)
		} else {
			return 0;
		}
	}

	get lineLength_Select() {
		var line = this.text_fw.token_container.getLine(this.selection_y);
		if (line) {
			return line.length + ((line.IS_LINKED_LINE | 0) - 1)
		} else {
			return 0;
		}
	}

	getXCharOffset(x_in, y_in) {
		var y = (((y_in) * this.text_fw.line_height) - 1),
			x = 0;

		if (this.text_fw.font.IS_MONOSPACE) {
			//Monospace fonts need only add up all charcters and scale by width of any character
			x = (Math.min(x_in, line.length - 1) * this.text_fw.font.props[0].width2);
		} else {
			//Non Monospace fonts will have to build up offset by measuring individual character widths
			var fontData = this.text_fw.font.props;
			var line = this.getLine(y_in);
			if (line) {
				var text = line.renderDOM(true);
				//Cap to end of line to prevent out of bounds reference
				var l = Math.min(x_in, line.length + ((line.IS_LINKED_LINE | 0) - 1));
				for (var i = 0; i < l; i++) {
					var code = text.charCodeAt(i) - 32;
					var char = fontData[code];

					if (code < 0) {
						x += 0;
					} else
						x += char.width;
				}

			}
		}
		return x;
	}

	getRealPosition(x, y) {
		var line = this.line_container.getLine(y);
		var offset_length = 0;

		//Trace linked line chains to their originating location, which is the last non-linked line

		if (line.IS_LINKED_LINE) {
			line = line.prev_line;
			while (line.IS_LINKED_LINE) {
				offset_length += line.cache.length;
				line = line.prev_line;
				y--;
			}
			y--;
			offset_length += line.cache.length;
		}
		return {
			x: offset_length + x,
			y: line.real_index
		};
	}

	updateRealPosition(FORCE) {
		if (this.REAL_POSITION_NEEDS_UPDATE || FORCE) {
			var temp = this.getRealPosition(this.x, this.y);
			this.rpy = temp.y;
			this.rpx = temp.x;
			this.REAL_POSITION_NEEDS_UPDATE = false;
		}
	}

	updateRealSelectPosition(FORCE) {
		if (this.REAL_SELECT_POSITION_NEEDS_UPDATE || FORCE) {
			var temp = this.getRealPosition(this.selection_x, this.selection_y);
			this.rspy = temp.y;
			this.rspx = temp.x;
			this.REAL_SELECT_POSITION_NEEDS_UPDATE = false;
		}
	}

	get real_position_x() {
		this.updateRealPosition();
		return this.rpx;
	}

	set real_position_x(x) {
		var line = this.line_container.getLine(this.y);
		while (line && x > line.cache.length) {
			this.y++;
			x -= line.cache.length;
			line = line.next_line;
			x += ((line.IS_LINKED_LINE | 0) - 1);
		}

		this.x = x;
		this.updateRealPosition(true);
	}



	get real_position_y() {
		this.updateRealPosition();
		return this.rpy;
	}
	set real_position_y(y) {
		this.y = this.line_container.getRealLine(y).index;
		this.updateRealPosition(true);
	}

	//These are for the text selection part of the cursor
	get real_select_position_x() {
		if (this.selection_x < 0) return -1;
		this.updateRealSelectPosition();
		return this.rspx;
	}

	set real_select_position_x(x) {
		var line = this.line_container.getLine(this.selection_y);
		while (line && x > line.cache.length) {
			this.selection_y++;
			x -= line.cache.length; //- ;
			line = line.next_line;
			x += ((line.IS_LINKED_LINE | 0) - 1);

		}
		this.selection_x = x;
		this.updateRealSelectPosition(true);
	}

	get real_select_position_y() {
		if (this.selection_y < 0) return -1;
		this.updateRealSelectPosition();
		return this.rspy;
	}
	set real_select_position_y(y) {
		this.selection_y = this.line_container.getRealLine(y).index;
		this.updateRealSelectPosition(true);
	}

	createSelection(y, x_start, x_end, xc, yc, scale) {
		if (!this.selections) {
			for (var i = 0; i < this.selections.length; i++) {
				var div = this.selections[i];
				div.hide();
			}
			this.selection_index = 0;
		}

		if (!this.selections[this.selection_index]) {
			var div = document.createElement("div");
			div.style.cssText = `
			position:absolute;
			top:0;
			left:0;
			background-color:rgba(250,0,0,0.5);
	 		z-index:30000000000;
		`;
			this.selections[this.selection_index] = div;

		}

		var div = this.selections[this.selection_index];
		this.selection_index++;
		var x1 = this.getXCharOffset(x_start, y);
		var x2 = this.getXCharOffset(x_end, y);
		var width = x2 - x1;

		div.show();
		div.style.left = ((x1 + xc) * scale) + "px";
		div.style.top = ((this.getYCharOffset(y) + yc) * scale) + "px";
		div.style.width = width * scale + "px";
		div.style.height = 16 * scale + "px";
		this.text_fw.parent_element.appendChild(div);
	}

	getSortedPositions() {
		this.REAL_POSITION_NEEDS_UPDATE = true;
		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;

		var x1 = this.x;
		var y1 = this.y;
		var x2 = this.selection_x;
		var y2 = this.selection_y;
		if (this.selection_x > -1 && this.selection_y > -1) {
			var id1 = this.id;
			var id2 = (this.selection_y << 10) | this.selection_x;

			if (id2 < id1) {
				var x1 = this.selection_x;
				var y1 = this.selection_y;
				var x2 = this.x;
				var y2 = this.y;
			}
		}
		return {
			x1, y1, x2, y2
		};
	}

	arrangeSelection() {
		this.REAL_POSITION_NEEDS_UPDATE = true;
		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;

		if (this.HAS_SELECTION) {
			var id1 = this.id;
			var id2 = (this.selection_y << 10) | this.selection_x;

			if (id2 < id1) {
				var x1 = this.selection_x;
				var y1 = this.selection_y;
				var x2 = this.x;
				var y2 = this.y;
			} else {
				var x1 = this.x;
				var y1 = this.y;
				var x2 = this.selection_x;
				var y2 = this.selection_y;
			}

			this.x = x1;
			this.y = y1;
			this.selection_x = x2;
			this.selection_y = y2;
		}
	}

	getLine(y_in) {
		return this.text_fw.token_container.getIndexedLine(y_in || this.y)
	}

	getYCharOffset(y_in) {
		return (((y_in) * this.text_fw.line_height) - 1)
	}
	//Returns string of concated lines between [x,y] and [x2,y2]. Returns empty string if [x2.selection_y] is less then 0;
	getTextFromSelection() {
		var string = "";
		if (this.HAS_SELECTION) {
			this.selection_index = 0;
			//Sets each tokens selected attribute to true
			var id1 = this.id;
			var id2 = (this.selection_y << 10) | this.selection_x;

			if (id2 < id1) {
				var x1 = this.selection_x;
				var y1 = this.selection_y;
				var x2 = this.x;
				var y2 = this.y;
			} else {
				var x1 = this.x;
				var y1 = this.y;
				var x2 = this.selection_x;
				var y2 = this.selection_y;
			}

			var line_count = y2 - y1;


			//Append first line out of loop. Each successive line will have the newline control character inserted at head of appending string. 
			var line = this.getLine(y1);

			string += line.cache.slice(x1, (line_count > 0) ? line.cache.length : Math.min(x2, line.cache.length));

			for (var i = 1; i < line_count + 1; i++) {
				var x_start = 0;
				var y = y1 + i;
				line = this.getLine(y);
				var length = line.cache.length;
				var x_end = length;

				if (i == line_count) {
					x_end = Math.min(x2, length);
				}

				string += ((line.IS_LINKED_LINE) ? "" : this.text_fw.new_line) + line.cache.slice(x_start, x_end);
			}
		}
		return string;
	}

	update(camera, scale, xc, yc) {
		// todo - correct font data 


		//Set cursor size to mach current zoom level of camera
		this.size = scale;

		this.HTML_ELEMENT.style.left = ((this.getXCharOffset(this.x, this.y) + xc) * scale) + "px";


		this.HTML_ELEMENT.style.top = ((this.line_container.getLine(this.y).pixel_offset + yc) * scale) + "px";

		//Update shading for selections

		for (var i = 0; i < this.selections.length; i++) {
				var div = this.selections[i];
				div.hide();
			}
		if (this.HAS_SELECTION) {
			this.selection_index = 0;


			var id1 = this.id;
			var id2 = (this.selection_y << 10) | this.selection_x;

			if (id2 < id1) {
				var x1 = this.selection_x;
				var y1 = this.selection_y;
				var x2 = this.x;
				var y2 = this.y;
			} else {
				var x1 = this.x;
				var y1 = this.y;
				var x2 = this.selection_x;
				var y2 = this.selection_y;
			}

			var line_count = y2 - y1;

			for (var i = 0; i < line_count + 1; i++) {
				var x_start = 0;
				var y = y1 + i;
				var line = this.getLine(y);
				var x_end = line.length - ((line.IS_LINKED_LINE) ? 0 : 1);

				if (i === 0) {
					x_start = x1;
				}

				if (i == line_count) {

					x_end = Math.min(x2, line.length - ((line.IS_LINKED_LINE) ? 0 : 1));
				}

				this.createSelection(y, x_start, x_end, xc, yc, scale);
			}


		}
	}


	//Sets cursor to line givin pixel coordinates
	setX(x) {
		this.REAL_POSITION_NEEDS_UPDATE = true;

		if (this.text_fw.font.IS_MONOSPACE) {
			this.x = Math.min(Math.max(Math.round(x / this.text_fw.font.props[0].width), 0), this.lineLength);
		} else {
			var fontData = this.text_fw.font.props;
			var line = this.line_container.getLine(this.y);
			var text = line.cache;
			var l = text.length;
			var y = 0;

			var diff = this.y - line.index;
			var offset = 0;
			var i = 0;

			for (; i < l; i++) {
				var code = text.charCodeAt(i) - 32;
				var char = fontData[code];
				y += char.width;
				if ((x + 2) < y) {
					break;
				}
			}
			this.x = i;
		}
	}

	setY(y) {
		this.REAL_POSITION_NEEDS_UPDATE = true;
		var line = this.line_container.getLineAtPixelOffset(y);
		this.y = line.index;
		this.line_height = line.pixel_height;
	}


	setSelectionX(x) {
		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;
		if (this.text_fw.font.IS_MONOSPACE) {
			this.selection_x = Math.min(Math.max(Math.round(x / this.text_fw.font.props[0].width), 0), this.lineLength_Select);
		} else {
			var fontData = this.text_fw.font.props;
			var line = this.line_container.getLine(this.selection_y);
			var text = line.cache;
			var l = text.length;
			var y = 0;

			var diff = this.y - line.index;
			var offset = 0;
			var i = 0;

			for (; i < l; i++) {
				var code = text.charCodeAt(i) - 32;
				var char = fontData[code];
				y += char.width;
				if ((x + 2) < y) {
					break;
				}
			}
			this.selection_x = i;
		}
	}

	setSelectionY(y) {
		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;
		this.selection_y = this.line_container.getLineAtPixelOffset(y).index;
	}

	setToSelectionTail() {
		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;
		this.REAL_POSITION_NEEDS_UPDATE = true;

		var id1 = this.id;
		var id2 = (this.selection_y << 10) | this.selection_x;

		if (id2 < id1) {
			var x1 = this.selection_x;
			var y1 = this.selection_y;
			var x2 = this.x;
			var y2 = this.y;
		} else {
			var x1 = this.x;
			var y1 = this.y;
			var x2 = this.selection_x;
			var y2 = this.selection_y;
		}

		this.x = x2;
		this.y = y2;

	}

	moveChar(change) {
		this.REAL_POSITION_NEEDS_UPDATE = true;

		var diff = this.x + change;
		if (diff < 0) {
			if (this.y <= 0) {
				this.x = 0;
			} else {
				this.y--;
				this.x = this.lineLength;
			}
		} else if (diff > this.lineLength) {
			if (this.y >= this.line_container.height - 1) {
				this.x = this.lineLength;
			} else {
				this.y++;
				this.x = 0;
			}
		} else {
			this.x = diff;
		}
	}

	moveSelectChar(change) {
		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;
		//Need to set selection position to cursor if there is not currently a selection
		if (this.selection_x < 0 || this.selection_y < 0) {
			this.selection_x = this.x;
			this.selection_y = this.y;
		}
		var diff = this.selection_x + change;
		if (diff < 0) {
			if (this.selection_y <= 0) {
				this.selection_x = 0;
			} else {
				this.selection_y--;
				this.selection_x = this.lineLength_Select;
			}
		} else if (diff > this.lineLength_Select) {
			if (this.selection_y >= this.line_container.length - 1) {
				this.selection_x = this.lineLength_Select;
			} else {
				this.selection_y++;
				this.selection_x = 0;
			}
		} else {
			this.selection_x = diff;
		}
	}

	moveLine(change) {
		this.REAL_POSITION_NEEDS_UPDATE = true;

		var diff = this.y + change;
		if (diff <= 0) {
			this.y = 0;
		} else if (diff >= this.line_container.height - 1) {
			this.y = this.line_container.height - 1;
		} else {
			this.y = diff;
		}
	}

	moveSelectLine(change) {
		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;
		//Need to set selection position to cursor if there is not currently a selection
		if (this.selection_x < 0 || this.selection_y < 0) {
			this.selection_x = this.x;
			this.selection_y = this.y;
		}
		var diff = this.selection_y + change;
		if (diff <= 0) {
			this.selection_y = 0;
		} else if (diff >= this.line_container.height - 1) {
			this.selection_y = this.line_container.height - 1;
		} else {
			this.selection_y = diff;
		}
	}

	charAt() {
		return this.charBefore(this.real_position_x + 1)
	}

	charBefore(x = this.real_position_x) {
		var line = this.text_fw.token_container.getRealLine(this.real_position_y);

		if (x < 0) {
			line = line.prev_sib;
			return line.text[line.text.length - 1]
		}
		while (true) {
			if (x >= line.token_length) {
				x -= line.token_length;
				if (!line.next_sib) {
					//return last 
					return line.text[line.text.length - 1];
				}
			} else {
				return line.text[x];
			}
			line = line.next_sib;
		}
	}
}

//var createSignedDistanceBuffer = require("../vector/research.vector").createSignedDistanceBuffer;

var database = (function() {});

var font_size = 24;
var letter_spacing = 0;


//Object to cache fonts in program;
var existing_fonts = {};

var b_size = 64;
var sd_distance = 64;

//No need to create multiple canvas elements
var canvas = document.createElement("canvas");
var canvas_size = 1024;
canvas.width = canvas_size;
canvas.height = canvas_size;
var ctx = canvas.getContext("2d");


canvas.style.position = "absolute";
canvas.style.zIndex = 200000;

var signed_canvas = document.createElement("canvas");
var signed_canvas_size = 2048;
signed_canvas.width = signed_canvas_size;
signed_canvas.height = signed_canvas_size;
var ctx_s = signed_canvas.getContext("2d");

var worker_function = function(self) {
	self.onmessage = function(e) {
		var data = e.data;
		var df = new Float32Array(data.buffer1);
		var image = new Uint8Array(data.buffer2);
		createSignedDistanceBuffer(image, e.data.image_size, e.data.image_size, df, e.data.sd_size, e.data.sd_size, e.data.distance);
		self.postMessage({
			buffer1: df.buffer,
			buffer2: image.buffer,
			index: e.data.index
		}, [df.buffer, image.buffer]);
	};

	function createSignedDistanceBuffer(inRGBArray, inWidth, inHeight, outSDArray, outWidth, outHeight, kernal_in) {
		var x_scale = inWidth / outWidth;
		var y_scale = inHeight / outHeight;
		var kernal = kernal_in || 50;
		var lowest_distance_positive = Infinity;
		var highest_distance_positive = -Infinity;
		var lowest_distance_negative = Infinity;
		var highest_distance_negative = -Infinity;
		var min = Math.min;
		var max = Math.max;

		for (var y = 0; y < outHeight; y++) {
			for (var x = 0; x < outWidth; x++) {
				var index = y * outWidth + x;

				var in_x = x * x_scale | 0;
				var in_y = y * y_scale | 0;

				var indexIn = ((in_y * inWidth + in_x) | 0) * 4;

				var sign = inRGBArray[indexIn + 3] > 0 ? 1 : -1;

				var min_distance = (kernal * 0.5) * (kernal * 0.5);
				//Use kernal to scan a box section of inRGBArray and find closest distance
				var boundY = max(in_y - kernal * .5, 0) | 0;
				var boundH = min(boundY + kernal, inHeight) | 0;
				var boundX = max(in_x - kernal * .5, 0) | 0;
				var boundW = min(boundX + kernal, inWidth) | 0;

				for (var v = boundY | 0; v < boundH; v++) {
					for (var u = boundX | 0; u < boundW; u++) {

						if (v === in_y && u === in_x) continue;

						var index_ = (v * inWidth + u) * 4;

						var alpha = inRGBArray[index_ + 3];



						if (sign > 0 && alpha <= 0) {
							var xi = (in_x - u);
							var yi = (in_y - v);
							var distance = (xi * xi + yi * yi);
							min_distance = min(min_distance, distance);
						}

						if (sign < 0 && alpha > 0) {
							var xi = (in_x - u);
							var yi = (in_y - v);
							var distance = (xi * xi + yi * yi);
							min_distance = min(min_distance, distance);
						}
					}
				}
				//debugger

				min_distance = Math.sqrt(min_distance) * sign;

				outSDArray[index] = min_distance;

				if (sign > 0) {
					highest_distance_positive = max(highest_distance_positive, min_distance);
					lowest_distance_positive = min(lowest_distance_positive, min_distance);
				} else {
					highest_distance_negative = max(highest_distance_negative, min_distance);
					lowest_distance_negative = min(lowest_distance_negative, min_distance);
				}
			}
		}
		//return
		//normalize in range 0 > 1;
		//debugger

		var scale_nagative = 1 / (highest_distance_negative - lowest_distance_negative);
		var scale_positive = 1 / (highest_distance_positive - lowest_distance_positive);

		var scale = 1 / (highest_distance_positive - lowest_distance_negative);

		var offset_negative = 0 - lowest_distance_negative;
		var offset_positive = 0 - lowest_distance_positive;

		var kernal_inv_halved = (1 / kernal_in) * 0.5;

		for (var i = 0, l = outWidth * outHeight; i < l; i++) {
			//outSDArray[i] = ((outSDArray[i] + offset_negative) * scale);
			//continue

			if (outSDArray[i] <= 0) {
				outSDArray[i] = ((outSDArray[i] + offset_negative) * scale_nagative) * 0.5;
				//outSDArray[i] =(Math.max(outSDArray[i] + kernal_in, 0) * kernal_inv_halved);
			} else {
				outSDArray[i] = ((outSDArray[i] + offset_positive) * scale_positive) * 0.5 + 0.5;
			}
		}
	}

};

var worker_blob = new Blob([`(${worker_function.toString()})(self)`]);
var worker_url = window.URL.createObjectURL(worker_blob);

//Font range UTF8 = 33 - 126 ; 93 Characters

/*Database functions*/

var db_handler = null;
var db = null;

var request = indexedDB.open("font_signed_distance_maps", 2);

request.onsuccess = (e) => {
	return
	db = request.result;
	db_handler = db.transaction(["distance_maps"], "readwrite");
	console.log(db_handler);


};

request.onupgradeneeded = function(event) {
	return
	console.log("Sd");
	var d = db.createObjectStore("distance_maps");
	d.onsuccess = function(e) {
		console.log("Sd");


	};
};

// This dna handless the loading and conversion of HTML fonts into font atlases for consumption by text framework. 
class Font {
	constructor(font) {
		var font_name = font;
		if (existing_fonts[font_name]) return existing_fonts[font_name];

		var num_of_workers = 15;
		this.workers = new Array(num_of_workers);

		this.IS_READY = false;
		this.IS_MONOSPACE = false;

		this.name = font_name;

		this.atlas_start = 32;
		this.atlas_end = 127;

		this.signed_field = new Uint8Array(640 * 640);

		this.props = new Array(this.atlas_end - this.atlas_start);
		for (var i = 0, l = this.atlas_end - this.atlas_start; i < l; i++) {
			this.props[i] = {};
		}



		existing_fonts[this.name] = this;

		var cache = sessionStorage.getItem(this.name);
		if (cache) {
			cache = JSON.parse(cache);
			this.signed_field = new Uint8Array(cache.field);
			this.props = cache.props;
			this.calc_index = Infinity;
			//	this.drawField()
			this.IS_READY = true;
		} else {

			this.calc_index = 0;
			this.finished_index = 0;

			for (var i = 0; i < num_of_workers; i++) {
				/*var worker = new Worker(worker_url)
				this.workers[i] = worker;
				worker.onmessage = ((index) => {			
					return (e) =>{
					//place into texture array
					var buffer = new Float32Array(e.data.buffer1)
					var i = e.data.index;

					for (var y = 0; y < b_size; y++) {
						for (var x = 0; x < b_size; x++) {
							var index1 = b_size * y + x
							var index2 = 640 * y + x + ((i % 10) * b_size) + (Math.floor(i / 10) * 640 * 64);
							this.signed_field[index2] = (buffer[index1] * 255);
						}
					}

					this.finished_index++;

					this.calcSection(index);
					}

				})(i)*/
				this.finished_index++;
				this.calcSection(i);
			}


		}
		/*if (db && db_handler) {

			var db_handler = db.transaction(["distance_maps"], "readwrite");
			console.log(db_handler.objectStore("elephants").get(this.name));

			//ths.IS_READY = true;
			//this.onComplete();
		}*/
		console.table(this);
		this.IS_READY = true;
		this.onComplete();





		//
		//debugger
	}

	onComplete() {

	}

	drawField() {
		canvas_size = 1024;
		canvas.width = canvas_size;
		canvas.height = canvas_size;
		var image = ctx.getImageData(0, 0, canvas_size, canvas_size);
		var d = image.data;

		for (var i = 0; i < 640; i++) {
			for (var j = 0; j < 640; j++) {
				var index1 = 640 * i + j;
				var index2 = canvas_size * i + j;

				d[index2 * 4 + 0] = this.signed_field[index1];
				d[index2 * 4 + 1] = this.signed_field[index1];
				d[index2 * 4 + 2] = this.signed_field[index1];
				d[index2 * 4 + 3] = 255;
			}
		}


		ctx.putImageData(image, 0, 0);

		this.calculateMonospace(this.name);
		//document.body.appendChild(canvas)

	}
	startCalc() {
		for (var i = 0; i < this.workers.length; i++) {
			this.calcSection(i);
		}
	}

	calcSection(worker_index) {
		var buffer = new Float32Array(b_size * b_size);
		var pos = canvas_size * 0.5;
		var start = this.atlas_start;
		var end = this.atlas_end;
		var length = end - start;
		var i = this.calc_index;
		var fin_i = this.finished_index;
		var font_size = canvas_size * 0.8;

		if (fin_i >= length) {
			this.drawField();

			if (db) {
				var db_handler = db.transaction(["distance_maps"], "readwrite");
				db_handler.objectStore("distance_maps").put(this.signed_field, this.name);

			}

			//sessionStorage.setItem(this.name, JSON.stringify({field:Array.prototype.slice.call(this.signed_field),props:this.props}));

			this.onComplete();
			return
		}

		if (this.calc_index >= length) return;

		canvas.width = canvas_size;
		ctx.font = `${font_size}px  "${this.name}"`;
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		var char = String.fromCharCode(start + i);
		ctx.fillStyle = "black";
		var width = ctx.measureText(char).width; // * (12/300)

		this.props[i] = {
			char: char,
			code: start + i,
			width: width * (12 / font_size),
			width2: width * (12 / font_size),
			ratio: width / font_size
		};

		ctx.fillText(char, pos, pos);

		var image = ctx.getImageData(0, 0, canvas_size, canvas_size);
		this.calc_index++;

		this.calcSection(i);
		/*this.workers[worker_index].postMessage({
			buffer1: buffer.buffer,
			buffer2: image.data.buffer,
			image_size: canvas_size,
			sd_size: b_size,
			distance: sd_distance,
			index: i
		}, [buffer.buffer, image.data.buffer])*/
	}

	calculateMonospace() {
		return;
		var DIV = document.createElement("pre");

		DIV.style.fontFamily = `${this.name}`;
		DIV.style.fontSize = 12 + "px";
		DIV.style.letterSpacing = 0;
		DIV.style.wordSpacing = 0;
		DIV.style.padding = 0;
		DIV.style.border = 0;
		DIV.style.margin = 0;
		DIV.style.position = "fixed";
		DIV.innerHTML = "A";

		var IS_MONOSPACE = true;
		var last_width = 0;
		var width = 0;

		document.body.appendChild(DIV);

		last_width = DIV.getBoundingClientRect().width;

		for (var i = this.atlas_start, d = 0; i < this.atlas_end; i++, d++) {
			var char = String.fromCharCode(i);
			DIV.innerHTML = char;
			console.log(DIV.getClientRects());
			width = DIV.getBoundingClientRect().width;
			this.props[i - this.atlas_start].width = width;
			if (last_width !== width) {
				IS_MONOSPACE = false;
			}
		}

		document.body.removeChild(DIV);

		this.IS_MONOSPACE = IS_MONOSPACE;
	}
}

//Just for fun
function rB(){ //randomByte
    return (Math.random() * 245 + 10)|0;
}
function randomColor() {
    var r = ((Math.random() * 240) + 15)|0;
	return `rgb(${rB()},${r},${r})`;
}

//Compares code with argument list and returns true if match is found, otherwise false is returned 
function compareCode(code) {
	var list = arguments;
	for (var i = 1, l = list.length; i < l; i++) {
		if (list[i] === code) return true;
	}
	return false;
}

//Returns true if code lies between the other two arguments 
function inRange(code) {
	return (code > arguments[1] && code < arguments[2]);
}
//The resulting array is used while parsing and tokenizing token strings
var string_parse_and_format_functions = (function() {
	var array = [{
			type: "number",
			//Initial check function. Return index offset to start for scan. If 0 is returned then the parser will move on to the next check function
			check(code, text) {
				if (inRange(code, 47, 58)) {
					code = text.charCodeAt(1);
					if (compareCode(code, 66, 98, 88, 120, 79, 111)) {
						return 2;
					}
					return 1;
				} else if (code == 46) {
					code = text.charCodeAt(1);
					if (inRange(code, 47, 58)) {
						return 2;
					}
				}
				return 0;
			},
			// Scan for end of token. Return false if character not part of token
			scanToEnd(code) {
				return inRange(code, 47, 58) || code === 46
			},
			format(token) {
				token.color = "rgb(20,40,180)";
			}

        }, {
			type: "identifier",
			//Initial check function. Return index offset to start for scan. If 0 is returned then the parser will move on to the next check function
			check(code) {
				return (inRange(code, 64, 91) || inRange(code, 96, 123)) ? 1 : 0;
			},
			// Scan for end of token. Return false if character not part of token
			scanToEnd(code) {
				return inRange(code, 47, 58) || inRange(code, 64, 91) || inRange(code, 96, 123) || compareCode(code, 35, 36, 38, 45, 95);
			},
			format(token) {

				//token.color = randomColor();
			}

        }, {
			type: "white_space",
			//Initial check function. Return index offset to start for scan. If 0 is returned then the parser will move on to the next check function
			check(code) {
				return (code === 32 || code === 9) ? 1 : 0;
			},
			// Scan for end of token. Return false if character not part of token
			scanToEnd(code) {
				return code === 32 || code === 9;
			},
			format(token) {
				//console.log(token)
			}

        }, {
			type: "open_bracket",
			//Initial check function. Return index offset to start for scan. If 0 is returned then the parser will move on to the next check function
			check(code) {
				return compareCode(code, 123, 40, 91) ? 1 : 0;
			},
			// Scan for end of token. Return false if character not part of token
			scanToEnd(code) {
				//Single character, end comes immediatly
				return false;
			},
			format(token) {
				token.color = "rgb(100,100,100)";
			}

        }, {
			type: "close_bracket",
			//Initial check function. Return index offset to start for scan. If 0 is returned then the parser will move on to the next check function
			check(code) {
				return compareCode(code, 125, 41, 93) ? 1 : 0;
			},
			// Scan for end of token. Return false if character not part of token
			scanToEnd(code) {
				//Single character, end comes immediatly
				return false;
			},
			format(token) {
				token.color = "rgb(100,100,100)";
			}

        },

		{
			type: "operator",
			//Initial check function. Return index offset to start for scan. If 0 is returned then the parser will move on to the next check function
			check(code) {
				return compareCode(code, 42, 43, 60, 61, 62, 92, 38, 37, 33, 94, 124, 58) ? 1 : 0;
			},
			// Scan for end of token. Return false if character not part of token
			scanToEnd(code) {
				//Single character, end comes immediatly
				return false;
			},
			format(token) {
				token.color = "rgb(205,120,0)";
			}

        }, {
			type: "symbol", //Everything else should be generic symbols
			check(code) {
				return 1;
			},
			// Scan for end of token. Return false if character not part of token
			scanToEnd(code) {
				//Generic will capture ANY remainder character sets.
				return false;
			},
			format(token) {
				token.color = "red";
			}
        }
    ];

	//This allows for creation custom parsers and formatters based upon this object. 
	array.clone = function() {
		return string_parse_and_format_functions();
	};

	return array;
});

class TextFramework {
	constructor(parent_element) {
		this.token_container = new Token_Container();

		this.font_size = 32;
		this.letter_spacing = 0;
		this.line_height = 30;

		this.DOM = document.createElement("div");

		this.parent_element = parent_element || document.body;

		parent_element.appendChild(this.DOM);

		this.font = new Font("Time New Roman");

		this.length = 0;

		this.char_width = 24;

		this.max_length = 0;
		this.scroll_top = 0;
		this.max_line_width = 0;

		this.del_code = 8; // should be 127 or 8
		this.del_char = String.fromCharCode(this.del_code);
		this.new_line_code = 10; // should be 10
		this.new_line = String.fromCharCode(this.new_line_code);
		this.linked_line_code = 13; // should be 13
		this.linked_line = String.fromCharCode(this.linked_line_code);
		this.curs_code = 33; // should be 31
		this.curs_char = String.fromCharCode(this.curs_code);

		//Fixed character width for scaling
		this.width = 0;
		this.height = 0;

		this.last_keycode = 0;

		this.SPF = string_parse_and_format_functions;

		this.token_pool = new TEXT_TOKEN(this);
		this.cursors = [new TEXT_CURSOR(this)];

		this.aquireCursor();
	}

	unload(){
		this.clearCursors();
		//this.parent_element.removeChild(this.DOM);
		this.token_container = null;
		this.DOM = null;
		this.parent_element = null;
		this.font = null;
		this.SPF = null;
		this.token_pool = null;
		this.cursors = null;
	}

	get HAS_SELECTION() {
		for (var i = 0; i < this.cursors.length; i++) {
			if (this.cursors[i].HAS_SELECTION) return true;
		}
		return false;
	}

	get boxHeight() {
		return this.token_container.getHeight();
	}

	clearCursors() {
		for (var i = 0; i < this.cursors.length; i++) {
			this.cursors[i].IN_USE = false;
		}
	}

	updateCursors(camera, scale, x, y) {
		for (var i = 0; i < this.cursors.length; i++) {
			this.cursors[i].update(camera, scale, x, y + 1);
		}
	}

	moveCursorsX(change, SELECT) {
		if (SELECT) {
			for (var i = 0; i < this.cursors.length; i++) {
				if (this.cursors[i].IN_USE) this.cursors[i].moveSelectChar(change);
				if (this.cursors[i].IN_USE) console.log({
					text: this.cursors[i].getTextFromSelection()
				});
			}
		} else {
			for (var i = 0; i < this.cursors.length; i++) {
				if (this.cursors[i].IN_USE) this.cursors[i].moveChar(change);
			}
		}

		this.checkForCursorOverlap();
	}

	moveCursorsY(change, SELECT) {
		if (SELECT) {
			for (var i = 0; i < this.cursors.length; i++) {
				if (this.cursors[i].IN_USE) this.cursors[i].moveSelectLine(change);
			}
		} else {

			for (var i = 0; i < this.cursors.length; i++) {
				if (this.cursors[i].IN_USE) this.cursors[i].moveLine(change);
			}
		}
		this.checkForCursorOverlap();
	}

	checkForCursorOverlap() {
		var cur1 = null,
			cur2 = null;
		for (var i = 0; i < this.cursors.length; i++) {
			cur1 = this.cursors[i];
			if (!cur1.IN_USE) continue
			var id = (cur1.selection_y << 10) | cur1.selection_x;

			for (var j = i + 1; j < this.cursors.length; j++) {
				cur2 = this.cursors[j];
				if (!cur2.IN_USE) continue

				var id2 = (cur2.selection_y << 10) | cur2.selection_x;
				if (cur1.id == cur2.id) {
					debugger
					this.releaseCursor(cur2);
				} else if (cur2.id <= id && id > -1) {
					debugger
					cur1.selection_x = cur2.selection_x;
					cur1.selection_y = cur2.selection_y;
					this.releaseCursor(cur2);
				} else if (id2 > -1 && cur1.id >= id2) {
					debugger
					cur1.x = cur2.x;
					cur1.y = cur2.y;
					this.releaseCursor(cur2);
				}
			}
		}
		this.sortCursors();
	}

	sortCursors(){
		for (var i = 0; i < this.cursors.length-1; i++) {
			var 
			cur1 = this.cursors[i],
			cur2 = this.cursors[i+1];
			//move data from cur2 to cur1
			if(!cur1.IU && cur2.IU){
				this.cursors[i] = cur2;
				this.cursors[i+1] = cur1;
			}
		}
	}

	updateLineOffsets(x, y, min_x, min_y, max_x, max_y, scale, camera) {
		var length = this.token_container.length;
		if (length < 1) return;
		var sh = this.line_height / scale;

		if (this.scroll_top > 0) {
			min_y += this.scroll_top / scale;
			max_y += this.scroll_top / scale;
			this.diff_y_min = Math.max(Math.floor(((min_y - (y / scale)) / sh)), 0);
			this.diff_y_max = Math.min(Math.ceil((max_y - (y / scale)) / sh), length);
		} else {
			this.diff_y_min = Math.max(((min_y - (y / 1)) / this.line_height) | 0, 0);
			this.diff_y_max = Math.min(((max_y - (y / 1)) / this.line_height) | 0, length);

			this.pixel_offset = min_y - (y / 1);
			this.pixel_top = Math.max(min_y - (y / 1));
			this.pixel_bottom = Math.max(max_y - (y / 1));
		}
		this.updateCursors(camera, scale, camera.px + x, camera.py + y);
		this.checkForCursorOverlap();
	}

	renderToDOM(scale = 1) {
		this.DOM.innerHTML = "";
		this.DOM.style.fontSize = "200%";
		var text = "<div dna='small_scale_pre'>";
		//get size of space and line
		this.max_length = 0;


		var mh = this.line_height * scale;
		if (scale < 0.4) {
			text = "<div dna='small_scale_pre' top:" + (this.diff_y_min * mh) + "px'>";
			for (var i = this.diff_y_min; i < this.diff_y_max; i++) {
				var line = this.token_container.getIndexedLine(i);
				if (line) {
					var length = line.length;
					if (length > this.max_length) this.max_length = length;
					text += line.renderDOM(true) + "</br>";

				}
			}
		} else {
			var y = (this.pixel_top > -1) ? this.pixel_top : 0;
			var height = this.token_container.pixel_height;
			if (this.token_container.length > 0) {
				var line = this.token_container.getLineAtPixelOffset(y | 0);
				var t = line.pixel_offset;
				var diff = (y > 0) ? t - y : 0;
				var i = 0;
				while (line) {
					i++;
					text += "<span dna='small_scale_pre' style='top: " + ((y + diff) * scale) + "px'>" + line.renderDOM(false) + "</span>";
					y += line.pixel_height;
					t += line.pixel_height;
					var length = line.length;
					if (length > this.max_length) this.max_length = length;
					if (y >= this.pixel_bottom || t >= height) break;
					var line = line.next_line;

				}
			}

		}

		text += "</div>";

		this.DOM.innerHTML = text;
	}

	renderToBuffer(buffer = new Float32Array(52)) {
		this.max_length = 0;

		var offset = 0;
		
		for (var i = this.diff_y_min; i < this.diff_y_max; i++) {
			var line = this.token_container.getIndexedLine(i);
			if (line) {
				var length = line.length;
				if (length > this.max_length) this.max_length = length;
				offset = line.renderToBuffer(buffer, offset);
			}
		}

		return offset;
	}


	updateText(index = 0) {
		var loop_check = 0;
		
		this.releaseAllCursors();
		
		var token = this.token_container.getIndexedLine(index);
		while (token = token.parse()) {
			if (loop_check++ > 1000000) {
				break;
			}
		}
		this.cursors[0].IN_USE = true;
	}

	toString() {
		var i = 0,
			text = "";
		var token = this.token_container.getIndexedLine(0);
		while (token) {
			text += this.new_line + token.cache;
			token = token.next_line;
		}
		return text;
	}

	setIndexes() {
		return;
	}

	//************************
	//POOLS
	releaseAllCursors() {
		for (var i = 0; i < this.cursors.length; i++) {
			var temp = this.cursors[i];
			temp.IN_USE = false;
		}
	}


	releaseCursor(cursor) {
		if (cursor.IN_USE) {
			cursor.IN_USE = false;
		}
	}

	aquireCursor() {
		var temp = null;
		if (this.cursors.length > 0) {
			for (var i = 0; i < this.cursors.length; i++) {
				temp = this.cursors[i];
				if (!temp.IU)
					break
				temp = null;
			}
		}
		if (!temp) {
			temp = new TEXT_CURSOR(this);
			temp.index = this.cursors.push(temp) - 1;
		}
		temp.IN_USE = true;
		return temp;
	}


	//Releases given token to pool and returns that token's previous sibling.
	releaseToken(token) {
		var prev_line = token.prev_line;
		var next_line = token.next_line;

		var prev_sib = token.prev_sib;
		var next_sib = token.next_sib;

		if (prev_sib) {
			prev_sib.next_sib = next_sib;
		}
		if (next_sib) {
			next_sib.prev_sib = prev_sib;
		}
		if (prev_line) {
			if (next_sib && next_sib.IS_NEW_LINE) {
				prev_line.next_line = next_sib;
			} else {
				prev_line.next_line = next_line;
			}
		}
		if (next_line) {
			if (prev_sib && prev_sib.IS_NEW_LINE) {
				next_line.prev_line = prev_sib;
			} else {
				next_line.prev_line = prev_line;
			}
		}

		if (token.IS_NEW_LINE) {
			this.token_container.remove(token);
			this.setIndexes();
		}

		var t = token.prev_sib;
		token.reset();
		token.next_sib = this.token_pool;
		token.prev_sib = null;
		token.text = "";
		this.token_pool = token;
		return t;
	}

	//Either returns an existing token from pool or creates a new one and returns that.
	aquireToken(prev_token) {
		var t = this.token_pool;

		if (t) {
			if (t.next_sib) {
				this.token_pool = t.next_sib;
				this.token_pool.prev_sib = null;
			} else {
				this.token_pool = new TEXT_TOKEN(this, null);
			}
		} else {
			t = new TEXT_TOKEN(this, null);
		}

		t.reset();

		if (prev_token) {
			t.prev_line = prev_token.prev_line;
			t.next_line = prev_token.next_line;

			if (prev_token.IS_NEW_LINE) {
				t.prev_line = prev_token;
			}

			t.next_sib = prev_token.next_sib;
			t.prev_sib = prev_token;
			prev_token.next_sib = t;
			if (t.next_sib) {
				t.next_sib.prev_sib = t;
			}
		}
		return t;
	}

	insertTextAtCursor(char, deletekey) {
		this.insertCharAtCursor(char, deletekey);
	}

	insertCharAtCursor(char, deletekey, index) {
		var l = this.cursors.length;
		var j = 0;

		if (typeof index === "number") {
			l = index + 1;
			j = index;
		}

		for (; j < l; j++) {
			if (this.cursors[j].IN_USE) {
				var cursor = this.cursors[j];
				var select = cursor.getTextFromSelection().length;
				cursor.arrangeSelection();
				cursor.setToSelectionTail();
				var line = cursor.real_position_y;
				var i = cursor.real_position_x;
				var c = char;
				if (select > 0) {
					c = this.del_char.repeat(select) + char;
				}
				console.log(c);
				this.token_container.getRealLine(line).insertText(c, i);
				cursor.toString();
				cursor.resetSelection();
			}
		}
	}

	//Inserts token into list of lines after prev_line. Returns new line token
	insertLine(prev_line, new_line) {
		if (!prev_line) {
			new_line.prev_line = new_line;
			new_line.next_line = null;
			new_line.index = 0;
			this.token_container.insert(new_line, 0);
		} else {
			new_line.index = prev_line.index + 1;
			this.token_container.insert(new_line, prev_line.index + 1);
			new_line.next_line = prev_line.next_line;
			if (new_line.next_line) {
				new_line.next_line.prev_line = new_line;
			}
			new_line.prev_line = prev_line;
			prev_line.next_line = new_line;
		}
		this.length++;
		this.setIndexes();
		new_line.IS_NEW_LINE = true;
		return new_line
	}

	releaseLine(line) {
		line.first_token.text = "";
		var line1 = line.prev_sib;
		var line2 = line.next_sib;

		if (line1) {
			line1.next_sib = line2;
		}
		if (line2) {
			line2.prev_sib = line1;
		}

		line.next_sib = this.line_pool;
		line.prev_sib = null;
		this.line_pool = line;

		this.token_container.remove(line);

		this.length--;
		//this.setIndexes();
		line.PROTECT__IN_USE = false;
		return line;
	}


	insertText(text, li = 0, cursor_ind) {
		if ((this.token_container.height | 0) < 1) {
			if (text.charCodeAt(0) !== this.new_line_code) {
				text = this.new_line + text;
			}
			this.insertLine(null, this.aquireToken()).insertText(text, 1);
			this.updateText(0);
		} else {
			this.token_container.getIndexedLine(li).insertText(text, -1, cursor_ind);
		}
	}

	setFont(font) {
		this.font = new Font(font);

		this.DOM.style.fontFamily = font;

		return new Promise((res, rej) => { 
			this.font.onComplete = () => {
				res();
			};

			if (this.font.IS_READY)
				res();
			else
				this.font.startCalc();
		});
	}
}

/**
 * @brief Stores data for the current project.
 * @details The project object is the primary store of user data and preferences. 
 * It also provides the hosting of the presets object for wick components, and the interface components for user tools. 
 * The flame_data model stored is the main linking object for handling UI updates from actions performed through UI components.  
 * 
 */
class Project {

    constructor(system) {

        this.system = system;
        
        this.flame_data = new flame_scheme();

        this.presets = wick$1.core.presets({
            models:{
                flame: this.flame_data,
                settings: this.flame_data.settings,
            },
            custom:{
                actions : system.actions,
                ui : system.ui,
                classes : {
                    textedit : TextFramework
                },
                system
            }
        });
        
        this.history = [];
        
        this.setDefaults();

        //Load interface components from working directory

    }

    loadComponents(dir){
        fs.readdir(dir,(e,d)=>{
            if(e)
                return console.error(`Could not load UI components: ${e}`);

            d.forEach((fn)=>{
                if(path.extname(fn) == ".html"){
                    this.system.ui.addComponent(([dir, fn]).join("/"));
                }
            });
        });
    }

    setDefaults(){

        this.flame_data.creation_date = Date.now();
        this.flame_data.default.component.width = 360;
        this.flame_data.default.component.height = 920;

        this.flame_data.settings.move_type = "relative";
        this.loadComponents(path.join(process.cwd(), "./assets/ui_components"));
    }

    load() {}
    save() {}

    get settings(){
        return this.flame_data.settings;
    }

    importUIComponent(component){
        this.system.iu.addUIComponent(component);
    }
}

//Amend the prototype of the HTML
HTMLElement.prototype.wick_node = null;

window.wick = wick$1;

class System {
    constructor() {
        this.doc_man = new DocumentManager(this);
        this.css = new CSSManager(this.doc_man);
        this.html = new HTMLManager(this.doc_man);
        this.js = new JSManager(this.doc_man);
        this.presets = wick$1.core.presets();
        this.actions = actions;
        this.project = new Project(this);
    }
}

/**
* @brief Flame exposed object.  
 * @details Contains methods necessary to start a flame session.
 * @return Object
 */

const flame = {
    init: (wick) => {
        //Startup the Main UI system
        const DEV = !!require('electron').remote.process.env.FLAME_DEV;

        let system = new System();

        StyleNode.prototype.flame_system = system;

        //connect to the ui_group element
        const ui_group = document.querySelector("#ui_group");
        const view_group = document.querySelector("#main_view");

        if (!ui_group)
            throw new Error("`ui_group` element not found in document! Aborting startup.");

        const ui_man = new UI_Manager(ui_group, view_group, system);
        
        system.ui = ui_man;


        if(DEV){
            //Load in the development component.
            let path$$1 = require("path").join(process.cwd(),"assets/components/test.html");
            let doc = system.doc_man.get(system.doc_man.load(path$$1));
            actions.CREATE_COMPONENT(system, doc, {x:200, y:200});
            window.flame = flame;
        }
        //Connect to server or local file system and load projects
        //Check to see if there recently worked on project to open. 
          //Load Poject.
        //If user preference allows, open the Splash screen modal. 
    },
};

/* Interface files */
//Project Direcctory

module.exports = flame;
