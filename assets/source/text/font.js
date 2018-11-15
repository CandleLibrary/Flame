//var createSignedDistanceBuffer = require("../vector/research.vector").createSignedDistanceBuffer;

var database = (function() {});

var font_size = 24;
var letter_spacing = 0;


//Object to cache fonts in program;
var existing_fonts = {};

var b_size = 64;
//No need to create multiple canvas elements
var canvas = document.createElement("canvas");
var canvas_size = 1024;
canvas.width = canvas_size;
canvas.height = canvas_size;
var ctx = canvas.getContext("2d");


canvas.style.position = "absolute";
canvas.style.zIndex = 200000;

//Font range UTF8 = 33 - 126 ; 93 Characters


// This dna handless the loading and conversion of HTML fonts into font atlases for consumption by text framework. 
export class Font {
	constructor(font) {
		var font_name = font
		if (existing_fonts[font_name]) return existing_fonts[font_name];

		var num_of_workers = 15;
		this.workers = new Array(num_of_workers);

		this.IS_READY = false;
		this.IS_MONOSPACE = false;

		this.name = font_name;

		this.atlas_start = 32;
		this.atlas_end = 127;

		this.props = new Array(this.atlas_end - this.atlas_start);
		for (var i = 0, l = this.atlas_end - this.atlas_start; i < l; i++) {
			this.props[i] = {};
		}



		existing_fonts[this.name] = this;

		var cache = sessionStorage.getItem(this.name);
		if (cache) {
			cache = JSON.parse(cache);
			this.props = cache.props;
			this.calc_index = Infinity;
			//	this.drawField()
			this.IS_READY = true;
		} else {

			this.calc_index = 0;
			this.finished_index = 0;

			for (var i = 0; i < num_of_workers; i++) {
				this.finished_index++;
				this.calcSection(i);
			}
		}

		this.IS_READY = true;
		this.onComplete();
	}

	onComplete() {

	}

	startCalc() {
		for (var i = 0; i < this.workers.length; i++) 
			this.calcSection(i);
	}

	calcSection(worker_index) {
		var buffer = new Float32Array(b_size * b_size);
		var pos = canvas_size * 0.5;
		var start = this.atlas_start;
		var end = this.atlas_end;
		var length = end - start;
		var i = this.calc_index;
		var fin_i = this.finished_index;
		var font_size = canvas_size * 0.8;

		if (this.calc_index >= length) return;

		canvas.width = canvas_size;
		ctx.font = `${12}px  "${this.name}"`;
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		var char = String.fromCharCode(start + i);
		ctx.fillStyle = "black";
		var width = ctx.measureText(char).width; // * (12/300)

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