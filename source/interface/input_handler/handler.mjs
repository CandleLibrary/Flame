import ui_controller from "../../component/ui_controller.mjs";

/*
    The base level input handler.
*/
export default class Handler {

    handle(type, event, ui_manager, target) {
        switch (type) {
            case "key":
                return this.char(event, ui_manager, target);
            case "char":
                return this.key(event, ui_manager, target);
            case "end":
                return this.end(event, ui_manager, target);
            case "start":
                return this.start(event, ui_manager, target);
            case "move":
                return this.move(event, ui_manager, target);
            case "drop":
                return this.docDrop(event, ui_manager, target);
            case "generic_drop":
                return this.drop(event, ui_manager, target);
            case "scroll":
                return this.scroll(event, ui_manager, target);
            case "hover":
                return this.hover(event, ui_manager, target);
            case "context":
                return this.context(event, ui_manager, target);
        }
    }

    hover(event, env, data) {
        if (data) {
            let component = null;

            let element = env.ui.comp_view.shadowRoot.elementFromPoint(data.x, data.y);

            if (element && element.component) {
                while (!element.component) {
                    element = element.parentNode;
                }

                if (element.component) {

                    component = element.component;

                    if (component && !(component instanceof ui_controller) ) {

                        if (component.type == "css") {
                            element = component.element;
                        } else if (element.shadowRoot) {
                            element = element.shadowRoot.elementFromPoint(data.x, data.y);
                        }

                        if (element !== env.ui.interface.widget.element)
                            env.ui.setHover(element, component);


                        return Handler.default;
                    }
                }
            }

            env.ui.ui_view.style.display = "";
        }
        
        env.ui.setHover();
        

        return Handler.default;
    }

    //Pointer end
    end(event, env, data) {

        // return Handler.default;
        if (data && event.button == 0 && data.time_since_last_click < 100) {

            let component = null;

            env.ui.ui_view.style.pointerEvents = "none";

            let element = env.ui.comp_view.shadowRoot.elementFromPoint(data.x, data.y);

            if (element) {
                while (element && !element.component) {
                    element = element.parentNode;
                }

                if (element && element.component) {

                    component = element.component;


                    if (component.type == "css") {
                        element = component.element;
                    } else {
                        element = element.shadowRoot.elementFromPoint(data.x, data.y);
                    }

                    data.time_since_last_click = Infinity;

                    env.ui.setState(undefined, env.ui.comp.setActive({ component, element }));
                }
            }

            env.ui.ui_view.style.pointerEvents = "";
        }

        return Handler.default;
    }

    //Pointer start
    start(event, env, data) {

        if (data && !env.ui.interface.active && event.button == 0) {
            let component = null;

            env.ui.ui_view.style.display = "none";

            let element = env.ui.comp_view.shadowRoot.elementFromPoint(data.x, data.y);

            if (element && element.component) {
                while (!element.component) {
                    element = element.parentNode;
                }

                if (element.component) {

                    component = element.component;


                    if (component.type == "css") {
                        element = component.element;
                    } else {
                        element = element.shadowRoot.elementFromPoint(data.x, data.y);
                    }

                    data.time_since_last_click = Infinity;

                    env.ui.setState(undefined, env.ui.comp.setActive({ component, element }));
                }
            }

            env.ui.ui_view.style.display = "";
        }

        return Handler.default;
    }

    //Pointer move
    move() { return Handler.default }

    //Document drop
    docDrop() { return Handler.default }

    //Generic drop operation
    drop() { return Handler.default }

    //Wheel Scroll
    scroll() { return Handler.default }

    //Context Menu
    context() { return Handler.default }
}

Handler.default = null;