//Main dna for containing line tokens
class Container_Cell {
	constructor() {
		this.keys = [];
		this.parent = null;
		this.IS_LEAF = true;
		this.min_degree = 20;
		this.index = 0;
		this.num_lines = 0;
		this.num_real_lines = 0;
		this.pixel_offset = 0;
	}

	getLine(offset) {
		if (this.IS_LEAF) {
			if (offset > this.num_lines) offset = this.num_lines - 1;
			return this.keys[offset];
		} else {
			for (var i = 0, l = this.keys.length; i < l; i++) {
				var cell = this.keys[i];

				if (offset < cell.num_lines) {
					return cell.getLine(offset);
				} else offset -= cell.num_lines;
			}
			return this.keys[this.keys.length - 1].getLine(offset);
		}
	}

	getRealLine(offset) {
		if (this.IS_LEAF) {
			for (let i = 0, l = this.keys.length; i < l; i++) {
				let cell = this.keys[i];

				if (offset < cell.size && cell.size > 0) {
					return cell;
				} else offset -= cell.size;
			}
		} else {
			for (let i = 0, l = this.keys.length; i < l; i++) {
				let cell = this.keys[i];
				if (offset < cell.num_real_lines) {
					return cell.getRealLine(offset);
				} else offset -= cell.num_real_lines;
			}
			return this.keys[this.keys.length - 1].getRealLine(offset);
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

	getRealLineIndex(index, line, id) {
		if (this.IS_LEAF) {
			index = -1; //WTF
			for (let i = 0, l = this.num_lines; i < l; i++) {
				var key = this.keys[i];
				index += key.size;
				if (key === line) break;
			}
		} else {
			var sibs = this.keys;
			let i = id;
			while (i > 0) {
				i--;
				index += sibs[i].num_real_lines;
			}
		}

		if (!this.parent.IS_ROOT) return this.parent.getRealLineIndex(index, null, this.getIndex());


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

	//Remove sibling on right from parent, combine with its keys and discard sibling and update line
	merge(sib, index) {
		this.parent.keys.splice(index, 1);

		this.keys = this.keys.concat(sib.keys);

		this.getLineCount();

		this.setAsParent();

		this.parent.balance();
	}

	//Take an element from the left and place into head of own keys
	leftRotate(sib) {
		var index = sib.keys.length - 1;
		var element = sib.keys[index];
		sib.keys.splice(index, 1);

		this.keys.splice(0, 0, element);

		this.getLineCount();
		sib.getLineCount();
		this.setAsParent();

		this.parent.balance();
	}

	//Take an element from the right and place into tail of own keys
	rightRotate(sib) {
		var index = 0;
		var element = sib.keys[index];

		sib.keys.splice(index, 1);

		this.keys.push(element);

		this.getLineCount();
		sib.getLineCount();
		this.setAsParent();

		this.parent.balance();
	}

	balance() {
		//debugger
		var siblings = this.parent.keys;

		if (this.checkMinLimit()) {

			if (this.parent.IS_ROOT) return;
			//try left rotate
			var id = this.getIndex();

			//Something went horribly wrong if this happened
			if (id < 0) debugger;

			if (id > 0) {
				if (siblings[id - 1].keys.length > this.min_degree) {
					this.leftRotate(siblings[id - 1]);
				}
				siblings[id - 1].merge(this, id);
			} else if (id < siblings.length - 1) {
				if (siblings[id + 1].keys.length > this.min_degree) {
					this.rightRotate(siblings[id + 1]);
				}
				this.merge(siblings[id + 1], id + 1);
			}
		}
	}

	remove(line) {
		for (var i = 0, l = this.keys.length; i < l; i++) {
			if (this.keys[i] === line) {
				this.keys.splice(i, 1);
				this.decrementNumOfLines();
				this.decrementNumOfRealLines(line.size);
				this.decrementPixelOffset(line.pixel_height);
				this.balance();
				return;
			}
		}
	}

	split() {
		var sib = new Container_Cell();

		sib.parent = this.parent;

		sib.IS_LEAF = this.IS_LEAF;

		sib.keys = this.keys.slice(this.min_degree);

		this.keys = this.keys.slice(0, this.min_degree);

		this.getLineCount();
		sib.getLineCount();
		sib.setAsParent();

		return sib;
	}

	insert(line, index) {
		//if leaf, insert line at index position
		if (this.IS_LEAF) {
			line.parent = this;
			this.keys.splice(index, 0, line);
			this.incrementNumOfLines();
			this.incrementNumOfRealLines(line.size);
			this.incrementPixelOffset(line.pixel_height);
		} else {
			for (var i = 0, l = this.keys.length; i < l; i++) {
				var cell = this.keys[i];
				//Check to see if cell needs to be split. 
				if (cell.checkMaxLimit()) {
					//Insert the resulting operation, which transferes half the keys/lines of 
					//current cell into a new cell and returns that new cell, into the current array
					//right after the current cell.
					this.keys.splice(i + 1, 0, cell.split());
					//Increment the length so we don't miss out on the last cell
					l++;
				}
				if (index < cell.num_lines) {
					cell.insert(line, index);

					return;
				} else index -= cell.num_lines;
			}
			//If here then index is greater than number of current lines.
			//Line should be inserted into the last cell anyways, extending the number of lines in the entire tree
			this.keys[this.keys.length - 1].insert(line, Infinity);
		}
	}

	checkMaxLimit() {
		return this.keys.length >= this.min_degree * 2 - 1;
	}

	checkMinLimit() {
		return this.keys.length < this.min_degree;
	}

	getLineCount() {
		var num = 0,
			num2 = 0,
			num3 = 0;
		if (this.IS_LEAF) {
			for (var i = 0, l = this.keys.length; i < l; i++) {
				num += this.keys[i].size;
				num2 += this.keys[i].pixel_height;

			}
			this.num_lines = this.keys.length;
			this.num_real_lines = num;
			this.pixel_offset = num2;
		} else {
			for (var i = 0, l = this.keys.length; i < l; i++) {
				num += this.keys[i].num_lines;
				num2 += this.keys[i].num_real_lines;
				num3 += this.keys[i].pixel_offset;
			}
			this.num_real_lines = num2;
			this.num_lines = num;
			this.pixel_offset = num3;
		}

		return this.num_lines;
	}

	getIndex() {
		var keys = this.parent.keys;
		for (var i = 0, l = keys.length; i < l; i++) {
			if (keys[i] === this) return i;
		}
		return -1;
	}

	setAsParent() {
		for (var i = 0, l = this.keys.length; i < l; i++) {
			this.keys[i].parent = this;
		}
	}

	incrementNumOfRealLines(i) {
		if (i < 1) return;
		this.num_real_lines += i;
		this.parent.incrementNumOfRealLines(i);
	}

	decrementNumOfRealLines(i) {
		if (i < 1) return;
		this.num_real_lines -= i;
		this.parent.decrementNumOfRealLines(i);
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
}



export class Token_Container {
	constructor() {
		this.root = null;
		this.IS_ROOT = true;
		this.num_lines = 0;
		this.num_real_lines = 0;
		this.pixel_height = 0;
	}

	incrementNumOfLines() {
		this.num_lines++;
	}

	decrementNumOfLines() {
		this.num_lines--;
	}

	incrementNumOfRealLines(i) {
		this.num_real_lines += i;
	}

	decrementNumOfRealLines(i) {
		this.num_real_lines -= i;
	}

	incrementPixelOffset(px) {
		this.pixel_height += px;
	}

	decrementPixelOffset(px) {
		this.pixel_height -= px;
	}

	getLine(index) {
		if (index >= this.num_lines) index = this.num_lines - 1;
		return this.root.getLine(index);
	}
	
	getRealLine(index) {
		if (index >= this.num_real_lines) index = this.num_real_lines - 1;
		return this.root.getRealLine(index);
	}

	getLineAtPixelOffset(pixel_height) {
		if (pixel_height >= this.pixel_height) {
			pixel_height = this.pixel_height - 1;
		}

		if(!this.root) return 0;
		return this.root.getLineAtPixelOffset(pixel_height);
	}

	//Transition kludges ****************************
	getIndexedLine(offset) {
		return this.getLine(offset);
	}

	get count() {
		return this.num_lines;
	}

	get countWL() {
		return this.num_lines;
	}
	setIndexes() {}
	getHeight() {
		return this.num_lines;
	}

	get height() {
		return this.num_lines;
	}
	//**********************************************************
	get length() {
		return this.num_lines;
	}

	insert(line, index = Infinity) {
		//If index is not defined, use infinity to ensure that line is placed in the last position;

		var root = this.root;

		if (!root) {
			this.root = new Container_Cell();
			this.root.parent = this;
			this.root.insert(line, index);
		} else {
			if (root.checkMaxLimit()) {
				var new_root = new Container_Cell();

				new_root.parent = this;

				new_root.IS_LEAF = false;

				root.parent = new_root;

				new_root.keys = [root, root.split()];

				root = this.root = new_root;

				root.getLineCount();
			}

			root.insert(line, index);
		}
	}

	remove(line) {
		var cell = line.parent;
		cell.remove(line);
	}
}