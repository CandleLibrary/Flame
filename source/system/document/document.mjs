import { FileReader } from "../project/file_reader";
import { FileBuilder } from "../project/file_builder";

import URL from "@candlefw/url";
import ll from "@candlefw/ll";

export class Document {

    constructor(file_name, path, env, IS_NEW_FILE, manager) {
        this.path = path;
        this.name = file_name;
        this.data = null;
        this.old_data = "";
        this.LOADED = (IS_NEW_FILE) ? true : false;
        this.UPDATED = true;
        this.SAVING = false;
        this.INITIAL_HISTORY = false;
        this.observers = [];
        this.env = env;
        this.manager = manager;
        this.ps = false;
        this.url = new URL(`${path}/${file_name}`);
    }

    destroy() {
        this.observers = null;
    }

    seal(differ) {

        if (this.PENDING_SAVE) {

            this.PENDING_SAVE = false;

            let new_data = this + "";

            let diff = differ.createDiff(this.old_data, new_data);

            this.old_data = new_data;

            return (diff) ? {
                id: this.id,
                diff
            } : null;
        }

        return null;
    }

    async load() {
        if (!this.LOADED) {
            if(this.path[0] == "~"){ 
            // This is a generated document
                this.LOADED = true;
            }else{
                try {
                    let data = await this.url.fetchText();
                    this.LOADED = true;
                    this.fromString(data);
                } catch (e) {
                    console.error(e);
                }
            }

            return this.data;
        }
    }

    async save(file_builder) {
        return;
        if (!file_builder) {
            if (this.SAVING) return;

            this.SAVING = true; 

            let fb = new FileBuilder(this.id);
            let string = this.toString();
            let d = await fb.writeS(string);

            if (d == 0)
                console.warn(`Saved zero sized file ${this.id}`);

            fb.close();

            this.SAVING = false;

        } else {
            return file_builder.write(this.toString());
        }
    }

    toString() {
        return "[Document]";
    }

    bind(object) {
        if (this.LOADED && object.documentReady(this.data) === false) return;
        this.observers.push(object);
    }

    async alert() {
        return new Promise(res => {
            this.bind({ documentReady: () => res() })
        })
    }

    alertObservers() {
        if (this.observers){
            for (let i = 0; i < this.observers.length; i++){
                if (this.observers[i].documentReady(this.data) === false){
                    this.observers.splice(i--, 1);
                }
            }
        }
    }

    get type() {
        return "";
    }

    get id() {
        return `${this.path}/${this.name}`;
    }

    set PENDING_SAVE(v) {
        if (v) {
            this.manager.addPending(this);
            this.ps = true;
        } else {
            this.manager.removePending(this);
            this.ps = false;
        }
    }

    get PENDING_SAVE() {
        return this.ps;
    }
}

ll.mixinTree(Document);
