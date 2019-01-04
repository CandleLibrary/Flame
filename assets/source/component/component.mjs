/**
 * This module is responsible for storing, updating, and caching compents. 
 * In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
 * Any associated stylesheets are managed through this componnent. 
 */
export class Component {

    constructor(system) {
        //frame for fancy styling
        this.style_frame = document.createElement("div");
        this.style_frame.classList.add("flame_component");
        this.style_frame.classList.add("style_frame");

        this.dimensions = document.createElement("div");
        this.dimensions.classList.add("flame_component_dimensions");

        this.iframe = document.createElement("iframe");
        this.iframe.src = "component_frame.html";
        this.width = system.project.defaults.component.width;
        this.height = system.project.defaults.component.height;

        this.IFRAME_LOADED = false;

        this.iframe.onload = (e) => {

            this.mountListeners();
            //e.target.contentDocument.body.appendChild(this.data);
            //e.target.contentWindow.wick = wick;
            this.window = e.target.contentWindow;
            this.IFRAME_LOADED = true;
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

    mountListeners() {
        this.system.ui.integrateIframe(this.iframe, this);
    }

    addStyle(tree, INLINE) {
        if (!INLINE) {
            const style = new StyleNode();
            style.tag = "style";
            this.sources[0].ast.addChild(style);
            style.css = tree;
            tree.addObserver(style);
            this.local_css.splice(this.css_split, 0, tree);
            this.css_split++;
        } else {
            //insert the style into the root of the tree;
            this.local_css.push(style);
        }
    }

    destroy() {
        this.element = null;
    }

    load(document) {
        this.name.innerHTML = document.name;
        this.doc_name = document.name;
        this.doc_path = document.path;
        document.bind(this);
    }

    documentReady(pkg) {
        
        if (this.manager) {
            //Already have source, just need to rebuild with new tree. 
            const tree = pkg.skeletons[0].tree,
                css = tree.css;

            this.sources[0].ast = tree;

            if (css)
                css.forEach(css => {
                    this.local_css.push(css);
                });

            this.local_css = [];

            this.rebuild();
        } else {

            const css = pkg.skeletons[0].tree.css;

            if (css)
                css.forEach(css => {
                    this.local_css.push(css);
                });

            if (this.IFRAME_LOADED) {
                this.manager = pkg.mount(this.iframe.contentDocument.body, null, false, this);
                this.sources[0].window = this.window;
                this.rebuild();

            } else
                this.iframe.addEventListener("load", () => {
                    this.manager = pkg.mount(this.iframe.contentDocument.body, null, false, this);
                    this.sources[0].window = this.window;
                    this.rebuild();
                });
        }
    }

    upImport() {
        /* Empty Function  */
    }

    /**
     * Determines if point is in bounding box. 
     */
    pointInBoundingBox(x, y) {
        this.updateDimensions();
        const min_x = this.dimensions.left,
            max_x = min_x + this.dimensions.width,
            min_y = this.dimensions.top,
            max_y = min_y + this.dimensions.height;
        return x >= min_x && x <= max_x && y >= min_y && y <= max_y;
    }

    rebuild() {
        if (this.sources)
            this.sources[0].rebuild();
    }

    query(query) {
        return this.window.document.querySelector(query);
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
        this.rebuild();
    }

    set height(h) {
        this.iframe.height = h;
        this.dimensions.innerHTML = `${Math.round(this.width)}px ${Math.round(this.height)}px`;
        this.rebuild();
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

    get element() {
        return this.style_frame;
    }

    toJSON() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            path: this.doc_path,
            name: this.doc_name,
            type: "html"
        };
    }
}
