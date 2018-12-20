import fs from "fs";

import {actions} from "../interface/actions/action";

export class Document {

    constructor(file_name, path, system, IS_NEW_FILE) {
        this.path = path;
        this.name = file_name;
        this.data = null;
        this.LOADED = (IS_NEW_FILE) ? true: false;
        this.UPDATED = true;
        this.SAVING = false;
        this.PENDING_SAVE = false;
        this.INITIAL_HISTORY = false;
        this.observers = [];
        this.system = system;
        this.element = document.createElement("div");
        this.old_data = "";
    }

    seal(differ) {
        
        //if (this.PENDING_SAVE) {
            this.PENDING_SAVE = false;

            let new_data = this + "";

            let diff = differ.createDiff(this.old_data, new_data);

            this.old_data = new_data;

            return (diff) ? {
                id: this.id,
                diff
            } : null;
        //}

        return null;
    }

    load() {
        if(!this.LOADED){
            fs.open(this.path + "/" + this.name, "r", (err, fd) => {
                if (err) throw err;
                fs.readFile(fd, "utf8", (err, data) => {
                    
                    fs.close(fd, (err) => {if (err) throw err});
                    
                    if (err) 
                        throw err;
                    
                    this.LOADED = true;
                    this.fromString(data);    
                });
            });
        }
    }

    save() {
        this.PENDING_SAVE = true;
        return;
        if (this.SAVING) return;
        this.SAVING = true;
        this.PENDING_SAVE = false;
        fs.open(this.path + "/" + this.name, "w", (err, fd) => {
            if (err) throw err;
            fs.write(fd, (this.data._skeletons_[0].tree + ""), 0, "utf8", (err, written, data) => {
                fs.close(fd, (err) => {
                    if (err) throw err
                });
                if (err) {
                    throw err;
                }
                if (this.PENDING_SAVE) this.save();
                else this.PENDING_SAVE = false;
                this.SAVING = false;
            });
        });
    }

    toString(){
        return "[Document]";
    }

    bind(object) {
        if (this.LOADED) object.documentReady(this.data);
        this.observers.push(object);
    }

    get type(){
        return "";
    }

    get id(){
        return `${this.path}/${this.name}`;
    }


}