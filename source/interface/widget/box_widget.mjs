import ElementBox from "./element_box.mjs";

export default class BoxWidget extends ElementBox{
	constructor(element){
		super();
		this.setDimensions(element);
	}
}
