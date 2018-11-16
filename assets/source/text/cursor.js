export class TEXT_CURSOR {
	constructor(text_fw) {

		//On screen HTML representation of cursor
		this.HTML_ELEMENT = null;
		this.HTML_ELEMENT = document.createElement("div");
		this.HTML_ELEMENT.classList.add("txt_cursor");
		

		//Character and Line position of cursor
		this.x = 0;
		this.y = 0;

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
		this.text_fw = text_fw;
		//this.line_container = text_fw.token_container;
		this.char_code = text_fw.curs_char;
		this.selections = [];
		this.line_height = 0;

		//FLAGS
		this.IU = false;
		this.REAL_POSITION_NEEDS_UPDATE = true;
		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;
	}

	toString() {
		this.text_fw.token_container.getRealLine(this.real_position_y).insertText(this.char_code, this.real_position_x);
	}

	get HAS_SELECTION() {
		return (this.selection_x > -1 && this.selection_y > -1);
	}

	set HAS_SELECTION(p) {

	}

	get IN_USE() {
		return this.IU;
	}

	set IN_USE(bool) {
		if (bool !== this.IU) {
			if (bool) {
				this.text_fw.parent_element.appendChild(this.HTML_ELEMENT);
			} else {
				this.text_fw.parent_element.removeChild(this.HTML_ELEMENT);
				this.resetSelection();
				this.REAL_POSITION_NEEDS_UPDATE = true;
				this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;
			}
			this.IU = bool;
		}
	}

	resetSelection() {
		this.selection_x = -1;
		this.selection_y = -1;

		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;

		for (var i = 0; i < this.selections.length; i++) {
			var div = this.selections[i];
			div.hide();
		}
	}

	set size(scale) {

		this.HTML_ELEMENT.style.width = 1 * scale + "px";
		this.HTML_ELEMENT.style.height = this.line_height * scale + "px";
	}

	get id() {
		return this.x | (this.y << 10);
	}

	get lineLength() {
		var line = this.text_fw.token_container.getLine(this.y);
		if (line) {
			return line.length + ((line.IS_LINKED_LINE | 0) - 1)
		} else {
			return 0;
		}
	}

	get lineLength_Select() {
		var line = this.text_fw.token_container.getLine(this.selection_y);
		if (line) {
			return line.length + ((line.IS_LINKED_LINE | 0) - 1)
		} else {
			return 0;
		}
	}

	getXCharOffset(x_in, y_in) {

		var y = (((y_in) * this.text_fw.line_height) - 1),
			x = 0;

		if (this.text_fw.font.IS_MONOSPACE) {
			//Monospace fonts need only add up all charcters and scale by width of any character
			x = (Math.min(x_in, line.length - 1) * this.text_fw.font.props[0].width2);
		} else {
			//Non Monospace fonts will have to build up offset by measuring individual character widths
			var fontData = this.text_fw.font.props;
			var line = this.getLine(y_in);
			if (line) {
				var text = line.renderDOM(true);
				//Cap to end of line to prevent out of bounds reference
				var l = Math.min(x_in, line.length + ((line.IS_LINKED_LINE | 0) - 1));
				for (var i = 0; i < l; i++) {
					var code = text.charCodeAt(i) - 32;
					var char = fontData[code];

					if (code < 0) {
						x += 0;
					} else
						x += char.width;
				}
			}
		}
		return x;
	}

	getRealPosition(x, y) {
		var line = this.line_container.getLine(y);
		var offset_length = 0;

		//Trace linked line chains to their originating location, which is the last non-linked line

		if (line.IS_LINKED_LINE) {
			line = line.prev_line;
			while (line.IS_LINKED_LINE) {
				offset_length += line.cache.length;
				line = line.prev_line;
				y--;
			}
			y--;
			offset_length += line.cache.length;
		}
		return {
			x: offset_length + x,
			y: line.real_index
		};
	}

	updateRealPosition(FORCE) {
		if (this.REAL_POSITION_NEEDS_UPDATE || FORCE) {
			var temp = this.getRealPosition(this.x, this.y)
			this.rpy = temp.y;
			this.rpx = temp.x;
			this.REAL_POSITION_NEEDS_UPDATE = false;
		}
	}

	updateRealSelectPosition(FORCE) {
		if (this.REAL_SELECT_POSITION_NEEDS_UPDATE || FORCE) {
			var temp = this.getRealPosition(this.selection_x, this.selection_y)
			this.rspy = temp.y;
			this.rspx = temp.x;
			this.REAL_SELECT_POSITION_NEEDS_UPDATE = false;
		}
	}

	get real_position_x() {
		this.updateRealPosition();
		return this.rpx;
	}

	set real_position_x(x) {
		var line = this.line_container.getLine(this.y);
		while (line && x > line.cache.length) {
			this.y++;
			x -= line.cache.length;
			line = line.next_line;
			x += ((line.IS_LINKED_LINE | 0) - 1);
		}

		this.x = x;
		this.updateRealPosition(true);
	}



	get real_position_y() {
		this.updateRealPosition();
		return this.rpy;
	}
	set real_position_y(y) {
		this.y = this.line_container.getRealLine(y).index;
		this.updateRealPosition(true);
	}

	//These are for the text selection part of the cursor
	get real_select_position_x() {
		if (this.selection_x < 0) return -1;
		this.updateRealSelectPosition();
		return this.rspx;
	}

	set real_select_position_x(x) {
		var line = this.line_container.getLine(this.selection_y);
		while (line && x > line.cache.length) {
			this.selection_y++;
			x -= line.cache.length;
			line = line.next_line;
			x += ((line.IS_LINKED_LINE | 0) - 1);

		}
		this.selection_x = x;
		this.updateRealSelectPosition(true);
	}

	get real_select_position_y() {
		if (this.selection_y < 0) return -1;
		this.updateRealSelectPosition();
		return this.rspy;
	}
	set real_select_position_y(y) {
		this.selection_y = this.line_container.getRealLine(y).index;
		this.updateRealSelectPosition(true);
	}

	createSelection(y, x_start, x_end, xc, yc, scale) {
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
		this.text_fw.parent_element.appendChild(div);
	}

	getSortedPositions() {
		this.REAL_POSITION_NEEDS_UPDATE = true;
		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;

		var x1 = this.x;
		var y1 = this.y;
		var x2 = this.selection_x;
		var y2 = this.selection_y;
		if (this.selection_x > -1 && this.selection_y > -1) {
			var id1 = this.id;
			var id2 = (this.selection_y << 10) | this.selection_x;

			if (id2 < id1) {
				x1 = this.selection_x;
				y1 = this.selection_y;
				x2 = this.x;
				y2 = this.y;
			}
		}
		return {
			x1, y1, x2, y2
		};
	}

	arrangeSelection() {
		this.REAL_POSITION_NEEDS_UPDATE = true;
		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;

		if (this.HAS_SELECTION) {
			var id1 = this.id;
			var id2 = (this.selection_y << 10) | this.selection_x

			if (id2 < id1) {
				var x1 = this.selection_x;
				var y1 = this.selection_y;
				var x2 = this.x;
				var y2 = this.y;
			} else {
				x1 = this.x;
				y1 = this.y;
				x2 = this.selection_x;
				y2 = this.selection_y;
			}

			this.x = x1;
			this.y = y1;
			this.selection_x = x2;
			this.selection_y = y2;
		}
	}

	getLine(y_in) {
		return this.text_fw.token_container.getIndexedLine(y_in || this.y)
	}

	getYCharOffset(y_in) {
		return (((y_in) * this.text_fw.line_height) - 1)
	}
	//Returns string of concated lines between [x,y] and [x2,y2]. Returns empty string if [x2.selection_y] is less then 0;
	getTextFromSelection() {
		var string = "";
		if (this.HAS_SELECTION) {
			this.selection_index = 0;
			//Sets each tokens selected attribute to true
			var id1 = this.id;
			var id2 = (this.selection_y << 10) | this.selection_x

			if (id2 < id1) {
				var x1 = this.selection_x;
				var y1 = this.selection_y;
				var x2 = this.x
				var y2 = this.y
			} else {
				var x1 = this.x;
				var y1 = this.y;
				var x2 = this.selection_x;
				var y2 = this.selection_y;
			}

			var line_count = y2 - y1;


			//Append first line out of loop. Each successive line will have the newline control character inserted at head of appending string. 
			var line = this.getLine(y1)

			string += line.cache.slice(x1, (line_count > 0) ? line.cache.length : Math.min(x2, line.cache.length));

			for (var i = 1; i < line_count + 1; i++) {
				var x_start = 0;
				var y = y1 + i;
				line = this.getLine(y);
				var length = line.cache.length;
				var x_end = length;

				if (i == line_count) {
					x_end = Math.min(x2, length);
				}

				string += ((line.IS_LINKED_LINE) ? "" : this.text_fw.new_line) + line.cache.slice(x_start, x_end);
			}
		}
		return string;
	}

	update(camera, scale) {
		// todo - correct font data 


		//Set cursor size to mach current zoom level of camera
		this.size = scale;

		this.HTML_ELEMENT.style.left = ((this.getXCharOffset(this.x, this.y))) + "px";

		this.HTML_ELEMENT.style.top = ((this.line_container.getLine(this.y).pixel_offset)) + "px";

		//Update shading for selections

		for (var i = 0; i < this.selections.length; i++) {
				var div = this.selections[i];
				div.hide();
			}
		if (this.HAS_SELECTION) {
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

				this.createSelection(y, x_start, x_end, xc, yc, scale)
			}


		}
	}


	//Sets cursor to line givin pixel coordinates
	setX(x) {
		this.REAL_POSITION_NEEDS_UPDATE = true;

		if (this.text_fw.font.IS_MONOSPACE) {
			this.x = Math.min(Math.max(Math.round(x / this.text_fw.font.props[0].width), 0), this.lineLength);
		} else {
			var fontData = this.text_fw.font.props;
			var line = this.line_container.getLine(this.y);
			var text = line.cache;
			var l = text.length;
			var y = 0;

			var diff = this.y - line.index;
			var offset = 0;
			var i = 0;

			for (; i < l; i++) {
				var code = text.charCodeAt(i) - 32;
				var char = fontData[code];
				y += char.width
				if ((x + 2) < y) {
					break;
				}
			}
			this.x = i;
		}
	}

	setY(y) {
		this.REAL_POSITION_NEEDS_UPDATE = true;
		var line = this.line_container.getLineAtPixelOffset(y);
		this.y = line.index
		this.line_height = line.pixel_height;
	}

	get line_container(){
		return this.text_fw.token_container;
	}


	setSelectionX(x) {
		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;
		if (this.text_fw.font.IS_MONOSPACE) {
			this.selection_x = Math.min(Math.max(Math.round(x / this.text_fw.font.props[0].width), 0), this.lineLength_Select);
		} else {
			var fontData = this.text_fw.font.props;
			var line = this.line_container.getLine(this.selection_y)
			var text = line.cache;
			var l = text.length;
			var y = 0;

			var diff = this.y - line.index
			var offset = 0;
			var i = 0;

			for (; i < l; i++) {
				var code = text.charCodeAt(i) - 32;
				var char = fontData[code];
				y += char.width
				if ((x + 2) < y) {
					break;
				}
			}
			this.selection_x = i;
		}
	}

	setSelectionY(y) {
		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;
		this.selection_y = this.line_container.getLineAtPixelOffset(y).index
	}

	setToSelectionTail() {
		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;
		this.REAL_POSITION_NEEDS_UPDATE = true;

		var id1 = this.id;
		var id2 = (this.selection_y << 10) | this.selection_x

		if (id2 < id1) {
			var x1 = this.selection_x;
			var y1 = this.selection_y;
			var x2 = this.x
			var y2 = this.y
		} else {
			var x1 = this.x;
			var y1 = this.y;
			var x2 = this.selection_x;
			var y2 = this.selection_y;
		}

		this.x = x2;
		this.y = y2

	}

	moveChar(change) {
		this.REAL_POSITION_NEEDS_UPDATE = true;

		var diff = this.x + change;
		
		if (diff < 0) {
			if (this.y <= 0) {
				this.x = 0;
			} else {
				this.y--;
				this.x = this.lineLength;
			}
		} else if (diff > this.lineLength) {
			if (this.y >= this.line_container.height - 1) {
				this.x = this.lineLength;
			} else {
				this.y++;
				this.x = 0;
			}
		} else {
			this.x = diff;
		}
	}

	moveSelectChar(change) {
		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;
		//Need to set selection position to cursor if there is not currently a selection
		if (this.selection_x < 0 || this.selection_y < 0) {
			this.selection_x = this.x;
			this.selection_y = this.y;
		}
		var diff = this.selection_x + change;
		if (diff < 0) {
			if (this.selection_y <= 0) {
				this.selection_x = 0;
			} else {
				this.selection_y--;
				this.selection_x = this.lineLength_Select;
			}
		} else if (diff > this.lineLength_Select) {
			if (this.selection_y >= this.line_container.length - 1) {
				this.selection_x = this.lineLength_Select;
			} else {
				this.selection_y++;
				this.selection_x = 0;
			}
		} else {
			this.selection_x = diff;
		}
	}

	moveLine(change) {
		this.REAL_POSITION_NEEDS_UPDATE = true;

		var diff = this.y + change;
		if (diff <= 0) {
			this.y = 0;
		} else if (diff >= this.line_container.height - 1) {
			this.y = this.line_container.height - 1;
		} else {
			this.y = diff;
		}
	}

	moveSelectLine(change) {
		this.REAL_SELECT_POSITION_NEEDS_UPDATE = true;
		//Need to set selection position to cursor if there is not currently a selection
		if (this.selection_x < 0 || this.selection_y < 0) {
			this.selection_x = this.x;
			this.selection_y = this.y;
		}
		var diff = this.selection_y + change;
		if (diff <= 0) {
			this.selection_y = 0;
		} else if (diff >= this.line_container.height - 1) {
			this.selection_y = this.line_container.height - 1;
		} else {
			this.selection_y = diff;
		}
	}

	charAt() {
		return this.charBefore(this.real_position_x + 1)
	}

	charBefore(x = this.real_position_x) {
		var line = this.text_fw.token_container.getRealLine(this.real_position_y);

		if (x < 0) {
			line = line.prev_sib
			return line.text[line.text.length - 1]
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

	set line_container(e){

	}
};