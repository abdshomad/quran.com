(function( Quran, jQuery ) {
	Quran.ui.content.changeAyah = function(quran) {
		var self = this;
		self.elem.control._mousedown(function(ev) {
			var me = jQuery(this),
				key = me.attr('data-key');
			if (!me.hasClass('disabled')) {
				if (me.hasClass('next')) {
					quran.change({ key: key, next: true, anchor: true, force: true }, 'changeAyah');
				} else
				if (me.hasClass('prev')) {
					quran.change({ key: key, prev: true, anchor: true, force: true }, 'changeAyah');
				}
			}
		});
	};
	Quran.ui.content.changeAyah.prototype = {
		elem: {
			control : jQuery('#content section.quran nav b.change')
		}
	};
})( Quran, jQuery );
