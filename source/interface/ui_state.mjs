import * as css from "@candlefw/css";
import Element_box from "./widget/element_box.mjs";
//Responsible for registering controllers and handling UI state
export default function ui_state(env, ui_element, view_element, controllers = [], previous) {

    var overlay, comps, widget = null;

    const transform = new(css.types.transform2D)(previous ? previous.transform : undefined);

    const raf = requestAnimationFrame;

    function adjustInterface() {
        env.ui.comp_view.style.transform = transform;
        out.updateOverlay();
        //if (overlay)
        //    overlay.render(transform);
    }

    const public_transform = new Proxy(transform, {
        set: (obj, prop, val) => {
            obj[prop] = val;
            raf(adjustInterface);
            return true;
        }
    });

    env.ui.comp_view.style.transform = transform;

    const out = {

        addController(controller) {
            return ui_state(env, ui_element, view_element, [controller, ...controllers], this);
        },

        removeController(controller) {

        },

        activate(comp) {

            if (env.ui.interface !== this) {
                ui_element.innerHTML = "";
                controllers.forEach(c => void(c.type == "toolbar" ? c.mount(ui_element) : null));
                env.ui.interface = this;
            }

            if (comps !== comp) {
                view_element.innerHTML = "";
                comp.components.forEach(c => c.mount(view_element));
                comps = comp;
            }

            if (comp.active) {
                if(!widget)
                    widget = new Element_box(comp.active.element);
                else 
                    widget.element = comp.active.element;

                widget.update();

                for (const controller of controllers) {
                    if (controller.type == "overlay") {
                        overlay = controller;
                    }
                }

                if(overlay)
                    overlay.mount(ui_element, comp.active);

                for(const controller of controllers)
                    controller.update(env);
            }
        },

        updateOverlay(){
            if(widget)
                widget.update();

            if(overlay)
                overlay.update(env);
        },

        update(){

            if(widget)
                widget.update();

            for(const controller of controllers)
                controller.update(env);
            
        },

        get widget(){
            return widget;
        },

        get transform() {
            return public_transform;
        }
    };

    return out;
}
