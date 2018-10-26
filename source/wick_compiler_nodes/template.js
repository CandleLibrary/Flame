import wick from "wick";

let SourceTemplateNode = wick.core.source.compiler.nodes.template;

let Lexer = wick.core.lexer;

SourceTemplateNode.prototype.buildExisting = function(element, source, presets, taps) {
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

export {SourceTemplateNode}