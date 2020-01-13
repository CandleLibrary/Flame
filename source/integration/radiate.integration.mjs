import load_component_from_user_space_scope from "../component/load.userspace.component.mjs";
import URL from "@candlefw/url";
//import create_group from "../component/create.userspace.group.mjs";

/*
	Integrates Flame systems into Radiate
*/
export default async function(env, router, presets) {
	const lp = router.loadPage.bind(router),
		existing_components = new Map();

	let current_view = null;

	//grap the current pages style sheets

	for(const ele of document.head.children){
		if(ele.tagName == "LINK" && ele.rel=="stylesheet" && ele.href){
			//Need create a css element that will collect all css information stored on the page. 
			//debugger
		}
	}

	router.loadPage = async function(...args) {
		
		await lp(...args);

		current_view = router.current_view;

		if (current_view && !existing_components.has(current_view)) {
			//create a flame compnent based on the app element. 

			//extract elements and build a page view based on the components present in the page. 

			//create a new scope called "app", this will mimic the radiate app element
			const app = await env.wick("<app></app>").pending;
			app.ast.SINGLE = false; // Remove the single flag, which was genereated by the signature <ele></ele>

			//create sc

			for (const ele of current_view.eles) {

				const ele_comp = await env.wick(`<element id="${ele.id}"></element>`).pending;
				ele_comp.ast.SINGLE = false; //Same as above.

				app.ast.children.push(ele_comp.ast);
				ele_comp.ast.parent = app.ast;

				for (const comp of ele.components) {
					ele_comp.ast.children.push(comp.scope.ast);
					comp.scope.ast.parent = app.ast;
				}
			}

			const w = 1024,
				h = 720;

			const comp = load_component_from_user_space_scope(app, env, window.innerWidth * 0.5 - w * 0.5, window.innerHeight * 0.5 - h * 0.5, w, h);
			
			existing_components.set(current_view, comp);
		}
	};
}