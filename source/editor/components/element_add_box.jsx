/**
 * Add a new element to the containing element as either
 * a previous sibling, following sibling, or as the first
 * child of the element.
 */
import {
    selected_comp as comp,
    selected_ele as ele,
    sc,
    ACTIONS
} from "@model:flame-editor";

import { APPLY_ACTION } from "@api";

var a = 0, b = 0, c = 0, d = 0;

function insertNewElementBefore() {
    APPLY_ACTION([ACTIONS.CREATE_ELEMENT], { target: "before", tag: "div" });
};

function insertNewElementAfter() {
    APPLY_ACTION([ACTIONS.CREATE_ELEMENT], { target: "after", tag: "div" });
}

function insertNewChildElement() {
    APPLY_ACTION([ACTIONS.CREATE_ELEMENT], { target: "self", tag: "div" });
}

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

    } else ("@#main").style.opacity = 0;
};

watch(showBox, sc);

<style>
    root {
        position:fixed;
        width:150px;
        height:150px;
        color:white;
        z-index:10000;
        border:1px solid rgb(128,128,255);
    }

    .select-tab {
        cursor: pointer;
        font-size:1.2em;
        text-align:center;
        font-weight:900;
        width: 20px;
        height: 20px;
        background-color:rgb(100,100,200);
        position:absolute;
        border-radius: 2px;
        border: 1px solid rgb(100,100,120);
    }

    .select-tab:hover {
        cursor: pointer;
        background-color:rgb(100,100,250);
    }

    .select-tab.top {
        top:-22px;
        left:0;
    }

    .select-tab.bottom {
        bottom:-22px;
        right:0;
    }

    .select-tab.inner{
        position:relative;
        top:0;
        margin:auto;
    }

</style>;

export default <div id="main" class="main">
    <div onclick="${insertNewElementBefore}" class="select-tab top">+</div>
    <div onclick="${insertNewChildElement}" class="select-tab inner">+</div>
    <div onclick="${insertNewElementAfter}" class="select-tab bottom">+</div>
</div>;