let RootNode = require("wick").core.source.compiler.nodes.root;

let id = 0;

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

// Rebuild all sources relying on this node
RootNode.prototype.rebuild = function() {
    if (this.observing_sources) {
        for (let i = 0; i < this.observing_sources.length; i++)
            this.observing_sources[i].rebuild();
        this.resetRebuild();
    } else if (this.par) 
        this.par.rebuild();
};

RootNode.prototype.build_existing = function(element, source, presets, taps) {
    if (this.CHANGED !== 0) {
        //IO CHANGE 
        //Attributes

        if (this.CHANGED & 1) {
            //redo IO
            for (let i = 0, l = this._bindings_.length; i < l; i++){
                this._bindings_[i].binding._bind_(source, [], taps, element, this._bindings_[i].name);
            }
        }

        if (this.CHANGED & 2) {
            //rebuild children
            let children = element.childNodes;
            console.log(children, this);

            for(let i = 0, node = this.fch; node || i < children.length; i++, node = this.getN(node)){
                let child = children[i];
                console.log(child);
                node.build_existing(child, source, presets, taps);
            }
        }
    }
};

RootNode.prototype.setRebuild = function(child = false) {
    if (child) {
        this.CHANGED |= 2;
    } else {
        this.CHANGED |= 1;
    }
    
    if (this.par) 
    	this.par.setRebuild(true);
};

RootNode.prototype.resetRebuild = function() {
    this.CHANGED = 0;

    for (let node = this.fch; node; node = this.getN(node))
        node.resetRebuild();
};

export { RootNode };