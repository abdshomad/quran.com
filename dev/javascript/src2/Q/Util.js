/*
 * @class Q.Util
 * @inherits Q
 */
Q.extend('Q.Util', {
	util: {
		copy: function(object) {
			var copy;

			if (typeof object == 'object')
				if (object.length !== undefined)
					copy = [];
				else copy = {};
			else return;

			function get(value) {
				if (typeof value == 'number' || typeof value == 'boolean' || typeof value == 'function') {
					return value;
				} else
				if (typeof value == 'string') {
					if (value.match(/^[\d]+$/))
						return parseInt(value);
					else return value;
				} else
				if (typeof value == 'object') {
					var copy;

					if (value === null)
						copy = null;
					else if (value.length !== undefined)
						copy = [];
					else copy = {};

					for (var key in value)
						copy[key] = get(value[key]);

					return copy;
				}
			};

			for (var key in object)
				copy[key] = get(object[key]);

			return copy;
		},
		clean: function(object, rm_null) {
			var self = this;
			if (typeof object != 'object' || object === null) return;
			self.scrub( object );
			self.rinse( object, rm_null );
			return object;
		},
		scrub: function(object) {
			var self = this;

			if (typeof object == 'number' || typeof object == 'boolean' || typeof object == 'function' || object === null || object === undefined) {
			} else
			if (typeof object == 'string') {
				if (object.match(/^[\d]+$/))
					object = parseInt(object);
				else if (object.match(/^[\d]+\.[\d]+$/))
					object = parseFloat(object);
			} else
			if (typeof object == 'object')
				for (var key in object)
					object[key] = self.scrub( object[key] );

			return object;
		},
		rinse: function(object, rm_null) {
			var self = this;
			if (typeof object != 'object' || object === null) return;
			for (var key in object) {
				var val = object[key];
				if (val === undefined || rm_null && val === null)
					delete object[key];
				else if (typeof val == 'object' && val !== null)
					self.rinse( val, rm_null );
			}

			if (object.length) {
				var saved = [];
				while (object.length) {
					var val = object.shift();
					if (!(val === undefined || rm_null && val === null))
						saved.push(val);
				}
				while (saved.length) {
					var val = saved.shift();
					object.push(val);
				}
			}

			return object;
		},
		sort: function(_object_) {
			var array = [], object = {};
			for (var key in _object_)
				array.push(key);

			array = array.sort(function(a, b) { return a - b; });

			for (var i in array)
				object[array[i]] = _object_[array[i]];

			return object;
		},
		uniq: function(array, sort) {
			if (sort)
				array.sort(typeof sort == 'function' ? sort : undefined);
			var length = array.length;
			var splice = array.splice(0, length);
			var hash = {};
			for (var i = 0; i < length; i++) {
				var val = splice.shift();
				if (!hash[val]) {
					hash[val] = true;
					array.push(val);
				}
			}
			return array;
		}
	}
}, {
	setup: function() {
		var self = this;
		self.util = self.Class.util;
		self._super.apply(self, arguments);
	}
});
