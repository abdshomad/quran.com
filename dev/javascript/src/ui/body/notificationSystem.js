(function( Quran, jQuery ) {
	Quran.ui.body.notificationSystem = function(quran) {
		var self = this;

		quran.window.load(function() {
			self.init();
		});
	};
	Quran.ui.body.notificationSystem.prototype = {
		elem : {
			notificationSystem : jQuery('#body > div.notificationSystem')
		},
		init : function() {
			var self = this;
			self.elem.notificationSystem.notification();
		},
		message : function(content, options) {
			var self = this;
			self.elem.notificationSystem.notification('create', content, options);
		}
	};
})( Quran, jQuery );
