//import wick from "@candlefw/wick";

import {
    Component
} from "../component/component";
/**
 * This module is responsible for storing, updating, and caching compents. 
 * In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
 * Any associated stylesheets are managed through this componnent. 
 */
class UIComponent extends Component {

    constructor(system, name) {

        super(system);

        this.iframe.onload = (e) => {

            this.mountListeners();

            let children = Array.prototype.slice.apply(this.data.children);

            for (let i = 0; i < children.length; i++) {
                e.target.contentDocument.body.appendChild(children[i]);
            }

            //e.target.contentWindow.wick = wick;

            this.window = e.target.contentWindow;

            this.local_css.forEach((css) => {
                let style = document.createElement("style");
                style.innerText = css + "";
                this.iframe.contentDocument.head.appendChild(style);
            });

            this.iframe.onload = null;
        };

        //frame for fancy styling
        this.iframe.classList.add("flame_ui_component");

        this.pkg = null;

        this.name = name;

        this.system = system;

        this.width = 300;
        this.height = 500;
        this.x = 0;
        this.y = 0;

        this.LOADED = false;
    }

    mountListeners() {
        this.style_frame.addEventListener("mousedown", e => {
            this.system.ui.ui_target = { element: null, component: this, action: this.system.actions.MOVE_PANEL };
            this.system.ui.handlePointerDownEvent(e, e.pageX, e.pageY);
        });
        this.iframe.contentWindow.addEventListener("mousemove", e => this.system.ui.handlePointerMoveEvent(e, e.pageX + this.x + 3, e.pageY + this.y + 3));
        this.iframe.contentWindow.addEventListener("mouseup", e => this.system.ui.handlePointerEndEvent(e, e.pageX + this.x + 3, e.pageY + this.y + 3));
    }

    documentReady(pkg) {
        if (this.LOADED) {
            return;
        }
        this.LOADED = true;

        this.mgr = pkg.mount(this.data, this.system.project.flame_data);

        let src = this.mgr.sources[0].ast;

        if (src.statics.menu) {
            switch (src.statics.menu) {
                case "main":
                    this.system.ui.addToMenu("main", this.name, this.mgr.sources[0].badges.icon, this);
                    break;
            }
        }

        let css = pkg.skeletons[0].tree.css;
        if (css) {
            css.forEach(css => {
                this.local_css.push(css);
            });
        }

        this.mgr.upImport = (prop_name, data, meta) => {
            switch (prop_name) {
                case "load":
                    this.system.ui.mountComponent(this);
                    break;
                case "width":
                    this.width = data;
                    break;
                case "height":
                    this.height = data;
                    break;
            }
        };
    }

    set(data) {
        this.mgr.update({
            target: data
        });
    }

    load(doc) {
        doc.bind(this);
    }

    mount(element) {
        if(this.element.parentNode != element)
            element.appendChild(this.element);
    }

    unmount() {};
}

export {
    UIComponent
};