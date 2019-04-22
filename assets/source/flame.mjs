HTMLElement.prototype.wick_node = null;

import { TextFramework, TextIO } from "@candlefw/charcoal";
//Amend the prototype of the HTML

import { UI_Manager } from "./interface/ui_manager";
import { JSManager } from "./js/js_manager";

//CSS
import { CSSManager } from "./css/css_manager";
import { CSSRule } from "./css/wick_css_nodes.mjs";

//HTML
import { HTMLManager } from "./html/html_manager";
import { DocumentManager } from "./document/doc_manager.mjs";

//SOURCE
import { Source } from "./source/source.mjs";

//COMPILER NODES
import { RootNode } from "./wick_compiler_nodes/root.mjs";
import { SVGNode } from "./wick_compiler_nodes/svg.mjs";
import { StyleNode } from "./wick_compiler_nodes/style.mjs";
import { RootText } from "./wick_compiler_nodes/text.mjs";
import { SourceNode } from "./wick_compiler_nodes/source.mjs";
import { SourceContainerNode } from "./wick_compiler_nodes/container.mjs";
import { PackageNode } from "./wick_compiler_nodes/package.mjs";
import { ScriptNode } from "./wick_compiler_nodes/script.mjs";

//Poject system
import { Project } from "./project/project.mjs";
import { StateMachine } from "./project/state_machine.mjs";

//Actions 
import { actions } from "./interface/actions/action.mjs";

//Presets
import { Presets } from "@candlefw/wick";

//URL 
import { URL } from "@candlefw/url";

const DEV = false; //(env.FLAME_DEV) ? !!env.FLAME_DEV.includes("true") : false;
const TEST = false;//(env.FLAME_TEST) ? !!env.FLAME_TEST.includes("true") : false;

class System {
    constructor() {
        this.TEST_MODE = TEST;
        this.docs = new DocumentManager(this);
        this.css = new CSSManager(this.docs, this);
        this.html = new HTMLManager(this.docs);
        this.js = new JSManager(this.docs);
        this.presets = new Presets();
        this.actions = actions;
        this.history = new StateMachine(this);
        this.project = new Project(this);
    }
}

/**
 * @brief Flame exposed object.  
 * @details Contains methods necessary to start a flame session.
 * @return Object
 */
const flame = {
    system : null,

    initOverlayDevEnvironamen:()=>{

    },

    initDedicatedDevEnvironment:()=>{
        //Load page from query into iframe element

        const system = new System();

        flame.system = system;

        StyleNode.prototype.flame_system = system;

        //Clear contents of body and insert flame elements
        document.body.innerHTML = "";

        //Main View Area 
        let va = document.createElement("div");
        va.id = "main_view";
      //  va.classList.add("");

        //UI Group
        let ug = document.createElement("div");
        ug.id = "main_view";
       // ug.classList.add("");


        document.body.appendChild(va)
        document.body.appendChild(ug)

        //const ui_group = document.querySelector("#ui_group");
        //const view_group = document.querySelector("#main_view");

        //if (!ui_group)
        //    throw new Error("`ui_group` element not found in document! Aborting startup.");

        system.ui = new UI_Manager(ug, va, system);
    },

    /*
        Loads a finalized resource (full webpage) into an iframe component. 
        args: 
        - Location of HTML file
        - Horizontal position of component 
        - Vertical position of component
        - If `true`, then the view is centered on this component.
        - If `true`, then the size of the component is set to the same size as the screen, the view is focused on the component
          and the flame environment will be hidden and locked from interaction until the unlock command is given. 
    */
    async loadIFrameComponent(url, x = 0, y = 0,  FOCUS = false, SOLE_FOCUS = false){
        if(!(url instanceof URL))
            return console.error("Expecting instance of CFW URL");

        const system = flame.system;

        //const doc = system.docs.get(system.docs.loadFile(url));
        const comp = await actions.CREATE_VIEW_COMPONENT(system, {url}, x, y);

        if(FOCUS && !SOLE_FOCUS)
            system.ui.focus(comp);
        if(SOLE_FOCUS)  
            system.ui.solo(comp);
    },

    loadComponent(url, x = 0, y = 0, FOCUS = false){

    },

    // Unlocks the dev environment for use. 
    unlock(){

    },

    //Initialize a text editor on element
    initEditor(element) {

        let fw = new TextFramework();
        let io = new TextIO(element);

        io.fw = fw;

        element.addEventListener("mouseup", e => io.onMouseUp(e));
        element.addEventListener("keypress", e => io.onKeyPress(e));
        element.addEventListener("keydown", e => io.onKeyDown(e));
        element.addEventListener("wheel", e => io.onMouseWheel(e));

        return { fw, io };
    },

    URL : URL
};

export default flame;

/* Interface files */
//Project Direcctory
