import {MOVE} from "./action"

/**
 * @brief Handles user input and rendering of UI elements
 * 
 * @param  [HTMLElement] Element to map UI components to.
 */
export class UI_Manager {

    constructor(UIHTMLElement, ViewElement, system) {

        this.element = UIHTMLElement;
        this.view_element = ViewElement;
        this.ACTIVE_POINTER_INPUT = false;

        this.origin_x = 0;
        this.origin_y = 0;

        this.position_x = 0;
        this.position_y = 0;

        this.system = system;


        //Array of components
        this.components = [];

        window.addEventListener("mouseover", e => {
            if (e.target.tagName == "BUTTON") {
                //load the source up and adjust it's source package
                this.target = e.target;
                console.log("AAA")
            }
            console.log(e.target.tagName);
        });

        window.addEventListener("pointerdown", e => {
            this.handlePointerDownEvent(e);

        });

        window.addEventListener("pointermove", e => {
            this.handlePointerMoveEvent(e);
        });

        window.addEventListener("pointerup", e => {
            this.handlePointerEndEvent(e);
        });
    }

    handlePointerDownEvent(e) {
        this.ACTIVE_POINTER_INPUT = true;
        this.origin_x = e.offsetX;
        this.origin_y = e.offsetY;

        for (let i = 0, l = this.components.length; i < l; i++) {
            let comp = this.components[i];
            if (comp.pointInBoundingBox(e.offsetX, e.offsetY)) {

            }
        }
    }

    handlePointerMoveEvent(e) {
        if (!this.ACTIVE_POINTER_INPUT) return;
        let diffx = this.origin_x - e.offsetX;
        let diffy = this.origin_y - e.offsetY;


        if (this.target)
            MOVE(this.system, this.target, {dx:diffx, dy:diffy});
        else {
            this.position_x += diffx;
            this.position_y += diffy;
            this.origin_x -= diffx;
            this.origin_y -= diffy;
            this.view_element.style.transform = `translate(${-this.position_x}px, ${-this.position_y}px)`;
        }
    }

    moveObject(dx, dy, t) {
    	console.log(dx,dy,t.style.left, parseInt(t.style.left || 0) + -dx + "px")
    	t.style.left = parseInt(t.style.left || 0) + -dx + "px";
    	t.style.top = parseInt(t.style.top || 0) + -dy + "px";
        //Update the position of the object based on it's css properties.
    }

    handlePointerEndEvent(e) {
        this.ACTIVE_POINTER_INPUT = false;
    }

    addComponent(component) {
        this.components.push(component);
    }


}