import {ScriptNode} from "@candlefw/wick";

ScriptNode.prototype.toString = function(off) {
    return ("    ").repeat(off) + `<script on="((${this.binding.tap_name}))" >${this.script_text}</script>\n`;
};

ScriptNode.prototype.updatedCSS = function() {
    this.rebuild();
};

ScriptNode.prototype.buildExisting = () => { return false };

export { ScriptNode };