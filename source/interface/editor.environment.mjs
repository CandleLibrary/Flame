import UI_overlay_controller from "../component/ui_overlay_controller.mjs";
import UI_toolbar_controller from "../component/ui_toolbar_controller.mjs";
import UI_hover_controller from "../component/ui_hover_controller.mjs";
import UI_header_controller from "../component/ui_header_controller.mjs";
import UI_html_controller from "../component/ui_html_controller.mjs";
import comp_state from "./ui_comp_state.mjs";
import ui_state from "./ui_state.mjs";
import Browser_input_engine from "./input_engine/browser_input.mjs";
import Browser_Input_Handler from "./input_handler/default.mjs";
import css_integrations from "../integration/css.integration.mjs";
import createEditorButton from "./editor_button.mjs";

export default function(env, html_element, INITIALIZED_HIDDEN = true) { 

    const view = (env.ui.main_view = document.createElement("div"));

    env.ui.ui_view = document.createElement("div");
    env.ui.comp_view = document.createElement("div");

    view.appendChild(env.ui.comp_view);
    view.appendChild(env.ui.ui_view);

    setupMainView(view, INITIALIZED_HIDDEN);
    setupUIView(env.ui.ui_view);
    setupWYSIWYGView(env.ui.comp_view);

    env.ui.input = new Browser_Input_Handler(env);
    env.ui.input_engine = new Browser_input_engine(env, env.ui.ui_view, env.ui.comp_view);

     //Create an activator button that will allow the flame environment to open and close
    createEditorButton(html_element, env);

    env.ui.setState = function(interfc = env.ui.interface, comp = env.ui.comp) {
        env.ui.comp = comp;
        interfc.activate(comp);
    };

    env.ui.setHover = function(element = null, component){
        env.ui.interface.hover(element, component);
    };

    env.ui.setState(
        ui_state(env, env.ui.ui_view, env.ui.comp_view.attachShadow({ mode: 'open' }))
        .addController(new UI_hover_controller(env, "/@ui/hover.html"))
        .addController(new UI_overlay_controller(env, "/@ui/basic.html"))
        .addController(new UI_header_controller(env, "/@ui/header_toolbar.html"))
        //.addController(new UI_toolbar_controller(env, "/@ui/general_toolbar.html"))
        .addController(new UI_html_controller(env, "/@ui/html_toolbar.html"))
        ,comp_state(env)
    );

    //Make sure the Flame Editing Environement is appended to the beginning of whatever element it is passed. 
    html_element.insertBefore(view, html_element.firstChild);
}

function setupMainView(view, INITIALIZED_HIDDEN) {
    view.style.backgroundColor = "rgba(250,250,250,1)";
    view.style.position = "fixed";
    view.style.width = "100vw";
    view.style.height = "100vh";
    view.style.top = 0;
    view.style.left = 0;
    view.style.padding = 0;
    view.style.margin = 0;
    view.style.display = INITIALIZED_HIDDEN ? "none" : "block";
}

function setupUIView(view) {
    //view.style.backgroundColor = "rgba(255,0,0,0.1)";
    view.style.position = "fixed";
    view.style.width = 0;
    view.style.height =0;
    view.style.top = 0;
    view.style.left = 0;
}

function setupWYSIWYGView(view) {
    //view.id = "comp_view";
    view.style["transformOrigin"] = "0 0";
    view.style.display = "block";
    view.style.position = "absolute";
    view.style.width = "0px";
    view.style.height = "0px";    
    view.style.background = "color: red";
}
