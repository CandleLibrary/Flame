import { Document } from "./document";

/**
 * The Document Manager handles text file operations and text file updating. 
 */
export class DocumentManager {

    constructor() {
        this.docs = new Map();
    }

    /*
     * Loads file into workarea 
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

                    if (file.type)
                        type = file.type.split("/")[1].toLowerCase();
                    else
                        type = name.split(".").pop().toLowerCase();

                    if (path.includes(name))
                        path = path.replace(name, "");

                    if (path[path.length - 1] == "/" || path[path.length - 1] == "\\")
                        path = path.slice(0,-1);

                    path = path.replace(/\\/g, "/");

                    let id = `${path}/${name}`;
                    
                    if (this.docs.get(id))
                        return "";
                    else {
                        let doc = new Document(name, path, type);

                        this.docs.set(id, doc);

                        doc.load();
                    }

                    return id;
                }
                break;
        }

        return "";
    }

    get(id){
    	return this.docs.get(id);
    }
}