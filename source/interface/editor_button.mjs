import toggle_environment from "./toggle.environment.mjs";

/*  
    Creates a button centered at some point (top middle of screen in this case) 
    that opens the flame environment when clicked 
*/
export default function (parent_element, env, root_scope = null){

        const editor_button = document.createElement("div");
        editor_button.style.backgroundColor = "red";
        editor_button.style.borderRadius = "20px";
        editor_button.style.position = "fixed";
        editor_button.style.width = "50px";
        editor_button.style.height = "50px";
        editor_button.style.top = "-20px";
        editor_button.style.margin = "auto";
        editor_button.style.top = "calc(100vh - 60px)";
        editor_button.style.right = "20px";
        editor_button.style.cursor = "pointer";

        editor_button.addEventListener("click", () => {
            toggle_environment(env);
        });

        parent_element.appendChild(editor_button);
}