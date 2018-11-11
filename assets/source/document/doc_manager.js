import wick from "wick";
import {
    WickDocument
} from "./wick_document";
import {
    CSSDocument
} from "./css_document";
import path from "path";
import fs from "fs";
import {DocumentDifferentiator} from "./differ"
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
    load(file) {
        switch (typeof(file)) {
            case "string": // Load from file system or DB
                let p = path.parse(file);
                file = {
                    path : p.dir,
                    name: p.base
                };
            case "object": // Load data 
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
                                doc = new WickDocument(name, path, this.system);
                                break
                            default:
                                doc = new CSSDocument(name, path, this.system);
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
        return this.docs.get(id);
    }

    /** Updates all changes to files and records diffs resulting from user actions */
    seal(){
        let diffs = [];
        this.docs.forEach((d)=>{
            let diff = d.seal(this.differ);
            if(diff)
                diffs.push(diff);
        });

        if(diffs.length > 0){
            this.diffs.push({v:version++,diffs});
            this.diff_step++;
        }

    }

    stepBack(){
        if(this.diff_step == 0) return;
        debugger
        let diffs = this.diffs[--this.diff_step].diffs;

        if(diffs){
            for(let i = 0; i < diffs.length; i++){
                let diff = diffs[i];
                let doc = this.docs.get(diff.id);
                this.differ.revert(doc, diff.diff)
            }
        }
    }

    stepForward(){
        if(this.diff_step == this.diffs.length-1) return;
        let diffs = this.diffs[this.diff_step++];

        if(diffs){
            for(let i = 0; i < diffs.length; i++){
                let diff = diffs[i];
                let doc = this.docs.get(diff.diffs.id);
                this.differ.convert(doc, diff)
            }
        }   
    }
}

var version = 0;