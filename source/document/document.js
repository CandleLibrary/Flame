const wick = require("wick");
const fs = require("fs");

export class WickDocument{
	constructor(file_name, path, type, system){
		this.name = file_name;
		this.type = type;
		this.path = path;
		this.data = null;
		this.LOADED = false;
		this.UPDATED = true;

		this.observers = [];
		this.ObjectsPendingLoad = [];
		this.system = system;

		this.element = document.createElement("div");
		document.body.appendChild(this.element)
	}

	load(){
        fs.open(this.path + "/" + this.name, "r", (err, fd) => {
            if (err) throw err;
            fs.readFile(fd, "utf8", (err, data) => {
                fs.close(fd, (err)=>{if(err)throw err});
                if (err) { throw err; }

                this.data = data;
                this.LOADED = true;

                (new wick.core.source.package(this.data, this.system.presets, true)).then((pkg)=>{

                	this.data = pkg;

                	pkg._skeletons_[0].tree.addObserver(this);

                	for(let i = 0; i < this.ObjectsPendingLoad.length;  i++)
                		this.ObjectsPendingLoad[i].documentReady(pkg);

                	this.ObjectsPendingLoad = null;	
                });
            });
        });
	}

	updatedWickASTTree(tree){
		this.element.innerText = tree;
	}


	save(){
		fs.open(URI, "w", (err, fd) => {
            if (err) throw err;
            fs.write(fd, this.data, 0, "utf8", (err,written, data) => {
                fs.close(fd, (err)=>{if(err)throw err});
                if (err) { throw err; }
            });
        });
	}

	bind(object){
		if(this.LOADED)
			object.documentReady(this.data);
		else this.ObjectsPendingLoad.push(object);
	}
}