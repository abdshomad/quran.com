/*
 * @class Q.Util.DataStore.Cookie
 * @inherits Q.Util.DataStore
 */
Q.Util.DataStore.extend('Q.Util.DataStore.Cookie', {
	defaults: {
		name: 'q-cookie'
	}
}, {
	save: function(obj) {
		var self = this, data = self._super.apply(self, arguments);

		if (obj !== undefined) {
			self.util.clean( data, true );
			return jQuery.cookie(self.options.name, data);
		} else return jQuery.cookie(self.options.name);
	},
});
