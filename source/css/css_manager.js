import {CSSComponent} from "./css_component";

/**
 *  This module maintains CSS documents and handles the updating of their contents. 
 */

let CSS_Root_Constructor = require("wick").core.css.root;

export class CSSManager {
	
	constructor(){
		this.css_files = [];
		this.style_elements = {};
	}

	aquireCSS(element){

		let rules; //TODO convert to dynamic rule object. 
		
		for(let i = 0; i < this.css_files.length; i++)
			rules = this.css_files[i].getApplicableRules(element, rules);
		
		return rules;
	}

	addFile(css_text, scope, file_id){
		let css_file = new CSS_Root_Constructor();	
		css_file._parse_(new wick.core.lexer(css_text), true, null, null);
		this.css_file.push(css_text);
		css_file.file_id = file_id;
	}

	addTree(tree){
		this.css_files.push(tree);
	}

	updateStyle(id, text){
		let style = this.style_elements[id];

		if(!style){
			style = this.style_elements[id] = document.createElement("style");
			document.head.appendChild(style);
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