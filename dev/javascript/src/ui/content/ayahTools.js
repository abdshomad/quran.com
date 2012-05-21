// TODO:
// - Rename to accountTools
(function( Quran, jQuery ) {
	Quran.ui.content.ayahTools = function(quran) {
		var self = this;

		jQuery.each(self.include, function(i, module) {
			self[module] = new Quran.ui.content.ayahTools[module](quran);
		});
	};
	Quran.ui.content.ayahTools.prototype = {
		include: ['tags', 'bookmark', 'lastmark', 'share']
	};
})( Quran, jQuery );
