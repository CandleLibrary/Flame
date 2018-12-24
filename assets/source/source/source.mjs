import {Source} from "@candlefw/wick";

Source.prototype.rebuild = function (){
	this.ast.buildExisting(this.ele, this, this.presets, this.taps,null, this.window);
};

export {Source};