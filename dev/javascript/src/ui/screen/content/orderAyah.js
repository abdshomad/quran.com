(function( Quran, jQuery ) {
	Quran.ui.content.orderAyah = function(quran) {
		var self = this;

		var z_index = self.elem.container.length;
		self.elem.container.each(function() {
			var me = jQuery(this);
			me.css({ 'z-index': z_index-- });
		});
	};
	Quran.ui.content.orderAyah.prototype = {
		elem: {
			container: jQuery('#content > .container')
		}
	};
})( Quran, jQuery );
