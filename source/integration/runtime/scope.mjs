import observer from "@candlefw/observer";

export default function(prototype, env) {
    observer("updatedScope", prototype);

    prototype.rebuild = function() {
        this.ast.buildExisting(this.ele, this, this.presets, this.taps, {}, this.window);
        this.loadCSS();
    };

    prototype.reloadFromHTML = function(){
        if(this.parent)
            this.parent.updatedScope();
    };

    prototype.loadCSS = function(element = this.ele, CSS = this.css) {

        for (const css of CSS) {

            const rules = css.getApplicableRules(element);

            element.style = ("" + rules).slice(1, -1) + "";

            css.addObserver(this);
        }

        for(const ele of Array.prototype.slice.apply(element.children))
            this.loadCSS(ele, CSS);
    };

    prototype.updatedCSS = function() {
        this.rebuild();
        env.ui.interface.update();
    };
}
