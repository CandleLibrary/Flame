export class Generator{
	constructor(){
		this.fontSize();
		this.font = null;
        this.font_size = 32;
        this.letter_spacing = 0;
        this.IS_MONOSPACE = false;
	}

	parse(fw, offset){
		let gen = fw.getLines()
	}

	_parseHook_(){

	}

	getLineHeight(line){
		return 30;
	}

	scanToX(x,y,fw){
		var y = (((y_in) * this.text_fw.line_height) - 1),
			x = 0, font_data = this.font.props;

		if (IS_MONOSPACE) {
			//Monospace fonts need only add up all charcters and scale by width of any character
			x = (Math.min(x_in, line.length - 1) * font_data[0].width2);
		} else {
			//Non Monospace fonts will have to build up offset by measuring individual character widths
			var line = fw.getLine(y_in);
			if (line) {
				var text = line.cache;
				//Cap to end of line to prevent out of bounds reference
				var l = Math.min(x_in, line.length + ((line.IS_LINKED_LINE | 0) - 1));
				for (var i = 0; i < l; i++) {
					var code = text.charCodeAt(i) - 32;
					var char = font_data[code];

					if (code < 0) {
						x += 0;
					} else
						x += char.width;
				}
			}
		}
		return x;
	}
}