import { top, left, width, height, ele } from "@model";
import { ACTIONS } from "@api";

import handle from "./handle.jsx";

var test = [{
    ele: ele,
    ele_updated: 1,
    pos_type: "top-left",
    ACTION: [ACTIONS.RESIZET, ACTIONS.RESIZEL],
}, {
    ele: ele,
    ele_updated: 1,
    pos_type: "top",
    ACTION: [ACTIONS.RESIZET],
}, {
    ele: ele,
    ele_updated: 1,
    pos_type: "top-right",
    ACTION: [ACTIONS.RESIZET, ACTIONS.RESIZER],
}, {
    ele: ele,
    ele_updated: 1,
    pos_type: "right",
    ACTION: [ACTIONS.RESIZER],
}, {
    ele: ele,
    ele_updated: 1,
    pos_type: "bottom-right",
    ACTION: [ACTIONS.RESIZEB, ACTIONS.RESIZER],
}, {
    ele: ele,
    ele_updated: 1,
    pos_type: "bottom",
    ACTION: [ACTIONS.RESIZEB],
}, {
    ele: ele,
    ele_updated: 1,
    pos_type: "bottom-left",
    ACTION: [ACTIONS.RESIZEB, ACTIONS.RESIZEL],
}, {
    ele: ele,
    ele_updated: 1,
    pos_type: "left",
    ACTION: [ACTIONS.RESIZEL],
}];


function $update() {

    const div = "@#main";

    div.style.width = width + "px";
    div.style.height = height + "px";
    div.style.left = left + "px";
    div.style.top = top + "px";
};

export default <div id="main" class="main">
    <container data=${test}>
        <handle />
    </container>
</div >;



<style>
    root {
        position:fixed;
        width:150px;
        height:150px;
        color:white;
        z-index:10000;
        pointer-events:none;
        border:1px solid rgb(100,100,200);
    }

    #test, .lower-data {
        position:absolute,
        font-size:12px;
        top:-21px;
        left:-1px;
        min-height:14px;
        padding:3px;
        background-color:rgb(255,128,128);
        border-radius: 4px 4px 0px 0px
    }

    .lower-data{
        top:unset;
        bottom:-21px;
    }

    .color{
        color:orange;
        font-weight:600;
    }
</style>;