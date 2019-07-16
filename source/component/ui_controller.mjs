//import wick from "@candlefw/wick";

import Component from "./component";
/**
 * This module is responsible for storing, updating, and caching compents. 
 * In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
 * Any associated stylesheets are managed through this componnent. 
 */
export default class ui_controller extends Component {

    constructor(env, component_path) {

        super(env);

        if(component_path){
            const doc = env.data.docs.get(env.data.docs.loadFile(component_path));

            if (doc) 
                doc.bind(this);
        }
        
        this.frame.classList.add("ui");

        this.pkg = null;

        this.name = component_path;

        this.env = env;
        this.x = 0;
        this.y = 0;

        this.LOADED = false;
        
    }

    documentReady(ast) {

        if (this.ast) {
            //Already have source, just need to rebuild with new tree. 
            this.scope.ast = ast;
            this.rebuild();
        } else {
            this.ast = ast;
            this.scope = this.ast.mount();
            this.ast.setScope(this.scope);
            //let shadow = this.frame.attachShadow({ mode: 'open' });
            this.frame.appendChild(this.scope.ele);
            this.frame.component = this;
            this.scope.load();
            this.scope.css.forEach(css => this.local_css.push(css));
        }

        this.scope.window = this.window;
        this.rebuild();

        return true;
    }

    set(data) {
        this.mgr.update({
            target: data
        });
    }

    load(doc) {
        doc.bind(this);
    }

    mount(element) {
        if (this.frame.parentNode != element)
            element.appendChild(this.frame);
    }

    get type(){
        return "toolbar";
    }

    unmount() {}

}


