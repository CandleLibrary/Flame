import Component from "./component.mjs";

/**
 * This module handles the master component, wich stores alements that are not members of other components. 
 */
export class MasterComponent extends Component {
    constructor(system){
        super(system);
        this.width = 1;
        this.height = 1;
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
        this.system.ui.integrateComponentElement(this.frame, this);
    }

    get window(){
    	return window;
    }

    get sourceElement(){
    	return this.sources[0].ele;
    }

    get content(){
        return this.frame;
    }
}
