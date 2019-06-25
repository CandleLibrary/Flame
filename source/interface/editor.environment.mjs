import UI_Manager from "./ui_manager.mjs";

export default function (env, html_element, INITIALIZED_HIDDEN = true) {

	const view = (env.ui.main_view = document.createElement("div"));

	env.ui.ui_view = document.createElement("div");
	env.ui.wys_view = document.createElement("div");

	view.appendChild(env.ui.ui_view);
	view.appendChild(env.ui.wys_view);

	setupMainView(view, INITIALIZED_HIDDEN);
	setupUIView(env.ui.ui_view);
	setupWYSIWYGView(env.ui.wys_view);

	env.ui.manager = new UI_Manager(env.ui.ui_view, env.ui.wys_view, env);

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
