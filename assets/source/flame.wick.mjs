import wick from "@candlefw/wick";
import { BasePackage } from "@candlefw/wick";
import flame from "./flame.mjs";

wick.flame = flame;

/** Flame needs to hook into wick processes to provide editing features on demand. */

const constr = BasePackage.prototype.complete;

BasePackage.prototype.complete = function(){
	constr.call(this);
	//Register with flame
	window.flame.registerPackage(this);
};

export default wick;
