import wick from "@galactrax/wick";



let Script = wick.core.source.compiler.nodes.script;

Script.prototype.cssInject = Script.prototype._processTextNodeHook_;

const path = require("path");
//Hooking into the style systems allows us to track modifications in the DOM and update the appropriate CSS values and documents. 
/*Script.prototype._processTextNodeHook_ = function(lex) {
    //Feed the lexer to a new CSS Builder
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

    this.css._parse_(lex).catch((e) => {
        throw e;
    }).then((css) => {
        this.css = this.flame_system.css.addTree(css, IS_DOCUMENT, URL);
    });

    this.css.addObserver(this);
};*/

Script.prototype.toString = function(off) {
    return off + "script";
};

Script.prototype.updatedCSS = function() {
    this.rebuild();
};

Script.prototype.buildExisting = () => { return false };

export { Script };