import { traverse } from '@candlelib/conflagrate';
import {
    CSSNode,
    CSSNodeType,
    getFirstMatchedSelector,
    getMatchedElements,
    getMatchedSelectors,
    getSelectorPrecedence,
    PrecedenceFlags
} from "@candlelib/css";
import URI from '@candlelib/uri';
import { WickRTComponent } from "@candlelib/wick";
import { FlameSystem } from "./types/flame_system";
import { EditorSelection } from "./types/selection";
import { TrackedCSSProp } from "./types/tracked_css_prop";

export function createNewFileURL(sys: FlameSystem, name: string) {
    return new URI(sys.file_dir + name);
}

/*
 *  ██████ ███████ ███████ 
 * ██      ██      ██      
 * ██      ███████ ███████ 
 * ██           ██      ██ 
 *  ██████ ███████ ███████ 
 */


export function getMatchedRulesFromComponentData(
    sys: FlameSystem,
    comp: WickRTComponent,
    ele: HTMLElement
) {
    debugger;
    return null;
    /*     return [comp]
            .map(c => getComponentDataFromRTInstance(sys, c))
            .filter(c => !!c)
            .flatMap(c => c.CSS || [])
            .flatMap(e => css.getArrayOfMatchedRules(ele, e)); */
};

export function getMatchedRulesFromFullHierarchy(
    sys: FlameSystem,
    comp: WickRTComponent,
    ele: HTMLElement
) {
    debugger;
    return null;
    /*     return getListOfRTInstanceAndAncestors(comp)
            .map(c => getComponentDataFromRTInstance(sys, c))
            .flatMap(c => c.CSS || [])
            .flatMap(e => css.getArrayOfMatchedRules(ele, e)); */
};

export function getListOfApplicableSelectors(
    sys: FlameSystem,
    comp: WickRTComponent,
    ele: HTMLElement
) {
    return getMatchedRulesFromComponentData(sys, comp, ele)
        .flatMap(r => getMatchedSelectors(r, ele));
}

export function getApplicableProps(
    sys: FlameSystem,
    comp: WickRTComponent,
    ele: HTMLElement
): Map<string, TrackedCSSProp> {


    //Get applicable css files,

    //Then get applicable rules,

    //For each rule -> Identify 1 matching selector.

    //Extract selector, for each prop in rule create
    // sel,prop pairs. 

    //TODO, setup cache clone

    return getMatchedRulesFromFullHierarchy(sys, comp, ele)
        .reverse()
        .reduce((m, r) => {

            const
                s = getFirstMatchedSelector(r, ele),
                rp = r.precedence,
                sp: PrecedenceFlags = getSelectorPrecedence(s);

            for (const [name, val] of r.props.entries())
                if (!m.has(name) || (m.get(name).prop.precedence) < (val.precedence | rp | sp))
                    m.set(name, { sel: s, prop: val.copy(rp | sp) });

            return m;
        }, <Map<string, TrackedCSSProp>>new Map);
};

export function isSelectorCapableOfBeingUnique(comp: WickRTComponent, selector: CSSNode, root_name: string = comp.name): boolean {
    let count = 0;

    for (const { node, meta: { parent } } of traverse(selector, "nodes")) {

        //Only certain selector types are allowed to serve as a unique selector. 
        switch (node.type) {
            case CSSNodeType.CompoundSelector:
            case CSSNodeType.ComplexSelector:
                break;
            case CSSNodeType.ClassSelector:
                if (node.value == root_name && parent)
                    break;
            case CSSNodeType.IdSelector:
                count++;
                break;
            default:
                count += 2;
        }
    }

    const matched_elements = [...getMatchedElements(comp.ele, selector)];

    if (matched_elements.length > 1)
        return false;

    return count == 1;
}

/*
 * ██████  ██    ██ ███    ██ ████████ ██ ███    ███ ███████                         
 * ██   ██ ██    ██ ████   ██    ██    ██ ████  ████ ██                              
 * ██████  ██    ██ ██ ██  ██    ██    ██ ██ ████ ██ █████                           
 * ██   ██ ██    ██ ██  ██ ██    ██    ██ ██  ██  ██ ██                              
 * ██   ██  ██████  ██   ████    ██    ██ ██      ██ ███████                         
 *                                                                                   
 *                                                                                   
 *  ██████  ██████  ███    ███ ██████   ██████  ███    ██ ███████ ███    ██ ████████ 
 * ██      ██    ██ ████  ████ ██   ██ ██    ██ ████   ██ ██      ████   ██    ██    
 * ██      ██    ██ ██ ████ ██ ██████  ██    ██ ██ ██  ██ █████   ██ ██  ██    ██    
 * ██      ██    ██ ██  ██  ██ ██      ██    ██ ██  ██ ██ ██      ██  ██ ██    ██    
 *  ██████  ██████  ██      ██ ██       ██████  ██   ████ ███████ ██   ████    ██    
 */



export function setRTInstanceClass(sys: FlameSystem, comp_name: string, comp_class: typeof WickRTComponent) {
    sys.editor_wick.rt.context.component_class.set(comp_name, comp_class);
    sys.page_wick.rt.context.component_class.set(comp_name, comp_class);
}

export function getListOfRTInstanceAndAncestors(comp: WickRTComponent): WickRTComponent[] {
    const list = [comp];
    //@ts-ignore
    while (comp.par) { if (comp.par) list.push(comp.par); comp = comp.par; }
    return list.reverse();
}

export function getRTInstanceFromElement(ele): WickRTComponent {
    if (ele) {
        do {
            if (ele.wick_component && !ele.hasAttribute("w:o"))
                /* Presence of "w:o" indicates the element belongs to a component that has integrated its 
                * element into the tree of another component.  */
                return ele.wick_component;

            ele = ele.parentNode;
        } while (ele);
    }
    return null;
}

export function* getRTInstances(sys: FlameSystem, component_name: string): Generator<WickRTComponent> {

    for (const { frame } of sys.edited_components.components) {

        if (!frame) continue;

        const { contentDocument: document } = frame;

        for (const ele of document.getElementsByClassName(component_name))
            yield ele.wick_component;
    }
}

export function getRTInstanceFromEvent(event, sys: FlameSystem) {
    return getRTInstanceFromElement(getElementFromEvent(event, sys));
}


export function replaceRTInstances(sys: FlameSystem, old_comp_name: string, new_comp_name: string) {

    const cstr: typeof WickRTComponent = sys.editor_wick.rt.gC(new_comp_name);

    for (const old_comp of getRTInstances(sys, old_comp_name)) {
        const new_comp = new cstr(old_comp.model, null, null, old_comp.par, null, sys.page_wick.rt.context);
        old_comp.ele.parentElement.replaceChild(new_comp.ele, old_comp.ele);
        old_comp.destructor();
    }
}

/*
 * ██   ██ ████████ ███    ███ ██          ███    ██  ██████  ██████  ███████ 
 * ██   ██    ██    ████  ████ ██          ████   ██ ██    ██ ██   ██ ██      
 * ███████    ██    ██ ████ ██ ██          ██ ██  ██ ██    ██ ██   ██ █████   
 * ██   ██    ██    ██  ██  ██ ██          ██  ██ ██ ██    ██ ██   ██ ██      
 * ██   ██    ██    ██      ██ ███████     ██   ████  ██████  ██████  ███████                                                                           
 */

export function getValidSelectionsCount(sys: FlameSystem) {

    let count = 0;

    const selections = sys.editor_model.selections;

    for (const sel of selections) {

        if (sel.VALID) count++;


    }

    return count;
}

export function getActiveSelectionsCount(sys: FlameSystem) {

    let count = 0;

    const selections = sys.editor_model.selections;

    for (const sel of selections) {

        if (sel.VALID && sel.ACTIVE) count++;


    }

    return count;
}

export function* getActiveSelections(sys: FlameSystem): Generator<EditorSelection> {

    const selections = sys.editor_model.selections;

    for (const sel of selections) {

        if (sel.ACTIVE && sel.VALID)
            yield sel;
    }
};

export function invalidateSelection(sel: EditorSelection, sys: FlameSystem) {
    const
        selections = sys.editor_model.selections,
        i = selections.indexOf(sel);

    if (i >= 0) {

        sel.ele.style.textDecoration = "";

        sel.VALID = false;
        sel.ACTIVE = false;
        sel.ele = null;
        sel.comp = null;
        //selections.scheduleUpdate();
    } else {
        throw ReferenceError("This selection is out of scope!");
    }

}

export function invalidateInactiveSelections(sys: FlameSystem) {
    const selections = sys.editor_model.selections;

    for (const sel of selections)
        if (!sel.ACTIVE && sel.VALID)
            invalidateSelection(sel, sys);
}

export function invalidateAllSelections(sys: FlameSystem) {
    const selections = sys.editor_model.selections;

    for (const sel of selections) {
        sel.VALID = false;
        sel.ACTIVE = false;
        sel.ele = null;
        sel.comp = null;
    }// invalidateSelection(sel, sys);
}

export function updateSelections(sys: FlameSystem) {
    const selections = sys.editor_model.selections;

    for (const sel of selections)
        updateSelectionCoords(sel, sys);
}

export function getASelection(sys: FlameSystem, ele: HTMLElement, frame_ele: HTMLElement, IS_COMPONENT_FRAME: boolean = false): EditorSelection {

    const selections = sys.editor_model.selections;
    let selection_candidate: EditorSelection = null;

    for (const sel of selections) {
        if (!sel.VALID)
            selection_candidate = sel;

        if (sel.ele == ele)
            return sel;
    }

    if (selection_candidate) {
        selection_candidate.VALID = true;
        selection_candidate.IS_COMPONENT_FRAME = IS_COMPONENT_FRAME;
        selection_candidate.ele = ele;
        selection_candidate.frame_ele = frame_ele;

        if (!IS_COMPONENT_FRAME)
            selection_candidate.comp = getRTInstanceFromElement(ele);
        else selection_candidate.comp = sys.harness;

        ele.style.textDecoration = "underline";

        return selection_candidate;
    }

    const sel = <EditorSelection>{
        ACTIVE: false,
        VALID: false,
        IS_COMPONENT_FRAME,
        comp: null,
        ele: null,
        frame_ele: null,
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        actual_left: 0,
        actual_width: 0,
        actual_top: 0,
        actual_height: 0,
        px: 0,
        py: 0,
        pz: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 0,
        sy: 0,
        sz: 0,
    };

    selections.push(sel);

    return getASelection(sys, ele, frame_ele, IS_COMPONENT_FRAME);
}
export function updateSelectionCoords(sel: EditorSelection, sys: FlameSystem): EditorSelection {

    if (!sel.VALID) return sel;

    const { ui: { transform: { px, py, scale } } } = sys,
        { ele, frame_ele, IS_COMPONENT_FRAME } = sel,
        bb = ele.getBoundingClientRect();

    let min_x = bb.left, min_y = bb.top, max_x = min_x + bb.width, max_y = min_y + bb.height;

    if (!IS_COMPONENT_FRAME) {
        const style = window.getComputedStyle(frame_ele),
            top = parseFloat(style.top) || 0,
            left = parseFloat(style.left) || 0;
        min_x = (min_x + left) * scale + px;
        min_y = (min_y + top) * scale + py;
        max_x = (max_x + left) * scale + px;
        max_y = (max_y + top) * scale + py;
    }

    sel.px = min_x;
    sel.py = min_y;
    sel.left = min_x;
    sel.top = min_y;
    sel.width = max_x - min_x;
    sel.height = max_y - min_y;
    sel.actual_left = bb.left;
    sel.actual_top = bb.top;
    sel.actual_width = bb.width;
    sel.actual_height = bb.height;

    return sel;
}


function getElementInHTMLNamespace(ele: HTMLElement) {
    if (ele.parentNode) {
        const par = ele.parentNode;

        if (par.namespaceURI.includes("html"))
            return ele;

        return getElementInHTMLNamespace(par);
    }

    return null;
}

export function getSelectionFromPoint(x: number, y: number, sys: FlameSystem): EditorSelection {

    let selection = null;

    let ele = window.document.elementFromPoint(x, y);



    if (ele?.tagName == "IFRAME") // is edited component 
    {

        const
            style = window.getComputedStyle(ele),
            top = parseFloat(style.top) || 0,
            left = parseFloat(style.left) || 0,
            { ui: { transform: { px, py, scale } } } = sys;

        let IS_FRAME_SELECTED = false;

        //Convert screen coords to component coords
        x = (x - px) / scale - left;
        y = (y - py) / scale - top;

        //select from the frame's document
        let selected_ele: HTMLElement = (<any>ele).contentWindow.document.elementFromPoint(x, y);

        //the element may be the frame's window box.
        if (!selected_ele) {
            selected_ele = <HTMLElement>ele;
            IS_FRAME_SELECTED = true;
        }// else
        //   selected_ele = getElementInHTMLNamespace(selected_ele);

        return updateSelectionCoords(getASelection(sys, selected_ele, <HTMLElement>ele, IS_FRAME_SELECTED), sys);
    } else
        return null;


    return selection;
}


export function getElementFromEvent(event: PointerEvent, sys: FlameSystem): EditorSelection {
    return getSelectionFromPoint(event.x, event.y, sys);
}

export function getIndexOfElementInRTInstance(comp: WickRTComponent, ele: HTMLElement, sys: FlameSystem): number {
    if (comp == sys.harness) {
        for (let i = 0; i < sys.edited_components.components.length; i++)
            if (ele == sys.edited_components.components[i].frame)
                return i;
    } else {
        //@ts-ignore
        return comp.elu.indexOf(ele);
    }
    return -1;
}

export function getElementAtIndexInRTInstance(comp: WickRTComponent, index: number): HTMLElement {
    //@ts-ignore
    return comp.elu[index];
}
export function insertElementAtIndexInRTInstance(comp: WickRTComponent, index: number, ele: HTMLElement, APPEND_TO_ELEMENT: boolean = false) {

    const
        elu = comp.elu,
        target_ele = elu[index],
        parent = target_ele.parentElement;

    if (APPEND_TO_ELEMENT) {
        target_ele.insertBefore(ele, target_ele.firstChild);
        elu.splice(index + 1, 0, ele);
    } else if (index > elu.length) {
        elu.push(ele);
        comp.ele.appendChild(ele);
    } else if (index == 0) {
        elu.unshift(ele);
        comp.ele.insertBefore(ele, comp.ele.firstChild);
    } else {
        elu.splice(index, 0, ele);
        parent.insertBefore(ele, target_ele);
    }
}

export function removeElementAtIndexInRTInstance(comp: WickRTComponent, index: number) {

    const
        elu = comp.elu,
        target_ele = elu[index];

    target_ele.parentElement.removeChild(target_ele);

    elu.splice(index, 1);
}


