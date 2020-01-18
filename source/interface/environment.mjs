import * as css  from "@candlefw/css";
import DocumentManager from "../system/document/doc_manager.mjs";
import Poject from "../system/project/project.mjs";
import css_Manager from "../system/css/css_manager.mjs";
import * as actions from "./actions/action.mjs";

/**
 	Environment is a global object that stores objects for use in pretty much every interface component. 
 	It is passed as an argument to many functions, including update messages in components.
**/
export default async function (options, wick = null, radiate = null) {

	if(radiate)
		wick = radiate.wick;

	const env = {

		ui : {
			main_view : null,
			ui_view : null,
			wys_view : null,
			windows : [],
			layers : []
		},

		data : {
			docs : null,
		},

		project : null,

		css : Object.assign({},css),

		css_ui : null,

		wick,

		radiate,

		presets: null,

		getCache : (...d) => actions.CacheFactory(...d)
	};

	env.css.manager = css_Manager(env);
	env.data.docs = new DocumentManager(env);
	env.project = new Poject(env);
	env.presets = wick.presets({
		custom : {
			actions,
			env,
			css:env.css,
			docs:env.docs,
			project:env.project
		}
	});

	return env;
}
