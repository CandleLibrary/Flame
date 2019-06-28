import DocumentManager from "../system/document/doc_manager.mjs";
import Poject from "../system/project/project.mjs";
import css_Manager from "../system/css/css_manager.mjs";

/** Creates and returns an environment  **/
export default function (options, wick = null, radiate = null) {
	
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

		css : null,

		wick,

		radiate,

		presets: null
	};

	env.css = css_Manager(env);
	env.data.docs = new DocumentManager(env);
	env.project = new Poject(env);
	env.presets = wick.presets({
		custom : {
			env,
			css:env.css,
			docs:env.docs,
			project:env.project
		}
	});


	return env;
}
