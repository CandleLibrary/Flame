import Handler from "./handler.mjs";
import { actions } from "../actions/action";

export default class Default extends Handler {

    constructor(system, component = "/@ui/basic.html") {

        super(system, component);

        if (!Handler.default)
            Handler.default = this;

        this.dnd = system.ui.manager.dnd;
        this.origin_x = 0;
        this.origin_y = 0;
        this.excess_x = 0;
        this.excess_y = 0;
        this.UI_MOVE = false;
        this.ACTIVE_POINTER_INPUT = false;
    }

    start(event, ui, data) {
        const x = data.x,
            y = data.y;

        if (this.dnd.ACTIVE) {
            this.dnd.start(event, data);
            return this.constructor.default;
        }

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

        this.origin_x = (x / ui.transform.scale);
        this.origin_y = (y / ui.transform.scale);

        this.ACTIVE_POINTER_INPUT = true;

        if (event.target !== document.body)
            return this.constructor.default;


        ui.controls.clearTargets(ui.transform);
        ui.main_menu.setAttribute("show", "false");

        return this.constructor.default;
    }

    move(event, ui, data) {

        if (this.dnd.ACTIVE) {
            this.dnd.move(event, data);
            return this.constructor.default
        }

        if (!this.ACTIVE_POINTER_INPUT) return this.constructor.default;

        let x = data.x,
            y = data.y;

        if (this.UI_MOVE) {
            // /x /= ui.transform.scale // (typeof(x) == "number") ? x : ui.transform.getLocalX(ui.pointer_x);
            // /y /= ui.transform.scale // (typeof(y) == "number") ? y : ui.transform.getLocalY(ui.pointer_y);
            const diffx = this.origin_x - x;
            const diffy = this.origin_y - y;


            ui.transform.px -= diffx //* ui.transform.sx;
            ui.transform.py -= diffy //* ui.transform.sy;

            this.origin_x -= diffx;
            this.origin_y -= diffy;

            ui.view_element.style.transform = ui.transform;
            ui.render();
        } else if (ui.ui_target) {
            const diffx = this.origin_x - x;
            const diffy = this.origin_y - y;
            this.origin_x -= diffx;
            this.origin_y -= diffy;
            if (ui.ui_target.action) ui.ui_target.action(ui.system, ui.ui_target.component, diffx, diffy);
        } else if (ui.target) {

            const diffx = this.origin_x - (x / ui.transform.scale) + this.excess_x;
            const diffy = this.origin_y - (y / ui.transform.scale) + this.excess_y;

            let xx = Math.round(diffx)
            let yy = Math.round(diffy)

            const { dx, dy, MX, MY } = ui.line_machine.getSuggestedLine(ui.transform.scale, ui.target, xx, yy);

            this.origin_x -= (MX) ? dx : xx;
            this.origin_y -= (MY) ? dy : yy;
            //if(ui.target.box.l == ui.target.box.r && Math.abs(diffx) > 1 && Math.abs(dx) < 0.0001) debugger
            if (ui.target.action && ui.target.component) {
                let out = ui.target.action(ui.system, ui.target.component, ui.target.element, -dx, -dy, ui.target.IS_COMPONENT);

                if (out) {
                    if (out.excess_x)
                        this.excess_x += out.excess_x;
                    if (out.excess_y)
                        this.excess_y += out.excess_y;
                }
            }

        }
        ui.render();

        return this.constructor.default;
    }

    end(event, ui, data) {
        if (this.dnd.ACTIVE) {
            this.dnd.end(event, data);
            return this.constructor.default
        }


        this.UI_MOVE = false;
        this.ACTIVE_POINTER_INPUT = false;

        if (ui.ui_target)
            ui.ui_target = null;
        else if (ui.target)
            actions.COMPLETE(ui.system, ui.target.component, ui.target.element);

        ui.RENDER_LINES = false;
        ui.render();

        this.excess_x = 0;
        this.excess_y = 0;

        return this.constructor.default;
    }

    drop(data, ui, drop_data){

        switch(drop_data.type){
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

    scroll(event, ui, data) {
        const amount = event.deltaY,
            os = ui.transform.scale;

        ui.transform.scale = Math.max(0.2, Math.min(2, os + -amount * 0.00005));

        const px = ui.transform.px,
            s = ui.transform.scale,
            py = ui.transform.py;

        ui.transform.px -= ((((px - data.x) * os) - ((px - data.x) * s))) / (os);
        ui.transform.py -= ((((py - data.y) * os) - ((py - data.y) * s))) / (os);
        ui.view_element.style.transform = ui.transform;

        ui.render();
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
