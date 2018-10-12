import {UI_Manager} from "./interface/ui_manager";
import {Component} from "./component/component"
import {JSManager} from "./js/js_manager"
import {CSSManager} from "./css/css_manager"
import {HTMLManager} from "./html/html_manager"
import {DocumentManager} from "./document/doc_manager"


class System{
    constructor(){
        this.doc_man = new DocumentManager();
        this.css= new CSSManager(this.doc_man);
        this.html= new HTMLManager(this.doc_man);
        this.js= new JSManager(this.doc_man);
    }
}

/**
 * @brief Flame exposed object.  
 * @details Contains methods necessary to start a flame session.
 * @return Object
 */

const flame = {
    init: (wick) => {
        //Startup the Main UI system
        	
        	//connect to the ui_group element
        	const ui_group = document.querySelector("#ui_group");
        	const view_group = document.querySelector("#main_view");

        	if(!ui_group)
        		throw new Error("`ui_group` element not found in document! Aborting startup.");

        	const ui_man = new UI_Manager(ui_group, view_group, new System());
            
            for(let i = 0; i<1;i++){

                let c = new Component();
                c.load("./test/component/test_comp.html");
                ui_man.addComponent(c);
            }
    	
        //Connect to server or local file system and load projects
        //Check to see if there recently worked on project to open. 
        //Load Poject.
        //If user preference allows, open the Splash screen modal. 
    },
};
export default flame;

/* Interface files */
//Project Direcctory
