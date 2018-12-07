HTMLElement.prototype.wick_node = null;

import {TextFramework, TextIO} from "@candlefw/charcoal";
//Amend the prototype of the HTML

import { UI_Manager } from "./interface/ui_manager";
import { JSManager } from "./js/js_manager";

//CSS
import { CSSManager } from "./css/css_manager";
import { CSSRule } from "./css/wick_css_nodes.js";

//HTML
import { HTMLManager } from "./html/html_manager";
import { DocumentManager } from "./document/doc_manager";

//SOURCE
import { Source } from "./source/source.js";

//COMPILER NODES
import { RootNode } from "./wick_compiler_nodes/root.js";
import { SVGNode } from "./wick_compiler_nodes/svg.js";
import { StyleNode } from "./wick_compiler_nodes/style.js";
import { RootText } from "./wick_compiler_nodes/text.js";
import { SourceNode } from "./wick_compiler_nodes/source.js";
import { SourceTemplateNode } from "./wick_compiler_nodes/template.js";
import { PackageNode } from "./wick_compiler_nodes/package.js";
import { ScriptNode } from "./wick_compiler_nodes/script.js";

//Poject system
import { Project } from "./project/project";

//Actions 
import {actions} from "./interface/actions/action";

//Presets
import {Presets} from "@candlefw/wick";


class System {
    constructor() {
        this.docs = new DocumentManager(this);
        this.css = new CSSManager(this.docs);
        this.html = new HTMLManager(this.docs);
        this.js = new JSManager(this.docs);
        this.presets = new Presets();
        this.actions = actions;
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
        const env = require('electron').remote.process.env;
        //Get testing and development flags. 
        
        const DEV = (env.FLAME_DEV) ? !!env.FLAME_DEV.includes("true") : false;
        const TEST = (env.FLAME_TEST) ? !!env.FLAME_TEST.includes("true") : false;

        if(TEST)
            require("chai").should();
        
        let system = new System();

        StyleNode.prototype.flame_system = system;

        //connect to the ui_group element
        const ui_group = document.querySelector("#ui_group");
        const view_group = document.querySelector("#main_view");

        if (!ui_group)
            throw new Error("`ui_group` element not found in document! Aborting startup.");

        system.ui = new UI_Manager(ui_group, view_group, system);
        
        if(DEV && !TEST){
            //Load in the development component.
            let path = require("path").join(process.cwd(),"assets/components/test.html");
            let doc = system.docs.get(system.docs.load(path));
            actions.CREATE_COMPONENT(system, doc, {x:200, y:200});
            window.flame = flame;
        }else if(TEST){
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
            }
        }
        
        //Connect to server or local file system and load projects
        //Check to see if there recently worked on project to open. 
          //Load Poject.
        //If user preference allows, open the Splash screen modal. 
    },

     //Initialize a text editor on element
    initEditor(element){ 
       
        let fw = new TextFramework();
        let io = new TextIO(element);
        
        io.fw = fw;

        element.addEventListener("mouseup",e => io.onMouseUp(e));
        element.addEventListener("keypress",e=> io.onKeyPress(e));
        element.addEventListener("keydown",e=> io.onKeyDown(e));
        element.addEventListener("wheel",e=> io.onMouseWheel(e));

        return {fw, io};
    }
};
export default flame;

/* Interface files */
//Project Direcctory