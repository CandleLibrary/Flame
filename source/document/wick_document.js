const wick = require("wick");
const fs = require("fs");
const Lexer = wick.core.lexer;
export class WickDocument {
    constructor(file_name, path, type, system) {
        this.name = file_name;
        this.type = type;
        this.path = path;
        this.data = null;
        this.LOADED = false;
        this.UPDATED = true;
        this.SAVING = false;
        this.PENDING_SAVE = false;
        this.observers = [];
        this.ObjectsPendingLoad = [];
        this.css_docs = [];
        this.system = system;
        this.element = document.createElement("div");
        document.body.appendChild(this.element)
    }
    load() {
        fs.open(this.path + "/" + this.name, "r", (err, fd) => {
            if (err) throw err;
            fs.readFile(fd, "utf8", (err, data) => {
                fs.close(fd, (err) => {
                    if (err) throw err
                });
                if (err) {
                    throw err;
                }
                this.data = data;
                this.LOADED = true;
                (new wick.core.source.package(this.data, this.system.presets, true, this.path + "/" + this.name)).then((pkg) => {
                    this.data = pkg;
                    pkg._skeletons_[0].tree.addObserver(this);
                    for (let i = 0; i < this.ObjectsPendingLoad.length; i++) this.ObjectsPendingLoad[i].documentReady(pkg);
                    this.ObjectsPendingLoad = null;
                });
            });
        });
    }
    updatedWickASTTree(tree) {
        this.element.innerText = tree;
        this.save();
    }
    save() {
        return;
        this.PENDING_SAVE = true;
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
    //*** Generate line differences between two files
    diff(old_str, new_str) {
        let le = Lexer(new_str);
        let ln = Lexer(old_str);
        let changes = [];
        while (!lo.END) {
            while (!ln.END) {
                if (ln.txt == lo.txt) {
                	ln.n();
                	lo.n();
                }else{
                	while(lo.txt !== ln.txt){
                		
                	}
                }
            }
        }
    }
    bind(object) {
        if (this.LOADED) object.documentReady(this.data);
        else this.ObjectsPendingLoad.push(object);
    }
}