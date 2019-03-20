import { RootNode } from "@candlefw/wick";
import { Component } from "../../component/component.mjs";
import { CSSComponent } from "../../component/css_component.mjs";
import { MOVE } from "./move.mjs";
import { SETLEFT, SETTOP } from "./position.mjs";
import { SETWIDTH, SETHEIGHT } from "./dimensions.mjs";
import { TOPOSITIONABSOLUTE } from "./convert.mjs";
import { prepRebuild } from "./common.mjs";

const createHTMLNodeHook = RootNode.prototype.createHTMLNodeHook;


export function TRANSFER_ELEMENT(system, target_component, target_element, child_element, px, py, COPY = false, LINKED = false) {
    let new_element = null,
        node_c = child_element.wick_node;

    const node_p = target_element.wick_node;

    if (COPY) {
        node_c = node_c.clone();
    } else {
        const par = node_c.par;

        node_c.extract();

        par.prepRebuild();
        par.rebuild();
    }
    node_p.addChild(node_c);

    node_c.prepRebuild(false, false, true);
    node_c.rebuild();

    new_element = target_element.lastChild;

    SETLEFT(system, target_component, new_element, px, true);
    SETTOP(system, target_component, new_element, py, true);

    prepRebuild(new_element, LINKED);

    return new_element;
}

export function CREATE_ELEMENT(system, component, parent_element, tag_name = "div", px = 0, py = 0, w = 50, h = 50) {
    if (typeof(tag_name) !== "string" || tag_name == "")
        throw new Error(`Invalid argument for \`tag_name\`:${tag_name} in call to CREATE_ELEMENT.`);

    let node = createHTMLNodeHook(tag_name);
    node.tag = tag_name;

    parent_element.wick_node.addChild(node);
    //rebuild to create the new element. 
    node.prepRebuild(false, false, true);
    node.rebuild();
    //grab the element from the parent
    const element = parent_element.lastChild;
    TOPOSITIONABSOLUTE(system, component, element);
    SETLEFT(system, component, element, px, true);
    SETTOP(system, component, element, py, true);
    SETWIDTH(system, component, element, w, true);
    SETHEIGHT(system, component, element, h, true);

    prepRebuild(element);

    return { element, node };
}

export function CREATE_COMPONENT(system, doc, px, py, type = "css") {
    //if(!(doc instanceof Document))
    //    throw new Error("Action CREATE_COMPONENT cannot continue: doc is not an instance of Document.");

    if (doc instanceof Component) {
        switch (type) {
            case "css":

                let out = [];
                //Pull out css information;
                for (let i = 0; i < doc.local_css.length; i++) {

                    const css = doc.local_css[i];
                    const out_doc = (css.doc) ? css.doc : system.docs.createInternalCSSDoc(doc, css);

                    out.push(CREATE_COMPONENT(system, out_doc, px+(i*-400), py, "css"));
                }

                return out;
        }
    }

    let comp = null;

    switch (doc.type) {
        case "css":
           comp = system.css.createComponent(doc);
            break;
        case "js":
            comp = new Component(system);
             comp.load(doc);
            break;
        case "html":
            comp = new Component(system);
             comp.load(doc);
    }

   

    const element = comp.element;
    document.querySelector("#main_view").appendChild(element);

    comp.x = px;
    comp.y = py;

    return comp;
}

export function REMOVE_COMPONENT(system, component) {

    if (!(component instanceof Component))
        throw new Error("Action REMOVE_COMPONENT cannot continue: component is not an instance of Component.");

    if (component.target.parentElement)
        component.target.parentElement.removeChild(component.target);

    system.ui.removeComponent(component);
}

export function CREATE_CSS_DOC(system, doc, event) {

    let comp = system.css.createComponent(doc);

    let element = comp.element;

    comp.x = -event.x;
    comp.y = -event.y;
}
