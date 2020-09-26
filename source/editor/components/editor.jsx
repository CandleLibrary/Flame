import adjust_box from "./element_adjust_box.jsx";
import element_box from "./element_add_box.jsx";
import hover_box from "./element_hover_box.jsx";
import border_box from "./border_adjust_box.jsx";
import color_box from "./color_adjust_box.jsx";
import tool_box from "./tool_box.jsx";
import component_box from "./component_graduation_box.jsx";
import vertical_ruler from "./vertical_ruler.jsx";
import horizontal_ruler from "./horizontal_ruler.jsx";
import draw_canvas from "./draw_canvas.jsx";

import { state } from "@model:flame-editor";

var states = [
    { state: "color" },
    { state: "component" },
    { state: "margin" },
    { state: "border" },
    { state: "padding" },
    { state: "dimensions" },
    { state: "position" },
    { state: "transform" },
    { state: "element" },
];

export default <div>
    <tool_box />
    <vertical_ruler />
    <horizontal_ruler />
    <hover_box />
    <draw_canvas />

    <container filter="${ m1.state == state }" data="${ states }">

        <color_box useif="${m1.state == 'color'}" />

        <component_box useif="${m1.state == 'component'}" />

        <margin_box useif="${m1.state == 'margin'}" />

        <border_box useif="${m1.state == 'border'}" />

        <padding_box useif="${m1.state == 'padding'}" />

        <adjust_box useif="${m1.state == 'dimensions'}" />

        <position_box useif="${m1.state == 'position'}" />

        <transform_box useif="${m1.state == 'transform'}" />

        <element_box useif="${m1.state == 'element'}" />

    </container>
</div>;

<style>
    root{
        position: fixed;
        top: 0;
        z-index:1000;
        left:0;

    }
</style>;