export default class Handler {
    constructor() {

    }

    input(type, event, ui_manager, target) {
        switch (type) {
            case "end":
                return this.end(event, ui_manager, target);
            case "start":
                return this.start(event, ui_manager, target);
            case "move":
                return this.move(event, ui_manager, target);
            case "drop":
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
    drop() { console.warn("No function has been defined for this action: drop"); return this; }

    //Wheel Scroll
    scroll() { console.warn("No function has been defined for this action: scroll"); return this; }

    //Context Menu
    context() { console.warn("No function has been defined for this action: context"); return this; }
}
