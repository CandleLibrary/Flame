import Component from "./component.mjs";
import URL from "@candlefw/url";
/**
 * This module is responsible for storing, updating, and caching compents. 
 * In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
 * Any associated stylesheets are managed through this componnent. 
 */
export class IframeComponent extends Component{

    constructor(system) {
        super(system);
        //frame for fancy styling
        this.style_frame = document.createElement("div");
        this.style_frame.classList.add("flame_component");
        this.style_frame.classList.add("style_frame");

        this.dimensions = document.createElement("div");
        this.dimensions.classList.add("flame_component_dimensions");

        //Label
        this.name = document.createElement("div");
        this.name.innerHTML = "unnamed";
        this.name.classList.add("flame_component_name");

        //HTML Data
        this.data = document.createElement("div");

        this.style_frame.appendChild(this.dimensions);
        this.style_frame.appendChild(this.name);

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

        const frame = this.createFrameElement();
        frame.component = this;

        this.style_frame.appendChild(frame);

        this.width = this.system.project.defaults.component.width;
        this.height = this.system.project.defaults.component.height;
    }

    createFrameElement() {

        this.frame = document.createElement("iframe");
        this.frame.classList.add("flame_component");
        this.frame.setAttribute("sandbox", "allow-scripts allow-same-origin");

        const backer = document.createElement("div");
        this.style_frame.appendChild(backer);
        backer.classList.add("flame_component_background");
        //this.frame.src = "component_frame.html";
        this.frame.setAttribute("frameBorder", "0");
        this.frame.setAttribute("seamless", "");
        this.frame.style.position = "fixed";


        this.mountListeners();
        this.IFRAME_LOADED = false;

        this.frame.onload = (e) => {

            this.mountListeners();
            //e.target.contentDocument.body.appendChild(this.data);
            //e.target.contentWindow.wick = wick;
            this.IFRAME_LOADED = true;
        };


        return this.frame;
    }
    /*
    createFrameElement() {

        this.frame = document.createElement("iframe");
        this.frame.src = "component_frame.html";

        const backer = document.createElement("div");
        this.style_frame.appendChild(backer);
        backer.classList.add("flame_component_background");


        this.IFRAME_LOADED = false;

        this.frame.onload = (e) => {

            this.mountListeners();
            //e.target.contentDocument.body.appendChild(this.data);
            //e.target.contentWindow.wick = wick;
            this.IFRAME_LOADED = true;
        };

        return this.frame;
    }
    */

    mountListeners() {
        this.system.ui.integrateComponentElement(this.frame, this);
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
        let url = document.url
        //url.path = url.path[0] == "/" ? url.path.slice(1) : url.path;
        //url.data
        //url.path = "/iframe/" + url.path;
        this.frame.contentWindow.postMessage("test")
        this.frame.setAttribute("CLIENT_MODE_TEST", true)
        this.frame.setAttribute("name", "flame_frame")
        this.frame.src = url + "";
        this.frame.setAttribute("name", "flame_frame")
        this.frame.contentWindow.CLIENT_MODE = true;
        this.frame.contentWindow.document.CLIENT_MODE = true;


        //this.frame.contentWindow.history.replaceState({}, "Flame Dev Env", url.toString());
        console.log(this.frame.src)
        //document.bind(this);
    }

    documentReady(pkg) {
        

        return true;
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
        const sr = this.frame.shadowRoot;
        if(sr)
            return sr.querySelector(query);
        return this.frame.querySelector(query);
    }

    get body(){
        return this.frame.window.document.body;
    }

    get window() {
        return this.frame.window;
    }

    get getComputedStyle(){
        return this.frame.window.document.getComputedStyle;
    }

    get innerWidth(){
        return this.width;

    }

    get innerHeight(){
        return this.height;
    }

    set x(x) {
        this.element.style.left = x + "px";
    }

    set y(y) {
        this.element.style.top = y + "px";
    }

    set width(w) {
        this.frame.style.width = w + "px";
        this.dimensions.innerHTML = `${Math.round(this.width)}px ${Math.round(this.height)}px`;
        this.rebuild();
    }

    set height(h) {
        this.frame.style.height = h + "px";
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
        return parseFloat(this.frame.style.width);
    }

    get height() {
        return parseFloat(this.frame.style.height);
    }

    get target() {
        return this.element;
    }

    get element() {
        return this.frame;
    }

    get content() {
        return this.frame;
    }

    get type(){
        return "wick";
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

Component.getComputedStyle = window.getComputedStyle.bind(window);
