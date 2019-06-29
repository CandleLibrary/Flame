import { MOVE } from "./move.mjs";
import { SETLEFT, SETTOP } from "./position.mjs";
import { SETWIDTH, SETHEIGHT } from "./dimensions.mjs";
import { TOPOSITIONABSOLUTE } from "./convert.mjs";
import { prepRebuild } from "./common.mjs";
import Component from "../../component/component.mjs";
import { CSSComponent } from "../../component/css_component.mjs";
import { Document } from "../../system/document/document.mjs";

export function TRANSFER_ELEMENT(env, target_component, target_element, child_element, px, py, COPY = false, LINKED = false) {
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

    SETLEFT(env, target_component, new_element, px, true);
    SETTOP(env, target_component, new_element, py, true);

    prepRebuild(new_element, LINKED);

    return new_element;
}

export function CREATE_ELEMENT(env, component, parent_element, tag_name = "div", px = 0, py = 0, w = 50, h = 50) {
    if (typeof(tag_name) !== "string" || tag_name == "")
        throw new Error(`Invalid argument for \`tag_name\`:${tag_name} in call to CREATE_ELEMENT.`);
    return null;
    let node = env.wick("");
    node.tag = tag_name;

    parent_element.wick_node.addChild(node);
    //rebuild to create the new element. 
    node.prepRebuild(false, false, true);
    node.rebuild();
    //grab the element from the parent
    const element = parent_element.lastChild;
    TOPOSITIONABSOLUTE(env, component, element);
    SETLEFT(env, component, element, px, true);
    SETTOP(env, component, element, py, true);
    SETWIDTH(env, component, element, w, true);
    SETHEIGHT(env, component, element, h, true);

    prepRebuild(element);

    return { element, node };
}

export function CREATE_VIEW_COMPONENT(env, doc, px, py) {
    //Create an iFrame page_view component
    const comp = new Component(env);

    comp.x = px;
    comp.y = py;

    document.querySelector("#main_view").appendChild(comp.element);

    comp.load(doc);

    return comp;
}

export function CREATE_COMPONENT(env, doc, px, py) {
    let comp = null;

    if (doc instanceof Document) {
        switch (doc.type) {
            case "css":
                comp = env.css.createComponent(doc);
                break;
            case "js":
                comp = new Component(env);
                comp.load(doc);
                break;
            case "html":
                comp = new Component(env);
                comp.load(doc);
        }
    } else {
        comp = new CSSComponent(env);
        comp.container.addSelector(doc.selector);
    }
    
    env.ui.setState(undefined, env.ui.comp.addComponent(comp));
    //comp.mount(env.ui.wys_view);
    //env.ui.wys_view.appendChild(comp.element);

    comp.x = px;
    comp.y = py;

    return comp;
}

export function REMOVE_COMPONENT(env, component) {

    if (!(component instanceof Component))
        throw new Error("Action REMOVE_COMPONENT cannot continue: component is not an instance of Component.");

    if (component.target.parentElement)
        component.target.parentElement.removeChild(component.target);

    env.ui.manager.removeComponent(component);
}

export function CREATE_CSS_DOC(env, doc, event) {

    let comp = env.css.createComponent(doc);

    let element = comp.element;

    comp.x = -event.x;
    comp.y = -event.y;
}
