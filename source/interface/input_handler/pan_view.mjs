import Handler from "./handler.mjs";

class PanView extends Handler {

    constructor() {

        super();

        this.origin_x = 0;
        this.origin_y = 0;
    }

    start(event, env, data) {

        if (event.button !== 1)
            return Handler.default.start(event, env, data);

        this.origin_x = data.x;
        this.origin_y = data.y;

        return this;
    }

    move(event, env, data) {
        const ui = env.ui.interface;
        const x = data.x,
            y = data.y;
            
        const diffx = this.origin_x - x;
        const diffy = this.origin_y - y;

        ui.transform.px -= diffx;
        ui.transform.py -= diffy;

        this.origin_x -= diffx;
        this.origin_y -= diffy;

        return this;
    }
}

export default (new PanView());
