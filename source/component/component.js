/**
 * This module is responsible for storing, updating, and caching components. In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
 */
const wick = require("wick");

class Component {

    constructor(document_id, system) {
    	this.element = document.createElement("div");

        //Flag for mounted state of component. If a component is accessible anywhare on the main UI, then it is considered mounted. 
        this.mounted = false;

        //Bounding box info. This is derived from CSS information pulled in from the master css file and any component level css scripts. 
        //dimensions are defined as [0] = top, [1] = left, [2] = width, [3] = height.
        this.dimensions = [0, 0, 0, 0];

        //Link to local css 
        this.local_css = null;

        //The file path (relative to project directory), of the component file. 
        this.file_path = "";

        //The file name of the component. 
        this.file_name = "";

        //The source component manager that handles the instantiation and runtime of Wick components. 
        this.manager = null;
    }

    /**
     * @brief Saves file to project directory. 
     * @details [long description]
     */
    saveFile() {

    }

    /**
     * Caches a bitmap image of the component.
     */
    cacheBitmap() {

    }

    load(document) {
        document.bind(this);
    }

    documentReady(data){
        this.package = new wick.core.source.package(data, wick.core.presets(), false);
        this.package.mount(this.element, null, false, this);
    }

    /**
     * Mounts the element to the document. 
     */
    mount() {

    }

    /**
     * Updates the bounding rect
     */
    updateDimensions(){
    	this.dimensions = this.element.getBoundingClientRect();
    }

    /**
     * Determines if point is in bounding box. 
     */
     pointInBoundingBox(x,y){
     	this.updateDimensions();
     	let min_x = this.dimensions.left;
     	let max_x = min_x + this.dimensions.width;
     	let min_y = this.dimensions.top;
		let max_y = min_y + this.dimensions.height;
     	return x >= min_x && x <= max_x && y >= min_y && y <= max_y;
     }
}

export { Component };