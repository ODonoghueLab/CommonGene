var IntervalTree = require('interval-tree');
var Range = require('../data/range');

var IntervalRangeMap = function (chromLength) {
	var itreeChrMap = {};
	
	
	var getITreeMap = function( chr) {
		var itree = itreeChrMap[chr];
		if (typeof itree === 'undefined') {
			var centre = chromLength[chr];
			itree = new IntervalTree(centre); // 300 : the center of the tree
			itreeChrMap[chr] = itree;
		}
		return itree;
	}
	
	/**
	 * @param {Range} new range to add
	 */
	this.add = function (range) {
		getITreeMap(range.chromosome()).add([range.lower(), range.upper(),  range]);
	};

	/**
	 * @param {Range}
	 * @return {Array.Range}
	 */
	this.search = function (rangeOrPoint) {

		var hits = null;
		if (typeof rangeOrPoint.radius === 'undefined') {
			var point = rangeOrPoint;
			hits = getITreeMap(point.chromosome()).search(point.pos());
		}
		else {
			var range = rangeOrPoint;
			hits = getITreeMap(range.chromosome()).search(range.lower(), range.upper());
		}

		var ret = [];
		hits.forEach (function (hit) {
			ret.push(hit.data[2]);
		});
		return ret;
	};
};


module.exports = IntervalRangeMap;

