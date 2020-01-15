import * as css from "@candlefw/css";
import Element_box from "./widget/element_box.mjs";
//Responsible for registering controllers and handling UI state
export default function ui_state(env, ui_element, view_element, controllers = [], previous) {

    var overlay, comps, widget = null,
        hover = null,
        hover_component = null;

    const transform = new(css.types.transform2D)(previous ? previous.transform : undefined);

    const raf = requestAnimationFrame;

    function adjustInterface() {
        env.ui.comp_view.style.transform = transform;
        out.updateOverlay();
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
            for (let i = 0; i < controllers.length; i++) {
                if (controllers[i] == controller)
                    return ui_state(env, ui_element, view_element, [...controllers.slice(i), ...controllers.slice(i + 1, 0)], this);
            }
            return this;
        },

        hover(element, component) {

            if (element) {

                if (!hover)
                    hover = new Element_box(element);
                else
                    hover.element = element;

                hover.update();

                for (const controller of controllers) {
                    if (controller.type == "hover") {
                        hover_component = controller;
                    }
                }

                if (hover_component) {
                    hover_component.mount(ui_element, { element, component });
                    hover_component.update(env, hover);
                }

            } else {

                if (hover_component)
                    hover_component.unmount();
            }
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
                if (!widget)
                    widget = new Element_box(comp.active.element, comp.active.component);
                else{
                    widget.window = comp.active.component;
                    widget.element = comp.active.element;
                }

                for (const controller of controllers) {
                    if (controller.type == "overlay") {
                        overlay = controller;
                    }
                }

                if (overlay) {
                    overlay.mount(ui_element, comp.active);
                }

                this.update();

            }
        },

        updateOverlay() {
            if (widget)
                widget.update();

            if (overlay)
                overlay.update(env);
        },

        update() {
            

            if (widget){
                if(widget.element.replacement){
                    widget.element = widget.element.replacement;
                }
                widget.update();
            }

            for (const controller of controllers) {
                if (controller.type == "hover") {
                    if (hover)
                        controller.update(env, hover);
                } else {
                    controller.update(env);
                }
            }
        },

        get widget() {
            return widget;
        },

        get transform() {
            return public_transform;
        }
    };

    return out;
}