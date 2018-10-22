
let RootText = require("wick").core.source.compiler.nodes.text;
import {RootNode} from "./root";

RootText.prototype.createElement = RootNode.prototype.createElement;
RootText.prototype.setSource = RootNode.prototype.setSource;
// Rebuild all sources relying on this node
RootText.prototype.rebuild = RootNode.prototype.rebuild;
RootText.prototype.build_existing = ()=>{return true}; RootNode.prototype.build_existing;
RootText.prototype.setRebuild = RootNode.prototype.setRebuild;
RootText.prototype.resetRebuild = RootNode.prototype.resetRebuild;

export { RootText };