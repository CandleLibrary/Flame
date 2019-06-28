//*********** Actions ******************
import * as css from "@candlefw/css"
import { actions } from "./actions/action";
import { UIComponent } from "../component/ui_component";
import { MasterComponent } from "../component/master_component";
import { LineMachine } from "./system/line_machine";
import { SVGManager } from "./system/svg_manager";
import { DNDHandler } from "./dnd/drag_and_drop_handler.mjs";

import Handler from "./input_handler/handler.mjs";
import Default from "./input_handler/default.mjs";
import ElementDraw from "./input_handler/element_draw.mjs";

import BrowserEngine from "./input_engine/browser_input.mjs";


/*** END HOST UTILITIES ---***/

//OTHER import
import { ControlsManager } from "./controls_manager";

/** GLOBAL EVENTS FILLS **/


var DD_Candidate = false;


/**
 * @brief Handles user input and rendering of UI elements
 * 
 * @param  [HTMLElement] Element to map UI components to.
 */
export default class UI_Manager {

    constructor(UIHTMLElement, ViewElement, system) {
        system.ui.manager = this;

        

        this.system = system;
        this.element = UIHTMLElement;
        this.view_element = ViewElement;
        this.origin_x = 0;
        this.origin_y = 0;
        this.transform = new(css.types.transform2D)();
        this.last_action = Date.now();

        //Initialize Input Handlers
        this.dnd = new DNDHandler(system);
        new Default(system);
        this.d = Default;
        this.e = new ElementDraw(system);

        this.active_handler = Handler.default;
        this.cur_x = 0;
        this.cur_y = 0;
        this.ptr_x = 0;
        this.ptr_y = 0;

        this.ui_target = null;

        /**
            Unbounded "master" component that sits behind other components and allows the creation of elements.
            The component itself is not selectable. 
        */
        this.master_component = null;

        /* 
            UI components serve as UX/UI handlers for all tools that comprise flame.
            These can be modified by the user through project system to create and use custom UI
            elements. 
        */
        this.components = [];
        this.ui_components = new Map();
        this.loadedUIComponents = [];

        //Menu array
        this.main_menu = document.createElement("div");
        this.main_menu.id = "main_menu";
        this.main_menu.map = new Map();
        this.main_menu.setAttribute("show", "false");
        this.element.appendChild(this.main_menu);

        //ControlsManager provides onscreen transform visual widgets for components and elements.
        this.controls = new ControlsManager();
        this.controls.resize(this.transform);
        this.element.appendChild(this.controls.element);

        /** SYSTEMS *******************************/
        this.svg_manager = new SVGManager(system);
        this.line_machine = new LineMachine();

        this.engine = new BrowserEngine(this);

        this.createMaster();
    }

    createMaster() {
        const doc_id = this.system.data.docs.loadFile("~edit-canvas");
        const doc = this.system.data.docs.get(doc_id);

        this.master_component = new MasterComponent(this.system);
        this.master_component.x = 0;
        this.master_component.y = 0;

        if (doc)
            this.master_component.load(doc);

        this.system.ui.main_view.appendChild(this.master_component.element);
    }

    reset() {
        const system = this.system;

        while (this.components[0])
            actions.REMOVE_COMPONENT(system, this.components[0]);

        this.createMaster();
    }

    update() {
        this.render();
    }

    render() {

        this.controls.render(this.transform);

        if (this.target && this.RENDER_LINES)
            this.line_machine.render(this.controls.ctx, this.transform, this.target);

        this.loadedUIComponents.forEach(c => c.set(this.target));
    }

    /******************** Components *************************/

    removeComponent(component) {
        for (let i = 0, l = this.components.length; i < l; i++)
            if (component === this.components[i]) {
                this.components.splice(i, 1);
                break;
            }
    }

    mountUIComponent(component) {
        component.mount(this.element);
        this.loadedUIComponents.push(component);
        component.set(this.target);
    }

    addToMenu(menu_name, item_name, icon_element, menu) {
        if (menu_name == "main") {
            const element = icon_element.cloneNode(true);
            element.style.display = "";
            element.onclick = () => { this.mountUIComponent(menu); };
            this.main_menu.appendChild(element);
            this.main_menu.map.set(name, icon_element);
        }
    }

    addComponent(wick_component_file_path) {

        const doc = this.system.docs.get(this.system.docs.loadFile(wick_component_file_path));

        if (doc) {
            const component = new UIComponent(this.system, doc.name);
            component.load(doc);
            this.ui_components.set(doc.name, component);
        }
    }

    setWidgetTarget(target) {
        this.target = target;

        this.loadedUIComponents.forEach(c => c.set(this.target));

        this.line_machine.setPotentialBoxes(target, this.components);
    }

    setTarget(e, component, SET_MENU = true) {
        let target = null;

        const IS_ON_MASTER = component == this.master_component;

        if (SET_MENU) this.main_menu.setAttribute("show", "false");

        return false;
    }

    /******************** Component Iframe *************************/

    integrateComponentElement(element, component) {
        this.components.push(component);
    }

    /****************** Event responders **************************/

    handlePointerMoveEvent(e, point) {
        this.active_handler.input("move", {}, this, point);
    }

    handlePointerDownEvent(e, point = this.engine.point, FROM_MAIN = false) {


        let component = null,
            element = null;

        this.active_handler = this.e;

        this.last_action = Date.now();

        //document.body.requestPointerLock();
        //let point = getCursorPos(this) // { x:this.px, y:this.py };
        this.active_handler = this.active_handler.input("start", e, this, { x: point.x, y: point.y, FROM_MAIN });

        if (point) {

            let element = document.elementFromPoint(point.x, point.y);
            if (element) {

                if (element.component) {
                    component = element.component;
                    if (component.type == "css") {
                        element = component.element
                    } else {
                        element = element.shadowRoot.elementFromPoint(point.x, point.y);
                    }
                    this.controls.setTarget(component, element, component == this.master_component, false, this.system);
                        this.setTarget(e, component);
                        this.render();
                }
            }
        }

        return false;
    }

    handlePointerEndEvent(event) {
        this.active_handler = this.active_handler.input("end", event, this, this.target);
        event.preventDefault();
    }

    handleGenericDrop(obj, x, y){
        this.active_handler = this.active_handler.input("generic_drop", obj, this, this.target);
    }

    handleDocumentDrop(e) {
        this.active_handler = this.active_handler.input("drop", event, this, this.target);
        e.preventDefault();
    }

    handleContextMenu(e, component = null) {
        this.active_handler = this.active_handler.input("context", e, this, { component });
        e.preventDefault();
    }

    handleScroll(e, x, y) {
        this.active_handler = this.active_handler.input("scroll", e, this, { x, y });
        e.preventDefault();
    }

    handleKeyUp(e){
        this.active_handler = this.active_handler.input("key", e, this, this.target);
    }

    /******** FILE HANDLING ************/

    mountDocument(file_info, x, y) {
        const doc = this.system.docs.get(this.system.docs.loadFile(file_info));
        let comp = null;
        if (doc) {
            switch (doc.type) {
                case "wick":
                case "html":
                    comp = actions.CREATE_COMPONENT(this.system, doc, x, y);
                    break;
                case "css":
                    comp = actions.CREATE_CSS_DOC(this.system, doc, x, y);
                    break;
                case "js":
                case "svg":
                case "jpg":
                case "png":
                case "gif": //intentional
                default:
                    break;
            }
        }

        return comp;
    }


    saveMaster() {
        return {};
    }

    async save(file_builder) {
        const data = { master: this.saveMaster(), components: [] };

        for (let i = 0; i < this.components.length; i++)
            data.components.push(this.components[i]);

        return await file_builder.writeS(JSON.stringify(data));
    }


    load(string) {
        const data = JSON.parse(string),
            components = data.components;

        for (let i = 0; i < components.length; i++) {
            const d = components[i],
                comp = this.mountDocument(d, d.x, d.y);
            comp.width = d.width;
            comp.height = d.height;
            comp.x = d.x;
            comp.y = d.y;
        }
    }
}
