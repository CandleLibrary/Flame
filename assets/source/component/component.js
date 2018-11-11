const wick = require("wick");

/**
 * This module is responsible for storing, updating, and caching compents. 
 * In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
 * Any associated stylesheets are managed through this componnent. 
 */
class Component {

    constructor(system) {
        //frame for fancy styling
        this.style_frame = document.createElement("div");
        this.style_frame.classList.add("flame_component");
        this.style_frame.classList.add("style_frame");

        this.dimensions = document.createElement("div");
        this.dimensions.classList.add("flame_component_dimensions")

        this.iframe = document.createElement("iframe");
        this.iframe.src = "./assets/html/component_frame.html";

        this.width = system.project.flame_data.default.component.width;
        this.height = system.project.flame_data.default.component.height;

        this.iframe.onload = (e) => {
            system.ui.integrateIframe(this.iframe, this);
            e.target.contentDocument.body.appendChild(this.data);
            e.target.contentWindow.wick = wick;
            this.window = e.target.contentWindow;
        };

        //Label
        this.name = document.createElement("div");
        this.name.innerHTML = "unnamed";
        this.name.classList.add("flame_component_name");


        //HTML Data
        this.data = document.createElement("div");

        this.style_frame.appendChild(this.dimensions);
        this.style_frame.appendChild(this.name);
        this.style_frame.appendChild(this.iframe);

        //Flag for mounted state of component. If a component is accessible anywhere on the main UI, then it is considered mounted. 
        this.mounted = false;

        //Links to local CSS scripts
        this.local_css = [];

        //The file path (relative to project directory), of the component file. 
        this.file_path = "";

        //The file name of the component. 
        this.file_name = "";

        //The source component manager that handles the instantiation and runtime of Wick components. 
        this.manager = null;

        this.system = system;

        this.action = null;
    }

    get element() {
        return this.style_frame;
    }

    addStyle(style, INLINE = false) {
        if (!INLINE) {
            this.local_css.splice(this.css_split, 0, style)
            this.css_split++;
        } else {
            this.local_css.push(style);
        }
    }

    cache() {

    }

    destroy() {
        this.element = null;
    }

    /**
     * @brief Saves file to project directory. 
     * @details [long description]
     */
    saveFile() {

    }

    /**
     * Caches a bitmap image of the component.
     */
    cacheBitmap() {

    }

    load(document) {
        this.name.innerHTML = document.name;
        document.bind(this);
    }

    documentReady(pkg) {

        let css = pkg._skeletons_[0].tree.css;
        if (css)
            css.forEach(css => {
                this.local_css.push(css);
            });
        this.manager = pkg.mount(this.data, null, false, this);
    }

    /**
     * Mounts the element to the document. 
     */
    mount() {}

    /**
     * Determines if point is in bounding box. 
     */
    pointInBoundingBox(x, y) {
        this.updateDimensions();
        let min_x = this.dimensions.left;
        let max_x = min_x + this.dimensions.width;
        let min_y = this.dimensions.top;
        let max_y = min_y + this.dimensions.height;
        return x >= min_x && x <= max_x && y >= min_y && y <= max_y;
    }

    set x(x) {
        this.element.style.left = x + "px";
    }

    set y(y) {
        this.element.style.top = y + "px";

    }

    set width(w) {
        this.iframe.width = w;
        this.dimensions.innerHTML = `${Math.round(this.width)}px ${Math.round(this.height)}px`;
    }

    set height(h) {
        this.iframe.height = h;
        this.dimensions.innerHTML = `${Math.round(this.width)}px ${Math.round(this.height)}px`;
    }

    get x() {
        return parseFloat(this.element.style.left);
    }

    get y() {
        return parseFloat(this.element.style.top);
    }

    get width() {
        return parseFloat(this.iframe.width);
    }

    get height() {
        return parseFloat(this.iframe.height);
    }

    get target() {
        return this.element;
    }
}

export { Component };