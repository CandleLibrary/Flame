import whind from "@candlefw/whind";

export default function(prototype, env) {
    const element_prototype = prototype.__proto__;

    prototype.createElement = function(scope) {
        if (!scope.ele || this.getAttribute("element")) {

            const ele = element_prototype.createElement.call(this);

            if (scope.ele) {
                scope.ele.appendChild(ele);
                scope.ele = ele;
            }

            return ele;
        }

        return scope.ele;
    };

    prototype.buildExisting = function(element, source, presets, taps, win = window, css) {

        if (true && this.CHANGED !== 0) {
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

            if (true || this.CHANGED & 2) {
                //rebuild children
                let child_elements = element.childNodes;

                for (let i = 0; i < this.children.length; i++) {
                    const node = this.children[i];
                    if (node.buildExisting(child_elements[i], source, presets, taps, element, win, this.css)) i++;
                }
            }
        }

        return true;
    };
}