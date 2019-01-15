import Default from "./default.mjs";
import Handler from "./handler.mjs";
import { actions } from "../actions/action";

const default_handler = Handler.default;

export default class ElementDraw extends Default {

    constructor() {
        super();
        this.root_x = 0;
        this.root_y = 0;
    }

    start(event, ui, data) {
        if (event.button == 1) 
            return default_handler.start(event, ui, data);

        const x = data.x || ui.transform.getLocalX(event.pageX),
            y = data.y || ui.transform.getLocalY(event.pageY);

        this.origin_x = x;
        this.origin_y = y;
        this.root_x = x;
        this.root_y = y;

        return this;
    }

    move(event, ui, data) {

        //if (!this.ACTIVE_POINTER_INPUT) return this;

        const x = data.x || ui.transform.getLocalX(event.pageX),
            y = data.y || ui.transform.getLocalY(event.pageY);

        this.origin_x = x;
        this.origin_y = y;
        
        return this;
    }

    end(event, ui, data) {
        this.UI_MOVE = false;
        this.ACTIVE_POINTER_INPUT = false;

        const x1 = Math.min(this.origin_x, this.root_x);
        const y1 = Math.min(this.origin_y, this.root_y);
        const x2 = Math.max(this.origin_x, this.root_x);
        const y2 = Math.max(this.origin_y, this.root_y);

        actions.CREATE_ELEMENT(
            ui.system,
            ui.master_component,
            ui.master_component.sourceElement,
            "div",
            x1, y1, x2 - x1, y2 - y1);

        ui.render();

        return default_handler;
    }
}

Handler.element_draw = new ElementDraw();
