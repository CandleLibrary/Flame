import { selected_ele, state } from "@model:flame-editor";

//ToolBar Options
import componentinfo from "./tools/component_info.jsx";
import position from "./tools/position_tool.jsx";
import css from "./tools/css_tool.jsx";
import color from "./tools/color_tool.jsx";

var selected_tools = [{
    type: "position"
}, {
    type: "css"
}, {
    type: "component"
}, {
    type: "color"
}];

export default <div>
    <p>current state: ((state)) </p>
    <img id="logo" src="./flame/editor/cfw.ts.svg" height=50>
        <container data="((selected_tools))">
        <componentinfo useif="((m1.type == 'component'))" class="tool" />
        <position useif="((m1.type == 'position'))" class="tool" />
        <css useif="((m1.type == 'css'))" class="tool" />
        <color useif="((m1.type == 'color'))" class="tool" />
    </container>
</div >;

<style>
    root {
        position:fixed;
        font-weight:600;
        top:0;
        right:0;
        width:250px;
        height:100vh;
        background-color:white;
        border-left:1px solid #EEEEEE;
        z-index:10006;
        font-family:arial;
        font-size:12px;
        padding: 50px 0 0 0;
    }

    #logo {
        position:absolute;
        bottom:70px;
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

