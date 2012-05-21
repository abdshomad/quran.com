Quran.ui.audioPlayer = function(quran) {
	var self = this;

	self.template = {
		'quran.audioPlayer.reciter.list.item.body': '\
			<li class="item <%== code %><%== selected ? " selected" : "" %>" data-code="<%== code %>" data-path="<%== path %>">\
				<label><%= name %></label>\
			</li>\
		',
		'quran.audioPlayer.reciter.list.item.strip': '\
			<li class="item <%== code %><%== selected ? " selected" : "" %>" data-code="<%== code %>" data-path="<%== path %>">\
				<input class="radio" type="radio"<%== selected ? " checked" : "" %>/>\
			</li>\
		'
	};

	var defaults = {
		volume: 62,
		reciter: quran.d('audio.reciter.order')[0],
		sequence: 0,
		cycle: 0,
		delay: 100
	};

	jQuery.extend(self._setting, {
		volume: quran.session('audio.setting.volume'),
		reciter: quran.session('audio.setting.reciter'),
		sequence: quran.session('audio.setting.sequence'),
		cycle: quran.session('audio.setting.cycle'),
		delay: quran.session('audio.setting.delay'),
		loop: 0
	});

	jQuery.each(defaults, function(key, value) {
		if (self._setting[key] === undefined)
			self._setting[key] = value;
	});

	quran.one('init', function() {
		q._._.debug('init from audioPlayer', arguments);
		self.setup();
	}, 2, 'audioPlayer');

	quran.on('change', function(change, from, timestamp) {
		if (!self._inst[change.key]) self.init(change.key);
		if (from != 'audioPlayer:play' && self._setting.sequence && (!self.inst || self.inst.key != change.key) && (self.inst.state.emptied || self.inst.state.play || self.inst.state.playing || self.inst.state.loading)) {
			clearTimeout(self.delay);
			self.delay = setTimeout(function() {
				self.set(change.key);
				self.play({ from: 0 });
			}, self._setting.delay);
		}
		//else self.set(change.key);
	}, 2, 'audioPlayer');
	/*
	*/
};

Quran.ui.audioPlayer.prototype = {
	_config: { host: 'http://download.quranicaudio.com:9999/', format: 'ogg', delay: 100, debug: 0 },
	_setting: {}, _state: {}, _inst: {},
	// TODO:
	// error handling
	// later, or hire a designer:
	// 	icons / misc. css touchup
	// extras:
	//	setting => anchor option
	//	setting => cycle option
	//	setting => transition delay option
	// 	save settings to session / load settings from session
	setup: function() {
		var self = this;

		window.self = self; // for debugging

		jQuery.extend(self, {
		   elem : {
			   ui : jQuery('#player-ui'),
			state : jQuery('#player-state'),
			audio : jQuery('#player-audio') }
		});

		if (self.elem.state.hasClass('pre')) self.elem.state.removeClass('pre');

		function proxy (ref, k1) {
			jQuery.each(ref[k1], function (k2, object) {
				if (typeof object == 'function')
					ref[k1][k2] = jQuery.proxy(object, self);
				else if (typeof object == 'object' && !object.length)
					proxy(ref[k1], k2);
			});
		};

		jQuery.each(['state', 'event', 'ui'], function(i, k1) {
			proxy(self, k1);
		});

		jQuery.extend(self.elem.ui, {
			instance : self.elem.ui.find('> .instance'),
					play : self.elem.ui.find('> .instance > tbody > tr > .play'),
				 track : self.elem.ui.find('> .instance > tbody > tr > .track'),
					time : self.elem.ui.find('> .instance > tbody > tr > .time'),
				config : self.elem.ui.find('> .instance > tbody > tr > .config'),
			 reciter : self.elem.ui.find('> .instance > tbody > tr > .reciter'),
					loop : self.elem.ui.find('> .instance > tbody > tr > .loop'),
			sequence : self.elem.ui.find('> .instance > tbody > tr > .sequence')
		});

		jQuery.each(['play', 'config', 'reciter', 'loop', 'sequence'], function(i, key) {
			jQuery.extend(self.elem.ui[key], {
				icon: self.elem.ui[key].find('> .wrap > .icon')
			});
		});

		jQuery.extend(self.elem.ui.track, {
			range: self.elem.ui.track.find('> .wrap > .range')
		});

		jQuery.extend(self.elem.ui.track.range, {
			buffer: self.elem.ui.track.range.find('> .buffer')
		});

		jQuery.extend(self.elem.ui.time, {
			elapsed: self.elem.ui.time.find('> .wrap > .elapsed')
		});

		jQuery.extend(self.elem.ui.config, {
			panel: self.elem.ui.config.find('> .wrap > .panel')
		});

		jQuery.extend(self.elem.ui.config.panel, {
			list: {
				 body : self.elem.ui.config.panel.find('> .list.body'),
				strip : self.elem.ui.config.panel.find('> .list.strip')
			}
		});

		jQuery.extend(self.elem.ui.config.panel.list.body, {
			item: self.elem.ui.config.panel.list.body.find('> .item')
		});

		jQuery.extend(self.elem.ui.config.panel.list.body.item, {
			volume: self.elem.ui.config.panel.list.body.item.filter('.volume')
		});

		jQuery.extend(self.elem.ui.config.panel.list.body.item.volume, {
			range: self.elem.ui.config.panel.list.body.item.volume.find('> .range')
		});

		jQuery.extend(self.elem.ui.reciter, {
			panel: self.elem.ui.reciter.find('> .wrap > .panel')
		});

		jQuery.extend(self.elem.ui.reciter.panel, {
			list: {
				 body : self.elem.ui.reciter.panel.find('> .list.body'),
				strip : self.elem.ui.reciter.panel.find('> .list.strip')
			}
		});

		jQuery.each(q.d('audio.reciter.order'), function(index, path) {
			var reciter = q.d('audio.reciter.data');

			jQuery.extend(reciter[path], {
				path : path,
				code : path.toLowerCase().replace(/\//g, '_'), // todo: refactor to schema
				selected : self._setting.reciter == path ? true : false,
				name : q.d('language').language_code == 'ar' ? reciter[path].arabic : reciter[path].english
			});

			delete reciter[path].arabic;
			delete reciter[path].english;

			//jQuery.tmpl('quran.audioPlayer.reciter.list.item.body', reciter[path])
			self.elem.ui.reciter.panel.list.body.append(
				jQuery(
					new jQuery.EJS({ text: self.template['quran.audioPlayer.reciter.list.item.body'] }).render(
						reciter[path]
					).replace(/>\s+</g,'><').replace(/^\s+/, '').replace(/\s+$/, '')
				)
			);
			//jQuery.tmpl('quran.audioPlayer.reciter.list.item.strip', reciter[path])
			self.elem.ui.reciter.panel.list.strip.append(
				jQuery(
					new jQuery.EJS({ text: self.template['quran.audioPlayer.reciter.list.item.strip'] }).render(
						reciter[path]
					).replace(/>\s+</g,'><').replace(/^\s+/, '').replace(/\s+$/, '')
				)
			);
		});

		jQuery.extend(self.elem.ui.reciter.panel.list.body, {
			item: self.elem.ui.reciter.panel.list.body.find('> .item')
		});

		jQuery.extend(self.elem.ui.reciter.panel.list.strip, {
			item: self.elem.ui.reciter.panel.list.strip.find('> .item')
		});

		jQuery.extend(self.elem.ui.reciter.panel.list.strip.item, {
			radio: self.elem.ui.reciter.panel.list.strip.item.find('> .radio')
		});

		// play
		self.elem.ui.play._mouseup(function(ev) {
			self.ui.play.toggle(ev);
		});

		// track
		self.elem.ui.track.range.slider({
			start: function(ev, ui) {
				self.state.add('seeking');
			},
			stop: function(ev, ui) {
				if (!self.inst.state._manual_seek) self.state.remove('seeking');
			},
			slide: function(ev, ui) {
				if (self.inst.state.duration) {
					var max = self.elem.ui.track.range.slider('option', 'max');
					var currentTime = self.inst.audio[0].duration * ui.value / max;
					if (!self.event.last.currentTime_slider || Math.abs(currentTime - self.event.last.currentTime_slider) >= 0.25) {
						self.inst.audio[0].currentTime = currentTime;
						self.event.last.currentTime_slider = currentTime;
					}
				}
			}
		})._mousewheel(function(ev, delta) {
			if (self.inst.state.duration) {
				self.state.add(['seeking', '_manual_seek']);
				var max = self.elem.ui.track.range.slider('option', 'max');
				var value = self.elem.ui.track.range.slider('option', 'value') + delta * Math.ceil(max / 100);
				self.elem.ui.track.range.slider('option', 'value', value);
				var currentTime = self.inst.audio[0].duration * value / max;
				self.inst.audio[0].currentTime = currentTime;
			}
		});

		// time

		// config
		self.elem.ui.config.hover(function(ev) {
			self.ui.config.over(ev);
		}, function(ev) {
			self.ui.config.out(ev);
		});

		// volume
		self.elem.ui.config.panel.list.body.item.volume.range.slider({
			value: self._setting.volume,
			slide: function(ev, ui) {
				self.inst.audio[0].volume = ui.value / 100;
			},
			change: function(ev, ui) {
				self.inst.audio[0].volume = ui.value / 100;

				clearTimeout(self._save_volume_to_session_timeout);
				self._save_volume_to_session_timeout = setTimeout(function() {
					quran.session({ audio: { setting: { volume: ui.value } } });
				}, 1000);

				self._setting.volume = ui.value;
				jQuery.each(self._inst, function(key, inst) {
					if (inst.key != self.inst.key) inst.audio[0].volume = ui.value / 100; // TODO check this
				});
			}
		})._mousewheel(function(ev, delta) {
			var value = self.elem.ui.config.panel.list.body.item.volume.range.slider('option', 'value') + delta * self.elem.ui.config.panel.list.body.item.volume.range.slider('option', 'step');
			self.elem.ui.config.panel.list.body.item.volume.range.slider('option', 'value', value);
		});

		// reciter
		self.elem.ui.reciter.hover(function(ev) {
			self.ui.reciter.over(ev);
		}, function(ev) {
			self.ui.reciter.out(ev);
		});

		self.elem.ui.reciter.panel.list.body.item._mouseup(function(ev, data) {
			var me = jQuery(this);
			self.ui.reciter.select.from_item(me, ev, data);
		});

		self.elem.ui.reciter.panel.list.strip.item.radio._mouseup(function(ev, data) {
			var me = jQuery(this);
			self.ui.reciter.select.from_radio(me, ev, data);
		});

		// loop
		self.elem.ui.loop._mouseup(function(ev) {
			self.ui.loop.toggle(ev)
		});

		// sequence
		if (self._setting.sequence)
			self.elem.ui.sequence.addClass('on');

		self.elem.ui.sequence._mouseup(function(ev) {
			self.ui.sequence.toggle(ev)
		});
	},
	state: {
		set: function(key) {
			var self = this;
			self.state.empty();
			self.elem.state.attr({ 'class': 'state' }).addClass(key);
			self.inst.state[key] = true;
		},
		add: function(key) {
			var self = this;
			if (typeof key == 'string') {
				self.elem.state.addClass(key);
				self.inst.state[key] = true;
			}
			else jQuery.each(key, function(i, key) { self.state.add(key); });
		},
		remove: function(key) {
			var self = this;
			if (typeof key == 'string') {
				self.elem.state.removeClass(key);
				delete self.inst.state[key];
			}
			else jQuery.each(key, function(i, key) { self.state.remove(key); });
		},
		empty: function() {
			var self = this;
			for (var key in self.inst.state) delete self.inst.state[key];
		}
	},
	event: {
		loadstart: function(ev) {
			var self = this;
			self.state.add('loading');
		},
		progress: function(ev) {
			var self = this;
			// remove loading code here
			if (self.inst.audio[0].buffered !== undefined && self.inst.audio[0].buffered.length != 0)
				self.elem.ui.track.range.buffer.css({ width: parseInt((self.inst.audio[0].buffered.end(0) / self.inst.audio[0].duration) * 100) +'%' });
			else
			if (self.inst.state.loading && ev.loaded && ev.total)
				self.elem.ui.track.range.buffer.css({ width: parseInt((ev.loaded / ev.total) * 100) +'%' });
		},
		durationchange: function(ev) {
			var self = this;
			self.state.add('duration');
			self.elem.ui.track.range.slider('option', 'max', Math.round(self.inst.audio[0].duration * 50));
		},
		canplaythrough: function(ev) {
			var self = this;
			if (self.inst.state.duration) {
				self.state.remove('loading');
				self.elem.ui.track.range.buffer.css({ width: '100%' });
			}
		},
		play: function(ev) {
			var self = this;
			self.state.add('play');
			self.event.last = {};
		},
		playing: function(ev) {
			var self = this;
			self.state.remove(['play', 'paused', 'ended']);
			self.state.add('playing');
		},
		pause: function(ev) {
			var self = this;
			self.state.add('paused');
			self.state.remove('playing');
		},
		seeked: function(ev) {
			var self = this;
			if (self.inst.state.seeking && self.inst.state._manual_seek)
				self.state.remove(['seeking', '_manual_seek']);
			if (self.inst.state.ended && self.inst.audio[0].currentTime < self.inst.audio[0].duration - 0.3)
				self.state.remove('ended');
		},
		ended: function(ev) {
			var self = this;
			self.state.add('ended');
			self.event.last = {};
			if (self._setting.loop || self.inst.state.emptied)
				self.play({ from: 0 });
			else
			if (self._setting.sequence)
				if (self.inst.state.playing)
					if (!self._setting.cycle)
						if (jQuery.inArray(self.inst.key, q.d('keys')) < q.d('keys').length - 1)
							quran.change({ key: self.inst.key, next: true, anchor: true }, 'audioPlayer:next');
						else self.pause({ end: true });
					else
					if (jQuery.inArray(self.inst.key, q.d('keys')) < q.d('keys').length - 1)
						quran.change({ key: self.inst.key, next: true, anchor: true }, 'audioPlayer:next');
					else quran.change({ key: self.inst.key, next: true, anchor: true, cycle: true }, 'audioPlayer:next');
				else self.pause({ end: true });
			else self.pause({ end: true });
		},
		error: function(ev) {
			var self = this;
			self.state.set('error');
		},
		emptied: function(ev) {
			var self = this;
			self.state.set('emptied');
			self.event.last = {};
		},
		timeupdate: function(ev) {
			var self = this;
			if (self.inst.state.emptied) {
				if (!self.inst.state.loading)
					self.event.last.count = self.event.last.count ? self.event.last.count + 1 : 1;
				if (self.event.last.count > 5)
					self.state.remove('emptied');
			}
			if (!self.inst.state.seeking)
				self.elem.ui.track.range.slider('option', 'value', Math.round(self.inst.audio[0].currentTime * 50));
			var minutes = Math.floor(self.inst.audio[0].currentTime / 60);
			var mm = ( minutes < 10 ? quran.localize('0') : '' ) + quran.localize(minutes);
			var seconds = Math.floor(self.inst.audio[0].currentTime - minutes * 60);
			var ss = ( seconds < 10 ? quran.localize('0') : '' ) + quran.localize(seconds);

			self.elem.ui.time.elapsed.text(mm +':'+ ss);
			self.event.last.currentTime_elapsed = self.inst.audio[0].currentTime;
		},
		last: {}
	},
	init: function(key) {
		var self = this;

		var inst = self._inst[key] = {
			   key : key,
			  ayah : parseInt(key.split(/:/)[1]),
			config : { file : (function(key) { return (key[0].length < 2 ? '00'+ key[0] : key[0].length < 3 ? '0' + key[0] : key[0]) + (key[1].length < 2 ? '00'+ key[1] : key[1].length < 3 ? '0' + key[1] : key[1]); })(key.split(/:/)) },
			 state : {}
		};

		// audio
		inst.audio = jQuery('<audio preload="auto" data-key="'+ key +'">').appendTo(self.elem.audio);
		inst.audio[0].volume = self._setting.volume / 100;

		inst.audio.on('loadstart progress durationchange canplaythrough playing ended pause seeking seeked error timeupdate'+
		' abort canplay emptied loadeddata loadedmetadata play ratechange readystatechange stalled suspend volumechange waiting',
		function(ev) {
			if (self._config.debug && ev.type != 'timeupdate') {
				console.debug(ev.type, ev.originalEvent, self.inst.key);
			}
			if (self.event[ev.type]) self.event[ev.type]( ev.originalEvent );
		});
	},
	set: function(key) {
		var self = this;
		if (self.inst) {
			if (self.inst.key == key) return;
			if (self.inst.state.emptied || self.inst.state.play || self.inst.state.playing || self.inst.state.loading) self.pause();
			if (!self.last || self.last.key != self.inst.key) self.last = self.inst;
		}
		self.inst = self._inst[key];
	},
	load: function() {
		var self = this;

		self.inst.audio.attr({ src: self.source() });
		self.inst.audio[0].load();
	},
	source: function() {
		var self = this;
		return self._config.host + self._setting.reciter +'/'+ self._config.format +'/'+ self.inst.config.file +'.'+ self._config.format;
	},
	play: function(option) {
		var self = this, option = option || {};

		option.key = option.key ? option.key : quran.state('key');

		self.ui.play.on();

		if (!self.inst || self.inst.key != option.key) {
			quran.change({ key: option.key, anchor: true }, 'audioPlayer:play');
		}

		self.set(option.key);

		if (self.inst.audio.attr('src') != self.source() || self.inst.state.loading || self.inst.state.error || self.inst.state.emptied)
			self.load();
		else
		if (typeof option.from == 'number' || self.inst.state.ended)
			self.inst.audio[0].currentTime = option.from ? option.from : 0;

		self.inst.audio[0].play();
	},
	pause: function(option) {
		var self = this, option = option || {};

		self.ui.play.off();

		if (option.end || self.inst.state.ended) {
			self.state.add(['seeking', '_manual_seek']);
			self.inst.audio[0].currentTime = self.inst.audio[0].duration - 0.15;
			self.elem.ui.track.range.slider('option', 'value', self.elem.ui.track.range.slider('option', 'max'));
		}

		self.inst.audio[0].pause();
	},
	ui: {
		play: {
			toggle: function(ev) {
				var self = this;
				if (!self.elem.ui.play.hasClass('on'))
					self.play();
				else self.pause();
			},
			on: function() {
				var self = this;
				self.elem.ui.play.addClass('on');
				self.elem.ui.play.icon.switchClass('play', 'pause');
			},
			off: function() {
				var self = this;
				self.elem.ui.play.removeClass('on');
				self.elem.ui.play.icon.switchClass('pause', 'play');
			}
		},
		config: {
			over: function(ev) {
				var self = this;
				var my = self.ui.config;
				if (my.timeout) clearTimeout(my.timeout);

				if (!self.elem.ui.config.hasClass('on')) {
					self.elem.ui.config.addClass('on');

					if (!my.start_width)   my.start_width = self.elem.ui.config.panel.width();
					if (!my.end_width)     my.end_width = self.elem.ui.config.panel.list.body.outerWidth();
					if (!my.start_height)  my.start_height = 0;
					if (!my.end_height)    my.end_height = self.elem.ui.config.panel.list.strip.outerHeight();
					if (!my.x_duration)    my.x_duration = Math.abs(my.start_width - my.end_width);
					if (!my.y_duration)    my.y_duration = Math.abs(my.start_height - my.end_height);

					self.elem.ui.config.panel.stop().animate({ height: my.end_height }, {
						duration : my.y_duration,
							easing : 'swing',
						complete : function() {
							self.elem.ui.config.panel.animate({ width: my.end_width }, {
								duration : my.x_duration,
									easing : 'swing'
							});
						}
					});
				}
			},
			out: function(ev) {
				var self = this;
				var my = self.ui.config;
				if (my.timeout) clearTimeout(my.timeout);
				my.timeout = setTimeout(function() {
					if (self.elem.ui.config.hasClass('on')) {
						self.elem.ui.config.removeClass('on');
						self.elem.ui.config.panel.stop().animate({ width: my.start_width }, {
							duration : my.x_duration,
								easing : 'swing',
							complete : function() {
								self.elem.ui.config.panel.animate({ height: my.start_height }, {
									duration : my.y_duration,
										easing : 'swing'
								});
							}
						});
					}
				}, my.x_duration + my.y_duration);
			}
		},
		reciter: {
			over: function(ev) {
				var self = this;
				var my = self.ui.reciter;
				if (!self.elem.ui.reciter.hasClass('on')) {
					self.elem.ui.reciter.addClass('on');

					if (!my.start_width)   my.start_width = self.elem.ui.reciter.panel.width();
					if (!my.end_width)     my.end_width = self.elem.ui.reciter.panel.list.body.outerWidth();
					if (!my.start_height)  my.start_height = 0;
					if (!my.end_height)    my.end_height = self.elem.ui.reciter.panel.list.strip.outerHeight();
					if (!my.x_duration)    my.x_duration = Math.abs(my.start_width - my.end_width);
					if (!my.y_duration)    my.y_duration = Math.abs(my.start_height - my.end_height);

					self.elem.ui.reciter.panel.stop().animate({ height: my.end_height }, {
						duration : my.y_duration,
							easing : 'swing',
						complete : function() {
								self.elem.ui.reciter.panel.animate({ width: my.end_width }, {
									duration : my.x_duration,
										easing : 'swing'
								});
							}
					});
				}
			},
			out: function(ev) {
				var self = this;
				var my = self.ui.reciter;
				if (self.elem.ui.reciter.hasClass('on')) {
					self.elem.ui.reciter.removeClass('on');
					self.elem.ui.reciter.panel.stop().animate({ width: my.start_width }, {
						duration : my.x_duration,
							easing : 'swing',
						complete : function() {
							self.elem.ui.reciter.panel.animate({ height: my.start_height }, {
								duration : my.y_duration,
									easing : 'swing'
							});
						}
					});
				}
			},
			select: {
				from_item: function(me, ev, data) {
					var self = this;
					var path = me.data('path'), code = me.data('code');
					me.addClass('selected').siblings().removeClass('selected').parent().siblings().children().removeClass('selected').children('input').removeAttr('checked').parent().filter('.'+ code).addClass('selected').children('input').attr({ checked: true });
					if (!(data && data.trigger)) {
						self._setting.reciter = path;
						quran.session({ audio: { setting: { reciter: path } } });

						if (self.inst.state.playing) self.play({ from: 0 });
					}
				},
				from_radio: function(me, ev, data) {
					var self = this;
					var code = me.parent().data('code');
					me.parent().parent().prev().children().filter('.'+ code).trigger('mouseup');
				}
			}
		},
		loop: {
			toggle: function(ev) {
				var self = this;
				q._._.debug('loop toggle', self.elem.ui.loop);
				self._setting.loop = Math.abs(self._setting.loop - 1);
				if (self._setting.loop)
					self.elem.ui.loop.addClass('on');
				else self.elem.ui.loop.removeClass('on');
			}
		},
		sequence: {
			toggle: function(ev) {
				var self = this;
				self._setting.sequence = Math.abs(self._setting.sequence - 1);
				quran.session({ audio: { setting: { sequence: self._setting.sequence } } });
				if (self._setting.sequence) {
					self.elem.ui.sequence.addClass('on'); // TODO
					//quran.ui.body.notificationSystem.message({ title: quran.localize('Audio Player: Sequencing Enabled'), content: quran.localize('Playback automatically transitions to the next ayah upon verse completion.')  });
				}
				else {
					self.elem.ui.sequence.removeClass('on');
					//quran.ui.body.notificationSystem.message({ title: quran.localize('Audio Player: Sequencing Disabled'), content: quran.localize('Playback will no longer transition to the next ayah upon verse completion.')  });
				}
			}
		}
	}
};
