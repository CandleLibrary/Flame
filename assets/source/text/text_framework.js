import {Token_Container} from "./token_container";
import {TEXT_TOKEN} from "./token";
import {TEXT_CURSOR} from "./cursor";
import {Font as TEXT_FONT} from "./font";
import {string_parse_and_format_functions as SPF} from "./parse_and_format_functions";

export class TextFramework {
	constructor(parent_element) {
		this.token_container = new Token_Container();

		this.font_size = 32;
		this.letter_spacing = 0;
		this.line_height = 30;

		this.DOM = document.createElement("div");

		this.parent_element = parent_element || document.body;

		parent_element.appendChild(this.DOM);

		this.font = new TEXT_FONT("Time New Roman");

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
		this.curs_code = 33; // should be 31
		this.curs_char = String.fromCharCode(this.curs_code);

		//Fixed character width for scaling
		this.width = 0;
		this.height = 0;

		this.last_keycode = 0;

		this.SPF = SPF;

		this.token_pool = new TEXT_TOKEN(this);
		this.cursors = [new TEXT_CURSOR(this)];

		this.aquireCursor();
	}

	unload(){
		this.clearCursors();
		//this.parent_element.removeChild(this.DOM);
		this.token_container = null;
		this.DOM = null;
		this.parent_element = null;
		this.font = null;
		this.SPF = null;
		this.token_pool = null;
		this.cursors = null;
	}

	get HAS_SELECTION() {
		for (var i = 0; i < this.cursors.length; i++) {
			if (this.cursors[i].HAS_SELECTION) return true;
		}
		return false;
	}

	get boxHeight() {
		return this.token_container.getHeight();
	}

	clearCursors() {
		for (var i = 0; i < this.cursors.length; i++) {
			this.cursors[i].IN_USE = false;
		}
	}

	updateCursors(camera, scale, x, y) {
		for (var i = 0; i < this.cursors.length; i++) {
			this.cursors[i].update(camera, scale, x, y + 1);
		}
	}

	moveCursorsX(change, SELECT) {
		if (SELECT) {
			for (var i = 0; i < this.cursors.length; i++) {
				if (this.cursors[i].IN_USE) this.cursors[i].moveSelectChar(change);
				if (this.cursors[i].IN_USE) console.log({
					text: this.cursors[i].getTextFromSelection()
				});
			}
		} else {
			for (var i = 0; i < this.cursors.length; i++) {
				if (this.cursors[i].IN_USE) this.cursors[i].moveChar(change);
			}
		}

		this.checkForCursorOverlap();
	}

	moveCursorsY(change, SELECT) {
		if (SELECT) {
			for (var i = 0; i < this.cursors.length; i++) {
				if (this.cursors[i].IN_USE) this.cursors[i].moveSelectLine(change);
			}
		} else {

			for (var i = 0; i < this.cursors.length; i++) {
				if (this.cursors[i].IN_USE) this.cursors[i].moveLine(change);
			}
		}
		this.checkForCursorOverlap();
	}

	checkForCursorOverlap() {
		var cur1 = null,
			cur2 = null;
		for (var i = 0; i < this.cursors.length; i++) {
			cur1 = this.cursors[i];
			if (!cur1.IN_USE) continue
			var id = (cur1.selection_y << 10) | cur1.selection_x;

			for (var j = i + 1; j < this.cursors.length; j++) {
				cur2 = this.cursors[j];
				if (!cur2.IN_USE) continue

				var id2 = (cur2.selection_y << 10) | cur2.selection_x;
				if (cur1.id == cur2.id) {
					debugger
					this.releaseCursor(cur2);
				} else if (cur2.id <= id && id > -1) {
					debugger
					cur1.selection_x = cur2.selection_x;
					cur1.selection_y = cur2.selection_y;
					this.releaseCursor(cur2);
				} else if (id2 > -1 && cur1.id >= id2) {
					debugger
					cur1.x = cur2.x
					cur1.y = cur2.y;
					this.releaseCursor(cur2);
				}
			}
		}
		this.sortCursors();
	}

	sortCursors(){
		for (var i = 0; i < this.cursors.length-1; i++) {
			var 
			cur1 = this.cursors[i],
			cur2 = this.cursors[i+1];
			//move data from cur2 to cur1
			if(!cur1.IU && cur2.IU){
				this.cursors[i] = cur2;
				this.cursors[i+1] = cur1;
			}
		}
	}

	updateLineOffsets(x, y, min_x, min_y, max_x, max_y, scale, camera) {
		var length = this.token_container.length;
		if (length < 1) return;
		var sh = this.line_height / scale;

		if (this.scroll_top > 0) {
			min_y += this.scroll_top / scale;
			max_y += this.scroll_top / scale;
			this.diff_y_min = Math.max(Math.floor(((min_y - (y / scale)) / sh)), 0);
			this.diff_y_max = Math.min(Math.ceil((max_y - (y / scale)) / sh), length);
		} else {
			this.diff_y_min = Math.max(((min_y - (y / 1)) / this.line_height) | 0, 0);
			this.diff_y_max = Math.min(((max_y - (y / 1)) / this.line_height) | 0, length);

			this.pixel_offset = min_y - (y / 1);
			this.pixel_top = Math.max(min_y - (y / 1));
			this.pixel_bottom = Math.max(max_y - (y / 1));
		}
		this.updateCursors(camera, scale, camera.px + x, camera.py + y);
		this.checkForCursorOverlap()
	}

	renderToDOM(scale = 1) {
		this.DOM.innerHTML = "";
		this.DOM.style.fontSize = "200%";
		var text = "<div dna='small_scale_pre'>";
		//get size of space and line
		this.max_length = 0;


		var mh = this.line_height * scale;
		if (scale < 0.4) {
			text = "<div dna='small_scale_pre' top:" + (this.diff_y_min * mh) + "px'>";
			for (var i = this.diff_y_min; i < this.diff_y_max; i++) {
				var line = this.token_container.getIndexedLine(i);
				if (line) {
					var length = line.length;
					if (length > this.max_length) this.max_length = length;
					text += line.renderDOM(true) + "</br>";

				}
			}
		} else {
			var y = (this.pixel_top > -1) ? this.pixel_top : 0;
			var height = this.token_container.pixel_height;
			if (this.token_container.length > 0) {
				var line = this.token_container.getLineAtPixelOffset(y | 0);
				var t = line.pixel_offset;
				var diff = (y > 0) ? t - y : 0;
				var i = 0;
				while (line) {
					i++;
					text += "<span dna='small_scale_pre' style='top: " + ((y + diff) * scale) + "px'>" + line.renderDOM(false) + "</span>";
					y += line.pixel_height;
					t += line.pixel_height;
					var length = line.length;
					if (length > this.max_length) this.max_length = length;
					if (y >= this.pixel_bottom || t >= height) break;
					var line = line.next_line;

				}
			}

		}

		text += "</div>";

		this.DOM.innerHTML = text;
	}

	renderToBuffer(buffer = new Float32Array(52)) {
		this.max_length = 0;

		var offset = 0;
		
		for (var i = this.diff_y_min; i < this.diff_y_max; i++) {
			var line = this.token_container.getIndexedLine(i);
			if (line) {
				var length = line.length;
				if (length > this.max_length) this.max_length = length;
				offset = line.renderToBuffer(buffer, offset);
			}
		}

		return offset;
	}


	updateText(index = 0) {
		var loop_check = 0;
		
		this.releaseAllCursors();
		
		var token = this.token_container.getIndexedLine(index);
		while (token = token.parse()) {
			if (loop_check++ > 1000000) {
				break;
			}
		}
		this.cursors[0].IN_USE = true;
	}

	toString() {
		var i = 0,
			text = "";
		var token = this.token_container.getIndexedLine(0);
		while (token) {
			text += this.new_line + token.cache;
			token = token.next_line;
		}
		return text;
	}

	setIndexes() {
		return;
	}

	//************************
	//POOLS
	releaseAllCursors() {
		for (var i = 0; i < this.cursors.length; i++) {
			var temp = this.cursors[i];
			temp.IN_USE = false;
		}
	}


	releaseCursor(cursor) {
		if (cursor.IN_USE) {
			cursor.IN_USE = false;
		}
	}

	aquireCursor() {
		var temp = null;
		if (this.cursors.length > 0) {
			for (var i = 0; i < this.cursors.length; i++) {
				temp = this.cursors[i];
				if (!temp.IU)
					break
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


	//Releases given token to pool and returns that token's previous sibling.
	releaseToken(token) {
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
			this.token_container.remove(token)
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
	aquireToken(prev_token) {
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

	insertTextAtCursor(char, deletekey) {
		this.insertCharAtCursor(char, deletekey)
	}

	insertCharAtCursor(char, deletekey, index) {
		var l = this.cursors.length;
		var j = 0;

		if (typeof index === "number") {
			l = index + 1;
			j = index;
		}

		for (; j < l; j++) {
			if (this.cursors[j].IN_USE) {
				var cursor = this.cursors[j];
				var select = cursor.getTextFromSelection().length;
				cursor.arrangeSelection();
				cursor.setToSelectionTail();
				var line = cursor.real_position_y;
				var i = cursor.real_position_x;
				var c = char;
				if (select > 0) {
					c = this.del_char.repeat(select) + char
				}
				console.log(c)
				this.token_container.getRealLine(line).insertText(c, i)
				cursor.toString();
				cursor.resetSelection();
			}
		}
	}

	//Inserts token into list of lines after prev_line. Returns new line token
	insertLine(prev_line, new_line) {
		if (!prev_line) {
			new_line.prev_line = new_line;
			new_line.next_line = null;
			new_line.index = 0;
			this.token_container.insert(new_line, 0);
		} else {
			new_line.index = prev_line.index + 1;
			this.token_container.insert(new_line, prev_line.index + 1);
			new_line.next_line = prev_line.next_line;
			if (new_line.next_line) {
				new_line.next_line.prev_line = new_line;
			}
			new_line.prev_line = prev_line;
			prev_line.next_line = new_line;
		}
		this.length++;
		this.setIndexes();
		new_line.IS_NEW_LINE = true;
		return new_line
	}

	releaseLine(line) {
		line.first_token.text = "";
		var line1 = line.prev_sib;
		var line2 = line.next_sib;

		if (line1) {
			line1.next_sib = line2;
		}
		if (line2) {
			line2.prev_sib = line1;
		}

		line.next_sib = this.line_pool;
		line.prev_sib = null;
		this.line_pool = line;

		this.token_container.remove(line);

		this.length--;
		//this.setIndexes();
		line.PROTECT__IN_USE = false;
		return line;
	}


	insertText(text, li = 0, cursor_ind) {
		if ((this.token_container.height | 0) < 1) {
			if (text.charCodeAt(0) !== this.new_line_code) {
				text = this.new_line + text;
			}
			this.insertLine(null, this.aquireToken()).insertText(text, 1);
			this.updateText(0);
		} else {
			this.token_container.getIndexedLine(li).insertText(text, -1, cursor_ind);
		}
	}

	setFont(font) {
		this.font = new TEXT_FONT(font);

		this.DOM.style.fontFamily = font;

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
};