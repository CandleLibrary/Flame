import {SourcePackage} from "@candlefw/wick";
import {Document} from "./document";

export class WickDocument extends Document{

    updatedWickASTTree(tree) {
        this.element.innerText = tree;
        this.save();
    }

    fromString(string, ALLOW_SEAL = true) {

        (new SourcePackage(string, this.system.project.presets, true, this.path + "/" + this.name)).then((pkg) => {

            if(this.data)
                this.data.removeObserver(this);

            this.data = pkg;

            pkg._skeletons_[0].tree.addObserver(this);
            
            for (let i = 0; i < this.observers.length; i++) this.observers[i].documentReady(pkg);

            if(ALLOW_SEAL){
                this.PENDING_SAVE = true;
                this.system.docs.seal();
            }
        });
    }

    toString() {
        return this.data._skeletons_[0].tree + "";
    }

    get type(){
        return "wick";
    }
}