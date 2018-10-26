const wick = require("wick");

/**
 * This module is responsible for storing, updating, and caching compents. 
 * In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
 * Any associated stylesheets are managed through this componnent. 
 */
class UIComponent {

    constructor(system) {
        //frame for fancy styling
        this.element = document.createElement("div");
        this.element.classList.add("flame_ui_component");

        this.pkg = null;

        (new wick.core.source.package(wick_component, this.system.project.presets, true, this.path + "/" + this.name)).then((pkg) => {
            this.pkg = pkg;
            this.manager = pkg.mount(this.element, null, false, this);
        });


    }

    load(doc) {
        console.log(doc)
    }

    set x(x) {
        this.element.style.left = x + "px";
    }

    set y(y) {
        this.element.style.top = y + "px";
    }

    get x() {
        return parseFloat(this.element.style.left);
    }

    get y() {
        return parseFloat(this.element.style.top);
    }
}

export { UIComponent };