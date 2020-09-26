import { top, left, width, height, comp, ele, IS_COMPONENT_FRAME } from "@model";

import { sys } from "@api";

function $update() {
    const div = "@#main";


    div.style.width = width + "px";
    div.style.height = height + "px";

    if (IS_COMPONENT_FRAME) {
        div.style.left = left + "px";
        div.style.top = top + "px";
        "@div"[0].style.borderColor = "red";
    } else {
        const addition = Math.round(2 * sys.ui.transform.scale);
        div.style.left = left + addition + "px";
        div.style.top = top + addition + "px";
        "@div"[0].style.borderColor = "";
    }
}

export default <div id="main" class="main">
    <div id="test">${cfw.wick.rt.presets.components.get(comp.name).location + " "}<span class="color">${ele.tagName + (ele.id ? "." + ele.id : "")}</span> ${ele.getAttribute("w-s")}
    </div>
</div>;

<style>
    root {
        position:fixed;
        width:150px;
        height:150px;
        color:white;
        z-index:10000;
        pointer-events:none;
        border:1px solid rgb(50,50,150);
        font-size:12px;
        font-family:Arial;
    }

    #test, .lower-data {
        position:absolute,
        font-size:12px;
        top:-21px;
        left:-1px;
        min-height:14px;
        padding:3px 5px;
        background-color:rgb(50,50,150);
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