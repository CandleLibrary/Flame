import {UI_Manager} from "./interface/UI_Manager"

/**
 * @brief Flame exposed object.  
 * @details Contains methods necessary to start a flame session.
 * @return Object
 */
const flame = {
    init: () => {
        //Startup the Main UI system
        	
        	//connect to the ui_group element
        	const ui_group = document.querySelector("#ui_group");
        	const view_group = document.querySelector("#main_view");

        	if(!ui_group)
        		throw new Error("`ui_group` element not found in document! Aborting startup.");

        	const ui_man = new UI_Manager(ui_group, view_group);
    	
        //Connect to server or local file system and load projects
        //Check to see if there recently worked on project to open. 
        //Load Poject.
        //If user preference allows, open the Splash screen modal. 
    }
}
export default flame;

/* Interface files */
//Project Direcctory
