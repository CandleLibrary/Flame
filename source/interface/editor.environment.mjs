import ui_component from "../component/ui_controller.mjs";
import comp_state from "./ui_comp_state.mjs";
import input_state from "./input_state.mjs";
import ui_state from "./ui_state.mjs";
import browser_input_handler from "./input_engine/browser_input.mjs";

export default function (env, html_element, INITIALIZED_HIDDEN = true) {

	const view = (env.ui.main_view = document.createElement("div"));

	env.ui.ui_view = document.createElement("div");
	env.ui.comp_view = document.createElement("div");

	env.ui.setState = function(interfc = env.ui.interface, comp = env.ui.comp, input = env.ui.input){
		env.ui.input = input;
		env.ui.comp = comp;
		interfc.active(comp, input);
	};

	env.ui.setState(
		ui_state(env, env.ui.ui_view, env.ui.comp_view)
			.addController(new ui_component(env, "overlay", "/@ui/basic.html")),
		comp_state(env),
		input_state(env),

	)

	new browser_input_handler(env);

	view.appendChild(env.ui.ui_view);
	view.appendChild(env.ui.comp_view);

	setupMainView(view, INITIALIZED_HIDDEN);
	setupUIView(env.ui.ui_view);
	setupWYSIWYGView(env.ui.comp_view);

	//env.ui.manager = new UI_Manager(env.ui.ui_view, env.ui.comp_view, env);

	//Make sure the Flame Editing Environement is appended to the beginning of the element. 
	html_element.insertBefore(view, html_element.firstChild);
}

function setupMainView(view, INITIALIZED_HIDDEN){
	view.style.backgroundColor = "rgba(255,0,0,0.1)";
	view.style.position = "fixed";
	view.style.width = "100vw";
	view.style.height = "100vh";
	view.style.top = 0;
	view.style.left = 0;
	view.style.padding = 0;
    view.style.margin = 0;
	view.style.display = INITIALIZED_HIDDEN ? "none" : "block";
}

function setupUIView(view){
	view.style.backgroundColor = "rgba(255,0,0,0.1)";
	view.style.position = "fixed";
	view.style.width = "100vw";
	view.style.height = "100vh";
	view.style.top = 0;
	view.style.left = 0;
}

function setupWYSIWYGView(view){
	view.style.display = "block";
	view.style.position = "absolute";
	view.style.width = "0px";
	view.style.height = "0px";
	view.style.transform = "translateZ(0)";
	view.style.background = "color: red";
}
