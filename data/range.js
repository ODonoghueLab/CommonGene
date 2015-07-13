var Point = require('./point');
var MINIMUM_LINE_SIZE =  10;

/**
 * Represents a range that is a point (center/midpoint) and a distance (radius) 
 */
var Range = function (childIntersectPoint, radius, name) {
	this.midpoint =  new Point(childIntersectPoint._chromosome, childIntersectPoint._pos);
	this.radius = (radius);
	this.name = name;
	
	if (typeof radius === 'undefined') {
		console.log( new Error().stack);
	}
//	if (typeof childIntersectPoint.pos() === 'undefined') {
//		console.log( new Error().stack);
//	}
};

/**
 * Print a nice representation of the range
 * @returns {String}
 */
Range.prototype.toString = function() {
	return "L[" + this.format() + " ( " + this.radius + ")]"; 
};

/**
 * Print the standard representation of the range
 * @returns {String}
 */
Range.prototype.format = function() {
	return this.midpoint.chromosome() + ":" + this.lower() + "-" + this.upper() + (this.name? " (" + this.name + ")" : ''); 
};

/**
 * ID of the range
 * @returns {String}
 */
Range.prototype.id = function() {
	return (this.name ? this.name + ' ': '') + this.midpoint.id() + "#" + this.radius; 
};

/**
 * clone the range
 * @returns {Range}
 */
Range.prototype.clone = function() {
	return new Range(this.midpoint, this.radius, this.name);
};

Range.prototype.pos = function() {
	return this.midpoint.pos();
}
/**
 * Lower point of the range
 * @returns {Number}
 */
Range.prototype.lower = function() {
	return this.pos() - this.radius; 
};

/**
 * Upper point of the range
 * @returns {Number}
 */
Range.prototype.upper = function() {
	return this.pos() + this.radius; 
};

/**
 * Returns the chromosome the range is located on
 * @returns {String}
 */
Range.prototype.chromosome = function() {
	return this.midpoint.chromosome();
};

/**
 * intersect this range with another to find end segments of the range that are not covered by 'otherRange' 
 * @param otherRange
 * @returns {Array}
 */
Range.prototype.createIntersections = function(otherRange) {
	var ret = [];
	// only create a range if this ranges lower is lower than the existing one (e.g. new low region)
	if (this.upper() > otherRange.lower()) {
		// this only creates if this.lower < otherRange.lower
		var range = createRange(this.chromosome(), this.lower(), otherRange.lower());
		if (range != null) {
			ret.push(range);	
		}
	}
	// only create a range if this ranges higher is higher than the existing one (e.g. new high region)
	if (this.lower() < otherRange.upper()) { 
		range = createRange(this.chromosome(), otherRange.upper(), this.upper() );
		if (range != null) {
			ret.push(range);	
		}
	}
	return ret;
};

/**
 * Determine if the otherRange intersects with this range at any point
 * @param otherRange
 * @returns {Boolean}
 */
Range.prototype.intersects = function(otherRange, orEqual) {
    if (orEqual) {
        return (this.chromosome() === otherRange.chromosome()) && (this.upper() >= otherRange.lower()) && (this.lower() <= otherRange.upper()); 
    }
    else {
        return (this.chromosome() === otherRange.chromosome()) && (this.upper() > otherRange.lower()) && (this.lower() < otherRange.upper()); 
    }
};

/**
 * Determine if the point is contained within the range
 * @param point
 * @returns {Boolean}
 */
Range.prototype.contains = function(point) {
	return (this.chromosome() === point.chromosome()) && this.containsDistance(point.pos()); 
};

/**
 * Determine if the point distance is contained within the range. This assumes it is on the same chromosome.
 * @param point
 * @returns {Boolean}
 */
Range.prototype.containsDistance = function(distance) {
	return (this.upper() > distance) && (this.lower() < distance); 
};


/**
 * find the remaining length of a point to the edge of the range.
 * @param intersectPoint
 * @returns {Number}
 */
Range.prototype.childRadius = function(intersectPointDistance) {
	var childRadius = (this.radius - Math.abs(intersectPointDistance - this.pos()));
//	if (childRadius < 0) {
//		throw 'child radius is out of bounds for ' + intersectPointDistance + ', on range: ' + this;
//	}
	return childRadius;
};

/**
 * create a new child range, based on a intersection.
 * @param childMidpoint
 * @param parentIntersectPoint
 * @returns new child range or null if the range is too small
 */
Range.prototype.createChildRange = function(childMidpoint, parentIntersectPointDistance) {
	var childRadius = this.childRadius(parentIntersectPointDistance);
//	console.log('range create child range: ' + childRadius + '<br>');
	
	if (childRadius > MINIMUM_LINE_SIZE) {
//		console.log('range created child range: ' + childpos() + '<br>');
		return new Range(childMidpoint, childRadius);
	}
	else {
		return null;
	}
};

/**
 * make the range size grow combine both ranges (this and other)
 */
Range.prototype.grow = function(otherRange) {
	if (otherRange.chromosome() !== this.chromosome()) {
		throw 'Trying to grow on different chromosomes!';
	}
	var lower = Math.min(this.lower(), otherRange.lower()); 
	var upper = Math.max(this.upper(), otherRange.upper());
	
	return createRange(this.chromosome(), lower, upper);
}

/**
 * Find the percentage that a point intersects on this range.
 * @param intersectDistance
 * @returns {Number}
 */

Range.prototype.getIntersectPercentage = function(intersectDistance) {
	return (intersectDistance - this.lower()) / (this.radius * 2);
};

/**
 * Check if the current range is surrounded by @otherRange
 */
Range.prototype.surroundedBy = function (otherRange) {
	return this.lower() >= otherRange.lower() && this.higher() <= otherRange.higher();
};

/**
 * Helper method to create a new range. Returns null if the upper < lower
 */
var createRange = function(chr, lower, upper, name) {
	if (upper < lower) {
		// invalid range
		return null;
	}
	var mid = (lower + upper) / 2;
	var radius = (upper - lower) / 2;
	// incase lower was actually higher than upper
	// handle both cases to reduce code elsewhere
	if (chr.indexOf('chr') !== 0) {
	    chr = "chr" + chr;
	}
	return new Range(new Point(chr, mid), radius, name);
};

/**
 * return a new range that is a clone of @existingRange
 */
var clone = function (existingRange) {
	if (existingRange) {
		return new Range(existingRange.midpoint, existingRange.radius, existingRange.name);
	}
	else {
		return null;
	}
};

/**
 * return an array of new ranges parsed from text of format chr:start-end separated by new lines
 */
var parseRanges = function(text) {
	var lines = text.split('\n');
	var ranges = [];
	for ( var i = 0; i < lines.length; i++) {
		var line = lines[i];
		var range = parseRange(line);
		if (range) {
			ranges.push(range);
		}
	}
	return ranges;
};

/**
 * return a new range from text of format chr:start-end
 */
var parseRange = function(text) {
	var range = null;
	var line = text.trim();
	if (line) {
		line = line.replace(/\,/g, '');
		line = line.replace(/\ /g, '');
		// range = range.replace(" ", "");
		colon = line.indexOf(':');
		dash = line.indexOf('-');
		var chr = line.substr(0, colon).trim().toLowerCase();
		var start = null;
		var end = null;
		if (chr.indexOf('chr') === 0) {

			if (colon > -1 && dash > -1) {
				start = parseInt(line.substr(colon + 1, dash), 10);
				end = parseInt(line.substr(dash + 1), 10);
			}
			range = createRange(chr, start, end);
		}
	}
	return range;
};

/**
 * compare between 2 ranges
 */
var comparator = function (a, b) {
	return Point.comparator(a.midpoint, b.midpoint);
}


module.exports = Range;
module.exports.createRange = createRange;
module.exports.parseRanges = parseRanges;
module.exports.parseRange = parseRange;
module.exports.comparator = comparator;
module.exports.clone = clone;