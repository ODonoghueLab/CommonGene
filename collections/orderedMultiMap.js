var OrderedMap = require('./orderedMap');

/**
 * OrderedMultiMap is a map that has a list of values.
 * The map keys are ordered and support a search method.
 */
var OrderedMultiMap = function() {
	OrderedMap.call(this);
	
	/**
	 * add a new key value pair to the map
	 * @param key
	 * @param value
	 */
	this.append = function(key, value) {
		var list = this.get(key);
		if (typeof list === 'undefined') {
			this.put(key, [value]);
		}
		else {
			// list already exists
			list.push(value);
		}
	};
	
	this.boundedEntries = function(lower, upper) {
		var keys = this.bounded(lower, upper);
		var ret = {};
		var that = this;
		keys.forEach(function (key) {
			var val = that.get(key);
			ret[key] = val;
//			console.log('key: ' + key + ', val: ' + val + ", ret: " + JSON.stringify(ret));
		});
		return ret;
	};
	
	this.removeValue = function (key, value) {
		try {
		var values = this.remove(key);
		if (typeof values !== 'undefined') {
			
			var index = values.indexOf(value);
			if (index > -1) {
				values.splice(index, 1);
			}
			this.put(key, values);
		}
		}
		catch (e) {
			console.log('could not find: ' + key + ' with value: ' + value  + " in multimap<br>")
		}

	};
	
	this.popValue = function() {
		var ret = null;
		var lastValueArray = this.lastValue();
		while (lastValueArray.length === 0) {
			this.pop();
			console.log('popping empty entry.<br>')
			lastValueArray = this.lastValue();
			if (this.size() === 0 ) {
				return null;
			}
		}
		if (lastValueArray.length === 1) {
			this.pop();
//			console.log('poppin last one');
		}
		ret = lastValueArray.pop();

		if (typeof ret === 'undefined') {
			console.log('ret is undefined. Size of lastValueArray: '  + lastValueArray.length + ', total size : ' + this.size());
		}
		return ret;
	};
};

OrderedMultiMap.prototype = Object.create(OrderedMap.prototype);
OrderedMultiMap.prototype.constructor = OrderedMultiMap;

module.exports = OrderedMultiMap;