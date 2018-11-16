//[Singleton]  Store unused tokens, preventing garbage collection of tokens
import wick from "wick";

var TEXT_POOL = new(function() {
    this.pool = null
    //this.token_pool = new TEXT_TOKEN();

    function Text(index, text) {
        this.text = text || "";
        this.index = index || 0;
        this.prev_sib = null;
        this.next_sib = null;
    }

    this.aquire = function(index, text) {
        var temp = this.pool;
        if (temp) {
            this.pool = temp.prev_sib;
            temp.index = index;
            temp.text = text;
            temp.prev_sib = null;
            return temp;
        } else {
            return new Text(index, text);
        }
    };

    this.release = function(object) {
        object.prev_sib = this.pool;
        this.pool = object;
    };

    for (var i = 0; i < 50; i++) {
        var temp = new Text();
        temp.prev_sib = this.pool;
        this.pool = temp;
    }
})();

//Releases given token to pool and returns that token's previous sibling.
function releaseToken(token) {
    var prev_line = token.prev_line;
    var next_line = token.next_line;

    var prev_sib = token.prev_sib;
    var next_sib = token.next_sib;

    if (prev_sib) {
        prev_sib.next_sib = next_sib;
    }
    if (next_sib) {
        next_sib.prev_sib = prev_sib;
    }
    if (prev_line) {
        if (next_sib && next_sib.IS_NEW_LINE) {
            prev_line.next_line = next_sib;
        } else {
            prev_line.next_line = next_line;
        }
    }
    if (next_line) {
        if (prev_sib && prev_sib.IS_NEW_LINE) {
            next_line.prev_line = prev_sib;
        } else {
            next_line.prev_line = prev_line;
        }
    }

    if (token.IS_NEW_LINE) {
        this.token_container.remove(token);
        this.setIndexes();
    }

    var t = token.prev_sib;
    token.reset();
    token.next_sib = this.token_pool;
    token.prev_sib = null;
    token.text = "";
    this.token_pool = token;
    return t;
}

//Either returns an existing token from pool or creates a new one and returns that.
function aquireToken(prev_token) {
    var t = this.token_pool;

    if (t) {
        if (t.next_sib) {
            this.token_pool = t.next_sib;
            this.token_pool.prev_sib = null;
        } else {
            this.token_pool = new TEXT_TOKEN(this, null);
        }
    } else {
        t = new TEXT_TOKEN(this, null);
    }

    t.reset();

    if (prev_token) {
        t.prev_line = prev_token.prev_line;
        t.next_line = prev_token.next_line;

        if (prev_token.IS_NEW_LINE) {
            t.prev_line = prev_token;
        }

        t.next_sib = prev_token.next_sib;
        t.prev_sib = prev_token;
        prev_token.next_sib = t;
        if (t.next_sib) {
            t.next_sib.prev_sib = t;
        }
    }
    return t;
}

let Pool = null;

export class TEXT_TOKEN extends wick.core.lexer.constr {
    constructor(text_fw) {
        if (Pool) {
            let out = Pool;
            Pool = out.nxt;
            out.nxt = null;
            out.text_fw = text_fw;
            out.IWS = false;
            return out;
        }
        super("");
        this.index = 0;
        this.text_fw = text_fw;
        this.nxt = null;
        this.prv = null;
        this.text_insert = null;
        this.parent = null;
        this.PARSE_STRING = true;

        //container variables
        this.line_size = 1;
        this.size = 1;
        this.pixel_height = 30;

        this.IWS = false;
    }

    release() {
        let prv = this.prv;

        if (this.nxt)
            this.nxt.prv = prv;

        if (prv)
            prv.nxt = this.nxt;

        this.reset();

        if (Pool)
            this.nxt = Pool;
        Pool = this;

        return prv;
    }

    reset() {
        super.reset();
        this.nxt = null;
        this.prv = null;
        //container variables
        this.line_size = 1;
        this.size = 1;
        this.pixel_height = 30;
        this.setString("");

    }

    removeSection(offset_shift = 0, length_shift = 0) {
        this.setString(this.str.slice(0, this.off - offset_shift) + this.str.slice(this.off + this.tl + length_shift), false);
        this.off -= offset_shift;
        this.tl = 0;
    }

    //Store new inserted text into temporary tokens, whose contents will be merged into the actual token list when parsed.
    insertText(text, char_pos) {

        var l = this.sl;

        //Account for new line character
        if (char_pos > l) {
            if (this.nxt) {
                return this.nxt.insertText(text, char_pos - l);
            } else {
                char_pos = l;
            }
        } else if (char_pos < 0) {
            if (this.prv) {
                return this.prv.insertText(text, this.prv.sl - char_pos);
            } else {
                char_pos = 0;
            }
        }

        return this.addTextCell(text, char_pos);
    }

    addTextCell(text, offset) {
        var temp = new TEXT_TOKEN(this.text_fw);
        temp.prv = null;
        temp.off = offset;
        temp.setString(text, false);
        var temp_prev = null;
        var temp_next = this.text_insert;

        if (!this.text_insert) {
            this.text_insert = temp;
        } else {
            while (true) {
                if (temp_next) {
                    if (temp_next.off <= temp.off) {
                        //insert before;
                        if (temp_prev) {
                            temp.prv = temp_next;
                            temp_prev.prv = temp;
                        } else {
                            temp.prv = temp_next;
                            this.text_insert = temp;
                        }
                        break;
                    }
                    if (!temp_next.prv) {
                        temp_next.prv = temp;
                        break;
                    }
                    temp_prev = temp_next;
                    temp_next = temp_prev.prv;
                }
            }
        }

        var token = this;

        while (token.IS_LINKED_LINE) {
            token = token.prv;
        }

        token.NEED_PARSE = true;
        return token;
    }

    //Takes the token text string and breaks it down into individual pieces, linking resulting tokens into a linked list.
    parse(FORCE) {
        //if (!this.NEED_PARSE && !FORCE) return this.nxt;

        //CACHE parse functions variables
        var code = 0,
            token_length = 0,
            temp = null;

        //Reset token type	
        this.type = "generic";

        //This function will change structure of tokens, thus resetting cache.
        this.NEED_PARSE = false;

        //Walk the temporary text chain and insert strings into the text variable : History is also appended to through here
        if (this.text_insert) {
            //These get added to history

            var i = 0;

            temp = this.text_insert;

            while (temp) {
                let text = temp.str;
                let index = temp.off + 1;
                let prev_sib = temp.prv;

                temp.release();

                //add saved text to history object in framework

                //text inserts get separated as character insertions, delete characters, and cursors
                if (index < this.str.length && index > 0) {
                    this.setString(this.str.slice(0, index) + text + this.str.slice(index));
                } else if (index > 0) {
                    this.setString(this.str + text);
                } else {
                    this.setString(text + this.str);
                }

                temp = prev_sib;
            }

            this.text_insert = null;

            //Perform a lookahead for delete characters
            while (!this.END) {
                //this.str = this.str.slice(0, i) + this.str.slice(i + 2);
                //this.tl = 0;
                this.n();
            }

            this.resetHead();

            for (i = 1; i < this.text.length; i++) {
                if (i === 0) continue;
                var s = this.text.charCodeAt(i);
                var f = this.text.charCodeAt(i - 1);
                if (( /*f !== this.text_fw.new_line_code && */ f !== this.text_fw.del_code) && s === this.text_fw.del_code) {
                    if (f === this.text_fw.new_line_code && !this.prev_sib) {
                        break;
                    }


                    i--;
                    this.text = this.text.slice(0, i) + this.text.slice(i + 2);
                    i--;
                }
            }
        }

        code = this.str.charCodeAt(0);

        //Check for existence of mismatched new line tokens
        if (!(code === this.text_fw.new_line_code || code === this.text_fw.linked_line_code)) {
            //Merge back into last line;
            debugger
            return this.mergeLeft();
        }

        let types = this.types;

        this.n().n(); //new line

        while (!this.END) {

            if (this.ty & (types.symbol |  types.new_line | types.operator)) {

                switch (this.ch.charCodeAt(0)) {
                    case this.text_fw.del_code: // Backspace Character
                        //reinsert this into the previous line
                        //get text of previous sibling
                        if (this.off == 1) { //This will delete the new line character;
                            var prev_sib = this.prv;

                            if (prev_sib) {

                                //Linked lines don't have a length, so the delete character would not be exausted.
                                if (!prev_sib.IS_LINKED_LINE) {
                                    this.text = this.text.slice(1);

                                    if (!prev_sib.prev_sib) {
                                        return this.mergeLeft();
                                    }
                                }

                                prev_sib.setString(prev_sib.str + this.str.slice(2));

                                return this.release().parse();
                            }

                        } else
                            this.removeSection(1, 1);

                        break;
                    case this.text_fw.linked_line_code: // Carriage Return // Linked Lines for text wrap
                        this.size = 0;
                        this.pixel_height = 10;
                        this.IS_LINKED_LINE = true;
                        if (!this.IS_NEW_LINE) {
                            this.text_fw.insertLine(this.prv, this);
                        }
                        this.text = this.text.slice(1);
                        this.char_start = 0;
                        token_length = 0;
                        break;
                    case this.text_fw.new_line_code: // Line Feed
                        //this.pixel_height = 30
                        this.IS_LINKED_LINE = false;
                        let str = this.str,
                            off = this.off;
                        this.setString(str.slice(0, off));
                        let nl = new TEXT_TOKEN(this.text_fw);
                        nl.setString(str.slice(off));
                        this.text_fw.insertLine(this, nl);
        				console.log(this.str);
                        return nl.parse();
                        //Cursor Character - Tells token to move specific cursor to line and character offset
                    case this.text_fw.curs_code:
                        //Update cursor position;
                        var cursor = this.text_fw.aquireCursor();
                        if (cursor) {
                            cursor.y = this.index;
                            cursor.x = this.off-1;
                        }
                        //Remove cursor section from text
                        this.removeSection();
                }
            }
            this.n();
        }

        this.resetHead();

        //Continue down chain of cells
        return this.nxt;
    }


    //Creates, or appends, a string that contains <PRE> enclosed formatted text ready for insertion into the DOM.
    renderDOM(plain_text, text) {
    	let txt = this.str.slice(1).replace(/\</g, "&lt;").replace(/\>/g, "&gt;");

        if (plain_text) {
            return txt;
        } else {
            if (this.color !== "black") 
                return `<span style="color:${this.color}">${txt}</span>`;
            
            return txt;
        }

    }

    get length() { return this.sl; }
    set length(a) {}
    get cache() { return this.str.slice(1); }
    set cache(a) {}
    get index() { return this.parent.getLineIndex(0, this); }
    set index(e) { /*this.parent.remove(this);*/ }
    get real_index() { return this.parent.getRealLineIndex(0, this); }
    set real_index(e) {}
    get pixel_offset() { return this.parent.getPixelOffset(0, this); }
    charAt(index) { return this.str[index]; }
}