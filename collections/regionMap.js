var Range = require('../data/range');
var OrderedMap = require('./orderedMap');
/**
 * RegionMap is a map that is can find other regions within a start and end. These regions do NOT overlap.
 */
var RegionMap = function() {
	
	var lowerBoundMap = new OrderedMap();

	this.clone = function (otherMap) {
		lowerBoundMap = otherMap
	}
	/**
	 * add a new key value pair to the map
	 * 
	 * @param key
	 * @param value
	 */
	this.put = function(range) {
		lowerBoundMap.put(range.lower(), range);
//		console.log('adding map : ' + range);
		return this;
	};

	/**
	 * Get all the regions between lower and upper
	 */
	this.get = function(lower, upper) {

		// just check the lowers, and the next one below
		ret = [];
		var lowers = lowerBoundMap.bounded(lower, upper);
		lowers.forEach(function (lower) {
			ret.push(lowerBoundMap.get(lower));
		});
		var nextLowest = lowerBoundMap.equalOrBelow(lower - 1);
		if (nextLowest !== null) {
//			console.log('next lowest: ' + nextLowest + ", lower: " + lower + ", map: "+ lowerBoundMap + "<br>");
			var nextLowestRange = lowerBoundMap.get(nextLowest);
			if (nextLowestRange != null && nextLowestRange.upper() >= lower) {
				ret.push(nextLowestRange);
			}
		}
//		console.log('getting all  map : ' + ret + '<br>');
//		console.log('getting all  bound map : ' + lowerBoundMap + '<br>');

		return ret;
	};
	
	this.isSurrounded = function (lower, upper) {
		var ret = false;
		var nextLowest = lowerBoundMap.equalOrBelow(lower);
		if (nextLowest !== null) {
			var nextLowestRange = lowerBoundMap.get(nextLowest);
			if (typeof nextLowestRange !== 'undefined') {
				if (nextLowestRange.lower() <= lower && nextLowestRange.upper() >= upper) {
					ret = true;
				}
			}
		}
		return ret;
	};
	
	this.remove = function(range) {
//		console.log('removing map : ' + range);
		lowerBoundMap.remove(range.lower());
	};

	this.toString = function() {
		return "RegionMap: " + lowerBoundMap;
	};
	
	this.size = function () {
		return lowerBoundMap.size();
	};
	
	this.getAllRegions = function() {
		var ret = [];
		lowerBoundMap.keys().forEach(function (key) {
			ret.push(lowerBoundMap.get(key));
		});
		return ret;
	};
};

module.exports = RegionMap;