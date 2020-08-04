import select_box from "./element_select_box.jsx";
import hover_box from "./element_hover_box.jsx";
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
    <select_box />
</div >;
