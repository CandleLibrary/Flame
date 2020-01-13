/*
	Integrates Flame systems into Wick's component.prototype 
*/
export default async function(integrating_wick, flame_environment){

	const comp = await integrating_wick("<a></a>");

	const component_prototype = comp.constructor.prototype;

	const mount_function = component_prototype.nonAsyncMount;

	//*
	component_prototype.nonAsyncMount = function(...args){
		
		const comp = mount_function.call(this, ...args);

	/* 
		Deprecated - This used to add a little tag to each component that was mounted to the document. When clicked, this tag would open the Flame environment for that specific component. 
	/*/
	/*/
		
		const element = comp.ele;
		
		const flame_tag = document.createElement("div");
		flame_tag.style.width = "8px";
		flame_tag.style.height = "8px";
		flame_tag.style.backgroundColor = "rgb(210,170,60)";

		flame_tag.addEventListener("click", ()=>{
			open_environment(comp, flame_environment);
		});
		//element.appendChild(flame_tag);

	//*/


		return comp;
	};
}
