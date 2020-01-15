export default function(prototype, element_prototype, env) {
    prototype.createElement = element_prototype.createElement;
    prototype.setSource = element_prototype.setSource;
    // Rebuild all sources relying on this node
    prototype.rebuild = element_prototype.rebuild;
    prototype.buildExisting = function(element, scope, presets = this.presets, slots = {}, pinned = {}, win = window, css = this.css) {
        if (true || this.CHANGED !== 0) {

            //IO CHANGE 
            //Attributes
            if (this.CHANGED & 4) {

                let span = document.createElement("span");

                this.mount(span, scope, presets, slots, pinned);

                let ele = span.firstChild;

                if (this.CHANGED & 8) {
                    if (element) {
                        element.parenteElement.insertBefore(ele, element);
                    } else
                        parent_element.appendChild(ele);
                    return true;
                } else {

                    element.parentElement.replaceChild(ele, element);
                    return true;
                }

            }
        }

        return true;
    };
    prototype.prepRebuild = element_prototype.prepRebuild;
    prototype.resetRebuild = element_prototype.resetRebuild;
    prototype.destruct = prototype.updated = function() {};
}
