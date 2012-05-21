/*
 * @class Q
 */
jQuery.Class('Q', {
}, {
	setup: function(options) {
		var self = this;
		self.options = jQuery.extend({}, self.Class.defaults, options);
	}
});
