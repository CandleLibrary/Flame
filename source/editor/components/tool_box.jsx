import { selected_ele } from "@model:flame-editor";

//ToolBar Options
import componentinfo from "./tools/component_info.jsx";
import position from "./tools/position_tool.jsx";
import css from "./tools/css_tool.jsx";

var selected_tools = [{
    type: "position"
}, {
    type: "css"
}, {
    type: "component"
}];

export default <div>
    <container data="((selected_tools))">
        <componentinfo useif="((m1.type == 'component'))" class="tool" />
        <position useif="((m1.type == 'position'))" class="tool" />
        <css useif="((m1.type == 'css'))" class="tool" />
    </container>
</div >;

<style>
    root {
        position:fixed;
        font-weight:600;
        top:0;
        right:0;
        width:220px;
        height:100vh;
        background-color:white;
        border-left:1px solid #EEEEEE;
        z-index:10005;
        font-family:arial;
        font-size:12px;
        padding: 50px 0 0 0;
    }

    .tool {
        margin:auto;
        color:#555555;
    }

    .tool h4 {
        margin:auto;
        color:#888888;
        margin:8px;
        padding: 4px 0;
        border-bottom:1px solid #AAAAAA;
    }

    .tool p {
        padding: 0px 20px;
    }
</style>;

