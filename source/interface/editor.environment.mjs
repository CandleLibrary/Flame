export default function (env, html_element, INITIALIZED_HIDDEN = true) {

	const view = env.ui.main_view;

	setupMainView(view, INITIALIZED_HIDDEN);

	//Make sure the env is appended to the beginning of the element. 
	html_element.insertBefore(view, html_element.firstChild);
}



function setupMainView(view, INITIALIZED_HIDDEN){
	view.style.backgroundColor = "rgba(255,0,0,0.1)";
	view.style.position = "fixed";
	view.style.width = "100vw";
	view.style.height = "100vh";
	view.style.top = 0;
	view.style.left = 0;
	view.style.display = INITIALIZED_HIDDEN ? "none" : "block";
}