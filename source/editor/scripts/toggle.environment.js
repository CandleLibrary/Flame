var ENIRONMENT_TOGGLE = false; //False - Environment not displayed. 

/** Opens the Flame dev environment.**/
export default function(env = null) {

    const main_view = env.ui.main_view;

	if(ENIRONMENT_TOGGLE){
    	main_view.style.display = "none";
	}else{
		main_view.style.display = "block";
	}

	ENIRONMENT_TOGGLE = !ENIRONMENT_TOGGLE;

    //Load root scope from the hosting environment. 
    //load_component_from_user_space_scope(env.root_scope, env);
}
