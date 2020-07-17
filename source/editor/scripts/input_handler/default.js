import Handler from "./handler.js";
import * as actions from "../actions/action";
import UI_Component from "../../component/ui_controller.js";

import pan_view from "./pan_view.js";
import zoom_view from "./zoom_view.js";

export default class Default extends Handler {

    constructor() {

        super();

        if (!Handler.default)
            Handler.default = this;

        this.dnd = false; // system.ui.manager.dnd;
        this.origin_x = 0;
        this.origin_y = 0;
        this.excess_x = 0;
        this.excess_y = 0;
        this.ACTIVE_POINTER_INPUT = false;

    }

    start(event, env, data) {

        if (event.button == 1)
            return pan_view.start(event, env, data);

        const ui = env.ui.interface;

        if (!data.action)
            super.start(event, env, data);
        else
            this.target_action = data.action;


        const x = data.x || env.ui.input_engine.x,
            y = data.y || env.ui.input_engine.y;

        if (this.dnd.ACTIVE) {
            this.dnd.start(event, data);
            return this.constructor.default;
        }

        ui.RENDER_LINES = true;

        this.origin_x = (x / ui.transform.scale);
        this.origin_y = (y / ui.transform.scale);

        this.ACTIVE_POINTER_INPUT = true;

        if (event.target !== document.body)
            return this.constructor.default;

        env.ui.setState(undefined, env.ui.comp.setActive(null));

        return this.constructor.default;
    }

    move(event, env, data) {
        const ui = env.ui.interface;

        if (this.dnd.ACTIVE) {
            this.dnd.move(event, data);
            return this.constructor.default;
        }

        if (!this.ACTIVE_POINTER_INPUT) return this.constructor.default;

        const x = data.x || env.ui.input_engine.x,
            y = data.y || env.ui.input_engine.y;

        if (this.target_action && env.ui.comp.active) {

            const diffx = this.origin_x - (x / ui.transform.scale) + this.excess_x;
            const diffy = this.origin_y - (y / ui.transform.scale) + this.excess_y;

            let xx = Math.round(diffx);
            let yy = Math.round(diffy);

            //const { dx, dy, MX, MY } = ui.line_machine.getSuggestedLine(ui.transform.scale, ui.target, xx, yy);

            this.origin_x -= diffx; //(MX) ? dx : xx;
            this.origin_y -= diffy; //(MY) ? dy : yy;
            //if(ui.target.box.l == ui.target.box.r && Math.abs(diffx) > 1 && Math.abs(dx) < 0.0001) debugger
            const ui_comp = env.ui.comp;

            let out = this.target_action(env, ui_comp.active.component, ui_comp.active.element, -diffx, -diffy, ui_comp.active.component.frame == ui_comp.active.element);

            if (out) {
                if (out.excess_x)
                    this.excess_x += out.excess_x;
                if (out.excess_y)
                    this.excess_y += out.excess_y;
            }

            ui.update();
        }

        return this.constructor.default;
    }

    end(event, env, data) {
        const ui = env.ui.interface;
        const comp = env.ui.comp;

        if (this.dnd.ACTIVE) {
            this.dnd.end(event, data);
            return this.constructor.default;
        }

        this.ACTIVE_POINTER_INPUT = false;

        if (comp.active) {
            if (comp.active instanceof UI_Component)
                ui.ui_target = null;
            else if (ui.target)
                actions.COMPLETE(env, comp.active);

            comp.active.element.flame_cache = null;
        }

        this.excess_x = 0;
        this.excess_y = 0;
        this.target_action = null;

        return super.end(event, env, data);
    }

    drop(data, ui, drop_data) {

        switch (drop_data.type) {
            case "css_selector":
                let comp = actions.CREATE_COMPONENT(ui.system, drop_data, data.x, data.y);
                break;
        }
    }

    docDrop(event, ui) {
        Array.prototype.forEach.call(event.dataTransfer.files,
            f => ui.mountDocument(
                f,
                ui.transform.getLocalX(event.clientX),
                ui.transform.getLocalY(event.clientY))
        );

        return this.constructor.default;
    }

    key() {

    }

    char() {

    }

    scroll(event, env, data) {
        return zoom_view.scroll(event, env, data);
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
