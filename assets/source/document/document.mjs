import fs from "fs";

import { actions } from "../interface/actions/action";

import { FileReader } from "../project/file_reader";
import { FileBuilder } from "../project/file_builder";

import ll from "@candlefw/ll";

export class Document {

    constructor(file_name, path, system, IS_NEW_FILE, manager) {
        this.path = path;
        this.name = file_name;
        this.data = null;
        this.old_data = "";
        this.LOADED = (IS_NEW_FILE) ? true : false;
        this.UPDATED = true;
        this.SAVING = false;
        this.INITIAL_HISTORY = false;
        this.observers = [];
        this.system = system;
        this.manager = manager;
        this.ps = false;
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
            let fr = new FileReader(this.path + "/" + this.name);

            try {
                let data = await fr.string();
                this.LOADED = true;
                this.fromString(data);
            } catch (e) {
                console.error(e);
            }

            return this.data;
        }
    }

    async save(file_builder) {

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

    alertObservers() {
        if (this.observers)
            for (let i = 0; i < this.observers.length; i++)
                if (this.observers[i].documentReady(this.data) === false)
                    this.observers.splice(i--, 1);
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