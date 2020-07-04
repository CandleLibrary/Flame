import { comp, ele } from "@model:flame-editor";

<style>
    root {
        width:150px;
        height:150px;
        background-color:red;
        color:white;
        font-weight:600;
        font-size:24px;
    }
</style>;

debugger;
function showBox() {

    if (ele) {
        "@div";
        ("@div").style.opacity = 0;
    } else {
        ("@div").style.opacity = 1;
    }
};


export default <div class="main"><p>(( comp.name )) ((ele.tagName)) ((ele.getAttribute("w-s")))</p></div>;