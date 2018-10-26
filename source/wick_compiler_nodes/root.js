import wick from "wick";

let RootNode = wick.core.source.compiler.nodes.root;
let SourceNode = wick.core.source.compiler.nodes.source;
let Lexer = wick.core.lexer;
let id = 0;

SourceNode.prototype.createElement = function(presets, source) {
    let element = document.createElement(this.getAttribute("element") || "div");
    element.wick_source = source;
    element.wick_node = this;
    element.wick_id = id++;
    return element;
};

RootNode.prototype.createElement = function(presets, source) {

    let element = document.createElement(this.tag);
    element.wick_source = source;
    element.wick_node = this;
    element.wick_id = id++;

    return element;
};

RootNode.prototype.setSource = function(source) {

    if (!this.observing_sources)
        this.observing_sources = [];

    this.observing_sources.push(source);

    source.ast = this;
};

RootNode.prototype.reparse = function(text, element) {
    let lex = Lexer(text);
    let Root = new RootNode();

    Root.par = this.par;

    let promise = Root._parse_(Lexer(text), false, false, this.par);

    promise.then(node => {

        node.par = null;

        if(this.par)
            this.par.replace(this, node);
        
        node.setRebuild(false, true);
        node.rebuild();
        //replace this node with the new one. 
    });

    return promise;
};

// Rebuild all sources relying on this node
RootNode.prototype.rebuild = function() {

    if (!this.par)
        this.updated();

    if (this.observing_sources) {
        this._linkCSS_();
        for (let i = 0; i < this.observing_sources.length; i++)
            this.observing_sources[i].rebuild();
        this.resetRebuild();
    } else if (this.par)
        this.par.rebuild();
};

RootNode.prototype.buildExisting = function(element, source, presets, taps) {
    if (true || this.CHANGED !== 0) {
        //IO CHANGE 
        //Attributes
        if (this.CHANGED & 4) {

            let span = document.createElement("span");

            this._build_(span, source, presets, [], taps, {});

            let ele = span.firstChild;

            element.parentElement.replaceChild(ele, element);

            return true;
        }

        if (this._merged_)
            this._merged_.buildExisting(element, source, presets, taps);

        if (true || this.CHANGED & 1) {
            //redo IOs that have changed (TODO)
            for (let i = 0, l = this._bindings_.length; i < l; i++) {
                this._bindings_[i].binding._bind_(source, [], taps, element, this._bindings_[i].name);
            }
        }

        if (true || this.CHANGED & 2) {
            //rebuild children
            let children = element.childNodes;
            for (let i = 0, node = this.fch; node; node = this.getN(node)) {
                let child = children[i];
                if (node.buildExisting(child, source, presets, taps)) i++;
            }
        }
    }

    return true;
};

RootNode.prototype.setRebuild = function(child = false, REBUILT = false) {
    if (child) {
        this.CHANGED |= 2;
    } else {
        this.CHANGED |= 1;
    }

    if (REBUILT) {
        this.CHANGED |= 4;
    }

    if (this.par)
        this.par.setRebuild(true);
    else if (this.merges) {
        for (let i = 0; i < this.merges.length; i++)
            this.merges.setRebuild(true);
    }
};

RootNode.prototype.resetRebuild = function() {
    this.CHANGED = 0;

    for (let node = this.fch; node; node = this.getN(node))
        node.resetRebuild();
};

RootNode.prototype.build = RootNode.prototype._build_;
RootNode.prototype._build_ = function(element, source, presets, errors, taps, statics) {
    return this.build(element, source, presets, errors, taps, statics);
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
            let lexer = wick.core.lexer(text);
            return this._parseRunner_(lexer, true, IGNORE_TEXT_TILL_CLOSE_TAG, this);
        }).catch((e) => {
            console.log(e);
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

RootNode.prototype.removeObserver = function(observer) {
    for (let i = 0; i < this.observers.length; i++)
        if (this.observers[i] == observer) return this.observers.splice(i, 1);
};

RootNode.prototype.updated = function() {
    if (this.observers.length > 0)
        for (let i = 0; i < this.observers.length; i++)
            this.observers[i].updatedWickASTTree(this);
};
export { RootNode };