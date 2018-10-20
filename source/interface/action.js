let CSS_Rule_Constructor = require("wick").core.css.prop;

function getApplicableRules(system, element, component) {
    return system.css.aquireCSS(element, component);
}

function mergeRules(css) {
    let rule = new CSS_Rule_Constructor();
    for (let i = 0; i < css.length; i++)
        rule.merge(css[i].r);
    return rule;
}
/**
 * Actions provide mechanisms for updating an element, document, and component through user input. 
 */
export function MOVE(system, element, component, dx, dy) {
    // Get CSS information on element and update appropriate records
    let rec1 = element.getBoundingClientRect();
    let start_x = rec1.x;
    let start_left = 0;
    let cache = getApplicableRules(system, element, component);
    if (cache.length > 0) {
        let css = mergeRules(cache);

        //Check what type of rules are applicable to this operation.
        //Position relative with top or bottom and left or right.
        //Position absolute with top or bottom  and left or right.
        //Position relative with margin
        //Position 

        if (css.props.left) {
            start_left = css.props.left;
            css.props.left = css.props.left.copy(css.props.left + dx);
        }

        if (css.props.top) {
            // console.log(css.props.top, css.props.top.copy(css.props.top + dy), dy)
            css.props.top = css.props.top.copy(css.props.top + dy);
        }


        let node = element.wick_node;
        node.setRebuild();


        rec1 = element.getBoundingClientRect();

        let end_x = rec1.x;


        let diff_x = end_x - start_x;
        //The rate of change is different due to parent elements changing.
        //Readjust to match dx rate
        if (diff_x !== dx && dx !== 0) {
            let diff = dx / (diff_x / dx);
            if (diff != 0)
                css.props.left = start_left.copy(start_left + diff);
            //css.props.top = css.props.top.copy(css.props.top);
            node.setRebuild();
        }
    }
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
            let rec1 = element.getBoundingClientRect();
            let start_x = rec1.x;
            let start_left = rule.props.left;

            rule.props.left = rule.props.left.copy(rule.props.left + dx);
            
            element.wick_node.setRebuild();
            
            rec1 = element.getBoundingClientRect();
            let end_x = rec1.x;
            let diff_x = end_x - start_x;
            
            if (diff_x !== dx && dx !== 0) {
                let diff = dx / (diff_x / dx);
                if (diff != 0)
                    rule.props.left = start_left.copy(start_left + diff);
                element.wick_node.setRebuild();
            }

            rule.props.width = rule.props.width.copy(rule.props.width - dx);
            element.wick_node.setRebuild();
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

import { Component } from "../component/component";
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