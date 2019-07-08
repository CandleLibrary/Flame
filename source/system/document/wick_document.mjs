import { Document } from "./document";

export class WickDocument extends Document {

    updatedWickASTTree() {
        this.manager.addPending(this);
    }

    async fromString(string, env, ALLOW_SEAL = true) {
        //*

        const component = (env.wick(string, env.presets));

        await component.pending;

        //TODO - Determine the cause of undefined assigned to pkg
        if (!component) { debugger; return }

        this.LOADED = true;

        if (this.data)
            this.data.removeObserver(this);

        this.data = component.ast;

        this.data.addObserver(this);

        this.alertObservers();

        if (ALLOW_SEAL) {
            this.PENDING_SAVE = true;
            this.system.docs.seal();
        }
    //*/
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