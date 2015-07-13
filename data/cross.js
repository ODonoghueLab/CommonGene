var Point = require('./point');
var Range = require('./range');

/**
 * Represents a range that is a point (center/midpoint) and a distance (radius) 
 */
var Cross = function (parentRange, childRange, parentIntersectDistance) {
	this.parentRange =  parentRange;
	this.childRange = childRange;
};
