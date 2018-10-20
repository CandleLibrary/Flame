import {CSSComponent} from "./css_component";

/**
 *  This module maintains CSS documents and handles the updating of their contents. 
 */

let CSS_Root_Constructor = require("wick").core.css.root;

export class CSSManager {
	
	constructor(docs){
		this.css_files = [];
		this.style_elements = {};
		this.docs = docs;
	}

	aquireCSS(element, component){
		if(!component)
			return [];

		let css_docs = component.local_css;

		let selectors = []; //TODO convert to dynamic rule object. 
		
		for(let i = 0; i < css_docs.length; i++){
			let gen = css_docs[i].getApplicableSelectors(element), sel = null;
			while(sel = gen.next().value)
				selectors.push(sel);
		}
		
		return selectors;
	}

	addFile(css_text, scope, file_id){
		let css_file = new CSS_Root_Constructor();	
		css_file._parse_(new wick.core.lexer(css_text), true, null, null);
		this.css_file.push(css_text);
		css_file.file_id = file_id;
	}

	addTree(tree, IS_DOCUMENT, url){
		if(IS_DOCUMENT){
			let doc = this.docs.get(url);
			if(!doc.tree){
				doc.tree = tree;
				tree.addObserver(doc);
			}else{
				tree = doc.tree;
			}
		}

		this.css_files.push(tree);

		return tree;
	}

	updateStyle(id, text){
		let style = this.style_elements[id];

		if(!style){
			style = this.style_elements[id] = document.createElement("style");
		}

		style.innerHTML = text;
	}

	createComponent(doc){
		let css_file = new CSS_Root_Constructor();	
		let component = new CSSComponent(css_file, this);
		doc.bind(component);
		this.css_files.push(css_file);
		return component;
	}
}