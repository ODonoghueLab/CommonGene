var Range = require('../data/range');
var BasicTable = require('./basicTable');

var RangeTable = function (tableDivName, options) {
	var columns = ['Chr', 'Start', 'End'];
	
	BasicTable.call(this, tableDivName, columns, options);
	
	this.createRow = function(range) {
		return [ range.chromosome(),
			'' + range.lower(),
			'' + range.upper() ];
	};
	
	// no need to overwrite getObjectId as Range has a id() function
};


RangeTable.prototype = Object.create(BasicTable.prototype);
RangeTable.prototype.constructor = RangeTable;

module.exports = RangeTable;