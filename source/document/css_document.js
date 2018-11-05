import wick from "wick";

const fs = require("fs");

export class CSSDocument{
	constructor(file_name, path, type, system){
		
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

		this.old_data = "";
	//	document.body.appendChild(this.element)
	}

	load(){
        fs.open(this.path + "/" + this.name, "r", (err, fd) => {
            if (err) throw err;
            fs.readFile(fd, "utf8", (err, data) => {
                fs.close(fd, (err)=>{if(err)throw err});
                if (err) { throw err; }
                
                this.data = data;
                this.LOADED = true;
                
                for(let i = 0; i < this.ObjectsPendingLoad.length;  i++)
                	this.ObjectsPendingLoad[i].documentReady(data);
            });
        });
	}

	updatedWickASTTree(tree){
		this.element.innerText = tree;
		this.save();
	}

	save(){
		this.PENDING_SAVE = true;
		return
		if(this.SAVING) return;
		this.SAVING = true;
        this.PENDING_SAVE = false;
		fs.open(this.path + "/" + this.name, "w", (err, fd) => {
            if (err) throw err;
            fs.write(fd, (this.tree + ""), 0, "utf8", (err,written, data) => {
                fs.close(fd, (err)=>{if(err)throw err});
                if (err) { throw err; }
  
                if(this.PENDING_SAVE)
                	this.save();
                else this.PENDING_SAVE = false;
                this.SAVING = false;
            });
        });
	}

	bind(object){
		if(this.LOADED)
			object.documentReady(this.data);
		else this.ObjectsPendingLoad.push(object);
	}

	updatedCSS(tree){
		this.save();
	}

	seal(differ){
		if(this.PENDING_SAVE){
			this.PENDING_SAVE = false;
			
			let new_data = this + "";

			let diff = differ.createDiff(this.old_data, new_data);

			this.old_data = new_data;

			return (diff) ? {name:this.name, diff} : null;
		}

		return null;
	}

	toString(){
		return this.tree + "";
	}
}