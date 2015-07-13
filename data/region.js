var Point = require('./point');
var Range = require('./range');
var OrderedMultiMap = require('../collections/orderedMultiMap');
var MINIMUM_LINE_SIZE =  10;

/**
 * A region is a complex range, that can keep a list of intersection points known as crosses.
 */
var Region = function (range) {
	Range.call(this, range.midpoint, range.radius);
	this.crosses = new OrderedMultiMap();
//	this.ranges = [range];
};

Region.prototype = Object.create(Range.prototype);
Region.prototype.constructor = Region;

/**
 * add an intersection between this region and a child range from a different region.
 * The intersection is known as a cross
 * @param parentIntersectionPoint
 * @param childMidpoint
 */
Region.prototype.addCross = function(parentIntersectionPointDistance, childMidpoint) {
	this.crosses.append(parentIntersectionPointDistance, childMidpoint);
};


/**
 * Get all intersecting cross points, within a given range
 * @param range
 * @returns object of key (distance) to a value (list of child cross points)
 */
Region.prototype.getCrossedPoints = function(range) {
	
	return this.crosses.boundedEntries(range.lower(), range.upper());
};

/**
 * Add a new range to the region
 * 
 */
Region.prototype.addRange = function(newRange) {
	var queryRanges = [];
//		this.ranges.push(range);
	if (newRange.intersects(this)) {
			
		if (this.upper() >= newRange.upper() && this.lower() <= newRange.lower()) {
			// new range is wholey contained
		} else {
			// new range overlaps region
			queryRanges = newRange.createIntersections(this);
//			console.log('OVERLAPPY');
			// The region now grows
			this.union(newRange);
		}
	}
	else {
		throw "new range does not intersect this: " + newrange + ", " + this;
	}
	return queryRanges;

};

/**
 * Increase the size of the region by joining this given range
 */
Region.prototype.union = function(otherRange) {
	var ret = [];
	if (this.upper() < otherRange.lower()) {
		var newRange = new Range (new Point(this.chromosome(), (otherRange.lower() + this.upper()) / 2),  (otherRange.lower() - this.upper()) / 2);
		ret.push(newRange);
	}
	else if (this.lower() > otherRange.upper()) {
		var newRange = new Range (new Point(this.chromosome(), (this.lower() + otherRange.upper()) / 2),  (this.lower() - otherRange.upper()) / 2);
		ret.push(newRange);
	}
	var lowest = Math.min (this.lower(), otherRange.lower());
	var highest = Math.max (this.upper(), otherRange.upper());
	this.radius = (highest - lowest) / 2;
//	console.log('union distance: new : ' + (this.radius + lowest) + ", old: " + this.pos() + "<br>");
	this.midpoint = new Point(this.chromosome(), this.radius + lowest);

	return ret;
};


/**
 * Merge the other region into this region.
 * Increase the size of the region by joining this given range
 * Return list of gap ranges 
 * @param {Region}
 * @param {callback}
 */
Region.prototype.merge = function(otherRegion, unionCallback) {
	var ret = [];
	if (this.upper() < otherRegion.lower()) {
		var newRange = new Range (new Point(this.chromosome(), (otherRegion.lower() + this.upper()) / 2),  (otherRegion.lower() - this.upper()) / 2);
		ret.push(newRange);
	}
	else if (this.lower() > otherRegion.upper()) {
		var newRange = new Range (new Point(this.chromosome(), (this.lower() + otherRegion.upper()) / 2),  (this.lower() - otherRegion.upper()) / 2);
		ret.push(newRange);
	}
	var lowest = Math.min (this.lower(), otherRegion.lower());
	var highest = Math.max (this.upper(), otherRegion.upper());
	var radius = (highest - lowest) / 2;
	var distance = radius + lowest;
	var newRegion = new Region(new Range(new Point(this.chromosome(), distance), radius));
	newRegion.crosses.putAll(this.crosses);
	newRegion.crosses.putAll(otherRegion.crosses);

	unionCallback(newRegion, ret);
};


module.exports = Region;