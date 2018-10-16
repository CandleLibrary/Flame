let Source = require("wick").core.source.constructor;

Source.prototype.rebuild = function (){
	this.ast.build_existing(this.ele, this, this.presets, this.taps);
};

export {Source};