/*
    Every action should be able to be saved to file. This means that only primitive information should be stored
    in an action object, and should not contain references to complex objects (anything that is not an array of prims, or an array that contains arrays of prims.)
*/

import ll from "@candlefw/ll";

class State {

    constructor(id = 0) {
        this._id = id;
        this.actions = [];
        this.progression = 0; //Used to determin which branch to go to when advancing.
    }

    toJSON() {
        const str = { a: this.actions, p: this.progression, b: [] };

        let root = this.fch;
        let node = this.fch;

        do {
            str.b.push(node.toJSON());
        } while ((node = node.next) !== root);

        return str;
    }

    fromJSON(node) {
        this.actions = node.a;

        const branches = node.b;

        for (let i = 0; i < branches.length; i++) {
            let s = new State();
            this.push(s);
            s.fromJSON(branches[i]);
        }
    }

    addAction(action){
        if(action.type)
            this.actions.push(action);
    }

    get id(){
        let id = this._id + "";
        return (this.par) ? `${this.par.id}:${id}` : id;
    }
}

ll.mixinTree(State);


/** 
    Methods of creating and managing state trees. 
*/
export class StateMachine {

    constructor(system) {
        this.system = system;
        this.active_state = new State();
    }

    //Stores history as an array of reversable actions.
    addAction(action) {
        
        if (this.active_state.fch) 
            this.seal();
        
        this.active_state.addAction(action);
    }

    seal() {
        let id = this.active_state.children.length;

        let state = new State(id);

        this.active_state.addChild(state);

        this.active_state.progression = id;

        this.active_state = state;
    }

    /**
        Plays the current state's redo methods then advances to the next state. Does nothing if there is no state to advance to.
    **/
    redo() {
        
        let next = this.active_state.children[this.active_state.progression];
        
        if (next) {

            let actions = this.active_state.actions;

            for (let i = 0; i < actions.length; i++) {
                
                let action = actions[i];

                switch (action.type) {
                    case "doc":
                        this.system.docs.redo(action);
                        break;
                }
            }

            this.active_state = next;
        }
    }

    /**
        Degresses to the previous state and then plays that state's undo method. Does nothing if there is no state to fallback to.
    **/
    undo() {

        let prev = this.active_state.par;

        if (prev) {

            let actions = prev.actions;

            for (let i = 0; i < actions.length; i++) {
                
                let action = actions[i];

                switch (action.type) {
                    case "doc":
                        this.system.docs.undo(action);
                        break;
                }
            }

            this.active_state = prev;
        }
    }
}