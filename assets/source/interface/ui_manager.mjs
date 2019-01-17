//*********** Actions ******************
import css from "@candlefw/css";
import { actions } from "./actions/action";
import { UIComponent } from "../component/ui_component";
import { MasterComponent } from "../component/master_component";
import { LineMachine } from "./system/line_machine";
import { SVGManager } from "./system/svg_manager";
import path from "path";

import Handler from "./input_handler/handler.mjs";
import Default from "./input_handler/default.mjs";
import ElementDraw from "./input_handler/element_draw.mjs";

//OTHER imports
import { ControlsManager } from "./controls_manager";

/** GLOBAL EVENTS FILLS **/

var DD_Candidate = false;
/**
 * @brief Handles user input and rendering of UI elements
 * 
 * @param  [HTMLElement] Element to map UI components to.
 */
export class UI_Manager {

    constructor(UIHTMLElement, ViewElement, system) {
        system.ui = this;

        //Initialize Handlers
        new Default(system, path.join(process.cwd(), "./assets/ui_components/controls/basic.html"));

        this.d = Default;
        this.e = ElementDraw;

        this.system = system;
        this.element = UIHTMLElement;
        this.view_element = ViewElement;
        this.origin_x = 0;
        this.origin_y = 0;
        this.transform = new(css.types.transform2D)();
        this.last_action = Date.now();

        this.active_handler = Handler.default;
        this.x = 0;
        this.y = 0;

        this.ui_target = null;
        /**
            Unbounded "master" component that sits behind other components and allows the creation of elements.
            Component itself is not selectable. 
        */
        this.master_component = null;

        this.dxdx = 0;

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

        //ControlsManager provides onscreen transform visual widgets for components and elements.
        this.controls = new ControlsManager();
        this.controls.resize(this.transform);
        this.element.appendChild(this.controls.element);

        /** SYSTEMS *******************************/
        this.svg_manager = new SVGManager(system);
        this.line_machine = new LineMachine();

        // **************** Eventing *****************
        window.addEventListener("resize", e => this.controls.resize(this.transform));

        // // *********** Mouse *********************
        window.addEventListener("mouseover", e => {});
        window.addEventListener("wheel", e => this.handleScroll(e, e.pageX, e.pageY));

        // // *********** Pointer *********************
        window.addEventListener("pointerdown", e => {
            const x = this.transform.getLocalX(e.pageX);
            const y = this.transform.getLocalY(e.pageY);
            if (this.setTarget(e, null, x, y, false)) {
                this.origin_x = x;
                this.origin_y = y;
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

        //this.createMaster();
    }

    createMaster() {
        const doc_id = this.system.docs.loadFile("~edit-canvas");
        const doc = this.system.docs.get(doc_id);

        this.master_component = new MasterComponent(this.system);
        this.master_component.x = 0;
        this.master_component.y = 0;

        if (doc)
            this.master_component.load(doc);

        document.querySelector("#main_view").appendChild(this.master_component.element);
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
            this.line_machine.render(this.controls.ctx, this.transform, this.target.box);
        this.loadedComponents.forEach(c => c.set(this.target));
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
        this.loadedComponents.push(component);
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

    setTarget(e, component, x, y, SET_MENU = true) {
        let target = null;

        const IS_ON_MASTER = component == this.master_component;

        if ((target = this.controls.pointerDown(e, x, y, this.transform, IS_ON_MASTER))) {

            this.target = target;

            if (SET_MENU) this.main_menu.setAttribute("show", "true");

            this.loadedComponents.forEach(c => c.set(this.target));

            if (component) {
                if (this.target.IS_COMPONENT) {
                    this.line_machine.setPotentialBoxes(null, component, this.components);
                } else {
                    this.line_machine.setPotentialBoxes(this.target.element, component, this.components);
                }
            }

            return true;
        }

        if (SET_MENU) this.main_menu.setAttribute("show", "false");

        return false;

    }

    /******************** Component Iframe *************************/

    integrateComponentFrame(frame, component) {

        frame.addEventListener("mousedown", e => {

            const x = e.pageX + component.x;
            const y = e.pageY + component.y;

            this.last_action = Date.now();

            if (component == this.master_component)
                this.handlePointerDownEvent(e);
            else
                this.handlePointerDownEvent(e, x, y);

            if (e.button == 0) {
                if (!this.setTarget(e, component, x, y)) {
                    if (e.target.tagName == "BODY") {
                        this.controls.setTarget(component, component.element, true, true, this);
                        this.render();
                        this.setTarget(e, component, x, y);
                    } else {
                        this.controls.setTarget(component, e.target, component == this.master_component, false, this);
                        this.render();
                        this.setTarget(e, component, x, y);
                    }
                }
            }
            return false;
        });
        
        if (component !== this.master_component)
            frame.addEventListener("wheel", e => {
                const x1 = e.pageX,
                    y1 = e.pageY,
                    x2 = component.x,
                    y2 = component.y,
                    x = (x1 + x2) * this.transform.scale + this.transform.px,
                    y = (y1 + y2) * this.transform.scale + this.transform.py;

                this.handleScroll(e, x, y);
            });

        frame.addEventListener("mousemove", e => {
            const x = e.pageX + component.x;
            const y = e.pageY + component.y;

            if (component == this.master_component) {

                this.handlePointerMoveEvent(e);
            } else
                this.handlePointerMoveEvent(e, x, y);

            return false;
        });

        frame.addEventListener("mouseup", e => {
            const t = Date.now();
            const x = e.pageX + component.x;
            const y = e.pageY + component.y;

            if (t - this.last_action < 200) {
                if (Date.now() - DD_Candidate < 200) {
                    DD_Candidate = 0;
                    e.x = x;
                    e.y = y;
                    this.handleContextMenu(e, component);
                } else {
                    if (e.target.tagName == "BODY") {
                        this.controls.setTarget(component, component.element, true, this);
                        this.render();
                        this.setTarget(e, component, x, y);
                    } else if (this.setTarget(e, component, x, y) && this.target.action == actions.MOVE) {
                        this.controls.setTarget(component, e.target, component == this.master_component, false, this);
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

    /****************** Event responders **************************/

    handlePointerDownEvent(e, x, y, FROM_MAIN = false) {
       // if (e.target == document.body || !this.target)
       //     this.active_handler = Handler.element_draw;

        this.active_handler = this.active_handler.input("start", e, this, { x, y, FROM_MAIN });
        return false;
    }

    handlePointerMoveEvent(e, x, y) {
        this.active_handler = this.active_handler.input("move", e, this, { x, y });
    }

    handlePointerEndEvent(event) {
        this.active_handler = this.active_handler.input("end", event, this, this.target);
        event.preventDefault();
    }

    handleDocumentDrop(e) {
        this.active_handler = this.active_handler.input("drop", event, this, this.target);
        e.preventDefault();
    }

    handleContextMenu(e, component = null) {
        //Load text editor in the bar.
        this.active_handler = this.active_handler.input("context", e, this, { component });
        e.preventDefault();
    }

    handleScroll(e, x, y) {
        //this.active_handler = this.active_handler.input("scroll", e, this, { x:300, y:300 });
        this.active_handler = this.active_handler.input("scroll", e, this, { x, y });
        e.preventDefault();
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
