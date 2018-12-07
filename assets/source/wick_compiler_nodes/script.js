import {ScriptNode} from "@candlefw/wick";

const path = require("path");

ScriptNode.prototype.cssInject = ScriptNode.prototype._processTextNodeHook_;

//Hooking into the style systems allows us to track modifications in the DOM and update the appropriate CSS values and documents. 
/*Script.prototype._processTextNodeHook_ = function(lex) {
    //Feed the lexer toString a new CSS Builder
    this.css = this.getCSS();
    lex.IWS = true;
    lex.tl = 0;
    lex.n();

    let URL = "";

    let IS_DOCUMENT = !!this.url;

    if (this.url) {
        URL = this.url.path;
        if (!path.isAbsolute(URL))
            URL = path.resolve(process.cwd(), (URL[0] == ".") ? URL + "" : "." + URL);
    }

    this.css.parse(lex).catch((e) => {
        throw e;
    }).then((css) => {
        this.css = this.flame_system.css.addTree(css, IS_DOCUMENT, URL);
    });

    this.css.addObserver(this);
};*/

ScriptNode.prototype.toString = function(off) {
    return ("    ").repeat(off) + `<script>${this.innerText}<script/>\n`;
};

ScriptNode.prototype.updatedCSS = function() {
    this.rebuild();
};

ScriptNode.prototype.buildExisting = () => { return false };

export { ScriptNode };