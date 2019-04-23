import radiate from "@candlefw/radiate";

import wick from "./flame.wick.mjs";

import flame from "./flame.mjs";

import URL from "@candlefw/url";

radiate.wick = wick;
radiate.flame = wick.flame;

window.flame = flame;

/**
 The goal with flame.radiate is to allow Flame to auto launch when a user
 issues an action to enter "dev" mode. To facilitate this, it is important for
 Flame to be prepared when the page starts, and force radiate to enter "client-mode",
 wherin it is run within an seamless iFrame. Thus, when the user uses the
 "radiate" function to start client side routing, Flame overrides this routine
 with a hook that first starts Flame, then loads an Iframe component with the
 address of the original url. The iframe component will have a flag indicating
 that it is in "client-mode", preventing recursion and allowing the intended
 contents of the page to load within the iFrame component. 
 */

 let CLIENT_MODE = false;

 function FlamingRadiation(presets){

 	if(window.frameElement && window.frameElement.name == "flame_frame"){

 		//Assign the parent documents flame object to the iFrame's contentWindow object. 
 		window.flame = window.parent.flame;
 		window.CLIENT_MODE = true;
 		return radiate(presets);
 	}
 	else {
 		//Load Curent Location into new iFrame component.
 		const url = new URL();
 		flame.initDedicatedDevEnvironment();
		flame.loadIFrameComponent(url, true, true);
 	}
 }

export default FlamingRadiation;
