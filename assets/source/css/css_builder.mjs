
import {UIMaster} from "@candlefw/css"
import {UIRuleSet} from "@candlefw/css"
import whind from "@candlefw/whind";

export default class CSSContainer extends UIMaster{

    constructor() {
    	super({addObserver:()=>{}});
        //css.addObserver(this);

        this.roots = new Map();
        this.selectors = new Set();
        this.rules = new Map();


        this.rule_sets = [];
        //this.selectors = [];
        this.element = document.createElement("div");
        this.element.classList.add("cfw_css");
        this.update_mod = 0;
        this.rule_map = new Map();
    }

    /** Add selector to list, merge with any known selector or rule. Extracts CSS Sheet data **/
    addSelector(selector){
    	//No matching selector. Add to list. 

    	if(!this.selectors.has(selector))
    		this.selectors.add(selector);

    	//Add the CSS root to the list of roots.
    	const root_val = this.roots.get(selector.root);
    	
    	if(root_val)
    		this.roots.set(selector.root, root_val + 1);
    	else{
    		selector.root.par.addObserver(this);
    		this.roots.set(selector.root.par, 1);
    	}

    	//Add the selector's rule to the list of rules
    	let rule = this.rules.get(selector.r);

		if(!rule){
			rule = new UIRuleSet(selector.r, this);
    		this.rules.set(selector.r, rule);
		}
    	
    	rule.addSelector(selector);
    }

    /** Remove selector from list. Unlink any css file that is associated with the selector **/
    removeSelector(selector){
    	//Make sure the selector is a member of this rule set.
    	if(this.selectors.has(selector)){
    		
    		let rule = this.rules.get(select.r);
    		
    		rule.removeSelector(selector);

    		let root_val = this.roots.get(selector.root);

    		if(root_val > 1)
    			this.roots.set(selector.root, root_val - 1);
    		else{
    			selector.roots.removeObserver(this);
    			this.roots.remove(selector.root);
    		}
    	}
    }


    // Builds out the UI elements from collection of rule bodies and associated selector groups. 
    // css - A CandleFW_CSS object. 
    // meta - internal 
    build() {
        this.rules.forEach((e,b,v)=>e.rebuild(b))
    }

    updatedCSS(rule) {
        if(this.UPDATE_MATCHED) return void (this.UPDATE_MATCHED = false);      
        //this.element.innerHTML = "";
        this.build();
        //this.render();
    }

    render() {
        for (let i = 0; i < this.rule_sets.length; i++)
            this.rule_sets.render(this.element);
    }

    mount(element) {
        if (element instanceof HTMLElement)
            element.appendChild(this.element);
    }

    unmount() {
        if (this.element.parentElement)
            this.element.parentElement.removeChild(this.element);
    }

    update(rule){
        this.UPDATE_MATCHED = true;
        rule.rule_body.root.par.updated();
    	//this.css.updated();
    }
}
