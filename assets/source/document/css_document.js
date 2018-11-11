import {
	Document
} from "./document";

import wick from "wick";

export class CSSDocument extends Document {

	updatedCSS(tree) {
		this.save();
	}

	fromString(string, ALLOW_SEAL = true) {

		this.data = string;

		if(this.tree){
			this.tree._parse_(wick.core.lexer(string)).catch((e) => {
		        throw e;
		    }).then((css) => {
		    	this.old = string;
		        this.tree.updated();
		    });
		}else{

			for (let i = 0; i < this.observers.length; i++)
				this.observers[i].documentReady(this.data);

			if (ALLOW_SEAL){
				this.PENDING_SAVE = true;
				this.system.doc_man.seal();
			}
		}
	}

	toString() {
		if(this.tree)
			return this.tree + "";
		return this.data;
	}

	get type() {
		return "css";
	}
}