import ElementBox from "./element_box.js";

export default class BoxWidget extends ElementBox {
	constructor(element) {
		super();
		this.setDimensions(element);
	}
}
