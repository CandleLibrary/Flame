/** Creates and returns an environment  **/
export default function (options) {

	const env = {
		ui : {
			main_view : document.createElement("div"),
			windows : [],
			layers : []
		}
	}


	return env;
}