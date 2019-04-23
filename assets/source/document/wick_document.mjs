import { SourcePackage } from "@candlefw/wick";
import { Document } from "./document";

export class WickDocument extends Document {


    updatedWickASTTree() {
        this.manager.addPending(this);
    }

    fromString(string, ALLOW_SEAL = true) {

        (new SourcePackage(string, this.system.project.presets, true, this.path + "/" + this.name)).then((pkg) => {

            //TODO - Determine the cause of undefined assigned to pkg
            if (!pkg) { debugger; return }

            this.LOADED = true;
            
            if (this.data)
                this.data.skeletons[0].tree.removeObserver(this);

            this.data = pkg;

            pkg.skeletons[0].tree.addObserver(this);

            this.alertObservers();

            if (ALLOW_SEAL) {
                this.PENDING_SAVE = true;
                this.system.docs.seal();
            }
        });
    }

    toString() {
        return (this.data) ?
            this.data.toString() :
            "";
    }

    get type() {
        return "html";
    }
}
