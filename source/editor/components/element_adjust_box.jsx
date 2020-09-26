import {
    selected_comp as comp,
    selected_ele as ele,
    sc,
    ACTIONS
} from "@model:flame-editor";

import handle from "./handle.jsx";

var a = 0, b = 0, c = 0, d = 0, test = [];

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


function showBox() {

    if (ele) {

        const div = "@#main", bb = ele.getBoundingClientRect();

        div.style.opacity = 1;

        a = bb.width;
        b = bb.height;
        c = bb.left;
        d = bb.top;

        div.style.width = a + "px";
        div.style.height = b + "px";
        div.style.left = c + "px";
        div.style.top = d + "px";

        test = [{
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


    } else ("@#main").style.opacity = 0;
};

watch(showBox, sc);


export default <div id="main" class="main">
    <container data=${test}>
        <handle />
    </container>
</div >;
