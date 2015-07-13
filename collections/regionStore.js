var OrderedMap = require('./orderedMap');
var Region = require('../data/region.js');
var Range = require('../data/range.js');
var RegionMap = require('./regionMap.js');
/* 
 * A store that holds all range segments 
 * The ranges are stored ordered by chromosome position.
 * */
var RegionStore = function() {
	var chrRegions = {};


	/**
	 * Get the region map for the given ranges chromosome
	 * @param {Range} range
	 * @returns {RegionMap}
	 */
	this.getRegionMap = function (chromsome) {
		var regionMap = chrRegions[chromsome];
		if (regionMap) {} else {
			regionMap = new RegionMap();
			chrRegions[chromsome] = regionMap;
		}
		
		return regionMap;
	};
	
	/**
	 * Check if a new range should be added to the store.
	 * 
	 * @param newRange
	 */
	this.add = function(newRange, callback) {

		var i;
		var that = this;
		
		// temp placeholder for done function, until I can remember how synchronized works.
		
//		synchronized(that, function(done) {

			var regionMap = this.getRegionMap(newRange.chromosome());
			var returnRanges = [];
			var crosses = {};
			// check if the chromosome has been registered at all
			var selectedRegion = null;
			var lower = newRange.lower();
			var upper = newRange.upper();
			
			var regions = regionMap.get(lower , upper);
//				console.log('return ranges: ' + entriesByLowPoint.length + ", boudned by : " + lower + ": " + upper + ", size: " + lowerRegionsOrderedMap.size());
			while (regions.length > 1) {
				var lowerEntry = regions[0];
				var nextEntry = regions[1];
				// the region map is keyed by distance. When merged, the distance will change. So remove it and readd it.
				var i1 = regionMap.size();
				regionMap.remove(lowerEntry);
				var i2 = regionMap.size();
				regionMap.remove(nextEntry);
				var i3 = regionMap.size();
//					console.log("region map size: " + i1 + ", " + i2 + ", " + i3);
				lowerEntry.merge(nextEntry, function (newRegion, retRanges) {
					// replace the old lower region
					regions[0] = newRegion;
					returnRanges = returnRanges.concat(retRanges);
					regionMap.put(newRegion);
					regions.splice(1,1);
				});
//					console.log('return ranges: ' + returnRanges);
				// readd in the lower entry as that is the new merged one
			}
			if (regions.length == 0) {
				selectedRegion = new Region(newRange);
				regionMap.put(selectedRegion);
				returnRanges.push(newRange);
			}
			else {
				// there is only 1 region left
				selectedRegion = regions[0];
				// this region may change, so remove the old one as it is indexed by position.
				regionMap.remove(selectedRegion);

				var newRanges = selectedRegion.addRange(newRange);
				regionMap.put(selectedRegion);
				returnRanges = returnRanges.concat(newRanges);
				crosses = selectedRegion.getCrossedPoints(newRange);
			}
			
			callback(returnRanges, selectedRegion, crosses);
//		});
	};
	/**
	 * @param {Range} range
	 */
	this.isEncompassed = function(range) {
		var regionMap =  this.getRegionMap(range.chromosome());
		return regionMap.isSurrounded(range.lower(), range.upper());
	};

	/**
	 * @returns {Array.<Region>}
	 */
	this.getAllRegions = function() {
		var ret = [];
		var regionMap;
		Object.keys(chrRegions).forEach(function(chr) {
			regionMap = chrRegions[chr];
			var retValue = regionMap.getAllRegions();
			ret = ret.concat(retValue);
		});
		return ret;
	};
	
	this.range = function() {
		var regions = this.getAllRegions();
		var size = 0;
		regions.forEach(function (region) {
			size += region.radius;
		});
		 
		return size;
	};
	
	this.size = function() {
		var regions = this.getAllRegions();
		if (isNaN(regions.length)) {
			console.log('NaN size : ' + JSON.stringify(regions));
		}
		return regions.length;
	};

};

module.exports = RegionStore;