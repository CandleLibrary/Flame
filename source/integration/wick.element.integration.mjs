import open_environment from "../interface/open.environment.mjs";

/*
	Integrates Flame systems into Wick's component.prototype 
*/
export default async function(integrating_wick, flame_environment) {

    const comp = await integrating_wick("<a></a>");

    const component_prototype = comp.constructor.prototype;

    const mount_function = component_prototype.nonAsyncMount;

    component_prototype.nonAsyncMount = function(...args) {

        const comp = mount_function.call(this, ...args);

        const element = comp.ele;

        const flame_tag = document.createElement("div");

        flame_tag.style.width = "8px";
        flame_tag.style.height = "8px";
        flame_tag.style.backgroundColor = "rgb(210,170,60)";

        flame_tag.addEventListener("click", () => {
            open_environment(comp, flame_environment);
        });

        element.appendChild(flame_tag);

        return comp;
    };
}