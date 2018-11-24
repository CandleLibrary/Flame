//*********** Actions ******************
import { Common } from "@galactrax/wick";


import { actions } from "./actions/action";
import { UIComponent } from "./ui_component";
import { LineMachine } from "./system/line_machine";
import { SVGManager } from "./system/svg_manager";

//OTHER imports
import { CanvasManager } from "./canvas_manager";

var DD_Candidate = false;
/**
 * @brief Handles user input and rendering of UI elements
 * 
 * @param  [HTMLElement] Element to map UI components to.
 */
export class UI_Manager {

    constructor(UIHTMLElement, ViewElement, system) {

        this.system = system;


        this.element = UIHTMLElement;
        this.view_element = ViewElement;
        this.ACTIVE_POINTER_INPUT = false;
        this.origin_x = 0;
        this.origin_y = 0;
        this.transform = new(Common     .Transform2D)();
        this.last_action = Date.now();
        this.ui_target = null;

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
            element.style.display = "";
            element.onclick = () => {
                this.mountComponent(menu);
            };
            this.main_menu.appendChild(element);
            this.main_menu.map.set(name, icon_element);
        }
    }

    addComponent(wick_component_file_path) {

        let doc = this.system.docs.get(this.system.docs.load(wick_component_file_path));

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

    integrateIframe(iframe, component) {

        iframe.contentWindow.addEventListener("wheel", e => {
            let x = ((component.x + 4 + e.pageX) * this.transform.scale) + this.transform.px;
            let y = ((component.y + 4 + e.pageY) * this.transform.scale) + this.transform.py;
            this.handleScroll(e, x, y);
        });

        iframe.contentWindow.addEventListener("mousedown", e => {

            let x = e.pageX + 4 + component.x;
            let y = e.pageY + 4 + component.y;
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
                        this.setTarget(e, component, x, y);
                    }
                }
            }


            return false;
        });

        iframe.contentWindow.addEventListener("mousemove", e => {
            let x = e.pageX + 4 + component.x;
            let y = e.pageY + 4 + component.y;
            this.handlePointerMoveEvent(e, x, y);
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
            if (x === NaN || y === NaN)
                debugger;

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

    handlePointerMoveEvent(e, x, y) {

        if (!this.ACTIVE_POINTER_INPUT) return;

        if (this.UI_MOVE) {
            x = (typeof(x) == "number") ? x : this.transform.getLocalX(e.pageX);
            y = (typeof(y) == "number") ? y : this.transform.getLocalY(e.pageY);
            let diffx = this.origin_x - x;
            let diffy = this.origin_y - y;
            this.transform.px -= diffx * this.transform.sx;
            this.transform.py -= diffy * this.transform.sy;
            this.origin_x = x + diffx;
            this.origin_y = y + diffy;
            this.render();
            this.view_element.style.transform = this.transform;
            return;
        } else if (this.ui_target) {
            let diffx = this.origin_x - ((typeof(x) == "number") ? x : e.pageX);
            let diffy = this.origin_y - ((typeof(y) == "number") ? y : e.pageY);
            this.origin_x -= diffx;
            this.origin_y -= diffy;
            if (this.ui_target.action) this.ui_target.action(this.system, this.ui_target.component, diffx, diffy);
        } else if (this.target) {
            let diffx = this.origin_x - ((typeof(x) == "number") ? x : this.transform.getLocalX(e.pageX));
            let diffy = this.origin_y - ((typeof(y) == "number") ? y : this.transform.getLocalY(e.pageY));
            let { dx, dy } = {dx:diffx, dy:diffy}//this.line_machine.getSuggestedLine(this.target.box, diffx, diffy);
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

        if (this.ui_target)
            return (this.ui_target = null);

        if (this.target)
            actions.COMPLETE(this.system, this.target.element, this.target.component);
    }

    handleDocumentDrop(e) {
        e.preventDefault();

        Array.prototype.forEach.call(e.dataTransfer.files, f => {
            let doc = this.system.docs.get(this.system.docs.load(f));

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

        switch (e.target.tagName.toUpperCase()) {
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

    update() {
        this.render();
    }

    render() {
        this.canvas.render(this.transform);
        if (this.target)
            this.line_machine.render(this.canvas.ctx, this.transform, this.target.box);
        this.loadedComponents.forEach(c => c.set(this.target));
    }
}