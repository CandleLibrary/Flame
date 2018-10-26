import wick from "wick";
/**
 * @brief Stores data for the current project.
 * @details The project object is the primary store of user data and preferences. 
 * It also provides the hosting of the presets object for wick components, and the interface components for user tools. 
 * The flame_data model stored is the main linking object for handling UI updates from actions performed through UI components.  
 * 
 */
export class Project {
    constructor(system) {
        this.system = system;
        this.flame_data = new (wick.model.scheme(flame_data));
        this.presets = wick.core.presets({
            models:{
                flame: this.flame_data
            }
        })
        this.history = [];
        this.setDefaults();
    }

    setDefaults(){
        debugger
        this.flame_data.creation_date = Date.now();
    }

    load() {}
    save() {}

    importUIComponent(component){
        this.system.iu.addUIComponent(component);
    }
}
const scheme = wick.scheme;
const core = wick.core;

const Model = core.model;
const ModelContainer = core.model.container;
const BinaryTreeModelContainer = core.model.container.btree;
const ArrayModelContainer = core.model.container.array;
const DateModelContainer = core.model.container.btree;
const MultiIndexedContainer = core.model.container.multi;

const EPOCH_Date = scheme.date;
const EPOCH_Time = scheme.time;
const Longitude = scheme.number;
const Latitude = scheme.number;
const $Number = scheme.number;
const $String = scheme.string;
const $Boolean = scheme.bool;

/**
 * Schema for flame_data model
 */
 const schemed = wick.model.scheme;
const flame_data = {
	project : schemed({
		name : $String,
        working_directory : $String,
        temp_directory : $String,
        last_modified : EPOCH_Time,
        creation_date : EPOCH_Time,
	}),
	default : project : schemed({
        component : project : schemed({
            width: $Number,
            height: $Number
        })
	})
}