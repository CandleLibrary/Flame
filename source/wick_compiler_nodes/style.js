let StyleNode = require("wick").core.source.compiler.nodes.style;

let proto = StyleNode.prototype;
proto.cssInject = proto._processTextNodeHook_;

//Hooking into the style systems allows us to track modifications in the DOM and update the appropriate CSS values and documents. 
proto._processTextNodeHook_ = function(lex) {
    //Feed the lexer to a new CSS Builder
    this.css = this._getCSS_();
    lex.IWS = true;
    lex.tl = 0;
    lex.n();

    this.css._parse_(lex).catch((e) => {
        throw e;
    }).then((css) => {
        this.flame_system.css.addTree(css);
    });

    this.css.addObserver(this);
};

proto.toString = function() {
    let str = `<${this.tag}`,
        atr = this._attributes_,
        i = -1,
        l = atr.length;

    while (++i < l) {
        let attr = atr[i];
        str += ` ${attr.name}="${attr.value}"`;
    }

    str += ">";

   	str += this.css + "";

    return str + `</${this.tag}>`;
};



proto.updatedCSS = function() {
    this.rebuild();
};

export { StyleNode };