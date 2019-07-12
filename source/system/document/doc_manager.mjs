import whind from "@candlefw/whind";
import URL from "@candlefw/url";

import {
    WickDocument
} from "./wick_document";

import {
    CSSDocument
} from "./css_document";

//data
//Toolbars
import general_toolbar from "./data/general_toolbar.html";

//Overlays
import basic from "./data/basic.html";

import border from "./data/border.html";
import element_draw from "./data/element_draw.html";
import selector_list from "./data/selector_list.html";
import master_component_string from "./data/master_component.html";

//CSS Handlers
import css_color_handler from "./data/css_color_handler.html";

const internal = {
    general_toolbar,
    css_color_handler,
    basic,
    border,
    element_draw,
    selector_list
};


//import path from "path";
import { DocumentDifferentiator } from "./differ";
/**
 * The Document Manager handles text file operations and text file updating. 
 */
export default class DocumentManager {
    constructor(env) {
        this.docs = new Map();
        this.env = env;
        this.differ = new DocumentDifferentiator();
        this.diffs = [];
        this.diff_step = 0;

        this.data=
        {
            ui : internal   
        };

        this.pending = null;
        this.updated = false;
        /*
        const fetch = document.fetch;

        document.fetch = async (...args) => {
            console.log(args);
            return fetch(...args);
        };
        */
    }
    /*
     * Loads file into project
     */
    loadFile(file, NEW_FILE = false) {

        switch (typeof(file)) {

            case "string": // Load from file env or DB

                switch (file) {
                    case "~edit-canvas": //Load new internal document ~edit-canvas
                        const canvas = new WickDocument("edit-canvas", "%internal", this.env, false, this);
                        canvas.fromString(master_component_string, this.env, false);
                        this.docs.set(canvas.id, canvas);
                        return canvas.id;
                }

                const url = new URL(file);

                file = {
                    path: url.dir,
                    name: url.file
                };

                //Intentional fall through. 
            case "object": //
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
                                doc = new WickDocument(name, path, this.env, NEW_FILE, this);
                                break;
                            case "css":
                            default:
                                doc = new CSSDocument(name, path, this.env, NEW_FILE, this);
                        }
                        this.docs.set(id, doc);


                        if (file.data)
                            doc.fromString(file.data);
                        else {
                            if (file.path[0] !== "%")
                                doc.load();
                        }
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
                this.env.history.addAction({ type: "doc", diffs });
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

    createInternalCSSDoc(component, css) {
        const i = Math.round(Math.random() * 100000);

        if (css.doc)
            return css.doc;

        let css_name = `css${i}`;
        let css_path = `${component.doc_path}/${component.doc_name}#`;
        let css_doc = new CSSDocument(css_name, css_path, this.env, true, this);
        css_doc.tree = css;
        css.doc = css_doc;

        css.addObserver(css_doc);

        this.docs.set(`${css_path}${css_name}`, css_doc);

        return css_doc;
    }
}


export { DocumentManager };
