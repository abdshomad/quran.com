(function( Quran, jQuery ) {
	Quran.ui.dash = function(q) {
		var self = this;

		q.d(self, 'log.setting', {
			enabled: false,
			verbose: true,
			dir: true,
			clear: 5,
			count: 0,
		});

		self.log = q.d(self, 'log.setting.verbose') ? q._._ : q._;

		self.overlay  = q.jQ.overlay;
		self.window   = q.jQ.window;
		self.document = q.jQ.document;

		self.d = {
			n: q.d('namespace'),
			l: q.d('lookup'),
			s: q.d('surah')
		};

		q.one('change:pre', function(change, from) {
			self.init(change);
		}, 0, 'dash');

		q.on('change scroll', function(change, from) {
			self.update(change, from);
		}, 1, 'dash');
	};
	Quran.ui.dash.prototype = {
		init: function(state) {
			var self = this;

			var ayahs = q.d('surah.ayahs');
			var surah = q.d('surah.surah_id');

			self.ayah_input = jQuery('#ayah-input');
			self.ayah_select = jQuery('#ayah-select');
			self.ayah_slider = jQuery('#ayah-slider');

			self.ayah_input.val(state.ayah);
			self.ayah_select.val(state.ayah);

			self.ayah_input.change(function(ev) {
				var val = self.ayah_input.val();
				var key = surah +':'+ val;
				q.change({ key: key, anchor: true }, 'dash:input');
				q._._.debug('input change');
			});

			var using = { UP: 1, DOWN: 1, PAGE_UP: 1, PAGE_DOWN: 1, HOME: 1, END: 1 };
			var last;
			var keydown = function(ev) {
				ev.codeKey = jQuery.ui.codeKey[ev.keyCode];
				if (using[ev.codeKey]) {
					var val = parseInt(self.ayah_input.val());
					last = val;
				}
			};
			var keypress = function(ev) {
				ev.codeKey = jQuery.ui.codeKey[ev.keyCode];
				if (using[ev.codeKey]) {
					var val = parseInt(self.ayah_input.val());
					switch (ev.codeKey) {
						case 'DOWN':
							val += 1;
						break;
						case 'UP':
							val -= 1;
						break;
						case 'PAGE_DOWN':
							var page = self.d.l.ayah[val - 1];
							if (page >= self.d.l.surah[1])
								val = ayahs;
							else val = self.d.l.page[page + 1][0];
						break;
						case 'PAGE_UP':
							var page = self.d.l.ayah[val - 1];
							if (val == ayahs)
								val = self.d.l.page[self.d.l.surah[1]][0];
							else {
								page = page > self.d.l.surah[0] ? page - 1 : self.d.l.surah[0];
								val = self.d.l.page[page][0];
							}
						break;
						case 'HOME':
							val = 1;
						break;
						case 'END':
							val = ayahs;
						break;
					}

					if (val <= 1 || val >= ayahs) {
						last = 0;
						if (val <= 1) val = 1;
						else val = ayahs;
					}

					self.update({ ayah: val }, 'input');
				}
			};
			var keyup = function(ev) {
				ev.codeKey = jQuery.ui.codeKey[ev.keyCode];
				if (using[ev.codeKey]) {
					var val = parseInt(self.ayah_input.val());
					if (val != last) {
						self.ayah_input.trigger('change');
					}
				}
			};

			self.ayah_input.keydown(keydown);
			self.ayah_input.keypress(keypress);
			self.ayah_input.keyup(keyup);

			self.ayah_select.change(function(ev) {
				var val = self.ayah_select.val();
				var key = surah +':'+ val;
				q.change({ key: key, anchor: true }, 'dash:select');
				q._._.debug('select change');
			});

			self.ayah_slider.slider({
				min: 1,
				max: ayahs,
				value: state.ayah,
				change: function(ev, ui) {
				},
				start: function(ev, ui) {
				},
				stop: function(ev, ui) {
					var val = ui.value;
					var key = surah +':'+ val;
					q.change({ key: key, anchor: true }, 'dash:slide');
					q._._.debug('slider change');
				},
				slide: function(ev, ui) {
					self.update({ ayah: ui.value }, 'slide');
				},
				create: function(ev, ui) {
				}
			});

			self.x = {};
			self.ayah_slider_handle = self.ayah_slider.find('> a');
			self.action = {
				start: function(ev) {
					var self = this;

					jQuery('#overlay').addClass('fg').css({ cursor: 'ew-resize' });

					if (ev) {
						ev.stopImmediatePropagation();
						ev.preventDefault();
					}

					self.x.delay = ev.type == 'mousewheel' ? 100 : 300;

					clearTimeout(self.action.reset);
					self.action.reset = setTimeout(self.action.timeout, self.x.delay);

					if (ev.type == 'mousewheel')
						q.jQ.window.bind('mousewheel', { originalTarget: ev.currentTarget }, self.action.scroll);
					else q.jQ.document.bind('mousemove', { originalTarget: ev.currentTarget }, self.action.slide);
					q.jQ.document.bind('mouseup mouseleave', { originalTarget: ev.currentTarget }, self.action.stop);

					self.x.width = {
						slider: self.ayah_slider.width(),
						handle: self.ayah_slider_handle.width()
					};
					self.x.offset = {
						slider: self.ayah_slider.offset().left,
						handle: ev.clientX
					};
					self.slider = self.ayah_slider.slider('option');
					self.x.max = self.slider.max;
					self.x.min = self.slider.min;
					if (ev.currentTarget === self.ayah_slider.get(0) && ev.type != 'mousewheel')
						self.x.value = Math.round(Math.max(Math.min(self.x.max * (self.x.offset.handle - self.x.offset.slider) / self.x.width.slider, self.x.max), self.x.min));
					else self.x.value = self.slider.value;
					self.x.position = {
						start: self.x.width.slider * self.x.value / self.x.max
					};
					self.x.timestamp = ev.timeStamp;
					self.x.last = self.x.value;

					self.x.active = true;
					self.ayah_slider_handle.addClass('active');

					self.action.position();
					self.slider.start(ev, { value: self.x.value });
				},
				position: function() { // attach this to slider object instead
					var self = this;

					self.x.percent = 100 * ( self.x.value - self.x.min ) / ( self.x.max - self.x.min );
					self.ayah_slider_handle.css({ left: self.x.percent +'%' });
				},

				slide: function(ev) {
					var self = this;

					var log = q.d(self, 'log.setting');

					if (ev) {
						ev.stopImmediatePropagation();
						ev.preventDefault();
					}

					self.x.delay = ev.type == 'mousewheel' ? 100 : 300;

					clearTimeout(self.action.reset);
					self.action.reset = setTimeout(self.action.timeout, self.x.delay);

					var diff = ev.timeStamp - self.x.timestamp;

					if (!diff || diff >= 10) {
						if (log.enabled && log.clear) {
							if (--log.count <= 0) {
								self.log.clear();
								log.count = log.clear;
							}

							if (log.dir) self.log.dir({ pos: self.x.percent, ayah: self.x.value });
						}
						if (log.enabled) self.log.time('slide');
						if (ev.type == 'mousewheel') {
							self.x.position.change = ( ( ev.delta * Math.ceil( self.x.max / 100 ) ) / self.x.max ) * self.x.width.slider;
						}
						else {
							self.x.position.change = ev.clientX - self.x.offset.handle;
						}

						self.x.position.current = Math.max(Math.min(self.x.position.start + self.x.position.change, self.x.width.slider), 0);
						self.x.value = Math.round(Math.max(Math.min(self.x.max * self.x.position.current / self.x.width.slider, self.x.max), self.x.min));

						if (ev.type == 'mousewheel') {
							self.x.position.start = self.x.position.current;
						}

						self.x.timestamp = ev.timeStamp;

						if (self.x.value != self.x.last) {
							self.action.position();
							self.slider.slide(ev, { value: self.x.value });
							self.x.last = self.x.value;
							//q.hash({ ayah: self.x.value });
						}
						if (log.enabled) self.log.timeEnd('slide');
					}
				}, // slide:

				scroll: function(ev, delta) {
					var self = this;

					if (ev) {
						ev.stopImmediatePropagation();
						ev.preventDefault();
					}

					ev = jQuery.extend(ev, { delta: delta * -1 });

					if ( !self.x.active && ( ev.timeStamp - self.x.timestamp > 200 || self.x.timestamp === undefined ) )
						self.action.start(ev);

					self.action.slide(ev);
				},
				stop: function(ev) {
					var self = this;

					jQuery('#overlay').removeClass('fg');

					if (ev) {
						ev.stopImmediatePropagation();
						ev.preventDefault();
					}

					clearTimeout(self.action.reset);

					q.jQ.window.unbind('mousewheel', self.action.scroll);
					q.jQ.document.unbind('mousemove', self.action.slide);
					q.jQ.document.unbind('mouseup mouseleave', self.action.stop);

					self.x.active = false;
					self.ayah_slider_handle.removeClass('active');

					self.slider.value = self.x.value;

					if (self.x.value != self.x.last) {
						self.action.position();
						self.slider.slide(ev, { value: self.x.value });
						self.x.last = self.x.value;
					}

					self.slider.stop(ev, { value: self.x.value });
					self.slider.change(ev, { value: self.x.value });
				},
				timeout: function() {
					var self = this;

					self.action.stop(jQuery.Event('timeout'));
				}
			};

			jQuery.each(self.action, function(ev, fn) {
				if (typeof fn == 'function')
					self.action[ev] = jQuery.proxy(fn, self);
			});

			self.ayah_slider.add(self.ayah_slider_handle)
				._mousedown(self.action.start);
			self.ayah_slider
				._mousewheel(self.action.scroll);
		},
		update: function(change, from) {
			var self = this;

			self.ayah_input.val(change.ayah);
			self.ayah_select.val(change.ayah);

			if (from != 'slide')
				self.ayah_slider.slider('option', 'value', change.ayah);
		},
		_slider: {
			init: function() {
				var self = this;

				q.d(self._slider, 'time.out.fn', function() {
					self._slider.stop(jQuery.Event('time.out'));
				});
			},
			start: function(ev) {
				var self = this;

				self.overlay.addClass('fg').css({ cursor: 'ew-resize' });

				if (ev) {
					ev.stopImmediatePropagation();
					ev.preventDefault();
				}

				q.d(self._slider, 'dim', {});

				q.d(self._slider, 'time', {});

				q.d(self._slider, 'bln', {});

				//self.x.delay = ev.type == 'mousewheel' ? 100 : 300;
				q.d(self._slider, 'time.out.ms', ev.type == 'wheel' ? 100 : 300);

				//clearTimeout(self.action.reset);
				clearTimeout(q.d(self._slider, 'time.out.id'));

				//self.action.reset = setTimeout(self.action.timeout, self.x.delay);
				q.d(self._slider, 'time.out.id', setTimeout(q.d(self._slider, 'time.out.fn'), q.d(self._slider, 'time.out.ms')));

				//if (ev.type == 'mousewheel')
					//q.jQ.window.bind('mousewheel', { originalTarget: ev.currentTarget }, self.action.scroll);
				//else q.jQ.document.bind('mousemove', { originalTarget: ev.currentTarget }, self.action.slide);
				if (ev.type == 'wheel')
					self.window.bind('mousewheel', { originalTarget: ev.currentTarget }, self._slider.wheel);
				else self.window.bind('mousemove', { originalTarget: ev.currentTarget }, self._slider.slide);

				//q.jQ.document.bind('mouseup mouseleave', { originalTarget: ev.currentTarget }, self.action.stop);
				self.document.bind('mouseup mouseleave', { originalTarget: ev.currentTarget }, self._slider.stop);

				//self.x.width = {
					//slider: self.ayah_slider.width(),
					//handle: self.ayah_slider_handle.width()
				//};
				q.d(self._slider, 'dim.width', {
					slider: self.slider.width(),
					handle: self.handle.width()
				});

				//self.x.offset = {
					//slider: self.ayah_slider.offset().left,
					//handle: ev.clientX
				//};
				q.d(self._slider, 'dim.offset', {
					slider: self.slider.offset().left,
					handle: ev.clientX
				});

				//self.slider = self.ayah_slider.slider('option');
				q.d(self._slider, 'jui.option', self.slider.slider('option'));

				//self.x.max = self.slider.max;
				//self.x.min = self.slider.min;

				//if (ev.currentTarget === self.ayah_slider.get(0) && ev.type != 'mousewheel')
					//self.x.value = Math.round(Math.max(Math.min(self.x.max * (self.x.offset.handle - self.x.offset.slider) / self.x.width.slider, self.x.max), self.x.min));
				//else self.x.value = self.slider.value;

				if (ev.currentTarget == self.slider.get(0) && ev.type != 'wheel')
					q.d(self._slider, 'value',
						Math.round(
							Math.max(
								Math.min(
									q.d(self._slider, 'jui.option.max') * ( q.d(self._slider, 'dim.offset.handle') - q.d(self._slider, 'dim.offset.handle') ) / q.d(self._slider, 'dim.width.slider'),
									q.d(self._slider, 'jui.option.max')
								),
								q.d(self._slider, 'jui.option.min')
							)
						)
					);
				else q.d(self._slider, 'value', q.d(self._slider, 'jui.option.value'));

				//self.x.position = {
					//start: self.x.width.slider * self.x.value / self.x.max
				//};

				q.d(self._slider, 'dim.position', {
					start: q.d(self._slider, 'dim.width') * q.d(self._slider, 'value') / q.d(self._slider, 'jui.option.max')
				});

				//self.x.timestamp = ev.timeStamp;

				q.d(self._slider, 'time.stamp', ev.timeStamp);

				//self.x.last = self.x.value;

				q.d(self._slider, 'last.value', q.d(self._slider, 'value'));

				//self.x.active = true;

				q.d(self._slider, 'bln.active', true);

				self.handle.addClass('active');

				self._slider.position();
				self._slider.start(ev, { value: q.d(self._slider, 'value') });
			},
			stop: function() {
			},
			slide: function() {
			},
			wheel: function() {
			},
			position: function() {
				var self = this;
				var val = q.d(self._slider, 'value'), min = q.d(self._slider, 'jui.option.min'), max = q.d(self._slider, 'jui.option.max');
				var pct = q.d(self._slider, 'dim.percent', 100 * ( val - min ) / ( max - min ));
				self.handle.css({ left: pct +'%' });
			},
		},
		_spinner: {
		},
		_select: {
		}
	};
})( Quran, jQuery );
