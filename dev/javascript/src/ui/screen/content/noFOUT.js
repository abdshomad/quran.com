(function( Quran, jQuery ) {
	Quran.ui.content.noFOUT = function(quran) {
		var self = this;

		jQuery.each(quran.data('pages'), function(i, page) {
			self.pages[page] = {};
		});

		quran.window.load(function() {
			if (quran.session('content.quran.words'))
				self.check();
		});
	};
	Quran.ui.content.noFOUT.prototype = {
		 elem : {
			content : jQuery('#content')
		},
		pages : {},
		ready : false,
		check : function() {
			//console.time('noFOUT check');
			var self = this;

			jQuery.each(self.pages, function(n, page) {
				page.elem = jQuery('<span class="sans">&#xfb51;abc&nbsp;&#xfb52;</span>');
				page.elem.css({
					'font-size' : '20em',
					'visibility' : 'hidden',
					'position' : 'absolute',
					'bottom' : '0',
					'left' : '-10000px',
				});
				quran.body.append(page.elem);
				page.ready = false;
				page.start = page.elem.width();
				page.elem.switchClass('sans', 'p'+ page);
			});

			jQuery.each(self.pages, function(n, page) {
				page.interval = setInterval(function() {
					page.end = page.elem.width();
					if (page.end != page.start) {
						clearInterval(page.interval);
						page.elem.remove();
						page.ready = true;
						self.ready = true;
						jQuery.each(self.pages, function(n, page) {
							if (!page.ready) {
								self.ready = false;
								return false;
							}
						});
						if (self.ready) {
							quran.trigger('noFOUT');
							self.elem.content.addClass('noFOUT');
						}
					}
				}, 100);
			});
			//console.timeEnd('noFOUT check');

		}
	};
})( Quran, jQuery );
