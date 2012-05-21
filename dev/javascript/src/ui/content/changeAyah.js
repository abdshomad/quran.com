(function( Quran, jQuery ) {
	Quran.ui.content.changeAyah = function(quran) {
		var self = this;

		quran.on('load', function(load) {
			self.setup(load.content);
		}, 3, 'changeAyah');
	};
	Quran.ui.content.changeAyah.prototype = {
		setup: function(elem) {
			var self = this;

			elem.each(function() {
				self.init(this);
			});
		},
		init: function(elem) {
			var self = this,
				elem = jQuery(elem),
				key = elem.attr('data-key');

			elem.find('.changeAyah').mousedown(function(event) {
				var me = jQuery(this);

				event.preventDefault();

				if (me.hasClass('disabled'))
					return;

				if (me.hasClass('next'))
					quran.change({ key: key, next: true, anchor: true, force: true }, 'changeAyah');
				else if (me.hasClass('prev'))
					quran.change({ key: key, prev: true, anchor: true, force: true }, 'changeAyah');
			});
		}
	};
})( Quran, jQuery );
