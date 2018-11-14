//var createSignedDistanceBuffer = require("../vector/research.vector").createSignedDistanceBuffer;

var database = (function() {});

var font_size = 24;
var letter_spacing = 0;


//Object to cache fonts in program;
var existing_fonts = {};

var b_size = 64;
var sd_distance = 64;

//No need to create multiple canvas elements
var canvas = document.createElement("canvas");
var canvas_size = 1024;
canvas.width = canvas_size;
canvas.height = canvas_size;
var ctx = canvas.getContext("2d");


canvas.style.position = "absolute";
canvas.style.zIndex = 200000;

var signed_canvas = document.createElement("canvas");
var signed_canvas_size = 2048;
signed_canvas.width = signed_canvas_size;
signed_canvas.height = signed_canvas_size;
var ctx_s = signed_canvas.getContext("2d");

var worker_function = function(self) {
	self.onmessage = function(e) {
		var data = e.data;
		var df = new Float32Array(data.buffer1);
		var image = new Uint8Array(data.buffer2);
		createSignedDistanceBuffer(image, e.data.image_size, e.data.image_size, df, e.data.sd_size, e.data.sd_size, e.data.distance);
		self.postMessage({
			buffer1: df.buffer,
			buffer2: image.buffer,
			index: e.data.index
		}, [df.buffer, image.buffer]);
	};

	function createSignedDistanceBuffer(inRGBArray, inWidth, inHeight, outSDArray, outWidth, outHeight, kernal_in) {
		var x_scale = inWidth / outWidth;
		var y_scale = inHeight / outHeight;
		var kernal = kernal_in || 50;
		var lowest_distance_positive = Infinity;
		var highest_distance_positive = -Infinity;
		var lowest_distance_negative = Infinity;
		var highest_distance_negative = -Infinity;
		var min = Math.min;
		var max = Math.max;

		for (var y = 0; y < outHeight; y++) {
			for (var x = 0; x < outWidth; x++) {
				var index = y * outWidth + x;

				var in_x = x * x_scale | 0;
				var in_y = y * y_scale | 0;

				var indexIn = ((in_y * inWidth + in_x) | 0) * 4;

				var sign = inRGBArray[indexIn + 3] > 0 ? 1 : -1;

				var min_distance = (kernal * 0.5) * (kernal * 0.5);
				//Use kernal to scan a box section of inRGBArray and find closest distance
				var boundY = max(in_y - kernal * .5, 0) | 0;
				var boundH = min(boundY + kernal, inHeight) | 0;
				var boundX = max(in_x - kernal * .5, 0) | 0;
				var boundW = min(boundX + kernal, inWidth) | 0;

				for (var v = boundY | 0; v < boundH; v++) {
					for (var u = boundX | 0; u < boundW; u++) {

						if (v === in_y && u === in_x) continue;

						var index_ = (v * inWidth + u) * 4;

						var alpha = inRGBArray[index_ + 3]



						if (sign > 0 && alpha <= 0) {
							var xi = (in_x - u)
							var yi = (in_y - v)
							var distance = (xi * xi + yi * yi);
							min_distance = min(min_distance, distance)
						}

						if (sign < 0 && alpha > 0) {
							var xi = (in_x - u)
							var yi = (in_y - v)
							var distance = (xi * xi + yi * yi);
							min_distance = min(min_distance, distance)
						}
					}
				}
				//debugger

				min_distance = Math.sqrt(min_distance) * sign

				outSDArray[index] = min_distance;

				if (sign > 0) {
					highest_distance_positive = max(highest_distance_positive, min_distance)
					lowest_distance_positive = min(lowest_distance_positive, min_distance)
				} else {
					highest_distance_negative = max(highest_distance_negative, min_distance)
					lowest_distance_negative = min(lowest_distance_negative, min_distance)
				}
			}
		}
		//return
		//normalize in range 0 > 1;
		//debugger

		var scale_nagative = 1 / (highest_distance_negative - lowest_distance_negative);
		var scale_positive = 1 / (highest_distance_positive - lowest_distance_positive);

		var scale = 1 / (highest_distance_positive - lowest_distance_negative)

		var offset_negative = 0 - lowest_distance_negative;
		var offset_positive = 0 - lowest_distance_positive;

		var kernal_inv_halved = (1 / kernal_in) * 0.5

		for (var i = 0, l = outWidth * outHeight; i < l; i++) {
			//outSDArray[i] = ((outSDArray[i] + offset_negative) * scale);
			//continue

			if (outSDArray[i] <= 0) {
				outSDArray[i] = ((outSDArray[i] + offset_negative) * scale_nagative) * 0.5
				//outSDArray[i] =(Math.max(outSDArray[i] + kernal_in, 0) * kernal_inv_halved);
			} else {
				outSDArray[i] = ((outSDArray[i] + offset_positive) * scale_positive) * 0.5 + 0.5;
			}
		}
	}

}

var worker_blob = new Blob([`(${worker_function.toString()})(self)`]);
var worker_url = window.URL.createObjectURL(worker_blob);

//Font range UTF8 = 33 - 126 ; 93 Characters

/*Database functions*/

var db_handler = null;
var db = null;

var request = indexedDB.open("font_signed_distance_maps", 2);

request.onsuccess = (e) => {
	return
	db = request.result;
	db_handler = db.transaction(["distance_maps"], "readwrite");
	console.log(db_handler)


}

request.onupgradeneeded = function(event) {
	return
	console.log("Sd")
	var d = db.createObjectStore("distance_maps");
	d.onsuccess = function(e) {
		console.log("Sd")


	}
};

// This dna handless the loading and conversion of HTML fonts into font atlases for consumption by text framework. 
export class Font {
	constructor(font) {
		var font_name = font
		if (existing_fonts[font_name]) return existing_fonts[font_name];

		var num_of_workers = 15;
		this.workers = new Array(num_of_workers)

		this.IS_READY = false;
		this.IS_MONOSPACE = false;

		this.name = font_name;

		this.atlas_start = 32;
		this.atlas_end = 127;

		this.signed_field = new Uint8Array(640 * 640);

		this.props = new Array(this.atlas_end - this.atlas_start);
		for (var i = 0, l = this.atlas_end - this.atlas_start; i < l; i++) {
			this.props[i] = {};
		}



		existing_fonts[this.name] = this;

		var cache = sessionStorage.getItem(this.name)
		if (cache) {
			cache = JSON.parse(cache)
			this.signed_field = new Uint8Array(cache.field);
			this.props = cache.props;
			this.calc_index = Infinity;
			//	this.drawField()
			this.IS_READY = true;
		} else {

			this.calc_index = 0;
			this.finished_index = 0;

			for (var i = 0; i < num_of_workers; i++) {
				/*var worker = new Worker(worker_url)
				this.workers[i] = worker;
				worker.onmessage = ((index) => {			
					return (e) =>{
					//place into texture array
					var buffer = new Float32Array(e.data.buffer1)
					var i = e.data.index;

					for (var y = 0; y < b_size; y++) {
						for (var x = 0; x < b_size; x++) {
							var index1 = b_size * y + x
							var index2 = 640 * y + x + ((i % 10) * b_size) + (Math.floor(i / 10) * 640 * 64);
							this.signed_field[index2] = (buffer[index1] * 255);
						}
					}

					this.finished_index++;

					this.calcSection(index);
					}

				})(i)*/
				this.finished_index++;
				this.calcSection(i);
			}


		}
		/*if (db && db_handler) {

			var db_handler = db.transaction(["distance_maps"], "readwrite");
			console.log(db_handler.objectStore("elephants").get(this.name));

			//ths.IS_READY = true;
			//this.onComplete();
		}*/
		console.table(this)
		this.IS_READY = true;
		this.onComplete();





		//
		//debugger
	}

	onComplete() {

	}

	drawField() {
		canvas_size = 1024;
		canvas.width = canvas_size;
		canvas.height = canvas_size;
		var image = ctx.getImageData(0, 0, canvas_size, canvas_size)
		var d = image.data;

		for (var i = 0; i < 640; i++) {
			for (var j = 0; j < 640; j++) {
				var index1 = 640 * i + j;
				var index2 = canvas_size * i + j;

				d[index2 * 4 + 0] = this.signed_field[index1];
				d[index2 * 4 + 1] = this.signed_field[index1];
				d[index2 * 4 + 2] = this.signed_field[index1];
				d[index2 * 4 + 3] = 255;
			}
		}


		ctx.putImageData(image, 0, 0)

		this.calculateMonospace(this.name)
		//document.body.appendChild(canvas)

	}
	startCalc() {
		for (var i = 0; i < this.workers.length; i++) {
			this.calcSection(i)
		}
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

		if (fin_i >= length) {
			this.drawField();

			if (db) {
				var db_handler = db.transaction(["distance_maps"], "readwrite");
				db_handler.objectStore("distance_maps").put(this.signed_field, this.name);

			}

			//sessionStorage.setItem(this.name, JSON.stringify({field:Array.prototype.slice.call(this.signed_field),props:this.props}));

			this.onComplete();
			return
		}

		if (this.calc_index >= length) return;

		canvas.width = canvas_size;
		ctx.font = `${font_size}px  "${this.name}"`;
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		var char = String.fromCharCode(start + i);
		ctx.fillStyle = "black";
		var width = ctx.measureText(char).width; // * (12/300)

		this.props[i] = {
			char: char,
			code: start + i,
			width: width * (12 / font_size),
			width2: width * (12 / font_size),
			ratio: width / font_size
		};

		ctx.fillText(char, pos, pos);

		var image = ctx.getImageData(0, 0, canvas_size, canvas_size);
		this.calc_index++;

		this.calcSection(i);
		/*this.workers[worker_index].postMessage({
			buffer1: buffer.buffer,
			buffer2: image.data.buffer,
			image_size: canvas_size,
			sd_size: b_size,
			distance: sd_distance,
			index: i
		}, [buffer.buffer, image.data.buffer])*/
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
		DIV.style.position = "fixed"
		DIV.innerHTML = "A";

		var IS_MONOSPACE = true;
		var last_width = 0;
		var width = 0;

		document.body.appendChild(DIV);

		last_width = DIV.getBoundingClientRect().width;

		for (var i = this.atlas_start, d = 0; i < this.atlas_end; i++, d++) {
			var char = String.fromCharCode(i)
			DIV.innerHTML = char;
			console.log(DIV.getClientRects())
			width = DIV.getBoundingClientRect().width;
			this.props[i - this.atlas_start].width = width
			if (last_width !== width) {
				IS_MONOSPACE = false;
			}
		}

		document.body.removeChild(DIV);

		this.IS_MONOSPACE = IS_MONOSPACE
	}
}