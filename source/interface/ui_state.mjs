//Responsible for registering controllers and handling UI state
export default function ui_state(env, view_element, ui_element, controllers = []){
    
    var overlay, comps, input;

    return {

    	addController(controller){
    		return ui_state(env, view_element, ui_element, [controller, ...controllers]);
    	},

    	removeController(controller){

    	},

    	active(comp, input){

    		if(env.ui.interface !== this){
    			ui_element.innerHTML = "";
    			controllers.forEach(c=>c.mount(ui_element));
    			env.ui.interface = this;
    		}
    		
    		if(comps !== comp){
    			view_element.innerHTML = "";
    			comp.components.forEach(c=>c.mount(view_element));
    			comps = comp;
    		}

    		if(comp.active && overlay){
    			debugger
    		}
    	}
    };
}