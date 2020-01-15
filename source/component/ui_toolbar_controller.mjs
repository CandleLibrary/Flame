//import wick from "@candlefw/wick";

import ui_controller from "./ui_controller";
/**
 * This module is responsible for storing, updating, and caching compents. 
 * In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
 * Any associated stylesheets are managed through this componnent. 
 */
export default class ui_toolbar_controller extends ui_controller {

    constructor(env, component_path) {

        super(env, component_path);

        if(component_path){
            const doc = env.data.docs.get(env.data.docs.loadFile(component_path));

            if (doc) 
                doc.bind(this);
        }
        
        this.frame.classList.add("ui");

        this.pkg = null;
        this.name = component_path;
        this.env = env;

        this.x = 0;
        this.y = 0;

        this.LOADED = false;
    }

    update(env){
        this.scope.update({widget:env.ui.interface.widget, env:env});
    }

    load(doc) {
        doc.bind(this);
    }

    mount(element) {
        if (this.frame.parentNode != element)
            element.appendChild(this.frame);
    }

    get type(){
        return "toolbar";
    }

    unmount() {}

}


