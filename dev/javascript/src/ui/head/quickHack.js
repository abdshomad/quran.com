(function( Quran, jQuery ) {
	Quran.ui.head.quickHack = function(quran) {
		var self = this,
			account = quran.data('account'),
			lastmark = account && account.lastmark ? account.lastmark : null;

		quran.window.load(function() {
			self.elem = {
				account: jQuery('#account'),
				lastmark: jQuery('<span class="lastmark hidden"><a>Lastmark</a></span>'),
				sep: jQuery('<a class="sep hidden">')
			};

			self.elem.account.append(self.elem.sep).append(self.elem.lastmark);

			if (lastmark) {
				self.elem.lastmark.data({ lastmark: lastmark });

				self.elem.lastmark.click(function() {
					var me = jQuery(this),
						data = me.data('lastmark'),
						part = data.key.split(/:/),
						url = '/'+ quran.data('language').language_code +'/'+ part[0] + data.context.range +'/#'+ part[1] + data.context.state,
						this_path = url.replace(/#.*$/, '').replace(/\/$/,'').replace(/^\/[^\/]+/,''),
						that_path = window.location.pathname.replace(/\/$/,'').replace(/^\/[^\/]+/,'');

					if (this_path == that_path)
						window.location.replace(url);
					else
						window.location.assign(url);
				});

				self.show_lastmark();
			}

		});

		self.show_lastmark = function() {
			if (self.elem.lastmark.is(':hidden')) {
				self.elem.sep.removeClass('hidden');
				self.elem.lastmark.removeClass('hidden');
			}
		};

		self.hide_lastmark = function() {
			if (self.elem.lastmark.is(':visible')) {
				self.elem.sep.addClass('hidden');
				self.elem.lastmark.addClass('hidden');
			}
		};

		self.update_lastmark = function(data) {
			console.debug('update lastmark');
			delete data.action;
			self.elem.lastmark.data({ lastmark: data });
			self.show_lastmark();
		};

		self.delete_lastmark = function(data) {
			delete data.action;
			self.elem.lastmark.data({ lastmark: null });
			self.hide_lastmark();
		};

		quran.on('ayahTools:lastmark:created', self.update_lastmark);
		quran.on('ayahTools:lastmark:updated', self.update_lastmark);
		quran.on('ayahTools:lastmark:deleted', self.delete_lastmark);
	};
})( Quran, jQuery );
