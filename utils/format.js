


module.exports.sciFormat = function (number, places) {
	var decimalPlaces = places || 2;
	if (typeof number === 'number') {
		number = number.toExponential(decimalPlaces);
	}
	return number.replace(/e(.*)$/," &times <nobr>10<sup>$1</sup></nobr>");
}
