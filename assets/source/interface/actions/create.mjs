import {
    Component
} from "../../component/component.mjs";

export function CREATE_COMPONENT(system, doc, event) {
    //if(!(doc instanceof Document))
    //    throw new Error("Action CREATE_COMPONENT cannot continue: doc is not an instance of Document.");

    let component = new Component(system);

    component.load(doc);

    let element = component.element;

    document.querySelector("#main_view").appendChild(element);

    component.x = event.x;
    component.y = event.y;
}

export function REMOVE_COMPONENT(system, component){
    if(!(component instanceof Component)) 
        throw new Error("Action REMOVE_COMPONENT cannot continue: component is not an instance of Component.");;

    if(component.target.parentElement)
        component.target.parentElement.removeChild(component.target);

    system.ui.removeComponent(component);
}

export function CREATE_CSS_DOC(system, doc, event) {
    let comp = system.css.createComponent(doc);

    let element = comp.element;

    //document.querySelector("#main_view").appendChild(element);

    comp.x = -event.x;
    comp.y = -event.y;
}