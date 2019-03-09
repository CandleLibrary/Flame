import {Component} from "./component.mjs"
import whind from "@candlefw/whind";
import {TextIO, TextFramework} from "@candlefw/charcoal"

export class CSSComponent extends Component{
	constructor(system){
		super(system);
		
		this.fw = new TextFramework();
		this.io = new TextIO(this.element);
		this.io.fw = this.fw;
		this.element.addEventListener("pointerdown", e => {
			if(e.button !== 1){	
				e.preventDefault();
				e.stopPropagation();
			}
		});
		
		//this.element.addEventListener("pointerup", e => {this.element.focus(); this.io.onMouseUp(e)});
        //this.element.addEventListener("keypress", e => {debugger;this.io.onKeyPress(e)});
        //this.element.addEventListener("keydown", e => {this.io.onKeyDown(e)});
        //this.element.addEventListener("wheel", e => {this.io.onMouseWheel(e)});
	}

	destroy(){

		if(this.tree)
			this.tree.removeObserver(this);

		this.tree = null;

		this.fw.destroy();
		this.fw = null;

		this.io.destroy();
		this.io = null;

		super.destroy();
	}

	load(document) {
        this.name.innerHTML = document.name;
        this.doc_name = document.name;
        this.doc_path = document.path;
        this.doc = document;
        document.bind(this);
    }

	documentReady(data){
		this.tree = this.doc.tree;
		this.tree.addObserver(this);
		//this.tree.parse(whind(data, true));
		//this.manager.updateStyle("zzz", data);
		this.fw.insertText(this.tree +"");
		this.fw.updateText(this.io);
		this.io.render();
	}

	updatedCSS(){
		this.fw.clearContents();
		this.fw.insertText(this.tree +"");
		this.fw.updateText(this.io);
		this.io.render();
		// /this.element.innerHTML = this.tree + "";
		//this.element.innerHTML = this.tree + "";
		//this.manager.updateStyle("zzz", this.tree + "");
	}

	get type(){
		return "css";
	}
}
