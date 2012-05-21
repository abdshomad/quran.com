(function( Quran, jQuery ) {
	Quran.ui.content.orderAyah = function(quran) {
		var self = this;

		self.z = 286;

		quran.on('load', function(load) {
			self.setup(load.content);
		}, 3, 'orderAyah');
	};
	Quran.ui.content.orderAyah.prototype = {
		setup: function(elem) {
			var self = this;

			elem.each(function() {
				self.init(this);
			});
		},
		init: function(elem) {
			var self = this,
				elem = jQuery(elem);

			elem.css({ 'z-index': self.z-- });
		}
	};
})( Quran, jQuery );
