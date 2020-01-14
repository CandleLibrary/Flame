import whind from "@candlefw/whind";

export default function(prototype, env) {

    /**
     * This node allows an existing element to be removed from DOM trees that were created from the Wick AST. 
     */
    class DeleteNode extends prototype.constructor {

        buildExisting(element) {
            element.parentElement.removeChild(element);
            return false;
        }

        resetRebuild() {

            let nxt = this.nxt;

            if (this.parent)
                this.parent.removeChild(this);

            this.nxt = nxt;
        }
    }

    let id = 0;

    prototype.constructor.id = 0;

    prototype.ReparseConstructor = prototype.constructor;

    const loadAndParseUrl = prototype.loadAndParseUrl;

    prototype.addAttribute = function(name, value) {
        let attribute = new env.wick.nodes.attribute([name, null, value + ""]);
        this.attribs.set(name, attribute);
    };

    prototype.loadAndParseUrl = async function(e) {
        return loadAndParseUrl.call(this, e);
    };

    prototype.createElement = function(presets, source) {
        const element = document.createElement(this.tag);
        element.wick_source = source;
        element.wick_node = this;
        element.wick_id = id++;
        return element;
    };

    prototype.setScope = function(scope) {

        if (!this.observing_scopes)
            this.observing_scopes = [];

        this.observing_scopes.push(scope);

        scope.ast = this;
    };

    prototype.reparse = function(text) {
        text = text.substring(text.indexOf("<"), text.lastIndexOf(">") + 1);

        return env.wick(text).pending.then(comp => {

            const ast = comp.ast;

            for (const name in ast)
                this[name] = ast[name];

            this.BUILT = true;

            this.prepRebuild(false, true);
            this.rebuild();
        }).catch(e => {
            return e;
        });
    };

    // Rebuild all sources relying on this node
    prototype.rebuild = function(win = window) {

        if (this.observing_scopes) {
            for (let i = 0, l = this.observing_scopes.length; i < l; i++) {
                try {
                    this.observing_scopes[i].rebuild(i == l-1); // Let the rebuild method know it's time to cleanup after the last observing scope is updated. 
                } catch (e) {
                    console.error(e);
                }
            }
            this.resetRebuild();
        } else if (this.parent)
            this.parent.rebuild(win);
    };

    prototype.extract = function() {
        if (this.parent)
            this.parent.replace(this, new DeleteNode());
    };


    prototype.buildExisting = function(element, scope, presets = this.presets, slots = {}, pinned = {}, win = window, css = this.css, FINAL_UPDATE = false) {

        if (this.CHANGED & 3) {

            if (element)
                element.style.cssText = "";

            //this.linkCSS(css, win);
            //IO CHANGE 
            //Attributes
            if (this.CHANGED & 4) {

                let span = document.createElement("span");

                this.mount(span, scope, presets, slots, pinned);

                let ele = span.firstChild;

                if (this.CHANGED & 8) {
                    if (element) 
                        element.parentNode.insertBefore(ele, element);
                     else
                        parent_element.appendChild(ele);
                } else 
                    element.parentNode.replaceChild(ele, element);
            
            } else {

                if (this._merged_)
                    this._merged_.buildExisting(element, source, presets, taps);

                if (this.CHANGED & 2) {
                    //rebuild children

                    const children = (element) ? element.childNodes : [];

                    for (let i = 0, j = 0; i < this.children.length; i++) {
                        const node = this.children[i];

                        if (node.buildExisting(children[j], scope, presets, slots, pinned, win, css, FINAL_UPDATE))
                            j++;

                    }
                }
            }
        }

        if(FINAL_UPDATE)
            this.CHANGED = 0;

        return true;
    };

    prototype.prepRebuild = function(child = false, REBUILT = false, INSERTED = false) {

        this.CHANGED =
            this.CHANGED |  
            (!child) |                          //1 : Own element needs to be updated 
            ((!!child) << 1) |                  //2 : A child node needs to updated
            ((!!(REBUILT || INSERTED)) << 2) |  //4 : Own element needs to rebuilt or have a sub element inserted
            ((!!INSERTED) << 3);                //8 : Own element needs to be inserted as a new element

        if (this.parent)
            this.parent.prepRebuild(true);
        else if (this.merges)
            for (let i = 0; i < this.merges.length; i++)
                this.merges.prepRebuild(true);
    };

    prototype.resetRebuild = function() {
        this.CHANGED = 0;

        if (!this.parent)
            this.updated();

        for (let node = this.fch; node; node = this.getNextChild(node))
            node.resetRebuild();
    };

    prototype.build = prototype.mount;

    prototype.mount = function(element, scope, presets = this.presets, slots = {}, pinned = {}) {
        this.BUILT = true;
        return this.build(element, scope, presets, slots, pinned);
    };

    prototype._mergeComponent_ = function() {
        const component = this._presets_.components[this.tag];

        if (component) {

            this._merged_ = component;

            if (!component.merges)
                component.merges = [];

            component.merges.push(this);
        }
    };

    prototype.addObserver = function(observer) {
        if (!this.observers)
            this.observers = [];
        this.observers.push(observer);
    };

    prototype.addView = function(view) {
        if (!this.views)
            this.views = [];
        this.views.push(view);
        view._model_ = this;
    };

    prototype.removeObserver = function(observer) {
        for (let i = 0; i < this.observers.length; i++)
            if (this.observers[i] == observer) return this.observers.splice(i, 1);
    };

    prototype.removeView = function(view) {
        for (let i = 0; i < this.views.length; i++)
            if (this.views[i] == view) return this.views.splice(i, 1);
    };

    prototype.updated = function() {
        if (this.observers)
            for (let i = 0; i < this.observers.length; i++)
                this.observers[i].updatedWickASTTree(this);

        if (this.views)
            for (let i = 0; i < this.views.length; i++)
                this.views[i].update(this);

    };

    prototype.BUILT = false;
}