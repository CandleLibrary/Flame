import Handler from "./input_handler/handler.mjs";

export default function input_state(env, ui_state, component_state, previous, handle = new Handler) {
    
    if(!handle && previous) return env.ui = previous;

    return {
        handlePointerMoveEvent: function (e, point) {
            handler.input("move", ui_state, component_state, point);
        },

        handlePointerDownEvent: function (e, point, FROM_MAIN = false) {
            let component = null,
                element = null;

            this.last_action = Date.now();

            handler = handler.input("start", e, this, { x: point.x, y: point.y, FROM_MAIN });

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

            return this;
        },

        handlePointerEndEvent: function (event) {
            const{comp, ui, handler} = handler.input("end", event, ui_state, component_state, previous);
            //env.ui = input_state(env, ui, comp, this, handler);
        },

        handleGenericDrop: function (obj, x, y) {
            const{comp, ui, handler} = handler.input("generic_drop", obj, ui_state, component_state, previous);
            //env.ui = input_state(env, ui, comp, this, handler);
        },

        handleDocumentDrop: function (e) {
            const{comp, ui, handler} = handler.input("drop", event, ui_state, component_state, previous);
            //env.ui = input_state(env, ui, comp, this, handler);
        },

        handleContextMenu:function (e, component = null) {
            const{comp, ui, handler} = handler.input("context", e, ui_state, component_state, previous);
            //env.ui = input_state(env, ui, comp, this, handler);
        },

        handleScroll:function (e, x, y) {
            const{comp, ui, handler} = handler.input("scroll", e, ui_state, component_state, previous);
            //env.ui = input_state(env, ui, comp, this, handler);
        },

        handleKeyUp:function (e) {
            const{comp, ui, handler} = handler.input("key", e, ui_state, component_state, previoust);
            //env.ui = input_state(env, ui, comp, this, handler);
        },

        get previous(){return previous}
    };
}