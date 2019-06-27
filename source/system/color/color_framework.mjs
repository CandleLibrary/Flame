export class ColorFramework {
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