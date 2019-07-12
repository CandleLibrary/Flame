
/*
	Integrates CSS custom ui systems into CSS
*/
export default function(env){
	const css = env.css;

	setColorHandler(css.types.color, env);
	setLengthHandler(css.types.length, env);
}


function setColorHandler(CSS_Color, env){
	//Preload document data;
	env.data.docs.get(env.data.docs.loadFile("/@ui/css_color_handler.html"));

	CSS_Color.setValue = function(ui_segment, value){
		ui_segment.scope.update({value});
        //ui_segment.setElement.value = (value) ? value + "" : "#000000";
    };

	CSS_Color.valueHandler = function(ui_segment, value, update_function){
		const doc = env.data.docs.get(env.data.docs.loadFile("/@ui/css_color_handler.html"));

		if(ui_segment.scope)
			ui_segment.scope.destroy();

		ui_segment.scope = doc.data.mount(ui_segment.val);
		ui_segment.scope.update({loaded:true});
		ui_segment.scope.update({segment:ui_segment});
		ui_segment.scope.update({value});
    };
}

function setLengthHandler(CSS_Length, env){
	//Preload document;
	env.data.docs.get(env.data.docs.loadFile("/@ui/css_length_handler.html"));

	CSS_Length.setValue = function(ui_segment, value){
		ui_segment.scope.update({value});
    };

	CSS_Length.valueHandler = function(ui_segment, value, update_function){
		const doc = env.data.docs.get(env.data.docs.loadFile("/@ui/css_length_handler.html"));

		if(ui_segment.scope)
			ui_segment.scope.destroy();

		ui_segment.scope = doc.data.mount(ui_segment.val);
		ui_segment.scope.update({loaded:true});
		ui_segment.scope.update({segment:ui_segment});
		ui_segment.scope.update({value});
    };
}
