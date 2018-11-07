const wick = require("wick");

/**
 * This module is responsible for storing, updating, and caching compents. 
 * In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
 * Any associated stylesheets are managed through this componnent. 
 */
class UIComponent {

    constructor(system, name) {
        //frame for fancy styling
        this.element = document.createElement("div");
        this.element.classList.add("flame_ui_component");

        this.pkg = null;

        this.name = name;

        this.system = system;

        this.icon = null;
    }

    documentReady(pkg){
        this.mgr = pkg.mount(this.element, this.system.project.flame_data);
        let src = this.mgr.sources[0].ast;
        if(src._statics_.menu){
            switch(src._statics_.menu){
                case "main":
                    this.system.ui.addToMenu("main", this.name, this.mgr.sources[0].badges.icon);
                break;
            }
        } 

        this.mgr._upImport_ = (prop_name, data, meta)=>{
            this.system.ui.mountComponent(this);
        };
    }

    set(data){
        this.mgr._update_({target:data});
    }

    load(doc) {
        doc.bind(this);
    }

    mount(element){
        element.appendChild(this.element);
    }

    unmount(){
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