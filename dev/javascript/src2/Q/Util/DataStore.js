/*
 * @class Q.Util.DataStore
 * @inherits Q.Util
 */
Q.Util.extend('Q.Util.DataStore', {
}, {
	init: function(data) {
		var self = this;
		self.store(self.util.copy(data.base));
	},
	store: function(key, val) {
		var self = this, obj = self, set = false, ret;

		self._data = self.save() || self.save({});

		if (arguments.length >= 2 && (typeof key == 'object' || typeof key == 'function')) {
			var args = jQuery.makeArray(arguments);
			obj = args.shift(), key = args.shift(), val = args.shift();
		}

		if (!obj._data) obj._data = {};

		if (!self.store._data) self.store._data = {};
		if (!self.store._data.ref)
			self.store._data.ref = function(obj, key, val) {
				var keys = self.util.copy(jQuery.grep(key.split(/[.\[\]]/), function(v,i) { return v !== ''; }));
				var ref = obj._data;
				jQuery.each(keys, function(i, _key) {
					if (i + 1 == keys.length) {
						key = _key;
						return false;
					}
					if (ref[_key] === undefined) ref[_key] = {};
					ref = ref[_key];
				});
				if (val !== undefined) ref[key] = val;
				return ref[key];
			};

		if (key !== undefined && val !== undefined) {
			if (/[.\[\]]/.test(key)) {
				val = self.store._data.ref(obj, key, val);
			}
			else obj._data[key] = val;
			ret = val;
			set = obj === self ? true : false;
		}
		else if (key === undefined)
			ret = obj._data;
		else if (val === undefined && typeof key == 'object') {
			ret = jQuery.extend(obj._data, key);
			set = obj === self ? true : false;
		} else
		if (val === undefined && typeof(key) == 'string') {
			if (obj._data[key] !== undefined)
				ret = obj._data[key];
			else if (/[.\[\]]/.test(key)) {
				var data = self.store._data.ref(obj, key);
				if (data !== undefined) ret = data;
				else ret = obj._data[key];
			}
		}
		else ret = obj._data[key];

		if (set) self.save( self._data );

		return ret;
	},
	save: function(obj) {
		var self = this;

		if (obj !== undefined && !obj)
			self._data = null;
		else if (typeof obj == 'object')
			self._data = obj;

		return self._data;
	}
});
