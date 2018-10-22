let CSS_Rule_Constructor = require("wick").core.css.prop;
let types = require("wick").core.css.types;

class ActionCache {
    constructor() {
        this.css_flags_a = 0;
        this.css_flags_b = 0;
        this.transform_type = 0;
        this.css_props = null;
    }
}

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

/** Set the left position of an Element. Returns calculated ratio if the ratio argument is not defined. */
function setLeft(element, dx, rule, ratio = 0) {
    if (rule.props.left instanceof types.percentage) {
        //get the nearest positioned ancestor
        let ele = element,
            width = ratio;

        if (ratio == 0)
            while (ele.parentElement) {
                ele = ele.parentElement;
                if (window.getComputedStyle(ele).getPropertyValue("position") !== "sticky") {
                    width = ele.getBoundingClientRect().width;
                    break;
                }
            }

        let np = ((width * 0.01 * rule.props.left) + dx) / width;
        rule.props.left = rule.props.left.copy(np * 100);

        ratio = width;

    } else 
        if (ratio > 0) {
            dx = dx / ratio;
            rule.props.left = rule.props.left.copy(rule.props.left + dx);
        } else {
            let start_x = element.getBoundingClientRect().x;
            let start_left = rule.props.left;
            rule.props.left = rule.props.left.copy(rule.props.left + dx);
            element.wick_node.setRebuild();
            let rec1 = element.getBoundingClientRect();
            let end_x = rec1.x;
            let diff_x = end_x - start_x;
            if (diff_x !== dx && dx !== 0) {
                ratio = (diff_x / dx);
                let diff = dx / ratio;
                if (diff != 0)
                    rule.props.left = start_left.copy(start_left + diff);
            }
        }
    

    return ratio
}

/** Set the right position of an Element. Returns calculated ratio if the ratio argument is not defined. */
function setRight(element, dx, rule, ratio = 0) {
    if (rule.props.right instanceof types.percentage) {

        //get the nearest positioned ancestor
        let ele = element,
            width = ratio;

            while (ele.parentElement) {
                ele = ele.parentElement;
                if (window.getComputedStyle(ele).getPropertyValue("position") !== "sticky") {
                    width = ele.getBoundingClientRect().width;
                    break;
                }
            }

        let np = ((width * 0.01 * rule.props.right) + dx) / width;
        rule.props.right = rule.props.right.copy(np * 100);

        ratio = width;

    } else 
        if (ratio > 0) {
            dx = dx / ratio;
            rule.props.right = rule.props.right.copy(rule.props.right - dx);
        } else {
            let start_x = element.getBoundingClientRect().right;
            let start_right = rule.props.right;
            rule.props.right = rule.props.right.copy(rule.props.right - dx);
            element.wick_node.setRebuild();
            let end_x = element.getBoundingClientRect().right;
            let diff_x = end_x - start_x;
            if (diff_x !== dx && dx !== 0) {
                ratio = (diff_x / dx);
                let diff = dx / ratio;
                if (diff != 0)
                    rule.props.right = start_right.copy(start_right + diff);
            }
        }

        return ratio
    }

    /** Set the top position of an Element. Returns calculated ratio if the ratio argument is not defined. */
    function setTop(element, dx, rule, ratio = 0) {
        if (ratio > 0) {
            dx = dx / ratio;
            rule.props.top = rule.props.top.copy(rule.props.top + dx);
        } else {
            let start_x = element.getBoundingClientRect().y;
            let start_top = rule.props.top;
            rule.props.top = rule.props.top.copy(rule.props.top + dx);
            element.wick_node.setRebuild();
            let rec1 = element.getBoundingClientRect();
            let end_x = rec1.y;
            let diff_x = end_x - start_x;
            if (diff_x !== dx && dx !== 0) {
                ratio = (diff_x / dx);
                let diff = dx / ratio;
                if (diff != 0)
                    rule.props.top = start_top.copy(start_top + diff);
            }
        }
        return ratio
    }

    function setWidthLength(element, dx, rule, ratio = 1) {
        let width = rule.props.width;
        let w = element.getBoundingClientRect().width;
        let ow = w / (width / 100);
        let np = ((w - dx * ratio) / ow)
        rule.props.width = rule.props.width.copy(np * 100);
    }

    function setWidthPercentage(element, dx, rule, ratio = 1) {
        rule.props.width = rule.props.width.copy(rule.props.width - dx * ratio);
    }

    function setHeightLength(element, dx, rule, ratio = 1) {
        let height = rule.props.height;
        let w = element.getBoundingClientRect().height;
        let ow = w / (height / 100);
        let np = ((w - dx * ratio) / ow)
        rule.props.height = rule.props.height.copy(np * 100);
    }

    function setHeightPercentage(element, dx, rule, ratio = 1) {
        rule.props.height = rule.props.height.copy(rule.props.height - dx * ratio);
    }

    let cache = null;

    export function COMPLETE(system) {
        cache = null;
    }

    /**
     * Actions provide mechanisms for updating an element, document, and component through user input. 
     */
    export function MOVE(system, element, component, dx, dy) {
        // Get CSS information on element and update appropriate records
        let rec1 = element.getBoundingClientRect();
        let start_x = rec1.x;
        let start_left = 0;
        let css_r = getApplicableRules(system, element, component);
        let css = null;

        let transform_type = 0;

        if (!cache) {
            let unique_rule = getUniqueRule(system, element, component);
            css_r = getApplicableRules(system, element, component);
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

            //      1                 2                 4               8                 16              32               64               128              256              512              1024           2048
            let v = ((POS_R | 0) << 0) | ((POS_A | 0) << 1) | ((HT | 0) << 2) | ((HR | 0) << 3) | ((HB | 0) << 4) | ((HL | 0) << 5) | ((HMT | 0) << 6) | ((HMR | 0) << 7) | ((HMB | 0) << 8) | ((HML | 0) << 9) | ((W | 0) << 9) | ((H | 0) << 9)

            if ((60 & v) > 0) {

                if ((v & 40) == 0) {
                    //missing left / right position value.
                    //Add left
                    unique_rule.addProp(`left:0px`);
                }

                if ((v & 20) == 0) {
                    //missing top / bottom position value
                }
            } else if ((960 & v) > 0) {
                //using margin
            } else {
                //Create left and top positions or us margin depending on current user preferences.
                unique_rule.addProp(`left:0px;top:0px`);
            }

            let move_type = 0;

            //Setup move systems. 
            while (true) {

                //left without right; absolute or relative
                if ((36 & v) == 36 && (v & 24) == 0) {
                    transform_type = "left";
                    break;
                }

                //top without bottom; absolute or relative
                if ((36 & v) == 36 && (v & 24) == 0) {
                    transform_type = "right bottom";
                    break;
                }

                //left right absolute no width
                if ((42 & v) == 42 && (v & 1024) == 0) {
                    transform_type = "relative left right";
                    break;
                }

                //top bottom absolute no height
                if ((42 & v) == 42 && (v & 1024) == 0) {
                    transform_type = "relative left right";
                    break;
                }

                //no left or right but margin-left OR margin-right with width defined 
                //margin-left and margin-right
                //just margin-left 
                //just margin-right
                //no top or bottom but margin-top OR margin-bottom
                //margin-top and margin-bottom
                //just margin-top 
                //just margin-bottom

                break;
            }

            css_r = getApplicableRules(system, element, component);
            css = mergeRules(css_r);
            //calculate horizontal and vertical rations. also width and height ratios.        
        }

        switch (transform_type) {
            case "left top":
                setLeft(element, dx, css, 0);
                setTop(element, dy, css, 0);
                break;

            case "relative left right":
                setLeft(element, dx, css, 0);
                setRight(element, -dx, css, 0);
                break;

            default:
                break;
        }
        element.wick_node.setRebuild();
    }

    export function SCALETL(system, element, component, dx, dy) {
        //Position defined by absolute, right, left, top, bottom
        //position defined by relative, right, left, top, bottom
        //position defined by margin
        //
        let rules = getApplicableRules(system, element, component);
        let rule = mergeRules(rules);

        if (dx !== 0) {
            if (rule.props.width && rule.props.left) {


                let width = rule.props.width;
                console.log(width + "")
                if ((width.toString()).includes("%")) {
                    let w = element.getBoundingClientRect().width;
                    let ow = w / (width / 100);
                    let np = ((w - dx) / ow)
                    rule.props.width = rule.props.width.copy(np * 100);
                } else {
                    rule.props.width = rule.props.width.copy(rule.props.width - dx);
                }
                element.wick_node.setRebuild();
            }

            if (rule.props.margin_left && rule.props.margin_right && rule.props.position == "relative") {

            }
        }
    }
    export function SCALEBL(system, element, component, dx, dy) {

    }
    export function SCALETR(system, element, component, dx, dy) {

    }
    export function SCALEBR(system, element, component, dx, dy) {

    }


    export function TEXT(system, element, component, dx, dy) {
        let pos = event.cursor;
        let data = event.text_data;
        let text = system.html.aquireTextData(element);
        text.update(pos, data);
    }

    export function RESIZE(system, element, component, dx, dy) {

    }

    export function BACKGROUND(system, element, component, dx, dy) {

    }

    export function FONT(system, element, component, dx, dy) {

    }

    export function MARGIN(system, element, component, dx, dy) {

    }

    export function PADDING(system, element, component, dx, dy) {

    }

    export function TRANSFORM(system, element, component, dx, dy) {

    }

    export function SVG(system, element, component, dx, dy) {

    }

    import {
        Component
    } from "../component/component";
    export function CREATE_COMPONENT(system, doc, event) {

        let component = new Component(system);

        component.load(doc);

        let element = component.element;

        document.querySelector("#main_view").appendChild(element);

        component.x = event.x;
        component.y = event.y;
        component.updateDimensions();
    }

    export function CREATE_CSS_DOC(system, doc, event) {
        let comp = system.css.createComponent(doc);

        let element = comp.element;
        debugger
        //document.querySelector("#main_view").appendChild(element);

        comp.x = -event.x;
        comp.y = -event.y;
    }