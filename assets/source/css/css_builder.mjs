
import UIMaster from "@candlefw/css"
import whind from "@candlefw/whind";

const props = Object.assign({}, property_definitions);

export default class CSSContainer extends UIMaster{

    constructor(css) {
    	super(css);
        css.addObserver(this);

        this.roots = new Map();
        this.selectors = new Set();
        this.rules = new Map();

        this.css = css;
        this.rule_sets = [];
        this.selectors = [];
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
    		selector.root.addObserver(this);
    		this.roots.set(selector.root, 1);
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
    build(css = this.css) {
    	return;
        if(this.update_mod++%3 !== 0) return;

        //Extract rule bodies and set as keys for the rule_map. 
        //Any existing mapped body that does not have a matching rule should be removed. 
        
        const rule_sets = css.children;

        for(let i= 0; i < rule_sets.length; i++){
            let rule_set = rule_sets[i];

            for(let i = 0; i < rule_set.rules.length; i++){

                let rule = rule_set.rules[i];

                if(!this.rule_map.get(rule))
                    this.rule_map.set(rule, new UIRuleSet(rule, this));
                else {
                    this.rule_map.get(rule).rebuild(rule);
                }
            }

        
            const selector_array = rule_set._sel_a_;

            for(let i = 0; i < selector_array.length; i++){
                let selector = selector_array[i];
                let rule_ref = selector.r;

                let rule_ui = this.rule_map.get(rule_ref);

                rule_ui.addSelector(selector);
            }
        }


        this.css = css;

        let children = css.children;

        this.rule_sets = [];
        this.selectors = [];
    }

    updatedCSS(css) {
        if(this.UPDATE_MATCHED) return void (this.UPDATE_MATCHED = false);      
        //this.element.innerHTML = "";
        this.build(css);
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

    update(){
        this.UPDATE_MATCHED = true;
    	this.css.updated();
    }
}
