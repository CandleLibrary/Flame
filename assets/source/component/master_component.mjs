import {Component} from "./component.mjs";

/**
 * This module is responsible for storing, updating, and caching compents. 
 * In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
 * Any associated stylesheets are managed through this componnent. 
 */
export class MasterComponent extends Component {
    constructor(system){
        super(system);

        this.width = 1920;
        this.height = 1080;
        this.IS_MASTER = true;
    }

    createFrameElement(){

        this.frame = document.createElement("div");
        this.frame.id = "master_component";
       // this.frame.src = "component_frame.html";
        //this.frame.setAttribute("frameBorder", "0");
        this.frame.style.position = "fixed";


        this.mountListeners();
        this.IFRAME_LOADED = true;

        return this.frame;
    }

    mountListeners() {
        this.system.ui.integrateComponentFrame(this.frame, this);
    }

    get window(){
    	return window;
    }

    get sourceElement(){
    	return this.frame.firstChild;
    }

    get content(){
        return this.frame;
    }

    query(query){
    	return this.frame.querySelector(query);
    }
}
