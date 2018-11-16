import wick from "wick";

let Source = wick.core.source.constructor;

Source.prototype.rebuild = function (){
	this.ast.buildExisting(this.ele, this, this.presets, this.taps,null,  this.window);
};

export {Source};