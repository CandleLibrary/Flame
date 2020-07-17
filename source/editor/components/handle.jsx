import {
    selected_ele,
    selected_comp,
    ele_updated,
    pos_type,
    //The action that will occur when this handle is moved. 
    ACTION
} from "@model";

import { START_ACTION } from "@api";

const div = "@div"[0];

switch (pos_type) {
    case "top-left":
        div.classList.add("top-left");
        break;
    case "top-right":
        div.classList.add("top-right");
        break;
    case "bottom-right":
        div.classList.add("bottom-right");
        break;
    case "bottom-left":
        div.classList.add("bottom-left");
        break;
    case "bottom":
        div.classList.add("bottom");
        break;
    case "top":
        div.classList.add("top");
        break;
    case "left":
        div.classList.add("left");
        break;
    case "right":
        div.classList.add("right");
        break;
}

function onpointerdown(event) { START_ACTION(ACTION); }

<style>
    root{
        position: absolute;
        pointer-events:auto;
    }

    .fill{
        border: 1px solid white;
        position: absolute;
        left:-6px;
        top:-6px;
        width: 8px;
        height: 8px;
        background-color: rgb(128,120,255);
        border-radius: 6px;
        cursor:pointer;
        transition: width 2s, height 2s;
    }

    .fill:hover{
        width:12px;
        height:12px;
    }

    root.top{
        top:0;
        left:50%;
    }

    root.bottom{
        bottom:0;
        left:50%;
    }

    root.left {
        top:50%;
        left:0;
    }

    root.right {
        top:50%;
        right:0;
    }

    root.bottom-right {
        bottom:0;
        right:0;
    }

    root.bottom-left {
        bottom:0;
        left:0;
    }

    root.top-right {
        top:0;
        right:0;
    }

    root.top-left {
        top:0;
        left:0;
    }
</style >;

export default <div><div class="fill"></div></div>;