import wick from "@galactrax/wick";

import {TextFramework, TextIO} from "@galactrax/charcoal";

//Amend the prototype of the HTML
HTMLElement.prototype.wick_node = null;

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
import { Script } from "./wick_compiler_nodes/script.js";

//Poject system
import { Project } from "./project/project";

//Actions 
import {actions} from "./interface/actions/action";


class System {
    constructor() {
        this.doc_man = new DocumentManager(this);
        this.css = new CSSManager(this.doc_man);
        this.html = new HTMLManager(this.doc_man);
        this.js = new JSManager(this.doc_man);
        this.presets = wick.core.presets();
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
        //Get testing and development flags. 
        const DEV = !!require('electron').remote.process.env.FLAME_DEV;
        const TEST = !!require('electron').remote.process.env.FLAME_TEST;

        let system = new System();

        StyleNode.prototype.flame_system = system;

        //connect to the ui_group element
        const ui_group = document.querySelector("#ui_group");
        const view_group = document.querySelector("#main_view");

        if (!ui_group)
            throw new Error("`ui_group` element not found in document! Aborting startup.");

        const ui_man = new UI_Manager(ui_group, view_group, system);
        
        system.ui = ui_man;


        if(DEV){
            //Load in the development component.
            let path = require("path").join(process.cwd(),"assets/components/test.html");
            let doc = system.doc_man.get(system.doc_man.load(path));
            actions.CREATE_COMPONENT(system, doc, {x:200, y:200});
            window.flame = flame;
        }

        if(TEST){
            const test = require("../../test/client_test.js")(system);
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