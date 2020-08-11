import { selected_ele as ele, selected_comp as comp, sc } from "@model:flame-editor";
import {
    getApplicableRulesFromComponentData,
    getListOfApplicableSelectors,
    isSelectorCapableOfBeingUnique,
    sys,
    render
} from "@api";

var type = "default", w = 0, h = 0,
    selector = "",
    unique = false,
    styles = "test",
    selectors = "selectors";

function elementUpdate() {
    type = ele.tagName;
    const bb = ele.getBoundingClientRect();
    w = bb.width;
    h = bb.height;

    //Find all selector that apply to this component in the current state.

    const rules = getApplicableRulesFromComponentData(sys, comp, ele);

    if (rules.length > 0) {

        const
            rule = rules[0],
            sel = rule.selectors[0];

        selector = render(sel);
    }

    selectors = getListOfApplicableSelectors(sys, comp, ele)
        .map(render)
        .join(",\n");

    unique_selectors = getListOfApplicableSelectors(sys, comp, ele)
        .filter(sel => isSelectorCapableOfBeingUnique(comp, sel))
        .map(render)
        .join(",\n");
};

watch(elementUpdate, sc);

<style>
    .selector {color:#f1760e; font-weight:800 }
</style>;

export default <div class="tool">
    <h4>style </h4>
    <p>primary selector <br /><span class="selector">((selector))</span></p>
    <p>unique selector  <br /><span class="selector">((unique))</span></p>
    <p>force unique selector <input type="checkbox" /></p>
    <p><button>choose primary selector</button></p>
    <p><button>make unique selector</button></p>
    <p><button>change unique selector</button></p>
    <p>TODO - list applicable selectors <textarea readonly=true>((selectors))</textarea></p>
    <p>TODO - list applicable selectors <textarea readonly=true>((unique_selectors))</textarea></p>
    <p>TODO - list active styles <textarea readonly=true>((styles))</textarea></p>
</div>;
