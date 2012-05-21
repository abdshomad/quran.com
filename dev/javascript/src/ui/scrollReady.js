(function( Quran, jQuery ) {
	// TODO: this can be optimized for ms performance by using native DOM js instead of jQuery where practical
	Quran.ui.scrollReady = function(q) {
		var self = this;

		self.div = jQuery('<div>').css({
			'font-family': 'this-does-not-exist-123-987-456',
			'font-size' : '20em',
			'visibility' : 'hidden',
			'position' : 'absolute',
			'top' : '-100000px',
			'left' : '-100000px',
		});

		self.timer = {};

		q.on('load', function(ayahs, from) {
			self.setup(ayahs);
		}, 2, 'scrollReady');

		self.n = q.d('n.ready', 0);

		q.on('ready', function() {
			q.d('n.ready', ++self.n);
		}, 0, 'scrollReady');

		q.on('selectContent', function() {
			//self.elem = '#content div.ayah';
			//self.setup(jQuery(self.elem));
		}, 2, 'scrollReady');
	};
	Quran.ui.scrollReady.prototype = {
		setup: function(elem) {
			var self = this,
				data = {};

			var div = self.div.clone();
			var timer = {};

			if (q.session('content.quran.words'))
				data.type = 'font';
			else if (q.session('content.quran.images'))
				data.type = 'img';
			else if (q.session('content.quran.text'))
				data.type = 'text';

			elem.removeClass('ready');

			if (data.type == 'font') {
				q.jQ.body.append(div);
			} else
			if (data.type == 'img') {
			} else
			if (data.type == 'text') {
			}

			elem.each(function() {
				self.init(this, data, div);
			});

			if (data.type == 'font') {
				function fontReady(fontClass, fontData) {
					if (!fontData.ready) {
						fontData.width.after = fontData.elem.width();

						if (fontData.width.before != fontData.width.after) {
							clearInterval(timer[fontClass]);
							fontData.elem.remove();
							fontData.ready = true;

							jQuery.each(data.elem, function(key, elemData) {
								if (fontClass == elemData.fontClass)
									elemData.elem.addClass('ready').trigger('ready');
							});
						}
					}

					return fontData.ready;
				};

				function allReady() {
					data.ready = true;

					jQuery.each(data.font, function(fontClass, fontData) {
						if (!fontData.ready)
							return (data.ready = false);
					});

					if (data.ready) {
						clearTimeout(timer.cancel);
						clearInterval(timer.ready);

						div.remove();

						q.run('ready', { timeout: false }, 'scrollReady');
					}

					return data.ready;
				};

				jQuery.each(data.font, function(fontClass, fontData) {
					if (!fontReady(fontClass, fontData)) {

						timer[fontClass] = setInterval(function() {
							fontReady(fontClass, fontData);
						}, 50);
					}
				});

				if (!allReady()) {
					timer.cancel = setTimeout(function() {
						clearInterval(timer.ready);

						jQuery.each(data.font, function(fontClass, fontData) {
							clearInterval(timer[fontClass]);
							fontData.elem.remove();

							jQuery.each(data.elem, function(key, elemData) {
								if (fontClass == elemData.fontClass)
									elemData.elem.addClass('ready').trigger('ready');
									//elemData.elem.addClass('error');
							});
						});

						div.remove();
						q.run('ready', { timeout: true }, 'scrollReady');
					}, 5000);

					timer.ready = setInterval(function() {
						allReady();
					}, 75);
				}

			} else // data.type == 'font'
			if (data.type == 'img') {
				function elemReady(key, elemData) {
					if (!elemData.ready) {
						if (elemData.img.complete) {
							clearInterval(elemData.test);

							elemData.ready = true;

							elemData.elem.addClass('ready').trigger('ready');
						}
					}

					return elemData.ready;
				};

				function ready() {
					data.ready = true;

					jQuery.each(data.elem, function(key, elemData) {
						if (!elemData.ready)
							return (data.ready = false);
					});

					if (data.ready) {
						clearInterval(data.test);

						q.run('ready', elem, 'scrollReady');
					}

					return data.ready;
				};

				jQuery.each(data.elem, function(key, elemData) {
					if (!elemReady(key, elemData)) {
						elemData.test = setInterval(function() {
							elemReady(key, elemData);
						}, 50);
					}
				});

				if (!ready()) {
					data.test = setInterval(function() {
						ready();
					}, 75);
				}

				setTimeout(function() {
					if (!data.ready)
						clearInterval(data.test);

					jQuery.each(data.elem, function(key, elemData) {
						if (!elemData.ready) {
							clearInterval(elemData.test);

							elemData.elem.addClass('error');
						}
					});
				}, 120000);
			} else
			if (data.type == 'text') {
				q.run('ready', elem, 'scrollReady');
			}
		},
		init: function(elem, data, div) {
			var self = this,
				key = elem.getAttribute('data-key'),
				page = elem.getAttribute('data-page'),
				elem = jQuery(elem);

			if (!data.elem)
				data.elem = {};

			data.elem[key] = { elem: elem };

			if (data.type == 'font') {
				var fontClass = 'p'+ page;

				data.elem[key].fontClass = fontClass;

				if (!data.font)
					data.font = {};

				if (!data.font[fontClass])
					data.font[fontClass] = {};

				var fontData = data.font[fontClass];

				if (!fontData.elem) {
					fontData.elem = jQuery('<span>&#xfb51;&#xfb52;&#xfb53;&#xfb54;&#xfb55;&#xfb56;&#xfb57;&#xfb58;&#xfb59;abcdefg&nbsp;</span>');
					fontData.width = {};

					div.append(fontData.elem);

					fontData.width.before = fontData.elem.width();

					fontData.elem.addClass(fontClass);
				}
			} else
			if (data.type == 'img') {
				data.elem[key].img = elem.find('.img img').get(0);
			} else
			if (data.type == 'text') {
			}
		}
	};
})( Quran, jQuery );
