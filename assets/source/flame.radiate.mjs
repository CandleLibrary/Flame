import radiate from "@candlefw/radiate";

import wick from "./flame.wick.mjs";

import flame from "./flame.mjs";

radiate.wick = wick;
radiate.flame = wick.flame;

window.flame = flame;

export default radiate;
