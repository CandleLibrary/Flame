export default function(prototype, env) {
    prototype.rebuild = function() {
        console.warn("IGNORED!!!")
        return
        this.ast.buildExisting(this.ele, this, this.presets, this.taps, null, this.window);
    };
}
