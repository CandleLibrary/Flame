//*********** Actions ******************
import wick from "wick";
import { CREATE_COMPONENT, CREATE_CSS_DOC } from "./actions/create";
import { COMPLETE } from "./actions/complete";
import { TEXTEDITOR } from "./actions/text";

//OTHER imports
import {
    CanvasManager
} from "./canvas_manager"; 
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
        this.transform = new(wick.core.common.Transform2D)();
        this.last_action = Date.now();
        
        //Array of components
        this.components = [];
        this.UI_MOVE = false;
        
        //CanvasManager provides onscreen transform visual widgets for components and elements.
        this.canvas = new CanvasManager();
        this.canvas.resize(this.transform);
        this.element.appendChild(this.canvas.element);

        /* 
            UI components serve as UX/UI handlers for all tools that comprise flame.
            These can be modified by the user through project system to create and use custom UI
            elements. 
        */
        this.ui_components = new Map();

        // **************** Eventing *****************
        window.addEventListener("resize", e => this.canvas.resize(this.transform));

        // // *********** Mouse *********************
        window.addEventListener("mouseover", e => {});
        window.addEventListener("wheel", e => this.handleScroll(e));

        // // *********** Pointer *********************
        window.addEventListener("pointerdown", e => {
            this.canvas.clearTargets(this.transform);
            this.handlePointerDownEvent(e);
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

    setTarget(e, x, y) {
        let target = null;
        if (target = this.canvas.pointerDown(e, x, y, this.transform)) {
            this.target = target;
            return true;
        }
        return false;
    }

    intergrateIframe(iframe, component) {
        iframe.contentWindow.addEventListener("wheel", e => {
            let x = e.pageX + 4 + component.x;
            let y = e.pageY + 4 + component.y;
            this.handleScroll(e, x, y)
        });
        iframe.contentWindow.addEventListener("mousedown", e => {
            // /e.preventDefault();
            // /e.stopPropagation();
            let x = e.pageX + 4 + component.x;
            let y = e.pageY + 4 + component.y;
            this.last_action = Date.now();
            //test to see if there is a UI element that should be receiving the event. 
            this.handlePointerDownEvent(e, x, y);
            if (e.button == 0 && !this.setTarget(e, x, y)) {
                this.canvas.setIframeTarget(e.target, component);
                this.canvas.render(this.transform);
                this.setTarget(e, x, y);
            }
            return false;
        });
        iframe.contentWindow.addEventListener("mousemove", e => {
            //e.preventDefault();
            //e.stopPropagation();
            //  test to see if there is a UI element that should be receiving the event. 
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
                    this.handleContextMenu(e, x, y);
                } else {
                    this.canvas.setIframeTarget(e.target, component);
                    this.canvas.render(this.transform);
                    this.setTarget(e, x, y);
                    DD_Candidate = Date.now();
                }
            }
            this.handlePointerEndEvent(e);
        });
    }
    handlePointerDownEvent(e, x = this.transform.getLocalX(e.pageX), y = this.transform.getLocalY(e.pageY)) {
        this.origin_x = x;
        this.origin_y = y;
        this.ACTIVE_POINTER_INPUT = true;
        if (e.button == 1) {
            this.UI_MOVE = true;
            return true;
        }
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
            this.canvas.render(this.transform);
            this.view_element.style.transform = this.transform;
            return;
        } else if (this.target) {
            if(this.target.element.tagName == "BODY") return;
            this.origin_x = x;
            this.origin_y = y;
            if (this.target.action) this.target.action(this.system, this.target.element, this.target.component, -diffx, -diffy);
            this.canvas.render(this.transform);
        }
    }
    handlePointerEndEvent(e) {
        this.UI_MOVE = false;
        this.ACTIVE_POINTER_INPUT = false;
        this.target = null;
        COMPLETE(this.system);
    }
    handleDocumentDrop(e) {
        e.preventDefault();
        Array.prototype.forEach.call(e.dataTransfer.files, f => {
            let doc = this.system.doc_man.get(this.system.doc_man.load(f));
            if (doc) switch (doc.type) {
                case "html":
                    CREATE_COMPONENT(this.system, doc, {
                        x: this.transform.getLocalX(e.clientX),
                        y: this.transform.getLocalY(e.clientY)
                    });
                    break;
                case "css":
                    CREATE_CSS_DOC(this.system, doc, {
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

    handleContextMenu(e, x, y) {
        //Load text editor in the bar.
        TEXTEDITOR(this.system, this.target.element, this.target.component, x, y);
    }

    handleScroll(e, x = e.pageX, y = e.pageY) {
        e.preventDefault();
        let amount = e.deltaY;
        let diff = -amount * 0.0001;
        let os = this.transform.scale;
        this.transform.scale = Math.max(0.2, Math.min(2, os + -amount * 0.00005));
        let px = this.transform.px,
            s = this.transform.scale,
            py = this.transform.py;
        this.transform.px -= ((((px - x) * os) - ((px - x) * s))) / (os);
        this.transform.py -= ((((py - y) * os) - ((py - y) * s))) / (os);
        this.canvas.render(this.transform);
        this.view_element.style.transform = this.transform;
    }

    addComponent(component) {
        this.components.push(component);
    }
}