import { actions } from "./actions/action";
import { ControlWidget } from "./widget/controls_widget.mjs";

export class ControlsManager {
    constructor() {
        //Canvas setup.
        this.element = document.createElement("canvas");
        this.element.classList.add("flame_ui_canvas");
        this.ctx = this.element.getContext("2d");
    }

    addTarget(component, element, IS_COMPONENT, IS_ON_MASTER){

    }

    removeTarget(component, element){

    }
   

    setTarget(component, element, IS_COMPONENT = false, IS_ON_MASTER = false, env) {

        if(this.widget)
            this.widget.destroy();
        
        const box = new ControlWidget(env.ui.manager.active_handler.package, env);
        box.IS_ON_MASTER = IS_ON_MASTER;
        box.setTarget(component, element, IS_COMPONENT);
        box.setDimensions(element);
        this.widget = box;
    }
    
    clearTargets(transform) {
        if(this.widget)
            this.widget.destroy();
        
        this.widget = null;
        this.render(transform);
    }

    render(transform) {
        this.element.width = this.element.width;

        if (this.widget) {
            let scale = 1;
            
            this.ctx.save();

            if (!this.widget.IS_ON_MASTER) {
                transform.setCTX(this.ctx);
                scale = transform.scale;
            }

            this.widget.render(this.ctx, scale, transform);

            this.ctx.restore();
        }
    }

    pointerDown(e, x, y, transform, IS_ON_MASTER = false) {
        return false
    }

    resize(transform) {
        this.element.width = window.innerWidth;
        this.element.height = window.innerHeight;
        this.render(transform);
    }
}
