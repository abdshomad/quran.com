(function( Quran, jQuery ) {
	Quran.ui.content.scrollAnchor = function(quran) {
		var self = this;

		quran.window.load(function() {
			self.setup();
		});

		quran.window.resize(jQuery.proxy(self, '_eventHandler'));

		function anchor(elem, force) {
			var key = jQuery(elem).attr('data-key');
			quran.change({ key: key, anchor: true, force: force }, 'scrollAnchor:anchor');
		};

		self.elem.anchor._mousedown(function() {
			anchor(this);
		})._dblclick(function() {
			anchor(this, true);
		});

		quran.onchange(function(state, caller) {
			self.elem.anchor.removeClass('active').filter('[data-key="'+ state.key +'"]').addClass('active');
		}, 20);
	};
	Quran.ui.content.scrollAnchor.prototype = {
		elem: {
			container : jQuery('#content div.ayah'),
			   anchor : jQuery('#content div.ayah header td.anchor')
		},
		data: {},
		_eventHandler: function(event) {
			event.preventDefault();
			event.stopPropagation();

			var self = this;

			self.setup();
		},
		setup: function() {
			//console.time('scrollAnchor setup');
			var self = this;

			var data = { height: quran.window.height(), scroll: {}, key: {} };

			self.elem.container.each(function(i) {
				var me = jQuery(this);
				var offset = Math.round(me.offset().top), height = me.height();
				var key = me.attr('data-key');
				data.key[key] = {
					scroll: {
						   top : offset,
						bottom : offset + height
					}
				};
			});

			quran.window._scroll(data, function(ev) {
				if (quran._last_change_from != 'scrollAnchor') {
					quran._last_change_from = 'scrollAnchor';
					return;
				}
				var me = quran.window;
				var offset = me.scrollTop(), height = ev.data.height;
				jQuery.extend(ev.data.scroll, {
					   top : offset,
					bottom : offset + height
				});

				var _winner, _top, _bottom, _middle;
				jQuery.each(ev.data.key, function(key, data) {
					var score = Math.abs(ev.data.scroll.top - data.scroll.top) + Math.abs(ev.data.scroll.bottom - data.scroll.bottom);
					if (ev.data.scroll.top >= data.scroll.top && ev.data.scroll.top <= data.scroll.bottom)
						_top = { key: key, score: score };
					if (ev.data.scroll.top <= data.scroll.top && ev.data.scroll.bottom >= data.scroll.bottom) {
						_middle = { key: key, score: score };
						return false;
					}
					if (ev.data.scroll.bottom <= data.scroll.bottom && ev.data.scroll.bottom >= data.scroll.top)
						_bottom = { key: key, score: score };
				});
				if (_middle)
					_winner = _middle;
				else if (_top && _bottom)
					if (_top.score <= _bottom.score)
						_winner = _top;
					else _winner = _bottom;
				else if (_top)
					_winner = _top;
				else if (_bottom)
					_winner = _bottom;
				if (_winner)
					quran.change({ key: _winner.key }, 'scrollAnchor');
			});

			quran.window.trigger('scroll');
			//console.timeEnd('scrollAnchor setup');
		}
	};
})( Quran, jQuery );
