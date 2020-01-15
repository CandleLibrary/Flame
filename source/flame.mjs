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
export default function initializer(cfw_framework, options) {
	switch (cfw_framework.type) {
		case "cfw.wick":
			return initializeWick(cfw_framework, options);
		case "cfw.radiate":
			return initializeRadiate(cfw_framework, options);
		case "cfw.lantern":
		default:
			return initializeLantern(cfw_framework, options);
		// /	console.error("Unrecognized object passed to Flame initializer. Flame accepts [wick] [radiate] or [lantern] initializer objects.");
	}
}

function initializeWick(wick, options) {
	const HIDDEN = true;

	const env = flame_environment(options);

	env.wick = wick;

	build_editor_environment(env, document.body, HIDDEN);

	wick_component_integration(wick, env);
}

async function initializeRadiate(radiate, options) {
	const HIDDEN = true;

	const style = document.createElement("style");

	style.innerHTML = `
		.flame_component{
			border: 2px solid blue;
		}

		.flame_scope{
			border: 2px solid blue;
		}
	`;

	document.head.appendChild(style);

	/* After radiate loads, prime the editor environement. */

	radiate.loaded = async (presets, router) => {

		const env = flame_environment(options, radiate.wick, radiate);

		wick_component_integration(radiate.wick, env);

		await wick_element_integration(radiate.wick, env);

		build_editor_environment(env, document.body, HIDDEN);
		
		radiate_integrate(env, router, presets);
	};
}

function initializeLantern(lantern) {
	debugger;
	//convert the wick export into a flamed version. Define what "Flamed" Means
	//convert the radiate export into a flamed version.
}


const r = typeof radiate !== "undefined" ? radiate : null,
	w = typeof wick !== "undefined" ? wick : null;

if (r)
	initializer(r, {});
else if (w)
	initializer(w, {});

