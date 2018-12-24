import {Presets} from "@candlefw/wick";


import path from "path";
import fs from "fs";
import {flame_scheme} from "./scheme";

//Text Editing
import {TextFramework, TextIO} from "@candlefw/charcoal";

import {ColorFramework} from "../color/color_framework";

/**
 * @brief Stores data for the current project.
 * @details The project object is the primary store of user data and preferences. 
 * It also provides the hosting of the presets object for wick components, and the interface components for user tools. 
 * The flame_data model stored is the main linking object for handling UI updates from actions performed through UI components.  
 */
export class Project {

    constructor(system) {

        this.system = system;
        
        this.flame_data = new flame_scheme();

        this.presets = new Presets({
            models:{
                flame: this.flame_data,
                settings: this.flame_data.settings,
            },
            custom:{
                actions : system.actions,
                ui : system.ui,
                classes : {
                    textio : TextIO,
                    textfw : TextFramework,
                    coloredit : ColorFramework
                },
                system
            }
        });
        
        this.history = [[]];
        this.state_id = 0;

        
        
        this.setDefaults();

        //Load interface components from working directory

    }

    loadComponents(dir){
        fs.readdir(dir,(e,d)=>{
            if(e)
                return console.error(`Could not load UI components: ${e}`);

            d.forEach((fn)=>{
                if(path.extname(fn) == ".html"){
                    this.system.ui.addComponent(([dir, fn]).join("/"));
                }
            });
        });
    }

    setDefaults(){
        this.flame_data.creation_date = Date.now();
        this.flame_data.default.component.width = 360;
        this.flame_data.default.component.height = 920;
        this.flame_data.settings.move_type = "relative";
        this.flame_data.settings.KEEP_UNIQUE = true;
        this.loadComponents(path.join(process.cwd(), "./assets/ui_components"));
    }


    /**
        Creates new project file, with given name to directory. Sets the file as the main project file.
    */
    createFile(name, directory){

    }

    /** 
        Saves all components, history, and settings to the project file. 
        May also save current documents if user settings permit.  
    **/
    saveAll(){
        if(!this.project_doc)
            this.createFile(this.settings);

        this.project_doc;

    }

    /** 
        Saves current history to project file. 
    **/
    saveCheckpoint(){

    }

    get settings(){
        return this.flame_data.settings;
    }

    importUIComponent(component){
        this.system.iu.addUIComponent(component);
    }
}