let Source = require("wick").core.source.constructor;

Source.prototype.rebuild = function (){
	this.ast.buildExisting(this.ele, this, this.presets, this.taps);
};

export {Source};