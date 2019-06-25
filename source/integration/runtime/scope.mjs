export default function(prototype, env) {
    prototype.rebuild = function() {
        this.ast.buildExisting(this.ele, this, this.presets, this.taps, null, this.window);
    };
}
