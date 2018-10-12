/**
 *  This module maintains CSS documents and handles the updating of their contents. 
 */

let CSS_Root_Constructor = require("wick").core.css.root;

export class CSSManager {
	
	constructor(){
		this.css_files = [];
	}

	aquireCSS(element){

		let rules = null; //TODO convert to dynamic rule object. 
		
		for(let i = 0; i < this.css_files.length; i++)
			rules = this.css_files[i].getApplicableRules(rules);
		

		return rules;
	}

	addFile(css_text, scope, file_id){
		let css_file = new CSS_Root_Constructor();	
		css_file._parse_(new wick.core.lexer(css_text), true, null, null);
		this.css_file.push(css_text);
		css_file.file_id = file_id;
	}
}