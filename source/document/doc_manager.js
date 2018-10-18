import {
    WickDocument
} from "./wick_document";
import {
    CSSDocument
} from "./css_document";
let path = require("path");
let fs = require("fs");
/**
 * The Document Manager handles text file operations and text file updating. 
 */
export class DocumentManager {
    constructor(system) {
        this.docs = new Map();
        this.system = system;
        /**
         * Global `fetch` polyfill - basic support
         */
        global.fetch = (url, data) => new Promise((res, rej) => {
            let p = path.resolve(process.cwd(), (url[0] == ".") ? url + "" : "." + url);
            let doc_id = this.load({
                path: path.dirname(p),
                name: path.basename(p),
                type: "text/css",
            });
            if (doc_id) {
                this.get(doc_id).bind({
                    documentReady: (data) => res({
                        status: 200,
                        text: () => new Promise((res)=>res(data))
                    })
                })
            }
        })
    }
    /*
     * Loads file into project
     */
    load(file) {
        switch (typeof(file)) {
            case "string": // Load from file system or DB
                break;
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
                                doc = new WickDocument(name, path, type, this.system);
                                break
                            default:
                                doc = new CSSDocument(name, path, type, this.system);
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
}