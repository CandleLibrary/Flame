import {CSSRootNode, CSSRule} from "@candlefw/css";
import {StyleNode} from "../wick_compiler_nodes/style";
import whind from "@candlefw/whind";

const CSS_Rule_Constructor = CSSRule;

import {
	CSSComponent
} from "./css_component";

/**
 *  This module maintains CSS documents and handles the updating of their contents. 
 */

let CSS_Root_Constructor = CSSRootNode;

export class CSSManager {

	constructor(docs) {
		this.css_files = [];
		this.style_elements = {};
		this.docs = docs;
	}

	/**
	 * Returns an array of CSS rules that match against the element
	 * @param  {[type]} element   [description]
	 * @param  {[type]} component [description]
	 * @return {[type]}           [description]
	 */
	aquireCSS(element, component) {
		if (!component)
			return [];

		let win = component.window;

		let css_docs = component.local_css;

		let selectors = [];

		for (let i = 0; i < css_docs.length; i++) {
			let gen = css_docs[i].getApplicableSelectors(element, win),
				sel = null;
			while (sel = gen.next().value)
				selectors.push(sel);
		}

		return selectors;
	}

	createStyleDocument(name){

		let id = "./temp.css"
		this.docs.load({path:"./", name:"temp.css"}, true);
		let doc = this.docs.get(id);
		debugger
	}

	/**
	 * Returns matching rule that is the most unique to the element. Creates a new rule if one cannot be found. May create a new CSS document if the rule is not found.  
	 * @param  {[type]} element   [description]
	 * @param  {[type]} component [description]
	 * @return {[type]}           [description]
	 */
	getUnique(element, component) {
		let css_docs = component.local_css;
		let win = component.window;

		let selector = null,
			best_score = 0;

		for (let i = 0; i < css_docs.length; i++) {
			let gen = css_docs[i].getApplicableSelectors(element, win),
				sel = null;
			while (sel = gen.next().value) {
				let score = sel.v.length * -20.5;

				for (let j = 0; j < sel.a.length; j++) {
					let array = sel.a[j];
					let score_multiplier = 1;
					for (let x = 0; x < array.length; x++) {
						let v = array[x];

						for(let y = 0; y < v.ss.length; y++){
							let r = v.ss[y];

							switch(r.t){
								case "class":
									score += 40 * score_multiplier;
									break;
								case "id":
									score += 50 * score_multiplier;
									break;
							}
						}

						switch (v.c) {
							case "child":
								score += 2 * score_multiplier;
								break;
							case "preceded":
								score += 3 * score_multiplier;
								break;
							case "immediately_preceded":
								score += 3 * score_multiplier;
								break;
							case "descendant":
								score += 1 * score_multiplier;
								break;
						}

						score_multiplier -= 0.98;
					}
				}

				if (score > best_score) {
					selector = sel;
					best_score = score;
				}
			}
		}
		
		if (!selector) {
			//Create new CSS document and create identifier for this document best matching the element. 
			//Add new class to element if there is none present. 

			//The last selector in the component CSS has the highest default precedent.
			let tree = css_docs[css_docs.length - 1];

			if (css_docs.length == 0) {
            	 tree = new CSS_Root_Constructor();
				
				let ast = component.sources[0].ast;
            	
            	let style = new StyleNode();
            	style.tag = "style";
            	
            	ast.css = (ast.css) ? ast.css : [];
            	ast.addChild(style)
            	ast.css.push(tree)
            	
            	style.css = tree;
            	tree.addObserver(style);
				
				this.css_files.push(tree);
				component.local_css.push(tree);
			}


				//create new css document. it should be located at the same location as the component. Or at a temp location

			let class_name = "n" +((Math.random() * 10000000) | 0) + "";
			let classes = element.wick_node.getAttrib("class");
			
			if (classes) {
				if (typeof(classes.value) == "string")
					classes.value += ` ${class_name}`;
				else
					classes.value.txt += ` ${class_name}`;
			}else{
				element.wick_node.attributes.push(element.wick_node.processAttributeHook("class", whind(class_name)));
			}

			element.classList.add(class_name);

			let body = tree.fch;

			selector = body.createSelector(`.${class_name}`);
		}

		return selector;
	}

	addFile(css_text, scope, file_id) {
		let css_file = new CSS_Root_Constructor();
		css_file.parse(new wick.core.lexer(css_text), true, null, null);
		this.css_file.push(css_text);
		css_file.file_id = file_id;
	}

	addTree(tree, IS_DOCUMENT, url) {
		if (IS_DOCUMENT) {
			let doc = this.docs.get(url);
			if (!doc.tree) {
				doc.tree = tree;
				tree.addObserver(doc);
			} else {
				tree = doc.tree;
			}
		}

		this.css_files.push(tree);

		return tree;
	}

	updateStyle(id, text) {
		let style = this.style_elements[id];

		if (!style) {
			style = this.style_elements[id] = document.createElement("style");
		}

		style.innerHTML = text;
	}

	createComponent(doc) {
		let css_file = new CSS_Root_Constructor();
		let component = new CSSComponent(css_file, this);
		doc.bind(component);
		this.css_files.push(css_file);
		return component;
	}

	mergeRules(css) {
	    let rule = new CSS_Rule_Constructor();
	    for (let i = 0; i < css.length; i++)
	        rule.merge(css[i].r);
	    return rule;
	}
}