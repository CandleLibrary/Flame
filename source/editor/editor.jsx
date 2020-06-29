import { comp, meta } from "@model";
import { setEditingComp } from "@api";


/**
 * Loads the editing environment for this component. 
 * @param {*} event 
 */
function loadEditor(event) {

    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();

    const c = comp, m = meta;

    setEditingComp({ comp: c, meta: m });

}

<style>
    root{
        position: absolute;
        height: 25px;
        width: 25px;
        bottom: 5px;
        right: 5px;
        color:white;
        background-color: white;
        border-radius: 5px;
        cursor:pointer;
    }

    root:hover {
        color:white;
    }
</style>;

export default <div onclick="((loadEditor))"><img width=25 height=25 src="/flame/editor/flaming_f.svg"></div>;