import wick from "wick"
class SVGPath{}
class SVGRect{
	static parse(element, rect = new SVGRect()){
		let ele = wick.core.html(element).then(ele=>{
			rect.height = ele.getAttribute("height");
			rect.width = ele.getAttribute("width");
		})
	}

	constructor(element, canvas){
		this.width = 0;
		this.height = 0;
		this.x = 0;
		this.y = 0;
		this.rx = 0;
		this.ry = 0;
		this.pathLength = 0;
		this.style = null;
		this.class = "";
		this.id = "";
		this.canvas = canvas;
		if(element) SVGRect.parse(element.outerHTML, this);
	}

	toString(){

	}
}

/**
 * @brief Provides interface tools for manipulating SVG elements
 */
export class SVGManager{
	constructor(){
		this.target = null;
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");
		this.elements = [];
	}

	render(){

	}

	mount(target_element, transform){
		while(target_element && target_element.tagName.toUpperCase() !== "SVG"){
			target_element = target_element.parentElement;
		}

		if(!target_element) return;

		//parse svg elements and build objects from them. 
		let children = target_element.children;

		for(let i = 0; i < children.length; i++){
			let child = children[i];

			switch(child.tagName.toUpperCase()){
				case "RECT":
					this.elements.push(new SVGRect(child));
				break;
				case "PATH":
					this.elements.push(new SVGPath(child));
				break;

			}
		}
	}
}