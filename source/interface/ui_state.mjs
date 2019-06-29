import * as css from "@candlefw/css";

//Responsible for registering controllers and handling UI state
export default function ui_state(env, ui_element, view_element, controllers = [], previous) {

    var overlay, comps, input;

    const transform = new(css.types.transform2D)(previous ? previous.transform : undefined);

    const raf = requestAnimationFrame;

    function adjustInterface() {
        view_element.style.transform = transform;

        if (overlay)
            overlay.render(transform);
    }

    const public_transform = new Proxy(transform, {
        set: (obj, prop, val) => {
            obj[prop] = val;
            raf(adjustInterface);
            return true;
        }
    });

    view_element.style.transform = transform;

    return {

        addController(controller) {
            return ui_state(env, ui_element, view_element, [controller, ...controllers], this);
        },

        removeController(controller) {

        },

        active(comp) {

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
                for (const controller of controllers) {
                    if (controller.type == "overlay") {
                        overlay = controller;
                    }
                }

                if(overlay)
                    overlay.mount(ui_element, comp.active);
            }
        },

        update(){
            if(overlay)
                overlay.update();
        },
        get transform() {
            return public_transform;
        }
    };
}
