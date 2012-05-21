(function( Quran, jQuery ) {
	Quran.ui.scrollKeys = function(q) {
		var self = this;

		self.d = {
			n: q.d('namespace'),
			l: q.d('lookup'),
			s: q.d('surah')
		};

		self.timer = {};

		q.one('init', function() {
			self.setup();
		}, 1, 'scrollKeys');
	};
	Quran.ui.scrollKeys.prototype = {
		setup: function() {
			var self = this;

			var using = { PAGE_UP: 1, PAGE_DOWN: 1, HOME: 1, END: 1 };
			var surah = q.d('surah.surah_id');
			var ayahs = q.d('surah.ayahs');

			var last, ayah, key, down = false;
			var keydown = function(ev) {
				if (self.d.n != 'main' || ev.metaKey || ev.ctrlKey || ev.altKey || ev.shiftKey) return;
				ev.codeKey = jQuery.ui.codeKey[ev.keyCode];
				if (using[ev.codeKey]) {
					if (down === false) {
						down = true;
						ayah = ayah ? ayah : q.state('ayah');
						last = ayah;
					}
					else {
						clearTimeout(self.timer.down);
						self.timer.down = setTimeout(function() {
							if (!down) {
								down = false;
								ayah = undefined;
								last = undefined;
							}
						}, 200);
					}

					ev.preventDefault();
					ev.stopPropagation();
				}
			};
			var keypress = function(ev) {
				if (!down || self.d.n != 'main' || ev.metaKey || ev.ctrlKey || ev.altKey || ev.shiftKey) return;
				ev.codeKey = jQuery.ui.codeKey[ev.keyCode];
				if (using[ev.codeKey]) {
					switch (ev.codeKey) {
						case 'PAGE_DOWN':
							var page = self.d.l.ayah[ayah - 1];
							if (page >= self.d.l.surah[1])
								ayah = ayahs;
							else ayah = self.d.l.page[page + 1][0];
						break;
						case 'PAGE_UP':
							var page = self.d.l.ayah[ayah - 1];
							if (ayah == ayahs)
								ayah = self.d.l.page[self.d.l.surah[1]][0];
							else {
								page = page > self.d.l.surah[0] ? page - 1 : self.d.l.surah[0];
								ayah = self.d.l.page[page][0];
							}
						break;
						case 'HOME':
							ayah = 1;
							down = null;
						break;
						case 'END':
							ayah = ayahs;
							down = null;
						break;
					}

					if (ayah <= 1 || ayah >= ayahs) {
						last = 0;
						if (ayah <= 1) ayah = 1;
						else ayah = ayahs;
					}

					key = surah +':'+ ayah;
					q.run('scroll', { key: key }, 'scrollKeys');
					//q.anchor({ key: key }, 'scrollKeys', { skip: ':pre:scrollAnchor' });

					ev.preventDefault();
					ev.stopPropagation();
				}
			};
			var keyup = function(ev) {
				if (self.d.n != 'main' || ev.metaKey || ev.ctrlKey || ev.altKey || ev.shiftKey) return;
				ev.codeKey = jQuery.ui.codeKey[ev.keyCode];
				if (using[ev.codeKey]) {
					if (ayah != last) {
						down = false;
						ayah = undefined;
						last = undefined;
						q.change({ key: key, anchor: true, force: false }, 'scrollKeys');
					}

					ev.preventDefault();
					ev.stopPropagation();
				}
			};

			q.jQ.window.keydown(keydown);
			q.jQ.window.keypress(keypress);
			q.jQ.window.keyup(keyup);

			jQuery(document).ready(function() {
				jQuery(':input, :focus:not(body)').live('keydown keypress keyup', function(ev) {
					ev.stopPropagation(); // because native behavior of END and HOME keys are necessary for some elements
				});
			});
		}
	};
})( Quran, jQuery );
