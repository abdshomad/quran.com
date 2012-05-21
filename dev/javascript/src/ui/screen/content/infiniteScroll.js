(function( Quran, jQuery ) {
	/*
	 * NOTE: Module on hold due to FOUT.
	 * If FOUT can be controlled, implementing module is as simple as:
		jQuery.ajax({
			url:'/en/2/265-286/ajax/scroll', type: 'POST', contentType: 'application/json', data: JSON.stringify({}),
			success: function(result) {
				var corpus = quran.data('corpus');
				jQuery.extend(corpus, result.corpus);
				jQuery('#2_264').after(result.content);
				jQuery(document.body).append('<style type="text/css">'+ result.fonts.css +'</style>');
			}
		});
	 */
	Quran.ui.content.infiniteScroll = function(quran) {
		var self = this;

		jQuery.extend(self, { quran : quran });
	};
	Quran.ui.content.infiniteScroll.prototype = {
	};
})( Quran, jQuery );
