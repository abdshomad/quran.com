(function( Quran, jQuery ) {
	Quran.ui.content.browserHacks = function(quran) {
		var self = this;

		// a brilliant way to hack through cross-browser compatibility with css, alhamdulelah
		var vendors = ['webkit', 'safari', 'opera', 'msie', 'mozilla'];
		jQuery.each(vendors, function(i, vendor) {
			if (jQuery.browser[vendor])
				quran.body.addClass(vendor);
		});


		if (jQuery.browser.msie || jQuery.browser.opera) {
			// fix changeAyah wrap height css issue that applies to msie and opera
			quran.bind('noFOUT', function() {
				self.elem.wrap.each(function() {
					var me = jQuery(this);
					me.height(me.parent().height());
				});
			});
		}
	};
	Quran.ui.content.browserHacks.prototype = {
		elem : {
			wrap : jQuery('#content > div.container > div.quran > table.partition > tbody > tr > td.changeAyah > div.wrap')
		}
	};
})( Quran, jQuery );

