import { Presets } from "@candlefw/wick";

import path from "path";
import fs from "fs";
import { FlameScheme } from "./scheme";

//Text Editing
import { TextFramework, TextIO } from "@candlefw/charcoal";

import { ColorFramework } from "../color/color_framework";

import { FileBuilder } from "./file_builder.mjs";
import { FileReader } from "./file_reader.mjs";

/**
    Spark is used to issue timed callback for scheduled auto saving.
*/
import spark from "@candlefw/spark";

/**
 * @brief Stores data for the current project. Handles the global saving and importation of data. 
 * @details The project object is the primary store of user data and preferences. 
 * It also provides the hosting of the presets object for wick components, and the interface components for user tools. 
 * The flame_data model stored is the main linking object for handling UI updates from actions performed through UI components.  
 */
export class Project {

    constructor(system) {

        this.system = system;     
        this.flame_data = null;
        this.presets = null;

        this.setPresets();
        this.setDefaults();
    }


    setPresets(){

        const system = this.system;

        this.flame_data = new FlameScheme();
        
        this.presets = new Presets({
            models: {
                flame: this.flame_data,
                settings: this.flame_data.settings,
            },
            custom: {
                actions: system.actions,
                ui: system.ui,
                classes: {
                    textio: TextIO,
                    textfw: TextFramework,
                    coloredit: ColorFramework
                },
                system
            }
        });

        this.preferences.auto_save_interval = 0;
        this.preferences.working_directory = system.cwd;
        this.preferences.proj_data_directory = system.cwd;
        this.preferences.temp_directory = system.cwd;
        this.preferences.name = "unnamed";

        this.scheduleAutoSave();
    }

    reset() {
        this.setPresets();
        this.setDefaults();
        this.system.ui.reset();
        this.system.docs.reset();
        this.system.history.reset();
    }

    scheduledUpdate(frame_time, time_since_last){
        this.save(path.resolve(this.preferences.proj_data_directory, this.preferences.name + ".fpd"));   
        this.scheduleAutoSave();
    }

    scheduleAutoSave(){
        spark.removeFromQueue(this);

        if(this.preferences.auto_save_interval < 1)
            return;
        //return;
        spark.queueUpdate(this, this.preferences.auto_save_interval * 1000 /* interval in milliseconds */ );
    }

    loadUIComponents(dir) {

        if(this.system.TEST_MODE) 
            return;
        

        fs.readdir(dir, (e, d) => {
            if (e)
                return console.error(`Could not load UI components: ${e}`);

            d.forEach((fn) => {
                if (path.extname(fn) == ".html") {
                    this.system.ui.addComponent(([dir, fn]).join("/"));
                }
            });
        });
    }

    setDefaults() {
        this.preferences.auto_save_interval = 0;

        this.meta.creation_date = Date.now();
        this.defaults.component.width = 360;
        this.defaults.component.height = 920;
        this.components.move_type = "relative";
        this.components.KEEP_UNIQUE = true;

        this.loadUIComponents(path.join(process.cwd(), "./assets/ui_components"));
    }

    get meta(){
        return this.flame_data.meta;
    }
    get preferences(){
        return this.flame_data.preferences;
    }
    get defaults(){
        return this.flame_data.defaults;
    }
    get components(){
        return this.flame_data.components;
    }

    importUIComponent(component) {
        this.system.iu.addUIComponent(component);
    }
    /****************************************************               ******************************************************************************/
    /**************************************************** FILE HANDLING ******************************************************************************/
    /****************************************************               ******************************************************************************/

    /**
        Save to original location - saves files to original locations, overwriting if necessary. Can be set on a per doc basis. 
        Save to output dir - saves files to output directory, matching the folder structure relative to current working directory. 
            if a file was imported outside the CWD, the file will be placed at the root of the output dir.
        Save checkpoint - saves file to project fifle at regular intervals. This causes a new file to be created every time a file is save. It will reference the old files history to preserve state history. 
        Backup docs - saves documents to project file. Default if Save original or Save output are both false/unset. The is overrides save checkpoint 
        Save history - saves the history of the curent data.
    **/

    async load(file_path = this.file_path, call_back = null) {

        let file_reader;

        if (file_path instanceof FileReader)
            file_reader = file_path;
        else
            file_reader = new FileReader(file_path);

        const stamp = await this.readFileStamp(file_reader);

        if (stamp.title !== "CF")
            throw new Error(`File ${file_path} is not recognized as an *.fpd file.`);

        const ui = await file_reader.readS(stamp.ui_size);

        if (stamp.flags & 2) {
            const data = await file_reader.readS(stamp.doc_size);
            this.system.docs.load(data);
        }
        this.system.ui.load(ui);

        const project_data = await file_reader.readS(stamp.project_size);

        this.flame_data.set(JSON.parse(project_data));

        await this.system.history.load(file_reader, stamp.history_size);

        if (call_back)
            call_back();
    }

    /** 
        Saves all components, history, and settings to the project file. 
        May also save current documents if user settings permit.  
    **/
    async save(file_path = this.file_path, call_back = null) {

        let file_builder;

        if (file_path instanceof FileBuilder)
            file_builder = file_path;
        else
            file_builder = new FileBuilder(file_path);

        //64byte header.
        file_builder.offset = 64;

        let ui_size = 0,
            docs_size = 0,
            setting_size = 0,
            history_size = 0;

        ui_size = await this.saveUI(file_builder);

        if (this.preferences.bundle_files)
            docs_size = await this.saveDocuments(file_builder);
        else if (this.preferences.export_file_dir)
            this.system.docs.save(null/*, export_file_dir*/);
        else    
            this.system.docs.save();

        //Save Project Properties
        setting_size = await this.saveProperties(file_builder);
        //May create some leading here.

        //State History
        history_size = await this.saveCheckpoint(file_builder);

        //May create some leading here.

        //await file_builder.writeWord(8,ui_size); //gives offset to docs
        await this.writefileStamp(file_builder, ui_size, docs_size, setting_size, history_size);

        file_builder.close();

        if (file_builder.offset == 0)
            throw new Error("Failed to write data to file.");

        if (call_back)
            call_back(true);

        return true;
    }

    /** 
        Saves current history to project file. 
    **/
    async saveUI(file_builder) {
        const off = file_builder.offset;
        return await this.system.ui.save(file_builder) - off;
    }

    async saveCheckpoint(file_builder) {
        const off = file_builder.offset;
        return await this.system.history.save(file_builder) - off;
    }

    async saveProperties(file_builder) {
        const off = file_builder.offset;
        return await file_builder.writeS(this.flame_data.toJSON()) - off;
    }

    async saveDocuments(file_builder) {
        const off = file_builder.offset;
        return await this.system.docs.save(file_builder) - off;
    }

    async writefileStamp(file_builder, ui_size = 0, doc_size = 0, project_size = 0, history_size = 0) {
        const stamp = new Uint32Array(16),
            entry_flags = ((ui_size > 0) | 0) |
            (((doc_size > 0) | 0) << 1) |
            (((project_size > 0) | 0) << 2) |
            (((history_size > 0) | 0) << 3);

        //Document info, time stamp, entries
        stamp[0] = ((this.system.version & 0xFFFF) << 16) | (("F").charCodeAt(0)) << 8 | (("C").charCodeAt(0)); /*CF*/
        stamp[1] = entry_flags;
        stamp[2] = ui_size;
        stamp[3] = doc_size;
        stamp[4] = project_size;
        stamp[5] = history_size;

        return await file_builder.writeB(stamp, 0, false);
    }

    async readFileStamp(file_reader) {
        const stamp = await file_reader.readB(Uint32Array, 64);

        const d = stamp[0],
            version = (d >> 16) & 0xFFFF,
            title = String.fromCharCode(d & 0xFF) + String.fromCharCode((d >> 8) & 0xFF);

        const
            flags = stamp[1],
            ui_size = stamp[2],
            doc_size = stamp[3],
            project_size = stamp[4],
            history_size = stamp[5];

        return {
            title,
            version,
            flags,
            ui_size,
            doc_size,
            project_size,
            history_size
        };
    }
}
