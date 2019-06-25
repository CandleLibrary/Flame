export class DNDHandler{
	constructor(env){
		this.env = env
		this.icon = document.createElement("div");
		this.icon.style.position = "absolute";
		this.icon.style.width = "20px";
		this.icon.style.height = "20px";

		env.ui.manager.element.appendChild(this.icon);

		this.drop_obj = null;
		this.ACTIVE = false;
		this.x = 0;
		this.y = 0;
	}

	setIcon(icon){
		this.icon.innerHTML = "null";
		//this.icon.appendChild(icon);
	}

	startDrag(obj, icon, event){
		this.ACTIVE = true;

		if(event){
			event.preventDefault();
			event.stopPropagation();
		}

		this.drop_obj = obj;
		this.setIcon(icon);
	}

	start(event, data){
		let {x,y} = data;
		this.x = x;
		this.y = y;
	}

	move(event, data){
		let {x,y} = data;
		this.icon.style.left = x;
		this.icon.style.top = y;
		this.x = x;
		this.y = y;
	}

	end(event){
		this.ACTIVE = false;
		const obj = this.drop_obj;
		this.drop_obj = null;
		const x = this.env.ui.transform.getLocalX(this.x);
		const y = this.env.ui.transform.getLocalY(this.y);
		this.env.ui.managerenv.ui.active_handler.input("generic_drop", {x, y}, this.env.ui.manager, obj);
	}


}
