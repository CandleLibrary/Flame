import {RootNode, SourceNode} from "@candlefw/wick";
import whind from "@candlefw/whind";

let id = 0;

RootNode.id = 0;


SourceNode.prototype.createElement = function(presets, source) {
    let element = document.createElement(this.getAttribute("element") || "div");
    element.wick_source = source;
    element.wick_node = this;
    element.wick_id = id++;
    return element;
};

RootNode.prototype.ReparseConstructor = RootNode;

RootNode.prototype.createElement = function(presets, source) {
    const element = document.createElement(this.tag);
    element.wick_source = source;
    element.wick_node = this;
    element.wick_id = RootNode.id++;
    return element;
};

RootNode.prototype.setSource = function(source) {

    if (!this.observing_sources)
        this.observing_sources = [];

    this.observing_sources.push(source);

    source.ast = this;
};

RootNode.prototype.reparse = function(text) {

    const Root = new this.ReparseConstructor();

    Root.par = this.par;

    const promise = Root.parse(whind(text), false, false, this.par);

    promise.then(node => {
        node.par = null;

        if (this.par)
            this.par.replace(this, node);
        node.BUILT = true;
        node.prepRebuild(false, true);
        node.rebuild();
    });

    return promise;
};

// Rebuild all sources relying on this node
RootNode.prototype.rebuild = function(win = window) {


    if (this.observing_sources) {
        
        for (let i = 0; i < this.observing_sources.length; i++) {
            try {
                this.observing_sources[i].rebuild(this.observing_sources[i].window);
            } catch (e) {
                console.error(e);
            }
        }
        this.resetRebuild();
    } else if (this.par)
        this.par.rebuild(win);
};

RootNode.prototype.extract = function() {
    if (this.par)
        this.par.replace(this, new DeleteNode());
};


RootNode.prototype.buildExisting = function(element, source, presets, taps, parent_element, win = window, css = this.css) {
    
    if (true || this.CHANGED !== 0) {

        if(element)
            element.style.cssText = "";

        this.linkCSS(css, win);
        //IO CHANGE 
        //Attributes
        if (this.CHANGED & 4) {
            
            let span = document.createElement("span");

            this._build_(span, source, presets, [], taps, {});

            let ele = span.firstChild;

            if (this.CHANGED & 8) {
                if (element) {
                    element.parentElement.insertBefore(ele, element);
                } else
                    parent_element.appendChild(ele);
                return true;
            } else {

                element.parentElement.replaceChild(ele, element);
                return true;
            }

        }

        if (this._merged_)
            this._merged_.buildExisting(element, source, presets, taps);

        if (true || this.CHANGED & 1) {
            //redo IOs that have changed (TODO)
            for (let i = 0, l = this.bindings.length; i < l; i++) {
                this.bindings[i].binding._bind_(source, [], taps, element, this.bindings[i].name);
            }
        }

        if (true || this.CHANGED & 2) {
            //rebuild children

            const children = (element) ? element.childNodes : [];

            for (let i = 0, node = this.fch; node; node = this.getNextChild(node)) 
                if (node.buildExisting(children[i], source, presets, taps, element, win)) i++;
        }
    }

    return true;
};

RootNode.prototype.prepRebuild = function(child = false, REBUILT = false, INSERTED = false) {
    if (child) {
        this.CHANGED |= 2;
    } else {
        this.CHANGED |= 1;
    }

    if (REBUILT) {
        this.CHANGED |= 4;
    }

    if (INSERTED) {
        this.CHANGED |= 12;
    }

    if (this.par)
        this.par.prepRebuild(true);
    else if (this.merges) {
        for (let i = 0; i < this.merges.length; i++)
            this.merges.prepRebuild(true);
    }
};

RootNode.prototype.resetRebuild = function() {
    this.CHANGED = 0;

    if (!this.parent)
        this.updated();

    for (let node = this.fch; node; node = this.getNextChild(node))
        node.resetRebuild();
};

RootNode.prototype._build_ = RootNode.prototype.build;
RootNode.prototype.build = function(element, source, presets, errors, taps, statics) {
    this.BUILT = true;
    return this._build_(element, source, presets, errors, taps, statics);
};


RootNode.prototype._processFetchHook_ = function(lexer, OPENED, IGNORE_TEXT_TILL_CLOSE_TAG, parent, url) {

    let path = this.url.path,
        CAN_FETCH = true;

    //make sure URL is not already called by a parent.
    while (parent) {
        if (parent.url && parent.url.path == path) {
            console.warn(`Preventing recursion on resource ${this.url.path}`);
            CAN_FETCH = false;
            break;
        }
        parent = parent.par;
    }

    if (CAN_FETCH) {
        return this.url.fetchText().then((text) => {
            let lexer = whind(text);
            return this._parseRunner_(lexer, true, IGNORE_TEXT_TILL_CLOSE_TAG, this);
        }).catch((e) => {
            console.error(e);
        });
    }
    return null;
};


RootNode.prototype._mergeComponent_ = function() {
    let component = this._presets_.components[this.tag];

    if (component) {

        this._merged_ = component;

        if (!component.merges)
            component.merges = [];

        component.merges.push(this);
    }
};



RootNode.prototype.addObserver = function(observer) {
    if (!this.observers)
        this.observers = [];
    this.observers.push(observer);
};

RootNode.prototype.addView = function(view) {
    if (!this.views)
        this.views = [];
    this.views.push(view);
    view._model_ = this;
};

RootNode.prototype.removeObserver = function(observer) {
    for (let i = 0; i < this.observers.length; i++)
        if (this.observers[i] == observer) return this.observers.splice(i, 1);
};

RootNode.prototype.removeView = function(view) {
    for (let i = 0; i < this.views.length; i++)
        if (this.views[i] == view) return this.views.splice(i, 1);
};

RootNode.prototype.updated = function() {
    if (this.observers)
        for (let i = 0; i < this.observers.length; i++)
            this.observers[i].updatedWickASTTree(this);

    if (this.views)
        for (let i = 0; i < this.views.length; i++)
            this.views[i].update(this);

};

RootNode.prototype.BUILT = false;

export {
    RootNode
};

/**
 * This node allows an existing element to be removed from DOM trees that were created from the Wick AST. 
 */
class DeleteNode extends SourceNode {
    buildExisting(element) {
        element.parentElement.removeChild(element);
        return false;
    }

    resetRebuild() {

        let nxt = this.nxt;
        if (this.par)
            this.par.remC(this);
        this.nxt = nxt;
    }
}
