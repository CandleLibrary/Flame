//import path from "path";
export default class Handler {
    constructor(env, component_path) {
        this.package = null;

        if(component_path){
            const doc = env.data.docs.get(env.data.docs.loadFile(component_path));

            if (doc) 
                doc.bind(this);
        }
    }

    documentReady(pkg){
        this.package = pkg;
    }

    input(type, event, ui_manager, target) {
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
    end() { console.warn("No function has been defined for this action: end"); return this; }

    //Pointer start
    start() { console.warn("No function has been defined for this action: start"); return this; }

    //Pointer move
    move() { console.warn("No function has been defined for this action: move"); return this; }

    //Document drop
    docDrop() { console.warn("No function has been defined for this action: drop"); return this; }

    //Generic drop operation
    drop() { console.warn("No function has been defined for this action: drop"); return this; }

    //Wheel Scroll
    scroll() { console.warn("No function has been defined for this action: scroll"); return this; }

    //Context Menu
    context() { console.warn("No function has been defined for this action: context"); return this; }
}
