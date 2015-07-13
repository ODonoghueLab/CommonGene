/**
 * OrderedMap is a map that is ordered. The map keys are ordered and support a
 * bounded method to find all values within a range.
 */
var OrderedMap = function() {
	var order = [];
	var map = {};
	
	// create a variable on the object so it can be passed across the network through dnode.
	this._order = order;
	this._map = map;
	
	
//	this.clone = function (otherMap) {
//		otherMap._order.forEach(function (key) {
//			var val = otherMap._map[key];
//			if (key.clone) {
//				key = key.clone();
//			}
//			if (val.clone) {
//				val = val.clone();
//			}
//			this._order.push(key);
//			this._map[key] = val;
//		});
//		return 
//	}
	
	/**
	 * add a new key value pair to the map
	 * 
	 * @param key
	 * @param value
	 */
	this.put = function(key, value) {
		map[key] = value;
		var loc = locationOf(key);
		order.splice(loc + 1, 0, key);
	};

	this.putAll = function(otherMap) {
		otherMap.keys().forEach(function(key) {
			if (map[key]) {
				throw 'CLASH in putAll: ' + key + ", for: " + this;
			} else {
				map[key] = otherMap[key];
			}
		});
		order.concat(otherMap.keys());
		order.sort(function(a, b) {
			return b - a;
		});
	};

	/**
	 * Get the last value in the array and return its value in the map
	 */
	this.pop = function() {
		var lastKey = order.pop();
		var lastValue = map[lastKey];
		delete map[lastKey];
		return lastValue;
	}
	
	this.lastValue = function() {
		var lastKey = order[order.length - 1];
		var lastValue = map[lastKey];
		return lastValue;
	}

	/**
	 * Find the location of the given element, recursively. A private method as
	 * it returns the internal array index
	 */
	var locationOf = function(element, start, end) {
		if (order.length === 0 ) {
			return null;
		}
		start = start || 0;
		end = end || order.length;
		var pivot = parseInt(start + (end - start) / 2);
		if (order[pivot] == element) {
			return pivot;
		}
		// console.log('start: ' + start + ', end: ' + end + ', pivot: ' + pivot
		// + '<br>');
		if (end - start <= 1) {
			return order[pivot] > element ? pivot - 1 : pivot;
		}
		if (order[pivot] < element) {
			return locationOf(element, pivot, end);
		} else {
			return locationOf(element, start, pivot);
		}
	};

	/**
	 * Remove the item from the ordered list and map
	 */
	this.remove = function(key) {
		var index = order.indexOf(key);
		var val = map[key];
		if (index > -1) {
			order.splice(index, 1);
			delete map[key];
		} else {
			throw new Error('warning trying to remove item from OrderedMap that does not exist: '
					+ key + ", this: " + this.toString());
		}
		return val;
	};

	/**
	 * Return the size of the data structure by the number of entries
	 */
	this.size = function() {
		return order.length;
	}

	/**
	 * The the item at or below the given element. Return null if there is
	 * nothing below
	 */
	this.equalOrBelow = function(element) {
		var location = locationOf(element);
		if (location < 0) {
			return null;
		} else {
			return order[location];
		}
	}

	this.bounded = function(low, high) {
		var lowIndex = locationOf(low);
		var highIndex = Math.min(locationOf(high), order.length);
		var i;
		var ret = [];
		for (i = lowIndex; i <= highIndex; i++) {
			var val = order[i];
			if (val >= low && val <= high) {
				ret.push(order[i]);
			}
		}
		return ret;
	};

	/**
	 * The a value for a key
	 * 
	 * @param key
	 * @returns
	 */
	this.get = function(key) {
		return map[key];
	};

	this.keys = function() {
		return order;
	};

	this.toString = function() {
		var ret = '{';
		order.forEach(function (key) {
			ret += key + ': ' + map[key] + ", ";
		});
		return ret + '}';
	};
};

module.exports = OrderedMap;