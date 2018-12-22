import {
    WickDocument
} from "./wick_document";
import {
    CSSDocument
} from "./css_document";
import path from "path";
import fs from "fs";
import { DocumentDifferentiator } from "./differ";
/**
 * The Document Manager handles text file operations and text file updating. 
 */
export class DocumentManager {
    constructor(system) {
        this.docs = new Map();
        this.system = system;
        this.differ = new DocumentDifferentiator();
        this.diffs = [];
        this.diff_step = 0;

        this.pending = null;
        this.updated = false;
        /**
         * Global `fetch` polyfill - basic support
         */
        global.fetch = (url, data) => new Promise((res, rej) => {
            let p = url;
            if (!path.isAbsolute(p)) p = path.resolve(process.cwd(), (url[0] == ".") ? url + "" : "." + url);
            let doc_id = this.load({
                path: path.dirname(p),
                name: path.basename(p),
                type: "text/css",
            });
            if (doc_id) {
                this.get(doc_id).bind({
                    documentReady: (data) => res({
                        status: 200,
                        text: () => new Promise((res) => res(data))
                    })
                });
            }
        });
    }
    /*
     * Loads file into project
     */
    load(file, NEW_FILE = false) {
        switch (typeof(file)) {
            case "string": // Load from file system or DB
                let p = path.parse(file);
                file = {
                    path: p.dir,
                    name: p.base
                };
            case "object": // Londead data 
                if (file.name && file.path) {
                    let path = file.path;
                    let name = file.name;
                    let type = "";
                    if (file.type) type = file.type.split("/")[1].toLowerCase();
                    else type = name.split(".").pop().toLowerCase();
                    if (path.includes(name)) path = path.replace(name, "");
                    if (path[path.length - 1] == "/" || path[path.length - 1] == "\\") path = path.slice(0, -1);
                    path = path.replace(/\\/g, "/");
                    let id = `${path}/${name}`;
                    if (!this.docs.get(id)) {
                        let doc;
                        switch (type) {
                            case "html":
                                doc = new WickDocument(name, path, this.system, NEW_FILE, this);
                                break;
                            default:
                                doc = new CSSDocument(name, path, this.system, NEW_FILE, this);
                        }
                        this.docs.set(id, doc);
                        doc.load();
                    }
                    return id;
                }
                break;
        }
        return "";
    }

    get(id) {
        return this.docs.get(id.replace(/\\/g, "/"));
    }

    /** Updates all changes to files and records diffs resulting from user actions */
    seal() {
        
        let diffs = [],
            doc;

        if (this.pending) {

            this.pending.previous = null;

            while ((doc = this.pending)) {
                let pack = doc.seal(this.differ);

                if (pack)
                    diffs.push(pack);
            }

            if (diffs.length > 0) {
                this.diffs.push({ v: version++, diffs });
                this.diff_step++;
            }
        }

    }

    stepBack() {
        console.log("back", this.diff_step, this.diffs)

        if (this.diff_step == 0) return;

        let diffs = this.diffs[--this.diff_step].diffs;

        if (diffs) {
            for (let i = 0; i < diffs.length; i++) {
                let pack = diffs[i];
                let doc = this.docs.get(pack.id);
                this.differ.revert(doc, pack.diff);
            }
        }
    }

    stepForward() {
        console.log("forward", this.diff_step, this.diffs)
        //if (this.diff_step == this.diffs.length - 1) return;
        let diffs = this.diffs[this.diff_step++].diffs;

        console.log(diffs)

        if (diffs) {
            for (let i = 0; i < diffs.length; i++) {
                let pack = diffs[i];
                let doc = this.docs.get(pack.id);
                this.differ.convert(doc, pack.diff);
            }
        }
    }

    addPending(doc) {
        if (doc.ps)
            return;
        if (this.pending)
            doc.next = this.pending;

        this.pending = doc;
    }

    removePending(doc) {
        if (doc == this.pending) {

            if (doc.nxt == doc)
                this.pending = null;
            else
                this.pending = doc.next;
        }

        doc.next = null;
        doc.prv = null;
    }
}

var version = 0;