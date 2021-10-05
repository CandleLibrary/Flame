import { CSSProperty, CSSRuleNode } from "@candlelib/css";


export interface TrackedCSSProp {
    prop: CSSProperty;
    sel: CSSRuleNode;
    unique?: boolean;
}
