
var unitSuffix = ["", "0 Mb", " Mb", "00 kb", "0 kb"];
// scale isn't used for level 0
var scaleChart = [0, 10000000, 1000000, 100000, 10000];

/**
 * 
 */
function readableFormat(number, decimalPlaces) {
	decimalPlaces = decimalPlaces  || 0;
	var i;
	var ret = number;
	if (number >= 1000000) {
		if (decimalPlaces >= 3) {
			number /= 1000;
			ret = number.toFixed(decimalPlaces - 3) + " Kb";
		}
		else {
			number /= 1000000;
			ret = number.toFixed(decimalPlaces) + " Mb";
			
		}
	}
	else if (number >= 1000) {
		if (decimalPlaces >= 3) {
			ret = number.toFixed(decimalPlaces - 3) + " b";
		}
		else {
			number /= 1000;
			ret = number.toFixed(decimalPlaces) + " Kb";
		}
	} 
	else {
		ret = number + " b";
	} 
	return ret;
}


var getValue = function  (readable) {
	readable = readable.replace(/m/i, '000000');
	readable = readable.replace(/k/i, '000');
	readable = readable.replace(/b/i, '');
	return parseInt(readable);
}
module.exports.readableFormat = readableFormat;
module.exports.getValueFromReadable = getValue;