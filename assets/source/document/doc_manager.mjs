import whind from "@candlefw/whind";
import {
    WickDocument
} from "./wick_document";
import {
    CSSDocument
} from "./css_document";
import path from "path";
import { DocumentDifferentiator } from "./differ";
import master_component_string from "./master_component_string.mjs";
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
        global.fetch = (url) => new Promise((res) => {
            let p = url;
            if (!path.isAbsolute(p)) p = path.resolve(process.cwd(), (url[0] == ".") ? url + "" : "." + url);
            const doc_id = this.loadFile({
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
                
                switch (file) {
                    case "~edit-canvas": //Load new internal document ~edit-canvas
                        const canvas = new WickDocument("edit-canvas", "%internal", this.system, false, this);
                        canvas.fromString(master_component_string);
                        this.docs.set(canvas.id, canvas);
                        return canvas.id;
                };

                var p = path.parse(file);
                file = {
                    path: p.dir,
                    name: p.base
                };
                //Intentional fall through. 
            case "object": // Loandead data 
                if (file.name && file.path) {
                    const name = file.name;
                    let path = file.path;
                    let type = "";
                    if (file.type) type = file.type; //.split("/")[1].toLowerCase();
                    else type = name.split(".").pop().toLowerCase();
                    if (path.includes(name)) path = path.replace(name, "");
                    if (path[path.length - 1] == "/" || path[path.length - 1] == "\\") path = path.slice(0, -1);
                    path = path.replace(/\\/g, "/");
                    const id = `${path}/${name}`;
                    if (!this.docs.get(id)) {
                        let doc;
                        switch (type) {
                            case "html":
                            case "text/html":
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
        const diffs = action.diffs;
        if (diffs) {
            for (let i = 0; i < diffs.length; i++) {
                const pack = diffs[i],
                    doc = this.docs.get(pack.id);
                this.differ.revert(doc, pack.diff);
            }
        }
    }

    redo(action) {

        const diffs = action.diffs;

        if (diffs) {
            for (let i = 0; i < diffs.length; i++) {
                const pack = diffs[i],
                    doc = this.docs.get(pack.id);
                this.differ.convert(doc, pack.diff);
            }
        }
    }

    addPending(doc) {
        if (doc.ps)
            return;
        if (this.pending)
            doc.next = this.pending;

        doc.ps = true;

        this.pending = doc;
    }

    removePending(doc) {
        if (doc == this.pending) {

            if (doc.nxt == doc)
                this.pending = null;
            else
                this.pending = doc.next;
        }

        doc.ps = false;

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
            this.docs.forEach(doc => {
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

    createInternalCSSDoc(component, css){
        const i = Math.round(Math.random()*100000);

        if(css.doc)
            return css.doc;

        let css_name = `css${i}`
        let css_path = `${component.doc_path}/${component.doc_name}#`;
        let css_doc = new CSSDocument(css_name, css_path, this.system, true, this);
        css_doc.tree = css;
        css.doc = css_doc;
        
        css.addObserver(css_doc);

        this.docs.set(`${css_path}${css_name}`, css_doc);

        return css_doc;
    }
}
