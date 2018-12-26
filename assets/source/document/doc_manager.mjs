import whind from "@candlefw/whind";
import {
    WickDocument
} from "./wick_document";
import {
    CSSDocument
} from "./css_document";
import path from "path";
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
    loadFile(file, NEW_FILE = false) {
        switch (typeof(file)) {
            case "string": // Load from file system or DB
                var p = path.parse(file);
                file = {
                    path: p.dir,
                    name: p.base
                };
                //Intentional fall through. 
            case "object": // Loandead data 
                if (file.name && file.path) {
                    let path = file.path;
                    let name = file.name;
                    let type = "";
                    if (file.type) type = file.type //.split("/")[1].toLowerCase();
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
                            case "css":
                            default:
                                doc = new CSSDocument(name, path, this.system, NEW_FILE, this);
                        }
                        this.docs.set(id, doc);


                        if (file.data)
                            doc.fromString(file.data);
                        else
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

            if (diffs.length > 0)
                this.system.history.addAction({ type: "doc", diffs });
        }
    }

    undo(action) {

        let diffs = action.diffs;

        if (diffs) {
            for (let i = 0; i < diffs.length; i++) {
                let pack = diffs[i];
                let doc = this.docs.get(pack.id);
                this.differ.revert(doc, pack.diff);
            }
        }
    }

    redo(action) {

        let diffs = action.diffs;

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

    /**
        Reset document manager, releasing all held documents. 
    */
    reset() {
        this.diffs = [];
        this.docs.forEach(d => d.destroy());
        this.docs = new Map();
    }

    async save(file_builder) {
        if (!file_builder) {
            //Save all files individually
            this.docs.forEach(doc=>{
                doc.save();
            });
        } else {

            var i = this.docs.entries();

            for (let v of i) {
                let doc = v[1];
                await file_builder.writeS(JSON.stringify({ name: doc.name, path: doc.path, type: doc.type, data: doc + "" }));
            }

            return file_builder.offset;
        }
    }

    load(string) {
        let lex = new whind(string);
        let level = 0;

        while (!lex.END) {
            if (lex.ch == "{") {
                let n = lex.pk;
                level = 1;
                while (!n.END && level > 0) {
                    if (n.ch == "{") level++;
                    if (n.ch == "}") level--;
                    n.next();
                }

                this.loadFile(JSON.parse(n.slice(lex)));

                lex.sync(n);
            } else
                lex.next();
        }
    }
}
