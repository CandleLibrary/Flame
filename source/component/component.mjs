/**
 * This module is responsible for storing, updating, and caching a wick component. 
 * In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
 * Any associated stylesheets are managed through this componnent. 
 */
export default class Component {

    constructor(env) {

        this.env = env;
        this.scope = null;
        this.ast = null;
        this.data = null;

        this.frame = document.createElement("div");
        this.frame.classList.add("flame_component");
        this.frame.style.position = "fixed";
        this.frame.style.backgroundColor = "white";
        this.frame.style.overflow = "hidden";
        this.frame.style.border = "2px solid rgba(25,25,25,0.2)";
        this.frame.style.borderRadius = "2px";
        this.frame.style.margin = 0;
        this.frame.style.padding = 0;
        this.frame.component = this;
        
        //Flag for mounted state of component. If a component is accessible anywhere on the main UI, then it is considered mounted. 
        this.mounted = false;

        //Links to local CSS scripts
        this.local_css = [];

        //The file path (relative to project directory), of the component file. 
        this.file_path = "";

        //The file name of the component. 
        this.file_name = "";

        //The source component manager that handles the instantiati on and runtime of Wick components. 
        this.manager = null;

        //this.system = system;

        this.action = null;

        this.width = 0;
        this.height = 0;
    }

    destroy() {
        if (this.frame.parentElement)
            this.frame.parentElement.removeChild(this.frame);
        this.frame = null;
        this.scope = null;
        this.data = null;
    }

    load(document) {
        document.bind(this);
    }

    // Adds style sheet as the components local style sheeet. 
    setLocalStyleSheet(cssstylesheet){
        this.local_component_css = cssstylesheet;
        this.addCSSData(cssstylesheet);
    }

    // Pushes stylesheet to the components list of stylesheets that affect the component's elements. 
    addCSSData(cssstylesheet){

        this.local_css.push(cssstylesheet);

        if(this.scope && this.scope.css !== this.local_css)
            this.updateScopeCSS();
    }

    updateScopeCSS(){
        
        this.local_css.length = 0;
        
        this.scope.css.forEach(css => this.local_css.push(css));

        //Insure that Flame environment css objects are used within the scope. 

        this.scope.css = this.local_css;
        
        this.local_component_css && this.addCSSData(this.local_component_css)
    }

    updatedScope(){
        this.updateScopeCSS();
    }

    documentReady(ast) {

        if (this.ast) {
            //Already have source, just need to rebuild with new tree. 
            this.scope.ast = ast;
            this.rebuild();
        } else {
            const shadow = this.frame.attachShadow({ mode: 'open' });

            this.ast = ast;
            this.scope = this.ast.mount();
            this.scope.parent = this;
            this.ast.setScope(this.scope);

            shadow.appendChild(this.scope.ele);
            shadow.component = this;

            this.scope.load();
            this.updateScopeCSS();
        }

        this.scope.window = this.window;
        this.rebuild();

        return true;
    }

    mountListeners() {
        this.env.ui.manager.integrateComponentElement(this.frame, this);
    }


    addStyle(tree, INLINE) {

        if (!INLINE) {
            return;
            //const style = new StyleNode();
            //style.tag = "style";
            //this.scope.ast.addChild(style);
            //style.css = tree;
            //tree.addObserver(style);
            //this.local_css.splice(this.css_split, 0, tree);
            //this.css_split++;
        } else {
            //insert the style into the root of the tree;
            this.local_css.push(style);
        }
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
        if (this.scope)
            this.scope.rebuild();
    }

    query(query) {
        const sr = this.frame.shadowRoot;
        if (sr)
            return sr.querySelector(query);
        return this.frame.querySelector(query);
    }

    get body() {
        return this.frame.shadowRoot;
    }

    get window() {
        return this;
    }

    get getComputedStyle() {
        return (Component.getComputedStyle || (Component.getComputedStyle = window.getComputedStyle.bind(window)));
    }

    get innerWidth() {
        return this.width;

    }

    get innerHeight() {
        return this.height;
    }

    set x(x) {
        this.frame.style.left = x + "px";
    }

    get x() {
        return parseFloat(this.frame.style.left);
    }

    set y(y) {
        this.frame.style.top = y + "px";
    }

    get y() {
        return parseFloat(this.frame.style.top);
    }

    set width(w) {
        this.frame.style.width = w + "px";
        this.rebuild();
    }

    get width() {
        return parseFloat(this.frame.style.width);
    }

    set height(h) {
        this.frame.style.height = h + "px";
        this.rebuild();
    }
    get height() {
        return parseFloat(this.frame.style.height);
    }

    get type() {
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

    mount(element) {
        if (this.frame.parentNode != element) {
            element.appendChild(this.frame);

            if(this.width == 0 || this.height == 0){
                const rect = this.scope.ele.getBoundingClientRect();

                this.width = rect.width || rect.height || 100;
                this.height = rect.height ||rect.width || 220;
            }
        }
    }

    unmount(){
        if(this.frame.parentNode)
            this.frame.parentNode.removeChild(this.frame);
    }
}
