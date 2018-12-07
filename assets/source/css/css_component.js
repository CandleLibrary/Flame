export class CSSComponent{
	constructor(tree, manager){
		this.manager = manager;
		this.tree = tree;
		this.doc = null;
		this.element = document.createElement("div");
		this.tree.addObserver(this);
	}

	documentReady(data){
		this.tree.parse(wick.core.lexer(data, true));
		this.manager.updateStyle("zzz", data);
		this.element.innerHTML = this.tree + "";
	}

	documentUpdate(data){

	}

	updatedCSS(){
		//this.element.innerHTML = this.tree + "";
		this.manager.updateStyle("zzz", this.tree + "");
	}
}