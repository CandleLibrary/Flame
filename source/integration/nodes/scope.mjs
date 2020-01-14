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
    /*
    */
    prototype.buildExisting = function(element, scope, presets = this.presets, slots = {}, pinned = {}, win = window, css = this.css, FINAL_UPDATE = false) {

        if (this.CHANGED & 3) {
            //IO CHANGE 
            //Attributes
            if (this.CHANGED & 4) {
                let scp = scope;
                for (const s of scope.scopes) {
                    if (s.ast == this) {
                        scp = s;
                    }
                }

                this.replacing_element = element;

                const node = element.parentNode;

                const model = scp.model;

                this.remount(element, scp, presets, slots, pinned);

                //node.replaceChild(scp.ele, element);
                //node.appendChild(element);

                scp.load(model);
               // / scp.reloadFromHTML();

                if (scope !== scp);
                scope.addScope(scp);

                return true;
            }

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

        if(FINAL_UPDATE)
            this.CHANGED = 0;

        return true;
    };

    prototype.remount = function(element, scope, presets, slots, pinned) {
        /* Remove established taps, scopes, ios, and containers */

        for (const tap of scope.taps.values())
            tap.destroy();

        while (scope.scopes[0])
            scope.scopes[0].destroy();

        // Reset element and rebuild.

       element.innerHTML = "";

        if (this.HAS_TAPS)
            this.createRuntimeTaplist(scope);

        scope._model_name_ = this.model_name;
        scope._schema_name_ = this.schema_name;

        //Reset pinned
        pinned = {};

       const ele = element_prototype.mount.call(this, null, scope, presets, slots, pinned);

       return ele;
    };
}