/*
 * @class Q.Controller
 * @inherits jQuery.Controller
 * @requires Q.Util
 */
jQuery.Controller('Q.Controller', {
}, {
	setup: function(element, options) {
		var self = this;
		self._super.apply(self, arguments);
		self.util = Q.Util.util;
		if (self.options.cookie)
			self.cookie = new Q.Util.DataStore.Cookie ({ name: self.options.cookie });
		if (self.options.data)
			self.data = new Q.Util.DataStore ({ base: self.options.data });
	},
	init: function() { // Do not call super here -- deep recursion, dunno why
		var self = this;
	},
	extend: function(object) {
		var self = this;
		jQuery.extend(self, object);
		self._unbind();
		jQuery.each(self.constructor.actions, function(key, val) {
			if (!self[key]) delete self.constructor.actions[key];
		});
		jQuery.each(object, function(key, val) {
			if (/\s/.test(key)) {
				var extension = {};
				extension[key] = self.constructor._action(key, true);
				jQuery.extend(self.constructor.actions, extension);
			}
		});
		self.bind();
	}
});
