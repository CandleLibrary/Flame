import Handler from "./handler.mjs";
import { actions } from "../actions/action";

export default class Default extends Handler {

    constructor() {
        super();
        this.origin_x = 0;
        this.origin_y = 0;
        this.UI_MOVE = false;
        this.ACTIVE_POINTER_INPUT = false;
    }

    start(event, ui, data) {
        const x = ui.transform.getLocalX(event.pageX),
              y = ui.transform.getLocalY(event.pageY);

        if (event.button == 1) {

            if (isNaN(x) || isNaN(y))
                debugger;

            this.origin_x = x;
            this.origin_y = y;
            this.ACTIVE_POINTER_INPUT = true;
            this.UI_MOVE = true;

            return this.constructor.default;
        }

        ui.RENDER_LINES = true;

        this.origin_x = x;
        this.origin_y = y;
        this.ACTIVE_POINTER_INPUT = true;

        if (event.target !== document.body)
            return this.constructor.default;

        ui.canvas.clearTargets(ui.transform);
        ui.main_menu.setAttribute("show", "false");


        return this.constructor.default;
    }

    move(event, ui, data) {
        let x = data.x,
            y = data.y;

        if (!this.ACTIVE_POINTER_INPUT) return this.constructor.default;

        if (this.UI_MOVE) {
            x = (typeof(x) == "number") ? x : ui.transform.getLocalX(event.pageX);
            y = (typeof(y) == "number") ? y : ui.transform.getLocalY(event.pageY);
            const diffx = this.origin_x - x;
            const diffy = this.origin_y - y;


            ui.transform.px -= diffx * ui.transform.sx;
            ui.transform.py -= diffy * ui.transform.sy;
            this.origin_x = x + diffx;
            this.origin_y = y + diffy;
            ui.render();
            ui.view_element.style.transform = ui.transform;
        } else if (ui.ui_target) {
            const diffx = this.origin_x - ((typeof(x) == "number") ? x : event.pageX);
            const diffy = this.origin_y - ((typeof(y) == "number") ? y : event.pageY);
            this.origin_x -= diffx;
            this.origin_y -= diffy;
            if (ui.ui_target.action) ui.ui_target.action(ui.system, ui.ui_target.component, diffx, diffy);
        } else if (ui.target) {
            const diffx = this.origin_x - ((typeof(x) == "number") ? x : ui.transform.getLocalX(event.pageX));
            const diffy = this.origin_y - ((typeof(y) == "number") ? y : ui.transform.getLocalY(event.pageY));

            const { dx, dy, MX, MY } = ui.line_machine.getSuggestedLine(ui.target.box, diffx, diffy);

            this.origin_x -= (MX) ? dx : diffx;
            this.origin_y -= (MY) ? dy : diffy;

            //if(ui.target.box.l == ui.target.box.r && Math.abs(diffx) > 1 && Math.abs(dx) < 0.0001) debugger
            if (ui.target.action) ui.target.action(ui.system, ui.target.component, ui.target.element, -dx, -dy, ui.target.IS_COMPONENT);

            ui.render();
        }

        return this.constructor.default;
    }

    end(event, ui, data) {
        this.UI_MOVE = false;
        this.ACTIVE_POINTER_INPUT = false;

        if (ui.ui_target)
            ui.ui_target = null;
        else if (ui.target)
            actions.COMPLETE(ui.system, ui.target.component, ui.target.element);

        ui.RENDER_LINES = false;
        ui.render();

        return this.constructor.default;
    }

    drop(event, ui) {
        Array.prototypevent.forEach.call(event.dataTransfer.files,
            f => ui.mountDocument(
                f,
                ui.transform.getLocalX(event.clientX),
                ui.transform.getLocalY(event.clientY))
        );

        return this.constructor.default;
    }

    scroll(event, ui, data) {
        const amount = event.deltaY,
            os = ui.transform.scale;

        ui.transform.scale = Math.max(0.2, Math.min(2, os + -amount * 0.00005));

        const px = ui.transform.px,
            s = ui.transform.scale,
            py = ui.transform.py;

        ui.transform.px -= ((((px - data.x) * os) - ((px - data.x) * s))) / (os);
        ui.transform.py -= ((((py - data.y) * os) - ((py - data.y) * s))) / (os);
        ui.render();
        ui.view_element.style.transform = ui.transform;

        return this.constructor.default;
    }

    context(event, ui, data) {
        switch (event.target.tagName.toUpperCase()) {
            case "SVG":
            case "RECT":
            case "PATH":
                ui.svg_manager.mount(ui, event.target, data.component, event.x, event.y);
                break;
            default:
                ui.ui_components.get("element_edit.html").mount(ui.element);
        }

        return this.constructor.default;
    }
}

Handler.default = new Default();
