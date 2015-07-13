var CONSTANTS = require('./constants');

/**
 * The point consists of a chromosome and a distance.
 * This object is immutable.
 * 
 */
var Point = function (_chromosome, _pos) {
	this._chromosome = _chromosome;
	this._pos = _pos;
};

/**
 * Create a new point on the same chromosome at offset @difference
 */
Point.prototype.create = function(difference) {
    return new Point(this._chromosome, this._pos + difference);
};

/**
 * Get the Id of the point
 * @returns {String}
 */
Point.prototype.id = function() {
    return this._chromosome + ":" + this._pos;
};

/**
 * Get the Id of the point. NOTE toString doesn't like calling functions (e.g. id() ) across dnode
 * @returns {String}
 */
Point.prototype.toString = function() {
    return "P[" + this._chromosome + ":" + this._pos + "]"; 
};

/**
 * Get the Id of the point
 * @returns {String}
 */
Point.prototype.chromosome = function() {
    return this._chromosome;
};

/**
 * Get the Id of the point
 * @returns {integer}
 */
Point.prototype.pos = function() {
    return this._pos;
};


var comparator = function (a, b) {
	var aIndex = CONSTANTS.CHR_ORDER.indexOf(a._chromosome);
	var bIndex = CONSTANTS.CHR_ORDER.indexOf(b._chromosome);
	var ret = aIndex - bIndex;
	if (ret === 0) {
		ret = a._pos - b._pos;
	}
	return ret;
};


module.exports = Point;
module.exports.comparator = comparator;