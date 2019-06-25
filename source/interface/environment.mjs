import DocumentManager from "../system/document/doc_manager.mjs";

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

		wick,

		radiate
	};


	env.data.docs = new DocumentManager(env);


	return env;
}
