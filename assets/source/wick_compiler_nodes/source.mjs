import {SourceNode} from "@candlefw/wick";

SourceNode.prototype.buildExisting = function(element, source, presets, taps, win = window, css) {
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
            for (let i = 0, l = this.bindings.length; i < l; i++) {
                this.bindings[i].binding._bind_(source, [], taps, element, this.bindings[i].name);
            }
        }

        if (true || this.CHANGED & 2) {
            //rebuild children
            let children = element.childNodes;
            for (let i = 0, node = this.fch; node; node = this.getNextChild(node)) {
                let child = children[i];
                if (node.buildExisting(child, source, presets, taps, null, win, this.css)) i++;
            }
        }
    }

    return true;
};

export {SourceNode}