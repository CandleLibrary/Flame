import { CSSProperty, CSSRuleNode } from "@candlefw/css";


export interface TrackedCSSProp {
    prop: CSSProperty;
    sel: CSSRuleNode;
    unique: boolean;
}
