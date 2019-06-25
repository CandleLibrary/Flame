import whind from "@candlefw/whind";

export class CSSComponent extends Component{
	constructor(tree, manager){
		this.manager = manager;
		this.tree = tree;
		this.doc = null;
		this.element = document.createElement("div");
		this.selectors
		this.tree.addObserver(this);
		this.rule_sets = [];
		this.selectors = [];
	}

	destroy(){

	}

	documentReady(data){
		this.tree.parse(whind(data, true));
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
