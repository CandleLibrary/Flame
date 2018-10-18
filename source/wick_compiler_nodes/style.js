let StyleNode = require("wick").core.source.compiler.nodes.style;

let proto = StyleNode.prototype;
proto.cssInject = proto._processTextNodeHook_;

const  path = require("path")
//Hooking into the style systems allows us to track modifications in the DOM and update the appropriate CSS values and documents. 
proto._processTextNodeHook_ = function(lex) {
    //Feed the lexer to a new CSS Builder
    this.css = this._getCSS_();
    lex.IWS = true;
    lex.tl = 0;
    lex.n();

    let URL = "";
    
    let IS_DOCUMENT = !!this.url;
    
    if(this.url){
        let url =this.url.path
        URL = path.resolve(process.cwd(), (url[0] == ".") ? url + "" : "." + url).replace(/\\/g,"/");
    }

    this.css._parse_(lex).catch((e) => {
        throw e;
    }).then((css) => {
        this.css = this.flame_system.css.addTree(css, IS_DOCUMENT, URL);
    });

    this.css.addObserver(this);
};

proto.toString = function(off) {
    let str = `${("    ").repeat(off)}<${this.tag}`,
        atr = this._attributes_,
        i = -1,
        l = atr.length;



    while (++i < l) {
        let attr = atr[i];
        str += ` ${attr.name}="${attr.value}"`;
    }

    if(!this.url){
        str += ">\n";
        str += this.css.toString(off + 1);
        str += `${("    ").repeat(off)}</${this.tag}>\n`;
    }else{
        str += `></${this.tag}>\n`;
    }

    return str;
};

proto.updatedCSS = function() {
    this.rebuild();
};

proto.build_existing = ()=>{}

export { StyleNode };