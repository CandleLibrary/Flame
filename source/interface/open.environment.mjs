import load_component_from_user_space_scope from "../component/load.userspace.component.mjs";

/** Opens the Flame dev environment**/
export default function(scope = null, env = null) {

	debugger

    const main_view = env.ui.main_view;

    main_view.style.display = "block";

    //load copy of the scope into the Flame environment
    load_component_from_user_space_scope(scope, env);
}
