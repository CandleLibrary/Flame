//[Singleton]  Store unused tokens, preventing garbage collection of tokens
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

//Token represents a single text unit, which either can be a new line, or any the symbols defined in the token parse and format array object which maintained by the text_fw object
//Special consideration is given to new line tokens, as they are considered the root element for each line. 
export class TEXT_TOKEN {
	constructor(text_fw) {

		this.text_insert = null;

		this.text = "";
		this.style = "";
		this.type = "new_line";
		this.html_cache = "";
		this.CACHED = false;
		this.HTML_CACHED = false;

		this.char_start = 0;
		this.text_fw = text_fw;

		this.prev_sib = null;
		this.next_sib = null;

		//Token as line
		this.next_line = null;
		this.prev_line = null;
		this.IS_NEW_LINE = false;

		//container variables
		this.line_size = 1;
		this.size = 1;
		this.pixel_height = 30;

		this.NEED_PARSE = true;
		this.IS_NEW_LINE = false;
		this.IS_LINKED_LINE = false;
	}

	//Resets vaules to unbiased defaults
	reset() {
		this.pixel_height = 30;
		this.char_start = 0;
		this.next_line = null;
		this.prev_line = null;
		this.prev_sib = null;
		this.next_sib = null;
		this.NEED_PARSE = true;
		this.HTML_CACHED = false;
		this.IS_LINKED_LINE = false;
		this.IS_NEW_LINE = false;
		this.text_insert = null;
		this.type = "";
		this.size = 1;
		this.setText("");
		this.color = "black";
	}

	setText(text) {
		this.text = text;
		this.NEED_PARSE = true;
	}

	//Removes siblings of a new line token and appends their strings to the new line text
	flushTokens(offset) {
		if (!this.IS_NEW_LINE) {
			//Jump to head of line
			if (this.prev_line) {
				return this.prev_line.flushTokens();
			} else {
				//The top most token should always be a new line. If here, something went really wrong
				throw (this)
			}
		}

		var text = this.text;

		var token = this.next_sib;

		var offsets = this.length - 1;

		if (this.IS_LINKED_LINE) {
			while (token && !(token.IS_NEW_LINE)) {
				text += token.text;
				token = this.text_fw.releaseToken(token).next_sib;
			}
		} else {
			while (token && !(token.IS_NEW_LINE && !token.IS_LINKED_LINE)) {
				if (token.IS_LINKED_LINE) {

					//merge texts
					if (token.text_insert) {
						token.setTempTextOffsets(offsets).prev_sib = this.text_insert;
						this.text_insert = token.text_insert;
						token.text_insert = null;
					}

					offsets += token.length;
					text += token.text;
				} else {
					text += token.text;
				}

				token = this.text_fw.releaseToken(token).next_sib;
			}
		}


		this.setText(text);

		return this;
	}

	setTempTextOffsets(offset) {
		var temp = this.text_insert;
		var last = null;
		while (temp) {
			temp.index += offset;
			last = temp;
			temp = temp.prev_sib;
		}
		return last
	}

	mergeLeft() {
		if (!this.IS_NEW_LINE) {
			return this.prev_line.mergeLeft();
		}
		if (!this.prev_line) return;

		if (this.IS_LINKED_LINE) {
			if (this.prev_line.IS_LINKED_LINE) {
				return this.prev_line.mergeLeft();
			} else {
				return this.prev_line.flushTokens();
			}
		}
		this.flushTokens();

		if (this.prev_line === this) {
			return this;
		}

		this.prev_line.flushTokens();

		var text = this.prev_line.text + this.text.slice((this.text[0] === this.text_fw.new_line) | 0);

		this.prev_line.setText(text);

		return this.text_fw.releaseToken(this);
	}

	//Store new inserted text into tempory tokens, whose contents will be merged into the actaul token list when parsed.
	insertText(text, char_pos) {
		var l = this.cache.length
			//Account for new line character

		if (char_pos > l) {
			if (this.next_line) {
				return this.next_line.insertText(text, char_pos - l)
			} else {
				char_pos = this.text.length;
			}
		} else if (char_pos < 0) {
			if (this.prev_line) {
				return this.prev_line.insertText(text, this.prev_line.length - char_pos);
			} else {
				char_pos = 0;
			}
		}
		return this.addTextCell(text, char_pos);
	}

	addTextCell(text, index) {
		var temp = TEXT_POOL.aquire(index, text);
		temp.prev_sib = null;
		var temp_prev = null;
		var temp_next = this.text_insert;

		if (!this.text_insert) {
			this.text_insert = temp;
		} else {
			while (true) {
				if (temp_next) {
					if (temp_next.index <= temp.index) {
						//insert before;
						if (temp_prev) {
							temp.prev_sib = temp_next;
							temp_prev.prev_sib = temp;
						} else {
							temp.prev_sib = temp_next;
							this.text_insert = temp;
						}
						break;
					}
					if (!temp_next.prev_sib) {
						temp_next.prev_sib = temp;
						break;
					}
					temp_prev = temp_next;
					temp_next = temp_prev.prev_sib
				}
			}
		}
		var token = this;
		while (token.IS_LINKED_LINE) {
			token = token.prev_line;
		}

		token.NEED_PARSE = true;
		return token;
	}

	get index() {
		if(!this.IS_NEW_LINE) return this.prev_line.index;
		return this.parent.getLineIndex(0, this);
	}

	set index(e) {
		//this.parent.remove(this);
	}

	get real_index() {
		if(!this.IS_NEW_LINE) return this.prev_line.real_index;
		return this.parent.getRealLineIndex(0, this);
	}

	set real_index(e) {

	}

	get pixel_offset() {
		return this.parent.getPixelOffset(0, this);
	}

	setPixelOffset() {

	}
	//Takes the token text string and breaks it down into individaul pieces, linking resulting tokens into a linked list.
	parse(FORCE) {
		if (!this.NEED_PARSE && !FORCE) return this.next_sib;



		//debugger
		if (this.IS_NEW_LINE) {
			this.flushTokens();
		}

		//CACHE parse functions variables
		var
			SPF = this.text_fw.SPF,
			SPF_length = SPF.length,
			SPF_function = null,
			text_length = 0,
			code = 0,
			token_length = 0,
			text = null,
			temp = null;

		//Reset token type	
		this.type = "generic";

		//This function will change structure of tokens, thus resetting cache.
		this.CACHED = false;
		this.HTML_CACHED = false;
		this.IS_WHITESPACE = false;
		this.NEED_PARSE = false;



		var del_char = this.text_fw.del_char;

		//Walk the temporary text chain and insert strings into the text variable : History is also appended to through here
		if (this.text_insert) {
			//These get added to history

			var fw = this.text_fw

			var i = 0,
				temp = this.text_insert;
			while (temp) {
				var text = temp.text;
				var index = temp.index + 1;
				var prev_sib = temp.prev_sib

				TEXT_POOL.release(temp);

				//add saved text to history object in framework

				//text inserts get seperated as character insertions, delete characters, and cursors

				if (index < this.text.length && index > 0) {
					this.text = this.text.slice(0, index) + text + this.text.slice(index);
				} else if (index > 0) {
					this.text = this.text + text;
				} else {
					this.text = text + this.text;
				}

				temp = prev_sib;
			}

			this.text_insert = null;

			//Perform a lookahead for delete characters
			for (i = 1; i < this.text.length; i++) {
				if (i === 0) continue;
				var s = this.text.charCodeAt(i);
				var f = this.text.charCodeAt(i - 1);
				if (( /*f !== this.text_fw.new_line_code && */ f !== this.text_fw.del_code) && s === this.text_fw.del_code) {					
					if(f === this.text_fw.new_line_code && !this.prev_sib){
						break;
					}


					i--;
					this.text = this.text.slice(0, i) + this.text.slice(i + 2);
					i--;
				}
			}
		}

		//Check for wrapping
		//if (this.char_start > 80 && this.text.charCodeAt(0) !== 28) {
		//	this.text = this.text_fw.linked_line + this.text;
		//}


		text_length = this.text.length;
		text = this.text;
		code = this.text.charCodeAt(0);



		//Check for existence of mismatched new line tokens
		if (this.IS_NEW_LINE && !(code === this.text_fw.new_line_code || code === this.text_fw.linked_line_code)) {
			//Merge back into last line;
			return this.mergeLeft();
		}

		//Default parse functions
		router: switch (code) {
			case this.text_fw.del_code: // Backspace Character
				//reinsert this into the previous line
				//get text of previous sibling
				var prev_sib = this.prev_sib;
				if (prev_sib) {
					//debugger	
					if (prev_sib.IS_NEW_LINE) {

						//Linked lines don't have a length, so the delete character would not be exausted.
						if (!prev_sib.IS_LINKED_LINE) {
							this.text = this.text.slice(1);

							if(!prev_sib.prev_sib){
								return this.mergeLeft();
							}
						}

						//insert into the previous line and flush it
						prev_sib = this.text_fw.releaseToken(prev_sib);

						var prev_line = prev_sib
						
						if (!prev_line.IS_NEW_LINE) {
							prev_line = prev_sib.prev_line;
						}

						var root = prev_sib.prev_line.addTextCell(this.text, prev_line.length + 1);

						this.text_fw.releaseToken(this);

						return root.parse();
					} else {
						this.text = this.text.slice(1);
						prev_sib.setText(prev_sib.text.slice(0, -1) + this.text);
						return this.text_fw.releaseToken(this).parse();
					};
				} else {
					debugger
					this.text = this.text.slice(1);
				}
				break;
			case this.text_fw.linked_line_code: // Carriage Return // Linked Lines for text wrap
				this.size = 0;
				this.pixel_height = 10
				this.IS_LINKED_LINE = true;
				if (!this.IS_NEW_LINE) {
					this.text_fw.insertLine(this.prev_line, this);
				}
				this.text = this.text.slice(1);
				this.char_start = 0;
				token_length = 0;
				break;
			case this.text_fw.new_line_code: // Line Feed
				//this.pixel_height = 30
				this.IS_LINKED_LINE = false
				if (!this.IS_NEW_LINE) {
					this.text_fw.insertLine(this.prev_line, this);
				}
				this.char_start = 0;
				token_length = 1;
				break;
				//Cursor Character - Tells token to move specific cursor to line and character offset
			case this.text_fw.curs_code:
				//Update cursor position;
				var cursor = this.text_fw.aquireCursor();
				if (cursor) {
					cursor.y = this.prev_line.index;
					cursor.x = this.char_start + ((this.prev_line.IS_LINKED_LINE | 0) - 1);
				}
				//Remove cursor section from text
				var text = text.slice(1);
				var prev_sib = this.text_fw.releaseToken(this);
				//Reparse or move on to next token
				if (text.length > 0) { 
					//Reconnect string to the previous token and parse it
					prev_sib.text += text;
					return prev_sib.parse(true);
				} else {
					//Remove this token from linup. It contained only the cursor section and is not needed for any other purpose
					return prev_sib.next_sib;
				}
			default:
				token_length = 1;

				for (i = 0; i < SPF_length; i++) {
					SPF_function = SPF[i];
					let test_index = SPF_function.check(code, text);
					if (test_index > 0) {
						this.type = SPF_function.type;

						for (i = test_index; i < text_length; i++) {
							if (!SPF_function.scanToEnd(text.charCodeAt(i))) {
								token_length = i;
								break router;
							}
						}
						token_length = i;
						break router;
					}
				}
		}


		//If not at end of string, split off last part of string and pass off into new token for further processing
		if (token_length < text_length) {
			temp = this.text_fw.aquireToken(this);
			temp.setText(this.text.slice(token_length, this.text.length));

			//Split happens here
			this.text = this.text.slice(0, token_length);
			temp.char_start = this.char_start + token_length;
		}

		this.token_length = token_length;

		//cache format function for faster testing and executing

		//Format function will apply color and other text formatting attributes for specific type
		if (SPF_function) SPF_function.format(this);

		if (this.prev_line.IS_LINKED_LINE) this.color = "red";


		//Continue down chain of cells
		return this.next_sib;
	}

	charAt(index) {
		//get root line
		if (!this.IS_NEW_LINE) return this.prev_line.charAt(index);

		if (index <= 0) return this.text;
		return this.renderDOM(true, this.text)[index];
	}

	get cache() {
		if (!this.CACHED) {
			this.CACHED = true

			var text = "";
			var token = this.next_sib;

			while (token && !(token.IS_NEW_LINE)) {
				text += token.text;
				token = token.next_sib;
			}

			this.plain_text = text;
		}
		return this.plain_text;
	}
	set cache(p) {

	}


	get length() {
		if (this.IS_NEW_LINE) {
			var token = this.next_sib;
			var length = this.text.length;
			while (token && !token.IS_NEW_LINE) {
				length += token.length;
				token = token.next_sib;
			}
			return length;
		} else return this.text.length;
	}
	set length(p) {

	}


	//Creates, or appends, a string that contains <PRE> enclosed formatted text ready for insertion into the DOM.
	renderDOM(plain_text, text) {
		if (this.IS_NEW_LINE) {
			if (plain_text) {
				return this.cache;
			} else {
				if (!this.HTML_CACHED) {

					this.cached_html = "";

					var token = this.next_sib;

					//Only non New Line tokens will have their strings appended
					while (token && !token.IS_NEW_LINE) {
						this.cached_html += token.renderDOM(plain_text);
						token = token.next_sib;
					}

					this.HTML_CACHED = true
				}
				return this.cached_html;
			}
		} else {
			if (plain_text) {
				return this.text;
			} else {
				if (this.color !== "black") {

					return `<span style="color:${this.color}">${this.text}</span>`;
				}
				return this.text;
			}
		}
	}

	renderToBuffer(buffer, offsets, line) {
		if (this.IS_NEW_LINE) {

			offsets = {
				buffer: offsets,
				line,
				x: 0,
				count: 0
			}

			var token = this.next_sib;
			while (token && !token.IS_NEW_LINE) {
				token.renderToBuffer(buffer, offsets);
				token = token.next_sib;
			}
			return offsets.count;
		} else {
			for (var i = 0; i < this.text.length; i++) {
				//pos x
				var code = this.text.charCodeAt(i);
				var font = this.text_fw.font;
				var index = code - 33;


				//
				// offsets.x += 6
				//position
				buffer[offsets.buffer + 0] = offsets.x
				buffer[offsets.buffer + 1] = 0 //offsets.line
				//texture index
				buffer[offsets.buffer + 2] = code - 33;

				offsets.buffer += 3;

				if (index > 0) {
					if (font.props.length === 94) offsets.x += font.props[code - 33].width * 0.5 + 0.5;
				} else {
					offsets.x += 1;
				}

				offsets.count++;
			}
		}
	}
}