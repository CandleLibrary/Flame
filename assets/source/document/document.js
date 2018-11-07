import wick from "wick";
import fs from "fs";

const Lexer = wick.core.lexer;

export class WickDocument {
    constructor(file_name, path, type, system) {
        this.old_data = "";
    }

    load() { }

    updatedWickASTTree(tree) {}

    save() {}

    seal(differ){
        if(this.PENDING_SAVE){
            this.PENDING_SAVE = false;
            
            let new_data = this + "";

            let diff = differ.createDiff(this.old_data, new_data);

            this.old_data = new_data;

            return diff;
        }

        return null;
    }

    toString(){
        return "[Document]";
    }
}