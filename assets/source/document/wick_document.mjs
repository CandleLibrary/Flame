import { SourcePackage } from "@candlefw/wick";
import { Document } from "./document";

export class WickDocument extends Document {

    updatedWickASTTree(tree) {
        this.save();
    }

    fromString(string, ALLOW_SEAL = true) {

        (new SourcePackage(string, this.system.project.presets, true, this.path + "/" + this.name)).then((pkg) => {

            if(!pkg) //TODO - Determine the cause of undefined assigned to pkg
                return;

            if (this.data)
                this.data.skeletons[0].tree.removeObserver(this);

            this.data = pkg;

            pkg.skeletons[0].tree.addObserver(this);

            for (let i = 0; i < this.observers.length; i++) this.observers[i].documentReady(pkg);

            if (ALLOW_SEAL) {
                this.PENDING_SAVE = true;
                this.system.docs.seal();
            }
        });
    }

    toString() {
        return (this.data) ?
            this.data.skeletons[0].tree + "" :
            "";
    }

    get type() {
        return "wick";
    }
}