import {SVGNode} from "@candlefw/wick";

import {RootNode} from "./root";

SVGNode.prototype.createElement = function(presets, source){
    const element = document.createElementNS("http://www.w3.org/2000/svg", this.tag);
    element.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    element.wick_source = source;
    element.wick_node = this;
    element.wick_id = RootNode.id++;
    return element;
};

SVGNode.prototype.setSource = RootNode.prototype.setSource;
// Rebuild all sources relying on this node
SVGNode.prototype.rebuild = RootNode.prototype.rebuild;
SVGNode.prototype.buildExisting = RootNode.prototype.buildExisting;
SVGNode.prototype.setRebuild = RootNode.prototype.setRebuild;
SVGNode.prototype.resetRebuild = RootNode.prototype.resetRebuild;
SVGNode.prototype.updated = RootNode.prototype.updated;
SVGNode.prototype.ReparseConstructor = SVGNode;

export { SVGNode };