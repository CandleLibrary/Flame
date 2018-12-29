'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));

//Main dna for containing line tokens
class Container_Cell {
    constructor(IS_LEAF = true) {
        this.keys = [];
        this.parent = null;
        this.IS_LEAF = IS_LEAF;
        this.IS_ROOT = false;
        this.num_lines = 0;
        this.num_virtual_lines = 0;
        this.pixel_offset = 0;
    }

    getIndex() {
        var keys = this.parent.keys;
        for (var i = 0, l = keys.length; i < l; i++) {
            if (keys[i] === this) return i;
        }
        return -1;
    }

    getLine(offset) {
        if (this.IS_LEAF) {
            if (offset > this.num_lines) offset = this.num_lines - 1;
            return this.keys[offset];
        } else {
            for (var i = 0, l = this.keys.length; i < l; i++) {
                var key = this.keys[i];
                if (offset < key.num_lines) {
                    return key.getLine(offset);
                } else offset -= key.num_lines;
            }
            return this.keys[this.keys.length - 1].getLine(offset);
        }
    }

    getVirtualLine(offset) {
        if (this.IS_LEAF) {
            for (let i = 0, l = this.keys.length; i < l; i++) {
                let line = this.keys[i];

                if (offset < line.virtual_line_size && line.virtual_line_size > 0) {
                    return line;
                } else offset -= line.virtual_line_size;
            }
        } else {
            for (let i = 0, l = this.keys.length; i < l; i++) {
                let cell = this.keys[i];
                if (offset < cell.num_virtual_lines) {
                    return cell.getVirtualLine(offset);
                } else offset -= cell.num_virtual_lines;
            }
            return this.keys[this.keys.length - 1].getVirtualLine(offset);
        }
    }

    getLineAtPixelOffset(offset) {
        if (this.IS_LEAF) {
            for (let i = 0, l = this.keys.length; i < l; i++) {
                let cell = this.keys[i];
                if (offset < cell.pixel_height && cell.pixel_height > 0) {
                    return cell;
                } else offset -= cell.pixel_height;
            }
            return cell;
        } else {
            for (let i = 0, l = this.keys.length; i < l; i++) {
                let cell = this.keys[i];
                if (offset < cell.pixel_offset) {
                    return cell.getLineAtPixelOffset(offset);
                } else offset -= cell.pixel_offset;
            }
            return cell.getLineAtPixelOffset(offset);
        }
    }

    getLineIndex(index, line, id) {
        if (this.IS_LEAF) {
            let i = 0;
            for (let l = this.num_lines; i < l; i++) {
                if (this.keys[i] === line) break;
            }
            index = i;
        } else {
            var sibs = this.keys;
            let i = id;
            while (i > 0) {
                i--;
                index += sibs[i].num_lines;
            }
        }

        if (!this.parent.IS_ROOT) return this.parent.getLineIndex(index, null, this.getIndex());

        return index;
    }

    getVirtualLineIndex(index, line, id) {
        if (this.IS_LEAF) {
            index = -1; //WTF
            for (let i = 0, l = this.num_lines; i < l; i++) {
                var key = this.keys[i];
                index += key.virtual_line_size;
                if (key === line) break;
            }
        } else {
            var sibs = this.keys;
            let i = id;
            while (i > 0) {
                i--;
                index += sibs[i].num_virtual_lines;
            }
        }

        if (!this.parent.IS_ROOT) return this.parent.getVirtualLineIndex(index, null, this.getIndex());


        return index;
    }

    getPixelOffset(pixel_top, line, id) {
        if (this.IS_LEAF) {
            //pixel_top = -1; //WTF
            for (let i = 0, l = this.num_lines; i < l; i++) {
                var key = this.keys[i];
                if (key === line) break;
                pixel_top += key.pixel_height;
            }
        } else {
            var sibs = this.keys;
            let i = id;
            while (i > 0) {
                i--;
                pixel_top += sibs[i].pixel_offset;
            }
        }

        if (!this.parent.IS_ROOT) return this.parent.getPixelOffset(pixel_top, null, this.getIndex());

        return pixel_top;
    }

    balanceInsert(max_size, IS_ROOT = false) {

        if (this.keys.length >= max_size) {
            //need to split this up!
            let vl = this.num_virtual_lines,
                nl = this.num_lines,
                pl = this.pixel_offset;

            let right = new Container_Cell(this.IS_LEAF);

            let split = (max_size >> 1) | 0;
            
            let right_keys = this.keys.slice(split);
            right_keys.forEach(k=>k.parent = right);
            right.keys = right_keys;


            let left_keys = this.keys.slice(0, split);
            this.keys = left_keys;

            //console.log(split, this.keys[this.keys.length-1].str, right.keys[0].str)

            this.getLineCount();

            right.num_lines = nl - this.num_lines;
            right.num_virtual_lines = vl - this.num_virtual_lines;
            right.pixel_offset = pl - this.pixel_offset;

            if (IS_ROOT) {
                let root = new Container_Cell(false);

                root.num_lines = nl;
                root.num_virtual_lines = vl;
                root.pixel_offset = pl;

                root.keys.push(this, right);
                this.parent = root;
                right.parent = root;
                return root;
            }

            right.parent = this.parent;

            return right;
        }

        return this;
    }

    /**
        Inserts model into the tree, sorted by identifier. 
    */
    insert(index, line, max_size, IS_ROOT = false) {


        let l = this.keys.length;

        if (!this.IS_LEAF) {
            let key;

            for (var i = 0; i < l; i++) {

                key = this.keys[i];

                if (index < key.num_lines) {
                    let out_key = key.insert(index, line, max_size, false);

                    if (out_key !== key)
                        this.keys.splice(i+1, 0, out_key);

                    this.num_lines++;
                    this.num_virtual_lines += line.virtual_line_size;
                    this.pixel_offset += line.pixel_height;

                    return this.balanceInsert(max_size, IS_ROOT);
                } else
                    index -= key.num_lines;
            }

            let out_key = key.insert(Infinity, line, max_size, false);

            if (out_key !== key)
                this.keys.push(out_key);

            this.num_lines++;
            this.num_virtual_lines += line.virtual_line_size;
            this.pixel_offset += line.pixel_height;

            return this.balanceInsert(max_size, IS_ROOT);

        } else {

            line.parent = this;

            this.keys.splice(index, 0, line);

            this.num_lines++;
            this.num_virtual_lines += line.virtual_line_size;
            this.pixel_offset += line.pixel_height;

            return this.balanceInsert(max_size, IS_ROOT);
        }
    }

    remove(start, end, min_size, IS_ROOT = false) {
        let l = this.keys.length,
            nl, vl, pl;

        if (!this.IS_LEAF) {
            let n = 0,
                p = 0,
                v = 0;

            var key;

            for (var i = 0; i < l; i++) {

                key = this.keys[i];

                if (start < key.num_lines) {
                    let { nl, vl, pl } = key.remove(start, end, min_size, false);
                    n += nl;
                    v += vl;
                    p += pl;
                    break;
                }

                start -= key.num_lines;
                end -= key.num_lines;
            }
            /*
            if (start <= key.num_lines && end >= 0) {
                let { nl, vl, pl } = key.remove(start, end, min_size, false);
                n += nl;
                v += vl;
                p += pl;
            }*/

            for (i = 0; i < this.keys.length; i++) {
                if (this.keys[i].keys.length < min_size) {
                    if (this.balanceRemove(i, min_size)) {
                        l--;
                        i--;
                    }
                }
            }

            nl = n;
            pl = p;
            vl = v;

        } else {
            let v = 0,
                p = 0,
                n = 0;
            let line = this.keys[start];
            this.keys.splice(start, 1);
            n++;
            v += line.virtual_line_size;
            p += line.pixel_height;

            /*
            for (let i = 0, j = 0, l = this.keys.length; i < l && j <= end; i++, j++) {
                if (j >= start && j <= end) {
                    let line = this.keys[i];
                    this.keys.splice(i, 1);
                    l--;
                    i--;
                    n++;
                    v += line.virtual_line_size;
                    p += line.pixel_height;
                }
            }
            */
            nl = n;
            pl = p;
            vl = v;
        }

        this.num_lines -= nl;
        this.num_virtual_lines -= vl;
        this.pixel_offset -= pl;

        return { nl, vl, pl };
    }

    balanceRemove(index, min_size) {
        let left = this.keys[index - 1];
        let right = this.keys[index + 1];
        let key = this.keys[index];
        let n = 1,
            v = 0,
            p = 0;

        //Left rotate
        if (left && left.keys.length > min_size) {
            let lk = left.keys.length;
            let tsfr = left.keys[lk - 1];
            key.keys.unshift(tsfr);
            left.keys.length = lk - 1;
            
            tsfr.parent = key;

            if (key.IS_LEAF)
                v = tsfr.virtual_line_size, p = tsfr.pixel_height;
            else
                n = tsfr.num_lines, v = tsfr.num_virtual_lines, p = tsfr.pixel_offset;

            key.num_lines += n;
            key.num_virtual_lines += v;
            key.pixel_offset += p;

            left.num_lines -= n;
            left.num_virtual_lines -= v;
            left.pixel_offset -= p;

            return false;
        } else if (right && right.keys.length > min_size) {
            //Right rotate
            let tsfr = right.keys[0];
            key.keys.push(tsfr);
            right.keys.splice(0, 1);
            
            tsfr.parent = key;

            if (key.IS_LEAF)
                v = tsfr.virtual_line_size, p = tsfr.pixel_height;
            else
                n = tsfr.num_lines, v = tsfr.num_virtual_lines, p = tsfr.pixel_offset;

            key.num_lines += n;
            key.num_virtual_lines += v;
            key.pixel_offset += p;

            right.num_lines -= n;
            right.num_virtual_lines -= v;
            right.pixel_offset -= p;

            return false;

        } else {
            //Left or Right Merge
            if (!left) {
                index++;
                left = key;
                key = right;
            }

            key.keys.forEach(k=>k.parent = left);

            left.keys = left.keys.concat(key.keys);
            left.num_lines += key.num_lines;
            left.num_virtual_lines += key.num_virtual_lines;
            left.pixel_offset += key.pixel_offset;
            
            this.keys.splice(index, 1);

            return true;
        }
    }

    getLineCount() {
        var num = 0,
            num2 = 0,
            num3 = 0;
        if (this.IS_LEAF) {
            for (var i = 0, l = this.keys.length; i < l; i++) {
                num += this.keys[i].virtual_line_size;
                num2 += this.keys[i].pixel_height;
            }
            this.num_lines = this.keys.length;
            this.num_virtual_lines = num;
            this.pixel_offset = num2;
        } else {
            for (var i = 0, l = this.keys.length; i < l; i++) {
                num += this.keys[i].num_lines;
                num2 += this.keys[i].num_virtual_lines;
                num3 += this.keys[i].pixel_offset;
            }
            this.num_lines = num;
            this.num_virtual_lines = num2;
            this.pixel_offset = num3;
        }

        return this.num_lines;
    }

    setAsParent() {
        for (var i = 0, l = this.keys.length; i < l; i++) 
            this.keys[i].parent = this;
    }

    incrementNumOfVirtualLines(i) {
        if (i < 1) return;
        this.num_virtual_lines += i;
        this.parent.incrementNumOfVirtualLines(i);
    }

    decrementNumOfVirtualLines(i) {
        if (i < 1) return;
        this.num_virtual_lines -= i;
        this.parent.decrementNumOfVirtualLines(i);
    }

    incrementNumOfLines() {
        this.num_lines++;
        this.parent.incrementNumOfLines();
    }

    decrementNumOfLines() {
        this.num_lines--;
        this.parent.decrementNumOfLines();
    }

    incrementPixelOffset(px) {
        this.pixel_offset += px;
        this.parent.incrementPixelOffset(px);
    }

    decrementPixelOffset(px) {
        this.pixel_offset -= px;
        this.parent.decrementPixelOffset(px);
    }

    updateHeight(diff) {
        if (diff) {
            this.pixel_offset += diff;
            this.parent.updateHeight(diff);
        }
    }
}



class LineContainer {
    constructor() {
        this.root = null;
        this.IS_ROOT = true;
        this.num_lines = 0;
        this.num_virtual_lines = 0;
        this.max_size = 60;
        this.min_size = (this.max_size / 2) | 0;
    }

    incrementNumOfLines() {
        this.num_lines++;
    }

    decrementNumOfLines() {
        this.num_lines--;
    }

    incrementNumOfVirtualLines(i) {
        this.num_virtual_lines += i;
    }

    decrementNumOfVirtualLines(i) {
        this.num_virtual_lines -= i;
    }

    incrementPixelOffset(px) {
        this.pixel_offset += px;
    }

    decrementPixelOffset(px) {
        this.pixel_offset -= px;
    }

    getLine(index) {
        if (index >= this.length) index = this.length - 1;
        return this.root.getLine(index);
    }

    getVirtualLine(index) {
        if (index >= this.num_virtual_lines) index = this.num_virtual_lines - 1;
        return this.root.getVirtualLine(index);
    }

    getLineAtPixelOffset(pixel_height) {
        if (pixel_height >= this.pixel_offset) {
            pixel_height = this.pixel_offset - 1;
        }

        if (!this.root) return 0;
        return this.root.getLineAtPixelOffset(pixel_height);
    }

    //Transition ****************************
    getIndexedLine(offset) {
        return this.getLine(offset);
    }

    get count() {
        return this.root.num_lines;
    }

    get countWL() {
        return this.root.num_lines;
    }
    setIndexes() {}

    getHeight() {
        return this.num_lines;
    }

    get height() {
        return this.num_lines;
    }

    get pixel_offset(){
        return this.root.pixel_offset;
    }

    updateHeight(diff) {}


    //**********************************************************
    get length() {
        return (this.root) ? this.root.num_lines : 0;
    }

    insert(line, index = Infinity) {
        if (!this.root)
            this.root = new Container_Cell();

        let root = this.root.insert(index, line, this.max_size, true);
        this.root = root;
        this.root.parent = this;
        this.num_lines = this.root.num_lines;
        this.pixel_height = this.root.pixel_offset;
        this.num_virtual_lines = this.root.num_virtual_lines;
    }

    remove(line) {
        let index = line.index;

        this.root.remove(index, index, this.min_size, true);

        if (this.root.keys.length == 1 && this.root.keys[0] instanceof Container_Cell) {
            this.root = this.root.keys[0];
            this.root.parent = this;
        }
    }
}

const A = 65;
const a = 97;
const ACKNOWLEDGE = 6;
const AMPERSAND = 38;
const ASTERISK = 42;
const AT = 64;
const B = 66;
const b = 98;
const BACKSLASH = 92;
const BACKSPACE = 8;
const BELL = 7;
const C = 67;
const c = 99;
const CANCEL = 24;
const CARET = 94;
const CARRIAGE_RETURN = 13;
const CLOSE_CURLY = 125;
const CLOSE_PARENTH = 41;
const CLOSE_SQUARE = 93;
const COLON = 58;
const COMMA = 44;
const d = 100;
const D = 68;
const DATA_LINK_ESCAPE = 16;
const DELETE = 127;
const DEVICE_CTRL_1 = 17;
const DEVICE_CTRL_2 = 18;
const DEVICE_CTRL_3 = 19;
const DEVICE_CTRL_4 = 20;
const DOLLAR = 36;
const DOUBLE_QUOTE = 34;
const e$1 = 101;
const E = 69;
const EIGHT = 56;
const END_OF_MEDIUM = 25;
const END_OF_TRANSMISSION = 4;
const END_OF_TRANSMISSION_BLOCK = 23;
const END_OF_TXT = 3;
const ENQUIRY = 5;
const EQUAL = 61;
const ESCAPE = 27;
const EXCLAMATION = 33;
const f = 102;
const F = 70;
const FILE_SEPERATOR = 28;
const FIVE = 53;
const FORM_FEED = 12;
const FORWARD_SLASH = 47;
const FOUR = 52;
const g = 103;
const G = 71;
const GRAVE = 96;
const GREATER_THAN = 62;
const GROUP_SEPERATOR = 29;
const h = 104;
const H = 72;
const HASH = 35;
const HORIZONTAL_TAB = 9;
const HYPHEN = 45;
const i = 105;
const I = 73;
const j = 106;
const J = 74;
const k = 107;
const K = 75;
const l = 108;
const L = 76;
const LESS_THAN = 60;
const LINE_FEED = 10;
const m = 109;
const M = 77;
const n = 110;
const N = 78;
const NEGATIVE_ACKNOWLEDGE = 21;
const NINE = 57;
const NULL = 0;
const o = 111;
const O = 79;
const ONE = 49;
const OPEN_CURLY = 123;
const OPEN_PARENTH = 40;
const OPEN_SQUARE = 91;
const p = 112;
const P = 80;
const PERCENT = 37;
const PERIOD = 46;
const PLUS = 43;
const q = 113;
const Q = 81;
const QMARK = 63;
const QUOTE = 39;
const r = 114;
const R = 82;
const RECORD_SEPERATOR = 30;
const s = 115;
const S = 83;
const SEMICOLON = 59;
const SEVEN = 55;
const SHIFT_IN = 15;
const SHIFT_OUT = 14;
const SIX = 54;
const SPACE = 32;
const START_OF_HEADER = 1;
const START_OF_TEXT = 2;
const SUBSTITUTE = 26;
const SYNCH_IDLE = 22;
const t = 116;
const T = 84;
const THREE = 51;
const TILDE = 126;
const TWO = 50;
const u = 117;
const U = 85;
const UNDER_SCORE = 95;
const UNIT_SEPERATOR = 31;
const v = 118;
const V = 86;
const VERTICAL_BAR = 124;
const VERTICAL_TAB = 11;
const w = 119;
const W = 87;
const x$1 = 120;
const X = 88;
const y$1 = 121;
const Y = 89;
const z = 122;
const Z = 90;
const ZERO = 48;

/**
 * Lexer Jump table reference 
 * 0. NUMBER
 * 1. IDENTIFIER
 * 2. QUOTE STRING
 * 3. SPACE SET
 * 4. TAB SET
 * 5. CARIAGE RETURN
 * 6. LINEFEED
 * 7. SYMBOL
 * 8. OPERATOR
 * 9. OPEN BRACKET
 * 10. CLOSE BRACKET 
 * 11. DATA_LINK
 */ 
const jump_table = [
7, 	 	/* A */
7, 	 	/* a */
7, 	 	/* ACKNOWLEDGE */
7, 	 	/* AMPERSAND */
7, 	 	/* ASTERISK */
7, 	 	/* AT */
7, 	 	/* B */
7, 	 	/* b */
7, 	 	/* BACKSLASH */
4, 	 	/* BACKSPACE */
6, 	 	/* BELL */
7, 	 	/* C */
7, 	 	/* c */
5, 	 	/* CANCEL */
7, 	 	/* CARET */
11, 	/* CARRIAGE_RETURN */
7, 	 	/* CLOSE_CURLY */
7, 	 	/* CLOSE_PARENTH */
7, 	 	/* CLOSE_SQUARE */
7, 	 	/* COLON */
7, 	 	/* COMMA */
7, 	 	/* d */
7, 	 	/* D */
7, 	 	/* DATA_LINK_ESCAPE */
7, 	 	/* DELETE */
7, 	 	/* DEVICE_CTRL_1 */
7, 	 	/* DEVICE_CTRL_2 */
7, 	 	/* DEVICE_CTRL_3 */
7, 	 	/* DEVICE_CTRL_4 */
7, 	 	/* DOLLAR */
7, 	 	/* DOUBLE_QUOTE */
7, 	 	/* e */
3, 	 	/* E */
8, 	 	/* EIGHT */
2, 	 	/* END_OF_MEDIUM */
7, 	 	/* END_OF_TRANSMISSION */
7, 	 	/* END_OF_TRANSMISSION_BLOCK */
8, 	 	/* END_OF_TXT */
8, 	 	/* ENQUIRY */
2, 	 	/* EQUAL */
9, 	 	/* ESCAPE */
10, 	 /* EXCLAMATION */
8, 	 	/* f */
8, 	 	/* F */
7, 	 	/* FILE_SEPERATOR */
7, 	 	/* FIVE */
7, 	 	/* FORM_FEED */
7, 	 	/* FORWARD_SLASH */
0, 	 	/* FOUR */
0, 	 	/* g */
0, 	 	/* G */
0, 	 	/* GRAVE */
0, 	 	/* GREATER_THAN */
0, 	 	/* GROUP_SEPERATOR */
0, 	 	/* h */
0, 	 	/* H */
0, 	 	/* HASH */
0, 	 	/* HORIZONTAL_TAB */
8, 	 	/* HYPHEN */
7, 	 	/* i */
8, 	 	/* I */
8, 	 	/* j */
8, 	 	/* J */
7, 	 	/* k */
7, 	 	/* K */
1, 	 	/* l */
1, 	 	/* L */
1, 	 	/* LESS_THAN */
1, 	 	/* LINE_FEED */
1, 	 	/* m */
1, 	 	/* M */
1, 	 	/* n */
1, 	 	/* N */
1, 	 	/* NEGATIVE_ACKNOWLEDGE */
1, 	 	/* NINE */
1, 	 	/* NULL */
1, 	 	/* o */
1, 	 	/* O */
1, 	 	/* ONE */
1, 	 	/* OPEN_CURLY */
1, 	 	/* OPEN_PARENTH */
1, 	 	/* OPEN_SQUARE */
1, 	 	/* p */
1, 	 	/* P */
1, 	 	/* PERCENT */
1, 	 	/* PERIOD */
1, 	 	/* PLUS */
1, 	 	/* q */
1, 	 	/* Q */
1, 	 	/* QMARK */
1, 	 	/* QUOTE */
9, 	 	/* r */
7, 	 	/* R */
10, 	/* RECORD_SEPERATOR */
7, 	 	/* s */
7, 	 	/* S */
2, 	 	/* SEMICOLON */
1, 	 	/* SEVEN */
1, 	 	/* SHIFT_IN */
1, 	 	/* SHIFT_OUT */
1, 	 	/* SIX */
1, 	 	/* SPACE */
1, 	 	/* START_OF_HEADER */
1, 	 	/* START_OF_TEXT */
1, 	 	/* SUBSTITUTE */
1, 	 	/* SYNCH_IDLE */
1, 	 	/* t */
1, 	 	/* T */
1, 	 	/* THREE */
1, 	 	/* TILDE */
1, 	 	/* TWO */
1, 	 	/* u */
1, 	 	/* U */
1, 	 	/* UNDER_SCORE */
1, 	 	/* UNIT_SEPERATOR */
1, 	 	/* v */
1, 	 	/* V */
1, 	 	/* VERTICAL_BAR */
1, 	 	/* VERTICAL_TAB */
1, 	 	/* w */
1, 	 	/* W */
1, 	 	/* x */
1, 	 	/* X */
9, 	 	/* y */
7, 	 	/* Y */
10,  	/* z */
7,  	/* Z */
7 		/* ZERO */
];	

/**
 * LExer Number and Identifier jump table reference
 * Number are masked by 12(4|8) and Identifiers are masked by 10(2|8)
 * entries marked as `0` are not evaluated as either being in the number set or the identifier set.
 * entries marked as `2` are in the identifier set but not the number set
 * entries marked as `4` are in the number set but not the identifier set
 * entries marked as `8` are in both number and identifier sets
 */
const number_and_identifier_table = [
0, 		/* A */
0, 		/* a */
0, 		/* ACKNOWLEDGE */
0, 		/* AMPERSAND */
0, 		/* ASTERISK */
0, 		/* AT */
0,		/* B */
0,		/* b */
0,		/* BACKSLASH */
0,		/* BACKSPACE */
0,		/* BELL */
0,		/* C */
0,		/* c */
0,		/* CANCEL */
0,		/* CARET */
0,		/* CARRIAGE_RETURN */
0,		/* CLOSE_CURLY */
0,		/* CLOSE_PARENTH */
0,		/* CLOSE_SQUARE */
0,		/* COLON */
0,		/* COMMA */
0,		/* d */
0,		/* D */
0,		/* DATA_LINK_ESCAPE */
0,		/* DELETE */
0,		/* DEVICE_CTRL_1 */
0,		/* DEVICE_CTRL_2 */
0,		/* DEVICE_CTRL_3 */
0,		/* DEVICE_CTRL_4 */
0,		/* DOLLAR */
0,		/* DOUBLE_QUOTE */
0,		/* e */
0,		/* E */
0,		/* EIGHT */
0,		/* END_OF_MEDIUM */
0,		/* END_OF_TRANSMISSION */
8,		/* END_OF_TRANSMISSION_BLOCK */
0,		/* END_OF_TXT */
0,		/* ENQUIRY */
0,		/* EQUAL */
0,		/* ESCAPE */
0,		/* EXCLAMATION */
0,		/* f */
0,		/* F */
0,		/* FILE_SEPERATOR */
2,		/* FIVE */
4,		/* FORM_FEED */
0,		/* FORWARD_SLASH */
8,		/* FOUR */
8,		/* g */
8,		/* G */
8,		/* GRAVE */
8,		/* GREATER_THAN */
8,		/* GROUP_SEPERATOR */
8,		/* h */
8,		/* H */
8,		/* HASH */
8,		/* HORIZONTAL_TAB */
0,		/* HYPHEN */
0,		/* i */
0,		/* I */
0,		/* j */
0,		/* J */
0,		/* k */
0,		/* K */
2,		/* l */
8,		/* L */
2,		/* LESS_THAN */
2,		/* LINE_FEED */
8,		/* m */
2,		/* M */
2,		/* n */
2,		/* N */
2,		/* NEGATIVE_ACKNOWLEDGE */
2,		/* NINE */
2,		/* NULL */
2,		/* o */
2,		/* O */
2,		/* ONE */
8,		/* OPEN_CURLY */
2,		/* OPEN_PARENTH */
2,		/* OPEN_SQUARE */
2,		/* p */
2,		/* P */
2,		/* PERCENT */
2,		/* PERIOD */
2,		/* PLUS */
2,		/* q */
8,		/* Q */
2,		/* QMARK */
2,		/* QUOTE */
0,		/* r */
0,		/* R */
0,		/* RECORD_SEPERATOR */
0,		/* s */
2,		/* S */
0,		/* SEMICOLON */
2,		/* SEVEN */
8,		/* SHIFT_IN */
2,		/* SHIFT_OUT */
2,		/* SIX */
2,		/* SPACE */
2,		/* START_OF_HEADER */
2,		/* START_OF_TEXT */
2,		/* SUBSTITUTE */
2,		/* SYNCH_IDLE */
2,		/* t */
2,		/* T */
2,		/* THREE */
2,		/* TILDE */
2,		/* TWO */
8,		/* u */
2,		/* U */
2,		/* UNDER_SCORE */
2,		/* UNIT_SEPERATOR */
2,		/* v */
2,		/* V */
2,		/* VERTICAL_BAR */
2,		/* VERTICAL_TAB */
2,		/* w */
8,		/* W */
2,		/* x */
2,		/* X */
0,		/* y */
0,		/* Y */
0,		/* z */
0,		/* Z */
0		/* ZERO */
];

const number = 1,
    identifier = 2,
    string = 4,
    white_space = 8,
    open_bracket = 16,
    close_bracket = 32,
    operator = 64,
    symbol = 128,
    new_line = 256,
    data_link = 512,
    alpha_numeric = (identifier | number),
    white_space_new_line = (white_space | new_line),
    Types = {
        num: number,
        number,
        id: identifier,
        identifier,
        str: string,
        string,
        ws: white_space,
        white_space,
        ob: open_bracket,
        open_bracket,
        cb: close_bracket,
        close_bracket,
        op: operator,
        operator,
        sym: symbol,
        symbol,
        nl: new_line,
        new_line,
        dl: data_link,
        data_link,
        alpha_numeric,
        white_space_new_line,
    },

/*** MASKS ***/

TYPE_MASK = 0xF,
PARSE_STRING_MASK = 0x10,
IGNORE_WHITESPACE_MASK = 0x20,
CHARACTERS_ONLY_MASK = 0x40,
TOKEN_LENGTH_MASK = 0xFFFFFF80,

//De Bruijn Sequence for finding index of right most bit set.
//http://supertech.csail.mit.edu/papers/debruijn.pdf
debruijnLUT = [ 
    0, 1, 28, 2, 29, 14, 24, 3, 30, 22, 20, 15, 25, 17, 4, 8, 
    31, 27, 13, 23, 21, 19, 16, 7, 26, 12, 18, 6, 11, 5, 10, 9
];

function getNumbrOfTrailingZeroBitsFromPowerOf2(value){
    return debruijnLUT[(value * 0x077CB531) >>> 27];
}

class Lexer {

    constructor(string = "", INCLUDE_WHITE_SPACE_TOKENS = false, PEEKING = false) {

        if (typeof(string) !== "string") throw new Error("String value must be passed to Lexer");

        /**
         * The string that the Lexer tokenizes.
         */
        this.str = string;

        /**
         * Reference to the peeking Lexer.
         */
        this.p = null;

        /**
         * The type id of the current token.
         */
        this.type = 32768; //Default "non-value" for types is 1<<15;

        /**
         * The offset in the string of the start of the current token.
         */
        this.off = 0;

        this.masked_values = 0;

        /**
         * The character offset of the current token within a line.
         */
        this.char = 0;
        /**
         * The line position of the current token.
         */
        this.line = 0;
        /**
         * The length of the string being parsed
         */
        this.sl = string.length;
        /**
         * The length of the current token.
         */
        this.tl = 0;

        /**
         * Flag to ignore white spaced.
         */
        this.IWS = !INCLUDE_WHITE_SPACE_TOKENS;

        /**
         * Flag to force the lexer to parse string contents
         */
         this.PARSE_STRING = false;

        if (!PEEKING) this.next();
    }

    /**
     * Restricts max parse distance to the other Lexer's current position.
     * @param      {Lexer}  Lexer   The Lexer to limit parse distance by.
     */
    fence(marker = this) {
        if (marker.str !== this.str)
            return;
        this.sl = marker.off;
        return this;
    }

    /**
     * Copies the Lexer.
     * @return     {Lexer}  Returns a new Lexer instance with the same property values.
     */
    copy( destination = new Lexer(this.str, false, true) ) {
        destination.off = this.off;
        destination.char = this.char;
        destination.line = this.line;
        destination.sl = this.sl;
        destination.masked_values = this.masked_values;
        return destination;
    }

    /**
     * Given another Lexer with the same `str` property value, it will copy the state of that Lexer.
     * @param      {Lexer}  [marker=this.peek]  The Lexer to clone the state from. 
     * @throws     {Error} Throws an error if the Lexers reference different strings.
     * @public
     */
    sync(marker = this.p) {

        if (marker instanceof Lexer) {
            if (marker.str !== this.str) throw new Error("Cannot sync Lexers with different strings!");
            this.off = marker.off;
            this.char = marker.char;
            this.line = marker.line;
            this.masked_values = marker.masked_values;
        }

        return this;
    }

    /**
     * Will throw a new Error, appending the parsed string line and position information to the the error message passed into the function.
     * @instance
     * @public
     * @param {String} message - The error message.
     */
    throw (message) {
        let t$$1 = ("________________________________________________"),
            n$$1 = "\n",
            is_iws = (!this.IWS) ? "\n The Lexer produced whitespace tokens" : "";
        this.IWS = false;
        let pk = this.copy();
        while (!pk.END && pk.ty !== Types.nl) { pk.next(); }
        let end = pk.off;
        throw new Error(`${message} at ${this.line}:${this.char}\n${t$$1}\n${this.str.slice(this.off + this.tl + 1 - this.char, end)}\n${("").padStart(this.char - 2)}^\n${t$$1}\n${is_iws}`);
    }

    /**
     * Proxy for Lexer.prototype.reset
     * @public
     */
    r() { return this.reset(); }

    /**
     * Restore the Lexer back to it's initial state.
     * @public
     */
    reset() {
        this.p = null;
        this.type = 32768;
        this.off = 0;
        this.tl = 0;
        this.char = 0;
        this.line = 0;
        this.n;
        return this;
    }

    resetHead() {
        this.off = 0;
        this.tl = 0;
        this.char = 0;
        this.line = 0;
        this.p = null;
        this.type = 32768;
    }

    /**
     * Sets the internal state to point to the next token. Sets Lexer.prototype.END to `true` if the end of the string is hit.
     * @public
     * @param {Lexer} [marker=this] - If another Lexer is passed into this method, it will advance the token state of that Lexer.
     */
    next(marker = this) {

        let str = marker.str;

        if (marker.sl < 1) {
            marker.off = 0;
            marker.type = 32768;
            marker.tl = 0;
            return marker;
        }

        //Token builder
        let length = marker.tl;
        let off = marker.off + length;
        let l$$1 = marker.sl;
        let IWS = marker.IWS;
        let type = symbol;
        let char = marker.char + length;
        let line = marker.line;
        let base = off;

        if (off >= l$$1) {
            length = 0;
            base = l$$1;
            char -= base - off;
            marker.type = type;
            marker.off = base;
            marker.tl = length;
            marker.char = char;
            marker.line = line;
            return marker;
        }

        while (true) {

            base = off;

            length = 1;

            let code = str.charCodeAt(off);

            if (code < 128) {

                switch (jump_table[code]) {
                    case 0: //NUMBER
                        while (++off < l$$1 && (12 & number_and_identifier_table[str.charCodeAt(off)])) {}

                        if (str[off] == "e" || str[off] == "E") {
                            off++;
                            if (str[off] == "-") off++;
                            marker.off = off;
                            marker.tl = 0;
                            marker.next();
                            off = marker.off + marker.tl;
                            //Add e to the number string
                        }

                        type = number;
                        length = off - base;

                        break;
                    case 1: //IDENTIFIER
                        while (++off < l$$1 && ((10 & number_and_identifier_table[str.charCodeAt(off)]))) {}
                        type = identifier;
                        length = off - base;
                        break;
                    case 2: //QUOTED STRING
                        if (this.PARSE_STRING) {
                            type = symbol;
                        } else {
                            while (++off < l$$1 && str.charCodeAt(off) !== code) {}
                            type = string;
                            length = off - base + 1;
                        }
                        break;
                    case 3: //SPACE SET
                        while (++off < l$$1 && str.charCodeAt(off) === SPACE) {}
                        type = white_space;
                        length = off - base;
                        break;
                    case 4: //TAB SET
                        while (++off < l$$1 && str[off] === HORIZONTAL_TAB) {}
                        type = white_space;
                        length = off - base;
                        break;
                    case 5: //CARIAGE RETURN
                        length = 2;
                    case 6: //LINEFEED
                        type = new_line;
                        char = 0;
                        line++;
                        off += length;
                        break;
                    case 7: //SYMBOL
                        type = symbol;
                        break;
                    case 8: //OPERATOR
                        type = operator;

                        break;
                    case 9: //OPEN BRACKET
                        type = open_bracket;
                        break;
                    case 10: //CLOSE BRACKET
                        type = close_bracket;
                        break;
                    case 11: //Data Link Escape
                        type = data_link;
                        length = 4; //Stores two UTF16 values and a data link sentinel
                        break;
                }
            }

            if (IWS && (type & white_space_new_line)) {
                if (off < l$$1) {
                    char += length;
                    type = symbol;
                    continue;
                } else {
                    //Trim white space from end of string
                    base = l$$1 - length;
                    marker.sl -= length;
                    length = 0;
                    char -= base - off;
                }
            }

            break;
        }

        marker.type = type;
        marker.off = base;
        marker.tl = (this.masked_values & CHARACTERS_ONLY_MASK) ? Math.min(1,length) : length;
        marker.char = char;
        marker.line = line;

        return marker;
    }
    

    /**
     * Proxy for Lexer.prototype.assert
     * @public
     */
    a(text) {
        return this.assert(text);
    }

    /**
     * Compares the string value of the current token to the value passed in. Advances to next token if the two are equal.
     * @public
     * @throws {Error} - `Expecting "${text}" got "${this.text}"`
     * @param {String} text - The string to compare.
     */
    assert(text) {

        if (this.off < 0) this.throw(`Expecting ${text} got null`);

        if (this.text == text)
            this.next();
        else
            this.throw(`Expecting "${text}" got "${this.text}"`);

        return this;
    }

    /**
     * Proxy for Lexer.prototype.assertCharacter
     * @public
     */
    aC(char) { return this.assertCharacter(char); }
    /**
     * Compares the character value of the current token to the value passed in. Advances to next token if the two are equal.
     * @public
     * @throws {Error} - `Expecting "${text}" got "${this.text}"`
     * @param {String} text - The string to compare.
     */
    assertCharacter(char) {

        if (this.off < 0) this.throw(`Expecting ${text} got null`);

        if (this.ch == char[0])
            this.next();
        else
            this.throw(`Expecting "${char[0]}" got "${this.tx[this.off]}"`);

        return this;
    }

    /**
     * Returns the Lexer bound to Lexer.prototype.p, or creates and binds a new Lexer to Lexer.prototype.p. Advences the other Lexer to the token ahead of the calling Lexer.
     * @public
     * @type {Lexer}
     * @param {Lexer} [marker=this] - The marker to originate the peek from. 
     * @param {Lexer} [peek_marker=this.p] - The Lexer to set to the next token state.
     * @return {Lexer} - The Lexer that contains the peeked at token.
     */
    peek(marker = this, peek_marker = this.p) {

        if (!peek_marker) {
            if (!marker) return null;
            if (!this.p) {
                this.p = new Lexer(this.str, false, true);
                peek_marker = this.p;
            }
        }
        peek_marker.masked_values = marker.masked_values;
        peek_marker.type = marker.type;
        peek_marker.off = marker.off;
        peek_marker.tl = marker.tl;
        peek_marker.char = marker.char;
        peek_marker.line = marker.line;
        this.next(peek_marker);
        return peek_marker;
    }


    /**
     * Proxy for Lexer.prototype.slice
     * @public
     */
    s(start) { return this.slice(start); }

    /**
     * Returns a slice of the parsed string beginning at `start` and ending at the current token.
     * @param {Number | LexerBeta} start - The offset in this.str to begin the slice. If this value is a LexerBeta, sets the start point to the value of start.off.
     * @return {String} A substring of the parsed string.
     * @public
     */
    slice(start = this.off) {

        if (start instanceof Lexer) start = start.off;

        return this.str.slice(start, (this.off <= start) ? this.sl : this.off);
    }

    /**
     * Skips to the end of a comment section.
     * @param {boolean} ASSERT - If set to true, will through an error if there is not a comment line or block to skip.
     * @param {Lexer} [marker=this] - If another Lexer is passed into this method, it will advance the token state of that Lexer.
     */
    comment(ASSERT = false, marker = this) {

        if (!(marker instanceof Lexer)) return marker;

        if (marker.ch == "/") {
            if (marker.pk.ch == "*") {
                marker.sync();
                while (!marker.END && (marker.next().ch != "*" || marker.pk.ch != "/")) { /* NO OP */ }
                marker.sync().assert("/");
            } else if (marker.pk.ch == "/") {
                let IWS = marker.IWS;
                while (marker.next().ty != types.new_line && !marker.END) { /* NO OP */ }
                marker.IWS = IWS;
                marker.next();
            } else
            if (ASSERT) marker.throw("Expecting the start of a comment");
        }

        return marker;
    }


    setString(string, RESET = true) {
        this.str = string;
        this.sl = string.length;
        if (RESET) this.resetHead();
    }

    toString(){
        return this.slice();
    }

    /*** Getters and Setters ***/
    get string() {
        return this.str;
    }

    /**
     * The current token in the form of a new Lexer with the current state.
     * Proxy property for Lexer.prototype.copy
     * @type {Lexer}
     * @public
     * @readonly
     */
    get token() {
        return this.copy();
    }


    get ch() {
        return this.str[this.off];
    }

    /**
     * Proxy for Lexer.prototype.text
     * @public
     * @type {String}
     * @readonly
     */
    get tx() { return this.text; }
    
    /**
     * The string value of the current token.
     * @type {String}
     * @public
     * @readonly
     */
    get text() {
        return (this.off < 0) ? "" : this.str.slice(this.off, this.off + this.tl);
    }

    /**
     * The type id of the current token.
     * @type {Number}
     * @public
     * @readonly
     */
    get ty() { return this.type; }

    /**
     * The current token's offset position from the start of the string.
     * @type {Number}
     * @public
     * @readonly
     */
    get pos() {
        return this.off;
    }

    /**
     * Proxy for Lexer.prototype.peek
     * @public
     * @readonly
     * @type {Lexer}
     */
    get pk() { return this.peek(); }

    /**
     * Proxy for Lexer.prototype.next
     * @public
     */
    get n() { return this.next(); }

    get END(){ return this.off >= this.sl; }
    set END(v$$1){}

    get type(){
        return 1 << (this.masked_values & TYPE_MASK);
    }

    set type(value){
        //assuming power of 2 value.

        this.masked_values = (this.masked_values & ~TYPE_MASK) | ((getNumbrOfTrailingZeroBitsFromPowerOf2(value)) & TYPE_MASK); 
    }

    get tl (){
        return this.token_length;
    }

    set tl(value){
        this.token_length = value;
    }

    get token_length(){
        return ((this.masked_values & TOKEN_LENGTH_MASK) >> 7);
    }

    set token_length(value){
        this.masked_values = (this.masked_values & ~TOKEN_LENGTH_MASK) | (((value << 7) | 0) & TOKEN_LENGTH_MASK); 
    }

    get IGNORE_WHITE_SPACE(){
        return this.IWS;
    }

    set IGNORE_WHITE_SPACE(bool){
        this.iws = !!bool;
    }

    get CHARACTERS_ONLY(){
        return !!(this.masked_values & CHARACTERS_ONLY_MASK);
    }

    set CHARACTERS_ONLY(boolean){
        this.masked_values = (this.masked_values & ~CHARACTERS_ONLY_MASK) | ((boolean | 0) << 6); 
    }

    get IWS(){
        return !!(this.masked_values & IGNORE_WHITESPACE_MASK);
    }

    set IWS(boolean){
        this.masked_values = (this.masked_values & ~IGNORE_WHITESPACE_MASK) | ((boolean | 0) << 5); 
    }

    get PARSE_STRING(){
        return !!(this.masked_values & PARSE_STRING_MASK);
    }

    set PARSE_STRING(boolean){
        this.masked_values = (this.masked_values & ~PARSE_STRING_MASK) | ((boolean | 0) << 4); 
    }

    /**
     * Reference to token id types.
     */
    get types() {
        return Types;
    }
}

function whind$1(string, INCLUDE_WHITE_SPACE_TOKENS = false) { return new Lexer(string, INCLUDE_WHITE_SPACE_TOKENS); }

whind$1.constructor = Lexer;

Lexer.types = Types;
whind$1.types = Types;

//[Singleton]  Store unused tokens, preventing garbage collection of tokens

const DL_CHAR = String.fromCharCode(15);

//Returns an index position that does not intersect with data_link blocks
function getCodePositionOffset(is, str) {

    let ie = is,
        dg = is,
        dl = is,
        ON_DL = (str[ie] == DL_CHAR),
        i = ie + (ON_DL | 0),
        lim = Math.min(ie + 4, str.length);


    for (; i < lim; i++)
        if (str[i] == DL_CHAR) { dg = i; break; }

    i = ie - (ON_DL | 0);
    lim = Math.max(ie - 4, 0);

    for (; i >= lim; i--)
        if (str[i] == DL_CHAR) { dl = i; break; }

    let INSIDE_DL = (dg - dl == 3) && ((str.charCodeAt(dl + 1) & 32768) == 32768);

    if (INSIDE_DL || str[is + 1] == DL_CHAR || ON_DL) {
        if (INSIDE_DL) {
            ie = dg;
            is = dl;
        } else if (ON_DL) {
            if (dg - is == 3) {
                ie = dg;
            } else {
                ie = is;
                is = dl;
            }
        } else {
            ie = is + 4;
            is++;
        }

        while (str[is] == str[is - 1] == DL_CHAR)
            is -= 4;

        while (str[ie + 1] == DL_CHAR)
            ie += 4;
    } else
        is++;


    return { is, ie };
}

class TEXT_LINE extends whind$1.constructor {

    constructor(fw) {

        if (TEXT_LINE.Pool) {
            let out = TEXT_LINE.Pool;
            TEXT_LINE.Pool = out.nxt;
            out.nxt = null;
            out.fw = fw;
            out.IWS = false;
            return out;
        }

        super("");

        this.fw = fw;
        this.nxt = null;
        this.prv = null;
        this.text_insert = null;
        this.parent = null;
        this.PARSE_STRING = true;
        this.pixel_width = 0;
        this.linked_offset = 0;
        this.link = null;

        //container variables
        this.virtual_line_size = 1;
        this.h = 13;

        this.IWS = false;
    }



    slice(start){
        this.str = this.string;
        return super.slice(start);
    }

    next(marker = this){
        this.str = this.string;
        return super.next(marker);
    }

    resetHead() {
        super.resetHead();
        this.off = this.linked_offset;
        this.IWS = false;
        if (this.p) {
            this.p.release();
            this.p = null;
        }
    }

    release() {
        let prv = this.prv;

        if (this.nxt)
            this.nxt.prv = prv;

        if (prv)
            prv.nxt = this.nxt;

        this.reset();

        if (TEXT_LINE.Pool)
            this.nxt = TEXT_LINE.Pool;

        TEXT_LINE.Pool = this;

        return prv;
    }

    reset() {
        super.reset();
        this.nxt = null;
        this.prv = null;
        this.link = null;
        //container variables
        this.virtual_line_size = 1;
        this.linked_offset = 0;
        this.IS_LINKED_LINE = false;
        this.h = 13;
        this.pixel_width = 0;
        this.setString("");
        this.resetHead();
        this.str = "";
    }

    peek(marker = this, peek_marker = new TEXT_LINE(this.fw)) {
        peek_marker.END = false;
        peek_marker.str = marker.str;
        peek_marker.sl = marker.sl;
        peek_marker.type = marker.type;
        peek_marker.off = marker.off;
        peek_marker.tl = marker.tl;
        peek_marker.char = marker.char;
        peek_marker.line = marker.line;
        peek_marker.h = marker.h;
        if(!this.IS_LINKED_LINE) this.next(peek_marker);
        return peek_marker;
    }

    removeSection(offset_shift = 0, length_shift = 0) {
        let node = (this.IS_LINKED_LINE) ? this.link : this;
        
        if(this.IS_LINKED_LINE)
            this.string = node.str.slice(0, this.off - offset_shift) + node.str.slice(this.off + this.tl + length_shift);
        else
            node.setString(node.str.slice(0, this.off - offset_shift) + node.str.slice(this.off + this.tl + length_shift), false);

        this.off -= offset_shift;

        this.tl = 0;
        
        return this;
    }

    /** LINKED LINE HANDLING **/

    traceToRootLine(char) {
        if (this.IS_LINKED_LINE) {
            let node = this;
            do {
                node = node.prv;
                char += node.length + (node.IS_LINKED_LINE | 0) - 1;
            } while (node.IS_LINKED_LINE);

            return { node, char };
        }

        return { node: this, char };
    }

    flushLinkedLines() {
        //Remove all linked lines at this point
        let node = this.nxt;
        let vl = 0;

        while (node && node.IS_LINKED_LINE) {
            let nxt = node.nxt;
            this.fw.line_container.remove(node);
            node.release();
            vl = 0;
            node = nxt;
        }

        //this.virtual_line_size = 1;
        //this.parent.decrementNumOfVirtualLines(vl);
        this.setString(this.str);
    }

    /*** DATA CODE ***/

    get code() {
        if (this.ty == this.types.data_link) {
            let code_a = this.str.charCodeAt(this.off + 1) ^ 32768;
            let code_b = this.str.charCodeAt(this.off + 2);
            return (code_b << 16 | code_a);
        }
        return 0;
    }

    insertCode(value = 0, index = 0) {
        let { node, char } = this.traceToRootLine(index);

        if (node !== this) return node.insertCode(value, char);

        this.NEED_PARSE = true;

        if (char < this.off)
            this.off += 3;

        let code_a = (value & 65535) | 32768;
        let code_b = (value >> 16) & 65535;
        let { is, ie } = getCodePositionOffset(char, this.str);

        this.setString(this.str.slice(0, is) + String.fromCharCode(15, code_a, code_b, 15) + this.str.slice(ie + 1), false);
    }

    //Store new inserted text into temporary tokens, whose contents will be merged into the actual token list when parsed.
    insertText(text, char_pos = this.length-1) {
        let { node, char } = this.traceToRootLine(char_pos);

        if (node !== this) return node.insertText(text, char);

        var l = this.str.length;
        
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
        var temp = new TEXT_LINE(this.fw);
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

        this.NEED_PARSE = true;

        return this;
    }

    mergeLeft(str) {

        let prv = this.prv;

        if (prv) {
            prv.NEED_PARSE = true;
            prv.setString(prv.str + str);
        }

        this.parent.remove(this);

        this.release();

        return prv;
    }

    //Takes the token text string and breaks it down into individual pieces, linking resulting tokens into a linked list.
    parse(FORCE, view) {

        if (view && view.pixel_width !== this.pixel_width)
            FORCE = true;

        if (!this.NEED_PARSE && !FORCE) return this.nxt;

        //CACHE parse functions variables
        var token_length = 0,
            temp = null;

        //This function will change structure of tokens, thus resetting cache.
        this.NEED_PARSE = false;

        //Flush virtual lines;
        this.flushLinkedLines();

        //Walk the temporary text chain and insert strings into the text variable : History is also appended to through here
        if (this.text_insert) {
            //These get added to history
            var i = 0;

            temp = this.text_insert;

            while (temp) {
                let text = temp.str;
                let index = temp.off;
                let prev_sib = temp.prv;

                temp.release();

                //add saved text to history object in framework

                //text inserts get separated as character insertions, delete characters, and cursors
                let { is } = getCodePositionOffset(index, this.str);

                if (index < this.str.length && index > 0) {
                    this.setString(this.str.slice(0, is) + text + this.str.slice(is));
                } else if (index > 0) {
                    this.setString(this.str + text);
                } else {
                    //Handle new line character
                    this.setString(this.str.slice(0,1) +  text + this.str.slice(1));
                }

                temp = prev_sib;
            }

            this.text_insert = null;

            this.resetHead();

            for (i = 1; i < this.text.length; i++) {
                if (i === 0) continue;
                var s = this.text.charCodeAt(i);
                var f = this.text.charCodeAt(i - 1);
                if (( /*f !== this.fw.new_line_code && */ f !== this.fw.del_code) && s === this.fw.del_code) {
                    if (f === this.fw.new_line_code && !this.prev_sib) {
                        break;
                    }


                    i--;
                    this.text = this.text.slice(0, i) + this.text.slice(i + 2);
                    i--;
                }
            }
        }

        let types = this.types;

        this.next().next(); //new line

        let size = this.h;
        let total_length = 0;


        while (!this.END) {

            if (this.ty & (types.symbol | types.new_line | types.operator | types.data_link)) {

                switch (this.ch.charCodeAt(0)) {

                    case this.fw.data_link:

                        let code = this.code;

                        let font_size = (code >> 8) & 255;

                        size = Math.max(size, font_size);

                        this.next();

                        continue;

                    case this.fw.del_code: // Backspace Character

                        if (this.off == 1) { //This will delete the new line character;
                            if (this.index == 0) {
                                //Can't delete newline of first line.
                                this.removeSection();
                                break;
                            }
                            //reinsert this into the previous line

                            var prev_sib = this.prv;

                            if (prev_sib) {
                                //Linked lines don't have a length, so the delete character would not be exausted.
                                if (!prev_sib.IS_LINKED_LINE)
                                    return this.mergeLeft(this.str.slice(2));

                                prev_sib.setString(prev_sib.str + this.str.slice(2));

                                return this.release().parse(true);
                            }

                        } else
                            this.removeSection(1, 0);
                        break;

                    case this.fw.new_line_code: // Line Feed

                        this.IS_LINKED_LINE = false;

                        let str = this.str,
                            off = this.off;

                        this.setString(str.slice(0, off));

                        this.pixel_height = size;

                        let nl = new TEXT_LINE(this.fw);

                        nl.setString(str.slice(off));

                        this.fw.insertLine(this, nl);

                        nl.NEED_PARSE = true;

                        return nl;

                    case this.fw.curs_code:
                        //Update cursor position;
                        var cursor = this.fw.aquireCursor();

                        if (cursor) {
                            cursor.y = this.index;
                            cursor.x = this.off + (this.IS_LINKED_LINE|0) - 1 - this.linked_offset;
                        }

                        //Remove cursor section from text
                        this.removeSection();
                        

                        this.next();

                        continue;
                }
            }
            //*
            //
            if(view){
                // test for the need to split the line up if its size is more than the max length;
                total_length += view.font.calcSize(this.str, this.off, this.off + this.tl);

                if (total_length > view.pixel_width && this.ty !== this.types.white_space) {

                    let ll = new TEXT_LINE(this.fw);
                    ll.IS_LINKED_LINE = true;
                    ll.linked_offset = this.off;
                    ll.virtual_line_size = 0;
                    ll.size = this.size;
                    ll.h = size;
                    ll.sl = this.sl;
                    ll.resetHead();
                    ll.link = (this.link) ? this.link : this;

                    let node = this;
                    while (node.IS_LINKED_LINE)
                        node = node.prv;

                   // node.virtual_line_size++;
                   // node.parent.incrementNumOfVirtualLines(1);

                    this.sl = this.off;
                    this.resetHead();

                    this.pixel_width = (view) ? view.pixel_width : 0;
                    this.pixel_height = size;
                    this.fw.insertLine(this, ll);


                    ll.NEED_PARSE = true;

                    return ll;
                    //split up line and continue parsing in new line. be sure to pass current state as code. 
                }
            }
            //*/
            this.next();
        }

        this.pixel_width = (view) ? view.pixel_width : 0;
        
        this.pixel_height = size;

        this.resetHead();

        //Continue down chain of cells
        return this.nxt;
    }

    get string() {return (this.IS_LINKED_LINE) ? this.link.str : this.str;}
    set string(string) {if (this.IS_LINKED_LINE)  {this.link.str = string; this.sl = string.length;} else this.str = string;}

    get length() { return this.sl - this.linked_offset; }
    set length(a) {}
    get cache() { return this.str.slice(1); }
    set cache(a) {}
    get index() {
        return this.parent.getLineIndex(0, this);
    }
    set index(e) {
        this.fw.line_container.remove(this);
        this.fw.line_container.insert(this, e);
    }
    get virtual_index() { return this.parent.getVirtualLineIndex(0, this); }
    set virtual_index(e) {}
    get pixel_offset() { return this.parent.getPixelOffset(0, this); }
    set pixel_height(h) {
        if (this.parent) this.parent.updateHeight(this.h - h);
        this.h = h;
    }
    get pixel_height() { return this.h; }
    charAt(index) { return this.str[index]; }
}

TEXT_LINE.Pool = null;

const DL_CHAR$1 = String.fromCharCode(15);

function getRealPosition(x, y, fw) {
    let line = fw.line_container.getLine(y),
        str = line.string,
        data = 0;

    let end = Math.min(x, str.length);

    for (let i = 0; i < end; i++)
        if (str.charCodeAt(i) == 15)
            i += 4, data++;

    return x - data * 4;
}

function setDeltaX(x, y, dx, fw, CLAMP = false) {
    let rx = -1;

    //retrieve line info
    let line = fw.line_container.getLine(y),
        xd = x + dx,
        str = line.string,
        line_length = line.length + ((line.IS_LINKED_LINE | 0) - 1);

    if (dx > 0) {
        for (let i = x; i <= xd && i < str.length;)
            if (str.charCodeAt(i) == 15)
                xd += 4, i += 4;
            else
                i++;
    } else {
        for (let i = x; i >= xd && i > -1;)
            if (str.charCodeAt(i) == 15)
                xd -= 4, i -= 4;
            else
                i--;
    }

    if (xd < 0) {
        if (y <= 0) {
            x = 0;
        } else {
            y--;
            line = fw.line_container.getLine(y);
            return setDeltaX(line.length, y, xd, fw, CLAMP);
        }
    } else if (xd > line_length) {
        // Need to trace number of data_links between new site and old and increment the
        if (CLAMP || y >= fw.line_container.height - 1) {
            x = line_length;
        } else {
            x = 0;
            y++;
            return setDeltaX(x, y, xd - line_length - 1, fw, CLAMP);
        }
    } else
        x = xd;

    rx = xd;

    return { x, y };
}

function setDeltaY(x, y, dy, fw, defaultX) {

    var diff = y + dy;

    if (diff <= 0)
        y = 0;
    else if (diff >= fw.line_container.height - 1) {
        y = fw.line_container.height - 1;
        defaultX = Infinity;
    } else
        y = diff;

    return setDeltaX(0, y, defaultX, fw, true);
}

class TEXT_CURSOR {
    constructor(fw) {

        //Character and Line position of cursor
        this.x = 0;
        this.y = 0;

        this.cx = 0;

        //Character and Line position of cursor selection bound
        this.selection_x = -1;
        this.selection_y = -1;


        //Real position of cursor line and character. These values is related to the total number of non Linked Lines found in the
        //line container object. Lines that are linked are treated as character indexes extending from non Linked Lines.
        this.rpx = 0;
        this.rpy = 0;

        //Same for selection bounds. 
        this.rpsx = 0;
        this.rpsy = 0;


        this.index = 0;
        this.fw = fw;
        //this.line_container = fw.line_container;
        this.char_code = fw.curs_char;
        this.selections = [];
        this.line_height = 0;

        this.defaultX = 0;

        //FLAGS
        this.IU = false;
        this.REAL_POSITION_NEEDS_UPDATE = true;
        this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;
    }

    get rx() {
        return getRealPosition(this.x, this.y, this.fw);
    }

    setX(posx) {
        this.moveX(posx - this.x);
    }

    setY(posy) {
        this.moveY(posy - this.y);
    }

    moveX(change) {
        let { x, y } = setDeltaX(this.x, this.y, change, this.fw);
        this.defaultX = x;
        this.x = x;
        this.y = y;
        this.REAL_POSITION_NEEDS_UPDATE = true;

    }

    moveY(change) {
        let { x, y } = setDeltaY(this.x, this.y, change, this.fw, this.defaultX);
        this.x = x;
        this.y = y;
        this.REAL_POSITION_NEEDS_UPDATE = true;
    }

    setSelX(posx) {
        if (this.selection_x < 0) this.selection_x = 0;
        if (this.selection_y < 0) this.selection_y = 0;
        this.moveSelectChar(posx - this.selection_x);
    }

    setSelY(posy) {
        if (this.selection_y < 0) this.selection_y = 0;
        if (this.selection_x < 0) this.selection_x = 0;
        this.moveSelectLine(posy - this.selection_y);
    }


    moveSelectChar(change) {
        let { x, y } = setDeltaX(this.selection_x, this.selection_y, change, this.fw);
        this.selection_x = x;
        this.selection_y = y;
        this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;
    }

    moveSelectLine(change) {
        let { x, y } = setDeltaY(this.selection_x, this.selection_y, change, this.fw, this.defaultX);
        this.selection_x = x;
        this.selection_y = y;
        this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;
    }

    charAt() {
        return this.charBefore(this.real_position_x + 1);
    }

    charBefore(x = this.real_position_x) {
        var line = this.fw.line_container.getVirtualLine(this.real_position_y);

        if (x < 0) {
            line = line.prev_sib;
            return line.text[line.text.length - 1];
        }
        while (true) {
            if (x >= line.token_length) {
                x -= line.token_length;
                if (!line.next_sib) {
                    //return last 
                    return line.text[line.text.length - 1];
                }
            } else {
                return line.text[x];
            }
            line = line.next_sib;
        }
    }
    get HAS_SELECTION() {
        return (this.selection_x > -1 && this.selection_y > -1);
    }

    set HAS_SELECTION(p) {}

    get IN_USE() { return this.IU; }

    set IN_USE(bool) {
        this.IU = bool;
        if (!bool) {
            this.selection_x = -1;
            this.selection_y = -1;
            this.x = 0;
            this.y = 0;
        }
    }

    resetSel() {
        this.selection_x = -1;
        this.selection_y = -1;

        this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;

        for (var i = 0; i < this.selections.length; i++) {
            var div = this.selections[i];
            div.hide();
        }
    }

    get id() { return this.x | (this.y << 10); }
    get sid() { return this.selection_x | (this.selection_y << 10); }

    get lineLength() {
        var line = this.fw.line_container.getLine(this.y);
        if (line) {
            return line.length + ((line.IS_LINKED_LINE | 0) - 1);
        } else {
            return 0;
        }
    }

    get lineLength_Select() {
        var line = this.fw.line_container.getLine(this.selection_y);
        if (line) {
            return line.length + ((line.IS_LINKED_LINE | 0) - 1);
        } else {
            return 0;
        }
    }

    getXCharOffset(x_in, y_in, view = this.fw.default_view) {
        return view.getXoffsetAtPixelCoords(x, y, this.fw);
    }

    getSortedPositions() {
        this.REAL_POSITION_NEEDS_UPDATE = true;
        this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;

        var id1 = this.id;

        var id2 = (this.selection_y << 10) | this.selection_x;
        var x1 = 0,
            y1 = 0,
            x2 = 0,
            y2 = 0;
        if (id2 < id1) {
            x1 = this.selection_x;
            y1 = this.selection_y;
            x2 = this.x;
            y2 = this.y;
        } else {
            x1 = this.x;
            y1 = this.y;
            x2 = this.selection_x;
            y2 = this.selection_y;
        }

        return {
            x1,
            y1,
            x2,
            y2
        };
    }

    arrangeSel() {
        if (!this.HAS_SELECTION) return;
        let { x1, y1, x2, y2 } = this.getSortedPositions();

        this.x = x1;
        this.y = y1;
        this.selection_x = x2;
        this.selection_y = y2;

    }

    getLine(y_in) { return this.fw.line_container.getIndexedLine(y_in || this.y); }

    getYCharOffset(y_in) { return (((y_in) * this.fw.line_height) - 1); }
    //Returns string of concated lines between [x,y] and [x2,y2]. Returns empty string if [x2.selection_y] is less then 0;
    getTextFromSel() {
        var string = [];

        if (this.HAS_SELECTION) {

            //Sets each tokens selected attribute to true
            let { x1, y1, x2, y2 } = this.getSortedPositions();

            for (var i = y1; i <= y2; i++) {

                let line = this.getLine(i).pk;
                let limX1 = (i == y1) ? x1 : 0;
                let limX2 = (i == y2) ? x2 : line.string.length;
                let j = limX1;
                let str = line.string;

                while (j <= limX2) {

                    if (str[j] == DL_CHAR$1) {
                        j += 4;
                        continue;
                    }

                    string.push(str[j++]);
                }
            }
        }

        return string.join("");
    }

    get line_container() {
        return this.fw.line_container;
    }

    //Places cursor at the select position.
    setCurToSel() {
        let { x2, y2 } = this.getSortedPositions();
        this.x = x2;
        this.y = y2;
    }

    toString() {
        this.fw.line_container.getLine(this.y).insertText(this.char_code, this.x);
    }

}

class TextFramework {
    constructor() {

        this.line_container = new LineContainer();
        this.length = 0;
        this.char_width = 24;
        this.max_length = 0;
        this.scroll_top = 0;
        this.max_line_width = 0;
        this.del_code = 8; // should be 127 or 8
        this.del_char = String.fromCharCode(this.del_code);
        this.new_line_code = 10; // should be 10
        this.new_line = String.fromCharCode(this.new_line_code);
        this.linked_line_code = 13; // should be 13
        this.linked_line = String.fromCharCode(this.linked_line_code);
        this.curs_code = 2; // should be 31
        this.curs_char = String.fromCharCode(this.curs_code);
        this.data_link = 15; // Data Link Character

        //Fixed character width for scaling
        this.width = 0;
        this.height = 0;

        this.last_keycode = 0;
        this.cursors = [new TEXT_CURSOR(this)];

        //UINT flag to allow parsing pausing.
        this.NEED_UPDATE = 0;

        this.aquireCursor();
    }

    unload() {
        this.releaseAllCursors();
        //this.parent_element.removeChild(this.DOM);
        this.line_container = null;
        this.DOM = null;
        this.parent_element = null;
        this.cursors = null;
    }

    get HAS_SELECTION() {
        for (var i = 0; i < this.cursors.length; i++) {
            if (this.cursors[i].HAS_SELECTION) return true;
        }
        return false;
    }

    /** RENDERING **/

    * getLines(pixel_start, pixel_end, view = null) {

        if (this.line_container.length > 0) {

            var line = this.line_container.getLineAtPixelOffset(pixel_start | 0);

            // Offset to prevent y jitter as lines are added and removed.
            let offset = line.pixel_offset - pixel_start;

            var t = offset;

            yield offset; 

            while (line) {

                if(line.NEED_UPDATE)
                    this.updateText(view, line.index, 10);

                yield line;

                t += line.pixel_height;

                if (t >= pixel_end) break;

                line = line.nxt;
            }
        }
    }

    renderView(view) {

        if(this.NEED_UPDATE > 0)
            this.updateText(view, this.NEED_UPDATE);

        if (!view) return;

        if (view !== this.cached_view) {
            //rebuild line;
        }
        let gen = this.getLines(view.getTop(), view.getHeight());
        let offset = gen.next().value;

        view.renderLines(gen, offset);

        for (var i = 0; i < this.cursors.length; i++) {
            let cur = this.cursors[i];
            if(cur.IN_USE)
                view.renderCursor(cur, this, offset);
        }
    }

    /*** CURSORS ***/

    aquireCursor() {
        var temp = null;
        if (this.cursors.length > 0) {
            for (var i = 0; i < this.cursors.length; i++) {
                temp = this.cursors[i];
                if (!temp.IU)
                    break;
                temp = null;
            }
        }
        if (!temp) {
            temp = new TEXT_CURSOR(this);
            temp.index = this.cursors.push(temp) - 1;
        }

        temp.IN_USE = true;

        return temp;
    }
    
    releaseAllCursors() {
        for (var i = 0; i < this.cursors.length; i++) 
            this.cursors[i].IN_USE = false;           
    }

    releaseCursor(cursor) {
        cursor.IN_USE = false;
        this.sortCursors();
    }

    moveCursorsByX(change, SELECT) {
        if (SELECT) {
            for (var i = 0; i < this.cursors.length; i++)
                if (this.cursors[i].IN_USE) this.cursors[i].moveSelectChar(change);
        } else {
            for (var i = 0; i < this.cursors.length; i++)
                if (this.cursors[i].IN_USE) this.cursors[i].moveX(change);
        }

        this.checkForCursorOverlap();
    }

    moveCursorsByY(change, SELECT) {
        if (SELECT) {
            for (var i = 0; i < this.cursors.length; i++) {
                if (this.cursors[i].IN_USE) this.cursors[i].moveSelectLine(change);
            }
        } else {

            for (var i = 0; i < this.cursors.length; i++) {
                if (this.cursors[i].IN_USE) this.cursors[i].moveY(change);
            }
        }
        this.checkForCursorOverlap();
    }


    checkForCursorOverlap() {
        var cur1 = null,
            cur2 = null;
        
        for (var i = 0; i < this.cursors.length; i++) {

            cur1 = this.cursors[i];
            
            if (!cur1.IU) continue;

            let {x1:c1x1, y1:c1y1, x2:c1x2, y2:c1y2} = cur1.getSortedPositions();

            let sel1 = c1x1 + c1y1;
            let min1 = (c1y1 << 10)  | c1x1;
            let max1 = (c1y2 << 10)  | c1x2;


            for (var j = i + 1; j < this.cursors.length; j++) {
                cur2 = this.cursors[j];
                
                if (!cur2.IU) continue;

                let {x1:c2x1, y1:c2y1, x2:c2x2, y2:c2y2} = cur2.getSortedPositions();

                let sel2 = c2x1 + c2y1;

                if(sel1 >= 0 || sel2 >= 0){
                    let min2 = (c2y1 << 10)  | c2x1;
                    let max2 = (c2y2 << 10)  | c2x2; 
                    
                    if(sel1 >= 0 && sel2 >= 0){    
                        if(max1 >= min2 && min1 <= max2){
                            cur1.x = Math.min(c1x1,c2x1);
                            cur1.y = Math.min(c1y1,c2y1);
                            cur1.selction_x = Math.max(c1x2,c2x2);
                            cur1.selction_y = Math.max(c1y2,c2y2);
                            cur2.IN_USE = false;
                        }
                    }else if(sel1 >= 0){
                        if(min2 <= max1 && min2 >= min1)
                            cur2.IN_USE = false;
                    }else{
                        if(min1 <= max2 && min1 >= min2){
                            cur1.x = c2x1;
                            cur1.y = c2y1;
                            cur1.selction_x = c2x2;
                            cur1.selction_y = c2y2;
                            cur2.IN_USE = false;  
                        }
                    }
                }

                if (cur1.id == cur2.id) 
                    cur2.IN_USE = false;                
            }
        }

        return this.sortCursors();
    }

    sortCursors() {
        let last = 0;
        
        for (var i = 0; i < this.cursors.length - 1; i++) {
            var
                cur1 = this.cursors[i],
                cur2 = this.cursors[i + 1];
            //move data from cur2 to cur1
            if (!cur1.IU && cur2.IU) {
                this.cursors[i] = cur2;
                this.cursors[i + 1] = cur1;
            }
        }

        return last;
    }

    /** LINES **/

    getLineAtPixelOffset(y){
        return this.line_container.getLineAtPixelOffset(y);
    }

    getLine(y){
        return this.line_container.getLine(y);
    }

    //Inserts line into list of lines after prev_line. Returns new line line
    insertLine(prev_line, new_line) {
        if (!prev_line) {
            new_line.prv = new_line;
            new_line.nxt = null;
            this.line_container.insert(new_line, 0);
        } else {
            this.line_container.insert(new_line, prev_line.index + 1);
            new_line.nxt = prev_line.nxt;
            if (new_line.nxt) {
                new_line.nxt.prv = new_line;
            }
            new_line.prv = prev_line;
            prev_line.nxt = new_line;
        }

        this.length++;

        new_line.IS_NEW_LINE = true;

        return new_line;
    }

    /** TEXT and CODE **/

    insertText(text, line_index = this.line_container.length-1, char_index) {
        if ((this.line_container.height | 0) < 1) {
            if (text.charCodeAt(0) !== this.new_line_code) 
                text = this.new_line + text;
            
            this.insertLine(null, new TEXT_LINE(this)).insertText(text, 1);
            this.updateText(0);
        } else {
            this.line_container.getLine(line_index).insertText(text, char_index);
        }
    }

    insertCodeAtCursor(code, index){

        var l = this.cursors.length;
        var j = 0;

        if (typeof index === "number") {
            l = index + 1;
            j = index;
        }

        for (; j < l; j++) {
            if (this.cursors[j].IN_USE) {
                var cursor = this.cursors[j];
                var line = cursor.y;
                var i = cursor.x;
                this.line_container.getLine(line).insertCode(code, i);
                cursor.resetSel();
            }
        }
    }

    insertTextAtCursor(char, deletekey, index) {
        var l = this.cursors.length;
        var j = 0;

        if (typeof index === "number") {
            l = index + 1;
            j = index;
        }

        for (; j < l; j++) {
            if (this.cursors[j].IN_USE) {
                var cursor = this.cursors[j];
                var select = cursor.getTextFromSel().length;
                cursor.arrangeSel();
                cursor.setCurToSel();
                var line = cursor.y;
                var i = cursor.x;
                var c = char;

                if (select > 0) 
                    c = this.del_char.repeat(select) + char;

                this.line_container.getLine(line).insertText(c, i);
                cursor.toString();
                cursor.resetSel();
                cursor.IN_USE = false;
            }
        }
    }

    updateText(view = null, index = 0, timeout_limit = 2500) {
        
        this.NEED_UPDATE = 0;

        var line = this.line_container.getIndexedLine(index);

        let timeout = 0;
        
        while (line) {

            line.parse(false, view);

            if(timeout++ > timeout_limit) {
                this.NEED_UPDATE = index + timeout_limit + 1;
                break;
            }

            if(line)
                line = line.nxt;
        }
    }

    toString() {
        var text = "";

        var line = this.line_container.getIndexedLine(0);
        
        while (line) {
            text += this.new_line + line.cache;
            line = line.nxt;
        }

        return text;
    }

    clearContents() {
        //TODO - do proper cleanup to clear contents.
        this.line_container = new LineContainer();
        this.length = 0;
    }
}

//Object to cache fonts in program;


//Font range UTF8 = 33 - 126 ; 93 Characters

const canvas_size = 1024;
// This dna handless the loading and conversion of HTML fonts into font atlases for consumption by text framework. 
class Font {

    static createBackEnd() {
        if (Font.canvas) return;

        Font.existing_fonts = {};

        Font.b_size = 64;
        //No need to create multiple canvas elements
        var canvas = document.createElement("canvas");
        canvas.width = canvas_size;
        canvas.height = canvas_size;
        Font.ctx = canvas.getContext("2d");


        canvas.style.position = "absolute";
        canvas.style.zIndex = 200000;

        Font.canvas = canvas;
    }

    constructor(font_name, mono_space_size = 0) {

        this.IS_MONOSPACE = (mono_space_size > 0);
        this.mono_space_size = mono_space_size;

        this.name = font_name;

        this.atlas_start = 32;
        this.atlas_end = 127;
        this.IS_READY = false;
        this.props = null;


        if (!this.IS_MONOSPACE) {
            Font.createBackEnd();

            if (Font.existing_fonts[font_name]) return Font.existing_fonts[font_name];

            var num_of_workers = 15;

            this.workers = new Array(num_of_workers);
            this.props = new Array(this.atlas_end - this.atlas_start);

            for (var i = 0, l = this.atlas_end - this.atlas_start; i < l; i++) {
                this.props[i] = {};
            }

            Font.existing_fonts[this.name] = this;

            var cache = sessionStorage.getItem(this.name);
            if (cache) {
                cache = JSON.parse(cache);
                this.props = cache.props;
                this.calc_index = Infinity;
                //  this.drawField()
                this.IS_READY = true;
            } else {

                this.calc_index = 0;
                this.finished_index = 0;

                for (var i = 0; i < num_of_workers; i++) {
                    this.finished_index++;
                    this.calcSection(i);
                }
            }
        } else
            this.IS_READY = true;

        this.onComplete();
    }

    calcSize(str, start = 0, end = str.length) {
        let total_size = 0;
        if (this.IS_MONOSPACE) {
            for (let i = start; i < end; i++) {
                let code = str.charCodeAt(i) - 32;

                if (code < 0)
                    continue;

                total_size += this.mono_space_size;
            }
        } else {
            let font_data = this.props;

            for (let i = start; i < end; i++) {
                let code = str.charCodeAt(i) - 32;

                if (code < 0)
                    continue;

                let char = font_data[code];

                total_size += char.width;
            }
        }
        return total_size;
    }

    onComplete() {}

    startCalc() {
        for (var i = 0; i < this.workers.length; i++)
            this.calcSection(i);
    }

    calcSection() {
        var start = this.atlas_start;
        var end = this.atlas_end;
        var length = end - start;
        var i = this.calc_index;
        var font_size = canvas_size * 0.8;

        if (this.calc_index >= length) return;

        Font.canvas.width = canvas_size;
        Font.ctx.font = `${12}px  "${this.name}"`;
        Font.ctx.textBaseline = "middle";
        Font.ctx.textAlign = "center";
        var char = String.fromCharCode(start + i);
        Font.ctx.fillStyle = "black";
        var width = Font.ctx.measureText(char).width; // * (12/300)

        this.props[i] = {
            char: char,
            code: start + i,
            width: width,
            width2: width,
            ratio: width / font_size
        };

        this.calc_index++;

        this.calcSection(i);
    }

    calculateMonospace() {
        return;
        var DIV = document.createElement("pre");

        DIV.style.fontFamily = `${this.name}`;
        DIV.style.fontSize = 12 + "px";
        DIV.style.letterSpacing = 0;
        DIV.style.wordSpacing = 0;
        DIV.style.padding = 0;
        DIV.style.border = 0;
        DIV.style.margin = 0;
        DIV.style.position = "fixed";
        DIV.innerHTML = "A";

        var IS_MONOSPACE = true;
        var last_width = 0;
        var width = 0;

        document.body.appendChild(DIV);

        last_width = DIV.getBoundingClientRect().width;

        for (var i = this.atlas_start, d = 0; i < this.atlas_end; i++, d++) {
            var char = String.fromCharCode(i);
            DIV.innerHTML = char;

            width = DIV.getBoundingClientRect().width;
            this.props[i - this.atlas_start].width = width;
            if (last_width !== width) {
                IS_MONOSPACE = false;
            }
        }

        document.body.removeChild(DIV);

        this.IS_MONOSPACE = IS_MONOSPACE;
    }
}

let k$1 = 0;

class TextIO {

    constructor(element, font) {

        if (element) {
            this.parent_element = element;
            this.DOM = document.createElement("div");
            this.DOM.classList.add("text_edit");
            this.DOM.style.font_kerning = "none";
            element.appendChild(this.DOM);
        }

        this.top = 0;
        this.height = 500;

        this.font = null;
        this.font_size = 12;
        this.letter_spacing = 0;
        this.IS_MONOSPACE = false;
        this.setFont(font || "Times New Roman");

        this.fw = null;
        this.gutter_width = 30;

        //Pixel width limitation to apply to allow word wrapping;
        this.pixel_width = 1500;

        //Amount of pixel padding to add to top and height
        this.pre_roll = 50;
    }


    /*** POSITIONING ***/

    getGutterWidth(line) { return this.gutter_width; }

    getTop() { return this.top - this.pre_roll; }

    getHeight() { return this.height + this.pre_roll * 2; }

    getLineHeight(line) { return 13; }

    setLineHeight() {

    }

    getPixelFromX(x, line) {
        let x_pixel = 0;
        let font_data = this.font.props;

        let size = 13 / 12;


        if (line) {

            var text = line.string;
            let lex = line.pk;
            var i = 0;
            outer:
                while (!lex.END && x > -1) {

                    if (lex.ty == lex.types.data_link) {

                        let code = lex.code;

                        let font_size = (code >> 8) & 255;

                        size = font_size / 12;

                        lex.next();

                        x -= 4;

                        continue;
                    }

                    //Cap to end of line to prevent out of bounds reference
                    let len = lex.off + lex.tl;

                    i = lex.off;

                    for (; x > 0 && i < len; i++) {
                        var code = text.charCodeAt(i);
                        var char = font_data[code - 32];

                        if (code < 32) {
                            //x_pixel += 0;
                        } else {
                            x--;
                            x_pixel += char.width * size;
                        }
                    }


                    lex.next();
                }

        }

        return x_pixel + this.getGutterWidth(line);
    }

    getXFromPixelCoord(x_pixel, line) {
        let x = 1;
        let font_data = this.font.props;

        let size = 13 / 12;

        if (line) {

            let lex = line.pk;
            var text = line.string;
            let total_x = 0;


            outer:
                while (!lex.END) {

                    if (lex.ty == lex.types.data_link) {
                        let code = lex.code;

                        let font_size = code >> 8 & 255;

                        size = font_size / 12;

                        lex.next();

                        continue;
                    }

                    //Cap to end of line to prevent out of bounds reference

                    let l = lex.off + lex.tl;

                    x = lex.off;

                    for (; x < l; x++) {
                        var code = text.charCodeAt(x) - 32;

                        if (code < 0)
                            continue;

                        var char = font_data[code];

                        total_x += char.width * size;

                        if ((x_pixel) < total_x)
                            break outer;
                    }

                    lex.next();
                }

        }



        return x + (line.IS_LINKED_LINE | 0) - 1 - line.linked_offset;
    }

    getYFromPixelCoord(y_pixel, fw = this.fw) {
        let line = this.getLineAtPixelCoord(y_pixel, fw);
        return line.index;
    }

    getLineAtPixelCoord(y_pixel, fw = this.fw) {
        return fw.getLineAtPixelOffset(y_pixel);
    }

    scanToX(x, y_pixel, fw = this.fw) {
        let line = this.getLineAtPixelOffset(y_pixel, fw);
        return this.getPixelFromX(x, line, fw);
    }

    /*** INSERTION HOOKS ***/

    /*** RENDERING ***/

    render(fw = this.fw) {
        fw.renderView(this);
    }

    /**
     * Used to output a rendered text line, which may include markup to handle styling.
     *
     * @param      {Lexer}  lex     A lexer object that will create tokens from an input line. 
     * @return     {String}  The return parsed and formated string.
     */
    parseLine(lex) {
        //render out data links
        let text = `<span style="font-size:${lex.h}px">`;
        let font_size_close = `</span>`;

        while (!lex.END) {
            if (lex.ty !== lex.types.data_link) {

                if (lex.ch == "<")
                    text += "&lt;";
                else if (lex.ch == ">")
                    text += "&gt;";
                else
                    text += lex.tx;

            } else {
                let code = lex.code;
                let font_size = code >> 8 & 255;
                text += `</span><span style="font-size:${font_size}px"><span style="display:inline-block; width:1px; height:100%; margin-left:-1px; background-color:green"></span>`;
            }
            lex.next();
        }

        return text + font_size_close;
    }

    renderLines(lines, offset_top) {

        this.DOM.innerHTML = "";
        this.DOM.style.fontSize = "100%";
        var text = "<div class='small_scale_pre'>";
        let line = null;
        let y = -50;

        while ((line = lines.next().value)) {
            let pk = line.pk.next();
            text += `<pre class='small_scale_pre' style='top:${(y + offset_top)}px'><span style='width:30px; display:inline-block; margin-top:0'>${line.index}</span>${this.parseLine(pk)}</pre>`;
            y += line.pixel_height;
        }

        text += "</div>";

        this.DOM.innerHTML = text;
    }

    renderCursor(cur, fw = this.fw, offset_top) {
        let line = fw.getLine(cur.y);
        let height = line.pixel_height;
        let px = this.getPixelFromX(cur.x, line, fw);
        let py = line.pixel_offset;

        this.DOM.innerHTML += `<div class="txt_cursor" style="top:${py  -  this.top}px; left:${px}px; width:1px; height:${height}px">
        <div style="position:absolute; top:-10px; left:0; font-size10px; color:red; background-color:white">${cur.x}|${cur.rx}|${cur.rx - cur.x}</div>
        </div>`;

        if (cur.HAS_SELECTION) {
            /*
            this.selection_index = 0;

            var id1 = this.id;
            var id2 = (this.selection_y << 10) | this.selection_x

            if (id2 < id1) {
                var x1 = this.selection_x;
                var y1 = this.selection_y;
                var x2 = this.x;
                var y2 = this.y;
            } else {
                var x1 = this.x;
                var y1 = this.y;
                var x2 = this.selection_x;
                var y2 = this.selection_y;
            }

            var line_count = y2 - y1;

            for (var i = 0; i < line_count + 1; i++) {
                var x_start = 0;
                var y = y1 + i;
                var line = this.getLine(y);
                var x_end = line.length - ((line.IS_LINKED_LINE) ? 0 : 1);

                if (i === 0) {
                    x_start = x1;
                }

                if (i == line_count) {

                    x_end = Math.min(x2, line.length - ((line.IS_LINKED_LINE) ? 0 : 1));
                }
            }

            //createSelection(y, x_start, x_end, xc, yc, scale)

            if (!this.selections) {
                for (var i = 0; i < this.selections.length; i++) {
                    var div = this.selections[i];
                    div.hide();
                }
                this.selection_index = 0;
            }

            if (!this.selections[this.selection_index]) {
                var div = document.createElement("div");
                div.style.cssText = `
                position:absolute;
                top:0;
                left:0;
                background-color:rgba(250,0,0,0.5);
                z-index:30000000000;
            `;
                this.selections[this.selection_index] = div;

            }

            var div = this.selections[this.selection_index];
            this.selection_index++;
            var x1 = this.getXCharOffset(x_start, y);
            var x2 = this.getXCharOffset(x_end, y);
            var width = x2 - x1;

            div.show();
            div.style.left = ((x1 + xc) * scale) + "px";
            div.style.top = ((this.getYCharOffset(y) + yc) * scale) + "px";
            div.style.width = width * scale + "px";
            div.style.height = 16 * scale + "px";
            this.fw.parent_element.appendChild(div);
            */
        }
    }

    /*** FONTS ***/

    setFont(font) {
        if (font instanceof Font) {
            this.font = font;
            if (this.DOM)
                this.DOM.style.fontFamily = this.font.name;
        } else {
            this.font = new Font(font);
            if (this.DOM)
                this.DOM.style.fontFamily = this.font.name;
            return new Promise((res, rej) => {
                this.font.onComplete = () => {
                    res();
                };

                if (this.font.IS_READY)
                    res();
                else
                    this.font.startCalc();
            });
        }
    }

    /*** CURSORS ***/

    setCursor(cur, fw = this.fw, pixel_x = 0, pixel_y = 0) {
        let line = this.getLineAtPixelCoord(pixel_y, fw);
        cur.y = line.index;
        cur.line_height = line.pixel_height;
        cur.x = this.getXFromPixelCoord(pixel_x - this.getGutterWidth(line), line, fw);
        cur.defaultX = cur.x;
    }

    /*** EVENT SYSTEMS ***/

    onMouseUp(event, fw = this.fw, x = event.offsetX, y = event.y - this.parent_element.getBoundingClientRect().y) {
        if (!fw) return;
        y += this.top;
        if (event.button !== 0) return;
        if (event.ctrlKey) {

            var cur = fw.aquireCursor();

            this.setCursor(cur, fw, x, y);

            for (var i = 0; i < fw.cursors.length; i++) {
                var c1 = fw.cursors[i];
                if (c1.IN_USE)
                    for (var j = i + 1; j < fw.cursors.length; j++) {
                        var c2 = fw.cursors[j];
                        if (c2.IN_USE && c1.id > c2.id) {
                            let x = c1.x;
                            c1.x = c2.x;
                            c2.x = x;
                            x = c1.y;
                            c1.y = c2.y;
                            c2.y = x;
                        }
                    }
            }
        } else {
            for (let i = 1; i < fw.cursors.length; i++)
                fw.releaseCursor(fw.cursors[i]);

            this.setCursor(fw.cursors[0], fw, x, y);
        }

        fw.checkForCursorOverlap();
        this.render(fw);
        event.preventDefault();
    }

    onKeyPress(event, fw = this.fw) {
        if (!fw) return;

        var keycode = event.keyCode;
        var text = String.fromCharCode(keycode);
        if (event.ctrlKey) {
            return;
        } else {
            if (text.length > 0) {
                switch (keycode) {
                    case 13:
                        text = fw.new_line;
                        break;
                    default:

                        break;
                }

                fw.insertTextAtCursor(text);

                fw.last_keycode = keycode;
            }
        }

        fw.updateText(this);
        this.render(fw);
    }

    onKeyDown(event, fw = this.fw) {
        if (!fw) return;

        var keycode = event.keyCode;
        var UPDATED = false;
        //if delete key is pressed. 
        if (keycode === 8 || keycode === 46) {
            if (keycode === 46)
                fw.moveCursorsByX(1);
            fw.insertTextAtCursor(String.fromCharCode(8), (keycode === 46));
            fw.updateText(this);
            event.preventDefault();
            UPDATED = true;
        } else if (keycode == 37) { //left
            fw.moveCursorsByX(-1);
            UPDATED = true;
        } else if (keycode == 38) { //top
            fw.moveCursorsByY(-1);
            UPDATED = true;
        } else if (keycode == 39) { //right
            fw.moveCursorsByX(1);
            UPDATED = true;
        } else if (keycode == 40) { //bottom
            //fw.moveCursorsByY(1);
            let font_size = 25 + (k$1 -= 5);
            let code = font_size << 8;
            fw.insertCodeAtCursor(code);
            fw.updateText(this);
            event.preventDefault();
            UPDATED = true;
        }

        if (UPDATED)
            this.render(fw);
    }

    onMouseWheel(event, fw = this.fw) {
        let delta = event.deltaY * 0.05;

        if (Math.abs(delta) < 5) return;
        this.top += delta;
        this.render(fw);
    }
}

/**
 * To be extended by objects needing linked list methods.
 */
const LinkedList = {

    props: {
        /**
         * Properties for horizontal graph traversal
         * @property {object}
         */
        defaults: {
            /**
             * Next sibling node
             * @property {object | null}
             */
            nxt: null,

            /**
             * Previous sibling node
             * @property {object | null}
             */
            prv: null
        },

        /**
         * Properties for vertical graph traversal
         * @property {object}
         */
        children: {
            /**
             * Number of children nodes.
             * @property {number}
             */
            noc: 0,
            /**
             * First child node
             * @property {object | null}
             */
            fch: null,
        },
        parent: {
            /**
             * Parent node
             * @property {object | null}
             */
            par: null
        }
    },

    methods: {
        /**
         * Default methods for Horizontal traversal
         */
        defaults: {

            insertBefore: function(node) {

                if (!this.nxt || !this.prv) {
                    this.nxt = this;
                    this.prv = this;
                }

                if (node.prv || node.nxt) {
                    node.prv.nxt = node.nxt;
                    node.nxt.prv = node.prv;
                }

                node.prv = this.prv;
                this.prv.nxt = node;
                node.nxt = this;
                this.prv = node;
            },

            insertAfter: function(node) {

                if (!this.nxt || !this.prv) {
                    this.nxt = this;
                    this.prv = this;
                }

                if (node.prv || node.nxt) {
                    node.prv.nxt = node.nxt;
                    node.nxt.prv = node.prv;
                }

                this.nxt.prv = node;
                node.nxt = this.nxt;
                this.nxt = node;
                node.prv = this;
            }
        },
        /**
         * Methods for both horizontal and vertical traversal.
         */
        parent_child: {
            /**
             *  Returns eve. 
             * @return     {<type>}  { description_of_the_return_value }
             */
            root() {
                return this.eve();
            },
            /**
             * Returns the root node. 
             * @return     {Object}  return the very first node in the linked list graph.
             */
            eve() {
                if (this.par)
                    return this.par.eve();
                return this;
            },

            push(node) {
                this.addChild(node);
            },

            unshift(node) {
                this.addChild(node, (this.fch) ? this.fch.pre : null);
            },

            replace(old_node, new_node) {
                if (old_node.par == this && old_node !== new_node) {
                    if (new_node.par) new_node.par.remove(new_node);

                    if (this.fch == old_node) this.fch = new_node;
                    new_node.par = this;


                    if (old_node.nxt == old_node) {
                        new_node.nxt = new_node;
                        new_node.prv = new_node;
                    } else {
                        new_node.prv = old_node.prv;
                        new_node.nxt = old_node.nxt;
                        old_node.nxt.prv = new_node;
                        old_node.prv.nxt = new_node;
                    }

                    old_node.par = null;
                    old_node.prv = null;
                    old_node.nxt = null;
                }
            },

            insertBefore: function(node) {
                if (this.par)
                    this.par.addChild(node, this.pre);
                else
                    LinkedList.methods.defaults.insertBefore.call(this, node);
            },

            insertAfter: function(node) {
                if (this.par)
                    this.par.addChild(node, this);
                else
                    LinkedList.methods.defaults.insertAfter.call(this, node);
            },

            addChild: function(child = null, prev = null) {

                if (!child) return;

                if (child.par)
                    child.par.removeChild(child);

                if (prev && prev.par && prev.par == this) {
                    if (child == prev) return;
                    child.prv = prev;
                    prev.nxt.prv = child;
                    child.nxt = prev.nxt;
                    prev.nxt = child;
                } else if (this.fch) {
                    child.prv = this.fch.prv;
                    this.fch.prv.nxt = child;
                    child.nxt = this.fch;
                    this.fch.prv = child;
                } else {
                    this.fch = child;
                    child.nxt = child;
                    child.prv = child;
                }

                child.par = this;
                this.noc++;
            },

            /**
             * Analogue to HTMLElement.removeChild()
             *
             * @param      {HTMLNode}  child   The child
             */
            removeChild: function(child) {
                if (child.par && child.par == this) {
                    child.prv.nxt = child.nxt;
                    child.nxt.prv = child.prv;

                    if (child.prv == child || child.nxt == child) {
                        if (this.fch == child)
                            this.fch = null;
                    } else if (this.fch == child)
                        this.fch = child.nxt;

                    child.prv = null;
                    child.nxt = null;
                    child.par = null;
                    this.noc--;
                }
            },

            /**
             * Gets the next node. 
             *
             * @param      {HTMLNode}  node    The node to get the sibling of.
             * @return {HTMLNode | TextNode | undefined}
             */
            getNextChild: function(node = this.fch) {
                if (node && node.nxt != this.fch && this.fch)
                    return node.nxt;
                return null;
            },

            /**
             * Gets the child at index.
             *
             * @param      {number}  index   The index
             */
            getChildAtIndex: function(index, node = this.fch) {
                if(node.par !== this)
                    node = this.fch;

                let first = node;
                let i = 0;
                while (node && node != first) {
                    if (i++ == index)
                        return node;
                    node = node.nxt;
                }

                return null;
            },
        }
    },

    gettersAndSetters : {
        peer : {
            next: {
                enumerable: true,
                configurable: true,
                get: function() {
                    return this.nxt;
                },
                set: function(n) {
                    this.insertAfter(n);
                }
            },
            previous: {
                enumerable: true,
                configurable: true,
                get: function() {
                    return this.prv;
                },
                set: function(n) {
                    this.insertBefore(n);
                }   
            }
        },
        tree : {
            children: {
                enumerable: true,
                configurable: true,
                /**
                 * @return {array} Returns an array of all children.
                 */
                get: function() {
                    for (var z = [], i = 0, node = this.fch; i++ < this.noc;)(
                        z.push(node), node = node.nxt
                    );
                    return z;
                },
                set: function(e) {
                    /* No OP */
                }
            },
            parent: {
                enumerable: true,
                configurable: true,
                /**
                 * @return parent node
                 */
                get: function() {
                    return this.par;
                },
                set: function(p) {
                    if(p && p.addChild)
                        p.addChild(this);
                    else if(p === null && this.par)
                        this.par.removeChild(this);
                }
            }
        }
    },


    mixin : (constructor)=>{
        const proto = (typeof(constructor) == "function") ? constructor.prototype : (typeof(constructor) == "object") ? constructor : null;
        if(proto){
            Object.assign(proto, 
                LinkedList.props.defaults, 
                LinkedList.methods.defaults
            );
        }
        Object.defineProperties(proto, LinkedList.gettersAndSetters.peer);
    },

    mixinTree : (constructor)=>{
        const proto = (typeof(constructor) == "function") ? constructor.prototype : (typeof(constructor) == "object") ? constructor : null;
        if(proto){
            Object.assign(proto, 
                LinkedList.props.defaults, 
                LinkedList.props.children, 
                LinkedList.props.parent, 
                LinkedList.methods.defaults, 
                LinkedList.methods.parent_child
                );
            Object.defineProperties(proto, LinkedList.gettersAndSetters.tree);
            Object.defineProperties(proto, LinkedList.gettersAndSetters.peer);
        }
    }
};

class Color extends Float64Array {

    constructor(r, g, b, a = 0) {
        super(4);

        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 1;

        if (typeof(r) === "number") {
            this.r = r; //Math.max(Math.min(Math.round(r),255),-255);
            this.g = g; //Math.max(Math.min(Math.round(g),255),-255);
            this.b = b; //Math.max(Math.min(Math.round(b),255),-255);
            this.a = a; //Math.max(Math.min(a,1),-1);
        }
    }

    get r() {
        return this[0];
    }

    set r(r) {
        this[0] = r;
    }

    get g() {
        return this[1];
    }

    set g(g) {
        this[1] = g;
    }

    get b() {
        return this[2];
    }

    set b(b) {
        this[2] = b;
    }

    get a() {
        return this[3];
    }

    set a(a) {
        this[3] = a;
    }

    set(color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = (color.a != undefined) ? color.a : this.a;
    }

    add(color) {
        return new Color(
            color.r + this.r,
            color.g + this.g,
            color.b + this.b,
            color.a + this.a
        );
    }

    mult(color) {
        if (typeof(color) == "number") {
            return new Color(
                this.r * color,
                this.g * color,
                this.b * color,
                this.a * color
            );
        } else {
            return new Color(
                this.r * color.r,
                this.g * color.g,
                this.b * color.b,
                this.a * color.a
            );
        }
    }

    sub(color) {
        return new Color(
            this.r - color.r,
            this.g - color.g,
            this.b - color.b,
            this.a - color.a
        );
    }

    lerp(to, t){
        return this.add(to.sub(this).mult(t));
    }

    toString() {
        return `rgba(${this.r|0},${this.g|0},${this.b|0},${this.a})`;
    }

    toJSON() {
        return `rgba(${this.r|0},${this.g|0},${this.b|0},${this.a})`;
    }

    copy(other){
        let out = new Color(other);
        return out;
    }
}

/*
    BODY {color: black; background: white }
    H1 { color: maroon }
    H2 { color: olive }
    EM { color: #f00 }              // #rgb //
    EM { color: #ff0000 }           // #rrggbb //
    EM { color: rgb(255,0,0) }      // integer range 0 - 255 //
    EM { color: rgb(100%, 0%, 0%) } // float range 0.0% - 100.0% //
*/
class CSS_Color extends Color {

    constructor(r, g, b, a) {
        super(r, g, b, a);

        if (typeof(r) == "string")
            this.set(CSS_Color._fs_(r) || {r:255,g:255,b:255,a:0});

    }

    static parse(l, rule, r) {

        let c = CSS_Color._fs_(l);

        if (c) {
            l.next();

            let color = new CSS_Color();

            color.set(c);

            return color;
        }

        return null;
    }
    static _verify_(l) {
        let c = CSS_Color._fs_(l, true);
        if (c)
            return true;
        return false;
    }
    /**
        Creates a new Color from a string or a Lexer.
    */
    static _fs_(l, v = false) {

        let c;

        if (typeof(l) == "string")
            l = whind$1(l);

        let out = { r: 0, g: 0, b: 0, a: 1 };

        switch (l.ch) {
            case "#":
                var value = l.next().tx;
                let num = parseInt(value,16);
                
                out = { r: 0, g: 0, b: 0, a: 1 };
                if(value.length == 3){
                    out.r = (num >> 8) & 0xF;
                    out.g = (num >> 4) & 0xF;
                    out.b = (num) & 0xF;
                }else{
                    if(value.length == 6){
                        out.r = (num >> 16) & 0xFF;
                        out.g = (num >> 8) & 0xFF;
                        out.b = (num) & 0xFF;
                    }if(value.length == 8){
                        out.r = (num >> 24) & 0xFF;
                        out.g = (num >> 16) & 0xFF;
                        out.b = (num >> 8) & 0xFF;
                        out.a = ((num) & 0xFF);
                    }
                }
                l.next();
                break;
            case "r":
                let tx = l.tx;
                if (tx == "rgba") {
                    out = { r: 0, g: 0, b: 0, a: 1 };
                    l.next(); // (
                    out.r = parseInt(l.next().tx);
                    l.next(); // ,
                    out.g = parseInt(l.next().tx);
                    l.next(); // ,
                    out.b = parseInt(l.next().tx);
                    l.next(); // ,
                    out.a = parseFloat(l.next().tx);
                    l.next();
                    c = new CSS_Color();
                    c.set(out);
                    return c;
                } else if (tx == "rgb") {
                    out = { r: 0, g: 0, b: 0, a: 1 };
                    l.next(); // (
                    out.r = parseInt(l.next().tx);
                    l.next(); // ,
                    out.g = parseInt(l.next().tx);
                    l.next(); // ,
                    out.b = parseInt(l.next().tx);
                    l.next();
                    c = new CSS_Color();
                    c.set(out);
                    return c;
                } // intentional
            default:
                let string = l.tx;

                if (l.ty == l.types.str)
                    string = string.slice(1, -1);

                out = CSS_Color.colors[string.toLowerCase()];
        }

        return out;
    }
} {

    let _$ = (r = 0, g = 0, b = 0, a = 1) => ({ r, g, b, a });
    let c = _$(0, 255, 25);
    CSS_Color.colors = {
        "alice blue": _$(240, 248, 255),
        "antique white": _$(250, 235, 215),
        "aqua marine": _$(127, 255, 212),
        "aqua": c,
        "azure": _$(240, 255, 255),
        "beige": _$(245, 245, 220),
        "bisque": _$(255, 228, 196),
        "black": _$(),
        "blanched almond": _$(255, 235, 205),
        "blue violet": _$(138, 43, 226),
        "blue": _$(0, 0, 255),
        "brown": _$(165, 42, 42),
        "burly wood": _$(222, 184, 135),
        "cadet blue": _$(95, 158, 160),
        "chart reuse": _$(127, 255),
        "chocolate": _$(210, 105, 30),
        "clear": _$(255, 255, 255),
        "coral": _$(255, 127, 80),
        "corn flower blue": _$(100, 149, 237),
        "corn silk": _$(255, 248, 220),
        "crimson": _$(220, 20, 60),
        "cyan": c,
        "dark blue": _$(0, 0, 139),
        "dark cyan": _$(0, 139, 139),
        "dark golden rod": _$(184, 134, 11),
        "dark gray": _$(169, 169, 169),
        "dark green": _$(0, 100),
        "dark khaki": _$(189, 183, 107),
        "dark magenta": _$(139, 0, 139),
        "dark olive green": _$(85, 107, 47),
        "dark orange": _$(255, 140),
        "dark orchid": _$(153, 50, 204),
        "dark red": _$(139),
        "dark salmon": _$(233, 150, 122),
        "dark sea green": _$(143, 188, 143),
        "dark slate blue": _$(72, 61, 139),
        "dark slate gray": _$(47, 79, 79),
        "dark turquoise": _$(0, 206, 209),
        "dark violet": _$(148, 0, 211),
        "deep pink": _$(255, 20, 147),
        "deep sky blue": _$(0, 191, 255),
        "dim gray": _$(105, 105, 105),
        "dodger blue": _$(30, 144, 255),
        "firebrick": _$(178, 34, 34),
        "floral white": _$(255, 250, 240),
        "forest green": _$(34, 139, 34),
        "fuchsia": _$(255, 0, 255),
        "gainsboro": _$(220, 220, 220),
        "ghost white": _$(248, 248, 255),
        "gold": _$(255, 215),
        "golden rod": _$(218, 165, 32),
        "gray": _$(128, 128, 128),
        "green yellow": _$(173, 255, 47),
        "green": _$(0, 128),
        "honeydew": _$(240, 255, 240),
        "hot pink": _$(255, 105, 180),
        "indian red": _$(205, 92, 92),
        "indigo": _$(75, 0, 130),
        "ivory": _$(255, 255, 240),
        "khaki": _$(240, 230, 140),
        "lavender blush": _$(255, 240, 245),
        "lavender": _$(230, 230, 250),
        "lawn green": _$(124, 252),
        "lemon chiffon": _$(255, 250, 205),
        "light blue": _$(173, 216, 230),
        "light coral": _$(240, 128, 128),
        "light cyan": _$(224, 255, 255),
        "light golden rod yellow": _$(250, 250, 210),
        "light gray": _$(211, 211, 211),
        "light green": _$(144, 238, 144),
        "light pink": _$(255, 182, 193),
        "light salmon": _$(255, 160, 122),
        "light sea green": _$(32, 178, 170),
        "light sky blue": _$(135, 206, 250),
        "light slate gray": _$(119, 136, 153),
        "light steel blue": _$(176, 196, 222),
        "light yellow": _$(255, 255, 224),
        "lime green": _$(50, 205, 50),
        "lime": _$(0, 255),
        "lime": _$(0, 255),
        "linen": _$(250, 240, 230),
        "magenta": _$(255, 0, 255),
        "maroon": _$(128),
        "medium aqua marine": _$(102, 205, 170),
        "medium blue": _$(0, 0, 205),
        "medium orchid": _$(186, 85, 211),
        "medium purple": _$(147, 112, 219),
        "medium sea green": _$(60, 179, 113),
        "medium slate blue": _$(123, 104, 238),
        "medium spring green": _$(0, 250, 154),
        "medium turquoise": _$(72, 209, 204),
        "medium violet red": _$(199, 21, 133),
        "midnight blue": _$(25, 25, 112),
        "mint cream": _$(245, 255, 250),
        "misty rose": _$(255, 228, 225),
        "moccasin": _$(255, 228, 181),
        "navajo white": _$(255, 222, 173),
        "navy": _$(0, 0, 128),
        "old lace": _$(253, 245, 230),
        "olive drab": _$(107, 142, 35),
        "olive": _$(128, 128),
        "orange red": _$(255, 69),
        "orange": _$(255, 165),
        "orchid": _$(218, 112, 214),
        "pale golden rod": _$(238, 232, 170),
        "pale green": _$(152, 251, 152),
        "pale turquoise": _$(175, 238, 238),
        "pale violet red": _$(219, 112, 147),
        "papaya whip": _$(255, 239, 213),
        "peach puff": _$(255, 218, 185),
        "peru": _$(205, 133, 63),
        "pink": _$(255, 192, 203),
        "plum": _$(221, 160, 221),
        "powder blue": _$(176, 224, 230),
        "purple": _$(128, 0, 128),
        "red": _$(255),
        "rosy brown": _$(188, 143, 143),
        "royal blue": _$(65, 105, 225),
        "saddle brown": _$(139, 69, 19),
        "salmon": _$(250, 128, 114),
        "sandy brown": _$(244, 164, 96),
        "sea green": _$(46, 139, 87),
        "sea shell": _$(255, 245, 238),
        "sienna": _$(160, 82, 45),
        "silver": _$(192, 192, 192),
        "sky blue": _$(135, 206, 235),
        "slate blue": _$(106, 90, 205),
        "slate gray": _$(112, 128, 144),
        "snow": _$(255, 250, 250),
        "spring green": _$(0, 255, 127),
        "steel blue": _$(70, 130, 180),
        "tan": _$(210, 180, 140),
        "teal": _$(0, 128, 128),
        "thistle": _$(216, 191, 216),
        "tomato": _$(255, 99, 71),
        "transparent": _$(0, 0, 0, 0),
        "turquoise": _$(64, 224, 208),
        "violet": _$(238, 130, 238),
        "wheat": _$(245, 222, 179),
        "white smoke": _$(245, 245, 245),
        "white": _$(255, 255, 255),
        "yellow green": _$(154, 205, 50),
        "yellow": _$(255, 255)
    };
}

class CSS_Percentage extends Number {
    
    static parse(l, rule, r) {
        let tx = l.tx,
            pky = l.pk.ty;

        if (l.ty == l.types.num || tx == "-" && pky == l.types.num) {
            let mult = 1;

            if (l.ch == "-") {
                mult = -1;
                tx = l.p.tx;
                l.p.next();
            }

            if (l.p.ch == "%") {
                l.sync().next();
                return new CSS_Percentage(parseFloat(tx) * mult);
            }
        }
        return null;
    }

    constructor(v) {

        if (typeof(v) == "string") {
            let lex = whind(v);
            let val = CSS_Percentage.parse(lex);
            if (val) 
                return val;
        }
        
        super(v);
    }

    static _verify_(l) {
        if(typeof(l) == "string" &&  !isNaN(parseInt(l)) && l.includes("%"))
            return true;
        return false;
    }

    toJSON() {
        return super.toString() + "%";
    }

    toString(radix) {
        return super.toString(radix) + "%";
    }

    get str() {
        return this.toString();
    }

    lerp(to, t) {
        return new CSS_Percentage(this + (to - this) * t);
    }

    copy(other){
        return new CSS_Percentage(other);
    }

    get type(){
        return "%";
    }
}

class CSS_Length extends Number {
    static parse(l, rule, r) {
        let tx = l.tx,
            pky = l.pk.ty;
        if (l.ty == l.types.num || tx == "-" && pky == l.types.num) {
            let mult = 1;
            if (l.ch == "-") {
                mult = -1;
                tx = l.p.tx;
                l.p.next();
            }
            if (l.p.ty == l.types.id) {
                let id = l.sync().tx;
                l.next();
                return new CSS_Length(parseFloat(tx) * mult, id);
            }
        }
        return null;
    }

    static _verify_(l) {
        if (typeof(l) == "string" && !isNaN(parseInt(l)) && !l.includes("%")) return true;
        return false;
    }

    constructor(v, u = "") {
        
        if (typeof(v) == "string") {
            let lex = whind$1(v);
            let val = CSS_Length.parse(lex);
            if (val) return val;
        }

        if(u){
            switch(u){
                //Absolute
                case "px": return new PXLength(v);
                case "mm": return new MMLength(v);
                case "cm": return new CMLength(v);
                case "in": return new INLength(v);
                case "pc": return new PCLength(v);
                case "pt": return new PTLength(v);
                
                //Relative
                case "ch": return new CHLength(v);
                case "em": return new EMLength(v);
                case "ex": return new EXLength(v);
                case "rem": return new REMLength(v);

                //View Port
                case "vh": return new VHLength(v);
                case "vw": return new VWLength(v);
                case "vmin": return new VMINLength(v);
                case "vmax": return new VMAXLength(v);

                //Deg
                case "deg": return new DEGLength(v);

                case "%" : return new CSS_Percentage(v);
            }
        }

        super(v);
    }

    get milliseconds() {
        switch (this.unit) {
            case ("s"):
                return parseFloat(this) * 1000;
        }
        return parseFloat(this);
    }

    toString(radix) {
        return super.toString(radix) + "" + this.unit;
    }

    toJSON() {
        return super.toString() + "" + this.unit;
    }

    get str() {
        return this.toString();
    }

    lerp(to, t) {
        return new CSS_Length(this + (to - this) * t, this.unit);
    }

    copy(other) {
        return new CSS_Length(other, this.unit);
    }

    set unit(t){}
    get unit(){return "";}
}

class PXLength extends CSS_Length {
    get unit(){return "px";}
}
class MMLength extends CSS_Length {
    get unit(){return "mm";}
}
class CMLength extends CSS_Length {
    get unit(){return "cm";}
}
class INLength extends CSS_Length {
    get unit(){return "in";}
}
class PTLength extends CSS_Length {
    get unit(){return "pt";}
}
class PCLength extends CSS_Length {
    get unit(){return "pc";}
}
class CHLength extends CSS_Length {
    get unit(){return "ch";}
}
class EMLength extends CSS_Length {
    get unit(){return "em";}
}
class EXLength extends CSS_Length {
    get unit(){return "ex";}
}
class REMLength extends CSS_Length {
    get unit(){return "rem";}
}
class VHLength extends CSS_Length {
    get unit(){return "vh";}
}
class VWLength extends CSS_Length {
    get unit(){return "vw";}
}
class VMINLength extends CSS_Length {
    get unit(){return "vmin";}
}
class VMAXLength extends CSS_Length {
    get unit(){return "vmax";}
}
class DEGLength extends CSS_Length {
    get unit(){return "deg";}
}

const uri_reg_ex = /(?:([^\:\?\[\]\@\/\#\b\s][^\:\?\[\]\@\/\#\b\s]*)(?:\:\/\/))?(?:([^\:\?\[\]\@\/\#\b\s][^\:\?\[\]\@\/\#\b\s]*)(?:\:([^\:\?\[\]\@\/\#\b\s]*)?)?\@)?(?:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|((?:\[[0-9a-f]{1,4})+(?:\:[0-9a-f]{0,4}){2,7}\])|([^\:\?\[\]\@\/\#\b\s\.]{2,}(?:\.[^\:\?\[\]\@\/\#\b\s]*)*))?(?:\:(\d+))?((?:[^\?\[\]\#\s\b]*)+)?(?:\?([^\[\]\#\s\b]*))?(?:\#([^\#\s\b]*))?/i;

const STOCK_LOCATION = {
    protocol :"",
    host :"",
    port :"",
    path :"",
    hash :"",
    query :"",
    search:""
};

function fetchLocalText(URL, m = "same-origin") {
    return new Promise((res, rej) => {
        fetch(URL, {
            mode: m, // CORs not allowed
            credentials: m,
            method: "Get"
        }).then(r => {
            if (r.status < 200 || r.status > 299)
                r.text().then(rej);
            else
                r.text().then(res);
        }).catch(e => rej(e));
    });
}

function fetchLocalJSON(URL, m = "same-origin") {
    return new Promise((res, rej) => {
        fetch(URL, {
            mode: m, // CORs not allowed
            credentials: m,
            method: "Get"
        }).then(r => {
            if (r.status < 200 || r.status > 299)
                r.json().then(rej);
            else
                r.json().then(res).catch(rej);
        }).catch(e => rej(e));
    });
}

function submitForm(URL, form_data, m = "same-origin") {
    return new Promise((res, rej) => {
        var form;

        if (form_data instanceof FormData)
            form = form_data;
        else {
            form = new FormData();
            for (let name in form_data)
                form.append(name, form_data[name] + "");
        }

        fetch(URL, {
            mode: m, // CORs not allowed
            credentials: m,
            method: "POST",
            body: form,
        }).then(r => {
            if (r.status < 200 || r.status > 299)
                r.text().then(rej);
            else
                r.json().then(res);
        }).catch(e => e.text().then(rej));
    });
}

function submitJSON(URL, json_data, m = "same-origin") {
    return new Promise((res, rej) => {
        fetch(URL, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            mode: m, // CORs not allowed
            credentials: m,
            method: "POST",
            body: JSON.stringify(json_data),
        }).then(r => {
            if (r.status < 200 || r.status > 299)
                r.json().then(rej);
            else
                r.json().then(res);
        }).catch(e => e.text().then(rej));
    });
}



/**
 * Used for processing URLs, handling `document.location`, and fetching data.
 * @param      {string}   url           The URL string to wrap.
 * @param      {boolean}  USE_LOCATION  If `true` missing URL parts are filled in with data from `document.location`. 
 * @return     {URL}   If a falsy value is passed to `url`, and `USE_LOCATION` is `true` a Global URL is returned. This is directly linked to the page and will _update_ the actual page URL when its values are change. Use with caution. 
 * @alias URL
 * @memberof module:wick.core.network
 */
class URL {

    static resolveRelative(URL_or_url_original, URL_or_url_new) {
        
        let URL_old = (URL_or_url_original instanceof URL) ? URL_or_url_original : new URL(URL_or_url_original);
        let URL_new = (URL_or_url_new instanceof URL) ? URL_or_url_new : new URL(URL_or_url_new);

        let new_path = "";
        if (URL_new.path[0] != "/") {

            let a = URL_old.path.split("/");
            let b = URL_new.path.split("/");


            if (b[0] == "..") a.splice(a.length - 1, 1);
            for (let i = 0; i < b.length; i++) {
                switch (b[i]) {
                    case "..":
                    case ".":
                        a.splice(a.length - 1, 1);
                        break;
                    default:
                        a.push(b[i]);
                }
            }
            URL_new.path = a.join("/");
        }


        return URL_new;
    }

    constructor(url = "", USE_LOCATION = false) {

        let IS_STRING = true;
        

        const location = (typeof(document) !== "undefined") ? document.location : STOCK_LOCATION;

        if (!url || typeof(url) != "string") {
            IS_STRING = false;
            if (URL.GLOBAL && USE_LOCATION)
                return URL.GLOBAL;
        }

        /**
         * URL protocol
         */
        this.protocol = "";

        /**
         * Username string
         */
        this.user = "";

        /**
         * Password string
         */
        this.pwd = "";

        /**
         * URL hostname
         */
        this.host = "";

        /**
         * URL network port number.
         */
        this.port = 0;

        /**
         * URL resource path
         */
        this.path = "";

        /**
         * URL query string.
         */
        this.query = "";

        /**
         * Hashtag string
         */
        this.hash = "";

        /**
         * Map of the query data
         */
        this.map = null;

        if (IS_STRING) {
            if (url instanceof URL) {
                this.protocol = url.protocol;
                this.user = url.user;
                this.pwd = url.pwd;
                this.host = url.host;
                this.port = url.port;
                this.path = url.path;
                this.query = url.query;
                this.hash = url.hash;
            } else {
                let part = url.match(uri_reg_ex);
                this.protocol = part[1] || ((USE_LOCATION) ? location.protocol : "");
                this.user = part[2] || "";
                this.pwd = part[3] || "";
                this.host = part[4] || part[5] || part[6] || ((USE_LOCATION) ? location.hostname : "");
                this.port = parseInt(part[7] || ((USE_LOCATION) ? location.port : 0));
                this.path = part[8] || ((USE_LOCATION) ? location.pathname : "");
                this.query = part[9] || ((USE_LOCATION) ? location.search.slice(1) : "");
                this.hash = part[10] || ((USE_LOCATION) ? location.hash.slice(1) : "");
            }
        } else if (USE_LOCATION) {

            URL.G = this;
            this.protocol = location.protocol;
            this.host = location.hostname;
            this.port = location.port;
            this.path = location.pathname;
            this.hash = location.hash.slice(1);
            this.query = location.search.slice(1);
            this._getQuery_(this.query);

            return URL.R;
        }
        this._getQuery_(this.query);
    }


    /**
    URL Query Syntax

    root => [root_class] [& [class_list]]
         => [class_list]

    root_class = key_list

    class_list [class [& key_list] [& class_list]]

    class => name & key_list

    key_list => [key_val [& key_list]]

    key_val => name = val

    name => ALPHANUMERIC_ID

    val => NUMBER
        => ALPHANUMERIC_ID
    */

    /**
     * Pulls query string info into this.map
     * @private
     */
    _getQuery_() {
        let map = (this.map) ? this.map : (this.map = new Map());

        let lex = whind$1(this.query);


        const get_map = (k, m) => (m.has(k)) ? m.get(k) : m.set(k, new Map).get(k);

        let key = 0,
            key_val = "",
            class_map = get_map(key_val, map),
            lfv = 0;

        while (!lex.END) {
            switch (lex.tx) {
                case "&": //At new class or value
                    if (lfv > 0)
                        key = (class_map.set(key_val, lex.s(lfv)), lfv = 0, lex.n.pos);
                    else {
                        key_val = lex.s(key);
                        key = (class_map = get_map(key_val, map), lex.n.pos);
                    }
                    continue;
                case "=":
                    //looking for a value now
                    key_val = lex.s(key);
                    lfv = lex.n.pos;
                    continue;
            }
            lex.n;
        }

        if (lfv > 0) class_map.set(key_val, lex.s(lfv));
    }

    setPath(path$$1) {

        this.path = path$$1;

        return new URL(this);
    }

    setLocation() {
        history.replaceState({}, "replaced state", `${this}`);
        window.onpopstate();
    }

    toString() {
        let str = [];

        if (this.protocol && this.host)
            str.push(`${this.protocol}://`);

        if (this.host)
            str.push(`${this.host}`);

        if (this.port)
            str.push(`:${this.port}`);

        if (this.path)
            str.push(`${this.path[0] == "/" ? "" : "/"}${this.path}`);

        if (this.query)
            str.push(this.query);

        return str.join("");
    }

    /**
     * Pulls data stored in query string into an object an returns that.
     * @param      {string}  class_name  The class name
     * @return     {object}  The data.
     */
    getData(class_name = "") {
        if (this.map) {
            let out = {};
            let _c = this.map.get(class_name);
            if (_c) {
                for (let [key, val] of _c.entries())
                    out[key] = val;
                return out;
            }
        }
        return null;
    }

    /**
     * Sets the data in the query string. Wick data is added after a second `?` character in the query field, and appended to the end of any existing data.
     * @param      {string}  class_name  Class name to use in query string. Defaults to root, no class 
     * @param      {object | Model | AnyModel}  data        The data
     */
    setData(data = null, class_name = "") {

        if (data) {

            let map = this.map = new Map();

            let store = (map.has(class_name)) ? map.get(class_name) : (map.set(class_name, new Map()).get(class_name));

            //If the data is a falsy value, delete the association.

            for (let n in data) {
                if (data[n] !== undefined && typeof data[n] !== "object")
                    store.set(n, data[n]);
                else
                    store.delete(n);
            }

            //set query
            let class_, null_class, str = "";

            if ((null_class = map.get(""))) {
                if (null_class.size > 0) {
                    for (let [key, val] of null_class.entries())
                        str += `&${key}=${val}`;

                }
            }

            for (let [key, class_] of map.entries()) {
                if (key === "")
                    continue;
                if (class_.size > 0) {
                    str += `&${key}`;
                    for (let [key, val] of class_.entries())
                        str += `&${key}=${val}`;
                }
            }

            str = str.slice(1);

            this.query = this.query.split("?")[0] + "?" + str;

            if (URL.G == this)
                this.goto();
        } else {
            this.query = "";
        }

        return this;

    }

    /**
     * Fetch a string value of the remote resource. 
     * Just uses path component of URL. Must be from the same origin.
     * @param      {boolean}  [ALLOW_CACHE=true]  If `true`, the return string will be cached. If it is already cached, that will be returned instead. If `false`, a network fetch will always occur , and the result will not be cached.
     * @return     {Promise}  A promise object that resolves to a string of the fetched value.
     */
    fetchText(ALLOW_CACHE = true) {

        if (ALLOW_CACHE) {

            let resource = URL.RC.get(this.path);

            if (resource)
                return new Promise((res) => {
                    res(resource);
                });
        }

        return fetchLocalText(this.path).then(res => (URL.RC.set(this.path, res), res));
    }

    /**
     * Fetch a JSON value of the remote resource. 
     * Just uses path component of URL. Must be from the same origin.
     * @param      {boolean}  [ALLOW_CACHE=true]  If `true`, the return string will be cached. If it is already cached, that will be returned instead. If `false`, a network fetch will always occur , and the result will not be cached.
     * @return     {Promise}  A promise object that resolves to a string of the fetched value.
     */
    fetchJSON(ALLOW_CACHE = true) {

        let string_url = this.toString();

        if (ALLOW_CACHE) {

            let resource = URL.RC.get(string_url);

            if (resource)
                return new Promise((res) => {
                    res(resource);
                });
        }

        return fetchLocalJSON(string_url).then(res => (URL.RC.set(this.path, res), res));
    }

    /**
     * Cache a local resource at the value 
     * @param    {object}  resource  The resource to store at this URL path value.
     * @returns {boolean} `true` if a resource was already cached for this URL, false otherwise.
     */
    cacheResource(resource) {

        let occupied = URL.RC.has(this.path);

        URL.RC.set(this.path, resource);

        return occupied;
    }

    submitForm(form_data) {
        return submitForm(this.toString(), form_data);
    }

    submitJSON(json_data) {
            return submitJSON(this.toString(), json_data);
        }
        /**
         * Goes to the current URL.
         */
    goto() {
        return;
        let url = this.toString();
        history.pushState({}, "ignored title", url);
        window.onpopstate();
        URL.G = this;
    }

    get pathname() {
        return this.path;
    }

    get href() {
        return this.toString();
    }
}

/**
 * The fetched resource cache.
 */
URL.RC = new Map();

/**
 * The Default Global URL object. 
 */
URL.G = null;

/**
 * The Global object Proxy.
 */
URL.R = {
    get protocol() {
        return URL.G.protocol;
    },
    set protocol(v) {
        return;
        URL.G.protocol = v;
    },
    get user() {
        return URL.G.user;
    },
    set user(v) {
        return;
        URL.G.user = v;
    },
    get pwd() {
        return URL.G.pwd;
    },
    set pwd(v) {
        return;
        URL.G.pwd = v;
    },
    get host() {
        return URL.G.host;
    },
    set host(v) {
        return;
        URL.G.host = v;
    },
    get port() {
        return URL.G.port;
    },
    set port(v) {
        return;
        URL.G.port = v;
    },
    get path() {
        return URL.G.path;
    },
    set path(v) {
        return;
        URL.G.path = v;
    },
    get query() {
        return URL.G.query;
    },
    set query(v) {
        return;
        URL.G.query = v;
    },
    get hash() {
        return URL.G.hash;
    },
    set hash(v) {
        return;
        URL.G.hash = v;
    },
    get map() {
        return URL.G.map;
    },
    set map(v) {
        return;
        URL.G.map = v;
    },
    setPath(path$$1) {
        return URL.G.setPath(path$$1);
    },
    setLocation() {
        return URL.G.setLocation();
    },
    toString() {
        return URL.G.toString();
    },
    getData(class_name = "") {
        return URL.G.getData(class_name = "");
    },
    setData(class_name = "", data = null) {
        return URL.G.setData(class_name, data);
    },
    fetchText(ALLOW_CACHE = true) {
        return URL.G.fetchText(ALLOW_CACHE);
    },
    cacheResource(resource) {
        return URL.G.cacheResource(resource);
    }
};
Object.freeze(URL.R);
Object.freeze(URL.RC);
Object.seal(URL);

class CSS_URL extends URL {
    static parse(l, rule, r) {
        if (l.tx == "url" || l.tx == "uri") {
            l.next().a("(");
            let v = "";
            if (l.ty == l.types.str) {
                v = l.tx.slice(1,-1);
                l.next().a(")");
            } else {
                let p = l.p;
                while (!p.END && p.next().tx !== ")") { /* NO OP */ }
                v = p.slice(l);
                l.sync().a(")");
            }
            return new CSS_URL(v);
        } if (l.ty == l.types.str){
            let v = l.tx.slice(1,-1);
            l.next();
            return new CSS_URL(v);
        }

        return null;
    }
}

class CSS_String extends String {
    static parse(l, rule, r) {
        if (l.ty == l.types.str) {
            let tx = l.tx;
            l.next();
            return new CSS_String(tx);
        }
        return null;
    }
}

class CSS_Id extends String {
    static parse(l, rule, r) {
        if (l.ty == l.types.id) {
            let tx = l.tx;
            l.next();
            return new CSS_Id(tx);
        }
        return null;
    }
}

/* https://www.w3.org/TR/css-shapes-1/#typedef-basic-shape */
class CSS_Shape extends Array {
    static parse(l, rule, r) {
        if (l.tx == "inset" || l.tx == "circle" || l.tx == "ellipse" || l.tx == "polygon") {
            l.next().a("(");
            let v = "";
            if (l.ty == l.types.str) {
                v = l.tx.slice(1,-1);
                l.next().a(")");
            } else {
                let p = l.p;
                while (!p.END && p.next().tx !== ")") { /* NO OP */ }
                v = p.slice(l);
                l.sync().a(")");
            }
            return new CSS_Shape(v);
        }
        return null;
    }
}

class CSS_Number extends Number {
    static parse(l, rule, r) {
        let tx = l.tx;
        if(l.ty == l.types.num){
            l.next();
            return new CSS_Number(tx);
        }
        return null;
    }
}

class Point2D extends Float64Array{
	
	constructor(x, y) {
		super(2);

		if (typeof(x) == "number") {
			this[0] = x;
			this[1] = y;
			return;
		}

		if (x instanceof Array) {
			this[0] = x[0];
			this[1] = x[1];
		}
	}

	draw(ctx, s = 1){
		ctx.beginPath();
		ctx.moveTo(this.x*s,this.y*s);
		ctx.arc(this.x*s, this.y*s, s*0.01, 0, 2*Math.PI);
		ctx.stroke();
	}

	get x (){ return this[0]}
	set x (v){if(typeof(v) !== "number") return; this[0] = v;}

	get y (){ return this[1]}
	set y (v){if(typeof(v) !== "number") return; this[1] = v;}
}

const sqrt = Math.sqrt;
const cos = Math.cos;
const acos = Math.acos;
const PI = Math.PI; 
const pow = Math.pow;

// A helper function to filter for values in the [0,1] interval:
function accept(t) {
  return 0<=t && t <=1;
}

// A real-cuberoots-only function:
function cuberoot(v) {
  if(v<0) return -pow(-v,1/3);
  return pow(v,1/3);
}

function point(t, p1, p2, p3, p4) {
	var ti = 1 - t;
	var ti2 = ti * ti;
	var t2 = t * t;
	return ti * ti2 * p1 + 3 * ti2 * t * p2 + t2 * 3 * ti * p3 + t2 * t * p4;
}


class CBezier extends Float64Array{
	constructor(x1, y1, x2, y2, x3, y3, x4, y4) {
		super(8);

		//Map P1 and P2 to {0,0,1,1} if only four arguments are provided; for use with animations
		if(arguments.length == 4){
			this[0] = 0;
			this[1] = 0;
			this[2] = x1;
			this[3] = y1;
			this[4] = x2;
			this[5] = y2;
			this[6] = 1;
			this[7] = 1;
			return;
		}
		
		if (typeof(x1) == "number") {
			this[0] = x1;
			this[1] = y1;
			this[2] = x2;
			this[3] = y2;
			this[4] = x3;
			this[5] = y3;
			this[6] = x4;
			this[7] = y4;
			return;
		}

		if (x1 instanceof Array) {
			this[0] = x1[0];
			this[1] = x1[1];
			this[2] = x1[2];
			this[3] = x1[3];
			this[4] = x1[4];
			this[5] = x1[5];
			this[6] = x1[6];
			this[7] = x1[4];
			return;
		}
	}

	get x1 (){ return this[0]}
	set x1 (v){this[0] = v;}
	get x2 (){ return this[2]}
	set x2 (v){this[2] = v;}
	get x3 (){ return this[4]}
	set x3 (v){this[4] = v;}
	get x4 (){ return this[6]}
	set x4 (v){this[6] = v;}
	get y1 (){ return this[1]}
	set y1 (v){this[1] = v;}
	get y2 (){ return this[3]}
	set y2 (v){this[3] = v;}
	get y3 (){ return this[5]}
	set y3 (v){this[5] = v;}
	get y4 (){ return this[7]}
	set y4 (v){this[7] = v;}

	add(x,y = 0){
		return new CCurve(
			this[0] + x,
			this[1] + y,
			this[2] + x,
			this[3] + y,
			this[4] + x,
			this[5] + y,
			this[6] + x,
			this[7] + y
		)
	}

	valY(t){
		return point(t, this[1], this[3], this[5], this[7]);
	}

	valX(t){
		return point(t, this[0], this[2], this[4], this[6]);
	}

	point(t) {
		return new Point2D(
			point(t, this[0], this[2], this[4], this[6]),
			point(t, this[1], this[3], this[5], this[7])
		)
	}
	
	/** 
		Acquired from : https://pomax.github.io/bezierinfo/
		Author:  Mike "Pomax" Kamermans
		GitHub: https://github.com/Pomax/
	*/

	roots(p1,p2,p3,p4) {
		var d = (-p1 + 3 * p2 - 3 * p3 + p4),
			a = (3 * p1 - 6 * p2 + 3 * p3) / d,
			b = (-3 * p1 + 3 * p2) / d,
			c = p1 / d;

		var p = (3 * b - a * a) / 3,
			p3 = p / 3,
			q = (2 * a * a * a - 9 * a * b + 27 * c) / 27,
			q2 = q / 2,
			discriminant = q2 * q2 + p3 * p3 * p3;

		// and some variables we're going to use later on:
		var u1, v1, root1, root2, root3;

		// three possible real roots:
		if (discriminant < 0) {
			var mp3 = -p / 3,
				mp33 = mp3 * mp3 * mp3,
				r = sqrt(mp33),
				t = -q / (2 * r),
				cosphi = t < -1 ? -1 : t > 1 ? 1 : t,
				phi = acos(cosphi),
				crtr = cuberoot(r),
				t1 = 2 * crtr;
			root1 = t1 * cos(phi / 3) - a / 3;
			root2 = t1 * cos((phi + 2 * PI) / 3) - a / 3;
			root3 = t1 * cos((phi + 4 * PI) / 3) - a / 3;
			return [root3, root1, root2]
		}

		// three real roots, but two of them are equal:
		if (discriminant === 0) {
			u1 = q2 < 0 ? cuberoot(-q2) : -cuberoot(q2);
			root1 = 2 * u1 - a / 3;
			root2 = -u1 - a / 3;
			return [root2, root1];
		}

		// one real root, two complex roots
		var sd = sqrt(discriminant);
		u1 = cuberoot(sd - q2);
		v1 = cuberoot(sd + q2);
		root1 = u1 - v1 - a / 3;
		return [root1];
	}

	rootsY() {
		return this.roots(this[1],this[3],this[5],this[7]);
	}

	rootsX() {
		return this.roots(this[0],this[2],this[4],this[6]);
	}
	
	getYatX(x){
		var x1 = this[0] - x, x2 = this[2] - x, x3 = this[4] - x, x4 = this[6] - x,
			x2_3 = x2 * 3, x1_3 = x1 *3, x3_3 = x3 * 3,
			d = (-x1 + x2_3 - x3_3 + x4), di = 1/d, i3 = 1/3,
			a = (x1_3 - 6 * x2 + x3_3) * di,
			b = (-x1_3 + x2_3) * di,
			c = x1 * di,
			p = (3 * b - a * a) * i3,
			p3 = p * i3,
			q = (2 * a * a * a - 9 * a * b + 27 * c) * (1/27),
			q2 = q * 0.5,
			discriminant = q2 * q2 + p3 * p3 * p3;

		// and some variables we're going to use later on:
		var u1, v1, root;

		//Three real roots can never happen if p1(0,0) and p4(1,1);

		// three real roots, but two of them are equal:
		if (discriminant < 0) {
			var mp3 = -p / 3,
				mp33 = mp3 * mp3 * mp3,
				r = sqrt(mp33),
				t = -q / (2 * r),
				cosphi = t < -1 ? -1 : t > 1 ? 1 : t,
				phi = acos(cosphi),
				crtr = cuberoot(r),
				t1 = 2 * crtr;
			root = t1 * cos((phi + 4 * PI) / 3) - a / 3;
		}else if (discriminant === 0) {
			u1 = q2 < 0 ? cuberoot(-q2) : -cuberoot(q2);
			root = -u1 - a * i3;
		}else{
			var sd = sqrt(discriminant);
			// one real root, two complex roots
			u1 = cuberoot(sd - q2);
			v1 = cuberoot(sd + q2);
			root = u1 - v1 - a * i3;	
		}

		return point(root, this[1], this[3], this[5], this[7]);
	}
	/**
		Given a Canvas 2D context object and scale value, strokes a cubic bezier curve.
	*/
	draw(ctx, s = 1){
		ctx.beginPath();
		ctx.moveTo(this[0]*s, this[1]*s);
		ctx.bezierCurveTo(
			this[2]*s, this[3]*s,
			this[4]*s, this[5]*s,
			this[6]*s, this[7]*s
			);
		ctx.stroke();
	}
}

function curvePoint(curve, t) {
    var point = {
        x: 0,
        y: 0
    };
    point.x = posOnCurve(t, curve[0], curve[2], curve[4]);
    point.y = posOnCurve(t, curve[1], curve[3], curve[5]);
    return point;
}

function posOnCurve(t, p1, p2, p3) {
    var ti = 1 - t;
    return ti * ti * p1 + 2 * ti * t * p2 + t * t * p3;
}

function splitCurve(bp, t) {
    var left = [];
    var right = [];

    function drawCurve(bp, t) {
        if (bp.length == 2) {
            left.push(bp[0], bp[1]);
            right.push(bp[0], bp[1]);
        } else {
            var new_bp = []; //bp.slice(0,-2);
            for (var i = 0; i < bp.length - 2; i += 2) {
                if (i == 0) {
                    left.push(bp[i], bp[i + 1]);
                }
                if (i == bp.length - 4) {
                    right.push(bp[i + 2], bp[i + 3]);
                }
                new_bp.push((1 - t) * bp[i] + t * bp[i + 2]);
                new_bp.push((1 - t) * bp[i + 1] + t * bp[i + 3]);
            }
            drawCurve(new_bp, t);
        }
    }

    drawCurve(bp, t);

    return {
        x: new QBezier(right),
        y: new QBezier(left)
    };
}

function curveIntersections(p1, p2, p3) {
    var intersections = {
        a: Infinity,
        b: Infinity
    };

    var a = p1 - 2 * p2 + p3;

    var b = 2 * (p2 - p1);

    var c = p1;

    if (b == 0) {} else if (Math.abs(a) < 0.00000000005) {
        intersections.a = (-c / b); //c / b;
    } else {

        intersections.a = ((-b - Math.sqrt((b * b) - 4 * a * c)) / (2 * a));
        intersections.b = ((-b + Math.sqrt((b * b) - 4 * a * c)) / (2 * a));
    }
    return intersections
}

class QBezier {
    constructor(x1, y1, x2, y2, x3, y3) {
        this.x1 = 0;
        this.x2 = 0;
        this.x3 = 0;
        this.y1 = 0;
        this.y2 = 0;
        this.y3 = 0;

        if (typeof(x1) == "number") {
            this.x1 = x1;
            this.x2 = x2;
            this.x3 = x3;
            this.y1 = y1;
            this.y2 = y2;
            this.y3 = y3;
            return;
        }

        if (x1 instanceof QBezier) {
            this.x1 = x1.x1;
            this.x2 = x1.x2;
            this.x3 = x1.x3;
            this.y1 = x1.y1;
            this.y2 = x1.y2;
            this.y3 = x1.y3;
            return;
        }

        if (x1 instanceof Array) {
            this.x1 = x1[0];
            this.y1 = x1[1];
            this.x2 = x1[2];
            this.y2 = x1[3];
            this.x3 = x1[4];
            this.y3 = x1[5];
            return;
        }
    }

    reverse() {
        return new QBezier(
            this.x3,
            this.y3,
            this.x2,
            this.y2,
            this.x1,
            this.y1
        )
    }

    point(t) {
        return new Point2D(
            posOnCurve(t, this.x1, this.x2, this.x3),
            posOnCurve(t, this.y1, this.y2, this.y3))

    }

    tangent(t) {
        var tan = {
            x: 0,
            y: 0
        };

        var px1 = this.x2 - this.x1;
        var py1 = this.y2 - this.y1;

        var px2 = this.x3 - this.x2;
        var py2 = this.y3 - this.y2;

        tan.x = (1 - t) * px1 + t * px2;
        tan.y = (1 - t) * py1 + t * py2;

        return tan;
    }

    toArray() {
        return [this.x1, this.y1, this.x2, this.y2, this.x3, this.y3];
    }

    split(t) {
        return splitCurve(this.toArray(), t);
    }

    rootsX() {
        return this.roots(
            this.x1,
            this.x2,
            this.x3
        )

    }

    roots(p1, p2, p3) {
        var curve = this.toArray();

        var c = p1 - (2 * p2) + p3;
        var b = 2 * (p2 - p1);
        var a = p1;
        var a2 = a * 2;
        var sqrt = Math.sqrt(b * b - (a * 4 * c));
        var t1 = (-b + sqrt) / a2;
        var t2 = (-b - sqrt) / a2;

        return [t1, t2];
    }

    rootsa() {
        var curve = this.toArray();

        var p1 = curve[1];
        var p2 = curve[3];
        var p3 = curve[5];
        var x1 = curve[0];
        var x2 = curve[2];
        var x3 = curve[4];

        var py1d = 2 * (p2 - p1);
        var py2d = 2 * (p3 - p2);
        var ad1 = -py1d + py2d;
        var bd1 = py1d;

        var px1d = 2 * (x2 - x1);
        var px2d = 2 * (x3 - x2);
        var ad2 = -px1d + px2d;
        var bd2 = px1d;

        var t1 = -bd1 / ad1;
        var t2 = -bd2 / ad2;

        return [t1, t2];
    }

    boundingBox() {
        var x1 = curve[0];
        var y1 = curve[1];
        var x2 = curve[2];
        var y2 = curve[3];
        var x3 = curve[4];
        var y3 = curve[5];
        var roots = getRootsClamped(curve);
        var min_x = Math.min(x1, x2, x3, roots.y[0] || Infinity, roots.x[0] || Infinity);
        var min_y = Math.min(y1, y2, y3, roots.y[1] || Infinity, roots.x[1] || Infinity);
        var max_x = Math.max(x1, x2, x3, roots.y[0] || -Infinity, roots.x[0] || -Infinity);
        var max_y = Math.max(y1, y2, y3, roots.y[1] || -Infinity, roots.x[1] || -Infinity);

        return {
            min: {
                x: min_x,
                y: min_y
            },
            max: {
                x: max_x,
                y: max_y
            }
        };
    }

    rotate(angle, offset) {
        angle = (angle / 180) * Math.PI;

        var new_curve = this.toArray();

        for (var i = 0; i < 6; i += 2) {
            var x = curve[i] - offset.x;
            var y = curve[i + 1] - offset.y;
            new_curve[i] = ((x * Math.cos(angle) - y * Math.sin(angle))) + offset.x;
            new_curve[i + 1] = ((x * Math.sin(angle) + y * Math.cos(angle))) + offset.y;
        }

        return new QBezier(new_curve);
    }

    intersects() {
        return {
            x: curveIntersections(this.x1, this.x2, this.x3),
            y: curveIntersections(this.y1, this.y2, this.y3)
        }
    }

    add(x, y) {
        if (typeof(x) == "number") {
            return new QBezier(
                this.x1 + x,
                this.y1 + y,
                this.x2 + x,
                this.y2 + y,
                this.x3 + x,
                this.y3 + y,
            )
        }
    }
}

class CSS_Bezier extends CBezier {
	static parse(l, rule, r) {

		let out = null;

		switch(l.tx){
			case "cubic":
				l.next().a("(");
				let v1 = parseFloat(l.tx);
				let v2 = parseFloat(l.next().a(",").tx);
				let v3 = parseFloat(l.next().a(",").tx);
				let v4 = parseFloat(l.next().a(",").tx);
				l.a(")");
				out = new CSS_Bezier(v1, v2, v3, v4);
				break;
			case "ease":
				l.next();
				out = new CSS_Bezier(0.25, 0.1, 0.25, 1);
				break;
			case "ease-in":
				l.next();
				out = new CSS_Bezier(0.42, 0, 1, 1);
				break;
			case "ease-out":
				l.next();
				out = new CSS_Bezier(0, 0, 0.58, 1);
				break;
			case "ease-in-out":
				l.next();
				out = new CSS_Bezier(0.42, 0, 0.58, 1);
				break;
		}

		return out;
	}
}

class Stop{
    constructor(color, percentage){
        this.color = color;
        this.percentage = percentage || null;
    }

    toString(){
        return `${this.color}${(this.percentage)?" "+this.percentage:""}`;
    }
}

class CSS_Gradient{

    static parse(l, rule, r) {
        let tx = l.tx,
            pky = l.pk.ty;
        if (l.ty == l.types.id) {
            switch(l.tx){
                case "linear-gradient":
                l.next().a("(");
                let dir,num,type ="deg";
                if(l.tx == "to"){

                }else if(l.ty == l.types.num){
                    num = parseFloat(l.ty);
                    type = l.next().tx;
                    l.next().a(',');
                }

                let stops = [];
                
                while(!l.END && l.ch != ")"){
                    let v = CSS_Color.parse(l, rule, r);
                    let len = null;

                    if(l.ch == ")") {
                        stops.push(new Stop(v, len));
                        break;
                    }
                    
                    if(l.ch != ","){
                        if(!(len = CSS_Length.parse(l, rule, r)))
                            len = CSS_Percentage.parse(l,rule,r);
                    }else
                        l.next();
                    

                    stops.push(new Stop(v, len));
                }
                l.a(")");
                let grad = new CSS_Gradient();
                grad.stops = stops;
                return grad;
            }
        }
        return null;
    }


    constructor(type = 0){
        this.type = type; //linear gradient
        this.direction = new CSS_Length(0, "deg");
        this.stops = [];
    }

    toString(){
        let str = [];
        switch(this.type){
            case 0:
            str.push("linear-gradient(");
            if(this.direction !== 0)
                str.push(this.direction.toString() + ",");
            break;
        }

        for(let i = 0; i < this.stops.length; i++)
            str.push(this.stops[i].toString()+((i<this.stops.length-1)?",":""));

        str.push(")");

        return str.join(" ");
    }
}

const $medh = (prefix) => ({
    parse: (l, r, a, n = 0) => (n = CSS_Length.parse(l, r, a), (prefix > 0) ? ((prefix > 1) ? (win) => win.innerHeight <= n : (win) => win.innerHeight >= n) : (win) => win.screen.height == n)
});


const $medw = (prefix) => ({
    parse: (l, r, a, n = 0) => 
        (n = CSS_Length.parse(l, r, a), (prefix > 0) ? ((prefix > 1) ? (win) => win.innerWidth >= n : (win) => win.innerWidth <= n) : (win) => win.screen.width == n)
});

function CSS_Media_handle(type, prefix) {
    switch (type) {
        case "h":
            return $medh(prefix);
        case "w":
            return $medw(prefix);
    }

    return {
        parse: function(a, b, c) {
            debugger;
        }
    };
}

function getValue(lex, attribute) {
    let v = lex.tx,
        mult = 1;

    if (v == "-")
        v = lex.n.tx, mult = -1;

    let n = parseFloat(v) * mult;

    lex.n;

    if (lex.ch !== ")" && lex.ch !== ",") {
        switch (lex.tx) {
            case "%":
                break;

            /* Rotational Values */
            case "grad":
                n *= Math.PI / 200;
                break;
            case "deg":
                n *= Math.PI / 180;
                break;
            case "turn":
                n *= Math.PI * 2;
                break;
            case "px":
                break;
            case "em":
                break;
        }
        lex.n;
    }
    return n;
}

function ParseString(string, transform) {
    var lex = whind$1(string);
    
    while (!lex.END) {
        let tx = lex.tx;
        lex.n;
        switch (tx) {
            case "matrix":

                let a = getValue(lex.a("(")),
                    b = getValue(lex.a(",")),
                    c = getValue(lex.a(",")),
                    d = getValue(lex.a(",")),
                    r = -Math.atan2(b, a),
                    sx1 = (a / Math.cos(r)) || 0,
                    sx2 = (b / -Math.sin(r)) || 0,
                    sy1 = (c / Math.sin(r)) || 0,
                    sy2 = (d / Math.cos(r)) || 0;
                
                if(sx2 !== 0)
                    transform.sx = (sx1 + sx2) * 0.5;
                else
                    transform.sx = sx1;

                if(sy1 !== 0)
                    transform.sy = (sy1 + sy2) * 0.5;
                else
                    transform.sy = sy2;

                transform.px = getValue(lex.a(","));
                transform.py = getValue(lex.a(","));
                transform.r = r;
                lex.a(")");
                break;
            case "matrix3d":
                break;
            case "translate":
                transform.px = getValue(lex.a("("), "left");
                lex.a(",");
                transform.py = getValue(lex, "left");
                lex.a(")");
                continue;
            case "translateX":
                transform.px = getValue(lex.a("("), "left");
                lex.a(")");
                continue;
            case "translateY":
                transform.py = getValue(lex.a("("), "left");
                lex.a(")");
                continue;
            case "scale":
                transform.sx = getValue(lex.a("("), "left");
                if(lex.ch ==","){
                    lex.a(",");
                    transform.sy = getValue(lex, "left");
                }
                else transform.sy = transform.sx;
                lex.a(")");
                continue;
            case "scaleX":
                transform.sx = getValue(lex.a("("), "left");
                lex.a(")");
                continue;
            case "scaleY":
                transform.sy = getValue(lex.a("("), "left");
                lex.a(")");
                continue;
            case "scaleZ":
                break;
            case "rotate":
                transform.r = getValue(lex.a("("));
                lex.a(")");
                continue;
            case "rotateX":
                break;
            case "rotateY":
                break;
            case "rotateZ":
                break;
            case "rotate3d":
                break;
            case "perspective":
                break;
        }
        lex.n;
    }
}
// A 2D transform composition of 2D position, 2D scale, and 1D rotation.

class CSS_Transform2D extends Float64Array {
    static ToString(pos = [0, 0], scl = [1, 1], rot = 0) {
        var px = 0,
            py = 0,
            sx = 1,
            sy = 1,
            r = 0, cos = 1, sin = 0;
        if (pos.length == 5) {
            px = pos[0];
            py = pos[1];
            sx = pos[2];
            sy = pos[3];
            r = pos[4];
        } else {
            px = pos[0];
            py = pos[1];
            sx = scl[0];
            sy = scl[1];
            r = rot;
        }
        
        if(r !== 0){
            cos = Math.cos(r);
            sin = Math.sin(r);
        }

        return `matrix(${cos * sx}, ${-sin * sx}, ${sy * sin}, ${sy * cos}, ${px}, ${py})`;
    }


    constructor(px, py, sx, sy, r) {
        super(5);
        this.sx = 1;
        this.sy = 1;
        if (px) {
            if (px instanceof CSS_Transform2D) {
                this[0] = px[0];
                this[1] = px[1];
                this[2] = px[2];
                this[3] = px[3];
                this[4] = px[4];
            } else if (typeof(px) == "string") ParseString(px, this);
            else {
                this[0] = px;
                this[1] = py;
                this[2] = sx;
                this[3] = sy;
                this[4] = r;
            }
        }
    }
    get px() {
        return this[0];
    }
    set px(v) {
        this[0] = v;
    }
    get py() {
        return this[1];
    }
    set py(v) {
        this[1] = v;
    }
    get sx() {
        return this[2];
    }
    set sx(v) {
        this[2] = v;
    }
    get sy() {
        return this[3];
    }
    set sy(v) {
        this[3] = v;
    }
    get r() {
        return this[4];
    }
    set r(v) {
        this[4] = v;
    }

    set scale(s){
        this.sx = s;
        this.sy = s;
    }

    get scale(){
        return this.sx;
    }
    
    lerp(to, t) {
        let out = new CSS_Transform2D();
        for (let i = 0; i < 5; i++) out[i] = this[i] + (to[i] - this[i]) * t;
        return out;
    }
    toString() {
        return CSS_Transform2D.ToString(this);
    }

    copy(v) {
        let copy = new CSS_Transform2D(this);


        if (typeof(v) == "string")
            ParseString(v, copy);

        return copy;
    }

    /**
     * Sets the transform value of a canvas 2D context;
     */
    setCTX(ctx){       
        let cos = 1, sin = 0;
        if(this[4] != 0){
            cos = Math.cos(this[4]);
            sin = Math.sin(this[4]);
        }
        ctx.transform(cos * this[2], -sin * this[2], this[3] * sin, this[3] * cos, this[0], this[1]);
    }

    getLocalX(X){
        return (X - this.px) / this.sx;
    }

    getLocalY(Y){
        return (Y - this.py) / this.sy;
    }
}

/**
 * @brief Path Info
 * @details Path syntax information for reference
 * 
 * MoveTo: M, m
 * LineTo: L, l, H, h, V, v
 * Cubic Bézier Curve: C, c, S, s
 * Quadratic Bézier Curve: Q, q, T, t
 * Elliptical Arc Curve: A, a
 * ClosePath: Z, z
 * 
 * Capital symbols represent absolute positioning, lowercase is relative
 */
const PathSym = {
    M: 0,
    m: 1,
    L: 2,
    l: 3,
    h: 4,
    H: 5,
    V: 6,
    v: 7,
    C: 8,
    c: 9,
    S: 10,
    s: 11,
    Q: 12,
    q: 13,
    T: 14,
    t: 15,
    A: 16,
    a: 17,
    Z: 18,
    z: 19,
    pairs: 20
};

function getSignedNumber(lex) {
    let mult = 1,
        tx = lex.tx;
    if (tx == "-") {
        mult = -1;
        tx = lex.n.tx;
    }
    lex.n;
    return parseFloat(tx) * mult;
}

function getNumberPair(lex, array) {
    let x = getSignedNumber(lex);
    if (lex.ch == ',') lex.n;
    let y = getSignedNumber(lex);
    array.push(x, y);
}

function parseNumberPairs(lex, array) {
    while ((lex.ty == lex.types.num || lex.ch == "-") && !lex.END) {    	
    	array.push(PathSym.pairs);
        getNumberPair(lex, array);
    }
}
/**
 * @brief An array store of path data in numerical form
 */
class CSS_Path extends Array {
    static FromString(string, array) {
        let lex = whind(string);
        while (!lex.END) {
            let relative = false,
                x = 0,
                y = 0;
            switch (lex.ch) {
                //Move to
                case "m":
                    relative = true;
                case "M":
                    lex.n; //
                    array.push((relative) ? PathSym.m : PathSym.M);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                    //Line to
                case "h":
                    relative = true;
                case "H":
                    lex.n;
                    x = getSignedNumber(lex);
                    array.push((relative) ? PathSym.h : PathSym.H, x);
                    continue;
                case "v":
                    relative = true;
                case "V":
                    lex.n;
                    y = getSignedNumber(lex);
                    array.push((relative) ? PathSym.v : PathSym.V, y);
                    continue;
                case "l":
                    relative = true;
                case "L":
                    lex.n;
                    array.push((relative) ? PathSym.l : PathSym.L);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                    //Cubic Curve
                case "c":
                    relative = true;
                case "C":
                    array.push((relative) ? PathSym.c : PathSym.C);
                    getNumberPair(lex, array);
                    getNumberPair(lex, array);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                case "s":
                    relative = true;
                case "S":
                    array.push((relative) ? PathSym.s : PathSym.S);
                    getNumberPair(lex, array);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                    //Quadratic Curve0
                case "q":
                    relative = true;
                case "Q":
                    array.push((relative) ? PathSym.q : PathSym.Q);
                    getNumberPair(lex, array);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                case "t":
                    relative = true;
                case "T":
                    array.push((relative) ? PathSym.t : PathSym.T);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                    //Elliptical Arc
                    //Close path:
                case "z":
                    relative = true;
                case "Z":
                    array.push((relative) ? PathSym.z : PathSym.Z);
            }
            lex.n;
        }
    }

    static ToString(array) {
    	let string = [], l = array.length, i = 0;
    	while(i < l){
    		switch(array[i++]){
    			case PathSym.M:
    				string.push("M", array[i++], array[i++]);
    				break;
			    case PathSym.m:
			    	string.push("m", array[i++], array[i++]);
			    	break;
			    case PathSym.L:
			    	string.push("L", array[i++], array[i++]);
			    	break;
			    case PathSym.l:
			    	string.push("l", array[i++], array[i++]);
			    	break;
			    case PathSym.h:
			    	string.push("h", array[i++]);
			    	break;
			    case PathSym.H:
			    	string.push("H", array[i++]);
			    	break;
			    case PathSym.V:
			    	string.push("V", array[i++]);
			    	break;
			    case PathSym.v:
			    	string.push("v", array[i++]);
			    	break;
			    case PathSym.C:
			    	string.push("C", array[i++], array[i++], array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym.c:
			    	string.push("c", array[i++], array[i++], array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym.S:
			    	string.push("S", array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym.s:
			    	string.push("s", array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym.Q:
			    	string.push("Q", array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym.q:
			    	string.push("q", array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym.T:
			    	string.push("T", array[i++], array[i++]);
			    	break;
			    case PathSym.t:
			    	string.push("t", array[i++], array[i++]);
			    	break;
			    case PathSym.Z:
			    	string.push("Z");
			    	break;
			    case PathSym.z:
			    	string.push("z");
			    	break;
			    case PathSym.pairs:
			    	string.push(array[i++], array[i++]);
			    	break;
			 	case PathSym.A:
			    case PathSym.a:
			    default:
			    	i++;
    		}
    	}

    	return string.join(" ");
    }

    
    constructor(data) {
        super();	

    	if(typeof(data) == "string"){
    		Path.FromString(data, this);
    	}else if(Array.isArray(data)){
    		for(let i = 0; i < data.length;i++){
    			this.push(parseFloat(data[i]));
    		}
    	}
    }

    toString(){
    	return Path.ToString(this);
    }

    lerp(to, t, array = new Path){
    	let l = Math.min(this.length, to.length);

    	for(let i = 0; i < l; i++)
    		array[i] = this[i] + (to[i] - this[i]) * t;

    	return array;
    }	
}

/**
 * CSS Type constructors
 * @alias module:wick~internals.css.types.
 * @enum {object}
 */
const types$1 = {
    color: CSS_Color,
    length: CSS_Length,
    time: CSS_Length,
    flex: CSS_Length,
    angle: CSS_Length,
    frequency: CSS_Length,
    resolution: CSS_Length,
    percentage: CSS_Percentage,
    url: CSS_URL,
    uri: CSS_URL,
    number: CSS_Number,
    id: CSS_Id,
    string: CSS_String,
    shape: CSS_Shape,
    cubic_bezier: CSS_Bezier,
    integer: CSS_Number,
    gradient: CSS_Gradient,
    transform2D : CSS_Transform2D,
    path: CSS_Path,

    /* Media parsers */
    m_width: CSS_Media_handle("w", 0),
    m_min_width: CSS_Media_handle("w", 1),
    m_max_width: CSS_Media_handle("w", 2),
    m_height: CSS_Media_handle("h", 0),
    m_min_height: CSS_Media_handle("h", 1),
    m_max_height: CSS_Media_handle("h", 2),
    m_device_width: CSS_Media_handle("dw", 0),
    m_min_device_width: CSS_Media_handle("dw", 1),
    m_max_device_width: CSS_Media_handle("dw", 2),
    m_device_height: CSS_Media_handle("dh", 0),
    m_min_device_height: CSS_Media_handle("dh", 1),
    m_max_device_height: CSS_Media_handle("dh", 2)
};

/**
 * CSS Property Definitions https://www.w3.org/TR/css3-values/#value-defs
 * @alias module:wick~internals.css.property_definitions.
 * @enum {string}
 */
const property_definitions = {
    //https://www.w3.org/TR/2018/REC-css-color-3-20180619//
    
    color: `<color>`,

    opacity: `<alphavalue>|inherit`,


    /*https://www.w3.org/TR/css-backgrounds-3/*/
    /* Background */
    background_color: `<color>`,
    background_image: `<bg_image>#`,
    background_repeat: `<repeat_style>#`,
    background_attachment: `scroll|fixed|local`,
    background_position: `[<percentage>|<length>]{1,2}|[top|center|bottom]||[left|center|right]`,
    background_clip: `<box>#`,
    background_origin: `<box>#`,
    background_size: `<bg_size>#`,
    background: `<bg_layer>#,<final_bg_layer>`,

    /* Font https://www.w3.org/TR/css-fonts-4*/
    font_family: `[[<family_name>|<generic_family>],]*[<family_name>|<generic_family>]`,
    family_name: `<id>||<string>`,
    generic_name: `serif|sans_serif|cursive|fantasy|monospace`,
    font: `[<font_style>||<font_variant>||<font_weight>]?<font_size>[/<line_height>]?<font_family>`,
    font_variant: `normal|small_caps`,
    font_style: `normal | italic | oblique <angle>?`,
    font_kerning: ` auto | normal | none`,
    font_variant_ligatures:`normal|none|[<common-lig-values>||<discretionary-lig-values>||<historical-lig-values>||<contextual-alt-values> ]`,
    font_variant_position:`normal|sub|super`,
    font_variant_caps:`normal|small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps`,


    /*CSS Clipping https://www.w3.org/TR/css-masking-1/#clipping `normal|italic|oblique`, */
    font_size: `<absolute_size>|<relative_size>|<length>|<percentage>`,
    absolute_size: `xx_small|x_small|small|medium|large|x_large|xx_large`,
    relative_size: `larger|smaller`,
    font_wight: `normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900`,

    /* Text */
    word_spacing: `normal|<length>`,
    letter_spacing: `normal|<length>`,
    text_decoration: `none|[underline||overline||line-through||blink]`,
    text_transform: `capitalize|uppercase|lowercase|none`,
    text_align: `left|right|center|justify`,
    text_indent: `<length>|<percentage>`,


    /* Border  https://www.w3.org/TR/css-backgrounds-3 */
    border_color: `<color>{1,4}`,
    border_top_color: `<color>`,
    border_right_color: `<color>`,
    border_bottom_color: `<color>`,
    border_left_color: `<color>`,

    border_width: `<line_width>{1,4}`,
    border_top_width: `<line_width>`,
    border_right_width: `<line_width>`,
    border_bottom_width: `<line_width>`,
    border_left_width: `<line_width>`,

    border_style: `<line_style>{1,4}`,
    border_top_style: `<line_style>`,
    border_right_style: `<line_style>`,
    border_bottom_style: `<line_style>`,
    border_left_style: `<line_style>`,

    border_top: `<line_width>||<line_style>||<color>`,
    border_right: `<line_width>||<line_style>||<color>`,
    border_bottom: `<line_width>||<line_style>||<color>`,
    border_left: `<line_width>||<line_style>||<color>`,

    border_radius: `<length_percentage>{1,4}[/<length_percentage>{1,4}]?`,
    border_top_left_radius: `<length_percentage>{1,2}`,
    border_top_right_radius: `<length_percentage>{1,2}`,
    border_bottom_right_radius: `<length_percentage>{1,2}`,
    border_bottom_left_radius: `<length_percentage>{1,2}`,

    border_image: `<border_image_source>||<border_image_slice>[/<border_image_width>|/<border_image_width>?/<border_image_outset>]?||<border_image_repeat>`,
    border_image_source: `none|<image>`,
    border_image_slice: `[<number>|<percentage>]{1,4}&&fill?`,
    border_image_width: `[<length_percentage>|<number>|auto]{1,4}`,
    border_image_outset: `[<length>|<number>]{1,4}`,
    border_image_repeat: `[stretch|repeat|round|space]{1,2}`,

    box_shadow: `none|<shadow>#`,

    border: `<line_width>||<line_style>||<color>`,

    width: `<length>|<percentage>|auto|inherit`,
    height: `<length>|<percentage>|auto|inherit`,
    float: `left|right|none`,
    clear: `left|right|both`,

    /* Classification */

    display: `[ <display_outside> || <display_inside> ] | <display_listitem> | <display_internal> | <display_box> | <display_legacy>`,
    white_space: `normal|pre|nowrap`,
    list_style_type: `disc|circle|square|decimal|decimal-leading-zero|lower-roman|upper-roman|lower-greek|lower-latin|upper-latin|armenian|georgian|lower-alpha|upper-alpha|none|inherit`,
    list_style_image: `<url>|none`,
    list_style_position: `inside|outside`,
    list_style: `[disc|circle|square|decimal|lower-roman|upper-roman|lower-alpha|upper-alpha|none]||[inside|outside]||[<url>|none]`,
    vertical_align: `baseline|sub|super|top|text-top|middle|bottom|text-bottom|<percentage>|<length>|inherit`,

    /* Layout https://www.w3.org/TR/css-position-3 */ 
    position: "static|relative|absolute|sticky|fixed",
    top: `<length>|<percentage>|auto|inherit`,
    left: `<length>|<percentage>|auto|inherit`,
    bottom: `<length>|<percentage>|auto|inherit`,
    right: `<length>|<percentage>|auto|inherit`,

    
    /* Box Model https://www.w3.org/TR/css-box-3 */
    margin: `[<length>|<percentage>|0|auto]{1,4}`,
    margin_top: `<length>|<percentage>|0|auto`,
    margin_right: `<length>|<percentage>|0|auto`,
    margin_bottom: `<length>|<percentage>|0|auto`,
    margin_left: `<length>|<percentage>|0|auto`,

    padding: `[<length>|<percentage>|0|auto]{1,4}`,
    padding_top: `<length>|<percentage>|0|auto`,
    padding_right: `<length>|<percentage>|0|auto`,
    padding_bottom: `<length>|<percentage>|0|auto`,
    padding_left: `<length>|<percentage>|0|auto`,

    min_width: `<length>|<percentage>|inherit`,
    max_width: `<length>|<percentage>|none|inherit`,
    min_height: `<length>|<percentage>|inherit`,
    max_height: `<length>|<percentage>|none|inherit`,
    line_height: `normal|<number>|<length>|<percentage>|inherit`,
    overflow: 'visible|hidden|scroll|auto|inherit',


    box_sizing: `content-box | border-box`,

    /* Visual Effects */
    clip: '<shape>|auto|inherit',
    visibility: `visible|hidden|collapse|inherit`,
    content: `normal|none|[<string>|<uri>|<counter>|attr(<identifier>)|open-quote|close-quote|no-open-quote|no-close-quote]+|inherit`,
    quotas: `[<string><string>]+|none|inherit`,
    counter_reset: `[<identifier><integer>?]+|none|inherit`,
    counter_increment: `[<identifier><integer>?]+|none|inherit`,

    /* CSS3 Animation https://drafts.csswg.org/css-animations-1/ */
    animation: `<single_animation>#`,

    animation_name: `[none|<keyframes_name>]#`,
    animation_duration: `<time>#`,
    animation_timing_function: `<timing_function>#`,
    animation_iteration_count: `<single_animation_iteration_count>#`,
    animation_direction: `<single_animation_direction>#`,
    animation_play_state: `<single_animation_play_state>#`,
    animation_delayed: `<time>#`,
    animation_fill_mode: `<single_animation_fill_mode>#`,

    /* https://drafts.csswg.org/css-transitions-1/ */

    transition: `<single_transition>#`,
    transition_property: `none|<single_transition_property>#`,
    transition_duration: `<time>#`,
    transition_timing_function: `<timing_function>#`,
    transition_delay: `<time>#`,
};

/* Properties that are not directly accessible by CSS prop creator */

const virtual_property_definitions = {

    alphavalue: '<number>',

    box: `border-box|padding-box|content-box`,

    /*https://www.w3.org/TR/css-backgrounds-3/*/

    bg_layer: `<bg_image>||<bg_position>[/<bg_size>]?||<repeat_style>||<attachment>||<box>||<box>`,
    final_bg_layer: `<background_color>||<bg_image>||<bg_position>[/<bg_size>]?||<repeat_style>||<attachment>||<box>||<box>`,
    bg_image: `<url>|<gradient>|none`,
    repeat_style: `repeat-x|repeat-y|[repeat|space|round|no-repeat]{1,2}`,
    background_attachment: `<attachment>#`,
    bg_size: `<length_percentage>|auto]{1,2}|cover|contain`,
    bg_position: `[[left|center|right|top|bottom|<length_percentage>]|[left|center|right|<length_percentage>][top|center|bottom|<length_percentage>]|[center|[left|right]<length_percentage>?]&&[center|[top|bottom]<length_percentage>?]]`,
    attachment: `scroll|fixed|local`,
    line_style: `none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset`,
    line_width: `thin|medium|thick|<length>`,

    shadow: `inset?&&<length>{2,4}&&<color>?`,

    /* Identifier https://drafts.csswg.org/css-values-4/ */

    identifier: `<id>`,
    custom_ident: `<id>`,

    /* https://drafts.csswg.org/css-timing-1/#typedef-timing-function */

    timing_function: `linear|<cubic_bezier_timing_function>|<step_timing_function>|<frames_timing_function>`,
    cubic_bezier_timing_function: `<cubic_bezier>`,
    step_timing_function: `step-start|step-end|'steps()'`,
    frames_timing_function: `'frames()'`,

    /* https://drafts.csswg.org/css-transitions-1/ */

    single_animation_fill_mode: `none|forwards|backwards|both`,
    single_animation_play_state: `running|paused`,
    single_animation_direction: `normal|reverse|alternate|alternate-reverse`,
    single_animation_iteration_count: `infinite|<number>`,
    single_transition_property: `all|<custom_ident>`,
    single_transition: `[none|<single_transition_property>]||<time>||<timing_function>||<time>`,

    /* CSS3 Animation https://drafts.csswg.org/css-animations-1/ */

    single_animation: `<time>||<timing_function>||<time>||<single_animation_iteration_count>||<single_animation_direction>||<single_animation_fill_mode>||<single_animation_play_state>||[none|<keyframes_name>]`,
    keyframes_name: `<string>`,

    /* CSS3 Stuff */
    length_percentage: `<length>|<percentage>`,
    frequency_percentage: `<frequency>|<percentage>`,
    angle_percentage: `<angle>|<percentage>`,
    time_percentage: `<time>|<percentage>`,
    number_percentage: `<number>|<percentage>`,

    /*CSS Clipping https://www.w3.org/TR/css-masking-1/#clipping */
    clip_path: `<clip_source>|[<basic_shape>||<geometry_box>]|none`,
    clip_source: `<url>`,
    shape_box: `<box>|margin-box`,
    geometry_box: `<shape_box>|fill-box|stroke-box|view-box`,
    basic_shape: `<CSS_Shape>`,
    ratio: `<integer>/<integer>`,

    /* https://www.w3.org/TR/css-fonts-3/*/
    common_lig_values        : `[ common-ligatures | no-common-ligatures ]`,
    discretionary_lig_values : `[ discretionary-ligatures | no-discretionary-ligatures ]`,
    historical_lig_values    : `[ historical-ligatures | no-historical-ligatures ]`,
    contextual_alt_values    : `[ contextual | no-contextual ]`,

    //Display
    display_outside  : `block | inline | run-in`,
    display_inside   : `flow | flow-root | table | flex | grid | ruby`,
    display_listitem : `<display-outside>? && [ flow | flow-root ]? && list-item`,
    display_internal : `table-row-group | table-header-group | table-footer-group | table-row | table-cell | table-column-group | table-column | table-caption | ruby-base | ruby-text | ruby-base-container | ruby-text-container`,
    display_box      : `contents | none`,
    display_legacy   : `inline-block | inline-table | inline-flex | inline-grid`,
};

const media_feature_definitions = {
    width: "<m_width>",
    min_width: "<m_max_width>",
    max_width: "<m_min_width>",
    height: "<m_height>",
    min_height: "<m_min_height>",
    max_height: "<m_max_height>",
    orientation: "portrait  | landscape",
    aspect_ratio: "<ratio>",
    min_aspect_ratio: "<ratio>",
    max_aspect_ratio: "<ratio>",
    resolution: "<length>",
    min_resolution: "<length>",
    max_resolution: "<length>",
    scan: "progressive|interlace",
    grid: "",
    monochrome: "",
    min_monochrome: "<integer>",
    max_monochrome: "<integer>",
    color: "",
    min_color: "<integer>",
    max_color: "<integer>",
    color_index: "",
    min_color_index: "<integer>",
    max_color_index: "<integer>",

};

/**
 * Used to _bind_ a rule to a CSS selector.
 * @param      {string}  selector        The raw selector string value
 * @param      {array}  selector_array  An array of selector group identifiers.
 * @memberof module:wick~internals.css
 * @alias CSSSelector
 */
class CSSSelector {

    constructor(selectors /* string */ , selectors_arrays /* array */ ) {

        /**
         * The raw selector string value
         * @package
         */

        this.v = selectors;

        /**
         * Array of separated selector strings in reverse order.
         * @package
         */

        this.a = selectors_arrays;

        /**
         * The CSSRule.
         * @package
         */
        this.r = null;
    }

    get id() {
        return this.v.join("");
    }
    /**
     * Returns a string representation of the object.
     * @return     {string}  String representation of the object.
     */
    toString(off = 0) {
        let offset = ("    ").repeat(off);

        let str = `${offset}${this.v.join(", ")} {\n`;

        if (this.r)
            str += this.r.toString(off + 1);

        return str + `${offset}}\n`;
    }

    addProp(string) {
        let root = this.r.root;
        if (root) {
            let lex = whind$1(string);
            while (!lex.END)
                root.parseProperty(lex, this.r, property_definitions);
        }
    }

}

/**
 * Holds a set of rendered CSS properties.
 * @memberof module:wick~internals.css
 * @alias CSSRule
 */
class CSSRule {
    constructor(root) {
        /**
         * Collection of properties held by this rule.
         * @public
         */
        this.props = {};
        this.LOADED = false;
        this.root = root;
    }

    addProperty(prop, rule) {
        if (prop)
            this.props[prop.name] = prop.value;
    }

    toString(off = 0) {
        let str = [],
            offset = ("    ").repeat(off);

        for (let a in this.props) {
            if (this.props[a] !== null) {
                if (Array.isArray(this.props[a]))
                    str.push(offset, a.replace(/\_/g, "-"), ":", this.props[a].join(" "), ";\n");
                else
                    str.push(offset, a.replace(/\_/g, "-"), ":", this.props[a].toString(), ";\n");
            }
        }

        return str.join(""); //JSON.stringify(this.props).replace(/\"/g, "").replace(/\_/g, "-");
    }

    merge(rule) {
        if (rule.props) {
            for (let n in rule.props)
                this.props[n] = rule.props[n];
            this.LOADED = true;
        }
    }

    get _wick_type_() { return 0; }

    set _wick_type_(v) {}
}

/**
 * wick internals.
 * @class      NR (name)
 */
class NR { //Notation Rule

    constructor() {

        this.r = [NaN, NaN];
        this._terms_ = [];
        this._prop_ = null;
        this._virtual_ = false;
    }

    sp(value, rule) { //Set Property
        if (this._prop_){
            if (value)
                if (Array.isArray(value) && value.length === 1 && Array.isArray(value[0]))
                    rule[this._prop_] = value[0];
                else
                    rule[this._prop_] = value;
        }
    }

    isRepeating() {
        return !(isNaN(this.r[0]) && isNaN(this.r[1]));
    }

    parse(lx, rule, out_val) {
        if (typeof(lx) == "string")
            lx = whind$1(lx);

        let r = out_val || { v: null },
            start = isNaN(this.r[0]) ? 1 : this.r[0],
            end = isNaN(this.r[1]) ? 1 : this.r[1];

        return this.___(lx, rule, out_val, r, start, end);
    }

    ___(lx, rule, out_val, r, start, end) {
        let bool = true;
        for (let j = 0; j < end && !lx.END; j++) {

            for (let i = 0, l = this._terms_.length; i < l; i++) {
                bool = this._terms_[i].parse(lx, rule, r);
                if (!bool) break;
            }

            if (!bool) {

                this.sp(r.v, rule);

                if (j < start)
                    return false;
                else
                    return true;
            }
        }

        this.sp(r.v, rule);

        return true;
    }
}

class AND extends NR {
    ___(lx, rule, out_val, r, start, end) {

        outer:
            for (let j = 0; j < end && !lx.END; j++) {
                for (let i = 0, l = this._terms_.length; i < l; i++)
                    if (!this._terms_[i].parse(lx, rule, r)) return false;
            }

        this.sp(r.v, rule);

        return true;
    }
}

class OR extends NR {
    ___(lx, rule, out_val, r, start, end) {
        let bool = false;

        for (let j = 0; j < end && !lx.END; j++) {
            bool = false;

            for (let i = 0, l = this._terms_.length; i < l; i++)
                if (this._terms_[i].parse(lx, rule, r)) bool = true;

            if (!bool && j < start) {
                this.sp(r.v, rule);
                return false;
            }
        }

        this.sp(r.v, rule);

        return true;
    }
}

class ONE_OF extends NR {
    ___(lx, rule, out_val, r, start, end) {
        let bool = false;

        for (let j = 0; j < end && !lx.END; j++) {
            bool = false;

            for (let i = 0, l = this._terms_.length; i < l; i++) {
                bool = this._terms_[i].parse(lx, rule, r);
                if (bool) break;
            }

            if (!bool)
                if (j < start) {
                    this.sp(r.v, rule);
                    return false;
                }
        }

        this.sp(r.v, rule);

        return bool;
    }
}

class ValueTerm {

    constructor(value, getPropertyParser, definitions) {

        this._value_ = null;

        const IS_VIRTUAL = { is: false };

        if (!(this._value_ = types$1[value]))
            this._value_ = getPropertyParser(value, IS_VIRTUAL, definitions);

        this._prop_ = "";

        if (!this._value_)
            return new LiteralTerm(value);

        if (this._value_ instanceof NR && IS_VIRTUAL.is)
            this._virtual_ = true;
    }

    parse(l, rule, r) {
        if (typeof(l) == "string")
            l = whind$1(l);

        let rn = { v: null };

        let v = this._value_.parse(l, rule, rn);

        if (rn.v) {
            if (r)
                if (r.v) {
                    if (Array.isArray(r.v)) {
                        if (Array.isArray(rn.v) && !this._virtual_)
                            r.v = r.v.concat(rn.v);
                        else
                            r.v.push(rn.v);
                    } else {
                        if (Array.isArray(rn.v) && !this._virtual_)
                            r.v = ([r.v]).concat(rn.v);
                        else
                            r.v = [r.v, rn.v];
                    }
                } else
                    r.v = (this._virtual_) ? [rn.v] : rn.v;

            if (this._prop_)
                rule[this._prop_] = rn.v;

            return true;

        } else if (v) {
            if (r)
                if (r.v) {
                    if (Array.isArray(r.v))
                        r.v.push(v);
                    else
                        r.v = [r.v, v];
                } else
                    r.v = v;

            if (this._prop_)
                rule[this._prop_] = v;

            return true;
        } else
            return false;
    }
}

class LiteralTerm {

    constructor(value) {
        this._value_ = value;
        this._prop_ = null;
    }

    parse(l, rule, r) {

        if (typeof(l) == "string")
            l = whind$1(l);

        let v = l.tx;
        if (v == this._value_) {
            l.next();

            if (r)
                if (r.v) {
                    if (Array.isArray(r.v))
                        r.v.push(v);
                    else {
                        let t = r.v;
                        r.v = [t, v];
                    }
                } else
                    r.v = v;

            if (this._prop_)
                rule[this._prop_] = v;

            return true;
        }
        return false;
    }
}

class SymbolTerm extends LiteralTerm {
    parse(l, rule, r) {
        if (typeof(l) == "string")
            l = whind$1(l);

        if (l.tx == this._value_) {
            l.next();
            return true;
        }

        return false;
    }
}

function getPropertyParser(property_name, IS_VIRTUAL = { is: false }, definitions = null) {

    let prop = definitions[property_name];

    if (prop) {

        if (typeof(prop) == "string")
            prop = definitions[property_name] = CreatePropertyParser(prop, property_name, definitions);

        return prop;
    }

    prop = virtual_property_definitions[property_name];

    if (prop) {

        IS_VIRTUAL.is = true;

        if (typeof(prop) == "string")
            prop = virtual_property_definitions[property_name] = CreatePropertyParser(prop, "", definitions);

        return prop;
    }

    return null;
}


function CreatePropertyParser(notation, name, definitions) {

    const l = whind$1(notation);

    const important = { is: false };

    let n = d$1(l, definitions);

    if (n instanceof NR && n._terms_.length == 1)
        n = n._terms_[0];

    n._prop_ = name;
    n.IMP = important.is;

    return n;
}

function d$1(l, definitions, super_term = false, group = false, need_group = false, and_group = false, important = null) {
    let term, nt;

    while (!l.END) {
        switch (l.ch) {
            case "]":
                if (term) return term;
                else 
                    throw new Error("Expected to have term before \"]\"");
            case "[":
                if (term) return term;
                term = d$1(l.next(), definitions);
                l.a("]");
                break;
            case "&":
                if (l.pk.ch == "&") {
                    if (and_group)
                        return term;

                    nt = new AND();

                    nt._terms_.push(term);

                    l.sync().next();

                    while (!l.END) {
                        nt._terms_.push(d$1(l, definitions, super_term, group, need_group, true, important));
                        if (l.ch !== "&" || l.pk.ch !== "&") break;
                        l.a("&").a("&");
                    }

                    return nt;
                }
            case "|":
                {
                    if (l.pk.ch == "|") {

                        if (need_group)
                            return term;

                        nt = new OR();

                        nt._terms_.push(term);

                        l.sync().next();

                        while (!l.END) {
                            nt._terms_.push(d$1(l, definitions, super_term, group, true, and_group, important));
                            if (l.ch !== "|" || l.pk.ch !== "|") break;
                            l.a("|").a("|");
                        }

                        return nt;

                    } else {
                        if (group) {
                            return term;
                        }

                        nt = new ONE_OF();

                        nt._terms_.push(term);

                        l.next();

                        while (!l.END) {
                            nt._terms_.push(d$1(l, definitions, super_term, true, need_group, and_group, important));
                            if (l.ch !== "|") break;
                            l.a("|");
                        }

                        return nt;
                    }
                }
                break;
            case "{":
                term = _Jux_(term);
                term.r[0] = parseInt(l.next().tx);
                if (l.next().ch == ",") {
                    l.next();
                    if (l.next().ch == "}")
                        term.r[1] = Infinity;
                    else {
                        term.r[1] = parseInt(l.tx);
                        l.next();
                    }
                } else
                    term.r[1] = term.r[0];
                l.a("}");
                if (super_term) return term;
                break;
            case "*":
                term = _Jux_(term);
                term.r[0] = 0;
                term.r[1] = Infinity;
                l.next();
                if (super_term) return term;
                break;
            case "+":
                term = _Jux_(term);
                term.r[0] = 1;
                term.r[1] = Infinity;
                l.next();
                if (super_term) return term;
                break;
            case "?":
                term = _Jux_(term);
                term.r[0] = 0;
                term.r[1] = 1;
                l.next();
                if (super_term) return term;
                break;
            case "#":
                term = _Jux_(term);
                term._terms_.push(new SymbolTerm(","));
                term.r[0] = 1;
                term.r[1] = Infinity;
                l.next();
                if (l.ch == "{") {
                    term.r[0] = parseInt(l.next().tx);
                    term.r[1] = parseInt(l.next().a(",").tx);
                    l.next().a("}");
                }
                if (super_term) return term;
                break;
            case "<":
                let v;

                if (term) {
                    if (term instanceof NR && term.isRepeating()) term = _Jux_(new NR, term);
                    let v = d$1(l, definitions, true);
                    term = _Jux_(term, v);
                } else {
                    let v = new ValueTerm(l.next().tx, getPropertyParser, definitions);
                    l.next().a(">");
                    term = v;
                }
                break;
            case "!":
                /* https://www.w3.org/TR/CSS21/cascade.html#important-rules */

                l.next().a("important");
                important.is = true;
                break;
            default:
                if (term) {
                    if (term instanceof NR && term.isRepeating()) term = _Jux_(new NR, term);
                    let v = d$1(l, definitions, true);
                    term = _Jux_(term, v);
                } else {
                    let v = (l.ty == l.types.symbol) ? new SymbolTerm(l.tx) : new LiteralTerm(l.tx);
                    l.next();
                    term = v;
                }
        }
    }
    return term;
}

function _Jux_(term, new_term = null) {
    if (term) {
        if (!(term instanceof NR)) {
            let nr = new NR();
            nr._terms_.push(term);
            term = nr;
        }
        if (new_term) term._terms_.push(new_term);
        return term;
    }
    return new_term;
}

/**
 * Checks to make sure token is an Identifier.
 * @param      {Lexer} - A Lexical tokenizing object supporting methods found in {@link Lexer}.
 * @alias module:wick~internals.css.elementIsIdentifier
 */
function _eID_(lexer) {
    if (lexer.ty != lexer.types.id) lexer.throw("Expecting Identifier");
}

/**
 * The empty CSSRule instance
 * @alias module:wick~internals.css.empty_rule
 */
const er = Object.freeze(new CSSRule());

class _selectorPart_ {
    constructor() {
        this.e = "";
        this.ss = [];
        this.c = "";
    }
}
class _mediaSelectorPart_ {
    constructor() {
        this.id = "";
        this.props = {};
        this.c = "";
    }
}

class CSSRuleBody {
    constructor() {
        this.media_selector = null;
        /**
         * All selectors indexed by their value
         */
        this._selectors_ = {};
        /**
         * All selectors in order of appearance
         */
        this._sel_a_ = [];
    }

    _applyProperties_(lexer, rule) {
        while (!lexer.END && lexer.tx !== "}") this.parseProperty(lexer, rule, property_definitions);
        lexer.next();
    }

    /**
     * Gets the last rule matching the selector
     * @param      {string}  string  The string
     * @return     {CSSRule}  The combined set of rules that match the selector.
     */
    getRule(string, r) {
        let selector = this._selectors_[string];
        if (selector) return selector.r;
        return r;
    }


    /**
     * Hook method for hijacking the property parsing function. Return true if default property parsing should not take place
     * @param      {Lexer}   value_lexer    The value lexer
     * @param      {<type>}   property_name  The property name
     * @param      {<type>}   rule           The rule
     * @return     {boolean}  The property hook.
     */
    _getPropertyHook_(value_lexer, property_name, rule) {
        return false;
    }

    /**
     * Used to match selectors to elements
     * @param      {ele}   ele       The ele
     * @param      {string}   criteria  The criteria
     * @return     {boolean}  { description_of_the_return_value }
     * @private
     */
    matchCriteria(ele, criteria) {
        if (criteria.e && ele.tagName !== criteria.e.toUpperCase()) return false;
        outer: for (let i = 0, l = criteria.ss.length; i < l; i++) {
            let ss = criteria.ss[i];
            switch (ss.t) {
                case "attribute":
                    let lex = whind$1(ss.v);
                    if (lex.ch == "[" && lex.pk.ty == lex.types.id) {
                        let id = lex.sync().tx;
                        let attrib = ele.getAttribute(id);
                        if (!attrib) return;
                        if (lex.next().ch == "=") {
                            let value = lex.next().tx;
                            if (attrib !== value) return false;
                        }
                    }
                    break;
                case "pseudo":
                    debugger;
                    break;
                case "class":
                    let class_list = ele.classList;
                    for (let j = 0, jl = class_list.length; j < jl; j++) {
                        if (class_list[j] == ss.v) continue outer;
                    }
                    return false;
                case "id":
                    if (ele.id !== ss.v) return false;
            }
        }
        return true;
    }

    matchMedia(win = window) {

        if (this.media_selector) {
            for (let i = 0; i < this.media_selector.length; i++) {
                let m = this.media_selector[i];
                let props = m.props;
                for (let a in props) {
                    let prop = props[a];
                    if (!prop(win))
                        return false;
                }
            }
        }

        return true;
    }

    /**
     * Retrieves the set of rules from all matching selectors for an element.
     * @param      {HTMLElement}  element - An element to retrieve CSS rules.
     * @public
     */
    getApplicableRules(element, rule = new CSSRule(), win = window) {

        if (!this.matchMedia(win)) return;

        let gen = this.getApplicableSelectors(element),
            sel = null;

        while (sel = gen.next().value) rule.merge(sel.r);
    }

    * getApplicableSelectors(element) {
        for (let j = 0, jl = this._sel_a_.length; j < jl; j++) {
            let ancestor = element;
            let selector = this._sel_a_[j];
            let sn = selector.a;
            let criteria = null;
            outer: for (let x = 0; x < sn.length; x++) {

                let sa = sn[x];

                inner: for (let i = 0, l = sa.length; i < l; i++) {
                    criteria = sa[i];
                    switch (criteria.c) {
                        case "child":
                            if (!(ancestor = ancestor.parentElement) || !this.matchCriteria(ancestor, criteria)) continue outer;
                            break;
                        case "preceded":
                            while ((ancestor = ancestor.previousElementSibling))
                                if (this.matchCriteria(ancestor, criteria)) continue inner;
                            continue outer;
                        case "immediately preceded":
                            if (!(ancestor = ancestor.previousElementSibling) || !this.matchCriteria(ancestor, criteria)) continue outer;
                            break;
                        case "descendant":
                            while ((ancestor = ancestor.parentElement))
                                if (this.matchCriteria(ancestor, criteria)) continue inner;
                            continue outer;
                        default:
                            if (!this.matchCriteria(ancestor, criteria)) continue outer;
                    }
                }
                yield selector;
            }
        }
    }

    /**
     * Parses properties
     * @param      {Lexer}  lexer        The lexer
     * @param      {<type>}  rule         The rule
     * @param      {<type>}  definitions  The definitions
     */
    parseProperty(lexer, rule, definitions) {
        const name = lexer.tx.replace(/\-/g, "_");

        //Catch any comments
        if (lexer.ch == "/") {
            lexer.comment(true);
            return this.parseProperty(lexer, rule, definitions);
        }
        lexer.next().a(":");
        //allow for short circuit < | > | =
        const p = lexer.pk;
        while ((p.ch !== "}" && p.ch !== ";") && !p.END) {
            //look for end of property;
            p.next();
        }
        const out_lex = lexer.copy();
        lexer.sync();
        out_lex.fence(p);
        if (!this._getPropertyHook_(out_lex, name, rule)) {
            try {
                const IS_VIRTUAL = {
                    is: false
                };
                const parser = getPropertyParser(name, IS_VIRTUAL, definitions);
                if (parser && !IS_VIRTUAL.is) {
                    if (!rule.props) rule.props = {};
                    parser.parse(out_lex, rule.props);
                } else
                    //Need to know what properties have not been defined
                    console.warn(`Unable to get parser for css property ${name}`);
            } catch (e) {
                console.log(e);
            }
        }
        if (lexer.ch == ";") lexer.next();
    }

    /** 
    Parses a selector up to a token '{', creating or accessing necessary rules as it progresses. 

    Reference: https://www.w3.org/TR/selectors-3/ 
    https://www.w3.org/TR/css3-mediaqueries/
    https://www.w3.org/TR/selectors-3/

    @param {Lexer} - A Lexical tokenizing object supporting methods found in {@link Lexer}.

    @protected

    */
    parseSelector(lexer) {
        let rule = this,
            id = "",
            selector_array = [],
            selectors_array = [];
        let start = lexer.pos;
        let selectors = [];
        let sel = new _selectorPart_(),
            RETURN = false;
        while (!lexer.END) {
            if (!sel) sel = new _selectorPart_();
            switch (lexer.tx) {
                case "{":
                    RETURN = true;
                case ",":
                    selector_array.unshift(sel);
                    selectors_array.push(selector_array);
                    selector_array = [];
                    selectors.push(lexer.s(start).trim().slice(0));
                    sel = new _selectorPart_();
                    if (RETURN) return new CSSSelector(selectors, selectors_array, this);
                    lexer.next();
                    start = lexer.pos;
                    break;
                case "[":
                    let p = lexer.pk;
                    while (!p.END && p.next().tx !== "]") {};
                    p.a("]");
                    if (p.END) throw new _Error_("Unexpected end of input.");
                    sel.ss.push({
                        t: "attribute",
                        v: p.s(lexer)
                    });
                    lexer.sync();
                    break;
                case ":":
                    sel.ss.push({
                        t: "pseudo",
                        v: lexer.next().tx
                    });
                    _eID_(lexer);
                    lexer.next();
                    break;
                case ".":
                    sel.ss.push({
                        t: "class",
                        v: lexer.next().tx
                    });
                    _eID_(lexer);
                    lexer.next();
                    break;
                case "#":
                    sel.ss.push({
                        t: "id",
                        v: lexer.next().tx
                    });
                    _eID_(lexer);
                    lexer.next();
                    break;
                case "*":
                    lexer.next();
                    break;
                case ">":
                    sel.c = "child";
                    selector_array.unshift(sel);
                    sel = null;
                    lexer.next();
                    break;
                case "~":
                    sel.c = "preceded";
                    selector_array.unshift(sel);
                    sel = null;
                    lexer.next();
                    break;
                case "+":
                    sel.c = "immediately preceded";
                    selector_array.unshift(sel);
                    sel = null;
                    lexer.next();
                    break;
                default:
                    if (sel.e) {
                        sel.c = "descendant";
                        selector_array.unshift(sel);
                        sel = null;
                    } else {
                        sel.e = lexer.tx;

                        _eID_(lexer);
                        lexer.next();
                    }
                    break;
            }
        }
        selector_array.unshift(sel);
        selectors_array.push(selector_array);
        selectors.push(lexer.s(start).trim().slice(0));
        return new CSSSelector(selectors, selectors_array, this);
    }

    /**
     * Parses CSS string
     * @param      {Lexer} - A Lexical tokenizing object supporting methods found in {@link Lexer}
     * @param      {(Array|CSSRuleBody|Object|_mediaSelectorPart_)}  root    The root
     * @return     {Promise}  A promise which will resolve to a CSSRuleBody
     * @private
     */
    parse(lexer, root, res = null, rej = null) {

        if (root && !this.par) root.push(this);

        return new Promise((res, rej) => {
            let selectors = [],
                l = 0;
            while (!lexer.END) {
                switch (lexer.ch) {
                    case "@":
                        lexer.next();
                        switch (lexer.tx) {
                            case "media": //Ignored at this iteration /* https://drafts.csswg.org/mediaqueries/ */
                                //create media query selectors
                                let _med_ = [],
                                    sel = null;
                                while (!lexer.END && lexer.next().ch !== "{") {
                                    if (!sel) sel = new _mediaSelectorPart_();
                                    if (lexer.ch == ",") _med_.push(sel), sel = null;
                                    else if (lexer.ch == "(") {
                                        let start = lexer.next().off;
                                        while (!lexer.END && lexer.ch !== ")") lexer.next();
                                        let out_lex = lexer.copy();
                                        out_lex.off = start;
                                        out_lex.tl = 0;
                                        out_lex.next().fence(lexer);
                                        this.parseProperty(out_lex, sel, media_feature_definitions);
                                        if (lexer.pk.tx.toLowerCase() == "and") lexer.sync();
                                    } else {
                                        let id = lexer.tx.toLowerCase(),
                                            condition = "";
                                        if (id === "only" || id === "not")
                                            (condition = id, id = lexer.next().tx);
                                        sel.c = condition;
                                        sel.id = id;
                                        if (lexer.pk.tx.toLowerCase() == "and") lexer.sync();
                                    }
                                }
                                //debugger
                                lexer.a("{");
                                if (sel)
                                    _med_.push(sel);

                                if (_med_.length == 0)
                                    this.parse(lexer, null); // discard results
                                else {
                                    let media_root = new this.constructor();
                                    media_root.media_selector = _med_;
                                    res(media_root.parse(lexer, root).then(b => {
                                        let body = new this.constructor();
                                        return body.parse(lexer, root);
                                    }));
                                }
                                continue;
                            case "import":
                                /* https://drafts.csswg.org/css-cascade/#at-ruledef-import */
                                let type;
                                if (type = types$1.url.parse(lexer.next())) {
                                    lexer.a(";");
                                    /**
                                     * The {@link CSS_URL} incorporates a fetch mechanism that returns a Promise instance.
                                     * We use that promise to hook into the existing promise returned by CSSRoot#parse,
                                     * executing a new parse sequence on the fetched string data using the existing CSSRoot instance,
                                     * and then resume the current parse sequence.
                                     * @todo Conform to CSS spec and only parse if @import is at the top of the CSS string.
                                     */
                                    return type.fetchText().then((str) =>
                                        //Successfully fetched content, proceed to parse in the current root.
                                        //let import_lexer = ;
                                        res(this.parse(whind$1(str), this).then((r) => this.parse(lexer, r)))
                                        //parse returns Promise. 
                                        // return;
                                    ).catch((e) => res(this.parse(lexer)));
                                } else {
                                    //Failed to fetch resource, attempt to find the end to of the import clause.
                                    while (!lexer.END && lexer.next().tx !== ";") {}
                                    lexer.next();
                                }
                        }
                        break;
                    case "/":
                        lexer.comment(true);
                        break;
                    case "}":
                        lexer.next();
                        return res(this);
                    case "{":
                        let rule = new CSSRule(this);
                        this._applyProperties_(lexer.next(), rule);
                        for (let i = -1, sel = null; sel = selectors[++i];)
                            if (sel.r) sel.r.merge(rule);
                            else sel.r = rule;
                        selectors.length = l = 0;
                        continue;
                }

                let selector = this.parseSelector(lexer, this);

                if (selector) {
                    if (!this._selectors_[selector.id]) {
                        l = selectors.push(selector);
                        this._selectors_[selector.id] = selector;
                        this._sel_a_.push(selector);
                    } else l = selectors.push(this._selectors_[selector.id]);
                }
            }

            return res(this);
        });

    }

    isSame(inCSSRuleBody) {
        if (inCSSRuleBody instanceof CSSRuleBody) {
            if (this.media_selector) {
                if (inCSSRuleBody.media_selector) {
                    //TODO compare media selectors;
                }
            } else if (!inCSSRuleBody.media_selector)
                return true;
        }
        return false;
    }

    merge(inCSSRuleBody) {
        this.parse(whind$1(inCSSRuleBody + ""));
    }

    /**
     * Gets the media.
     * @return     {Object}  The media.
     * @public
     */
    getMedia(win = window) {
        let start = this;
        this._media_.forEach((m) => {
            if (m._med_) {
                let accept = true;
                for (let i = 0, l = m._med_.length; i < l; i++) {
                    let ms = m._med_[i];
                    if (ms.props) {
                        for (let n in ms.props) {
                            if (!ms.props[n](win)) accept = false;
                        }
                    }
                    //if(not)
                    //    accept = !accept;
                    if (accept)
                        (m._next_ = start, start = m);
                }
            }
        });
        return start;
    }

    updated() {
        this.par.updated();
    }

    toString(off = 0) {
        let str = "";
        for (let i = 0; i < this._sel_a_.length; i++) {
            str += this._sel_a_[i].toString(off);
        }
        return str;
    }

    createSelector(selector_value) {
        let selector = this.parseSelector(whind$1(selector_value));

        if (selector)
            if (!this._selectors_[selector.id]) {
                this._selectors_[selector.id] = selector;
                this._sel_a_.push(selector);
                selector.r = new CSSRule(this);
            } else
                selector = this._selectors_[selector.id];

        return selector;
    }
}

LinkedList.mixinTree(CSSRuleBody);

/**
 * Container for all rules found in a CSS string or strings.
 *
 * @memberof module:wick~internals.css
 * @alias CSSRootNode
 */
class CSSRootNode {
    constructor() {
        this.promise = null;
        /**
         * Media query selector
         */
        this.pending_build = 0;
        this.resolves = [];
        this.res = null;
        this.observers = [];
        
        this.addChild(new CSSRuleBody());
    }

    _resolveReady_(res, rej) {
        if (this.pending_build > 0) this.resolves.push(res);
        res(this);
    }

    _setREADY_() {
        if (this.pending_build < 1) {
            for (let i = 0, l = this.resolves; i < l; i++) this.resolves[i](this);
            this.resolves.length = 0;
            this.res = null;
        }
    }

    _READY_() {
        if (!this.res) this.res = this._resolveReady_.bind(this);
        return new Promise(this.res);
    }
    /**
     * Creates a new instance of the object with same properties as the original.
     * @return     {CSSRootNode}  Copy of this object.
     * @public
     */
    clone() {
        let rn = new this.constructor();
        rn._selectors_ = this._selectors_;
        rn._sel_a_ = this._sel_a_;
        rn._media_ = this._media_;
        return rn;
    }

    * getApplicableSelectors(element, win = window) {

        for (let node = this.fch; node; node = this.getNextChild(node)) {

            if(node.matchMedia(win)){
                let gen = node.getApplicableSelectors(element, win);
                let v = null;
                while ((v = gen.next().value))
                    yield v;
            }
        }
    }

    /**
     * Retrieves the set of rules from all matching selectors for an element.
     * @param      {HTMLElement}  element - An element to retrieve CSS rules.
     * @public
     */
    getApplicableRules(element, rule = new CSSRule(), win = window) {
        for (let node = this.fch; node; node = this.getNextChild(node))
            node.getApplicableRules(element, rule, win);
        return rule;
    }

    /**
     * Gets the last rule matching the selector
     * @param      {string}  string  The string
     * @return     {CSSRule}  The combined set of rules that match the selector.
     */
    getRule(string) {
        let r = null;
        for (let node = this.fch; node; node = this.getNextChild(node))
            r = node.getRule(string, r);
        return r;
    }

    toString(off = 0) {
        let str = "";
        for (let node = this.fch; node; node = this.getNextChild(node))
            str += node.toString(off);
        return str;
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observer) {
        for (let i = 0; i < this.observers.length; i++)
            if (this.observers[i] == observer) return this.observers.splice(i, 1);
    }

    updated() {
        if (this.observers.length > 0)
            for (let i = 0; i < this.observers.length; i++) this.observers[i].updatedCSS(this);
    }

    parse(lex, root) {
        if (lex.sl > 0) {

            if (!root && root !== null) {
                root = this;
                this.pending_build++;
            }

            return this.fch.parse(lex, this).then(e => {
                this._setREADY_();
                return this;
            });
        }
    }

    merge(inCSSRootNode){
        if(inCSSRootNode instanceof CSSRootNode){
            
            let children = inCSSRootNode.children;
            outer:
            for(let i = 0; i < children.length; i++){
                //determine if this child matches any existing selectors
                let child = children[i];
                
                for(let i = 0; i < this.children.length; i++){
                    let own_child = this.children[i];

                    if(own_child.isSame(child)){
                        own_child.merge(child);
                        continue outer;
                    }
                }

                this.children.push(child);
            }
        }
    }
}

/**
 * CSSRootNode implements all of ll
 * @extends ll
 * @memberof  module:wick~internals.html.CSSRootNode
 * @private
 */
LinkedList.mixinTree(CSSRootNode);
/*
 * Expecting ID error check.
 */
const _err_ = "Expecting Identifier";

/**
 * Builds a CSS object graph that stores `selectors` and `rules` pulled from a CSS string. 
 * @function
 * @param {string} css_string - A string containing CSS data.
 * @param {string} css_string - An existing CSSRootNode to merge with new `selectors` and `rules`.
 * @return {Promise} A `Promise` that will return a new or existing CSSRootNode.
 * @memberof module:wick.core
 * @alias css
 */
const CSSParser = (css_string, root = null) => (root = (!root || !(root instanceof CSSRootNode)) ? new CSSRootNode() : root, root.parse(whind$1(css_string)));

CSSParser.types = types$1;

let cache_de_cache = null;

function getApplicableRules(system, element, component) {
    return system.css.aquireCSS(element, component);
}

function getUniqueRule(system, element, component) {
    return system.css.getUnique(element, component);
}

function mergeRules(system, css) {
    return system.css.mergeRules(css);
}

class Cache {

    constructor() {
        this.rules = null;
        this.element = null;
        this.cssflagsA = 0;
        this.cssflagsB = 0;
        this.next = null;
        this.valueA = 0;
        this.valueB = 0;
        this.valueC = 0;
        this.valueD = 0;
        this.move_vert_type = "";
        this.move_hori_type = "";
        this.unique = null;
    }

    destroy() {
        this.rules = null;
        this.element = null;
        this.cssflagsA = 0;
        this.cssflagsB = 0;
        this.move_type = "";
        this.valueA = 0;
        this.valueB = 0;
        this.valueC = 0;
        this.valueD = 0;
        this.next = cache_de_cache;
        cache_de_cache = this;
    }

    generateMovementCache(system, element, component) {

        let move_type = system.project.components.move_type;

        let unique_rule = getUniqueRule(system, element, component),
            css_r = getApplicableRules(system, element, component),
            css = mergeRules(system, css_r);

        //test for presence of rules. 
        let POS_R = false,
            POS_A = false,
            HT = false,
            HL = false,
            HB = false,
            HR = false,
            HM = false,
            HMR = false,
            HMT = false,
            HMB = false,
            HML = false,
            W = false,
            H = false;

        if (css.props.position) {
            if (css.props.position == "relative")
                POS_R = true;
            else
                POS_A = true;
        }

        if (css.props.left)
            HL = true;
        if (css.props.right)
            HR = true;
        if (css.props.top)
            HT = true;
        if (css.props.bottom)
            HB = true;

        if (css.props.margin_left)
            HML = true;
        if (css.props.margin_right)
            HMR = true;
        if (css.props.margin_top)
            HMT = true;
        if (css.props.margin_bottom)
            HMB = true;
        if (css.props.margin)
            HM = true;

        if (css.props.width)
            W = true;
        if (css.props.height)
            H = true;

        //      1                     2                   4                 8                 16                
        let v = ((POS_R | 0) << 0) | ((POS_A | 0) << 1) | ((HT | 0) << 2) | ((HR | 0) << 3) | ((HB | 0) << 4) |
            //32                64                 128                256                512                1024              2048            4096
            ((HL | 0) << 5) | ((HMT | 0) << 6) | ((HMR | 0) << 7) | ((HMB | 0) << 8) | ((HML | 0) << 9) | ((W | 0) << 10) | ((H | 0) << 11) | ((HM | 0) << 12);


        if ((60 & v) > 0) { //

            if ((v & 40) == 0) { // HT + HL
                //missing left / right position value.
                //Add left
                unique_rule.addProp(`left:0px`);
                v |= 1 << 5;
            }

            if ((v & 20) == 0) { // HT + HR
                //missing top / bottom position value
                //Add top
                unique_rule.addProp(`top:0px`);
                v |= 1 << 2;
            }
        } else if ((960 & v) > 0) {
            //using margin
        } else {

            //Create left and top positions or us margin depending on current user preferences.
            unique_rule.addProp(`left:0px;top:0px`);
            v |= 4 | 32;
        }

        if ((v & 3) == 0) {

            if (move_type == "absolute") {
                v |= 2;
                unique_rule.addProp('position:absolute');
            } else if (move_type == "relative") {
                v |= 1;
                unique_rule.addProp('position:relative;');
            }
        }


        //Setup move systems. 
        while (true) {

            let p = [];

            if ((32 & v))
                p.push("left");
            if ((8 & v))
                p.push("right");

            if ((v & 1024) && css.props.width !== "auto") {
                if ((v & (128 + 512 + 4096))) {
                    if ((css.props.margin_left == "auto" && css.props.margin_left == "auto") || css.props.margin == "auto")
                        p.push("margin");
                }
            }

            if (p.length > 0)
                this.move_hori_type = p.join(" ");

            p = [];


            //vertical types
            if (2 & v) {
                let p = [];

                if ((4 & v))
                    p.push("top");
                if ((16 & v) && (p.length < 1) || !(v & 2048))
                    p.push("bottom");

                if (p.length > 0)
                    this.move_vert_type = p.join(" ");
            }

            if (1 & v) {
                let p = [];

                if ((4 & v))
                    p.push("top");
                if ((16 & v) && (p.length < 1))
                    p.push("bottom");

                if (p.length > 0)
                    this.move_vert_type = p.join(" ");
            }

            break;
        }

        this.unique = unique_rule;
        css_r = getApplicableRules(system, element, component);
        this.rules = mergeRules(system, css_r);
        this.cssflagsA = v;
        this.original_rules =css_r;
        //calculate horizontal and vertical rations. also width and height ratios.  
    }

    get position(){
        if(this.cssflagsA & Cache.relative)
            return "relative";
        if(this.cssflagsA & Cache.absolute)
            return "absolute";
        return "auto";

    }
}

//Flags
Cache.relative = 1;
Cache.absolute = 2;

function CacheFactory(system, element, component) {

    if (element.flame_cache)
        return element.flame_cache;

    let cache;

    if (cache_de_cache) {
        cache = cache_de_cache;
        cache_de_cache = cache_de_cache.next;
    } else
        cache = new Cache();

    cache.generateMovementCache(system, element, component);

    element.flame_cache = cache;

    return cache;
}

CacheFactory.clear = function(element){
    
    if(element.flame_cache){
        element.flame_cache.destroy();
    }

    element.flame_cache = null;
};

function TEXTEDITOR(system, element, component, x, y){}

function TEXT(system, element, component, dx, dy) {
    let pos = event.cursor;
    let data = event.text_data;
    let text = system.html.aquireTextData(element);
    text.update(pos, data);
}

let types$2 = CSSParser.types;

function getContentBox(ele, win = window) {

    let rect = ele.getBoundingClientRect();
    let par_prop = win.getComputedStyle(ele);

    let border_l = parseFloat(par_prop.getPropertyValue("border-left"));
    let border_r = parseFloat(par_prop.getPropertyValue("border-right"));
    let border_t = parseFloat(par_prop.getPropertyValue("border-top"));
    let border_b = parseFloat(par_prop.getPropertyValue("border-bottom"));

    let top = rect.top + border_t;
    let left = rect.left + border_l;
    let width = rect.width - border_l - border_r;
    let height = rect.height - border_t - border_b;

    return { top, left, width, height };
}

function getFirstPositionedAncestor(ele) {
    let element = null;

    while (ele.parentElement) {
        ele = ele.parentElement;
        let pos = window.getComputedStyle(ele).getPropertyValue("position");

        if (pos && pos !== "sticky" && pos !== "static") {
            break;
        }
    }

    return ele;
}

function setNumericalValue(propname, system, element, component, value, relative_type = 0) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    let props = css.props;
    let prop = props[propname];
    let css_name = propname.replace(/_/g, "-");
    
    if (!prop) {
        if(cache.unique.r.props[propname]){
            props = cache.unique.r.props;
            prop = props[propname];
        }if(!KEEP_UNIQUE){
            let type = (system.project.components.default_unit || "px");
            let value = (type == "%") ? new types$2.percentage(0) : new types$2.length(0, type);
            cache.unique.addProp(`${css_name}:${value}`);
            props = cache.unique.r.props;
            prop = props[propname];
        } else  {
            let type = (system.project.components.default_unit || "px");
            let value = (type == "%") ? new types$2.percentage(0) : new types$2.length(0, type);
            cache.unique.addProp(`${css_name}:${value}`);
            props = cache.unique.r.props;
            prop = props[propname];
        }
    }


    if (prop == "auto") {
        //convert to numerical form;
        props[propname] = new types$2.length(value, "px");
    } else if (prop instanceof types$2.percentage) {
        //get the nearest positioned ancestor

        let denominator = 0, ele;

        switch(relative_type){
            case setNumericalValue.parent_width :
                ele = element.parentElement; //getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window).width;
            break;
            case setNumericalValue.parent_height :
                ele = element.parentElement; //getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window).height;
            break;
            case setNumericalValue.positioned_ancestor_width :
                ele = getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window).width;
            break;
            case setNumericalValue.positioned_ancestor_height :
                ele = getFirstPositionedAncestor(element);
                if (ele) denominator = getContentBox(ele, component.window).height;
            break;
            case setNumericalValue.height :
                denominator = getContentBox(element, component.window).width;
            break;
            case setNumericalValue.width :
                denominator = getContentBox(element, component.window).width;
            break;
        }

        let np = value / denominator;
        
        props[propname] = prop.copy(np * 100);
    } else {
        if(prop.copy)
            props[propname] = prop.copy(value);
        else{
            if(value !== 0)
                props[propname] = new types$2.length(value, "px");
            else
                props[propname] = 0;
        }
    }
}

setNumericalValue.parent_width = 0;
setNumericalValue.parent_height = 1;
setNumericalValue.positioned_ancestor_width = 2;
setNumericalValue.positioned_ancestor_height = 3;
setNumericalValue.height = 4;
setNumericalValue.width = 5;



function getRatio(system, element, component, funct, original_value, delta_value, css_name) {
    let ratio = 0;
    funct(system, element, component, original_value + delta_value);
    let end_x = parseFloat(component.window.getComputedStyle(element)[css_name]);
    let diff_x = end_x - original_value;
    if (false && Math.abs(diff_x - delta_value) > 0.0005 && delta_value !== 0) {        
        ratio = (diff_x / delta_value);
        let diff = delta_value / ratio;
        if (diff !== 0) {
            funct(system, element, component, original_value + diff, true);
        }
    }
    return ratio;
}

function setValue(system, element, component, value_name, value){
    let cache = CacheFactory(system, element, component);
    
    let props = cache.rules.props;

    if(props[value_name]){
        props[value_name] = value;
    }else{
        cache.unique.addProp(`${value_name.replace(/\_/g,"-")}:${value}`);
    }
}

function SETWIDTH(system, element, component, x, LINKED = false) {
    setNumericalValue("width", system, element, component, x, setNumericalValue.parent_width);
        element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild(); 
}

function SETHEIGHT(system, element, component, x, LINKED = false) {
    setNumericalValue("height", system, element, component, x, setNumericalValue.parent_height);
        element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild(); 
}

function SETDELTAWIDTH(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).width);

    if (ratio > 0)
        SETWIDTH(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETWIDTH, start_x, dx, "width");

        element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild(); 

    return ratio;
}

function SETDELTAHEIGHT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).height);
    
    if (ratio > 0)
        SETHEIGHT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETHEIGHT, start_x, dx, "height");

        element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild(); 

    return ratio;
}

const types$3 = CSSParser.types;

function SETLEFT(system, element, component, x, LINKED = false, type = "") {
    let cache = CacheFactory(system, element, component);

    if (x.type) {
        cache.rules.props.left = x;
    } else {
        if (cache.cssflagsA & 1)
            setNumericalValue("left", system, element, component, x, setNumericalValue.parent_width);
        else
            setNumericalValue("left", system, element, component, x, setNumericalValue.positioned_ancestor_width);
    }

    if (!LINKED) element.wick_node.setRebuild();
}

function SETTOP(system, element, component, x, LINKED = false) {
    let cache = CacheFactory(system, element, component);

    if (x.type) {
        cache.rules.props.top = x;
    } else {
        if (cache.cssflagsA & 1)
            setNumericalValue("top", system, element, component, x, setNumericalValue.parent_height);
        else
            setNumericalValue("top", system, element, component, x, setNumericalValue.positioned_ancestor_height);
    }

    if (!LINKED) element.wick_node.setRebuild();
}
function SETRIGHT(system, element, component, x, LINKED = false) {
    let cache = CacheFactory(system, element, component);

    if (cache.cssflagsA & 1)
        setNumericalValue("right", system, element, component, x, setNumericalValue.parent_width);
    else
        setNumericalValue("right", system, element, component, x, setNumericalValue.positioned_ancestor_width);

    if (!LINKED) element.wick_node.setRebuild();
}

function SETBOTTOM(system, element, component, x, LINKED = false) {
    let cache = CacheFactory(system, element, component);

    if (cache.cssflagsA & 1)
        setNumericalValue("bottom", system, element, component, x, setNumericalValue.parent_height);
    else
        setNumericalValue("bottom", system, element, component, x, setNumericalValue.positioned_ancestor_height);

    if (!LINKED) element.wick_node.setRebuild();
}

function SETDELTALEFT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).left);

    start_x = isNaN(start_x) ? 0 : start_x;

    if (ratio > 0)
        SETLEFT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETLEFT, start_x, dx, "left");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETDELTATOP(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).top);

    start_x = isNaN(start_x) ? 0 : start_x;

    if (ratio > 0)
        SETTOP(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETTOP, start_x, dx, "top");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETDELTARIGHT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).right);

    start_x = isNaN(start_x) ? 0 : start_x;

    if (ratio > 0)
        SETRIGHT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETRIGHT, start_x, dx, "right");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETDELTABOTTOM(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element).bottom);

    start_x = isNaN(start_x) ? 0 : start_x;
    
    if (ratio > 0)
        SETBOTTOM(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETBOTTOM, start_x, dx, "bottom");


    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function RESIZET(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.y += dy, component.height -= dy);
    let cache = CacheFactory(system, element, component);
    switch (cache.move_vert_type) {
        case "top bottom":
            SETDELTATOP(system, element, component, dy, 0, true);
        case "top":
            SETDELTATOP(system, element, component, dy, 0, true);
            SETDELTAHEIGHT(system, element, component, -dy, 0, true);
            break;
        case "bottom":
            SETDELTAHEIGHT(system, element, component, -dy, 0, true);
            break;
    }
    element.wick_node.setRebuild();
}

function RESIZER(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.width += dx);
    let cache = CacheFactory(system, element, component);
    switch (cache.move_hori_type) {
        case "left right":
            SETDELTARIGHT(system, element, component, -dx, 0, true);
            break;
        case "left":
            SETDELTAWIDTH(system, element, component, dx, 0, true);
            break;
        case "right":
            SETDELTARIGHT(system, element, component, -dx, 0, true);
            SETDELTAWIDTH(system, element, component, -dx, 0, true);
            break;
    }
    element.wick_node.setRebuild();
}

function RESIZEL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.x += dx, component.width -= dx);
    let cache = CacheFactory(system, element, component);
    switch (cache.move_hori_type) {
        case "left right":
            SETDELTALEFT(system, element, component, dx, 0, true);
            break;
        case "left":
            SETDELTALEFT(system, element, component, dx, 0, true);
            SETDELTAWIDTH(system, element, component, -dx, 0, true);
            break;
        case "right":
            SETDELTAWIDTH(system, element, component, -dx, 0, true);
            break;
    }
    element.wick_node.setRebuild();
}

function SUBRESIZEB(system, element, component, dx, dy, ratio){
    let cache = CacheFactory(system, element, component);
    switch (cache.move_vert_type) {
        case "top bottom":
            SETDELTABOTTOM(system, element, component, -dy, ratio * 0.5, true);
            SETDELTAHEIGHT(system, element, component, dy, ratio * 0.5, true);
            break;
        case "top":
            SETDELTAHEIGHT(system, element, component, dy, ratio, true);
            break;
        case "bottom":
            SETDELTABOTTOM(system, element, component, -dy, ratio * 0.5, true);
            SETDELTAHEIGHT(system, element, component, dy, ratio * 0.5, true);
            break;
    }

    element.wick_node.setRebuild();
    element.wick_node.rebuild();
}

function RESIZEB(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return (component.height += dy);
    let cache = CacheFactory(system, element, component);
    //get the bottom value of the element;

    if (cache.valueB == 0) {
        let rect = element.getBoundingClientRect();
        let bottom = rect.y + rect.height;
        SUBRESIZEB(system, element, component, dx, dy, 1);
        rect = element.getBoundingClientRect();
        let bottom2 = rect.y + rect.height;
        if (bottom2 - bottom !== dy) {
            let ratio = ((bottom2 - bottom) / dy);
            let diff = dy / ratio;
            if (diff !== 0) {
                SUBRESIZEB(system, element, component, dx, -diff, ratio);
                cache.valueB = ratio;
            }
        }
    } else
        SUBRESIZEB(system, element, component, dx, dy, cache.valueB);
}

function RESIZETL(system, element, component, dx, dy, IS_COMPONENT) {
    RESIZEL(system, element, component, dx, dy, IS_COMPONENT);
    RESIZET(system, element, component, dx, dy, IS_COMPONENT);
    if (IS_COMPONENT) return;
    element.wick_node.setRebuild();
}

function RESIZETR(system, element, component, dx, dy, IS_COMPONENT) {
    RESIZER(system, element, component, dx, dy, IS_COMPONENT);
    RESIZET(system, element, component, dx, dy, IS_COMPONENT);
    if (IS_COMPONENT) return;
    element.wick_node.setRebuild();
}

function RESIZEBL(system, element, component, dx, dy, IS_COMPONENT) {
    RESIZEL(system, element, component, dx, dy, IS_COMPONENT);
    RESIZEB(system, element, component, dx, dy, IS_COMPONENT);
    if (IS_COMPONENT) return;
    element.wick_node.setRebuild();
}

function RESIZEBR(system, element, component, dx, dy, IS_COMPONENT) {
    RESIZER(system, element, component, dx, dy, IS_COMPONENT);
    RESIZEB(system, element, component, dx, dy, IS_COMPONENT);
    if (IS_COMPONENT) return;
    element.wick_node.setRebuild();
}

const types$4 = CSSParser.types;

/**
 * Actions provide mechanisms for updating an element, document, and component through user input. 
 */
function MOVE(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) {
        component.x += dx;
        component.y += dy;
    } else {

        // Get CSS information on element and update appropriate records
        let cache = CacheFactory(system, element, component);

        let css = cache.rules;

        if (css.props.position && css.props.position !== "static") {
            switch (cache.move_hori_type) {
                case "left right margin":
                    //in cases of absolute
                    cache.valueB = SETDELTARIGHT(system, element, component, -dx, cache.valueB);
                    cache.valueA = SETDELTALEFT(system, element, component, dx, cache.valueA);
                    break;
                case "left right":
                    cache.valueB = SETDELTARIGHT(system, element, component, -dx, cache.valueB);
                case "left":
                    cache.valueA = SETDELTALEFT(system, element, component, dx, cache.valueA);
                    break;
                case "right":
                    cache.valueB = SETDELTARIGHT(system, element, component, -dx, cache.valueB);
                    break;
            }

            switch (cache.move_vert_type) {
                case "top bottom":
                    cache.valueC = SETDELTABOTTOM(system, element, component, -dy, cache.valueC);
                case "top":
                    cache.valueD = SETDELTATOP(system, element, component, dy, cache.valueD);
                    break;
                case "bottom":
                    cache.valueC = SETDELTABOTTOM(system, element, component, -dy, cache.valueC);
                    break;
            }
        }

        element.wick_node.setRebuild();
        element.wick_node.rebuild();
    }
}

function CENTER(system, element, component, HORIZONTAL = true, VERTICAL = true) {
    // Get CSS information on element and update appropriate records
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;

    let ancestor = getFirstPositionedAncestor(element);

    let ancestor_box = ancestor.getBoundingClientRect();

    let own_box = element.getBoundingClientRect();

    let w = own_box.width;
    let diff = (ancestor_box.width - w) / 2;

    switch (cache.move_hori_type) {
        case "left right":
            //get the width of the parent element
            css.props.left = new types$4.length(diff, "px");
            css.props.right = new types$4.length(diff, "px");
            cache.unique.addProp(`margin-left:auto; margin-right:auto`);
            break;
        case "left":
            cache.unique.addProp(`margin-left:auto; margin-right:auto;left:0px;right:0px`);
            break;
        case "right":
            break;
        case "margin-left":
            break;
        case "margin-left margin-right":
            break;
        case "margin":
            break;
    }

    /*
    switch (cache.move_vert_type) {
        case "top bottom":
            cache.valueC = setBottom(element, -dy, css, cache.valueC);
        case "top":
            cache.valueD = setDeltaTop(element, dy, css, cache.valueD);
            break;
        case "bottom":
            cache.valueC = setBottom(element, -dy, css, cache.valueC);
            break;
    }
    */

    element.wick_node.setRebuild();
}

function COMPLETE(system, element) {
	
	//Diff changed documents, clear caches, close opened dialogs if necessary
	if(element)
		CacheFactory.clear(element);

	system.docs.seal();
	system.history.seal();
}

//import wick from "@candlefw/wick";

/**
 * This module is responsible for storing, updating, and caching compents. 
 * In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
 * Any associated stylesheets are managed through this componnent. 
 */
class Component {

    constructor(system) {
        //frame for fancy styling
        this.style_frame = document.createElement("div");
        this.style_frame.classList.add("flame_component");
        this.style_frame.classList.add("style_frame");

        this.dimensions = document.createElement("div");
        this.dimensions.classList.add("flame_component_dimensions");

        this.iframe = document.createElement("iframe");
        this.iframe.src = "component_frame.html";
        this.width = system.project.defaults.component.width;
        this.height = system.project.defaults.component.height;

        this.IFRAME_LOADED = false;

        this.iframe.onload = (e) => {
            this.mountListeners();
            //e.target.contentDocument.body.appendChild(this.data);
            //e.target.contentWindow.wick = wick;
            this.window = e.target.contentWindow;
            this.IFRAME_LOADED = true;
        };

        //Label
        this.name = document.createElement("div");
        this.name.innerHTML = "unnamed";
        this.name.classList.add("flame_component_name");


        //HTML Data
        this.data = document.createElement("div");

        this.style_frame.appendChild(this.dimensions);
        this.style_frame.appendChild(this.name);
        this.style_frame.appendChild(this.iframe);

        //Flag for mounted state of component. If a component is accessible anywhere on the main UI, then it is considered mounted. 
        this.mounted = false;

        //Links to local CSS scripts
        this.local_css = [];

        //The file path (relative to project directory), of the component file. 
        this.file_path = "";

        //The file name of the component. 
        this.file_name = "";

        //The source component manager that handles the instantiation and runtime of Wick components. 
        this.manager = null;

        this.system = system;

        this.action = null;
    }

    mountListeners() {
        this.system.ui.integrateIframe(this.iframe, this);
    }

    get element() {
        return this.style_frame;
    }

    addStyle(tree, INLINE) {
        if (!INLINE) {
            let style = new StyleNode();
            style.tag = "style";
            this.sources[0].ast.addChild(style);
            style.css = tree;
            tree.addObserver(style);
            this.local_css.splice(this.css_split, 0, tree);
            this.css_split++;
        } else {
            //insert the style into the root of the tree;
            this.local_css.push(style);
        }
    }

    cache() {

    }

    destroy() {
        this.element = null;
    }

    /**
     * @brief Saves file to project directory. 
     * @details [long description]
     */
    saveFile() {

    }

    /**
     * Caches a bitmap image of the component.
     */
    cacheBitmap() {

    }

    load(document) {
        this.name.innerHTML = document.name;
        this.doc_name = document.name;
        this.doc_path = document.path;
        document.bind(this);
    }

    documentReady(pkg) {

        if (this.manager) {
            //Already have source, just need to rebuild with new tree. 
            const tree = pkg.skeletons[0].tree,
                css = tree.css;

            this.sources[0].ast = tree;

            if (css)
                css.forEach(css => {
                    this.local_css.push(css);
                });

            this.local_css = [];

            this.rebuild();
        } else {

        
            let css = pkg.skeletons[0].tree.css;

            if (css)
                css.forEach(css => {
                    this.local_css.push(css);
                });

            if (this.IFRAME_LOADED) {
                this.manager = pkg.mount(this.iframe.contentDocument.body, null, false, this);
                this.sources[0].window = this.window;
                this.rebuild();

            } else
                this.iframe.addEventListener("load", () => {
                    this.manager = pkg.mount(this.iframe.contentDocument.body, null, false, this);
                    this.sources[0].window = this.window;
                    this.rebuild();
                });
        }
    }

    upImport() {

    }

    /**
     * Mounts the element to the document. 
     */
    mount() {}

    /**
     * Determines if point is in bounding box. 
     */
    pointInBoundingBox(x, y) {
        this.updateDimensions();
        let min_x = this.dimensions.left;
        let max_x = min_x + this.dimensions.width;
        let min_y = this.dimensions.top;
        let max_y = min_y + this.dimensions.height;
        return x >= min_x && x <= max_x && y >= min_y && y <= max_y;
    }

    rebuild() {
        if (this.sources)
            this.sources[0].rebuild();
    }

    query(query) {
        return this.window.document.querySelector(query);
    }

    set x(x) {
        this.element.style.left = x + "px";
    }

    set y(y) {
        this.element.style.top = y + "px";

    }

    set width(w) {
        this.iframe.width = w;
        this.dimensions.innerHTML = `${Math.round(this.width)}px ${Math.round(this.height)}px`;
        this.rebuild();
    }

    set height(h) {
        this.iframe.height = h;
        this.dimensions.innerHTML = `${Math.round(this.width)}px ${Math.round(this.height)}px`;
        this.rebuild();
    }

    get x() {
        return parseFloat(this.element.style.left);
    }

    get y() {
        return parseFloat(this.element.style.top);
    }

    get width() {
        return parseFloat(this.iframe.width);
    }

    get height() {
        return parseFloat(this.iframe.height);
    }

    get target() {
        return this.element;
    }

    toJSON(){
        console.log(this.x,this.y);
        return {
            x:this.x,
            y:this.y,
            width:this.width,
            height:this.height,
            path:this.doc_path,
            name:this.doc_name,
            type: "html"
        };
    }
}

function CREATE_COMPONENT(system, doc, event) {
    //if(!(doc instanceof Document))
    //    throw new Error("Action CREATE_COMPONENT cannot continue: doc is not an instance of Document.");

    let component = new Component(system);

    component.load(doc);

    let element = component.element;

    document.querySelector("#main_view").appendChild(element);

    component.x = event.x;
    component.y = event.y;

    return component;
}

function REMOVE_COMPONENT(system, component){
    if(!(component instanceof Component)) 
        throw new Error("Action REMOVE_COMPONENT cannot continue: component is not an instance of Component.");

    if(component.target.parentElement)
        component.target.parentElement.removeChild(component.target);

    system.ui.removeComponent(component);
}

function CREATE_CSS_DOC(system, doc, event) {
    let comp = system.css.createComponent(doc);

    let element = comp.element;

    comp.x = -event.x;
    comp.y = -event.y;
}

let types$5 = CSSParser.types;

//set background color
function SETBACKGROUNDCOLOR(system, element, component, r, g, b, a = 1){
	let color = new types$5.color(r,g,b,a);
	setValue(system, element, component, "background_color", color);
	element.wick_node.setRebuild();
}
//set background image
//set font color
function SETCOLOR(system, element, component, r, g, b, a = 1){
	let color = new types$5.color(r,g,b,a);
	setValue(system, element, component, "color", color);
	element.wick_node.setRebuild();
}
//set font image

function MOVE_PANEL(system, panel, dx, dy) {
    panel.x -= dx;
    panel.y -= dy;

    if (panel.x < 0) panel.x = 0;
    if (panel.y < 0) panel.y = 0;
    if (panel.x + panel.width > window.screen.width) panel.x = window.screen.width - panel.width;
    if (panel.y + panel.height > window.screen.height) panel.y = window.screen.height - panel.height;
}

function UNDO(system){
	system.history.undo();
}

function REDO(system){
	system.history.redo();
}

function resetPadding(system, element, component) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    if (css.props.padding) {
        let val = css.props.padding;

        if (!Array.isArray(val)) {
            cache.unique.addProp(`
                padding-top:${val};
                padding-right:${val};
                padding-bottom:${val};
                padding-left:${val};
            `);
        } else {
            switch (val.length) {
                case 2:
                    cache.unique.addProp(`
                        padding-top:${val[0]};
                        padding-right:${val[1]};
                        padding-bottom:${val[0]};
                        padding-left:${val[1]};
                    `);
                    break;
                case 3:
                    cache.unique.addProp(`
                        padding-top:${val[0]};
                        padding-right:${val[2]};
                        padding-bottom:${val[1]};
                        padding-left:${val[2]};
                    `);
                    break;
                case 4:
                    cache.unique.addProp(`
                        padding-top:${val[0]};
                        padding-right:${val[1]};
                        padding-bottom:${val[2]};
                        padding-left:${val[3]};
                    `);
                    break;
            }
        }
        //Convert padding value into 
        css.props.padding = null;
    }
}

function SETPADDINGLEFT(system, element, component, x, LINKED = false) {
    resetPadding(system, element, component);
    setNumericalValue("padding_left", system, element, component, x, setNumericalValue.parent_width);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

function SETDELTAPADDINGLEFT(system, element, component, dx, ratio = 0, LINKED = false) {
    let style = component.window.getComputedStyle(element);3;
    let start_x = parseFloat(style.paddingLeft) || 0;
    let width = (parseFloat(style.width) || 0) + start_x;

    if(dx > 0 && start_x + dx > width - 20) return ratio;

    if(start_x+dx > 0){

    if (ratio > 0)
        SETPADDINGLEFT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETPADDINGLEFT, start_x, dx, "padding-left");

    SETDELTAWIDTH(system, element, component, -dx, true);

    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

    return ratio;
}

function SETPADDINGTOP(system, element, component, x, LINKED = false) {
    resetPadding(system, element, component);
    setNumericalValue("padding_top", system, element, component, x, setNumericalValue.parent_height);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

function SETDELTAPADDINGTOP(system, element, component, dy, ratio = 0, LINKED = false) {
    let style = component.window.getComputedStyle(element);
    let start_y = parseFloat(style.paddingTop) || 0;
    let height = (parseFloat(style.height) || 0) + start_y;

    if(dy > 0 && start_y + dy > height - 20) return ratio;

    if(start_y+dy > 0){
        if (ratio > 0)
            SETPADDINGTOP(system, element, component, start_y + dy / ratio, true);
        else
            ratio = getRatio(system, element, component, SETPADDINGTOP, start_y, dy, "padding-top");

        SETDELTAHEIGHT(system, element, component, -dy, true);

        element.wick_node.setRebuild();

        if (!LINKED) element.wick_node.rebuild();
    }

    return ratio;
}

function SETPADDINGRIGHT(system, element, component, x, LINKED = false) {
    resetPadding(system, element, component);
    setNumericalValue("padding_right", system, element, component, x, setNumericalValue.parent_height);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}


function SETDELTAPADDINGRIGHT(system, element, component, dx, ratio = 0, LINKED = false) {
    let style = component.window.getComputedStyle(element);
    let start_x = parseFloat(style.paddingRight) || 0;
    let width = (parseFloat(style.width) || 0) + start_x;

    if(dx > 0 && start_x + dx > width - 20) return ratio;

    if(start_x+dx > 0){

    if (ratio > 0)
        SETPADDINGRIGHT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETPADDINGRIGHT, start_x, dx, "padding-right");

    SETDELTAWIDTH(system, element, component, -dx, true);

    element.wick_node.setRebuild();
    
    if (!LINKED) element.wick_node.rebuild();
}
    return ratio;
}

function SETPADDINGBOTTOM(system, element, component, x, LINKED = false) {
    resetPadding(system, element, component);
    setNumericalValue("padding_bottom", system, element, component, x, setNumericalValue.parent_height);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}


function SETDELTAPADDINGBOTTOM(system, element, component, dy, ratio = 0, LINKED = false) {
    let style = component.window.getComputedStyle(element);
    let start_y = parseFloat(style.paddingBottom) || 0;
    let height = (parseFloat(style.height) || 0) + start_y;

    if(dy > 0 && dy + start_y > height - 20) return ratio;
    
    if(start_y + dy >= 0){        
        if (ratio > 0)
            SETPADDINGBOTTOM(system, element, component, start_y + dy / ratio, true);
        else
            ratio = getRatio(system, element, component, SETPADDINGBOTTOM, start_y, dy, "padding-bottom");

        SETDELTAHEIGHT(system, element, component, -dy, true);

        element.wick_node.setRebuild();
        if (!LINKED) element.wick_node.rebuild();
    }
    
    return ratio;
}

function RESIZEPADDINGT(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

function RESIZEPADDINGR(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGRIGHT(system, element, component, -dx, 0, true);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

function RESIZEPADDINGL(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGLEFT(system, element, component, dx, 0, true);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

function RESIZEPADDINGB(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGBOTTOM(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

function RESIZEPADDINGTL(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGLEFT(system, element, component, dx, 0, true);
    SETDELTAPADDINGTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

function RESIZEPADDINGTR(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGRIGHT(system, element, component, -dx, 0, true);
    SETDELTAPADDINGTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

function RESIZEPADDINGBL(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGLEFT(system, element, component, dx, 0, true);
    SETDELTAPADDINGBOTTOM(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

function RESIZEPADDINGBR(system, element, component, dx, dy, IS_COMPONENT = false, LINKED = false) {
    if (IS_COMPONENT) return;
    SETDELTAPADDINGRIGHT(system, element, component, -dx, 0, true);
    SETDELTAPADDINGBOTTOM(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
    if (!LINKED) element.wick_node.rebuild();
}

function resetMargin(system, element, component) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    if (css.props.margin) {
        //Convert margin value into 
        css.props.margin = null;
    }
}

function SETMARGINLEFT(system, element, component, x, LINKED = false) {
    resetMargin(system, element, component);
    setNumericalValue("margin_left", system, element, component, x, setNumericalValue.parent_width);
    if (!LINKED) element.wick_node.setRebuild();
}

function SETDELTAMARGINLEFT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["margin-left"]);

    if (ratio > 0)
        SETMARGINLEFT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETMARGINLEFT, start_x, dx, "margin-left");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETMARGINTOP(system, element, component, x, LINKED = false) {
    resetMargin(system, element, component);
    setNumericalValue("margin_top", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}

function SETDELTAMARGINTOP(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["margin-top"]);

    if (ratio > 0)
        SETMARGINTOP(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETMARGINTOP, start_x, dx, "margin-top");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETMARGINRIGHT(system, element, component, x, LINKED = false) {
    resetMargin(system, element, component);
    setNumericalValue("margin_right", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}


function SETDELTAMARGINRIGHT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["margin-right"]);

    if (ratio > 0)
        SETMARGINRIGHT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETMARGINRIGHT, start_x, dx, "margin-right");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETMARGINBOTTOM(system, element, component, x, LINKED = false) {
    resetMargin(system, element, component);
    setNumericalValue("margin_bottom", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}


function SETDELTAMARGINBOTTOM(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["margin-bottom"]);

    if (ratio > 0)
        SETMARGINBOTTOM(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETMARGINBOTTOM, start_x, dx, "margin-bottom");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function RESIZEMARGINT(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEMARGINR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINRIGHT(system, element, component, -dx, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEMARGINL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINLEFT(system, element, component, dx, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEMARGINB(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINBOTTOM(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEMARGINTL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    let cache = CacheFactory(system, element, component);

    if((cache.cssflagsA & 1)){
        SETDELTALEFT(system, element, component, dx, 0, true);
        SETDELTATOP(system, element, component, dy, 0, true);
    }

    SETDELTAMARGINLEFT(system, element, component, -dx, 0, true);
    SETDELTAMARGINTOP(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEMARGINTR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    
    SETDELTAMARGINRIGHT(system, element, component, dx, 0, true);
    SETDELTAMARGINTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEMARGINBL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINLEFT(system, element, component, dx, 0, true);
    SETDELTAMARGINBOTTOM(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEMARGINBR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTAMARGINRIGHT(system, element, component, dx, 0, true);
    SETDELTAMARGINBOTTOM(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function CLEARLEFT(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.left) {
        if (KEEP_UNIQUE) cache.unique.addProp(`left:auto`);
        else css.props.left = "auto";
    }
    if (!LINKED) element.wick_node.setRebuild();
}
//clear top
function CLEARTOP(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.top) {
        if (KEEP_UNIQUE) cache.unique.addProp(`top:auto`);
        else css.props.top = "auto";
    }
    if (!LINKED) element.wick_node.setRebuild();
}
//clear right
function CLEARIGHT(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.right) {
        if (KEEP_UNIQUE) cache.unique.addProp(`right:auto`);
        else css.props.right = "auto";
    }
    if (!LINKED) element.wick_node.setRebuild();
}
//clear bottom
function CLEABOTTOM(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.bottom) {
        if (KEEP_UNIQUE) cache.unique.addProp(`bottom:auto`);
        else css.props.bottom = "auto";
    }
    if (!LINKED) element.wick_node.setRebuild();
}

//clear margin-top
function CLEARMARGINTOP(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.margin_left) {
        if (KEEP_UNIQUE) cache.unique.addProp(`margin-top:0`);
        else css.props.margin_left = 0;
    }
    if (!LINKED) element.wick_node.setRebuild();
}
//clear margin-left
function CLEARMARGINLEFT(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.margin_left) {
        if (KEEP_UNIQUE) cache.unique.addProp(`margin-left:0`);
        else css.props.margin_left = 0;
    }
    if (!LINKED) element.wick_node.setRebuild();
}

//clear margin-right
function CLEARMARGINRIGHT(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    if (css.props.margin_right) {
        if (KEEP_UNIQUE) cache.unique.addProp(`margin-right:0`);
        else css.props.margin_right = 0;
    }
    if (!LINKED) element.wick_node.setRebuild();
}
//clear margin-bottom
//clear padding-left
//clear padding-right
//clear padding-bottom
//clear padding-top
//clear border-left
//clear border-right
//clear border-bottom
//clear border-top

let types$6 = CSSParser.types;

/**
 * Actions for converting position and layout to different forms. 
 */
function TOMARGINLEFT() {}
function TOMARGINRIGHT() {}
function TOMARGINLEFTRIGHT() {}
function TOLEFT() {}
function TORIGHT() {}
function TOLEFTRIGHT() {}
function TOTOP() {}
function TOTOPBOTTOM() {}

function getNativeDisplay(element){
    let display = "block";

    switch(element.tagName){
        case "A":
        case "SPAN":
            display ="inline";
    }

    return display;
}


function setToAbsolute(cache, KEEP_UNIQUE){
    const css = cache.rules;
    if (KEEP_UNIQUE) {
        if (cache.unique.r.props.position) css.props.position = "absolute";
        else cache.unique.addProp("position:absolute");
    } else {
        if (css.props.position) css.props.position = "absolute";
        else cache.unique.addProp("position:absolute");
    }
}

function setToRelative(cache, KEEP_UNIQUE){
    const css = cache.rules;
    if (KEEP_UNIQUE) {
        if (cache.unique.r.props.position) css.props.position = "relative";
        else cache.unique.addProp("position:relative");
    } else {
        if (css.props.position) css.props.position = "relative";
        else cache.unique.addProp("position:relative");
    }
}

/**
 * Convert position to ```absolute```
 */
function TOPOSITIONABSOLUTE(system, element, component, LINKED = false) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
    switch (css.props.position) {
        case "relative":
            /** 
                Need to take margin offset into account when converting to absolute
            */
            let rect = element.getBoundingClientRect();
            let par_prop = component.window.getComputedStyle(element);
            rect = element.getBoundingClientRect();

            let x = rect.x;
            let y = rect.y; //- parseFloat(par_prop["margin-top"]);

            if (css.props.margin) {}

            CLEARMARGINTOP(system, element, component, true);
            CLEARMARGINLEFT(system, element, component, true);

            SETLEFT(system, element, component, x, true);
            SETTOP(system, element, component, y, true);
            
            break;
        case "absolute":
            /*no op*/
            break;
        case "fixed":
            //add parent offset values to current position to keep it predictably in place. 
            break;
        default:
            //Manually add required data
            break;
    }

    setToAbsolute(cache,KEEP_UNIQUE);

    if (!LINKED){
        element.wick_node.setRebuild();
        element.wick_node.rebuild();
    }
}

/**
 * Convert position to ```relative```
 */
function TOPOSITIONRELATIVE(system, element, component) {
    const cache = CacheFactory(system, element, component);
    const css = cache.rules;
    const KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;

    switch (css.props.position) {
        case "relative":
            /*no op*/
            break;
        case "absolute":
            //find the last child element that is positioned relative or static
            //get it's offset top and left + margin left and top
            let node = element.previousSibling;
            let offsetX = 0;
            let offsetY = 0;

            let rect = element.getBoundingClientRect();

            //Get Parent display type 
            let par_prop = component.window.getComputedStyle(element.parentElement);
            let ele_css = component.window.getComputedStyle(element);

            let par_out_dis = par_prop.display;
            let ele_in_dis = css.props.display || getNativeDisplay(element); 
            const IS_INLINE = ele_in_dis.includes("inline");

            if(ele_in_dis == "inline")//force inline-block positioning
                setValue(system, element, component, "display", "block");

            //PARENT positining
            //TODO handle grid positioning;
            //TODO handle flex positioning;
            //TODO handle inline and inline block positioning;

            //Outer positioning

            //Assuming Normal box positioning. 
            while(node){
                if(node instanceof HTMLElement){
                    
                 let rect = node.getBoundingClientRect();
                let style = component.window.getComputedStyle(node);
                if((!style.position || style.position =="relative" || style.position =="static") && style.display !== "none"){

                    if(IS_INLINE)
                        offsetX = node.offsetLeft + parseFloat(style.width) + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth) + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)+ parseFloat(style.marginLeft) + parseFloat(style.marginRight);
                    
                    offsetY = node.offsetTop + parseFloat(style.height) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth) + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)+ parseFloat(style.marginTop) + parseFloat(style.marginBottom);
                    
                    break;
                }
                }
                node = node.previousSibling;
            }
            let rectp = element.parentElement.getBoundingClientRect();

            let innerWidth = rectp.width  - (   (parseFloat(par_prop.borderLeftWidth) || 0) + (parseFloat(par_prop.paddingLeft) || 0)+
                        (parseFloat(par_prop.borderRightWidth) || 0) + (parseFloat(par_prop.paddingRight) || 0));
            
            if(IS_INLINE && (offsetX + rect.width ) >= innerWidth)
                offsetX = 0;

            if(offsetX == 0)
                offsetX += (parseFloat(par_prop.borderLeftWidth) || 0) + (parseFloat(par_prop.paddingLeft) || 0);
            
            if(offsetY == 0)
                offsetY += (parseFloat(par_prop.borderTopWidth) || 0) + (parseFloat(par_prop.paddingTop) || 0);
            

            let x1 =rect.x, y1 =rect.y,  x = x1 - offsetX, y =y1 - offsetY;

            CLEARLEFT(system, element, component, true);
            CLEARTOP(system, element, component, true);
            
            SETMARGINLEFT(system, element, component, x, true);
            SETMARGINTOP(system, element, component, y, true);
            
            setToRelative(cache, KEEP_UNIQUE);
            
            element.wick_node.setRebuild();
            element.wick_node.rebuild();
            rect = element.getBoundingClientRect();
            //enforce Position
            let x2 = rect.x;
            let y2 = rect.y;
            
            if(x2 != x1) 
               SETMARGINLEFT(system, element, component, x - (x2 - x1), true);
            if(y2 != y1)
                SETMARGINTOP(system, element, component, y - (y2 - y1), true); 
            
            break;
        case "fixed":
            //add parent offset values to current position to keep it predictably in place. 
            break;
        default:
            //Manually add required data
            break;
    }

    element.wick_node.setRebuild();
    element.wick_node.rebuild();
}


function CONVERT_TOP(system, element, component, type) {
    let cache = CacheFactory(system, element, component);
    let position = parseFloat(component.window.getComputedStyle(element).top);
    
    switch (type) {
        case "%":
            cache.rules.props.top = new types$6.percentage(1);
            break;
        case "em":
            cache.rules.props.top = new types$6.length(1, "em");
            break;
        case "vh":
            cache.rules.props.top = new types$6.length(1, "vh");
            break;
        case "vw":
            cache.rules.props.top = new types$6.length(1, "vw");
            break;
        case "vmin":
            cache.rules.props.top = new types$6.length(1, "vmin");
            break;
        case "vmax":
            cache.rules.props.top = new types$6.length(1, "vmax");
            break;
        default:
            cache.rules.props.top = new types$6.length(1, 'px');
            break;
    }
    SETTOP(system, element, component, position);

    element.wick_node.setRebuild();
}

function CONVERT_LEFT(system, element, component, type) {
    let cache = CacheFactory(system, element, component);
    let position = parseFloat(component.window.getComputedStyle(element).left);

    switch (type) {
        case "%":
            cache.rules.props.left = new types$6.percentage(1);
            break;
        case "em":
            cache.rules.props.left = new types$6.length(1, "em");
            break;
        case "vh":
            cache.rules.props.left = new types$6.length(1, "vh");
            break;
        case "vw":
            cache.rules.props.left = new types$6.length(1, "vw");
            break;
        case "vmin":
            cache.rules.props.left = new types$6.length(1, "vmin");
            break;
        case "vmax":
            cache.rules.props.left = new types$6.length(1, "vmax");
            break;
        default:
            cache.rules.props.left = new types$6.length(1, 'px');
            break;
    }
    SETLEFT(system, element, component, position);

    element.wick_node.setRebuild();
}

//Converting from unit types
//left
function LEFTTOPX() {}
function LEFTTOEM() {}
function LEFTTOPERCENTAGE() {}
function LEFTTOVH() {}
function LEFTTOVW() {}
//right
//top
//bottom
//margin top
//margin bottom
//margin right
//margin left
//border top
//border bottom
//border left
//border right
//padding top
//padding bottom
//padding right
//padding left


function TOPOSITIONFIXED() {}
function TOPOSITIONSTICKY() { /* NO OP */ }
function TOGGLE_UNIT(system, element, component, horizontal, vertical) {
    // Get CSS information on element and update appropriate records
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    let rect = getFirstPositionedAncestor(element).getBoundingClientRect();
    if (horizontal) {
        switch (cache.move_hori_type) {
            case "left right":
            case "left right margin":
                if (css.props.right instanceof types$6.length) {
                    css.props.right = new types$6.percentage((css.props.right / rect.width) * 100);
                } else {
                    css.props.right = new types$6.length(rect.width * (css.props.right / 100), "px");
                } /** Intentional fall through **/
            case "left":
                if (css.props.left instanceof types$6.length) {
                    css.props.left = new types$6.percentage((css.props.left / rect.width) * 100);
                } else {
                    css.props.left = new types$6.length(rect.width * (css.props.left / 100), "px");
                }
                break;
            case "right":
                if (css.props.right instanceof types$6.length) {
                    css.props.right = new types$6.percentage((css.props.right / rect.width) * 100);
                } else {
                    css.props.right = new types$6.length(rect.width * (css.props.right / 100), "px");
                }
                break;
        }
    }
    element.wick_node.setRebuild();
}

let types$7 = CSSParser.types;

function resetBorder(system, element, component) {
    let cache = CacheFactory(system, element, component);
    let css = cache.rules;
    if (css.props.border) {
        //Convert border value into 
        css.props.border = null;
    }
}

function SETBORDERLEFT(system, element, component, x, LINKED = false) {
    resetBorder(system, element, component);
    setNumericalValue("border_left_width", system, element, component, x, setNumericalValue.parent_width);
    if (!LINKED) element.wick_node.setRebuild();
}

function SETDELTABORDERLEFT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["border-left-width"]);

    if (ratio > 0)
        SETBORDERLEFT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETBORDERLEFT, start_x, dx, "border-left-width");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETBORDERTOP(system, element, component, x, LINKED = false) {
    resetBorder(system, element, component);
    setNumericalValue("border_top_width", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}

function SETDELTABORDERTOP(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["border-top-width"]);

    if (ratio > 0)
        SETBORDERTOP(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETBORDERTOP, start_x, dx, "border-top-width");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETBORDERRIGHT(system, element, component, x, LINKED = false) {
    resetBorder(system, element, component);
    setNumericalValue("border_right_width", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}


function SETDELTABORDERRIGHT(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["border-right-width"]);

    if (ratio > 0)
        SETBORDERRIGHT(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETBORDERRIGHT, start_x, dx, "border-right-width");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function SETBORDERBOTTOM(system, element, component, x, LINKED = false) {
    resetBorder(system, element, component);
    setNumericalValue("border_bottom_width", system, element, component, x, setNumericalValue.parent_height);
    if (!LINKED) element.wick_node.setRebuild();
}


function SETDELTABORDERBOTTOM(system, element, component, dx, ratio = 0, LINKED = false) {
    let start_x = parseFloat(component.window.getComputedStyle(element)["border-bottom-width"]);

    if (ratio > 0)
        SETBORDERBOTTOM(system, element, component, start_x + dx / ratio, true);
    else
        ratio = getRatio(system, element, component, SETBORDERBOTTOM, start_x, dx, "border-bottom-width");

    if (!LINKED) element.wick_node.setRebuild();

    return ratio;
}

function RESIZEBORDERT(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEBORDERR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERRIGHT(system, element, component, -dx, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEBORDERL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERLEFT(system, element, component, dx, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEBORDERB(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERBOTTOM(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEBORDERTL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    let cache = CacheFactory(system, element, component);

    if((cache.cssflagsA & 1)){
        SETDELTALEFT(system, element, component, dx, 0, true);
        SETDELTATOP(system, element, component, dy, 0, true);
    }

    SETDELTABORDERLEFT(system, element, component, -dx, 0, true);
    SETDELTABORDERTOP(system, element, component, -dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEBORDERTR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERRIGHT(system, element, component, dx, 0, true);
    SETDELTABORDERTOP(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEBORDERBL(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERLEFT(system, element, component, dx, 0, true);
    SETDELTABORDERBOTTOM(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function RESIZEBORDERBR(system, element, component, dx, dy, IS_COMPONENT) {
    if (IS_COMPONENT) return;
    SETDELTABORDERRIGHT(system, element, component, dx, 0, true);
    SETDELTABORDERBOTTOM(system, element, component, dy, 0, true);
    element.wick_node.setRebuild();
}

function BORDERRADIUSTL(system, element, component, d){
    setValue(system, element, component, "border_top_left_radius", new types$7.length(d, "px"));
    element.wick_node.setRebuild();
}

function BORDERRADIUSTR(system, element, component, d){
    setValue(system, element, component, "border_top_right_radius", new types$7.length(d, "px"));
    element.wick_node.setRebuild();
}

function BORDERRADIUSBL(system, element, component, d){
    setValue(system, element, component, "border_bottom_left_radius", new types$7.length(d, "px"));
    element.wick_node.setRebuild();
}

function BORDERRADIUSBR(system, element, component, d){
    setValue(system, element, component, "border_bottom_right_radius", new types$7.length(d, "px"));
    element.wick_node.setRebuild();
}

const actions = {
    //UI PANELS
    MOVE_PANEL,
    //
    CacheFactory,
    COMPLETE,
    TEXTEDITOR,
    MOVE,
    CENTER,
    REMOVE_COMPONENT,
    CREATE_COMPONENT,
    CREATE_CSS_DOC,
    TOMARGINLEFT,
    TOMARGINRIGHT,
    TOMARGINLEFTRIGHT,
    TOLEFT,
    TORIGHT,
    TOLEFTRIGHT,
    TOTOP,
    TOTOPBOTTOM,
    TOGGLE_UNIT,
    TOPOSITIONABSOLUTE,
    TOPOSITIONRELATIVE,
    TOPOSITIONFIXED,
    TOPOSITIONSTICKY,
    //position
    SETLEFT,
    SETDELTALEFT,
    SETTOP,
    SETDELTATOP,
    SETRIGHT,
    SETDELTARIGHT,
    SETBOTTOM,
    SETDELTABOTTOM,
    RESIZETL,
    RESIZETR,
    RESIZEBL,
    RESIZEBR,
    RESIZET,
    RESIZER,
    RESIZEL,
    RESIZEB,
    //Width Height
    SETWIDTH,
    SETHEIGHT,
    SETDELTAWIDTH,
    SETDELTAHEIGHT,
    //Border
    //Margin
    SETMARGINLEFT,
    SETDELTAMARGINLEFT,
    SETMARGINTOP,
    SETDELTAMARGINTOP,
    SETMARGINRIGHT,
    SETDELTAMARGINRIGHT,
    SETMARGINBOTTOM,
    SETDELTAMARGINBOTTOM,
    RESIZEMARGINTL,
    RESIZEMARGINTR,
    RESIZEMARGINBL,
    RESIZEMARGINBR,
    RESIZEMARGINT,
    RESIZEMARGINR,
    RESIZEMARGINL,
    RESIZEMARGINB,
    //Padding
    SETPADDINGLEFT,
    SETDELTAPADDINGLEFT,
    SETPADDINGTOP,
    SETDELTAPADDINGTOP,
    SETPADDINGRIGHT,
    SETDELTAPADDINGRIGHT,
    SETPADDINGBOTTOM,
    SETDELTAPADDINGBOTTOM,
    RESIZEPADDINGTL,
    RESIZEPADDINGTR,
    RESIZEPADDINGBL,
    RESIZEPADDINGBR,
    RESIZEPADDINGT,
    RESIZEPADDINGR,
    RESIZEPADDINGL,
    RESIZEPADDINGB,
    //Border
    SETBORDERLEFT,
    SETDELTABORDERLEFT,
    SETBORDERTOP,
    SETDELTABORDERTOP,
    SETBORDERRIGHT,
    SETDELTABORDERRIGHT,
    SETBORDERBOTTOM,
    SETDELTABORDERBOTTOM,
    RESIZEBORDERT,
    RESIZEBORDERR,
    RESIZEBORDERL,
    RESIZEBORDERB,
    RESIZEBORDERTL,
    RESIZEBORDERTR,
    RESIZEBORDERBL,
    RESIZEBORDERBR,
    BORDERRADIUSTL,
    BORDERRADIUSTR,
    BORDERRADIUSBL,
    BORDERRADIUSBR,
    //color
    SETBACKGROUNDCOLOR,
    SETCOLOR,
    //convert
    CONVERT_LEFT,
    CONVERT_TOP,
    //History
    UNDO,
    REDO
};

//import wick from "@candlefw/wick";
/**
 * This module is responsible for storing, updating, and caching compents. 
 * In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
 * Any associated stylesheets are managed through this componnent. 
 */
class UIComponent extends Component {

    constructor(system, name) {

        super(system);

        this.iframe.onload = (e) => {

            this.mountListeners();

            let children = Array.prototype.slice.apply(this.data.children);

            for (let i = 0; i < children.length; i++) {
                e.target.contentDocument.body.appendChild(children[i]);
            }

            //e.target.contentWindow.wick = wick;

            this.window = e.target.contentWindow;

            this.local_css.forEach((css) => {
                let style = document.createElement("style");
                style.innerText = css + "";
                this.iframe.contentDocument.head.appendChild(style);
            });

            this.iframe.onload = null;
        };

        //frame for fancy styling
        this.iframe.classList.add("flame_ui_component");

        this.pkg = null;

        this.name = name;

        this.system = system;

        this.width = 300;
        this.height = 500;
        this.x = 0;
        this.y = 0;

        this.LOADED = false;
    }

    mountListeners() {
        this.style_frame.addEventListener("mousedown", e => {
            this.system.ui.ui_target = { element: null, component: this, action: this.system.actions.MOVE_PANEL };
            this.system.ui.handlePointerDownEvent(e, e.pageX, e.pageY);
        });
        this.iframe.contentWindow.addEventListener("mousemove", e => this.system.ui.handlePointerMoveEvent(e, e.pageX + this.x + 3, e.pageY + this.y + 3));
        this.iframe.contentWindow.addEventListener("mouseup", e => this.system.ui.handlePointerEndEvent(e, e.pageX + this.x + 3, e.pageY + this.y + 3));
    }

    documentReady(pkg) {
        if (this.LOADED) {
            return;
        }
        this.LOADED = true;

        this.mgr = pkg.mount(this.data, this.system.project.flame_data);

        let src = this.mgr.sources[0].ast;

        if (src.statics.menu) {
            switch (src.statics.menu) {
                case "main":
                    this.system.ui.addToMenu("main", this.name, this.mgr.sources[0].badges.icon, this);
                    break;
            }
        }

        let css = pkg.skeletons[0].tree.css;
        if (css) {
            css.forEach(css => {
                this.local_css.push(css);
            });
        }

        this.mgr.upImport = (prop_name, data, meta) => {
            switch (prop_name) {
                case "load":
                    this.system.ui.mountComponent(this);
                    break;
                case "width":
                    this.width = data;
                    break;
                case "height":
                    this.height = data;
                    break;
            }
        };
    }

    set(data) {
        this.mgr.update({
            target: data
        });
    }

    load(doc) {
        doc.bind(this);
    }

    mount(element) {
        if(this.element.parentNode != element)
            element.appendChild(this.element);
    }

    unmount() {};
}

class LineBox {
    get l() {
        return this.rect.x + this.component.x + 4;
    }

    get t() {
        return this.rect.y + this.component.y + 4;
    }

    get b() {
        return this.rect.y + this.rect.height + this.component.y + 4;
    }

    get r() {
        return this.rect.x + this.rect.width + this.component.x + 4;
    }
}

class ElementLineBox extends LineBox {
    constructor(element, component) {
        super();
        this.rect = element.getBoundingClientRect();
        this.component = component;
    }
}

class ComponentLineBox extends LineBox {
    constructor(component) {
    	super();
        this.component = component;
    }

    get l() {
        return this.component.x;
    }

    get t() {
        return this.component.y;
    }

    get b() {
        return this.component.height + this.component.y;
    }

    get r() {
        return this.component.width + this.component.x;
    }
}



function CreateBoxes(ele, c, LineMachine, target) {

    LineMachine.boxes.push(new ElementLineBox(ele, c));

    let children = ele.children;
    for (let i = 0; i < children.length; i++) {
        if (target == children[i]) continue;
        CreateBoxes(children[i], c, LineMachine, target);
    }
}

function CreateComponentBoxes(c, LineMachine, target) {
    if (c == target) return;
    LineMachine.boxes.push(new ComponentLineBox(c));
}

class LineMachine {
    constructor() {
        this.boxes = [];
        this.tolerance = 10;

        this.activex = { id: -1, ot: 0, tt: 0 };
        this.activey = { id: -1, ot: 0, tt: 0 };
    }

    setPotentialBoxes(element, component, components) {
        this.boxes.length = 0;

        if (!element) {
            components.forEach(c => CreateComponentBoxes(c, this, component));
        } else {
            //get tree from component and create boxes from all elements inside the component. 
            let tree = component.window.document.body;

            let ele = tree;

            CreateBoxes(ele, component, this, element);
        }

    }

    getSuggestedLine(box, dx, dy) {

        if (!box) return { dx, dy };

        let mx = this.tolerance;
        let my = this.tolerance;
        let x_set = false;
        let y_set = false;
        const l = box.l;
        const r = box.r;

        const LO = (l - r == 0);

        const t = box.t;
        const b = box.b;
        const ch = (l + r) / 2;
        const cv = (t + b) / 2;
        const tol = this.tolerance;


        for (let i = 0; i < this.boxes.length; i++) {
            let box = this.boxes[i];

            //Make sure the ranges overlap

            //Vertical
            if (!x_set && l <= (box.r + tol + 1) && r >= (box.l - tol - 1)) {
                //There is overlap; find the best alignment
                let c = (box.l + box.r) * 0.5;
                let tol = Math.abs(mx);
                let array = [
                    //left
                    l - box.l, l - box.r, l - c,
                    //right
                    r - box.l, r - box.r, r - c,
                    //center
                    ch - box.l, ch - box.r, ch - c
                ];

                let length = LO ? 3 : 9;

                for (let j = 0; j < length; j++)
                    if (Math.abs(array[j]) < tol) {
                        mx = array[j];
                        this.activex.id = i;
                        this.activex.tt = (j % 3);
                        this.activex.ot = (j / 3) | 0;
                        //x_set = true;
                        //break;
                    }
            }

            //Horizontal
            if (!y_set && t < (box.b + tol + 1) && b > (box.t - tol - 1)) {
                //There is overlap; find the best alignment
                let c = (box.t + box.b) * 0.5;
                let tol = Math.abs(my);
                let array = [
                    /*top*/
                    t - box.t, t - box.b, t - c,
                    /*bottom*/
                    b - box.t, b - box.b, b - c,
                    /*center*/
                    cv - box.t, cv - box.b, cv - c
                ];
                for (let j = 0; j < 9; j++)
                    if (Math.abs(array[j]) < tol) {
                        my = array[j];
                        this.activey.id = i;
                        this.activey.tt = (j % 3);
                        this.activey.ot = (j / 3) | 0;
                        //y_set = true;
                        break;
                    }
            }

            if (x_set && y_set) break;
        }

        if (Math.abs(mx) < tol && Math.abs(dx) < tol)
            dx = mx;
        else
            this.activex.id = -1;

        if (Math.abs(my) < tol && Math.abs(dy) < tol)
            dy = my;
        else
            this.activey.id = -1;

        return { dx, dy };
    }

    render(ctx, transform, boxc) {

        if (!boxc || this.boxes.length == 0) return;

        ctx.save();
        transform.setCTX(ctx);

        if (this.activex.id > -1) {
            //0 = l, 1 = r, 2 = c 
            ctx.strokeStyle = "red";
            let box = this.boxes[this.activex.id];
            let x = [box.l, box.r, (box.r + box.l) / 2][this.activex.tt];
            let y1 = [box.t, box.t, (box.t + box.b) / 2][this.activex.tt];
            let y2 = [boxc.t, boxc.t, (boxc.t + boxc.b) / 2][this.activex.ot];
            ctx.beginPath();
            ctx.moveTo(x, y1);
            ctx.lineTo(x, y2);
            ctx.stroke();
        }

        if (this.activey.id > -1) {
            //0 = t, 1 = b, 2 = c 
            ctx.strokeStyle = "green";
            let box = this.boxes[this.activey.id];
            let y = [box.t, box.b, (box.t + box.b) / 2][this.activey.tt];
            let x1 = [box.l, box.l, (box.r + box.l) / 2][this.activey.tt];
            let x2 = [boxc.l, boxc.l, (boxc.r + boxc.l) / 2][this.activey.ot];
            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.stroke();
        }

        ctx.restore();
    }
}

const paper = require("paper");
const Point = paper.Point;
const Size = paper.Size;
const Path$1 = paper.Path;

/**
 * @brief Provides interface tools for manipulating SVG elements
 */
class SVGManager {
    constructor(system) {
        this.system = system;

        this.target = null;

        this.canvas = document.createElement("canvas");
        this.canvas.style.position = "absolute";
        paper.setup(this.canvas);
        this.proj = paper.project;
        let point = new Point(0, 0);

        this.selection = null;

        let dx = 0;
        let dy = 0;
        let POINTER_DOWN = false;
        let path$$1;


        this.canvas.addEventListener("pointerdown", (e) => {
            let x = e.offsetX - 20;
            let y = e.offsetY - 20;
            dx = x;
            dy = y;
            point.x = x;
            point.y = y;

            if (e.button == 0) {
                if (!path$$1) {
                    path$$1 = new Path$1();
                    path$$1.strokeColor = "black";
                    path$$1.fullySelected = true;
                } else {
                    path$$1.add(point);
                }
            }else{
            	path$$1.closePath();
            }
            this.proj.view.update();


            return;
            POINTER_DOWN = true;

            this.selection = this.proj.hitTest(point, { fill: true, stroke: true });

            if (this.selection) {
                this.selection.item.selected = true;
                this.proj.view.update();
            }

        });

        this.canvas.addEventListener("pointermove", (e) => {
            if (!POINTER_DOWN) return;
            let x = dx - e.offsetX;
            let y = dy - e.offsetY;

            dx = e.offsetX;
            dy = e.offsetY;
            let selection = this.selection;
            if (selection) {
                let item = selection.item;
                switch (selection.type) {
                    case "fill":
                    case "stroke":
                        item.translate(new Point(-x, -y));
                        break;
                }

                this.proj.view.update();
            }
        });

        this.canvas.addEventListener("pointerup", (e) => {
            POINTER_DOWN = false;
            this.export();
        });


        this.ctx = this.canvas.getContext("2d");
        this.elements = [];
    }

    export () {
        paper.project.view.viewSize.set(this.width, this.height);
        paper.project.view.translate(new Point(-20, -20));
        let output = paper.project.exportSVG({ asString: true });

        this.wick_node.reparse(output).then(n => this.wick_node = n);
        paper.project.view.translate(new Point(20, 20));
        paper.project.view.viewSize.set(this.width + 40, this.height + 40);
    }

    mount(ui, target_element, component, x, y) {

        while (target_element && target_element.tagName.toUpperCase() !== "SVG") 
            target_element = target_element.parentElement;
        
        if (!target_element) return;

        this.wick_node = target_element.wick_node;

        //parse svg elements and build objects from them. 
        let children = target_element.children;


        let rect = target_element.getBoundingClientRect();
        x = component.x + rect.x + 4 - 20;
        y = component.y + rect.y + 4 - 20;
        this.width = rect.width;
        this.height = rect.width;
        paper.project.view.viewSize.set(rect.width + 40, rect.height + 40);
        paper.project.view.translate(new Point(20, 20));
        paper.project.importSVG(target_element.outerHTML);

        this.canvas.style.left = `${x}px`;
        this.canvas.style.top = `${y}px`;

        ui.view_element.appendChild(this.canvas);
    }
}

const pi2 = Math.PI * 2;

function gripPoint(ctx, x, y, r) {
    ctx.beginPath();
    //ctx.moveTo(x,y); 
    ctx.arc(x, y, r, 0, pi2);
    ctx.fill();
    ctx.stroke();
}

class BoxElement {
    constructor() {
        this._ml = 0;
        this._mr = 0;
        this._mt = 0;
        this._mb = 0;

        this._pl = 0;
        this._pr = 0;
        this._pt = 0;
        this._pb = 0;

        this.bl = 0;
        this.br = 0;
        this.bt = 0;
        this.bb = 0;

        this.posl = 0;
        this.posr = 0;
        this.post = 0;
        this.posb = 0;

        this.x = 0; //left of border box
        this.y = 0; //top of border box
        this.w = 0; //width of border box
        this.h = 0; //height of border box
        this.br = 0;
        this.IS_COMPONENT = false;

        this.target = {
            IS_COMPONENT: false,
            component: null,
            element: null,
            action: null,
            box: { l: 0, r: 0, t: 0, b: 0 }
        };
    }

    setBox() {

        const box = (this.target.box) ? this.target.box : { l: 0, r: 0, t: 0, b: 0 };
        this.target.box = box;
        switch (this.target.action) {
            case actions.MOVE:
                box.l = this.cbl;
                box.r = this.cbr;
                box.b = this.cbb;
                box.t = this.cbt;
                break;
            case actions.RESIZETL:
                box.l = this.cbl;
                box.r = this.cbl;
                box.b = this.cbt;
                box.t = this.cbt;
                break;
            case actions.RESIZEBL:
                box.l = this.cbl;
                box.r = this.cbl;
                box.b = this.cbb;
                box.t = this.cbb;
                break;
            case actions.RESIZETR:
                box.l = this.cbr;
                box.r = this.cbr;
                box.b = this.cbt;
                box.t = this.cbt;
                break;
            case actions.RESIZEBR:
                box.l = this.cbr;
                box.r = this.cbr;
                box.b = this.cbb;
                box.t = this.cbb;
                break;
            case actions.RESIZEMARGINTL:
                box.l = this.ml;
                box.r = this.ml;
                box.b = this.mt;
                box.t = this.mt;
                break;
            case actions.RESIZEMARGINBL:
                box.l = this.ml;
                box.r = this.ml;
                box.b = this.mb;
                box.t = this.mb;
                break;
            case actions.RESIZEMARGINTR:
                box.l = this.mr;
                box.r = this.mr;
                box.b = this.mt;
                box.t = this.mt;
                break;
            case actions.RESIZEMARGINBR:
                box.l = this.mr;
                box.r = this.mr;
                box.b = this.mb;
                box.t = this.mb;
                break;
            case actions.RESIZEPADDINGTL:
                break;
            case actions.RESIZEPADDINGBL:
                break;
            case actions.RESIZEPADDINGTR:
                break;
            case actions.RESIZEPADDINGBR:
                break;
        }
    }

    setDimensions(IS_COMPONENT = this.IS_COMPONENT) {
        let component = this.target.component;

        if (IS_COMPONENT) {
            this.IS_COMPONENT = true;
            this.x = component.x + 4;
            this.y = component.y + 4;
            this.w = component.width;
            this.h = component.height;
        } else {
            let rect = this.target.element.getBoundingClientRect();
            this.x = rect.left + component.x + 4;
            this.y = rect.top + component.y + 4;
            this.w = rect.width;
            this.h = rect.height;
        }

        let par_prop = component.window.getComputedStyle(this.target.element);

        //margin
        this._ml = parseFloat(par_prop.getPropertyValue("margin-left"));
        this._mr = parseFloat(par_prop.getPropertyValue("margin-right"));
        this._mt = parseFloat(par_prop.getPropertyValue("margin-top"));
        this._mb = parseFloat(par_prop.getPropertyValue("margin-bottom"));

        //border
        this.bl = parseFloat(par_prop.getPropertyValue("border-left"));
        this.br = parseFloat(par_prop.getPropertyValue("border-right"));
        this.bt = parseFloat(par_prop.getPropertyValue("border-top"));
        this.bb = parseFloat(par_prop.getPropertyValue("border-bottom"));

        //padding
        this._pl = parseFloat(par_prop.getPropertyValue("padding-left"));
        this._pr = parseFloat(par_prop.getPropertyValue("padding-right"));
        this._pt = parseFloat(par_prop.getPropertyValue("padding-top"));
        this._pb = parseFloat(par_prop.getPropertyValue("padding-bottom"));

        this.posl = parseFloat(par_prop.getPropertyValue("left"));
        this.posr = parseFloat(par_prop.getPropertyValue("right"));
        this.post = parseFloat(par_prop.getPropertyValue("top"));
        this.posb = parseFloat(par_prop.getPropertyValue("bottom"));

        this.setBox();
    }

    //Margin box
    get ml() { return this.x - this._ml - this.posl; }
    get mt() { return this.y - this._mt - this.post; }
    get mr() { return this.w + this._mr + this._ml + this.ml; }
    get mb() { return this.h + this._mb + this._mt + this.mt; }

    //Padding box
    get pl() { return this.x + this._pl + this.bl; }
    get pt() { return this.y + this._pt + this.bt; }
    get pr() { return this.w - this._pr - this._pl - this.br - this.bl + this.pl; }
    get pb() { return this.h - this._pb - this._pt - this.bb - this.bt + this.pt; }

    //Content box
    get cbl() { return this.x + this.bl; }
    get cbt() { return this.y + this.bt; }
    get cbr() { return this.w - this.br - this.bl + this.cbl; }
    get cbb() { return this.h - this.bb - this.bt + this.cbt; }

    render(ctx, scale) {
        this.setDimensions();

        ctx.strokeStyle = "rgb(0,0,0)";
        ctx.lineWidth = (1 / scale) * 0.95;

        //Border box
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        //Margin box
        let ml = this.ml;
        let mt = this.mt;
        let mr = this.mr;
        let mb = this.mb;

        //Padding box
        let pl = this.pl;
        let pt = this.pt;
        let pr = this.pr;
        let pb = this.pb;

        //Content box
        let cbl = this.cbl;
        let cbt = this.cbt;
        let cbr = this.cbr;
        let cbb = this.cbb;


        if (!this.IS_COMPONENT) {
            ctx.strokeRect(ml, mt, mr - ml, mb - mt);
            ctx.strokeRect(pl, pt, pr - pl, pb - pt);
        }
        
        ctx.strokeRect(cbl, cbt, cbr - cbl, cbb - cbt);

        //Render Markers

        //Box \ Border Markers 
        ctx.fillStyle = "rgb(0,100,200)";
        ctx.strokeStyle = "rgb(250,250,250)";
        ctx.lineWidth = 1 / scale;
        let r = 4 / scale;

        gripPoint(ctx, cbl, cbt, r);
        gripPoint(ctx, cbr, cbt, r);
        gripPoint(ctx, cbl, cbb, r);
        gripPoint(ctx, cbr, cbb, r);

        if (!this.IS_COMPONENT) {

            //Margin Markers
            gripPoint(ctx, ml, mt, r);
            gripPoint(ctx, mr, mt, r);
            gripPoint(ctx, ml, mb, r);
            gripPoint(ctx, mr, mb, r);

            //Padding Markers
            gripPoint(ctx, pl, pt, r);
            gripPoint(ctx, pr, pt, r);
            gripPoint(ctx, pl, pb, r);
            gripPoint(ctx, pr, pb, r);
        }
    }

    setTarget(element, component, IS_COMPONENT) {
        this.target.element = element;
        this.target.component = component;
        this.target.IS_COMPONENT = IS_COMPONENT;
    }
}

class CanvasManager {
    constructor() {
        //Canvas setup.
        this.element = document.createElement("canvas");
        this.element.classList.add("flame_ui_canvas");
        this.ctx = this.element.getContext("2d");
    }

    setIframeTarget(element, component, IS_COMPONENT = false) {
        let box = new BoxElement(element);
        box.setTarget(element, component, IS_COMPONENT);
        box.setDimensions(IS_COMPONENT);
        this.widget = box;
    }

    render(transform) {
        this.element.width = this.element.width;
        if (this.widget) {
            this.ctx.save();
            transform.setCTX(this.ctx);
            this.widget.render(this.ctx, transform.scale);
            this.ctx.restore();
        }
    }

    pointerDown(e, x, y, transform) {
        let widget = this.widget;
        if (widget) {

            widget.target.action = null;

            let tr = 5 / transform.scale; //touch radius

            //Margin box
            let ml = widget.ml; // widget.x - widget.ml - widget.posl;
            let mt = widget.mt; // widget.y - widget.mt - widget.post;
            let mr = widget.mr; // widget.w + widget.mr + widget.ml + ml;
            let mb = widget.mb; // widget.h + widget.mb + widget.mt + mt;

            //Padding box
            let pl = widget.pl; // widget.x + widget.pl + widget.bl;
            let pt = widget.pt; // widget.y + widget.pt + widget.bt;
            let pr = widget.pr; // widget.w - widget.pr - widget.pl - widget.br - widget.bl + pl;
            let pb = widget.pb; // widget.h - widget.pb - widget.pt - widget.bb - widget.bt + pt;

            //Content box
            let cbl = widget.cbl; // widget.x + widget.bl;
            let cbt = widget.cbt; // widget.y + widget.bt;
            let cbr = widget.cbr; // widget.w - widget.br - widget.bl + cbl;
            let cbb = widget.cbb; // widget.h - widget.bb - widget.bt + cbt;
            //Widget size
            while (true) {

                //Content box first / Can double as border
                if (x >= cbl - tr && x <= cbr + tr) {
                    if (y >= cbt - tr && y <= cbb + tr) {
                        if (x <= cbl + tr) {
                            if (y <= cbt + tr) {
                                this.widget.target.action = actions.RESIZETL;
                                break;
                            } else if (y >= cbb - tr) {
                                this.widget.target.action = actions.RESIZEBL;
                                break;
                            }
                        } else if (x >= cbr - tr) {
                            if (y <= cbt + tr) {
                                this.widget.target.action = actions.RESIZETR;
                                break;
                            } else if (y >= cbb - tr) {
                                this.widget.target.action = actions.RESIZEBR;
                                break;
                            }
                        } else {
                            widget.target.action = actions.MOVE;
                        }
                    }
                }

                //Margin box
                if (x >= ml - tr && x <= mr + tr) {
                    if (y >= mt - tr && y <= mb + tr) {
                        if (x <= ml + tr) {
                            if (y <= mt + tr) {
                                this.widget.target.action = actions.RESIZEMARGINTL;
                                break;
                            } else if (y >= mb - tr) {
                                this.widget.target.action = actions.RESIZEMARGINBL;
                                break;
                            }
                        } else if (x >= mr - tr) {
                            if (y <= mt + tr) {
                                this.widget.target.action = actions.RESIZEMARGINTR;
                                break;
                            } else if (y >= mb - tr) {
                                this.widget.target.action = actions.RESIZEMARGINBR;
                                break;
                            }
                        }
                    }
                }

                //Padding box
                if (x >= pl - tr && x <= pr + tr) {
                    if (y >= pt - tr && y <= pb + tr) {
                        if (x <= pl + tr) {
                            if (y <= pt + tr) {
                                this.widget.target.action = actions.RESIZEPADDINGTL;
                                break;
                            } else if (y >= pb - tr) {
                                this.widget.target.action = actions.RESIZEPADDINGBL;
                                break;
                            }
                        } else if (x >= pr - tr) {
                            if (y <= pt + tr) {
                                this.widget.target.action = actions.RESIZEPADDINGTR;
                                break;
                            } else if (y >= pb - tr) {
                                this.widget.target.action = actions.RESIZEPADDINGBR;
                                break;
                            }
                        }
                    }
                }
                break;
            }
            if (widget.target.action) {

                widget.setBox();
                return widget.target;
            }
            /*
                        if (dx > 0 && dx < w)
                            if (dy > 0 && dy < h) {
                                //Check corners for action;
                                this.widget.target.action = actions.MOVE;

                                if (dx <= ws) {
                                    if (dy <= ws)
                                        this.widget.target.action = actions.SCALETL;
                                    else if (dy >= h - ws)
                                        this.widget.target.action = actions.SCALEBL;
                                }

                                if (dx >= w - ws) {
                                    if (dy <= ws)
                                        this.widget.target.action = actions.SCALETR;
                                    else if (dy >= h - ws)
                                        this.widget.target.action = actions.SCALEBR;
                                }

                                return this.widget.target;
                            }
                            */
        }
        return false;
    }

    resize(transform) {
        this.element.width = window.innerWidth;
        this.element.height = window.innerHeight;
        this.render(transform);
    }

    clearTargets(transform) {
        this.widget = null;
        this.render(transform);
    }
}

//*********** Actions ******************

var DD_Candidate = false;
/**
 * @brief Handles user input and rendering of UI elements
 * 
 * @param  [HTMLElement] Element to map UI components to.
 */
class UI_Manager {

    constructor(UIHTMLElement, ViewElement, system) {

        this.system = system;


        this.element = UIHTMLElement;
        this.view_element = ViewElement;
        this.ACTIVE_POINTER_INPUT = false;
        this.origin_x = 0;
        this.origin_y = 0;
        this.transform = new(CSSParser.types.transform2D)();
        this.last_action = Date.now();
        this.ui_target = null;

        /* 
            UI components serve as UX/UI handlers for all tools that comprise flame.
            These can be modified by the user through project system to create and use custom UI
            elements. 
        */
        this.components = [];
        this.ui_components = new Map();
        this.loadedComponents = [];

        //Menu array
        this.main_menu = document.createElement("div");
        this.main_menu.id = "main_menu";
        this.main_menu.map = new Map();
        this.main_menu.setAttribute("show", "false");
        this.element.appendChild(this.main_menu);

        //Array of components
        this.UI_MOVE = false;

        //CanvasManager provides onscreen transform visual widgets for components and elements.
        this.canvas = new CanvasManager();
        this.canvas.resize(this.transform);
        this.element.appendChild(this.canvas.element);

        /** SYSTEMS *******************************/
        this.svg_manager = new SVGManager(system);
        this.line_machine = new LineMachine();

        // **************** Eventing *****************
        window.addEventListener("resize", e => this.canvas.resize(this.transform));

        // // *********** Mouse *********************
        window.addEventListener("mouseover", e => {});
        window.addEventListener("wheel", e => this.handleScroll(e));

        // // *********** Pointer *********************
        window.addEventListener("pointerdown", e => {
            let x = this.transform.getLocalX(e.pageX);
            let y = this.transform.getLocalY(e.pageY);
            if (this.setTarget(e, null, x, y, false)) {
                this.origin_x = x;
                this.origin_y = y;
                this.ACTIVE_POINTER_INPUT = true;
            } else
                this.handlePointerDownEvent(e, undefined, undefined, !!1);
        });
        window.addEventListener("pointermove", e => this.handlePointerMoveEvent(e));
        window.addEventListener("pointerup", e => this.handlePointerEndEvent(e));

        // // *********** Drag 'n Drop *********************
        document.body.addEventListener("drop", e => this.handleDocumentDrop(e));
        document.body.addEventListener("dragover", e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        });
        document.body.addEventListener("dragstart", e => {});
    }

    reset() {
        const system = this.system;

        while (this.components[0])
            actions.REMOVE_COMPONENT(system, this.components[0]);
    }

    removeComponent(component) {
        for (let i = 0, l = this.components.length; i < l; i++)
            if (component === this.components[i]) {
                this.components.splice(i, 1);
                break;
            }
    }

    mountComponent(component) {
        component.mount(this.element);
        this.loadedComponents.push(component);
        component.set(this.target);
    }

    addToMenu(menu_name, item_name, icon_element, menu) {
        if (menu_name == "main") {
            let element = icon_element.cloneNode(true);
            element.style.display = "";
            element.onclick = () => {
                this.mountComponent(menu);
            };
            this.main_menu.appendChild(element);
            this.main_menu.map.set(name, icon_element);
        }
    }

    addComponent(wick_component_file_path) {

        let doc = this.system.docs.get(this.system.docs.loadFile(wick_component_file_path));

        if (doc) {
            let component = new UIComponent(this.system, doc.name);
            component.load(doc);
            this.ui_components.set(doc.name, component);
        }
    }

    setTarget(e, component, x, y, SET_MENU = true) {
        let target = null;

        if (target = this.canvas.pointerDown(e, x, y, this.transform)) {

            this.target = target;

            if (SET_MENU) this.main_menu.setAttribute("show", "true");

            this.loadedComponents.forEach(c => c.set(this.target));

            if (component) {
                if (this.target.IS_COMPONENT) {
                    this.line_machine.setPotentialBoxes(null, component, this.components);
                } else {
                    this.line_machine.setPotentialBoxes(this.target.element, component, this.components);
                }
            }

            return true;
        }


        if (SET_MENU) this.main_menu.setAttribute("show", "false");
        return false;

    }

    integrateIframe(iframe, component) {

        iframe.contentWindow.addEventListener("wheel", e => {
            let x = ((component.x + 4 + e.pageX) * this.transform.scale) + this.transform.px;
            let y = ((component.y + 4 + e.pageY) * this.transform.scale) + this.transform.py;
            this.handleScroll(e, x, y);
        });

        iframe.contentWindow.addEventListener("mousedown", e => {

            let x = e.pageX + 4 + component.x;
            let y = e.pageY + 4 + component.y;
            this.last_action = Date.now();
            this.handlePointerDownEvent(e, x, y);

            if (e.button == 0) {
                if (!this.setTarget(e, component, x, y)) {
                    if (e.target.tagName == "BODY") {
                        this.canvas.setIframeTarget(component.element, component, true);
                        this.render();
                        this.setTarget(e, component, x, y);
                    } else {
                        this.canvas.setIframeTarget(e.target, component);
                        this.render();
                        this.setTarget(e, component, x, y);
                    }
                }
            }


            return false;
        });

        iframe.contentWindow.addEventListener("mousemove", e => {
            let x = e.pageX + 4 + component.x;
            let y = e.pageY + 4 + component.y;
            this.handlePointerMoveEvent(e, x, y);
            return false;
        });

        iframe.contentWindow.addEventListener("mouseup", e => {
            let t = Date.now();
            let x = e.pageX + 4 + component.x;
            let y = e.pageY + 4 + component.y;

            if (t - this.last_action < 200) {
                if (Date.now() - DD_Candidate < 200) {
                    DD_Candidate = 0;
                    this.handleContextMenu(e, x, y, component);
                } else {
                    if (e.target.tagName == "BODY") {
                        this.canvas.setIframeTarget(component.element, component, true);
                        this.render();
                        this.setTarget(e, component, x, y);
                    } else if (this.setTarget(e, component, x, y) && this.target.action == actions.MOVE) {
                        this.canvas.setIframeTarget(e.target, component);
                        this.render();
                        this.setTarget(e, component, x, y);
                    }
                    DD_Candidate = Date.now();
                }
            }
            this.handlePointerEndEvent(e);
        });

        this.components.push(component);
    }

    handlePointerDownEvent(e, x = this.transform.getLocalX(e.pageX), y = this.transform.getLocalY(e.pageY), FROM_MAIN = false) {

        if (e.button == 1) {
            if (isNaN(x) || isNaN(y))
                debugger;

            this.origin_x = x;
            this.origin_y = y;
            this.ACTIVE_POINTER_INPUT = true;
            this.UI_MOVE = true;
            return true;
        }

        if (FROM_MAIN) return false;

        this.origin_x = x;
        this.origin_y = y;
        this.ACTIVE_POINTER_INPUT = true;

        if (e.target !== document.body) 
            return;

        this.canvas.clearTargets(this.transform);
        this.main_menu.setAttribute("show", "false");

        return false;
    }

    handlePointerMoveEvent(e, x, y) {

        if (!this.ACTIVE_POINTER_INPUT) return;

        if (this.UI_MOVE) {
            x = (typeof(x) == "number") ? x : this.transform.getLocalX(e.pageX);
            y = (typeof(y) == "number") ? y : this.transform.getLocalY(e.pageY);
            const diffx = this.origin_x - x;
            const diffy = this.origin_y - y;
            this.transform.px -= diffx * this.transform.sx;
            this.transform.py -= diffy * this.transform.sy;
            this.origin_x = x + diffx;
            this.origin_y = y + diffy;
            this.render();
            this.view_element.style.transform = this.transform;
            return;
        } else if (this.ui_target) {
            const diffx = this.origin_x - ((typeof(x) == "number") ? x : e.pageX);
            const diffy = this.origin_y - ((typeof(y) == "number") ? y : e.pageY);
            this.origin_x -= diffx;
            this.origin_y -= diffy;
            if (this.ui_target.action) this.ui_target.action(this.system, this.ui_target.component, diffx, diffy);
        } else if (this.target) {
            const diffx = this.origin_x - ((typeof(x) == "number") ? x : this.transform.getLocalX(e.pageX));
            const diffy = this.origin_y - ((typeof(y) == "number") ? y : this.transform.getLocalY(e.pageY));
            const { dx, dy } = { dx: diffx, dy: diffy };//this.line_machine.getSuggestedLine(this.target.box, diffx, diffy);
            this.origin_x -= dx;
            this.origin_y -= dy;
            //if(this.target.box.l == this.target.box.r && Math.abs(diffx) > 1 && Math.abs(dx) < 0.0001) debugger
            if (this.target.action) this.target.action(this.system, this.target.element, this.target.component, -dx, -dy, this.target.IS_COMPONENT);
            this.render();
        }
    }

    handlePointerEndEvent(e) {

        this.UI_MOVE = false;
        this.ACTIVE_POINTER_INPUT = false;

        if (this.ui_target)
            return (this.ui_target = null);

        if (this.target)
            actions.COMPLETE(this.system, this.target.element, this.target.component);
    }



    handleDocumentDrop(e) {
        e.preventDefault();

        Array.prototype.forEach.call(e.dataTransfer.files, 
            f => this.mountDocument(
                f, 
                this.transform.getLocalX(e.clientX), 
                this.transform.getLocalY(e.clientY))
        );
    }

    handleContextMenu(e, x, y, component = null) {
        //Load text editor in the bar.

        switch (e.target.tagName.toUpperCase()) {
            case "SVG":
            case "RECT":
            case "PATH":
                this.svg_manager.mount(this, e.target, component, x, y);
                break;
            default:
                let element_editor = this.ui_components.get("element_edit.html");
                element_editor.mount(this.element);
        }
    }

    handleScroll(e, x = e.pageX, y = e.pageY) {
        e.preventDefault();
        let amount = e.deltaY;
        let os = this.transform.scale;
        this.transform.scale = Math.max(0.2, Math.min(2, os + -amount * 0.00005));
        const px = this.transform.px,
            s = this.transform.scale,
            py = this.transform.py;

        this.transform.px -= ((((px - x) * os) - ((px - x) * s))) / (os);
        this.transform.py -= ((((py - y) * os) - ((py - y) * s))) / (os);
        this.render();
        this.view_element.style.transform = this.transform;
    }

    update() {
        this.render();
    }

    render() {
        this.canvas.render(this.transform);
        if (this.target)
            this.line_machine.render(this.canvas.ctx, this.transform, this.target.box);
        this.loadedComponents.forEach(c => c.set(this.target));
    }

    mountDocument(file_info, x, y) {
        console.log(x, y);
        const doc = this.system.docs.get(this.system.docs.loadFile(file_info));
        let comp = null;
        if (doc) {
            switch (doc.type) {
            case "wick": 
            case "html":
                comp = actions.CREATE_COMPONENT(this.system, doc, {
                    x,
                    y
                });
                break;
            case "css":
                comp = actions.CREATE_CSS_DOC(this.system, doc, {
                    x,
                    y
                });
                break;
            case "js":
            case "svg":
            case "jpg":
            case "png":
            case "gif": //intentional
            default:
                break;
            }
        }

        return comp;
    }

    /******** FILE HANDLING ************/

    async save(file_builder) {
        const data = { components: [] };

        for (let i = 0; i < this.components.length; i++)
            data.components.push(this.components[i]);

        return await file_builder.writeS(JSON.stringify(data));
    }

    load(string) {
        const data = JSON.parse(string),
            components = data.components;

        for (let i = 0; i < components.length; i++) {
            const d = components[i],
                comp = this.mountDocument(d, d.x, d.y);
            comp.width = d.width;
            comp.height = d.height;
            comp.x = d.x;
            comp.y = d.y;
        }
    }
}

class JSManager{

}

/**
 * Global Document instance short name
 * @property DOC
 * @package
 * @memberof module:wick~internals
 * @type 	{Document}
 */
const DOC = (typeof(document) !== "undefined") ? document : ()=>{};

/**
 * Global Window Instance short name
 * @property WIN
 * @package
 * @memberof module:wick~internals
 * @type 	{Window}
 */
const WIN = (typeof(window) !== "undefined") ? window : ()=>{};

/**
 * Global HTMLElement class short name
 * @property EL
 * @package
 * @memberof module:wick~internals
 * @type 	{HTMLElement}
 */
const EL = (typeof(HTMLElement) !== "undefined") ? HTMLElement : ()=>{};

/**
 * Global Object class short name
 * @property OB
 * @package
 * @memberof module:wick~internals
 * @type Object
 */
const OB = Object;

/**
 * Global String class short name
 * @property STR
 * @package
 * @memberof module:wick~internals
 * @type String
 */
const STR = String;

/**
 * Global Array class short name
 * @property AR
 * @package
 * @memberof module:wick~internals
 * @type 	{Array}
 */
const AR = Array;

/**
 * Global Number class short name
 * @property NUM
 * @package
 * @memberof module:wick~internals
 * @type 	{Number}
 */
const NUM = Number;

/**
 * Global Date class short name
 * @property DT
 * @package
 * @memberof module:wick~internals
 * @type 	{Date}
 */
const DT = Date;

/**
 * Global Boolean class short name
 * @property BO
 * @package
 * @memberof module:wick~internals
 * @type 	{Boolean}
 */
const BO = Boolean;

/***************** Functions ********************/

/**
 *  Global document.createElement short name function.
 * @method DOC
 * @package
 * @memberof module:wick~internals
 * @param 	{String}  		e   - tagname of element to create. 
 * @return  {HTMLElement}  		- HTMLElement instance generated by the document. 
 */
const createElement = (e) => document.createElement(e);

/**
 *  Element.prototype.appendChild short name wrapper.
 * @method _appendChild_
 * @package
 * @memberof module:wick~internals
 * @param 	{HTMLElement}  		el  	- parent HTMLElement.
 * @return  {HTMLElement | HTMLNode}  		ch_el 	- child HTMLElement or HTMLNode. 
 */
const _appendChild_ = (el, ch_el) => el.appendChild(ch_el);

/**
 *  Element.prototype.cloneNode short name wrapper.
 * @method _cloneNode_
 * @package
 * @memberof module:wick~internals
 * @param 	{HTMLElement}  		el   - HTMLElement to clone.
 * @return  {Boolean}  			bool - Switch for deep clone
 */
const _cloneNode_ = (el, bool) => el.cloneNode(bool);

/**
 *  Element.prototype.getElementsByTagName short name wrapper.
 * @method _getElementByTag_
 * @package
 * @memberof module:wick~internals
 * @param 	{HTMLElement}  		el   - HTMLElement to find tags on.
 * @return  {String}  			tag - tagnames of elements to find.
 */
const _getElementByTag_ = (el, tag) => el.getElementsByTagName(tag);

/**
 *  Shortname for `instanceof` expression
 * @method _instanceOf_
 * @package
 * @param      {object}  inst    The instance
 * @param      {object}  constr  The constructor
 * @return     {boolean}  the result of `inst instanceof constr`
 */
const _instanceOf_ = (inst, constr) => inst instanceof constr;

const _SealedProperty_ = (object, name, value) => OB.defineProperty(object, name, {value, configurable: false, enumerable: false, writable: true});
const _FrozenProperty_ = (object, name, value) => OB.defineProperty(object, name, {value, configurable: false, enumerable: false, writable: false});

/**
 * Used to call the Scheduler after a JavaScript runtime tick.
 *
 * Depending on the platform, caller will either map to requestAnimationFrame or it will be a setTimout.
 */
 
const caller = (typeof(window) == "object" && window.requestAnimationFrame) ? window.requestAnimationFrame : (f) => {
    setTimeout(f, 1);
};

const perf = (typeof(performance) == "undefined") ? { now: () => Date.now() } : performance;


/**
 * Handles updating objects. It does this by splitting up update cycles, to respect the browser event model. 
 *    
 * If any object is scheduled to be updated, it will be blocked from scheduling more updates the next JavaScript runtime tick.
 */
class Spark {
    /**
     * Constructs the object.
     */
    constructor() {

        this.update_queue_a = [];
        this.update_queue_b = [];

        this.update_queue = this.update_queue_a;

        this.queue_switch = 0;

        this.callback = () => this.update();

        this.frame_time = perf.now();

        this._SCHD_ = false;
    }

    /**
     * Given an object that has a _SCHD_ Boolean property, the Scheduler will queue the object and call its .update function 
     * the following tick. If the object does not have a _SCHD_ property, the Scheduler will persuade the object to have such a property.
     * 
     * If there are currently no queued objects when this is called, then the Scheduler will user caller to schedule an update.
     */
    queueUpdate(object, timestart = 1, timeend = 0) {
        if (object._SCHD_ || object._SCHD_ > 0) {
            if (this._SCHD_)
                return;
            else
                return caller(this.callback);
        }

        object._SCHD_ = (timestart | ((timeend) << 16));

        this.update_queue.push(object);

        if (this._SCHD_)
            return;

        this.frame_time = perf.now() | 0;

        this._SCHD_ = true;

        caller(this.callback);
    }

    /**
     * Called by the caller function every tick. Calls .update on any object queued for an update. 
     */
    update() {

        this._SCHD_ = false;

        let uq = this.update_queue;

        if (this.queue_switch == 0)
            (this.update_queue = this.update_queue_b, this.queue_switch = 1);
        else
            (this.update_queue = this.update_queue_a, this.queue_switch = 0);

        let time = perf.now() | 0;

        let diff = Math.ceil(time - this.frame_time) | 1;

        this.frame_time = time;

        let step_ratio = (diff * 0.06); //  step_ratio of 1 = 16.66666666 or 1000 / 60 for 60 FPS

        for (let i = 0, l = uq.length, o = uq[0]; i < l; o = uq[++i]) {
            let timestart = ((o._SCHD_ & 65535)) - diff;
            let timeend = ((o._SCHD_ >> 16) & 65535);

            if (timestart > 0) {
                o._SCHD_ = 0;
                this.queueUpdate(o, timestart, timeend);
                continue;
            }

            if (timeend > 0) {
                this.queueUpdate(o, timestart, timeend - diff);
                continue;
            } else o._SCHD_ = 0;

            try {
                o.scheduledUpdate(step_ratio, diff);
            } catch (e) {
                console.error(e);
            }
        }

        uq.length = 0;
    }
}

const spark = new Spark();

/**
 * The base class which all Model classes extend.
 * @memberof module:wick~internal .model
 * @alias ModelBase
 */
class ModelBase {
    constructor(root = null, address = []) {
        _SealedProperty_(this, "_cv_", []);
        _SealedProperty_(this, "fv", null);
        _SealedProperty_(this, "par", null);
        _SealedProperty_(this, "MUTATION_ID", 0);
        _SealedProperty_(this, "address", address);
        _SealedProperty_(this, "root", root || this);
        _SealedProperty_(this, "prop_name", "");
    }


    /**
     *   Remove all references to any objects still held by this object.
     *   @protected
     *   @instance
     */
    destroy() {

        //inform views of the models demise
        var view = this.fv;

        while (view) {
            let nx = view.nx;
            view.unsetModel();
            view = nx;
        }

        this._cv_ = null;
    }

    setHook(prop_name, data) { return data; }

    getHook(prop_name, data) { return data; }


    /**
     * Called by a class that extends ModelBase when on of its property values changes.
     * @param      {string}  changed_value  The changed value
     * @private
     */
    scheduleUpdate(changed_value) {
        if (!this.fv)
            return;


        this._cv_.push(changed_value);

        spark.queueUpdate(this);
    }


    getChanged(prop_name) {


        for (let i = 0, l = this._cv_.length; i < l; i++)
            if (this._cv_[i] == prop_name)
                return this[prop_name];

        return null;
    }

    addListener(listener) {
        return this.addView(listener);
    }


    /**
     * Adds a view to the linked list of views on the model. argument view MUST be an instance of View. 
     * @param {View} view - The view to _bind_ to the ModelBase
     * @throws {Error} throws an error if the value of `view` is not an instance of {@link View}.
     */
    addView(view) {
        if (view.model)
            if (view.model !== this) {
                view.model.removeView(view);
            } else return;

        if (this.fv) this.fv.pv = view;
        view.nx = this.fv;
        this.fv = view;

        view.pv = null;
        view.model = this;
        view.update(this);
    }

    /**
     * Removes view from set of views if the passed in view is a member of model. 
     * @param {View} view - The view to unbind from ModelBase
     */
    removeView(view) {
        

        if (view.model == this) {
            if (view == this.fv)
                this.fv = view.nx;

            if (view.nx)
                view.nx.pv = view.pv;
            if (view.pv)
                view.pv.nx = view.nx;

            view.nx = null;
            view.pv = null;
        }
    }


    /**
        Should return the value of the property if it is in the model and has been updated since the last cycle. Null otherwise.
        This should be overridden by a more efficient version by inheriting objects
    */
    isUpdated(prop_name) {

        let changed_properties = this._cv_;

        for (var i = 0, l = changed_properties.length; i < l; i++)
            if (changed_properties[i] == prop_name)
                if (this[prop_name] !== undefined)
                    return this[prop_name];

        return null;
    }



    /**
     * Called by the {@link spark} when if the ModelBase is scheduled for an update
     * @param      {number}  step    The step
     */
    scheduledUpdate(step) { this.updateViews(); }



    /**
     * Calls View#update on every bound View, passing the current state of the ModelBase.
     */
    updateViews() {

        let o = {};

        for (let p = null, i = 0, l = this._cv_.length; i < l; i++)
            (p = this._cv_[i], o[p] = this[p]);

        this._cv_.length = 0;

        var view = this.fv;

        while (view) {

            view.update(this, o);
            view = view.nx;
        }

        return;
    }



    /**
     * Updates views with a list of models that have been removed. 
     * Primarily used in conjunction with container based views, such as Templates.
     * @private
     */
    updateViewsRemoved(data) {

        var view = this.fv;

        while (view) {

            view.removed(data);

            view = view.nx;
        }
    }



    /** MUTATION FUNCTIONS **************************************************************************************/



    _deferUpdateToRoot_(data, MUTATION_ID = this.MUTATION_ID) {
        return this.root._setThroughRoot_(data, this.address, 0, this.address.length, MUTATION_ID);
    }



    _setThroughRoot_(data, address, index, len, m_id) {

        if (index >= len) {

            if (m_id !== this.MUTATION_ID) {
                let clone = this.clone();
                clone.set(data, true);
                clone.MUTATION_ID = (this.par) ? this.par.MUTATION_ID : this.MUTATION_ID + 1;
                return clone;
            }

            this.set(data, true);
            return this;
        }

        let i = address[index++];

        let model_prop = this.prop_array[i];

        if (model_prop.MUTATION_ID !== this.MUTATION_ID) {

            model_prop = model_prop.clone();

            model_prop.MUTATION_ID = this.MUTATION_ID;
        }

        this.prop_array[i] = model_prop;

        return model_prop._setThroughRoot_(data, address, index, len, model_prop.MUTATION_ID);
    }

    seal() {

        let clone = this._deferUpdateToRoot_(null, this.MUTATION_ID + 1);

        return clone;
    }

    clone() {

        let clone = new this.constructor(this);

        clone.prop_name = this.prop_name;
        clone._cv_ = this._cv_;
        clone.fv = this.fv;
        clone.par = this.par;
        clone.MUTATION_ID = this.MUTATION_ID;
        clone.address = this.address;
        clone.prop_name = this.prop_name;

        clone.root = (this.root == this) ? clone : this.root;

        return clone;
    }

    /**
     * Updates views with a list of models that have been added. 
     * Primarily used in conjunction with container based views, such as Templates.
     * @private
     */
    updateViewsAdded(data) {

        var view = this.fv;

        while (view) {

            view.added(data);

            view = view.nx;
        }
    }

    toJson() { return JSON.stringify(this, null, '\t'); }


    /**
     * This will update the branch state of the data tree with a new branch if the MUTATION_ID is higher or lower than the current branch's parent level.
     * In this case, the new branch will stem from the root node, and all ancestor nodes from the originating child will be cloned.
     *
     * @param      {Object}         child_obj    The child object
     * @param      {(Object|number)}  MUTATION_ID  The mutation id
     * @return     {Object}         { description_of_the_return_value }
     */
    setMutation(child_obj, MUTATION_ID = child_obj.MUTATION_ID) {
        let clone = child_obj,
            result = this;

        if (MUTATION_ID == this.MUTATION_ID) return child_obj;

        if (this.par)
            result = this.par.setMutation(this, MUTATION_ID);

        if (MUTATION_ID > this.MUTATION_ID) {
            result = this.clone();
            result.MUTATION_ID = this.MUTATION_ID + 1;
        }

        clone = child_obj.clone();
        clone.MUTATION_ID = result.MUTATION_ID;
        result[clone.prop_name] = clone;

        return clone;
    }
}

/**
    Schema type. Handles the parsing, validation, and filtering of Model data properties. 
*/
class SchemeConstructor {

    constructor() {

        this.start_value = undefined;
    }

    /**
        Parses value returns an appropriate transformed value
    */
    parse(value) {

        return value;
    }

    /**

    */
    verify(value, result) {

        result.valid = true;
    }

    filter(id, filters) {
        for (let i = 0, l = filters.length; i < l; i++)
            if (id === filters[i]) return true;
        return false;
    }

    string(value) {

        return value + "";
    }
}

class MCArray extends Array {

    constructor() {
        super();
    }

    push(item) {
        if (item instanceof Array)
            item.forEach((i) => {
                this.push(i);
            });
        else
            super.push(item);
    }

    //For compatibility
    __setFilters__() {

    }

    getChanged() {

    }

    toJSON() { return this; }

    toJson() { return JSON.stringify(this, null, '\t'); }
}

// A no op function
let EmptyFunction = () => {};
let EmptyArray = [];

class ModelContainerBase extends ModelBase {

    constructor(root = null, address = []) {

        super(root, address);

        _SealedProperty_(this, "source", null);
        _SealedProperty_(this, "first_link", null);

        //For keeping the container from garbage collection.
        _SealedProperty_(this, "pin", EmptyFunction);

        //For Linking to original 
        _SealedProperty_(this, "next", null);
        _SealedProperty_(this, "prev", null);

        //Filters are a series of strings or number selectors used to determine if a model should be inserted into or retrieved from the container.
        _SealedProperty_(this, "__filters__", null);

        this.validator = new SchemeConstructor();

        return this;
    }

    setByIndex(index) { /* NO OP **/ }

    getByIndex(index, value) { /* NO OP **/ }

    destroy() {


        this.__filters__ = null;

        if (this.source) {
            this.source.__unlink__(this);
        }

        super.destroy();
    }

    /**
        Get the number of Models held in this._mContainerBase

        @returns {Number}
    */
    get length() { return 0; }

    set length(e) { /* NO OP */ }

    /** 
        Returns a ModelContainerBase type to store the results of a get().
    */
    __defaultReturn__(USE_ARRAY) {
        if (USE_ARRAY) return new MCArray;

        let n = new this.constructor();

        n.key = this.key;
        n.validator = this.validator;
        n.model = this.model;

        this.__link__(n);

        return n;
    }

    /**
        Array emulating kludge

        @returns The result of calling this.insert
    */
    push(item) { return this.insert(item, false, true); }

    /**
        Retrieves a list of items that match the term/terms. 

        @param {(Array|SearchTerm)} term - A single term or a set of terms to look for in the ModelContainerBase. 
        @param {Array} __return_data__ - Set to true by a source Container if it is calling a SubContainer insert function. 

        @returns {(ModelContainerBase|Array)} Returns a Model container or an Array of Models matching the search terms. 
    */
    get(term, __return_data__) {

        let out = null;

        term = this.getHook("term", term);

        let USE_ARRAY = (__return_data__ === null) ? false : true;

        if (term) {

            if (__return_data__) {
                out = __return_data__;
            } else {

                if (!this.source)
                    USE_ARRAY = false;

                out = this.__defaultReturn__(USE_ARRAY);
                out.__setFilters__(term);
            }
        } else
            out = (__return_data__) ? __return_data__ : this.__defaultReturn__(USE_ARRAY);

        if (!term)
            this.__getAll__(out);
        else {

            let terms = term;

            if (!Array.isArray(term))
                terms = [term];

            //Need to convert terms into a form that will work for the identifier type
            terms = terms.map(t => this.validator.parse(t));

            this.__get__(terms, out);
        }

        return out;
    }

    set(item, from_root = false) {
        if (!from_root)
            return this._deferUpdateToRoot_(item).insert(item, true);
        else
            this.insert(item, true);
    }

    /**
        Inserts an item into the container. If the item is not a {Model}, an attempt will be made to convert the data in the Object into a Model.
        If the item is an array of objects, each object in the array will be considered separately. 

        @param {Object} item - An Object to insert into the container. On of the properties of the object MUST have the same name as the ModelContainerBase's 
        @param {Array} item - An array of Objects to insert into the container.
        @param {Boolean} __FROM_SOURCE__ - Set to true by a source Container if it is calling a SubContainer insert function. 

        @returns {Boolean} Returns true if an insertion into the ModelContainerBase occurred, false otherwise.
    */
    insert(item, from_root = false, __FROM_SOURCE__ = false) {

        item = this.setHook("", item);

        if (!from_root)
            return this._deferUpdateToRoot_(item).insert(item, true);

        let add_list = (this.fv) ? [] : null;

        let out_data = false;

        if (!__FROM_SOURCE__ && this.source)
            return this.source.insert(item);


        if (item instanceof Array) {
            for (var i = 0; i < item.length; i++)
                if (this.__insertSub__(item[i], out_data, add_list))
                    out_data = true;
        } else if (item)
            out_data = this.__insertSub__(item, out_data, add_list);


        if (out_data) {
            if (this.par)
                this.par.scheduleUpdate(this.prop_name);


            if (add_list && add_list.length > 0) {
                this.updateViewsAdded(add_list);
                this.scheduleUpdate();
            }
        }

        return out_data;
    }

    /**
        A subset of the insert function. Handles the testing of presence of an identifier value, the conversion of an Object into a Model, and the calling of the implementation specific __insert__ function.
    */
    __insertSub__(item, out, add_list) {

        let model = item;

        var identifier = this._gI_(item);

        if (identifier !== undefined) {

            if (!(model instanceof ModelBase)) {
                model = new this.model(item);
                model.MUTATION_ID = this.MUTATION_ID;
            }

            identifier = this._gI_(model, this.__filters__);

            if (identifier !== undefined) {
                out = this.__insert__(model, add_list, identifier);
                this.__linksInsert__(model);
            }
        }

        return out;
    }

    delete(term, from_root = false) {
        if (!from_root)
            return this._deferUpdateToRoot_(term).remove(term);
        else
            this.remove(term);
    }

    /**
        Removes an item from the container. 
    */
    remove(term, from_root = false, __FROM_SOURCE__ = false) {

        if (!from_root)
            return this._deferUpdateToRoot_(term).remove(term, true);

        //term = this.getHook("term", term);

        if (!__FROM_SOURCE__ && this.source) {

            if (!term)
                return this.source.remove(this.__filters__);
            else
                return this.source.remove(term);
        }

        let out_container = [];

        if (!term)
            this.__removeAll__();

        else {

            let terms = (Array.isArray(term)) ? term : [term];

            //Need to convert terms into a form that will work for the identifier type
            terms = terms.map(t => (t instanceof ModelBase) ? t : this.validator.parse(t));

            this.__remove__(terms, out_container);
        }

        if (out_container.length > 0) {
            if (this.par)
                this.par.scheduleUpdate(this.prop_name);


            if (out_container && out_container.length > 0) {
                this.updateViewsRemoved(out_container);
                this.scheduleUpdate();
            }
        }

        return out_container;
    }

    /**
        Removes a ModelContainerBase from list of linked containers. 

        @param {ModelContainerBase} container - The ModelContainerBase instance to remove from the set of linked containers. Must be a member of the linked containers. 
    */
    __unlink__(container) {

        if (container instanceof ModelContainerBase && container.source == this) {

            if (container == this.first_link)
                this.first_link = container.next;

            if (container.next)
                container.next.prev = container.prev;

            if (container.prev)
                container.prev.next = container.next;

            container.source = null;
        }
    }

    /**
        Adds a container to the list of tracked containers. 

        @param {ModelContainerBase} container - The ModelContainerBase instance to add the set of linked containers.
    */
    __link__(container) {
        if (container instanceof ModelContainerBase && !container.source) {

            container.source = this;

            container.next = this.first_link;

            if (this.first_link)
                this.first_link.prev = container;

            this.first_link = container;

            container.pin = ((container) => {
                let id = setTimeout(() => {
                    container.__unlink__();
                }, 50);

                return () => {
                    clearTimeout(id);
                    if (!container.source)
                        console.warn("failed to clear the destruction of container in time!");
                };
            })(container);
        }
    }

    /**
     * Remove items from linked ModelContainers according to the terms provided.
     * @param      {Array}  terms   Array of terms.
     * @private
     */
    __linksRemove__(item) {
        let a = this.first_link;
        while (a) {
            for (let i = 0; i < item.length; i++)
                if (a._gI_(item[i], a.__filters__)) {
                    a.scheduleUpdate();
                    a.__linksRemove__(item);
                    break;
                }

            a = a.next;
        }
    }

    /**
     * Add items to linked ModelContainers.
     * @param      {Model}  item   Item to add.
     * @private
     */
    __linksInsert__(item) {
        let a = this.first_link;
        while (a) {
            if (a._gI_(item, a.__filters__))
                a.scheduleUpdate();
            a = a.next;
        }
    }

    /**
        Removes any items in the ModelConatiner not included in the array "items", and adds any item in `items` not already in the ModelContainerBase.
        @param {Array} items - An array of identifiable Models or objects. 
    */
    cull(items) {

        let hash_table = {};
        let existing_items = __getAll__([], true);

        let loadHash = (item) => {
            if (item instanceof Array)
                return item.forEach((e) => loadHash(e));

            let identifier = this._gI_(item);

            if (identifier !== undefined)
                hash_table[identifier] = item;

        };

        loadHash(items);

        for (let i = 0; i < existing_items.lenth; i++) {
            let e_item = existing_items[i];
            if (!existing_items[this._gI_(e_item)])
                this.__remove__(e_item);
        }

        this.insert(items);
    }

    __setFilters__(term) {

        if (!this.__filters__) this.__filters__ = [];

        if (Array.isArray(term))
            this.__filters__ = this.__filters__.concat(term.map(t => this.validator.parse(t)));
        else
            this.__filters__.push(this.validator.parse(term));

    }

    /**
        Returns true if the identifier matches a predefined filter pattern, which is evaluated by this.parser. If a 
        parser was not present the ModelContainers schema, then the function will return true upon every evaluation.
    */
    __filterIdentifier__(identifier, filters) {
        if (filters.length > 0) {
            return this.validator.filter(identifier, filters);
        }
        return true;
    }

    _gIf_(item, term) {
        let t = this._gI_(item, this.filters);
    }

    /**
        Returns the Identifier property value if it exists in the item. If an array value for filters is passed, then undefined is returned if the identifier value does not pass filtering criteria.
        @param {(Object|Model)} item
        @param {Array} filters - An array of filter terms to test whether the identifier meets the criteria to be handled by the ModelContainerBase.
    */
    _gI_(item, filters = null) {

        let identifier;

        if (typeof(item) == "object" && this.key)
            identifier = item[this.key];
        else
            identifier = item;

        if (identifier && this.validator)
            identifier = this.validator.parse(identifier);

        if (filters && identifier)
            return (this.__filterIdentifier__(identifier, filters)) ? identifier : undefined;

        return identifier;
    }

    /** 
        OVERRIDE SECTION ********************************************************************
        
        All of these functions should be overridden by inheriting classes
    */

    __insert__() { return this; }

    __get__(item, __return_data__) { return __return_data__; }

    __getAll__(__return_data__) { return __return_data__; }

    __removeAll__() { return []; }

    __remove__() { return []; }

    clone() {
        let clone = super.clone();
        clone.key = this.key;
        clone.model = this.model;
        clone.validator = this.validator;
        clone.first_link = this.first_link;
        return clone;
    }

    // END OVERRIDE *************************************************************************
}

const proto = ModelContainerBase.prototype;
_SealedProperty_(proto, "model", null);
_SealedProperty_(proto, "key", "");
_SealedProperty_(proto, "validator", null);

class MultiIndexedContainer extends ModelContainerBase {

    constructor(data = [], root = null, address = []) {

        super(root, address);

        this.secondary_indexes = {};
        this.primary_index = null;
        this.primary_key = "";

        if (data[0] && data[0].key) {

            let key = data[0].key;

            if (data[0].model)
                this.model = data[0].model;

            if (Array.isArray(key))
                key.forEach((k) => (this.addKey(k)));

            data = data.slice(1);
        }

        if (Array.isArray(data) && data.length > 0)
            this.insert(data);
    }

    /**
        Returns the length of the first index in this container. 
    */
    get length() { return this.primary_index.length; }

    /**
        Insert a new ModelContainerBase into the index through the key.  
    */
    addKey(key) {
        let name = key.name;

        let container = new MultiIndexedContainer.array([{ key, model: this.model }]);

        if (this.primary_index) {
            this.secondary_indexes[name] = container;
            this.secondary_indexes[name].insert(this.primary_index.__getAll__());
        } else {
            this.primary_key = name;
            this.primary_index = container;
        }
    }

    get(item, __return_data__) {
        
        item = this.getHook("query", item);

        if (item) {
            for (let name in item) {
                if (name == this.primary_key)
                    return this.primary_index.get(item[name], __return_data__);

                else if (this.secondary_indexes[name])
                    return this.secondary_indexes[name].get(item[name], __return_data__);

            }
        } else
            return this.primary_index.get(null, __return_data__);
    }

    __insert__(model, add_list, identifier) {

        let out = false;

        model.par = this;

        if ((out = this.primary_index.insert(model))) {
            for (let name in this.secondary_indexes) {

                let index = this.secondary_indexes[name];

                index.insert(model);
            }
        }

        if (out)
            this.updateViews(this.primary_index.get());

        return out;
    }
    /**
        @private 
    */
    __remove__(term, out_container) {

        let out = false;

        if ((out = this.primary_index.__remove__(term, out_container))) {

            for (let name in this.secondary_indexes) {

                let index = this.secondary_indexes[name];

                index.__remove__(out_container);
            }
        }

        return out;
    }

    __removeAll__() {

        let out = false;

        out = this.primary_index.__removeAll__(term, out_container);

        for (let name in this.secondary_indexes) {

            let index = this.secondary_indexes[name];

            if (index.__removeAll__(model))
                out = true;
        }

        return out;
    }


    /**
        Overrides Model container default _gI_ to force item to pass.
        @private 
    */
    _gI_(item, filters = null) {
        return true;
    }

    toJSON() {
        return this.primary_index.toJSON();
    }

    clone() {
        let clone = super.clone();
        clone.secondary_indexes = this.secondary_indexes;
        clone.primary_index = this.primary_index;
        return clone;
    }
}

class NumberSchemeConstructor extends SchemeConstructor {

    constructor() {

        super();

        this.start_value = 0;
    }

    parse(value) {

        return parseFloat(value);
    }

    verify(value, result) {

        result.valid = true;

        if (value == NaN || value == undefined) {
            result.valid = false;
            result.reason = "Invalid number type.";
        }
    }

    filter(identifier, filters) {

        for (let i = 0, l = filters.length; i < l; i++)
            if (identifier == filters[i])
                return true;

        return false;
    }
}

let number$1 = new NumberSchemeConstructor();

let scape_date = new Date();
scape_date.setHours(0);
scape_date.setMilliseconds(0);
scape_date.setSeconds(0);
scape_date.setTime(0);

class DateSchemeConstructor extends NumberSchemeConstructor {

    parse(value) {

        if(!value)
            return undefined;

        if(value instanceof Date)
            return value.valueOf();

        if (!isNaN(value))
            return parseInt(value);

        let date = (new Date(value)).valueOf();

        if(date) return date;

        let lex = whind$1(value);

        let year = parseInt(lex.text);

        if (year) {

            scape_date.setHours(0);
            scape_date.setMilliseconds(0);
            scape_date.setSeconds(0);
            scape_date.setTime(0);

            lex.next();
            lex.next();
            let month = parseInt(lex.text) - 1;
            lex.next();
            lex.next();
            let day = parseInt(lex.text);
            scape_date.setFullYear(year);
            scape_date.setDate(day);
            scape_date.setMonth(month);

            lex.next();

            if (lex.pos > -1) {

                let hours = parseInt(lex.text);
                lex.next();
                lex.next();
                let minutes = parseInt(lex.text);

                scape_date.setHours(hours);
                scape_date.setMinutes(minutes);
            }



            return scape_date.valueOf();
        } 
    }

    /**
     
     */
    verify(value, result) {

        value = this.parse(value);

        super.verify(value, result);
    }

    filter(identifier, filters) {

        if (filters.length > 1) {

            for (let i = 0, l = filters.length - 1; i < l; i += 2) {
                let start = filters[i];
                let end = filters[i + 1];

                if (start <= identifier && identifier <= end) {
                    return true;
                }
            }
        }

        return false;
    }

    string(value) {
        
        return (new Date(value)) + "";
    }
}

let date = new DateSchemeConstructor();

class TimeSchemeConstructor extends NumberSchemeConstructor {

    parse(value) {
        if (!isNaN(value))
            return parseFloat(value);
        try {
            var hour = parseInt(value.split(":")[0]);
            var min = parseInt(value.split(":")[1].split(" ")[0]);
            if (value.split(":")[1].split(" ")[1])
                half = (value.split(":")[1].split(" ")[1].toLowerCase() == "pm");
            else
                half = 0;
        } catch (e) {
            var hour = 0;
            var min = 0;
            var half = 0;
        }
        
        return parseFloat((hour + ((half) ? 12 : 0) + (min / 60)));
    }

    verify(value, result) {
        this.parse(value);
        super.verify(value, result);
    }

    filter(identifier, filters) {
        return true
    }

    string(value) {
        return (new Date(value)) + "";
    }
}

let time = new TimeSchemeConstructor();

class StringSchemeConstructor extends SchemeConstructor {
    
    constructor() {

        super();

        this.start_value = "";
    }
    parse(value) {

        return value + "";
    }

    verify(value, result) {
        result.valid = true;

        if (value === undefined) {
            result.valid = false;
            result.reason = " value is undefined";
        } else if (!value instanceof String) {
            result.valid = false;
            result.reason = " value is not a string.";
        }
    }

    filter(identifier, filters) {

        for (let i = 0, l = filters.length; i < l; i++)
            if (identifier.match(filters[i] + ""))
                return true;

        return false;
    }
}

let string$1 = new StringSchemeConstructor();

class BoolSchemeConstructor extends SchemeConstructor {

    constructor() {

        super();

        this.start_value = false;
    }

    parse(value) {

        return (value) ? true : false;
    }

    verify(value, result) {

        result.valid = true;

        if (value === undefined) {
            result.valid = false;
            result.reason = " value is undefined";
        } else if (!value instanceof Boolean) {
            result.valid = false;
            result.reason = " value is not a Boolean.";
        }
    }

    filter(identifier, filters) {

        if (value instanceof Boolean)
            return true;

        return false;
    }
}

let bool = new BoolSchemeConstructor();

let schemes = { date, string: string$1, number: number$1, bool, time };


/**
 * Used by Models to ensure conformance to a predefined data structure. Becomes immutable once created.
 * @param {Object} data - An Object of `key`:`value` pairs used to define the Scheme. `value`s must be instances of or SchemeConstructor or classes that extend SchemeConstructor.
 * @readonly
 */
class Schema {}

class BTreeModelContainer extends ModelContainerBase {

    constructor(data = [], root = null, address = []) {

        super(root, address);

        this.validator = schemes.number;

        if (data[0] && data[0].key) {

            let key = data[0].key;

            if (typeof key == "object") {

                if (key.type)
                    this.validator = (key.type instanceof NumberSchemeConstructor) ? key.type : this.validator;

                if (key.name)
                    this.key = key.name;

                if (key.unique_key)
                    this.unique_key = key.unique_key;
            } else
                this.key = key;

            if (data[0].model)
                this.model = data[0].model;

            data = data.slice(1);
        }

        this.min = 10;
        this.max = 20;
        this.size = 0;
        this.btree = null;

        if (Array.isArray(data) && data.length > 0)
            this.insert(data);
    }

    destroy() {
        if (this.btree)
            this.btree.destroy();

        super.destroy();
    }

    get length() {
        return this.size;
    }

    __insert__(model, add_list, identifier) {

        let result = {
            added: false
        };

        if (!this.btree)
            this.btree = new BtreeNode(true);

        this.btree = this.btree.insert(identifier, model, this.unique_key, this.max, true, result).newnode;

        if (add_list) add_list.push(model);

        if (result.added) {
            this.size++;
            this.__updateLinks__();
        }

        return result.added;
    }

    __get__(terms, __return_data__) {

        if(!this.btree) return __return_data__;

        if (__return_data__ instanceof BTreeModelContainer){
            __return_data__.btree = this.btree;
            return __return_data__;
        }

        let out = [];

        for (let i = 0, l = terms.length; i < l; i++) {
            let b, a = terms[i];

            if (a instanceof ModelBase)
                continue;

            if (i < l-1 && !(terms[i + 1] instanceof ModelBase)) {
                b = terms[++i];
            } else
                b = a;

            this.btree.get(a, b, out);
        }

        if (this.__filters__) {
            for (let i = 0, l = out.length; i < l; i++) {
                let model = out[i];

                if (this._gI_(model, this.__filters__))
                    __return_data__.push(model);
            }
        } else
            for (let i = 0, l = out.length; i < l; i++)
                __return_data__.push(out[i]);



        return __return_data__;
    }

    __remove__(terms, out_container = []) {

        if(!this.btree) return false;

        let result = 0;

        for (let i = 0, l = terms.length; i < l; i++) {
            let b, a = terms[i];

            if ((a instanceof ModelBase)) {
                let v = this._gI_(a);
                let o = this.btree.remove(v, v, this.unique_key, this.unique_key ? a[this.unique_key] : "", true, this.min, out_container);
                result += o.out;
                this.btree = o.out_node;
                continue;
            }

            if (i < l-1 && !(terms[i + 1] instanceof ModelBase)) {
                b = terms[++i];
            } else
                b = a;

            let o = this.btree.remove(a, b, "", "", true, this.min, out_container);
            result += o.out;
            this.btree = o.out_node;
        }

        if (result > 0) {
            this.size -= result;
            this.__updateLinks__();
            this.__linksRemove__(out_container);
        }


        return result !== 0;
    }

    __updateLinks__() {
        let a = this.first_link;
        while (a) {
            a.btree = this.btree;
            a = a.next;
        }
    }

    __getAll__(__return_data__) {

        if (this.__filters__) {
            this.__get__(this.__filters__, __return_data__);
        } else if (this.btree)
            this.btree.get(-Infinity, Infinity, __return_data__);

        return __return_data__;
    }

    __removeAll__() {
        if (this.btree)
            this.btree.destroy();
        this.btree = null;
    }

    toJSON() {
        let out_data = [];

        if (this.btree) {

            this.btree.get(this.min, this.max, out_data);
        }

        return out_data;
    }

    clone() {
        let clone = super.clone();
        clone.btree = this.btree;
        return clone;
    }
}

class BtreeNode {
    constructor(IS_LEAF = false) {
        this.LEAF = IS_LEAF;
        this.nodes = [];
        this.keys = [];
        this.items = 0;
    }

    destroy() {

        this.nodes = null;
        this.keys = null;

        if (!this.LEAF) {
            for (let i = 0, l = this.nodes.length; i < l; i++)
                this.nodes[i].destroy();
        }

    }

    balanceInsert(max_size, IS_ROOT = false) {
        if (this.keys.length >= max_size) {
            //need to split this up!

            let newnode = new BtreeNode(this.LEAF);

            let split = (max_size >> 1) | 0;

            let key = this.keys[split];

            let left_keys = this.keys.slice(0, split);
            let left_nodes = this.nodes.slice(0, (this.LEAF) ? split : split + 1);

            let right_keys = this.keys.slice((this.LEAF) ? split : split + 1);
            let right_nodes = this.nodes.slice((this.LEAF) ? split : split + 1);

            newnode.keys = right_keys;
            newnode.nodes = right_nodes;

            this.keys = left_keys;
            this.nodes = left_nodes;

            if (IS_ROOT) {

                let root = new BtreeNode();

                root.keys.push(key);
                root.nodes.push(this, newnode);

                return {
                    newnode: root,
                    key: key
                };
            }

            return {
                newnode: newnode,
                key: key
            };
        }

        return {
            newnode: this,
            key: 0
        };
    }

    /**
        Inserts model into the tree, sorted by identifier. 
    */
    insert(identifier, model, unique_key, max_size, IS_ROOT = false, result) {

        let l = this.keys.length;

        if (!this.LEAF) {

            for (var i = 0; i < l; i++) {

                let key = this.keys[i];

                if (identifier < key) {
                    let node = this.nodes[i];

                    let o = node.insert(identifier, model, unique_key, max_size, false, result);
                    let keyr = o.key;
                    let newnode = o.newnode;

                    if (keyr == undefined) debugger

                    if (newnode != node) {
                        this.keys.splice(i, 0, keyr);
                        this.nodes.splice(i + 1, 0, newnode);
                    }

                    return this.balanceInsert(max_size, IS_ROOT);
                }
            }

            let node = this.nodes[i];

            let {
                newnode,
                key
            } = node.insert(identifier, model, unique_key, max_size, false, result);

            if (key == undefined) debugger

            if (newnode != node) {
                this.keys.push(key);
                this.nodes.push(newnode);
            }

            return this.balanceInsert(max_size, IS_ROOT);

        } else {

            for (let i = 0, l = this.keys.length; i < l; i++) {
                let key = this.keys[i];

                if (identifier == key) {

                    if (unique_key) {
                        if (this.nodes[i][unique_key] !== model[unique_key]) { continue; }
                    } else
                        this.nodes[i].set(model);
                    

                    result.added = false;

                    return {
                        newnode: this,
                        key: identifier
                    };
                } else if (identifier < key) {

                    this.keys.splice(i, 0, identifier);
                    this.nodes.splice(i, 0, model);

                    result.added = true;

                    return this.balanceInsert(max_size, IS_ROOT);
                }
            }

            this.keys.push(identifier);
            this.nodes.push(model);

            result.added = true;

            return this.balanceInsert(max_size, IS_ROOT);
        }

        return {
            newnode: this,
            key: identifier,
        };
    }

    balanceRemove(index, min_size) {
        let left = this.nodes[index - 1];
        let right = this.nodes[index + 1];
        let node = this.nodes[index];

        //Left rotate
        if (left && left.keys.length > min_size) {

            let lk = left.keys.length;
            let ln = left.nodes.length;

            node.keys.unshift((node.LEAF) ? left.keys[lk - 1] : this.keys[index - 1]);
            node.nodes.unshift(left.nodes[ln - 1]);

            this.keys[index - 1] = left.keys[lk - 1];

            left.keys.length = lk - 1;
            left.nodes.length = ln - 1;

            return false;
        } else
            //Right rotate
            if (right && right.keys.length > min_size) {

                node.keys.push((node.LEAF) ? right.keys[0] : this.keys[index]);
                node.nodes.push(right.nodes[0]);

                right.keys.splice(0, 1);
                right.nodes.splice(0, 1);

                this.keys[index] = (node.LEAF) ? right.keys[1] : right.keys[0];

                return false;

            } else {

                //Left or Right Merge
                if (!left) {
                    index++;
                    left = node;
                    node = right;
                }

                let key = this.keys[index - 1];
                this.keys.splice(index - 1, 1);
                this.nodes.splice(index, 1);

                left.nodes = left.nodes.concat(node.nodes);
                if (!left.LEAF) left.keys.push(key);
                left.keys = left.keys.concat(node.keys);


                if (left.LEAF)
                    for (let i = 0; i < left.keys.length; i++)
                        if (left.keys[i] != left.nodes[i].id)
                            {/*debugger*/}

                return true;
            }

    }

    remove(start, end, unique_key, unique_id, IS_ROOT = false, min_size, out_container) {
        let l = this.keys.length,
            out = 0,
            out_node = this;

        if (!this.LEAF) {

            for (var i = 0; i < l; i++) {

                let key = this.keys[i];

                if (start <= key)
                    out += this.nodes[i].remove(start, end, unique_key, unique_id, false, min_size, out_container).out;
            }

            out += this.nodes[i].remove(start, end, unique_key, unique_id, false, min_size, out_container).out;

            for (var i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].keys.length < min_size) {
                    if (this.balanceRemove(i, min_size)) {
                        l--;
                        i--;
                    }
                }
            }

            if (this.nodes.length == 1)
                out_node = this.nodes[0];

        } else {

            for (let i = 0, l = this.keys.length; i < l; i++) {
                let key = this.keys[i];

                if (key <= end && key >= start) {
                    if (unique_key, unique_id && this.nodes[i][unique_key] !== unique_id) continue;
                    out_container.push(this.nodes[i]);
                    out++;
                    this.keys.splice(i, 1);
                    this.nodes.splice(i, 1);
                    l--;
                    i--;
                }
            }
        }

        return {
            out_node,
            out
        };
    }

    get(start, end, out_container) {

        if (!start || !end)
            return false;

        if (!this.LEAF) {

            for (var i = 0, l = this.keys.length; i < l; i++) {

                let key = this.keys[i];

                if (start <= key)
                    this.nodes[i].get(start, end, out_container);
            }

            this.nodes[i].get(start, end, out_container);

        } else {

            let out = false;

            for (let i = 0, l = this.keys.length; i < l; i++) {
                let key = this.keys[i];

                if (key <= end && key >= start)
                    out_container.push(this.nodes[i]);
            }
        }
    }
}

MultiIndexedContainer.btree = BTreeModelContainer;

const ArrayContainerProxySettings = {

    set: function(obj, prop, val) {

        if (prop in obj && obj[prop] == val)
            return true;

        let property = obj[prop];

        if (property && typeof(property) == "object")
            property.set(val);
        else
            obj[prop] = val;

        obj.scheduleUpdate(prop);

        return true;
    },

    get: function(obj, prop, val) {

        if (prop in obj)
            return obj[prop];

        if (!isNaN(prop))
            return obj.data[prop];

        let term = {};

        term[obj.key] = prop;

        return obj.get(prop, [])[0];
    }
};

/**
    Stores models in random order inside an internal array object. 
 */

class ArrayModelContainer extends ModelContainerBase {

    constructor(data = [], root = null, address = []) {

        super(root, address);

        if (data[0] && data[0].key) {

            let key = data[0].key;

            /* Custom selection of container types happens here. 
             * If there are multiple keys present, then a MultiIndexedContainer is used.
             * If the value of the key is a Numerical type, then a BtreeModelContainer is used.
             **/
            if (typeof(key) == "object") {

                if (Array.isArray(key))
                    return new MultiIndexedContainer(data, root, address);

                if (key.type) {
                    if (key.type instanceof NumberSchemeConstructor)
                        return new BTreeModelContainer(data, root, address);
                    this.validator = (key.type instanceof SchemeConstructor) ? key.type : this.validator;
                }

                if (key.name)
                    this.key = key.name;
            } else
                this.key = key;

            if (data[0].model)
                this.model = data[0].model;

            data = data.slice(1);
        }

        this.data = [];

        if (Array.isArray(data) && data.length > 0)
            this.insert(data, true);
    }

    destroy() {

        this.data = null;

        super.destroy();
    }

    get proxy() { return new Proxy(this, ArrayContainerProxySettings); }

    set proxy(v) {}

    get length() { return this.data.length; }

    __defaultReturn__(USE_ARRAY) {

        if (USE_ARRAY) return new MCArray();

        let n = this.clone();

        this.__link__(n);

        return n;
    }

    __insert__(model, add_list, identifier) {

        for (var i = 0, l = this.data.length; i < l; i++) {

            var obj = this.data[i];

            if (this._gI_(obj) == identifier) {

                if (obj.MUTATION_ID !== this.MUTATION_ID) {
                    obj = obj.clone();
                    obj.MUTATION_ID = this.MUTATION_ID;
                }

                obj.set(model, true);

                this.data[i] = obj;

                return false; //Model not added to Container. Model just updated.
            }
        }

        this.data.push(model);

        model.address = this.address.slice();
        model.address.push(this.data.length - 1);

        model.root = this.root;

        if (add_list) add_list.push(model);

        return true; // Model added to Container.
    }

    getByIndex(i) {
        return this.data[i];
    }

    setByIndex(i, m) {
        this.data[i] = m;
    }

    __get__(term, return_data) {

        let terms = null;

        if (term)
            if (term instanceof Array)
                terms = term;
            else
                terms = [term];

        for (let i = 0, l = this.data.length; i < l; i++) {
            let obj = this.data[i];
            if (this._gI_(obj, terms)) {
                return_data.push(obj);
            }
        }

        return return_data;
    }

    __getAll__(return_data) {

        this.data.forEach((m) => {
            return_data.push(m);
        });

        return return_data;
    }

    __removeAll__() {
        let items = this.data.map(d => d) || [];

        this.data.length = 0;

        return items;
    }

    _setThroughRoot_(data, address, index, len, m_id) {

        if (index >= len)
            return this;

        let i = address[index++];

        let model_prop = this.data[i];

        if (model_prop.MUTATION_ID !== this.MUTATION_ID) {
            model_prop = model_prop.clone();
            model_prop.MUTATION_ID = this.MUTATION_ID;
        }

        this.data[i] = model_prop;

        return model_prop._setThroughRoot_(data, address, index, len, model_prop.MUTATION_ID);
    }

    __remove__(term, out_container) {

        let result = false;

        term = term.map(t => (t instanceof ModelBase) ? this._gI_(t) : t);
        
        for (var i = 0, l = this.data.length; i < l; i++) {
            var obj = this.data[i];

            if (this._gI_(obj, term)) {

                result = true;

                this.data.splice(i, 1);

                l--;
                i--;

                out_container.push(obj);

                break;
            }
        }

        return result;
    }

    toJSON() { return this.data; }

    clone() {
        let clone = super.clone();
        clone.data = this.data.slice();
        return clone;
    }
}

MultiIndexedContainer.array = ArrayModelContainer;

Object.freeze(ArrayModelContainer);

class Model extends ModelBase {

    constructor(data, root = null, address = []) {

        super(root, address);

        _SealedProperty_(this, "prop_array", []);
        _SealedProperty_(this, "prop_offset", 0);
        _SealedProperty_(this, "look_up", {});

        if (data)
            for (let name in data)
                this._createProp_(name, data[name]);

    }

    get proxy() { return this;}

    set(data, FROM_ROOT = false) {

        if (!FROM_ROOT)
            return this._deferUpdateToRoot_(data).set(data, true);

        if (!data)
            return false;

        let out = false;

        for (let prop_name in data) {

            let index = this.look_up[prop_name];

            if (index !== undefined) {

                let prop = this.prop_array[index];

                if (typeof(prop) == "object") {

                    if (prop.MUTATION_ID !== this.MUTATION_ID) {
                        prop = prop.clone();
                        prop.MUTATION_ID = this.MUTATION_ID;
                        this.prop_array[index] = prop;
                    }

                    if (prop.set(data[prop_name], true)){
                        this.scheduleUpdate(prop_name);
                        out = true;
                    }

                } else if (prop !== data[prop_name]) {
                    this.prop_array[index] = data[prop_name];
                     this.scheduleUpdate(prop_name);
                     out = true;
                }
            } else{
                this._createProp_(prop_name, data[prop_name]);
                out = true;
            }
        }

        return out;
    }
    _createProp_(name, value) {

        let index = this.prop_offset++;

        this.look_up[name] = index;
        var address = this.address.slice();
        address.push(index);

        switch (typeof(value)) {

            case "object":
                if (Array.isArray(value))
                    this.prop_array.push(new ArrayModelContainer(value, this.root, address));
                else {
                    if (value instanceof ModelBase) {
                        value.address = address;
                        this.prop_array.push(value);
                    } else
                        this.prop_array.push(new Model(value, this.root, address));
                }

                this.prop_array[index].prop_name = name;
                this.prop_array[index].par = this;

                Object.defineProperty(this, name, {

                    configurable: false,

                    enumerable: true,

                    get: function() { return this.getHook(name, this.prop_array[index]); },

                    set: (v) => {}
                });

                break;

            case "function":

                let object = new value(null, this.root, address);

                object.par = this;
                object.prop_name = name;

                this.prop_array.push(object);

                Object.defineProperty(this, name, {

                    configurable: false,

                    enumerable: true,

                    get: function() { return this.getHook(name, this.prop_array[index]); },

                    set: (v) => {}
                });

                break;

            default:
                this.prop_array.push(value);

                Object.defineProperty(this, name, {

                    configurable: false,

                    enumerable: true,

                    get: function() { return this.getHook(name, this.prop_array[index]); },

                    set: function(value) {

                        let val = this.prop_array[index];

                        if (val !== value) {
                            this.prop_array[index] = this.setHook(name, value);
                            this.scheduleUpdate(name);
                        }
                    }
                });
        }

        this.scheduleUpdate(name);
    }
}

ModelContainerBase.prototype.model = Model;

class Store {
    constructor(data) {

        this.history = [{ model: new Model(data, this), actions: [{ d: data, a: null }] }];
        this.MUTATION_ID = 0;
    }

    seal() { this.MUTATION_ID++; }

    getHistory(index) { return (this.history[index]) ? this.history[index].model : null; }

    get current() { return this.history[this.history.length - 1].model; }

    set current(v) {}

    get(data){
        return this.current.get(data);
    }

    set(data){
        return this.current.set(data);
    }

    _getParentMutationID_() { return this.MUTATION_ID; }

    _setThroughRoot_(data, address, index, len_minus_1, m_id) {

        let model_prop = this.current;

        if (m_id !== this.MUTATION_ID) {

            if (m_id > this.MUTATION_ID)
                this.MUTATION_ID = this.MUTATION_ID + 1;
            else
                this.MUTATION_ID = this.MUTATION_ID;

            model_prop = model_prop.clone();

            model_prop.MUTATION_ID = this.MUTATION_ID;

            this.history.push({ model: model_prop, actions: [] });
        }

        if (data)
            this.history[this.history.length - 1].actions.push({ d: data, a: address });

        return model_prop._setThroughRoot_(data, address, index, len_minus_1, this.MUTATION_ID);
    }
}

//import { CustomComponent } from "../page/component"

/**
 * There are a number of configurable options and global objects that can be passed to wick to be used throughout the PWA. The instances of the Presets class are objects that hosts all these global properties. 
 * 
 * Presets are designed to be created once, upfront, and not changed once defined. This reinforces a holistic design for a PWA should have in terms of the types of Schemas, global Models, and overall form the PWA takes, e.g whether to use the ShadowDOM or not.
 * 
 * Note: *This object is made immutable once created.*
 * 
 * @param      {Object | Presets}  preset_options  An Object containing configuration data to be used by Wick.
 * @memberof module:wick
 * @alias Presets
 */
class Presets {
    constructor(preset_options = {}) {

        this.store = (preset_options.store instanceof Store) ? preset_options.store : null;
        
        /**
         * {Object} Store for optional parameters used in the app
         */
        this.options = {
            USE_SECURE:true,
            USE_SHADOW:false,
        };

        //Declaring the properties upfront to give the VM a chance to build an appropriate virtual class.
        this.components = {};

        this.custom_components = {};

        /** 
         * Store of user defined CustomSourcePackage factories that can be used in place of the components built by the Wick templating system. Accepts any class extending the CustomComponent class. Adds these classes from preset_options.custom_sources or preset_options.components. 
         * 
         * In routing mode, a HTML `<component>` tag whose first classname matches a property name of a member of presets.custom_sources will be assigned to an instance of that member.
         * 
         * ### Example
         * In HTML:
         * ```html
         * <component class="my_source class_style">
         * 
         * ```
         * In JavaScript:
         * ```javascript
         * let MySource = CustomSourcePackage( ele =>{
         *      ele.append
         * }, {});
         * 
         * preset_options.custom_componets = {
         *      my_source : MySource
         * }
         * ```
         * @instance
         * @readonly
         */
        this.custom_sources = {};

        /**
         * { Object } Store of user defined classes that extend the Model or Model classes. `<w-source>` tags in templates that have a value set for the  `schema` attribute, e.g. `<w-s schema="my_favorite_model_type">...</w-s>`, will be bound to a new instance of the class in presets.schema whose property name matches the "schema" attribute.
         * 
         * Assign classes that extend Model or SchemedModel to preset_options.schemas to have them available to Wick.
         * 
         * In JavaScript:
         * ```javascript
         * class MyFavoriteModelType extends Model {};
         * preset_options.custom_componets = {
         *      my_favorite_model_type : MyFavoriteModelType
         * }
         * ```
         * note: presets.schema.any is always assigned to the Model class.
         * @instance
         * @readonly
         */
        this.schemas = { any: Model };

        /**
         * { Object } Store of user defined Model instances that serve as global models, which are available to the whole application. Multiple Sources will be able to _bind_ to the Models. `<w-source>` tags in templates that have a value set for the  `model` attribute, e.g. `<w-s model="my_global_model">...</w-s>`, will be bound to the model in presets .model whose property name matches the "model" attribute.
         * 
         * Assign instances of Model or Model or any class that extends these to preset_options.models to have them used by Wick.
         * 
         * In JavaScript:
         * ```javascript
         * const MyGlobalModel = new Model({global_data: "This is global!"});
         * preset_options.custom_componets = {
         *      my_global_model : MyGlobalModel
         * }
         * ```
         * @instance
         * @readonly
         */
        this.models = {};

        /**
         * Configured by `preset_options.USE_SHADOW`. If set to true, and if the browser supports it, compiled and rendered template elements will be bound to a `<component>` shadow DOM, instead being appended as a child node.
         * @instance
         * @readonly
         */
        this.USE_SHADOW = false;

        /**
         * { Object } Contains all user defined HTMLElement templates 
         */
        this.templates = {};

        /**
         * Custom objects that can be used throughout component scripts. User defined. 
         */
        this.custom = preset_options.custom;

        let c = preset_options.options;
        if (c)
            for (let cn in c)
                this.options[cn] = c[cn];


        c = preset_options.components;
        if (c)
            for (let cn in c)
                this.components[cn] = c[cn];

        c = preset_options.custom_sources;
        if (c)
            for (let cn in c)
                if (cn instanceof CustomComponent)
                    this.custom_sources[cn] = c[cn];

        c = preset_options.custom_components;
        if (c)
            for (let cn in c)
                    this.custom_components[cn] = c[cn];

        c = preset_options.models;
        
        if (c)
            for (let cn in c)
                if (c[cn] instanceof ModelBase)
                    this.models[cn] = c[cn];

        c = preset_options.schemas;
        if (c)
            for (let cn in c)
                if (ModelBase.isPrototypeOf(c[cn]))
                    this.schemas[cn] = c[cn];

        this.options.USE_SHADOW = (this.options.USE_SHADOW) ? (DOC.head.createShadowRoot || DOC.head.attachShadow) : false;

        Object.freeze(this.options);
        Object.freeze(this.custom_sources);
        Object.freeze(this.schemas);
        Object.freeze(this.models);


        //Object.freeze(this);
    }

    processLink(link){}
}

/**
 *   This is used by Model to create custom property getter and setters on non-ModelContainerBase and non-Model properties of the Model constructor.
 *   @protected
 *   @memberof module:wick~internals.model
 */
function CreateSchemedProperty(object, scheme, schema_name, index) {
    if (object[schema_name])
        return;

    Object.defineProperty(object, schema_name, {
        configurable: false,
        enumerable: true,
        get: function() {
            return this.getHook(schema_name, this.prop_array[index]);
        },
        set: function(value) {

            let result = { valid: false };

            let val = scheme.parse(value);

            scheme.verify(val, result);

            if (result.valid && this.prop_array[index] != val) {
                this.prop_array[index] = this.setHook(schema_name, val);
                this.scheduleUpdate(schema_name);
                this._changed_ = true;
            }
        }
    });
}

/**
    This is used by Model to create custom property getter and setters on Model properties of the Model constructor.
    @protected
    @memberof module:wick~internals.model
*/
function CreateModelProperty(object, model, schema_name, index) {

    Object.defineProperty(object, schema_name, {
        configurable: false,
        enumerable: true,
        get: function() {

            let m = this.prop_array[index];

            if (!m) {
                let address = this.address.slice();
                address.push(index);
                m = new model(null, this.root, address);
                m.par = this;
                m.prop_name = schema_name;
                m.MUTATION_ID = this.MUTATION_ID;
                this.prop_array[index] = m;
            }

            return this.getHook(schema_name, m);
        }
    });
}

class SchemedModel extends ModelBase {

    constructor(data, root = null, address = [], _schema_ = null) {

        super(root, address);

        if (this.constructor === SchemedModel)
            this.constructor = (class extends SchemedModel {});

        if (!this.schema) {

            let schema = this.constructor.schema || _schema_;

            this.constructor.schema = schema;

            if (schema) {

                let __FinalConstructor__ = schema.__FinalConstructor__;

                let constructor = this.constructor;
                let prototype = constructor.prototype;

                if (!__FinalConstructor__) {
                    let count = 0;
                    let look_up = {};

                    for (let schema_name in schema) {
                        let scheme = schema[schema_name];

                        if (schema_name == "self" && Array.isArray(scheme)) 
                            return new SchemedContainer(schema, root, address);
                        

                        if (schema_name == "getHook") {
                            prototype.getHook = scheme;
                            continue;
                        }

                        if (schema_name == "setHook") {
                            prototype.setHook = scheme;
                            continue;
                        }

                        if (schema_name == "proto") {
                            for (let name in schema.proto)
                                _SealedProperty_(prototype, name, schema.proto[name]);
                            count++;
                            continue;
                        }

                        if (typeof(scheme) == "function") {
                            CreateModelProperty(prototype, scheme, schema_name, count);
                            count++;
                            continue;
                        }

                        if (typeof(scheme) == "object") {
                            if (Array.isArray(scheme)) {
                                if (scheme[0] && scheme[0].container && scheme[0].schema)
                                    CreateModelProperty(prototype, scheme[0], schema_name, count);
                                else if (scheme[0] instanceof ModelContainerBase)
                                    CreateModelProperty(prototype, scheme[0].constructor, schema_name, count);
                                else
                                    CreateModelProperty(prototype, Model, schema_name, count);
                            } else if (scheme instanceof SchemeConstructor)
                                CreateSchemedProperty(prototype, scheme, schema_name, count);
                            else {
                                CreateModelProperty(prototype, scheme.constructor, schema_name, count);
                            }
                        } else {
                            console.warn(`Could not create property ${schema_name}.`);

                            continue;
                        }

                        look_up[schema_name] = count;
                        count++;
                    }



                    _SealedProperty_(prototype, "prop_offset", count);
                    _SealedProperty_(prototype, "look_up", look_up);
                    _SealedProperty_(prototype, "changed", false);

                    Object.seal(constructor);

                    schema.__FinalConstructor__ = constructor;
                    //_FrozenProperty_(schema, "__FinalConstructor__", constructor);

                    //Start the process over with a newly minted Model that has the properties defined in the Schema
                    return new schema.__FinalConstructor__(data, root, address);
                }

                _FrozenProperty_(prototype, "schema", schema);
            } else
                return new Model(data, root, address);
        }

        Object.defineProperty(this, "prop_array", { value: new Array(this.prop_offset), enumerable: false, configurable: false, writable: true });

        if (data)
            this.set(data, true);
    }

    set(data, FROM_ROOT = false) {

        if (!FROM_ROOT)
            return this._deferUpdateToRoot_(data).set(data, true);

        if (!data)
            return false;

        this._changed_ = false;

        for (let prop_name in data) {

            let data_prop = data[prop_name];

            let index = this.look_up[prop_name];

            if (index !== undefined) {

                let prop = this[prop_name];

                if (typeof(prop) == "object") {

                    if (prop.MUTATION_ID !== this.MUTATION_ID) {
                        prop = prop.clone();
                        prop.MUTATION_ID = this.MUTATION_ID;
                        this.prop_array[index] = prop;
                    }

                    if (prop.set(data_prop, true))
                        this.scheduleUpdate(prop_name);

                } else {
                    this[prop_name] = data_prop;
                }
            }
        }

        return this._changed_;
    }

    destroy() { this.root = null; }

    _createProp_() {}
}

class SchemedContainer extends ArrayModelContainer {
    
    constructor(schema, root, address) {

        super(schema.self, root, address);

        if (schema.proto)
            for (let name in schema.proto)
                _SealedProperty_(this, name, schema.proto[name]);
    }
}

/**
 * Base class for an object that binds to and observes a Model.
 *@alias module:wick.core.view
 */
class View{

	constructor(){
		/**
		 * property
		 */
		this.nx = null;
		this.pv = null;
		this .model = null;
	}

	/**
     * Unbinds the View from its Model and sets all properties to undefined. Should be called by any class extending View
	 * ``` js
	 * class ExtendingView extends wick.core.view.View{
	 * 		destroy(){
	 * 			//... do some stuff ...
	 * 			super.destroy();
	 * 		}
	 * }
	 * ```
     * @protected
     */
	destroy(){

		if(this .model)
			this .model.removeView(this);
	
		this .model = undefined;
		this.nx = undefined;
	}	
	/**
		Called by a Model when its data has changed.
	*/
	update(data){

	}
	/**
		Called by a ModelContainerBase when an item has been removed.
	*/
	removed(data){

	}

	/**
		Called by a ModelContainerBase when an item has been added.
	*/
	added(data){

	}
	setModel(model){
	}

	reset(){
		
	}
	unsetModel(){

		this.nx = null;
		this .model = null;
	}
}

class SourceManager {

    constructor(model, element) {
        this.sources = [];
        this.model = model;
        this.ele = element;
        this.index = -1;
        this._APPEND_STATE_ = false;
        this._TRANSITION_STATE_ = false;
        this._DESTROYED_ = false;
        this.parent = null;
    }

    get element() {
        if (!this.ele)
            this.ele = this.sources[0].ele;
        return this.ele;
    }

    destroy() {
        for (let i = 0; i < this.sources.length; i++)
            this.sources[i].destroy();
        this.source = null;
        this.model = null;
        this.ele = null;
        this._DESTROYED_ = true;
        this.parent = null;
    }

    emit(name, value) {
        for (let i = 0; i < this.sources.length; i++)
            this.sources[i].upImport(name, value, {
                event: {}
            });
    }

    appendToDOM(element, before_element) {
        this._APPEND_STATE_ = true;
        if (before_element)
            element.insertBefore(this.element, before_element);
        else
            element.appendChild(this.element);
    }

    _removeFromDOM_() {

        if (this._APPEND_STATE_ == true) return;

        if (this.ele && this.ele.parentElement)
            this.ele.parentElement.removeChild(this.ele);
    }

    transitionIn(transition, transition_name = "trs_in") {

        if (transition) {
            let data = {};

            data[transition_name] = transition;

            this.update(data);
        }

        this._TRANSITION_STATE_ = true;
    }

    transitionOut(transition, transition_name = "trs_out", DESTROY_ON_REMOVE = false) {

        this._APPEND_STATE_ = false;

        if (this._TRANSITION_STATE_ === false) {
            // if (DESTROY_ON_REMOVE && !this._DESTROYED_) this.destroy();
            this._removeFromDOM_();
            return;
        }

        let transition_time = 0;

        if (transition) {
            let data = {};

            data[transition_name] = transition;

            this.update(data);

            if (transition.trs)
                transition_time = transition.trs.out_duration;
            else
                transition_time = transition.out_duration;
        }


        this._TRANSITION_STATE_ = false;


        /*
        for (let i = 0, l = this.sources.length; i < l; i++) {

            let ast = this.sources[i].ast;

            let css = ast.css;

            let hooks = this.sources[i].hooks;

            for (let i = 0, l = hooks.length; i < l; i++) {

                let hook = hooks[i];

                if (!hook) continue;
                let ele = hook.ele;

                if (ele.getAttribute("trs") == "out") continue;
                ele.setAttribute("trs", "out");

                if (css) {
                    let rule = css.getApplicableRules(ele);

                    for (let name in rule.props)
                        if (name == "transition")
                            for (let i = 0, prop = rule.props[name]; i < prop.length; i++) {
                                let sub_prop = prop[i];
                                if (!isNaN(sub_prop))
                                    transition_time = Math.max(transition_time, sub_prop.milliseconds);

                            }

                    if (hook.style)
                        hook.style._setRule_(rule);
                    else {
                        //ele.style = rule + "";
                    }
                }
            }
        }*/

        if (transition_time > 0)
            setTimeout(() => {
                this._removeFromDOM_();
                if (DESTROY_ON_REMOVE) this.destroy();
            }, transition_time + 2);
        else {
            this._removeFromDOM_();
            if (DESTROY_ON_REMOVE) this.destroy();
        }

        return transition_time;
    }

    upImport(prop_name, data, meta) {
        if (this.parent)
            this.parent.up(prop_name, data, meta, this);
    }

    down(data, changed_values) {
        for (let i = 0, l = this.sources.length; i < l; i++)
            this.sources[i].down(data, changed_values);
    }

    update(data, changed_values) {
        for (let i = 0, l = this.sources.length; i < l; i++)
            this.sources[i].update(data, changed_values);
    }

    bubbleLink() {
        if (this.parent && this.parent.bubbleLink)
            this.parent.bubbleLink(this);
        else
            debugger
    }
}

/** NODE TYPE IDENTIFIERS **/
const HTML = 0;
const TEXT$1 = 1;
const offset = "    ";

/**
 * A node for text data.
 * @param  {string}  str     The text value of the node.
 */
class TextNode {

    constructor(str = "") {
        /**
         * The text value
         */
        this.txt = str;
    }

    /**
     * Returns the type of `1` (`TEXT`)
     */
    get type() {
        return TEXT$1;
    }

    /**
     * Returns a string representation of the object.
     * @param      {string}  str     Optional string passed down from calling method.
     * @return     {string}  String representation of the object.
     */
    toString(off = 0) {
        return `${offset.repeat(off)} ${this.txt}\n`;
    }

    /**
     * Builds a real DOM HTMLTextNode node. 
     * @param      {HTMLElement}  parent  The real html element.
     */
    build(parent) {
        parent.appendChild(document.createTextNode(this.txt));
    }

}

LinkedList.mixinTree(TextNode);


/**
 * A node for HTML data. 
 * Handles the parsing of HTML strings.
 */
class HTMLNode {

    constructor() {

        /**
         * Element attributes
         * @public
         */
        this.attributes = [];

        /**
         * Any Comment Lines found within.
         * @private
         */
        //this.dtd_nodes = [];

        /**
         * The tag name of the object.
         * @public
         */
        this.tag = "";

        /**
         * A URL instance when set.
         * @private
         */
        this.url = null;

        /**
         * Whether the node is a DTD, such as a comment.
         * @private
         */
        this.DTD = false;

        /**
         * True if the element is a single tag element. 
         */
        this.single = false;

    }



    /******************************************* ATTRIBUTE AND ELEMENT ACCESS ******************************************************************************************************************/



    /**
     * Returns the type of `0` (`HTML`)
     * @public
     */
    get type() {
        return HTML;
    }

    get tagName() {
        return this.tag.toUpperCase();
    }

    get classList() {
        let classes = this.getAttrib("class");
        if (typeof classes.value == "string")
            return classes.split(" ");
        return [];
    }

    getAttribute(name) {
        let attrib = this.getAttrib(name);
        return (attrib) ? attrib.value : void 0;
    }

    get parentElement() {
        return this.par;
    }

    get previousElementSibling() {
        if (this.par) {
            let guard = this.par.fch;

            if (this == guard) return null;

            let node = this.prv;

            while (node && node != gaurd) {
                if (node.type == HTML)
                    return node;
                node = node.prv;
            }

            if (node.type == HTML)
                return node;
        }
        return null;
    }

    get nextElementSibling() {
        if (this.par) {
            let guard = this.par.fch;

            let node = this.nxt;

            while (node && node != guard) {
                if (node.type == HTML)
                    return node;
                node = node.nxt;
            }
        }
        return null;
    }



    /**
     * Gets an attribute.
     * @param      {string}  prop    The attribute name to lookup;
     * @public
     */
    getAttrib(prop) {
        for (let i = -1, l = this.attributes.length; ++i < l;) {
            let attrib = this.attributes[i];
            if (attrib.name == prop) return attrib;
        }
        return null;
    }



    /**
     * Get Elements by the tag name.
     * @param      {string}   tag                  A string to match with the element's tag value.
     * @param      {boolean}  [INCLUDE_DESCENDANTS=false]  When `true` searching will recurse depth first into child elements.
     * @param      {Array}    array                Internal element store that is returned. 
     * @return     {Array}    An array of matched elements.
     * @public
     */
    getTag(tag, INCLUDE_DESCENDANTS = false, array = []) {
        for (let node = this.fch; node;
            (node = this.getNextChild(node))) {
            if (node.type == HTML) {
                if (node.tag == tag) array.push(node);
                if (INCLUDE_DESCENDANTS) node.getTag(tag, INCLUDE_DESCENDANTS, array);
            }
        }
        return array;
    }



    /**
     * Get Elements by the tag name.
     * @param      {string}   _class               A string to find with the element's class value.
     * @param      {boolean}  [INCLUDE_DESCENDANTS=false]  When `true` searching will recurse depth first into child elements.
     * @param      {Array}    array                Internal element store that is returned. 
     * @return     {Array}    An array of matched elements.
     * @public
     */
    getClass(_class, INCLUDE_DESCENDANTS = false, array = []) {
        for (let node = this.fch; node;
            (node = this.getNextChild(node))) {
            if (node.type == HTML) {
                if (node.class.includes(_class)) array.push(node);
                if (INCLUDE_DESCENDANTS) node.getClass(_class, INCLUDE_DESCENDANTS, array);
            }
        }
        return array;
    }



    /**
     * Get first element with matching id.
     * @param      {string}   id                   The identifier value to find.
     * @param      {boolean}  [INCLUDE_DESCENDANTS=false]  When `true` searching will recurse depth first into child elements.
     * @return     {HTMLNode}   The first element whose id matches.
     * @public
     */
    getID(id, INCLUDE_DESCENDANTS = false) {
        for (let node = this.fch, ch; node;
            (node = this.getNextChild(node))) {
            if (node.type == HTML) {
                if (node.id == id) return node;
                if (INCLUDE_DESCENDANTS && (ch = node.getID(id, INCLUDE_DESCENDANTS))) return ch;
            }
        }
        return null;
    }



    /**
     * The id attribute value.
     * @public
     */
    get id() {
        let id_attrib = this.getAttrib("id");
        return (id_attrib) ? id_attrib.value : "";
    }



    /**
     * The class attribute value.
     * @public
     */
    get class() {
        let id_attrib = this.getAttrib("class");
        return (id_attrib) ? id_attrib.value : "";
    }



    /**
     * Returns a string representation of the object.
     * @return     {string}  String representation of the object.
     * @public
     */
    toString(off = 0) {
        let o = offset.repeat(off);

        let str = `${o}<${this.tag}`,
            atr = this.attributes,
            i = -1,
            l = atr.length;

        while (++i < l) {
            let attr = atr[i];
            str += ` ${attr.name}="${attr.value}"`;
        }

        str += ">\n";
        
        if(this.single)
            return str;

        for (let node = this.fch; node;
            (node = this.getNextChild(node))) {
            str += node.toString(off+1);
        }

        return str + `${o}</${this.tag}>\n`;
    }



    /******************************************* PARSING ******************************************************************************************************************/



    /**
     * Creates a text node. 
     *
     * @param      {Lexer} - A Lexical tokenizing object supporting methods found in {@link Lexer}
     * @param      {start}  start   The starting point of the data slice
     * @private
     */
    createTextNode(lex, start, end) {
        if (end) {
            let other_lex = lex.copy();
            other_lex.IWS = true;
            other_lex.off = start - 1;
            other_lex.tl = 1;
            other_lex.sl = end;
            let text_node = this.processTextNodeHook(other_lex.n, true);
            if (text_node) this.addChild(text_node);
        } else if (start < lex.off) {
            let other_lex = lex.copy();
            other_lex.off = start;
            other_lex.END = false;
            other_lex.tl = 0;
            other_lex.fence(lex);
            other_lex.IWS = false;
            other_lex.n;
            other_lex.IWS = true;

            if ((other_lex.sl - other_lex.off) < 2){
                //TODO
                throw new Error("Unexpected end of input");
            }

            let text_node = this.processTextNodeHook(other_lex, false);
            if (text_node) this.addChild(text_node);
        }
    }



    /**
     * Parses an HTML open tag.
     * @param {Lexer} - A Lexical tokenizing object supporting methods found in {@link Lexer}  
     * @param {Object} attribs - An object which will receive the attribute keys and values. 
     * @private
     */
    parseOpenTag(lex, DTD, old_url) {
        let HAS_URL = false;

        while (!lex.END && lex.text !== ">" && lex.text !== "/") {


            if (DTD && lex.ch == "-" && lex.pk.ch == "-") {
                //parse comment

                let pk = lex.pk;
                if (!lex.text) throw Error("Unexpected end of input.");
                let a = pk.n.ch,
                    b = pk.n.ch;
                while (!pk.END && (b !== "-" || a !== "-")) {
                    a = b;
                    b = pk.n.tx;
                }
                lex.sync().n;
                continue;
            }

            lex.IWS = false;
            
            let pk = lex.pk;
            
            while (!pk.END && !(pk.ty & (pk.types.ws | pk.types.str | pk.types.nl)) && pk.ch !== "=" && pk.ch !== ">") { pk.n; }
            
            let attrib_name = pk.slice(lex).trim();
            
            lex.sync(); 
            
            lex.IWS = true;

            let out_lex = lex.copy();
            
            out_lex.sl = lex.off;

            if (lex.ch == "=") {
                let pk = lex.pk;

                let start = pk.off;

                pk.IWS = true;
                while (!(pk.ty & (pk.types.ws | pk.types.str | pk.types.nl)) && pk.ch !== ">") { pk.n; }
                pk.IWS = false;

                if (pk.off > start) {
                    out_lex = lex.n.copy();
                    out_lex.fence(pk);
                    lex.sync();
                } else {
                    //Have simple value
                    lex.sync(pk);
                    out_lex = lex.copy();
                    if (lex.pos < 0)
                        lex.throw(`Unexpected end of input. Expecting value for attribute "${attrib_name}"`);
                    else if (lex.type == lex.types.str) {
                        out_lex.tl = 1;
                        out_lex.n;
                        out_lex.sl = lex.pos + lex.tl - 1;
                        lex.n;
                    } else {
                        lex.next();
                        out_lex.fence(lex);
                    }
                }
            }

            if (attrib_name == "url") {
                this.url = URL.resolveRelative(old_url, out_lex.slice());
                HAS_URL = true;
            }

            let attrib = this.processAttributeHook(attrib_name, out_lex);

            if (attrib)
                this.attributes.push(attrib);
        }

        if (lex.text == "/") // Void Nodes
            lex.assert("/");

        return HAS_URL;
    }

    parseRunner(lex = null, OPENED = false, IGNORE_TEXT_TILL_CLOSE_TAG = false, parent = null, old_url = new URL(0, !!1)) {
        let start = lex.pos;
        let end = lex.pos;
        let HAS_INNER_TEXT = false;
        main_loop:
        while (!lex.END) {
            switch (lex.ch) {
                case "/":
                    if (lex.pk.ch == "<") { //ignore the white space.
                        lex.sync();
                        break;
                    }
                    break;

                case "<":
                    if (!IGNORE_TEXT_TILL_CLOSE_TAG) lex.IWS = true;

                    let pk = lex.pk;

                    if (pk.ch == "/") {
                        if (pk.pk.tx !== this.tag){
                             break main_loop;   
                        }

                        if (HAS_INNER_TEXT) {
                            if (IGNORE_TEXT_TILL_CLOSE_TAG)
                                this.createTextNode(lex, start);
                            else if ((end - start) > 0)
                                this.createTextNode(lex, start, end);
                        }

                        //Close tag
                        let name = lex.sync().n.tx;

                        //Close tag is not the one we are looking for. We'll create a new dummy node and close the tag with it. 
                        if (name !== this.tag) {
                            //Create new node with the open tag 
                            let insert = new HTMLNode();
                            insert.tag = name;
                            this.addChild(insert);
                        }

                        lex.n;
                        lex.IWS = false;
                        lex.a(">");

                        this.endOfElementHook(lex, parent);

                        return this;
                    }

                    if (pk.ch == "!") {
                        /* DTD - Doctype and Comment tags*/
                        //This type of tag is dropped
                        while (!lex.END && lex.n.ch !== ">") {}
                        lex.a(">");
                        continue;
                    }

                    if (!IGNORE_TEXT_TILL_CLOSE_TAG) {
                        //Open tag
                        if (!OPENED) {
                            let URL$$1 = false;
                            this.DTD = false;
                            this.attributes.length = 0;

                            //Expect tag name 
                            this.tag = lex.n.tx.toLowerCase();


                            URL$$1 = this.parseOpenTag(lex.n, false, old_url);
                            start = lex.pos + 1;
                            lex.IWS = false;
                            if (lex.ch == "/") lex.n;
                            lex.a(">");


                            OPENED = true;

                            HAS_INNER_TEXT = IGNORE_TEXT_TILL_CLOSE_TAG = this.ignoreTillHook(this.tag);

                            if (URL$$1) {

                                //Need to block against ill advised URL fetches. 

                                //Hook to pull in data from remote resource
                                let prom = this.processFetchHook(lex, true, IGNORE_TEXT_TILL_CLOSE_TAG, parent);

                                if (prom instanceof Promise) {
                                    return prom.then(() => {
                                        if (this.selfClosingTagHook(this.tag)) {
                                            return this;
                                        } // Tags without matching end tags.
                                        return this.parseRunner(lex, true, IGNORE_TEXT_TILL_CLOSE_TAG, this, old_url);
                                    });
                                }
                            }

                            if (this.selfClosingTagHook(this.tag)){
                                 // Tags without matching end tags.
                                this.single = true;
                                return this;
                            }

                            continue;
                        } else {
                            lex.IWS = false;
                            //Create text node;
                            if (HAS_INNER_TEXT) {
                                if (IGNORE_TEXT_TILL_CLOSE_TAG)
                                    this.createTextNode(lex, start);
                                else if ((end - start) > 0) {
                                    this.createTextNode(lex, start, end);
                                }
                            }

                            //New Child node found
                            let node = this.createHTMLNodeHook(lex.pk.tx, lex.off);

                            this.addChild(node);

                            let prom = node.parseRunner(lex, false, false, this, this.url || old_url);
                            
                            if(prom instanceof Promise){
                                return prom.then(child => {
                                    if (child.DTD) this.removeChild(child);
                                    return this.parseRunner(lex, OPENED, false, this, old_url);
                                });    
                            }else{
                                if (node.DTD) this.removeChild(node);
                                return this.parseRunner(lex, OPENED, false, this, old_url);
                            }
                            
                        }
                        //}
                    }
                    lex.IWS = false;
                    break;
            }

            if (!IGNORE_TEXT_TILL_CLOSE_TAG) {
                if (lex.ty == 8 && !HAS_INNER_TEXT) {
                    start = lex.pos;
                } else if (lex.ty == 256) {} else {
                    HAS_INNER_TEXT = true;
                    end = lex.off + lex.tl;
                }
            }

            lex.n;
        }

        if (OPENED && start < lex.off) {
            //Got here from an network import, need produce a text node;
            this.createTextNode(lex, start);
        }

        return this;
    }

    /**
     * Parses HTML string. Appends new nodes, or consumes first node if tag is an empty string.
     * @param      {Lexer} - A Lexical tokenizing object supporting methods found in {@link Lexer}
     * @param      {boolean}  OPENED       The opened
     * @param      {boolean}  IGNORE_TEXT_TILL_CLOSE_TAG  If `true`, parser will ignore all HTML syntax until the closing tag is found.
     * @return     {Promise}  
     * @private
     */
    parse(lex, url =  new URL(0, !!1)) {
        
        if(typeof(lex) == "string") lex = whind$1(lex);
        
        lex.IWS = false;
        
        return new Promise((res, rej) => {
            res(this.parseRunner(lex, false, false, null, url));
        });
    }

    /******************************************* HOOKS ******************************************************************************************************************/

    endOfElementHook() {}

    selfClosingTagHook(tag) {
        switch (tag) {
            case "input":
            case "br":
            case "img":
            //svg
            case "rect":
                return true;
        }

        return false;
    }

    ignoreTillHook(tag) {
        if (tag == "script" || tag == "style") // Special character escaping tags.
            return true;
        return false;
    }

    createHTMLNodeHook(tag, start) { return new HTMLNode(tag); }

    processFetchHook(lexer, OPENED, IGNORE_TEXT_TILL_CLOSE_TAG, parent, url) {
        let path$$1 = this.url.path,
            CAN_FETCH = true;

        //make sure URL is not already called by a parent.
        while (parent) {
            if (parent.url && parent.url.path == path$$1) {
                console.warn(`Preventing recursion on resource ${this.url.path}`);
                CAN_FETCH = false;
                break;
            }
            parent = parent.par;
        }

        if (CAN_FETCH) {
            return this.url.fetchText().then((text) => {
                let lexer = whind$1(text);
                return this.parseRunner(lexer, true, IGNORE_TEXT_TILL_CLOSE_TAG, this, this.url);
            }).catch((e) => {
                console.error(e);
            });
        }
        return null;
    }

    processAttributeHook(name, lex) { return { name, value: lex.slice() }; }
    
    processTextNodeHook(lex, IS_INNER_HTML) {
        if (!IS_INNER_HTML)
            return new TextNode(lex.slice());
        let txt = "";

        lex.IWS = true;

        while (!lex.END) {
            if (lex.ty == 8) {
                txt += " ";
            } else if (lex.ty == 256) {} else {
                txt += lex.tx;
            }
            lex.IWS = false;
            lex.n;
        }

        if(!(lex.ty & (8 | 256)))
            txt += lex.tx;

        if (txt.length > 0) {
            return new TextNode(txt.trim());
        }

        return null;
    }

    build(parent) {
        let ele = document.createElement(this.tag);

        for (let i = 0, l = this.attributes.length; i < l; i++) {
            let attr = this.attributes[i];
            ele.setAttribute(attr.name, attr.value);
        }
        //let passing_element = ele;
        let passing_element = (this.tag == "template") ? ele.content : ele;

        for (let node = this.fch; node;
            (node = this.getNextChild(node))) {
            node.build(passing_element);
        }

        if (parent) parent.appendChild(ele);

        return ele;
    }
}

 LinkedList.mixinTree(HTMLNode);


/**
 * Builds an HTML AST. 
 * @function
 * @param {string} html_string - A string containing HTML data.
 * @param {string} css_string - An existing CSSRootNode to merge with new `selectors` and `rules`.
 * @return {Promise} Returns a `Promise` that will return a new or existing CSSRootNode.
 * @memberof module:wick.core
 * @alias html
 */
const HTMLParser = (html_string, root = null, url) => (root = (!root || !(root instanceof HTMLNode)) ? new HTMLNode() : root, root.parse(whind$1(html_string.replace(/\&lt;/g, "<").replace(/\&gt;/g, ">"), url)));

// Mode Flag
const KEEP = 0;
const IMPORT = 1;
const EXPORT = 2;
const PUT = 4;

/**
 * Gateway for data flow. Represents a single "channel" of data flow. 
 * 
 * By using different modes, one can control how data enters and exits the source context.
 * -`keep`: 
 *  This mode is the default and treats any data on the channel as coming from the model. The model itself is not changed, and any data flow from outside the source context is ignored.
 * -`put`:
 *  This mode will update the model to reflect updates on the channel.
 * -`import`:
 *  This mode will allow data from outside the source context to enter the context as if it came from the model.
 *  -`export`:
 *  This mode will propagate data flow to the outer source context, allowing other sources to listen on the data flow of the originating source context.
 *  
 *  if `import` is active, then `keep` is implicitly inactive and the model no longer has any bearing on the value of the channel.
 */
class Tap {

    constructor(source, prop, modes = 0) {
        this._source_ = source;
        this._prop_ = prop;
        this._modes_ = modes; // 0 implies keep
        this.ios = [];

        if (modes & IMPORT && source.parent)
            source.parent.getTap(prop).ios.push(this);

    }

    destroy() {

        for (let i = 0, l = this.ios.length; i < l; i++)
            this.ios[i].destroy();

        this.ios = null;
        this._source_ = null;
        this._prop_ = null;
        this._modes_ = null;
    }

    load(data) {
        this.downS(data);
    }

    down(value, meta) {
        for (let i = 0, l = this.ios.length; i < l; i++) {
            this.ios[i].down(value, meta);
        }
    }

    downS(model, IMPORTED = false) {
        const value = model[this._prop_];

        if (typeof(value) !== "undefined") {

            if (IMPORTED) {
                if (!(this._modes_ & IMPORT))
                    return;

                if ((this._modes_ & PUT) && typeof(value) !== "function") {
                    this._source_.model[this._prop_] = value;
                }

            }

            for (let i = 0, l = this.ios.length; i < l; i++) {
                if (this.ios[i] instanceof Tap) {
                    this.ios[i].downS(model, true);
                } else
                    this.ios[i].down(value);
            }
        }
    }

    up(value, meta) {

        if (!(this._modes_ & (EXPORT | PUT)))
            this.down(value, meta);

        if ((this._modes_ & PUT) && typeof(value) !== "undefined") {
            this._source_.model[this._prop_] = value;
        }

        if (this._modes_ & EXPORT)
            this._source_.up(this, value, meta);



    }
}

class UpdateTap extends Tap {
    downS(model) {
        for (let i = 0, l = this.ios.length; i < l; i++)
            this.ios[i].down(model);
    }
    up() {}
}

class Source extends View {

    /**
     *   In the Wick dynamic template system, Sources serve as the primary access to Model data. They, along with {@link SourceTemplate}s, are the only types of objects the directly _bind_ to a Model. When a Model is updated, the Source will transmit the updated data to their descendants, which are comprised of {@link Tap}s and {@link SourceTemplate}s.
     *   A Source will also _bind_ to an HTML element. It has no methodes to update the element, but it's descendants, primarily instances of the {@link IO} class, can update attributes and values of then element and its sub-elements.
     *   @param {Source} parent - The parent {@link Source}, used internally to build a hierarchy of Sources.
     *   @param {Object} data - An object containing HTMLELement attribute values and any other values produced by the template parser.
     *   @param {Presets} presets - An instance of the {@link Presets} object.
     *   @param {HTMLElement} element - The HTMLElement the Source will _bind_ to.
     *   @memberof module:wick~internals.source
     *   @alias Source
     *   @extends SourceBase
     */
    constructor(parent, presets, element, ast) {
        super();

        this.ast = null;

        ast.setSource(this);
        
        /**
         *@type {Boolean} 
         *@protected
         */


        this.parent = parent;
        this.ele = element;
        this.presets = presets;
        this.model = null;
        this.statics = null;

        this.taps = {};
        this.update_tap = null;
        this.children = [];
        this.sources = [];
        this.badges = {};
        this.ios = [];
        this.templates = [];
        this.hooks = [];

        this._model_name_ = "";
        this._schema_name_ = "";

        this.DESTROYED = false;
        this.LOADED = false;

        this.addToParent();
    }

    destroy() {

        this.DESTROYED = true;

        this.update({ destroyed: true });

        if (this.LOADED) {
            this.LOADED = false;


            let t = 0; //this.transitionOut();
            /*
            for (let i = 0, l = this.children.length; i < l; i++) {
                let child = this.children[i];

                t = Math.max(t, child.transitionOut());
            }
            */
            if (t > 0)
                return setTimeout(() => { this.destroy(); }, t * 1000 + 5);
        }

        if (this.parent && this.parent.removeSource)
            this.parent.removeSource(this);
        //this.finalizeTransitionOut();
        this.children.forEach((c) => c.destroy());
        this.children.length = 0;
        this.data = null;

        if (this.ele && this.ele.parentElement)
            this.ele.parentElement.removeChild(this.ele);

        this.ele = null;

        for (let i = 0, l = this.sources.length; i < l; i++)
            this.sources[i].destroy();


        super.destroy();

    }

    getBadges(par) {
        for (let a in this.badges) {
            if (!par.badges[a])
                par.badges[a] = this.badges[a];
        }
    }

    addToParent() {
        if (this.parent)
            this.parent.sources.push(this);
    }

    addTemplate(template) {
        template.parent = this;
        this.templates.push(template);
    }

    addSource(source) {
        if (source.parent == this)
            return;
        source.parent = this;
        this.sources.push(source);
    }

    removeSource(source) {
        if (source.parent !== this)
            return;

        for (let i = 0; i < this.sources.length; i++)
            if (this.sources[i] == source)
                return (this.sources.splice(i, 1), source.parent = null);
    }

    removeIO(io) {
        for (let i = 0; i < this.ios.length; i++)
            if (this.ios[i] == io)
                return (this.ios.splice(i, 1), io.parent = null);
    }

    getTap(name) {
        let tap = this.taps[name];

        if (!tap) {
            if (name == "update")
                this.update_tap = new UpdateTap(this, name);
            else
                tap = this.taps[name] = new Tap(this, name);
        }
        return tap;
    }

    /**
     * Return an array of Tap objects that
     * match the input array.
     */

    linkTaps(tap_list) {
        let out_taps = [];
        for (let i = 0, l = tap_list.length; i < l; i++) {
            let tap = tap_list[i];
            let name = tap.name;
            if (this.taps[name])
                out_taps.push(this.taps[name]);
            else {
                let bool = name == "update";
                let t = bool ? new UpdateTap(this, name, tap._modes_) : new Tap(this, name, tap._modes_);

                if (bool)
                    this.update_tap = t;

                this.taps[name] = t;
                out_taps.push(this.taps[name]);
            }
        }

        return out_taps;
    }

    /**
        Makes the source a view of the given Model. If no model passed, then the source will bind to another model depending on its `scheme` or `model` attributes. 
    */
    load(model) {
        let m = null, s = null;

      if(this.presets.models)
            m = this.presets.models[this._model_name_];
        if(this.presets.schemas)
            s = this.presets.schemas[this._schema_name_];
        
        if (m)
            model = m;
        else if (s) {
            model = new s();
        } else if (!model)
            model = new Model(model);

        let LOADED = this.LOADED;

        this.LOADED = true;

        for (let i = 0, l = this.sources.length; i < l; i++) {
            this.sources[i].load(model);
            this.sources[i].getBadges(this);
        }

        model.addView(this);

        for (let name in this.taps)
            this.taps[name].load(this.model, false);

        if(!LOADED)
            this.update({ created: true });
    }

    down(data, changed_values) {
        this.update(data, changed_values, true);
    }

    up(tap, data, meta) {
        if (this.parent)
            this.parent.upImport(tap._prop_, data, meta, this);
    }

    upImport(prop_name, data, meta) {
        if (this.taps[prop_name])
            this.taps[prop_name].up(data, meta);
    }

    update(data, changed_values, IMPORTED = false) {

        if (this.update_tap)
            this.update_tap.downS(data, IMPORTED);

        if (changed_values) {

            for (let name in changed_values)
                if (this.taps[name])
                    this.taps[name].downS(data, IMPORTED);
        } else
            for (let name in this.taps)
                this.taps[name].downS(data, IMPORTED);

        //        for (let i = 0, l = this.sources.length; i < l; i++)
        //            this.sources[i].down(data, changed_values);

        for (let i = 0, l = this.templates.length; i < l; i++)
            this.templates[i].down(data, changed_values);
    }

    transitionIn(transition) {

        if (this.taps.trs_in)
            this.taps.trs_in.downS(transition);

        for (let i = 0, l = this.sources.length; i < l; i++)
            this.sources[i].transitionIn(transition);

        for (let i = 0, l = this.templates.length; i < l; i++)
            this.templates[i].transitionIn(transition);
    }

    transitionOut(transition) {
        if (this.taps.trs_out)
            this.taps.trs_out.downS(transition);

        for (let i = 0, l = this.sources.length; i < l; i++)
            this.sources[i].transitionOut(transition);


        for (let i = 0, l = this.templates.length; i < l; i++)
            this.templates[i].transitionOut(transition);
    }

    bubbleLink(child) {
        if (child)
            for (let a in child.badges)
                this.badges[a] = child.badges[a];
        if (this.parent)
            this.parent.bubbleLink(this);
    }
}

class IOBase {

    constructor(parent) {
        parent.ios.push(this);
        this.parent = parent;
    }

    destroy() {
        this.parent.removeIO(this);
        this.parent = null;
    }

    down() {}
    up(value, meta) { this.parent.up(value, meta); }
}

/**
 *   The IO is the last link in the Source chain. It is responsible for putting date into the DOM through the element it binds to. Alternativly, in derived versions of `IO`, it is responsible for retriving values from user inputs from input elements and events.
 *   @param {Source} tap - The tap {@link Source}, used internally to build a hierarchy of Sources.
 *   @param {Object} data - An object containing HTMLELement attribute values and any other values produced by the template parser.
 *   @param {Presets} presets - An instance of the {@link Presets} object.
 *   @param {HTMLElement} element - The HTMLElement that the IO will _bind_ to.
 *   @memberof module:wick.core.source
 *   @alias IO
 *   @extends IOBase
 */
class IO extends IOBase {

    constructor(source, errors, tap, element = null) {
        super(tap);
        //Appending the value to a text node prevents abuse from insertion of malicious DOM markup. 
        this.ele = element;
    }

    destroy() {
        this.ele = null;
        super.destroy();
    }

    down(value) {
        this.ele.data = value;
    }
}

/**
    This IO object will update the attribute value of the watched element, using the "prop" property to select the attribute to update.
*/
class AttribIO extends IOBase {
    constructor(source, errors, tap, attr, element) {
        super(tap);

        this.attrib = attr;
        this.ele = element;
    }

    destroy() {
        this.ele = null;
        this.attrib = null;
        super.destroy();
    }

    /**
        Puts data into the watched element's attribute. The default action is to simply update the attribute with data._value_.  
    */
    down(value) {
        this.ele.setAttribute(this.attrib, value);
    }
}

class InputIO extends IOBase {

    constructor(source, errors, tap, element) {

        super(tap);

        this.ele = element;

        this.event = (e) => { this.parent.up(e.target.value, { event: e }); };

        this.ele.addEventListener("input", this.event);
    }

    destroy() {
        this.ele.removeEventListener("input", this.event);
        this.ele = null;
        this.event = null;
        this.attrib = null;
    }

    down(value) {
        this.ele.value = value;
    }
}

class BindIO extends IOBase {

    constructor(source, errors, tap) {
        super(tap);
        this._value_ = null;
        this.child = null;
    }

    destroy() {
        this._value_ = null;
        if (this.child) this.child.destroy();
        this.child = null;
        super.destroy();
    }

    /**
        Puts data into the watched element's attribute. The default action is to simply update the attribute with data._value_.  
    */
    down(value) {
        this._value_ = value;
        this.child.down();
    }
}

class TemplateString extends IOBase {

    constructor(source, errors, taps, element, binds) {

        super(source);
        this._SCHD_ = 0;
        this.binds = [];
        this.ele = element;
        this._setBindings_(source, errors, taps, binds);
    }

    destroy() {
        for (var i = 0; i < this.binds.length; i++)
            this.binds[i].destroy();
        this._SCHD_ = 0;
        this.binds = null;
        this.ele = null;
        super.destroy();
    }

    _setBindings_(source, errors, taps, binds) {
        for (var i = 0; i < binds.length; i++) {
            let bind = binds[i];

            switch (bind.type) {
                case 0: //DYNAMIC_BINDING_ID
                    let new_bind = new BindIO(source, errors, source.getTap(bind.tap_name), bind);
                    this.binds.push(new_bind);
                    new_bind.child = this;
                    //this.binds.push(msg._bind_(source, errors, taps, this));
                    break;
                case 1: //RAW_VALUE_BINDING_ID
                    this.binds.push(bind);
                    break;
                case 2: //TEMPLATE_BINDING_ID
                    if (bind._bindings_.length < 1) // Just a variable less expression.
                        this.binds.push({ _value_: msg.func() });
                    else
                        this.binds.push(bind._bind_(source, errors, taps, this));
                    break;
            }
        }
        this.down();
    }

    get data() {}
    set data(v) { spark.queueUpdate(this); }

    down() {
        spark.queueUpdate(this);
    }

    scheduledUpdate() {

        let str = [];

        for (let i = 0; i < this.binds.length; i++)
            str.push(this.binds[i]._value_);

        this.ele.data = str.join('');
    }
}

class AttribTemplate extends TemplateString {

    constructor(source, errors, taps, attr, element, binds) {
        super(source, errors, taps, element, binds);
        this.attrib = attr;
    }

    destroy() {
        this.attrib = null;
        super.destroy();
    }

    scheduledUpdate() {

        let str = [];

        for (let i = 0; i < this.binds.length; i++)
            str.push(this.binds[i]._value_);

        this.ele.setAttribute(this.attrib, str.join(''));
    }
}

function replaceString(e){
    return e[1].toUpperCase();
}

function toCamel(string){
    let str = string.replace(/(?:[-_])([a-z])/g, replaceString);
    return str;
}
class CSSRawValue {

    constructor(name, prop = null) {
        this._name_ = toCamel(name);
        this._value_ = "";

        if (Array.isArray(prop))
            this._value_ = prop.join(" ");
        else
            this._value_ = prop.toString();
    }

    get UPDATED() { return false; }
    set UPDATED(v) {}
}

class CSSRuleTemplateString {
    constructor(source, errors, taps, binds, name) {
        this.binds = [];
        this._setBindings_(source, errors, taps, binds);
        this.ios = [];
        this._value_ = "";
        this._name_ = toCamel(name);
    }

    destroy() {
        for (let i = 0, l = this.binds.length; i < l; i++)
            this.binds[i].destroy();
        this.binds = null;
        for (let i = 0; i < this.ios.length; i++)
            this.ios[i].destroy();
        this.ios = null;
        this._value_ = null;
        this._name_ = null;
    }

    _setBindings_(source, errors, taps, binds) {
        for (var i = 0; i < binds.length; i++) {
            let bind = binds[i];

            switch (bind.type) {
                case 0: //DYNAMIC_BINDING_ID
                    let new_bind = new BindIO(source, errors, source.getTap(bind.tap_name), bind);
                    this.binds.push(new_bind);
                    new_bind.child = this;
                    //this.binds.push(msg._bind_(source, errors, taps, this));
                    break;
                case 1: //RAW_VALUE_BINDING_ID
                    this.binds.push(bind);
                    break;
                case 2: //TEMPLATE_BINDING_ID
                    if (bind._bindings_.length < 1) // Just a variable less expression.
                        this.binds.push({ _value_: msg.func() });
                    else
                        this.binds.push(bind._bind_(source, errors, taps, this));
                    break;
            }
        }
        this.down();
    }

    get data() {}
    set data(v) { spark.queueUpdate(this); }

    down() { spark.queueUpdate(this); }

    scheduledUpdate() {

        let str = [];

        for (let i = 0; i < this.binds.length; i++)
            str.push(this.binds[i]._value_);
        this._value_ = str.join(' ');
        for (let i = 0, l = this.ios.length; i < l; i++)
            this.ios[i]._updateRule_();
    }

    addIO(io) { this.ios.push(io); }
    removeIO(io) {
        for (let i = 0; i < this.ios.length; i++) {
            let own_io = this.ios[i];
            if (own_io == io) return void this.ios.splice(i, 1);
        }
    }
}


class StyleIO extends IOBase {
    constructor(source, errors, taps, element, props = []) {

        super(source);

        this.ele = element;

        this.props = [];

        this._initializeProps_(source, errors, taps, props);

        this.scheduledUpdate();
    }

    destroy() {
        this._template_text_ = null;
        this._rules_text_ = null;
        this.ele = null;
        this.props = null;
        super.destroy();
    }

    _setRule_(rule){
        let props = rule.props;

        this.props.length = 0;

        for (let name in props) {
            let prop = props[name];

            let wick_prop = (prop._wick_type_ > 0) ? prop.bind(this.parent, [], {}, this) : new CSSRawValue(name, prop);

            this.props.push(wick_prop);

            spark.queueUpdate(this);
        }
    }

    _initializeProps_(source, errors, taps, props) {

        for (let i = 0, l = props.length; i < l; i++) {
            let prop = props[i];
            if (prop._wick_type_ == 1) {
                this.props.push(props[i]._bind_(source, errors, taps, this));
            } else
                this.props.push(prop);
        }
    }

    _updateRule_() { spark.queueUpdate(this); }

    get data() {}
    set data(data) { spark.queueUpdate(this); }

    scheduledUpdate() {
        for (let i = 0; i < this.props.length; i++) {
            let prop = this.props[i];
            this.ele.style[prop._name_] = prop._value_;
        }
    }
}

/******************** Expressions **********************/

class ExpressionIO extends TemplateString {

    constructor(source, errors, taps, element, binds, func) {
        
        super(source, errors, taps, element, binds);
        this._expr_function_ = func;
        this._value_ = null;
        this._filter_expression_ = null;
        this._bl_ = this.binds.length;
    }

    destroy(){
        this._expr_function_ = null;
        this._value_ = null;
        this._filter_expression_ = null;
        this._bl_ = null;
        super.destroy();
    }

    set _IS_A_FILTER_(v) {
        if (v == true) {
            var model_arg_index = -1;
            var index_arg_index = -1;

            for (let i = 0, l = this._bl_; i < l; i++) {
                let bind = this.binds[i];
                if (bind.parent._prop_ == "model" || bind.parent._prop_ == "m") {
                    model_arg_index = i;
                }

                if (bind.parent._prop_ == "index" || bind.parent._prop_ == "i") {
                    index_arg_index = i;
                }
            }

            this._filter_expression_ = (source, index) => {
                const args = [];
                
                for (let i = 0, l = this._bl_; i < l; i++) {
                    if (i == model_arg_index) { args.push(source.model); continue; }
                    if (i == index_arg_index) { args.push(index); continue; }
                    args.push(this.binds[i]._value_);
                }

                return this._expr_function_.apply(null, args);
            };
        }
    }

    get _IS_A_FILTER_() { return typeof(this._filter_expression_) == "function"; }

    scheduledUpdate() {
        if (this._IS_A_FILTER_) {
            this.ele.update();
        } else {
            
            const args = [];

            for (let i = 0; i < this.binds.length; i++){
                if(this.binds[i]._value_ === null) return;
                args.push(this.binds[i]._value_);
            }
            
            this._value_ = this._expr_function_.apply(null, args);
            this.ele.data = this._value_;
        }
    }
}

class InputExpresionIO extends ExpressionIO{
    scheduledUpdate() {
        if (this._IS_A_FILTER_) {
            this.ele.update();
        } else {
            const args = [];
            for (let i = 0; i < this.binds.length; i++)
                args.push(this.binds[i]._value_);

            this._value_ = this._expr_function_.apply(null, args);
            this.ele.value = this._value_;
        }
    }
}

class EventIO {
    constructor(source, errors, taps, element, event, event_bind, msg) {

        let Attrib_Watch = (typeof element[event] == "undefined");

        this.parent = source;
        source.ios.push(this);

        this._ele_ = element;
        this._event_bind_ = new IOBase(source.getTap(event_bind.tap_name));
        this._event_ = event.replace("on", "");

        this.prevent_defaults = false;
        if (this._event_ == "dragstart") this.prevent_defaults = false;
        this._msg_ = null;
        this.data = null;
        if (msg) {
            switch (msg.type) {
                case 0: //DYNAMIC_BINDING_ID
                    this._msg_ = msg._bind_(source, errors, taps, this);
                    break;
                case 1: //RAW_VALUE_BINDING_ID
                    this.data = msg.txt;
                    break;
                case 2: //TEMPLATE_BINDING_ID
                    if (msg._bindings_.length < 1) // Just a variable less expression.
                        this.data = msg.func();
                    else
                        this._msg_ = msg._bind_(source, errors, taps, this);
                    break;
            }
        }


        if (Attrib_Watch) {
            this._event_handle_ = new MutationObserver((ml) => {
                ml.forEach((m) => {
                    if (m.type == "attributes") {
                        if (m.attributeName == event) {
                            this._handleAttribUpdate_(m);
                        }
                    }
                });
            });
            this._event_handle_.observe(this._ele_, { attributes: true });
        } else {
            this._event_handle_ = (e) => this._handleEvent_(e);
            this._ele_.addEventListener(this._event_, this._event_handle_);
        }
    }

    /**
     * Removes all references to other objects.
     * Calls destroy on any child objects.
     */
    destroy() {
        if (this._msg_)
            this._msg_.destroy();
        this._event_handle_ = null;
        this._event_bind_.destroy();
        this._msg_ = null;
        this._ele_.removeEventListener(this._event_, this._event_handle_);
        this._ele_ = null;
        this._event_ = null;
        this.parent.removeIO(this);
        this.parent = null;
        this.data = null;
    }

    _handleEvent_(e) {
        this._event_bind_.up(this.data, { event: e });

        if (this.prevent_defaults) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }

    _handleAttribUpdate_(e) {
        this._event_bind_.up(e.target.getAttribute(e.attributeName), { mutation: e });
    }
}

class ScriptIO extends IOBase {
    constructor(source, errors, tap, binding) {

        let func;

        try {
            if (binding._func_) {
                func = binding._func_;
            } else {
                func = Function(binding.tap_name, "event", "model", "emit", "presets", "static", "src", binding.val).bind(source);
                binding._func_ = func;
            }
        } catch (e) {
            errors.push(e);
            func = () => {};
        }

        super(tap);

        this.function = binding.val;
        this._func_ = func;
        this._source_ = source;
        this._bound_emit_function_ = new Proxy(this._emit_.bind(this), { set: (obj, name, value) => { obj(name, value); } });
        this.meta = null;
    }

    /**
     * Removes all references to other objects.
     * Calls destroy on any child objects.
     */
    destroy() {
        this._func_ = null;
        this._source_ = null;
        this._bound_emit_function_ = null;
        this._meta = null;

    }

    down(value, meta = { event: null }) {
        this.meta = meta;
        const src = this._source_;
        try {
            this._func_(value, meta.event, src.model, this._bound_emit_function_, src.presets, src.statics, src);
        } catch (e) {
            console.warn(this.function);
            console.error(e);
        }
    }

    _emit_(name, value) {
        if (
            typeof(name) !== "undefined" &&
            typeof(value) !== "undefined"
        ) {
            this._source_.upImport(name, value, this.meta);
        }
    }
}

const DYNAMIC_BINDING_ID = 0;
const RAW_VALUE_BINDING_ID = 1;
const TEMPLATE_BINDING_ID = 2;
const EVENT_BINDING_ID = 3;

const ATTRIB = 1;
const STYLE = 2;
const HTML$1 = 3;
const TEXT$2 = 4;
const INPUT = 5;
const SCRIPT = 6;
const EVENT = 7;

/**
 * Binding builder for expressions
 *
 * @class      ExpressionBinding (name)
 */
class EventBinding {
    constructor(prop) {
        this.bind = null;
        this._event_ = prop;
    }

    _bind_(source, errors, taps, element, eventname) {
        return new EventIO(source, errors, taps, element, eventname, this._event_, this.bind);
    }

    get _bindings_() {
        if (this.bind) {
            if (this.bind.type == TEMPLATE_BINDING_ID)
                return [...this.bind._bindings_, this._event_];
            else
                return [this.bind, this._event_];
        }
        return [this._event_];
    }
    set _bindings_(v) {}

    get type() {
        return TEMPLATE_BINDING_ID;
    }
    set type(v) {}
}

/**
 * Binding builder for expressions
 *
 * @class      ExpressionBinding (name)
 */
class ExpressionBinding {
    constructor(binds, func) {
        this._bindings_ = binds;
        this.func = func;
    }

    _bind_(source, errors, taps, element) {
        
        switch (this.method) {
            case INPUT:
                return new InputExpresionIO(source, errors, taps, element, this._bindings_, this.func);
            default:
                return new ExpressionIO(source, errors, taps, element, this._bindings_, this.func);
        }
    }

    get type() {
        return TEMPLATE_BINDING_ID;
    }
    set type(v) {}
}


class DynamicBinding {

    constructor() {
        this.tap_name = "";
        this.tap_id = 0;
        this.val = "";
        this._func_ = null;
        this.method = 0;
    }

    _bind_(source, errors, taps, element) {
        let tap = source.getTap(this.tap_name); //taps[this.tap_id];
        switch (this.method) {
            case INPUT:
                return new InputIO(source, errors, tap, element);
            case ATTRIB:
                return new AttribIO(source, errors, tap, this.val, element);
            case SCRIPT:
                return new ScriptIO(source, errors, tap, this);
            default:
                return new IO(source, errors, tap, element);
        }
    }

    get type() {
        return DYNAMIC_BINDING_ID;
    }
    set type(v) {}

    toString(){return `((${this.tap_name}))`;}
}

class RawValueBinding {
    constructor(txt) {
        this.txt = txt;
        this.method = 0;
    }

    _bind_(source, errors, taps, element, prop = "") {

        switch (this.method) {
            case TEXT$2:
                element.data = this.txt;
                break;
            case ATTRIB:{
                if(prop == "class"){
                    element.classList.add.apply(element.classList, this.txt.split(" "));
                }else
                    element.setAttribute(prop, this.txt);
            }
        }
    }
    get _value_() { return this.txt; }
    set _value_(v) {}
    get type() { return RAW_VALUE_BINDING_ID; }
    set type(v) {}
    toString(){return this.txt;}
}

/**
 * Basic JS Parser Kludge to get legitimate foreign identifiers from expressions.
 * This could later be expanded into a full JS parser to generate proper JS ASTs.
 * @class      JSExpressionIdentifiers 
 * @param      {Lexer}  lex     The lex
 * @return     {Object}  { description_of_the_return_value }
 */
function JSExpressionIdentifiers(lex) {
    let _identifiers_ = [];
    let model_cache = {};

    let IN_OBJ = false,
        CAN_BE_ID = true;
    while (!lex.END) {
        
        switch (lex.ty) {
            case lex.types.id:
                if (!IN_OBJ || CAN_BE_ID) {
                    let id = lex.tx;
                    if (!model_cache[id]) {
                        _identifiers_.push(lex.tx);
                        model_cache[id] = true;
                    }
                }   
                break;
            case lex.types.op:
            case lex.types.sym:
            case lex.types.ob:
            case lex.types.cb:
                switch (lex.ch) {
                    case "+":
                    case ">":
                    case "<":
                    case "/":
                    case "*":
                    case "-":
                        CAN_BE_ID = true;
                        break;
                    case "[":
                        IN_OBJ = false;
                        CAN_BE_ID = true;
                        break;
                    case "{":
                    case ".": //Property Getters
                        CAN_BE_ID = false;
                        IN_OBJ = true;
                        break;
                    case "]":
                    case ";":
                    case "=":
                    case "}":
                    case "(":
                        IN_OBJ = false;
                        break;
                    case ",":
                        if (IN_OBJ)
                            CAN_BE_ID = false;
                        else
                            IN_OBJ = false;
                        break;
                    case ":":
                    case "=":
                        CAN_BE_ID = true;
                }
                break;
        }
        lex.n;
    }


    return _identifiers_;
}

/* Templating Syntax */
const barrier_a_start = "(";
const barrier_a_end = ")";
const barrier_b_start = "|";
const barrier_b_end = "|";

const BannedIdentifiers = { "true": true, "false": 1, "class": 1, "function": 1,  "return": 1, "for" : 1, "new" : 1, "let" : 1, "var" : 1, "const" : 1, "Date": 1, "null": 1, "parseFloat":1, "parseInt":1};

function setIdentifier(id, store, cache) {
    if (!cache[id] && !BannedIdentifiers[id]) {
        store.push(id);
        cache[id] = true;
    }
}

function processExpression(lex, binds) {

    /* 
     * The token after the second sentinel does not cover the entire bind range.
     * So the text with in the bind range should be a multi token token JS expression. 
     * We should extract all identifiers and use them to create bind points for an ExpressionIO.
     * 
     * The expression should work with a function return statement, as in:
     * ```javasript
     * "return (implied)" name ? "User has a name!" : "User does not have a name!"
     * ```
     */
     
    const bind_ids = [];

    const function_string = lex.slice();

    const existing_names = {};

    /**TODO? - This could be replaced by a plugin to ensure proper Javascript expressions. Perhaps producing a JS AST */
    let args = JSExpressionIdentifiers(lex);


    for (let i = 0, l = args.length; i < l; i++)
        setIdentifier(args[i], bind_ids, existing_names);

    bind_ids.push(`return ${function_string}`);

    let funct = (Function).apply(null, bind_ids);

    const bindings = [];

    for (let i = 0, l = bind_ids.length - 1; i < l; i++) {
        let binding = new DynamicBinding();
        binding.tap_name = bind_ids[i];
        bindings.push(binding);
    }

    binds.push(new ExpressionBinding(bindings, funct));
}

/**
 * { function_description }
 * @memberof   module:wick~internals.compiler
 * @param      {Lexer}  lex     The lex
 * @return     {Array}   an
 */
function evaluate(lex, EVENT$$1 = false) {

    let binds = [];


    lex.IWS = false;

    let start = lex.pos;
    while (!lex.END && lex.ty !== lex.types.str) {
        switch (lex.ch) {
            case barrier_a_start:
                if (lex.pk.ch == barrier_b_start || lex.p.ch == barrier_a_start) {

                    let sentinel = (lex.p.ch == barrier_a_start) ? barrier_a_end : barrier_b_end;

                    let pk2 = lex.p.pk;


                    if (pk2.ch == barrier_b_start) {
                        sentinel = barrier_b_end;
                        if (start < lex.p.pos)
                            binds.push(new RawValueBinding(lex.p.slice(start)));

                        lex.p.sync();
                    } else if (start < lex.pos) {

                        binds.push(new RawValueBinding(lex.slice(start)));
                    } //create text node


                    lex.sync().n;
                    lex.IWS = true; // Do not produce white space tokens during this portion.
                    let pk = lex.pk;
                    let Message= false;


                    while (!pk.END && (pk.ch !== sentinel || (pk.pk.ch !== barrier_a_end && pk.p.ch !== barrier_a_start) || (pk.p.n.ch === barrier_a_end))) { 
                        let prev = pk.ch;
                        pk.n; 
                        if(pk.ch == barrier_a_start && prev == barrier_a_end)
                            Message =true;
                    }


                    if (lex.tl < pk.off - lex.off - 1 && !Message) {
                        /***** Start Expression *******/

                        const elex = lex.copy(); //The expression Lexer

                        elex.fence(pk);

                        lex.sync();

                        if (pk.END) //Should still have `))` or `|)` in the input string
                            throw new Error("Should be more to this!");

                        processExpression(elex, binds);

                        lex.a(sentinel);
                        /***** End Expression ********/
                    } else {

                        /************************** Start Single Identifier Binding *******************************/
                        let id = lex.tx;
                        let binding = new DynamicBinding();
                        binding.tap_name = id;
                        let index = binds.push(binding) - 1;
                        lex.n.a(sentinel);

                        if (EVENT$$1) {
                            /***************************** Looking for Event Bindings ******************************************/
                            
                            if (lex.ch == barrier_a_start || lex.ch == barrier_b_start) {

                                binds[index] = new EventBinding(binds[index]);

                                let sentinel = (lex.ch == barrier_a_start) ? barrier_a_end : barrier_b_end;

                                lex.IWS = true; // Do not produce white space tokens during this portion.

                                let pk = lex.pk;

                                while (!pk.END && (pk.ch !== sentinel || (pk.pk.ch !== barrier_a_end))) { pk.n; }

                                lex.n;

                                if (lex.tl < pk.off - lex.off || BannedIdentifiers[lex.tx]) {

                                    const elex = lex.copy(); //The expression Lexer

                                    elex.fence(pk);

                                    lex.sync();

                                    if (pk.END) //Should still have `))` or `|)` in the input string
                                        throw new Error("Should be more to this!");

                                    const event_binds = [];

                                    processExpression(elex, event_binds);

                                    binds[index].bind = event_binds[0];

                                    lex.a(sentinel);

                                } else {
                                    if (lex.ch !== sentinel) {
                                        let id = lex.tx,
                                            binding;
                                        if (lex.ty !== lex.types.id) {
                                            switch (lex.ty) {
                                                case lex.types.num:
                                                    binding = new RawValueBinding(parseFloat(id));
                                                    break;
                                                case lex.types.str:
                                                    binding = new RawValueBinding(id.slice(1, -1));
                                                    break;
                                                default:
                                                    binding = new RawValueBinding(id.slice);
                                            }
                                        } else {
                                            binding = new DynamicBinding();
                                            binding.tap_name = id;
                                        }
                                        binds[index].bind = binding;
                                        lex.n;
                                    }
                                    lex.a(sentinel);
                                }
                            }
                        }
                    }

                    lex.IWS = false;
                    
                    start = lex.off + 1; //Should at the sentinel.
                    
                    lex.a(barrier_a_end);
                    
                    continue;
                }
                break;
        }
        lex.n;
    }

    if (start < lex.off) {
        lex.off = start;
        lex.END = false;
        lex.tl = 0;
        lex.END = false;

        let DATA_END = start;

        while (!lex.n.END)
            if (!(lex.ty & (lex.types.ws | lex.types.nl)))
                DATA_END = lex.off + lex.tl;
            
        if (DATA_END > start) {
            lex.sl = DATA_END;
            binds.push(new RawValueBinding(lex.slice(start)));
        }
    }

    return binds;
}

function Template(lex, FOR_EVENT) {
    let binds = evaluate(lex, FOR_EVENT);
    if (binds.length > 0) {
        if (binds.length == 1)
            return binds[0];
        return new OutTemplate(binds);
    }
    return null;
}


function OutTemplate(binds = []) {
    this._bindings_ = binds;
}

OutTemplate.prototype = {
    method: 0,

    attr: "",

    _bindings_: null,

    _bind_: function(source, errors, taps, element, attr) {
        if (this.method == ATTRIB || this.method == INPUT)
            return new AttribTemplate(source, errors, taps, attr, element, this._bindings_);
        return new TemplateString(source, errors, taps, element, this._bindings_);
    },

    _appendText_: function(string) {
        let binding = this._bindings_[this._bindings_.length - 1];

        if (binding && binding.type == RAW_VALUE_BINDING_ID) {
            binding.txt += string;
        } else {
            this._bindings_.push(new RawValueBinding(string));
        }
    },

    set type(v) {},
    get type() {
        return TEMPLATE_BINDING_ID;
    },

    toString(){
        let str = "";
        for(let i = 0; i < this._bindings_.length; i++)
            str += this._bindings_[i];
        return str;
    }
};


function StyleTemplate(lex) {

    const style = new OutStyleTemplate();
    if(lex){

    }
    return style;
}

class OutStyleTemplate {

    constructor() {
        this._css_props_ = [];
    }

    get _bindings_() {
        if (this._template_)
            return this._template_._bindings_;
        return [];
    }
    set _bindings_(v) {}

    get type() {
        return TEMPLATE_BINDING_ID;
    }
    set type(v) {}

    clear(){
        this._css_props_ = [];
    }

    _addRule_(rule) {

        let props = rule.props;

        for (let name in props) {
            let prop = props[name];

            if(prop == null) continue;

            if (prop._wick_type_ > 0)
                this._css_props_.push(prop);
            else 
                this._css_props_.push(new CSSRawValue(name, prop));
        }
    }

    _bind_(source, errors, taps, element) {
        return new StyleIO(source, errors, taps, element, this._css_props_);
    }
}

function CSSRuleTemplate(lex, prop_name) {
    return new OutCSSRuleTemplate(lex, prop_name);
}

class OutCSSRuleTemplate {
    constructor(lex = null, prop_name = "") {
        let bindings = evaluate(lex);

        this.binding = null;

        this.prop_name = prop_name;

        this._bindings_ = bindings;
    }

    get _wick_type_() {
        return 1;
    }
    set _wick_type_(v) {}

    _bind_(source, errors, taps, io) {
        let binding = new CSSRuleTemplateString(source, errors, taps, this._bindings_, this.prop_name);
        binding.addIO(io);
        return binding;
    }
}

class BindingCSSRoot extends CSSRootNode {
    getPropertyHook(value_lex, prop_name, rule) {

        //looking for binding points
        let pk = value_lex.copy();
        while (!pk.END && ((pk.ch != barrier_a_start || (pk.n.ch != barrier_a_start && pk.ch != barrier_b_start)))) {
            pk.n;
        }

        if (pk.END)
            return false;

        rule.props[prop_name] = CSSRuleTemplate(value_lex, prop_name);

        return true;
    }
}

class RootText extends TextNode {
    constructor(binding) {
        super("");
        binding.method = TEXT$2;
        this.binding = binding;
    }

    build(element, source, presets, errors, taps) {
        let ele = document.createTextNode(this.txt);
        this.binding._bind_(source, errors, taps, ele);
        _appendChild_(element, ele);
    }

    linkCSS() {}

    toString(off = 0) {
        return `${("    ").repeat(off)}${this.binding}\n`;
    }
}


/**
 * Class for Root HTML AST Node.
 *@memberof module:wick~internals.templateCompiler
 *@alias Root
 */
class RootNode extends HTMLNode {

    constructor() {
        super();
        this.HAS_TAPS = false;

        this.tap_list = [];
        this._bindings_ = [];

        this.css = null;

        this._merged_ = false;

        this._badge_name_ = "";

        this.__presets__ = null;
        this.__statics__ = null;
    }

    /******************************************* STATICS ****************************************************/

    get statics() {
        if (this.__statics__) return this.__statics__;

        if (this.par)
            return (this.__statics__ = Object.assign({}, this.par.statics));

        return (this.__statics__ = {});
    }

    set statics(statics) {
        this.__statics__ = statics;
    }

    /******************************************* PRESETS ****************************************************/

    get presets() {
        if (this.__presets__) return this.__presets__;
        return this.par.presets;
    }

    set presets(preset) {
        this.__presets__ = preset;
    }

    /****************************************** COMPONENTIZATION *****************************************/

    mergeComponent() {

        let component = this.presets.components[this.tag];

        if (component) {
            this._merged_ = component;
        }

    }

    /******************************************* CSS ****************************************************/

    linkCSS(css, win = window) {

        if (this.css)
            css = this.css;

        if (css) {

            let rule;

            
            for (let i = 0; i < css.length; i++)
                rule = css[i].getApplicableRules(this, rule, win);


            //parse rules and createBindings.
            if (rule && rule.LOADED) {


                //Link into the binding for style. if there is no binding, create one. 
                //Link in the rule properties to the tap system. 
                let HAVE_BINDING = false;

                for (let i = 0, l = this._bindings_.length; i < l; i++) {
                    let binding = this._bindings_[i];

                    if (binding.name == "css"){
                        binding.binding.clear();
                        HAVE_BINDING = (binding.binding._addRule_(rule), true);
                    }
                }

                if (!HAVE_BINDING) {
                    let binding = StyleTemplate();
                    binding._addRule_(rule);
                    let vals = {
                        name: "css",
                        value: "",
                        binding
                    };
                    this._bindings_.push(vals);

                }

                this.css = css;
            }
        }

        for (let node = this.fch; node; node = this.getNextChild(node))
            node.linkCSS(css, win);
    }

    setPendingCSS(css) {
        if (this.par)
            this.par.setPendingCSS(css);
        else{
            if(!this.css)
                this.css = [];
            this.css.push(css);
        }


    }

    getCSS() {

        let css = new BindingCSSRoot();

        this.setPendingCSS(css);

        return css;
    }

    get classList() {
        let classes = this.getAttrib("class");
        if (classes) {
            if (typeof(classes.value) == "string")
                return classes.value.split(" ");
            else
                return classes.value.txt.split(" ");
        }
        return [];
    }

    /******************************************* TAPS ****************************************************/


    getTap(tap_name) {
        this.HAS_TAPS = true;
        const l = this.tap_list.length;
        for (let i = 0; i < l; i++)
            if (this.tap_list[i].name == tap_name)
                return this.tap_list[i];
        const tap = {
            name: tap_name,
            id: l,
            _modes_: 0
        };
        this.tap_list.push(tap);
        return tap;
    }



    checkTapMethod(name, lex) {

        let tap_mode = KEEP; // Puts

        let SET_TAP_METHOD = false;

        switch (name[0]) {
            case "i": // Imports data updates, messages - valid on source and top level objects.
                if (name === "import") {
                    SET_TAP_METHOD = true;
                    tap_mode |= IMPORT;
                }
                break;
            case "e": // Exports data updates, messages - valid on sources and top level objects.
                if (name === "export") {
                    SET_TAP_METHOD = true;
                    tap_mode |= EXPORT;
                }
                break;
            case "p": // Pushes updates to model
                if (name === "put") {
                    SET_TAP_METHOD = true;
                    tap_mode |= PUT;
                }
        }

        if (SET_TAP_METHOD) {

            while (!lex.END) {

                this.getTap(lex.tx)._modes_ |= tap_mode;

                lex.n;
            }

            return true;
        }
    }

    checkTapMethodGate(name, lex) {

        if (!this.par)
            return this.checkTapMethod(name, lex);
        return false;
    }

    linkTapBinding(binding) {

        binding.tap_id = this.getTap(binding.tap_name).id;
    }

    delegateTapBinding(binding, tap_mode) {

        if (this.par)
            return this.par.processTapBinding(binding, tap_mode);

        return null;
    }

    processTapBinding(binding, tap_mode = 0) {

        if (this.delegateTapBinding(binding, tap_mode)) return binding;

        if (binding.type === TEMPLATE_BINDING_ID) {

            let _bindings_ = binding._bindings_;

            for (let i = 0, l = _bindings_.length; i < l; i++)
                if (_bindings_[i].type === DYNAMIC_BINDING_ID)
                    this.linkTapBinding(_bindings_[i]);

        } else if (binding.type === DYNAMIC_BINDING_ID)
            this.linkTapBinding(binding);

        return binding;
    }



    /******************************************* BUILD ****************************************************/

    setSource(source) {
        source.ast = this;
    }

    /**
     * Builds Source Tree and Dom Tree.
     *
     * @param      {null}  element  The element
     * @param      {null}  source   The source
     * @param      {null}  presets  The presets
     * @param      {null   errors   The errors
     * @param      {null}  model    The model
     * @return     {null}  { description_of_the_return_value }
     */
    build(element, source, presets, errors, taps, statics, out_ele) {

        const out_statics = this.__statics__ || statics;
        let own_out_ele;
        
        if (this._merged_) {
            
            own_out_ele = {
                ele: null
            };

            let out_source = this._merged_.build(element, source, presets, errors, taps, out_statics, own_out_ele);

            if(!source)
                source = out_source;            
        }

        let own_element;

        if (own_out_ele) {
            own_element = own_out_ele.ele;
        } else {
            if(!source){
                source = new Source(null, presets, own_element, this);
                own_element = this.createElement(presets, source);
                source.ele = own_element;
            }else
                own_element = this.createElement(presets, source);

            if (element) _appendChild_(element, own_element);

            if (out_ele)
                out_ele.ele = own_element;
        }

        if (this.HAS_TAPS)
            taps = source.linkTaps(this.tap_list);

        if (own_element) {

            if (!source.ele) source.ele = own_element;

            if (this._badge_name_)
                source.badges[this._badge_name_] = own_element;

            if (element) _appendChild_(element, own_element);

            for (let i = 0, l = this._bindings_.length; i < l; i++) {
                let attr = this._bindings_[i];
                attr.binding._bind_(source, errors, taps, own_element, attr.name);
            }

            for (let node = this.fch; node; node = this.getNextChild(node))
                node.build(own_element, source, presets, errors, taps, out_statics);

        } else {
            for (let node = this.fch; node; node = this.getNextChild(node))
                node.build(element, source, presets, errors, taps, out_statics);
        }


        return source;
    }



    /******************************************* HOOKS ****************************************************/

    /**
     * Override this method to tell the parser that `tag` is self closing and to not look for a matching close tag by returning `true`.
     * @param      {string}  tag     The HTML tag
     */
    selfClosingTagHook(tag) {
        switch (tag) {
            case "input":
            case "br":
            case "img":
            case "import":
            case "link":
                return true;
        }

        return false;
    }

    createElement() {
        return createElement(this.tag);
    }

    endOfElementHook() {
        if (!this.fch) {
            this.mergeComponent();
        }
    }


    /**
     * This will create TAP binding references and methods, binding points, and regular attribute nodes.
     * @param      {<type>}  name    The Attribute name
     * @param      {Lexer}  lex     The lexer containing the attribute value.
     * @return     {Object}  `null` or an object to store in this nodes attributes
     * @private
     */
    processAttributeHook(name, lex) {

        let start = lex.off;

        let bind_method = ATTRIB,
            FOR_EVENT = false;

        switch (name[0]) {

            case "#": //Static values
                let key = name.slice(1);

                if (key.length > 0) {
                    if (lex.tl == lex.sl - lex.off && lex.ty == lex.types.num)
                        this.statics[key] = parseFloat(lex.slice());
                    else
                        this.statics[key] = lex.slice();
                }

                return null;

            case "v": //Input
                if (name == "value")
                    bind_method = INPUT;
                break;

            case "o": // Event Messaging linking
                if (name[1] == "n") {
                    FOR_EVENT = true;
                    bind_method = EVENT;
                }
                break;

            case "c":
                if (name == "component") {
                    let component_name = lex.tx;
                    let components = this.presets.components;
                    if (components)
                        components[component_name] = this;
                    return null;
                }
                break;
            case "b":
                if (name == "badge") {
                    this._badge_name_ = lex.tx;
                    return null;
                }
        }

        if (this.checkTapMethodGate(name, lex))
            return null;

        if ((lex.sl - lex.off) > 0) {
            let binding = Template(lex, FOR_EVENT);
            if (!binding) {
                return {
                    name,
                    value: lex.slice(start)
                };
            }

            binding.val = name;
            binding.method = bind_method;
            let attr = {
                name,
                value: (start < lex.off) ? lex.slice(start) : true,
                binding: this.processTapBinding(binding)
            };
            this._bindings_.push(attr);
            return attr;
        }

        let value = lex.slice(start);

        return {
            name,
            value: value || true
        };
    }



    /**
     * Hooks into the Text Node creation context and looks for binding points. 
     * If they are found, the text node will be made dynamic.
     * @param      {Lexer}    
     * @return     {TextNode}  
     */
    processTextNodeHook(lex) {

        if (lex.sl - lex.pos > 0) {

            let binding = Template(lex);
            if (binding)
                return new RootText(this.processTapBinding(binding));
        }

        return null;
    }
}

/**
 * Void elements don't exist, they evaporate into the void.
 * Element children of VoidNodes are appended to the last element created.
 */
class VoidNode$1 extends RootNode {

    createElement() { return null; }

    /******************************************* HOOKS ****************************************************/

    endOfElementHook() {}

    processTextNodeHook() {}

    /******************************************* BUILD ****************************************************/

    build() {}

    /******************************************* CSS ****************************************************/

    linkCSS() {}
}

class ScriptNode$1 extends VoidNode$1 {
    constructor() {
        super();
        this._script_text_ = "";
        this._binding_ = null;
    }

    processTextNodeHook(lex) {
        if (this._binding_)
            this._binding_.val = lex.slice();
    }

    processAttributeHook(name, lex) {

        switch (name) {
            case "on":
                let binding = Template(lex, false);
                if (binding.type == DYNAMIC_BINDING_ID) {
                    binding.method = SCRIPT;
                    this._binding_ = this.processTapBinding(binding);
                }
                return null;
        }

        return { name, value: lex.slice() };
    }
    build(element, source, presets, errors, taps) {
        if (this._binding_)
            this._binding_._bind_(source, errors, taps, element);
    }
}

/**
 * Source nodes are used to hook into specific Models, and respond to `update` events from that model.
 * @class      SourceNode (name)
 */
class SourceNode$1 extends RootNode {
    constructor() {
        super();
        this._model_name_ = "";
        this._schema_name_ = "";
        this.statics = {};
    }

    delegateTapBinding() {
        return null;
    }

    getCSS() {

        if (this.css)
            return this.css;

        this.css = new BindingCSSRoot();

        this.setPendingCSS(this.css);

        return this.css;
    }

    checkTapMethodGate(name, lex) {
        return this.checkTapMethod(name, lex);
    }



    /******************************************* BUILD ****************************************************/
    createElement() {
        return createElement(this.getAttribute("element") || "div");
    }
    
    build(element, source, presets, errors, taps = null, statics = null, out_ele = null) {

        let data = {};

        let out_taps = [];

        let me = new Source(source, presets, element, this);

        me._model_name_ = this._model_name_;
        me._schema_name_ = this._schema_name_;

        let tap_list = this.tap_list;

        for (let i = 0, l = tap_list.length; i < l; i++) {
            let tap = tap_list[i],
                name = tap.name;

            let bool = name == "update";

            me.taps[name] = bool ? new UpdateTap(me, name, tap._modes_) : new Tap(me, name, tap._modes_);

            if (bool)
                me.update_tap = me.taps[name];

            out_taps.push(me.taps[name]);
        }

        /**
         * To keep the layout of the output HTML predictable, Wick requires that a "real" HTMLElement be defined before a source object is created. 
         * If this is not the case, then a new element, defined by the "element" attribute of the source virtual tag (defaulted to a "div"), 
         * will be created to allow the source object to bind to an actual HTMLElement. 
         */
        if (!element || this.getAttribute("element")) {

            let ele = this.createElement();

            this.class.split(" ").map(c => c ? ele.classList.add(c) : {});

            if (this.getAttribute("id"))
                ele.id = this.getAttribute("id");

            if (this.getAttribute("style"))
                ele.style = this.getAttribute("style");

            me.ele = ele;

            if (element) {
                _appendChild_(element, ele);
            }

            element = ele;

            if (out_ele)
                out_ele.ele = element;

            if (this._badge_name_)
                me.badges[this._badge_name_] = element;

            let hook = {
                attr: this.attributes,
                bindings: [],
                style: null,
                ele: element
            };

            for (let i = 0, l = this._bindings_.length; i < l; i++) {
                let attr = this._bindings_[i];
                let bind = attr.binding._bind_(me, errors, out_taps, element, attr.name);

                if (hook) {
                    if (attr.name == "style" || attr.name == "css")
                        hook.style = bind;

                    hook.bindings.push(bind);
                }
            }

            me.hooks.push(hook);
        }

        for (let i = 0, l = this.attributes.length; i < l; i++) {
            let attr = this.attributes[i];

            if (!attr.value) {
                //let value = this.par.importAttrib()
                //if(value) data[attr.name];
            } else {
                data[attr.name] = attr.value;

            }
        }

        for (let node = this.fch; node; node = this.getNextChild(node))
            node.build(element, me, presets, errors, out_taps, statics);

        if (statics) {
            me.statics = statics;
            me.update(statics);
        }


        return me;
    }

    /******************************************* HOOKS ****************************************************/

    endOfElementHook() {}

    /**
     * Pulls Schema, Model, or tap method information from the attributes of the tag. 
     * All other attributes are passed through without any other consideration.
     * @param      {string}  name    The name
     * @param      {Lexer}  lex     The lex
     * @return     {Object}  Key value pair.
     */
    processAttributeHook(name, lex, value) {
        let start = lex.off;

        switch (name[0]) {
            case "#":
                let key = name.slice(1);

                if (key.length > 0) {
                    if (lex.tl == lex.sl - lex.off && lex.ty == lex.types.num)
                        this.statics[key] = parseFloat(lex.slice());
                    else
                        this.statics[key] = lex.slice();
                }

                return null;
            case "m":
                if (name == "model") {
                    this._model_name_ = lex.slice();
                    lex.n;
                    return null;
                }
                break;
            case "s":
                if (name == "schema") {
                    this._schema_name_ = lex.slice();
                    lex.n;
                    return null;
                }
                break;
            case "c":
                if (name == "component") {
                    let component_name = lex.tx;
                    let components = this.presets.components;
                    if (components)
                        components[component_name] = this;
                    return null;
                }
                break;
            case "b":
                if (name == "badge") {
                    this._badge_name_ = lex.tx;
                    return null;
                }
                break;
            default:
                if (this.checkTapMethodGate(name, lex))
                    return null;
        }

        //return { name, value: lex.slice() };
        //return super.processAttributeHook(name, lex, value);
        if ((lex.sl - lex.off) > 0) {
            let binding = Template(lex, true);
            if (!binding) {
                return {
                    name,
                    value: lex.slice(start)
                };
            }
            binding.val = name;
            binding.method = ATTRIB;
            let attr = {
                name,
                value: (start < lex.off) ? lex.slice(start) : true,
                binding: this.processTapBinding(binding)
            };
            this._bindings_.push(attr);
            return attr;
        }

        return {
            name,
            value: lex.slice(start)
        };

    }
}

class LinkNode$1 extends RootNode {
    createElement(presets, source){
        let element = document.createElement("a");
        presets.processLink(element, source);
        return element;
    }
}

/*
    BODY {color: black; background: white }
    H1 { color: maroon }
    H2 { color: olive }
    EM { color: #f00 }              // #rgb //
    EM { color: #ff0000 }           // #rrggbb //
    EM { color: rgb(255,0,0) }      // integer range 0 - 255 //
    EM { color: rgb(100%, 0%, 0%) } // float range 0.0% - 100.0% //
*/
class CSS_Color$1 extends Color {

    constructor(r, g, b, a) {
        super(r, g, b, a);

        if (typeof(r) == "string")
            this.set(CSS_Color$1._fs_(r) || {r:255,g:255,b:255,a:0});

    }

    static parse(l, rule, r) {

        let c = CSS_Color$1._fs_(l);

        if (c) {
            l.next();

            let color = new CSS_Color$1();

            color.set(c);

            return color;
        }

        return null;
    }
    static _verify_(l) {
        let c = CSS_Color$1._fs_(l, true);
        if (c)
            return true;
        return false;
    }
    /**
        Creates a new Color from a string or a Lexer.
    */
    static _fs_(l, v = false) {

        let c;

        if (typeof(l) == "string")
            l = whind$1(l);

        let out = null;

        switch (l.ch) {
            case "#":
                var value = l.next().tx;
                let num = parseInt(value,16);
                
                out = { r: 0, g: 0, b: 0, a: 1 };
                if(value.length == 3){
                    out.r = (num >> 8) & 0xF;
                    out.g = (num >> 4) & 0xF;
                    out.b = (num) & 0xF;
                }else{
                    if(value.length == 6){
                        out.r = (num >> 16) & 0xFF;
                        out.g = (num >> 8) & 0xFF;
                        out.b = (num) & 0xFF;
                    }if(value.length == 8){
                        out.r = (num >> 24) & 0xFF;
                        out.g = (num >> 16) & 0xFF;
                        out.b = (num >> 8) & 0xFF;
                        out.a = ((num) & 0xFF);
                    }
                }
                l.next();
                break;
            case "r":
                let tx = l.tx;
                if (tx == "rgba") {
                    out = { r: 0, g: 0, b: 0, a: 1 };
                    l.next(); // (
                    out.r = parseInt(l.next().tx);
                    l.next(); // ,
                    out.g = parseInt(l.next().tx);
                    l.next(); // ,
                    out.b = parseInt(l.next().tx);
                    l.next(); // ,
                    out.a = parseFloat(l.next().tx);
                    l.next().next();
                    c = new CSS_Color$1();
                    c.set(out);
                    break;
                } else if (tx == "rgb") {
                    out = { r: 0, g: 0, b: 0, a: 1 };
                    l.next(); // (
                    out.r = parseInt(l.next().tx);
                    l.next(); // ,
                    out.g = parseInt(l.next().tx);
                    l.next(); // ,
                    out.b = parseInt(l.next().tx);
                    l.next();
                    break;
                }
            default:
                let string = l.tx;

                if (l.ty == l.types.str)
                    string = string.slice(1, -1);

                out = CSS_Color$1.colors[string.toLowerCase()];
        }

        return out;
    }
} {
    let _$ = (r = 0, g = 0, b = 0, a = 1) => ({ r, g, b, a });
    let c = _$(0, 255, 25);
    CSS_Color$1.colors = {
        "alice blue": _$(240, 248, 255),
        "antique white": _$(250, 235, 215),
        "aqua marine": _$(127, 255, 212),
        "aqua": c,
        "azure": _$(240, 255, 255),
        "beige": _$(245, 245, 220),
        "bisque": _$(255, 228, 196),
        "black": _$(),
        "blanched almond": _$(255, 235, 205),
        "blue violet": _$(138, 43, 226),
        "blue": _$(0, 0, 255),
        "brown": _$(165, 42, 42),
        "burly wood": _$(222, 184, 135),
        "cadet blue": _$(95, 158, 160),
        "chart reuse": _$(127, 255),
        "chocolate": _$(210, 105, 30),
        "clear": _$(255, 255, 255),
        "coral": _$(255, 127, 80),
        "corn flower blue": _$(100, 149, 237),
        "corn silk": _$(255, 248, 220),
        "crimson": _$(220, 20, 60),
        "cyan": c,
        "dark blue": _$(0, 0, 139),
        "dark cyan": _$(0, 139, 139),
        "dark golden rod": _$(184, 134, 11),
        "dark gray": _$(169, 169, 169),
        "dark green": _$(0, 100),
        "dark khaki": _$(189, 183, 107),
        "dark magenta": _$(139, 0, 139),
        "dark olive green": _$(85, 107, 47),
        "dark orange": _$(255, 140),
        "dark orchid": _$(153, 50, 204),
        "dark red": _$(139),
        "dark salmon": _$(233, 150, 122),
        "dark sea green": _$(143, 188, 143),
        "dark slate blue": _$(72, 61, 139),
        "dark slate gray": _$(47, 79, 79),
        "dark turquoise": _$(0, 206, 209),
        "dark violet": _$(148, 0, 211),
        "deep pink": _$(255, 20, 147),
        "deep sky blue": _$(0, 191, 255),
        "dim gray": _$(105, 105, 105),
        "dodger blue": _$(30, 144, 255),
        "firebrick": _$(178, 34, 34),
        "floral white": _$(255, 250, 240),
        "forest green": _$(34, 139, 34),
        "fuchsia": _$(255, 0, 255),
        "gainsboro": _$(220, 220, 220),
        "ghost white": _$(248, 248, 255),
        "gold": _$(255, 215),
        "golden rod": _$(218, 165, 32),
        "gray": _$(128, 128, 128),
        "green yellow": _$(173, 255, 47),
        "green": _$(0, 128),
        "honeydew": _$(240, 255, 240),
        "hot pink": _$(255, 105, 180),
        "indian red": _$(205, 92, 92),
        "indigo": _$(75, 0, 130),
        "ivory": _$(255, 255, 240),
        "khaki": _$(240, 230, 140),
        "lavender blush": _$(255, 240, 245),
        "lavender": _$(230, 230, 250),
        "lawn green": _$(124, 252),
        "lemon chiffon": _$(255, 250, 205),
        "light blue": _$(173, 216, 230),
        "light coral": _$(240, 128, 128),
        "light cyan": _$(224, 255, 255),
        "light golden rod yellow": _$(250, 250, 210),
        "light gray": _$(211, 211, 211),
        "light green": _$(144, 238, 144),
        "light pink": _$(255, 182, 193),
        "light salmon": _$(255, 160, 122),
        "light sea green": _$(32, 178, 170),
        "light sky blue": _$(135, 206, 250),
        "light slate gray": _$(119, 136, 153),
        "light steel blue": _$(176, 196, 222),
        "light yellow": _$(255, 255, 224),
        "lime green": _$(50, 205, 50),
        "lime": _$(0, 255),
        "lime": _$(0, 255),
        "linen": _$(250, 240, 230),
        "magenta": _$(255, 0, 255),
        "maroon": _$(128),
        "medium aqua marine": _$(102, 205, 170),
        "medium blue": _$(0, 0, 205),
        "medium orchid": _$(186, 85, 211),
        "medium purple": _$(147, 112, 219),
        "medium sea green": _$(60, 179, 113),
        "medium slate blue": _$(123, 104, 238),
        "medium spring green": _$(0, 250, 154),
        "medium turquoise": _$(72, 209, 204),
        "medium violet red": _$(199, 21, 133),
        "midnight blue": _$(25, 25, 112),
        "mint cream": _$(245, 255, 250),
        "misty rose": _$(255, 228, 225),
        "moccasin": _$(255, 228, 181),
        "navajo white": _$(255, 222, 173),
        "navy": _$(0, 0, 128),
        "old lace": _$(253, 245, 230),
        "olive drab": _$(107, 142, 35),
        "olive": _$(128, 128),
        "orange red": _$(255, 69),
        "orange": _$(255, 165),
        "orchid": _$(218, 112, 214),
        "pale golden rod": _$(238, 232, 170),
        "pale green": _$(152, 251, 152),
        "pale turquoise": _$(175, 238, 238),
        "pale violet red": _$(219, 112, 147),
        "papaya whip": _$(255, 239, 213),
        "peach puff": _$(255, 218, 185),
        "peru": _$(205, 133, 63),
        "pink": _$(255, 192, 203),
        "plum": _$(221, 160, 221),
        "powder blue": _$(176, 224, 230),
        "purple": _$(128, 0, 128),
        "red": _$(255),
        "rosy brown": _$(188, 143, 143),
        "royal blue": _$(65, 105, 225),
        "saddle brown": _$(139, 69, 19),
        "salmon": _$(250, 128, 114),
        "sandy brown": _$(244, 164, 96),
        "sea green": _$(46, 139, 87),
        "sea shell": _$(255, 245, 238),
        "sienna": _$(160, 82, 45),
        "silver": _$(192, 192, 192),
        "sky blue": _$(135, 206, 235),
        "slate blue": _$(106, 90, 205),
        "slate gray": _$(112, 128, 144),
        "snow": _$(255, 250, 250),
        "spring green": _$(0, 255, 127),
        "steel blue": _$(70, 130, 180),
        "tan": _$(210, 180, 140),
        "teal": _$(0, 128, 128),
        "thistle": _$(216, 191, 216),
        "tomato": _$(255, 99, 71),
        "transparent": _$(0, 0, 0, 0),
        "turquoise": _$(64, 224, 208),
        "violet": _$(238, 130, 238),
        "wheat": _$(245, 222, 179),
        "white smoke": _$(245, 245, 245),
        "white": _$(255, 255, 255),
        "yellow green": _$(154, 205, 50),
        "yellow": _$(255, 255)
    };
}

class CSS_Percentage$1 extends Number {
    
    static parse(l, rule, r) {
        let tx = l.tx,
            pky = l.pk.ty;

        if (l.ty == l.types.num || tx == "-" && pky == l.types.num) {
            let mult = 1;

            if (l.ch == "-") {
                mult = -1;
                tx = l.p.tx;
                l.p.next();
            }

            if (l.p.ch == "%") {
                l.sync().next();
                return new CSS_Percentage$1(parseFloat(tx) * mult);
            }
        }
        return null;
    }

    constructor(v) {

        if (typeof(v) == "string") {
            let lex = whind(v);
            let val = CSS_Percentage$1.parse(lex);
            if (val) 
                return val;
        }
        
        super(v);
    }

    static _verify_(l) {
        if(typeof(l) == "string" &&  !isNaN(parseInt(l)) && l.includes("%"))
            return true;
        return false;
    }

    toJSON() {
        return super.toString() + "%";
    }

    toString(radix) {
        return super.toString(radix) + "%";
    }

    get str() {
        return this.toString();
    }

    lerp(to, t) {
        return new CSS_Percentage$1(this + (to - this) * t);
    }

    copy(other){
        return new CSS_Percentage$1(other);
    }

    get type(){
        return "%";
    }
}

class CSS_Length$1 extends Number {
    static parse(l, rule, r) {
        let tx = l.tx,
            pky = l.pk.ty;
        if (l.ty == l.types.num || tx == "-" && pky == l.types.num) {
            let mult = 1;
            if (l.ch == "-") {
                mult = -1;
                tx = l.p.tx;
                l.p.next();
            }
            if (l.p.ty == l.types.id) {
                let id = l.sync().tx;
                l.next();
                return new CSS_Length$1(parseFloat(tx) * mult, id);
            }
        }
        return null;
    }

    static _verify_(l) {
        if (typeof(l) == "string" && !isNaN(parseInt(l)) && !l.includes("%")) return true;
        return false;
    }

    constructor(v, u = "") {
        
        if (typeof(v) == "string") {
            let lex = whind$1(v);
            let val = CSS_Length$1.parse(lex);
            if (val) return val;
        }

        if(u){
            switch(u){
                //Absolute
                case "px": return new PXLength$1(v);
                case "mm": return new MMLength$1(v);
                case "cm": return new CMLength$1(v);
                case "in": return new INLength$1(v);
                case "pc": return new PCLength$1(v);
                case "pt": return new PTLength$1(v);
                
                //Relative
                case "ch": return new CHLength$1(v);
                case "em": return new EMLength$1(v);
                case "ex": return new EXLength$1(v);
                case "rem": return new REMLength$1(v);

                //View Port
                case "vh": return new VHLength$1(v);
                case "vw": return new VWLength$1(v);
                case "vmin": return new VMINLength$1(v);
                case "vmax": return new VMAXLength$1(v);

                //Deg
                case "deg": return new DEGLength$1(v);

                case "%" : return new CSS_Percentage$1(v);
            }
        }

        super(v);
    }

    get milliseconds() {
        switch (this.unit) {
            case ("s"):
                return parseFloat(this) * 1000;
        }
        return parseFloat(this);
    }

    toString(radix) {
        return super.toString(radix) + "" + this.unit;
    }

    toJSON() {
        return super.toString() + "" + this.unit;
    }

    get str() {
        return this.toString();
    }

    lerp(to, t) {
        return new CSS_Length$1(this + (to - this) * t, this.unit);
    }

    copy(other) {
        return new CSS_Length$1(other, this.unit);
    }

    set unit(t){}
    get unit(){return "";}
}

class PXLength$1 extends CSS_Length$1 {
    get unit(){return "px";}
}
class MMLength$1 extends CSS_Length$1 {
    get unit(){return "mm";}
}
class CMLength$1 extends CSS_Length$1 {
    get unit(){return "cm";}
}
class INLength$1 extends CSS_Length$1 {
    get unit(){return "in";}
}
class PTLength$1 extends CSS_Length$1 {
    get unit(){return "pt";}
}
class PCLength$1 extends CSS_Length$1 {
    get unit(){return "pc";}
}
class CHLength$1 extends CSS_Length$1 {
    get unit(){return "ch";}
}
class EMLength$1 extends CSS_Length$1 {
    get unit(){return "em";}
}
class EXLength$1 extends CSS_Length$1 {
    get unit(){return "ex";}
}
class REMLength$1 extends CSS_Length$1 {
    get unit(){return "rem";}
}
class VHLength$1 extends CSS_Length$1 {
    get unit(){return "vh";}
}
class VWLength$1 extends CSS_Length$1 {
    get unit(){return "vw";}
}
class VMINLength$1 extends CSS_Length$1 {
    get unit(){return "vmin";}
}
class VMAXLength$1 extends CSS_Length$1 {
    get unit(){return "vmax";}
}
class DEGLength$1 extends CSS_Length$1 {
    get unit(){return "deg";}
}

class CSS_URL$1 extends URL {
    static parse(l, rule, r) {
        if (l.tx == "url" || l.tx == "uri") {
            l.next().a("(");
            let v = "";
            if (l.ty == l.types.str) {
                v = l.tx.slice(1,-1);
                l.next().a(")");
            } else {
                let p = l.p;
                while (!p.END && p.next().tx !== ")") { /* NO OP */ }
                v = p.slice(l);
                l.sync().a(")");
            }
            return new CSS_URL$1(v);
        } if (l.ty == l.types.str){
            let v = l.tx.slice(1,-1);
            l.next();
            return new CSS_URL$1(v);
        }

        return null;
    }
}

class CSS_String$1 extends String {
    static parse(l, rule, r) {
        if (l.ty == l.types.str) {
            let tx = l.tx;
            l.next();
            return new CSS_String$1(tx);
        }
        return null;
    }
}

class CSS_Id$1 extends String {
    static parse(l, rule, r) {
        if (l.ty == l.types.id) {
            let tx = l.tx;
            l.next();
            return new CSS_Id$1(tx);
        }
        return null;
    }
}

/* https://www.w3.org/TR/css-shapes-1/#typedef-basic-shape */
class CSS_Shape$1 extends Array {
    static parse(l, rule, r) {
        if (l.tx == "inset" || l.tx == "circle" || l.tx == "ellipse" || l.tx == "polygon") {
            l.next().a("(");
            let v = "";
            if (l.ty == l.types.str) {
                v = l.tx.slice(1,-1);
                l.next().a(")");
            } else {
                let p = l.p;
                while (!p.END && p.next().tx !== ")") { /* NO OP */ }
                v = p.slice(l);
                l.sync().a(")");
            }
            return new CSS_Shape$1(v);
        }
        return null;
    }
}

class CSS_Number$1 extends Number {
    static parse(l, rule, r) {
        let tx = l.tx;
        if(l.ty == l.types.num){
            l.next();
            return new CSS_Number$1(tx);
        }
        return null;
    }
}

class CSS_Bezier$1 extends CBezier {
	static parse(l, rule, r) {

		let out = null;

		switch(l.tx){
			case "cubic":
				l.next().a("(");
				let v1 = parseFloat(l.tx);
				let v2 = parseFloat(l.next().a(",").tx);
				let v3 = parseFloat(l.next().a(",").tx);
				let v4 = parseFloat(l.next().a(",").tx);
				l.a(")");
				out = new CSS_Bezier$1(v1, v2, v3, v4);
				break;
			case "ease":
				l.next();
				out = new CSS_Bezier$1(0.25, 0.1, 0.25, 1);
				break;
			case "ease-in":
				l.next();
				out = new CSS_Bezier$1(0.42, 0, 1, 1);
				break;
			case "ease-out":
				l.next();
				out = new CSS_Bezier$1(0, 0, 0.58, 1);
				break;
			case "ease-in-out":
				l.next();
				out = new CSS_Bezier$1(0.42, 0, 0.58, 1);
				break;
		}

		return out;
	}
}

class Stop$1{
	constructor(color, percentage){
		this.color = color;
		this.percentage = percentage || null;
	}

	toString(){
		return `${this.color}${(this.percentage)?" "+this.percentage:""}`;
	}
}

class CSS_Gradient$1{

	static parse(l, rule, r) {
        let tx = l.tx,
            pky = l.pk.ty;
        if (l.ty == l.types.id) {
        	switch(l.tx){
        		case "linear-gradient":
        		l.next().a("(");
        		let dir,num,type ="deg";
        		if(l.tx == "to"){

        		}else if(l.ty == l.types.num){
        			num = parseFloat(l.ty);
        			type = l.next().tx;
        			l.next().a(',');
        		}
        		let stops = [];
        		while(!l.END && l.ch != ")"){
        			let v = CSS_Color$1.parse(l, rule, r);
        			let len = null;

        			if(l.ch == ")") {
        				stops.push(new Stop$1(v, len));
        				break;
        			}
        			
        			if(l.ch != ","){
	        			if(!(len = CSS_Length$1.parse(l, rule, r)))
	        				len = CSS_Percentage$1.parse(l,rule,r);
        			}else{
        				l.next();
        			}

        			stops.push(new Stop$1(v, len));
        		}
        		l.a(")");
        		let grad = new CSS_Gradient$1();
        		grad.stops = stops;
        		return grad;
        	}
        }
        return null;
    }


	constructor(type = 0){
		this.type = type; //linear gradient
		this.direction = new CSS_Length$1(0, "deg");
		this.stops = [];
	}

	toString(){
		let str = [];
		switch(this.type){
			case 0:
			str.push("linear-gradient(");
			if(this.direction !== 0)
				str.push(this.direction.toString() + ",");
			break;
		}

		for(let i = 0; i < this.stops.length; i++)
			str.push(this.stops[i].toString()+((i<this.stops.length-1)?",":""));

		str.push(")");

		return str.join(" ");
	}
}

const $medh$1 = (prefix) => ({
    parse: (l, r, a, n = 0) => (n = CSS_Length$1.parse(l, r, a), (prefix > 0) ? ((prefix > 1) ? (win) => win.innerHeight <= n : (win) => win.innerHeight >= n) : (win) => win.screen.height == n)
});


const $medw$1 = (prefix) => ({
    parse: (l, r, a, n = 0) => 
        (n = CSS_Length$1.parse(l, r, a), (prefix > 0) ? ((prefix > 1) ? (win) => win.innerWidth >= n : (win) => win.innerWidth <= n) : (win) => win.screen.width == n)
});

function CSS_Media_handle$1(type, prefix) {
    switch (type) {
        case "h":
            return $medh$1(prefix);
        case "w":
            return $medw$1(prefix);
    }

    return {
        parse: function(a, b, c) {
            debugger;
        }
    };
}

function getValue$1(lex, attribute) {
    let v = lex.tx,
        mult = 1;

    if (v == "-")
        v = lex.n.tx, mult = -1;

    let n = parseFloat(v) * mult;

    lex.n;

    if (lex.ch !== ")" && lex.ch !== ",") {
        switch (lex.tx) {
            case "%":
                break;

            /* Rotational Values */
            case "grad":
                n *= Math.PI / 200;
                break;
            case "deg":
                n *= Math.PI / 180;
                break;
            case "turn":
                n *= Math.PI * 2;
                break;
            case "px":
                break;
            case "em":
                break;
        }
        lex.n;
    }
    return n;
}

function ParseString$1(string, transform) {
    var lex = whind$1(string);
    
    while (!lex.END) {
        let tx = lex.tx;
        lex.n;
        switch (tx) {
            case "matrix":

                let a = getValue$1(lex.a("(")),
                    b = getValue$1(lex.a(",")),
                    c = getValue$1(lex.a(",")),
                    d = getValue$1(lex.a(",")),
                    r = -Math.atan2(b, a),
                    sx1 = (a / Math.cos(r)) || 0,
                    sx2 = (b / -Math.sin(r)) || 0,
                    sy1 = (c / Math.sin(r)) || 0,
                    sy2 = (d / Math.cos(r)) || 0;
                
                if(sx2 !== 0)
                    transform.sx = (sx1 + sx2) * 0.5;
                else
                    transform.sx = sx1;

                if(sy1 !== 0)
                    transform.sy = (sy1 + sy2) * 0.5;
                else
                    transform.sy = sy2;

                transform.px = getValue$1(lex.a(","));
                transform.py = getValue$1(lex.a(","));
                transform.r = r;
                lex.a(")");
                break;
            case "matrix3d":
                break;
            case "translate":
                transform.px = getValue$1(lex.a("("), "left");
                lex.a(",");
                transform.py = getValue$1(lex, "left");
                lex.a(")");
                continue;
            case "translateX":
                transform.px = getValue$1(lex.a("("), "left");
                lex.a(")");
                continue;
            case "translateY":
                transform.py = getValue$1(lex.a("("), "left");
                lex.a(")");
                continue;
            case "scale":
                transform.sx = getValue$1(lex.a("("), "left");
                if(lex.ch ==","){
                    lex.a(",");
                    transform.sy = getValue$1(lex, "left");
                }
                else transform.sy = transform.sx;
                lex.a(")");
                continue;
            case "scaleX":
                transform.sx = getValue$1(lex.a("("), "left");
                lex.a(")");
                continue;
            case "scaleY":
                transform.sy = getValue$1(lex.a("("), "left");
                lex.a(")");
                continue;
            case "scaleZ":
                break;
            case "rotate":
                transform.r = getValue$1(lex.a("("));
                lex.a(")");
                continue;
            case "rotateX":
                break;
            case "rotateY":
                break;
            case "rotateZ":
                break;
            case "rotate3d":
                break;
            case "perspective":
                break;
        }
        lex.n;
    }
}
// A 2D transform composition of 2D position, 2D scale, and 1D rotation.

class CSS_Transform2D$1 extends Float64Array {
    static ToString(pos = [0, 0], scl = [1, 1], rot = 0) {
        var px = 0,
            py = 0,
            sx = 1,
            sy = 1,
            r = 0, cos = 1, sin = 0;
        if (pos.length == 5) {
            px = pos[0];
            py = pos[1];
            sx = pos[2];
            sy = pos[3];
            r = pos[4];
        } else {
            px = pos[0];
            py = pos[1];
            sx = scl[0];
            sy = scl[1];
            r = rot;
        }
        
        if(r !== 0){
            cos = Math.cos(r);
            sin = Math.sin(r);
        }

        return `matrix(${cos * sx}, ${-sin * sx}, ${sy * sin}, ${sy * cos}, ${px}, ${py})`;
    }


    constructor(px, py, sx, sy, r) {
        super(5);
        this.sx = 1;
        this.sy = 1;
        if (px) {
            if (px instanceof CSS_Transform2D$1) {
                this[0] = px[0];
                this[1] = px[1];
                this[2] = px[2];
                this[3] = px[3];
                this[4] = px[4];
            } else if (typeof(px) == "string") ParseString$1(px, this);
            else {
                this[0] = px;
                this[1] = py;
                this[2] = sx;
                this[3] = sy;
                this[4] = r;
            }
        }
    }
    get px() {
        return this[0];
    }
    set px(v) {
        this[0] = v;
    }
    get py() {
        return this[1];
    }
    set py(v) {
        this[1] = v;
    }
    get sx() {
        return this[2];
    }
    set sx(v) {
        this[2] = v;
    }
    get sy() {
        return this[3];
    }
    set sy(v) {
        this[3] = v;
    }
    get r() {
        return this[4];
    }
    set r(v) {
        this[4] = v;
    }

    set scale(s){
        this.sx = s;
        this.sy = s;
    }

    get scale(){
        return this.sx;
    }
    
    lerp(to, t) {
        let out = new CSS_Transform2D$1();
        for (let i = 0; i < 5; i++) out[i] = this[i] + (to[i] - this[i]) * t;
        return out;
    }
    toString() {
        return CSS_Transform2D$1.ToString(this);
    }

    copy(v) {
        let copy = new CSS_Transform2D$1(this);


        if (typeof(v) == "string")
            ParseString$1(v, copy);

        return copy;
    }

    /**
     * Sets the transform value of a canvas 2D context;
     */
    setCTX(ctx){       
        let cos = 1, sin = 0;
        if(this[4] != 0){
            cos = Math.cos(this[4]);
            sin = Math.sin(this[4]);
        }
        ctx.transform(cos * this[2], -sin * this[2], this[3] * sin, this[3] * cos, this[0], this[1]);
    }

    getLocalX(X){
        return (X - this.px) / this.sx;
    }

    getLocalY(Y){
        return (Y - this.py) / this.sy;
    }
}

/**
 * @brief Path Info
 * @details Path syntax information for reference
 * 
 * MoveTo: M, m
 * LineTo: L, l, H, h, V, v
 * Cubic Bézier Curve: C, c, S, s
 * Quadratic Bézier Curve: Q, q, T, t
 * Elliptical Arc Curve: A, a
 * ClosePath: Z, z
 * 
 * Capital symbols represent absolute positioning, lowercase is relative
 */
const PathSym$1 = {
    M: 0,
    m: 1,
    L: 2,
    l: 3,
    h: 4,
    H: 5,
    V: 6,
    v: 7,
    C: 8,
    c: 9,
    S: 10,
    s: 11,
    Q: 12,
    q: 13,
    T: 14,
    t: 15,
    A: 16,
    a: 17,
    Z: 18,
    z: 19,
    pairs: 20
};

function getSignedNumber$1(lex) {
    let mult = 1,
        tx = lex.tx;
    if (tx == "-") {
        mult = -1;
        tx = lex.n.tx;
    }
    lex.n;
    return parseFloat(tx) * mult;
}

function getNumberPair$1(lex, array) {
    let x = getSignedNumber$1(lex);
    if (lex.ch == ',') lex.n;
    let y = getSignedNumber$1(lex);
    array.push(x, y);
}

function parseNumberPairs$1(lex, array) {
    while ((lex.ty == lex.types.num || lex.ch == "-") && !lex.END) {    	
    	array.push(PathSym$1.pairs);
        getNumberPair$1(lex, array);
    }
}
/**
 * @brief An array store of path data in numerical form
 */
class CSS_Path$1 extends Array {
    static FromString(string, array) {
        let lex = whind(string);
        while (!lex.END) {
            let relative = false,
                x = 0,
                y = 0;
            switch (lex.ch) {
                //Move to
                case "m":
                    relative = true;
                case "M":
                    lex.n; //
                    array.push((relative) ? PathSym$1.m : PathSym$1.M);
                    getNumberPair$1(lex, array);
                    parseNumberPairs$1(lex, array);
                    continue;
                    //Line to
                case "h":
                    relative = true;
                case "H":
                    lex.n;
                    x = getSignedNumber$1(lex);
                    array.push((relative) ? PathSym$1.h : PathSym$1.H, x);
                    continue;
                case "v":
                    relative = true;
                case "V":
                    lex.n;
                    y = getSignedNumber$1(lex);
                    array.push((relative) ? PathSym$1.v : PathSym$1.V, y);
                    continue;
                case "l":
                    relative = true;
                case "L":
                    lex.n;
                    array.push((relative) ? PathSym$1.l : PathSym$1.L);
                    getNumberPair$1(lex, array);
                    parseNumberPairs$1(lex, array);
                    continue;
                    //Cubic Curve
                case "c":
                    relative = true;
                case "C":
                    array.push((relative) ? PathSym$1.c : PathSym$1.C);
                    getNumberPair$1(lex, array);
                    getNumberPair$1(lex, array);
                    getNumberPair$1(lex, array);
                    parseNumberPairs$1(lex, array);
                    continue;
                case "s":
                    relative = true;
                case "S":
                    array.push((relative) ? PathSym$1.s : PathSym$1.S);
                    getNumberPair$1(lex, array);
                    getNumberPair$1(lex, array);
                    parseNumberPairs$1(lex, array);
                    continue;
                    //Quadratic Curve0
                case "q":
                    relative = true;
                case "Q":
                    array.push((relative) ? PathSym$1.q : PathSym$1.Q);
                    getNumberPair$1(lex, array);
                    getNumberPair$1(lex, array);
                    parseNumberPairs$1(lex, array);
                    continue;
                case "t":
                    relative = true;
                case "T":
                    array.push((relative) ? PathSym$1.t : PathSym$1.T);
                    getNumberPair$1(lex, array);
                    parseNumberPairs$1(lex, array);
                    continue;
                    //Elliptical Arc
                    //Close path:
                case "z":
                    relative = true;
                case "Z":
                    array.push((relative) ? PathSym$1.z : PathSym$1.Z);
            }
            lex.n;
        }
    }

    static ToString(array) {
    	let string = [], l = array.length, i = 0;
    	while(i < l){
    		switch(array[i++]){
    			case PathSym$1.M:
    				string.push("M", array[i++], array[i++]);
    				break;
			    case PathSym$1.m:
			    	string.push("m", array[i++], array[i++]);
			    	break;
			    case PathSym$1.L:
			    	string.push("L", array[i++], array[i++]);
			    	break;
			    case PathSym$1.l:
			    	string.push("l", array[i++], array[i++]);
			    	break;
			    case PathSym$1.h:
			    	string.push("h", array[i++]);
			    	break;
			    case PathSym$1.H:
			    	string.push("H", array[i++]);
			    	break;
			    case PathSym$1.V:
			    	string.push("V", array[i++]);
			    	break;
			    case PathSym$1.v:
			    	string.push("v", array[i++]);
			    	break;
			    case PathSym$1.C:
			    	string.push("C", array[i++], array[i++], array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym$1.c:
			    	string.push("c", array[i++], array[i++], array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym$1.S:
			    	string.push("S", array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym$1.s:
			    	string.push("s", array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym$1.Q:
			    	string.push("Q", array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym$1.q:
			    	string.push("q", array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym$1.T:
			    	string.push("T", array[i++], array[i++]);
			    	break;
			    case PathSym$1.t:
			    	string.push("t", array[i++], array[i++]);
			    	break;
			    case PathSym$1.Z:
			    	string.push("Z");
			    	break;
			    case PathSym$1.z:
			    	string.push("z");
			    	break;
			    case PathSym$1.pairs:
			    	string.push(array[i++], array[i++]);
			    	break;
			 	case PathSym$1.A:
			    case PathSym$1.a:
			    default:
			    	i++;
    		}
    	}

    	return string.join(" ");
    }

    
    constructor(data) {
        super();	

    	if(typeof(data) == "string"){
    		Path.FromString(data, this);
    	}else if(Array.isArray(data)){
    		for(let i = 0; i < data.length;i++){
    			this.push(parseFloat(data[i]));
    		}
    	}
    }

    toString(){
    	return Path.ToString(this);
    }

    lerp(to, t, array = new Path){
    	let l = Math.min(this.length, to.length);

    	for(let i = 0; i < l; i++)
    		array[i] = this[i] + (to[i] - this[i]) * t;

    	return array;
    }	
}

/**
 * CSS Type constructors
 * @alias module:wick~internals.css.types.
 * @enum {object}
 */
const types$8 = {
    color: CSS_Color$1,
    length: CSS_Length$1,
    time: CSS_Length$1,
    flex: CSS_Length$1,
    angle: CSS_Length$1,
    frequency: CSS_Length$1,
    resolution: CSS_Length$1,
    percentage: CSS_Percentage$1,
    url: CSS_URL$1,
    uri: CSS_URL$1,
    number: CSS_Number$1,
    id: CSS_Id$1,
    string: CSS_String$1,
    shape: CSS_Shape$1,
    cubic_bezier: CSS_Bezier$1,
    integer: CSS_Number$1,
    gradient: CSS_Gradient$1,
    transform2D : CSS_Transform2D$1,
    path: CSS_Path$1,

    /* Media parsers */
    m_width: CSS_Media_handle$1("w", 0),
    m_min_width: CSS_Media_handle$1("w", 1),
    m_max_width: CSS_Media_handle$1("w", 2),
    m_height: CSS_Media_handle$1("h", 0),
    m_min_height: CSS_Media_handle$1("h", 1),
    m_max_height: CSS_Media_handle$1("h", 2),
    m_device_width: CSS_Media_handle$1("dw", 0),
    m_min_device_width: CSS_Media_handle$1("dw", 1),
    m_max_device_width: CSS_Media_handle$1("dw", 2),
    m_device_height: CSS_Media_handle$1("dh", 0),
    m_min_device_height: CSS_Media_handle$1("dh", 1),
    m_max_device_height: CSS_Media_handle$1("dh", 2)
};

/**
 * CSS Property Definitions https://www.w3.org/TR/css3-values/#value-defs
 * @alias module:wick~internals.css.property_definitions.
 * @enum {string}
 */
const property_definitions$1 = {
    //https://www.w3.org/TR/2018/REC-css-color-3-20180619//
    
    color: `<color>`,

    opacity: `<alphavalue>|inherit`,


    /*https://www.w3.org/TR/css-backgrounds-3/*/
    /* Background */
    background_color: `<color>`,
    background_image: `<bg_image>#`,
    background_repeat: `<repeat_style>#`,
    background_attachment: `scroll|fixed|local`,
    background_position: `[<percentage>|<length>]{1,2}|[top|center|bottom]||[left|center|right]`,
    background_clip: `<box>#`,
    background_origin: `<box>#`,
    background_size: `<bg_size>#`,
    background: `<bg_layer>#,<final_bg_layer>`,

    /* Font https://www.w3.org/TR/css-fonts-4*/
    font_family: `[[<family_name>|<generic_family>],]*[<family_name>|<generic_family>]`,
    family_name: `<id>||<string>`,
    generic_name: `serif|sans_serif|cursive|fantasy|monospace`,
    font: `[<font_style>||<font_variant>||<font_weight>]?<font_size>[/<line_height>]?<font_family>`,
    font_variant: `normal|small_caps`,
    font_style: `normal | italic | oblique <angle>?`,
    font_kerning: ` auto | normal | none`,
    font_variant_ligatures:`normal|none|[<common-lig-values>||<discretionary-lig-values>||<historical-lig-values>||<contextual-alt-values> ]`,
    font_variant_position:`normal|sub|super`,
    font_variant_caps:`normal|small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps`,


    /*CSS Clipping https://www.w3.org/TR/css-masking-1/#clipping `normal|italic|oblique`, */
    font_size: `<absolute_size>|<relative_size>|<length>|<percentage>`,
    absolute_size: `xx_small|x_small|small|medium|large|x_large|xx_large`,
    relative_size: `larger|smaller`,
    font_wight: `normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900`,

    /* Text */
    word_spacing: `normal|<length>`,
    letter_spacing: `normal|<length>`,
    text_decoration: `none|[underline||overline||line-through||blink]`,
    text_transform: `capitalize|uppercase|lowercase|none`,
    text_align: `left|right|center|justify`,
    text_indent: `<length>|<percentage>`,


    /* Border  https://www.w3.org/TR/css-backgrounds-3 */
    border_color: `<color>{1,4}`,
    border_top_color: `<color>`,
    border_right_color: `<color>`,
    border_bottom_color: `<color>`,
    border_left_color: `<color>`,

    border_width: `<line_width>{1,4}`,
    border_top_width: `<line_width>`,
    border_right_width: `<line_width>`,
    border_bottom_width: `<line_width>`,
    border_left_width: `<line_width>`,

    border_style: `<line_style>{1,4}`,
    border_top_style: `<line_style>`,
    border_right_style: `<line_style>`,
    border_bottom_style: `<line_style>`,
    border_left_style: `<line_style>`,

    border_top: `<line_width>||<line_style>||<color>`,
    border_right: `<line_width>||<line_style>||<color>`,
    border_bottom: `<line_width>||<line_style>||<color>`,
    border_left: `<line_width>||<line_style>||<color>`,

    border_radius: `<length_percentage>{1,4}[/<length_percentage>{1,4}]?`,
    border_top_left_radius: `<length_percentage>{1,2}`,
    border_top_right_radius: `<length_percentage>{1,2}`,
    border_bottom_right_radius: `<length_percentage>{1,2}`,
    border_bottom_left_radius: `<length_percentage>{1,2}`,

    border_image: `<border_image_source>||<border_image_slice>[/<border_image_width>|/<border_image_width>?/<border_image_outset>]?||<border_image_repeat>`,
    border_image_source: `none|<image>`,
    border_image_slice: `[<number>|<percentage>]{1,4}&&fill?`,
    border_image_width: `[<length_percentage>|<number>|auto]{1,4}`,
    border_image_outset: `[<length>|<number>]{1,4}`,
    border_image_repeat: `[stretch|repeat|round|space]{1,2}`,

    box_shadow: `none|<shadow>#`,

    border: `<line_width>||<line_style>||<color>`,

    width: `<length>|<percentage>|auto|inherit`,
    height: `<length>|<percentage>|auto|inherit`,
    float: `left|right|none`,
    clear: `left|right|both`,

    /* Classification */

    display: `[ <display_outside> || <display_inside> ] | <display_listitem> | <display_internal> | <display_box> | <display_legacy>`,
    white_space: `normal|pre|nowrap`,
    list_style_type: `disc|circle|square|decimal|decimal-leading-zero|lower-roman|upper-roman|lower-greek|lower-latin|upper-latin|armenian|georgian|lower-alpha|upper-alpha|none|inherit`,
    list_style_image: `<url>|none`,
    list_style_position: `inside|outside`,
    list_style: `[disc|circle|square|decimal|lower-roman|upper-roman|lower-alpha|upper-alpha|none]||[inside|outside]||[<url>|none]`,
    vertical_align: `baseline|sub|super|top|text-top|middle|bottom|text-bottom|<percentage>|<length>|inherit`,

    /* Layout https://www.w3.org/TR/css-position-3 */ 
    position: "static|relative|absolute|sticky|fixed",
    top: `<length>|<percentage>|auto|inherit`,
    left: `<length>|<percentage>|auto|inherit`,
    bottom: `<length>|<percentage>|auto|inherit`,
    right: `<length>|<percentage>|auto|inherit`,

    
    /* Box Model https://www.w3.org/TR/css-box-3 */
    margin: `[<length>|<percentage>|0|auto]{1,4}`,
    margin_top: `<length>|<percentage>|0|auto`,
    margin_right: `<length>|<percentage>|0|auto`,
    margin_bottom: `<length>|<percentage>|0|auto`,
    margin_left: `<length>|<percentage>|0|auto`,

    padding: `[<length>|<percentage>|0|auto]{1,4}`,
    padding_top: `<length>|<percentage>|0|auto`,
    padding_right: `<length>|<percentage>|0|auto`,
    padding_bottom: `<length>|<percentage>|0|auto`,
    padding_left: `<length>|<percentage>|0|auto`,

    min_width: `<length>|<percentage>|inherit`,
    max_width: `<length>|<percentage>|none|inherit`,
    min_height: `<length>|<percentage>|inherit`,
    max_height: `<length>|<percentage>|none|inherit`,
    line_height: `normal|<number>|<length>|<percentage>|inherit`,
    overflow: 'visible|hidden|scroll|auto|inherit',


    box_sizing: `content-box | border-box`,

    /* Visual Effects */
    clip: '<shape>|auto|inherit',
    visibility: `visible|hidden|collapse|inherit`,
    content: `normal|none|[<string>|<uri>|<counter>|attr(<identifier>)|open-quote|close-quote|no-open-quote|no-close-quote]+|inherit`,
    quotas: `[<string><string>]+|none|inherit`,
    counter_reset: `[<identifier><integer>?]+|none|inherit`,
    counter_increment: `[<identifier><integer>?]+|none|inherit`,

    /* CSS3 Animation https://drafts.csswg.org/css-animations-1/ */
    animation: `<single_animation>#`,

    animation_name: `[none|<keyframes_name>]#`,
    animation_duration: `<time>#`,
    animation_timing_function: `<timing_function>#`,
    animation_iteration_count: `<single_animation_iteration_count>#`,
    animation_direction: `<single_animation_direction>#`,
    animation_play_state: `<single_animation_play_state>#`,
    animation_delayed: `<time>#`,
    animation_fill_mode: `<single_animation_fill_mode>#`,

    /* https://drafts.csswg.org/css-transitions-1/ */

    transition: `<single_transition>#`,
    transition_property: `none|<single_transition_property>#`,
    transition_duration: `<time>#`,
    transition_timing_function: `<timing_function>#`,
    transition_delay: `<time>#`,
};

/* Properties that are not directly accessible by CSS prop creator */

const virtual_property_definitions$1 = {

    alphavalue: '<number>',

    box: `border-box|padding-box|content-box`,

    /*https://www.w3.org/TR/css-backgrounds-3/*/

    bg_layer: `<bg_image>||<bg_position>[/<bg_size>]?||<repeat_style>||<attachment>||<box>||<box>`,
    final_bg_layer: `<background_color>||<bg_image>||<bg_position>[/<bg_size>]?||<repeat_style>||<attachment>||<box>||<box>`,
    bg_image: `<url>|<gradient>|none`,
    repeat_style: `repeat-x|repeat-y|[repeat|space|round|no-repeat]{1,2}`,
    background_attachment: `<attachment>#`,
    bg_size: `<length_percentage>|auto]{1,2}|cover|contain`,
    bg_position: `[[left|center|right|top|bottom|<length_percentage>]|[left|center|right|<length_percentage>][top|center|bottom|<length_percentage>]|[center|[left|right]<length_percentage>?]&&[center|[top|bottom]<length_percentage>?]]`,
    attachment: `scroll|fixed|local`,
    line_style: `none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset`,
    line_width: `thin|medium|thick|<length>`,

    shadow: `inset?&&<length>{2,4}&&<color>?`,

    /* Identifier https://drafts.csswg.org/css-values-4/ */

    identifier: `<id>`,
    custom_ident: `<id>`,

    /* https://drafts.csswg.org/css-timing-1/#typedef-timing-function */

    timing_function: `linear|<cubic_bezier_timing_function>|<step_timing_function>|<frames_timing_function>`,
    cubic_bezier_timing_function: `<cubic_bezier>`,
    step_timing_function: `step-start|step-end|'steps()'`,
    frames_timing_function: `'frames()'`,

    /* https://drafts.csswg.org/css-transitions-1/ */

    single_animation_fill_mode: `none|forwards|backwards|both`,
    single_animation_play_state: `running|paused`,
    single_animation_direction: `normal|reverse|alternate|alternate-reverse`,
    single_animation_iteration_count: `infinite|<number>`,
    single_transition_property: `all|<custom_ident>`,
    single_transition: `[none|<single_transition_property>]||<time>||<timing_function>||<time>`,

    /* CSS3 Animation https://drafts.csswg.org/css-animations-1/ */

    single_animation: `<time>||<timing_function>||<time>||<single_animation_iteration_count>||<single_animation_direction>||<single_animation_fill_mode>||<single_animation_play_state>||[none|<keyframes_name>]`,
    keyframes_name: `<string>`,

    /* CSS3 Stuff */
    length_percentage: `<length>|<percentage>`,
    frequency_percentage: `<frequency>|<percentage>`,
    angle_percentage: `<angle>|<percentage>`,
    time_percentage: `<time>|<percentage>`,
    number_percentage: `<number>|<percentage>`,

    /*CSS Clipping https://www.w3.org/TR/css-masking-1/#clipping */
    clip_path: `<clip_source>|[<basic_shape>||<geometry_box>]|none`,
    clip_source: `<url>`,
    shape_box: `<box>|margin-box`,
    geometry_box: `<shape_box>|fill-box|stroke-box|view-box`,
    basic_shape: `<CSS_Shape>`,
    ratio: `<integer>/<integer>`,

    /* https://www.w3.org/TR/css-fonts-3/*/
    common_lig_values        : `[ common-ligatures | no-common-ligatures ]`,
    discretionary_lig_values : `[ discretionary-ligatures | no-discretionary-ligatures ]`,
    historical_lig_values    : `[ historical-ligatures | no-historical-ligatures ]`,
    contextual_alt_values    : `[ contextual | no-contextual ]`,

    //Display
    display_outside  : `block | inline | run-in`,
    display_inside   : `flow | flow-root | table | flex | grid | ruby`,
    display_listitem : `<display-outside>? && [ flow | flow-root ]? && list-item`,
    display_internal : `table-row-group | table-header-group | table-footer-group | table-row | table-cell | table-column-group | table-column | table-caption | ruby-base | ruby-text | ruby-base-container | ruby-text-container`,
    display_box      : `contents | none`,
    display_legacy   : `inline-block | inline-table | inline-flex | inline-grid`,
};

const media_feature_definitions$1 = {
    width: "<m_width>",
    min_width: "<m_max_width>",
    max_width: "<m_min_width>",
    height: "<m_height>",
    min_height: "<m_min_height>",
    max_height: "<m_max_height>",
    orientation: "portrait  | landscape",
    aspect_ratio: "<ratio>",
    min_aspect_ratio: "<ratio>",
    max_aspect_ratio: "<ratio>",
    resolution: "<length>",
    min_resolution: "<length>",
    max_resolution: "<length>",
    scan: "progressive|interlace",
    grid: "",
    monochrome: "",
    min_monochrome: "<integer>",
    max_monochrome: "<integer>",
    color: "",
    min_color: "<integer>",
    max_color: "<integer>",
    color_index: "",
    min_color_index: "<integer>",
    max_color_index: "<integer>",

};

/**
 * Used to _bind_ a rule to a CSS selector.
 * @param      {string}  selector        The raw selector string value
 * @param      {array}  selector_array  An array of selector group identifiers.
 * @memberof module:wick~internals.css
 * @alias CSSSelector
 */
class CSSSelector$1 {

    constructor(selectors /* string */ , selectors_arrays /* array */ ) {

        /**
         * The raw selector string value
         * @package
         */

        this.v = selectors;

        /**
         * Array of separated selector strings in reverse order.
         * @package
         */

        this.a = selectors_arrays;

        /**
         * The CSSRule.
         * @package
         */
        this.r = null;
    }

    get id() {
        return this.v.join("");
    }
    /**
     * Returns a string representation of the object.
     * @return     {string}  String representation of the object.
     */
    toString(off = 0) {
        let offset = ("    ").repeat(off);

        let str = `${offset}${this.v.join(", ")} {\n`;

        if (this.r)
            str += this.r.toString(off + 1);

        return str + `${offset}}\n`;
    }

    addProp(string) {
        let root = this.r.root;
        if (root) {
            let lex = whind$1(string);
            while (!lex.END)
                root.parseProperty(lex, this.r, property_definitions$1);
        }
    }

}

/**
 * Holds a set of rendered CSS properties.
 * @memberof module:wick~internals.css
 * @alias CSSRule
 */
class CSSRule$1 {
    constructor(root) {
        /**
         * Collection of properties held by this rule.
         * @public
         */
        this.props = {};
        this.LOADED = false;
        this.root = root;
    }

    addProperty(prop, rule) {
        if (prop)
            this.props[prop.name] = prop.value;
    }

    toString(off = 0) {
        let str = [],
            offset = ("    ").repeat(off);

        for (let a in this.props) {
            if (this.props[a] !== null) {
                if (Array.isArray(this.props[a]))
                    str.push(offset, a.replace(/\_/g, "-"), ":", this.props[a].join(" "), ";\n");
                else
                    str.push(offset, a.replace(/\_/g, "-"), ":", this.props[a].toString(), ";\n");
            }
        }

        return str.join(""); //JSON.stringify(this.props).replace(/\"/g, "").replace(/\_/g, "-");
    }

    merge(rule) {
        if (rule.props) {
            for (let n in rule.props)
                this.props[n] = rule.props[n];
            this.LOADED = true;
        }
    }

    get _wick_type_() { return 0; }

    set _wick_type_(v) {}
}

/**
 * wick internals.
 * @class      NR (name)
 */
class NR$1 { //Notation Rule

    constructor() {

        this.r = [NaN, NaN];
        this._terms_ = [];
        this._prop_ = null;
        this._virtual_ = false;
    }

    sp(value, rule) { //Set Property
        if (this._prop_){
            if (value)
                if (Array.isArray(value) && value.length === 1 && Array.isArray(value[0]))
                    rule[this._prop_] = value[0];
                else
                    rule[this._prop_] = value;
        }
    }

    isRepeating() {
        return !(isNaN(this.r[0]) && isNaN(this.r[1]));
    }

    parse(lx, rule, out_val) {
        if (typeof(lx) == "string")
            lx = whind$1(lx);

        let r = out_val || { v: null },
            start = isNaN(this.r[0]) ? 1 : this.r[0],
            end = isNaN(this.r[1]) ? 1 : this.r[1];

        return this.___(lx, rule, out_val, r, start, end);
    }

    ___(lx, rule, out_val, r, start, end) {
        let bool = true;
        for (let j = 0; j < end && !lx.END; j++) {

            for (let i = 0, l = this._terms_.length; i < l; i++) {
                bool = this._terms_[i].parse(lx, rule, r);
                if (!bool) break;
            }

            if (!bool) {

                this.sp(r.v, rule);

                if (j < start)
                    return false;
                else
                    return true;
            }
        }

        this.sp(r.v, rule);

        return true;
    }
}

class AND$1 extends NR$1 {
    ___(lx, rule, out_val, r, start, end) {

        outer:
            for (let j = 0; j < end && !lx.END; j++) {
                for (let i = 0, l = this._terms_.length; i < l; i++)
                    if (!this._terms_[i].parse(lx, rule, r)) return false;
            }

        this.sp(r.v, rule);

        return true;
    }
}

class OR$1 extends NR$1 {
    ___(lx, rule, out_val, r, start, end) {
        let bool = false;

        for (let j = 0; j < end && !lx.END; j++) {
            bool = false;

            for (let i = 0, l = this._terms_.length; i < l; i++)
                if (this._terms_[i].parse(lx, rule, r)) bool = true;

            if (!bool && j < start) {
                this.sp(r.v, rule);
                return false;
            }
        }

        this.sp(r.v, rule);

        return true;
    }
}

class ONE_OF$1 extends NR$1 {
    ___(lx, rule, out_val, r, start, end) {
        let bool = false;

        for (let j = 0; j < end && !lx.END; j++) {
            bool = false;

            for (let i = 0, l = this._terms_.length; i < l; i++) {
                bool = this._terms_[i].parse(lx, rule, r);
                if (bool) break;
            }

            if (!bool)
                if (j < start) {
                    this.sp(r.v, rule);
                    return false;
                }
        }

        this.sp(r.v, rule);

        return bool;
    }
}

class ValueTerm$1 {

    constructor(value, getPropertyParser, definitions) {

        this._value_ = null;

        const IS_VIRTUAL = { is: false };

        if (!(this._value_ = types$8[value]))
            this._value_ = getPropertyParser(value, IS_VIRTUAL, definitions);

        this._prop_ = "";

        if (!this._value_)
            return new LiteralTerm$1(value);

        if (this._value_ instanceof NR$1 && IS_VIRTUAL.is)
            this._virtual_ = true;
    }

    parse(l, rule, r) {
        if (typeof(l) == "string")
            l = whind$1(l);

        let rn = { v: null };

        let v = this._value_.parse(l, rule, rn);

        if (rn.v) {
            if (r)
                if (r.v) {
                    if (Array.isArray(r.v)) {
                        if (Array.isArray(rn.v) && !this._virtual_)
                            r.v = r.v.concat(rn.v);
                        else
                            r.v.push(rn.v);
                    } else {
                        if (Array.isArray(rn.v) && !this._virtual_)
                            r.v = ([r.v]).concat(rn.v);
                        else
                            r.v = [r.v, rn.v];
                    }
                } else
                    r.v = (this._virtual_) ? [rn.v] : rn.v;

            if (this._prop_)
                rule[this._prop_] = rn.v;

            return true;

        } else if (v) {
            if (r)
                if (r.v) {
                    if (Array.isArray(r.v))
                        r.v.push(v);
                    else
                        r.v = [r.v, v];
                } else
                    r.v = v;

            if (this._prop_)
                rule[this._prop_] = v;

            return true;
        } else
            return false;
    }
}

class LiteralTerm$1 {

    constructor(value) {
        this._value_ = value;
        this._prop_ = null;
    }

    parse(l, rule, r) {

        if (typeof(l) == "string")
            l = whind$1(l);

        let v = l.tx;
        if (v == this._value_) {
            l.next();

            if (r)
                if (r.v) {
                    if (Array.isArray(r.v))
                        r.v.push(v);
                    else {
                        let t = r.v;
                        r.v = [t, v];
                    }
                } else
                    r.v = v;

            if (this._prop_)
                rule[this._prop_] = v;

            return true;
        }
        return false;
    }
}

class SymbolTerm$1 extends LiteralTerm$1 {
    parse(l, rule, r) {
        if (typeof(l) == "string")
            l = whind$1(l);

        if (l.tx == this._value_) {
            l.next();
            return true;
        }

        return false;
    }
}

function getPropertyParser$1(property_name, IS_VIRTUAL = { is: false }, definitions = null) {

    let prop = definitions[property_name];

    if (prop) {

        if (typeof(prop) == "string")
            prop = definitions[property_name] = CreatePropertyParser$1(prop, property_name, definitions);

        return prop;
    }

    prop = virtual_property_definitions$1[property_name];

    if (prop) {

        IS_VIRTUAL.is = true;

        if (typeof(prop) == "string")
            prop = virtual_property_definitions$1[property_name] = CreatePropertyParser$1(prop, "", definitions);

        return prop;
    }

    return null;
}


function CreatePropertyParser$1(notation, name, definitions) {

    const l = whind$1(notation);

    const important = { is: false };

    let n = d$2(l, definitions);

    if (n instanceof NR$1 && n._terms_.length == 1)
        n = n._terms_[0];

    n._prop_ = name;
    n.IMP = important.is;

    return n;
}

function d$2(l, definitions, super_term = false, group = false, need_group = false, and_group = false, important = null) {
    let term, nt;

    while (!l.END) {
        switch (l.ch) {
            case "]":
                if (term) return term;
                else 
                    throw new Error("Expected to have term before \"]\"");
            case "[":
                if (term) return term;
                term = d$2(l.next(), definitions);
                l.a("]");
                break;
            case "&":
                if (l.pk.ch == "&") {
                    if (and_group)
                        return term;

                    nt = new AND$1();

                    nt._terms_.push(term);

                    l.sync().next();

                    while (!l.END) {
                        nt._terms_.push(d$2(l, definitions, super_term, group, need_group, true, important));
                        if (l.ch !== "&" || l.pk.ch !== "&") break;
                        l.a("&").a("&");
                    }

                    return nt;
                }
            case "|":
                {
                    if (l.pk.ch == "|") {

                        if (need_group)
                            return term;

                        nt = new OR$1();

                        nt._terms_.push(term);

                        l.sync().next();

                        while (!l.END) {
                            nt._terms_.push(d$2(l, definitions, super_term, group, true, and_group, important));
                            if (l.ch !== "|" || l.pk.ch !== "|") break;
                            l.a("|").a("|");
                        }

                        return nt;

                    } else {
                        if (group) {
                            return term;
                        }

                        nt = new ONE_OF$1();

                        nt._terms_.push(term);

                        l.next();

                        while (!l.END) {
                            nt._terms_.push(d$2(l, definitions, super_term, true, need_group, and_group, important));
                            if (l.ch !== "|") break;
                            l.a("|");
                        }

                        return nt;
                    }
                }
                break;
            case "{":
                term = _Jux_$1(term);
                term.r[0] = parseInt(l.next().tx);
                if (l.next().ch == ",") {
                    l.next();
                    if (l.next().ch == "}")
                        term.r[1] = Infinity;
                    else {
                        term.r[1] = parseInt(l.tx);
                        l.next();
                    }
                } else
                    term.r[1] = term.r[0];
                l.a("}");
                if (super_term) return term;
                break;
            case "*":
                term = _Jux_$1(term);
                term.r[0] = 0;
                term.r[1] = Infinity;
                l.next();
                if (super_term) return term;
                break;
            case "+":
                term = _Jux_$1(term);
                term.r[0] = 1;
                term.r[1] = Infinity;
                l.next();
                if (super_term) return term;
                break;
            case "?":
                term = _Jux_$1(term);
                term.r[0] = 0;
                term.r[1] = 1;
                l.next();
                if (super_term) return term;
                break;
            case "#":
                term = _Jux_$1(term);
                term._terms_.push(new SymbolTerm$1(","));
                term.r[0] = 1;
                term.r[1] = Infinity;
                l.next();
                if (l.ch == "{") {
                    term.r[0] = parseInt(l.next().tx);
                    term.r[1] = parseInt(l.next().a(",").tx);
                    l.next().a("}");
                }
                if (super_term) return term;
                break;
            case "<":
                let v;

                if (term) {
                    if (term instanceof NR$1 && term.isRepeating()) term = _Jux_$1(new NR$1, term);
                    let v = d$2(l, definitions, true);
                    term = _Jux_$1(term, v);
                } else {
                    let v = new ValueTerm$1(l.next().tx, getPropertyParser$1, definitions);
                    l.next().a(">");
                    term = v;
                }
                break;
            case "!":
                /* https://www.w3.org/TR/CSS21/cascade.html#important-rules */

                l.next().a("important");
                important.is = true;
                break;
            default:
                if (term) {
                    if (term instanceof NR$1 && term.isRepeating()) term = _Jux_$1(new NR$1, term);
                    let v = d$2(l, definitions, true);
                    term = _Jux_$1(term, v);
                } else {
                    let v = (l.ty == l.types.symbol) ? new SymbolTerm$1(l.tx) : new LiteralTerm$1(l.tx);
                    l.next();
                    term = v;
                }
        }
    }
    return term;
}

function _Jux_$1(term, new_term = null) {
    if (term) {
        if (!(term instanceof NR$1)) {
            let nr = new NR$1();
            nr._terms_.push(term);
            term = nr;
        }
        if (new_term) term._terms_.push(new_term);
        return term;
    }
    return new_term;
}

/**
 * Checks to make sure token is an Identifier.
 * @param      {Lexer} - A Lexical tokenizing object supporting methods found in {@link Lexer}.
 * @alias module:wick~internals.css.elementIsIdentifier
 */
function _eID_$1(lexer) {
    if (lexer.ty != lexer.types.id) lexer.throw("Expecting Identifier");
}

/**
 * The empty CSSRule instance
 * @alias module:wick~internals.css.empty_rule
 */
const er$1 = Object.freeze(new CSSRule$1());

class _selectorPart_$1 {
    constructor() {
        this.e = "";
        this.ss = [];
        this.c = "";
    }
}
class _mediaSelectorPart_$1 {
    constructor() {
        this.id = "";
        this.props = {};
        this.c = "";
    }
}

class CSSRuleBody$1 {
    constructor() {
        this.media_selector = null;
        /**
         * All selectors indexed by their value
         */
        this._selectors_ = {};
        /**
         * All selectors in order of appearance
         */
        this._sel_a_ = [];
    }

    _applyProperties_(lexer, rule) {
        while (!lexer.END && lexer.tx !== "}") this.parseProperty(lexer, rule, property_definitions$1);
        lexer.next();
    }

    /**
     * Gets the last rule matching the selector
     * @param      {string}  string  The string
     * @return     {CSSRule}  The combined set of rules that match the selector.
     */
    getRule(string, r) {
        let selector = this._selectors_[string];
        if (selector) return selector.r;
        return r;
    }


    /**
     * Hook method for hijacking the property parsing function. Return true if default property parsing should not take place
     * @param      {Lexer}   value_lexer    The value lexer
     * @param      {<type>}   property_name  The property name
     * @param      {<type>}   rule           The rule
     * @return     {boolean}  The property hook.
     */
    _getPropertyHook_(value_lexer, property_name, rule) {
        return false;
    }

    /**
     * Used to match selectors to elements
     * @param      {ele}   ele       The ele
     * @param      {string}   criteria  The criteria
     * @return     {boolean}  { description_of_the_return_value }
     * @private
     */
    matchCriteria(ele, criteria) {
        if (criteria.e && ele.tagName !== criteria.e.toUpperCase()) return false;
        outer: for (let i = 0, l = criteria.ss.length; i < l; i++) {
            let ss = criteria.ss[i];
            switch (ss.t) {
                case "attribute":
                    let lex = whind$1(ss.v);
                    if (lex.ch == "[" && lex.pk.ty == lex.types.id) {
                        let id = lex.sync().tx;
                        let attrib = ele.getAttribute(id);
                        if (!attrib) return;
                        if (lex.next().ch == "=") {
                            let value = lex.next().tx;
                            if (attrib !== value) return false;
                        }
                    }
                    break;
                case "pseudo":
                    debugger;
                    break;
                case "class":
                    let class_list = ele.classList;
                    for (let j = 0, jl = class_list.length; j < jl; j++) {
                        if (class_list[j] == ss.v) continue outer;
                    }
                    return false;
                case "id":
                    if (ele.id !== ss.v) return false;
            }
        }
        return true;
    }

    matchMedia(win = window) {

        if (this.media_selector) {
            for (let i = 0; i < this.media_selector.length; i++) {
                let m = this.media_selector[i];
                let props = m.props;
                for (let a in props) {
                    let prop = props[a];
                    if (!prop(win))
                        return false;
                }
            }
        }

        return true;
    }

    /**
     * Retrieves the set of rules from all matching selectors for an element.
     * @param      {HTMLElement}  element - An element to retrieve CSS rules.
     * @public
     */
    getApplicableRules(element, rule = new CSSRule$1(), win = window) {

        if (!this.matchMedia(win)) return;

        let gen = this.getApplicableSelectors(element),
            sel = null;

        while (sel = gen.next().value) rule.merge(sel.r);
    }

    * getApplicableSelectors(element) {
        for (let j = 0, jl = this._sel_a_.length; j < jl; j++) {
            let ancestor = element;
            let selector = this._sel_a_[j];
            let sn = selector.a;
            let criteria = null;
            outer: for (let x = 0; x < sn.length; x++) {

                let sa = sn[x];

                inner: for (let i = 0, l = sa.length; i < l; i++) {
                    criteria = sa[i];
                    switch (criteria.c) {
                        case "child":
                            if (!(ancestor = ancestor.parentElement) || !this.matchCriteria(ancestor, criteria)) continue outer;
                            break;
                        case "preceded":
                            while ((ancestor = ancestor.previousElementSibling))
                                if (this.matchCriteria(ancestor, criteria)) continue inner;
                            continue outer;
                        case "immediately preceded":
                            if (!(ancestor = ancestor.previousElementSibling) || !this.matchCriteria(ancestor, criteria)) continue outer;
                            break;
                        case "descendant":
                            while ((ancestor = ancestor.parentElement))
                                if (this.matchCriteria(ancestor, criteria)) continue inner;
                            continue outer;
                        default:
                            if (!this.matchCriteria(ancestor, criteria)) continue outer;
                    }
                }
                yield selector;
            }
        }
    }

    /**
     * Parses properties
     * @param      {Lexer}  lexer        The lexer
     * @param      {<type>}  rule         The rule
     * @param      {<type>}  definitions  The definitions
     */
    parseProperty(lexer, rule, definitions) {
        const name = lexer.tx.replace(/\-/g, "_");

        //Catch any comments
        if (lexer.ch == "/") {
            lexer.comment(true);
            return this.parseProperty(lexer, rule, definitions);
        }
        lexer.next().a(":");
        //allow for short circuit < | > | =
        const p = lexer.pk;
        while ((p.ch !== "}" && p.ch !== ";") && !p.END) {
            //look for end of property;
            p.next();
        }
        const out_lex = lexer.copy();
        lexer.sync();
        out_lex.fence(p);
        if (!this._getPropertyHook_(out_lex, name, rule)) {
            try {
                const IS_VIRTUAL = {
                    is: false
                };
                const parser = getPropertyParser$1(name, IS_VIRTUAL, definitions);
                if (parser && !IS_VIRTUAL.is) {
                    if (!rule.props) rule.props = {};
                    parser.parse(out_lex, rule.props);
                } else
                    //Need to know what properties have not been defined
                    console.warn(`Unable to get parser for css property ${name}`);
            } catch (e) {
                console.log(e);
            }
        }
        if (lexer.ch == ";") lexer.next();
    }

    /** 
    Parses a selector up to a token '{', creating or accessing necessary rules as it progresses. 

    Reference: https://www.w3.org/TR/selectors-3/ 
    https://www.w3.org/TR/css3-mediaqueries/
    https://www.w3.org/TR/selectors-3/

    @param {Lexer} - A Lexical tokenizing object supporting methods found in {@link Lexer}.

    @protected

    */
    parseSelector(lexer) {
        let rule = this,
            id = "",
            selector_array = [],
            selectors_array = [];
        let start = lexer.pos;
        let selectors = [];
        let sel = new _selectorPart_$1(),
            RETURN = false;
        while (!lexer.END) {
            if (!sel) sel = new _selectorPart_$1();
            switch (lexer.tx) {
                case "{":
                    RETURN = true;
                case ",":
                    selector_array.unshift(sel);
                    selectors_array.push(selector_array);
                    selector_array = [];
                    selectors.push(lexer.s(start).trim().slice(0));
                    sel = new _selectorPart_$1();
                    if (RETURN) return new CSSSelector$1(selectors, selectors_array, this);
                    lexer.next();
                    start = lexer.pos;
                    break;
                case "[":
                    let p = lexer.pk;
                    while (!p.END && p.next().tx !== "]") {};
                    p.a("]");
                    if (p.END) throw new _Error_("Unexpected end of input.");
                    sel.ss.push({
                        t: "attribute",
                        v: p.s(lexer)
                    });
                    lexer.sync();
                    break;
                case ":":
                    sel.ss.push({
                        t: "pseudo",
                        v: lexer.next().tx
                    });
                    _eID_$1(lexer);
                    lexer.next();
                    break;
                case ".":
                    sel.ss.push({
                        t: "class",
                        v: lexer.next().tx
                    });
                    _eID_$1(lexer);
                    lexer.next();
                    break;
                case "#":
                    sel.ss.push({
                        t: "id",
                        v: lexer.next().tx
                    });
                    _eID_$1(lexer);
                    lexer.next();
                    break;
                case "*":
                    lexer.next();
                    break;
                case ">":
                    sel.c = "child";
                    selector_array.unshift(sel);
                    sel = null;
                    lexer.next();
                    break;
                case "~":
                    sel.c = "preceded";
                    selector_array.unshift(sel);
                    sel = null;
                    lexer.next();
                    break;
                case "+":
                    sel.c = "immediately preceded";
                    selector_array.unshift(sel);
                    sel = null;
                    lexer.next();
                    break;
                default:
                    if (sel.e) {
                        sel.c = "descendant";
                        selector_array.unshift(sel);
                        sel = null;
                    } else {
                        sel.e = lexer.tx;

                        _eID_$1(lexer);
                        lexer.next();
                    }
                    break;
            }
        }
        selector_array.unshift(sel);
        selectors_array.push(selector_array);
        selectors.push(lexer.s(start).trim().slice(0));
        return new CSSSelector$1(selectors, selectors_array, this);
    }

    /**
     * Parses CSS string
     * @param      {Lexer} - A Lexical tokenizing object supporting methods found in {@link Lexer}
     * @param      {(Array|CSSRuleBody|Object|_mediaSelectorPart_)}  root    The root
     * @return     {Promise}  A promise which will resolve to a CSSRuleBody
     * @private
     */
    parse(lexer, root, res = null, rej = null) {

        if (root && !this.par) root.push(this);

        return new Promise((res, rej) => {
            let selectors = [],
                l = 0;
            while (!lexer.END) {
                switch (lexer.ch) {
                    case "@":
                        lexer.next();
                        switch (lexer.tx) {
                            case "media": //Ignored at this iteration /* https://drafts.csswg.org/mediaqueries/ */
                                //create media query selectors
                                let _med_ = [],
                                    sel = null;
                                while (!lexer.END && lexer.next().ch !== "{") {
                                    if (!sel) sel = new _mediaSelectorPart_$1();
                                    if (lexer.ch == ",") _med_.push(sel), sel = null;
                                    else if (lexer.ch == "(") {
                                        let start = lexer.next().off;
                                        while (!lexer.END && lexer.ch !== ")") lexer.next();
                                        let out_lex = lexer.copy();
                                        out_lex.off = start;
                                        out_lex.tl = 0;
                                        out_lex.next().fence(lexer);
                                        this.parseProperty(out_lex, sel, media_feature_definitions$1);
                                        if (lexer.pk.tx.toLowerCase() == "and") lexer.sync();
                                    } else {
                                        let id = lexer.tx.toLowerCase(),
                                            condition = "";
                                        if (id === "only" || id === "not")
                                            (condition = id, id = lexer.next().tx);
                                        sel.c = condition;
                                        sel.id = id;
                                        if (lexer.pk.tx.toLowerCase() == "and") lexer.sync();
                                    }
                                }
                                //debugger
                                lexer.a("{");
                                if (sel)
                                    _med_.push(sel);

                                if (_med_.length == 0)
                                    this.parse(lexer, null); // discard results
                                else {
                                    let media_root = new this.constructor();
                                    media_root.media_selector = _med_;
                                    res(media_root.parse(lexer, root).then(b => {
                                        let body = new this.constructor();
                                        return body.parse(lexer, root);
                                    }));
                                }
                                continue;
                            case "import":
                                /* https://drafts.csswg.org/css-cascade/#at-ruledef-import */
                                let type;
                                if (type = types$8.url.parse(lexer.next())) {
                                    lexer.a(";");
                                    /**
                                     * The {@link CSS_URL} incorporates a fetch mechanism that returns a Promise instance.
                                     * We use that promise to hook into the existing promise returned by CSSRoot#parse,
                                     * executing a new parse sequence on the fetched string data using the existing CSSRoot instance,
                                     * and then resume the current parse sequence.
                                     * @todo Conform to CSS spec and only parse if @import is at the top of the CSS string.
                                     */
                                    return type.fetchText().then((str) =>
                                        //Successfully fetched content, proceed to parse in the current root.
                                        //let import_lexer = ;
                                        res(this.parse(whind$1(str), this).then((r) => this.parse(lexer, r)))
                                        //parse returns Promise. 
                                        // return;
                                    ).catch((e) => res(this.parse(lexer)));
                                } else {
                                    //Failed to fetch resource, attempt to find the end to of the import clause.
                                    while (!lexer.END && lexer.next().tx !== ";") {}
                                    lexer.next();
                                }
                        }
                        break;
                    case "/":
                        lexer.comment(true);
                        break;
                    case "}":
                        lexer.next();
                        return res(this);
                    case "{":
                        let rule = new CSSRule$1(this);
                        this._applyProperties_(lexer.next(), rule);
                        for (let i = -1, sel = null; sel = selectors[++i];)
                            if (sel.r) sel.r.merge(rule);
                            else sel.r = rule;
                        selectors.length = l = 0;
                        continue;
                }

                let selector = this.parseSelector(lexer, this);

                if (selector) {
                    if (!this._selectors_[selector.id]) {
                        l = selectors.push(selector);
                        this._selectors_[selector.id] = selector;
                        this._sel_a_.push(selector);
                    } else l = selectors.push(this._selectors_[selector.id]);
                }
            }

            return res(this);
        });

    }

    isSame(inCSSRuleBody) {
        if (inCSSRuleBody instanceof CSSRuleBody$1) {
            if (this.media_selector) {
                if (inCSSRuleBody.media_selector) {
                    //TODO compare media selectors;
                }
            } else if (!inCSSRuleBody.media_selector)
                return true;
        }
        return false;
    }

    merge(inCSSRuleBody) {
        this.parse(whind$1(inCSSRuleBody + ""));
    }

    /**
     * Gets the media.
     * @return     {Object}  The media.
     * @public
     */
    getMedia(win = window) {
        let start = this;
        this._media_.forEach((m) => {
            if (m._med_) {
                let accept = true;
                for (let i = 0, l = m._med_.length; i < l; i++) {
                    let ms = m._med_[i];
                    if (ms.props) {
                        for (let n in ms.props) {
                            if (!ms.props[n](win)) accept = false;
                        }
                    }
                    //if(not)
                    //    accept = !accept;
                    if (accept)
                        (m._next_ = start, start = m);
                }
            }
        });
        return start;
    }

    updated() {
        this.par.updated();
    }

    toString(off = 0) {
        let str = "";
        for (let i = 0; i < this._sel_a_.length; i++) {
            str += this._sel_a_[i].toString(off);
        }
        return str;
    }

    createSelector(selector_value) {
        let selector = this.parseSelector(whind$1(selector_value));

        if (selector)
            if (!this._selectors_[selector.id]) {
                this._selectors_[selector.id] = selector;
                this._sel_a_.push(selector);
                selector.r = new CSSRule$1(this);
            } else
                selector = this._selectors_[selector.id];

        return selector;
    }
}

LinkedList.mixinTree(CSSRuleBody$1);

/**
 * Container for all rules found in a CSS string or strings.
 *
 * @memberof module:wick~internals.css
 * @alias CSSRootNode
 */
class CSSRootNode$1 {
    constructor() {
        this.promise = null;
        /**
         * Media query selector
         */
        this.pending_build = 0;
        this.resolves = [];
        this.res = null;
        this.observers = [];
        
        this.addChild(new CSSRuleBody$1());
    }

    _resolveReady_(res, rej) {
        if (this.pending_build > 0) this.resolves.push(res);
        res(this);
    }

    _setREADY_() {
        if (this.pending_build < 1) {
            for (let i = 0, l = this.resolves; i < l; i++) this.resolves[i](this);
            this.resolves.length = 0;
            this.res = null;
        }
    }

    _READY_() {
        if (!this.res) this.res = this._resolveReady_.bind(this);
        return new Promise(this.res);
    }
    /**
     * Creates a new instance of the object with same properties as the original.
     * @return     {CSSRootNode}  Copy of this object.
     * @public
     */
    clone() {
        let rn = new this.constructor();
        rn._selectors_ = this._selectors_;
        rn._sel_a_ = this._sel_a_;
        rn._media_ = this._media_;
        return rn;
    }

    * getApplicableSelectors(element, win = window) {

        for (let node = this.fch; node; node = this.getNextChild(node)) {

            if(node.matchMedia(win)){
                let gen = node.getApplicableSelectors(element, win);
                let v = null;
                while ((v = gen.next().value))
                    yield v;
            }
        }
    }

    /**
     * Retrieves the set of rules from all matching selectors for an element.
     * @param      {HTMLElement}  element - An element to retrieve CSS rules.
     * @public
     */
    getApplicableRules(element, rule = new CSSRule$1(), win = window) {
        for (let node = this.fch; node; node = this.getNextChild(node))
            node.getApplicableRules(element, rule, win);
        return rule;
    }

    /**
     * Gets the last rule matching the selector
     * @param      {string}  string  The string
     * @return     {CSSRule}  The combined set of rules that match the selector.
     */
    getRule(string) {
        let r = null;
        for (let node = this.fch; node; node = this.getNextChild(node))
            r = node.getRule(string, r);
        return r;
    }

    toString(off = 0) {
        let str = "";
        for (let node = this.fch; node; node = this.getNextChild(node))
            str += node.toString(off);
        return str;
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observer) {
        for (let i = 0; i < this.observers.length; i++)
            if (this.observers[i] == observer) return this.observers.splice(i, 1);
    }

    updated() {
        if (this.observers.length > 0)
            for (let i = 0; i < this.observers.length; i++) this.observers[i].updatedCSS(this);
    }

    parse(lex, root) {
        if (lex.sl > 0) {

            if (!root && root !== null) {
                root = this;
                this.pending_build++;
            }

            return this.fch.parse(lex, this).then(e => {
                this._setREADY_();
                return this;
            });
        }
    }

    merge(inCSSRootNode){
        if(inCSSRootNode instanceof CSSRootNode$1){
            
            let children = inCSSRootNode.children;
            outer:
            for(let i = 0; i < children.length; i++){
                //determine if this child matches any existing selectors
                let child = children[i];
                
                for(let i = 0; i < this.children.length; i++){
                    let own_child = this.children[i];

                    if(own_child.isSame(child)){
                        own_child.merge(child);
                        continue outer;
                    }
                }

                this.children.push(child);
            }
        }
    }
}

/**
 * CSSRootNode implements all of ll
 * @extends ll
 * @memberof  module:wick~internals.html.CSSRootNode
 * @private
 */
LinkedList.mixinTree(CSSRootNode$1);
/*
 * Expecting ID error check.
 */
const _err_$1 = "Expecting Identifier";

/**
 * Builds a CSS object graph that stores `selectors` and `rules` pulled from a CSS string. 
 * @function
 * @param {string} css_string - A string containing CSS data.
 * @param {string} css_string - An existing CSSRootNode to merge with new `selectors` and `rules`.
 * @return {Promise} A `Promise` that will return a new or existing CSSRootNode.
 * @memberof module:wick.core
 * @alias css
 */
const CSSParser$1 = (css_string, root = null) => (root = (!root || !(root instanceof CSSRootNode$1)) ? new CSSRootNode$1() : root, root.parse(whind$1(css_string)));

CSSParser$1.types = types$8;

const CSS_Length$2 = CSSParser$1.types.length;
const CSS_Percentage$2 = CSSParser$1.types.percentage;
const CSS_Color$2 = CSSParser$1.types.color;
const CSS_Transform2D$2 = CSSParser$1.types.transform2D;
const CSS_Path$2 = CSSParser$1.types.path;

const Animation = (function anim() {
    var USE_TRANSFORM = false;
    const
        CSS_STYLE = 0,
        JS_OBJECT = 1,
        SVG = 3;

    function setType(obj) {
        if (obj instanceof HTMLElement) {
            if (obj.tagName == "SVG")
                return SVG;
            return CSS_STYLE;
        }
        return JS_OBJECT;
    }

    const Linear = { getYatX: x => x };

    /**
     * Class to linearly interpolate number.
     */
    class lerpNumber extends Number { lerp(to, t) { return this + (to - this) * t; } copy(val) { return new lerpNumber(val); } }

    /**
     * Store animation data for a single property on a single object. 
     * @class      AnimProp (name)
     */
    class AnimProp {
        constructor(keys, obj, prop_name, type) {

            this.duration = 0;
            this.end = false;
            this.keys = [];
            this.current_val = null;

            let IS_ARRAY = Array.isArray(keys);

            if (prop_name == "transform")
                this.type = CSS_Transform2D$2;
            else
                this.type = (IS_ARRAY) ? this.getType(keys[0].value) : this.getType(keys.value);

            this.getValue(obj, prop_name, type);

            let p = this.current_val;

            if (IS_ARRAY) {
                keys.forEach(k => p = this.addKey(k, p));
            } else
                this.addKey(keys, p);
        }

        destroy() {
            this.keys = null;
            this.type = null;
            this.current_val = null;
        }

        getValue(obj, prop_name, type) {
            if (type == CSS_STYLE) {
                let name = prop_name.replace(/[A-Z]/g, (match) => "-" + match.toLowerCase());
                let cs = window.getComputedStyle(obj);
                let value = cs.getPropertyValue(name);

                if (this.type == CSS_Percentage$2) {
                    if (obj.parentElement) {
                        let pcs = window.getComputedStyle(obj.parentElement);
                        let pvalue = pcs.getPropertyValue(name);
                        let ratio = parseFloat(value) / parseFloat(pvalue);
                        value = (ratio * 100);
                    }
                }

                this.current_val = new this.type(value);

            } else {
                this.current_val = new this.type(obj[prop_name]);
            }
        }

        getType(value) {
            if (typeof(value) === "number")
                return lerpNumber;
            if (CSS_Length$2._verify_(value))
                return CSS_Length$2;
            if (CSS_Percentage$2._verify_(value))
                return CSS_Percentage$2;
            if (CSS_Color$2._verify_(value))
                return CSS_Color$2;
            return lerpNumber;
        }

        addKey(key, prev) {
            let l = this.keys.length;
            let pkey = this.keys[l - 1];
            let v = (key.value !== undefined) ? key.value : key.v;
            let own_key = {
                val: (prev) ? prev.copy(v) : new this.type(v) || 0,
                dur: key.duration || key.dur || 0,
                del: key.delay || key.del || 0,
                ease: key.easing || key.e || ((pkey) ? pkey.ease : Linear),
                len: 0
            };

            own_key.len = own_key.dur + own_key.del;

            this.keys.push(own_key);

            this.duration += own_key.len;

            return own_key.val;
        }

        run(obj, prop_name, time, type) {
            let val_start = this.current_val,
                val_end = this.current_val,
                key, val_out = val_start,
                in_range = time < this.duration;

            for (let i = 0; i < this.keys.length; i++) {
                key = this.keys[i];
                val_end = key.val;
                if (time < key.len) {
                    break;
                } else
                    time -= key.len;
                val_start = key.val;
            }


            if (key) {
                if (time < key.len) {
                    if (time < key.del) {
                        val_out = val_start;
                    } else {
                        let x = (time - key.del) / key.dur;
                        let s = key.ease.getYatX(x);
                        val_out = val_start.lerp(val_end, s);
                    }
                } else {
                    val_out = val_end;
                }
            }

            this.setProp(obj, prop_name, val_out, type);

            return in_range;
        }

        setProp(obj, prop_name, value, type) {

            if (type == CSS_STYLE) {
                obj.style[prop_name] = value;
            } else
                obj[prop_name] = value;
        }
    }

    /**
     * Stores animation data for a group of properties. Defines delay and repeat.
     * @class      AnimSequence (name)
     */
    class AnimSequence {
        constructor(obj, props) {
            this.duration = 0;
            this.time = 0;
            this.type = setType(obj);
            this.obj = null;
            this.DESTROYED = false;
            this.events = {};

            switch (this.type) {
                case CSS_STYLE:
                    this.obj = obj;
                    break;
                case SVG:
                case JS_OBJECT:
                    this.obj = obj;
                    break;
            }

            this.props = {};

            this.setProps(props);
        }

        destroy() {
            for (let name in this.props)
                if (this.props[name])
                    this.props[name].destroy();
            this.DESTROYED = true;
            this.duration = 0;
            this.obj = null;
            this.props = null;
            this.time = 0;
        }

        /**
         * Removes AnimProps based on object of keys that should be removed from this sequence.
         */
        removeProps(props) {
            if (props instanceof AnimSequence)
                props = props.props;

            for (let name in props) {
                if (this.props[name])
                    this.props[name] = null;
            }
        }


        /**
         * Sets the properties.
         *
         * @param      {<type>}  props   The properties
         */
        setProps(props) {
            for (let name in this.props)
                this.props[name].destroy();

            this.props = {};

            for (let name in props)
                this.configureProp(name, props[name]);
        }

        configureProp(name, keys) {
            let prop;
            if (prop = this.props[name]) {
                this.duration = Math.max(prop.duration, this.duration);
            } else {
                prop = new AnimProp(keys, this.obj, name, this.type);
                this.props[name] = prop;
                this.duration = Math.max(prop.duration, this.duration);
            }
        }

        run(i) {

            for (let n in this.props) {
                let prop = this.props[n];
                if (prop)
                    prop.run(this.obj, n, i, this.type);
            }

            if (i >= this.duration)
                return false;

            return true;
        }

        scheduledUpdate(a, t) {

            if (this.run(this.time += t))
                spark.queueUpdate(this);
            else
                this.issueEvent("stopped");
        }

        play(from = 0) {
            this.time = from;
            spark.queueUpdate(this);
            this.issueEvent("started");
        }

        addEventListener(event, listener) {
            if (typeof(listener) === "function") {
                if (!this.events[event])
                    this.events[event] = [];
                this.events[event].push(listener);
            }
        }

        removeEventListener(event, listener) {
            if (typeof(listener) === "function") {
                let events = this.events[event];
                if (events) {
                    for (let i = 0; i < events.length; i++)
                        if (events[i] === listener)
                            return e(vents.splice(i, 1), true);
                }
            }
            return false;
        }

        issueEvent(event) {
            let events = this.events[event];

            if (events)
                events.forEach(e => e(this));
        }
    }

    class AnimGroup {
        constructor() {
            this.seq = [];
            this.time = 0;
            this.duration = 0;
        }

        destroy() {
            this.seq.forEach(seq => seq.destroy());
            this.seq = null;
        }

        add(seq) {
            this.seq.push(seq);
            this.duration = Math.max(this.duration, seq.duration);
        }

        run(t) {
            for (let i = 0, l = this.seq.length; i < l; i++) {
                let seq = this.seq[i];
                seq.run(t);
            }

            if (t >= this.duration)
                return false;

            return true;
        }

        scheduledUpdate(a, t) {
        	this.time += t;
            if (this.run(this.time))
                spark.queueUpdate(this);
        }

        play(from = 0) {
            this.time = 0;
            spark.queueUpdate(this);
        }
    }

    return {
        createSequence: function() {

            if (arguments.length > 1) {

                let group = new AnimGroup();

                for (let i = 0; i < arguments.length; i++) {
                    let data = arguments[i];

                    let obj = data.obj;
                    let props = {};

                    Object.keys(data).forEach(k => { if (!(({ obj: true, match: true })[k])) props[k] = data[k]; });

                    group.add(new AnimSequence(obj, props));
                }

                return group;

            } else {
                let data = arguments[0];

                let obj = data.obj;
                let props = {};

                Object.keys(data).forEach(k => { if (!(({ obj: true, match: true })[k])) props[k] = data[k]; });

                let seq = new AnimSequence(obj, props);

                return seq;
            }
        },

        createGroup: function(...rest) {
            let group = new AnimGroup;
            rest.forEach(seq => group.add(seq));
            return group;
        },

        set USE_TRANSFORM(v) { USE_TRANSFORM = !!v; },
        
        get USE_TRANSFORM() { return USE_TRANSFORM; },
        
        easing: {
            linear: Linear,
            ease: new CBezier(0.25, 0.1, 0.25, 1),
            ease_in: new CBezier(0.42, 0, 1, 1),
            ease_out: new CBezier(0.2, 0.8, 0.3, 0.99),
            ease_in_out: new CBezier(0.42, 0, 0.58, 1),
            overshoot: new CBezier(0.2, 1.5, 0.2, 0.8)
        }
    };
})();

function setTo(to, seq, duration, easing){

    let cs = window.getComputedStyle(to, null);
    
    var rect = to.getBoundingClientRect();
    let to_width = cs.getPropertyValue("width");
    let to_height = cs.getPropertyValue("height");
    let margin_left = parseFloat(cs.getPropertyValue("margin-left"));
    let to_bgc = cs.getPropertyValue("background-color");

    let left = seq.props.left, offl = to.offsetLeft - margin_left;
    let left_diff = (left.keys[0].val) - (rect.left);

    left.keys[0].val = new left.type(offl + left_diff, "px");
    left.keys[1].val = new left.type(offl,"px");

    left.keys[1].dur = duration;
    left.keys[1].len = duration;
    left.keys[1].ease = easing;
    left.duration = duration;

    let top = seq.props.top;
    let top_diff = top.keys[0].val - rect.top;
    top.keys[0].val = new top.type(to.offsetTop + top_diff, "px");
    top.keys[1].val = new top.type(to.offsetTop ,"px");
    top.keys[1].dur = duration;
    top.keys[1].len = duration;
    top.keys[1].ease = easing;
    top.duration = duration;


    seq.props.width.keys[0].val = new seq.props.width.type(to_width);
    seq.props.width.keys[0].dur = duration;
    seq.props.width.keys[0].len = duration;
    seq.props.width.keys[0].ease = easing;
    seq.props.width.duration = duration;

    seq.props.height.keys[0].val = new seq.props.height.type(to_height);
    seq.props.height.keys[0].dur = duration;
    seq.props.height.keys[0].len = duration; 
    seq.props.height.keys[0].ease = easing; 
    seq.props.height.duration = duration;

    seq.props.backgroundColor.keys[0].val = new seq.props.backgroundColor.type(to_bgc);
    seq.props.backgroundColor.keys[0].dur = duration; 
    seq.props.backgroundColor.keys[0].len = duration; 
    seq.props.backgroundColor.keys[0].ease = easing; 
    seq.props.backgroundColor.duration = duration;

    seq.obj = to;

    seq.addEventListener("stopped", ()=>{
        debugger
    });
}

/**
    Transform one element from another back to itself
    @alias module:wick~internals.TransformTo
*/
function TransformTo(element_from, element_to, duration = 500, easing = Animation.easing.linear, HIDE_OTHER) {
    let rect = element_from.getBoundingClientRect();
    let cs = window.getComputedStyle(element_from, null);
    let margin_left = parseFloat(cs.getPropertyValue("margin"));

    let seq = Animation.createSequence({
        obj: element_from,
        width: { value: "0px"},
        height: { value: "0px"},
        backgroundColor: { value: "rgb(1,1,1)"},
        left: [{value:rect.left+"px"},{ value: "0px"}],
        top: [{value:rect.top+"px"},{ value: "0px"}]
    });

    if (!element_to) {

        let a = (seq) => (element_to, duration = 500, easing = Animation.easing.linear,  HIDE_OTHER = false) => {
            setTo(element_to, seq, duration, easing);
            seq.duration = duration;
            return seq;
        };

        return a(seq);
    }

    setTo(element_to, duration, easing);
    seq.duration = duration;
    return seq;
}

const Transitioneer = (function() {

    let obj_map = new Map();
    let ActiveTransition = null;

    function $in(anim_data_or_duration = 0, delay = 0) {

        let seq;

        if (typeof(anim_data_or_duration) == "object") {
            if (anim_data_or_duration.match && this.TT[anim_data_or_duration.match]) {
                let duration = anim_data_or_duration.duration;
                let easing = anim_data_or_duration.easing;
                seq = this.TT[anim_data_or_duration.match](anim_data_or_duration.obj, duration, easing);
            } else
                seq = Animation.createSequence(anim_data_or_duration);

            //Parse the object and convert into animation props. 
            if (seq) {
                this.in_seq.push(seq);
                this.in_duration = Math.max(this.in_duration, seq.duration);
                if (this.OVERRIDE) {

                    if (obj_map.get(seq.obj)) {
                        let other_seq = obj_map.get(seq.obj);
                        other_seq.removeProps(seq);
                    }

                    obj_map.set(seq.obj, seq);
                }
            }

        } else
            this.in_duration = Math.max(this.in_duration, parseInt(delay) + parseInt(anim_data_or_duration));

        return this.in;
    }


    function $out(anim_data_or_duration = 0, delay = 0, in_delay = 0) {
        //Every time an animating component is added to the Animation stack delay and duration need to be calculated.
        //The highest in_delay value will determine how much time is afforded before the animations for the in portion are started.

        if (typeof(anim_data_or_duration) == "object") {

            if (anim_data_or_duration.match) {
                this.TT[anim_data_or_duration.match] = TransformTo(anim_data_or_duration.obj);
            } else {
                let seq = Animation.createSequence(anim_data_or_duration);
                if (seq) {
                    this.out_seq.push(seq);
                    this.out_duration = Math.max(this.out_duration, seq.duration);
                    if (this.OVERRIDE) {

                        if (obj_map.get(seq.obj)) {
                            let other_seq = obj_map.get(seq.obj);
                            other_seq.removeProps(seq);
                        }

                        obj_map.set(seq.obj, seq);
                    }
                }
                this.in_delay = Math.max(this.in_delay, parseInt(delay));
            }
        } else {
            this.out_duration = Math.max(this.out_duration, parseInt(delay) + parseInt(anim_data_or_duration));
            this.in_delay = Math.max(this.in_delay, parseInt(in_delay));
        }
    }



    class Transition {
        constructor(override = true) {
            this.in_duration = 0;
            this.out_duration = 0;
            this.PLAY = true;

            this.reverse = false;

            this.time = 0;

            // If set to zero transitions for out and in will happen simultaneously.
            this.in_delay = 0;

            this.in_seq = [];
            this.out_seq = [];

            this.TT = {};
            //Final transition time is given by max(start_len+in_delay, end_len);\
            ActiveTransition = this;

            this.out = $out.bind(this);
            this.in = $in.bind(this);

            Object.defineProperty(this.out, "out_duration", {
                get: () => this.out_duration
            });

            this.OVERRIDE = override;
        }

        destroy() {
            let removeProps = function(seq) {

                if (!seq.DESTROYED) {
                    if (obj_map.get(seq.obj) == seq)
                        obj_map.delete(seq.obj);
                }

                seq.destroy();
            };
            this.in_seq.forEach(removeProps);
            this.out_seq.forEach(removeProps);
            this.in_seq.length = 0;
            this.out_seq.length = 0;
            this.res = null;
            this.out = null;
            this.in = null;
        }

        get duration() {
            return Math.max(this.in_duration + this.in_delay, this.out_duration);
        }


        start(time = 0, speed = 1, reverse = false) {

            this.time = time;
            this.speed = Math.abs(speed);
            this.reverse = reverse;

            if (this.reverse)
                this.speed = -this.speed;

            return new Promise((res, rej) => {
                if (this.duration > 0)
                    this.scheduledUpdate(0, 0);
                if (this.duration < 1)
                    return res();
                this.res = res;
            });
        }

        play(t) {
            this.PLAY = true;
            let time = this.duration * t;
            this.step(time);
            return time;
        }

        stop() {
            this.PLAY = false;
        }

        step(t) {
            for (let i = 0; i < this.out_seq.length; i++) {
                let seq = this.out_seq[i];
                seq.run(t);
            }

            t = Math.max(t - this.in_delay, 0);

            for (let i = 0; i < this.in_seq.length; i++) {
                let seq = this.in_seq[i];
                seq.run(t);
            }

        }

        scheduledUpdate(step, time) {
            if (!this.PLAY) return;

            this.time += time * this.speed;

            this.step(this.time);


            if (this.res && this.time >= this.in_delay) {
                this.res();
                this.res = null;
            }

            if (this.reverse) {
                if (this.time > 0)
                    return spark.queueUpdate(this);
            } else {
                if (this.time < this.duration)
                    return spark.queueUpdate(this);
            }

            if (this.res)
                this.res();

            this.destroy();
        }
    }

    return { createTransition: (OVERRIDE) => new Transition(OVERRIDE) };
})();

/**
 * SourceTemplate provide the mechanisms for dealing with lists and sets of components. 
 *
 * @param      {Source}  parent   The Source parent object.
 * @param      {Object}  data     The data object hosting attribute properties from the HTML template. 
 * @param      {Object}  presets  The global presets object.
 * @param      {HTMLElement}  element  The element that the Source will _bind_ to. 
 */
class SourceTemplate extends View {

    constructor(parent, presets, element) {

        super();

        this.ele = element;
        this.parent = null;
        this.activeSources = [];
        this.dom_sources = [];
        this._filters_ = [];
        this.ios = [];
        this.terms = [];
        this.sources = [];
        this.range = null;
        this._SCHD_ = 0;
        this._prop_ = null;
        this._package_ = null;
        this.transition_in = 0;
        this.offset = 0;
        this.limit = 0;
        this.shift = 1;
        this.dom_dn = [];
        this.dom_up = [];
        this.trs_up = null;
        this.trs_dn = null;
        this.scrub_v = 0;
        this.old_scrub = 0;
        this.scrub_offset = 0;
        this.UPDATE_FILTER = false;
        this.time = 0;
        this.dom_up_appended = false;
        this.dom_dn_appended = false;
        this.root = 0;
        this.sco = 0;
        this.AUTO_SCRUB = false;
        parent.addTemplate(this);
    }

    get data() {}
    set data(container) {

        if (container instanceof ModelContainerBase) {
            container.pin();
            container.addView(this);
            return;
        }
        if (!container) return;
        if (Array.isArray(container)) this.cull(container);
        else this.cull(container.data);
    }

    update(container) {
        if (container instanceof ModelContainerBase) container = container.get();
        if (!container) return;
        //let results = container.get(this.getTerms());
        // if (container.length > 0) {
        if (Array.isArray(container)) this.cull(container);
        else this.cull(container.data);
        // }
    }


    /**
     * Called by Spark when a change is made to the Template HTML structure. 
     * 
     * @protected
     */
    scheduledUpdate() {

        if (this.SCRUBBING) {
            if (!this.AUTO_SCRUB) {
                this.SCRUBBING = false;
                return;
            }

            if (
                Math.abs(this.sscr) > 0.0001
            ) {
                this.ssoc += this.sscr;
                this.scrub(this.ssoc);
                this.sscr *= (this.drag);

                let pos = this.old_scrub - this.scrub_offset + this.offset;

                if (!((this.sscr < 0 || pos < this.max) &&
                        (this.sscr > 0 || pos > 0))) {
                    this.sscr = 0;
                }

                spark.queueUpdate(this);

            } else {
                this.scrub_v = 0;
                this.scrub(Infinity);
                this.old_scrub = 0;
                this.SCRUBBING = false;
            }
        } else if (this.UPDATE_FILTER) {
            this.filterUpdate();
        } else {
            this.limitUpdate();
        }
    }

    /**
     * Scrub provides a mechanism to scroll through pages of a container that has been limited through the limit filter.
     * @param  {Number} scrub_amount [description]
     */
    scrub(scrub_amount, SCRUBBING = true) {
        this.SCRUBBING = true;

        if (this.AUTO_SCRUB && !SCRUBBING && scrub_amount != Infinity) {
            this.root = this.offset;
            this.sco = this.old_scrub;
            this.old_scrub += scrub_amount;
            this.AUTO_SCRUB = false;
        }

        if (scrub_amount !== Infinity) {
            scrub_amount += this.sco;

            let s = scrub_amount - this.scrub_offset;

            if (s > 1) {
                //Make Sure the the transition animation is completed before moving on to new animation sequences.
                this.trs_up.play(1);
                this.scrub_offset++;
                s = scrub_amount - this.scrub_offset;
                this.render(null, this.activeSources, this.limit, this.offset + 1, true);
            } else if (s < -1) {
                this.trs_dn.play(1);
                this.scrub_offset--;
                s = scrub_amount - this.scrub_offset;
                this.render(null, this.activeSources, this.limit, this.offset - 1, true);
            }

            this.scrub_v = scrub_amount - this.old_scrub;
            this.old_scrub = scrub_amount;

            if (s > 0) {

                if (this.offset >= this.max) {
                    if (s > 0) s = 0;
                }


                if (!this.dom_up_appended) {

                    for (let i = 0; i < this.dom_up.length; i++) {
                        this.dom_up[i].appendToDOM(this.ele);
                        this.dom_up[i].index = -1;
                        this.dom_sources.push(this.dom_up[i]);
                    }
                    this.dom_up_appended = true;
                }
                this.time = this.trs_up.play(s);
            } else {

                if (this.offset < 1 && s < 0) {
                    s = 0;
                    this.scrub_v = 0;
                }

                if (!this.dom_dn_appended) {

                    for (let i = 0; i < this.dom_dn.length; i++) {
                        this.dom_dn[i].appendToDOM(this.ele, this.dom_sources[0].ele);
                        this.dom_dn[i].index = -1;
                    }

                    this.dom_sources = this.dom_dn.concat(this.dom_sources);


                    this.dom_dn_appended = true;
                }

                this.time = this.trs_dn.play(-s);
            }
        } else {
            this.sco = 0;

            if (Math.abs(this.scrub_v) > 0.000001) {

                if (Math.abs(this.scrub_v) < 0.05) this.scrub_v = 0.05 * Math.sign(this.scrub_v);
                if (Math.abs(this.scrub_v) > 0.2) this.scrub_v = 0.2 * Math.sign(this.scrub_v);

                this.AUTO_SCRUB = true;

                //Determine the distance traveled and normal drag decay of 0.5
                let dist = this.scrub_v * (1 / (-0.5 + 1));

                //get the distance to nearest page given the distance traveled
                let nearest = (this.root + this.old_scrub + dist - this.scrub_offset);

                nearest = (this.scrub_v > 0) ? Math.min(this.max, Math.ceil(nearest)) : Math.max(0, Math.floor(nearest));

                //get the ratio of the distance from the current position and distance to the nearest 
                let nearest_dist = nearest - (this.root + this.old_scrub - this.scrub_offset);
                let ratio = nearest_dist / this.scrub_v;
                let drag = Math.abs(1 - (1 / ratio));

                this.drag = drag;
                this.sscr = this.scrub_v;
                this.ssoc = this.old_scrub;
                this.SCRUBBING = true;
                spark.queueUpdate(this);
            } else {
                let pos = Math.round(this.old_scrub - this.scrub_offset + this.offset);
                this.render(null, this.activeSources, this.limit, pos, true).play(1);
                this.scrub_offset = 0;
            }
        }
    }

    render(transition, output = this.activeSources, limit = this.limit, offset = this.offset, NO_TRANSITION = false) {
        let j = 0,
            ol = output.length,
            al = this.dom_sources.length;

        let direction = true;

        let OWN_TRANSITION = false;

        if (!transition) transition = Transitioneer.createTransition(), OWN_TRANSITION = true;

        offset = Math.max(0, offset);

        if (limit > 0) {

            direction = this.offset < offset;
            this.shift = Math.max(1, Math.min(limit, this.shift));
            let ein = [];
            let shift_points = Math.ceil(ol / this.shift);
            this.max = shift_points - 1;
            this.offset = Math.max(0, Math.min(shift_points - 1, offset));
            this.root = this.offset;
            let off = this.offset * this.shift;

            this.trs_up = Transitioneer.createTransition(false);
            this.trs_dn = Transitioneer.createTransition(false);
            this.dom_dn.length = 0;
            this.dom_up.length = 0;
            this.dom_up_appended = false;
            this.dom_dn_appended = false;

            let i = 0,
                ip = 0,
                ia = 0,
                oa = 0;

            while (i < off - this.shift) output[i++].index = -2;
            while (i < off) {
                this.dom_dn.push(output[i]);

                output[i].update({
                    trs_in_dn: {
                        index: ip++,
                        trs: this.trs_dn.in
                    }
                });

                output[i++].index = -2;
            }

            ia = 0;

            while (i < off + limit && i < ol) {

                if (oa < this.shift) {
                    oa++;
                    output[i].update({
                        trs_out_up: {
                            trs: this.trs_up.out,
                            index: 0
                        }
                    });
                } else {
                    output[i].update({
                        arrange: {
                            trs: this.trs_up.in,
                            index: (i) - off - this.shift
                        }
                    });
                }

                if (i >= off + limit - this.shift) {
                    ip++;
                    output[i].update({
                        trs_out_dn: {
                            trs: this.trs_dn.out,
                            index: 0
                        }
                    });
                } else {
                    output[i].update({
                        arrange: {
                            trs: this.trs_dn.in,
                            index: ip++
                        }
                    });
                }

                output[i].index = i;
                ein.push(output[i++]);
            }

            while (i < off + limit + this.shift && i < ol) {
                this.dom_up.push(output[i]);
                output[i].update({
                    trs_in_up: {
                        index: (i) - off - this.shift,
                        trs: this.trs_up.in
                    }
                });
                output[i++].index = -3;
            }
            while (i < ol) output[i++].index = -3;

            output = ein;

            ol = ein.length;

            this.limit = limit;
        } else {
            this.max = 0;
            this.limit = 0;
        }

        let trs_in = { trs: transition.in, index: 0 };

        let trs_out = { trs: transition.out, index: 0 };

        for (let i = 0; i < ol; i++) output[i].index = i;

        for (let i = 0; i < al; i++) {
            let as = this.dom_sources[i];

            if (as.index > j) {
                let ele = as.element;
                while (j < as.index && j < ol) {
                    let os = output[j];
                    os.index = j;
                    os.appendToDOM(this.ele, ele);
                    trs_in.index = j;
                    //os.index = -1;
                    os.transitionIn(trs_in, (direction) ? "trs_in_up" : "trs_in_dn");
                    j++;
                }
            } else if (as.index < 0) {
                if (!NO_TRANSITION) {
                    switch (as.index) {
                        case -2:
                        case -3:
                            as.transitionOut(trs_out, (direction) ? "trs_out_up" : "trs_out_dn");
                            break;
                        default:
                            as.transitionOut(trs_out);
                    }
                } else {
                    as.transitionOut();
                }
                continue;
            }

            trs_in.index = j;

            as.update({ arrange: trs_in });

            as._TRANSITION_STATE_ = true;

            j++;

            as.index = -1;
        }

        while (j < output.length) {
            output[j].appendToDOM(this.ele);
            output[j].index = -1;
            trs_in.index = j;
            output[j].transitionIn(trs_in, (direction) ? "trs_in_up" : "trs_in_dn");
            j++;
        }

        this.ele.style.position = this.ele.style.position;

        this.dom_sources = output;

        if (OWN_TRANSITION)
            if (NO_TRANSITION) {
                return transition;
            } else {
                transition.start();
            }

        this.parent.upImport("template_count_changed", {
            displayed: ol,
            offset: offset,
            count: this.activeSources.length,
            pages: this.max,
            ele: this.ele,
            template: this,
            trs: transition.in
        });


        return transition;
    }

    limitUpdate(transition, output) {

        let limit = this.limit,
            offset = 0;

        for (let i = 0, l = this._filters_.length; i < l; i++) {
            let filter = this._filters_[i];
            if (filter.CAN_USE) {
                if (filter._CAN_LIMIT_) limit = filter._value_;
                if (filter._CAN_OFFSET_) offset = filter._value_;
                if (filter._CAN_SHIFT_) this.shift = filter._value_;
            }
        }

        this.SCRUBBING = false;
        this.scrub_offset = 0;
        this.scrub_v = 0;

        this.render(transition, output, limit, offset);
    }
    /**
     * Filters stored Sources with search terms and outputs the matching Sources to the DOM.
     * 
     * @protected
     */
    filterUpdate(transition) {
        let output = this.sources.slice();
        if (output.length < 1) return;
        for (let i = 0, l = this._filters_.length; i < l; i++) {
            let filter = this._filters_[i];
            if (filter.CAN_USE) {
                if (filter.CAN_FILTER) output = output.filter(filter.filter_function._filter_expression_);
                if (filter.CAN_SORT) output = output.sort(filter._sort_function_);
            }
        }
        this.activeSources = output;
        this.limitUpdate(transition, output);
        this.UPDATE_FILTER = false;
    }
    /**
     * Removes stored Sources that do not match the ModelContainer contents. 
     *
     * @param      {Array}  new_items  Array of Models that are currently stored in the ModelContainer. 
     * 
     * @protected
     */
    cull(new_items) {
        if (!new_items) new_items = [];
        let transition = Transitioneer.createTransition();
        if (new_items.length == 0) {
            let sl = this.sources.length;
            for (let i = 0; i < sl; i++) this.sources[i].transitionOut(transition, "", true);
            this.sources.length = 0;

            this.parent.upImport("template_count_changed", {
                displayed: 0,
                offset: 0,
                count: 0,
                pages: 0,
                ele: this.ele,
                template: this,
                trs: transition.in
            });
        } else {
            let exists = new Map(new_items.map(e => [e, true]));
            var out = [];
            for (let i = 0, l = this.activeSources.length; i < l; i++)
                if (exists.has(this.activeSources[i].model)) {
                    exists.set(this.activeSources[i].model, false);
                }
            for (let i = 0, l = this.sources.length; i < l; i++)
                if (!exists.has(this.sources[i].model)) {
                    this.sources[i].transitionOut(transition, "", true);
                    this.sources[i].index = -1;
                    this.sources.splice(i, 1);
                    l--;
                    i--;
                } else exists.set(this.sources[i].model, false);
            exists.forEach((v, k, m) => {
                if (v) out.push(k);
            });
            if (out.length > 0) {
                this.added(out, transition);
            } else {
                for (let i = 0, j = 0, l = this.activeSources.length; i < l; i++, j++) {
                    if (this.activeSources[i]._TRANSITION_STATE_) {
                        if (j !== i) {
                            this.activeSources[i].update({
                                arrange: {
                                    index: i,
                                    trs: transition.in
                                }
                            });
                        }
                    } else {
                        this.activeSources.splice(i, 1), i--, l--;
                    }
                }

                this.filterUpdate(transition);
            }
        }
        transition.start();
    }
    /**
     * Called by the ModelContainer when Models have been removed from its set.
     *
     * @param      {Array}  items   An array of items no longer stored in the ModelContainer. 
     */
    removed(items, transition = Transitioneer.createTransition()) {
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            for (let j = 0; j < this.sources.length; j++) {
                let Source = this.sources[j];
                if (Source.model == item) {
                    this.sources.splice(j, 1);
                    Source.transitionOut(transition, "", true);
                    break;
                }
            }
        }
        this.filterUpdate(transition);
    }
    /**
     * Called by the ModelContainer when Models have been added to its set.
     *
     * @param      {Array}  items   An array of new items now stored in the ModelContainer. 
     */
    added(items, transition = Transitioneer.createTransition()) {
        for (let i = 0; i < items.length; i++) {
            let mgr = this._package_.mount(null, items[i], false);
            mgr.sources.forEach((s) => {
                s.parent = this.parent;
            });
            this.sources.push(mgr);
        }
        for (let i = 0; i < this.sources.length; i++) {
            //this.parent.addSource(this.sources[i]);
        }
        this.filterUpdate(transition);
    }
    revise() {
        if (this.cache) this.update(this.cache);
    }
    getTerms() {
        let out_terms = [];
        for (let i = 0, l = this.terms.length; i < l; i++) {
            let term = this.terms[i].term;
            if (term) out_terms.push(term);
        }
        if (out_terms.length == 0) return null;
        return out_terms;
    }
    get() {
        if (this.model instanceof MultiIndexedContainer) {
            if (this.data.index) {
                let index = this.data.index;
                let query = {};
                query[index] = this.getTerms();
                return this.model.get(query)[index];
            } else console.warn("No index value provided for MultiIndexedContainer!");
        } else {
            let source = this.model.source;
            let terms = this.getTerms();
            if (source) {
                this.model.destroy();
                let model = source.get(terms, null);
                model.pin();
                model.addView(this);
            }
            return this.model.get(terms);
        }
        return [];
    }
    down(data, changed_values) {
        for (let i = 0, l = this.activeSources.length; i < l; i++) this.activeSources[i].down(data, changed_values);
    }
    transitionIn(transition) {
        return;
        for (let i = 0, l = this.activeSources.length; i < l; i++) {
            this.ele.appendChild(this.activeSources[i].element);
            this.activeSources[i].transitionIn(transition);
            this.activeSources[i].update({
                arrange: {
                    index: i,
                    trs: transition.trs_in
                }
            });
        }
    }
    transitionOut(transition) {
        return;
        for (let i = 0, l = this.activeSources.length; i < l; i++) this.activeSources[i].transitionOut(transition);
    }
}

let expr_check = (expr)=>{
    return (expr.type == 2 && typeof(expr.func) == "function");
};



class FilterIO extends IOBase {
    constructor(source, errors, taps, template, activation, sort, filter, limit, offset, scrub, shift) {
        super(template, errors);

        this.template = template;
        this._activation_function_ = null;
        this._sort_function_ = null;
        this.filter_function = null;
        this.CAN_USE = false;
        this.CAN_FILTER = false;
        this._CAN_LIMIT_ = false;
        this._CAN_OFFSET_ = false;
        this.CAN_SORT = false;
        this._SCHD_ = 0;

        if (activation && activation.binding){
            this._activation_function_ = activation.binding._bind_(source, errors, taps, this);
        } else{
            this.CAN_USE = true;
        }

        if (sort && sort.binding) {
            let expr = sort.binding;
            if (expr_check(expr)){
                this._sort_function_ = (m1, m2) => expr.func(m1.model, m2.model);
                this.CAN_SORT = true;
            } 
        }else

        if (filter && filter.binding) {
            let expr = filter.binding;
            if (expr_check(expr)){
                this.filter_function = expr._bind_(source, errors, taps, this);
                this.filter_function._IS_A_FILTER_ = true;
                this.CAN_FILTER = true;  
            } 
        }else

        if (limit && limit.binding) {
            let expr = limit.binding;
                expr.method = (expr.method == 1) ? -1 : expr.method;
                this._limit_function_ = expr._bind_(source, errors, taps, this);
                ///this._limit_function_._IS_A_FILTER_ = true;
                this._CAN_LIMIT_ = true;  
        }else

        if (offset && offset.binding) {
            let expr = offset.binding;
                expr.method = (expr.method == 1) ? -1 : expr.method;
                this._offset_function_ = expr._bind_(source, errors, taps, this);
                ///this._limit_function_._IS_A_FILTER_ = true;
                this._CAN_OFFSET_ = true;  
        }else

        if (scrub && scrub.binding) {
            let expr = scrub.binding;
                expr.method = (expr.method == 1) ? -1 : expr.method;
                this._scrub_function_ = expr._bind_(source, errors, taps, this);
                ///this._limit_function_._IS_A_FILTER_ = true;
                this._CAN_SCRUB_ = true;  
        }else

        if (shift && shift.binding) {
            let expr = shift.binding;
                expr.method = (expr.method == 1) ? -1 : expr.method;
                this._page_function_ = expr._bind_(source, errors, taps, this);
                ///this._limit_function_._IS_A_FILTER_ = true;
                this._CAN_SHIFT_ = true;  
        }
    }

    scheduledUpdate() {}
    
    update(){
        if(this.CAN_SORT || this.CAN_FILTER){
            this.template.UPDATE_FILTER = true;
            spark.queueUpdate(this.template);
        }
    }

    destroy() {
        if (this._sort_function_)
            this._sort_function_.destroy();
        if (this._activation_function_)
            this._activation_function_.destroy();
        if (this.filter_function)
            this.filter_function.destroy();
        this._sort_function_ = null;
        this._activation_function_ = null;
        this.filter_function = null;
        this.template = null;
    }

    get data() {}
    set data(v) {

        this.CAN_USE = false;
        if (v) this.CAN_USE = true;
        this._value_ = v;

        if(this._CAN_SCRUB_)
            return this.template.scrub(this._value_, false);
        
        if(this.CAN_SORT || this.CAN_FILTER || this._CAN_SHIFT_)
            this.template.UPDATE_FILTER = true;
        
        spark.queueUpdate(this.template);
    }
}

class FilterNode extends VoidNode$1 {

    /******************************************* HOOKS ****************************************************/

    endOfElementHook() {}

    /**
     * This node only needs to assess attribute values. InnerHTML will be ignored. 
     * @return     {boolean}  { description_of_the_return_value }
     */
    selfClosingTagHook() { return true; }

}

class PackageNode extends VoidNode$1 {

    constructor(start) {
        super();
        this._start_ = start;
    }

    /******************************************* HOOKS ****************************************************/

    /**
     * Binds new laxer to boundaries starting from open tag to close tag. Applies Lexer to new SourcePackage.
     * @param      {Lexer}  lex     The lex
     * @private
     */
    processTextNodeHook(lex) {}

    _ignoreTillHook_() { return true; }

    endOfElementHook(lex) {
        let own_lex = lex.copy();

        own_lex.off = this._start_;
        own_lex.tl = 0;
        own_lex.n.sl = lex.off;

        this.par._package_ = new this.SourcePackage(own_lex, this.presets, false);

        if (!this.fch)
            this.mergeComponent();
    }

    mergeComponent() {
        let component = this.presets.components[this.tag];

        if (component)
            this.par._package_ = new this.SourcePackage(component, this.presets, false);
    }
}

class SourceTemplateNode$1 extends RootNode {
    constructor(lex) {
        super();
        this.BUILD_LIST = [];
        this.filters = [];
        this._property_bind_ = null;
        this._package_ = null;
    }

    build(element, source, presets, errors, taps) {

        source = source || new Source(null, presets, element, this);

        if (this.HAS_TAPS)
            taps = source.linkTaps(this.tap_list);
        if (this._property_bind_ && this._package_) {

            let ele = createElement(this.getAttribute("element") || "ul");
            
            this.class.split(" ").map(c=> c ? ele.classList.add(c):{});

            if(this._badge_name_)
                source.badges[this._badge_name_] = ele;
            

            let me = new SourceTemplate(source, presets, ele);
            me._package_ = this._package_;
            me.prop = this._property_bind_._bind_(source, errors, taps, me);

            _appendChild_(element, ele);

            for (let node = this.fch; node; node = this.getNextChild(node)) {
                //All filter nodes here
                
                let on = node.getAttrib("on");
                let sort = node.getAttrib("sort");
                let filter = node.getAttrib("filter");
                let limit = node.getAttrib("limit");
                let offset = node.getAttrib("offset");
                let scrub = node.getAttrib("scrub");
                let shift = node.getAttrib("shift");

                if(limit && limit.binding.type == 1){
                    me.limit = parseInt(limit.value);
                    limit = null;
                }

                if(shift && shift.binding.type == 1){
                    me.shift = parseInt(shift.value);
                    shift = null;
                }

                if (sort || filter || limit || offset || scrub || shift) //Only create Filter node if it has a sorting bind or a filter bind
                    me._filters_.push(new FilterIO(source, errors, taps, me, on, sort, filter, limit, offset, scrub, shift));
            }
        }else{
            errors.push(new Error(`Missing source for template bound to "${this._property_bind_._bindings_[0].tap_name}"`));
        }

        return source;
    }

    /******************************************* HOOKS ****************************************************/

    endOfElementHook() {}

    _ignoreTillHook_() {}

    
createHTMLNodeHook(tag, start) {
        
        switch (tag) {
            case "f":
                return new FilterNode(); //This node is used to 
            default:
                return new PackageNode(start); //This node is used to build packages
        }
    }

    processTextNodeHook(lex) {
        if (!this._property_bind_) {
            let cp = lex.copy();
            lex.IWS = true;
            cp.tl = 0;
            if (cp.n.ch == barrier_a_start && (cp.n.ch == barrier_a_start || cp.ch == barrier_b_start)) {
                let binding = Template(lex);
                if (binding)
                    this._property_bind_ = this.processTapBinding(binding);
            }
        }
    }
}

class StyleNode$1 extends VoidNode$1 {
    processTextNodeHook(lex) {
        //Feed the lexer to a new CSS Builder
        let css = this.getCSS();

        lex.IWS = true;
        lex.tl = 0;
        lex.n;

        css.parse(lex).catch((e) => {
            throw e;
        });
    }
}

/**
 * SVG HTMLElements to be created with the svg namespace in order to be rendered correctly.
 * @class      SVGNode (name)
 */
class SVGNode extends RootNode {
    createElement(presets, source) {
        return document.createElementNS("http://www.w3.org/2000/svg", this.tag);
    }

    createHTMLNodeHook(tag) {
    	console.log(tag);
        //jump table.
        switch (tag[0]) {
            case "w":
                switch (tag) {
                    case "w-s":
                        return new SourceNode(); //This node is used to 
                    case "w-c":
                        return new SourceTemplateNode(); //This node is used to 
                }
                break;
            default:
                switch (tag) {
                    case "a":
                        return new LinkNode();
                        /** void elements **/
                    case "template":
                        return new VoidNode();
                    case "style":
                        return new StyleNode();
                    case "script":
                        return new ScriptNode();
                    case "svg":
                    case "path":
                        return new SVGNode();
                }
        }

        return new SVGNode();
    }
}

//Since all nodes extend the RootNode, this needs to be declared here to prevent module cycles. 
function CreateHTMLNode(tag) {
    //jump table.
    switch (tag[0]) {
        case "w":
            switch (tag) {
                case "w-s":
                    return new SourceNode$1(); //This node is used to 
                case "w-c":
                    return new SourceTemplateNode$1(); //This node is used to 
            }
            break;
        default:
            switch (tag) {
                case "a":
                    return new LinkNode$1();
                /** void elements **/
                case "template":
                    return new VoidNode$1();
                case "style":
                    return new StyleNode$1();
                case "script":
                    return new ScriptNode$1();
                case "svg":
                case "path":
                    return new SVGNode();
            }
    }

    return new RootNode();
}

RootNode.prototype.createHTMLNodeHook = CreateHTMLNode;

/**
 * Factory object for Creating Source trees.  Encapsulates construction information derived from the HTML AST.  
 * 
 * @param      {HTMLElement}  element      The element
 * @param      {Function}  constructor      The constructor for the object the Skeleton will create.
 * @param      {Object}  data  Data pulled from a tags attributes
 * @param      {Presets}  presets  The global Presets instance.
 * @memberof module:wick~internals.source
 * @alias Skeleton  
 */
class Skeleton {

    /**
        Constructor of Skeleton
    */
    constructor(tree, presets) {
        this.tree = tree;
        this.presets = presets;
    }


    /**
     * Constructs Source tree and returns that. 
     * @param {HTMLElement} element - host HTML Element. 
     * @param      {<type>}  primary_model    The model
     * @return     {<type>}  { description_of_the_return_value }
     */
    flesh(element, primary_model = null) {

        let Source = this.____copy____(element, null, primary_model);

        if (Source)
            Source.load(primary_model);

        return Source;
    }

    /**
     * Extends a given DOM tree and, optionally, a Source tree with it's own internal  tree.
     * @param {HTMLElement} parent_element - HTML Element of the originating Source. 
     * @param {<type>}  parent_source   The parent source
     */
    extend(parent_element = null, parent_source = null) {
        this.____copy____(parent_element, parent_source);
    }

    /**
        Constructs a new object, attaching to elements hosted by a Source object. If the component to be constructed is a Source the 
        parent_element HTMLElement gets swapped out by a cloned HTMLElement that is hosted by the newly constructed Source.

        @param {HTMLElement} parent_element - HTML Element of the originating tree. 

        @protected
    */
    ____copy____(parent_element = null, parent_source = null, primary_model = null) {
        //List of errors generated when building DOM
        let errors = [];

        let source = this.tree.build(parent_element, parent_source, this.presets, errors);

        if (errors.length > 0) {
            //TODO!!!!!!Remove all _bindings_ that change Model. 
            //source.kill_up_bindings();
            errors.forEach(e => console.log(e));
        }

        return source;
    }
}

function complete(lex, SourcePackage, presets, ast, url, win) {
    /*
     * Only accept certain nodes for mounting to the DOM. 
     * The custom element `import` is simply used to import extra HTML data from network for use with template system. It should not exist otherwise.
     */
    if (ast.tag && (ast.tag !== "import" && ast.tag !== "link") && ast.tag !== "template") {
        let skeleton = new Skeleton(ast, presets);
        SourcePackage._skeletons_.push(skeleton);
    }

    lex.IWS = true;

    while (!lex.END && lex.ch != "<") { lex.n; }
    if (!lex.END)
        return parseText(lex, SourcePackage, presets, url, win);

    SourcePackage._complete_();

    return SourcePackage;
}


function buildCSS(lex, SourcePackage, presets, ast, css_list, index, url, win) {
    return css_list[index]._READY_().then(() => {
        
        if(++index < css_list.length) return buildCSS(lex, SourcePackage, presets, ast, css_list, index, url, win);

        ast.linkCSS(null, win);

        return complete(lex, SourcePackage, presets, ast, url, win);
    });
}

function parseText(lex, SourcePackage, presets, url, win) {
    let start = lex.off;

    while (!lex.END && lex.ch != "<") { lex.n; }

    if (!lex.END) {

        if (lex.pk.ty != lex.types.id)
            throw new Error(`Expecting an Identifier after '<' character, ${lex.str}`);

        let node = CreateHTMLNode(lex.p.tx);

        node.presets = presets;

        return node.parse(lex, url).then((ast) => {
            if (ast.css && ast.css.length > 0) 
                return buildCSS(lex, SourcePackage, presets, ast, ast.css, 0, url, win);
            
            return complete(lex, SourcePackage, presets, ast, url, win);
        }).catch((e) => {
            SourcePackage._addError_(e);
            SourcePackage._complete_();
        });
    }

    debugger;
    SourcePackage._addError_(new Error(`Unexpected end of input. ${lex.slice(start)}, ${lex.str}`));
    SourcePackage._complete_();
}


/**
 * Compiles an object graph based input into a SourcePackage.
 * @param      {SourcePackage}  SourcePackage     The source package
 * @param      {Presets}  presets           The global Presets instance
 * @param      {HTMLElement | Lexer | string}  element     The element
 * @memberof module:wick~internals.templateCompiler
 * @alias CompileSource
 */
function CompileSource(SourcePackage, presets, element, url, win = window) {
    let lex;
    if (element instanceof whind$1.constructor) {
        lex = element;
    } else if (typeof(element) == "string")
        lex = whind$1(element);
    else if (element instanceof EL) {
        if (element.tagName == "TEMPLATE") {
            let temp = document.createElement("div");
            temp.appendChild(element.content);
            element = temp;
        }
        lex = whind$1(element.innerHTML);
    } else {
        let e = new Error("Cannot compile component");
        SourcePackage._addError_(e);
        SourcePackage._complete_();
    }
    return parseText(lex, SourcePackage, presets, url, win);
}

/**
 * SourcePackages stores compiled {@link SourceSkeleton}s and provide a way to _bind_ Model data to the DOM in a reusable manner. *
 * @property    {Array}    _skeletons_
 * @property    {Array}    styles
 * @property    {Array}    scripts
 * @property    {Array}    style_core
 * @readonly
 * @callback   If `RETURN_PROMISE` is set to `true`, a new Promise is returned, which will asynchronously return a SourcePackage instance if compilation is successful.
 * @param      {HTMLElement}  element      The element
 * @param      {Presets}  presets      The global Presets object.
 * @param      {boolean}  [RETURN_PROMISE=false]  If `true` a Promise will be returned, otherwise the SourcePackage instance is returned.
 * @return     {SourcePackage | Promise}  If a SourcePackage has already been constructed for the given element, that will be returned instead of new one being created. If
 * @memberof module:wick.core.source
 * @alias SourcePackage
 */
class SourcePackage {

    constructor(element, presets, RETURN_PROMISE = false, url = "", win = window) {

        //If a package exists for the element already, it will be bound to __wick__package__. That will be returned.
        if (element.__wick__package__) {
            if (RETURN_PROMISE)
                return new Promise((res) => res(element.__wick__package__));
            return element.__wick__package__;
        }


        /**
         * When set to true indicates that the package is ready to be mounted to the DOM.
         */
        this._READY_ = false;

        /**
         * An array of SourceSkeleton objects.
         */
        this._skeletons_ = [];

        /**
         * An array objects to store pending calls to SourcePackage#mount
         */
        this.pms = [];

        /**
         * An Array of error messages received during compilation of template.
         */
        this._errors_ = [];

        /**
         * Flag to indicate SourcePackage was compiled with errors
         */
        this._HAVE_ERRORS_ = false;

        if (element instanceof Promise) {
            element.then((data) => CompileSource(this, presets, data, url, win));
            if (RETURN_PROMISE) return element;
            return this;
        } else if (element instanceof RootNode) {
            //already an HTMLtree, just package into a skeleton and return.
            this._skeletons_.push(new Skeleton(element, presets));
            this._complete_();
            return;
        } else if (!(element instanceof HTMLElement) && typeof(element) !== "string" && !(element instanceof whind$1.constructor)) {
            let err = new Error("Could not create package. element is not an HTMLElement");
            this._addError_(err);
            this._complete_();
            if (RETURN_PROMISE)
                return new Promise((res, rej) => rej(err));
            return;
        }

        //Start the compiling of the component.
        let promise = CompileSource(this, presets, element, url, win);

        OB.seal(this);

        if (RETURN_PROMISE)
            return promise;
        else
            return this;

    }

    /**
     * Called when template compilation completes.
     *
     * Sets SourcePackage#_READY_ to true, send the pending mounts back through SourcePackage#mount, and freezes itself.
     *
     * @protected
     */
    _complete_() {
        this._READY_ = true;

        for (let m, i = 0, l = this.pms.length; i < l; i++)
            (m = this.pms[i], this.mount(m.e, m.m, m.usd, m.mgr));


        this.pms.length = 0;

        this._fz_();
    }

    /**
     * Adds Error message to the errors array.
     *
     * @param      {String}  error_message     the error message to add.
     *
     * @protected
     */
    _addError_(error_message) {
        this._HAVE_ERRORS_ = true;
        //Create error skeleton and push to _skeletons_
        this._errors_.push(error_message);
        console.error(error_message);
    }

    /**
     * Freezes properties.
     * @protected
     */
    _fz_() {
        return;
        OB.freeze(this._READY_);
        OB.freeze(this._skeletons_);
        OB.freeze(this.styles);
        OB.freeze(this.pms);
        OB.freeze(this._errors_);
        OB.freeze(this);
    }

    /**
     * Pushes pending mounts to the pms array.
     *
     * @param      {HTMLElement}  element         The element
     * @param      {Model}  model           The model
     * @param      {Boolean}  USE_SHADOW_DOM  The use shadow dom
     * @param      {Object}  manager         The manager
     *
     * @protected
     */
    _pushPendingMount_(element, model, USE_SHADOW_DOM, manager) {

        if (this._READY_)
            return this.mount(element, model, USE_SHADOW_DOM, manager);

        this.pms.push({
            e: element,
            m: model,
            usd: USE_SHADOW_DOM,
            mgr: manager
        });

        return manager;
    }

    /**
     * Generates new instance of component and appends it to the input element. If the compilation of the component is not complete by the time this method is called,
     the arguments are stored in a temporary buffer and later run through this method again when compilation is completed.
     * @param  {HTMLElement} element         - The element
     * @param  {Model}   model           - The model the source component will bind to. Binding only occurs if `model` or `schema` attributes are undefined in the component decleration, the `schema` attribute type matches the model type, or `schema` is set to "any".
     * @param  {boolean} USE_SHADOW_DOM  - If `true`, appends the component to the element's ShadowDOM.
     * @param  {Object}  manager         - A custom manager that stores built source components. If not defined then a SourceManager is created and returned.
     */
    mount(element, model, USE_SHADOW_DOM = false, manager = new SourceManager(model, element)) {

        if (!this._READY_)
            return this._pushPendingMount_(element, model, USE_SHADOW_DOM, manager);

        //if (!(element instanceof EL)) return null;

        if (this._HAVE_ERRORS_) {
            //Process
            console.warn("TODO - Package has errors, pop an error widget on this element!");
        }
        let i = 0,
            l = 0;

        if (!manager.sources)
            manager.sources = [];

        if (USE_SHADOW_DOM) {

            let shadow_root = element.attachShadow({
                mode: "open"
            });

            element = shadow_root;

            for (i = 0, l = this.styles.length; i < l; i++) {
                let style = _cloneNode_(this.styles[i], true);
                _appendChild_(element, style);
            }
        }

        for (i = 0, l = this._skeletons_.length; i < l; i++) {
            let source = this._skeletons_[i].flesh(element, model);
            source.parent = manager;
            manager.sources.push(source);
        }

        if (manager.sourceLoaded) manager.sourceLoaded();

        return manager;
    }
}

PackageNode.prototype.SourcePackage = SourcePackage;

/** This is the entire object structure of Wick, minus the platform specific outputs found in /source/root/ */

const model$1 = (data, schema) => new SchemedModel(data, undefined, undefined, schema);
model$1.scheme = (schema, sm) => (sm = class extends SchemedModel {}, sm.schema = schema, sm);
model$1.constr = SchemedModel;
model$1.any = (data) => new Model(data);
model$1.any.constr = Model;
model$1.container = {
    multi: MultiIndexedContainer,
    array: ArrayModelContainer,
    btree: BTreeModelContainer,
    constr: ModelContainerBase
};
model$1.store = (data) => new Store(data);

//Construct Schema Exports
const scheme = Object.create(schemes);
scheme.constr = SchemeConstructor;
scheme.constr.bool = BoolSchemeConstructor;
scheme.constr.number = NumberSchemeConstructor;
scheme.constr.string = StringSchemeConstructor;
scheme.constr.date = DateSchemeConstructor;
scheme.constr.time = TimeSchemeConstructor;

Object.freeze(scheme.constr);
Object.freeze(scheme);
Object.freeze(Presets);
Object.freeze(model$1.container.constr);
Object.freeze(model$1.container);
Object.freeze(model$1.any);
Object.freeze(model$1);

const core = {
    presets: a => new Presets(a),
    view: View,
    scheme: scheme,
    model: model$1,
    source: (...a) => new SourcePackage(...a)
};

core.source.compiler = CompileSource;

CompileSource.nodes = {
    root: RootNode,
    style: StyleNode$1,
    script: ScriptNode$1,
    text: RootText,
    source: SourceNode$1,
    package: PackageNode,
    template: SourceTemplateNode$1,
    svg:SVGNode
};

let internals = { /* Empty if production */ };

core.source.package = SourcePackage;
core.source.constructor = Source;

Object.freeze(core.source);
Object.freeze(core);

let source = core.source;

const wick$1 = {
	source,
	scheme,
	model: model$1,
	core,
	internals
};

let proto$1 = StyleNode$1.prototype;
proto$1.cssInject = proto$1._processTextNodeHook_;

const path$1 = require("path");
//Hooking into the style systems allows us to track modifications in the DOM and update the appropriate CSS values and documents. 
proto$1.processTextNodeHook = function(lex) {
    //Feed the lexer to a new CSS Builder
    this.css = this.getCSS();
    lex.IWS = true;
    lex.tl = 0;
    lex.next();

    let URL = "";

    let IS_DOCUMENT = !!this.url;

    if (this.url) {
        URL = this.url.path;
        if (!path$1.isAbsolute(URL))
            URL = path$1.resolve(process.cwd(), (URL[0] == ".") ? URL + "" : "." + URL);
    }

    this.css.parse(lex).catch((e) => {
        throw e;
    }).then((css) => {
        this.css = this.flame_system.css.addTree(css, IS_DOCUMENT, URL);
    });

    this.css.addObserver(this);
};

proto$1.toString = function(off) {
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

proto$1.updatedCSS = function() {
    this.rebuild();
};

proto$1.buildExisting = () => { return false };

class CSSComponent{
	constructor(tree, manager){
		this.manager = manager;
		this.tree = tree;
		this.doc = null;
		this.element = document.createElement("div");

		this.tree.addObserver(this);
	}

	documentReady(data){
		this.tree.parse(wick.core.lexer(data, true));
		this.manager.updateStyle("zzz", data);
		this.element.innerHTML = this.tree + "";
	}

	documentUpdate(data){

	}

	updatedCSS(){
		//this.element.innerHTML = this.tree + "";
		this.manager.updateStyle("zzz", this.tree + "");
	}
}

const CSS_Rule_Constructor = CSSRule;

/**
 *  This module maintains CSS documents and handles the updating of their contents. 
 */

let CSS_Root_Constructor = CSSRootNode;

class CSSManager {

	constructor(docs) {
		this.css_files = [];
		this.style_elements = {};
		this.docs = docs;
	}

	/**
	 * Returns an array of CSS rules that match against the element
	 * @param  {[type]} element   [description]
	 * @param  {[type]} component [description]
	 * @return {[type]}           [description]
	 */
	aquireCSS(element, component) {
		if (!component)
			return [];

		let win = component.window;

		let css_docs = component.local_css;

		let selectors = [];

		for (let i = 0; i < css_docs.length; i++) {
			let gen = css_docs[i].getApplicableSelectors(element, win),
				sel = null;
			while (sel = gen.next().value)
				selectors.push(sel);
		}

		return selectors;
	}

	createStyleDocument(name){

		let id = "./temp.css";
		this.docs.loadFile({path:"./", name:"temp.css"}, true);
		let doc = this.docs.get(id);
		debugger
	}

	/**
	 * Returns matching rule that is the most unique to the element. Creates a new rule if one cannot be found. May create a new CSS document if the rule is not found.  
	 * @param  {[type]} element   [description]
	 * @param  {[type]} component [description]
	 * @return {[type]}           [description]
	 */
	getUnique(element, component) {
		let css_docs = component.local_css;
		let win = component.window;

		let selector = null,
			best_score = 0;

		for (let i = 0; i < css_docs.length; i++) {
			let gen = css_docs[i].getApplicableSelectors(element, win),
				sel = null;
			while (sel = gen.next().value) {
				let score = sel.v.length * -20.5;

				for (let j = 0; j < sel.a.length; j++) {
					let array = sel.a[j];
					let score_multiplier = 1;
					for (let x = 0; x < array.length; x++) {
						let v = array[x];

						for(let y = 0; y < v.ss.length; y++){
							let r = v.ss[y];

							switch(r.t){
								case "class":
									score += 40 * score_multiplier;
									break;
								case "id":
									score += 50 * score_multiplier;
									break;
							}
						}

						switch (v.c) {
							case "child":
								score += 2 * score_multiplier;
								break;
							case "preceded":
								score += 3 * score_multiplier;
								break;
							case "immediately_preceded":
								score += 3 * score_multiplier;
								break;
							case "descendant":
								score += 1 * score_multiplier;
								break;
						}

						score_multiplier -= 0.98;
					}
				}

				if (score > best_score) {
					selector = sel;
					best_score = score;
				}
			}
		}
		
		if (!selector) {
			//Create new CSS document and create identifier for this document best matching the element. 
			//Add new class to element if there is none present. 

			//The last selector in the component CSS has the highest default precedent.
			let tree = css_docs[css_docs.length - 1];

			if (css_docs.length == 0) {
            	 tree = new CSS_Root_Constructor();
				
				let ast = component.sources[0].ast;
            	
            	let style = new StyleNode$1();
            	style.tag = "style";
            	
            	ast.css = (ast.css) ? ast.css : [];
            	ast.addChild(style);
            	ast.css.push(tree);
            	
            	style.css = tree;
            	tree.addObserver(style);
				
				this.css_files.push(tree);
				component.local_css.push(tree);
			}


				//create new css document. it should be located at the same location as the component. Or at a temp location

			let class_name = "n" +((Math.random() * 10000000) | 0) + "";
			let classes = element.wick_node.getAttrib("class");
			
			if (classes) {
				if (typeof(classes.value) == "string")
					classes.value += ` ${class_name}`;
				else
					classes.value.txt += ` ${class_name}`;
			}else{
				element.wick_node.attributes.push(element.wick_node.processAttributeHook("class", whind$1(class_name)));
			}

			element.classList.add(class_name);

			let body = tree.fch;

			selector = body.createSelector(`.${class_name}`);
		}

		return selector;
	}

	addFile(css_text, scope, file_id) {
		let css_file = new CSS_Root_Constructor();
		css_file.parse(new wick.core.lexer(css_text), true, null, null);
		this.css_file.push(css_text);
		css_file.file_id = file_id;
	}

	addTree(tree, IS_DOCUMENT, url) {
		if (IS_DOCUMENT) {
			let doc = this.docs.get(url);
			if (!doc.tree) {
				doc.tree = tree;
				tree.addObserver(doc);
			} else {
				tree = doc.tree;
			}
		}

		this.css_files.push(tree);

		return tree;
	}

	updateStyle(id, text) {
		let style = this.style_elements[id];

		if (!style) {
			style = this.style_elements[id] = document.createElement("style");
		}

		style.innerHTML = text;
	}

	createComponent(doc) {
		let css_file = new CSS_Root_Constructor();
		let component = new CSSComponent(css_file, this);
		doc.bind(component);
		this.css_files.push(css_file);
		return component;
	}

	mergeRules(css) {
	    let rule = new CSS_Rule_Constructor();
	    for (let i = 0; i < css.length; i++)
	        rule.merge(css[i].r);
	    return rule;
	}
}

/**
 * @brief This will replace the default rule.merge with a reactive system that updates the respective selector. 
 */
CSSRule.prototype.merge = function(rule) {
    if (rule.props) {
        for (let n in rule.props) {
            ((n) => {
                Object.defineProperty(this.props, n, {
                    configurable:true,
                    enumerable: true,
                    get: () => {
                        return rule.props[n];
                    },
                    set: (v) => {
                        rule.props[n] = v;
                        if(rule.root)
                            rule.root.updated();
                    }
                });
            })(n);
        }
        this.LOADED = true;
    }
};

/**
 * This module maintains HTML documents and updates them
 */

 class HTMLManager {}

const fr = new FileReader();
/**
    Represents actions to save a file to disk. 
**/
class $FileReader {

    constructor(file_path) {
        this.handle = -1;
        this.stream = -1;
        this.offset = 0;
        this.file_path = file_path;

        try {
            this.handle = fs.openSync(file_path, "r");
        } catch (e) {
            console.error(e);
        }
    }

    async string(encoding = "utf8") {
        if (this.ready) {
            return new Promise((res, rej) => {
                fs.readFile(this.handle, encoding, (err, string) => {
                    if (err)
                        return rej(err);
                    res(string);
                });
            });
        } else
            throw new Error(`Invalid file handle to resource ${this.file_path}; FileReader is not ready to be used`);

    }

    async readB(array_constructor = ArrayBuffer, byte_length = 0, off = this.offset, MOVE_OFFSET = true) {
        if (this.ready && byte_length > 0) {
            return new Promise((res, rej) => {
                let buffer = new Uint8Array(byte_length);

                fs.read(this.handle, buffer, 0, byte_length, off, (err, read) => {

                    if (err) return rej(err);

                    if (MOVE_OFFSET) this.offset = off + read;

                    if (array_constructor === ArrayBuffer)
                        res(buffer.buffer);
                    else if (array_constructor == Uint8Array)
                        res(buffer);
                    else if (array_constructor == Blob)
                        res(new Blob([buffer.buffer]));
                    else
                        res(new array_constructor(buffer.buffer));

                });
            })
        } else
            throw new Error(`Invalid file handle to resource ${this.file_path}; FileReader is not ready to be used`);
    }

    async readS(byte_length = 0, off = this.offset, encoding = "utf8", MOVE_OFFSET = true) {
        if (this.ready && byte_length > 0) {
            let buffer = await this.readB(Blob, byte_length, off, MOVE_OFFSET);
            let fr = new FileReader();
            return new Promise(res => {
                fr.onload = () => {
                    res(fr.result);
                };
                fr.readAsText(buffer, encoding);
            });
        } else
            throw new Error(`Invalid file handle to resource ${this.file_path}; FileReader is not ready to be used`);
    }

    scanTo(byte_offset) {
        if (!this.ready) return;
        this.offset = byte_offset;
    }

    close() {
        if (this.ready) {
            try {
                fs.closeSync(this.handle);
            } catch (e) {
                console.error(e);
            }
        }
    }

    get ready() { return this.handle !== -1; }
}

/**
	Represents actions to save a file to disk. 
**/
class FileBuilder {

    constructor(file_path) {
        this.handle = -1;
        this.stream = -1;
        this.offset = 0;

        try {
            this.handle = fs.openSync(file_path, "w+");
        } catch (e) {
            console.error(e);
        }
    }

    async writeWord(offset, word){
    	return await this.writeB(new Uint32Array([word]), offset, false);
    }

    writeB(buffer, off = this.offset, MOVE_OFFSET = true){
    	if(this.ready){
	    	return new Promise((res, rej)=>{
	    		fs.write(this.handle, buffer, 0, buffer.byteLength, off, (err, written)=>{
	    			if(err) return rej(err);
	    				
	    			if(MOVE_OFFSET)this.offset = off+written;

	    			res(off+written);
	    		});
	    	}).catch(e=>console.error(e));
    	}
    }

    writeS(string, off = this.offset, MOVE_OFFSET = true){
    	if(this.ready){
	    	return new Promise((res, rej)=>{
	    		fs.write(this.handle, string, off, "utf8", (err, written)=>{
	    			if(err) return rej(err);
	    				
	    			if(MOVE_OFFSET)this.offset = off+written;

	    			res(off+written);
	    		});
	    	}).catch(e=>console.error(e));
    	}
    }

    scanTo(byte_offset) {
        if (!this.ready) return;
    }

    close() {
        if (this.ready) {
        	try{
        		fs.closeSync(this.handle);
        	}catch(e){
        		console.error(e);
        	}
        }
    }

    get ready() { return this.handle !== -1; }
}

class Document {

    constructor(file_name, path$$1, system, IS_NEW_FILE, manager) {
        this.path = path$$1;
        this.name = file_name;
        this.data = null;
        this.old_data = "";
        this.LOADED = (IS_NEW_FILE) ? true : false;
        this.UPDATED = true;
        this.SAVING = false;
        this.INITIAL_HISTORY = false;
        this.observers = [];
        this.system = system;
        this.manager = manager;
        this.ps = false;
    }

    destroy() {
        this.observers = null;
    }

    seal(differ) {

        if (this.PENDING_SAVE) {

            this.PENDING_SAVE = false;

            let new_data = this + "";

            let diff = differ.createDiff(this.old_data, new_data);

            this.old_data = new_data;

            return (diff) ? {
                id: this.id,
                diff
            } : null;
        }

        return null;
    }

    async load() {
        if (!this.LOADED) {
            let fr = new $FileReader(this.path + "/" + this.name);

            try {
                let data = await fr.string();
                this.LOADED = true;
                this.fromString(data);
            } catch (e) {
                console.error(e);
            }

            return this.data;
        }
    }

    async save(file_builder) {

        if (!file_builder) {
            if (this.SAVING) return;

            this.SAVING = true;

            let fb = new FileBuilder(this.id);
            let string = this.toString();
            let d = await fb.writeS(string);

            if (d == 0)
                console.warn(`Saved zero sized file ${this.id}`);

            fb.close();

            this.SAVING = false;

        } else {
            return file_builder.write(this.toString());
        }
    }

    toString() {
        return "[Document]";
    }

    bind(object) {
        if (this.LOADED && object.documentReady(this.data) === false) return;
        this.observers.push(object);
    }

    alertObservers() {
        if (this.observers)
            for (let i = 0; i < this.observers.length; i++)
                if (this.observers[i].documentReady(this.data) === false)
                    this.observers.splice(i--, 1);
    }

    get type() {
        return "";
    }

    get id() {
        return `${this.path}/${this.name}`;
    }

    set PENDING_SAVE(v) {
        if (v) {
            this.manager.addPending(this);
            this.ps = true;
        } else {
            this.manager.removePending(this);
            this.ps = false;
        }
    }

    get PENDING_SAVE() {
        return this.ps;
    }
}

LinkedList.mixinTree(Document);

class WickDocument extends Document {

    updatedWickASTTree(tree) {
        //this.save();
        this.manager.addPending(this);
    }

    fromString(string, ALLOW_SEAL = true) {

        (new SourcePackage(string, this.system.project.presets, true, this.path + "/" + this.name)).then((pkg) => {
            this.LOADED = true;
            if(!pkg) //TODO - Determine the cause of undefined assigned to pkg
                
                {debugger;return;}

            if (this.data)
                this.data.skeletons[0].tree.removeObserver(this);

            this.data = pkg;

            pkg.skeletons[0].tree.addObserver(this);

            this.alertObservers();

            if (ALLOW_SEAL) {
                this.PENDING_SAVE = true;
                this.system.docs.seal();
            }
        });
    }

    toString() {
        return (this.data) ?
            this.data.toString():
            "";
    }

    get type() {
        return "html";
    }
}

class CSSDocument extends Document {

    updatedCSS(tree) {
       // this.save();
       this.manager.addPending(this);
    }

    fromString(string, ALLOW_SEAL = true) {
    	
        this.data = string;

        if (this.tree) {
            this.tree.parse(whind$1(string)).catch((e) => {
                throw e;
            }).then((css) => {
                this.old = string;
                this.tree.updated();
            });
        } else {
            
            this.alertObservers();

            if (ALLOW_SEAL) {
                this.PENDING_SAVE = true;
                this.system.docs.seal();
            }
        }
    }

    toString() {
        return (this.tree) ?
            this.tree + "" :
            this.data;
    }

    get type() {
        return "css";
    }
}

/**
 * Uses a diff algorithm to create a change map from one document version to another. Versions are stored in the project as a change history. 
 */
class DocumentDifferentiator {

    constructor() {
        this.oldTF = new TextFramework();
        this.newTF = new TextFramework();
    }

    createDiff(old, new_) {

        if (!old || !new_ || old == new_) return;

        const oldTF = this.oldTF;
        const newTF = this.newTF;

        oldTF.clearContents();
        newTF.clearContents();

        oldTF.insertText(old);
        oldTF.updateText();
        newTF.insertText(new_);
        newTF.updateText();

        let i = 0,
            j = 0,
            li = oldTF.length,
            lj = newTF.length;

        const diffs = { new: [], old: [] };

        outer:
            for (i = 0, j = 0; i < li; i++) {

                if (j >= lj) {
                    //differences
                    diffs.push({ type: "old", index: i, text: oldTF.getLine(i).slice() });
                    continue;
                }


                if (oldTF.getLine(i).slice() == newTF.getLine(j).slice()) {
                    j++;
                    continue;
                }

                let root = j;

                for (let d = 1; j < lj; j++, d++) {
                    //*
                    if (j - root == 0 && i + d < li && oldTF.getLine(i + d).slice() == newTF.getLine(root + d).slice()) {
                        for (let n = 0; n < d; n++) {
                            diffs.new.push({ index: root + n, text: newTF.getLine(root + n).slice() });
                            diffs.old.push({ index: i + n, text: oldTF.getLine(i + n).slice() });
                        }
                        i += d;
                        j = root + d + 1;
                        continue outer;
                    } //*/

                    if (oldTF.getLine(i).slice() == newTF.getLine(j).slice()) {
                        const distance = j - i;
                        const l = Math.min(li, i + distance - 1);

                        for (let p = i + 1; p < l; p++) {
                            if (oldTF.getLine(p).slice() == newTF.getLine(root).slice()) {

                                for (let n = i; n < p; n++)
                                    diffs.old.push({ index: n, text: oldTF.getLine(n).slice(), n: "AA" });

                                i = p;
                                j = root + 1;
                                continue outer;
                            }
                        }

                        for (let n = root; n < j; n++)
                            diffs.new.push({ index: n, text: newTF.getLine(n).slice(), n: "AB", root });

                        j++;

                        continue outer;
                    }


                    if (j == lj - 1) {

                        for (let p = i; p < li; p++) {
                            if (oldTF.getLine(p).slice() == newTF.getLine(root).slice()) {
                                for (let n = i; n < p; n++)
                                    diffs.old.push({ index: n, text: oldTF.getLine(n).slice(), n: "DD", root, p });

                                i = p;
                                j = root + 1;
                                continue outer;
                            }
                        }

                        diffs.new.push({ index: root, text: newTF.getLine(root).slice() });
                        diffs.old.push({ index: i, text: oldTF.getLine(i).slice() });
                        j = root + 1;
                        break;
                    }
                }
            }


        while (j < lj) {
            diffs.new.push({ index: j, text: newTF.getLine(j).slice() });
            j++;
        }

        return diffs;
    }

    convert(doc, diff) {
        let a = new TextFramework();
        a.insertText(doc + "");

        a.updateText();


        for (let i = diff.old.length - 1; i >= 0; i--) {
            let d = diff.old[i];
            let line = a.getLine(d.index);
            a.line_container.remove(line);
            line.release();
        }

        if (a.length == 0) debugger

        for (let i = 0; i < diff.new.length; i++) {
            let d = diff.new[i];
            a.insertText(d.text, d.index - 1);
            a.updateText();
        }

        a.updateText();

        doc.fromString(a.toString(), false);
    }

    revert(doc, diff) {

        let a = new TextFramework();
        a.insertText(doc + "");
        a.updateText();

        for (let i = diff.new.length - 1; i >= 0; i--) {
            let d = diff.new[i];
            let line = a.getLine(d.index);
            a.line_container.remove(line);
            line.release();
        }

        if (a.length == 0) debugger
            
        for (let i = 0; i < diff.old.length; i++) {
            let d = diff.old[i];
            a.insertText(d.text, Math.max(0, d.index - 1));
            a.updateText();
        }

        doc.fromString(a.toString(), false);
    }
}

/**
 * The Document Manager handles text file operations and text file updating. 
 */
class DocumentManager {
    constructor(system) {
        this.docs = new Map();
        this.system = system;
        this.differ = new DocumentDifferentiator();
        this.diffs = [];
        this.diff_step = 0;

        this.pending = null;
        this.updated = false;
        /**
         * Global `fetch` polyfill - basic support
         */
        global.fetch = (url, data) => new Promise((res, rej) => {
            let p = url;
            if (!path.isAbsolute(p)) p = path.resolve(process.cwd(), (url[0] == ".") ? url + "" : "." + url);
            let doc_id = this.load({
                path: path.dirname(p),
                name: path.basename(p),
                type: "text/css",
            });
            if (doc_id) {
                this.get(doc_id).bind({
                    documentReady: (data) => res({
                        status: 200,
                        text: () => new Promise((res) => res(data))
                    })
                });
            }
        });
    }
    /*
     * Loads file into project
     */
    loadFile(file, NEW_FILE = false) {
        switch (typeof(file)) {
            case "string": // Load from file system or DB
                var p = path.parse(file);
                file = {
                    path: p.dir,
                    name: p.base
                };
                //Intentional fall through. 
            case "object": // Loandead data 
                if (file.name && file.path) {
                    let path$$1 = file.path;
                    let name = file.name;
                    let type = "";
                    if (file.type) type = file.type; //.split("/")[1].toLowerCase();
                    else type = name.split(".").pop().toLowerCase();
                    if (path$$1.includes(name)) path$$1 = path$$1.replace(name, "");
                    if (path$$1[path$$1.length - 1] == "/" || path$$1[path$$1.length - 1] == "\\") path$$1 = path$$1.slice(0, -1);
                    path$$1 = path$$1.replace(/\\/g, "/");
                    let id = `${path$$1}/${name}`;
                    if (!this.docs.get(id)) {
                        let doc;
                        switch (type) {
                            case "html":
                                doc = new WickDocument(name, path$$1, this.system, NEW_FILE, this);
                                break;
                            case "css":
                            default:
                                doc = new CSSDocument(name, path$$1, this.system, NEW_FILE, this);
                        }
                        this.docs.set(id, doc);


                        if (file.data)
                            doc.fromString(file.data);
                        else
                            doc.load();
                    }
                    return id;
                }
                break;
        }
        return "";
    }

    get(id) {
        return this.docs.get(id.replace(/\\/g, "/"));
    }

    /** Updates all changes to files and records diffs resulting from user actions */
    seal() {

        let diffs = [],
            doc;

        if (this.pending) {

            this.pending.previous = null;

            while ((doc = this.pending)) {
                let pack = doc.seal(this.differ);

                if (pack)
                    diffs.push(pack);
            }

            if (diffs.length > 0)
                this.system.history.addAction({ type: "doc", diffs });
        }
    }

    undo(action) {

        let diffs = action.diffs;

        if (diffs) {
            for (let i = 0; i < diffs.length; i++) {
                let pack = diffs[i];
                let doc = this.docs.get(pack.id);
                this.differ.revert(doc, pack.diff);
            }
        }
    }

    redo(action) {

        let diffs = action.diffs;

        if (diffs) {
            for (let i = 0; i < diffs.length; i++) {
                let pack = diffs[i];
                let doc = this.docs.get(pack.id);
                this.differ.convert(doc, pack.diff);
            }
        }
    }

    addPending(doc) {
        if (doc.ps)
            return;
        if (this.pending)
            doc.next = this.pending;

        doc.ps = true;

        this.pending = doc;
    }

    removePending(doc) {
        if (doc == this.pending) {

            if (doc.nxt == doc)
                this.pending = null;
            else
                this.pending = doc.next;
        }

        doc.ps = false;

        doc.next = null;
        doc.prv = null;
    }

    /**
        Reset document manager, releasing all held documents. 
    */
    reset() {
        this.diffs = [];
        this.docs.forEach(d => d.destroy());
        this.docs = new Map();
    }

    async save(file_builder) {
        if (!file_builder) {
            //Save all files individually
            this.docs.forEach(doc=>{
                doc.save();
            });
        } else {

            var i = this.docs.entries();

            for (let v of i) {
                let doc = v[1];
                await file_builder.writeS(JSON.stringify({ name: doc.name, path: doc.path, type: doc.type, data: doc + "" }));
            }

            return file_builder.offset;
        }
    }

    load(string) {
        let lex = new whind$1(string);
        let level = 0;

        while (!lex.END) {
            if (lex.ch == "{") {
                let n = lex.pk;
                level = 1;
                while (!n.END && level > 0) {
                    if (n.ch == "{") level++;
                    if (n.ch == "}") level--;
                    n.next();
                }

                this.loadFile(JSON.parse(n.slice(lex)));

                lex.sync(n);
            } else
                lex.next();
        }
    }
}

Source.prototype.rebuild = function (){
	this.ast.buildExisting(this.ele, this, this.presets, this.taps,null, this.window);
};

let id = 0;

RootNode.id = 0;


SourceNode$1.prototype.createElement = function(presets, source$$1) {
    let element = document.createElement(this.getAttribute("element") || "div");
    element.wick_source = source$$1;
    element.wick_node = this;
    element.wick_id = id++;
    return element;
};

RootNode.prototype.ReparseConstructor = RootNode;

RootNode.prototype.createElement = function(presets, source$$1) {
    const element = document.createElement(this.tag);
    element.wick_source = source$$1;
    element.wick_node = this;
    element.wick_id = RootNode.id++;
    return element;
};

RootNode.prototype.setSource = function(source$$1) {

    if (!this.observing_sources)
        this.observing_sources = [];

    this.observing_sources.push(source$$1);

    source$$1.ast = this;
};

RootNode.prototype.reparse = function(text) {

    const Root = new this.ReparseConstructor();

    Root.par = this.par;

    const promise = Root.parse(whind$1(text), false, false, this.par);

    promise.then(node => {
        node.par = null;

        if (this.par)
            this.par.replace(this, node);
        node.BUILT = true;
        node.setRebuild(false, true);
        node.rebuild();
    });

    return promise;
};

// Rebuild all sources relying on this node
RootNode.prototype.rebuild = function(win = window) {


    if (this.observing_sources) {
        
        for (let i = 0; i < this.observing_sources.length; i++) {
            try {
                this.observing_sources[i].rebuild(this.observing_sources[i].window);
            } catch (e) {
                console.error(e);
            }
        }
        this.resetRebuild();
    } else if (this.par)
        this.par.rebuild(win);
};

RootNode.prototype.extract = function() {
    if (this.par)
        this.par.replace(this, new DeleteNode());
};


RootNode.prototype.buildExisting = function(element, source$$1, presets, taps, parent_element, win = window, css = this.css) {
    
    if (true || this.CHANGED !== 0) {

        element.style.cssText = "";

        this.linkCSS(css, win);
        //IO CHANGE 
        //Attributes
        if (this.CHANGED & 4) {

            let span = document.createElement("span");

            this._build_(span, source$$1, presets, [], taps, {});

            let ele = span.firstChild;

            if (this.CHANGED & 8) {
                if (element) {
                    element.parentElement.insertBefore(ele, element);
                } else
                    parent_element.appendChild(ele);
                return true;
            } else {

                element.parentElement.replaceChild(ele, element);
                return true;
            }

        }

        if (this._merged_)
            this._merged_.buildExisting(element, source$$1, presets, taps);

        if (true || this.CHANGED & 1) {
            //redo IOs that have changed (TODO)
            for (let i = 0, l = this.bindings.length; i < l; i++) {
                this.bindings[i].binding._bind_(source$$1, [], taps, element, this.bindings[i].name);
            }
        }

        if (true || this.CHANGED & 2) {
            //rebuild children
            let children = element.childNodes;
            for (let i = 0, node = this.fch; node; node = this.getNextChild(node)) {
                let child = children[i];
                if (node.buildExisting(child, source$$1, presets, taps, element, win)) i++;
            }
        }
    }

    return true;
};

RootNode.prototype.setRebuild = function(child = false, REBUILT = false, INSERTED = false) {
    if (child) {
        this.CHANGED |= 2;
    } else {
        this.CHANGED |= 1;
    }

    if (REBUILT) {
        this.CHANGED |= 4;
    }

    if (INSERTED) {
        this.CHANGED |= 8;
    }

    if (this.par)
        this.par.setRebuild(true);
    else if (this.merges) {
        for (let i = 0; i < this.merges.length; i++)
            this.merges.setRebuild(true);
    }
};

RootNode.prototype.resetRebuild = function() {
    this.CHANGED = 0;

    if (!this.parent)
        this.updated();

    for (let node = this.fch; node; node = this.getNextChild(node))
        node.resetRebuild();
};

RootNode.prototype._build_ = RootNode.prototype.build;
RootNode.prototype.build = function(element, source$$1, presets, errors, taps, statics) {
    this.BUILT = true;
    return this._build_(element, source$$1, presets, errors, taps, statics);
};


RootNode.prototype._processFetchHook_ = function(lexer, OPENED, IGNORE_TEXT_TILL_CLOSE_TAG, parent, url) {

    let path$$1 = this.url.path,
        CAN_FETCH = true;

    //make sure URL is not already called by a parent.
    while (parent) {
        if (parent.url && parent.url.path == path$$1) {
            console.warn(`Preventing recursion on resource ${this.url.path}`);
            CAN_FETCH = false;
            break;
        }
        parent = parent.par;
    }

    if (CAN_FETCH) {
        return this.url.fetchText().then((text) => {
            let lexer = whind$1(text);
            return this._parseRunner_(lexer, true, IGNORE_TEXT_TILL_CLOSE_TAG, this);
        }).catch((e) => {
            console.error(e);
        });
    }
    return null;
};


RootNode.prototype._mergeComponent_ = function() {
    let component = this._presets_.components[this.tag];

    if (component) {

        this._merged_ = component;

        if (!component.merges)
            component.merges = [];

        component.merges.push(this);
    }
};



RootNode.prototype.addObserver = function(observer) {
    if (!this.observers)
        this.observers = [];
    this.observers.push(observer);
};

RootNode.prototype.addView = function(view) {
    if (!this.views)
        this.views = [];
    this.views.push(view);
    view._model_ = this;
};

RootNode.prototype.removeObserver = function(observer) {
    for (let i = 0; i < this.observers.length; i++)
        if (this.observers[i] == observer) return this.observers.splice(i, 1);
};

RootNode.prototype.removeView = function(view) {
    for (let i = 0; i < this.views.length; i++)
        if (this.views[i] == view) return this.views.splice(i, 1);
};

RootNode.prototype.updated = function() {
    if (this.observers)
        for (let i = 0; i < this.observers.length; i++)
            this.observers[i].updatedWickASTTree(this);

    if (this.views)
        for (let i = 0; i < this.views.length; i++)
            this.views[i].update(this);

};

RootNode.prototype.BUILT = false;

/**
 * This node allows an existing element to be removed from DOM trees that were created from the Wick AST. 
 */
class DeleteNode extends SourceNode$1 {
    buildExisting(element) {
        element.parentElement.removeChild(element);
        return false;
    }

    resetRebuild() {

        let nxt = this.nxt;
        if (this.par)
            this.par.remC(this);
        this.nxt = nxt;
    }
}

SVGNode.prototype.createElement = function(presets, source$$1){
    const element = document.createElementNS("http://www.w3.org/2000/svg", this.tag);
    element.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    element.wick_source = source$$1;
    element.wick_node = this;
    element.wick_id = RootNode.id++;
    return element;
};

SVGNode.prototype.setSource = RootNode.prototype.setSource;
// Rebuild all sources relying on this node
SVGNode.prototype.rebuild = RootNode.prototype.rebuild;
SVGNode.prototype.buildExisting = RootNode.prototype.buildExisting;
SVGNode.prototype.setRebuild = RootNode.prototype.setRebuild;
SVGNode.prototype.resetRebuild = RootNode.prototype.resetRebuild;
SVGNode.prototype.updated = RootNode.prototype.updated;
SVGNode.prototype.ReparseConstructor = SVGNode;

RootText.prototype.createElement = RootNode.prototype.createElement;
RootText.prototype.setSource = RootNode.prototype.setSource;
// Rebuild all sources relying on this node
RootText.prototype.rebuild = RootNode.prototype.rebuild;
RootText.prototype.buildExisting = ()=>{return true}; RootNode.prototype.build_existing;
RootText.prototype.setRebuild = RootNode.prototype.setRebuild;
RootText.prototype.resetRebuild = RootNode.prototype.resetRebuild;
RootText.prototype.updated = function(){};

SourceNode$1.prototype.buildExisting = function(element, source$$1, presets, taps, win = window, css) {
    if (true || this.CHANGED !== 0) {
        //IO CHANGE 
        //Attributes
        if (this.CHANGED & 4) {

            let span = document.createElement("span");

            this._build_(span, source$$1, presets, [], taps, {});

            let ele = span.firstChild;

            element.parentElement.replaceChild(ele, element);

            return true;
        }

        if (this._merged_)
            this._merged_.buildExisting(element, source$$1, presets, taps);

        if (true || this.CHANGED & 1) {
            //redo IOs that have changed (TODO)
            for (let i = 0, l = this.bindings.length; i < l; i++) {
                this.bindings[i].binding._bind_(source$$1, [], taps, element, this.bindings[i].name);
            }
        }

        if (true || this.CHANGED & 2) {
            //rebuild children
            let children = element.childNodes;
            for (let i = 0, node = this.fch; node; node = this.getNextChild(node)) {
                let child = children[i];
                if (node.buildExisting(child, source$$1, presets, taps, null, win, this.css)) i++;
            }
        }
    }

    return true;
};

let Lexer$1 = whind$1;

SourceTemplateNode$1.prototype.buildExisting = function(element, source$$1, presets, taps) {
    if (true || this.CHANGED !== 0) {
        //IO CHANGE 
        //Attributes
        if (this.CHANGED & 4) {

            let span = document.createElement("span");

            this._build_(span, source$$1, presets, [], taps, {});

            let ele = span.firstChild;

            element.parentElement.replaceChild(ele, element);

            return true;
        }

        if (this._merged_)
            this._merged_.buildExisting(element, source$$1, presets, taps);

        if (true || this.CHANGED & 1) 
            //redo IOs that have changed (TODO)
            for (let i = 0, l = this.bindings.length; i < l; i++) 
                this.bindings[i].binding._bind_(source$$1, [], taps, element, this.bindings[i].name);
        

        if (true || this.CHANGED & 2) {
            //rebuild children
            let children = element.childNodes;
            for (let i = 0, node = this.fch; node; node = this.getNextChild(node)) {
                let child = children[i];
                if (node.buildExisting(child, source$$1, presets, taps)) i++;
            }
        }
    }

    return true;
};

PackageNode.prototype.buildExisting = function(element, source$$1, presets, taps) {
    return false;
};

ScriptNode$1.prototype.toString = function(off) {
    return ("    ").repeat(off) + `<script on="((${this.binding.tap_name}))" >${this.script_text}</script>\n`;
};

ScriptNode$1.prototype.updatedCSS = function() {
    this.rebuild();
};

ScriptNode$1.prototype.buildExisting = () => { return false };

const schemed = (schema, sm) => (sm = class extends SchemedModel {}, sm.schema = schema, sm);
const EPOCH_Date = new DateSchemeConstructor;
const EPOCH_Time = new TimeSchemeConstructor;
const Longitude = new NumberSchemeConstructor;
const Latitude = new NumberSchemeConstructor;
const $Number = new NumberSchemeConstructor;
const $String = new StringSchemeConstructor;
const $Boolean = new BoolSchemeConstructor;
/**
 * Schema for flame_data model
 */
//const schemed = wick.model.scheme;
const FlameScheme = schemed({
    meta:schemed({
        last_modified: EPOCH_Time,
        creation_date: EPOCH_Time, 
    }),
    preferences: schemed({
        name: $String,
        working_directory: $String,
        temp_directory: $String,
        bundle_files: $Boolean,
        auto_save_interval: $Number,
    }),
    defaults: schemed({
        component: schemed({
            width: $Number,
            height: $Number
        })
    }),
    components: schemed({
        KEEP_UNIQUE: $Boolean,
        move_type: $String,
        primary_color: $Number,
        secondary_color: $Number,
    })
});

class ColorFramework {
	constructor() {
		this.r = 0;
		this.g = 0;
		this.b = 0;
		this.a = 0;

		this.last_x = 0;
		this.last_y = 0;

		this.alpha = 255;

		this.h = 0;
		this.s = 0;
		this.v = 0;

		this.hex = "#000000";

		this.color_width = 150;
		this.color_height = 150;

		this.draw_type = "doughnut";
		this.draw_mode = "hsl";

		this.saturation = 1;
	}

	rgbToString(r, g, b) {
		r = r || this.r;
		g = g || this.g;
		b = b || this.b;
		return "rgb(" + r + "," + g + "," + b + ")";
	}

	draw(ctx, x, y, w, h, type, mode) {
		var pi = Math.PI;

		var width = w;
		var height = h;

		var id = ctx.getImageData(x || 0, y || 0, width, height);

		var data = id.data;

		for (var i = 0; i < height; i++) {
			for (var j = 0; j < width; j++) {
				var index = (i* width + j) * 4;
				this.getColor(j, i, width, height, type, mode);
				if(this.a === 0) continue;
				data[index + 0] = this.r;
				data[index + 1] = this.g;
				data[index + 2] = this.b;
				data[index + 3] = this.a;
			}
		}

		ctx.putImageData(id, 0, 0);

		//Extras
		switch (type) {
			case "doughnut":
				ctx.strokeStyle = "black";
				ctx.lineWidth = width * 0.02;

				ctx.beginPath();
				ctx.arc(width * 0.5, height * 0.5, width * 0.475, Math.PI * 2, false);
				ctx.stroke();

				ctx.strokeStyle = this.draw_mode === "hsl" ? "white" : "black";
				ctx.beginPath();
				ctx.arc(width * 0.5, height * 0.5, width * 0.295, Math.PI * 2, false);
				ctx.stroke();

				break;
			case "wheel":
				ctx.strokeStyle = "black";
				ctx.lineWidth = width * 0.01;
				ctx.beginPath();
				ctx.arc(width * 0.5, height * 0.5, width * 0.475, Math.PI * 2, false);
				ctx.stroke();
				break;
			default:
				ctx.strokeStyle = "rgb(220,220,220)";
				ctx.lineWidth = 2;
				ctx.strokeRect(0, 0, width, height);
			break;
		}
	}

	HSLtoRGB(h, s, l) {
		var h_ = h / 60;
		var c = (1 - Math.abs(2 * l - 1)) * s;

		var x = c * (1 - Math.abs((h_ % 2) - 1));

		var rgb = [0, 0, 0];

		if (h_ < 1 && h_ >= 0) {
			rgb[0] = c;
			rgb[1] = x;
		} else if (h_ < 2) {
			rgb[1] += c;
			rgb[0] += x;
		} else if (h_ < 3) {
			rgb[1] += c;
			rgb[2] += x;
		} else if (h_ < 4) {
			rgb[2] += c;
			rgb[1] += x;
		} else if (h_ < 5) {
			rgb[2] += c;
			rgb[0] += x;
		} else if (h_ < 6) {
			rgb[0] += c;
			rgb[2] += x;
		}

		var m = l - 0.5 * c;

		rgb[0] += m;
		rgb[1] += m;
		rgb[2] += m;

		rgb[0] *= 255;
		rgb[1] *= 255;
		rgb[2] *= 255;


		return rgb;
	}

	HSVtoRGB(h, s, v) {
		var h_ = h / 60;
		var c = v * s;
		var m = v - c;

		var x = c * (1 - Math.abs((h_ % 2) - 1));

		var rgb = [m, m, m];

		if (h_ < 1 && h_ >= 0) {
			rgb[0] += c;
			rgb[1] += x;
		} else if (h_ < 2) {
			rgb[1] += c;
			rgb[0] += x;
		} else if (h_ < 3) {
			rgb[1] += c;
			rgb[2] += x;
		} else if (h_ < 4) {
			rgb[2] += c;
			rgb[1] += x;
		} else if (h_ < 5) {
			rgb[2] += c;
			rgb[0] += x;
		} else if (h_ < 6) {
			rgb[0] += c;
			rgb[2] += x;
		}

		rgb[0] *= 255;
		rgb[1] *= 255;
		rgb[2] *= 255;

		return rgb;
	}

	RGBtoHSV(r, g, b) {
		var h = 0;
		var h_ = 0;
		var v = 0;
		var s = 0;
		// hue
		var M = Math.max(r, g, b);
		var m = Math.min(r, g, b);
		var c = M - m;

		if (M === r) h_ = ((g - b) / c) % 6;
		else if (M === g) h_ = ((b - r) / c) + 2;
		else h_ = ((r - g) / c) + 4;

		h = ((Math.PI / 180) * 60) * h_;

		//value
		v = M;

		//saturation
		s = (c == 0) ? 0 : c / v;

		return [h, s, v];
	}

	RGBtoHSL(r, g, b) {
		var hsl = this.RGBtoHSV(r, g, b);
		hsl[2] = (r * 0.3 + g * 0.59 + b * 0.11);
		return hsl;
	}

	getColor(x, y, width, height, type, mode, color_array) {
		var color;

		mode = mode || this.draw_mode;
		type = type || this.draw_type;
		//square types

		if (type === "doughnut" || type === "wheel") { //wheel or doughnut
			//vector from center to xy
			x = width * 0.5 - x;
			y = height * 0.5 - y;

			//normalize
			var l = Math.sqrt(x * x + y * y); // l becomes a useful value

			x /= l;
			y /= l;
			l /= width * 0.5; //now even more useful

			if (l > 0.95) { // discard points outside and inside circle
				this.r = 0;
				this.g = 0;
				this.b = 0;
				this.a = 0;
				return this;
			} else {
				//calculate angle and convert degrees
				var angle = ((Math.atan2(0, 1) - Math.atan2(y, x)) * 180 / Math.PI) + 180;
				if (type === "doughnut") {
					if (mode == "hsl") {
						color = this.HSLtoRGB(angle, this.saturation, (1 - (l * 2.5 - 1.5)));
					} else {
						color = this.HSVtoRGB(angle, this.saturation, (1 - (l * 2.5 - 1.5)));
					}
				} else {
					if (mode == "hsl") {
						color = this.HSLtoRGB(angle, this.saturation, (1 - l));
					} else {
						color = this.HSVtoRGB(angle, this.saturation, l);
					}
				}
			}
		} else { //square
			if (mode === "hsl") {
				color = this.HSLtoRGB(x / width * 360, this.saturation, 1 - y / height);
			} else {
				color = this.HSVtoRGB(x / width * 360, this.saturation, 1 - y / height);
			}
		}

		if(!color_array){
			this.r = (color[0] | 0);
			this.g = (color[1] | 0);
			this.b = (color[2] | 0);
			this.a = this.alpha;
		}

		return this;
	}
}

/**
 * @brief Stores data for the current project. Handles the global saving and importation of data. 
 * @details The project object is the primary store of user data and preferences. 
 * It also provides the hosting of the presets object for wick components, and the interface components for user tools. 
 * The flame_data model stored is the main linking object for handling UI updates from actions performed through UI components.  
 */
class Project {

    constructor(system) {

        this.system = system;     
        this.flame_data = null;
        this.presets = null;

        this.setPresets();
        this.setDefaults();
    }

    setPresets(){

        const system = this.system;

        this.flame_data = new FlameScheme();
        
        this.presets = new Presets({
            models: {
                flame: this.flame_data,
                settings: this.flame_data.settings,
            },
            custom: {
                actions: system.actions,
                ui: system.ui,
                classes: {
                    textio: TextIO,
                    textfw: TextFramework,
                    coloredit: ColorFramework
                },
                system
            }
        });
    }

    reset() {
        this.setPresets();
        this.setDefaults();
        this.system.ui.reset();
        this.system.docs.reset();
        this.system.history.reset();
    }

    loadComponents(dir) {

        fs.readdir(dir, (e, d) => {
            if (e)
                return console.error(`Could not load UI components: ${e}`);

            d.forEach((fn) => {
                if (path.extname(fn) == ".html") {
                    this.system.ui.addComponent(([dir, fn]).join("/"));
                }
            });
        });
    }

    setDefaults() {
        this.preferences.auto_save_interval = 0;

        this.meta.creation_date = Date.now();
        this.defaults.component.width = 360;
        this.defaults.component.height = 920;
        this.components.move_type = "relative";
        this.components.KEEP_UNIQUE = true;



        this.loadComponents(path.join(process.cwd(), "./assets/ui_components"));
    }

    get meta(){
        return this.flame_data.meta;
    }
    get preferences(){
        return this.flame_data.preferences;
    }
    get defaults(){
        return this.flame_data.defaults;
    }
    get components(){
        return this.flame_data.components;
    }

    importUIComponent(component) {
        this.system.iu.addUIComponent(component);
    }
    /****************************************************               ******************************************************************************/
    /**************************************************** FILE HANDLING ******************************************************************************/
    /****************************************************               ******************************************************************************/

    /**
        Save to original location - saves files to original locations, overwriting if necessary. Can be set on a per doc basis. 
        Save to output dir - saves files to output directory, matching the folder structure relative to current working directory. 
            if a file was imported outside the CWD, the file will be placed at the root of the output dir.
        Save checkpoint - saves file to project fifle at regular intervals. This causes a new file to be created every time a file is save. It will reference the old files history to preserve state history. 
        Backup docs - saves documents to project file. Default if Save original or Save output are both false/unset. The is overrides save checkpoint 
        Save history - saves the history of the curent data.
    **/

    async load(file_path = this.file_path, call_back = null) {

        let file_reader;

        if (file_path instanceof $FileReader)
            file_reader = file_path;
        else
            file_reader = new $FileReader(file_path);

        const stamp = await this.readFileStamp(file_reader);

        if (stamp.title !== "CF")
            throw new Error(`File ${file_path} is not recognized as an *.fpd file.`);

        const ui = await file_reader.readS(stamp.ui_size);

        if (stamp.flags & 2) {
            const data = await file_reader.readS(stamp.doc_size);
            this.system.docs.load(data);
        }
        this.system.ui.load(ui);

        const project_data = await file_reader.readS(stamp.project_size);

        this.flame_data.set(JSON.parse(project_data));

        await this.system.history.load(file_reader, stamp.history_size);

        if (call_back)
            call_back();
    }

    /** 
        Saves all components, history, and settings to the project file. 
        May also save current documents if user settings permit.  
    **/
    async save(file_path = this.file_path, call_back = null) {

        let file_builder;

        if (file_path instanceof FileBuilder)
            file_builder = file_path;
        else
            file_builder = new FileBuilder(file_path);

        //64byte header.
        file_builder.offset = 64;

        let ui_size = 0,
            docs_size = 0,
            setting_size = 0,
            history_size = 0;

        ui_size = await this.saveUI(file_builder);

        if (this.preferences.bundle_files)
            docs_size = await this.saveDocuments(file_builder);
        else if (this.preferences.export_file_dir)
            this.system.docs.save(null/*, export_file_dir*/);
        else    
            this.system.docs.save();

        //Save Project Properties
        setting_size = await this.saveProperties(file_builder);
        //May create some leading here.

        //State History
        history_size = await this.saveCheckpoint(file_builder);

        //May create some leading here.

        //await file_builder.writeWord(8,ui_size); //gives offset to docs
        await this.writefileStamp(file_builder, ui_size, docs_size, setting_size, history_size);

        file_builder.close();

        if (file_builder.offset == 0)
            throw new Error("Failed to write data to file.");

        if (call_back)
            call_back(true);

        return true;
    }

    /** 
        Saves current history to project file. 
    **/
    async saveUI(file_builder) {
        const off = file_builder.offset;
        return await this.system.ui.save(file_builder) - off;
    }

    async saveCheckpoint(file_builder) {
        const off = file_builder.offset;
        return await this.system.history.save(file_builder) - off;
    }

    async saveProperties(file_builder) {
        const off = file_builder.offset;
        return await file_builder.writeS(this.flame_data.toJSON()) - off;
    }

    async saveDocuments(file_builder) {
        const off = file_builder.offset;
        return await this.system.docs.save(file_builder) - off;
    }

    async writefileStamp(file_builder, ui_size = 0, doc_size = 0, project_size = 0, history_size = 0) {
        const stamp = new Uint32Array(16),
            entry_flags = ((ui_size > 0) | 0) |
            (((doc_size > 0) | 0) << 1) |
            (((project_size > 0) | 0) << 2) |
            (((history_size > 0) | 0) << 3);

        //Document info, time stamp, entries
        stamp[0] = ((this.system.version & 0xFFFF) << 16) | (("F").charCodeAt(0)) << 8 | (("C").charCodeAt(0)); /*CF*/
        stamp[1] = entry_flags;
        stamp[2] = ui_size;
        stamp[3] = doc_size;
        stamp[4] = project_size;
        stamp[5] = history_size;

        return await file_builder.writeB(stamp, 0, false);
    }

    async readFileStamp(file_reader) {
        const stamp = await file_reader.readB(Uint32Array, 64);

        const d = stamp[0],
            version = (d >> 16) & 0xFFFF,
            title = String.fromCharCode(d & 0xFF) + String.fromCharCode((d >> 8) & 0xFF);

        const
            flags = stamp[1],
            ui_size = stamp[2],
            doc_size = stamp[3],
            project_size = stamp[4],
            history_size = stamp[5];

        return {
            title,
            version,
            flags,
            ui_size,
            doc_size,
            project_size,
            history_size
        };
    }
}

/*
    Every action should be able to be saved to file. This means that only primitive information should be stored
    in an action object, and should not contain references to complex objects (anything that is not an array of prims, or an array that contains arrays of prims.)
*/

class State {

    constructor(id = 0) {
        this._id = id;
        this.actions = [];
        this.progression = 0; //Used to determin which branch to go to when advancing.
    }

    toJSON() {
        
        const str = { a: this.actions, p: this.progression, b: [] },
            root = this.fch;
        
        let node = this.fch;
        
        if(this.fch)
        do {
            str.b.push(node.toJSON());
        } while ((node = node.next) !== root);

        return str;
    }

    fromJSON(node) {

        this.actions = node.a;

        const branches = node.b;

        for (let i = 0; i < branches.length; i++) {
            let s = new State();
            this.push(s);
            s.fromJSON(branches[i]);
        }
    }

    addAction(action){

        if(action.type)
            this.actions.push(action);
    }

    get id(){

        const id = this._id + "";
        return (this.par) ? `${this.par.id}:${id}` : id;
    }
}

LinkedList.mixinTree(State);


/** 
    Methods of creating and managing state trees. 
*/
class StateMachine {

    constructor(system) {
        this.system = system;
        this.active_state = new State();
        this.root_state = this.active_state;
    }

    reset(){
        this.active_state = new State();
        this.root_state = this.active_state;
    }

    //Stores history as an array of reversable actions.
    addAction(action) {
        
        if (this.active_state.fch) 
            this.seal();
        
        this.active_state.addAction(action);
    }

    seal() {

        const   id = this.active_state.children.length,
                state = new State(id);

        this.active_state.addChild(state);

        this.active_state.progression = id;

        this.active_state = state;
    }

    /**
        Plays the current state's redo methods then advances to the next state. Does nothing if there is no state to advance to.
    **/
    redo() {
        
        let next = this.active_state.children[this.active_state.progression];
        
        if (next) {

            let actions = this.active_state.actions;

            for (let i = 0; i < actions.length; i++) {
                
                let action = actions[i];

                switch (action.type) {
                    case "doc":
                        this.system.docs.redo(action);
                        break;
                }
            }

            this.active_state = next;
        }
    }

    /**
        Degresses to the previous state and then plays that state's undo method. Does nothing if there is no state to sfallback to.
    **/
    undo() {

        const prev = this.active_state.par;

        if (prev) {

            const actions = prev.actions;

            for (let i = 0; i < actions.length; i++) {
                
                const action = actions[i];

                switch (action.type) {
                    case "doc":
                        this.system.docs.undo(action);
                        break; 
                }
            }

            this.active_state = prev;
        }
    }

    async save(file_builder){ 
        const data = {state: this.active_state.id, states: this.root_state.toJSON()};
        
        return await file_builder.writeS(JSON.stringify(data));   
    }

    async load(file_reader, size){
        const data = await file_reader.readS(size);

        const history = JSON.parse(data);

        this.root_state.fromJSON(history.states);

        const state_id = history.state.split(/:/g).map(n=>parseInt(n));

        let node = this.root_state;

        for(let i = 1; i < state_id.length; i++)
            node = node.children[state_id[i]];

        this.active_state = node;
    }
}

HTMLElement.prototype.wick_node = null;


class System {
    constructor() {
        this.docs = new DocumentManager(this);
        this.css = new CSSManager(this.docs);
        this.html = new HTMLManager(this.docs);
        this.mjs = new JSManager(this.docs);
        this.presets = new Presets();
        this.actions = actions;
        this.history = new StateMachine(this);
        this.project = new Project(this);
    }
}

/**
 * @brief Flame exposed object.  
 * @details Contains methods necessary to start a flame session.
 * @return Object
 */
const flame = {
    init: () => {
        const env = require('electron').remote.process.env;
        //Get testing and development flags. 

        const DEV = (env.FLAME_DEV) ? !!env.FLAME_DEV.includes("true") : false;
        const TEST = (env.FLAME_TEST) ? !!env.FLAME_TEST.includes("true") : false;

        if (TEST)
            require("chai").should();

        let system = new System();

        StyleNode$1.prototype.flame_system = system;

        //connect to the ui_group element
        const ui_group = document.querySelector("#ui_group");
        const view_group = document.querySelector("#main_view");

        if (!ui_group)
            throw new Error("`ui_group` element not found in document! Aborting startup.");

        system.ui = new UI_Manager(ui_group, view_group, system);

        if (DEV && !TEST) {
            //Load in the development component.
            let path$$1 = require("path").join(process.cwd(), "assets/components/test.html");
            let doc = system.docs.get(system.docs.loadFile(path$$1));
            actions.CREATE_COMPONENT(system, doc, { x: 200, y: 200 });
            window.flame = flame;
        } else if (TEST) {
            //Load in HTML test runner
            const test_iframe = document.createElement("iframe");
            test_iframe.src = "../../test/chromium/test.html";

            test_iframe.width = "100%";
            test_iframe.height = "100%";

            test_iframe.style.position = "absolute";
            test_iframe.style.left = 0;
            test_iframe.style.top = 0;
            test_iframe.style.zIndex = 100000; // Keep on top
            test_iframe.style.backgroundColor = "rgba(255,255,255,0.90)";
            test_iframe.style.border = "solid 1px black";
            test_iframe.style.borderRadius = "5px";

            document.body.appendChild(test_iframe);

            test_iframe.onload = (e) => {
                test_iframe.contentWindow.require = require;
                test_iframe.contentWindow.fs = require("fs");
                test_iframe.contentWindow.path = require("path");
                test_iframe.contentWindow.run(system, require("chai"));
            };
        }

        //Connect to server or local file system and load projects
        //Check to see if there recently worked on project to open. 
        //Load Poject.
        //If user preference allows, open the Splash screen modal. 
    },

    //Initialize a text editor on element
    initEditor(element) {

        let fw = new TextFramework();
        let io = new TextIO(element);

        io.fw = fw;

        element.addEventListener("mouseup", e => io.onMouseUp(e));
        element.addEventListener("keypress", e => io.onKeyPress(e));
        element.addEventListener("keydown", e => io.onKeyDown(e));
        element.addEventListener("wheel", e => io.onMouseWheel(e));

        return { fw, io };
    }
};

/* Interface files */
//Project Direcctory

module.exports = flame;
//# sourceMappingURL=flame.node.js.map
