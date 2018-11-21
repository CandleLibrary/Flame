import wick from "@galactrax/wick";



let PackageNode = wick.core.source.compiler.nodes.package;

let Lexer = wick.core.lexer;

PackageNode.prototype.buildExisting = function(element, source, presets, taps) {
    return false;
};

export {PackageNode}