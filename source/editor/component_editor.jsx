import { component_tabs } from "@model:flame_editor_model";
import component_editor from "./component_editor_tab.jsx";

function test() {
    console.log(component_tabs);
}

export default <div class="main">
    <container data="((component_tabs))">
        <component_editor export="close_wrapper" ></component_editor>
    </container>
</div >;