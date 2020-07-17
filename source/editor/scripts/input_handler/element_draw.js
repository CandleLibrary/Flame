import Default from "./default.js";
import Handler from "./handler.js";
import { actions } from "../actions/action";

export default class ElementDraw extends Default {

    constructor(system) {
        super(system, "/@ui/element_draw.html");
        this.root_x = 0;
        this.root_y = 0;

        if (!Handler.element_draw)
            Handler.element_draw = this;
    }

    start(event, ui, data) {


        if (!data.FROM_MAIN || event.button == 1)
            return Handler.default.start(event, ui, data);


        const x = data.x || ui.transform.getLocalX(event.pageX),
            y = data.y || ui.transform.getLocalY(event.pageY);


        this.origin_x = x;
        this.origin_y = y;
        this.root_x = x;
        this.root_y = y;

        return this;
    }

    move(event, ui, data) {

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

        let x = x2 - x1;
        let y = y2 - y1;

        if (Math.sqrt(x * x + y * y) < 70.711)
            return Handler.default;


        actions.CREATE_ELEMENT(
            ui.system,
            ui.master_component,
            ui.master_component.sourceElement,
            "div",
            x1, y1, x2 - x1, y2 - y1);

        ui.render();

        return Handler.default;
    }
}
