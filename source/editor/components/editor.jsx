import adjust_box from "./element_adjust_box.jsx";
import add_box from "./element_add_box.jsx";
import hover_box from "./element_hover_box.jsx";
import border_box from "./border_adjust_box.jsx";
import { POINTER_DN } from "@model:flame-editor";

<style>
    root{
        position: fixed;
        top: 0;
        left:0;
        z-index:1000;
    }

    #ptr_dn{
        position:absolute;
        top:0;
        left:0;
        width:100vw;
        height:100vh;
        background-color:transparent;
        z-index:10000;
    }
</style>;

export default <div>
    <hover_box />
    <adjust_box />
    <border_box />
</div>;
