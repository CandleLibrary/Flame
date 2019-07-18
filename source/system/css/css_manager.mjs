import * as css from "@candlefw/css";
import { stylerule } from "@candlefw/css";
import whind from "@candlefw/whind";

const CSS_Rule_Constructor = CSSRule;

import {    CSSComponent} from "../../component/css_component";

/**
 *  This module maintains CSS documents and handles the updating of their contents. 
 */

//let CSS_Root_Constructor = CSSRootNode;

export default function(env) {
    var StyleNode = null,
        RootNode = null;

    env.wick("<style></style>").pending.then(comp => {
        StyleNode = comp.ast.constructor;
        RootNode = comp.ast.constructor.__proto__;
    });

    return new class CSSManager {

        constructor() {
            this.css_files = [];
            this.style_elements = {};
            this.docs = env.data.docs;
            this.env = env;
        }

        // Returns a list of all selectors that match against the givin compoonent and element
        getApplicableSelectors(component, element) {
            const
                css = component.local_css,
                selectors = [];

            for (let i = 0, l = css.length; i < l; i++)
                for (const sel of css[i].getApplicableSelectors(element))
                    selectors.push(sel);

            return selectors;
        }



        // Returns an array of CSS rules that match against the element
        aquireCSS(component, element) {
            return this.getApplicableSelectors(component, element).map(sel => sel.parent);
        }

        createStyleDocument(name) {

            const id = "./temp.css";
            this.docs.loadFile({ path: "./", name: "temp.css" }, true);
            //let doc = this.docs.get(id);
            debugger;
        }

        /**
         * Returns matching rule that is the most unique to the element. Creates a new rule if one cannot be found. May create a new CSS document if the rule is not found.  
         * @param  {[type]} element   [description]
         * @param  {[type]} component [description]
         * @return {[type]}           [description]
         */
        getUnique(component, element) {

            const IS_WICK_NODE = element instanceof RootNode,
                css_docs = component.local_css,
                win = component.window,
                score_multiplier = 1;

            let selector = null,
                best_score = 0;

            for (let i = 0; i < css_docs.length; i++) {
                for (const sel of css_docs[i].getApplicableSelectors(element, win)) {

                    let score = sel.vals.length * -20.5; // The longer the selector is the less likely it will be used

                    for (const part of sel.vals) {
                        switch (part.type) {
                            case "compound":
                                score += 21 * score_multiplier;
                                break;
                            case "complex":
                                score += 3 * score_multiplier;
                                switch (part.op) {
                                    case ">":
                                        score += 2 * score_multiplier;
                                        break;
                                    case "~":
                                        score += 3 * score_multiplier;
                                        break;
                                    case "immediately_preceded":
                                        score += 3 * score_multiplier;
                                        break;
                                    case "+":
                                        score += 1 * score_multiplier;
                                        break;
                                }
                                break;
                            case "attrib":
                                score += 3 * score_multiplier;
                                break;
                            case "type":
                            case "class":
                                score += 40 * score_multiplier;
                                break;
                            case "id":
                                score += 50 * score_multiplier;
                                break;
                            case "pseudo-element":
                                score += 1 * score_multiplier;
                                break;
                            case "pseudo-class":
                                score += 1 * score_multiplier;
                                break;
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
                const tree = css_docs[css_docs.length - 1],
                    node = IS_WICK_NODE ? element : element.wick_node,
                    class_name = "n" + ((Math.random() * 10000000) | 0) + "";
                    
                const
                    a = node.attribs,
                    nclass = ((a.has("class")) ? null : (node.addAttribute("class", "")), a.get("class"));

                nclass.value += ` ${class_name}`;

                if (!IS_WICK_NODE)
                    element.classList.add(class_name);

                const sheet = css.parse(`.${class_name}{top:0}`);
                const stylerule = sheet.ruleset.rules[0];
                
                stylerule.properties.delete("top");

                if (css_docs.length == 0) {
                    //create new css document. it should be located at the same location as the component. Or at a temp location
                    component.setLocalStyleSheet(sheet);
                    return stylerule;
                } else {
                    //Enter the rule into the bestfit CSS dataset.
                    tree.ruleset.rules.push(stylerule);
                    stylerule.parent = tree.ruleset;
                    return stylerule;
                }
            }

            return selector.parent;
        }

        addFile(css_text, scope, file_id) {
            const css_file = css.parse(css_text);
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
                tree.doc = doc;
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

            const tree = doc.tree;

            if (!tree) {
                doc.tree = new css.stylesheet();
                doc.tree.addObserver(doc);
                doc.bind({ documentReady: (data) => { doc.tree.parse(whind(data)); return false } });
                this.css_files.push(doc.tree);
            }

            return new CSSComponent(this.env, tree);
        }

        mergeRules(css_rules) {
            const rule = new stylerule();
            for (let i = 0; i < css_rules.length; i++)
                rule.merge(css_rules[i]);
            return rule;
        }
    };
}
