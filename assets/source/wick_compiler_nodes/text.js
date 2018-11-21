import wick from "@galactrax/wick";


let RootText = wick.core.source.compiler.nodes.text;
import {RootNode} from "./root";

RootText.prototype.createElement = RootNode.prototype.createElement;
RootText.prototype.setSource = RootNode.prototype.setSource;
// Rebuild all sources relying on this node
RootText.prototype.rebuild = RootNode.prototype.rebuild;
RootText.prototype.buildExisting = ()=>{return true}; RootNode.prototype.build_existing;
RootText.prototype.setRebuild = RootNode.prototype.setRebuild;
RootText.prototype.resetRebuild = RootNode.prototype.resetRebuild;
RootText.prototype.updated = function(){};

export { RootText };