//import path from "path";
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
            case "context":
                return this.context(event, ui_manager, target);
        }
    }

    //Pointer end
    end() { return Handler.default }

    //Pointer start
    start(event, env, point) {
        //
        
        let component = null;

        if (point) {

            let element = document.elementFromPoint(point.x, point.y);

            if (element) {

                if (element.component) {

                    component = element.component;


                    if (component.type == "css") {
                        element = component.element;
                    } else {
                        element = element.shadowRoot.elementFromPoint(point.x, point.y);
                    }

                    env.ui.setState(undefined, env.ui.comp.setActive({component,element}));
                }
            }
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
