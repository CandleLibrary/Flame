/**
 * @brief Handles user input and rendering of UI elements
 * 
 * @param  [HTMLElement] Element to map UI components to.
 */
export class UI_Manager{
	constructor(UIHTMLElement, ViewElement){

		this.element = UIHTMLElement;
		this.view_element = ViewElement;
		this.ACTIVE_POINTER_INPUT = false;
		
		this.origin_x = 0;
		this.origin_y = 0;

		this.position_x = 0;
		this.position_y = 0;

		UIHTMLElement.addEventListener("pointerdown", e=>{
			this.handlePointerDownEvent(e);
		})

		window.addEventListener("pointermove", e=>{
			this.handlePointerMoveEvent(e);
		})

		window.addEventListener("pointerup", e=>{
			this.handlePointerEndEvent(e);
		})

	}

	handlePointerDownEvent(e){
		this.ACTIVE_POINTER_INPUT = true;
		this.origin_x = e.offsetX;
		this.origin_y = e.offsetY;
	}

	handlePointerMoveEvent(e){
		if(!this.ACTIVE_POINTER_INPUT) return;
		let diffx = this.origin_x - e.offsetX;
		let diffy = this.origin_y - e.offsetY;
		this.position_x += diffx;
		this.position_y += diffy;
		this.origin_x -= diffx;
		this.origin_y -= diffy;

		console.log(`translate(${this.position_x}, ${this.position_y})`);
		this.view_element.style.transform = `translate(2,3)`;
	}

	handlePointerEndEvent(e){
		this.ACTIVE_POINTER_INPUT = false;
	}
}
