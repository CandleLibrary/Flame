import wick from "wick";
import path from "path";
import fs from "fs";
import {flame_scheme} from "./scheme";


/**
 * @brief Stores data for the current project.
 * @details The project obsject is the primary store of user data and preferences. 
 * It also provides the hosting of the presets object for wick components, and the interface components for user tools. 
 * The flame_data model stored is the main linking object for handling UI updates from actions performed through UI components.  
 * 
 */
export class Project {

    constructor(system) {

        this.system = system;
        
        this.flame_data = new (wick.model.scheme(flame_scheme));
        
        this.presets = wick.core.presets({
            models:{
                flame: this.flame_data
            }
        });
        
        this.history = [];
        
        this.setDefaults();

        //Load interface components from working directory

    }

    loadComponents(dir){
        fs.readdir(dir,(e,d)=>{
            if(e)
                return console.error(`Could not load UI components: ${e}`);
            console.log(d)
            d.forEach((fn)=>{
                console.log(fn, path.extname(fn))
                if(path.extname(fn) == ".html"){
                    console.log(fn);
                    this.system.ui.addComponent(fn);
                }
            })
        })
    }

    setDefaults(){
        this.flame_data.creation_date = Date.now();
        this.flame_data.default.component.width = 360;
        this.flame_data.default.component.height = 920;
        this.loadComponents("./ui_components");
    }

    load() {}
    save() {}

    importUIComponent(component){
        this.system.iu.addUIComponent(component);
    }
}