var flame = (function () {
	'use strict';

	/*
		Integrates Flame systems into Wick's component.prototype 
	*/
	async function wick_component_integration(integrating_wick, flame_environment){

		const comp = await integrating_wick("<a></a>");

		const component_prototype = comp.constructor.prototype;

		const mount_function = component_prototype.nonAsyncMount;

		//*
		component_prototype.nonAsyncMount = function(...args){
			
			const comp = mount_function.call(this, ...args);

		/* 
			Deprecated - This used to add a little tag to each component that was mounted to the document. When clicked, this tag would open the Flame environment for that specific component. 
		/*/
		/*/
			
			const element = comp.ele;
			
			const flame_tag = document.createElement("div");
			flame_tag.style.width = "8px";
			flame_tag.style.height = "8px";
			flame_tag.style.backgroundColor = "rgb(210,170,60)";

			flame_tag.addEventListener("click", ()=>{
				open_environment(comp, flame_environment);
			});
			//element.appendChild(flame_tag);

		//*/


			return comp;
		};
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
	const e = 101;
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
	const r$1 = 114;
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
	7, 	 	/* NULL */
	7, 	 	/* START_OF_HEADER */
	7, 	 	/* START_OF_TEXT */
	7, 	 	/* END_OF_TXT */
	7, 	 	/* END_OF_TRANSMISSION */
	7, 	 	/* ENQUIRY */
	7, 	 	/* ACKNOWLEDGE */
	7, 	 	/* BELL */
	7, 	 	/* BACKSPACE */
	4, 	 	/* HORIZONTAL_TAB */
	6, 	 	/* LINEFEED */
	7, 	 	/* VERTICAL_TAB */
	7, 	 	/* FORM_FEED */
	5, 	 	/* CARRIAGE_RETURN */
	7, 	 	/* SHIFT_OUT */
	7, 		/* SHIFT_IN */
	11,	 	/* DATA_LINK_ESCAPE */
	7, 	 	/* DEVICE_CTRL_1 */
	7, 	 	/* DEVICE_CTRL_2 */
	7, 	 	/* DEVICE_CTRL_3 */
	7, 	 	/* DEVICE_CTRL_4 */
	7, 	 	/* NEGATIVE_ACKNOWLEDGE */
	7, 	 	/* SYNCH_IDLE */
	7, 	 	/* END_OF_TRANSMISSION_BLOCK */
	7, 	 	/* CANCEL */
	7, 	 	/* END_OF_MEDIUM */
	7, 	 	/* SUBSTITUTE */
	7, 	 	/* ESCAPE */
	7, 	 	/* FILE_SEPERATOR */
	7, 	 	/* GROUP_SEPERATOR */
	7, 	 	/* RECORD_SEPERATOR */
	7, 	 	/* UNIT_SEPERATOR */
	3, 	 	/* SPACE */
	8, 	 	/* EXCLAMATION */
	2, 	 	/* DOUBLE_QUOTE */
	7, 	 	/* HASH */
	7, 	 	/* DOLLAR */
	8, 	 	/* PERCENT */
	8, 	 	/* AMPERSAND */
	2, 	 	/* QUOTE */
	9, 	 	/* OPEN_PARENTH */
	10, 	 /* CLOSE_PARENTH */
	8, 	 	/* ASTERISK */
	8, 	 	/* PLUS */
	7, 	 	/* COMMA */
	7, 	 	/* HYPHEN */
	7, 	 	/* PERIOD */
	7, 	 	/* FORWARD_SLASH */
	0, 	 	/* ZERO */
	0, 	 	/* ONE */
	0, 	 	/* TWO */
	0, 	 	/* THREE */
	0, 	 	/* FOUR */
	0, 	 	/* FIVE */
	0, 	 	/* SIX */
	0, 	 	/* SEVEN */
	0, 	 	/* EIGHT */
	0, 	 	/* NINE */
	8, 	 	/* COLON */
	7, 	 	/* SEMICOLON */
	8, 	 	/* LESS_THAN */
	8, 	 	/* EQUAL */
	8, 	 	/* GREATER_THAN */
	7, 	 	/* QMARK */
	7, 	 	/* AT */
	1, 	 	/* A*/
	1, 	 	/* B */
	1, 	 	/* C */
	1, 	 	/* D */
	1, 	 	/* E */
	1, 	 	/* F */
	1, 	 	/* G */
	1, 	 	/* H */
	1, 	 	/* I */
	1, 	 	/* J */
	1, 	 	/* K */
	1, 	 	/* L */
	1, 	 	/* M */
	1, 	 	/* N */
	1, 	 	/* O */
	1, 	 	/* P */
	1, 	 	/* Q */
	1, 	 	/* R */
	1, 	 	/* S */
	1, 	 	/* T */
	1, 	 	/* U */
	1, 	 	/* V */
	1, 	 	/* W */
	1, 	 	/* X */
	1, 	 	/* Y */
	1, 	 	/* Z */
	9, 	 	/* OPEN_SQUARE */
	7, 	 	/* TILDE */
	10, 	/* CLOSE_SQUARE */
	7, 	 	/* CARET */
	7, 	 	/* UNDER_SCORE */
	2, 	 	/* GRAVE */
	1, 	 	/* a */
	1, 	 	/* b */
	1, 	 	/* c */
	1, 	 	/* d */
	1, 	 	/* e */
	1, 	 	/* f */
	1, 	 	/* g */
	1, 	 	/* h */
	1, 	 	/* i */
	1, 	 	/* j */
	1, 	 	/* k */
	1, 	 	/* l */
	1, 	 	/* m */
	1, 	 	/* n */
	1, 	 	/* o */
	1, 	 	/* p */
	1, 	 	/* q */
	1, 	 	/* r */
	1, 	 	/* s */
	1, 	 	/* t */
	1, 	 	/* u */
	1, 	 	/* v */
	1, 	 	/* w */
	1, 	 	/* x */
	1, 	 	/* y */
	1, 	 	/* z */
	9, 	 	/* OPEN_CURLY */
	7, 	 	/* VERTICAL_BAR */
	10,  	/* CLOSE_CURLY */
	7,  	/* TILDE */
	7 		/* DELETE */
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
	0, 		/* NULL */
	0, 		/* START_OF_HEADER */
	0, 		/* START_OF_TEXT */
	0, 		/* END_OF_TXT */
	0, 		/* END_OF_TRANSMISSION */
	0, 		/* ENQUIRY */
	0,		/* ACKNOWLEDGE */
	0,		/* BELL */
	0,		/* BACKSPACE */
	0,		/* HORIZONTAL_TAB */
	0,		/* LINEFEED */
	0,		/* VERTICAL_TAB */
	0,		/* FORM_FEED */
	0,		/* CARRIAGE_RETURN */
	0,		/* SHIFT_OUT */
	0,		/* SHIFT_IN */
	0,		/* DATA_LINK_ESCAPE */
	0,		/* DEVICE_CTRL_1 */
	0,		/* DEVICE_CTRL_2 */
	0,		/* DEVICE_CTRL_3 */
	0,		/* DEVICE_CTRL_4 */
	0,		/* NEGATIVE_ACKNOWLEDGE */
	0,		/* SYNCH_IDLE */
	0,		/* END_OF_TRANSMISSION_BLOCK */
	0,		/* CANCEL */
	0,		/* END_OF_MEDIUM */
	0,		/* SUBSTITUTE */
	0,		/* ESCAPE */
	0,		/* FILE_SEPERATOR */
	0,		/* GROUP_SEPERATOR */
	0,		/* RECORD_SEPERATOR */
	0,		/* UNIT_SEPERATOR */
	0,		/* SPACE */
	0,		/* EXCLAMATION */
	0,		/* DOUBLE_QUOTE */
	0,		/* HASH */
	0,		/* DOLLAR */
	0,		/* PERCENT */
	0,		/* AMPERSAND */
	0,		/* QUOTE */
	0,		/* OPEN_PARENTH */
	0,		 /* CLOSE_PARENTH */
	0,		/* ASTERISK */
	0,		/* PLUS */
	0,		/* COMMA */
	0,		/* HYPHEN */
	4,		/* PERIOD */
	0,		/* FORWARD_SLASH */
	8,		/* ZERO */
	8,		/* ONE */
	8,		/* TWO */
	8,		/* THREE */
	8,		/* FOUR */
	8,		/* FIVE */
	8,		/* SIX */
	8,		/* SEVEN */
	8,		/* EIGHT */
	8,		/* NINE */
	0,		/* COLON */
	0,		/* SEMICOLON */
	0,		/* LESS_THAN */
	0,		/* EQUAL */
	0,		/* GREATER_THAN */
	0,		/* QMARK */
	0,		/* AT */
	2,		/* A*/
	8,		/* B */
	2,		/* C */
	2,		/* D */
	8,		/* E */
	2,		/* F */
	2,		/* G */
	2,		/* H */
	2,		/* I */
	2,		/* J */
	2,		/* K */
	2,		/* L */
	2,		/* M */
	2,		/* N */
	8,		/* O */
	2,		/* P */
	2,		/* Q */
	2,		/* R */
	2,		/* S */
	2,		/* T */
	2,		/* U */
	2,		/* V */
	2,		/* W */
	8,		/* X */
	2,		/* Y */
	2,		/* Z */
	0,		/* OPEN_SQUARE */
	0,		/* TILDE */
	0,		/* CLOSE_SQUARE */
	0,		/* CARET */
	0,		/* UNDER_SCORE */
	0,		/* GRAVE */
	2,		/* a */
	8,		/* b */
	2,		/* c */
	2,		/* d */
	2,		/* e */
	2,		/* f */
	2,		/* g */
	2,		/* h */
	2,		/* i */
	2,		/* j */
	2,		/* k */
	2,		/* l */
	2,		/* m */
	2,		/* n */
	8,		/* o */
	2,		/* p */
	2,		/* q */
	2,		/* r */
	2,		/* s */
	2,		/* t */
	2,		/* u */
	2,		/* v */
	2,		/* w */
	8,		/* x */
	2,		/* y */
	2,		/* z */
	0,		/* OPEN_CURLY */
	0,		/* VERTICAL_BAR */
	0,		/* CLOSE_CURLY */
	0,		/* TILDE */
	0		/* DELETE */
	];

	const extended_number_and_identifier_table = number_and_identifier_table.slice();
	extended_number_and_identifier_table[45] = 2;
	extended_number_and_identifier_table[95] = 2;

	const
	    number = 1,
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

	const getNumbrOfTrailingZeroBitsFromPowerOf2 = (value) => debruijnLUT[(value * 0x077CB531) >>> 27];

	class Lexer {

	    constructor(string = "", INCLUDE_WHITE_SPACE_TOKENS = false, PEEKING = false) {

	        if (typeof(string) !== "string") throw new Error(`String value must be passed to Lexer. A ${typeof(string)} was passed as the \`string\` argument.`);

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

	        this.USE_EXTENDED_ID = false;

	        /**
	         * Flag to force the lexer to parse string contents
	         */
	        this.PARSE_STRING = false;

	        this.id_lu = number_and_identifier_table;

	        if (!PEEKING) this.next();
	    }

	    useExtendedId(){
	        this.id_lu = extended_number_and_identifier_table;
	        this.tl = 0;
	        this.next();
	        return this;
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
	    copy(destination = new Lexer(this.str, false, true)) {
	        destination.off = this.off;
	        destination.char = this.char;
	        destination.line = this.line;
	        destination.sl = this.sl;
	        destination.masked_values = this.masked_values;
	        destination.id_lu = this.id_lu;
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
	    Creates an error message with a diagram illustrating the location of the error. 
	    */
	    errorMessage(message = "") {
	        const pk = this.copy();

	        pk.IWS = false;

	        while (!pk.END && pk.ty !== Types.nl) { pk.next(); }

	        const end = (pk.END) ? this.str.length : pk.off,

	            nls = (this.line > 0) ? 1 : 0,
	            number_of_tabs = this.str
	                .slice(this.off - this.char + nls + nls, this.off + nls)
	                .split("")
	                .reduce((r, v) => (r + ((v.charCodeAt(0) == HORIZONTAL_TAB) | 0)), 0),

	            arrow = String.fromCharCode(0x2b89),

	            line = String.fromCharCode(0x2500),

	            thick_line = String.fromCharCode(0x2501),

	            line_number = `    ${this.line+1}: `,

	            line_fill = line_number.length + number_of_tabs,

	            line_text = this.str.slice(this.off - this.char + nls + (nls), end).replace(/\t/g, "  "),

	            error_border = thick_line.repeat(line_text.length + line_number.length + 2),

	            is_iws = (!this.IWS) ? "\n The Lexer produced whitespace tokens" : "",

	            msg =[ `${message} at ${this.line+1}:${this.char - nls}` ,
	            `${error_border}` ,
	            `${line_number+line_text}` ,
	            `${line.repeat(this.char-nls+line_fill-(nls))+arrow}` ,
	            `${error_border}` ,
	            `${is_iws}`].join("\n");

	        return msg;
	    }

	    /**
	     * Will throw a new Error, appending the parsed string line and position information to the the error message passed into the function.
	     * @instance
	     * @public
	     * @param {String} message - The error message.
	     * @param {Bool} DEFER - if true, returns an Error object instead of throwing.
	     */
	    throw (message, DEFER = false) {
	        const error = new Error(this.errorMessage(message));
	        if (DEFER)
	            return error;
	        throw error;
	    }

	    /**
	     * Proxy for Lexer.prototype.reset
	     * @public
	     */
	    r() { return this.reset() }

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
	    next(marker = this, USE_CUSTOM_SYMBOLS = !!this.symbol_map) {

	        if (marker.sl < 1) {
	            marker.off = 0;
	            marker.type = 32768;
	            marker.tl = 0;
	            marker.line = 0;
	            marker.char = 0;
	            return marker;
	        }

	        //Token builder
	        const l = marker.sl,
	            str = marker.str,
	            number_and_identifier_table = this.id_lu,
	            IWS = marker.IWS;

	        let length = marker.tl,
	            off = marker.off + length,
	            type = symbol,
	            line = marker.line,
	            base = off,
	            char = marker.char,
	            root = marker.off;

	        if (off >= l) {
	            length = 0;
	            base = l;
	            //char -= base - off;
	            marker.char = char + (base - marker.off);
	            marker.type = type;
	            marker.off = base;
	            marker.tl = 0;
	            marker.line = line;
	            return marker;
	        }

	        let NORMAL_PARSE = true;

	        if (USE_CUSTOM_SYMBOLS) {

	            let code = str.charCodeAt(off);
	            let off2 = off;
	            let map = this.symbol_map,
	                m;
	            let i = 0;

	            while (code == 32 && IWS)
	                (code = str.charCodeAt(++off2), off++);

	            while ((m = map.get(code))) {
	                map = m;
	                off2 += 1;
	                code = str.charCodeAt(off2);
	            }

	            if (map.IS_SYM) {
	                NORMAL_PARSE = false;
	                base = off;
	                length = off2 - off;
	                //char += length;
	            }
	        }

	        if (NORMAL_PARSE) {

	            for (;;) {

	                base = off;

	                length = 1;

	                const code = str.charCodeAt(off);

	                if (code < 128) {

	                    switch (jump_table[code]) {
	                        case 0: //NUMBER
	                            while (++off < l && (12 & number_and_identifier_table[str.charCodeAt(off)]));

	                            if ((str[off] == "e" || str[off] == "E") && (12 & number_and_identifier_table[str.charCodeAt(off + 1)])) {
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
	                            while (++off < l && ((10 & number_and_identifier_table[str.charCodeAt(off)])));
	                            type = identifier;
	                            length = off - base;
	                            break;
	                        case 2: //QUOTED STRING
	                            if (this.PARSE_STRING) {
	                                type = symbol;
	                            } else {
	                                while (++off < l && str.charCodeAt(off) !== code);
	                                type = string;
	                                length = off - base + 1;
	                            }
	                            break;
	                        case 3: //SPACE SET
	                            while (++off < l && str.charCodeAt(off) === SPACE);
	                            type = white_space;
	                            length = off - base;
	                            break;
	                        case 4: //TAB SET
	                            while (++off < l && str[off] === HORIZONTAL_TAB);
	                            type = white_space;
	                            length = off - base;
	                            break;
	                        case 5: //CARIAGE RETURN
	                            length = 2;
	                            //intentional
	                        case 6: //LINEFEED
	                            type = new_line;
	                            line++;
	                            base = off;
	                            root = off;
	                            off += length;
	                            char = 0;
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
	                } else {
	                    break;
	                }

	                if (IWS && (type & white_space_new_line)) {
	                    if (off < l) {
	                        type = symbol;
	                        //off += length;
	                        continue;
	                    } else {
	                        //Trim white space from end of string
	                        //base = l - off;
	                        //marker.sl -= off;
	                        //length = 0;
	                    }
	                }
	                break;
	            }
	        }

	        marker.type = type;
	        marker.off = base;
	        marker.tl = (this.masked_values & CHARACTERS_ONLY_MASK) ? Math.min(1, length) : length;
	        marker.char = char + base - root;
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
	    aC(char) { return this.assertCharacter(char) }
	    /**
	     * Compares the character value of the current token to the value passed in. Advances to next token if the two are equal.
	     * @public
	     * @throws {Error} - `Expecting "${text}" got "${this.text}"`
	     * @param {String} text - The string to compare.
	     */
	    assertCharacter(char) {

	        if (this.off < 0) this.throw(`Expecting ${char[0]} got null`);

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
	    s(start) { return this.slice(start) }

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
	                const IWS = marker.IWS;
	                while (marker.next().ty != Types.new_line && !marker.END) { /* NO OP */ }
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

	    toString() {
	        return this.slice();
	    }

	    /**
	     * Returns new Whind Lexer that has leading and trailing whitespace characters removed from input. 
	     * leave_leading_amount - Maximum amount of leading space caracters to leave behind. Default is zero
	     * leave_trailing_amount - Maximum amount of trailing space caracters to leave behind. Default is zero
	     */
	    trim(leave_leading_amount = 0, leave_trailing_amount = leave_leading_amount) {
	        const lex = this.copy();

	        let space_count = 0,
	            off = lex.off;

	        for (; lex.off < lex.sl; lex.off++) {
	            const c = jump_table[lex.string.charCodeAt(lex.off)];

	            if (c > 2 && c < 7) {

	                if (space_count >= leave_leading_amount) {
	                    off++;
	                } else {
	                    space_count++;
	                }
	                continue;
	            }

	            break;
	        }

	        lex.off = off;
	        space_count = 0;
	        off = lex.sl;

	        for (; lex.sl > lex.off; lex.sl--) {
	            const c = jump_table[lex.string.charCodeAt(lex.sl - 1)];

	            if (c > 2 && c < 7) {
	                if (space_count >= leave_trailing_amount) {
	                    off--;
	                } else {
	                    space_count++;
	                }
	                continue;
	            }

	            break;
	        }

	        lex.sl = off;

	        if (leave_leading_amount > 0)
	            lex.IWS = false;

	        lex.token_length = 0;

	        lex.next();

	        return lex;
	    }

	    /** Adds symbol to symbol_map. This allows custom symbols to be defined and tokenized by parser. **/
	    addSymbol(sym) {
	        if (!this.symbol_map)
	            this.symbol_map = new Map;


	        let map = this.symbol_map;

	        for (let i = 0; i < sym.length; i++) {
	            let code = sym.charCodeAt(i);
	            let m = map.get(code);
	            if (!m) {
	                m = map.set(code, new Map).get(code);
	            }
	            map = m;
	        }
	        map.IS_SYM = true;
	    }

	    /*** Getters and Setters ***/
	    get string() {
	        return this.str;
	    }

	    get string_length() {
	        return this.sl - this.off;
	    }

	    set string_length(s) {}

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
	    get tx() { return this.text }

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
	    get ty() { return this.type }

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
	    get pk() { return this.peek() }

	    /**
	     * Proxy for Lexer.prototype.next
	     * @public
	     */
	    get n() { return this.next() }

	    get END() { return this.off >= this.sl }
	    set END(v) {}

	    get type() {
	        return 1 << (this.masked_values & TYPE_MASK);
	    }

	    set type(value) {
	        //assuming power of 2 value.
	        this.masked_values = (this.masked_values & ~TYPE_MASK) | ((getNumbrOfTrailingZeroBitsFromPowerOf2(value)) & TYPE_MASK);
	    }

	    get tl() {
	        return this.token_length;
	    }

	    set tl(value) {
	        this.token_length = value;
	    }

	    get token_length() {
	        return ((this.masked_values & TOKEN_LENGTH_MASK) >> 7);
	    }

	    set token_length(value) {
	        this.masked_values = (this.masked_values & ~TOKEN_LENGTH_MASK) | (((value << 7) | 0) & TOKEN_LENGTH_MASK);
	    }

	    get IGNORE_WHITE_SPACE() {
	        return this.IWS;
	    }

	    set IGNORE_WHITE_SPACE(bool) {
	        this.iws = !!bool;
	    }

	    get CHARACTERS_ONLY() {
	        return !!(this.masked_values & CHARACTERS_ONLY_MASK);
	    }

	    set CHARACTERS_ONLY(boolean) {
	        this.masked_values = (this.masked_values & ~CHARACTERS_ONLY_MASK) | ((boolean | 0) << 6);
	    }

	    get IWS() {
	        return !!(this.masked_values & IGNORE_WHITESPACE_MASK);
	    }

	    set IWS(boolean) {
	        this.masked_values = (this.masked_values & ~IGNORE_WHITESPACE_MASK) | ((boolean | 0) << 5);
	    }

	    get PARSE_STRING() {
	        return !!(this.masked_values & PARSE_STRING_MASK);
	    }

	    set PARSE_STRING(boolean) {
	        this.masked_values = (this.masked_values & ~PARSE_STRING_MASK) | ((boolean | 0) << 4);
	    }

	    /**
	     * Reference to token id types.
	     */
	    get types() {
	        return Types;
	    }
	}

	Lexer.prototype.addCharacter = Lexer.prototype.addSymbol;

	function whind$1(string, INCLUDE_WHITE_SPACE_TOKENS = false) { return new Lexer(string, INCLUDE_WHITE_SPACE_TOKENS) }

	whind$1.constructor = Lexer;

	Lexer.types = Types;
	whind$1.types = Types;

	let fn = {}; const 
	/************** Maps **************/

	    /* Symbols To Inject into the Lexer */
	    symbols = ["||","^=","$=","*=","<=",">="],

	    /* Goto lookup maps */
	    gt0 = [0,-1,4,2,7,3,1,10,8,-2,9,-5,5,-1,37,-4,38,-9,36,-38,12,15,-1,34,16,13,-1,14,21,18,17,25,26,27,-1,28,-3,29,35,-9,23,-3,20],
	gt1 = [0,-1,40,-1,7,39,-1,10,8,-2,9,-5,5,-1,37,-4,38,-9,36,-38,12,15,-1,34,16,13,-1,14,21,18,17,25,26,27,-1,28,-3,29,35,-9,23,-3,20],
	gt2 = [0,-3,41,-2,10,8,-2,9,-5,42,-1,37,-4,38,-9,36,-38,12,15,-1,34,16,13,-1,14,21,18,17,25,26,27,-1,28,-3,29,35,-9,23,-3,20],
	gt3 = [0,-10,52,-5,42,-1,37,-4,38,-9,36,-59,53,-1,51,50,-1,54,-3,23,-3,55],
	gt4 = [0,-70,57,56,-1,15,-1,34,16,59,58,14,21,18,17,25,26,27,-1,28,-3,29,35,-9,23,-3,20],
	gt5 = [0,-73,64,-1,34,65,-6,25,26,27,-1,28,-3,29,35],
	gt6 = [0,-75,34,66,-6,67,26,27,-1,28,-3,29,35],
	gt7 = [0,-75,68,-16,35],
	gt8 = [0,-102,23,-3,71],
	gt9 = [0,-103,75,73,74],
	gt10 = [0,-102,23,-3,81],
	gt11 = [0,-102,23,-3,82],
	gt12 = [0,-80,21,84,83,-19,23,-3,20],
	gt13 = [0,-91,87,-10,23,-3,86],
	gt14 = [0,-74,89,-16,90],
	gt15 = [0,-11,94,95,-53,98,-2,97],
	gt16 = [0,-32,102,-1,105,-1,103,107,104,109,-2,110,-2,108,111,-1,114,-3,115,-8,106,-40,23,-3,116],
	gt17 = [0,-19,118,-49,120],
	gt18 = [0,-27,121,123,125,128,127,-20,126,-49,23,-3,130],
	gt19 = [0,-10,52,-5,42,-1,37,-4,38,-9,36,-59,53,-1,51,131,-1,54,-3,23,-3,55],
	gt20 = [0,-72,132,15,-1,34,16,13,-1,14,21,18,17,25,26,27,-1,28,-3,29,35,-9,23,-3,20],
	gt21 = [0,-10,135,-5,42,-1,37,-4,38,-9,36,-59,53,-1,136,-2,54,-3,23,-3,55],
	gt22 = [0,-70,139,-2,15,-1,34,16,59,58,14,21,18,17,25,26,27,-1,28,-3,29,35,-9,23,-3,20],
	gt23 = [0,-73,15,-1,34,16,140,-1,14,21,18,17,25,26,27,-1,28,-3,29,35,-9,23,-3,20],
	gt24 = [0,-75,34,141,-6,67,26,27,-1,28,-3,29,35],
	gt25 = [0,-91,87],
	gt26 = [0,-103,143,-1,142],
	gt27 = [0,-88,145],
	gt28 = [0,-90,151],
	gt29 = [0,-102,23,-3,86],
	gt30 = [0,-91,153],
	gt31 = [0,-12,154,-53,98,-2,97],
	gt32 = [0,-14,156,-17,157,-1,105,-1,103,107,104,109,-2,110,-2,108,111,-1,114,-3,115,-8,106,-40,23,-3,116],
	gt33 = [0,-68,159],
	gt34 = [0,-68,161],
	gt35 = [0,-61,165,-40,23,-3,166],
	gt36 = [0,-35,167],
	gt37 = [0,-40,171,169,-1,173,170],
	gt38 = [0,-46,175,-1,114,-3,115,-49,23,-3,130],
	gt39 = [0,-37,107,176,109,-2,110,-2,108,111,177,114,-3,115,180,-3,182,184,181,183,-1,187,-2,186,-36,23,-3,178],
	gt40 = [0,-28,191,125,128,127,-20,126,-49,23,-3,130],
	gt41 = [0,-24,194,193,192],
	gt42 = [0,-27,197,123,125,128,127,-20,126,-45,198,-3,23,-3,199],
	gt43 = [0,-93,205,-4,54,-3,23,-3,55],
	gt44 = [0,-99,209,207,206],
	gt45 = [0,-86,213,-15,23,-3,214],
	gt46 = [0,-72,217,15,-1,34,16,13,-1,14,21,18,17,25,26,27,-1,28,-3,29,35,-9,23,-3,20],
	gt47 = [0,-14,218,-17,219,-1,105,-1,103,107,104,109,-2,110,-2,108,111,-1,114,-3,115,-8,106,-40,23,-3,116],
	gt48 = [0,-32,220,-1,105,-1,103,107,104,109,-2,110,-2,108,111,-1,114,-3,115,-8,106,-40,23,-3,116],
	gt49 = [0,-69,225],
	gt50 = [0,-6,10,228,227,226,-62,12,15,-1,34,16,13,-1,14,21,18,17,25,26,27,-1,28,-3,29,35,-9,23,-3,20],
	gt51 = [0,-34,105,-1,229,107,104,109,-2,110,-2,108,111,-1,114,-3,115,-8,106,-40,23,-3,116],
	gt52 = [0,-35,230],
	gt53 = [0,-37,231,-1,109,-2,110,-3,232,-1,114,-3,115,-49,23,-3,130],
	gt54 = [0,-40,233],
	gt55 = [0,-43,234],
	gt56 = [0,-46,235,-1,114,-3,115,-49,23,-3,130],
	gt57 = [0,-46,236,-1,114,-3,115,-49,23,-3,130],
	gt58 = [0,-49,241,-1,239],
	gt59 = [0,-54,245],
	gt60 = [0,-54,251,252,253],
	gt61 = [0,-64,258],
	gt62 = [0,-49,241,-1,263],
	gt63 = [0,-17,265,-2,267,266,268,-40,271],
	gt64 = [0,-6,10,228,227,273,-62,12,15,-1,34,16,13,-1,14,21,18,17,25,26,27,-1,28,-3,29,35,-9,23,-3,20],
	gt65 = [0,-24,194,274],
	gt66 = [0,-28,275,125,128,127,-20,126,-49,23,-3,130],
	gt67 = [0,-72,278,15,-1,34,16,13,-1,14,21,18,17,25,26,27,-1,28,-3,29,35,-9,23,-3,20],
	gt68 = [0,-97,280,-1,209,207,281],
	gt69 = [0,-99,283],
	gt70 = [0,-99,209,207,284],
	gt71 = [0,-89,285],
	gt72 = [0,-32,290,-1,105,-1,103,107,104,109,-2,110,-2,108,111,-1,114,-3,115,-8,106,-40,23,-3,116],
	gt73 = [0,-13,291,-13,292,123,125,128,127,-20,126,-45,293,-3,23,-3,294],
	gt74 = [0,-6,10,297,-64,12,15,-1,34,16,13,-1,14,21,18,17,25,26,27,-1,28,-3,29,35,-9,23,-3,20],
	gt75 = [0,-40,171,169],
	gt76 = [0,-49,299],
	gt77 = [0,-58,300,-1,301,-1,187,-2,186,-36,23,-3,302],
	gt78 = [0,-58,303,-1,301,-1,187,-2,186,-36,23,-3,302],
	gt79 = [0,-60,304,-41,23,-3,302],
	gt80 = [0,-102,23,-3,305],
	gt81 = [0,-102,23,-3,306],
	gt82 = [0,-20,267,310,268,-40,271],
	gt83 = [0,-99,209,207,281],
	gt84 = [0,-55,320],
	gt85 = [0,-56,323],
	gt86 = [0,-10,52,-5,42,-1,37,-4,38,-9,36,-59,53,-1,51,326,-1,54,-3,23,-3,55],
	gt87 = [0,-22,327,-40,271],
	gt88 = [0,-58,328,-1,301,-1,187,-2,186,-36,23,-3,302],
	gt89 = [0,-58,329,-1,301,-1,187,-2,186,-36,23,-3,302],

	    // State action lookup maps
	    sm0=[0,1,-1,2,-1,0,-4,0,-6,3,-6,4,-31,5,6,7,8,-1,9,-9,10],
	sm1=[0,11,-3,0,-4,0],
	sm2=[0,12,-1,2,-1,0,-4,0,-6,3,-6,4,-31,5,6,7,8,-1,9,-9,10],
	sm3=[0,13,-1,2,-1,0,-4,0,-6,3,-6,4,-31,5,6,7,8,-1,9,-9,10],
	sm4=[0,14,-1,14,-1,0,-4,0,-6,14,-6,14,-31,14,14,14,14,-1,14,-9,14],
	sm5=[0,15,-1,15,-1,0,-4,0,-6,15,-6,15,-31,15,15,15,15,-1,15,-6,16,-2,15],
	sm6=[0,-4,0,-4,0,-10,17,-3,18,19,-7,20],
	sm7=[0,21,-1,21,-1,0,-4,0,-6,21,-6,21,-31,21,21,21,21,-1,21,-9,21],
	sm8=[0,22,-1,22,-1,0,-4,0,-6,22,-6,22,-31,22,22,22,22,-1,22,-9,22],
	sm9=[0,-4,0,-4,0,-5,23,24],
	sm10=[0,-2,2,-1,0,-4,0,-13,4],
	sm11=[0,-4,0,-4,0,-5,25,25],
	sm12=[0,-2,2,-1,0,-4,0,-5,26,26,-5,26,-15,27,-12,28,29,30,-1,5,6,7,8,-1,9,-9,10],
	sm13=[0,-2,31,-1,0,-4,0,-5,31,31,-5,31,-15,31,-12,31,31,31,-1,31,31,7,8,-1,9,-9,10],
	sm14=[0,-2,31,-1,0,-4,0,-5,31,31,-5,31,-15,31,-12,31,31,31,-1,31,31,31,31,-1,31,-9,32],
	sm15=[0,-2,33,-1,0,-4,0,-5,33,33,-5,33,-15,33,-12,33,33,33,-1,33,33,33,33,-1,33,-9,33],
	sm16=[0,-2,2,-1,0,-4,0,-45,34],
	sm17=[0,-2,35,-1,0,-4,0,-5,35,35,-5,35,-15,35,-12,35,35,35,-1,35,36,35,35,-1,35,-9,35],
	sm18=[0,-2,37,-1,0,-4,0,-5,37,37,-5,37,-15,37,-2,37,-9,37,37,37,-1,37,36,37,37,-1,37,37,37,37,37,-5,37],
	sm19=[0,-4,0,-4,0,-46,38],
	sm20=[0,-2,39,-1,0,-4,0,-45,39],
	sm21=[0,40,-1,41,-1,42,-4,43,-3,40,-1,40,40,-4,40,40,40,-5,40,-7,40,40,40,40,40,-9,40,40,40,-1,40,40,40,40,-1,40,40,40,40,40,40,40,40,-2,40,-1,44,45],
	sm22=[0,46,-1,46,-1,46,-4,46,-3,46,-1,46,46,-4,46,46,46,-5,46,-7,46,46,46,46,46,-9,46,46,46,-1,46,46,46,46,-1,46,46,46,46,46,46,46,46,-2,46,-1,46,46],
	sm23=[0,-2,47,-1,0,-4,0,-5,47,47,-5,47,-15,47,-12,47,47,47,-1,47,47,47,47,-1,47,-9,47],
	sm24=[0,-2,48,-1,0,-4,0,-5,48,48,-5,48,-15,48,-12,48,48,48,-1,48,48,48,48,-1,48,-9,48],
	sm25=[0,-2,2,-1,0,-4,0],
	sm26=[0,-2,2,-1,0,-4,0,-45,49,6],
	sm27=[0,-2,2,-1,0,-4,0,-60,50],
	sm28=[0,-2,51,-1,0,-4,0,-5,51,51,-5,51,-15,51,-12,51,51,51,-1,51,51,51,51,-1,51,-9,51],
	sm29=[0,-2,52,-1,0,-4,0,-5,52,52,-5,52,-15,52,-12,52,52,52,-1,52,52,52,52,-1,52,-9,50],
	sm30=[0,-4,0,-4,0,-57,53],
	sm31=[0,-4,0,-4,0,-57,54],
	sm32=[0,-4,0,-4,0,-57,55],
	sm33=[0,56,-1,2,-1,0,-4,0,-6,3,-6,4,-31,5,6,7,8,-1,9,-9,10],
	sm34=[0,57,-1,57,-1,0,-4,0,-6,57,-6,57,-31,57,57,57,57,-1,57,-9,57],
	sm35=[0,58,-1,58,-1,0,-4,0,-6,58,-6,58,-31,58,58,58,58,-1,58,-9,58],
	sm36=[0,-4,0,-4,0,-57,16],
	sm37=[0,59,-1,59,-1,0,-4,0,-6,59,-1,59,-4,59,-31,59,59,59,59,-1,59,-6,59,-2,59],
	sm38=[0,-4,60,-4,0,-38,61,62,63],
	sm39=[0,-2,2,-1,0,-4,0,-11,64,-9,65,-2,66],
	sm40=[0,-4,0,-4,0,-16,67,-22,62,63],
	sm41=[0,-2,2,-1,0,-4,68,-11,69,-9,70],
	sm42=[0,-2,2,-1,0,-4,0,-45,5,6,7,8,-1,9,-9,10],
	sm43=[0,-2,2,-1,0,-4,0,-8,71,-4,4,-43,72],
	sm44=[0,-2,73,-1,0,-4,0,-8,73,-4,73,-43,74],
	sm45=[0,-2,73,-1,0,-4,0,-8,73,-4,73,-43,73],
	sm46=[0,-2,75,-1,0,-4,0,-8,75,-4,75,-43,75],
	sm47=[0,-2,76,-1,0,-4,0,-8,76,-4,76,-43,76],
	sm48=[0,-4,0,-4,0,-60,77],
	sm49=[0,-2,2,-1,0,-4,0,-5,78,78,-5,78,-15,27,-12,28,29,30,-1,5,6,7,8,-1,9,-9,10],
	sm50=[0,-2,79,-1,0,-4,0,-5,79,79,-5,79,-15,79,-12,79,79,79,-1,79,79,79,79,-1,79,-9,79],
	sm51=[0,-2,80,-1,0,-4,0,-5,80,80,-5,80,-15,80,-12,80,80,80,-1,80,80,80,80,-1,80,-9,80],
	sm52=[0,-2,81,-1,0,-4,0,-45,81,81,81,81,-1,81,-9,81],
	sm53=[0,-2,82,-1,0,-4,0,-5,82,82,-5,82,-15,82,-12,82,82,82,-1,82,82,7,8,-1,9,-9,10],
	sm54=[0,-2,82,-1,0,-4,0,-5,82,82,-5,82,-15,82,-12,82,82,82,-1,82,82,82,82,-1,82,-9,32],
	sm55=[0,-2,83,-1,0,-4,0,-5,83,83,-5,83,-15,83,-12,83,83,83,-1,83,83,83,83,-1,83,-9,83],
	sm56=[0,-2,84,-1,0,-4,0,-5,84,84,-5,84,-15,84,-12,84,84,84,-1,84,84,84,84,-1,84,-9,84],
	sm57=[0,-4,0,-4,0,-60,50],
	sm58=[0,-2,85,-1,0,-4,0,-5,85,85,-5,85,-15,85,-12,85,85,85,-1,85,85,85,85,-1,85,-9,85],
	sm59=[0,-2,86,-1,0,-4,0,-5,86,86,-5,86,-15,86,-2,86,-9,86,86,86,-1,86,86,86,86,-1,86,86,86,86,86,-5,86],
	sm60=[0,-2,87,-1,0,-4,0,-45,87],
	sm61=[0,88,-1,41,-1,42,-4,43,-3,88,-1,88,88,-4,88,88,88,-5,88,-7,88,88,88,88,88,-9,88,88,88,-1,88,88,88,88,-1,88,88,88,88,88,88,88,88,-2,88,-1,44,45],
	sm62=[0,89,-1,89,-1,89,-4,0,-3,89,-1,89,89,-4,89,89,89,-5,89,-7,89,89,89,89,89,-9,89,89,89,-1,89,89,89,89,-1,89,89,89,89,89,89,89,89,-2,89],
	sm63=[0,90,-1,90,-1,90,-4,90,-3,90,-1,90,90,-4,90,90,90,-5,90,-7,90,90,90,90,90,-9,90,90,90,-1,90,90,90,90,-1,90,90,90,90,90,90,90,90,-2,90,-1,90,90],
	sm64=[0,91,-1,91,-1,91,-4,91,-3,91,-1,91,91,-4,91,91,91,-5,91,-7,91,91,91,91,91,-9,91,91,91,-1,91,91,91,91,-1,91,91,91,91,91,91,91,91,-2,91,-1,91,91],
	sm65=[0,92,-1,92,-1,92,-4,0,-3,92,-1,92,92,-4,92,92,92,-5,92,-7,92,92,92,92,92,-9,92,92,92,-1,92,92,92,92,-1,92,92,92,92,92,92,92,92,-2,92],
	sm66=[0,-2,93,-1,0,-4,0,-5,93,93,-5,93,-15,93,-12,93,93,93,-1,93,93,93,93,-1,93,-9,93],
	sm67=[0,-2,94,-1,0,-4,0,-5,94,94,-5,94,-15,94,-12,94,94,94,-1,94,94,94,94,-1,94,-9,94],
	sm68=[0,-4,0,-4,0,-31,95,-10,96,-8,97,98,99,100],
	sm69=[0,-4,0,-4,0,-46,36],
	sm70=[0,-2,101,-1,0,-4,0,-5,101,101,-4,102,101,-15,101,-12,101,101,101,-1,101,101,101,101,-1,101,-9,101],
	sm71=[0,-2,103,-1,0,-4,0,-5,103,103,-5,103,-15,103,-12,103,103,103,-1,103,103,103,103,-1,103,-9,103],
	sm72=[0,-2,104,-1,0,-4,0,-5,104,104,-5,104,-15,104,-12,104,104,104,-1,104,104,104,104,-1,104,-9,50],
	sm73=[0,-2,105,-1,0,-4,0,-5,105,105,-5,105,-15,105,-12,105,105,105,-1,105,105,105,105,-1,105,-9,105],
	sm74=[0,-4,106,-4,0,-38,61,62,63],
	sm75=[0,107,-1,2,-1,0,-4,0,-6,107,-3,108,64,-1,107,-7,65,-2,66,-20,107,107,107,107,-1,107,-6,107,-2,107],
	sm76=[0,-4,109,-4,0,-38,109,109,109],
	sm77=[0,110,-1,110,-1,0,-4,0,-6,110,-3,110,110,-1,110,-7,110,-2,110,-20,110,110,110,110,-1,110,-6,110,-2,110],
	sm78=[0,-4,0,-4,0,-3,111],
	sm79=[0,-4,0,-4,0,-11,112],
	sm80=[0,-4,0,-4,0,-5,113,114],
	sm81=[0,115,-1,115,-1,0,-4,0,-5,115,115,-6,115,-31,115,115,115,115,-1,115,-6,115,-2,115],
	sm82=[0,116,-1,116,-1,0,-4,0,-5,116,116,-6,116,-31,116,116,116,116,-1,116,-6,116,-2,116],
	sm83=[0,116,-1,116,-1,0,-4,0,-5,116,116,-6,116,-5,117,-25,116,116,116,116,-1,116,-6,116,-2,116],
	sm84=[0,118,-1,118,-1,0,-4,0,-5,118,118,-5,118,118,-31,118,118,118,118,-1,118,-6,118,-2,118],
	sm85=[0,119,-1,119,-1,0,-4,0,-5,119,119,-5,119,119,-31,119,119,119,119,-1,119,-6,119,-2,119],
	sm86=[0,119,-1,119,-1,0,-4,0,-5,119,119,-5,119,119,-5,120,121,-24,119,119,119,119,-1,119,-6,119,-2,119],
	sm87=[0,-2,2,-1,0,-4,0,-11,64],
	sm88=[0,-1,122,2,-1,0,-4,0,-11,64,-9,123],
	sm89=[0,124,-1,124,-1,0,-4,0,-5,124,124,-5,124,124,-5,124,124,-24,124,124,124,124,-1,124,-6,124,-2,124],
	sm90=[0,125,-1,125,-1,0,-4,0,-5,125,125,-4,126,-1,125,-5,125,-25,125,125,125,125,-1,125,-6,125,-2,125],
	sm91=[0,-2,127,-1,0,-4,0],
	sm92=[0,-4,0,-4,0,-6,128],
	sm93=[0,-4,0,-4,0,-6,129],
	sm94=[0,-4,0,-4,0,-6,130],
	sm95=[0,-2,2,-1,0,-4,68,-11,69],
	sm96=[0,-4,0,-4,0,-6,131,-5,131,-6,132,133],
	sm97=[0,-4,0,-4,0,-6,134,-5,134,-6,134,134],
	sm98=[0,-4,0,-4,0,-6,135,-5,135,-6,135,135],
	sm99=[0,-4,0,-4,0,-11,136],
	sm100=[0,-4,0,-4,0,-11,126],
	sm101=[0,-2,2,-1,0,-4,0,-8,137,-4,4,-43,138],
	sm102=[0,-4,0,-4,0,-5,139,139],
	sm103=[0,-4,0,-4,0,-8,140],
	sm104=[0,141,-1,141,-1,0,-4,0,-6,141,-1,141,-4,141,-31,141,141,141,141,-1,141,-9,141],
	sm105=[0,-2,142,-1,0,-4,0,-8,142,-4,142,-43,142],
	sm106=[0,-2,143,-1,0,-4,0,-8,143,-4,143,-43,144],
	sm107=[0,-2,2,-1,0,-4,0,-8,145,-4,145,-43,145],
	sm108=[0,-2,146,-1,147,-4,0,-3,148,-7,149],
	sm109=[0,-2,150,-1,0,-4,0,-5,150,150,-5,150,-15,150,-12,150,150,150,-1,150,150,150,150,-1,150,-9,150],
	sm110=[0,-2,151,-1,0,-4,0,-5,151,151,-5,151,-15,151,-12,151,151,151,-1,151,151,151,151,-1,151,-9,151],
	sm111=[0,-2,152,-1,0,-4,0,-5,152,152,-5,152,-15,152,-12,152,152,152,-1,152,152,152,152,-1,152,-9,32],
	sm112=[0,153,-1,153,-1,153,-4,0,-3,153,-1,153,153,-4,153,153,153,-5,153,-7,153,153,153,153,153,-9,153,153,153,-1,153,153,153,153,-1,153,153,153,153,153,153,153,153,-2,153],
	sm113=[0,154,-1,154,-1,154,-4,154,-3,154,-1,154,154,-4,154,154,154,-5,154,-7,154,154,154,154,154,-9,154,154,154,-1,154,154,154,154,-1,154,154,154,154,154,154,154,154,-2,154,-1,154,154],
	sm114=[0,-2,155,-1,0,-4,0,-5,155,155,-5,155,-15,155,-12,155,155,155,-1,155,155,155,155,-1,155,-9,155],
	sm115=[0,-2,2,156,0,-4,0],
	sm116=[0,-4,0,-4,0,-31,157],
	sm117=[0,-2,158,158,0,-4,0],
	sm118=[0,-2,159,-1,0,-4,0,-5,159,159,-5,159,-15,159,-12,159,159,159,-1,159,159,159,159,-1,159,-9,159],
	sm119=[0,-2,160,-1,0,-4,0,-5,160,160,-5,160,-15,160,-12,160,160,160,-1,160,160,160,160,-1,160,-9,160],
	sm120=[0,161,-1,2,-1,0,-4,0,-6,161,-3,108,64,-1,161,-7,65,-2,66,-20,161,161,161,161,-1,161,-6,161,-2,161],
	sm121=[0,-4,162,-4,0,-38,162,162,162],
	sm122=[0,161,-1,2,-1,0,-4,0,-6,161,-4,64,-1,161,-7,65,-2,66,-20,161,161,161,161,-1,161,-6,161,-2,161],
	sm123=[0,161,-1,161,-1,0,-4,0,-5,113,161,-6,161,-31,161,161,161,161,-1,161,-6,161,-2,161],
	sm124=[0,-4,0,-4,0,-11,163],
	sm125=[0,-4,0,-4,0,-3,164,-35,165],
	sm126=[0,-4,0,-4,0,-3,166,-35,166,166],
	sm127=[0,-4,0,-4,0,-3,164,-36,167],
	sm128=[0,-4,0,-4,0,-39,62,63],
	sm129=[0,-2,2,-1,0,-4,0,-6,3,-1,168,-36,5,6,7,8,-1,9,-9,10],
	sm130=[0,169,-1,169,-1,0,-4,0,-5,169,169,-6,169,-5,117,-25,169,169,169,169,-1,169,-6,169,-2,169],
	sm131=[0,125,-1,125,-1,0,-4,0,-5,125,125,-6,125,-5,125,-25,125,125,125,125,-1,125,-6,125,-2,125],
	sm132=[0,169,-1,169,-1,0,-4,0,-5,169,169,-6,169,-31,169,169,169,169,-1,169,-6,169,-2,169],
	sm133=[0,-2,2,-1,0,-4,0,-11,64,-9,123],
	sm134=[0,170,-1,170,-1,0,-4,0,-5,170,170,-5,170,170,-5,120,-25,170,170,170,170,-1,170,-6,170,-2,170],
	sm135=[0,171,-1,171,-1,0,-4,0,-5,171,171,-5,171,171,-6,121,-24,171,171,171,171,-1,171,-6,171,-2,171],
	sm136=[0,172,-1,172,-1,0,-4,0,-5,172,172,-5,172,172,-5,172,-25,172,172,172,172,-1,172,-6,172,-2,172],
	sm137=[0,173,-1,173,-1,0,-4,0,-5,173,173,-5,173,173,-6,173,-24,173,173,173,173,-1,173,-6,173,-2,173],
	sm138=[0,174,-1,174,-1,0,-4,0,-5,174,174,-5,174,174,-31,174,174,174,174,-1,174,-6,174,-2,174],
	sm139=[0,-4,0,-4,0,-12,175],
	sm140=[0,-4,0,-4,0,-12,176],
	sm141=[0,-4,177,-4,0,-3,178,-7,126,179,-14,180,180,180,180,180,-28,180],
	sm142=[0,-4,0,-4,0,-12,181],
	sm143=[0,-4,0,-4,0,-27,182,183,184,185,186,-28,187],
	sm144=[0,-4,0,-4,0,-27,188,189,190,191,186],
	sm145=[0,-4,0,-4,0,-12,192,-14,192,192,192,192,192,-1,193,-1,194,195,196],
	sm146=[0,-4,0,-4,0,-12,192,-14,192,192,192,192,192],
	sm147=[0,-4,177,-4,0,-3,178,-8,197],
	sm148=[0,-1,198,-2,0,-4,0,-17,199,200],
	sm149=[0,-4,0,-4,0,-6,201,-5,201],
	sm150=[0,-4,0,-4,0,-6,201,-5,201,-6,132,133],
	sm151=[0,-4,0,-4,0,-6,202,-5,202,-6,202,202],
	sm152=[0,-2,203,-1,0,-4,203,-11,203],
	sm153=[0,-4,0,-4,0,-12,204],
	sm154=[0,-4,0,-4,0,-12,205],
	sm155=[0,-4,177,-4,0,-3,178,-7,126,179,-47,77],
	sm156=[0,-4,0,-4,0,-8,206],
	sm157=[0,207,-1,207,-1,0,-4,0,-6,207,-1,207,-4,207,-31,207,207,207,207,-1,207,-9,207],
	sm158=[0,208,-1,208,-1,0,-4,0,-6,208,-1,208,-4,208,-31,208,208,208,208,-1,208,-9,208],
	sm159=[0,-2,2,-1,0,-4,0,-8,209,-4,209,-43,209],
	sm160=[0,-2,210,-1,0,-4,0,-8,210,-4,210,-43,210],
	sm161=[0,-2,146,-1,147,-4,0,-3,148,-4,211,-2,149,211,211,-43,211,212],
	sm162=[0,-2,146,-1,147,-4,0,-3,148,-4,213,-2,213,213,213,-43,213,213],
	sm163=[0,-2,214,-1,214,-4,0,-3,214,-4,214,-2,214,214,214,-43,214,214],
	sm164=[0,-2,215,-1,215,-4,0,-3,215,-4,215,-2,215,215,215,-43,215,215],
	sm165=[0,-4,0,-4,0,-51,216,-3,217,218],
	sm166=[0,-4,0,-4,0,-51,219,-3,219,219],
	sm167=[0,-2,220,220,0,-4,0],
	sm168=[0,-4,0,-4,0,-12,221],
	sm169=[0,222,-1,2,-1,0,-4,0,-6,222,-4,64,-1,222,-7,65,-2,66,-20,222,222,222,222,-1,222,-6,222,-2,222],
	sm170=[0,222,-1,222,-1,0,-4,0,-5,113,222,-6,222,-31,222,222,222,222,-1,222,-6,222,-2,222],
	sm171=[0,223,-1,223,-1,0,-4,0,-6,223,-3,223,223,223,223,-7,223,-2,223,-20,223,223,223,223,-1,223,-6,223,-2,223],
	sm172=[0,-4,0,-4,0,-3,224,-35,224,224],
	sm173=[0,-4,0,-4,0,-12,225],
	sm174=[0,-4,0,-4,0,-8,226],
	sm175=[0,-2,2,-1,0,-4,0,-6,3,-1,227,-36,5,6,7,8,-1,9,-9,10],
	sm176=[0,-2,228,-1,0,-4,0,-6,228,-1,228,-36,228,228,228,228,-1,228,-9,228],
	sm177=[0,229,-1,229,-1,0,-4,0,-5,229,229,-6,229,-31,229,229,229,229,-1,229,-6,229,-2,229],
	sm178=[0,230,-1,230,-1,0,-4,0,-5,230,230,-6,230,-31,230,230,230,230,-1,230,-6,230,-2,230],
	sm179=[0,231,-1,231,-1,0,-4,0,-5,231,231,-6,231,-31,231,231,231,231,-1,231,-6,231,-2,231],
	sm180=[0,119,-1,119,-1,0,-4,0,-5,119,119,-6,119,-5,120,-25,119,119,119,119,-1,119,-6,119,-2,119],
	sm181=[0,232,-1,232,-1,0,-4,0,-5,232,232,-5,232,232,-5,232,-25,232,232,232,232,-1,232,-6,232,-2,232],
	sm182=[0,233,-1,233,-1,0,-4,0,-5,233,233,-5,233,233,-6,233,-24,233,233,233,233,-1,233,-6,233,-2,233],
	sm183=[0,234,-1,234,-1,0,-4,0,-5,234,234,-5,234,234,-5,234,-25,234,234,234,234,-1,234,-6,234,-2,234],
	sm184=[0,235,-1,235,-1,0,-4,0,-5,235,235,-5,235,235,-6,235,-24,235,235,235,235,-1,235,-6,235,-2,235],
	sm185=[0,236,-1,236,-1,0,-4,0,-5,236,236,-5,236,236,-5,236,236,-24,236,236,236,236,-1,236,-6,236,-2,236],
	sm186=[0,237,-1,237,-1,0,-4,0,-5,237,237,-5,237,237,-5,237,237,-24,237,237,237,237,-1,237,-6,237,-2,237],
	sm187=[0,-4,177,-4,0,-3,178,-8,238],
	sm188=[0,239,-1,239,-1,0,-4,0,-5,239,239,-5,239,239,-5,239,239,-24,239,239,239,239,-1,239,-6,239,-2,239],
	sm189=[0,-4,240,-4,0,-3,240,-8,240],
	sm190=[0,-4,241,-4,0,-3,241,-8,241],
	sm191=[0,-1,122,2,-1,0,-4,0],
	sm192=[0,-1,242,242,-1,0,-4,0],
	sm193=[0,-2,242,-1,0,-4,0],
	sm194=[0,-4,0,-4,0,-12,243,-14,243,243,243,243,243],
	sm195=[0,-1,244,-2,0,-4,0],
	sm196=[0,-4,0,-4,0,-12,245,-14,245,245,245,245,245],
	sm197=[0,-4,177,-4,0,-3,178,-8,246],
	sm198=[0,-1,198,-2,0,-4,0,-8,247,-8,199,200],
	sm199=[0,-1,248,-2,0,-4,0,-8,248,-8,248,248],
	sm200=[0,-4,0,-4,0,-5,249,250],
	sm201=[0,-4,0,-4,0,-5,251,251],
	sm202=[0,-4,0,-4,0,-5,252,252],
	sm203=[0,-4,0,-4,0,-34,253],
	sm204=[0,-4,0,-4,0,-8,254],
	sm205=[0,-4,0,-4,0,-6,255,-5,255,-6,255,255],
	sm206=[0,-4,0,-4,0,-6,256,-5,256,-6,256,256],
	sm207=[0,-4,0,-4,0,-6,257,-5,257,-6,257,257],
	sm208=[0,-4,0,-4,0,-6,258,-5,258,-6,258,258],
	sm209=[0,-4,0,-4,0,-12,259],
	sm210=[0,260,-1,260,-1,0,-4,0,-6,260,-1,260,-4,260,-31,260,260,260,260,-1,260,-9,260],
	sm211=[0,-2,261,-1,0,-4,0,-8,261,-3,261,261,-43,261],
	sm212=[0,-2,146,-1,147,-4,0,-3,148,-4,262,-2,149,262,262,-43,262,262],
	sm213=[0,-4,0,-4,0,-59,263],
	sm214=[0,-2,264,-1,264,-4,0,-3,264,-4,264,-2,264,264,264,-43,264,264],
	sm215=[0,-2,146,-1,147,-4,0,-3,148,-7,149,265],
	sm216=[0,-4,0,-4,0,-51,266],
	sm217=[0,-2,267,-1,0,-4,0,-5,267,267,-5,267,-15,267,-12,267,267,267,-1,267,267,267,267,-1,267,-9,267],
	sm218=[0,-4,0,-4,0,-51,268],
	sm219=[0,-2,269,-1,0,-4,0,-5,269,269,-5,269,-15,269,-12,269,269,269,-1,269,269,269,269,-1,269,-9,269],
	sm220=[0,270,-1,270,-1,0,-4,0,-5,113,270,-6,270,-31,270,270,270,270,-1,270,-6,270,-2,270],
	sm221=[0,-4,0,-4,0,-12,271],
	sm222=[0,-4,0,-4,0,-12,272],
	sm223=[0,-4,0,-4,0,-11,126,-48,77],
	sm224=[0,273,-1,273,-1,0,-4,0,-6,273,-3,273,273,-1,273,-7,273,-2,273,-20,273,273,273,273,-1,273,-6,273,-2,273],
	sm225=[0,-4,0,-4,0,-57,274],
	sm226=[0,-2,275,-1,0,-4,0,-6,275,-1,275,-36,275,275,275,275,-1,275,-9,275],
	sm227=[0,276,-1,276,-1,0,-4,0,-5,276,276,-5,276,276,-5,276,276,-24,276,276,276,276,-1,276,-6,276,-2,276],
	sm228=[0,-4,277,-4,0,-3,277,-8,277],
	sm229=[0,-4,0,-4,0,-12,278],
	sm230=[0,-4,0,-4,0,-12,192],
	sm231=[0,-4,0,-4,0,-12,180],
	sm232=[0,-4,0,-4,0,-12,279],
	sm233=[0,-4,0,-4,0,-28,280,-1,281],
	sm234=[0,-4,0,-4,0,-27,282,-1,283],
	sm235=[0,-4,0,-4,0,-12,284,-14,284,284,284,284,284],
	sm236=[0,-4,0,-4,0,-57,285],
	sm237=[0,-1,286,-2,0,-4,0,-8,286,-8,286,286],
	sm238=[0,-4,0,-4,0,-5,287,287],
	sm239=[0,-4,0,-4,0,-57,288],
	sm240=[0,-4,0,-4,0,-6,289,-5,289,-6,289,289],
	sm241=[0,-2,290,-1,0,-4,0,-8,290,-3,290,290,-43,290],
	sm242=[0,-2,291,-1,291,-4,0,-3,291,-4,291,-2,291,291,291,-43,291,291],
	sm243=[0,-2,292,-1,0,-4,0,-5,292,292,-5,292,-15,292,-12,292,292,292,-1,292,292,292,292,-1,292,-9,292],
	sm244=[0,293,-1,293,-1,0,-4,0,-6,293,-4,293,-1,293,-7,293,-2,293,-20,293,293,293,293,-1,293,-6,293,-2,293],
	sm245=[0,-1,294,294,-1,0,-4,0],
	sm246=[0,-1,295,295,-1,0,-4,0],
	sm247=[0,-2,2,-1,0,-4,0,-8,296,-4,4,-43,297],
	sm248=[0,-4,0,-4,0,-5,298,298],
	sm249=[0,-4,0,-4,0,-12,299],
	sm250=[0,-4,0,-4,0,-8,300],
	sm251=[0,-1,301,-2,0,-4,0,-8,301,-8,301,301],
	sm252=[0,-1,302,-2,0,-4,0,-8,302,-8,302,302],

	    // Symbol Lookup map
	    lu = new Map([[1,1],[2,2],[4,3],[8,4],[16,5],[32,6],[64,7],[128,8],[256,9],[512,10],[3,11],[264,11],[200,13],[201,14],[",",15],["{",16],[";",67],["}",18],[null,9],["supports",20],["(",21],[")",22],["@",23],["import",24],["keyframes",25],["id",26],["from",27],["to",28],["and",29],["or",30],["not",31],["media",33],["only",34],[":",70],["<",37],[">",38],["<=",39],[">=",40],["=",41],["/",43],["%",44],["px",45],["in",46],["rad",47],["url",48],["\"",49],["'",50],["+",51],["~",52],["||",53],["*",55],["|",56],["#",57],[".",58],["[",60],["]",61],["^=",62],["$=",63],["*=",64],["i",65],["s",66],["!",68],["important",69],["-",72],["_",73]]),

	    //Reverse Symbol Lookup map
	    rlu = new Map([[1,1],[2,2],[3,4],[4,8],[5,16],[6,32],[7,64],[8,128],[9,256],[10,512],[11,3],[11,264],[13,200],[14,201],[15,","],[16,"{"],[67,";"],[18,"}"],[9,null],[20,"supports"],[21,"("],[22,")"],[23,"@"],[24,"import"],[25,"keyframes"],[26,"id"],[27,"from"],[28,"to"],[29,"and"],[30,"or"],[31,"not"],[33,"media"],[34,"only"],[70,":"],[37,"<"],[38,">"],[39,"<="],[40,">="],[41,"="],[43,"/"],[44,"%"],[45,"px"],[46,"in"],[47,"rad"],[48,"url"],[49,"\""],[50,"'"],[51,"+"],[52,"~"],[53,"||"],[55,"*"],[56,"|"],[57,"#"],[58,"."],[60,"["],[61,"]"],[62,"^="],[63,"$="],[64,"*="],[65,"i"],[66,"s"],[68,"!"],[69,"important"],[72,"-"],[73,"_"]]),

	    // States 
	    state = [sm0,
	sm1,
	sm2,
	sm3,
	sm4,
	sm5,
	sm6,
	sm7,
	sm8,
	sm8,
	sm9,
	sm10,
	sm11,
	sm12,
	sm13,
	sm13,
	sm14,
	sm15,
	sm16,
	sm17,
	sm18,
	sm19,
	sm20,
	sm21,
	sm22,
	sm23,
	sm24,
	sm24,
	sm24,
	sm24,
	sm25,
	sm25,
	sm26,
	sm27,
	sm28,
	sm29,
	sm30,
	sm31,
	sm32,
	sm33,
	sm34,
	sm35,
	sm36,
	sm37,
	sm38,
	sm39,
	sm40,
	sm41,
	sm10,
	sm42,
	sm43,
	sm44,
	sm45,
	sm46,
	sm47,
	sm48,
	sm49,
	sm50,
	sm42,
	sm51,
	sm52,
	sm52,
	sm52,
	sm52,
	sm53,
	sm54,
	sm54,
	sm55,
	sm56,
	sm57,
	sm58,
	sm59,
	sm60,
	sm61,
	sm62,
	sm63,
	sm64,
	sm64,
	sm64,
	sm65,
	sm65,
	sm66,
	sm67,
	sm68,
	sm25,
	sm69,
	sm70,
	sm71,
	sm25,
	sm72,
	sm73,
	sm37,
	sm37,
	sm37,
	sm74,
	sm75,
	sm76,
	sm77,
	sm77,
	sm78,
	sm78,
	sm79,
	sm80,
	sm81,
	sm82,
	sm25,
	sm83,
	sm84,
	sm84,
	sm85,
	sm85,
	sm86,
	sm87,
	sm88,
	sm89,
	sm89,
	sm90,
	sm91,
	sm92,
	sm93,
	sm93,
	sm94,
	sm95,
	sm96,
	sm41,
	sm97,
	sm97,
	sm98,
	sm98,
	sm99,
	sm100,
	sm101,
	sm102,
	sm103,
	sm104,
	sm105,
	sm106,
	sm107,
	sm108,
	sm109,
	sm110,
	sm111,
	sm112,
	sm113,
	sm114,
	sm115,
	sm116,
	sm117,
	sm117,
	sm117,
	sm117,
	sm118,
	sm42,
	sm119,
	sm120,
	sm121,
	sm122,
	sm123,
	sm124,
	sm125,
	sm126,
	sm127,
	sm128,
	sm129,
	sm39,
	sm130,
	sm131,
	sm132,
	sm133,
	sm134,
	sm135,
	sm136,
	sm87,
	sm137,
	sm87,
	sm138,
	sm139,
	sm140,
	sm141,
	sm87,
	sm142,
	sm142,
	sm142,
	sm143,
	sm144,
	sm145,
	sm146,
	sm146,
	sm147,
	sm148,
	sm129,
	sm149,
	sm150,
	sm151,
	sm95,
	sm152,
	sm152,
	sm153,
	sm154,
	sm155,
	sm42,
	sm156,
	sm157,
	sm158,
	sm159,
	sm160,
	sm161,
	sm162,
	sm108,
	sm163,
	sm164,
	sm164,
	sm164,
	sm165,
	sm166,
	sm166,
	sm167,
	sm168,
	sm169,
	sm170,
	sm170,
	sm41,
	sm171,
	sm172,
	sm171,
	sm173,
	sm174,
	sm175,
	sm176,
	sm177,
	sm178,
	sm179,
	sm180,
	sm181,
	sm182,
	sm183,
	sm184,
	sm185,
	sm186,
	sm187,
	sm188,
	sm189,
	sm190,
	sm190,
	sm191,
	sm191,
	sm192,
	sm192,
	sm192,
	sm192,
	sm192,
	sm25,
	sm25,
	sm25,
	sm193,
	sm193,
	sm193,
	sm193,
	sm194,
	sm195,
	sm196,
	sm196,
	sm196,
	sm197,
	sm188,
	sm198,
	sm199,
	sm200,
	sm201,
	sm202,
	sm202,
	sm202,
	sm203,
	sm204,
	sm205,
	sm206,
	sm207,
	sm208,
	sm209,
	sm210,
	sm211,
	sm212,
	sm213,
	sm214,
	sm215,
	sm216,
	sm217,
	sm218,
	sm218,
	sm219,
	sm220,
	sm221,
	sm222,
	sm222,
	sm223,
	sm224,
	sm225,
	sm226,
	sm227,
	sm228,
	sm229,
	sm230,
	sm231,
	sm232,
	sm232,
	sm233,
	sm234,
	sm235,
	sm227,
	sm236,
	sm237,
	sm10,
	sm148,
	sm238,
	sm239,
	sm240,
	sm241,
	sm242,
	sm243,
	sm244,
	sm191,
	sm245,
	sm245,
	sm191,
	sm246,
	sm246,
	sm247,
	sm248,
	sm249,
	sm249,
	sm250,
	sm251,
	sm252],

	/************ Functions *************/

	    max = Math.max, min = Math.min,

	    //Error Functions
	    e$1 = (tk,r,o,l,p)=>{if(l.END)l.throw("Unexpected end of input");else if(l.ty & (264)) l.throw(`Unexpected space character within input "${p.slice(l)}" `) ; else l.throw(`Unexpected token ${l.tx}" `);}, 
	    eh = [e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1,
	e$1],

	    //Empty Function
	    nf = ()=>-1, 

	    //Environment Functions
	    
	redv = (ret, fn, plen, ln, t, e, o, l, s) => {        ln = max(o.length - plen, 0);        const slice = o.slice(-plen);        o.length = ln + 1;        o[ln] = fn(slice, e, l, s, o, plen);        return ret;    },
	rednv = (ret, Fn, plen, ln, t, e, o, l, s) => {        ln = max(o.length - plen, 0);        const slice = o.slice(-plen);        o.length = ln + 1;        o[ln] = new Fn(slice, e, l, s, o, plen);        return ret;    },
	redn = (ret, plen, t, e, o) => {        if (plen > 0) {            let ln = max(o.length - plen, 0);            o[ln] = o[o.length - 1];            o.length = ln + 1;        }        return ret;    },
	shftf = (ret, fn, t, e, o, l, s) => (fn(o, e, l, s), ret),
	R20_STYLE_SHEET201_group_list=function (sym,env,lex,state,output,len) {return ((sym[1] !== null) ? sym[0].push(sym[1]) : null,sym[0])},
	R21_STYLE_SHEET201_group_list=function (sym,env,lex,state,output,len) {return (sym[0] !== null) ? [sym[0]] : []},
	R50_STYLE_SHEET=function (sym,env,lex,state,output,len) {return new fn.ruleset(sym[0],sym[1])},
	R51_STYLE_SHEET=function (sym,env,lex,state,output,len) {return new fn.ruleset(null,sym[0])},
	R52_STYLE_SHEET=function (sym,env,lex,state,output,len) {return new fn.ruleset(sym[0],null)},
	R53_STYLE_SHEET=function (sym,env,lex,state,output,len) {return new fn.ruleset(null,null)},
	R60_COMPLEX_SELECTOR_list=function (sym,env,lex,state,output,len) {return ((sym[1] !== null) ? sym[0].push(sym[2]) : null,sym[0])},
	R70_STYLE_RULE=function (sym,env,lex,state,output,len) {return new fn.stylerule(sym[0],sym[2])},
	R71_STYLE_RULE=function (sym,env,lex,state,output,len) {return new fn.stylerule(null,sym[1])},
	C180_keyframes=function (sym,env,lex,state,output,len) {this.keyframes = sym[4];},
	C210_keyframes_blocks=function (sym,env,lex,state,output,len) {this.selectors = sym[0];this.props = sym[2].props;},
	R500_general_enclosed6202_group_list=function (sym,env,lex,state,output,len) {return sym[0] + sym[1]},
	R501_general_enclosed6202_group_list=function (sym,env,lex,state,output,len) {return sym[0] + ""},
	R790_TYPE_SELECTOR=function (sym,env,lex,state,output,len) {return new fn.type_selector([sym[0],sym[1]])},
	R791_TYPE_SELECTOR=function (sym,env,lex,state,output,len) {return new fn.type_selector([sym[0]])},
	R820_WQ_NAME=function (sym,env,lex,state,output,len) {return [sym[0],sym[1]]},
	R821_WQ_NAME=function (sym,env,lex,state,output,len) {return [sym[0]]},
	R960_declaration_list=function (sym,env,lex,state,output,len) {return sym[0]},
	R961_declaration_list=function (sym,env,lex,state,output,len) {return (sym[0].push(sym[1]),sym[0])},
	R962_declaration_list=function (sym,env,lex,state,output,len) {return (sym[0].push(...sym[1]),sym[0])},
	R1010_declaration_values=function (sym,env,lex,state,output,len) {return sym.join("")},

	    //Sparse Map Lookup
	    lsm = (index, map) => {    if (map[0] == 0xFFFFFFFF) return map[index + 1];    for (let i = 1, ind = 0, l = map.length, n = 0; i < l && ind <= index; i++) {        if (ind !== index) {            if ((n = map[i]) > -1) ind++;            else ind += -n;        } else return map[i];    }    return -1;},

	    //State Action Functions
	    state_funct = [(...v)=>((redn(5123,0,...v))),
	()=>(98),
	()=>(46),
	()=>(26),
	()=>(78),
	()=>(90),
	()=>(122),
	()=>(126),
	()=>(130),
	()=>(134),
	(...v)=>(rednv(5,fn.stylesheet,1,0,...v)),
	(...v)=>(redv(5127,R52_STYLE_SHEET,1,0,...v)),
	(...v)=>(redv(5127,R51_STYLE_SHEET,1,0,...v)),
	(...v)=>(redv(2055,R21_STYLE_SHEET201_group_list,1,0,...v)),
	(...v)=>(redn(1031,1,...v)),
	()=>(174),
	()=>(190),
	()=>(178),
	()=>(186),
	()=>(182),
	(...v)=>(redv(4103,R21_STYLE_SHEET201_group_list,1,0,...v)),
	(...v)=>(redn(3079,1,...v)),
	()=>(198),
	()=>(194),
	(...v)=>(redv(6151,R21_STYLE_SHEET201_group_list,1,0,...v)),
	(...v)=>(rednv(73735,fn.selector,1,0,...v)),
	()=>(242),
	()=>(246),
	()=>(250),
	()=>(254),
	(...v)=>(rednv(78855,fn.compoundSelector,1,0,...v)),
	()=>(278),
	(...v)=>(rednv(80903,fn.typeselector,1,0,...v)),
	()=>(282),
	(...v)=>(redv(80903,R791_TYPE_SELECTOR,1,0,...v)),
	(...v)=>(redn(81927,1,...v)),
	(...v)=>(redv(83975,R821_WQ_NAME,1,0,...v)),
	()=>(290),
	(...v)=>(redn(82951,1,...v)),
	(...v)=>(redv(108551,R960_declaration_list,1,0,...v)),
	()=>(306),
	()=>(318),
	()=>(322),
	()=>(310),
	()=>(314),
	(...v)=>(redn(104455,1,...v)),
	(...v)=>(redv(74759,R21_STYLE_SHEET201_group_list,1,0,...v)),
	(...v)=>(redn(84999,1,...v)),
	()=>(342),
	()=>(354),
	(...v)=>(redv(77831,R21_STYLE_SHEET201_group_list,1,0,...v)),
	(...v)=>(redn(76807,1,...v)),
	()=>(366),
	()=>(370),
	()=>(374),
	(...v)=>(redv(5131,R50_STYLE_SHEET,2,0,...v)),
	(...v)=>(redv(2059,R20_STYLE_SHEET201_group_list,2,0,...v)),
	(...v)=>(redv(4107,R20_STYLE_SHEET201_group_list,2,0,...v)),
	(...v)=>(redn(10251,2,...v)),
	()=>(386),
	()=>(406),
	()=>(398),
	()=>(402),
	()=>(454),
	()=>(450),
	()=>(470),
	()=>(478),
	()=>(518),
	()=>(498),
	()=>(490),
	()=>(538),
	()=>(534),
	(...v)=>(redv(98311,R960_declaration_list,1,0,...v)),
	()=>(550),
	(...v)=>(redv(97287,R21_STYLE_SHEET201_group_list,1,0,...v)),
	(...v)=>(redn(95239,1,...v)),
	()=>(554),
	(...v)=>(rednv(73739,fn.selector,2,0,...v)),
	(...v)=>(redv(72711,R21_STYLE_SHEET201_group_list,1,0,...v)),
	(...v)=>(rednv(71687,fn.comboSelector,1,0,...v)),
	(...v)=>(redn(79879,1,...v)),
	(...v)=>(rednv(78859,fn.compoundSelector,2,0,...v)),
	(...v)=>(redv(74763,R20_STYLE_SHEET201_group_list,2,0,...v)),
	(...v)=>(redv(77835,R20_STYLE_SHEET201_group_list,2,0,...v)),
	(...v)=>(redv(80907,R790_TYPE_SELECTOR,2,0,...v)),
	(...v)=>(redv(83979,R820_WQ_NAME,2,0,...v)),
	(...v)=>(redn(82955,2,...v)),
	(...v)=>(redv(108555,R500_general_enclosed6202_group_list,2,0,...v)),
	(...v)=>(redv(108555,R960_declaration_list,2,0,...v)),
	(...v)=>(redv(106503,R501_general_enclosed6202_group_list,1,0,...v)),
	(...v)=>(redn(105479,1,...v)),
	(...v)=>(redn(107527,1,...v)),
	(...v)=>(rednv(86027,fn.idSelector,2,0,...v)),
	(...v)=>(rednv(87051,fn.classSelector,2,0,...v)),
	()=>(602),
	()=>(586),
	()=>(578),
	()=>(590),
	()=>(594),
	()=>(598),
	(...v)=>(rednv(93195,fn.pseudoClassSelector,2,0,...v)),
	()=>(610),
	(...v)=>(rednv(94219,fn.pseudoElementSelector,2,0,...v)),
	(...v)=>(redn(76811,2,...v)),
	(...v)=>(redv(75783,R21_STYLE_SHEET201_group_list,1,0,...v)),
	()=>(622),
	(...v)=>(redn(16399,3,...v)),
	()=>(634),
	(...v)=>(redv(11271,R21_STYLE_SHEET201_group_list,1,0,...v)),
	(...v)=>(redn(12295,1,...v)),
	()=>(642),
	()=>(650),
	()=>(658),
	()=>(654),
	(...v)=>(redv(32775,R21_STYLE_SHEET201_group_list,1,0,...v)),
	(...v)=>(redn(36871,1,...v)),
	()=>(674),
	(...v)=>(redn(38919,1,...v)),
	(...v)=>(redn(37895,1,...v)),
	()=>(690),
	()=>(698),
	()=>(742),
	()=>(718),
	(...v)=>(redn(47111,1,...v)),
	(...v)=>(redn(62471,1,...v)),
	()=>(754),
	(...v)=>(redn(34823,1,...v)),
	()=>(758),
	(...v)=>(redn(19463,1,...v)),
	()=>(762),
	(...v)=>(redn(27655,1,...v)),
	()=>(782),
	()=>(786),
	(...v)=>(redn(28679,1,...v)),
	(...v)=>(redn(29703,1,...v)),
	()=>(802),
	()=>(810),
	()=>(806),
	(...v)=>(redv(6159,R60_COMPLEX_SELECTOR_list,3,0,...v)),
	()=>(814),
	(...v)=>(redv(7183,R71_STYLE_RULE,3,0,...v)),
	(...v)=>(redv(98315,R961_declaration_list,2,0,...v)),
	(...v)=>(redv(98315,R962_declaration_list,2,0,...v)),
	()=>(818),
	(...v)=>(redv(98315,R960_declaration_list,2,0,...v)),
	()=>(850),
	()=>(842),
	()=>(846),
	()=>(834),
	(...v)=>(redv(72715,R20_STYLE_SHEET201_group_list,2,0,...v)),
	(...v)=>(rednv(71691,fn.comboSelector,2,0,...v)),
	(...v)=>(rednv(78863,fn.compoundSelector,3,0,...v)),
	(...v)=>(redv(108559,R500_general_enclosed6202_group_list,3,0,...v)),
	(...v)=>(redv(106507,R500_general_enclosed6202_group_list,2,0,...v)),
	(...v)=>(rednv(89103,fn.attribSelector,3,0,...v)),
	()=>(862),
	()=>(866),
	(...v)=>(redn(90119,1,...v)),
	(...v)=>(rednv(93199,fn.pseudoClassSelector,3,0,...v)),
	(...v)=>(redv(75787,R20_STYLE_SHEET201_group_list,2,0,...v)),
	(...v)=>(redn(16403,4,...v)),
	(...v)=>(redv(11275,R20_STYLE_SHEET201_group_list,2,0,...v)),
	()=>(886),
	()=>(894),
	()=>(890),
	(...v)=>(redv(69639,R501_general_enclosed6202_group_list,1,0,...v)),
	()=>(898),
	(...v)=>((redn(9219,0,...v))),
	(...v)=>(redn(36875,2,...v)),
	(...v)=>(redn(43019,2,...v)),
	(...v)=>(redn(46091,2,...v)),
	(...v)=>(redv(41991,R21_STYLE_SHEET201_group_list,1,0,...v)),
	(...v)=>(redv(45063,R21_STYLE_SHEET201_group_list,1,0,...v)),
	(...v)=>(redn(39947,2,...v)),
	()=>(950),
	()=>(954),
	()=>(974),
	()=>(970),
	()=>(962),
	(...v)=>(redn(61447,1,...v)),
	(...v)=>(redn(48135,1,...v)),
	()=>(986),
	()=>(990),
	()=>(994),
	()=>(998),
	()=>(1002),
	()=>(978),
	()=>(1018),
	()=>(1022),
	()=>(1026),
	()=>(1030),
	(...v)=>(redn(59399,1,...v)),
	()=>(1038),
	()=>(1042),
	()=>(1046),
	()=>(1050),
	()=>(1058),
	()=>(1090),
	()=>(1078),
	()=>(1082),
	(...v)=>(redn(27659,2,...v)),
	(...v)=>(redv(26631,R21_STYLE_SHEET201_group_list,1,0,...v)),
	(...v)=>(redn(24583,1,...v)),
	()=>(1106),
	()=>(1110),
	()=>(1118),
	(...v)=>(redv(7187,R70_STYLE_RULE,4,0,...v)),
	(...v)=>(redv(7187,R71_STYLE_RULE,4,0,...v)),
	(...v)=>(redv(98319,R962_declaration_list,3,0,...v)),
	(...v)=>(redv(97295,R60_COMPLEX_SELECTOR_list,3,0,...v)),
	(...v)=>(redv(100367,fn.parseDeclaration,3,0,...v)),
	()=>(1130),
	(...v)=>(redn(103431,1,...v)),
	(...v)=>(redv(102407,R501_general_enclosed6202_group_list,1,0,...v)),
	(...v)=>(redn(101383,1,...v)),
	()=>(1146),
	()=>(1150),
	()=>(1154),
	(...v)=>(redn(88071,1,...v)),
	(...v)=>(redn(90123,2,...v)),
	()=>(1158),
	(...v)=>(redn(16407,5,...v)),
	(...v)=>(redn(70671,3,...v)),
	(...v)=>(redv(69643,R500_general_enclosed6202_group_list,2,0,...v)),
	()=>(1182),
	()=>(1186),
	(...v)=>(redn(9223,1,...v)),
	(...v)=>(redv(8199,R21_STYLE_SHEET201_group_list,1,0,...v)),
	(...v)=>(redv(32783,R60_COMPLEX_SELECTOR_list,3,0,...v)),
	(...v)=>(redn(36879,3,...v)),
	(...v)=>(redn(35851,2,...v)),
	(...v)=>(redv(41995,R20_STYLE_SHEET201_group_list,2,0,...v)),
	(...v)=>(redv(45067,R20_STYLE_SHEET201_group_list,2,0,...v)),
	(...v)=>(redn(40971,2,...v)),
	(...v)=>(redn(44043,2,...v)),
	(...v)=>(redn(47119,3,...v)),
	(...v)=>(redn(49167,3,...v)),
	()=>(1194),
	(...v)=>(redn(53263,3,...v)),
	(...v)=>(redv(52231,R501_general_enclosed6202_group_list,1,0,...v)),
	(...v)=>(redn(50183,1,...v)),
	(...v)=>(redn(55303,1,...v)),
	(...v)=>(redn(66571,2,...v)),
	()=>(1230),
	(...v)=>(redn(65543,1,...v)),
	()=>(1234),
	()=>(1238),
	(...v)=>(redv(17415,R21_STYLE_SHEET201_group_list,1,0,...v)),
	()=>(1250),
	()=>(1246),
	(...v)=>(redv(20487,R21_STYLE_SHEET201_group_list,1,0,...v)),
	(...v)=>(redn(22535,1,...v)),
	()=>(1254),
	()=>(1258),
	(...v)=>(redv(26635,R20_STYLE_SHEET201_group_list,2,0,...v)),
	(...v)=>(redn(25611,2,...v)),
	(...v)=>(redn(28687,3,...v)),
	(...v)=>(redn(30735,3,...v)),
	()=>(1262),
	(...v)=>(redv(7191,R70_STYLE_RULE,5,0,...v)),
	(...v)=>(redv(100371,fn.parseDeclaration,4,0,...v)),
	(...v)=>(redv(103435,R1010_declaration_values,2,0,...v)),
	()=>(1266),
	(...v)=>(redv(102411,R500_general_enclosed6202_group_list,2,0,...v)),
	()=>(1270),
	()=>(1274),
	(...v)=>(rednv(89111,fn.attribSelector,5,0,...v)),
	(...v)=>(redn(91143,1,...v)),
	(...v)=>(redn(92175,3,...v)),
	(...v)=>(redn(16411,6,...v)),
	()=>(1278),
	(...v)=>(redn(13319,1,...v)),
	(...v)=>(redn(67603,4,...v)),
	(...v)=>(redn(33819,6,...v)),
	(...v)=>(redv(8203,R20_STYLE_SHEET201_group_list,2,0,...v)),
	(...v)=>(redn(53267,4,...v)),
	(...v)=>(redv(52235,R500_general_enclosed6202_group_list,2,0,...v)),
	(...v)=>(redn(54287,3,...v)),
	(...v)=>(redn(58383,3,...v)),
	()=>(1286),
	()=>(1290),
	()=>(1298),
	()=>(1302),
	(...v)=>(redn(63503,3,...v)),
	(...v)=>(rednv(18459,C180_keyframes,6,0,...v)),
	(...v)=>(redv(17419,R20_STYLE_SHEET201_group_list,2,0,...v)),
	(...v)=>(redn(64523,2,...v)),
	(...v)=>(redn(23579,6,...v)),
	(...v)=>(redn(31763,4,...v)),
	(...v)=>(redn(99339,2,...v)),
	(...v)=>(redv(103439,R1010_declaration_values,3,0,...v)),
	(...v)=>(rednv(89115,fn.attribSelector,6,0,...v)),
	(...v)=>(redn(14355,4,...v)),
	(...v)=>(redn(56327,1,...v)),
	(...v)=>(redn(57351,1,...v)),
	()=>(1326),
	()=>(1322),
	(...v)=>(redv(20495,R60_COMPLEX_SELECTOR_list,3,0,...v)),
	(...v)=>(redn(58391,5,...v)),
	()=>(1330),
	(...v)=>(rednv(21523,C210_keyframes_blocks,4,0,...v)),
	(...v)=>(rednv(21527,C210_keyframes_blocks,5,0,...v))],

	    //Goto Lookup Functions
	    goto = [v=>lsm(v,gt0),
	nf,
	v=>lsm(v,gt1),
	v=>lsm(v,gt2),
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt3),
	nf,
	v=>lsm(v,gt4),
	v=>lsm(v,gt5),
	v=>lsm(v,gt6),
	v=>lsm(v,gt7),
	nf,
	v=>lsm(v,gt8),
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt9),
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt10),
	v=>lsm(v,gt11),
	v=>lsm(v,gt12),
	v=>lsm(v,gt13),
	nf,
	v=>lsm(v,gt14),
	nf,
	nf,
	nf,
	v=>lsm(v,gt2),
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt15),
	v=>lsm(v,gt16),
	v=>lsm(v,gt17),
	v=>lsm(v,gt18),
	v=>lsm(v,gt19),
	v=>lsm(v,gt20),
	v=>lsm(v,gt21),
	nf,
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt22),
	nf,
	v=>lsm(v,gt23),
	nf,
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt24),
	v=>lsm(v,gt7),
	v=>lsm(v,gt7),
	nf,
	nf,
	v=>lsm(v,gt25),
	nf,
	nf,
	nf,
	v=>lsm(v,gt26),
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt27),
	v=>lsm(v,gt8),
	nf,
	v=>lsm(v,gt28),
	nf,
	v=>lsm(v,gt29),
	v=>lsm(v,gt30),
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt31),
	v=>lsm(v,gt32),
	nf,
	nf,
	nf,
	v=>lsm(v,gt33),
	v=>lsm(v,gt34),
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt35),
	v=>lsm(v,gt36),
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt37),
	v=>lsm(v,gt38),
	v=>lsm(v,gt39),
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt40),
	v=>lsm(v,gt41),
	v=>lsm(v,gt42),
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt21),
	nf,
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt43),
	v=>lsm(v,gt44),
	nf,
	nf,
	v=>lsm(v,gt7),
	nf,
	nf,
	nf,
	v=>lsm(v,gt45),
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt46),
	nf,
	v=>lsm(v,gt47),
	nf,
	v=>lsm(v,gt48),
	nf,
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt49),
	v=>lsm(v,gt50),
	v=>lsm(v,gt51),
	v=>lsm(v,gt52),
	nf,
	nf,
	v=>lsm(v,gt53),
	v=>lsm(v,gt54),
	v=>lsm(v,gt55),
	nf,
	v=>lsm(v,gt56),
	nf,
	v=>lsm(v,gt57),
	nf,
	nf,
	nf,
	v=>lsm(v,gt58),
	v=>lsm(v,gt38),
	nf,
	nf,
	nf,
	v=>lsm(v,gt59),
	v=>lsm(v,gt60),
	v=>lsm(v,gt61),
	nf,
	nf,
	v=>lsm(v,gt62),
	v=>lsm(v,gt63),
	v=>lsm(v,gt64),
	nf,
	v=>lsm(v,gt65),
	nf,
	v=>lsm(v,gt66),
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt58),
	v=>lsm(v,gt67),
	nf,
	nf,
	nf,
	v=>lsm(v,gt43),
	nf,
	v=>lsm(v,gt68),
	v=>lsm(v,gt69),
	v=>lsm(v,gt70),
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt71),
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt72),
	nf,
	nf,
	v=>lsm(v,gt73),
	nf,
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt74),
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt75),
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt76),
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt77),
	v=>lsm(v,gt78),
	nf,
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt79),
	v=>lsm(v,gt80),
	v=>lsm(v,gt81),
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt76),
	nf,
	v=>lsm(v,gt82),
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt83),
	nf,
	nf,
	v=>lsm(v,gt83),
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt84),
	v=>lsm(v,gt85),
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt86),
	v=>lsm(v,gt87),
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	nf,
	v=>lsm(v,gt88),
	nf,
	nf,
	v=>lsm(v,gt89),
	nf,
	nf,
	v=>lsm(v,gt21),
	nf,
	nf,
	nf,
	nf,
	nf,
	nf];

	function getToken(l, SYM_LU) {
	    if (l.END) return 0; /*$eof*/

	    switch (l.ty) {
	        case 2:
	            //*
	            if (SYM_LU.has(l.tx)) return  14;
	            /*/
	                console.log(l.tx, SYM_LU.has(l.tx), SYM_LU.get(l.tx))
	                if (SYM_LU.has(l.tx)) return SYM_LU.get(l.tx);
	            //*/
	            return 2;
	        case 1:
	            return 1;
	        case 4:
	            return 3;
	        case 256:
	            return 9;
	        case 8:
	            return 4;
	        case 512:
	            return 10;
	        default:
	            return SYM_LU.get(l.tx) || SYM_LU.get(l.ty);
	    }
	}

	/************ Parser *************/

	function parser(l, e = {}) {

	    fn = e.functions;

	    l.IWS = false;
	    l.PARSE_STRING = true;

	    if (symbols.length > 0) {
	        symbols.forEach(s => { l.addSymbol(s); });
	        l.tl = 0;
	        l.next();
	    }

	    const recovery_chain = [];

	    const o = [],
	        ss = [0, 0];

	    let time = 1000000,
	        RECOVERING = 100,
	        RESTARTED = true,
	        tk = getToken(l, lu),
	        p = l.copy(),
	        sp = 1,
	        len = 0,
	        reduceStack = (e.reduceStack = []),
	        ROOT = 10000,
	        off = 0;

	    outer:

	        while (time-- > 0) {

	            const fn = lsm(tk, state[ss[sp]]) || 0;

	            let r,
	                gt = -1;

	            if (fn == 0) {
	                /*Ignore the token*/
	                tk = getToken(l.next(), lu);
	                continue;
	            }

	            if (fn > 0) {
	                r = state_funct[fn - 1](tk, e, o, l, ss[sp - 1]);
	            } else {

	                if (tk == 14) {
	                    tk = lu.get(l.tx);
	                    continue;
	                }

	                if (l.ty == 8 && l.tl > 1) {
	                    // Make sure that special tokens are not getting in the way
	                    l.tl = 0;
	                    // This will skip the generation of a custom symbol
	                    l.next(l, false);

	                    if (l.tl == 1)
	                        continue;
	                }

	                if (RECOVERING > 1 && !l.END) {

	                    if (tk !== lu.get(l.ty)) {
	                        tk = lu.get(l.ty);
	                        continue;
	                    }

	                    if (tk !== 13) {
	                        tk = 13;
	                        RECOVERING = 1;
	                        continue;
	                    }
	                }

	                tk = getToken(l, lu);

	                const recovery_token = eh[ss[sp]](tk, e, o, l, p, ss[sp], (lex) => getToken(lex, lu));

	                if (RECOVERING > 0 && recovery_token >= 0) {
	                    RECOVERING = -1; /* To prevent infinite recursion */
	                    tk = recovery_token;
	                    l.tl = 0; /*reset current token */
	                    continue;
	                }
	            }

	            switch (r & 3) {
	                case 0:
	                    /* ERROR */

	                    if (tk == "$eof")
	                        l.throw("Unexpected end of input");

	                    l.throw(`Unexpected token [${RECOVERING ? l.next().tx : l.tx}]`);
	                    return [null];

	                case 1:
	                    /* ACCEPT */
	                    break outer;

	                case 2:

	                    /*SHIFT */
	                    o.push(l.tx);
	                    ss.push(off, r >> 2);
	                    sp += 2;
	                    l.next();
	                    off = l.off;
	                    tk = getToken(l, lu);
	                    RECOVERING++;
	                    break;

	                case 3:
	                    /* REDUCE */
	                    RESTARTED = true;

	                    len = (r & 0x3FC) >> 1;

	                    ss.length -= len;
	                    sp -= len;
	                    gt = goto[ss[sp]](r >> 10);

	                    if (gt < 0)
	                        l.throw("Invalid state reached!");

	                    if (reduceStack.length > 0) {
	                        let i = reduceStack.length - 1;
	                        while (i > -1) {
	                            let item = reduceStack[i--];

	                            if (item.index == sp) {
	                                item.action(output);
	                            } else if (item.index > sp) {
	                                reduceStack.length--;
	                            } else {
	                                break;
	                            }
	                        }
	                    }

	                    ss.push(off, gt);
	                    sp += 2;
	                    break;
	            }
	        }
	    return o[0];
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
	    static parse(l) {

	        let c = CSS_Color._fs_(l);

	        if (c) {

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
	                l.next();
	                let pk = l.copy();

	                let type = l.types;
	                pk.IWS = false;


	                while(!(pk.ty & (type.newline | type.ws)) && !pk.END && pk.ch !== ";"){
	                    pk.next();
	                }

	                var value = pk.slice(l);
	                l.sync(pk);
	                l.tl = 0;
	                l.next();
	                
	                let num = parseInt(value,16);

	                if(value.length == 3 || value.length == 4){
	                    
	                    if(value.length == 4){
	                        const a = (num >> 8) & 0xF;
	                        out.a = a | a << 4;
	                        num >>= 4;
	                    }

	                    const r = (num >> 8) & 0xF;
	                    out.r = r | r << 4;
	                    
	                    const g = (num >> 4) & 0xF;
	                    out.g = g | g << 4;
	                    
	                    const b = (num) & 0xF;
	                    out.b = b | b << 4;

	                }else{

	                    if(value.length == 8){
	                        out.a = num & 0xFF;
	                        num >>= 8;
	                    }

	                    out.r = (num >> 16) & 0xFF;       
	                    out.g = (num >> 8) & 0xFF;
	                    out.b = (num) & 0xFF;
	                }
	                l.next();
	                break;
	            case "r":
	                let tx = l.tx;

	                const RGB_TYPE = tx === "rgba"  ? 1 : tx === "rgb" ? 2 : 0;
	                
	                if(RGB_TYPE > 0){

	                    l.next(); // (
	                    
	                    out.r = parseInt(l.next().tx);
	                    
	                    l.next(); // , or  %

	                    if(l.ch == "%"){
	                        l.next(); out.r = out.r * 255 / 100;
	                    }
	                    
	                    
	                    out.g = parseInt(l.next().tx);
	                    
	                    l.next(); // , or  %
	                   
	                    if(l.ch == "%"){
	                        l.next(); out.g = out.g * 255 / 100;
	                    }
	                    
	                    
	                    out.b = parseInt(l.next().tx);
	                    
	                    l.next(); // , or ) or %
	                    
	                    if(l.ch == "%")
	                        l.next(), out.b = out.b * 255 / 100;

	                    if(RGB_TYPE < 2){
	                        out.a = parseFloat(l.next().tx);

	                        l.next();
	                        
	                        if(l.ch == "%")
	                            l.next(), out.a = out.a * 255 / 100;
	                    }

	                    l.a(")");
	                    c = new CSS_Color();
	                    c.set(out);
	                    return c;
	                }  // intentional
	            default:

	                let string = l.tx;

	                if (l.ty == l.types.str){
	                    string = string.slice(1, -1);
	                }

	                out = CSS_Color.colors[string.toLowerCase()];

	                if(out)
	                    l.next();
	        }

	        return out;
	    }

	    constructor(r, g, b, a) {
	        super(r, g, b, a);

	        if (typeof(r) == "string")
	            this.set(CSS_Color._fs_(r) || {r:255,g:255,b:255,a:0});

	    }

	    toString(){
	        if(this.a !== 1)
	            return this.toRGBString();
	        return `#${("0"+this.r.toString(16)).slice(-2)}${("0"+this.g.toString(16)).slice(-2)}${("0"+this.b.toString(16)).slice(-2)}`
	    }
	    toRGBString(){
	        return `rgba(${this.r.toString()},${this.g.toString()},${this.b.toString()},${this.a.toString()})`   
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

	    static _verify_(l) {
	        if(typeof(l) == "string" &&  !isNaN(parseInt(l)) && l.includes("%"))
	            return true;
	        return false;
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

	CSS_Percentage.label_name = "Percentage";

	class CSS_Length extends Number {

	    static parse(l) {
	        let tx = l.tx,
	            pky = l.pk.ty;
	        if (l.ty == l.types.num || tx == "-" && pky == l.types.num) {
	            let sign = 1;
	            if (l.ch == "-") {
	                sign = -1;
	                tx = l.p.tx;
	                l.p.next();
	            }
	            if (l.p.ty == l.types.id) {
	                let id = l.sync().tx;
	                l.next();
	                return new CSS_Length(parseFloat(tx) * sign, id);
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

	const A$1 = 65;
	const a$1 = 97;
	const ACKNOWLEDGE$1 = 6;
	const AMPERSAND$1 = 38;
	const ASTERISK$1 = 42;
	const AT$1 = 64;
	const B$1 = 66;
	const b$1 = 98;
	const BACKSLASH$1 = 92;
	const BACKSPACE$1 = 8;
	const BELL$1 = 7;
	const C$1 = 67;
	const c$1 = 99;
	const CANCEL$1 = 24;
	const CARET$1 = 94;
	const CARRIAGE_RETURN$1 = 13;
	const CLOSE_CURLY$1 = 125;
	const CLOSE_PARENTH$1 = 41;
	const CLOSE_SQUARE$1 = 93;
	const COLON$1 = 58;
	const COMMA$1 = 44;
	const d$1 = 100;
	const D$1 = 68;
	const DATA_LINK_ESCAPE$1 = 16;
	const DELETE$1 = 127;
	const DEVICE_CTRL_1$1 = 17;
	const DEVICE_CTRL_2$1 = 18;
	const DEVICE_CTRL_3$1 = 19;
	const DEVICE_CTRL_4$1 = 20;
	const DOLLAR$1 = 36;
	const DOUBLE_QUOTE$1 = 34;
	const e$2 = 101;
	const E$1 = 69;
	const EIGHT$1 = 56;
	const END_OF_MEDIUM$1 = 25;
	const END_OF_TRANSMISSION$1 = 4;
	const END_OF_TRANSMISSION_BLOCK$1 = 23;
	const END_OF_TXT$1 = 3;
	const ENQUIRY$1 = 5;
	const EQUAL$1 = 61;
	const ESCAPE$1 = 27;
	const EXCLAMATION$1 = 33;
	const f$1 = 102;
	const F$1 = 70;
	const FILE_SEPERATOR$1 = 28;
	const FIVE$1 = 53;
	const FORM_FEED$1 = 12;
	const FORWARD_SLASH$1 = 47;
	const FOUR$1 = 52;
	const g$1 = 103;
	const G$1 = 71;
	const GRAVE$1 = 96;
	const GREATER_THAN$1 = 62;
	const GROUP_SEPERATOR$1 = 29;
	const h$1 = 104;
	const H$1 = 72;
	const HASH$1 = 35;
	const HORIZONTAL_TAB$1 = 9;
	const HYPHEN$1 = 45;
	const i$1 = 105;
	const I$1 = 73;
	const j$1 = 106;
	const J$1 = 74;
	const k$1 = 107;
	const K$1 = 75;
	const l$1 = 108;
	const L$1 = 76;
	const LESS_THAN$1 = 60;
	const LINE_FEED$1 = 10;
	const m$1 = 109;
	const M$1 = 77;
	const n$1 = 110;
	const N$1 = 78;
	const NEGATIVE_ACKNOWLEDGE$1 = 21;
	const NINE$1 = 57;
	const NULL$1 = 0;
	const o$1 = 111;
	const O$1 = 79;
	const ONE$1 = 49;
	const OPEN_CURLY$1 = 123;
	const OPEN_PARENTH$1 = 40;
	const OPEN_SQUARE$1 = 91;
	const p$1 = 112;
	const P$1 = 80;
	const PERCENT$1 = 37;
	const PERIOD$1 = 46;
	const PLUS$1 = 43;
	const q$1 = 113;
	const Q$1 = 81;
	const QMARK$1 = 63;
	const QUOTE$1 = 39;
	const r$2 = 114;
	const R$1 = 82;
	const RECORD_SEPERATOR$1 = 30;
	const s$1 = 115;
	const S$1 = 83;
	const SEMICOLON$1 = 59;
	const SEVEN$1 = 55;
	const SHIFT_IN$1 = 15;
	const SHIFT_OUT$1 = 14;
	const SIX$1 = 54;
	const SPACE$1 = 32;
	const START_OF_HEADER$1 = 1;
	const START_OF_TEXT$1 = 2;
	const SUBSTITUTE$1 = 26;
	const SYNCH_IDLE$1 = 22;
	const t$1 = 116;
	const T$1 = 84;
	const THREE$1 = 51;
	const TILDE$1 = 126;
	const TWO$1 = 50;
	const u$1 = 117;
	const U$1 = 85;
	const UNDER_SCORE$1 = 95;
	const UNIT_SEPERATOR$1 = 31;
	const v$1 = 118;
	const V$1 = 86;
	const VERTICAL_BAR$1 = 124;
	const VERTICAL_TAB$1 = 11;
	const w$1 = 119;
	const W$1 = 87;
	const x$2 = 120;
	const X$1 = 88;
	const y$2 = 121;
	const Y$1 = 89;
	const z$1 = 122;
	const Z$1 = 90;
	const ZERO$1 = 48;

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
	const jump_table$1 = [
	7, 	 	/* NULL */
	7, 	 	/* START_OF_HEADER */
	7, 	 	/* START_OF_TEXT */
	7, 	 	/* END_OF_TXT */
	7, 	 	/* END_OF_TRANSMISSION */
	7, 	 	/* ENQUIRY */
	7, 	 	/* ACKNOWLEDGE */
	7, 	 	/* BELL */
	7, 	 	/* BACKSPACE */
	4, 	 	/* HORIZONTAL_TAB */
	6, 	 	/* LINEFEED */
	7, 	 	/* VERTICAL_TAB */
	7, 	 	/* FORM_FEED */
	5, 	 	/* CARRIAGE_RETURN */
	7, 	 	/* SHIFT_OUT */
	7, 		/* SHIFT_IN */
	11,	 	/* DATA_LINK_ESCAPE */
	7, 	 	/* DEVICE_CTRL_1 */
	7, 	 	/* DEVICE_CTRL_2 */
	7, 	 	/* DEVICE_CTRL_3 */
	7, 	 	/* DEVICE_CTRL_4 */
	7, 	 	/* NEGATIVE_ACKNOWLEDGE */
	7, 	 	/* SYNCH_IDLE */
	7, 	 	/* END_OF_TRANSMISSION_BLOCK */
	7, 	 	/* CANCEL */
	7, 	 	/* END_OF_MEDIUM */
	7, 	 	/* SUBSTITUTE */
	7, 	 	/* ESCAPE */
	7, 	 	/* FILE_SEPERATOR */
	7, 	 	/* GROUP_SEPERATOR */
	7, 	 	/* RECORD_SEPERATOR */
	7, 	 	/* UNIT_SEPERATOR */
	3, 	 	/* SPACE */
	8, 	 	/* EXCLAMATION */
	2, 	 	/* DOUBLE_QUOTE */
	7, 	 	/* HASH */
	7, 	 	/* DOLLAR */
	8, 	 	/* PERCENT */
	8, 	 	/* AMPERSAND */
	2, 	 	/* QUOTE */
	9, 	 	/* OPEN_PARENTH */
	10, 	 /* CLOSE_PARENTH */
	8, 	 	/* ASTERISK */
	8, 	 	/* PLUS */
	7, 	 	/* COMMA */
	7, 	 	/* HYPHEN */
	7, 	 	/* PERIOD */
	7, 	 	/* FORWARD_SLASH */
	0, 	 	/* ZERO */
	0, 	 	/* ONE */
	0, 	 	/* TWO */
	0, 	 	/* THREE */
	0, 	 	/* FOUR */
	0, 	 	/* FIVE */
	0, 	 	/* SIX */
	0, 	 	/* SEVEN */
	0, 	 	/* EIGHT */
	0, 	 	/* NINE */
	8, 	 	/* COLON */
	7, 	 	/* SEMICOLON */
	8, 	 	/* LESS_THAN */
	8, 	 	/* EQUAL */
	8, 	 	/* GREATER_THAN */
	7, 	 	/* QMARK */
	7, 	 	/* AT */
	1, 	 	/* A*/
	1, 	 	/* B */
	1, 	 	/* C */
	1, 	 	/* D */
	1, 	 	/* E */
	1, 	 	/* F */
	1, 	 	/* G */
	1, 	 	/* H */
	1, 	 	/* I */
	1, 	 	/* J */
	1, 	 	/* K */
	1, 	 	/* L */
	1, 	 	/* M */
	1, 	 	/* N */
	1, 	 	/* O */
	1, 	 	/* P */
	1, 	 	/* Q */
	1, 	 	/* R */
	1, 	 	/* S */
	1, 	 	/* T */
	1, 	 	/* U */
	1, 	 	/* V */
	1, 	 	/* W */
	1, 	 	/* X */
	1, 	 	/* Y */
	1, 	 	/* Z */
	9, 	 	/* OPEN_SQUARE */
	7, 	 	/* TILDE */
	10, 	/* CLOSE_SQUARE */
	7, 	 	/* CARET */
	7, 	 	/* UNDER_SCORE */
	2, 	 	/* GRAVE */
	1, 	 	/* a */
	1, 	 	/* b */
	1, 	 	/* c */
	1, 	 	/* d */
	1, 	 	/* e */
	1, 	 	/* f */
	1, 	 	/* g */
	1, 	 	/* h */
	1, 	 	/* i */
	1, 	 	/* j */
	1, 	 	/* k */
	1, 	 	/* l */
	1, 	 	/* m */
	1, 	 	/* n */
	1, 	 	/* o */
	1, 	 	/* p */
	1, 	 	/* q */
	1, 	 	/* r */
	1, 	 	/* s */
	1, 	 	/* t */
	1, 	 	/* u */
	1, 	 	/* v */
	1, 	 	/* w */
	1, 	 	/* x */
	1, 	 	/* y */
	1, 	 	/* z */
	9, 	 	/* OPEN_CURLY */
	7, 	 	/* VERTICAL_BAR */
	10,  	/* CLOSE_CURLY */
	7,  	/* TILDE */
	7 		/* DELETE */
	];	

	/**
	 * LExer Number and Identifier jump table reference
	 * Number are masked by 12(4|8) and Identifiers are masked by 10(2|8)
	 * entries marked as `0` are not evaluated as either being in the number set or the identifier set.
	 * entries marked as `2` are in the identifier set but not the number set
	 * entries marked as `4` are in the number set but not the identifier set
	 * entries marked as `8` are in both number and identifier sets
	 */
	const number_and_identifier_table$1 = [
	0, 		/* NULL */
	0, 		/* START_OF_HEADER */
	0, 		/* START_OF_TEXT */
	0, 		/* END_OF_TXT */
	0, 		/* END_OF_TRANSMISSION */
	0, 		/* ENQUIRY */
	0,		/* ACKNOWLEDGE */
	0,		/* BELL */
	0,		/* BACKSPACE */
	0,		/* HORIZONTAL_TAB */
	0,		/* LINEFEED */
	0,		/* VERTICAL_TAB */
	0,		/* FORM_FEED */
	0,		/* CARRIAGE_RETURN */
	0,		/* SHIFT_OUT */
	0,		/* SHIFT_IN */
	0,		/* DATA_LINK_ESCAPE */
	0,		/* DEVICE_CTRL_1 */
	0,		/* DEVICE_CTRL_2 */
	0,		/* DEVICE_CTRL_3 */
	0,		/* DEVICE_CTRL_4 */
	0,		/* NEGATIVE_ACKNOWLEDGE */
	0,		/* SYNCH_IDLE */
	0,		/* END_OF_TRANSMISSION_BLOCK */
	0,		/* CANCEL */
	0,		/* END_OF_MEDIUM */
	0,		/* SUBSTITUTE */
	0,		/* ESCAPE */
	0,		/* FILE_SEPERATOR */
	0,		/* GROUP_SEPERATOR */
	0,		/* RECORD_SEPERATOR */
	0,		/* UNIT_SEPERATOR */
	0,		/* SPACE */
	0,		/* EXCLAMATION */
	0,		/* DOUBLE_QUOTE */
	0,		/* HASH */
	0,		/* DOLLAR */
	0,		/* PERCENT */
	0,		/* AMPERSAND */
	0,		/* QUOTE */
	0,		/* OPEN_PARENTH */
	0,		 /* CLOSE_PARENTH */
	0,		/* ASTERISK */
	0,		/* PLUS */
	0,		/* COMMA */
	0,		/* HYPHEN */
	0,		/* PERIOD */
	0,		/* FORWARD_SLASH */
	8,		/* ZERO */
	8,		/* ONE */
	8,		/* TWO */
	8,		/* THREE */
	8,		/* FOUR */
	8,		/* FIVE */
	8,		/* SIX */
	8,		/* SEVEN */
	8,		/* EIGHT */
	8,		/* NINE */
	0,		/* COLON */
	0,		/* SEMICOLON */
	0,		/* LESS_THAN */
	0,		/* EQUAL */
	0,		/* GREATER_THAN */
	0,		/* QMARK */
	0,		/* AT */
	2,		/* A*/
	8,		/* B */
	2,		/* C */
	2,		/* D */
	8,		/* E */
	2,		/* F */
	2,		/* G */
	2,		/* H */
	2,		/* I */
	2,		/* J */
	2,		/* K */
	2,		/* L */
	2,		/* M */
	2,		/* N */
	8,		/* O */
	2,		/* P */
	2,		/* Q */
	2,		/* R */
	2,		/* S */
	2,		/* T */
	2,		/* U */
	2,		/* V */
	2,		/* W */
	8,		/* X */
	2,		/* Y */
	2,		/* Z */
	0,		/* OPEN_SQUARE */
	0,		/* TILDE */
	0,		/* CLOSE_SQUARE */
	0,		/* CARET */
	0,		/* UNDER_SCORE */
	0,		/* GRAVE */
	2,		/* a */
	8,		/* b */
	2,		/* c */
	2,		/* d */
	2,		/* e */
	2,		/* f */
	2,		/* g */
	2,		/* h */
	2,		/* i */
	2,		/* j */
	2,		/* k */
	2,		/* l */
	2,		/* m */
	2,		/* n */
	8,		/* o */
	2,		/* p */
	2,		/* q */
	2,		/* r */
	2,		/* s */
	2,		/* t */
	2,		/* u */
	2,		/* v */
	2,		/* w */
	8,		/* x */
	2,		/* y */
	2,		/* z */
	0,		/* OPEN_CURLY */
	0,		/* VERTICAL_BAR */
	0,		/* CLOSE_CURLY */
	0,		/* TILDE */
	0		/* DELETE */
	];

	const extended_number_and_identifier_table$1 = number_and_identifier_table$1.slice();
	extended_number_and_identifier_table$1[45] = 2;
	extended_number_and_identifier_table$1[95] = 2;

	const
	    number$1 = 1,
	    identifier$1 = 2,
	    string$1 = 4,
	    white_space$1 = 8,
	    open_bracket$1 = 16,
	    close_bracket$1 = 32,
	    operator$1 = 64,
	    symbol$1 = 128,
	    new_line$1 = 256,
	    data_link$1 = 512,
	    alpha_numeric$1 = (identifier$1 | number$1),
	    white_space_new_line$1 = (white_space$1 | new_line$1),
	    Types$1 = {
	        num: number$1,
	        number: number$1,
	        id: identifier$1,
	        identifier: identifier$1,
	        str: string$1,
	        string: string$1,
	        ws: white_space$1,
	        white_space: white_space$1,
	        ob: open_bracket$1,
	        open_bracket: open_bracket$1,
	        cb: close_bracket$1,
	        close_bracket: close_bracket$1,
	        op: operator$1,
	        operator: operator$1,
	        sym: symbol$1,
	        symbol: symbol$1,
	        nl: new_line$1,
	        new_line: new_line$1,
	        dl: data_link$1,
	        data_link: data_link$1,
	        alpha_numeric: alpha_numeric$1,
	        white_space_new_line: white_space_new_line$1,
	    },

	    /*** MASKS ***/

	    TYPE_MASK$1 = 0xF,
	    PARSE_STRING_MASK$1 = 0x10,
	    IGNORE_WHITESPACE_MASK$1 = 0x20,
	    CHARACTERS_ONLY_MASK$1 = 0x40,
	    TOKEN_LENGTH_MASK$1 = 0xFFFFFF80,

	    //De Bruijn Sequence for finding index of right most bit set.
	    //http://supertech.csail.mit.edu/papers/debruijn.pdf
	    debruijnLUT$1 = [
	        0, 1, 28, 2, 29, 14, 24, 3, 30, 22, 20, 15, 25, 17, 4, 8,
	        31, 27, 13, 23, 21, 19, 16, 7, 26, 12, 18, 6, 11, 5, 10, 9
	    ];

	const getNumbrOfTrailingZeroBitsFromPowerOf2$1 = (value) => debruijnLUT$1[(value * 0x077CB531) >>> 27];

	class Lexer$1 {

	    constructor(string = "", INCLUDE_WHITE_SPACE_TOKENS = false, PEEKING = false) {

	        if (typeof(string) !== "string") throw new Error(`String value must be passed to Lexer. A ${typeof(string)} was passed as the \`string\` argument.`);

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

	        this.USE_EXTENDED_ID = false;

	        /**
	         * Flag to force the lexer to parse string contents
	         */
	        this.PARSE_STRING = false;

	        this.id_lu = number_and_identifier_table$1;

	        if (!PEEKING) this.next();
	    }

	    useExtendedId(){
	        this.id_lu = extended_number_and_identifier_table$1;
	        this.tl = 0;
	        this.next();
	        return this;
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
	    copy(destination = new Lexer$1(this.str, false, true)) {
	        destination.off = this.off;
	        destination.char = this.char;
	        destination.line = this.line;
	        destination.sl = this.sl;
	        destination.masked_values = this.masked_values;
	        destination.id_lu = this.id_lu;
	        return destination;
	    }

	    /**
	     * Given another Lexer with the same `str` property value, it will copy the state of that Lexer.
	     * @param      {Lexer}  [marker=this.peek]  The Lexer to clone the state from. 
	     * @throws     {Error} Throws an error if the Lexers reference different strings.
	     * @public
	     */
	    sync(marker = this.p) {

	        if (marker instanceof Lexer$1) {
	            if (marker.str !== this.str) throw new Error("Cannot sync Lexers with different strings!");
	            this.off = marker.off;
	            this.char = marker.char;
	            this.line = marker.line;
	            this.masked_values = marker.masked_values;
	        }

	        return this;
	    }

	    /**
	    Creates an error message with a diagram illustrating the location of the error. 
	    */
	    errorMessage(message = "") {
	        const pk = this.copy();

	        pk.IWS = false;

	        while (!pk.END && pk.ty !== Types$1.nl) { pk.next(); }

	        const end = (pk.END) ? this.str.length : pk.off,

	            nls = (this.line > 0) ? 1 : 0,
	            number_of_tabs = this.str
	                .slice(this.off - this.char + nls + nls, this.off + nls)
	                .split("")
	                .reduce((r, v) => (r + ((v.charCodeAt(0) == HORIZONTAL_TAB$1) | 0)), 0),

	            arrow = String.fromCharCode(0x2b89),

	            line = String.fromCharCode(0x2500),

	            thick_line = String.fromCharCode(0x2501),

	            line_number = `    ${this.line+1}: `,

	            line_fill = line_number.length + number_of_tabs,

	            line_text = this.str.slice(this.off - this.char + nls + (nls), end).replace(/\t/g, "  "),

	            error_border = thick_line.repeat(line_text.length + line_number.length + 2),

	            is_iws = (!this.IWS) ? "\n The Lexer produced whitespace tokens" : "",

	            msg =[ `${message} at ${this.line+1}:${this.char - nls}` ,
	            `${error_border}` ,
	            `${line_number+line_text}` ,
	            `${line.repeat(this.char-nls+line_fill-(nls))+arrow}` ,
	            `${error_border}` ,
	            `${is_iws}`].join("\n");

	        return msg;
	    }

	    /**
	     * Will throw a new Error, appending the parsed string line and position information to the the error message passed into the function.
	     * @instance
	     * @public
	     * @param {String} message - The error message.
	     * @param {Bool} DEFER - if true, returns an Error object instead of throwing.
	     */
	    throw (message, DEFER = false) {
	        const error = new Error(this.errorMessage(message));
	        if (DEFER)
	            return error;
	        throw error;
	    }

	    /**
	     * Proxy for Lexer.prototype.reset
	     * @public
	     */
	    r() { return this.reset() }

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
	    next(marker = this, USE_CUSTOM_SYMBOLS = !!this.symbol_map) {

	        if (marker.sl < 1) {
	            marker.off = 0;
	            marker.type = 32768;
	            marker.tl = 0;
	            marker.line = 0;
	            marker.char = 0;
	            return marker;
	        }

	        //Token builder
	        const l = marker.sl,
	            str = marker.str,
	            number_and_identifier_table = this.id_lu,
	            IWS = marker.IWS;

	        let length = marker.tl,
	            off = marker.off + length,
	            type = symbol$1,
	            line = marker.line,
	            base = off,
	            char = marker.char,
	            root = marker.off;

	        if (off >= l) {
	            length = 0;
	            base = l;
	            //char -= base - off;
	            marker.char = char + (base - marker.off);
	            marker.type = type;
	            marker.off = base;
	            marker.tl = 0;
	            marker.line = line;
	            return marker;
	        }

	        let NORMAL_PARSE = true;

	        if (USE_CUSTOM_SYMBOLS) {

	            let code = str.charCodeAt(off);
	            let off2 = off;
	            let map = this.symbol_map,
	                m;
	            let i = 0;

	            while (code == 32 && IWS)
	                (code = str.charCodeAt(++off2), off++);

	            while ((m = map.get(code))) {
	                map = m;
	                off2 += 1;
	                code = str.charCodeAt(off2);
	            }

	            if (map.IS_SYM) {
	                NORMAL_PARSE = false;
	                base = off;
	                length = off2 - off;
	                //char += length;
	            }
	        }

	        while (NORMAL_PARSE) {

	                base = off;

	                length = 1;

	                const code = str.charCodeAt(off);

	                if (code < 128) {

	                    switch (jump_table$1[code]) {
	                        case 0: //NUMBER
	                            while (++off < l && (12 & number_and_identifier_table[str.charCodeAt(off)]));

	                            if ((str[off] == "e" || str[off] == "E") && (12 & number_and_identifier_table[str.charCodeAt(off + 1)])) {
	                                off++;
	                                if (str[off] == "-") off++;
	                                marker.off = off;
	                                marker.tl = 0;
	                                marker.next();
	                                off = marker.off + marker.tl;
	                                //Add e to the number string
	                            }

	                            type = number$1;
	                            length = off - base;

	                            break;
	                        case 1: //IDENTIFIER
	                            while (++off < l && ((10 & number_and_identifier_table[str.charCodeAt(off)])));
	                            type = identifier$1;
	                            length = off - base;
	                            break;
	                        case 2: //QUOTED STRING
	                            if (this.PARSE_STRING) {
	                                type = symbol$1;
	                            } else {
	                                while (++off < l && str.charCodeAt(off) !== code);
	                                type = string$1;
	                                length = off - base + 1;
	                            }
	                            break;
	                        case 3: //SPACE SET
	                            while (++off < l && str.charCodeAt(off) === SPACE$1);
	                            type = white_space$1;
	                            length = off - base;
	                            break;
	                        case 4: //TAB SET
	                            while (++off < l && str[off] === HORIZONTAL_TAB$1);
	                            type = white_space$1;
	                            length = off - base;
	                            break;
	                        case 5: //CARIAGE RETURN
	                            length = 2;
	                            //intentional
	                        case 6: //LINEFEED
	                            type = new_line$1;
	                            line++;
	                            base = off;
	                            root = off;
	                            off += length;
	                            char = 0;
	                            break;
	                        case 7: //SYMBOL
	                            type = symbol$1;
	                            break;
	                        case 8: //OPERATOR
	                            type = operator$1;
	                            break;
	                        case 9: //OPEN BRACKET
	                            type = open_bracket$1;
	                            break;
	                        case 10: //CLOSE BRACKET
	                            type = close_bracket$1;
	                            break;
	                        case 11: //Data Link Escape
	                            type = data_link$1;
	                            length = 4; //Stores two UTF16 values and a data link sentinel
	                            break;
	                    }
	                } else {
	                    break;
	                }

	                if (IWS && (type & white_space_new_line$1)) {
	                    if (off < l) {
	                        type = symbol$1;
	                        //off += length;
	                        continue;
	                    } else {
	                        //Trim white space from end of string
	                        //base = l - off;
	                        //marker.sl -= off;
	                        //length = 0;
	                    }
	                }
	                break;
	        }

	        marker.type = type;
	        marker.off = base;
	        marker.tl = (this.masked_values & CHARACTERS_ONLY_MASK$1) ? Math.min(1, length) : length;
	        marker.char = char + base - root;
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
	    aC(char) { return this.assertCharacter(char) }
	    /**
	     * Compares the character value of the current token to the value passed in. Advances to next token if the two are equal.
	     * @public
	     * @throws {Error} - `Expecting "${text}" got "${this.text}"`
	     * @param {String} text - The string to compare.
	     */
	    assertCharacter(char) {

	        if (this.off < 0) this.throw(`Expecting ${char[0]} got null`);

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
	                this.p = new Lexer$1(this.str, false, true);
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
	    s(start) { return this.slice(start) }

	    /**
	     * Returns a slice of the parsed string beginning at `start` and ending at the current token.
	     * @param {Number | LexerBeta} start - The offset in this.str to begin the slice. If this value is a LexerBeta, sets the start point to the value of start.off.
	     * @return {String} A substring of the parsed string.
	     * @public
	     */
	    slice(start = this.off) {

	        if (start instanceof Lexer$1) start = start.off;

	        return this.str.slice(start, (this.off <= start) ? this.sl : this.off);
	    }

	    /**
	     * Skips to the end of a comment section.
	     * @param {boolean} ASSERT - If set to true, will through an error if there is not a comment line or block to skip.
	     * @param {Lexer} [marker=this] - If another Lexer is passed into this method, it will advance the token state of that Lexer.
	     */
	    comment(ASSERT = false, marker = this) {

	        if (!(marker instanceof Lexer$1)) return marker;

	        if (marker.ch == "/") {
	            if (marker.pk.ch == "*") {
	                marker.sync();
	                while (!marker.END && (marker.next().ch != "*" || marker.pk.ch != "/")) { /* NO OP */ }
	                marker.sync().assert("/");
	            } else if (marker.pk.ch == "/") {
	                const IWS = marker.IWS;
	                while (marker.next().ty != Types$1.new_line && !marker.END) { /* NO OP */ }
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

	    toString() {
	        return this.slice();
	    }

	    /**
	     * Returns new Whind Lexer that has leading and trailing whitespace characters removed from input. 
	     * leave_leading_amount - Maximum amount of leading space caracters to leave behind. Default is zero
	     * leave_trailing_amount - Maximum amount of trailing space caracters to leave behind. Default is zero
	     */
	    trim(leave_leading_amount = 0, leave_trailing_amount = leave_leading_amount) {
	        const lex = this.copy();

	        let space_count = 0,
	            off = lex.off;

	        for (; lex.off < lex.sl; lex.off++) {
	            const c = jump_table$1[lex.string.charCodeAt(lex.off)];

	            if (c > 2 && c < 7) {

	                if (space_count >= leave_leading_amount) {
	                    off++;
	                } else {
	                    space_count++;
	                }
	                continue;
	            }

	            break;
	        }

	        lex.off = off;
	        space_count = 0;
	        off = lex.sl;

	        for (; lex.sl > lex.off; lex.sl--) {
	            const c = jump_table$1[lex.string.charCodeAt(lex.sl - 1)];

	            if (c > 2 && c < 7) {
	                if (space_count >= leave_trailing_amount) {
	                    off--;
	                } else {
	                    space_count++;
	                }
	                continue;
	            }

	            break;
	        }

	        lex.sl = off;

	        if (leave_leading_amount > 0)
	            lex.IWS = false;

	        lex.token_length = 0;

	        lex.next();

	        return lex;
	    }

	    /** Adds symbol to symbol_map. This allows custom symbols to be defined and tokenized by parser. **/
	    addSymbol(sym) {
	        if (!this.symbol_map)
	            this.symbol_map = new Map;


	        let map = this.symbol_map;

	        for (let i = 0; i < sym.length; i++) {
	            let code = sym.charCodeAt(i);
	            let m = map.get(code);
	            if (!m) {
	                m = map.set(code, new Map).get(code);
	            }
	            map = m;
	        }
	        map.IS_SYM = true;
	    }

	    /*** Getters and Setters ***/
	    get string() {
	        return this.str;
	    }

	    get string_length() {
	        return this.sl - this.off;
	    }

	    set string_length(s) {}

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
	    get tx() { return this.text }

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
	    get ty() { return this.type }

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
	    get pk() { return this.peek() }

	    /**
	     * Proxy for Lexer.prototype.next
	     * @public
	     */
	    get n() { return this.next() }

	    get END() { return this.off >= this.sl }
	    set END(v) {}

	    get type() {
	        return 1 << (this.masked_values & TYPE_MASK$1);
	    }

	    set type(value) {
	        //assuming power of 2 value.
	        this.masked_values = (this.masked_values & ~TYPE_MASK$1) | ((getNumbrOfTrailingZeroBitsFromPowerOf2$1(value)) & TYPE_MASK$1);
	    }

	    get tl() {
	        return this.token_length;
	    }

	    set tl(value) {
	        this.token_length = value;
	    }

	    get token_length() {
	        return ((this.masked_values & TOKEN_LENGTH_MASK$1) >> 7);
	    }

	    set token_length(value) {
	        this.masked_values = (this.masked_values & ~TOKEN_LENGTH_MASK$1) | (((value << 7) | 0) & TOKEN_LENGTH_MASK$1);
	    }

	    get IGNORE_WHITE_SPACE() {
	        return this.IWS;
	    }

	    set IGNORE_WHITE_SPACE(bool) {
	        this.iws = !!bool;
	    }

	    get CHARACTERS_ONLY() {
	        return !!(this.masked_values & CHARACTERS_ONLY_MASK$1);
	    }

	    set CHARACTERS_ONLY(boolean) {
	        this.masked_values = (this.masked_values & ~CHARACTERS_ONLY_MASK$1) | ((boolean | 0) << 6);
	    }

	    get IWS() {
	        return !!(this.masked_values & IGNORE_WHITESPACE_MASK$1);
	    }

	    set IWS(boolean) {
	        this.masked_values = (this.masked_values & ~IGNORE_WHITESPACE_MASK$1) | ((boolean | 0) << 5);
	    }

	    get PARSE_STRING() {
	        return !!(this.masked_values & PARSE_STRING_MASK$1);
	    }

	    set PARSE_STRING(boolean) {
	        this.masked_values = (this.masked_values & ~PARSE_STRING_MASK$1) | ((boolean | 0) << 4);
	    }

	    /**
	     * Reference to token id types.
	     */
	    get types() {
	        return Types$1;
	    }
	}

	Lexer$1.prototype.addCharacter = Lexer$1.prototype.addSymbol;

	function whind$2(string, INCLUDE_WHITE_SPACE_TOKENS = false) { return new Lexer$1(string, INCLUDE_WHITE_SPACE_TOKENS) }

	whind$2.constructor = Lexer$1;

	Lexer$1.types = Types$1;
	whind$2.types = Types$1;

	const uri_reg_ex = /(?:([a-zA-Z][\dA-Za-z\+\.\-]*)(?:\:\/\/))?(?:([a-zA-Z][\dA-Za-z\+\.\-]*)(?:\:([^\<\>\:\?\[\]\@\/\#\b\s]*)?)?\@)?(?:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|((?:\[[0-9a-f]{1,4})+(?:\:[0-9a-f]{0,4}){2,7}\])|([^\<\>\:\?\[\]\@\/\#\b\s\.]{2,}(?:\.[^\<\>\:\?\[\]\@\/\#\b\s]*)*))?(?:\:(\d+))?((?:[^\?\[\]\#\s\b]*)+)?(?:\?([^\[\]\#\s\b]*))?(?:\#([^\#\s\b]*))?/i;

	const STOCK_LOCATION = {
	    protocol: "",
	    host: "",
	    port: "",
	    path: "",
	    hash: "",
	    query: "",
	    search: ""
	};

	function fetchLocalText(URL, m = "same-origin") {
	    return new Promise((res, rej) => {
	        fetch(URL, {
	            mode: m, // CORs not allowed
	            credentials: m,
	            method: "GET"
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
	            method: "GET"
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

	    static resolveRelative(URL_or_url_new, URL_or_url_original = document.location.toString(), ) {

	        let URL_old = (URL_or_url_original instanceof URL) ? URL_or_url_original : new URL(URL_or_url_original);
	        let URL_new = (URL_or_url_new instanceof URL) ? URL_or_url_new : new URL(URL_or_url_new);

	        if (!(URL_old + "") || !(URL_new + "")) return null;

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

	        let IS_STRING = true,
	            IS_LOCATION = false;


	        let location = (typeof(document) !== "undefined") ? document.location : STOCK_LOCATION;

	        if (typeof(Location) !== "undefined" && url instanceof Location) {
	            location = url;
	            url = "";
	            IS_LOCATION = true;
	        }
	        if (!url || typeof(url) != "string") {
	            IS_STRING = false;
	            IS_LOCATION = true;
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

	                //If the complete string is not matched than we are dealing with something other 
	                //than a pure URL. Thus, no object is returned. 
	                if (part[0] !== url) return null;

	                this.protocol = part[1] || ((USE_LOCATION) ? location.protocol : "");
	                this.user = part[2] || "";
	                this.pwd = part[3] || "";
	                this.host = part[4] || part[5] || part[6] || ((USE_LOCATION) ? location.hostname : "");
	                this.port = parseInt(part[7] || ((USE_LOCATION) ? location.port : 0));
	                this.path = part[8] || ((USE_LOCATION) ? location.pathname : "");
	                this.query = part[9] || ((USE_LOCATION) ? location.search.slice(1) : "");
	                this.hash = part[10] || ((USE_LOCATION) ? location.hash.slice(1) : "");

	            }
	        } else if (IS_LOCATION) {
	            this.protocol = location.protocol.replace(/\:/g, "");
	            this.host = location.hostname;
	            this.port = location.port;
	            this.path = location.pathname;
	            this.hash = location.hash.slice(1);
	            this.query = location.search.slice(1);
	            this._getQuery_(this.query);

	            if (USE_LOCATION) {
	                URL.G = this;
	                return URL.R;
	            }
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

	        let lex = whind$2(this.query);


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

	    setPath(path) {

	        this.path = path;

	        return new URL(this);
	    }

	    setLocation() {
	        history.replaceState({}, "replaced state", `${this}`);
	        window.onpopstate();
	    }

	    toString() {
	        let str = [];

	        if (this.host) {

	            if (this.protocol)
	                str.push(`${this.protocol}://`);

	            str.push(`${this.host}`);
	        }

	        if (this.port)
	            str.push(`:${this.port}`);

	        if (this.path)
	            str.push(`${this.path[0] == "/" ? "" : "/"}${this.path}`);

	        if (this.query)
	            str.push(((this.query[0] == "?" ? "" : "?") + this.query));

	        if (this.hash)
	            str.push("#" + this.hash);


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

	    submitJSON(json_data, mode) {
	        return submitJSON(this.toString(), json_data, mode);
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
	    //Returns the last segment of the path
	    get file() {
	        return this.path.split("/").pop();
	    }
	    //returns the name of the file less the extension
	    get filename() {
	        return this.file.split(".").shift();
	    }



	    //Returns the all but the last segment of the path
	    get dir() {
	        return this.path.split("/").slice(0, -1).join("/") || "/";
	    }

	    get pathname() {
	        return this.path;
	    }

	    get href() {
	        return this.toString();
	    }

	    get ext() {
	        const m = this.path.match(/\.([^\.]*)$/);
	        return m ? m[1] : "";
	    }

	    get search() {
	        return this.query;
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
	    setPath(path) {
	        return URL.G.setPath(path);
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





	let SIMDATA = null;

	/* Replaces the fetch actions with functions that simulate network fetches. Resources are added by the user to a Map object. */
	URL.simulate = function() {
	    SIMDATA = new Map;
	    URL.prototype.fetchText = async d => ((d = this.toString()), SIMDATA.get(d)) ? SIMDATA.get(d) : "";
	    URL.prototype.fetchJSON = async d => ((d = this.toString()), SIMDATA.get(d)) ? JSON.parse(SIMDATA.get(d).toString()) : {};
	};

	//Allows simulated resources to be added as a key value pair, were the key is a URI string and the value is string data.
	URL.addResource = (n, v) => (n && v && (SIMDATA || (SIMDATA = new Map())) && SIMDATA.set(n.toString(), v.toString));

	URL.polyfill = async function() {

	    if (typeof(global) !== "undefined") {

	        const 
	            fs = (await import('fs')).promises,
	            path = (await import('path'));


	        global.Location = (class extends URL {});

	        global.document = global.document || {};

	        global.document.location = new URL(process.cwd() + "/");
	        /**
	         * Global `fetch` polyfill - basic support
	         */
	        global.fetch = async (url, data) => {
	            let
	                p = path.resolve(process.cwd(), "" + url),
	                d = await fs.readFile(p, "utf8");

	            try {
	                return {
	                    status: 200,
	                    text: () => {
	                        return {
	                            then: (f) => f(d)
	                        }
	                    }
	                };
	            } catch (err) {
	                throw err;
	            }
	        };
	    }
	};

	Object.freeze(URL.R);
	Object.freeze(URL.RC);
	Object.seal(URL);

	class CSS_URL extends URL {
	    static parse(l) {
	        if (l.tx == "url" || l.tx == "uri") {
	            l.next().a("(");
	            let v = "";
	            if (l.ty == l.types.str) {
	                v = l.tx.slice(1,-1);
	                l.next().a(")");
	            } else {
	                const p = l.peek();
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

	    static parse(l) {
	        if (l.ty == l.types.str) {
	            let tx = l.tx;
	            l.next();
	            return new CSS_String(tx);
	        }
	        return null;
	    }

	    constructor(string) {
	        //if(string[0] == "\"" || string[0] == "\'" || string[0] == "\'")
	        //    string = string.slice(1,-1);
	        super(string);
	    }
	}

	class CSS_Id extends String {
	    static parse(l) {
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
	    static parse(l) {
	        if (l.tx == "inset" || l.tx == "circle" || l.tx == "ellipse" || l.tx == "polygon" || l.tx == "rect") {
	            l.next().a("(");
	            let v = "";
	            if (l.ty == l.types.str) {
	                v = l.tx.slice(1,-1);
	                l.next().a(")");
	            } else {
	                let p = l.pk;
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

	    static parse(l) {
	        
	        let sign = 1;

	        if(l.ch == "-" && l.pk.ty == l.types.num){
	        	l.sync();
	        	sign = -1;
	        }

	        if(l.ty == l.types.num){
	        	let tx = l.tx;
	            l.next();
	            return new CSS_Number(sign*(new Number(tx)));
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
		static parse(l) {

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

		toString(){
			 return `cubic-bezier(${this[2]},${this[3]},${this[4]},${this[5]})`;
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

	    static parse(l) {
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
	                        if(!(len = CSS_Length.parse(l)))
	                            len = CSS_Percentage.parse(l);
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
	        parse: function(a) {
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

	    lex.next();

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
	        lex.next();
	    }
	    return n;
	}

	function ParseString(string, transform) {
	    let lex = null;
	    lex = string;

	    if(typeof(string) == "string")
	        lex = whind$1(string);
	    
	    while (!lex.END) {
	        let tx = lex.tx;
	        lex.next();
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
	        lex.next();
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
	        if (px !== undefined) {
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
	    lex.next();
	    return parseFloat(tx) * mult;
	}

	function getNumberPair(lex, array) {
	    let x = getSignedNumber(lex);
	    if (lex.ch == ',') lex.next();
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
	                    lex.next(); //
	                    array.push((relative) ? PathSym.m : PathSym.M);
	                    getNumberPair(lex, array);
	                    parseNumberPairs(lex, array);
	                    continue;
	                    //Line to
	                case "h":
	                    relative = true;
	                case "H":
	                    lex.next();
	                    x = getSignedNumber(lex);
	                    array.push((relative) ? PathSym.h : PathSym.H, x);
	                    continue;
	                case "v":
	                    relative = true;
	                case "V":
	                    lex.next();
	                    y = getSignedNumber(lex);
	                    array.push((relative) ? PathSym.v : PathSym.V, y);
	                    continue;
	                case "l":
	                    relative = true;
	                case "L":
	                    lex.next();
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
	            lex.next();
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

	class CSS_FontName extends String {
		static parse(l) {

			if(l.ty == l.types.str){
				let tx = l.tx;
	            l.next();
				return new CSS_String(tx);
			}		

			if(l.ty == l.types.id){

				let pk = l.peek();

				while(pk.type == l.types.id && !pk.END){
					pk.next();
				}

				let str = pk.slice(l);
				
				l.sync();
				return new CSS_String(str);
			}

	        return null;
	    }
	}

	/**
	 * CSS Type constructors
	 */
	const types = {
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
		fontname: CSS_FontName,

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
	 */
	const property_definitions = {

		/* https://drafts.csswg.org/css-writing-modes-3/ */
			direction:"ltr|rtl",
			unicode_bidi:"normal|embed|isolate|bidi-override|isolate-override|plaintext",
			writing_mode:"horizontal-tb|vertical-rl|vertical-lr",
			text_orientation:"mixed|upright|sideways",
			glyph_orientation_vertical:`auto|0deg|90deg|"0"|"90"`,
			text_combine_upright:"none|all",

		/* https://www.w3.org/TR/css-position-3 */ 
			position: "static|relative|absolute|sticky|fixed",
			top: `<length>|<number>|<percentage>|auto`,
			left: `<length>|<number>|<percentage>|auto`,
			bottom: `<length>|<number>|<percentage>|auto`,
			right: `<length>|<number>|<percentage>|auto`,
			offset_before: `<length>|<percentage>|auto`,
			offset_after: `<length>|<percentage>|auto`,
			offset_start: `<length>|<percentage>|auto`,
			offset_end: `<length>|<percentage>|auto`,
			z_index:"auto|<integer>",

		/* https://www.w3.org/TR/css-display-3/ */
			display: `[ <display_outside> || <display_inside> ] | <display_listitem> | <display_internal> | <display_box> | <display_legacy>`,

		/* https://www.w3.org/TR/css-box-3 */
			margin: `[<length>|<percentage>|0|auto]{1,4}`,
			margin_top: `<length>|<percentage>|0|auto`,
			margin_right: `<length>|<percentage>|0|auto`,
			margin_bottom: `<length>|<percentage>|0|auto`,
			margin_left: `<length>|<percentage>|0|auto`,

			margin_trim:"none|in-flow|all",

			padding: `[<length>|<percentage>|0|auto]{1,4}`,
			padding_top: `<length>|<percentage>|0|auto`,
			padding_right: `<length>|<percentage>|0|auto`,
			padding_bottom: `<length>|<percentage>|0|auto`,
			padding_left: `<length>|<percentage>|0|auto`,

		/* https://www.w3.org/TR/CSS2/visuren.html */
			float: `left|right|none`,
			clear: `left|right|both|none`,

		/* https://drafts.csswg.org/css-sizing-3 todo:implement fit-content(%) function */
			box_sizing: `content-box | border-box`,
			width: `<length>|<percentage>|min-content|max-content|fit-content|auto`,
			height: `<length>|<percentage>|min-content|max-content|fit-content|auto`,
			min_width: `<length>|<percentage>|min-content|max-content|fit-content|auto`,
			max_width: `<length>|<percentage>|min-content|max-content|fit-content|auto|none`,
			min_height: `<length>|<percentage>|min-content|max-content|fit-content|auto`,
			max_height: `<length>|<percentage>|min-content|max-content|fit-content|auto|none`,

		/* https://www.w3.org/TR/2018/REC-css-color-3-20180619 */
			color: `<color>`,
			opacity: `<alphavalue>`,

		/* https://www.w3.org/TR/css-backgrounds-3/ */
			background_color: `<color>|red`,
			background_image: `<bg_image>#`,
			background_repeat: `<repeat_style>#`,
			background_attachment: `scroll|fixed|local`,
			background_position: `[<percentage>|<length>]{1,2}|[top|center|bottom]||[left|center|right]`,
			background_clip: `<box>#`,
			background_origin: `<box>#`,
			background_size: `<bg_size>#`,
			background: `[<bg_layer>#,]?<final_bg_layer>`,
			border_color: `<color>{1,4}`,
			border_top_color: `<color>`,
			border_right_color: `<color>`,
			border_bottom_color: `<color>`,
			border_left_color: `<color>`,

			border_top_width: `<line_width>`,
			border_right_width: `<line_width>`,
			border_bottom_width: `<line_width>`,
			border_left_width: `<line_width>`,
			border_width: `<line_width>{1,4}`,

			border_style: `<line_style>{1,4}`,
			border_top_style: `<line_style>`,
			border_right_style: `<line_style>`,
			border_bottom_style: `<line_style>`,
			border_left_style: `<line_style>`,

			border_top: `<line_width>||<line_style>||<color>`,
			border_right: `<line_width>||<line_style>||<color>`,
			border_bottom: `<line_width>||<line_style>||<color>`,
			border_left: `<line_width>||<line_style>||<color>`,

			border_radius: `<length_percentage>{1,4}[ / <length_percentage>{1,4}]?`,
			border_top_left_radius: `<length_percentage>{1,2}`,
			border_top_right_radius: `<length_percentage>{1,2}`,
			border_bottom_right_radius: `<length_percentage>{1,2}`,
			border_bottom_left_radius: `<length_percentage>{1,2}`,

			border: `<line_width>||<line_style>||<color>`,

			border_image: `<border_image_source>||<border_image_slice>[/<border_image_width>|/<border_image_width>?/<border_image_outset>]?||<border_image_repeat>`,
			border_image_source: `none|<image>`,
			border_image_slice: `[<number>|<percentage>]{1,4}&&fill?`,
			border_image_width: `[<length_percentage>|<number>|auto]{1,4}`,
			border_image_outset: `[<length>|<number>]{1,4}`,
			border_image_repeat: `[stretch|repeat|round|space]{1,2}`,
			box_shadow: `none|<shadow>#`,
			line_height: `normal|<percentage>|<length>|<number>`,
			overflow: 'visible|hidden|scroll|auto',

		/* https://www.w3.org/TR/css-fonts-4 */
			font_display: "auto|block|swap|fallback|optional",
			font_family: `[<generic_family>|<family_name>]#`,
			font_language_override:"normal|<string>",
			font: `[[<font_style>||<font_variant>||<font_weight>]?<font_size>[/<line_height>]?<font_family>]|caption|icon|menu|message-box|small-caption|status-bar`,
			font_max_size: `<absolute_size>|<relative_size>|<length>|<percentage>|infinity`,
			font_min_size: `<absolute_size>|<relative_size>|<length>|<percentage>`,
			font_optical_sizing: `auto|none`,
			font_pallette: `normal|light|dark|<identifier>`,
			font_size: `<absolute_size>|<relative_size>|<length>|<percentage>`,
			font_stretch:"<percentage>|normal|ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded",
			font_style: `normal|italic|oblique<angle>?`,
			font_synthesis:"none|[weight||style]",
			font_synthesis_small_caps:"auto|none",
			font_synthesis_style:"auto|none",
			font_synthesis_weight:"auto|none",
			font_variant_alternates:"normal|[stylistic(<feature-value-name>)||historical-forms||styleset(<feature-value-name>#)||character-variant(<feature-value-name>#)||swash(<feature-value-name>)||ornaments(<feature-value-name>)||annotation(<feature-value-name>)]",
			font_variant_emoji:"auto|text|emoji|unicode",
			font_variation_settings:" normal|[<string><number>]#",
			font_size_adjust: `<number>|none`,
			
			font_weight: `normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900`,

		/* https://www.w3.org/TR/css-fonts-3/ */
			font_kerning: ` auto | normal | none`,
			font_variant: `normal|none|[<common-lig-values>||<discretionary-lig-values>||<historical-lig-values>||<contextual-alt-values>||[small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps]||<numeric-figure-values>||<numeric-spacing-values>||<numeric-fraction-values>||ordinal||slashed-zero||<east-asian-variant-values>||<east-asian-width-values>||ruby||[sub|super]]`,
			font_variant_ligatures:`normal|none|[<common-lig-values>||<discretionary-lig-values>||<historical-lig-values>||<contextual-alt-values> ]`,
			font_variant_position:`normal|sub|super`,
			font_variant_caps:`normal|small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps`,
			font_variant_numeric: "normal | [ <numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero ]",
			font_variant_east_asian:" normal | [ <east-asian-variant-values> || <east-asian-width-values> || ruby ]",

		/* https://drafts.csswg.org/css-text-3 */
			hanging_punctuation : "none|[first||[force-end|allow-end]||last]",
			hyphens : "none|manual|auto",
			letter_spacing: `normal|<length>`,
			line_break : "auto|loose|normal|strict|anywhere",
			overflow_wrap : "normal|break-word|anywhere",
			tab_size : "<length>|<number>",
			text_align : "start|end|left|right|center|justify|match-parent|justify-all",
			text_align_all : "start|end|left|right|center|justify|match-parent",
			text_align_last : "auto|start|end|left|right|center|justify|match-parent",
			text_indent : "[[<length>|<percentage>]&&hanging?&&each-line?]",
			text_justify : "auto|none|inter-word|inter-character",
			text_transform : "none|[capitalize|uppercase|lowercase]||full-width||full-size-kana",
			white_space : "normal|pre|nowrap|pre-wrap|break-spaces|pre-line",
			word_break : " normal|keep-all|break-all|break-word",
			word_spacing : "normal|<length>",
			word_wrap : "  normal | break-word | anywhere",

		/* https://drafts.csswg.org/css-text-decor-3 */
			text_decoration: "<text-decoration-line>||<text-decoration-style>||<color>",
			text_decoration_color:"<color>",
			text_decoration_line:"none|[underline||overline||line-through||blink]",
			text_decoration_style:"solid|double|dotted|dashed|wavy",
			text_emphasis:"<text-emphasis-style>||<text-emphasis-color>",
			text_emphasis_color:"<color>",
			text_emphasis_position:"[over|under]&&[right|left]?",
			text_emphasis_style:"none|[[filled|open]||[dot|circle|double-circle|triangle|sesame]]|<string>",
			text_shadow:"none|[<color>?&&<length>{2,3}]#",
			text_underline_position:"auto|[under||[left|right]]",

		/* Flex Box https://www.w3.org/TR/css-flexbox-1/ */
			align_content: `flex-start | flex-end | center | space-between | space-around | stretch`,
			align_items: `flex-start | flex-end | center | baseline | stretch`,
			align_self: `auto | flex-start | flex-end | center | baseline | stretch`,
			flex:`none|[<flex-grow> <flex-shrink>?||<flex-basis>]`,
			flex_basis:`content|<width>`,
			flex_direction:`row | row-reverse | column | column-reverse`,
			flex_flow:`<flex-direction>||<flex-wrap>`,
			flex_grow:`<number>`,
			flex_shrink:`<number>`,
			flex_wrap:`nowrap|wrap|wrap-reverse`,
			justify_content :"flex-start | flex-end | center | space-between | space-around",
			order:`<integer>`,

		/* https://drafts.csswg.org/css-transitions-1/ */
			transition: `<single_transition>#`,
			transition_delay: `<time>#`,
			transition_duration: `<time>#`,
			transition_property: `none|<single_transition_property>#`,
			transition_timing_function: `<timing_function>#`,

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

		/* https://svgwg.org/svg2-draft/interact.html#PointerEventsProperty */
			pointer_events : `visiblePainted|visibleFill|visibleStroke|visible|painted|fill|stroke|all|none|auto`,

		/* https://drafts.csswg.org/css-ui-3 */
			caret_color :"auto|<color>",
			cursor:"[[<url> [<number><number>]?,]*[auto|default|none|context-menu|help|pointer|progress|wait|cell|crosshair|text|vertical-text|alias|copy|move|no-drop|not-allowed|grab|grabbing|e-resize|n-resize|ne-resize|nw-resize|s-resize|se-resize|sw-resize|w-resize|ew-resize|ns-resize|nesw-resize|nwse-resize|col-resize|row-resize|all-scroll|zoom-in|zoom-out]]",
			outline:"[<outline-color>||<outline-style>||<outline-width>]",
			outline_color:"<color>|invert",
			outline_offset:"<length>",
			outline_style:"auto|<border-style>",
			outline_width:"<line-width>",
			resize:"none|both|horizontal|vertical",
			text_overflow:"clip|ellipsis",

		/* https://drafts.csswg.org/css-content-3/ */
			bookmark_label:"<content-list>",
			bookmark_level:"none|<integer>",
			bookmark_state:"open|closed",
			content:"normal|none|[<content-replacement>|<content-list>][/<string>]?",
			quotes:"none|[<string><string>]+",
			string_set:"none|[<custom-ident><string>+]#",
		
		/*https://www.w3.org/TR/CSS22/tables.html*/
			caption_side:"top|bottom",
			table_layout:"auto|fixed",
			border_collapse:"collapse|separate",
			border_spacing:"<length><length>?",
			empty_cells:"show|hide",

		/* https://www.w3.org/TR/CSS2/page.html */
			page_break_before:"auto|always|avoid|left|right",
			page_break_after:"auto|always|avoid|left|right",
			page_break_inside:"auto|avoid|left|right",
			orphans:"<integer>",
			widows:"<integer>",

		/* https://drafts.csswg.org/css-lists-3 */
			counter_increment:"[<custom-ident> <integer>?]+ | none",
			counter_reset:"[<custom-ident> <integer>?]+|none",
			counter_set:"[<custom-ident> <integer>?]+|none",
			list_style:"<list-style-type>||<list-style-position>||<list-style-image>",
			list_style_image:"<url>|none",
			list_style_position:"inside|outside",
			list_style_type:"<counter-style>|<string>|none",
			marker_side:"list-item|list-container",


		vertical_align: `baseline|sub|super|top|text-top|middle|bottom|text-bottom|<percentage>|<length>`,

		/* Visual Effects */
		clip: '<shape>|auto',
		visibility: `visible|hidden|collapse`,
		content: `normal|none|[<string>|<uri>|<counter>|attr(<identifier>)|open-quote|close-quote|no-open-quote|no-close-quote]+`,
		quotas: `[<string><string>]+|none`,
		counter_reset: `[<identifier><integer>?]+|none`,
		counter_increment: `[<identifier><integer>?]+|none`,
	};

	/* Properties that are not directly accessible by CSS prop creator */

	const virtual_property_definitions = {
	    /* https://drafts.csswg.org/css-counter-styles-3 */
	        /*system:`cyclic|numeric|alphabetic|symbolic|additive|[fixed<integer>?]|[extends<counter-style-name>]`,
	        negative:`<symbol><symbol>?`,
	        prefix:`<symbol>`,
	        suffix:`<symbol>`,
	        range:`[[<integer>|infinite]{2}]#|auto`,
	        pad:`<integer>&&<symbol>`,
	        fallback:`<counter-style-name>`
	        symbols:`<symbol>+`,*/

	        counter_style:`<numeric_counter_style>|<alphabetic_counter_style>|<symbolic_counter_style>|<japanese_counter_style>|<korean_counter_style>|<chinese_counter_style>|ethiopic-numeric`,
	        numeric_counter_style:`decimal|decimal-leading-zero|arabic-indic|armenian|upper-armenian|lower-armenian|bengali|cambodian|khmer|cjk-decimal|devanagari|georgian|gujarati|gurmukhi|hebrew|kannada|lao|malayalam|mongolian|myanmar|oriya|persian|lower-roman|upper-roman|tamil|telugu|thai|tibetan`,
	        symbolic_counter_style:`disc|circle|square|disclosure-open|disclosure-closed`,
	        alphabetic_counter_style:`lower-alpha|lower-latin|upper-alpha|upper-latin|cjk-earthly-branch|cjk-heavenly-stem|lower-greek|hiragana|hiragana-iroha|katakana|katakana-iroha`,
	        japanese_counter_style:`japanese-informal|japanese-formal`,
	        korean_counter_style:`korean-hangul-formal|korean-hanja-informal|and korean-hanja-formal`,
	        chinese_counter_style:`simp-chinese-informal|simp-chinese-formal|trad-chinese-informal|and trad-chinese-formal`,

		/* https://drafts.csswg.org/css-conte-3/ */
			content_list:"[<string>|contents|<image>|<quote>|<target>|<leader()>]+",
			content_replacement:"<image>",

		/* https://drafts.csswg.org/css-values-4 */
			custom_ident:"<identifier>",
			position:"[[left|center|right]||[top|center|bottom]|[left|center|right|<length-percentage>][top|center|bottom|<length-percentage>]?|[[left|right]<length-percentage>]&&[[top|bottom]<length-percentage>]]",
		
		/* https://drafts.csswg.org/css-lists-3 */

		east_asian_variant_values:"[jis78|jis83|jis90|jis04|simplified|traditional]",

		alphavalue: '<number>',

		box: `border-box|padding-box|content-box`,

		/*Font-Size: www.w3.org/TR/CSS2/fonts.html#propdef-font-size */
		absolute_size: `xx-small|x-small|small|medium|large|x-large|xx-large`,
		relative_size: `larger|smaller`,

		/*https://www.w3.org/TR/css-backgrounds-3/#property-index*/

		bg_layer: `<bg_image>||<bg_position>[/<bg_size>]?||<repeat_style>||<attachment>||<box>||<box>`,
		final_bg_layer: `<background_color>||<bg_image>||<bg_position>[/<bg_size>]?||<repeat_style>||<attachment>||<box>||<box>`,
		bg_image: `<url>|<gradient>|none`,
		repeat_style: `repeat-x|repeat-y|[repeat|space|round|no-repeat]{1,2}`,
		background_attachment: `<attachment>#`,
		bg_size: `[<length_percentage>|auto]{1,2}|cover|contain`,
		bg_position: `[[left|center|right|top|bottom|<length_percentage>]|[left|center|right|<length_percentage>][top|center|bottom|<length_percentage>]|[center|[left|right]<length_percentage>?]&&[center|[top|bottom]<length_percentage>?]]`,
		attachment: `scroll|fixed|local`,
		line_style: `none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset`,
		line_width: `thin|medium|thick|<length>`,
		shadow: `inset?&&<length>{2,4}&&<color>?`,

		/* Font https://www.w3.org/TR/css-fonts-4/#family-name-value */
		
		family_name: `<fontname>`,
		generic_family: `serif|sans-serif|cursive|fantasy|monospace`,
		
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
		display_listitem : `<display_outside>? && [ flow | flow-root ]? && list-item`,
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

	var step = 0;

	function checkDefaults(lx) {
	    const tx = lx.tx;
	    /* https://drafts.csswg.org/css-cascade/#inherited-property */
	    switch (lx.tx) {
	        case "initial": //intentional
	        case "inherit": //intentional
	        case "unset": //intentional
	        case "revert": //intentional
	            if (!lx.pk.pk.END) // These values should be the only ones present. Failure otherwise.
	                return 0; // Default value present among other values. Invalid
	            return 1; // Default value present only. Valid
	    };
	    return 2; // Default value not present. Ignore
	}

	class JUX { /* Juxtaposition */

	    get type(){
	        return "jux";
	    }

	    constructor() {
	        this.id = JUX.step++;
	        this.r = [NaN, NaN];
	        this.terms = [];
	        this.HAS_PROP = false;
	        this.name = "";
	        this.virtual = false;
	        this.REQUIRE_COMMA = false;
	    }
	    mergeValues(existing_v, new_v) {
	        if (existing_v)
	            if (existing_v.v) {
	                if (Array.isArray(existing_v.v))
	                    existing_v.v.push(new_v.v);
	                else {
	                    existing_v.v = [existing_v.v, new_v.v];
	                }
	            } else
	                existing_v.v = new_v.v;
	    }

	    seal() {

	    }

	    sp(value, out_val) { /* Set Property */
	        if (this.HAS_PROP) {
	            if (value)
	                if (Array.isArray(value) && value.length === 1 && Array.isArray(value[0]))
	                    out_val[0] = value[0];
	                else
	                    out_val[0] = value;
	        }
	    }

	    isRepeating() {
	        return !(isNaN(this.r[0]) && isNaN(this.r[1]));
	    }

	    parse(data) {
	        const prop_data = [];

	        this.parseLVL1(data instanceof whind$1.constructor ? data : whind$1(data + ""), prop_data);

	        return prop_data;
	    }



	    parseLVL1(lx, out_val = [], ROOT = true) {

	        if (typeof(lx) == "string")
	            lx = whind$1(lx);

	        let bool = false;

	        if (ROOT) {
	            switch (checkDefaults(lx)) {
	                case 1:
	                    this.sp(lx.tx, out_val);
	                    return true;
	                case 0:
	                    return false;
	            }
	            bool = this.parseLVL2(lx, out_val, this.start, this.end);
	        } else
	            bool = this.parseLVL2(lx, out_val, this.start, this.end);

	        return bool;
	    }

	    checkForComma(lx, out_val, temp_val = [], j = 0) {
	        if (this.REQUIRE_COMMA) {
	            if (out_val) {
	                if (j > 0)
	                    out_val.push(",", ...temp_val);
	                else
	                    out_val.push(...temp_val);
	            }

	            if (lx.ch !== ",")
	                return false;

	            lx.next();
	        } else if(out_val)
	            out_val.push(...temp_val);

	        return true;
	    }

	    parseLVL2(lx, out_val, start, end) {

	        let bool = false,
	            copy = lx.copy(),
	            temp_val = [];

	        repeat:
	            for (let j = 0; j < end && !lx.END; j++) {

	                //const copy = lx.copy();

	                const temp = [];

	                for (let i = 0, l = this.terms.length; i < l; i++) {

	                    const term = this.terms[i];

	                    if (!term.parseLVL1(copy, temp, false)) {
	                        if (!term.OPTIONAL) {
	                            break repeat;
	                        }
	                    }
	                }

	                temp_val.push(...temp);

	                lx.sync(copy);

	                bool = true;

	                if (!this.checkForComma(copy, out_val, temp_val, j))
	                    break;
	            }

	        return bool;
	    }

	    get start() {
	        return isNaN(this.r[0]) ? 1 : this.r[0];
	    }
	    set start(e) {}

	    get end() {
	        return isNaN(this.r[1]) ? 1 : this.r[1];
	    }
	    set end(e) {}

	    get OPTIONAL() { return this.r[0] === 0 }
	    set OPTIONAL(a) {}
	}
	JUX.step = 0;
	class AND extends JUX {

	    get type(){
	        return "and";
	    }
	    parseLVL2(lx, out_val, start, end) {

	        const
	            PROTO = new Array(this.terms.length),
	            l = this.terms.length;

	        let bool = false,
	            temp_val = [],
	            copy = lx.copy();

	        repeat:
	            for (let j = 0; j < end && !lx.END; j++) {

	                const
	                    HIT = PROTO.fill(0);
	                //temp_r = [];

	                and:
	                    while (!copy.END) {
	                        let FAILED = false;



	                        for (let i = 0; i < l; i++) {

	                            if (HIT[i] === 2) continue;

	                            let term = this.terms[i];

	                            const temp = [];

	                            if (!term.parseLVL1(copy, temp, false)) {
	                                if (term.OPTIONAL)
	                                    HIT[i] = 1;
	                            } else {
	                                temp_val.push(...temp);
	                                HIT[i] = 2;
	                                continue and;
	                            }
	                        }

	                        if (HIT.reduce((a, v) => a * v, 1) === 0)
	                            break repeat;

	                        break
	                    }

	                lx.sync(copy);

	                bool = true;

	                if (!this.checkForComma(copy, out_val, temp_val, j))
	                    break;
	            }

	        return bool;
	    }
	}

	class OR extends JUX {
	    get type(){
	        return "or";
	    }
	    parseLVL2(lx, out_val, start, end) {

	        const
	            PROTO = new Array(this.terms.length),
	            l = this.terms.length;

	        let
	            bool = false,
	            NO_HIT = true,
	            copy = lx.copy(),
	            temp_val = [];

	        repeat:
	            for (let j = 0; j < end && !lx.END; j++) {

	                const HIT = PROTO.fill(0);
	                let temp_r = { v: null };

	                or:
	                    while (!copy.END) {
	                        let FAILED = false;
	                        for (let i = 0; i < l; i++) {

	                            if (HIT[i] === 2) continue;

	                            let term = this.terms[i];

	                            if (term.parseLVL1(copy, temp_val, false)) {
	                                NO_HIT = false;
	                                HIT[i] = 2;
	                                continue or;
	                            }
	                        }

	                        if (NO_HIT) break repeat;

	                        break;
	                    }

	                lx.sync(copy);

	                //if (temp_r.v)
	                //    this.mergeValues(r, temp_r)

	                bool = true;

	                if (!this.checkForComma(copy, out_val, temp_val, j))
	                    break;
	            }

	        return bool;
	    }
	}

	OR.step = 0;

	class ONE_OF extends JUX {
	    get type(){
	        return "one_of";
	    }
	    parseLVL2(lx, out_val, start, end) {

	        let BOOL = false;
	        const
	            copy = lx.copy(), 
	            temp_val = [];

	        for (let j = 0; j < end && !lx.END; j++) {

	            const
	                temp_r = [];

	            let bool = false;

	            for (let i = 0, l = this.terms.length; i < l; i++) {
	                if (this.terms[i].parseLVL1(copy, temp_val, false)) {
	                    bool = true;
	                    break;
	                }
	            }

	            if (!bool)
	                break;

	            lx.sync(copy);

	            BOOL = true;

	            if (!this.checkForComma(copy, out_val, temp_val, j))
	                break;
	        }

	        return BOOL;
	    }
	}

	ONE_OF.step = 0;

	var productions = /*#__PURE__*/Object.freeze({
		checkDefaults: checkDefaults,
		JUX: JUX,
		AND: AND,
		OR: OR,
		ONE_OF: ONE_OF
	});

	class LiteralTerm{

	    get type (){
	        return "term";
	    }

	    constructor(value, type) {
	        
	        if(type == whind$1.types.string)
	            value = value.slice(1,-1);

	        this.value = value;
	        this.HAS_PROP = false;
	    }

	    seal(){}

	    parse(data){
	        const prop_data = [];

	        this.parseLVL1(data instanceof whind$1.constructor ? data : whind$1(data + ""), prop_data);

	        return prop_data;
	    }

	    parseLVL1(l, r, root = true) {

	        if (typeof(l) == "string")
	            l = whind$1(l);

	        if (root) {
	            switch(checkDefaults(l)){
	                case 1:
	                rule.push(l.tx);
	                return true;
	                case 0:
	                return false;
	            }
	        }

	        let v = l.tx;
	        
	        if (v == this.value) {
	            l.next();
	            r.push(v);
	            //if (this.HAS_PROP  && !this.virtual && root)
	            //    rule[0] = v;

	            return true;
	        }
	        return false;
	    }

	    get OPTIONAL (){ return false }
	    set OPTIONAL (a){}
	}

	class ValueTerm extends LiteralTerm{

	    constructor(value, getPropertyParser, definitions, productions) {
	        
	        super(value);

	        if(value instanceof JUX)
	            return value;

	        this.value = null;

	        const IS_VIRTUAL = { is: false };
	        
	        if(typeof(value) == "string")
	            var u_value = value.replace(/\-/g,"_");

	        if (!(this.value = types[u_value]))
	            this.value = getPropertyParser(u_value, IS_VIRTUAL, definitions, productions);

	        if (!this.value)
	            return new LiteralTerm(value);

	        if(this.value instanceof JUX){

	            if (IS_VIRTUAL.is)
	                this.value.virtual = true;

	            return this.value;
	        }
	    }

	    parseLVL1(l, r, ROOT = true) {
	        if (typeof(l) == "string")
	            l = whind$1(l);

	        if (ROOT) {
	            switch(checkDefaults(l)){
	                case 1:
	                r.push(l.tx);
	                return true;
	                case 0:
	                return false;
	            }
	        }

	        //const rn = [];

	        const v = this.value.parse(l);

	        /*if (rn.length > 0) {
	            
	           // r.push(...rn);

	            // if (this.HAS_PROP && !this.virtual)
	            //     rule[0] = rn.v;

	            return true;

	        } else */if (v) {

	            r.push(v);

	            //if (this.HAS_PROP && !this.virtual && ROOT)
	            //    rule[0] = v;

	            return true;
	        } else
	            return false;
	    }
	}



	class SymbolTerm extends LiteralTerm {
	    parseLVL1(l, rule, r) {
	        if (typeof(l) == "string")
	            l = whind$1(l);

	        if (l.tx == this.value) {
	            l.next();
	            rule.push(this.value);
	            return true;
	        }

	        return false;
	    }
	};

	var terms = /*#__PURE__*/Object.freeze({
		LiteralTerm: LiteralTerm,
		ValueTerm: ValueTerm,
		SymbolTerm: SymbolTerm
	});

	//import util from "util"
	const standard_productions = {
	    JUX,
	    AND,
	    OR,
	    ONE_OF,
	    LiteralTerm,
	    ValueTerm,
	    SymbolTerm
	};

	function getExtendedIdentifier(l) {
	    let pk = l.pk;

	    let id = "";

	    while (!pk.END && (pk.ty & (whind$1.types.id | whind$1.types.num)) || pk.tx == "-" || pk.tx == "_") { pk.next(); }

	    id = pk.slice(l);

	    l.sync();

	    l.tl = 0;

	    return id;
	}

	function getPropertyParser(property_name, IS_VIRTUAL = { is: false }, definitions = null, productions = standard_productions) {

	    let parser_val = definitions[property_name];

	    if (parser_val) {

	        if (typeof(parser_val) == "string") {
	            parser_val = definitions[property_name] = CreatePropertyParser(parser_val, property_name, definitions, productions);
	        }
	        parser_val.name = property_name;
	        return parser_val;
	    }

	    if (!definitions.__virtual)
	        definitions.__virtual = Object.assign({}, virtual_property_definitions);

	    parser_val = definitions.__virtual[property_name];

	    if (parser_val) {

	        IS_VIRTUAL.is = true;

	        if (typeof(parser_val) == "string") {
	            parser_val = definitions.__virtual[property_name] = CreatePropertyParser(parser_val, "", definitions, productions);
	            parser_val.virtual = true;
	            parser_val.name = property_name;
	        }

	        return parser_val;
	    }

	    return null;
	}


	function CreatePropertyParser(notation, name, definitions, productions) {

	    const l = whind$1(notation);
	    l.useExtendedId();
	    
	    const important = { is: false };

	    let n = d$2(l, definitions, productions);

	    n.seal();

	    //if (n instanceof productions.JUX && n.terms.length == 1 && n.r[1] < 2)
	    //    n = n.terms[0];

	    n.HAS_PROP = true;
	    n.IMP = important.is;

	    /*//******** DEV 
	    console.log("")
	    console.log("")
	    console.log(util.inspect(n, { showHidden: false, depth: null })) 
	    //********** END Dev*/

	    return n;
	}

	function d$2(l, definitions, productions, super_term = false, oneof_group = false, or_group = false, and_group = false, important = null) {
	    let term, nt, v;
	    const { JUX, AND, OR, ONE_OF, LiteralTerm, ValueTerm, SymbolTerm } = productions;

	    let GROUP_BREAK = false;

	    while (!l.END) {

	        switch (l.ch) {
	            case "]":
	                return term;
	                break;
	            case "[":

	                v = d$2(l.next(), definitions, productions, true);
	                l.assert("]");
	                v = checkExtensions(l, v, productions);

	                if (term) {
	                    if (term instanceof JUX && term.isRepeating()) term = foldIntoProduction(productions, new JUX, term);
	                    term = foldIntoProduction(productions, term, v);
	                } else
	                    term = v;
	                break;

	            case "<":
	                let id = getExtendedIdentifier(l.next());

	                v = new ValueTerm(id, getPropertyParser, definitions, productions);

	                l.next().assert(">");

	                v = checkExtensions(l, v, productions);

	                if (term) {
	                    if (term instanceof JUX /*&& term.isRepeating()*/ ) term = foldIntoProduction(productions, new JUX, term);
	                    term = foldIntoProduction(productions, term, v);
	                } else {
	                    term = v;
	                }
	                break;

	            case "&":

	                if (l.pk.ch == "&") {

	                    if (and_group)
	                        return term;

	                    nt = new AND();

	                    if (!term) throw new Error("missing term!");

	                    nt.terms.push(term);

	                    l.sync().next();

	                    while (!l.END) {
	                        nt.terms.push(d$2(l, definitions, productions, super_term, oneof_group, or_group, true, important));
	                        if (l.ch !== "&" || l.pk.ch !== "&") break;
	                        l.a("&").a("&");
	                    }

	                    return nt;
	                }
	                break;
	            case "|":

	                {
	                    if (l.pk.ch == "|") {

	                        if (or_group || and_group)
	                            return term;

	                        nt = new OR();

	                        nt.terms.push(term);

	                        l.sync().next();

	                        while (!l.END) {
	                            nt.terms.push(d$2(l, definitions, productions, super_term, oneof_group, true, and_group, important));
	                            if (l.ch !== "|" || l.pk.ch !== "|") break;
	                            l.a("|").a("|");
	                        }

	                        return nt;

	                    } else {

	                        if (oneof_group || or_group || and_group)
	                            return term;

	                        nt = new ONE_OF();

	                        nt.terms.push(term);

	                        l.next();

	                        while (!l.END) {
	                            nt.terms.push(d$2(l, definitions, productions, super_term, true, or_group, and_group, important));
	                            if (l.ch !== "|") break;
	                            l.a("|");
	                        }

	                        return nt;
	                    }
	                }
	                break;
	            default:

	                v = (l.ty == l.types.symbol) ? new SymbolTerm(l.tx) : new LiteralTerm(l.tx, l.ty);
	                l.next();
	                v = checkExtensions(l, v, productions);

	                if (term) {
	                    if (term instanceof JUX /*&& (term.isRepeating() || term instanceof ONE_OF)*/ ) term = foldIntoProduction(productions, new JUX, term);
	                    term = foldIntoProduction(productions, term, v);
	                } else {
	                    term = v;
	                }
	        }
	    }

	    return term;
	}

	function checkExtensions(l, term, productions) {
	    const { JUX, AND, OR, ONE_OF, LiteralTerm, ValueTerm, SymbolTerm } = productions;

	    outer: while (true) {

	        switch (l.ch) {
	            case "!":
	                /* https://www.w3.org/TR/CSS21/cascade.html#important-rules */
	                term.IMPORTANT = true;
	                l.next();
	                continue outer;
	            case "{":
	                term = foldIntoProduction(productions, term);
	                term.r[0] = parseInt(l.next().tx);
	                if (l.next().ch == ",") {
	                    l.next();
	                    if (l.pk.ch == "}") {

	                        term.r[1] = parseInt(l.tx);
	                        l.next();
	                    } else {
	                        term.r[1] = Infinity;
	                    }
	                } else
	                    term.r[1] = term.r[0];
	                l.a("}");
	                break;
	            case "*":
	                term = foldIntoProduction(productions, term);
	                term.r[0] = 0;
	                term.r[1] = Infinity;
	                l.next();
	                break;
	            case "+":
	                term = foldIntoProduction(productions, term);
	                term.r[0] = 1;
	                term.r[1] = Infinity;
	                l.next();
	                break;
	            case "?":
	                term = foldIntoProduction(productions, term);
	                term.r[0] = 0;
	                term.r[1] = 1;
	                l.next();
	                break;
	            case "#":

	                let nr = new productions.JUX();
	                //nr.terms.push(new SymbolTerm(","));
	                nr.terms.push(term);
	                term = nr;
	                //term = foldIntoProduction(productions, term);
	                term.r[0] = 1;
	                term.r[1] = Infinity;
	                term.REQUIRE_COMMA = true;
	                l.next();
	                if (l.ch == "{") {
	                    term.r[0] = parseInt(l.next().tx);
	                    term.r[1] = parseInt(l.next().a(",").tx);
	                    l.next().a("}");
	                }
	                break;
	        }
	        break;
	    }
	    return term;
	}

	function foldIntoProduction(productions, term, new_term = null) {
	    if (term) {
	        if (!(term instanceof productions.JUX)) {
	            let nr = new productions.JUX();
	            nr.terms.push(term);
	            term = nr;
	        }
	        if (new_term) {
	            term.seal();
	            term.terms.push(new_term);
	        }
	        return term;
	    }
	    return new_term;
	}

	const observer_mixin_symbol = Symbol("observer_mixin_symbol");

	const observer_mixin = function(calling_name, prototype) {

	    const observer_identifier = Symbol("observer_array_reference");

	    prototype[observer_mixin_symbol] = observer_identifier;

	    //Adds an observer to the object instance. Applies a property to the observer that references the object instance.
	    //Creates new observers array if one does not already exist.
	    prototype.addObserver = function(...observer_list) {
	        let observers = this[observer_identifier];

	        if (!observers)
	            observers = this[observer_identifier] = [];

	        for (const observer of observer_list) {

	            if (observer[observer_identifier] == this)
	                return

	            if (observer[observer_identifier])
	                observer[observer_identifier].removeObserver(observer);

	            observers.push(observer);

	            observer[observer_identifier] = this;
	        }
	    };

	    //Removes an observer from the object instance. 
	    prototype.removeObserver = function(...observer_list) {

	        const observers = this[observer_identifier];

	        for (const observer of observer_list)
	            for (let i = 0, l = observers.length; i < l; i++)
	                if (observers[i] == observer) return (observer[observer_identifier] = null, observers.splice(i, 1));

	    };


	    prototype.updateObservers = function() {
	        const observers = this[observer_identifier];

	        if (observers)
	            observers.forEach(obj => obj[calling_name](this));
	    };
	};

	//Properly destructs this observers object on the object instance.
	observer_mixin.destroy = function(observer_mixin_instance) {

	    const symbol = observer_mixin_instance.constructor.prototype[observer_mixin_symbol];

	    if (symbol) {
	        if (observer_mixin_instance[symbol])
	            observer_mixin_instance[symbol].forEach(observer=>observer[symbol] = null);

	        observer_mixin_instance[symbol].length = 0;
	        
	        observer_mixin_instance[symbol] = null;
	    }
	};

	observer_mixin.mixin_symbol = observer_mixin_symbol;

	Object.freeze(observer_mixin);

	/* 
	    Parses a string value of a css property. Returns result of parse or null.

	    Arg - Array - An array with values:
	        0 :  string name of css rule that should be used to parse the value string.
	        1 :  string value of the css rule.
	        2 :  BOOL value for the presence of the "important" value in the original string. 

	    Returns object containing:
	        rule_name : the string name of the rule used to parse the value.
	        body_string : the original string value
	        prop : An array of CSS type instances that are the parsed values.
	        important : boolean value indicating the presence of "important" value.
	*/




	function parseDeclaration(sym) {
	    if(sym.length == 0)
	        return null;
	    
	    let prop = null;

	    const
	        rule_name = sym[0],
	        body_string = sym[2],
	        important = sym[3] ? true : false,
	        IS_VIRTUAL = { is: false },
	        parser = getPropertyParser(rule_name.replace(/\-/g, "_"), IS_VIRTUAL, property_definitions);

	    if (parser && !IS_VIRTUAL.is) 

	        prop = parser.parse(whind$1(body_string).useExtendedId());

	    else
	        //Need to know what properties have not been defined
	        console.warn(`Unable to get parser for CSS property ${rule_name}`);

	    return {name:rule_name, body_string, prop, important};
	}

	class styleprop {

	    constructor(name, original_value, val) {
	        this.val = val;
	        this.name = name.replace(/\-/g, "_");
	        this.original_value = original_value;
	        this.rule = null;
	        this.ver = 0;
	    }
	    destroy() {
	        this.val = null;
	        this.name = "";
	        this.original_value = "";
	        this.rule = null;
	        observer_mixin.destroy(this);
	    }

	    get css_type() {
	        return "styleprop"
	    }

	    updated() {
	        this.updateObservers();

	        if (this.parent)
	            this.parent.update();
	    }

	    get value() {
	        return this.val.length > 1 ? this.val : this.val[0];
	    }

	    get value_string() {
	        return this.val.join(" ");
	    }

	    toString(offset = 0) {
	        const
	            str = [],
	            off = ("    ").repeat(offset);

	        return `${off+this.name.replace(/\_/g, "-")}:${this.value_string}`;
	    }

	    setValueFromString(value) {
	        const result = parseDeclaration([this.name, null, value]);

	        if (result) 
	            this.setValue(...result.prop);
	    }

	    setValue(...values) {

	        let i = 0;

	        for (const value of values) {
	            const own_val = this.val[i];


	            if (own_val && value instanceof own_val.constructor)
	                this.val[i] = value;
	            else
	                this.val[i] = value;
	            i++;
	        }

	        this.val.length = values.length;

	        this.ver++;

	        this.updated();
	    }
	}

	observer_mixin("updatedCSSStyleProperty", styleprop.prototype);

	/* 	Wraps parseDeclaration with a function that returns a styleprop object or null. 
		Uses same args as parseDeclaration */

	function parseDeclaration$1 (...v){

		const result = parseDeclaration(...v);

		if(result)
			return new styleprop(
				result.name,
				result.body_string,
				result.prop
			)

		return null;
	}

	function setParent(array, parent) {
	    for (const prop of array)
	        prop.parent = parent;
	}

	/*
	 * Holds a set of css style properties.
	 */
	class stylerule {

	    constructor(selectors = [], props = []) {
	        this.selectors = selectors;
	        this.properties = new Map;

	        this.addProp(props);

	        //Versioning
	        this.ver = 0;

	        this.parent = null;

	        setParent(this.selectors, this);
	        setParent(this.properties.values(), this);

	        this.props = new Proxy(this, this);
	        this.addProperty = this.addProp;
	        this.addProps = this.addProp;
	        this.UPDATE_LOOP_GAURD = false;
	    }
	    
	    get css_type(){
	        return "stylerule"
	    }

	    destroy(){
	        
	        for(const prop of this.properties.values())
	            prop.destroy();

	        for(const selector of this.selectors)
	            selector.destroy();

	        this.parent = null;
	        this.selectors = null;
	        this.properties = null;

	        observer_mixin.destroy(this);
	    }

	    /* sends an update signal up the hiearchy to allow style sheets to alert observers of new changes. */
	    update() {
	        this.ver++;

	        //if(this.UPDATE_LOOP_GAURD) return;

	        if (this.parent)
	            this.parent.update();

	        this.updateObservers();
	    }

	    get type() {
	        return "stylerule"
	    }

	    get(obj, name) {
	        let prop = obj.properties.get(name);
	        //if (prop)
	        //    prop.parent = this;
	        return prop;
	    }
	    /*  
	        Adds properties to the stylerule
	        arg1 string - accepts a string of semicolon seperated css style rules.   
	    */
	    addProp(props) {
	        if (typeof props == "string") {
	            return this.addProps(
	                props.split(";")
	                .filter(e => e !== "")
	                .map((e, a) => (a = e.split(":"), a.splice(1, 0, null), a))
	                .map(parseDeclaration$1)
	            )
	        }

	        if (props.type == "stylerule")
	            props = props.properties.values();
	        else
	        if (!Array.isArray(props))
	            props = [props];

	       // this.UPDATE_LOOP_GAURD = true;
	        for (const prop of props)
	            if (prop) {
	                if(this.properties.has(prop.name))
	                    this.properties.get(prop.name).setValue(...prop.val);
	                else
	                    this.properties.set(prop.name, prop);
	                
	                prop.parent = this;
	            }
	        //this.UPDATE_LOOP_GAURD = false;

	        this.ver++;

	        this.update();

	        return props;
	    }

	    match(element, window) {
	        for (const selector of this.selectors)
	            if (selector.match(element, window))
	                return true;
	        return false;
	    }

	    * getApplicableSelectors(element, window) {
	        for (const selector of this.selectors)
	            if (selector.match(element, window))
	                yield selector;
	    }

	    * getApplicableRules(element, window) {
	        if (this.match(element, window))
	            yield this;
	    }

	    * iterateProps() {
	        for (const prop of this.properties.values())
	            yield prop;
	    }

	    toString(off = 0, rule = "") {

	        let str = [],
	            offset = ("    ").repeat(off);

	        for (const prop of this.properties.values())
	            str.push(prop.toString(off));

	        return `${this.selectors.join("")}{${str.join(";")}}`;
	    }

	    merge(rule) {
	        if(!rule) return;
	        if (rule.type == "stylerule"){
	            for (const prop of rule.properties.values()){
	                if (prop) {
	                    this.properties.set(prop.name, prop);
	                }
	            }
	        }
	                
	    }

	    get _wick_type_() { return 0; }

	    set _wick_type_(v) {}
	}

	observer_mixin("updatedCSSStyleRule", stylerule.prototype);

	class ruleset {
		constructor(asts, rules = []){
			this.rules = rules;

	        rules.forEach(r=>r.parent = this);

	        this.parent = null;
		}

	    destroy(){
	        for(const rule of this.rules)
	            rule.destroy();
	        this.rules = null;
	        this.parent = null;
	    }

	    * getApplicableSelectors(element, win = window) {
	        for(const rule of this.rules)
	            yield * rule.getApplicableSelectors(element, win);
	    }

		* getApplicableRules(element, win = window){
	        for(const rule of this.rules)
	            yield * rule.getApplicableRules(element, window);
	    }

	    /* sends an update signal up the hiearchy to allow style sheets to alert observers of new changes. */
	    update(){
	        if(this.parent)
	            this.parent.updated();
	    }

	    getRule(string) {
	        let r = null;
	        for (let node = this.fch; node; node = this.getNextChild(node))
	            r = node.getRule(string, r);
	        return r;
	    }

	    toString(){
	        return this.rules.join("\n");
	    }
	}

	class stylesheet {

	    constructor(sym) {
	        this.ruleset = null;

	        if (sym) {
	            this.ruleset = sym[0];
	        }else {
	            this.ruleset = new ruleset();
	        }
	        this.ruleset.parent = this;

	        this.parent = null;

	        this.READY = true;
	    }

	    destroy(){
	        
	        this.ruleset.destroy();
	        this.parent = null;
	        this.READY = false;

	        observer_mixin.destroy(this);
	    }

	    get css_type(){
	        return "stylesheet"
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

	    merge(in_stylesheet) {
	        if (in_stylesheet instanceof stylesheet) {

	            let ruleset = in_stylesheet.ruleset;
	            outer:
	                for (let i = 0; i < children.length; i++) {
	                    //determine if this child matches any existing selectors
	                    let child = children[i];

	                    for (let i = 0; i < this.children.length; i++) {
	                        let own_child = this.children[i];

	                        if (own_child.isSame(child)) {
	                            own_child.merge(child);
	                            continue outer;
	                        }
	                    }

	                    this.children.push(child);
	                }
	        }
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

	    updated() {
	        this.updateObservers();
	    }

	    * getApplicableSelectors(element, win = window) {
	        yield * this.ruleset.getApplicableSelectors(element, window);
	    }

	    getApplicableRules(element, win = window, RETURN_ITERATOR = false, new_rule = new stylerule) {
	        if(!(element instanceof HTMLElement))
	            return new_rule;

	        const iter = this.ruleset.getApplicableRules(element, win);
	        if (RETURN_ITERATOR) {
	            return iter
	        } else
	            for (const rule of iter) {
	                new_rule.merge(rule);
	            }
	        return new_rule;
	    }

	    * getApplicableProperties(element, win = window){
	        for(const rule of this.getApplicableRules(element, win, true))
	            yield * rule.iterateProps();
	    }

	    getRule(string) {
	        let r = null;
	        for (let node = this.fch; node; node = this.getNextChild(node))
	            r = node.getRule(string, r);
	        return r;
	    }

	    toString() {
	        return this.ruleset + "";
	    }
	}

	observer_mixin("updatedCSS", stylesheet.prototype);

	class compoundSelector {
	    constructor(sym, env) {

	        if(sym.length = 1)
	            if(Array.isArray(sym[0]) && sym[0].length == 1)
	                return sym[0][0]
	            else
	                return sym[0]

	        this.subclass = null;
	        this.tag = null;
	        this.pseudo = null;


	        if (sym[0].type == "type")
	            this.tag = sym.shift();

	        if (sym[0] && sym[0][0] && sym[0][0].type !== "pseudoElement")
	            this.subclass = sym.shift();

	        this.pseudo = sym[0];
	    }

	    get type() {
	        return "compound"
	    }

	    matchReturnElement(element, win) {
	        if (this.tag) {
	            if (!this.tag.matchReturnElement(element, win))
	                return null;
	        }

	        if (this.subclass) {
	            for (const sel of this.subclass) {
	                if (!sel.matchReturnElement(element, win))
	                    return null;
	            }
	        }

	        if (this.pseudo) {
	            if (!this.subclass.matchReturnElement(element, win))
	                return null;
	        }

	        return element;
	    }

	    toString() {
	        const
	            tag = this.tag ? this.tag + "" : "",
	            subclass = this.subclass ? this.subclass.join("") + "" : "",
	            pseudo = this.pseudo ? this.pseudo + "" : "";

	        return `${tag + subclass + pseudo}`;
	    }
	}

	class combination_selector_part {
	    constructor(sym, env) {
	        if (sym.length > 1) {
	            this.op = sym[0];
	            this.selector = sym[1];
	        } else 
	            return sym[0]
	    }

	    get type() {
	        return "complex"
	    }

	    matchReturnElement(element, selector_array, selector = null, index = 0) {
	        let ele;

	        if ((ele = this.selector.matchReturnElement(element, selector_array))) {
	            switch (this.op) {
	                case ">":
	                    return selector.match(ele.parentElement);
	                case "+":
	                    return selector.match(ele.previousElementSibling);
	                case "~":
	                    let children = ele.parentElement.children.slice(0, element.index);

	                    for (const child of children) {
	                        if (selector.match(child))
	                            return child;
	                    }
	                    return null;
	                default:
	                    ele = ele.parentElement;
	                    while (ele) {
	                        if (selector.match(ele))
	                            return ele;
	                        ele = ele.parentElement;
	                    }
	            }
	        }

	        return null;
	    }

	    toString() {
	        return this.op + this.selector + "";
	    }
	}

	class selector {
	    constructor(sym, env) {
	        if (sym.length > 1)
	            this.vals = [sym, ...sym[1]];
	        else
	            this.vals = sym;

	        this.parent = null;
	    }

	    match(element, win = window) {

	        for (const selector of this.vals.reverse()) {
	            if (!(element = selector.matchReturnElement(element, win)))
	                return false;
	        }
	        return true;
	    }

	    toString() {
	        return this.vals.join(" ");
	    }
	}

	class type_selector_part{
		constructor(sym){
			const val = sym[0];
			this.namespace = "";

			if(val.length > 1)
				this.namespace = val[0];
			this.val = ((val.length > 1) ? val[1] : val[0]).toLowerCase();
		}

		get type(){
			return "type"
		}

		matchReturnElement(element, win){
			return element.tagName.toLowerCase() == this.val ? element : null;
		}

		toString(){
			return  this.namespace + " " + this.val;
		}
	}

	class idSelector{
		constructor(sym,env){
			this.val = sym[1];
		}

		get type(){
			return "id"
		}

		matchReturnElement(element){
			return element.id == this.val ? element : null;
		}

		toString(){
			return "#"+ this.val;
		}
	}

	class classSelector{
		constructor(sym,env){
			this.val = sym[1];
		}

		get type(){
			return "class"
		}

		matchReturnElement(element, window){
			return element.classList.contains(this.val) ? element : null;
		}

		toString(){
			return "."+this.val;
		}
	}

	class attribSelector{
		constructor(sym,env){
			this.key = sym[1];
			this.val = "";
			this.op = "";
			this.mod = "";

			if(sym.length > 3){
				this.val = sym[3];
				this.op = sym[2];
				this.mod = sym.length > 5 ? sym[4] : "";
			}

		}

		get type(){
			return "attrib"
		}

		matchReturnElement(element, result){
			
			let attr = element.getAttribute(this.key);

			if(!attr)
				return null
			if(this.val && attr !== this.val)
				return null;
			
			return element;
		}

		toString(){
			return `[${this.key+this.op+this.val+this.mod}]`;
		}
	}

	class pseudoClassSelector{
		constructor(sym,env){
			this.val = sym[1];
		}

		get type(){
			return "pseudoClass"
		}

		matchReturnElement(element){
			return element;
		}

		toString(){

		}
	}

	class pseudoElementSelector{
		constructor(sym,env){
			this.val = sym[1].val;
		}

		get type(){
			return "pseudo-element"
		}

		matchReturnElement(element){
			return element;
		}

		toString(){

		}
	}

	const env = {
	    functions: {
	        compoundSelector,
	        comboSelector: combination_selector_part,
	        typeselector: type_selector_part,
	        selector,
	        idSelector,
	        classSelector,
	        attribSelector,
	        pseudoClassSelector,
	        pseudoElementSelector,
	        parseDeclaration: parseDeclaration$1,
	        stylerule,
	        ruleset,
	        stylesheet
	    },
	    body: null
	};

	const parse = function (string_data) { return parser(whind$1(string_data), env) };

	var css = /*#__PURE__*/Object.freeze({
		css_parser: parser,
		parse: parse,
		length: CSS_Length,
		CSS_Length: CSS_Length,
		CSS_URL: CSS_URL,
		url: CSS_URL,
		stylerule: stylerule,
		ruleset: ruleset,
		compoundSelector: compoundSelector,
		comboSelector: combination_selector_part,
		typeselector: type_selector_part,
		selector: selector,
		idSelector: idSelector,
		classSelector: classSelector,
		attribSelector: attribSelector,
		pseudoClassSelector: pseudoClassSelector,
		pseudoElementSelector: pseudoElementSelector,
		parseDeclaration: parseDeclaration$1,
		stylesheet: stylesheet,
		types: types,
		property_definitions: property_definitions,
		media_feature_definitions: media_feature_definitions,
		getPropertyParser: getPropertyParser,
		productions: productions,
		terms: terms
	});

	function integrate_element(prototype, env) {

	    /**
	     * This node allows an existing element to be removed from DOM trees that were created from the Wick AST. 
	     */
	    class DeleteNode extends prototype.constructor {

	        buildExisting(element) {
	            element.parentElement.removeChild(element);
	            return false;
	        }

	        resetRebuild() {

	            const nxt = this.nxt;

	            if (this.parent) {
	                this.parent.removeChild(this);
	            }

	            this.nxt = nxt;
	        }
	    }

	    let id = 0;

	    prototype.constructor.id = 0;

	    prototype.ReparseConstructor = prototype.constructor;

	    const loadAndParseUrl = prototype.loadAndParseUrl;

	    prototype.addAttribute = function(name, value) {
	        const attribute = new env.wick.nodes.attribute([name, null, value + ""]);
	        this.attribs.set(name, attribute);
	    };

	    prototype.loadAndParseUrl = async function(e) {
	        return loadAndParseUrl.call(this, e);
	    };

	    prototype.createElement = function(presets, source) {
	        const element = document.createElement(this.tag);
	        element.wick_source = source;
	        element.wick_node = this;
	        element.wick_id = id++;
	        return element;
	    };

	    prototype.setScope = function(scope) {

	        if (!this.observing_scopes)
	            this.observing_scopes = [];

	        this.observing_scopes.push(scope);

	        scope.ast = this;
	    };

	    prototype.reparse = function(text) {
	        text = text.substring(text.indexOf("<"), text.lastIndexOf(">") + 1);

	        return env.wick(text).pending.then(async comp => {

	            const ast = comp.ast;

	            for (const name in ast)
	                this[name] = ast[name];

	            this.BUILT = true;

	            this.prepRebuild(false, true);
	            this.rebuild();

	            return true;
	        }).catch(e => {
	            return false;
	            return e;

	        });
	    };

	    // Rebuild all sources relying on this node
	    prototype.rebuild = function(win = window) {

	        if (this.observing_scopes) {
	            for (let i = 0, l = this.observing_scopes.length; i < l; i++) {
	                try {
	                    this.observing_scopes[i].rebuild(i == l - 1); // Let the rebuild method know it's time to cleanup after the last observing scope is updated. 
	                } catch (e) {
	                    console.error(e);
	                }
	            }
	            this.resetRebuild();
	        } else if (this.parent)
	            this.parent.rebuild(win);
	    };

	    prototype.extract = function() {
	        if (this.parent)
	            this.parent.replace(this, new DeleteNode());
	    };


	    prototype.buildExisting = function(element, scope, presets = this.presets, slots = {}, pinned = {}, win = window, css = this.css, FINAL_UPDATE = false) {

	        if (this.CHANGED & 3) {

	            if (element)
	                element.style.cssText = "";

	            //this.linkCSS(css, win);
	            //IO CHANGE 
	            //Attributes
	            if (this.CHANGED & 4) {

	                this.destruct(scope);

	                scope.discardElement(element);

	                const span = document.createElement("span");

	                this.mount(span, scope, presets, slots, pinned);

	                const ele = span.firstChild;

	                if (this.CHANGED & 8) {
	                    if (element)
	                        element.parentNode.insertBefore(ele, element);
	                    else
	                        element.appendChild(ele);
	                } else
	                    element.parentNode.replaceChild(ele, element);

	                if (element) {
	                    //clear off any scopes whoes target is an element or sub element of the element
	                    element.replacement = ele;
	                }

	            } else {

	                if (this._merged_)
	                    this._merged_.buildExisting(element, source, presets, taps);

	                if (this.CHANGED & 2) {
	                    //rebuild children

	                    const children = (element) ? element.childNodes : [];

	                    for (let i = 0, j = 0; i < this.children.length; i++) {
	                        const node = this.children[i];

	                        if (node.buildExisting(children[j], scope, presets, slots, pinned, win, css, FINAL_UPDATE))
	                            j++;

	                    }
	                }
	            }
	        }

	        if (FINAL_UPDATE)
	            this.CHANGED = 0;

	        return true;
	    };

	    prototype.prepRebuild = function(child = false, REBUILT = false, INSERTED = false, CSS = false) {

	        this.CHANGED =
	            this.CHANGED |
	            (!child) | //1 : Own element needs to be updated 
	            ((!!child) << 1) | //2 : A child node needs to updated
	            ((!!(REBUILT || INSERTED)) << 2) | //4 : Own element needs to rebuilt or have a sub element inserted
	            ((!!INSERTED) << 3) | //8 : Own element needs to be inserted as a new element
	            ((!!CSS) << 4); //16 : CSS data updated.

	        if (this.parent)
	            this.parent.prepRebuild(true);
	        else if (this.merges)
	            for (let i = 0; i < this.merges.length; i++)
	                this.merges.prepRebuild(true);
	    };

	    prototype.resetRebuild = function() {
	        this.CHANGED = 0;

	        if (!this.parent)
	            this.updated();

	        for (let node = this.fch; node; node = this.getNextChild(node))
	            node.resetRebuild();
	    };

	    prototype.build = prototype.mount;

	    prototype.mount = function(element, scope, presets = this.presets, slots = {}, pinned = {}) {
	        this.BUILT = true;
	        return this.build(element, scope, presets, slots, pinned);
	    };

	    prototype._mergeComponent_ = function() {
	        const component = this._presets_.components[this.tag];

	        if (component) {

	            this._merged_ = component;

	            if (!component.merges)
	                component.merges = [];

	            component.merges.push(this);
	        }
	    };

	    prototype.addObserver = function(observer) {
	        if (!this.observers)
	            this.observers = [];
	        this.observers.push(observer);
	    };

	    prototype.addView = function(view) {
	        if (!this.views)
	            this.views = [];
	        this.views.push(view);
	        view._model_ = this;
	    };

	    prototype.removeObserver = function(observer) {
	        for (let i = 0; i < this.observers.length; i++)
	            if (this.observers[i] == observer) return this.observers.splice(i, 1);
	    };

	    prototype.removeView = function(view) {
	        for (let i = 0; i < this.views.length; i++)
	            if (this.views[i] == view) return this.views.splice(i, 1);
	    };

	    prototype.updated = function() {
	        if (this.observers)
	            for (let i = 0; i < this.observers.length; i++)
	                this.observers[i].updatedWickASTTree(this);

	        if (this.views)
	            for (let i = 0; i < this.views.length; i++)
	                this.views[i].update(this);

	    };

	    prototype.destruct = function(scope) {
	        for (let i = 0; i < this.children.length; i++) {
	            this.children[i].destruct(scope);
	        }
	    };

	    prototype.BUILT = false;
	}

	function integrate_text(prototype, element_prototype, env) {
	    prototype.createElement = element_prototype.createElement;
	    prototype.setSource = element_prototype.setSource;
	    // Rebuild all sources relying on this node
	    prototype.rebuild = element_prototype.rebuild;
	    prototype.buildExisting = function(element, scope, presets = this.presets, slots = {}, pinned = {}, win = window, css = this.css) {
	        if (true || this.CHANGED !== 0) {

	            //IO CHANGE 
	            //Attributes
	            if (this.CHANGED & 4) {

	                let span = document.createElement("span");

	                this.mount(span, scope, presets, slots, pinned);

	                let ele = span.firstChild;

	                if (this.CHANGED & 8) {
	                    if (element) {
	                        element.parenteElement.insertBefore(ele, element);
	                    } else
	                        parent_element.appendChild(ele);
	                    return true;
	                } else {

	                    element.parentElement.replaceChild(ele, element);
	                    return true;
	                }

	            }
	        }

	        return true;
	    };
	    prototype.prepRebuild = element_prototype.prepRebuild;
	    prototype.resetRebuild = element_prototype.resetRebuild;
	    prototype.destruct = prototype.updated = function() {};
	}

	const A$2 = 65;
	const a$2 = 97;
	const ACKNOWLEDGE$2 = 6;
	const AMPERSAND$2 = 38;
	const ASTERISK$2 = 42;
	const AT$2 = 64;
	const B$2 = 66;
	const b$2 = 98;
	const BACKSLASH$2 = 92;
	const BACKSPACE$2 = 8;
	const BELL$2 = 7;
	const C$2 = 67;
	const c$2 = 99;
	const CANCEL$2 = 24;
	const CARET$2 = 94;
	const CARRIAGE_RETURN$2 = 13;
	const CLOSE_CURLY$2 = 125;
	const CLOSE_PARENTH$2 = 41;
	const CLOSE_SQUARE$2 = 93;
	const COLON$2 = 58;
	const COMMA$2 = 44;
	const d$3 = 100;
	const D$2 = 68;
	const DATA_LINK_ESCAPE$2 = 16;
	const DELETE$2 = 127;
	const DEVICE_CTRL_1$2 = 17;
	const DEVICE_CTRL_2$2 = 18;
	const DEVICE_CTRL_3$2 = 19;
	const DEVICE_CTRL_4$2 = 20;
	const DOLLAR$2 = 36;
	const DOUBLE_QUOTE$2 = 34;
	const e$3 = 101;
	const E$2 = 69;
	const EIGHT$2 = 56;
	const END_OF_MEDIUM$2 = 25;
	const END_OF_TRANSMISSION$2 = 4;
	const END_OF_TRANSMISSION_BLOCK$2 = 23;
	const END_OF_TXT$2 = 3;
	const ENQUIRY$2 = 5;
	const EQUAL$2 = 61;
	const ESCAPE$2 = 27;
	const EXCLAMATION$2 = 33;
	const f$2 = 102;
	const F$2 = 70;
	const FILE_SEPERATOR$2 = 28;
	const FIVE$2 = 53;
	const FORM_FEED$2 = 12;
	const FORWARD_SLASH$2 = 47;
	const FOUR$2 = 52;
	const g$2 = 103;
	const G$2 = 71;
	const GRAVE$2 = 96;
	const GREATER_THAN$2 = 62;
	const GROUP_SEPERATOR$2 = 29;
	const h$2 = 104;
	const H$2 = 72;
	const HASH$2 = 35;
	const HORIZONTAL_TAB$2 = 9;
	const HYPHEN$2 = 45;
	const i$2 = 105;
	const I$2 = 73;
	const j$2 = 106;
	const J$2 = 74;
	const k$2 = 107;
	const K$2 = 75;
	const l$2 = 108;
	const L$2 = 76;
	const LESS_THAN$2 = 60;
	const LINE_FEED$2 = 10;
	const m$2 = 109;
	const M$2 = 77;
	const n$2 = 110;
	const N$2 = 78;
	const NEGATIVE_ACKNOWLEDGE$2 = 21;
	const NINE$2 = 57;
	const NULL$2 = 0;
	const o$2 = 111;
	const O$2 = 79;
	const ONE$2 = 49;
	const OPEN_CURLY$2 = 123;
	const OPEN_PARENTH$2 = 40;
	const OPEN_SQUARE$2 = 91;
	const p$2 = 112;
	const P$2 = 80;
	const PERCENT$2 = 37;
	const PERIOD$2 = 46;
	const PLUS$2 = 43;
	const q$2 = 113;
	const Q$2 = 81;
	const QMARK$2 = 63;
	const QUOTE$2 = 39;
	const r$3 = 114;
	const R$2 = 82;
	const RECORD_SEPERATOR$2 = 30;
	const s$2 = 115;
	const S$2 = 83;
	const SEMICOLON$2 = 59;
	const SEVEN$2 = 55;
	const SHIFT_IN$2 = 15;
	const SHIFT_OUT$2 = 14;
	const SIX$2 = 54;
	const SPACE$2 = 32;
	const START_OF_HEADER$2 = 1;
	const START_OF_TEXT$2 = 2;
	const SUBSTITUTE$2 = 26;
	const SYNCH_IDLE$2 = 22;
	const t$2 = 116;
	const T$2 = 84;
	const THREE$2 = 51;
	const TILDE$2 = 126;
	const TWO$2 = 50;
	const u$2 = 117;
	const U$2 = 85;
	const UNDER_SCORE$2 = 95;
	const UNIT_SEPERATOR$2 = 31;
	const v$2 = 118;
	const V$2 = 86;
	const VERTICAL_BAR$2 = 124;
	const VERTICAL_TAB$2 = 11;
	const w$2 = 119;
	const W$2 = 87;
	const x$3 = 120;
	const X$2 = 88;
	const y$3 = 121;
	const Y$2 = 89;
	const z$2 = 122;
	const Z$2 = 90;
	const ZERO$2 = 48;

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
	const jump_table$2 = [
	7, 	 	/* NULL */
	7, 	 	/* START_OF_HEADER */
	7, 	 	/* START_OF_TEXT */
	7, 	 	/* END_OF_TXT */
	7, 	 	/* END_OF_TRANSMISSION */
	7, 	 	/* ENQUIRY */
	7, 	 	/* ACKNOWLEDGE */
	7, 	 	/* BELL */
	7, 	 	/* BACKSPACE */
	4, 	 	/* HORIZONTAL_TAB */
	6, 	 	/* LINEFEED */
	7, 	 	/* VERTICAL_TAB */
	7, 	 	/* FORM_FEED */
	5, 	 	/* CARRIAGE_RETURN */
	7, 	 	/* SHIFT_OUT */
	7, 		/* SHIFT_IN */
	11,	 	/* DATA_LINK_ESCAPE */
	7, 	 	/* DEVICE_CTRL_1 */
	7, 	 	/* DEVICE_CTRL_2 */
	7, 	 	/* DEVICE_CTRL_3 */
	7, 	 	/* DEVICE_CTRL_4 */
	7, 	 	/* NEGATIVE_ACKNOWLEDGE */
	7, 	 	/* SYNCH_IDLE */
	7, 	 	/* END_OF_TRANSMISSION_BLOCK */
	7, 	 	/* CANCEL */
	7, 	 	/* END_OF_MEDIUM */
	7, 	 	/* SUBSTITUTE */
	7, 	 	/* ESCAPE */
	7, 	 	/* FILE_SEPERATOR */
	7, 	 	/* GROUP_SEPERATOR */
	7, 	 	/* RECORD_SEPERATOR */
	7, 	 	/* UNIT_SEPERATOR */
	3, 	 	/* SPACE */
	8, 	 	/* EXCLAMATION */
	2, 	 	/* DOUBLE_QUOTE */
	7, 	 	/* HASH */
	7, 	 	/* DOLLAR */
	8, 	 	/* PERCENT */
	8, 	 	/* AMPERSAND */
	2, 	 	/* QUOTE */
	9, 	 	/* OPEN_PARENTH */
	10, 	 /* CLOSE_PARENTH */
	8, 	 	/* ASTERISK */
	8, 	 	/* PLUS */
	7, 	 	/* COMMA */
	7, 	 	/* HYPHEN */
	7, 	 	/* PERIOD */
	7, 	 	/* FORWARD_SLASH */
	0, 	 	/* ZERO */
	0, 	 	/* ONE */
	0, 	 	/* TWO */
	0, 	 	/* THREE */
	0, 	 	/* FOUR */
	0, 	 	/* FIVE */
	0, 	 	/* SIX */
	0, 	 	/* SEVEN */
	0, 	 	/* EIGHT */
	0, 	 	/* NINE */
	8, 	 	/* COLON */
	7, 	 	/* SEMICOLON */
	8, 	 	/* LESS_THAN */
	8, 	 	/* EQUAL */
	8, 	 	/* GREATER_THAN */
	7, 	 	/* QMARK */
	7, 	 	/* AT */
	1, 	 	/* A*/
	1, 	 	/* B */
	1, 	 	/* C */
	1, 	 	/* D */
	1, 	 	/* E */
	1, 	 	/* F */
	1, 	 	/* G */
	1, 	 	/* H */
	1, 	 	/* I */
	1, 	 	/* J */
	1, 	 	/* K */
	1, 	 	/* L */
	1, 	 	/* M */
	1, 	 	/* N */
	1, 	 	/* O */
	1, 	 	/* P */
	1, 	 	/* Q */
	1, 	 	/* R */
	1, 	 	/* S */
	1, 	 	/* T */
	1, 	 	/* U */
	1, 	 	/* V */
	1, 	 	/* W */
	1, 	 	/* X */
	1, 	 	/* Y */
	1, 	 	/* Z */
	9, 	 	/* OPEN_SQUARE */
	7, 	 	/* TILDE */
	10, 	/* CLOSE_SQUARE */
	7, 	 	/* CARET */
	7, 	 	/* UNDER_SCORE */
	2, 	 	/* GRAVE */
	1, 	 	/* a */
	1, 	 	/* b */
	1, 	 	/* c */
	1, 	 	/* d */
	1, 	 	/* e */
	1, 	 	/* f */
	1, 	 	/* g */
	1, 	 	/* h */
	1, 	 	/* i */
	1, 	 	/* j */
	1, 	 	/* k */
	1, 	 	/* l */
	1, 	 	/* m */
	1, 	 	/* n */
	1, 	 	/* o */
	1, 	 	/* p */
	1, 	 	/* q */
	1, 	 	/* r */
	1, 	 	/* s */
	1, 	 	/* t */
	1, 	 	/* u */
	1, 	 	/* v */
	1, 	 	/* w */
	1, 	 	/* x */
	1, 	 	/* y */
	1, 	 	/* z */
	9, 	 	/* OPEN_CURLY */
	7, 	 	/* VERTICAL_BAR */
	10,  	/* CLOSE_CURLY */
	7,  	/* TILDE */
	7 		/* DELETE */
	];	

	/**
	 * LExer Number and Identifier jump table reference
	 * Number are masked by 12(4|8) and Identifiers are masked by 10(2|8)
	 * entries marked as `0` are not evaluated as either being in the number set or the identifier set.
	 * entries marked as `2` are in the identifier set but not the number set
	 * entries marked as `4` are in the number set but not the identifier set
	 * entries marked as `8` are in both number and identifier sets
	 */
	const number_and_identifier_table$2 = [
	0, 		/* NULL */
	0, 		/* START_OF_HEADER */
	0, 		/* START_OF_TEXT */
	0, 		/* END_OF_TXT */
	0, 		/* END_OF_TRANSMISSION */
	0, 		/* ENQUIRY */
	0,		/* ACKNOWLEDGE */
	0,		/* BELL */
	0,		/* BACKSPACE */
	0,		/* HORIZONTAL_TAB */
	0,		/* LINEFEED */
	0,		/* VERTICAL_TAB */
	0,		/* FORM_FEED */
	0,		/* CARRIAGE_RETURN */
	0,		/* SHIFT_OUT */
	0,		/* SHIFT_IN */
	0,		/* DATA_LINK_ESCAPE */
	0,		/* DEVICE_CTRL_1 */
	0,		/* DEVICE_CTRL_2 */
	0,		/* DEVICE_CTRL_3 */
	0,		/* DEVICE_CTRL_4 */
	0,		/* NEGATIVE_ACKNOWLEDGE */
	0,		/* SYNCH_IDLE */
	0,		/* END_OF_TRANSMISSION_BLOCK */
	0,		/* CANCEL */
	0,		/* END_OF_MEDIUM */
	0,		/* SUBSTITUTE */
	0,		/* ESCAPE */
	0,		/* FILE_SEPERATOR */
	0,		/* GROUP_SEPERATOR */
	0,		/* RECORD_SEPERATOR */
	0,		/* UNIT_SEPERATOR */
	0,		/* SPACE */
	0,		/* EXCLAMATION */
	0,		/* DOUBLE_QUOTE */
	0,		/* HASH */
	0,		/* DOLLAR */
	0,		/* PERCENT */
	0,		/* AMPERSAND */
	0,		/* QUOTE */
	0,		/* OPEN_PARENTH */
	0,		 /* CLOSE_PARENTH */
	0,		/* ASTERISK */
	0,		/* PLUS */
	0,		/* COMMA */
	0,		/* HYPHEN */
	4,		/* PERIOD */
	0,		/* FORWARD_SLASH */
	8,		/* ZERO */
	8,		/* ONE */
	8,		/* TWO */
	8,		/* THREE */
	8,		/* FOUR */
	8,		/* FIVE */
	8,		/* SIX */
	8,		/* SEVEN */
	8,		/* EIGHT */
	8,		/* NINE */
	0,		/* COLON */
	0,		/* SEMICOLON */
	0,		/* LESS_THAN */
	0,		/* EQUAL */
	0,		/* GREATER_THAN */
	0,		/* QMARK */
	0,		/* AT */
	2,		/* A*/
	8,		/* B */
	2,		/* C */
	2,		/* D */
	8,		/* E */
	2,		/* F */
	2,		/* G */
	2,		/* H */
	2,		/* I */
	2,		/* J */
	2,		/* K */
	2,		/* L */
	2,		/* M */
	2,		/* N */
	8,		/* O */
	2,		/* P */
	2,		/* Q */
	2,		/* R */
	2,		/* S */
	2,		/* T */
	2,		/* U */
	2,		/* V */
	2,		/* W */
	8,		/* X */
	2,		/* Y */
	2,		/* Z */
	0,		/* OPEN_SQUARE */
	0,		/* TILDE */
	0,		/* CLOSE_SQUARE */
	0,		/* CARET */
	0,		/* UNDER_SCORE */
	0,		/* GRAVE */
	2,		/* a */
	8,		/* b */
	2,		/* c */
	2,		/* d */
	2,		/* e */
	2,		/* f */
	2,		/* g */
	2,		/* h */
	2,		/* i */
	2,		/* j */
	2,		/* k */
	2,		/* l */
	2,		/* m */
	2,		/* n */
	8,		/* o */
	2,		/* p */
	2,		/* q */
	2,		/* r */
	2,		/* s */
	2,		/* t */
	2,		/* u */
	2,		/* v */
	2,		/* w */
	8,		/* x */
	2,		/* y */
	2,		/* z */
	0,		/* OPEN_CURLY */
	0,		/* VERTICAL_BAR */
	0,		/* CLOSE_CURLY */
	0,		/* TILDE */
	0		/* DELETE */
	];

	const extended_number_and_identifier_table$2 = number_and_identifier_table$2.slice();
	extended_number_and_identifier_table$2[45] = 2;
	extended_number_and_identifier_table$2[95] = 2;

	const
	    number$2 = 1,
	    identifier$2 = 2,
	    string$2 = 4,
	    white_space$2 = 8,
	    open_bracket$2 = 16,
	    close_bracket$2 = 32,
	    operator$2 = 64,
	    symbol$2 = 128,
	    new_line$2 = 256,
	    data_link$2 = 512,
	    alpha_numeric$2 = (identifier$2 | number$2),
	    white_space_new_line$2 = (white_space$2 | new_line$2),
	    Types$2 = {
	        num: number$2,
	        number: number$2,
	        id: identifier$2,
	        identifier: identifier$2,
	        str: string$2,
	        string: string$2,
	        ws: white_space$2,
	        white_space: white_space$2,
	        ob: open_bracket$2,
	        open_bracket: open_bracket$2,
	        cb: close_bracket$2,
	        close_bracket: close_bracket$2,
	        op: operator$2,
	        operator: operator$2,
	        sym: symbol$2,
	        symbol: symbol$2,
	        nl: new_line$2,
	        new_line: new_line$2,
	        dl: data_link$2,
	        data_link: data_link$2,
	        alpha_numeric: alpha_numeric$2,
	        white_space_new_line: white_space_new_line$2,
	    },

	    /*** MASKS ***/

	    TYPE_MASK$2 = 0xF,
	    PARSE_STRING_MASK$2 = 0x10,
	    IGNORE_WHITESPACE_MASK$2 = 0x20,
	    CHARACTERS_ONLY_MASK$2 = 0x40,
	    TOKEN_LENGTH_MASK$2 = 0xFFFFFF80,

	    //De Bruijn Sequence for finding index of right most bit set.
	    //http://supertech.csail.mit.edu/papers/debruijn.pdf
	    debruijnLUT$2 = [
	        0, 1, 28, 2, 29, 14, 24, 3, 30, 22, 20, 15, 25, 17, 4, 8,
	        31, 27, 13, 23, 21, 19, 16, 7, 26, 12, 18, 6, 11, 5, 10, 9
	    ];

	const getNumbrOfTrailingZeroBitsFromPowerOf2$2 = (value) => debruijnLUT$2[(value * 0x077CB531) >>> 27];

	class Lexer$2 {

	    constructor(string = "", INCLUDE_WHITE_SPACE_TOKENS = false, PEEKING = false) {

	        if (typeof(string) !== "string") throw new Error(`String value must be passed to Lexer. A ${typeof(string)} was passed as the \`string\` argument.`);

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

	        this.USE_EXTENDED_ID = false;

	        /**
	         * Flag to force the lexer to parse string contents
	         */
	        this.PARSE_STRING = false;

	        this.id_lu = number_and_identifier_table$2;

	        if (!PEEKING) this.next();
	    }

	    useExtendedId(){
	        this.id_lu = extended_number_and_identifier_table$2;
	        this.tl = 0;
	        this.next();
	        return this;
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
	    copy(destination = new Lexer$2(this.str, false, true)) {
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

	        if (marker instanceof Lexer$2) {
	            if (marker.str !== this.str) throw new Error("Cannot sync Lexers with different strings!");
	            this.off = marker.off;
	            this.char = marker.char;
	            this.line = marker.line;
	            this.masked_values = marker.masked_values;
	        }

	        return this;
	    }

	    /**
	    Creates an error message with a diagram illustrating the location of the error. 
	    */
	    errorMessage(message = "") {
	        const pk = this.copy();

	        pk.IWS = false;

	        while (!pk.END && pk.ty !== Types$2.nl) { pk.next(); }

	        const end = (pk.END) ? this.str.length : pk.off,

	            nls = (this.line > 0) ? 1 : 0,
	            number_of_tabs = this.str
	                .slice(this.off - this.char + nls + nls, this.off + nls)
	                .split("")
	                .reduce((r, v) => (r + ((v.charCodeAt(0) == HORIZONTAL_TAB$2) | 0)), 0),

	            arrow = String.fromCharCode(0x2b89),

	            line = String.fromCharCode(0x2500),

	            thick_line = String.fromCharCode(0x2501),

	            line_number = `    ${this.line+1}: `,

	            line_fill = line_number.length + number_of_tabs,

	            line_text = this.str.slice(this.off - this.char + nls + (nls), end).replace(/\t/g, "  "),

	            error_border = thick_line.repeat(line_text.length + line_number.length + 2),

	            is_iws = (!this.IWS) ? "\n The Lexer produced whitespace tokens" : "",

	            msg =[ `${message} at ${this.line+1}:${this.char - nls}` ,
	            `${error_border}` ,
	            `${line_number+line_text}` ,
	            `${line.repeat(this.char-nls+line_fill-(nls))+arrow}` ,
	            `${error_border}` ,
	            `${is_iws}`].join("\n");

	        return msg;
	    }

	    /**
	     * Will throw a new Error, appending the parsed string line and position information to the the error message passed into the function.
	     * @instance
	     * @public
	     * @param {String} message - The error message.
	     * @param {Bool} DEFER - if true, returns an Error object instead of throwing.
	     */
	    throw (message, DEFER = false) {
	        const error = new Error(this.errorMessage(message));
	        if (DEFER)
	            return error;
	        throw error;
	    }

	    /**
	     * Proxy for Lexer.prototype.reset
	     * @public
	     */
	    r() { return this.reset() }

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
	    next(marker = this, USE_CUSTOM_SYMBOLS = !!this.symbol_map) {

	        if (marker.sl < 1) {
	            marker.off = 0;
	            marker.type = 32768;
	            marker.tl = 0;
	            marker.line = 0;
	            marker.char = 0;
	            return marker;
	        }

	        //Token builder
	        const l = marker.sl,
	            str = marker.str,
	            number_and_identifier_table = this.id_lu,
	            IWS = marker.IWS;

	        let length = marker.tl,
	            off = marker.off + length,
	            type = symbol$2,
	            line = marker.line,
	            base = off,
	            char = marker.char,
	            root = marker.off;

	        if (off >= l) {
	            length = 0;
	            base = l;
	            //char -= base - off;
	            marker.char = char + (base - marker.off);
	            marker.type = type;
	            marker.off = base;
	            marker.tl = 0;
	            marker.line = line;
	            return marker;
	        }

	        let NORMAL_PARSE = true;

	        if (USE_CUSTOM_SYMBOLS) {

	            let code = str.charCodeAt(off);
	            let off2 = off;
	            let map = this.symbol_map,
	                m;
	            let i = 0;

	            while (code == 32 && IWS)
	                (code = str.charCodeAt(++off2), off++);

	            while ((m = map.get(code))) {
	                map = m;
	                off2 += 1;
	                code = str.charCodeAt(off2);
	            }

	            if (map.IS_SYM) {
	                NORMAL_PARSE = false;
	                base = off;
	                length = off2 - off;
	                //char += length;
	            }
	        }

	        if (NORMAL_PARSE) {

	            for (;;) {

	                base = off;

	                length = 1;

	                const code = str.charCodeAt(off);

	                if (code < 128) {

	                    switch (jump_table$2[code]) {
	                        case 0: //NUMBER
	                            while (++off < l && (12 & number_and_identifier_table[str.charCodeAt(off)]));

	                            if ((str[off] == "e" || str[off] == "E") && (12 & number_and_identifier_table[str.charCodeAt(off + 1)])) {
	                                off++;
	                                if (str[off] == "-") off++;
	                                marker.off = off;
	                                marker.tl = 0;
	                                marker.next();
	                                off = marker.off + marker.tl;
	                                //Add e to the number string
	                            }

	                            type = number$2;
	                            length = off - base;

	                            break;
	                        case 1: //IDENTIFIER
	                            while (++off < l && ((10 & number_and_identifier_table[str.charCodeAt(off)])));
	                            type = identifier$2;
	                            length = off - base;
	                            break;
	                        case 2: //QUOTED STRING
	                            if (this.PARSE_STRING) {
	                                type = symbol$2;
	                            } else {
	                                while (++off < l && str.charCodeAt(off) !== code);
	                                type = string$2;
	                                length = off - base + 1;
	                            }
	                            break;
	                        case 3: //SPACE SET
	                            while (++off < l && str.charCodeAt(off) === SPACE$2);
	                            type = white_space$2;
	                            length = off - base;
	                            break;
	                        case 4: //TAB SET
	                            while (++off < l && str[off] === HORIZONTAL_TAB$2);
	                            type = white_space$2;
	                            length = off - base;
	                            break;
	                        case 5: //CARIAGE RETURN
	                            length = 2;
	                            //intentional
	                        case 6: //LINEFEED
	                            type = new_line$2;
	                            line++;
	                            base = off;
	                            root = off;
	                            off += length;
	                            char = 0;
	                            break;
	                        case 7: //SYMBOL
	                            type = symbol$2;
	                            break;
	                        case 8: //OPERATOR
	                            type = operator$2;
	                            break;
	                        case 9: //OPEN BRACKET
	                            type = open_bracket$2;
	                            break;
	                        case 10: //CLOSE BRACKET
	                            type = close_bracket$2;
	                            break;
	                        case 11: //Data Link Escape
	                            type = data_link$2;
	                            length = 4; //Stores two UTF16 values and a data link sentinel
	                            break;
	                    }
	                } else {
	                    break;
	                }

	                if (IWS && (type & white_space_new_line$2)) {
	                    if (off < l) {
	                        type = symbol$2;
	                        //off += length;
	                        continue;
	                    } else {
	                        //Trim white space from end of string
	                        //base = l - off;
	                        //marker.sl -= off;
	                        //length = 0;
	                    }
	                }
	                break;
	            }
	        }

	        marker.type = type;
	        marker.off = base;
	        marker.tl = (this.masked_values & CHARACTERS_ONLY_MASK$2) ? Math.min(1, length) : length;
	        marker.char = char + base - root;
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
	    aC(char) { return this.assertCharacter(char) }
	    /**
	     * Compares the character value of the current token to the value passed in. Advances to next token if the two are equal.
	     * @public
	     * @throws {Error} - `Expecting "${text}" got "${this.text}"`
	     * @param {String} text - The string to compare.
	     */
	    assertCharacter(char) {

	        if (this.off < 0) this.throw(`Expecting ${char[0]} got null`);

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
	                this.p = new Lexer$2(this.str, false, true);
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
	    s(start) { return this.slice(start) }

	    /**
	     * Returns a slice of the parsed string beginning at `start` and ending at the current token.
	     * @param {Number | LexerBeta} start - The offset in this.str to begin the slice. If this value is a LexerBeta, sets the start point to the value of start.off.
	     * @return {String} A substring of the parsed string.
	     * @public
	     */
	    slice(start = this.off) {

	        if (start instanceof Lexer$2) start = start.off;

	        return this.str.slice(start, (this.off <= start) ? this.sl : this.off);
	    }

	    /**
	     * Skips to the end of a comment section.
	     * @param {boolean} ASSERT - If set to true, will through an error if there is not a comment line or block to skip.
	     * @param {Lexer} [marker=this] - If another Lexer is passed into this method, it will advance the token state of that Lexer.
	     */
	    comment(ASSERT = false, marker = this) {

	        if (!(marker instanceof Lexer$2)) return marker;

	        if (marker.ch == "/") {
	            if (marker.pk.ch == "*") {
	                marker.sync();
	                while (!marker.END && (marker.next().ch != "*" || marker.pk.ch != "/")) { /* NO OP */ }
	                marker.sync().assert("/");
	            } else if (marker.pk.ch == "/") {
	                const IWS = marker.IWS;
	                while (marker.next().ty != Types$2.new_line && !marker.END) { /* NO OP */ }
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

	    toString() {
	        return this.slice();
	    }

	    /**
	     * Returns new Whind Lexer that has leading and trailing whitespace characters removed from input. 
	     * leave_leading_amount - Maximum amount of leading space caracters to leave behind. Default is zero
	     * leave_trailing_amount - Maximum amount of trailing space caracters to leave behind. Default is zero
	     */
	    trim(leave_leading_amount = 0, leave_trailing_amount = leave_leading_amount) {
	        const lex = this.copy();

	        let space_count = 0,
	            off = lex.off;

	        for (; lex.off < lex.sl; lex.off++) {
	            const c = jump_table$2[lex.string.charCodeAt(lex.off)];

	            if (c > 2 && c < 7) {

	                if (space_count >= leave_leading_amount) {
	                    off++;
	                } else {
	                    space_count++;
	                }
	                continue;
	            }

	            break;
	        }

	        lex.off = off;
	        space_count = 0;
	        off = lex.sl;

	        for (; lex.sl > lex.off; lex.sl--) {
	            const c = jump_table$2[lex.string.charCodeAt(lex.sl - 1)];

	            if (c > 2 && c < 7) {
	                if (space_count >= leave_trailing_amount) {
	                    off--;
	                } else {
	                    space_count++;
	                }
	                continue;
	            }

	            break;
	        }

	        lex.sl = off;

	        if (leave_leading_amount > 0)
	            lex.IWS = false;

	        lex.token_length = 0;

	        lex.next();

	        return lex;
	    }

	    /** Adds symbol to symbol_map. This allows custom symbols to be defined and tokenized by parser. **/
	    addSymbol(sym) {
	        if (!this.symbol_map)
	            this.symbol_map = new Map;


	        let map = this.symbol_map;

	        for (let i = 0; i < sym.length; i++) {
	            let code = sym.charCodeAt(i);
	            let m = map.get(code);
	            if (!m) {
	                m = map.set(code, new Map).get(code);
	            }
	            map = m;
	        }
	        map.IS_SYM = true;
	    }

	    /*** Getters and Setters ***/
	    get string() {
	        return this.str;
	    }

	    get string_length() {
	        return this.sl - this.off;
	    }

	    set string_length(s) {}

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
	    get tx() { return this.text }

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
	    get ty() { return this.type }

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
	    get pk() { return this.peek() }

	    /**
	     * Proxy for Lexer.prototype.next
	     * @public
	     */
	    get n() { return this.next() }

	    get END() { return this.off >= this.sl }
	    set END(v) {}

	    get type() {
	        return 1 << (this.masked_values & TYPE_MASK$2);
	    }

	    set type(value) {
	        //assuming power of 2 value.
	        this.masked_values = (this.masked_values & ~TYPE_MASK$2) | ((getNumbrOfTrailingZeroBitsFromPowerOf2$2(value)) & TYPE_MASK$2);
	    }

	    get tl() {
	        return this.token_length;
	    }

	    set tl(value) {
	        this.token_length = value;
	    }

	    get token_length() {
	        return ((this.masked_values & TOKEN_LENGTH_MASK$2) >> 7);
	    }

	    set token_length(value) {
	        this.masked_values = (this.masked_values & ~TOKEN_LENGTH_MASK$2) | (((value << 7) | 0) & TOKEN_LENGTH_MASK$2);
	    }

	    get IGNORE_WHITE_SPACE() {
	        return this.IWS;
	    }

	    set IGNORE_WHITE_SPACE(bool) {
	        this.iws = !!bool;
	    }

	    get CHARACTERS_ONLY() {
	        return !!(this.masked_values & CHARACTERS_ONLY_MASK$2);
	    }

	    set CHARACTERS_ONLY(boolean) {
	        this.masked_values = (this.masked_values & ~CHARACTERS_ONLY_MASK$2) | ((boolean | 0) << 6);
	    }

	    get IWS() {
	        return !!(this.masked_values & IGNORE_WHITESPACE_MASK$2);
	    }

	    set IWS(boolean) {
	        this.masked_values = (this.masked_values & ~IGNORE_WHITESPACE_MASK$2) | ((boolean | 0) << 5);
	    }

	    get PARSE_STRING() {
	        return !!(this.masked_values & PARSE_STRING_MASK$2);
	    }

	    set PARSE_STRING(boolean) {
	        this.masked_values = (this.masked_values & ~PARSE_STRING_MASK$2) | ((boolean | 0) << 4);
	    }

	    /**
	     * Reference to token id types.
	     */
	    get types() {
	        return Types$2;
	    }
	}

	Lexer$2.prototype.addCharacter = Lexer$2.prototype.addSymbol;

	function whind$3(string, INCLUDE_WHITE_SPACE_TOKENS = false) { return new Lexer$2(string, INCLUDE_WHITE_SPACE_TOKENS) }

	whind$3.constructor = Lexer$2;

	Lexer$2.types = Types$2;
	whind$3.types = Types$2;

	function integrate_scope(prototype, env) {
	    const element_prototype = prototype.__proto__;

	    prototype.createElement = function(scope) {
	        if (!scope.ele || this.getAttribute("element")) {

	            const ele = element_prototype.createElement.call(this);

	            if (scope.ele) {
	                scope.ele.appendChild(ele);
	                scope.ele = ele;
	            }

	            return ele;
	        }

	        return scope.ele;
	    };
	    /*
	    */
	    prototype.buildExisting = function(element, scope, presets = this.presets, slots = {}, pinned = {}, win = window, css = this.css, FINAL_UPDATE = false) {

	        if (this.CHANGED & 3) {
	            //IO CHANGE 
	            //Attributes
	            if (this.CHANGED & 4) {
	                let scp = scope;
	                for (const s of scope.scopes) {
	                    if (s.ast == this) {
	                        scp = s;
	                    }
	                }

	                this.replacing_element = element;

	                const node = element.parentNode;

	                const model = scp.model;

	                this.remount(element, scp, presets, slots, pinned);

	                //node.replaceChild(scp.ele, element);
	                //node.appendChild(element);

	                scp.load(model);
	               // / scp.reloadFromHTML();

	                if (scope !== scp);
	                scope.addScope(scp);

	                return true;
	            }

	            if (this._merged_)
	                this._merged_.buildExisting(element, source, presets, taps);

	            if (this.CHANGED & 2) {
	                //rebuild children
	                const children = (element) ? element.childNodes : [];

	                for (let i = 0, j = 0; i < this.children.length; i++) {
	                    const node = this.children[i];
	                    if (node.buildExisting(children[j], scope, presets, slots, pinned, win, css, FINAL_UPDATE))
	                        j++;
	                }
	            }
	        }

	        if(FINAL_UPDATE)
	            this.CHANGED = 0;

	        return true;
	    };

	    prototype.remount = function(element, scope, presets, slots, pinned) {
	        /* Remove established taps, scopes, ios, and containers */

	        for (const tap of scope.taps.values())
	            tap.destroy();

	        while (scope.scopes[0])
	            scope.scopes[0].destroy();

	        // Reset element and rebuild.

	       element.innerHTML = "";

	        if (this.HAS_TAPS)
	            this.createRuntimeTaplist(scope);

	        scope._model_name_ = this.model_name;
	        scope._schema_name_ = this.schema_name;

	        //Reset pinned
	        pinned = {};

	       const ele = element_prototype.mount.call(this, null, scope, presets, slots, pinned);

	       return ele;
	    };
	}

	function integrate_style(prototype, env) {

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

	const observer_mixin_symbol$1 = Symbol("observer_mixin_symbol");

	const observer_mixin$1 = function(calling_name, prototype) {

	    const observer_identifier = Symbol("observer_array_reference");

	    prototype[observer_mixin_symbol$1] = observer_identifier;

	    //Adds an observer to the object instance. Applies a property to the observer that references the object instance.
	    //Creates new observers array if one does not already exist.
	    prototype.addObserver = function(...observer_list) {
	        let observers = this[observer_identifier];

	        if (!observers)
	            observers = this[observer_identifier] = [];

	        for (const observer of observer_list) {

	            if (observer[observer_identifier] == this)
	                return

	            if (observer[observer_identifier])
	                observer[observer_identifier].removeObserver(observer);

	            observers.push(observer);

	            observer[observer_identifier] = this;
	        }
	    };

	    //Removes an observer from the object instance. 
	    prototype.removeObserver = function(...observer_list) {

	        const observers = this[observer_identifier];

	        for (const observer of observer_list)
	            for (let i = 0, l = observers.length; i < l; i++)
	                if (observers[i] == observer) return (observer[observer_identifier] = null, observers.splice(i, 1));

	    };


	    prototype.updateObservers = function() {
	        const observers = this[observer_identifier];

	        if (observers)
	            observers.forEach(obj => obj[calling_name](this));
	    };
	};

	//Properly destructs this observers object on the object instance.
	observer_mixin$1.destroy = function(observer_mixin_instance) {

	    const symbol = observer_mixin_instance.constructor.prototype[observer_mixin_symbol$1];

	    if (symbol) {
	        if (observer_mixin_instance[symbol])
	            observer_mixin_instance[symbol].forEach(observer=>observer[symbol] = null);

	        observer_mixin_instance[symbol].length = 0;
	        
	        observer_mixin_instance[symbol] = null;
	    }
	};

	observer_mixin$1.mixin_symbol = observer_mixin_symbol$1;

	Object.freeze(observer_mixin$1);

	function integrate_runtime_scope(prototype, env) {
	    observer_mixin$1("updatedScope", prototype);

	    prototype.rebuild = function(FINAL_UPDATE = false) {
	        this.ast.buildExisting(this.ele, this, this.presets, this.taps, {}, this.window, undefined, FINAL_UPDATE);
	        this.loadCSS();
	        this.updateCachedData();
	    };

	    prototype.reloadFromHTML = function(){
	        if(this.parent)
	            this.parent.updatedScope();
	    };

	    prototype.loadCSS = function(element = this.ele, CSS = this.css) {

	        for (const css of CSS) {

	            const rules = css.getApplicableRules(element);

	            element.style = ("" + rules).slice(1, -1) + "";

	            css.addObserver(this);
	        }

	        for(const ele of Array.prototype.slice.apply(element.children))
	            this.loadCSS(ele, CSS);
	    };

	    prototype.updatedCSS = function() {
	        this.rebuild();
	        env.ui.interface.update();
	    };
	}

	/*
		Integrates Flame systems with Wick HTML nodes
	*/
	async function wick_element_integration(integrating_wick, env) {

	    //Replacing the compile environment references to css elements ensures that all css data types are consistent throughout the flame environment
	    /*integrating_wick.compiler_environment.stylesheet = css.stylesheet;
	    integrating_wick.compiler_environment.stylerule = css.stylerule;
	    integrating_wick.compiler_environment.ruleset = css.ruleset;
	    integrating_wick.compiler_environment.compoundSelector = css.compoundSelector;
	    integrating_wick.compiler_environment.comboSelector = css.comboSelector;
	    integrating_wick.compiler_environment.typeselector = css.typeselector;
	    integrating_wick.compiler_environment.selector = css.selector;
	    integrating_wick.compiler_environment.idSelector = css.idSelector;
	    integrating_wick.compiler_environment.classSelector = css.classSelector;
	    integrating_wick.compiler_environment.attribSelector = css.attribSelector;
	    integrating_wick.compiler_environment.pseudoClassSelector = css.pseudoClassSelector;
	    integrating_wick.compiler_environment.pseudoElementSelector = css.pseudoElementSelector;
	    integrating_wick.compiler_environment.parseDeclaration = css.parseDeclaration;*/

	    const
	        $filter = integrating_wick("<f/>"),
	        $scope = integrating_wick("<scope test=((0))/>"),
	        $slot = integrating_wick("<slot/>"),
	        $void = integrating_wick("<void/>"),
	        $style = integrating_wick("<style></style>"),
	        $svg = integrating_wick("<svg/>"),
	        $container = integrating_wick("<container/>"),
	        $import = integrating_wick("<link/>"),
	        $pre = integrating_wick("<pre/>"),
	        $element = integrating_wick("<div>test</div>"),
	        $script = integrating_wick("<script></script>"),
	        $link = integrating_wick("<a/>");

	    await $link.pending;

	    const
	        attribute_prototype = $scope.ast.getAttrib("test").constructor.prototype,
	        binding_prototype = $scope.ast.getAttrib("test").value.constructor.prototype,
	        filter_prototype = $filter.ast.constructor.prototype,
	        scope_prototype = $scope.ast.constructor.prototype,
	        slot_prototype = $slot.ast.constructor.prototype,
	        void_prototype = $void.ast.constructor.prototype,
	        style_prototype = $style.ast.constructor.prototype,
	        svg_prototype = $svg.ast.constructor.prototype,
	        container_prototype = $container.ast.constructor.prototype,
	        import_prototype = $import.ast.constructor.prototype,
	        pre_prototype = $pre.ast.constructor.prototype,
	        element_prototype = $element.ast.constructor.prototype,
	        text_prototype = $element.ast.children[0].constructor.prototype,
	        script_prototype = $script.ast.constructor.prototype,
	        link_prototype = $link.ast.constructor.prototype;

	    env.wick.nodes = {
	        binding : binding_prototype.constructor,
	        attribute : attribute_prototype.constructor,
	        filter : filter_prototype.constructor,
	        scope : scope_prototype.constructor,
	        slot : slot_prototype.constructor,
	        void : void_prototype.constructor,
	        style : style_prototype.constructor,
	        svg : svg_prototype.constructor,
	        container : container_prototype.constructor,
	        import : import_prototype.constructor,
	        pre : pre_prototype.constructor,
	        element : element_prototype.constructor,
	        script : script_prototype.constructor,
	        link : link_prototype.constructor,
	        text : text_prototype.constructor
	    };

	    integrate_element(element_prototype, env);
	    integrate_text(text_prototype, element_prototype, env);
	    integrate_scope(scope_prototype,element_prototype, env);
	    integrate_style(style_prototype, env);

	    integrate_runtime_scope((await $scope.mount()).constructor.prototype, env);
	}

	let global_cache = null;

	function getApplicableRules(system, component, element) {
	    return system.css.manager.aquireCSS(component, element);
	}

	function getUniqueRule(system, component, element) {
	    return system.css.manager.getUnique(component, element);
	}

	function mergeRules(system, ...rules) {
	    return system.css.manager.mergeRules(rules);
	}

	class ComputedStyle{
	    constructor(component, element, cache){
	        this.cache = cache;
	        this._computed = component.window.getComputedStyle(element);
	        this.brect = element.getBoundingClientRect();
	    }

	    get width(){
	        return this.brect.width;
	    }

	    get hight(){
	        return this.brect.height;
	    }

	    get(value){

	        const internal_value = this.cache.rules.props[value];

	        if(internal_value)
	            return internal_value.toString();
	        
	        return this._computed.getPropertyValue(value);
	    }
	}

	/* Cache collects info about the CSS state of an element and provides methodes to create new properties. */

	class Cache {

	    constructor() {
	        this.rules = null;
	        this.element = null;
	        this.component = null;
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
	        this._computed = null;
	    }

	    destroy() {
	        this.rules = null;
	        this.element = null;
	        this._computed = null;
	        this.cssflagsA = 0;
	        this.cssflagsB = 0;
	        this.move_type = "";
	        this.valueA = 0;
	        this.valueB = 0;
	        this.valueC = 0;
	        this.valueD = 0;
	        this.next = global_cache;
	        global_cache = this;
	    }

	    get computed () {
	        if(!this._computed)
	            this._computed = new ComputedStyle(this.component, this.element, this);
	        return this._computed; 
	    }

	    update(system){
	        if(!system)
	            return;

	        this.generateMovementCache(system, this.component, this.element);
	    }

	    generateMovementCache(system, component, element) {
	        this.system = system;

	        let move_type = system.project.components.move_type;

	        let unique_rule = getUniqueRule(system, component, element),
	            css_r = getApplicableRules(system, component, element),
	            css = mergeRules(system, ...css_r);

	        this.unique = unique_rule;

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
	                this.setCSSProp(`left:0px`);
	                v |= 1 << 5;
	            }

	            if ((v & 20) == 0) { // HT + HR
	                //missing top / bottom position value
	                //Add top
	                this.setCSSProp(`top:0px`);
	                v |= 1 << 2;
	            }
	        } else if ((960 & v) > 0) {
	            //using margin
	        } else {

	            //Create left and top positions or us margin depending on current user preferences.
	            this.setCSSProp(`left:0px;top:0px`);
	            v |= 4 | 32;
	        }

	        if ((v & 3) == 0) {

	            if (move_type == "absolute") {
	                v |= 2;
	                this.setCSSProp('position:absolute');
	            } else if (move_type == "relative") {
	                v |= 1;
	                this.setCSSProp('position:relative;');
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
	        css_r = getApplicableRules(system, component, element);
	        this.rules = mergeRules(system,...css_r);
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

	    setCSSProp(string){
	        this.rules = mergeRules(this.system,(this.unique.addProp(string), this.unique), this.rules);
	    }
	}

	//Flags
	Cache.relative = 1;
	Cache.absolute = 2;

	function CacheFactory(system, component, element) {

	    if (element.flame_cache){
	        return element.flame_cache;
	    }

	    let cache;

	    if (global_cache) {
	        cache = global_cache;
	        global_cache = global_cache.next;
	    } else
	        cache = new Cache();

	    cache.component = component;
	    cache.element = element;

	    cache.generateMovementCache(system, component, element);

	    element.flame_cache = cache;

	    return cache;
	}

	CacheFactory.clear = function(element){
	    
	    if(element.flame_cache)
	        element.flame_cache.destroy();

	    element.flame_cache = null;
	};

	let types$1 = types;

	function getContentBox(ele, win = window, system) {
	    const
	        scale = system.ui.interface.transform.scale,

	        rect = ele.getBoundingClientRect(),
	        par_prop = win.getComputedStyle(ele),

	        border_l = parseFloat(par_prop.getPropertyValue("border-left")),
	        border_r = parseFloat(par_prop.getPropertyValue("border-right")),
	        border_t = parseFloat(par_prop.getPropertyValue("border-top")),
	        border_b = parseFloat(par_prop.getPropertyValue("border-bottom")),

	        top = rect.top / scale + border_t,
	        left = rect.left / scale + border_l,
	        width = rect.width / scale - border_l - border_r,
	        height = rect.height / scale - border_t - border_b;
	    return { top, left, width, height };
	}

	/** 
	    Handles the rebuild routine of wick elements 
	*/
	function prepRebuild(element, LINKED = false) {
	    element.wick_node.prepRebuild();
	    if (!LINKED) {
	        element.wick_node.rebuild();
	    }
	}

	/** 
	    Ensures the element has a compatible `display` value border-box properties
	*/
	function ensureBlocklike(system, component, element) {
	    return
	    const cache = CacheFactory(system, component, element);
	    const display = cache.computed.get("display");
	    //Make sure we have an element that's prepared to change it's shape. If it's display type is inline, it needs to be changed to inline block.
	    switch (display) {
	        case "inline":
	            cache.setCSSProp("display:inline-block");
	            cache.update(system);
	            break;
	        default:
	            //do nothing
	            break;

	    }
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

	const adjust_data = { RELATIVE: false, value: 0, denominator: 0, prop: null };

	function numericAdjust(ALLOW_NEGATIVE = false) {
	    let excess = 0, value = adjust_data.value;

	    if (!ALLOW_NEGATIVE && value < 0) {
	        excess = value;
	        value = 0;
	    }

	    const prop = adjust_data.prop;

	    if (adjust_data.RELATIVE) {
	        const np = adjust_data.value / adjust_data.denominator;
	        prop.setValue(prop.value.copy(np * 100));
	    } else {
	        if (prop.value.copy)
	            prop.setValue(prop.value.copy(adjust_data.value));
	        else {
	            if (value !== 0)
	                prop.setValue(new types$1.length(adjust_data.value, "px"));
	            else
	                prop.setValue(0);
	        }
	    }

	    return excess;
	}

	function setNumericValue(propname, system, component, element, value, relative_type = 0, ALLOW_NEGATIVE = false) {
	    let
	        cache = CacheFactory(system, component, element),
	        css = cache.rules,
	        KEEP_UNIQUE = system.project.components.KEEP_UNIQUE,
	        props = css.props,
	        prop = props[propname],
	        css_name = propname.replace(/_/g, "-");

	    if (!prop) {
	        if (cache.unique.props[propname]) {
	            props = cache.unique.props;
	            prop = props[propname];
	        } else if (!KEEP_UNIQUE || true) {
	            let type = (system.project.components.default_unit || "px");
	            let value = (type == "%") ? new types$1.percentage(0) : new types$1.length(0, type);
	            cache.setCSSProp(`${css_name}:${value + type}`);
	            props = cache.unique.props;
	            prop = props[propname];
	        }
	    }

	    adjust_data.RELATIVE = false;
	    adjust_data.prop = prop;
	    adjust_data.value = value;

	    if (prop == "auto") {

	        //convert to numerical form;
	        prop.setValue(new types$1.length(value, "px"));

	        return excess;

	    } else if (prop.value.type === "%") {
	        //get the nearest positioned ancestor
	        let denominator = 1,
	            ele = null;

	        switch (relative_type) {
	            case setNumericValue.parent_width:
	                ele = element.parentElement;
	                if (ele) denominator = getContentBox(ele, component.window, system).width;
	                break;
	            case setNumericValue.parent_height:
	                ele = element.parentElement;
	                if (ele) denominator = getContentBox(ele, component.window, system).height;
	                break;
	            case setNumericValue.positioned_ancestor_width:
	                ele = getFirstPositionedAncestor(element);
	                if (ele) denominator = getContentBox(ele, component.window, system).width;
	                break;
	            case setNumericValue.positioned_ancestor_height:
	                ele = getFirstPositionedAncestor(element);
	                if (ele) denominator = getContentBox(ele, component.window, system).height;
	                break;
	            case setNumericValue.height:
	                denominator = getContentBox(component, element.window, system).width;
	                break;
	            case setNumericValue.width:
	                denominator = getContentBox(component, element.window, system).width;
	                break;
	        }

	        adjust_data.denominator = denominator;
	        adjust_data.RELATIVE = true;
	    }

	    return numericAdjust(ALLOW_NEGATIVE);
	}

	setNumericValue.parent_width = 0;
	setNumericValue.parent_height = 1;
	setNumericValue.positioned_ancestor_width = 2;
	setNumericValue.positioned_ancestor_height = 3;
	setNumericValue.height = 4;
	setNumericValue.width = 5;

	function getRatio(system, component, element, funct, original_value, delta_value, delta_measure, ALLOW_NEGATIVE = false, NO_ADJUST = false) {
	    let excess = 0,
	        ratio = 0,
	        scale = system.ui.interface.transform.scale;

	    let begin_x = element.getBoundingClientRect()[delta_measure] / scale;

	    ///*
	    if (!ALLOW_NEGATIVE && original_value + delta_value < 0) {
	        excess = original_value + delta_value;
	        delta_value = -original_value;
	    }
	    //*/


	    funct(system, component, element, original_value + delta_value);

	    let end_x = element.getBoundingClientRect()[delta_measure] / scale;

	    let diff_x = end_x - begin_x;

	    if (Math.abs(diff_x - delta_value) > 0.0005 && delta_value !== 0) {

	        ratio = (diff_x / delta_value);
	        
	        let diff = delta_value / Math.round(ratio);

	        if (diff !== 0 && !NO_ADJUST) {
	            adjust_data.value = original_value + diff;
	            let out = numericAdjust();
	            //let out = funct(system, component, element, original_value + diff, true);
	            excess += out;
	            //console.log(ratio)
	        }
	    }
	    return { ratio, excess };
	}

	function setValue(system, component, element, value_name, value) {
	    let cache = CacheFactory(system, component, element);

	    let props = cache.rules.props;

	    if (props[value_name]) {
	        props[value_name].setValue(value);
	    } else {
	        cache.setCSSProp(`${value_name.replace(/\_/g,"-")}:${value}`);
	    }
	}

	function SETWIDTH(system, component, element, x, LINKED = false) {
	    ensureBlocklike(system, component, element);

	    const excess = setNumericValue("width", system, component, element, x, setNumericValue.parent_width);

	    prepRebuild(element, LINKED);

	    return { excess_x: excess, ratio: 0 };
	}

	function SETHEIGHT(system, component, element, y, LINKED = false) {
	    ensureBlocklike(system, component, element);

	    let excess = setNumericValue("height", system, component, element, y, setNumericValue.parent_height);

	    prepRebuild(element, LINKED);

	    return { excess_y: excess, ratio: 0 };
	}

	function SETDELTAWIDTH(system, component, element, dx, ratio = 0, LINKED = false) {
	    let start_x = parseFloat(component.window.getComputedStyle(element).width),
	        excess = 0;

	    if (ratio > 0) {
	        let { ratio : r, excess_x : e } = SETWIDTH(system, component, element, start_x + dx / ratio, true);
	        ratio = r;
	        excess = e;
	    } else {
	        let { ratio: r, excess : e } = getRatio(system, component, element, SETWIDTH, start_x, dx, "width");
	        ratio = r;
	        excess = e;
	    }
	    
	    prepRebuild(element, LINKED);

	    return { excess_x: excess, ratio };
	}

	function SETDELTAHEIGHT(system, component, element, dy, ratio = 0, LINKED = false) {
	    let start_y = parseFloat(component.window.getComputedStyle(element).height),
	        excess = 0;

	    if (ratio > 0) {
	        let { ratio : r, excess_y : e } = SETHEIGHT(system, component, element, start_y + dy / ratio, true);
	        ratio = r;
	        excess = e;
	    } else {
	        let { ratio: r, excess : e } = getRatio(system, component, element, SETHEIGHT, start_y, dy, "height");
	        ratio = r;
	        excess = e;
	    }

	    prepRebuild(element, LINKED);

	    return { excess_y:excess, ratio };
	}

	const types$2 = types;

	/***************************************************************************************/
	/********************************** POSITION SUB ACTIONS *************************************/
	/***************************************************************************************/

	function SETLEFT(system, component, element, x, LINKED = false) {
	    let cache = CacheFactory(system, component, element),
	        excess = 0;
	        
	    if (x.type) {
	        cache.rules.props.left.setValue(x);
	    } else {
	        if (cache.cssflagsA & 1)
	            excess = setNumericValue("left", system, component, element, x, setNumericValue.parent_width, true);
	        else
	            excess = setNumericValue("left", system, component, element, x, setNumericValue.positioned_ancestor_width, true);
	    }

	    prepRebuild(element, LINKED);

	    return { excess_x: excess };
	}

	function SETRIGHT(system, component, element, x, LINKED = false) {
	    let cache = CacheFactory(system, component, element),
	        excess = 0;

	    if (cache.cssflagsA & 1)
	        excess = setNumericValue("right", system, component, element, x, setNumericValue.parent_width, true);
	    else
	        excess = setNumericValue("right", system, component, element, x, setNumericValue.positioned_ancestor_width, true);

	    prepRebuild(element, LINKED);

	    return { excess_x: excess };
	}

	function SETTOP(system, component, element, y, LINKED = false) {
	    let cache = CacheFactory(system, component, element),
	        excess = 0;

	    if (y.type) {
	        cache.rules.props.top.setValue(y);
	    } else {
	        if (cache.cssflagsA & 1)
	            excess = setNumericValue("top", system, component, element, y, setNumericValue.parent_height, true);
	        else
	            excess = setNumericValue("top", system, component, element, y, setNumericValue.positioned_ancestor_height, true);
	    }

	    prepRebuild(element, LINKED);

	    return { excess_y: excess };
	}

	function SETBOTTOM(system, component, element, y, LINKED = false) {
	    let cache = CacheFactory(system, component, element),
	        excess = 0;

	    if (cache.cssflagsA & 1)
	        excess = setNumericValue("bottom", system, component, element, y, setNumericValue.parent_height, true);
	    else
	        excess = setNumericValue("bottom", system, component, element, y, setNumericValue.positioned_ancestor_height, true);

	    prepRebuild(element, LINKED);

	    return { excess_y: excess };
	}

	/***************************************************************************************/
	/********************************** DELTA SUB ACTIONS *************************************/
	/***************************************************************************************/

	function SETDELTALEFT(system, component, element, dx, ratio = 0, LINKED = false) {
	    let start_x = parseFloat(component.window.getComputedStyle(element).left),
	        excess_x = 0;

	    start_x = isNaN(start_x) ? 0 : start_x;

	    if (ratio > 0)
	        excess_x = SETLEFT(system, component, element, start_x + dx / ratio, true).excess_x;
	    else {
	        let r = getRatio(system, component, element, SETLEFT, start_x, dx, "left", true);
	        ratio = r.ratio;
	        excess_x = r.excess;
	    }

	    prepRebuild(element, LINKED);

	    return { ratio, excess_x };
	}

	function SETDELTARIGHT(system, component, element, dx, ratio = 0, LINKED = false) {
	    let start_x = parseFloat(component.window.getComputedStyle(element).right),
	        excess_x = 0;

	    start_x = isNaN(start_x) ? 0 : start_x;

	    if (ratio > 0)
	        excess_x = SETRIGHT(system, component, element, start_x + dx / ratio, true).excess_x;
	    else {
	        let r = getRatio(system, component, element, SETRIGHT, start_x, dx, "right", true);
	        ratio = r.ratio;
	        excess_x = r.excess;
	    }

	    prepRebuild(element, LINKED);

	    return { ratio, excess_x };
	}


	function SETDELTATOP(system, component, element, dy, ratio = 0, LINKED = false, origin = undefined) {
	    
	    let start_x = parseFloat(component.window.getComputedStyle(element).top),
	        excess_y = 0;

	    start_x = isNaN(start_x) ? 0 : start_x;

	    if (ratio > 0)
	        excess_y = SETTOP(system, component, element, start_x + dy / ratio, true).excess_y;
	    else {
	        let r = getRatio(system, component, element, SETTOP, start_x, dy, "top", true, origin);
	        ratio = r.ratio;
	        excess_y = r.excess;
	    }

	    prepRebuild(element, LINKED);

	    return { ratio, excess_y };
	}
	function SETDELTABOTTOM(system, component, element, dy, ratio = 0, LINKED = false) {
	    let start_x = parseFloat(component.window.getComputedStyle(element).bottom),
	        excess_y = 0;

	    start_x = isNaN(start_x) ? 0 : start_x;

	    if (ratio > 0)
	        excess_y = SETBOTTOM(system, component, element, start_x + dy / ratio, true).excess_y;
	    else {
	        let r = getRatio(system, component, element, SETBOTTOM, start_x, dy, "bottom", true);
	        ratio = r.ratio;
	        excess_y = r.excess;
	    }

	    prepRebuild(element, LINKED);

	    return { ratio, excess_y };
	}

	/***************************************************************************************/
	/********************************** RESIZE ACTIONS *************************************/
	/***************************************************************************************/


	function RESIZEL(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return (component.x += dx, component.width -= dx);
	    let cache = CacheFactory(system, component, element),
	        excess_x = 0;
	    switch (cache.move_hori_type) {
	        case "left right":
	            excess_x = SETDELTALEFT(system, component, element, dx, 0, true).excess_x;
	            break;
	        case "left":
	            excess_x = SETDELTAWIDTH(system, component, element, -dx, 0, true).excess_x;
	            SETDELTALEFT(system, component, element, dx + excess_x, 0, true);
	            break;
	        case "right":
	            excess_x = SETDELTAWIDTH(system, component, element, -dx, 0, true).excess_x;
	            break;
	    }

	    prepRebuild(element, false);

	    return { excess_x };
	}

	function RESIZET(system, component, element, dx, dy, IS_COMPONENT) {
	    
	    if (IS_COMPONENT) return (component.y += dy, component.height -= dy);
	    let cache = CacheFactory(system, component, element),
	        excess_y = 0;
	    switch (cache.move_vert_type) {
	        case "top bottom":
	            excess_y = SETDELTATOP(system, component, element, dy, 0, true).excess_y;
	        case "top":
	            excess_y = SETDELTAHEIGHT(system, component, element, -dy, 0, true).excess_y;
	            SETDELTATOP(system, component, element, dy + excess_y, 0, true);
	            break;
	        case "bottom":
	            excess_y = SETDELTAHEIGHT(system, component, element, -dy, 0, true).excess_y;
	            break;
	    }

	    prepRebuild(element, false);

	    return { excess_y };
	}

	function RESIZER(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return (component.width += dx);
	    let cache = CacheFactory(system, component, element),
	        excess_x = 0;

	    switch (cache.move_hori_type) {
	        case "left right":
	            excess_x = -SETDELTARIGHT(system, component, element, -dx, 0, true).excess_x;
	            break;
	        case "right":
	            excess_x = -SETDELTAWIDTH(system, component, element, -dx, 0, true).excess_x;
	            SETDELTARIGHT(system, component, element, -dx - excess_x, 0, true);
	            break;
	        case "left":
	            excess_x = -SETDELTAWIDTH(system, component, element, dx, 0, true).excess_x;
	            break;
	    }

	    prepRebuild(element, false);

	    return { excess_x };
	}

	function RESIZEB(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return (component.height += dy);
	    let cache = CacheFactory(system, component, element),
	        excess_y = 0;
	    switch (cache.move_vert_type) {
	        case "top bottom":
	            excess_y = -SETDELTAHEIGHT(system, component, element, dy, 0, true).excess_y;
	            //SETDELTABOTTOM(system, component, element, -dy, ratio * 0.5, true);
	            break;
	        case "bottom":
	            excess_y = -SETDELTAHEIGHT(system, component, element, dy, 0, true).excess_y;
	            SETDELTABOTTOM(system, component, element, -dy - excess_y, 0, true);
	            break;
	        case "top":
	            excess_y = -SETDELTAHEIGHT(system, component, element, dy, 0, true).excess_y;
	            break;
	    }

	    prepRebuild(element, false);

	    return { excess_y }
	}

	function SUBRESIZEB(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return (component.height += dy);
	    let cache = CacheFactory(system, component, element);
	    //get the bottom value of the element;

	    if (cache.valueB == 0) {
	        let rect = element.getBoundingClientRect();
	        let bottom = rect.y + rect.height;
	        SUBRESIZEB(system, component, element, dx, dy, 1);
	        rect = element.getBoundingClientRect();
	        let bottom2 = rect.y + rect.height;
	        if (bottom2 - bottom !== dy) {
	            let ratio = ((bottom2 - bottom) / dy);
	            let diff = dy / ratio;
	            if (diff !== 0) {
	                SUBRESIZEB(system, component, element, dx, -diff, ratio);
	                cache.valueB = ratio;
	            }
	        }
	    } else
	        SUBRESIZEB(system, component, element, dx, dy, cache.valueB);
	}

	/***************************************************************************************************/
	/********************************** COMBINATION RESIZE ACTIONS *************************************/
	/***************************************************************************************************/

	function RESIZETL(system, component, element, dx, dy, IS_COMPONENT) {
	    let { excess_x } = RESIZEL(system, component, element, dx, dy, IS_COMPONENT);
	    let { excess_y } = RESIZET(system, component, element, dx, dy, IS_COMPONENT);

	    if (!IS_COMPONENT)
	        prepRebuild(element, false);

	    return { excess_x, excess_y };
	}

	function RESIZETR(system, component, element, dx, dy, IS_COMPONENT) {

	    let { excess_x } = RESIZER(system, component, element, dx, dy, IS_COMPONENT);
	    let { excess_y } = RESIZET(system, component, element, dx, dy, IS_COMPONENT);
	    if (!IS_COMPONENT)
	        prepRebuild(element, false);

	    return { excess_x, excess_y };
	}

	function RESIZEBL(system, component, element, dx, dy, IS_COMPONENT) {

	    let { excess_x } = RESIZEL(system, component, element, dx, dy, IS_COMPONENT);
	    let { excess_y } = RESIZEB(system, component, element, dx, dy, IS_COMPONENT);
	    if (!IS_COMPONENT)
	        prepRebuild(element, false);

	    return { excess_x, excess_y  };
	}

	function RESIZEBR(system, component, element, dx, dy, IS_COMPONENT) {
	    let { excess_x } = RESIZER(system, component, element, dx, dy, IS_COMPONENT);
	    let { excess_y } = RESIZEB(system, component, element, dx, dy, IS_COMPONENT);
	    if (!IS_COMPONENT)
	        prepRebuild(element, false);

	    return { excess_x, excess_y };
	}

	const types$3 = types;

	/**
	 * Actions provide mechanisms for updating an element, document, and component through user input. 
	 */
	function MOVE(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
	 
	    if (IS_COMPONENT) {
	        if(!component) debugger;
	        component.x += dx;
	        component.y += dy;
	    } else {

	        // Get CSS information on element and update appropriate records
	        let cache = CacheFactory(system, component, element);

	        let css = cache.rules;

	        if (!css.props.position)
	            cache.setCSSProp("position:relative");

	        if(css.props.position.value !== "static"){
	         
	            switch (cache.move_hori_type) {
	                case "left right margin":
	                    //in cases of absolute
	                    cache.valueB = SETDELTARIGHT(system, component, element, -dx, cache.valueB).ratio;
	                    cache.valueA = SETDELTALEFT(system, component, element, dx, cache.valueA).ratio;
	                    break;
	                case "left right":
	                    cache.valueB = SETDELTARIGHT(system, component, element, -dx, cache.valueB).ratio;
	                case "left":
	                    cache.valueA = SETDELTALEFT(system, component, element, dx, cache.valueA).ratio;
	                    break;
	                case "right":
	                    cache.valueB = SETDELTARIGHT(system, component, element, -dx, cache.valueB).ratio;
	                    break;
	            }

	            switch (cache.move_vert_type) {
	                case "top bottom":
	                    cache.valueC = SETDELTABOTTOM(system, component, element, -dy, cache.valueC).ratio;
	                case "top":
	                    cache.valueD = SETDELTATOP(system, component, element, dy, cache.valueD).ratio;
	                    break;
	                case "bottom":
	                    cache.valueC = SETDELTABOTTOM(system, component, element, -dy, cache.valueC).ratio;
	                    break;
	            }
	        }
	                
	        prepRebuild(element, LINKED);
	    }
	}

	function CENTER(system, component, element, HORIZONTAL = true, VERTICAL = true, LINKED = false) {
	    // Get CSS information on element and update appropriate records
	    let cache = CacheFactory(system, component, element);
	    let css = cache.rules;

	    let ancestor = getFirstPositionedAncestor(element);

	    let ancestor_box = ancestor.getBoundingClientRect();

	    let own_box = element.getBoundingClientRect();

	    let w = own_box.width;
	    let diff = (ancestor_box.width - w) / 2;

	    switch (cache.move_hori_type) {
	        case "left right":
	            //get the width of the parent element
	            css.props.left = new types$3.length(diff, "px");
	            css.props.right = new types$3.length(diff, "px");
	            cache.setCSSProp(`margin-left:auto; margin-right:auto`);
	            break;
	        case "left":
	            cache.setCSSProp(`margin-left:auto; margin-right:auto;left:0px;right:0px`);
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
	            cache.valueC = setBottom(element, -dy, css, cache.valueC).ratio;
	        case "top":
	            cache.valueD = setDeltaTop(element, dy, css, cache.valueD);
	            break;
	        case "bottom":
	            cache.valueC = setBottom(element, -dy, css, cache.valueC);
	            break;
	    }
	    */
	                
	    prepRebuild(element, LINKED);
	}

	function CLEARLEFT(system, component, element, LINKED = false) {
	    let cache = CacheFactory(system, component, element);
	    let css = cache.rules;
	    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
	    if (css.props.left) {
	        if (KEEP_UNIQUE) cache.setCSSProp(`left:auto`);
	        else css.props.left = "auto";
	    }
	    if (!LINKED) element.wick_node.prepRebuild();
	}
	//clear top
	function CLEARTOP(system, component, element, LINKED = false) {
	    let cache = CacheFactory(system, component, element);
	    let css = cache.rules;
	    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
	    if (css.props.top) {
	        if (KEEP_UNIQUE) cache.setCSSProp(`top:auto`);
	        else css.props.top = "auto";
	    }
	    if (!LINKED) element.wick_node.prepRebuild();
	}
	//clear right
	function CLEARIGHT(system, component, element, LINKED = false) {
	    let cache = CacheFactory(system, component, element);
	    let css = cache.rules;
	    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
	    if (css.props.right) {
	        if (KEEP_UNIQUE) cache.setCSSProp(`right:auto`);
	        else css.props.right = "auto";
	    }
	    if (!LINKED) element.wick_node.prepRebuild();
	}
	//clear bottom
	function CLEABOTTOM(system, component, element, LINKED = false) {
	    let cache = CacheFactory(system, component, element);
	    let css = cache.rules;
	    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
	    if (css.props.bottom) {
	        if (KEEP_UNIQUE) cache.setCSSProp(`bottom:auto`);
	        else css.props.bottom = "auto";
	    }
	    if (!LINKED) element.wick_node.prepRebuild();
	}

	//clear margin-top
	function CLEARMARGINTOP(system, component, element, LINKED = false) {
	    let cache = CacheFactory(system, component, element);
	    let css = cache.rules;
	    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
	    if (css.props.margin_left) {
	        if (KEEP_UNIQUE) cache.setCSSProp(`margin-top:0`);
	        else css.props.margin_left = 0;
	    }
	    if (!LINKED) element.wick_node.prepRebuild();
	}
	//clear margin-left
	function CLEARMARGINLEFT(system, component, element, LINKED = false) {
	    let cache = CacheFactory(system, component, element);
	    let css = cache.rules;
	    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
	    if (css.props.margin_left) {
	        if (KEEP_UNIQUE) cache.setCSSProp(`margin-left:0`);
	        else css.props.margin_left = 0;
	    }
	    if (!LINKED) element.wick_node.prepRebuild();
	}

	//clear margin-right
	function CLEARMARGINRIGHT(system, component, element, LINKED = false) {
	    let cache = CacheFactory(system, component, element);
	    let css = cache.rules;
	    let KEEP_UNIQUE = system.project.components.KEEP_UNIQUE;
	    if (css.props.margin_right) {
	        if (KEEP_UNIQUE) cache.setCSSProp(`margin-right:0`);
	        else css.props.margin_right = 0;
	    }
	    if (!LINKED) element.wick_node.prepRebuild();
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

	function resetMargin(system, component, element) {
	    let cache = CacheFactory(system, component, element);
	    let css = cache.rules;
	    if (css.props.margin) {
	        //Convert margin value into 
	        css.props.margin = null;
	    }
	}

	function SETMARGINLEFT(system, component, element, x, LINKED = false) {
	    resetMargin(system, component, element);
	    setNumericValue("margin_left", system, component, element, x, setNumericValue.parent_width);
	    if (!LINKED) element.wick_node.prepRebuild();
	}

	function SETDELTAMARGINLEFT(system, component, element, dx, ratio = 0, LINKED = false) {
	    let start_x = parseFloat(component.window.getComputedStyle(element)["margin-left"]);

	    if (ratio > 0)
	        SETMARGINLEFT(system, component, element, start_x + dx / ratio, true);
	    else
	        ratio = getRatio(system, component, element, SETMARGINLEFT, start_x, dx, "margin-left");

	    if (!LINKED) element.wick_node.prepRebuild();

	    return ratio;
	}

	function SETMARGINTOP(system, component, element, x, LINKED = false) {
	    resetMargin(system, component, element);
	    setNumericValue("margin_top", system, component, element, x, setNumericValue.parent_height);
	    if (!LINKED) element.wick_node.prepRebuild();
	}

	function SETDELTAMARGINTOP(system, component, element, dx, ratio = 0, LINKED = false) {
	    let start_x = parseFloat(component.window.getComputedStyle(element)["margin-top"]);

	    if (ratio > 0)
	        SETMARGINTOP(system, component, element, start_x + dx / ratio, true);
	    else
	        ratio = getRatio(system, component, element, SETMARGINTOP, start_x, dx, "margin-top");

	    if (!LINKED) element.wick_node.prepRebuild();

	    return ratio;
	}

	function SETMARGINRIGHT(system, component, element, x, LINKED = false) {
	    resetMargin(system, component, element);
	    setNumericValue("margin_right", system, component, element, x, setNumericValue.parent_height);
	    if (!LINKED) element.wick_node.prepRebuild();
	}


	function SETDELTAMARGINRIGHT(system, component, element, dx, ratio = 0, LINKED = false) {
	    let start_x = parseFloat(component.window.getComputedStyle(element)["margin-right"]);

	    if (ratio > 0)
	        SETMARGINRIGHT(system, component, element, start_x + dx / ratio, true);
	    else
	        ratio = getRatio(system, component, element, SETMARGINRIGHT, start_x, dx, "margin-right");

	    if (!LINKED) element.wick_node.prepRebuild();

	    return ratio;
	}

	function SETMARGINBOTTOM(system, component, element, x, LINKED = false) {
	    resetMargin(system, component, element);
	    setNumericValue("margin_bottom", system, component, element, x, setNumericValue.parent_height);
	    if (!LINKED) element.wick_node.prepRebuild();
	}


	function SETDELTAMARGINBOTTOM(system, component, element, dx, ratio = 0, LINKED = false) {
	    let start_x = parseFloat(component.window.getComputedStyle(element)["margin-bottom"]);

	    if (ratio > 0)
	        SETMARGINBOTTOM(system, component, element, start_x + dx / ratio, true);
	    else
	        ratio = getRatio(system, component, element, SETMARGINBOTTOM, start_x, dx, "margin-bottom");

	    if (!LINKED) element.wick_node.prepRebuild();

	    return ratio;
	}

	function RESIZEMARGINT(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return;
	    SETDELTAMARGINTOP(system, component, element, dy, 0, true);
	    element.wick_node.prepRebuild();
	}

	function RESIZEMARGINR(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return;
	    SETDELTAMARGINRIGHT(system, component, element, -dx, 0, true);
	    element.wick_node.prepRebuild();
	}

	function RESIZEMARGINL(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return;
	    SETDELTAMARGINLEFT(system, component, element, dx, 0, true);
	    element.wick_node.prepRebuild();
	}

	function RESIZEMARGINB(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return;
	    SETDELTAMARGINBOTTOM(system, component, element, -dy, 0, true);
	    element.wick_node.prepRebuild();
	}

	function RESIZEMARGINTL(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return;
	    let cache = CacheFactory(system, component, element);

	    if((cache.cssflagsA & 1)){
	        SETDELTALEFT(system, component, element, dx, 0, true);
	        SETDELTATOP(system, component, element, dy, 0, true);
	    }

	    SETDELTAMARGINLEFT(system, component, element, -dx, 0, true);
	    SETDELTAMARGINTOP(system, component, element, -dy, 0, true);
	    element.wick_node.prepRebuild();
	}

	function RESIZEMARGINTR(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return;
	    
	    SETDELTAMARGINRIGHT(system, component, element, dx, 0, true);
	    SETDELTAMARGINTOP(system, component, element, dy, 0, true);
	    element.wick_node.prepRebuild();
	}

	function RESIZEMARGINBL(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return;
	    SETDELTAMARGINLEFT(system, component, element, dx, 0, true);
	    SETDELTAMARGINBOTTOM(system, component, element, dy, 0, true);
	    element.wick_node.prepRebuild();
	}

	function RESIZEMARGINBR(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return;
	    SETDELTAMARGINRIGHT(system, component, element, dx, 0, true);
	    SETDELTAMARGINBOTTOM(system, component, element, dy, 0, true);
	    element.wick_node.prepRebuild();
	}

	let types$4 = types;

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
	        else cache.setCSSProp("position:absolute");
	    } else {
	        if (css.props.position) css.props.position = "absolute";
	        else cache.setCSSProp("position:absolute");
	    }
	}

	function setToRelative(cache, KEEP_UNIQUE){
	    const css = cache.rules;
	    if (KEEP_UNIQUE) {
	        if (cache.unique.r.props.position) css.props.position = "relative";
	        else cache.setCSSProp("position:relative");
	    } else {
	        if (css.props.position) css.props.position = "relative";
	        else cache.setCSSProp("position:relative");
	    }
	}

	/**
	 * Convert position to ```absolute```
	 */
	function TOPOSITIONABSOLUTE(system, component, element, LINKED = false) {
	    let cache = CacheFactory(system, component, element);
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

	            CLEARMARGINTOP(system, component, element, true);
	            CLEARMARGINLEFT(system, component, element, true);

	            SETLEFT(system, component, element, x, true);
	            SETTOP(system, component, element, y, true);
	            
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
	        element.wick_node.prepRebuild();
	        element.wick_node.rebuild();
	    }
	}

	/**
	 * Convert position to ```relative```
	 */
	function TOPOSITIONRELATIVE(system, component, element) {
	    const cache = CacheFactory(system, component, element);
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
	                setValue(system, component, element, "display", "block");

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

	            var rectp = element.parentElement.getBoundingClientRect();

	            var innerWidth = rectp.width  - (   (parseFloat(par_prop.borderLeftWidth) || 0) + (parseFloat(par_prop.paddingLeft) || 0)+
	                        (parseFloat(par_prop.borderRightWidth) || 0) + (parseFloat(par_prop.paddingRight) || 0));
	            
	            if(IS_INLINE && (offsetX + rect.width ) >= innerWidth)
	                offsetX = 0;

	            if(offsetX == 0)
	                offsetX += (parseFloat(par_prop.borderLeftWidth) || 0) + (parseFloat(par_prop.paddingLeft) || 0);
	            
	            if(offsetY == 0)
	                offsetY += (parseFloat(par_prop.borderTopWidth) || 0) + (parseFloat(par_prop.paddingTop) || 0);
	            

	            var x1 =rect.x, y1 =rect.y,  x = x1 - offsetX, y =y1 - offsetY;

	            CLEARLEFT(system, component, element, true);
	            CLEARTOP(system, component, element, true);
	            
	            SETMARGINLEFT(system, component, element, x, true);
	            SETMARGINTOP(system, component, element, y, true);
	            
	            setToRelative(cache, KEEP_UNIQUE);
	            
	            element.wick_node.prepRebuild();
	            element.wick_node.rebuild();
	            rect = element.getBoundingClientRect();
	            //enforce Position
	            var x2 = rect.x;
	            var y2 = rect.y;
	            
	            if(x2 != x1) 
	               SETMARGINLEFT(system, component, element, x - (x2 - x1), true);
	            if(y2 != y1)
	                SETMARGINTOP(system, component, element, y - (y2 - y1), true); 
	            
	            break;
	        case "fixed":
	            //add parent offset values to current position to keep it predictably in place. 
	            break;
	        default:
	            //Manually add required data
	            break;
	    }

	    element.wick_node.prepRebuild();
	    element.wick_node.rebuild();
	}


	function CONVERT_TOP(system, component, element, type) {
	    let cache = CacheFactory(system, component, element);
	    let position = parseFloat(component.window.getComputedStyle(element).top);
	    
	    switch (type) {
	        case "%":
	            cache.rules.props.top.setValue(new types$4.percentage(1));
	            break;
	        case "em":
	            cache.rules.props.top.setValue(new types$4.length(1, "em"));
	            break;
	        case "vh":
	            cache.rules.props.top.setValue(new types$4.length(1, "vh"));
	            break;
	        case "vw":
	            cache.rules.props.top.setValue(new types$4.length(1, "vw"));
	            break;
	        case "vmin":
	            cache.rules.props.top.setValue(new types$4.length(1, "vmin"));
	            break;
	        case "vmax":
	            cache.rules.props.top.setValue(new types$4.length(1, "vmax"));
	            break;
	        default:
	            cache.rules.props.top.setValue(new types$4.length(1, 'px'));
	            break;
	    }
	    SETTOP(system, component, element, position);

	    element.wick_node.prepRebuild();
	}

	function CONVERT_LEFT(system, component, element, type) {
	    let cache = CacheFactory(system, component, element);
	    let position = parseFloat(component.window.getComputedStyle(element).left);

	    switch (type) {
	        case "%":
	            cache.rules.props.left.setValue(new types$4.percentage(1));
	            break;
	        case "em":
	            cache.rules.props.left.setValue(new types$4.length(1, "em"));
	            break;
	        case "vh":
	            cache.rules.props.left.setValue(new types$4.length(1, "vh"));
	            break;
	        case "vw":
	            cache.rules.props.left.setValue(new types$4.length(1, "vw"));
	            break;
	        case "vmin":
	            cache.rules.props.left.setValue(new types$4.length(1, "vmin"));
	            break;
	        case "vmax":
	            cache.rules.props.left.setValue(new types$4.length(1, "vmax"));
	            break;
	        default:
	            cache.rules.props.left.setValue(new types$4.length(1, 'px'));
	            break;
	    }
	    SETLEFT(system, component, element, position);

	    element.wick_node.prepRebuild();
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
	function TOGGLE_UNIT(system, component, element, horizontal, vertical) {
	    // Get CSS information on element and update appropriate records
	    let cache = CacheFactory(system, component, element);
	    let css = cache.rules;
	    let rect = getFirstPositionedAncestor(element).getBoundingClientRect();
	    if (horizontal) {
	        switch (cache.move_hori_type) {
	            case "left right":
	            case "left right margin":
	                if (css.props.right.value instanceof types$4.length) {
	                    css.props.right.setValue(new types$4.percentage((css.props.right / rect.width) * 100));
	                } else {
	                    css.props.right.setValue(new types$4.length(rect.width * (css.props.right / 100), "px"));
	                } /** Intentional fall through **/
	            case "left":
	                if (css.props.left.value instanceof types$4.length) {
	                    css.props.left.setValue(new types$4.percentage((css.props.left / rect.width) * 100));
	                } else {
	                    css.props.left.setValue(new types$4.length(rect.width * (css.props.left / 100), "px"));
	                }
	                break;
	            case "right":
	                if (css.props.right.value instanceof types$4.length) {
	                    css.props.right.setValue(new types$4.percentage((css.props.right / rect.width) * 100));
	                } else {
	                    css.props.right.setValue(new types$4.length(rect.width * (css.props.right / 100), "px"));
	                }
	                break;
	        }
	    }
	    element.wick_node.prepRebuild();
	}

	/**
	 * This module is responsible for storing, updating, and caching a wick component. 
	 * In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
	 * Any associated stylesheets are managed through this componnent. 
	 */
	class Component {

	    constructor(env) {

	        this.env = env;
	        this.scope = null;
	        this.ast = null;
	        this.data = null;

	        this.frame = document.createElement("div");
	        this.frame.classList.add("flame_component");
	        this.frame.style.position = "fixed";
	        this.frame.style.backgroundColor = "white";
	        this.frame.style.overflow = "hidden";
	        this.frame.style.border = "2px solid rgba(25,25,25,0.2)";
	        this.frame.style.borderRadius = "2px";
	        this.frame.style.margin = 0;
	        this.frame.style.padding = 0;
	        this.frame.component = this;
	        
	        //Flag for mounted state of component. If a component is accessible anywhere on the main UI, then it is considered mounted. 
	        this.mounted = false;

	        //Links to local CSS scripts
	        this.local_css = [];

	        //The file path (relative to project directory), of the component file. 
	        this.file_path = "";

	        //The file name of the component. 
	        this.file_name = "";

	        //The source component manager that handles the instantiati on and runtime of Wick components. 
	        this.manager = null;

	        //this.system = system;

	        this.action = null;

	        this.width = 0;
	        this.height = 0;
	    }

	    destroy() {
	        if (this.frame.parentElement)
	            this.frame.parentElement.removeChild(this.frame);
	        this.frame = null;
	        this.scope = null;
	        this.data = null;
	    }

	    load(document) {
	        document.bind(this);
	    }

	    // Adds style sheet as the components local style sheeet. 
	    setLocalStyleSheet(cssstylesheet){
	        this.local_component_css = cssstylesheet;
	        this.addCSSData(cssstylesheet);
	    }

	    // Pushes stylesheet to the components list of stylesheets that affect the component's elements. 
	    addCSSData(cssstylesheet){

	        this.local_css.push(cssstylesheet);

	        if(this.scope && this.scope.css !== this.local_css)
	            this.updateScopeCSS();
	    }

	    updateScopeCSS(){
	        this.local_css.length = 0;
	        
	        this.scope.css.forEach(css => this.local_css.push(css));

	        //Insure that Flame environment css objects are used within the scope. 

	        this.scope.css = this.local_css;
	        
	        this.local_component_css && this.addCSSData(this.local_component_css);
	    }

	    updatedScope(){
	        this.updateScopeCSS();
	    }

	    documentReady(ast) {

	        if (this.ast) {
	            //Already have source, just need to rebuild with new tree. 
	            this.scope.ast = ast;
	            this.rebuild();
	        } else {
	            const shadow = this.frame.attachShadow({ mode: 'open' });

	            this.ast = ast;
	            this.scope = this.ast.mount();
	            this.scope.parent = this;
	            this.ast.setScope(this.scope);

	            shadow.appendChild(this.scope.ele);
	            shadow.component = this;

	            this.scope.load();
	            this.updateScopeCSS();
	        }

	        this.scope.window = this.window;
	        this.rebuild();

	        return true;
	    }

	    mountListeners() {
	        this.env.ui.manager.integrateComponentElement(this.frame, this);
	    }


	    addStyle(tree, INLINE) {

	        if (!INLINE) {
	            return;
	            //const style = new StyleNode();
	            //style.tag = "style";
	            //this.scope.ast.addChild(style);
	            //style.css = tree;
	            //tree.addObserver(style);
	            //this.local_css.splice(this.css_split, 0, tree);
	            //this.css_split++;
	        } else {
	            //insert the style into the root of the tree;
	            this.local_css.push(style);
	        }
	    }

	    /**
	     * Determines if point is in bounding box. 
	     */
	    pointInBoundingBox(x, y) {
	        this.updateDimensions();
	        const min_x = this.dimensions.left,
	            max_x = min_x + this.dimensions.width,
	            min_y = this.dimensions.top,
	            max_y = min_y + this.dimensions.height;
	        return x >= min_x && x <= max_x && y >= min_y && y <= max_y;
	    }

	    rebuild() {
	        if (this.scope)
	            this.scope.rebuild();
	    }

	    query(query) {
	        const sr = this.frame.shadowRoot;
	        if (sr)
	            return sr.querySelector(query);
	        return this.frame.querySelector(query);
	    }

	    get body() {
	        return this.frame.shadowRoot;
	    }

	    get window() {
	        return this;
	    }

	    get getComputedStyle() {
	        return (Component.getComputedStyle || (Component.getComputedStyle = window.getComputedStyle.bind(window)));
	    }

	    get innerWidth() {
	        return this.width;

	    }

	    get innerHeight() {
	        return this.height;
	    }

	    set x(x) {
	        this.frame.style.left = x + "px";
	    }

	    get x() {
	        return parseFloat(this.frame.style.left);
	    }

	    set y(y) {
	        this.frame.style.top = y + "px";
	    }

	    get y() {
	        return parseFloat(this.frame.style.top);
	    }

	    set width(w) {
	        this.frame.style.width = w + "px";
	        this.rebuild();
	    }

	    get width() {
	        return parseFloat(this.frame.style.width);
	    }

	    set height(h) {
	        this.frame.style.height = h + "px";
	        this.rebuild();
	    }
	    get height() {
	        return parseFloat(this.frame.style.height);
	    }

	    get type() {
	        return "wick";
	    }

	    toJSON() {
	        return {
	            x: this.x,
	            y: this.y,
	            width: this.width,
	            height: this.height,
	            path: this.doc_path,
	            name: this.doc_name,
	            type: "html"
	        };
	    }

	    mount(element) {
	        if (this.frame.parentNode != element) {
	            element.appendChild(this.frame);

	            if(this.width == 0 || this.height == 0){
	                const rect = this.scope.ele.getBoundingClientRect();

	                this.width = rect.width || rect.height || 100;
	                this.height = rect.height ||rect.width || 220;
	            }
	        }
	    }

	    unmount(){
	        if(this.frame.parentNode)
	            this.frame.parentNode.removeChild(this.frame);
	    }
	}

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

	const A$3 = 65;
	const a$3 = 97;
	const ACKNOWLEDGE$3 = 6;
	const AMPERSAND$3 = 38;
	const ASTERISK$3 = 42;
	const AT$3 = 64;
	const B$3 = 66;
	const b$3 = 98;
	const BACKSLASH$3 = 92;
	const BACKSPACE$3 = 8;
	const BELL$3 = 7;
	const C$3 = 67;
	const c$3 = 99;
	const CANCEL$3 = 24;
	const CARET$3 = 94;
	const CARRIAGE_RETURN$3 = 13;
	const CLOSE_CURLY$3 = 125;
	const CLOSE_PARENTH$3 = 41;
	const CLOSE_SQUARE$3 = 93;
	const COLON$3 = 58;
	const COMMA$3 = 44;
	const d$4 = 100;
	const D$3 = 68;
	const DATA_LINK_ESCAPE$3 = 16;
	const DELETE$3 = 127;
	const DEVICE_CTRL_1$3 = 17;
	const DEVICE_CTRL_2$3 = 18;
	const DEVICE_CTRL_3$3 = 19;
	const DEVICE_CTRL_4$3 = 20;
	const DOLLAR$3 = 36;
	const DOUBLE_QUOTE$3 = 34;
	const e$4 = 101;
	const E$3 = 69;
	const EIGHT$3 = 56;
	const END_OF_MEDIUM$3 = 25;
	const END_OF_TRANSMISSION$3 = 4;
	const END_OF_TRANSMISSION_BLOCK$3 = 23;
	const END_OF_TXT$3 = 3;
	const ENQUIRY$3 = 5;
	const EQUAL$3 = 61;
	const ESCAPE$3 = 27;
	const EXCLAMATION$3 = 33;
	const f$3 = 102;
	const F$3 = 70;
	const FILE_SEPERATOR$3 = 28;
	const FIVE$3 = 53;
	const FORM_FEED$3 = 12;
	const FORWARD_SLASH$3 = 47;
	const FOUR$3 = 52;
	const g$3 = 103;
	const G$3 = 71;
	const GRAVE$3 = 96;
	const GREATER_THAN$3 = 62;
	const GROUP_SEPERATOR$3 = 29;
	const h$3 = 104;
	const H$3 = 72;
	const HASH$3 = 35;
	const HORIZONTAL_TAB$3 = 9;
	const HYPHEN$3 = 45;
	const i$3 = 105;
	const I$3 = 73;
	const j$3 = 106;
	const J$3 = 74;
	const k$3 = 107;
	const K$3 = 75;
	const l$3 = 108;
	const L$3 = 76;
	const LESS_THAN$3 = 60;
	const LINE_FEED$3 = 10;
	const m$3 = 109;
	const M$3 = 77;
	const n$3 = 110;
	const N$3 = 78;
	const NEGATIVE_ACKNOWLEDGE$3 = 21;
	const NINE$3 = 57;
	const NULL$3 = 0;
	const o$3 = 111;
	const O$3 = 79;
	const ONE$3 = 49;
	const OPEN_CURLY$3 = 123;
	const OPEN_PARENTH$3 = 40;
	const OPEN_SQUARE$3 = 91;
	const p$3 = 112;
	const P$3 = 80;
	const PERCENT$3 = 37;
	const PERIOD$3 = 46;
	const PLUS$3 = 43;
	const q$3 = 113;
	const Q$3 = 81;
	const QMARK$3 = 63;
	const QUOTE$3 = 39;
	const r$4 = 114;
	const R$3 = 82;
	const RECORD_SEPERATOR$3 = 30;
	const s$3 = 115;
	const S$3 = 83;
	const SEMICOLON$3 = 59;
	const SEVEN$3 = 55;
	const SHIFT_IN$3 = 15;
	const SHIFT_OUT$3 = 14;
	const SIX$3 = 54;
	const SPACE$3 = 32;
	const START_OF_HEADER$3 = 1;
	const START_OF_TEXT$3 = 2;
	const SUBSTITUTE$3 = 26;
	const SYNCH_IDLE$3 = 22;
	const t$3 = 116;
	const T$3 = 84;
	const THREE$3 = 51;
	const TILDE$3 = 126;
	const TWO$3 = 50;
	const u$3 = 117;
	const U$3 = 85;
	const UNDER_SCORE$3 = 95;
	const UNIT_SEPERATOR$3 = 31;
	const v$3 = 118;
	const V$3 = 86;
	const VERTICAL_BAR$3 = 124;
	const VERTICAL_TAB$3 = 11;
	const w$3 = 119;
	const W$3 = 87;
	const x$4 = 120;
	const X$3 = 88;
	const y$4 = 121;
	const Y$3 = 89;
	const z$3 = 122;
	const Z$3 = 90;
	const ZERO$3 = 48;

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
	const jump_table$3 = [
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
	const number_and_identifier_table$3 = [
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

	const number$3 = 1,
	    identifier$3 = 2,
	    string$3 = 4,
	    white_space$3 = 8,
	    open_bracket$3 = 16,
	    close_bracket$3 = 32,
	    operator$3 = 64,
	    symbol$3 = 128,
	    new_line$3 = 256,
	    data_link$3 = 512,
	    alpha_numeric$3 = (identifier$3 | number$3),
	    white_space_new_line$3 = (white_space$3 | new_line$3),
	    Types$3 = {
	        num: number$3,
	        number: number$3,
	        id: identifier$3,
	        identifier: identifier$3,
	        str: string$3,
	        string: string$3,
	        ws: white_space$3,
	        white_space: white_space$3,
	        ob: open_bracket$3,
	        open_bracket: open_bracket$3,
	        cb: close_bracket$3,
	        close_bracket: close_bracket$3,
	        op: operator$3,
	        operator: operator$3,
	        sym: symbol$3,
	        symbol: symbol$3,
	        nl: new_line$3,
	        new_line: new_line$3,
	        dl: data_link$3,
	        data_link: data_link$3,
	        alpha_numeric: alpha_numeric$3,
	        white_space_new_line: white_space_new_line$3,
	    },

	    /*** MASKS ***/

	    TYPE_MASK$3 = 0xF,
	    PARSE_STRING_MASK$3 = 0x10,
	    IGNORE_WHITESPACE_MASK$3 = 0x20,
	    CHARACTERS_ONLY_MASK$3 = 0x40,
	    TOKEN_LENGTH_MASK$3 = 0xFFFFFF80,

	    //De Bruijn Sequence for finding index of right most bit set.
	    //http://supertech.csail.mit.edu/papers/debruijn.pdf
	    debruijnLUT$3 = [
	        0, 1, 28, 2, 29, 14, 24, 3, 30, 22, 20, 15, 25, 17, 4, 8,
	        31, 27, 13, 23, 21, 19, 16, 7, 26, 12, 18, 6, 11, 5, 10, 9
	    ];

	function getNumbrOfTrailingZeroBitsFromPowerOf2$3(value) {
	    return debruijnLUT$3[(value * 0x077CB531) >>> 27];
	}

	class Lexer$3 {

	    constructor(string = "", INCLUDE_WHITE_SPACE_TOKENS = false, PEEKING = false) {

	        if (typeof(string) !== "string") throw new Error(`String value must be passed to Lexer. A ${typeof(string)} was passed as the \`string\` argument.`);

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
	    copy(destination = new Lexer$3(this.str, false, true)) {
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

	        if (marker instanceof Lexer$3) {
	            if (marker.str !== this.str) throw new Error("Cannot sync Lexers with different strings!");
	            this.off = marker.off;
	            this.char = marker.char;
	            this.line = marker.line;
	            this.masked_values = marker.masked_values;
	        }

	        return this;
	    }

	    /**
	    Creates and error message with a diagrame illustrating the location of the error. 
	    */
	    errorMessage(message = ""){
	        const arrow = String.fromCharCode(0x2b89),
	            trs = String.fromCharCode(0x2500),
	            line = String.fromCharCode(0x2500),
	            thick_line = String.fromCharCode(0x2501),
	            line_number = "    " + this.line + ": ",
	            line_fill = line_number.length,
	            t = thick_line.repeat(line_fill + 48),
	            is_iws = (!this.IWS) ? "\n The Lexer produced whitespace tokens" : "";
	        const pk = this.copy();
	        pk.IWS = false;
	        while (!pk.END && pk.ty !== Types$3.nl) { pk.next(); }
	        const end = pk.off;

	        return `${message} at ${this.line}:${this.char}
${t}
${line_number+this.str.slice(Math.max(this.off - this.char, 0), end)}
${line.repeat(this.char-1+line_fill)+trs+arrow}
${t}
${is_iws}`;
	    }

	    /**
	     * Will throw a new Error, appending the parsed string line and position information to the the error message passed into the function.
	     * @instance
	     * @public
	     * @param {String} message - The error message.
	     * @param {Bool} DEFER - if true, returns an Error object instead of throwing.
	     */
	    throw (message, DEFER = false) {
	        const error = new Error(this.errorMessage(message));
	        if(DEFER)
	            return error;
	        throw error;
	    }

	    /**
	     * Proxy for Lexer.prototype.reset
	     * @public
	     */
	    r() { return this.reset() }

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

	        if (marker.sl < 1) {
	            marker.off = 0;
	            marker.type = 32768;
	            marker.tl = 0;
	            marker.line = 0;
	            marker.char = 0;
	            return marker;
	        }

	        //Token builder
	        const l = marker.sl,
	            str = marker.str,
	            IWS = marker.IWS;

	        let length = marker.tl,
	            off = marker.off + length,
	            type = symbol$3,
	            char = marker.char + length,
	            line = marker.line,
	            base = off;

	        if (off >= l) {
	            length = 0;
	            base = l;
	            char -= base - off;
	            marker.type = type;
	            marker.off = base;
	            marker.tl = length;
	            marker.char = char;
	            marker.line = line;
	            return marker;
	        }

	        for (;;) {

	            base = off;

	            length = 1;

	            const code = str.charCodeAt(off);

	            if (code < 128) {

	                switch (jump_table$3[code]) {
	                    case 0: //NUMBER
	                        while (++off < l && (12 & number_and_identifier_table$3[str.charCodeAt(off)])) ;

	                        if (str[off] == "e" || str[off] == "E") {
	                            off++;
	                            if (str[off] == "-") off++;
	                            marker.off = off;
	                            marker.tl = 0;
	                            marker.next();
	                            off = marker.off + marker.tl;
	                            //Add e to the number string
	                        }

	                        type = number$3;
	                        length = off - base;

	                        break;
	                    case 1: //IDENTIFIER
	                        while (++off < l && ((10 & number_and_identifier_table$3[str.charCodeAt(off)]))) ;
	                        type = identifier$3;
	                        length = off - base;
	                        break;
	                    case 2: //QUOTED STRING
	                        if (this.PARSE_STRING) {
	                            type = symbol$3;
	                        } else {
	                            while (++off < l && str.charCodeAt(off) !== code) ;
	                            type = string$3;
	                            length = off - base + 1;
	                        }
	                        break;
	                    case 3: //SPACE SET
	                        while (++off < l && str.charCodeAt(off) === SPACE$3) ;
	                        type = white_space$3;
	                        length = off - base;
	                        break;
	                    case 4: //TAB SET
	                        while (++off < l && str[off] === HORIZONTAL_TAB$3) ;
	                        type = white_space$3;
	                        length = off - base;
	                        break;
	                    case 5: //CARIAGE RETURN
	                        length = 2;
	                        //Intentional
	                    case 6: //LINEFEED
	                        type = new_line$3;
	                        char = 0;
	                        line++;
	                        off += length;
	                        break;
	                    case 7: //SYMBOL
	                        type = symbol$3;
	                        break;
	                    case 8: //OPERATOR
	                        type = operator$3;
	                        break;
	                    case 9: //OPEN BRACKET
	                        type = open_bracket$3;
	                        break;
	                    case 10: //CLOSE BRACKET
	                        type = close_bracket$3;
	                        break;
	                    case 11: //Data Link Escape
	                        type = data_link$3;
	                        length = 4; //Stores two UTF16 values and a data link sentinel
	                        break;
	                }
	            }

	            if (IWS && (type & white_space_new_line$3)) {
	                if (off < l) {
	                    char += length;
	                    type = symbol$3;
	                    continue;
	                } else {
	                    //Trim white space from end of string
	                    base = l - length;
	                    marker.sl -= length;
	                    length = 0;
	                    char -= base - off;
	                }
	            }

	            break;
	        }

	        marker.type = type;
	        marker.off = base;
	        marker.tl = (this.masked_values & CHARACTERS_ONLY_MASK$3) ? Math.min(1, length) : length;
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
	    aC(char) { return this.assertCharacter(char) }
	    /**
	     * Compares the character value of the current token to the value passed in. Advances to next token if the two are equal.
	     * @public
	     * @throws {Error} - `Expecting "${text}" got "${this.text}"`
	     * @param {String} text - The string to compare.
	     */
	    assertCharacter(char) {

	        if (this.off < 0) this.throw(`Expecting ${char[0]} got null`);

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
	                this.p = new Lexer$3(this.str, false, true);
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
	    s(start) { return this.slice(start) }

	    /**
	     * Returns a slice of the parsed string beginning at `start` and ending at the current token.
	     * @param {Number | LexerBeta} start - The offset in this.str to begin the slice. If this value is a LexerBeta, sets the start point to the value of start.off.
	     * @return {String} A substring of the parsed string.
	     * @public
	     */
	    slice(start = this.off) {

	        if (start instanceof Lexer$3) start = start.off;

	        return this.str.slice(start, (this.off <= start) ? this.sl : this.off);
	    }

	    /**
	     * Skips to the end of a comment section.
	     * @param {boolean} ASSERT - If set to true, will through an error if there is not a comment line or block to skip.
	     * @param {Lexer} [marker=this] - If another Lexer is passed into this method, it will advance the token state of that Lexer.
	     */
	    comment(ASSERT = false, marker = this) {

	        if (!(marker instanceof Lexer$3)) return marker;

	        if (marker.ch == "/") {
	            if (marker.pk.ch == "*") {
	                marker.sync();
	                while (!marker.END && (marker.next().ch != "*" || marker.pk.ch != "/")) { /* NO OP */ }
	                marker.sync().assert("/");
	            } else if (marker.pk.ch == "/") {
	                const IWS = marker.IWS;
	                while (marker.next().ty != Types$3.new_line && !marker.END) { /* NO OP */ }
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

	    toString() {
	        return this.slice();
	    }

	    /**
	     * Returns new Whind Lexer that has leading and trailing whitespace characters removed from input. 
	     */
	    trim() {
	        const lex = this.copy();

	        for (; lex.off < lex.sl; lex.off++) {
	            const c = jump_table$3[lex.string.charCodeAt(lex.off)];

	            if (c > 2 && c < 7)
	                continue;

	            break;
	        }

	        for (; lex.sl > lex.off; lex.sl--) {
	            const c = jump_table$3[lex.string.charCodeAt(lex.sl - 1)];

	            if (c > 2 && c < 7)
	                continue;

	            break;
	        }

	        lex.token_length = 0;
	        lex.next();

	        return lex;
	    }

	    /*** Getters and Setters ***/
	    get string() {
	        return this.str;
	    }

	    get string_length() {
	        return this.sl - this.off;
	    }

	    set string_length(s) {}

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
	    get tx() { return this.text }

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
	    get ty() { return this.type }

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
	    get pk() { return this.peek() }

	    /**
	     * Proxy for Lexer.prototype.next
	     * @public
	     */
	    get n() { return this.next() }

	    get END() { return this.off >= this.sl }
	    set END(v) {}

	    get type() {
	        return 1 << (this.masked_values & TYPE_MASK$3);
	    }

	    set type(value) {
	        //assuming power of 2 value.

	        this.masked_values = (this.masked_values & ~TYPE_MASK$3) | ((getNumbrOfTrailingZeroBitsFromPowerOf2$3(value)) & TYPE_MASK$3);
	    }

	    get tl() {
	        return this.token_length;
	    }

	    set tl(value) {
	        this.token_length = value;
	    }

	    get token_length() {
	        return ((this.masked_values & TOKEN_LENGTH_MASK$3) >> 7);
	    }

	    set token_length(value) {
	        this.masked_values = (this.masked_values & ~TOKEN_LENGTH_MASK$3) | (((value << 7) | 0) & TOKEN_LENGTH_MASK$3);
	    }

	    get IGNORE_WHITE_SPACE() {
	        return this.IWS;
	    }

	    set IGNORE_WHITE_SPACE(bool) {
	        this.iws = !!bool;
	    }

	    get CHARACTERS_ONLY() {
	        return !!(this.masked_values & CHARACTERS_ONLY_MASK$3);
	    }

	    set CHARACTERS_ONLY(boolean) {
	        this.masked_values = (this.masked_values & ~CHARACTERS_ONLY_MASK$3) | ((boolean | 0) << 6);
	    }

	    get IWS() {
	        return !!(this.masked_values & IGNORE_WHITESPACE_MASK$3);
	    }

	    set IWS(boolean) {
	        this.masked_values = (this.masked_values & ~IGNORE_WHITESPACE_MASK$3) | ((boolean | 0) << 5);
	    }

	    get PARSE_STRING() {
	        return !!(this.masked_values & PARSE_STRING_MASK$3);
	    }

	    set PARSE_STRING(boolean) {
	        this.masked_values = (this.masked_values & ~PARSE_STRING_MASK$3) | ((boolean | 0) << 4);
	    }

	    /**
	     * Reference to token id types.
	     */
	    get types() {
	        return Types$3;
	    }
	}

	function whind$4(string, INCLUDE_WHITE_SPACE_TOKENS = false) { return new Lexer$3(string, INCLUDE_WHITE_SPACE_TOKENS) }

	whind$4.constructor = Lexer$3;

	Lexer$3.types = Types$3;
	whind$4.types = Types$3;

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

	class TEXT_LINE extends whind$4.constructor {

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

	let k$4 = 0;

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
	            let font_size = 25 + (k$4 -= 5);
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

	class CSSContainer extends stylesheet {

	    constructor() {
	        super({ addObserver: () => {} });

	        this.rule_sets = [];

	        this.element = document.createElement("div");
	        this.element.classList.add("cfw_css");
	        this.update_mod = 0;
	        this.rule_map = new Map();
	    }

	    /** Add selector to list, merge with any known selector or rule. Extracts CSS Sheet data **/
	    addSelector(selector) {
	        //No matching selector. Add to list. 

	        if (!this.selectors.has(selector))
	            this.selectors.add(selector);

	        //Add the CSS root to the list of roots.
	        const root_val = this.roots.get(selector.root);

	        if (root_val)
	            this.roots.set(selector.root, root_val + 1);
	        else {
	            selector.root.par.addObserver(this);
	            this.roots.set(selector.root.par, 1);
	        }

	        //Add the selector's rule to the list of rules
	        let rule = this.rules.get(selector.r);

	        if (!rule) {
	            rule = new UIRuleSet(selector.r, this);
	            this.rules.set(selector.r, rule);
	        }

	        rule.addSelector(selector);
	    }

	    /** Remove selector from list. Unlink any css file that is associated with the selector **/
	    removeSelector(selector) {
	        //Make sure the selector is a member of this rule set.
	        if (this.selectors.has(selector)) {

	            let rule = this.rules.get(select.r);

	            rule.removeSelector(selector);

	            let root_val = this.roots.get(selector.root);

	            if (root_val > 1)
	                this.roots.set(selector.root, root_val - 1);
	            else {
	                selector.roots.removeObserver(this);
	                this.roots.remove(selector.root);
	            }
	        }
	    }


	    // Builds out the UI elements from collection of rule bodies and associated selector groups. 
	    // css - A CandleFW_CSS object. 
	    // meta - internal 
	    build() {
	        this.rules.forEach((e, b, v) => e.rebuild(b));
	    }

	    updatedCSS(rule) {
	        if (this.UPDATE_MATCHED) return void(this.UPDATE_MATCHED = false);
	        //this.element.innerHTML = "";
	        this.build();
	        //this.render();
	    }

	    render() {
	        for (let i = 0; i < this.rule_sets.length; i++)
	            this.rule_sets.render(this.element);
	    }

	    mount(element) {
	        if (element instanceof HTMLElement)
	            element.appendChild(this.element);
	    }

	    unmount() {
	        if (this.element.parentElement)
	            this.element.parentElement.removeChild(this.element);
	    }

	    update(rule) {
	        this.UPDATE_MATCHED = true;
	        rule.rule_body.root.par.updated();
	        //this.css.updated();
	    }
	}

	class CSSComponent extends Component{
		constructor(system){
			
			super(system);
			this.container = new CSSContainer();
			this.element.appendChild(this.container.element);
			
			
			/*
			this.fw = new TextFramework();
			this.io = new TextIO(this.element);
			this.io.fw = this.fw;
			this.element.addEventListener("pointerdown", e => {
				if(e.button !== 1){	
					e.preventDefault();
					e.stopPropagation();
				}
			});
			*/
			
			//this.element.addEventListener("pointerup", e => {this.element.focus(); this.io.onMouseUp(e)});
	        //this.element.addEventListener("keypress", e => {debugger;this.io.onKeyPress(e)});
	        //this.element.addEventListener("keydown", e => {this.io.onKeyDown(e)});
	        //this.element.addEventListener("wheel", e => {this.io.onMouseWheel(e)});
		}

		destroy(){

			//if(this.tree)
			//	this.tree.removeObserver(this);

			this.tree = null;

			this.fw.destroy();
			this.fw = null;

			this.io.destroy();
			this.io = null;

			super.destroy();
		}

		load(document) {
	        this.name.innerHTML = document.name;
	        this.doc_name = document.name;
	        this.doc_path = document.path;
	        this.doc = document;
	        document.bind(this);
	    }

		documentReady(data){
			//this.tree = this.doc.tree;
			//this.tree.addObserver(this);
			//this.tree.parse(whind(data, true));
			//this.manager.updateStyle("zzz", data);
			//this.fw.insertText(this.tree +"");
			//this.fw.updateText(this.io);
			//this.io.render();
		}

		updatedCSS(){
			//this.fw.clearContents();
			//this.fw.insertText(this.tree +"");
			//this.fw.updateText(this.io);
			//this.io.render();
			// /this.element.innerHTML = this.tree + "";
			//this.element.innerHTML = this.tree + "";
			//this.manager.updateStyle("zzz", this.tree + "");
		}

		get type(){
			return "css";
		}
	}

	//const fr = new FileReader();
	/**
	    Represents actions to save a file to disk. 
	**/
	class $FileReader {

	    constructor(file_path) {
	        this.handle = -1;
	        this.stream = -1;
	        this.offset = 0;
	        this.file_path = file_path;
	        this.url = new URL(file_path);

	        try {
	            //read data from the file server


	        } catch (e) {
	            console.error(e);
	        }
	    }

	    async string(encoding = "utf8") {
	        if (this.ready) {
	            return new Promise((res, rej) => {
	                /*
	                fs.readFile(this.handle, encoding, (err, string) => {
	                    if (err)
	                        return rej(err);
	                    res(string);
	                });
	                */
	            });
	        } else
	            throw new Error(`Invalid file handle to resource ${this.file_path}; FileReader is not ready to be used`);

	    }

	    async readB(array_constructor = ArrayBuffer, byte_length = 0, off = this.offset, MOVE_OFFSET = true) {
	        if (this.ready && byte_length > 0) {

	            let data = await this.url.fetchText();
	            debugger


	            return new Promise((res, rej) => {
	                let buffer = new Uint8Array(byte_length);

	                /*
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
	                */
	            })
	        } else
	            throw new Error(`Invalid file handle to resource ${this.file_path}; FileReader is not ready to be used`);
	    }

	    async readS(byte_length = 0, off = this.offset, encoding = "utf8", MOVE_OFFSET = true) {
	        if (this.ready && byte_length > 0) {
	            let data = "";
	            try{
	                data = await this.url.fetchText();
	            }catch(e){
	                console.error(e);
	            }
	            debugger
	            return data;
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
	                debugger
	                //fs.closeSync(this.handle);
	            } catch (e) {
	                console.error(e);
	            }
	        }
	    }

	    get ready() { return this.handle !== -1; }
	}

	const fs = {};

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

	                if (!this.nxt && !this.prv) {
	                    this.nxt = this;
	                    this.prv = this;
	                }

	                if(node){
	                    if (node.prv)
	                       node.prv.nxt = node.nxt;
	                    
	                    if(node.nxt) 
	                        node.nxt.prv = node.prv;
	                
	                    node.prv = this.prv;
	                    node.nxt = this;
	                    this.prv.nxt = node;
	                    this.prv = node;
	                }else{
	                    if (this.prv)
	                        this.prv.nxt = node;
	                    this.prv = node;
	                } 
	            },

	            insertAfter: function(node) {

	                if (!this.nxt && !this.prv) {
	                    this.nxt = this;
	                    this.prv = this;
	                }

	                if(node){
	                    if (node.prv)
	                       node.prv.nxt = node.nxt;
	                    
	                    if(node.nxt) 
	                        node.nxt.prv = node.prv;
	                
	                    node.nxt = this.nxt;
	                    node.prv = this;
	                    this.nxt.prv = node;
	                    this.nxt = node;
	                }else{
	                    if (this.nxt)
	                        this.nxt.prv = node;
	                    this.nxt = node;
	                } 
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

	class Document {

	    constructor(file_name, path, env, IS_NEW_FILE, manager) {
	        this.path = path;
	        this.name = file_name;
	        this.data = null;
	        this.old_data = "";
	        this.LOADED = (IS_NEW_FILE) ? true : false;
	        this.UPDATED = true;
	        this.SAVING = false;
	        this.INITIAL_HISTORY = false;
	        this.observers = [];
	        this.env = env;
	        this.manager = manager;
	        this.ps = false;
	        this.url = new URL(`${path}/${file_name}`);
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
	            if (this.path[0] == "~") {
	                // This is a generated document
	                this.LOADED = true;
	            } else {
	                if (this.url.path[1] == "@") {
	                    const file = this.url.filename;
	                    const dir = this.path.split("/").pop().slice(1);

	                    const data = this.manager.data[dir][file];
	                    
	                    this.fromString(data, this.manager.env, false);

	                } else {

	                    try {
	                        let data = await this.url.fetchText();
	                        this.LOADED = true;
	                        this.fromString(data, this.manager.env);
	                    } catch (e) {
	                        console.error(e);
	                    }
	                }
	            }

	            return this.data;
	        }
	    }

	    async save(file_builder) {
	        return;
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

	    async alert() {
	        return new Promise(res => {
	            this.bind({ documentReady: () => res() });
	        })
	    }

	    alertObservers() {
	        if (this.observers) {
	            for (let i = 0; i < this.observers.length; i++) {
	                if (this.observers[i].documentReady(this.data) === false) {
	                    this.observers.splice(i--, 1);
	                }
	            }
	        }
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

	function TRANSFER_ELEMENT(env, target_component, target_element, child_element, px, py, COPY = false, LINKED = false) {
	    let new_element = null,
	        node_c = child_element.wick_node;

	    const node_p = target_element.wick_node;

	    if (COPY) {
	        node_c = node_c.clone();
	    } else {
	        const par = node_c.par;

	        node_c.extract();

	        par.prepRebuild();
	        par.rebuild();
	    }
	    node_p.addChild(node_c);

	    node_c.prepRebuild(false, false, true);
	    node_c.rebuild();

	    new_element = target_element.lastChild;

	    SETLEFT(env, target_component, new_element, px, true);
	    SETTOP(env, target_component, new_element, py, true);

	    prepRebuild(new_element, LINKED);

	    return new_element;
	}

	function CREATE_ELEMENT(env, component, parent_element, tag_name = "div", px = 0, py = 0, w = 50, h = 50) {
	    if (typeof(tag_name) !== "string" || tag_name == "")
	        throw new Error(`Invalid argument for \`tag_name\`:${tag_name} in call to CREATE_ELEMENT.`);
	    return null;
	    let node = env.wick("");
	    node.tag = tag_name;

	    parent_element.wick_node.addChild(node);
	    //rebuild to create the new element. 
	    node.prepRebuild(false, false, true);
	    node.rebuild();
	    //grab the element from the parent
	    const element = parent_element.lastChild;
	    TOPOSITIONABSOLUTE(env, component, element);
	    SETLEFT(env, component, element, px, true);
	    SETTOP(env, component, element, py, true);
	    SETWIDTH(env, component, element, w, true);
	    SETHEIGHT(env, component, element, h, true);

	    prepRebuild(element);

	    return { element, node };
	}

	function CREATE_VIEW_COMPONENT(env, doc, px, py) {
	    //Create an iFrame page_view component
	    const comp = new Component(env);

	    comp.x = px;
	    comp.y = py;

	    document.querySelector("#main_view").appendChild(comp.element);

	    comp.load(doc);

	    return comp;
	}

	function CREATE_COMPONENT(env, doc, px, py, pw, ph) {
	    
	    let comp = null;

	    if (doc instanceof Document) {
	        switch (doc.type) {
	            case "css":
	                comp = env.css.createComponent(doc);
	                break;
	            case "js":
	                comp = new Component(env);
	                comp.load(doc);
	                break;
	            case "html":
	                comp = new Component(env);
	                comp.load(doc);
	        }
	    } else {
	        comp = new CSSComponent(env);
	        comp.container.addSelector(doc.selector);
	    }
	    
	    env.ui.setState(undefined, env.ui.comp.addComponent(comp));
	    //comp.mount(env.ui.wys_view);
	    //env.ui.wys_view.appendChild(comp.element);

	    comp.x = px;
	    comp.y = py;
	    comp.width = pw;
	    comp.height = ph;

	    return comp;
	}

	function REMOVE_COMPONENT(env, component) {

	    if (!(component instanceof Component))
	        throw new Error("Action REMOVE_COMPONENT cannot continue: component is not an instance of Component.");

	    if (component.target.parentElement)
	        component.target.parentElement.removeChild(component.target);

	    env.ui.manager.removeComponent(component);
	}

	function CREATE_CSS_DOC(env, doc, event) {

	    let comp = env.css.createComponent(doc);

	    let element = comp.element;

	    comp.x = -event.x;
	    comp.y = -event.y;
	}

	//Used to track components. Serve's as the local components filename;
	var component_id = 0;

	function load_component_from_user_space_scope (scope, env, x = 100, y = 100, w = 0, h = 0){
		
		scope.ast.origin_url.path += component_id++;

	    const doc_id = env.data.docs.loadFile(scope.ast.origin_url.pathname + ".html", true);

		const doc = env.data.docs.get(doc_id);

	    doc.data = scope.ast;

	    CREATE_COMPONENT(env, doc, x, y, w, h);
	}

	//import create_group from "../component/create.userspace.group.mjs";

	/*
		Integrates Flame systems into Radiate
	*/
	async function radiate_integrate(env, router, presets) {
		const lp = router.loadPage.bind(router),
			existing_components = new Map();

		let current_view = null;

		//grap the current pages style sheets

		for(const ele of document.head.children){
			if(ele.tagName == "LINK" && ele.rel=="stylesheet" && ele.href){
				//Need create a css element that will collect all css information stored on the page. 
				//debugger
			}
		}

		router.loadPage = async function(...args) {
			
			await lp(...args);

			current_view = router.current_view;

			if (current_view && !existing_components.has(current_view)) {
				//create a flame compnent based on the app element. 

				//extract elements and build a page view based on the components present in the page. 

				//create a new scope called "app", this will mimic the radiate app element
				const app = await env.wick("<app></app>").pending;
				app.ast.SINGLE = false; // Remove the single flag, which was genereated by the signature <ele></ele>

				//create sc

				for (const ele of current_view.eles) {

					const ele_comp = await env.wick(`<element id="${ele.id}"></element>`).pending;
					ele_comp.ast.SINGLE = false; //Same as above.

					app.ast.children.push(ele_comp.ast);
					ele_comp.ast.parent = app.ast;

					for (const comp of ele.components) {
						ele_comp.ast.children.push(comp.scope.ast);
						comp.scope.ast.parent = ele_comp.ast;
					}
				}

				const w = 1024,
					h = 720;

				const comp = load_component_from_user_space_scope(app, env, window.innerWidth * 0.5 - w * 0.5, window.innerHeight * 0.5 - h * 0.5, w, h);
				
				existing_components.set(current_view, comp);
			}
		};
	}

	/***
	    This module is responsible for measuring an element and making that data available to other modules.
	***/

	function getOffsetPos(element) {
	    const a = { x: element.offsetLeft, y: element.offsetTop };
	    if (element.offsetParent) {
	        const b = getOffsetPos(element.offsetParent);
	        a.x += b.x;
	        a.y += b.y;
	    }
	    return a;
	}

	class ElementBox {

	    constructor(element, w = window) {
	        //Caching the global transform object for reuse.
	        this.element = element;
	        this.window = w;

	        this.margin_l = 0;
	        this.margin_r = 0;
	        this.margin_t = 0;
	        this.margin_b = 0;

	        this.padding_l = 0;
	        this.padding_r = 0;
	        this.padding_t = 0;
	        this.padding_b = 0;

	        this.border_l = 0;
	        this.border_r = 0;
	        this.border_t = 0;
	        this.border_b = 0;

	        this.x = 0;
	        this.y = 0;
	        this.w = 0;
	        this.h = 0;

	        this.real_pos_x = 0;
	        this.real_pos_y = 0;
	    }

	    update(element = this.element, window = this.window) {

	        this.element = element;

	        const par_prop = window.getComputedStyle(element);
	        const rect = element.getBoundingClientRect(element);
	        const localpos = getOffsetPos(this.element);

	        this.real_pos_x = rect.x-1;
	        this.real_pos_y = rect.y-1;
	        
	        this.x = localpos.x;
	        this.y = localpos.y;

	        this.w = parseFloat(par_prop.width);
	        this.h = parseFloat(par_prop.height);
	        //margin
	        this.margin_l = parseFloat(par_prop.marginLeft) || 0;
	        this.margin_r = parseFloat(par_prop.marginRight) || 0;
	        this.margin_t = parseFloat(par_prop.marginTop) || 0;
	        this.margin_b = parseFloat(par_prop.marginBottom) || 0;

	        //border
	        this.border_l = parseFloat(par_prop.borderLeftWidth) || 0;
	        this.border_r = parseFloat(par_prop.borderRightWidth) || 0;
	        this.border_t = parseFloat(par_prop.borderTopWidth) || 0;
	        this.border_b = parseFloat(par_prop.borderBottomWidth) || 0;

	        //padding
	        this.padding_l = parseFloat(par_prop.paddingLeft) || 0;
	        this.padding_r = parseFloat(par_prop.paddingRight) || 0;
	        this.padding_t = parseFloat(par_prop.paddingTop) || 0;
	        this.padding_b = parseFloat(par_prop.paddingBottom) || 0;

	        this.posl = parseFloat(par_prop.left) || 0;
	        this.posr = parseFloat(par_prop.right) || 0;
	        this.post = parseFloat(par_prop.top) || 0;
	        this.posb = parseFloat(par_prop.bottom) || 0;
	    }


	    get width() {
	        return this.w;
	    }

	    get Height() {
	        return this.h;
	    }

	    get MarginX() {
	        return this.x;
	    }

	    get MarginY() {
	        return this.y;
	    }

	    get BorderX() {
	        return (this.x + this.margin_l);
	    }

	    get BorderY() {
	        return (this.y + this.margin_t);
	    }

	    get PaddingX() {
	        return (this.x + this.margin_l + this.border_l);
	    }

	    get PaddingY() {
	        return (this.y + this.margin_t + this.border_t);
	    }

	    get ContentX() {
	        return (this.x + this.margin_l + this.border_l + this.padding_l);
	    }

	    get ContentY() {
	        return (this.y + this.margin_t + this.border_t + this.padding_t);
	    }

	    get MarginWidth() {
	        return (this.margin_l + this.border_l + this.padding_l + this.w + this.padding_r + this.border_r + this.margin_r);
	    }

	    get MarginHeight() {
	        return (this.margin_t + this.border_t + this.padding_t + this.h + this.padding_b + this.border_b + this.margin_b);
	    }

	    get BorderWidth() {
	        return (this.border_l + this.padding_l + this.w + this.padding_r + this.border_r);
	    }

	    get BorderHeight() {
	        return (this.border_t + this.padding_t + this.h + this.padding_b + this.border_b);
	    }

	    get PaddingWidth() {
	        return (this.padding_l + this.w + this.padding_r);
	    }

	    get PaddingHeight() {
	        return (this.padding_t + this.h + this.padding_b);
	    }

	    get ContentWidth() {
	        return (this.w);
	    }

	    get ContentHeight() {
	        return (this.height);
	    }

	    get Margin_H() {
	        return {
	            l: this.MarginX,
	            r: this.MarginX + this.MarginWidth
	        };
	    }

	    get Margin_V() {
	        return {
	            t: this.MarginY,
	            b: this.MarginY + this.MarginHeight
	        };
	    }

	    get MarginBox() {
	        const v = this.Margin_V;
	        const h = this.Margin_H;
	        return {
	            l: h.l,
	            r: h.r,
	            t: v.t,
	            b: v.b
	        };
	    }

	    get Padding_H() {
	        return {
	            l: this.PaddingX,
	            r: this.PaddingX + this.PaddingWidth
	        };
	    }

	    get Padding_V() {
	        return {
	            t: this.PaddingY,
	            b: this.PaddingY + this.PaddingHeight
	        };
	    }

	    get PaddingBox() {
	        const v = this.Padding_V;
	        const h = this.Padding_H;
	        return {
	            l: h.l,
	            r: h.r,
	            t: v.t,
	            b: v.b
	        };
	    }

	    get Border_H() {
	        return {
	            l: this.BorderX,
	            r: this.BorderX + this.BorderWidth
	        };
	    }

	    get Border_V() {
	        return {
	            t: this.BorderY,
	            b: this.BorderY + this.BorderHeight
	        };
	    }

	    get BorderBox() {
	        const v = this.Border_V;
	        const h = this.Border_H;
	        return {
	            l: h.l,
	            r: h.r,
	            t: v.t,
	            b: v.b
	        };
	    }

	    get Content_H() {
	        return {
	            l: this.ContentX,
	            r: this.ContentX + this.ContentWidth
	        };
	    }

	    get Content_V() {
	        return {
	            t: this.ContentY,
	            b: this.ContentY + this.ContentHeight
	        };
	    }

	    get ContentBox() {
	        const v = this.Content_V;
	        const h = this.Content_H;
	        return {
	            l: h.l,
	            r: h.r,
	            t: v.t,
	            b: v.b
	        };
	    }

	    getBox(box_type = ElementBox.types.margin, edge_type = ElementBox.types.edge.all, transform = null) {
	        let box = null;

	        switch (box_type) {
	            case 0: //ElementBox.types.margin:
	                box = this.MarginBox;
	                break;
	            case 1: //ElementBox.types.border:
	                box = this.BorderBox;
	                break;
	            case 2: //ElementBox.types.padding:
	                box = this.PaddingBox;
	                break;
	            case 3: //ElementBox.types.content:
	                box = this.ContentBox;
	                break;
	        }

	        if ((edge_type & 15)) {

	            if ((edge_type & 1) /*ElementBox.types.edge.left*/ )
	                box.r = box.l;
	            else if ((edge_type & 2) /*ElementBox.types.edge.right*/ )
	                box.l = box.r;

	            if ((edge_type & 4) /*ElementBox.types.edge.top*/ )
	                box.b = box.t;
	            else if ((edge_type & 8) /*ElementBox.types.edge.bottom*/ )
	                box.t = box.b;
	        }

	        if (transform) {
	            const 
	                px = transform.px,
	                py = transform.py,
	                s = transform.scale;

	            box.l = transform.px + box.l * s;
	            box.t = transform.py + box.t * s;
	            box.r = transform.px + box.r * s;
	            box.b = transform.py + box.b * s;
	        }

	        return box;
	    }

	    get types() {
	        return ElementBox.types;
	    }
	}


	ElementBox.types = Object.freeze({
	    margin: 0,
	    border: 1,
	    padding: 2,
	    content: 3,
	    edge: Object.freeze({
	        all: 0,
	        left: 1,
	        right: 2,
	        top: 4,
	        bottom: 8,
	    })
	});

	function TEXTEDITOR(system, component, element, x, y){}

	function TEXT(system, component, element, dx, dy) {
	    let pos = event.cursor;
	    let data = event.text_data;
	    let text = system.html.aquireTextData(element);
	    text.update(pos, data);
	}

	function COMPLETE(system, element) {
		
		//Diff changed documents, clear caches, close opened dialogs if necessary
		if(element)
			CacheFactory.clear(element);

		system.data.docs.seal();
		//system.history.seal();
	}

	let types$5 = types;

	//set background color
	function SETBACKGROUNDCOLOR(system, component, element, r, g, b, a = 1){
		let color = new types$5.color(r,g,b,a);
		setValue(system, component, element, "background_color", color);
		element.wick_node.prepRebuild();
	}
	//set background image
	//set font color
	function SETCOLOR(system, component, element, r, g, b, a = 1){
		let color = new types$5.color(r,g,b,a);
		setValue(system, component, element, "color", color);
		element.wick_node.prepRebuild();
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

	function resetPadding(system, component, element) {
	    let cache = CacheFactory(system, component, element);
	    let css = cache.rules;
	    if (css.props.padding) {
	        let val = css.props.padding;

	        if (!Array.isArray(val)) {
	            cache.setCSSProp(`
                padding-top:${val};
                padding-right:${val};
                padding-bottom:${val};
                padding-left:${val};
            `);
	        } else {
	            switch (val.length) {
	                case 2:
	                    cache.setCSSProp(`
                        padding-top:${val[0]};
                        padding-right:${val[1]};
                        padding-bottom:${val[0]};
                        padding-left:${val[1]};
                    `);
	                    break;
	                case 3:
	                    cache.setCSSProp(`
                        padding-top:${val[0]};
                        padding-right:${val[2]};
                        padding-bottom:${val[1]};
                        padding-left:${val[2]};
                    `);
	                    break;
	                case 4:
	                    cache.setCSSProp(`
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

	function SETPADDINGLEFT(system, component, element, x, LINKED = false) {
	    resetPadding(system, component, element);
	    ensureBlocklike(system, component, element);
	    setNumericValue("padding_left", system, component, element, x, setNumericValue.parent_width);
	    prepRebuild(element, LINKED);
	}

	function SETDELTAPADDINGLEFT(system, component, element, dx, ratio = 0, LINKED = false) {
	    let cache = CacheFactory(system, component, element);
	    let start_x = parseFloat(cache.computed.get("padding-left")) || 0;
	    let width = (parseFloat(cache.computed.width) || 0) + start_x;

	    if (dx > 0 && start_x + dx > width - 20) return ratio;

	    if (start_x + dx > 0) {

	        if (ratio > 0)
	            SETPADDINGLEFT(system, component, element, start_x + dx / ratio, true);
	        else {
	            ensureBlocklike(system, component, element);
	            ratio = getRatio(system, component, element, SETPADDINGLEFT, start_x, dx, "padding-left");
	        }

	        SETDELTAWIDTH(system, component, element, -dx, true);

	        prepRebuild(element, LINKED);
	    }

	    return ratio;
	}

	function SETPADDINGTOP(system, component, element, x, LINKED = false) {
	    resetPadding(system, component, element);
	    ensureBlocklike(system, component, element);
	    setNumericValue("padding_top", system, component, element, x, setNumericValue.parent_height);
	    prepRebuild(element, LINKED);
	}

	function SETDELTAPADDINGTOP(system, component, element, dy, ratio = 0, LINKED = false) {
	    let style = component.window.getComputedStyle(element);
	    let start_y = parseFloat(style.paddingTop) || 0;
	    let height = (parseFloat(style.height) || 0) + start_y;

	    if (dy > 0 && start_y + dy > height - 20) return ratio;

	    if (start_y + dy > 0) {
	        if (ratio > 0)
	            SETPADDINGTOP(system, component, element, start_y + dy / ratio, true);
	        else {
	            ensureBlocklike(system, component, element);
	            ratio = getRatio(system, component, element, SETPADDINGTOP, start_y, dy, "padding-top");
	        }

	        SETDELTAHEIGHT(system, component, element, -dy, true);

	        prepRebuild(element, LINKED);
	    }

	    return ratio;
	}

	function SETPADDINGRIGHT(system, component, element, x, LINKED = false) {
	    resetPadding(system, component, element);
	    ensureBlocklike(system, component, element);
	    setNumericValue("padding_right", system, component, element, x, setNumericValue.parent_height);
	    prepRebuild(element, LINKED);
	}


	function SETDELTAPADDINGRIGHT(system, component, element, dx, ratio = 0, LINKED = false) {
	    let style = component.window.getComputedStyle(element);
	    let start_x = parseFloat(style.paddingRight) || 0;
	    let width = (parseFloat(style.width) || 0) + start_x;

	    if (dx > 0 && start_x + dx > width - 20) return ratio;

	    if (start_x + dx > 0) {

	        if (ratio > 0)
	            SETPADDINGRIGHT(system, component, element, start_x + dx / ratio, true);
	        else {
	            ensureBlocklike(system, component, element);
	            ratio = getRatio(system, component, element, SETPADDINGRIGHT, start_x, dx, "padding-right");
	        }

	        SETDELTAWIDTH(system, component, element, -dx, true);
	prepRebuild(element,LINKED);
	    }
	    return ratio;
	}

	function SETPADDINGBOTTOM(system, component, element, x, LINKED = false) {
	    resetPadding(system, component, element);
	    ensureBlocklike(system, component, element);
	    setNumericValue("padding_bottom", system, component, element, x, setNumericValue.parent_height);
	    prepRebuild(element, LINKED);
	}


	function SETDELTAPADDINGBOTTOM(system, component, element, dy, ratio = 0, LINKED = false) {
	    let style = component.window.getComputedStyle(element);
	    let start_y = parseFloat(style.paddingBottom) || 0;
	    let height = (parseFloat(style.height) || 0) + start_y;

	    if (dy > 0 && dy + start_y > height - 20) return ratio;

	    if (start_y + dy >= 0) {
	        if (ratio > 0)
	            SETPADDINGBOTTOM(system, component, element, start_y + dy / ratio, true);
	        else {
	            ensureBlocklike(system, component, element);
	            ratio = getRatio(system, component, element, SETPADDINGBOTTOM, start_y, dy, "padding-bottom");
	        }

	        SETDELTAHEIGHT(system, component, element, -dy, true);

	    prepRebuild(element,LINKED);}

	    return ratio;
	}

	function RESIZEPADDINGT(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
	    if (IS_COMPONENT) return;
	    SETDELTAPADDINGTOP(system, component, element, dy, 0, true);
	    prepRebuild(element, LINKED);
	}

	function RESIZEPADDINGR(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
	    if (IS_COMPONENT) return;
	    SETDELTAPADDINGRIGHT(system, component, element, -dx, 0, true);
	    prepRebuild(element, LINKED);
	}

	function RESIZEPADDINGL(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
	    if (IS_COMPONENT) return;
	    SETDELTAPADDINGLEFT(system, component, element, dx, 0, true);
	    prepRebuild(element, LINKED);
	}

	function RESIZEPADDINGB(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
	    if (IS_COMPONENT) return;
	    SETDELTAPADDINGBOTTOM(system, component, element, -dy, 0, true);
	    prepRebuild(element, LINKED);
	}

	function RESIZEPADDINGTL(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
	    if (IS_COMPONENT) return;
	    SETDELTAPADDINGLEFT(system, component, element, dx, 0, true);
	    SETDELTAPADDINGTOP(system, component, element, dy, 0, true);
	    prepRebuild(element, LINKED);
	}

	function RESIZEPADDINGTR(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
	    if (IS_COMPONENT) return;
	    SETDELTAPADDINGRIGHT(system, component, element, -dx, 0, true);
	    SETDELTAPADDINGTOP(system, component, element, dy, 0, true);
	    prepRebuild(element, LINKED);
	}

	function RESIZEPADDINGBL(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
	    if (IS_COMPONENT) return;
	    SETDELTAPADDINGLEFT(system, component, element, dx, 0, true);
	    SETDELTAPADDINGBOTTOM(system, component, element, -dy, 0, true);
	    prepRebuild(element, LINKED);
	}

	function RESIZEPADDINGBR(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {
	    if (IS_COMPONENT) return;
	    SETDELTAPADDINGRIGHT(system, component, element, -dx, 0, true);
	    SETDELTAPADDINGBOTTOM(system, component, element, -dy, 0, true);
	    prepRebuild(element, LINKED);
	}

	function resetBorder(system, component, element) {
	    return
	    let cache = CacheFactory(system, component, element);
	    let css = cache.rules;
	    if (css.props.border) {
	        //Convert border value into 
	        css.props.border = null;
	    }
	}

	function SETBORDERLEFT(system, component, element, x, LINKED = false) {
	    resetBorder(system, component, element);
	    let excess_x = setNumericValue("border_left_width", system, component, element, x, setNumericValue.parent_width);
	    prepRebuild(element, LINKED);
	    return { ratio: 0, excess_x }
	}

	function SETBORDERRIGHT(system, component, element, x, LINKED = false) {
	    resetBorder(system, component, element);
	    let excess_y = setNumericValue("border_right_width", system, component, element, x, setNumericValue.parent_height);
	    prepRebuild(element, LINKED);
	    return { ratio: 0, excess_y }
	}

	function SETBORDERTOP(system, component, element, x, LINKED = false) {    
	    resetBorder(system, component, element);
	    let excess_y = setNumericValue("border_top_width", system, component, element, x, setNumericValue.parent_height);
	    prepRebuild(element, LINKED);
	    return { ratio: 0, excess_y }
	}

	function SETBORDERBOTTOM(system, component, element, x, LINKED = false) {
	    resetBorder(system, component, element);
	    let excess_y =  setNumericValue("border_bottom_width", system, component, element, x, setNumericValue.parent_height);
	    prepRebuild(element, LINKED);
	    return { ratio: 0, excess_y }
	}

	function SETDELTABORDERLEFT(system, component, element, dx, ratio = 0, LINKED = false) {

	    let start_x = parseFloat(component.window.getComputedStyle(element)["border-left-width"]),
	        width = parseFloat(component.window.getComputedStyle(element)["width"]),
	        excess_x = 0,
	        excess_x_extra = 0;

	    if (dx > 0 && width - dx < 0) {
	        excess_x_extra = (width - dx);
	        dx = width;
	    }

	    if (ratio > 0)
	        excess_x = -SETBORDERLEFT(system, component, element, start_x + dx / ratio, true).excess_x;
	    else
	        excess_x = -getRatio(system, component, element, SETBORDERLEFT, start_x, dx, "border-left-width").excess;

	    prepRebuild(element, LINKED);

	    SETDELTAWIDTH(system, component, element, -dx - excess_x, 0, true);

	    excess_x += excess_x_extra;

	    return { excess_x };
	}


	function SETDELTABORDERRIGHT(system, component, element, dx, ratio = 0, LINKED = false) {

	    let start_x = parseFloat(component.window.getComputedStyle(element)["border-right-width"]),
	        width = parseFloat(component.window.getComputedStyle(element)["width"]),
	        excess_x = 0,
	        excess_x_extra = 0;

	    if (dx > 0 && width - dx < 0) {
	        excess_x_extra = -(width - dx);
	        dx = width;
	    }

	    if (ratio > 0)
	        excess_x = SETBORDERRIGHT(system, component, element, start_x + dx / ratio, true).excess_x;
	    else
	        excess_x = getRatio(system, component, element, SETBORDERRIGHT, start_x, dx, "border-right-width").excess;

	    prepRebuild(element, LINKED);

	    SETDELTAWIDTH(system, component, element, -dx + excess_x, 0, true);

	    excess_x += excess_x_extra;

	    return { excess_x };
	}




	function SETDELTABORDERTOP(system, component, element, dy, ratio = 0, LINKED = false) {
	    let start_x = parseFloat(component.window.getComputedStyle(element)["border-top-width"]),
	        height = parseFloat(component.window.getComputedStyle(element)["height"]),
	        excess_y = 0,
	        excess_y_extra = 0;

	    if (dy > 0 && height - dy < 0) {
	        excess_y_extra = (height - dy);
	        dy = height;
	    }

	    if (ratio > 0)
	        excess_y = -SETBORDERTOP(system, component, element, start_x + dy / ratio, true).excess_y;
	    else
	        excess_y = -getRatio(system, component, element, SETBORDERTOP, start_x, dy, "border-top-width").excess;

	    prepRebuild(element, LINKED);

	    SETDELTAHEIGHT(system, component, element, -dy - excess_y, 0, true);

	    excess_y += excess_y_extra;

	    return { excess_y };
	}


	function SETDELTABORDERBOTTOM(system, component, element, dy, ratio = 0, LINKED = false) {
	    let start_x = parseFloat(component.window.getComputedStyle(element)["border-bottom-width"]),
	        height = parseFloat(component.window.getComputedStyle(element)["height"]),
	        excess_y = 0,
	        excess_y_extra = 0;

	    if (dy > 0 && height - dy < 0) {
	        excess_y_extra = -(height - dy);
	        dy = height;
	    }

	    if (ratio > 0)
	        excess_y = SETBORDERBOTTOM(system, component, element, start_x + dy / ratio, true).excess_y;
	    else
	        excess_y = getRatio(system, component, element, SETBORDERBOTTOM, start_x, dy, "border-bottom-width").excess;

	    prepRebuild(element, LINKED);

	    SETDELTAHEIGHT(system, component, element, -dy + excess_y, 0, true);

	    excess_y += excess_y_extra;

	    return { excess_y };
	}

	function RESIZEBORDERT(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return;
	    SETDELTABORDERTOP(system, component, element, dy, 0, true);
	    prepRebuild(element);
	}

	function RESIZEBORDERR(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return;
	    SETDELTABORDERRIGHT(system, component, element, -dx, 0, true);
	    prepRebuild(element);
	}

	function RESIZEBORDERL(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return;
	    SETDELTABORDERLEFT(system, component, element, dx, 0, true);
	    prepRebuild(element);
	}

	function RESIZEBORDERB(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return;
	    SETDELTABORDERBOTTOM(system, component, element, -dy, 0, true);
	    prepRebuild(element);
	}

	function RESIZEBORDERTL(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return;
	    let { excess_x } = SETDELTABORDERLEFT(system, component, element, dx, 0, true);
	    let { excess_y } = SETDELTABORDERTOP(system, component, element, dy, 0, true);

	    prepRebuild(element);

	    return { excess_x, excess_y };
	}

	function RESIZEBORDERTR(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return;
	    let { excess_x } = SETDELTABORDERRIGHT(system, component, element, -dx, 0, true);
	    let { excess_y } = SETDELTABORDERTOP(system, component, element, dy, 0, true);

	    prepRebuild(element);

	    return { excess_x, excess_y };
	}

	function RESIZEBORDERBL(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return;
	    let { excess_x } = SETDELTABORDERLEFT(system, component, element, dx, 0, true);
	    let { excess_y } = SETDELTABORDERBOTTOM(system, component, element, -dy, 0, true);

	    prepRebuild(element);

	    return { excess_x, excess_y };
	}

	function RESIZEBORDERBR(system, component, element, dx, dy, IS_COMPONENT) {
	    if (IS_COMPONENT) return;
	    let { excess_x } = SETDELTABORDERRIGHT(system, component, element, -dx, 0, true);
	    let { excess_y } = SETDELTABORDERBOTTOM(system, component, element, -dy, 0, true);

	    prepRebuild(element);

	    return { excess_x, excess_y };
	}

	function BORDERRADIUSTL(system, component, element, d) {
	    setValue(system, component, element, "border_top_left_radius", new types.length(d, "px"));
	    prepRebuild(element);
	}

	function BORDERRADIUSTR(system, component, element, d) {

	    setValue(system, component, element, "border_top_right_radius", new types.length(d, "px"));
	    prepRebuild(element);
	}

	function BORDERRADIUSBL(system, component, element, d) {
	    setValue(system, component, element, "border_bottom_left_radius", new types.length(d, "px"));
	    prepRebuild(element);
	}

	function BORDERRADIUSBR(system, component, element, d) {
	    setValue(system, component, element, "border_bottom_right_radius", new types.length(d, "px"));
	    prepRebuild(element);
	}

	async function UPDATE_ELEMENT_OUTERHTML (system, component, element, outer_html){
		//TODO - Collect old html data and store as history
		if(await element.wick_node.reparse(outer_html))
			system.ui.update();
	}

	function SETCSSPROP(system, component, element, value_string) {

	        // Get CSS information on element and update appropriate records
	        let cache = CacheFactory(system, component, element);

	        cache.setCSSProp(value_string);
	                
	        prepRebuild(element);    
	}



	var actions = /*#__PURE__*/Object.freeze({
		CacheFactory: CacheFactory,
		TEXTEDITOR: TEXTEDITOR,
		MOVE: MOVE,
		CENTER: CENTER,
		COMPLETE: COMPLETE,
		CREATE_ELEMENT: CREATE_ELEMENT,
		CREATE_VIEW_COMPONENT: CREATE_VIEW_COMPONENT,
		CREATE_COMPONENT: CREATE_COMPONENT,
		TRANSFER_ELEMENT: TRANSFER_ELEMENT,
		CREATE_CSS_DOC: CREATE_CSS_DOC,
		REMOVE_COMPONENT: REMOVE_COMPONENT,
		SETWIDTH: SETWIDTH,
		SETHEIGHT: SETHEIGHT,
		SETDELTAWIDTH: SETDELTAWIDTH,
		SETDELTAHEIGHT: SETDELTAHEIGHT,
		SETBACKGROUNDCOLOR: SETBACKGROUNDCOLOR,
		SETCOLOR: SETCOLOR,
		MOVE_PANEL: MOVE_PANEL,
		UNDO: UNDO,
		REDO: REDO,
		SETLEFT: SETLEFT,
		SETDELTALEFT: SETDELTALEFT,
		SETTOP: SETTOP,
		SETDELTATOP: SETDELTATOP,
		SETRIGHT: SETRIGHT,
		SETDELTARIGHT: SETDELTARIGHT,
		SETBOTTOM: SETBOTTOM,
		SETDELTABOTTOM: SETDELTABOTTOM,
		RESIZETL: RESIZETL,
		RESIZETR: RESIZETR,
		RESIZEBL: RESIZEBL,
		RESIZEBR: RESIZEBR,
		RESIZET: RESIZET,
		RESIZER: RESIZER,
		RESIZEL: RESIZEL,
		RESIZEB: RESIZEB,
		SETPADDINGLEFT: SETPADDINGLEFT,
		SETDELTAPADDINGLEFT: SETDELTAPADDINGLEFT,
		SETPADDINGTOP: SETPADDINGTOP,
		SETDELTAPADDINGTOP: SETDELTAPADDINGTOP,
		SETPADDINGRIGHT: SETPADDINGRIGHT,
		SETDELTAPADDINGRIGHT: SETDELTAPADDINGRIGHT,
		SETPADDINGBOTTOM: SETPADDINGBOTTOM,
		SETDELTAPADDINGBOTTOM: SETDELTAPADDINGBOTTOM,
		RESIZEPADDINGTL: RESIZEPADDINGTL,
		RESIZEPADDINGTR: RESIZEPADDINGTR,
		RESIZEPADDINGBL: RESIZEPADDINGBL,
		RESIZEPADDINGBR: RESIZEPADDINGBR,
		RESIZEPADDINGT: RESIZEPADDINGT,
		RESIZEPADDINGR: RESIZEPADDINGR,
		RESIZEPADDINGL: RESIZEPADDINGL,
		RESIZEPADDINGB: RESIZEPADDINGB,
		SETMARGINLEFT: SETMARGINLEFT,
		SETDELTAMARGINLEFT: SETDELTAMARGINLEFT,
		SETMARGINTOP: SETMARGINTOP,
		SETDELTAMARGINTOP: SETDELTAMARGINTOP,
		SETMARGINRIGHT: SETMARGINRIGHT,
		SETDELTAMARGINRIGHT: SETDELTAMARGINRIGHT,
		SETMARGINBOTTOM: SETMARGINBOTTOM,
		SETDELTAMARGINBOTTOM: SETDELTAMARGINBOTTOM,
		RESIZEMARGINTL: RESIZEMARGINTL,
		RESIZEMARGINTR: RESIZEMARGINTR,
		RESIZEMARGINBL: RESIZEMARGINBL,
		RESIZEMARGINBR: RESIZEMARGINBR,
		RESIZEMARGINT: RESIZEMARGINT,
		RESIZEMARGINR: RESIZEMARGINR,
		RESIZEMARGINL: RESIZEMARGINL,
		RESIZEMARGINB: RESIZEMARGINB,
		TOMARGINLEFT: TOMARGINLEFT,
		TOMARGINRIGHT: TOMARGINRIGHT,
		TOMARGINLEFTRIGHT: TOMARGINLEFTRIGHT,
		TOLEFT: TOLEFT,
		TORIGHT: TORIGHT,
		TOLEFTRIGHT: TOLEFTRIGHT,
		TOTOP: TOTOP,
		TOTOPBOTTOM: TOTOPBOTTOM,
		TOGGLE_UNIT: TOGGLE_UNIT,
		TOPOSITIONABSOLUTE: TOPOSITIONABSOLUTE,
		TOPOSITIONRELATIVE: TOPOSITIONRELATIVE,
		TOPOSITIONFIXED: TOPOSITIONFIXED,
		TOPOSITIONSTICKY: TOPOSITIONSTICKY,
		CONVERT_LEFT: CONVERT_LEFT,
		CONVERT_TOP: CONVERT_TOP,
		SETBORDERLEFT: SETBORDERLEFT,
		SETDELTABORDERLEFT: SETDELTABORDERLEFT,
		SETBORDERTOP: SETBORDERTOP,
		SETDELTABORDERTOP: SETDELTABORDERTOP,
		SETBORDERRIGHT: SETBORDERRIGHT,
		SETDELTABORDERRIGHT: SETDELTABORDERRIGHT,
		SETBORDERBOTTOM: SETBORDERBOTTOM,
		SETDELTABORDERBOTTOM: SETDELTABORDERBOTTOM,
		RESIZEBORDERT: RESIZEBORDERT,
		RESIZEBORDERR: RESIZEBORDERR,
		RESIZEBORDERL: RESIZEBORDERL,
		RESIZEBORDERB: RESIZEBORDERB,
		RESIZEBORDERTL: RESIZEBORDERTL,
		RESIZEBORDERTR: RESIZEBORDERTR,
		RESIZEBORDERBL: RESIZEBORDERBL,
		RESIZEBORDERBR: RESIZEBORDERBR,
		BORDERRADIUSTL: BORDERRADIUSTL,
		BORDERRADIUSTR: BORDERRADIUSTR,
		BORDERRADIUSBL: BORDERRADIUSBL,
		BORDERRADIUSBR: BORDERRADIUSBR,
		UPDATE_ELEMENT_OUTERHTML: UPDATE_ELEMENT_OUTERHTML,
		SETCSSPROP: SETCSSPROP
	});

	//import wick from "@candlefw/wick";
	/**
	 * This module is responsible for storing, updating, and caching compents. 
	 * In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
	 * Any associated stylesheets are managed through this componnent. 
	 */
	class ui_controller extends Component {

	    constructor(env, component_path) {

	        super(env);

	        this.component_path = component_path;

	        if(component_path){
	            const doc = env.data.docs.get(env.data.docs.loadFile(component_path));

	            if (doc) 
	                doc.bind(this);
	        }

	        
	        this.frame.classList.add("ui");
	        this.frame.style.overflow = "";
	        this.frame.style.backgroundColor = "";

	        this.pkg = null;

	        this.name = component_path;

	        this.env = env;
	        this.x = 0;
	        this.y = 0;

	        this.LOADED = false;
	        
	    }

	    toString(){
	        return `[UI Controller : ${this.component_path}]`;
	    }

	    documentReady(ast) {

	        if (this.ast) {
	            //Already have source, just need to rebuild with new tree. 
	            this.scope.ast = ast;
	            this.rebuild();
	        } else {
	            this.ast = ast;
	            this.scope = this.ast.mount();
	            this.ast.setScope(this.scope);
	            //let shadow = this.frame.attachShadow({ mode: 'open' });
	            this.frame.appendChild(this.scope.ele);
	            this.frame.component = this;
	            this.scope.load();
	            this.scope.css.forEach(css => this.local_css.push(css));
	        }

	        this.scope.window = this.window;
	        this.rebuild();

	        return true;
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
	        if (this.frame.parentNode != element)
	            element.appendChild(this.frame);
	    }

	    get type(){
	        return "toolbar";
	    }

	    unmount() {}

	}

	//import wick from "@candlefw/wick";

	function getOffsetPos$1(element) {
	    const a = { x: element.offsetLeft, y: element.offsetTop };
	    if (element.offsetParent) {
	        const b = getOffsetPos$1(element.offsetParent);
	        a.x += b.x;
	        a.y += b.y;
	    }
	    return a;
	}

	class ui_overlay_controller extends ui_controller {
	    constructor(env, pathname) {

	        super(env, pathname);
	        
	        this.frame.classList.add("overlay");

	        this.element = null;
	        this.actions = actions;

	        var widget = ui_overlay_controller.cache;

	        if (widget) {
	            ui_overlay_controller.cache = widget.next;
	            widget.next = null;
	        } else {

	            if (!ui_overlay_controller.env)
	                ui_overlay_controller.env = env;

	            widget = this;
	        }

	        widget.border_ele = null;
	        widget.content_ele = null;
	        widget.margin_ele = null;
	        widget.target = {
	            IS_COMPONENT: false,
	            component: null,
	            element: null,
	            action: null,
	            box: { l: 0, r: 0, t: 0, b: 0 }
	        };
	        widget.IS_ON_MASTER = false;
	        widget.next = null;
	        widget.action = null;

	        return widget;
	    }

	    loadAcknowledged() {

	    }

	    set(data) {
	        this.mgr.update({
	            target: data
	        });
	    }

	    mount(element, active) {

	        this.element = active.element;
	        this.component = active.component;
	        this.IS_COMPONENT = (active.element) == active.component.frame;
	        this.IS_ON_MASTER = true;

	        this.element.style.zIndex = -1;

	        if (this.frame.parentNode != element)
	            element.appendChild(this.frame);

	        this.update(this.env);
	    }

	    unmount() {}

	    documentReady(ast) {

	        if (ast) {
	            this.scope = ast.mount(this.frame);
	            this.scope.load(this);
	            this.scope.parent = this;

	            this.setExtendedElements();
	        }
	    }

	    async upImport(key, value) {

	        switch (key) {
	            case "move_action":
	                this.env.ui.input.handle("start", { button: 0 }, this.env, {action:this.action});
	                break;
	            case "set_control":
	                //this.loadComponent(await ControlWidget.loadComponent(value));
	                break;
	        }
	    }

	    get type() {
	        return "overlay";
	    }

	    update(env) {
	        const scale = env.ui.interface.transform.scale;
	        
	        this.scale = scale;

	        const widget = env.ui.interface.widget;

	        this.x = widget.real_pos_x;
	        this.y = widget.real_pos_y;
	        this.width = (widget.w + widget.margin_l + widget.margin_r + widget.border_l + widget.border_r + widget.padding_l + widget.padding_r)*scale;
	        this.height = (widget.h + widget.margin_t + widget.margin_b + widget.border_t + widget.border_b + widget.padding_t + widget.padding_b)*scale;

	        if (!widget.IS_COMPONENT)
	            this.setExtendedElements(widget,scale);

	        //Update Wick Controls
	        this.scope.update(widget);
	    }

	    setExtendedElements(widget, scale = this.scale) {

	        if (this.border_order_ele) {
	            this.border_order_ele.style.left = `${(widget.margin_l)*scale}px`;
	            this.border_order_ele.style.top = `${(widget.margin_t)*scale}px`;
	            this.border_order_ele.style.width = `${(widget.w + widget.border_l + widget.border_r + widget.padding_l + widget.padding_r)*scale}px`;
	            this.border_order_ele.style.height = `${(widget.h + widget.border_t + widget.border_b + widget.padding_t + widget.padding_b)*scale}px`;
	        }

	        if (this.padding_ele) {
	            this.padding_ele.style.left = `${(widget.margin_l + widget.border_l)*scale}px`;
	            this.padding_ele.style.top = `${(widget.margin_t + widget.border_t)*scale}px`;
	            this.padding_ele.style.width = `${(widget.w + widget.padding_l + widget.padding_r)*scale}px`;
	            this.padding_ele.style.height = `${(widget.h + widget.padding_t + widget.padding_b)*scale}px`;
	        }

	        if (this.content_ele) {
	            this.content_ele.style.left = `${(widget.margin_l + widget.border_l + widget.padding_l)*scale}px`;
	            this.content_ele.style.top = `${(widget.margin_t + widget.border_t + widget.padding_t)*scale}px`;
	            this.content_ele.style.width = `${(widget.w)*scale}px`;
	            this.content_ele.style.height = `${(widget.h)*scale}px`;
	        }
	    }

	    get widget(){
	        return this.env.ui.interface.widget;
	    }
	    
	    get types() {
	        return ElementBox.types;
	    }

	}

	ui_overlay_controller.env = null;
	ui_overlay_controller.cache = null;

	//import wick from "@candlefw/wick";
	/**
	 * This module is responsible for storing, updating, and caching compents. 
	 * In terms of Flame, the component is a synonym to an artboard, and is the primary container used to hold user created content. A Component reprsents a single file containing code, markup, and css necessary to present a visual artifact on the screen. It may contain definitions for sources or taps, and must be allowed to pull and push data from other components and handle integration with other components to create a fully realized UI.
	 * Any associated stylesheets are managed through this componnent. 
	 */
	class ui_toolbar_controller extends ui_controller {

	    constructor(env, component_path) {

	        super(env, component_path);

	        if(component_path){
	            const doc = env.data.docs.get(env.data.docs.loadFile(component_path));

	            if (doc) 
	                doc.bind(this);
	        }
	        
	        this.frame.classList.add("ui");

	        this.pkg = null;
	        this.name = component_path;
	        this.env = env;

	        this.x = 0;
	        this.y = 0;

	        this.LOADED = false;
	    }

	    update(env){
	        this.scope.update({widget:env.ui.interface.widget, env:env});
	    }

	    load(doc) {
	        doc.bind(this);
	    }

	    mount(element) {
	        if (this.frame.parentNode != element)
	            element.appendChild(this.frame);
	    }

	    get type(){
	        return "toolbar";
	    }

	    unmount() {}

	}

	//import wick from "@candlefw/wick";

	function getOffsetPos$2(element) {
	    const a = { x: element.offsetLeft, y: element.offsetTop };
	    if (element.offsetParent) {
	        const b = getOffsetPos$2(element.offsetParent);
	        a.x += b.x;
	        a.y += b.y;
	    }
	    return a;
	}

	class ui_hover_controller extends ui_controller {
	    constructor(env, pathname) {

	        super(env, pathname);
	        
	        this.frame.classList.add("overlay");

	        this.frame.style.pointerEvents = "none";
	        this.frame.setAttribute("tabindex", "-1");

	        this.element = null;
	        this.actions = actions;

	        var widget = ui_hover_controller.cache;

	        if (widget) {
	            ui_hover_controller.cache = widget.next;
	            widget.next = null;
	        } else {

	            if (!ui_hover_controller.env)
	                ui_hover_controller.env = env;

	            widget = this;
	        }

	        widget.border_ele = null;
	        widget.content_ele = null;
	        widget.margin_ele = null;
	        widget.target = {
	            IS_COMPONENT: false,
	            component: null,
	            element: null,
	            action: null,
	            box: { l: 0, r: 0, t: 0, b: 0 }
	        };
	        widget.IS_ON_MASTER = false;
	        widget.next = null;
	        widget.action = null;

	        return widget;
	    }

	    loadAcknowledged() {

	    }

	    set(data) {
	        this.mgr.update({
	            target: data
	        });
	    }

	    mount(element, active) {

	        this.element = active.element;
	        this.component = active.component;
	        this.IS_COMPONENT = (active.element) == active.component.frame;
	        this.IS_ON_MASTER = true;

	        if (this.frame.parentNode != element)
	            element.appendChild(this.frame);

	       // this.update(this.env);
	    }

	    

	    unmount(){
	        if(this.frame.parentNode)
	            this.frame.parentNode.removeChild(this.frame);
	    }

	    documentReady(ast) {

	        if (ast) {
	            this.scope = ast.mount(this.frame);
	            this.scope.load(this);
	            this.scope.parent = this;

	            this.setExtendedElements();
	        }
	    }

	    async upImport(key, value) {

	        switch (key) {
	            case "move_action":
	                this.env.ui.input.handle("start", { button: 0 }, this.env, {action:this.action});
	                break;
	            case "set_control":
	                //this.loadComponent(await ControlWidget.loadComponent(value));
	                break;
	        }
	    }

	    get type() {
	        return "hover";
	    }

	    update(env, widget) {
	        const scale = env.ui.interface.transform.scale;
	        
	        this.scale = scale;

	        //const widget = env.ui.interface.widget;

	        this.x = widget.real_pos_x;
	        this.y = widget.real_pos_y;
	        this.width = (widget.w + widget.margin_l + widget.margin_r + widget.border_l + widget.border_r + widget.padding_l + widget.padding_r)*scale;
	        this.height = (widget.h + widget.margin_t + widget.margin_b + widget.border_t + widget.border_b + widget.padding_t + widget.padding_b)*scale;

	        if (!widget.IS_COMPONENT)
	            this.setExtendedElements(widget,scale);

	        //Update Wick Controls
	        this.scope.update(widget);
	    }

	    setExtendedElements(widget, scale = this.scale) {

	        if (this.border_order_ele) {
	            this.border_order_ele.style.left = `${(widget.margin_l)*scale}px`;
	            this.border_order_ele.style.top = `${(widget.margin_t)*scale}px`;
	            this.border_order_ele.style.width = `${(widget.w + widget.border_l + widget.border_r + widget.padding_l + widget.padding_r)*scale}px`;
	            this.border_order_ele.style.height = `${(widget.h + widget.border_t + widget.border_b + widget.padding_t + widget.padding_b)*scale}px`;
	        }

	        if (this.padding_ele) {
	            this.padding_ele.style.left = `${(widget.margin_l + widget.border_l)*scale}px`;
	            this.padding_ele.style.top = `${(widget.margin_t + widget.border_t)*scale}px`;
	            this.padding_ele.style.width = `${(widget.w + widget.padding_l + widget.padding_r)*scale}px`;
	            this.padding_ele.style.height = `${(widget.h + widget.padding_t + widget.padding_b)*scale}px`;
	        }

	        if (this.content_ele) {
	            this.content_ele.style.left = `${(widget.margin_l + widget.border_l + widget.padding_l)*scale}px`;
	            this.content_ele.style.top = `${(widget.margin_t + widget.border_t + widget.padding_t)*scale}px`;
	            this.content_ele.style.width = `${(widget.w)*scale}px`;
	            this.content_ele.style.height = `${(widget.h)*scale}px`;
	        }
	    }

	    get widget(){
	        return this.env.ui.interface.widget;
	    }
	    
	    get types() {
	        return ElementBox.types;
	    }

	}

	ui_hover_controller.env = null;
	ui_hover_controller.cache = null;

	// Tracks components position, marks active components
	function ui_comp_state(env, components = [], active = null, hover = null) {
	    
	    var widget = null;

	    return {

	        addComponent(component) {
	            for (let i = 0; i < components.length; i++) {
	                if (components[i] == component) {
	                    return this;
	                }
	            }

	            const comps = components.slice();

	            comps.push(component);

	            return ui_comp_state(env, comps, active);
	        },

	        removeComponent(component) {
	            for (let i = 0; i < components.length; i++) {
	                if (components[i] == component) {
	                    const comps = components.slice();
	                    comps.splice(i, 1);
	                    return ui_comp_state(env, comps, (active == component) ? null : active);
	                }
	            }

	            return this;
	        },

	        setActive(active = null) {
	            if((!active || !active.component || !active.element) && active)
	                return ui_comp_state(env, components, null);

	            for (let i = 0; i < components.length; i++) {
	                if (components[i] == active.component) {
	                    return ui_comp_state(env, components, active);
	                }
	            }

	            return this;
	        },

	        get active() { return active },
	        get components() { return components }
	    };
	}

	//Responsible for registering controllers and handling UI state
	function ui_state(env, ui_element, view_element, controllers = [], previous) {

	    var overlay, comps, widget = null,
	        hover = null,
	        hover_component = null;

	    const transform = new(types.transform2D)(previous ? previous.transform : undefined);

	    const raf = requestAnimationFrame;

	    function adjustInterface() {
	        env.ui.comp_view.style.transform = transform;
	        out.updateOverlay();
	    }

	    const public_transform = new Proxy(transform, {
	        set: (obj, prop, val) => {
	            obj[prop] = val;
	            raf(adjustInterface);
	            return true;
	        }
	    });

	    env.ui.comp_view.style.transform = transform;

	    const out = {

	        addController(controller) {
	            return ui_state(env, ui_element, view_element, [controller, ...controllers], this);
	        },

	        removeController(controller) {
	            for (let i = 0; i < controllers.length; i++) {
	                if (controllers[i] == controller)
	                    return ui_state(env, ui_element, view_element, [...controllers.slice(i), ...controllers.slice(i + 1, 0)], this);
	            }
	            return this;
	        },

	        hover(element, component) {

	            if (element) {

	                if (!hover)
	                    hover = new ElementBox(element);
	                else
	                    hover.element = element;

	                hover.update();

	                for (const controller of controllers) {
	                    if (controller.type == "hover") {
	                        hover_component = controller;
	                    }
	                }

	                if (hover_component) {
	                    hover_component.mount(ui_element, { element, component });
	                    hover_component.update(env, hover);
	                }

	            } else {

	                if (hover_component)
	                    hover_component.unmount();
	            }
	        },

	        activate(comp) {

	            if (env.ui.interface !== this) {
	                ui_element.innerHTML = "";
	                controllers.forEach(c => void(c.type == "toolbar" ? c.mount(ui_element) : null));
	                env.ui.interface = this;
	            }
	if (comps !== comp) {
	    view_element.innerHTML = "";
	                comp.components.forEach(c => c.mount(view_element));
	                comps = comp;
	            }

	            if (comp.active) {
	                if (!widget)
	                    widget = new ElementBox(comp.active.element, comp.active.component);
	                else{
	                    widget.window = comp.active.component;
	                    widget.element = comp.active.element;
	                }

	                for (const controller of controllers) {
	                    if (controller.type == "overlay") {
	                        overlay = controller;
	                    }
	                }

	                if (overlay) {
	                    overlay.mount(ui_element, comp.active);
	                }

	                this.update();

	            }
	        },

	        updateOverlay() {
	            if (widget)
	                widget.update();

	            if (overlay)
	                overlay.update(env);
	        },

	        update() {
	            

	            if (widget){
	                if(widget.element.replacement){
	                    widget.element = widget.element.replacement;
	                }
	                widget.update();
	            }

	            for (const controller of controllers) {
	                if (controller.type == "hover") {
	                    if (hover)
	                        controller.update(env, hover);
	                } else {
	                    controller.update(env);
	                }
	            }
	        },

	        get widget() {
	            return widget;
	        },

	        get transform() {
	            return public_transform;
	        }
	    };

	    return out;
	}

	function Browser_input_engine(env) {

	    const ui = env.ui,
	        performance = window.performance || Date;

	    var old_click_time = performance.now();
	    var move_event = null;

	    const data = {
	        x: 0,
	        y: 0,
	        dx: 0,
	        dy: 0,
	        time_since_last_click: 0
	    };

	    const ele = env.ui.main_view;
	    const elecomp = env.ui.comp_view;

	// ********************** Miscellaneous ******************************************************************

	    ele.addEventListener("resize", e => {
	        e.stopPropagation();
	        e.preventDefault();
	        //data.timeSinceLast = -(old_click_time - (old_click_time = performance.now()));
	        ui.input = ui.input.handle("resize", e, env, data);
	    });

	    // // *********** Mouse *********************
	    ele.addEventListener("wheel", e => {
	        e.stopPropagation();
	        e.preventDefault();
	        //data.timeSinceLast = -(old_click_time - (old_click_time = performance.now()));
	        ui.input = ui.input.handle("scroll", e, env, data);
	    });

	// ********************** Pointer ******************************************************************

	    elecomp.addEventListener("pointerdown", e => {

	        e.stopPropagation();
	        e.preventDefault();

	        data.dx = 0;
	        data.dy = 0;
	        data.x = e.x;
	        data.y = e.y;

	        data.time_since_last_click = -1;
	        old_click_time = performance.now();

	        ui.input = ui.input.handle("start", e, env, data);
	    });

	    ele.addEventListener("pointerdown", e => {
	        data.dx = 0;
	        data.dy = 0;
	        data.x = e.x;
	        data.y = e.y;

	        data.time_since_last_click = -1;
	        old_click_time = performance.now();

	        if(e.button == 1)
	            ui.input = ui.input.handle("start", e, env, data);
	        else 
	            ui.input.handle("start", e, env, data);
	    });

	    ele.addEventListener("pointerup", e => {

	        e.stopPropagation();
	        e.preventDefault();
	        data.dx = 0;
	        data.dy = 0;
	        data.x = e.x;
	        data.y = e.y;

	        data.time_since_last_click = -(old_click_time - (old_click_time = performance.now()));

	        ui.input = ui.input.handle("end", e, env, data);
	    });

	    ele.addEventListener("pointermove", e => {
	        e.stopPropagation();
	        e.preventDefault();
	        move_event = e;
	        data.dx = e.movementX;
	        data.dy = e.movementX;
	        data.x += e.movementX;
	        data.y += e.movementY;
	        old_click_time = -Infinity;
	        
	        ui.input.handle("hover", e, env, data);
	    });

	    function updatePointer() {
	        requestAnimationFrame(updatePointer);
	        if (move_event) {
	            ui.input = ui.input.handle("move", move_event, env, data);
	            move_event = null;
	        }
	    }

	    requestAnimationFrame(updatePointer);


	// ********************** Drag 'n Drop ******************************************************************

	    document.body.addEventListener("drop", e => {
	        //data.time_since_last_click = -(old_click_time - (old_click_time = performance.now()));
	        ui.input = ui.input.handle("drop", e, env, data);
	        //ui.handleDocumentDrop(e)
	    });

	    document.body.addEventListener("dragover", e => {
	        e.preventDefault();
	        //data.time_since_last_click = -(old_click_time - (old_click_time = performance.now()));
	        e.dataTransfer.dropEffect = "copy";
	    });


	    document.body.addEventListener("dragstart", e => {
	        //data.timeSinceLast = -(old_click_time - (old_click_time = performance.now()));
	    });

	    return {
	        get point() {
	            return data;
	        },

	        get x() {
	            return data.x;
	        },

	        get y() {
	            return data.y;
	        }
	    };
	}

	/*
	    The base level input handler.
	*/
	class Handler {

	    handle(type, event, ui_manager, target) {
	        switch (type) {
	            case "key":
	                return this.char(event, ui_manager, target);
	            case "char":
	                return this.key(event, ui_manager, target);
	            case "end":
	                return this.end(event, ui_manager, target);
	            case "start":
	                return this.start(event, ui_manager, target);
	            case "move":
	                return this.move(event, ui_manager, target);
	            case "drop":
	                return this.docDrop(event, ui_manager, target);
	            case "generic_drop":
	                return this.drop(event, ui_manager, target);
	            case "scroll":
	                return this.scroll(event, ui_manager, target);
	            case "hover":
	                return this.hover(event, ui_manager, target);
	            case "context":
	                return this.context(event, ui_manager, target);
	        }
	    }

	    hover(event, env, data) {
	        if (data) {
	            let component = null;

	            let element = env.ui.comp_view.shadowRoot.elementFromPoint(data.x, data.y);

	            if (element && element.component) {
	                while (!element.component) {
	                    element = element.parentNode;
	                }

	                if (element.component) {

	                    component = element.component;

	                    if (component && !(component instanceof ui_controller) ) {

	                        if (component.type == "css") {
	                            element = component.element;
	                        } else if (element.shadowRoot) {
	                            element = element.shadowRoot.elementFromPoint(data.x, data.y);
	                        }

	                        if (element !== env.ui.interface.widget.element)
	                            env.ui.setHover(element, component);


	                        return Handler.default;
	                    }
	                }
	            }

	            env.ui.ui_view.style.display = "";
	        }
	        
	        env.ui.setHover();
	        

	        return Handler.default;
	    }

	    //Pointer end
	    end(event, env, data) {

	        // return Handler.default;
	        if (data && event.button == 0 && data.time_since_last_click < 100) {

	            let component = null;

	            env.ui.ui_view.style.pointerEvents = "none";

	            let element = env.ui.comp_view.shadowRoot.elementFromPoint(data.x, data.y);

	            if (element) {
	                while (element && !element.component) {
	                    element = element.parentNode;
	                }

	                if (element && element.component) {

	                    component = element.component;


	                    if (component.type == "css") {
	                        element = component.element;
	                    } else {
	                        element = element.shadowRoot.elementFromPoint(data.x, data.y);
	                    }

	                    data.time_since_last_click = Infinity;

	                    env.ui.setState(undefined, env.ui.comp.setActive({ component, element }));
	                }
	            }

	            env.ui.ui_view.style.pointerEvents = "";
	        }

	        return Handler.default;
	    }

	    //Pointer start
	    start(event, env, data) {

	        if (data && !env.ui.interface.active && event.button == 0) {
	            let component = null;

	            env.ui.ui_view.style.display = "none";

	            let element = env.ui.comp_view.shadowRoot.elementFromPoint(data.x, data.y);

	            if (element && element.component) {
	                while (!element.component) {
	                    element = element.parentNode;
	                }

	                if (element.component) {

	                    component = element.component;

	                    if (component.type == "css") {
	                        element = component.element;
	                    } else {
	                        element = element.shadowRoot.elementFromPoint(data.x, data.y);
	                    }

	                    data.time_since_last_click = Infinity;

	                    env.ui.setState(undefined, env.ui.comp.setActive({ component, element }));
	                }
	            }

	            env.ui.ui_view.style.display = "";
	        }

	        return Handler.default;
	    }

	    //Pointer move
	    move() { return Handler.default }

	    //Document drop
	    docDrop() { return Handler.default }

	    //Generic drop operation
	    drop() { return Handler.default }

	    //Wheel Scroll
	    scroll() { return Handler.default }

	    //Context Menu
	    context() { return Handler.default }
	}

	Handler.default = null;

	class PanView extends Handler {

	    constructor() {

	        super();

	        this.origin_x = 0;
	        this.origin_y = 0;
	    }

	    start(event, env, data) {

	        if (event.button !== 1)
	            return Handler.default.start(event, env, data);

	        this.origin_x = data.x;
	        this.origin_y = data.y;

	        return this;
	    }

	    move(event, env, data) {
	        const ui = env.ui.interface;
	        const x = data.x,
	            y = data.y;
	            
	        const diffx = this.origin_x - x;
	        const diffy = this.origin_y - y;

	        ui.transform.px -= diffx;
	        ui.transform.py -= diffy;

	        this.origin_x -= diffx;
	        this.origin_y -= diffy;

	        return this;
	    }
	}

	var pan_view = (new PanView());

	class ZoomView extends Handler {
	    scroll(event, env, data) {
	        const ui = env.ui.interface;

	        const amount = event.deltaY,
	            os = ui.transform.scale;

	        ui.transform.scale = Math.max(0.2, Math.min(2, os + -amount * 0.00005));

	        const px = ui.transform.px,
	            s = ui.transform.scale,
	            py = ui.transform.py;

	        ui.transform.px -= ((((px - data.x) * os) - ((px - data.x) * s))) / (os);
	        ui.transform.py -= ((((py - data.y) * os) - ((py - data.y) * s))) / (os);
	        
	        return super.scroll();
	    }
	}

	var zoom_view = (new ZoomView());

	class Default extends Handler {

	    constructor() {

	        super();

	        if (!Handler.default)
	            Handler.default = this;

	        this.dnd = false; // system.ui.manager.dnd;
	        this.origin_x = 0;
	        this.origin_y = 0;
	        this.excess_x = 0;
	        this.excess_y = 0;
	        this.ACTIVE_POINTER_INPUT = false;

	    }

	    start(event, env, data) {

	        if (event.button == 1)
	            return pan_view.start(event, env, data);

	        const ui = env.ui.interface;

	        if (!data.action)
	            super.start(event, env, data);
	        else
	            this.target_action = data.action;


	        const x = data.x || env.ui.input_engine.x,
	            y = data.y || env.ui.input_engine.y;

	        if (this.dnd.ACTIVE) {
	            this.dnd.start(event, data);
	            return this.constructor.default;
	        }

	        ui.RENDER_LINES = true;

	        this.origin_x = (x / ui.transform.scale);
	        this.origin_y = (y / ui.transform.scale);

	        this.ACTIVE_POINTER_INPUT = true;

	        if (event.target !== document.body)
	            return this.constructor.default;

	        env.ui.setState(undefined, env.ui.comp.setActive(null));

	        return this.constructor.default;
	    }

	    move(event, env, data) {
	        const ui = env.ui.interface;

	        if (this.dnd.ACTIVE) {
	            this.dnd.move(event, data);
	            return this.constructor.default;
	        }

	        if (!this.ACTIVE_POINTER_INPUT) return this.constructor.default;

	        const x = data.x || env.ui.input_engine.x,
	            y = data.y || env.ui.input_engine.y;

	        if (this.target_action && env.ui.comp.active) {

	            const diffx = this.origin_x - (x / ui.transform.scale) + this.excess_x;
	            const diffy = this.origin_y - (y / ui.transform.scale) + this.excess_y;

	            let xx = Math.round(diffx);
	            let yy = Math.round(diffy);

	            //const { dx, dy, MX, MY } = ui.line_machine.getSuggestedLine(ui.transform.scale, ui.target, xx, yy);

	            this.origin_x -= diffx; //(MX) ? dx : xx;
	            this.origin_y -= diffy; //(MY) ? dy : yy;
	            //if(ui.target.box.l == ui.target.box.r && Math.abs(diffx) > 1 && Math.abs(dx) < 0.0001) debugger
	            const ui_comp = env.ui.comp;

	            let out = this.target_action(env, ui_comp.active.component, ui_comp.active.element, -diffx, -diffy, ui_comp.active.component.frame == ui_comp.active.element);

	            if (out) {
	                if (out.excess_x)
	                    this.excess_x += out.excess_x;
	                if (out.excess_y)
	                    this.excess_y += out.excess_y;
	            }

	            ui.update();
	        }

	        return this.constructor.default;
	    }

	    end(event, env, data) {
	        const ui = env.ui.interface;
	        const comp = env.ui.comp;

	        if (this.dnd.ACTIVE) {
	            this.dnd.end(event, data);
	            return this.constructor.default;
	        }

	        this.ACTIVE_POINTER_INPUT = false;

	        if (comp.active) {
	            if (comp.active instanceof ui_controller)
	                ui.ui_target = null;
	            else if (ui.target)
	                COMPLETE(env, comp.active);

	            comp.active.element.flame_cache = null;
	        }

	        this.excess_x = 0;
	        this.excess_y = 0;
	        this.target_action = null;

	        return super.end(event, env, data);
	    }

	    drop(data, ui, drop_data) {

	        switch (drop_data.type) {
	            case "css_selector":
	                let comp = CREATE_COMPONENT(ui.system, drop_data, data.x, data.y);
	                break;
	        }
	    }

	    docDrop(event, ui) {
	        Array.prototype.forEach.call(event.dataTransfer.files,
	            f => ui.mountDocument(
	                f,
	                ui.transform.getLocalX(event.clientX),
	                ui.transform.getLocalY(event.clientY))
	        );

	        return this.constructor.default;
	    }

	    key() {

	    }

	    char() {

	    }

	    scroll(event, env, data) {
	        return zoom_view.scroll(event, env, data);
	    }

	    context(event, ui, data) {
	        switch (event.target.tagName.toUpperCase()) {
	            case "SVG":
	            case "RECT":
	            case "PATH":
	                ui.svg_manager.mount(ui, event.target, data.component, event.x, event.y);
	                break;
	            default:
	                ui.ui_components.get("element_edit.html").mount(ui.element);
	        }

	        return this.constructor.default;
	    }
	}

	/*
		Integrates CSS custom ui systems into CSS
	*/
	function css_integration(env){
		const css = env.css;

		setColorHandler(css.types.color, env);
		setLengthHandler(css.types.length, env);
		setFontHandler(css.types.fontname, env);
	}

	function setFontHandler(CSS_Font, env){
		//Preload document data;
		env.data.docs.get(env.data.docs.loadFile("/@ui/css_font_family_handler.html"));

		CSS_Font.setValue = function(ui_segment, value){
			ui_segment.scope.update({value});
	    };

		CSS_Font.valueHandler = function(ui_segment, value, update_function){
			const doc = env.data.docs.get(env.data.docs.loadFile("/@ui/css_font_family_handler.html"));

			if(ui_segment.scope)
				ui_segment.scope.destroy();

			ui_segment.scope = doc.data.mount(ui_segment.val);
			ui_segment.scope.update({loaded:true});
			ui_segment.scope.update({segment:ui_segment});
			ui_segment.scope.update({value});
	    };
	}

	function setColorHandler(CSS_Color, env){
		//Preload document data;
		env.data.docs.get(env.data.docs.loadFile("/@ui/css_color_handler.html"));

		CSS_Color.setValue = function(ui_segment, value){
			ui_segment.scope.update({value});
	    };

		CSS_Color.valueHandler = function(ui_segment, value, update_function){
			const doc = env.data.docs.get(env.data.docs.loadFile("/@ui/css_color_handler.html"));

			if(ui_segment.scope)
				ui_segment.scope.destroy();

			ui_segment.scope = doc.data.mount(ui_segment.val);
			ui_segment.scope.update({loaded:true});
			ui_segment.scope.update({segment:ui_segment});
			ui_segment.scope.update({value});
	    };
	}

	function setLengthHandler(CSS_Length, env){
		//Preload document;
		env.data.docs.get(env.data.docs.loadFile("/@ui/css_length_handler.html"));

		CSS_Length.setValue = function(ui_segment, value){
			ui_segment.scope.update({value});
	    };

		CSS_Length.valueHandler = function(ui_segment, value, update_function){
			const doc = env.data.docs.get(env.data.docs.loadFile("/@ui/css_length_handler.html"));

			if(ui_segment.scope)
				ui_segment.scope.destroy();

			ui_segment.scope = doc.data.mount(ui_segment.val);
			ui_segment.scope.update({loaded:true});
			ui_segment.scope.update({segment:ui_segment});
			ui_segment.scope.update({value});
	    };
	}

	var ENIRONMENT_TOGGLE = false; //False - Environment not displayed. 

	/** Opens the Flame dev environment.**/
	function toggle_environment(env = null) {

	    const main_view = env.ui.main_view;

		if(ENIRONMENT_TOGGLE){
	    	main_view.style.display = "none";
		}else{
			main_view.style.display = "block";
		}

		ENIRONMENT_TOGGLE = !ENIRONMENT_TOGGLE;

	    //Load root scope from the hosting environment. 
	    //load_component_from_user_space_scope(env.root_scope, env);
	}

	function build_editor_environment(env, html_element, INITIALIZED_HIDDEN = true) {

	    const view = (env.ui.main_view = document.createElement("div"));

	    env.ui.ui_view = document.createElement("div");
	    env.ui.comp_view = document.createElement("div");

	    view.appendChild(env.ui.comp_view);
	    view.appendChild(env.ui.ui_view);

	    setupMainView(view, INITIALIZED_HIDDEN);
	    setupUIView(env.ui.ui_view);
	    setupWYSIWYGView(env.ui.comp_view);
	    //Create an activator button that will allow the flame environment to open and close
	    setupEditorButton(html_element, env);

	    env.ui.input = new Default(env);
	    env.ui.input_engine = new Browser_input_engine(env, env.ui.ui_view, env.ui.comp_view);

	    env.ui.setState = function(interfc = env.ui.interface, comp = env.ui.comp) {
	        env.ui.comp = comp;
	        interfc.activate(comp);
	    };

	    env.ui.update = function(interfc = env.ui.interface, comp = env.ui.comp) {
	        interfc.update();
	    };

	    env.ui.setHover = function(element = null, component) {
	        env.ui.interface.hover(element, component);
	    };

	    env.ui.setState(
	        ui_state(env, env.ui.ui_view, env.ui.comp_view.attachShadow({ mode: 'open' }))
	        //.addController(new UI_hover_controller(env, "/@ui/hover.html"))
	        .addController(new ui_overlay_controller(env, "/@ui/basic.html"))
	        .addController(new ui_toolbar_controller(env, "/@ui/css_toolbar.html"))
	        .addController(new ui_toolbar_controller(env, "/@ui/data_toolbar.html"))
	        //.addController(new UI_toolbar_controller(env, "/@ui/js_toolbar.html"))
	        .addController(new ui_toolbar_controller(env, "/@ui/html_toolbar.html")), ui_comp_state(env)
	    );

	    //Make sure the Flame Editing Environement is appended to the beginning of whatever element it is passed. 
	    html_element.insertBefore(view, html_element.firstChild);
	}

	function setupMainView(view, INITIALIZED_HIDDEN) {
	    view.style.backgroundColor = "rgba(250,250,250,1)";
	    view.style.position = "fixed";
	    view.style.width = "100vw";
	    view.style.height = "100vh";
	    view.style.top = 0;
	    view.style.left = 0;
	    view.style.padding = 0;
	    view.style.margin = 0;
	    view.style.display = INITIALIZED_HIDDEN ? "none" : "block";
	}

	function setupUIView(view) {
	    //view.style.backgroundColor = "rgba(255,0,0,0.1)";
	    view.style.position = "fixed";
	    view.style.width = 0;
	    view.style.height = 0;
	    view.style.top = 0;
	    view.style.left = 0;
	}

	function setupWYSIWYGView(view) {
	    //view.id = "comp_view";
	    view.style["transformOrigin"] = "0 0";
	    view.style.display = "block";
	    view.style.position = "absolute";
	    view.style.width = "0px";
	    view.style.height = "0px";
	    view.style.background = "color: red";
	}

	function setupEditorButton(parent_element, env) {
	    const editor_button = document.createElement("div");
	    editor_button.style.backgroundColor = "red";
	    editor_button.style.borderRadius = "20px";
	    editor_button.style.position = "fixed";
	    editor_button.style.width = "50px";
	    editor_button.style.height = "50px";
	    editor_button.style.top = "-20px";
	    editor_button.style.margin = "auto";
	    editor_button.style.top = "calc(100vh - 60px)";
	    editor_button.style.right = "20px";
	    editor_button.style.cursor = "pointer";

	    editor_button.addEventListener("click", () => {
	        toggle_environment(env);
	    });

	    parent_element.appendChild(editor_button);
	}

	class WickDocument extends Document {

	    updatedWickASTTree() {
	        this.manager.addPending(this);
	    }

	    async fromString(string, env, ALLOW_SEAL = true) {
	        //*

	        const component = (env.wick(string, env.presets));

	        await component.pending;

	        //TODO - Determine the cause of undefined assigned to pkg
	        if (!component) { debugger; return }

	        this.LOADED = true;

	        if (this.data)
	            this.data.removeObserver(this);

	        this.data = component.ast;

	        this.data.addObserver(this);

	        this.alertObservers();

	        if (ALLOW_SEAL) {
	            this.PENDING_SAVE = true;
	            this.system.docs.seal();
	        }
	    //*/
	}

	toString() {
	    return (this.data) ?
	        this.data.toString() :
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
	            this.tree.parse(whind$3(string)).catch((e) => {
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

	var general_toolbar = "<scope class=\"main\" export=\"move_action set_control\"   style=\"width:100%;height:100%\" element=\"div\" >\n\t\n\ttop: ((widget.x))\n\ttop: ((widget.y))\n\twidth: ((widget.width))\n\theight: ((widget.Height))\n\n\t(( css_selectors ))<br/>\n\n\t<input type=\"text\" pin=\"css_value\">\n\t\n\t<button onclick=((add_css_value))>submit</button>\n\n\t<textarea value=((component_info)(changed))></textarea>\n\n\t<script on=((changed))>\n\t\tenv.ui.comp.active.element.wick_node.reparse(changed);\n\t</script>\n\n\n\t<script on=((add_css_value))>\n\t\t\n\t\tconst value = css_value$.value;\n\t\tconst component = env.ui.comp.active.component;\n\t\tconst element = env.ui.comp.active.element;\n\n\t\tif(component && element)\n\t\t\tactions.SETCSSPROP(env, component, element, value);\t\t\n\n\t</script>\n\n\n\n\t<container>\n\t\t((css_names))\n\t\t<scope import=\"env\" element=div>\n\t\t\t((name))\n\t\t\t((css_out))\n\n\t\t\t<script on=((loading))  >\n\n\t\t\t\tconst component = env.ui.comp.active.component;\n\t\t\t\tconst element = env.ui.comp.active.element;\n\n\t\t\t\tconst cs = component.local_css[0];\n\n\t\t\t\tfor(const prop of cs.getApplicableProperties(element, component)){\n\n\t\t\t\t\tif(prop.name == name){\n\n\t\t\t\t\t\tlet ele = document.createElement(\"div\");\n\n\t\t\t\t\t\tthis.ui = css.ui(prop);\n\n\t\t\t\t\t\tthis.ui.mount(ele);\n\n\t\t\t\t\t\tcss_out = ele;\n\n\t\t\t\t\t\tbreak;\n\t\t\t\t\t}\n\t\t\t\t}\n\n\t\t\t</script>\n\t\t</scope>\n\t</container>\n\n\t<container>\n\t\t((documents))\n\t\t<scope onclick=((add_to_main))>\n\t\t\t<h4 draggable=true ondragstart=((start))>((name))</h4>\n\t\t\t<script on=((add_to_main))>\n\t\t\t\tactions.CREATE_COMPONENT(env, this.model, 150, 150)\n\t\t\t</script>\n\t\t</scope>\n\t</container>\n\t\n\t<div class=\"cfw_css\">\n\t\t((css_out))<br/>\n\t</div>\n\n\t<span pin=css></span>\n\n\t<script on=((widget))>\n\n\t\tcomponent_info = env.ui.comp.active.element.wick_node.toString();\n\n\t\tconst docs = env.data.docs;\n\t\tlet d = [];\n\t\t\n\t\tfor(const doc of docs.docs.values()){\n\t\t\td.push(doc)\n\t\t}\n\n\t\tdocuments = d;\n\t\t\n\t\tconst component = env.ui.comp.active.component;\n\t\tconst element = env.ui.comp.active.element;\n\n\t\tif(element !== this.element && component.local_css && component.local_css[0]){\n\t\t\t\n\t\t\tconst cs = component.local_css[0];\n\n\t\t\tif(this.ui){\n\t\t\t\tthis.ui.destroy();\n\t\t\t}\n\n\t\t\treturn;\n\n\t\t\tconst stylesheet = new css.stylesheet();\n\t\t\t\n\t\t\t([...cs.getApplicableSelectors(element)].map(m => stylesheet.ruleset.rules.push(m.parent) ));\n\n\t\t\tthis.ui = css.ui(stylesheet);\n\n\t\t\tthis.ui.update();\n\n\t\t\tconst ele = document.createElement(\"div\");\n\n\t\t\tthis.ui.mount(ele);\n\n\t\t\tcss_out = ele;\n\t\t\tcss_names = [{name:\"top\"},{name:\"left\"}];\n\t\t}\n\n\t\tthis.element = element;\n\t</script>\n\n\t<style>\n\t\t.main{\n\t\t\tposition: relative;\n\t\t\ttop:0;\n\t\t\tleft:0;\n\t\t\tbackground-color: white;\n\t\t\twidth:160px;\n\t\t\tmin-height: 300px;\n\t\t}\n\t</style>\n</scope>\n\n\n";

	var header_toolbar = "<scope class=\"main\" export=\"move_action set_control\"   style=\"width:100%;height:100%\" element=\"div\" >\n\n\t<div class=\"center\">\n\t\t<span class=\"button\"><a onclick=((css)) href=\"#\">CSS</a></span>\n\t\t<span class=\"button\"><a onclick=((html)) href=\"#\">HTML</a></span>\n\t\t<span class=\"button\"><a onclick=((js)) href=\"#\">JS</a></span>\n\t</div>\n\n\t<style>\n\t\ta{\n\t\t\tcolor:white;\n\t\t\ttext-decoration: none;\n\t\t\tfont-family: arial;\n\t\t}\n\t\t.button{\n\t\t\tdisplay: inline-block;\n\t\t\tcolor:white;\n\t\t\tbackground-color: rgb(50,50,50);\n\t\t\twidth:  60px;\n\t\t\theight: 32px;\n\t\t\tborder-radius: 8px;\n\t\t\tmargin: 8px 20px;\n\t\t}\n\t\t.center{\n\t\t\twidth:100vw;\n\t\t\ttext-align: center;\n\t\t}\n\t</style>\n\t<script on=\"css\">\n\t\tdebugger\n\t</script>\n</scope>\n\n\n";

	var html_toolbar = "<scope class=\"main\" export=\"move_action set_control\"   style=\"width:100%;height:100%\" element=\"div\" >\n\tHTML\n\t<textarea pin=text class=\"text\" value=((component_info)(changed))></textarea>\n\n\t<script on=((changed))>\n\t\tif(env.ui.comp.active.element.wick_node){\n\t\t\tthis.active = true;\n\t\t\tthis.start = text$.selectionStart;\n\t\t\tthis.end = text$.selectionEnd;\n\t\t\tactions.UPDATE_ELEMENT_OUTERHTML(env, env.ui.comp.active.component, env.ui.comp.active.element, changed)\n\t\t\t\n\t\t}\n\t</script>\n\n\t<script on=((widget))>\n\t\t\t\n\t</script>\n\n\t<script on=((update))>\n\t\tif(!this.active){\n\n\t\tcomponent_info = (env.ui.comp.active.element.wick_node) ? \n\t\t\t\tenv.ui.comp.active.element.wick_node.toString() : \n\t\t\t\t\"\";\n\n\t\t}\n\t\tthis.active = false;\n\n\t\t\ttext$.selectionStart = this.start || 0;\n\t\t\ttext$.selectionEnd = this.end || 0;\n\t</script>\n\n\n\t<style>\n\t\t.text{\n\t\t\tmin-width:250px;\n\t\t\tmin-height:300px;\n\t\t}\n\t\t.main{\n\t\t\tposition: relative;\n\t\t\ttop:360px;\n\t\t\tleft:0;\n\t\t\tbackground-color: white;\n\t\t}\n\t</style>\n</scope>\n\n\n";

	var data_toolbar = "<scope class=\"main\" export=\"move_action set_control\"   style=\"width:100%;height:100%\" element=\"div\" >\n\tDATA\n\t<textarea class=text value=((css_rules)(changed))></textarea>\n\t\n\t<script on=((changed))>\n\t\ttry{\n\t\t\tconst data = JSON.parse(changed);\n\t\t\tif(env.ui.comp.active.component){\n\t\t\t\tenv.ui.comp.active.component.scope.update(data);\n\t\t\t}\n\t\t}catch(e){\n\t\t\tconsole.log(e)\n\t\t}\n\t</script>\n\n\t<style>\n\t\t.text{\n\t\t\tmin-width:250px;\n\t\t\tmin-height:300px;\n\t\t}\n\t\t.main{\n\t\t\tposition: relative;\n\t\t\ttop:720px;\n\t\t\tbackground-color: white;\n\t\t}\n\t</style>\n</scope>\n\n\n";

	var js_toolbar = "<scope class=\"main\" export=\"move_action set_control\"   style=\"width:100%;height:100%\" element=\"div\" >\n\tTest\n</scope>\n\n\n";

	var css_toolbar = "<scope class=\"main\" export=\"move_action set_control\"   style=\"width:100%;height:100%\" element=\"div\" >\n\tCSS\n\t<textarea class=text value=((css_rules)(changed))></textarea>\n\t\n\t<script on=((changed))>\n\t\tthis.cache.setCSSProp(changed.slice(1,-1));\n\t\tif(env.ui.comp.active.element.wick_node){\n\t\t\tenv.ui.comp.active.element.wick_node.prepRebuild();\n\t\t\tenv.ui.comp.active.element.wick_node.rebuild();\n\t\t}\n\t</script>\n\n\n\t<script on=((widget))>\n\n\t\tif(env.ui.comp.active.element.wick_node){\n\n\t\t\tconst element = env.ui.comp.active.element;\n\t\t\tconst component = env.ui.comp.active.component;\n\t\t\tconst cache  = env.getCache(env, component, element);\n\n\t\t\tthis.cache = cache;\n\n\t\t\tcss_rules = cache.rules;\n\t\t}\n\t</script>\n\n\t<style>\n\t\t.text{\n\t\t\tmin-width:250px;\n\t\t\tmin-height:300px;\n\t\t}\n\t\t.main{\n\t\t\tposition: relative;\n\t\t\tleft:0;\n\t\t\tbackground-color: white;\n\t\t}\n\t</style>\n</scope>\n\n\n";

	var basic = "<scope export=\"move_action set_control\"   style=\"width:100%;height:100%\" element=\"div\" >\n\n\t<div id=\"tl\" class=\"move_handle\" onpointerdown_=((tl_grab)())></div>\n\t<div id=\"tr\" class=\"move_handle\" onpointerdown_=((tr_grab)())></div>\n\t<div id=\"bl\" class=\"move_handle\" onpointerdown_=((bl_grab)())></div>\n\t<div id=\"br\" class=\"move_handle\" onpointerdown_=((br_grab)())></div>\n\n\t<selectorlist></selectorlist>\n\n\t<div class=\"test\" pin=\"padding\">\n\t</div>\n\n\t<div class=\"test\" pin=\"margin\">\n\t</div>\n\n\t<div class=\"test\" pin=\"content\" >\n\t</div>\n\n\n\t<div class=\"centerer\" tabindex=\"1\">\n\t\t<span class=\"left_position\">left: ((posl.toString().slice(0,8)))px</span>\n\t</div>\n\n\t<div class=\"centerer\">\n\t\t<span class=\"top_position\">top:((post.toString().slice(0,8)))px</span>\n\t</div>\n\n\n\n\t\t<div class=\"centergrab\" onpointerdown=\"((grab)())\"></div>\n\t<script on=((show_css_selector_list))>\n\t\t//build list of selector elements to present.\n\t\tlet selectors = css.getApplicableSelectors(this.model.component, this.model.element);\n\t\tconsole.log(selectors);\n\t\temit.selectors = selectors.map(s=>({name:s.vals.join(\" \"),sel:s}));\n\t</script>\n\n\t<script on=((grab))>\n\t\tthis.model.action = this.model.actions.MOVE;\n\t\tthis.model.edgeType = 0;\n\t\tmove_action = event;\n\t\treturn false;\n\t</script>\n\n\t<script on=((tl_grab))>\n\t\tthis.model.action = this.model.actions.RESIZETL;\n\t\tthis.model.edgeType = 5;\n\t\tmove_action = event;\n\t\treturn true;\n\t</script>\n\n\t<script on=((tr_grab))>\n\t\tthis.model.action = this.model.actions.RESIZETR;\n\t\tthis.model.edgeType = 6;\n\t\tmove_action = event;\n\t\treturn true;\n\t</script>\n\n\t<script on=((bl_grab))>\n\t\tthis.model.action = this.model.actions.RESIZEBL;\n\t\tthis.model.edgeType = 9;\n\t\tmove_action = event;\n\t\treturn true;\n\t</script>\n\n\t<script on=((br_grab))>\n\t\tthis.model.action = this.model.actions.RESIZEBR;\n\t\tthis.model.edgeType = 10;\n\t\tmove_action = event;\n\t\treturn true;\n\t</script>\n\n\t<style>\n\n\t\t.centergrab{\n\t\t\twidth: 100%;\n\t\t\theight: 100%;\n\t\t\tposition: absolute;\n\t\t\ttop:0px;\n\t\t\tleft:0px;\n\t\t\tz-index: 0\n\t\t}\n\n\t\t.test{\n\t\t\tposition: absolute;\n\t\t\tpointer-events: none;\n\t\t}\n\n\t\t.move_handle{\n\t\t\twidth: 8px;\n\t\t\theight: 8px;\n\t\t\tborder: 1px solid black;\n\t\t\tbackground-color: white;\n  \t\t\tpointer-events: auto;\n  \t\t\tborder-radius: 1px;\n\t\t\tposition: absolute;\n\t\t\tz-index: 1000;\n\t\t}\n\n\t\t#tl{\n\t\t\ttop:-4px;\n\t\t\tleft:-4px;\n\t\t}\n\n\t\t#tr{\n\t\t\ttop:-4px;\n\t\t\tright:-4px;\n\t\t}\n\n\t\t#bl{\n\t\t\tbottom:-4px;\n\t\t\tleft:-4px;\n\t\t}\n\t\t\n\n\t\t#br{\n\t\t\tbottom:-4px;\n\t\t\tright:-4px;\n\t\t}\n\n\t\t.centerer{\n\t\t\twidth: 100%;\n\t\t\tdisplay: flex;\n  \t\t\talign-items: center;\n  \t\t\tjustify-content: center;\n  \t\t\tpointer-events: auto;\n\t\t}\n\n\t\t.left_position{\n\t\t\tfont-size: 14px;\n\t\t\tpadding: 3px;\n\t\t\tposition: absolute;\n\t\t\ttop:-40px;\n\t\t\tbackground-color: black;\n\t\t\tcolor:white;\n\t\t}\n\n\t\t.top_position{\n\t\t\tfont-size: 14px;\n\t\t\tpadding: 3px;\n\t\t\tposition: absolute;\n\t\t\ttop:-10px;\n\t\t\tleft:-80px;\n\t\t\tjustify-content: right;\n\t\t\tbackground-color: black;\n\t\t\tcolor:white;\n\t\t}\n\n\t\t.center_position{\n\t\t\tfont-size: 14px;\n\t\t\tpadding: 3px;\n\t\t\tposition: relative;\n\t\t\twidth:80px;\n\t\t\tmargin: auto;\n\t\t\ttop:80px;\n\t\t\tjustify-content: right;\n\t\t\tbackground-color: rgb(20,110,210);\n\t\t\tborder:  2px solid rgb(190,190,190);\n\t\t\tborder-radius: 8px;\n\t\t\tcolor:white;\n\t\t}\n\t</style>\n</scope>\n\n\n";

	var hover = "<scope export=\"move_action set_control\"  tabindex=\"1\"  style=\"pointer-events:none;width:100%;height:100%\" element=\"div\" >\n\n\t<selectorlist></selectorlist>\n\n\t<div class=\"test\" pin=\"padding\">\n\t</div>\n\n\t<div class=\"test\" pin=\"margin\">\n\t</div>\n\n\t<div class=\"test\" pin=\"content\" >\n\t</div>\n\t<style>\n\n\t\t.centergrab{\n\t\t\twidth: 100%;\n\t\t\theight: 100%;\n\t\t\tposition: absolute;\n\t\t\ttop:0px;\n\t\t\tleft:0px;\n\t\t\tz-index: 0\n\t\t}\n\n\t\t.test{\n\t\t\tposition: absolute;\n\t\t\tpointer-events: none;\n\t\t}\n\n\t\t#tl{\n\t\t\ttop:-4px;\n\t\t\tleft:-4px;\n\t\t}\n\n\t\t#tr{\n\t\t\ttop:-4px;\n\t\t\tright:-4px;\n\t\t}\n\n\t\t#bl{\n\t\t\tbottom:-4px;\n\t\t\tleft:-4px;\n\t\t}\n\t\t\n\n\t\t#br{\n\t\t\tbottom:-4px;\n\t\t\tright:-4px;\n\t\t}\n\n\t\t.left_position{\n\t\t\tfont-size: 14px;\n\t\t\tpadding: 3px;\n\t\t\tposition: absolute;\n\t\t\ttop:-40px;\n\t\t\tbackground-color: black;\n\t\t\tcolor:white;\n\t\t}\n\n\t\t.top_position{\n\t\t\tfont-size: 14px;\n\t\t\tpadding: 3px;\n\t\t\tposition: absolute;\n\t\t\ttop:-10px;\n\t\t\tleft:-80px;\n\t\t\tjustify-content: right;\n\t\t\tbackground-color: black;\n\t\t\tcolor:white;\n\t\t}\n\n\t\t.center_position{\n\t\t\tfont-size: 14px;\n\t\t\tpadding: 3px;\n\t\t\tposition: relative;\n\t\t\twidth:80px;\n\t\t\tmargin: auto;\n\t\t\ttop:80px;\n\t\t\tjustify-content: right;\n\t\t\tbackground-color: rgb(20,110,210);\n\t\t\tborder:  2px solid rgb(190,190,190);\n\t\t\tborder-radius: 8px;\n\t\t\tcolor:white;\n\t\t}\n\t</style>\n</scope>\n\n\n";

	var border = "<scope export=\"move_action set_control\"  onpointerdown=\"((grab)())\" style=\"width:100%;height:100%\" element=\"div\" >\n\t<div class=\"centerer\" tabindex=1>\n\t\t<span class=\"left_position\">left: ((posl.toString().slice(0,8)))px</span>\n\t</div>\n\n\t<div class=\"centerer\">\n\t\t<span class=\"top_position\">top: ((post.toString().slice(0,8)))px</span>\n\t</div>\n\n\t<div class=\"test\" badge=\"padding\">\n\t\t<button id=\"tl\" class=\"move_handle\" onpointerdown=((tl_grab)())></button>\n\t\t<button id=\"tr\" class=\"move_handle\" onpointerdown=((tr_grab)())></button>\n\t\t<button id=\"bl\" class=\"move_handle\" onpointerdown=((bl_grab)())></button>\n\t\t<button id=\"br\" class=\"move_handle\" onpointerdown=((br_grab)())></button>\n    </div>\n\n\t<button id=\"move\" onpointerdown=\"((set_control)('./basic.html'))\">test</button>\n\n\t<script on=((grab))>\n\t\tmodel.action = model.actions.MOVE;\n\t\tmodel.boxType = model.types.padding;\n\t\tmodel.edgeType = model.types.edge.all;\n\t\temit.move_action = event;\n\t\treturn false;\n\t</script>\n\n\t<script on=((tl_grab))>\n\t\tmodel.action = model.actions.RESIZEBORDERTL;\n\t\tmodel.boxType = 2;\n\t\tmodel.edgeType = 5;\n\t\temit.move_action = event;\n\t\treturn true;\n\t</script>\n\n\t<script on=((tr_grab))>\n\t\tmodel.action = model.actions.RESIZEBORDERTR;\n\t\tmodel.boxType = 2;\n\t\tmodel.edgeType = 6;\n\t\temit.move_action = event;\n\t\treturn true;\n\t</script>\n\n\t<script on=((bl_grab))>\n\t\tmodel.action = model.actions.RESIZEBORDERBL;\n\t\tmodel.boxType = 2;\n\t\tmodel.edgeType = 9;\n\t\temit.move_action = event;\n\t\treturn true;\n\t</script>\n\n\t<script on=((br_grab))>\n\t\tmodel.action = model.actions.RESIZEBORDERBR;\n\t\tmodel.boxType = 2;\n\t\tmodel.edgeType = 10;\n\t\temit.move_action = event;\n\t\treturn true;\n\t</script>\n\n\n\t<style>\n\t\t.test{\n\t\t\tbackground-color: rgba(255,50,120,0.5);\n\t\t\tposition: absolute;\n\t\t}\n\n\t\t.move_handle{\n\t\t\twidth: 16px;\n\t\t\theight: 16px;\n\t\t\tbackground-color: green;\n  \t\t\tborder-radius: 8px;\n\t\t\tposition: absolute;\n\t\t\tbox-shadow: 1px 1px 5px black;\n\t\t}\n\n\t\t#move{\n\t\t\tposition: absolute;\n\t\t\tleft: 50px;\n\t\t\tposition: absolute;\n\t\t\tz-index: 100;\n\t\t}\n\n\t\t#tl{\n\t\t\ttop:-8px;\n\t\t\tleft:-8px;\n\t\t}\n\n\t\t#tr{\n\t\t\ttop:-8px;\n\t\t\tright:-8px;\n\t\t}\n\n\t\t#bl{\n\t\t\tbottom:-8px;\n\t\t\tleft:-8px;\n\t\t}\n\t\t\n\n\t\t#br{\n\t\t\tbottom:-8px;\n\t\t\tright:-8px;\n\t\t}\n\n\t\t.centerer{\n\t\t\twidth: 100%;\n\t\t\tdisplay: flex;\n  \t\t\talign-items: center;\n  \t\t\tjustify-content: center;\n  \t\t\tpointer-events: auto;\n\t\t}\n\n\t\t.left_position{\n\t\t\tfont-size: 14px;\n\t\t\tpadding: 3px;\n\t\t\tposition: absolute;\n\t\t\ttop:-40px;\n\t\t\tbackground-color: rgb(210,210,210);\n\t\t\tborder:  2px solid rgb(190,190,190);\n\t\t\tborder-radius: 8px;\n\t\t\tcolor:white;\n\t\t}\n\n\t\t.top_position{\n\t\t\tfont-size: 14px;\n\t\t\tpadding: 3px;\n\t\t\tposition: absolute;\n\t\t\ttop:-10px;\n\t\t\tleft:-80px;\n\t\t\tjustify-content: right;\n\t\t\tbackground-color: rgb(210,210,210);\n\t\t\tborder:  2px solid rgb(190,190,190);\n\t\t\tborder-radius: 8px;\n\t\t\tcolor:white;\n\t\t}\n\n\t\t.center_position{\n\t\t\tfont-size: 14px;\n\t\t\tpadding: 3px;\n\t\t\tposition: relative;\n\t\t\twidth:80px;\n\t\t\tmargin: auto;\n\t\t\ttop:80px;\n\t\t\tjustify-content: right;\n\t\t\tbackground-color: rgb(20,110,210);\n\t\t\tborder:  2px solid rgb(190,190,190);\n\t\t\tborder-radius: 8px;\n\t\t\tcolor:white;\n\t\t}\n\t</style>\n</scope>\n\n\n";

	var element_draw = "<w-s export=\"move_action set_control\"  onpointerdown=\"((grab)())\" style=\"width:100%;height:100%\" element=\"div\" >\n</w-s>\n\n\n";

	var selector_list = "\n<scope import=\"selectors\" component=\"selectorlist\">\n\t<container element=\"ul\">\n\t\t((selectors))\n\t\t<scope element=\"div\" draggable=\"true\">\n\t\t\t<div draggable=\"true\" onpointerdown=\"((drag)())\">\n\t\t\t\t((name))\n\t\t\t</div>\n\n\t\t\t<script on=\"((drag))\">\n\t\t\t\tconst system = presets.custom.system;\n\t\t\t\tsystem.ui.manager.dnd.startDrag({selector:model.sel, type:\"css_selector\"},\"<h1>test</h1>\");\n\t\t\t</script>\n\t\t\t<style>\n\t\t\t\tdiv{\n\t\t\t\t\tbackground-color: black;\n\t\t\t\t\tcolor:white;\n\t\t\t\t}\n\t\t\t</style>\n\t\t</scope>\n\t</container>\n</scope>s\n";

	var master_component_string = "<scope element=\"div\" id=\"master\">\n\t<style>\n\t\t#master{\n\t\t\twidth : 100%;\n\t\t\theight: 100%;\n\t\t\toverflow : none;\n\t\t}\n\t\tdiv {\n\t\t\tbackground-color:red\n\t\t}\n\t</style>\t\n</scope>\n";

	var css_color_handler = "<scope class=\"main\" export=\"move_action set_control\"   style=\"width:100%\" element=\"div\" >\n\t<canvas onclick=((clicked)) width=\"20\" height=\"20\" pin=\"canvas\" style=\"display:inline\"></canvas>\n\n\t<script on=((loaded))>\n\t\tthis.ctx = canvas$.getContext(\"2d\");\n\t</script>\n\n\t<script on=((destroying))>\n\t\tsegment.vh = null;\n\t\tsegment.val.innerHTML = \"\";\n\t</script>\n\n\t<script on=((clicked))>\n\t\tsegment.css_val = \"#004400\";\n\t\tsegment.update();\n\t</script>\n\n\t<script on=((value))>\n\t\tthis.ctx.fillStyle = value;\n\t\tthis.ctx.fillRect(0,0,50,50);\n\t</script>\n</scope>\n\n\n";

	var css_length_handler = "<scope class=\"main\" export=\"move_action set_control\"   style=\"width:100%\" element=\"span\" >\n\t((value_output.toString().slice(0, 1000)))((unit)) \n\t<span onpointerdown=((decrease))> dn </span>\n\t<span onpointerdown=((increase))> up </span>\n\n\t<style>\n\t\tspan{\n\t\t\twidth: 20px;\n\t\t\theight: 20px;\n\t\t\tcolor: red;\n\t\t\tpadding: 2px;\n\t\t}\n\t</style>\n\n\t<script on=((destroying))>\n\t\tsegment.vh = null;\n\t\tsegment.val.innerHTML = \"\";\n\t</script>\n\n\t<script on=((increase))>\n\t\tsegment.css_val = value+1+value.unit;\n\t\tsegment.update();\n\t</script>\n\n\t<script on=((decrease))>\n\t\tsegment.css_val = value-1+value.unit;;\n\t\tsegment.update();\n\t</script>\n\n\t<script on=((value))>\n\t\tvalue_output = value;\n\t</script>\n</scope>\n\n\n";

	var css_font_family_handler = "<scope class=\"main\" export=\"move_action set_control\"   style=\"width:100%; font-family:((font_name))\" element=\"div\"  >\n\t\n\t<input value=((font_name)(update_font_name)) pin=head style=\"width: 100%\"/>\n\n\t<script on=((loaded))>\n\t\tconst font = document.createElement(\"link\");\n\t\tfont.href = \"https://fonts.googleapis.com/css?family=Open+Sans&display=swap\";\n\t\tfont.rel = \"stylesheet\";\n\t\t\n\t\tdocument.head.appendChild(font);\n\t</script>\n\n\t<script on=((destroying))>\n\t\tsegment.vh = null;\n\t\tsegment.val.innerHTML = \"\";\n\t</script>\n\n\t<script on=((update_font_name))>\n\t\tlet val = event.target.value;\n\n\t\tif(!val)\n\t\t\treturn;\n\n\t\tval.trim();\n\n\t\tif(val.includes(\" \"))\n\t\t\tval = `\"${val}\"`;\n\n\t\thead$.style.fontFamily = val;\n\t\tsegment.css_val = val;\n\t\tsegment.update();\n\t</script>\n\n\t<script on=((value))>\n\n\t\tlet v = value.trim();\n\n\t\tif(v.charCodeAt(0) == 34 || v.charCodeAt(0) == 39)\n\t\t\tv = v.slice(1,-1);\n\t\t\n\n\t\tfont_name = v;\n\t\t\n\t\thead$.style.fontFamily = v;\n\n\t\t\n\t</script>\n\n\t<style>\n\t\t\n\t</style>\n</scope>\n\n";

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

	const internal = {
	    header_toolbar,
	    general_toolbar,
	    html_toolbar,
	    data_toolbar,
	    js_toolbar,
	    css_toolbar,
	    basic,
	    hover,
	    border,
	    element_draw,
	    selector_list,
	    css_font_family_handler,
	    css_color_handler,
	    css_length_handler
	};
	/**
	 * The Document Manager handles text file operations and text file updating. 
	 */
	class DocumentManager {
	    constructor(env) {
	        this.docs = new Map();
	        this.env = env;
	        this.differ = new DocumentDifferentiator();
	        this.diffs = [];
	        this.diff_step = 0;

	        this.data = {
	            ui: internal
	        };

	        this.pending = null;
	        this.updated = false;
	    }
	    /*
	     * Loads file into project
	     */
	    loadFile(file, NEW_FILE = false) {

	        switch (typeof(file)) {

	            case "string": // Load from file env or DB

	                switch (file) {
	                    case "~edit-canvas": //Load new internal document ~edit-canvas
	                        const canvas = new WickDocument("edit-canvas", "%internal", this.env, false, this);
	                        canvas.fromString(master_component_string, this.env, false);
	                        this.docs.set(canvas.id, canvas);
	                        return canvas.id;
	                }

	                const url = new URL(file);

	                file = {
	                    path: url.dir,
	                    name: url.file
	                };

	                //Intentional fall through. 
	            case "object": //
	                if (file.name && file.path) {
	                    const name = file.name;

	                    let path = file.path;

	                    let type = "";

	                    if (file.type) type = file.type; //.split("/")[1].toLowerCase();

	                    else type = name.split(".").pop().toLowerCase();

	                    if (path.includes(name)) path = path.replace(name, "");

	                    if (path[path.length - 1] == "/" || path[path.length - 1] == "\\") path = path.slice(0, -1);

	                    path = path.replace(/\\/g, "/");

	                    const id = `${path}/${name}`;

	                    if (!this.docs.get(id)) {
	                        let doc;
	                        switch (type) {
	                            case "html":
	                            case "text/html":
	                                doc = new WickDocument(name, path, this.env, NEW_FILE, this);
	                                break;
	                            case "css":
	                            default:
	                                doc = new CSSDocument(name, path, this.env, NEW_FILE, this);
	                        }
	                        this.docs.set(id, doc);


	                        if (file.data)
	                            doc.fromString(file.data);
	                        else {
	                            if (file.path[0] !== "%")
	                                doc.load();
	                        }
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
	                this.env.history.addAction({ type: "doc", diffs });
	        }
	    }

	    undo(action) {
	        const diffs = action.diffs;
	        if (diffs) {
	            for (let i = 0; i < diffs.length; i++) {
	                const pack = diffs[i],
	                    doc = this.docs.get(pack.id);
	                this.differ.revert(doc, pack.diff);
	            }
	        }
	    }

	    redo(action) {

	        const diffs = action.diffs;

	        if (diffs) {
	            for (let i = 0; i < diffs.length; i++) {
	                const pack = diffs[i],
	                    doc = this.docs.get(pack.id);
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
	            this.docs.forEach(doc => {
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
	        let lex = new whind$3(string);
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

	    createInternalCSSDoc(component, css) {
	        const i = Math.round(Math.random() * 100000);

	        if (css.doc)
	            return css.doc;

	        let css_name = `css${i}`;
	        let css_path = `${component.doc_path}/${component.doc_name}#`;
	        let css_doc = new CSSDocument(css_name, css_path, this.env, true, this);
	        css_doc.tree = css;
	        css.doc = css_doc;

	        css.addObserver(css_doc);

	        this.docs.set(`${css_path}${css_name}`, css_doc);

	        return css_doc;
	    }
	}

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
	 * If any object is scheduled to be updated, it will be blocked from scheduling more updates until the next ES VM tick.
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

	        this.callback = ()=>{};


	        if(typeof(window) !== "undefined"){
	            window.addEventListener("load",()=>{
	                this.callback = () => this.update();
	                caller(this.callback);
	            });
	        }else{
	            this.callback = () => this.update();
	        }


	        this.frame_time = perf.now();

	        this.SCHEDULE_PENDING = false;
	    }

	    /**
	     * Given an object that has a _SCHD_ Boolean property, the Scheduler will queue the object and call its .update function 
	     * the following tick. If the object does not have a _SCHD_ property, the Scheduler will persuade the object to have such a property.
	     * 
	     * If there are currently no queued objects when this is called, then the Scheduler will user caller to schedule an update.
	     */
	    queueUpdate(object, timestart = 1, timeend = 0) {

	        if (object._SCHD_ || object._SCHD_ > 0) {
	            if (this.SCHEDULE_PENDING)
	                return;
	            else
	                return caller(this.callback);
	        }

	        object._SCHD_ = ((timestart & 0xFFFF) | ((timeend) << 16));

	        this.update_queue.push(object);

	        if (this._SCHD_)
	            return;

	        this.frame_time = perf.now() | 0;


	        if(!this.SCHEDULE_PENDING){
	            this.SCHEDULE_PENDING = true;
	            caller(this.callback);
	        }
	    }

	    removeFromQueue(object){

	        if(object._SCHD_)
	            for(let i = 0, l = this.update_queue.length; i < l; i++)
	                if(this.update_queue[i] === object){
	                    this.update_queue.splice(i,1);
	                    object._SCHD_ = 0;

	                    if(l == 1)
	                        this.SCHEDULE_PENDING = false;

	                    return;
	                }
	    }

	    /**
	     * Called by the caller function every tick. Calls .update on any object queued for an update. 
	     */
	    update() {

	        this.SCHEDULE_PENDING = false;

	        const uq = this.update_queue;
	        const time = perf.now() | 0;
	        const diff = Math.ceil(time - this.frame_time) | 1;
	        const step_ratio = (diff * 0.06); //  step_ratio of 1 = 16.66666666 or 1000 / 60 for 60 FPS

	        this.frame_time = time;
	        
	        if (this.queue_switch == 0)
	            (this.update_queue = this.update_queue_b, this.queue_switch = 1);
	        else
	            (this.update_queue = this.update_queue_a, this.queue_switch = 0);

	        for (let i = 0, l = uq.length, o = uq[0]; i < l; o = uq[++i]) {
	            let timestart = ((o._SCHD_ & 0xFFFF)) - diff;
	            let timeend = ((o._SCHD_ >> 16) & 0xFFFF);

	            o._SCHD_ = 0;
	            
	            if (timestart > 0) {
	                this.queueUpdate(o, timestart, timeend);
	                continue;
	            }

	            timestart = 0;

	            if (timeend > 0) 
	                this.queueUpdate(o, timestart, timeend - diff);

	            /** 
	                To ensure on code path doesn't block any others, 
	                scheduledUpdate methods are called within a try catch block. 
	                Errors by default are printed to console. 
	            **/
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
	 * Schema for flame_data model
	 */
	//const schemed = wick.model.scheme;

	function flame_scheme(env) {
	    const wick = env.wick;
	    const schemed = wick.model.scheme;

	    const EPOCH_Date = new wick.model.scheme.date.constructor;
	    const EPOCH_Time = new wick.model.scheme.time.constructor;
	    const Longitude = new wick.model.scheme.number.constructor;
	    const Latitude = new wick.model.scheme.number.constructor;
	    const $Number = new wick.model.scheme.number.constructor;
	    const $String = new wick.model.scheme.string.constructor;
	    const $Boolean = new wick.model.scheme.bool.constructor;

	    const n = new (schemed({
	        meta: schemed({
	            last_modified: EPOCH_Time,
	            creation_date: EPOCH_Time,
	        }),
	        preferences: schemed({
	            name: $String,
	            working_directory: $String,
	            temp_directory: $String,
	            proj_data_directory: $String,
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
	    }));
	    
	    return n;
	}

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
			};

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
			};

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
	    Spark is used to issue timed callback for scheduled auto saving.
	*/

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

	        this.setPresets(system);
	        this.setDefaults();
	    }

	    /**
	     * @brief Applies system defaults.
	     */
	    setPresets(env){

	        const system = this.system;

	        this.flame_data = flame_scheme(env);
	        
	        this.presets = system.wick.presets({
	            models: {
	                flame: this.flame_data,
	                settings: this.flame_data.settings,
	            },
	            custom: {
	                actions: system.actions,
	                ui: system.ui.manager,
	                classes: {
	                    textio: TextIO,
	                    textfw: TextFramework,
	                    coloredit: ColorFramework
	                },
	                system
	            }
	        });

	        this.preferences.auto_save_interval = 0;
	        this.preferences.working_directory = system.cwd;
	        this.preferences.proj_data_directory = system.cwd;
	        this.preferences.temp_directory = system.cwd;
	        this.preferences.name = "unnamed";

	        this.scheduleAutoSave();
	    }

	    reset() {
	        this.setPresets();
	        this.setDefaults();
	        this.system.ui.manager.reset();
	        this.system.docs.reset();
	        this.system.history.reset();
	    }

	    scheduledUpdate(frame_time, time_since_last){
	        debugger
	        //this.save(this.preferences.proj_data_directory, this.preferences.name + ".fpd");   
	        this.scheduleAutoSave();
	    }

	    scheduleAutoSave(){
	        spark.removeFromQueue(this);

	        if(this.preferences.auto_save_interval < 1)
	            return;
	        //return;
	        spark.queueUpdate(this, this.preferences.auto_save_interval * 1000 /* interval in milliseconds */ );
	    }

	    loadUIComponents(dir) {

	        if(this.system.TEST_MODE) 
	            return;
	        
	        /*
	        fs.readdir(dir, (e, d) => {
	            if (e)
	                return console.error(`Could not load UI components: ${e}`);

	            d.forEach((fn) => {
	                if (path.extname(fn) == ".html") {
	                    this.system.ui.manager.addComponent(([dir, fn]).join("/"));
	                }
	            });
	        });
	        */
	    }

	    setDefaults() {
	        this.preferences.auto_save_interval = 0;

	        this.meta.creation_date = Date.now();
	        this.defaults.component.width = 360;
	        this.defaults.component.height = 920;
	        this.components.move_type = "relative";
	        this.components.KEEP_UNIQUE = true;

	        //this.loadUIComponents(path.join(process.cwd(), "./assets/ui_components"));
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
	        this.system.ui.manager.load(ui);

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
	        return await this.system.ui.manager.save(file_builder) - off;
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

	const CSS_Rule_Constructor = CSSRule;

	/**
	 *  This module maintains CSS documents and handles the updating of their contents. 
	 */

	//let CSS_Root_Constructor = CSSRootNode;

	function css_Manager(env) {
	    var StyleNode = null,
	        RootNode = null;

	    env.wick("<style></style>").pending.then(comp => {
	        StyleNode = comp.ast.constructor;
	        RootNode = comp.ast.constructor.__proto__;
	    });

	    return new class CSSManager {

	        constructor() {
	            this.css_files = [];
	            this.style_elements = {};
	            this.docs = env.data.docs;
	            this.env = env;
	        }

	        // Returns a list of all selectors that match against the givin compoonent and element
	        getApplicableSelectors(component, element) {
	            const
	                css = component.local_css,
	                selectors = [];

	            for (let i = 0, l = css.length; i < l; i++)
	                for (const sel of css[i].getApplicableSelectors(element))
	                    selectors.push(sel);

	            return selectors;
	        }



	        // Returns an array of CSS rules that match against the element
	        aquireCSS(component, element) {
	            return this.getApplicableSelectors(component, element).map(sel => sel.parent);
	        }

	        createStyleDocument(name) {

	            const id = "./temp.css";
	            this.docs.loadFile({ path: "./", name: "temp.css" }, true);
	            //let doc = this.docs.get(id);
	            debugger;
	        }

	        /**
	         * Returns matching rule that is the most unique to the element. Creates a new rule if one cannot be found. May create a new CSS document if the rule is not found.  
	         * @param  {[type]} element   [description]
	         * @param  {[type]} component [description]
	         * @return {[type]}           [description]
	         */
	        getUnique(component, element) {

	            const IS_WICK_NODE = element instanceof RootNode,
	                css_docs = component.local_css,
	                win = component.window,
	                score_multiplier = 1;

	            let selector = null,
	                best_score = 0;

	            for (let i = 0; i < css_docs.length; i++) {
	                for (const sel of css_docs[i].getApplicableSelectors(element, win)) {

	                    let score = sel.vals.length * -20.5; // The longer the selector is the less likely it will be used

	                    for (const part of sel.vals) {
	                        switch (part.type) {
	                            case "compound":
	                                score += 21 * score_multiplier;
	                                break;
	                            case "complex":
	                                score += 3 * score_multiplier;
	                                switch (part.op) {
	                                    case ">":
	                                        score += 2 * score_multiplier;
	                                        break;
	                                    case "~":
	                                        score += 3 * score_multiplier;
	                                        break;
	                                    case "immediately_preceded":
	                                        score += 3 * score_multiplier;
	                                        break;
	                                    case "+":
	                                        score += 1 * score_multiplier;
	                                        break;
	                                }
	                                break;
	                            case "attrib":
	                                score += 3 * score_multiplier;
	                                break;
	                            case "type":
	                            case "class":
	                                score += 40 * score_multiplier;
	                                break;
	                            case "id":
	                                score += 50 * score_multiplier;
	                                break;
	                            case "pseudo-element":
	                                score += 1 * score_multiplier;
	                                break;
	                            case "pseudo-class":
	                                score += 1 * score_multiplier;
	                                break;
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
	                const tree = css_docs[css_docs.length - 1],
	                    node = IS_WICK_NODE ? element : element.wick_node,
	                    class_name = "n" + ((Math.random() * 10000000) | 0) + "";
	                    
	                const
	                    a = node.attribs,
	                    nclass = ((a.has("class")) ? null : (node.addAttribute("class", "")), a.get("class"));

	                nclass.value += ` ${class_name}`;

	                if (!IS_WICK_NODE)
	                    element.classList.add(class_name);

	                const sheet = parse(`.${class_name}{top:0}`);
	                const stylerule = sheet.ruleset.rules[0];
	                
	                stylerule.properties.delete("top");

	                if (css_docs.length == 0) {
	                    //create new css document. it should be located at the same location as the component. Or at a temp location
	                    component.setLocalStyleSheet(sheet);
	                    return stylerule;
	                } else {
	                    //Enter the rule into the bestfit CSS dataset.
	                    tree.ruleset.rules.push(stylerule);
	                    stylerule.parent = tree.ruleset;
	                    return stylerule;
	                }
	            }

	            return selector.parent;
	        }

	        addFile(css_text, scope, file_id) {
	            const css_file = parse(css_text);
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
	                tree.doc = doc;
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

	            const tree = doc.tree;

	            if (!tree) {
	                doc.tree = new stylesheet();
	                doc.tree.addObserver(doc);
	                doc.bind({ documentReady: (data) => { doc.tree.parse(whind$3(data)); return false } });
	                this.css_files.push(doc.tree);
	            }

	            return new CSSComponent(this.env, tree);
	        }

	        mergeRules(css_rules) {
	            const rule = new stylerule();
	            for (let i = 0; i < css_rules.length; i++)
	                rule.merge(css_rules[i]);
	            return rule;
	        }
	    };
	}

	/** Creates and returns an environment object **/
	function flame_environment (options, wick = null, radiate = null) {

		if(radiate)
			wick = radiate.wick;

		const env = {

			ui : {
				main_view : null,
				ui_view : null,
				wys_view : null,
				windows : [],
				layers : []
			},

			data : {
				docs : null,
			},

			project : null,

			css : Object.assign({},css),

			wick,

			radiate,

			presets: null,

			getCache : (...d) => CacheFactory(...d)
		};

		env.css.manager = css_Manager(env);
		env.data.docs = new DocumentManager(env);
		env.project = new Project(env);
		env.presets = wick.presets({
			custom : {
				actions,
				env,
				css:env.css,
				docs:env.docs,
				project:env.project
			}
		});

		return env;
	}

	/*
		Handles the loading of assets, and integration of Flame system into which ever CandleFW framework is passed to $param_a

		parameters
		1 An object that is the initilizing function of either Wick, Radiate, or Lantern
		2 An object of options properties to customize flame. See available flame [./flame_option_properties](options).

		conform flame.initialization
	*/
	function initializer(cfw_framework, options) {
		switch (cfw_framework.type) {
			case "cfw.wick":
				return initializeWick(cfw_framework, options);
			case "cfw.radiate":
				return initializeRadiate(cfw_framework, options);
			case "cfw.lantern":
			default:
				return initializeLantern(cfw_framework, options);
			// /	console.error("Unrecognized object passed to Flame initializer. Flame accepts [wick] [radiate] or [lantern] initializer objects.");
		}
	}

	function initializeWick(wick, options) {
		const HIDDEN = true;

		const env = flame_environment(options);

		env.wick = wick;

		build_editor_environment(env, document.body, HIDDEN);

		wick_component_integration(wick, env);
	}

	async function initializeRadiate(radiate, options) {
		const HIDDEN = true;

		const style = document.createElement("style");

		style.innerHTML = `
		.flame_component{
			border: 2px solid blue;
		}

		.flame_scope{
			border: 2px solid blue;
		}
	`;

		document.head.appendChild(style);

		/* After radiate loads, prime the editor environement. */

		radiate.loaded = async (presets, router) => {

			const env = flame_environment(options, radiate.wick, radiate);

			wick_component_integration(radiate.wick, env);

			await wick_element_integration(radiate.wick, env);

			build_editor_environment(env, document.body, HIDDEN);
			
			radiate_integrate(env, router, presets);
		};
	}

	function initializeLantern(lantern) {
		debugger;
		//convert the wick export into a flamed version. Define what "Flamed" Means
		//convert the radiate export into a flamed version.
	}


	const r$5 = typeof radiate !== "undefined" ? radiate : null,
		w$4 = typeof wick !== "undefined" ? wick : null;

	if (r$5)
		initializer(r$5, {});
	else if (w$4)
		initializer(w$4, {});

	return initializer;

}());