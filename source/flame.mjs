import wick_component_integration from "./integration/component.prototype.integration.mjs";
import wick_element_integration from "./integration/element.integration.mjs";
import radiate_integrate from "./integration/radiate.integration.mjs";
import build_editor_environment from "./interface/editor.environment.mjs";
import flame_environment from "./interface/environment.mjs";


/*
	Handles the loading of assets, and integration of Flame system into which ever CandleFW framework is passed to $param_a

	parameters
	1 An object that is the initilizing function of either Wick, Radiate, or Lantern
	2 An object of options properties to customize flame. See available flame [./flame_option_properties](options).

	conform flame.initialization
*/
export default function initializer (cfw_framework, options){
	switch(cfw_framework.type){
		case "cfw.wick":
			return initializeWick(cfw_framework, options);
		case "cfw.radiate":
			return initializeRadiate(cfw_framework, options);
		case "cfw.lantern":
			return initializeLantern(cfw_framework, options);
		default:
			console.error("Unrecognized object passed to Flame initializer. Flame accepts [wick] [radiate] or [lantern] initializer objects.");
	}
}

function initializeWick(wick, options){
	const HIDDEN = true;

	const env = flame_environment(options);

	env.wick = wick;

	build_editor_environment(env, document.body, HIDDEN);
	
	wick_component_integration(wick, env);
}

async function initializeRadiate(radiate, options){
	const HIDDEN = true;

	const env = flame_environment(options, radiate.wick, radiate);

	wick_component_integration(radiate.wick, env);
	
	await wick_element_integration(radiate.wick, env);
	
	radiate_integrate(radiate, env);

	build_editor_environment(env, document.body, HIDDEN);
}

function initializeLantern(lantern){
	//convert the wick export into a flamed version. 
	//convert the radiate export into a flamed version.
}
