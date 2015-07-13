module.exports = {
		 hue2rgb: function(p, q, t) {
			if (t < 0)
				t += 1;
			if (t > 1)
				t -= 1;
			if (t < 1 / 6)
				return p + (q - p) * 6 * t;
			if (t < 1 / 2)
				return q;
			if (t < 2 / 3)
				return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		},

		/**
		 * Converts an HSL color value to RGB. Conversion formula adapted from
		 * http://en.wikipedia.org/wiki/HSL_color_space. Assumes h, s, and l are
		 * contained in the set [0, 1] and returns r, g, and b in the set [0, 255].
		 * 
		 * @param Number
		 *            h The hue
		 * @param Number
		 *            s The saturation
		 * @param Number
		 *            l The lightness
		 * @return Array The RGB representation
		 */
		 hslToRgb: function(h, s, l) {
			var r, g, b;

			if (s === 0) {
				r = g = b = l; // achromatic
			} else {

				var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
				var p = 2 * l - q;
				r = this.hue2rgb(p, q, h + 1 / 3);
				g = this.hue2rgb(p, q, h);
				b = this.hue2rgb(p, q, h - 1 / 3);
			}
			var rgb = {};
			rgb.r = Math.round(r * 255);
			rgb.g = Math.round(g * 255);
			rgb.b = Math.round(b * 255);
			return rgb;
		},

		rgbToHex: function(rgb) {
			return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16)
							.slice(1);
		},
		hexToRgb: function (hex) {
	    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
	        return r + r + g + g + b + b;
	    });

	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;
		},
		parseRGB: function(rgbString) {
			var ret = {};
		  var rgb = rgbString.split( ',' ) ;
		  ret.r=parseInt( rgb[0].substring(4) ) ; // skip rgb(
		  ret.g=parseInt( rgb[1] ) ; // this is just g
		  ret.b=parseInt( rgb[2] ) ; // parseInt scraps trailing )
		  return ret;
		},
		/**
		 * Converts an RGB color value to HSL. Conversion formula
		 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
		 * Assumes r, g, and b are contained in the set [0, 255] and
		 * returns h, s, and l in the set [0, 1].
		 *
		 * @param   Number  r       The red color value
		 * @param   Number  g       The green color value
		 * @param   Number  b       The blue color value
		 * @return  Array           The HSL representation
		 */
		rgbToHsl: function(r, g, b){
		    r /= 255, g /= 255, b /= 255;
		    var max = Math.max(r, g, b), min = Math.min(r, g, b);
		    var h, s, l = (max + min) / 2;

		    if(max == min){
		        h = s = 0; // achromatic
		    }else{
		        var d = max - min;
		        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		        switch(max){
		            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
		            case g: h = (b - r) / d + 2; break;
		            case b: h = (r - g) / d + 4; break;
		        }
		        h /= 6;
		    }

		    return [h, s, l];
		},
		fadeToWhite: function (color, intensity) {
			var rgb = this.hexToRgb(color);
			var hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
			var scale = (1 - intensity); // * 0.8;
			hsl[2] = (1 - hsl[2]) * scale + hsl[2];
			rgb = this.hslToRgb(hsl[0], hsl[1], hsl[2]);
			return this.rgbToHex(rgb);

		},
		adjustToBrightness: function (color, intensity) {
			var rgb = this.hexToRgb(color);
			var hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
			if (intensity < 0.5) {
				var scale = (intensity / 0.5) * hsl[2];
				hsl[2] = scale + 0.1;
			}
			else {
				hsl[2] = (1 - hsl[2]) * (intensity - 0.5) / 0.5 + hsl[2];
			}
			rgb = this.hslToRgb(hsl[0], hsl[1], hsl[2]);
			return this.rgbToHex(rgb);

		}

};