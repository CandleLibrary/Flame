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

    prototype.buildExisting = function(element, scope, presets = this.presets, slots = {}, pinned = {}, win = window, css = this.css) {

        if (true && this.CHANGED !== 0) {
            //IO CHANGE 
            //Attributes
            if (this.CHANGED & 4) {

                this.replacing_element = element;

                const node = element.parentNode;

                const model = scope.model 

                this.remount(element, scope, presets, slots, pinned);

                node.appendChild(element);

                scope.load(model);

                scope.reloadFromHTML();

                return true;
            }

            if (this._merged_)
                this._merged_.buildExisting(element, source, presets, taps);

            if (true || this.CHANGED & 2) {
                //rebuild children
                const children = (element) ? element.childNodes : [];

                for (let i = 0; i < this.children.length; i++) {
                    const node = this.children[i];
                    node.buildExisting(element, scope, presets, slots, pinned, win, css);
                }
            }
        }

        return true;
    };

    prototype.remount = function(element, scope, presets, slots, pinned){

        scope.purge();

        element.innerHTML = "";

        if (this.HAS_TAPS)
            this.createRuntimeTaplist(scope)

        scope._model_name_ = this.model_name;
        scope._schema_name_ = this.schema_name;

        //Reset pinned
        pinned = {};

        return element_prototype.mount.call(this, null, scope, presets, slots, pinned);
    }
}
