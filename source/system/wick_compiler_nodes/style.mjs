import {StyleNode} from "@candlefw/wick";

let proto = StyleNode.prototype;
proto.cssInject = proto._processTextNodeHook_;

//const path = require("path");
//Hooking into the style systems allows us to track modifications in the DOM and update the appropriate CSS values and documents. 
proto.processTextNodeHook = function(lex) {

    //Feed the lexer to a new CSS Builder
    this.css = this.getCSS();
    lex.IWS = true;
    lex.tl = 0;
    lex.next();

    let URL = "";

    let IS_DOCUMENT = !!this.url;

    if (this.url) {
        debugger
        URL = this.url.path;
        if (!path.isAbsolute(URL))
            URL = path.resolve(process.cwd(), (URL[0] == ".") ? URL + "" : "." + URL);
    }

    this.css.parse(lex).catch((e) => {
        throw e;
    }).then((css) => {
        this.css = this.flame_system.css.manager.addTree(css, IS_DOCUMENT, URL);
    });

    this.css.addObserver(this);
};

proto.toString = function(off) {
    let str = `${("    ").repeat(off)}<${this.tag}`,
        atr = this.attributes,
        i = -1,
        l = atr.length;



    while (++i < l) {
        let attr = atr[i];
        str += ` ${attr.name}="${attr.value}"`;
    }

    if (!this.url && this.css) {
        str += ">\n";
        str += this.css.toString(off + 1);
        str += `${("    ").repeat(off)}</${this.tag}>\n`;
    } else {
        str += `></${this.tag}>\n`;
    }

    return str;
};

proto.updatedCSS = function() {
    this.rebuild();
};

proto.buildExisting = () => { return false }

export { StyleNode };
