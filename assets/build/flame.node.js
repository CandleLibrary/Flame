'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var wick$1 = _interopDefault(require('wick'));
var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));

function TEXTEDITOR(system, element, component, x, y){}



function TEXT(system, element, component, dx, dy) {
    let pos = event.cursor;
    let data = event.text_data;
    let text = system.html.aquireTextData(element);
    text.update(pos, data);
}

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
                unique_rule.addProp('position:relative');
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
}

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
    let prop = props[propname];
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
    if (diff_x !== delta_value && delta_value !== 0) {
        ratio = (diff_x / delta_value);
        let diff = delta_value / ratio;
        // if (diff !== 0) funct(system, element, component, original_value + diff, true);
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

function SETLEFT(system, element, component, x, LINKED = false) {
    let cache = CacheFactory(system, element, component);

    if (cache.cssflagsA & 1)
        setNumericalValue("left", system, element, component, x, setNumericalValue.parent_width);
    else
        setNumericalValue("left", system, element, component, x, setNumericalValue.positioned_ancestor_width);


    if (!LINKED) element.wick_node.setRebuild();
}

function SETTOP(system, element, component, x, LINKED = false) {
    let cache = CacheFactory(system, element, component);

    if (cache.cssflagsA & 1)
        setNumericalValue("top", system, element, component, x, setNumericalValue.parent_height);
    else
        setNumericalValue("top", system, element, component, x, setNumericalValue.positioned_ancestor_height);

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

function RESIZEB(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.height += dy);
    let cache = CacheFactory(system, element, component);
    switch (cache.move_vert_type) {
        case "top bottom":
            SETDELTABOTTOM(system, element, component, -dy, 0, true);
        case "top":
            SETDELTAHEIGHT(system, element, component, dy, 0, true);
            break;
        case "bottom":
            SETDELTABOTTOM(system, element, component, -dy, 0, true);
            SETDELTAHEIGHT(system, element, component, dy, 0, true);
            break;
    }
    element.wick_node.setRebuild();
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
                    cache.valueB = SETDELTARIGHT(system, element, component, -dx, 0);
                    cache.valueA = SETDELTALEFT(system, element, component, dx, 0);
                    break;
                case "left right":
                    cache.valueB = SETDELTARIGHT(system, element, component, -dx, 0);
                case "left":
                    cache.valueA = SETDELTALEFT(system, element, component, dx, 0);
                    break;
                case "right":
                    cache.valueB = SETDELTARIGHT(system, element, component, -dx, 0);
                    break;
            }

            switch (cache.move_vert_type) {
                case "top bottom":
                    cache.valueC = SETDELTABOTTOM(system, element, component, -dy, 0);
                case "top":
                    cache.valueD = SETDELTATOP(system, element, component, dy, 0);
                    break;
                case "bottom":
                    cache.valueC = SETDELTABOTTOM(system, element, component, -dy, 0);
                    break;
            }
        }

        element.wick_node.setRebuild();
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
        this.iframe.src = "./assets/html/component_frame.html";

        this.width = system.project.flame_data.default.component.width;
        this.height = system.project.flame_data.default.component.height;

        this.iframe.onload = (e) => {
            system.ui.integrateIframe(this.iframe, this);
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

let types$1 = wick$1.core.css.types;

//set background color
function SETBACKGROUNDCOLOR(system, element, component, r, g, b, a = 1){
	let color = new types$1.color(r,g,b,a);
	setValue(system, element, component, "background_color", color);
	element.wick_node.setRebuild();
}
//set background image
//set font color
function SETCOLOR(system, element, component, r, g, b, a = 1){
	let color = new types$1.color(r,g,b,a);
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

let types$2 = wick$1.core.css.types;
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
                if (css.props.right instanceof types$2.length) {
                    css.props.right = new types$2.percentage((css.props.right / rect.width) * 100);
                } else {
                    css.props.right = new types$2.length(rect.width * (css.props.right / 100), "px");
                } /** Intentional fall through **/
            case "left":
                if (css.props.left instanceof types$2.length) {
                    css.props.left = new types$2.percentage((css.props.left / rect.width) * 100);
                } else {
                    css.props.left = new types$2.length(rect.width * (css.props.left / 100), "px");
                }
                break;
            case "right":
                if (css.props.right instanceof types$2.length) {
                    css.props.right = new types$2.percentage((css.props.right / rect.width) * 100);
                } else {
                    css.props.right = new types$2.length(rect.width * (css.props.right / 100), "px");
                }
                break;
        }
    }
    element.wick_node.setRebuild();
}

let types$3 = wick$1.core.css.types;

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
    setValue(system, element, component, "border_top_left_radius", new types$3.length(d, "px"));
    element.wick_node.setRebuild();
}

function BORDERRADIUSTR(system, element, component, d){
    setValue(system, element, component, "border_top_right_radius", new types$3.length(d, "px"));
    element.wick_node.setRebuild();
}

function BORDERRADIUSBL(system, element, component, d){
    setValue(system, element, component, "border_bottom_left_radius", new types$3.length(d, "px"));
    element.wick_node.setRebuild();
}

function BORDERRADIUSBR(system, element, component, d){
    setValue(system, element, component, "border_bottom_right_radius", new types$3.length(d, "px"));
    element.wick_node.setRebuild();
}

const actions = {
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
class UIComponent {

    constructor(system, name) {
        //frame for fancy styling
        this.element = document.createElement("div");
        this.element.classList.add("flame_ui_component");

        this.pkg = null;

        this.name = name;

        this.system = system;

        this.icon = null;
    }

    documentReady(pkg){
        this.mgr = pkg.mount(this.element, this.system.project.flame_data);
        let src = this.mgr.sources[0].ast;
        if(src._statics_.menu){
            switch(src._statics_.menu){
                case "main":
                    this.system.ui.addToMenu("main", this.name, this.mgr.sources[0].badges.icon);
                break;
            }
        } 

        this.mgr._upImport_ = (prop_name, data, meta)=>{
            this.system.ui.mountComponent(this);
        };
    }

    set(data){
        this.mgr._update_({target:data});
    }

    load(doc) {
        doc.bind(this);
    }

    mount(element){
        element.appendChild(this.element);
    }

    unmount(){
    }

    set x(x) {
        this.element.style.left = x + "px";
    }

    set y(y) {
        this.element.style.top = y + "px";
    }

    get x() {
        return parseFloat(this.element.style.left);
    }

    get y() {
        return parseFloat(this.element.style.top);
    }
}

class colorPicker {
	constructor() {
		this.r = 0;
		this.g = 0;
		this.b = 0;
		this.a = 0;

		this.last_x = 0;
		this.last_y = 0;

		this.alpha = 255;

		this.h = 0;
		this.s = 0;
		this.v = 0;

		this.hex = "#000000";

		this.color_width = 150;
		this.color_height = 150;

		this.draw_type = "doughnut";
		this.draw_mode = "hsl";

		this.saturation = 1;
	}

	rgbToString(r, g, b) {
		r = r || this.r;
		g = g || this.g;
		b = b || this.b;
		return "rgb(" + r + "," + g + "," + b + ")";
	}

	draw(ctx, x, y, w, h, type, mode) {
		var pi = Math.PI;

		var width = w;
		var height = h;

		var id = ctx.getImageData(x || 0, y || 0, width, height);

		var data = id.data;

		for (var i = 0; i < height; i++) {
			for (var j = 0; j < width; j++) {
				var index = (i* width + j) * 4;
				this.getColor(j, i, width, height, type, mode);
				if(this.a === 0) continue;
				data[index + 0] = this.r;
				data[index + 1] = this.g;
				data[index + 2] = this.b;
				data[index + 3] = this.a;
			}
		}

		ctx.putImageData(id, 0, 0);

		//Extras
		switch (type) {
			case "doughnut":
				ctx.strokeStyle = "black";
				ctx.lineWidth = width * 0.02;

				ctx.beginPath();
				ctx.arc(width * 0.5, height * 0.5, width * 0.475, Math.PI * 2, false);
				ctx.stroke();

				ctx.strokeStyle = this.draw_mode === "hsl" ? "white" : "black";
				ctx.beginPath();
				ctx.arc(width * 0.5, height * 0.5, width * 0.295, Math.PI * 2, false);
				ctx.stroke();

				break;
			case "wheel":
				ctx.strokeStyle = "black";
				ctx.lineWidth = width * 0.01;
				ctx.beginPath();
				ctx.arc(width * 0.5, height * 0.5, width * 0.475, Math.PI * 2, false);
				ctx.stroke();
				break;
			default:
				ctx.strokeStyle = "rgb(220,220,220)";
				ctx.lineWidth = 2;
				ctx.strokeRect(0, 0, width, height);
			break;
		}
	}

	HSLtoRGB(h, s, l) {
		var h_ = h / 60;
		var c = (1 - Math.abs(2 * l - 1)) * s;

		var x = c * (1 - Math.abs((h_ % 2) - 1));

		var rgb = [0, 0, 0];

		if (h_ < 1 && h_ >= 0) {
			rgb[0] = c;
			rgb[1] = x;
		} else if (h_ < 2) {
			rgb[1] += c;
			rgb[0] += x;
		} else if (h_ < 3) {
			rgb[1] += c;
			rgb[2] += x;
		} else if (h_ < 4) {
			rgb[2] += c;
			rgb[1] += x;
		} else if (h_ < 5) {
			rgb[2] += c;
			rgb[0] += x;
		} else if (h_ < 6) {
			rgb[0] += c;
			rgb[2] += x;
		}

		var m = l - 0.5 * c;

		rgb[0] += m;
		rgb[1] += m;
		rgb[2] += m;

		rgb[0] *= 255;
		rgb[1] *= 255;
		rgb[2] *= 255;


		return rgb;
	}

	HSVtoRGB(h, s, v) {
		var h_ = h / 60;
		var c = v * s;
		var m = v - c;

		var x = c * (1 - Math.abs((h_ % 2) - 1));

		var rgb = [m, m, m];

		if (h_ < 1 && h_ >= 0) {
			rgb[0] += c;
			rgb[1] += x;
		} else if (h_ < 2) {
			rgb[1] += c;
			rgb[0] += x;
		} else if (h_ < 3) {
			rgb[1] += c;
			rgb[2] += x;
		} else if (h_ < 4) {
			rgb[2] += c;
			rgb[1] += x;
		} else if (h_ < 5) {
			rgb[2] += c;
			rgb[0] += x;
		} else if (h_ < 6) {
			rgb[0] += c;
			rgb[2] += x;
		}

		rgb[0] *= 255;
		rgb[1] *= 255;
		rgb[2] *= 255;

		return rgb;
	}

	RGBtoHSV(r, g, b) {
		var h = 0;
		var h_ = 0;
		var v = 0;
		var s = 0;
		// hue
		var M = Math.max(r, g, b);
		var m = Math.min(r, g, b);
		var c = M - m;

		if (M === r) h_ = ((g - b) / c) % 6;
		else if (M === g) h_ = ((b - r) / c) + 2;
		else h_ = ((r - g) / c) + 4;

		h = ((Math.PI / 180) * 60) * h_;

		//value
		v = M;

		//saturation
		s = (c == 0) ? 0 : c / v;

		return [h, s, v];
	}

	RGBtoHSL(r, g, b) {
		var hsl = this.RGBtoHSV(r, g, b);
		hsl[2] = (r * 0.3 + g * 0.59 + b * 0.11);
		return hsl;
	}

	getColor(x, y, width, height, type, mode, color_array) {
		var color;

		mode = mode || this.draw_mode;
		type = type || this.draw_type;
		//square types

		if (type === "doughnut" || type === "wheel") { //wheel or doughnut
			//vector from center to xy
			x = width * 0.5 - x;
			y = height * 0.5 - y;

			//normalize
			var l = Math.sqrt(x * x + y * y); // l becomes a useful value

			x /= l;
			y /= l;
			l /= width * 0.5; //now even more useful

			if (l > 0.95) { // discard points outside and inside circle
				this.r = 0;
				this.g = 0;
				this.b = 0;
				this.a = 0;
				return this;
			} else {
				//calculate angle and convert degrees
				var angle = ((Math.atan2(0, 1) - Math.atan2(y, x)) * 180 / Math.PI) + 180;
				if (type === "doughnut") {
					if (mode == "hsl") {
						color = this.HSLtoRGB(angle, this.saturation, (1 - (l * 2.5 - 1.5)));
					} else {
						color = this.HSVtoRGB(angle, this.saturation, (1 - (l * 2.5 - 1.5)));
					}
				} else {
					if (mode == "hsl") {
						color = this.HSLtoRGB(angle, this.saturation, (1 - l));
					} else {
						color = this.HSVtoRGB(angle, this.saturation, l);
					}
				}
			}
		} else { //square
			if (mode === "hsl") {
				color = this.HSLtoRGB(x / width * 360, this.saturation, 1 - y / height);
			} else {
				color = this.HSVtoRGB(x / width * 360, this.saturation, 1 - y / height);
			}
		}

		if(!color_array){
			this.r = (color[0] | 0);
			this.g = (color[1] | 0);
			this.b = (color[2] | 0);
			this.a = this.alpha;
		}

		return this;
	}
}

const paper  = require("paper");
const Point = paper.Point;
const Size = paper.Size;

/**
 * @brief Provides interface tools for manipulating SVG elements
 */
class SVGManager{
	constructor(system){
		this.system =  system;

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

		this.canvas.addEventListener("pointerdown",(e)=>{
			let x = e.offsetX;
			let y = e.offsetY;
			dx = x;
			dy = y;
			point.x = x;
			point.y = y;

			POINTER_DOWN = true;

			console.log(x,y);
			
			this.selection = this.proj.hitTest(point,
				{fill:true, stroke:true}
			);

			console.log(this.selection);

			if(this.selection){
				this.selection.item.selected = true;
				this.proj.view.update();
			}

		});

		this.canvas.addEventListener("pointermove", (e)=>{
			if(!POINTER_DOWN) return;
			let x = dx - e.offsetX;
			let y = dy - e.offsetY;
			console.log(x,y, this.selection);
			dx = e.offsetX;
			dy = e.offsetY;
			let selection = this.selection;
			if(selection){
				let item = selection.item;
				switch(selection.type){
					case "fill":
					case "stroke":
						item.translate(new Point(-x,-y));
					break;
				}

				this.proj.view.update();
			}
		});

		this.canvas.addEventListener("pointerup", (e)=>{
			POINTER_DOWN = false;
			this.export();
		});


		this.ctx = this.canvas.getContext("2d");
		this.elements = [];
	}

	export(){
		paper.project.view.viewSize.set(this.width, this.height);
		paper.project.view.translate(new Point(-20, -20));
		let output = paper.project.exportSVG({asString:true});
		console.log(output);
		this.wick_node.reparse(output).then(n=>this.wick_node = n);
		paper.project.view.translate(new Point(20, 20));
		paper.project.view.viewSize.set(this.width+40, this.height+40);
	}

	mount(ui, target_element, component, x,y){


		while(target_element && target_element.tagName.toUpperCase() !== "SVG"){
			target_element = target_element.parentElement;
		}

		if(!target_element) return;

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
        this.ml = 0;
        this.mr = 0;
        this.mt = 0;
        this.mb = 0;

        this.padl = 0;
        this.padr = 0;
        this.padt = 0;
        this.padb = 0;

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
    }

    setDimensions(IS_COMPONENT = this.IS_COMPONENT) {

        if (IS_COMPONENT) {
            this.IS_COMPONENT = true;
            this.x = this.target.component.x + 4;
            this.y = this.target.component.y + 4;
            this.w = this.target.component.width;
            this.h = this.target.component.height;
        } else {
            let component = this.target.component;
            let rect = this.target.element.getBoundingClientRect();
            let par_prop = component.window.getComputedStyle(this.target.element);

            //margin
            this.ml = parseFloat(par_prop.getPropertyValue("margin-left"));
            this.mr = parseFloat(par_prop.getPropertyValue("margin-right"));
            this.mt = parseFloat(par_prop.getPropertyValue("margin-top"));
            this.mb = parseFloat(par_prop.getPropertyValue("margin-bottom"));

            //border
            this.bl = parseFloat(par_prop.getPropertyValue("border-left"));
            this.br = parseFloat(par_prop.getPropertyValue("border-right"));
            this.bt = parseFloat(par_prop.getPropertyValue("border-top"));
            this.bb = parseFloat(par_prop.getPropertyValue("border-bottom"));

            //padding
            this.pl = parseFloat(par_prop.getPropertyValue("padding-left"));
            this.pr = parseFloat(par_prop.getPropertyValue("padding-right"));
            this.pt = parseFloat(par_prop.getPropertyValue("padding-top"));
            this.pb = parseFloat(par_prop.getPropertyValue("padding-bottom"));

            this.posl = parseFloat(par_prop.getPropertyValue("left"));
            this.posr = parseFloat(par_prop.getPropertyValue("right"));
            this.post = parseFloat(par_prop.getPropertyValue("top"));
            this.posb = parseFloat(par_prop.getPropertyValue("bottom"));

            this.x = rect.left + component.x + 4;
            this.y = rect.top + component.y + 4;
            this.w = rect.width;
            this.h = rect.height;
        }
    }

    render(ctx, scale) {
        this.setDimensions();

        ctx.strokeStyle = "rgb(0,0,0)";
        ctx.lineWidth = (1 / scale) * 0.95;

        //Border box
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        //Margin box
        let ml = this.x - this.ml - this.posl;
        let mt = this.y - this.mt - this.post;
        let mr = this.w + this.mr + this.ml + ml;
        let mb = this.h + this.mb + this.mt + mt;

        //Padding box
        let pl = this.x + this.pl + this.bl;
        let pt = this.y + this.pt + this.bt;
        let pr = this.w - this.pr - this.pl - this.br - this.bl + pl;
        let pb = this.h - this.pb - this.pt - this.bb - this.bt + pt;

        //Content box
        let cbl = this.x + this.bl;
        let cbt = this.y + this.bt;
        let cbr = this.w - this.br - this.bl + cbl;
        let cbb = this.h - this.bb - this.bt + cbt;


        ctx.strokeRect(ml, mt, mr - ml, mb - mt);
        ctx.strokeRect(pl, pt, pr - pl, pb - pt);
        ctx.strokeRect(cbl, cbt, cbr - cbl, cbb - cbt);

        //Render Markers

        //Box \ Border Markers 
        ctx.fillStyle = "rgb(0,100,200)";
        ctx.strokeStyle = "rgb(250,250,250)";
        ctx.lineWidth = 2 /scale;
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
        box.target = { element, component, IS_COMPONENT };
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
            let ml = widget.x - widget.ml - widget.posl;
            let mt = widget.y - widget.mt - widget.post;
            let mr = widget.w + widget.mr + widget.ml + ml;
            let mb = widget.h + widget.mb + widget.mt + mt;

            //Padding box
            let pl = widget.x + widget.pl + widget.bl;
            let pt = widget.y + widget.pt + widget.bt;
            let pr = widget.w - widget.pr - widget.pl - widget.br - widget.bl + pl;
            let pb = widget.h - widget.pb - widget.pt - widget.bb - widget.bt + pt;

            //Content box
            let cbl = widget.x + widget.bl;
            let cbt = widget.y + widget.bt;
            let cbr = widget.w - widget.br - widget.bl + cbl;
            let cbb = widget.h - widget.bb - widget.bt + cbt;
            //Widget size
            while (true) {

                //Content box first / Can double as border
                if (x >= cbl - tr && x <= cbr + tr) {
                    if (y >= cbt - tr && y <= cbb + tr) {
                        if (x <= cbl + tr) {
                            if (y <= cbt + tr) {
                                this.widget.target.action = actions.RESIZETL; break;
                            } else if (y >= cbb - tr) {
                                this.widget.target.action = actions.RESIZEBL; break;
                            }
                        } else if (x >= cbr - tr) {
                            if (y <= cbt + tr) {
                                this.widget.target.action = actions.RESIZETR; break;
                            } else if (y >= cbb - tr) {
                                this.widget.target.action = actions.RESIZEBR; break;
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
                                this.widget.target.action = actions.RESIZEMARGINTL; break;
                            } else if (y >= mb - tr) {
                                this.widget.target.action = actions.RESIZEMARGINBL; break;
                            }
                        } else if (x >= mr - tr) {
                            if (y <= mt + tr) {
                                this.widget.target.action = actions.RESIZEMARGINTR; break;
                            } else if (y >= mb - tr) {
                                this.widget.target.action = actions.RESIZEMARGINBR; break;
                            }
                        }
                    }
                }

                //Padding box
                if (x >= pl - tr && x <= pr + tr) {
                    if (y >= pt - tr && y <= pb + tr) {
                        if (x <= pl + tr) {
                            if (y <= pt + tr) {
                                this.widget.target.action = actions.RESIZEPADDINGTL; break;
                            } else if (y >= pb - tr) {
                                this.widget.target.action = actions.RESIZEPADDINGBL; break;
                            }
                        } else if (x >= pr - tr) {
                            if (y <= pt + tr) {
                                this.widget.target.action = actions.RESIZEPADDINGTR; break;
                            } else if (y >= pb - tr) {
                                this.widget.target.action = actions.RESIZEPADDINGBR; break;
                            }
                        }
                    }
                }
                break;
            }
            if (widget.target.action)
                return widget.target;
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

        this.color_picker = new colorPicker();
        this.svg_manager = new SVGManager(system);

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
        this.components = new Map();
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

        // **************** Eventing *****************
        window.addEventListener("resize", e => this.canvas.resize(this.transform));

        // // *********** Mouse *********************
        window.addEventListener("mouseover", e => {});
        window.addEventListener("wheel", e => this.handleScroll(e));

        // // *********** Pointer *********************
        window.addEventListener("pointerdown", e => {
            let x = this.transform.getLocalX(e.pageX);
            let y = this.transform.getLocalY(e.pageY);
            if (this.setTarget(e, x, y, false)) {
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

    addToMenu(menu_name, item_name, icon_element) {
        if (menu_name == "main") {
            this.main_menu.appendChild(icon_element);
            this.main_menu.map.set(name, icon_element);
        }
    }

    addComponent(wick_component_file_path) {

        let doc = this.system.doc_man.get(this.system.doc_man.load(wick_component_file_path));
        if (doc) {
            let component = new UIComponent(this.system, doc.name);
            component.load(doc);
            this.components.set(doc.name, component);
        }
    }

    setTarget(e, x, y, SET_MENU = true) {
        let target = null;

        if (target = this.canvas.pointerDown(e, x, y, this.transform)) {

            this.target = target;

            if (SET_MENU) this.main_menu.setAttribute("show", "true");

            this.loadedComponents.forEach(c => c.set(this.target));

            return true;
        }


        if (SET_MENU) this.main_menu.setAttribute("show", "false");
        return false;
    }

    integrateIframe(iframe, component) {

        iframe.contentWindow.addEventListener("wheel", e => {
            let x = e.pageX + 4 + component.x;
            let y = e.pageY + 4 + component.y;
            this.handleScroll(e, x, y);
        });

        iframe.contentWindow.addEventListener("mousedown", e => {
            let x = e.pageX + 4 + component.x;
            let y = e.pageY + 4 + component.y;
            this.last_action = Date.now();
            this.handlePointerDownEvent(e, x, y);

            if (e.button == 0) {
                if (!this.setTarget(e, x, y)) {

                    if (e.target.tagName == "BODY") {
                        this.canvas.setIframeTarget(component.element, component, true);
                        this.render();
                        this.setTarget(e, x, y);
                    } else if (!this.setTarget(e, x, y)) {
                        this.canvas.setIframeTarget(e.target, component);
                        this.render();
                        this.setTarget(e, x, y);
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
                        this.setTarget(e, x, y);
                    } else if (!this.setTarget(e, x, y)) {
                        this.canvas.setIframeTarget(e.target, component);
                        this.render();
                        this.setTarget(e, x, y);
                    }
                    DD_Candidate = Date.now();
                }
            }
            this.handlePointerEndEvent(e);
        });
    }

    handlePointerDownEvent(e, x = this.transform.getLocalX(e.pageX), y = this.transform.getLocalY(e.pageY), FROM_MAIN = false) {

        if (e.button == 1) {
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
            this.origin_x = x;
            this.origin_y = y;
            if (this.target.action) this.target.action(this.system, this.target.element, this.target.component, -diffx, -diffy, this.target.IS_COMPONENT);
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
        console.log(e.target.tagName);
        switch(e.target.tagName.toUpperCase()){
            case "SVG":
            case "RECT":
            case "PATH":
                this.svg_manager.mount(this, e.target, component, x, y);
                break;
            default:
                let element_editor = this.components.get("element_edit.html");
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

    render() {
        this.canvas.render(this.transform);
    }
}

class JSManager{

}

class CSSComponent{
	constructor(tree, manager){
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
				element.wick_node._attributes_.push({
					name:"class",
					value:class_name
				});
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

const Lexer = wick$1.core.lexer;

class WickDocument {
    constructor(file_name, path$$1, type, system) {
        this.name = file_name;
        this.type = type;
        this.path = path$$1;
        this.id = `${path$$1}/${name}`;
        this.data = null;
        this.LOADED = false;
        this.UPDATED = true;
        this.SAVING = false;
        this.PENDING_SAVE = false;
        this.observers = [];
        this.ObjectsPendingLoad = [];
        this.css_docs = [];
        this.system = system;
        this.old_data = "";
        this.element = document.createElement("div");
    }

    load() {
        fs.open(this.path + "/" + this.name, "r", (err, fd) => {
            if (err) throw err;
            fs.readFile(fd, "utf8", (err, data) => {
                fs.close(fd, (err) => {
                    if (err) throw err
                });
                if (err) {
                    throw err;
                }
                this.data = data;
                this.LOADED = true;
                (new wick$1.core.source.package(this.data, this.system.project.presets, true, this.path + "/" + this.name)).then((pkg) => {
                    this.data = pkg;
                    pkg._skeletons_[0].tree.addObserver(this);
                    for (let i = 0; i < this.ObjectsPendingLoad.length; i++) this.ObjectsPendingLoad[i].documentReady(pkg);
                    this.ObjectsPendingLoad = null;
                });
            });
        });
    }

    updatedWickASTTree(tree) {
        this.element.innerText = tree;
        this.save();
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

    bind(object) {
        if (this.LOADED) object.documentReady(this.data);
        else this.ObjectsPendingLoad.push(object);
    }

    seal(differ){
        if(this.PENDING_SAVE){
            this.PENDING_SAVE = false;
            
            let new_data = this + "";

            let diff = differ.createDiff(this.old_data, new_data);

            this.old_data = new_data;

            return (diff) ? {id:this.id, diff} : null;
        }

        return null;
    }

    toString(){
        return this.data._skeletons_[0].tree + "";
    }
}

const fs$1 = require("fs");

class CSSDocument{
	constructor(file_name, path$$1, type, system){
		
		this.name = file_name;
		this.type = type;
		this.path = path$$1;
		this.data = null;
		this.LOADED = false;
		this.UPDATED = true;
		this.SAVING = false;
		this.PENDING_SAVE = false;

		this.observers = [];
		this.ObjectsPendingLoad = [];
		this.css_docs = [];
		this.system = system;

		this.element = document.createElement("div");

		this.old_data = "";
	//	document.body.appendChild(this.element)
	}

	load(){
        fs$1.open(this.path + "/" + this.name, "r", (err, fd) => {
            if (err) throw err;
            fs$1.readFile(fd, "utf8", (err, data) => {
                fs$1.close(fd, (err)=>{if(err)throw err});
                if (err) { throw err; }
                
                this.data = data;
                this.LOADED = true;
                
                for(let i = 0; i < this.ObjectsPendingLoad.length;  i++)
                	this.ObjectsPendingLoad[i].documentReady(data);
            });
        });
	}

	updatedWickASTTree(tree){
		this.element.innerText = tree;
		this.save();
	}

	save(){
		this.PENDING_SAVE = true;
		return
		if(this.SAVING) return;
		this.SAVING = true;
        this.PENDING_SAVE = false;
		fs$1.open(this.path + "/" + this.name, "w", (err, fd) => {
            if (err) throw err;
            fs$1.write(fd, (this.tree + ""), 0, "utf8", (err,written, data) => {
                fs$1.close(fd, (err)=>{if(err)throw err});
                if (err) { throw err; }
  
                if(this.PENDING_SAVE)
                	this.save();
                else this.PENDING_SAVE = false;
                this.SAVING = false;
            });
        });
	}

	bind(object){
		if(this.LOADED)
			object.documentReady(this.data);
		else this.ObjectsPendingLoad.push(object);
	}

	updatedCSS(tree){
		this.save();
	}

	seal(differ){
		if(this.PENDING_SAVE){
			this.PENDING_SAVE = false;
			
			let new_data = this + "";

			let diff = differ.createDiff(this.old_data, new_data);

			this.old_data = new_data;

			return (diff) ? {name:this.name, diff} : null;
		}

		return null;
	}

	toString(){
		return this.tree + "";
	}
}

let diff = require("diff");

/**
 * Uses a diff algorithm to create a change map from one document version to another. Vesions are stored in the project as a change history. 
 */
class DocumentDifferentiator{
	constructor(){

	}

	createDiff(old, new_){
		if(old == new_) return;
		return diff.diffChars(old, new_);
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
                                doc = new WickDocument(name, path$$1, type, this.system);
                                break
                            default:
                                doc = new CSSDocument(name, path$$1, type, this.system);
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

        if(diffs.length > 0)
            this.diffs.push({v:version++,diffs});
    }

    stepBack(){
        let diffs = this.diffs.pop();

        if(diffs){
            for(let i = 0; i < diffs.length; i++){
                let diff = diffs[i];
                let doc = this.docs.get(diff.diffs.id);
            }
        }
    }

    stepForward(){
        
    }
}

var version = 0;

let Source = wick$1.core.source.constructor;

Source.prototype.rebuild = function (){
	this.ast.buildExisting(this.ele, this, this.presets, this.taps);
};

let RootNode = wick$1.core.source.compiler.nodes.root;
let SourceNode = wick$1.core.source.compiler.nodes.source;
let Lexer$1 = wick$1.core.lexer;
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
    let lex = Lexer$1(text);
    let Root = new this.reparse_type();

    Root.par = this.par;

    let promise = Root._parse_(Lexer$1(text), false, false, this.par);

    promise.then(node => {

        node.par = null;

        if(this.par)
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
        for (let i = 0; i < this.observing_sources.length; i++)
            this.observing_sources[i].rebuild();
        this.resetRebuild();
    } else if (this.par)
        this.par.rebuild();
};

RootNode.prototype.extract = function(){
    if(this.par)
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

            if(this.CHANGED & 8){
                if(element){
                    element.parentElement.insertBefore(ele, element);
                }else
                    parent_element.appendChild(ele);
                return true;
            }else{
                
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

    if(INSERTED){
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
    
    if(!this.parent)
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
class DeleteNode extends SourceNode{
    buildExisting(element){
        element.parentElement.removeChild(element);
        return false;
    }

    resetRebuild(){

        let nxt = this.nxt;
        if(this.par)
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

    if (!this.url) {
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
let Lexer$2 = wick$1.core.lexer;

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

let Lexer$3 = wick$1.core.lexer;

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

let Lexer$4 = wick$1.core.lexer;

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
        this.loadComponents("./assets/ui_components");
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

        let system = new System();

        StyleNode.prototype.flame_system = system;

        //connect to the ui_group element
        const ui_group = document.querySelector("#ui_group");
        const view_group = document.querySelector("#main_view");

        if (!ui_group)
            throw new Error("`ui_group` element not found in document! Aborting startup.");

        const ui_man = new UI_Manager(ui_group, view_group, system);
        system.ui = ui_man;

        //Connect to server or local file system and load projects
        //Check to see if there recently worked on project to open. 
        //Load Poject.
        //If user preference allows, open the Splash screen modal. 
    },
};

/* Interface files */
//Project Direcctory

module.exports = flame;
