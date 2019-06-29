import Handler from "./handler.mjs";

class ZoomView extends Handler {
    scroll(event, env, data) {
        const ui = env.ui.interface;

        const amount = event.deltaY,
            os = ui.transform.scale;

        ui.transform.scale = Math.max(0.2, Math.min(2, os + -amount * 0.00005));

        const px = ui.transform.px,
            s = ui.transform.scale,
            py = ui.transform.py;

        ui.transform.px -= ((((px - data.x) * os) - ((px - data.x) * s))) / (os);
        ui.transform.py -= ((((py - data.y) * os) - ((py - data.y) * s))) / (os);
        
        return super.scroll();
    }
}

export default (new ZoomView());
