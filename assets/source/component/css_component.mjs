import whind from "@candlefw/whind";
import {UIMaster} from "@candlefw/css";
import {Component} from "./component.mjs";

export class CSSComponent extends Component{
	constructor(tree, system){
		super(system);
		this.tree = tree;
		this.ui = new UIMaster(this.tree);
		this.element.appendChild(this.ui.element);
		this.tree.addObserver(this);
	}

	mountListeners() {
        //super.mountListeners();
    }

	documentReady(data){
		//debugger
		//this.tree = this.doc.tree;
		
	}

	documentUpdate(data){
		console.log(data)
	}

	updatedCSS(){
		console.log("AAAA")
		//this.element.innerHTML = this.tree + "";
		this.manager.updateStyle("zzz", this.tree + "");
	}
}
