import { comp, ele, sc } from "@model:flame-editor";

<style>
    root {
        position:fixed;
        width:150px;
        height:150px;
        color:white;
        z-index:10000;
        pointer-events:none;
        padding:1px;
        border:1px solid rgb(128,128,255)
    }

    #test {
        position:absolute,
        font-size:12px;
        top:-21px;
        left:-1px;
        height:14px;
        padding:3px;
        background-color:rgb(128,128,255);
        border-radius: 4px 4px 0px 0px
    }

    .color{
        color:orange;
        font-weight:600;
    }
</style>;


function showBox() {
    sc;
    if (ele) {
        const div = "@#main";
        div.style.opacity = 1;

        const bb = ele.getBoundingClientRect();

        div.style.width = bb.width + "px";
        div.style.height = bb.height + "px";
        div.style.top = bb.top + "px";
        div.style.left = bb.left + "px";

    } else {
        ("@#main").style.opacity = 0;
    }
};


export default <div id="main" class="main">
    <div id="test">(( cfw.wick.rt.presets.components.get(comp.name).location )) <span class="color">((ele.tagName))</span> ((ele.getAttribute("w-s")))
    </div>
</div>;