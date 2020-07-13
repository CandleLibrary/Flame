import {
    selected_comp as comp,
    selected_ele as ele,
    sc
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
        border:1px solid rgb(255,128,128)
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
            ACTION: "test",
        }, {
            ele: ele,
            ele_updated: 1,
            pos_type: "top",
            ACTION: "test",
        }, {
            ele: ele,
            ele_updated: 1,
            pos_type: "top-right",
            ACTION: "test",
        }, {
            ele: ele,
            ele_updated: 1,
            pos_type: "right",
            ACTION: "test",
        }, {
            ele: ele,
            ele_updated: 1,
            pos_type: "bottom-right",
            ACTION: "test",
        }, {
            ele: ele,
            ele_updated: 1,
            pos_type: "bottom",
            ACTION: "test",
        }, {
            ele: ele,
            ele_updated: 1,
            pos_type: "bottom-left",
            ACTION: "test",
        }, {
            ele: ele,
            ele_updated: 1,
            pos_type: "left",
            ACTION: "test",
        }];

    } else {
        ("@#main").style.opacity = 0;
    }
};

watch(showBox, sc);


export default <div id="main" class="main">
    <div id="test">(( cfw.wick.rt.presets.components.get(comp.name).location )) <span class="color">((ele.tagName))</span> ((ele.getAttribute("w-s")))</div>
    <container data=((test))>
        <handle />
    </container>
    <div class="lower-data">w:((a)) h:((b)) l:((c)) t:((d))</div>
</div >;