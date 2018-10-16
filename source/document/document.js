const fs = require("fs");

export class Document{
	constructor(file_name, path, type){
		this.name = file_name;
		this.type = type;
		this.path = path;
		this.data = null;
		this.LOADED = false;

		this.observers = [];
		this.ObjectsPendingLoad = [];
	}

	load(){
        fs.open(this.path + "/" + this.name, "r", (err, fd) => {
            if (err) throw err;
            fs.readFile(fd, "utf8", (err, data) => {
                fs.close(fd, (err)=>{if(err)throw err});
                if (err) { throw err; };

                this.data = data;
                this.LOADED = true;

                for(let i = 0; i < this.ObjectsPendingLoad.length;  i++)
                	this.ObjectsPendingLoad[i].documentReady(this.data);

                this.ObjectsPendingLoad = null;
            });
        });
	}

	save(){
		fs.open(URI, "w", (err, fd) => {
            if (err) throw err;
            fs.write(fd, this.data, 0, "utf8", (err,written, data) => {
                fs.close(fd, (err)=>{if(err)throw err});
                if (err) { throw err; };
            });
        });
	}

	bind(object){
		if(this.LOADED)
			object.documentReady(this.data);
		else this.ObjectsPendingLoad.push(object);
	}
}