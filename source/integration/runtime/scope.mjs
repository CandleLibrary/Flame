export default function(prototype, env) {
    prototype.rebuild = function() {
        this.ast.buildExisting(this.ele, this, this.presets, this.taps, null, this.window);
        this.loadCSS();
    };

    prototype.loadCSS = function(element = this.ele) {

        for (const css of this.css) {

            const rules = css.getApplicableRules(element);

            element.style = ("" + rules).slice(1, -1) + "";

            css.addObserver(this);
        }

        Array.prototype.slice.apply(element.children).forEach(child => this.loadCSS(child));
    }

    prototype.updatedCSS = function(){
    	console.log("aaa")
    	this.rebuild();
    }
}
