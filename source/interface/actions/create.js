import wick from "wick";
import {
    Component
} from "../../component/component";

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

    //document.querySelector("#main_view").appendChild(element);

    comp.x = -event.x;
    comp.y = -event.y;
}