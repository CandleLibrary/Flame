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

const env = require('electron').remote.process.env;
const DEV = (env.FLAME_DEV) ? !!env.FLAME_DEV.includes("true") : false;
const TEST = (env.FLAME_TEST) ? !!env.FLAME_TEST.includes("true") : false;

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
    init: () => {

        //Get testing and development flags. 
        if (TEST) require("chai").should();

        const system = new System();

        StyleNode.prototype.flame_system = system;

        //connect to the ui_group element
        const ui_group = document.querySelector("#ui_group");
        const view_group = document.querySelector("#main_view");

        if (!ui_group)
            throw new Error("`ui_group` element not found in document! Aborting startup.");

        system.ui = new UI_Manager(ui_group, view_group, system);

        if (DEV && !TEST) {
            //Load in the development component.

            let comp_path = require("path").join(process.cwd(), "assets/components/test.html");
            let css_path = require("path").join(process.cwd(), "assets/components/css/test.css");
            let doc = system.docs.get(system.docs.loadFile(comp_path));
            let css = system.docs.get(system.docs.loadFile(css_path));

            let comp = actions.CREATE_COMPONENT(system, doc, 200, 200);
           // actions.CREATE_COMPONENT(system, css, 0, 200);
            
            window.flame = flame;

            //Activate its CSS window.
            setTimeout(
                ()=>{
            actions.CREATE_COMPONENT(system, comp, 0, 200);
                    
                },200)

        } else if (TEST) {
            //Load in HTML test runner
            const test_iframe = document.createElement("iframe");
            test_iframe.src = "../../test/chromium/test.html";

            test_iframe.width = "100%";
            test_iframe.height = "100%";

            test_iframe.style.position = "absolute";
            test_iframe.style.left = 0;
            test_iframe.style.top = 0;
            test_iframe.style.zIndex = 100000; // Keep on top
            test_iframe.style.backgroundColor = "rgba(255,255,255,0.90)"
            test_iframe.style.border = "solid 1px black";
            test_iframe.style.borderRadius = "5px";

            document.body.appendChild(test_iframe);

            test_iframe.onload = (e) => {
                test_iframe.contentWindow.require = require;
                test_iframe.contentWindow.fs = require("fs");
                test_iframe.contentWindow.path = require("path");
                test_iframe.contentWindow.run(system, require("chai"));
            };
        }

        //Connect to server or local file system and load projects
        //Check to see if there recently worked on project to open. 
        //Load Poject.
        //If user preference allows, open the Splash screen modal. 
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
    }
};

export default flame;

/* Interface files */
//Project Direcctory
