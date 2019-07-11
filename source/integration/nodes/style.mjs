export default function(prototype, env) {

    prototype.cssInject = prototype._processTextNodeHook_;

    //const path = require("path");
    //Hooking into the style systems allows us to track modifications in the DOM and update the appropriate CSS values and documents. 
    prototype.processTextNodeHook = function(lex) {

        //Feed the lexer to a new CSS Builder
        this.css = this.getCSS();
        lex.IWS = true;
        lex.tl = 0;
        lex.next();

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
            this.css = this.flame_system.css.manager.addTree(css, IS_DOCUMENT, URL);
        });

        this.css.addObserver(this);
    };

    prototype.toString = function(off) {
        var o = offset.repeat(off),
            str = `${o}<${this.tag}`;

        for (const attr of this.attribs.values()) {
            if (attr.name)
                str += ` ${attr.name}="${attr.value}"`;
        }

        str += ">\n";

        if (!this.url && this.children[0]) {
            str += this.children[0].toString(off + 1);
            str += `${("    ").repeat(off)}</${this.tag}>\n`;
        } else {
            str += `</${this.tag}>\n`;
        }

        return str;
    };

    prototype.updatedCSS = function() {
        this.rebuild();
    };

    prototype.buildExisting = () => { return false };

}

const offset = "    ";