import wick from "wick";

import { TEXTEDITOR } from "./text";
import { SCALETL, SCALEBL, SCALETR, SCALEBR, SCALEL, SCALEB, SCALET, SCALER} from "./resize"
import { MOVE, CENTER } from "./move"
import { COMPLETE } from "./complete"
import {CREATE_COMPONENT, CREATE_CSS_DOC} from "./create"

const actions = {
    TEXTEDITOR,
    MOVE,
    CENTER,
    SCALETL, 
    SCALEBL, 
    SCALETR, 
    SCALEBR, 
    SCALEL, 
    SCALEB, 
    SCALET, 
    SCALER,
    COMPLETE,
    CREATE_COMPONENT,
    CREATE_CSS_DOC,
}

export {actions}
