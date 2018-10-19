import {
    MOVE,
    CREATE_COMPONENT,
    CREATE_CSS_DOC
} from "./action";

/**
 * @brief Handles user input and rendering of UI elements
 * 
 * @param  [HTMLElement] Element to map UI components to.
 */
export class UI_Manager {
    constructor(UIHTMLElement, ViewElement, system) {

        this.transform = new (require("wick").core.common.Transform2D)();
        this.element = UIHTMLElement;
        this.view_element = ViewElement;
        this.ACTIVE_POINTER_INPUT = false;
        this.origin_x = 0;
        this.origin_y = 0;
        this.position_x = 0;
        this.position_y = 0;
        this.scale = 1;
        this.system = system;
        //Array of components
        this.components = [];
        this.UI_MOVE = false;


        //Eventing

        window.addEventListener("mouseover", e => {
            if (e.target.tagName == "BUTTON") {
                //load the source up and adjust it's source package
                this.target = e.target;
            }
        });

        window.addEventListener("wheel", e=>{
            e.preventDefault();
            let amount = e.deltaY;
            let diff = -amount * 0.00005;
            let os = this.scale;
            this.scale = Math.max(0.2, Math.min(1.5, this.scale + -amount * 0.00005));
            this.transform.scale = this.scale;

            let px = this.transform.px, s = this.scale, x = e.pageX;
            let py = this.transform.py,  y = e.pageY;
            console.log(x,y, px, py)

            this.transform.px += (((x * os) - px * os)) - ((x * s) - px * s);
            this.transform.py += (((y * os) - py * os)) - ((y * s) - py * s);
            //this.transform.py += ((this.transform.py - e.pageY) * this.scale);

            this.view_element.style.transform = this.transform;
        })

        window.addEventListener("pointerdown", e => this.handlePointerDownEvent(e));
        window.addEventListener("pointermove", e => this.handlePointerMoveEvent(e));
        window.addEventListener("pointerup", e => this.handlePointerEndEvent(e));
        document.body.addEventListener("drop", e => this.handleDocumentDrop(e));
        document.body.addEventListener("dragover", e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy"
        });
        document.body.addEventListener("dragstart", e => {
            debugger
        });
    }

    intergrateIframe(iframe){
        let window = iframe.contentWindow;
        let document = window.document;

        window.addEventListener("mouseover", e => {
            if (e.target.tagName == "BUTTON") {
                //load the source up and adjust it's source package
                this.target = e.target;
            }
        });

        return;

        window.addEventListener("pointerdown", e => this.handlePointerDownEvent(e));
        window.addEventListener("pointermove", e => this.handlePointerMoveEvent(e));
        window.addEventListener("pointerup", e => this.handlePointerEndEvent(e));
        
        document.body.addEventListener("drop", e => this.handleDocumentDrop(e));
        
        document.body.addEventListener("dragover", e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy"
        });
        
        document.body.addEventListener("dragstart", e => {
            debugger
        });
    }

    handlePointerDownEvent(e) {
        this.origin_x = e.pageX;
        this.origin_y = e.pageY;
        this.ACTIVE_POINTER_INPUT = true;
        if (e.button == 1) {
            this.UI_MOVE = true;
        } else {
            for (let i = 0, l = this.components.length; i < l; i++) {
                let comp = this.components[i];
                if (comp.pointInBoundingBox(e.pageX, e.pageY)) {}
            }
        }
    }
    handlePointerMoveEvent(e) {
        if (!this.ACTIVE_POINTER_INPUT) return;
        let diffx = this.origin_x - e.pageX;
        let diffy = this.origin_y - e.pageY;
        this.origin_x -= diffx;
        this.origin_y -= diffy;
        if (this.UI_MOVE) {
            this.transform.px += -diffx;
            this.transform.py += -diffy;
            this.view_element.style.transform = this.transform;
            return
        }
        if (this.target) MOVE(this.system, this.target, {
            dx: -diffx,
            dy: -diffy
        });
    }
    moveObject(dx, dy, t) {
        console.log(dx, dy, t.style.left, parseInt(t.style.left || 0) + -dx + "px");
        t.style.left = parseInt(t.style.left || 0) + -dx + "px";
        t.style.top = parseInt(t.style.top || 0) + -dy + "px";
        //Update the position of the object based on it's css properties.
    }
    handlePointerEndEvent(e) {
        this.UI_MOVE = false;
        this.ACTIVE_POINTER_INPUT = false;
    }
    handleDocumentDrop(e) {
        e.preventDefault();
        Array.prototype.forEach.call(e.dataTransfer.files, f => {
            
            let doc = this.system.doc_man.get(this.system.doc_man.load(f));

            console.log(doc)
            if (doc) switch (doc.type) {
                case "html":
                    CREATE_COMPONENT(this.system, doc, {
                        x: e.clientX + this.position_x,
                        y: e.clientY + this.position_y
                    });
                    break;
                case "css":
                    CREATE_CSS_DOC(this.system, doc, {
                        x: e.clientX + this.position_x,
                        y: e.clientY + this.position_y
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
    addComponent(component) {
        this.components.push(component);
    }
}