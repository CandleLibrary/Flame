import {
    Document
} from "./document";

import whind from "@candlefw/whind";



export class CSSDocument extends Document {

    updatedCSS(tree) {
        this.save();
    }

    fromString(string, ALLOW_SEAL = true) {
    	
        this.data = string;

        if (this.tree) {
            this.tree.parse(whind(string)).catch((e) => {
                throw e;
            }).then((css) => {
                this.old = string;
                this.tree.updated();
            });
        } else {

            for (let i = 0; i < this.observers.length; i++)
                this.observers[i].documentReady(this.data);

            if (ALLOW_SEAL) {
                this.PENDING_SAVE = true;
                this.system.docs.seal();
            }
        }
    }

    toString() {
        return (this.tree) ?
            this.tree + "" :
            this.data;
    }

    get type() {
        return "css";
    }
}