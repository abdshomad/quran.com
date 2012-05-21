(function( Quran, jQuery ) {
if (!document.createElement('audio').canPlayType)
	jQuery('#content div.ayah header td.audio .player').addClass('hidden');
else {
	Quran.ui.content.audioPlayer = function(quran) {
		var self = this;

		jQuery.extend(self.setting, {
			volume: quran.session('audio.setting.volume') || 62,
			reciter: quran.session('audio.setting.reciter') || quran.data('audio.reciter.order')[0],
			sequence: quran.session('audio.setting.sequence') || 0,
			cycle: quran.session('audio.setting.cycle') || 0
		});

		self.elem.start._mouseup(function() {
			var me = jQuery(this).parent();
			self.instance[me.data('key')] = new self.audioPlayer(self, me, quran);
		});

		quran.onchange(function(state, caller) {
			if (caller != 'audioPlayer' && caller != 'scrollAnchor' && self.setting.sequence && self.state.key != state.key && (self.state.emptied || self.state.play || self.state.loading || self.state.playing)) {
				//console.time('audioPlayer callback');
				if (self.instance[state.key])
					self.instance[state.key].play(true);
				else {
					var me = jQuery('#ayah-'+ (state.key.split(/:/).join('-')) +'> header > table td.audio > ul.player > li.ui');
					self.instance[state.key] = new self.audioPlayer(self, me, quran);
				}
				//console.timeEnd('audioPlayer callback');
			}
		}, 20);
	};
	Quran.ui.content.audioPlayer.prototype = {
		elem: {
			start: jQuery('#content div.ayah header td.audio .start'),
		},
		template: {
			instance: '\
				<table class="instance init">\
					<tbody>\
						<tr>\
							<td class="play"><div class="wrap">\
								<span class="icon audio play">\
									<b><s class="s1"></s><s class="s2"></s><s class="s3"></s></b>\
								</span>\
							</div></td>\
							<td class="track"><div class="wrap"><div class="range"><span class="buffer"></span></div></div></td>\
							<td class="time"><div class="wrap"><span class="elapsed">--:--</span></div></td>\
							<td class="config"><div class="wrap">\
								<span class="icon audio config" title="<%= quran.localize("Configuration Settings") %>">\
									<b><s class="s1"></s><s class="s2"></s><s class="s3"></s></b>\
								</span>\
								<div class="panel">\
									<ul class="list body">\
										<li class="item volume selected"><div class="range"></div></li>\
									</ul>\
									<ul class="list strip">\
										<li class="item volume selected">\
											<span class="icon audio volume-2">\
												<b><s class="s1"></s><s class="s2"></s><s class="s3"></s></b>\
											</span>\
										</li>\
									</ul>\
								</div>\
							</div></td>\
							<td class="reciter"><div class="wrap">\
								<span class="icon audio reciter" title="<%= quran.localize("Choose Reciter") %>">\
									<b><s class="s1"></s><s class="s2"></s><s class="s3"></s></b>\
								</span>\
								<div class="panel">\
									<ul class="list body"></ul>\
									<ul class="list strip"></ul>\
								</div>\
							</div></td>\
							<td class="loop" title="<%= quran.localize("Loop Playback") %>"><div class="wrap">\
								<span class="icon audio loop">\
									<b><s class="s1"></s><s class="s2"></s><s class="s3"></s></b>\
								</span>\
							</div></td>\
							<td class="sequence" title="<%= quran.localize("Sequence Playback") %>"><div class="wrap">\
								<span class="icon audio sequence">\
									<b><s class="s1"></s><s class="s2"></s><s class="s3"></s></b>\
								</span>\
							</div></td>\
						</tr>\
					</tbody>\
				</table>\
			',
			reciter: {
				list: {
					item: {
						body: '\
							<li class="item <%= code %><%= selected ? " selected" : "" %>" data-code="<%= code %>" data-path="<%= path %>"><%= name %></li>\
						',
						strip: '\
							<li class="item <%= code %><%= selected ? " selected" : "" %>" data-code="<%= code %>" data-path="<%= path %>"><input class="radio" type="radio"<%= selected ? " checked" : "" %>/></li>\
						'
					}
				}
			}
		},
		debug_audio: 0,
		config: {
			host: 'http://audio.quran.com:9999/', format: 'ogg'
		},
		instance: {}, state: {}, setting: {},
		// TODO:
		// error handling
		// later, or hire a designer:
		// 	icons / misc. css touchup
		// extras:
		//	setting => anchor option
		//	setting => cycle option
		//	setting => transition delay option
		// 	save settings to session / load settings from session
		audioPlayer: function(parent, me, quran) {
			//console.time('audioPlayer instance');
			var self = this;

			window._self = self; // for debugging

			jQuery.extend(self, {
				quran  : quran,
				parent : parent,
				key    : me.data('key'),
				ayah   : parseInt(me.data('key').split(/:/)[1]),
				setting : {
					loop : 0
				},
				config : {
					file : (function(key) { return (key[0].length < 2 ? '00'+ key[0] : key[0].length < 3 ? '0' + key[0] : key[0]) + (key[1].length < 2 ? '00'+ key[1] : key[1].length < 3 ? '0' + key[1] : key[1]); })(me.data('key').split(/:/))
				},
				elem: {
					    ui : me,
					 state : me.siblings('.state'),
					 audio : me.siblings('.sound').find('audio')
				}
			});

			if (self.elem.state.hasClass('pre'))
				self.elem.state.removeClass('pre');

			self.state = {
				set: function(key) {
					this.empty();
					if (typeof(key) == 'string' && typeof(self.state[key]) != 'function') {
						self.elem.state.attr({ 'class': 'state' }).addClass(key);
						self.state[key] = true;
					}
					else {
						jQuery.each(key, function(i, key) {
							if (typeof(key) == 'string' && typeof(self.state[key]) != 'function') {
								self.elem.state.attr({ 'class': 'state' }).addClass(key);
								self.state[key] = true;
							}
						});
					}
					this.propagate();
				},
				add: function(key) {
					if (typeof(key) == 'string' && typeof(self.state[key]) != 'function') {
						self.elem.state.addClass(key);
						self.state[key] = true;
					}
					else {
						jQuery.each(key, function(i, key) {
							if (typeof(key) == 'string' && typeof(self.state[key]) != 'function') {
								self.elem.state.addClass(key);
								self.state[key] = true;
							}
						});
					}
					this.propagate();
				},
				remove: function(key) {
					if (typeof(key) == 'string' && typeof(self.state[key]) != 'function') {
						self.elem.state.removeClass(key);
						delete self.state[key];
					}
					else {
						jQuery.each(key, function(i, key) {
							if (typeof(key) == 'string' && typeof(self.state[key]) != 'function') {
								self.elem.state.removeClass(key);
								delete self.state[key];
							}
						});
					}
					this.propagate();
				},
				empty: function() {
					for (var key in self.state)
						if (typeof(self.state[key]) != 'function')
							delete self.state[key];
				},
				propagate: function() {
					self.parent.state = {};
					for (var key in self.state)
						if (typeof(self.state[key]) != 'function')
							self.parent.state[key] = self.state[key];
					self.parent.state.key = self.key;
				}
			};

			self.event = {
				loadstart: function(self, ev) {
					self.state.add('loading');
				},
				progress: function(self, ev) {
					// remove loading code here
					if (self.audio.buffered != undefined && self.audio.buffered.length != 0)
						self.elem.ui.track.range.buffer.css({ width: parseInt((self.audio.buffered.end(0) / self.audio.duration) * 100) +'%' });
					else
					if (self.state.loading && ev.loaded && ev.total)
						self.elem.ui.track.range.buffer.css({ width: parseInt((ev.loaded / ev.total) * 100) +'%' });
				},
				durationchange: function(self, ev) {
					self.state.add('duration');
					self.elem.ui.track.range.slider('option', 'max', Math.round(self.audio.duration * 50));
				},
				canplaythrough: function(self, ev) {
					if (self.state.duration) {
						self.state.remove('loading');
						self.elem.ui.track.range.buffer.css({ width: '100%' });
					}
				},
				play: function(self, ev) {
					self.state.add('play');
					self.event.last = {};
				},
				playing: function(self, ev) {
					self.state.remove(['play', 'paused', 'ended']);
					self.state.add('playing');
				},
				pause: function(self, ev) {
					self.state.add('paused');
					self.state.remove('playing');
				},
				seeked: function(self, ev) {
					if (self.state.seeking && self.state._manual_seek)
						self.state.remove(['seeking', '_manual_seek']);
					if (self.state.ended && self.audio.currentTime < self.audio.duration - 0.3)
						self.state.remove('ended');
				},
				ended: function(self, ev) {
					self.state.add('ended');
					self.event.last = {};
					if (self.setting.loop || self.state.emptied)
						self.play(true);
					else
					if (self.parent.setting.sequence)
						if (self.state.playing)
							if (!self.parent.setting.cycle)
								if (jQuery.inArray(self.key, quran.data('keys')) < quran.data('keys').length - 1)
									quran.change({ key: self.key, next: true, anchor: true });
								else self.pause(true);
							else
							if (jQuery.inArray(self.key, quran.data('keys')) < quran.data('keys').length - 1)
								quran.change({ key: self.key, next: true, anchor: true });
							else quran.change({ key: self.key, next: true, anchor: true, cycle: true });
						else self.pause(true);
					else self.pause(true);
				},
				error: function(self, ev) {
					self.state.set('error');
				},
				emptied: function(self, ev) {
					self.state.set('emptied');
					self.event.last = {};
				},
				timeupdate: function(self, ev) {
					if (self.state.emptied) {
						if (!self.state.loading)
							self.event.last.count = self.event.last.count ? self.event.last.count + 1 : 1;
						if (self.event.last.count > 5)
							self.state.remove('emptied');
					}
					if (!self.state.seeking)
						self.elem.ui.track.range.slider('option', 'value', Math.round(self.audio.currentTime * 50));
					var minutes = Math.floor(self.audio.currentTime / 60);
					var mm = ( minutes < 10 ? quran.localize('0') : '' ) + quran.localize(minutes);
					var seconds = Math.floor(self.audio.currentTime - minutes * 60);
					var ss = ( seconds < 10 ? quran.localize('0') : '' ) + quran.localize(seconds);

					self.elem.ui.time.elapsed.text(mm +':'+ ss);
					self.event.last.currentTime_elapsed = self.audio.currentTime;
				},
				last: {}
			};

			self.elem.ui.empty().append(quran.template(self.parent.template.instance));

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

			jQuery.each(quran.data('audio.reciter.order'), function(index, path) {
				var reciter = quran.data('audio.reciter.data');

				jQuery.extend(reciter[path], {
					path : path,
					code : path.toLowerCase().replace(/\//g, '_'), // todo: refactor to schema
					selected : self.parent.setting.reciter == path ? true : false,
					name : quran.data('language').language_code == 'ar' ? reciter[path].arabic : reciter[path].english
				})

				delete reciter[path].arabic;
				delete reciter[path].english;

				self.elem.ui.reciter.panel.list.body.append(
					quran.template(self.parent.template.reciter.list.item.body, reciter[path])
				);
				self.elem.ui.reciter.panel.list.strip.append(
					quran.template(self.parent.template.reciter.list.item.strip, reciter[path])
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

			// audio
			self.audio = self.elem.audio.get(0);
			self.audio.volume = self.parent.setting.volume / 100;

			self.elem.audio.bind('loadstart progress durationchange canplaythrough playing ended pause seeking seeked error timeupdate'+
			' abort canplay emptied loadeddata loadedmetadata play ratechange readystatechange stalled suspend volumechange waiting',
			function(ev) {
				if (self.parent.debug_audio && ev.type != 'timeupdate') {
					console.debug(ev.type, ev.originalEvent, self.key);
				}
				if (self.event[ev.type])
					self.event[ev.type](self, ev.originalEvent);
			});

			// play
			self.elem.ui.play._mouseup(function(ev) {
				self.ui.play.toggle(self, ev)
			});

			// track
			self.elem.ui.track.range.slider({
				start: function(ev, ui) {
					self.state.add('seeking');
				},
				stop: function(ev, ui) {
					if (!self.state._manual_seek)
						self.state.remove('seeking');
				},
				slide: function(ev, ui) {
					if (self.state.duration) {
						var max = self.elem.ui.track.range.slider('option', 'max');
						var currentTime = self.audio.duration * ui.value / max;
						if (!self.event.last.currentTime_slider || Math.abs(currentTime - self.event.last.currentTime_slider) >= 0.25) {
							self.audio.currentTime = currentTime;
							self.event.last.currentTime_slider = currentTime;
						}
					}
				}
			})._mousewheel(function(ev, delta) {
				if (self.state.duration) {
					self.state.add(['seeking', '_manual_seek']);
					var max = self.elem.ui.track.range.slider('option', 'max');
					var value = self.elem.ui.track.range.slider('option', 'value') + delta * Math.ceil(max / 100);
					self.elem.ui.track.range.slider('option', 'value', value);
					var currentTime = self.audio.duration * value / max;
					self.audio.currentTime = currentTime;
				}
			});

			// time

			// config
			self.elem.ui.config.hover(function(ev) {
				self.ui.config.over(self, ev);
			}, function(ev) {
				self.ui.config.out(self, ev);
			});

			// volume
			self.elem.ui.config.panel.list.body.item.volume.range.slider({
				value: self.parent.setting.volume,
				slide: function(ev, ui) {
					self.parent._key = self.key;
					self.audio.volume = ui.value / 100;
				},
				change: function(ev, ui) {
					self.audio.volume = ui.value / 100;

					clearTimeout(self._save_volume_to_session_timeout);
					self._save_volume_to_session_timeout = setTimeout(function() {
						quran.session({ audio: { setting: { volume: ui.value } } });
					}, 1000);

					if (self.key == self.parent._key) {
						self.parent.setting.volume = ui.value;
						jQuery.each(self.parent.instance, function(key, self) {
							if (self.key != self.parent._key) {
								self.elem.ui.config.panel.list.body.item.volume.range.slider('option', 'value', ui.value);
							}
						});
						delete self.parent._key;
					}
				}
			})._mousewheel(function(ev, delta) {
				self.parent._key = self.key;
				var value = self.elem.ui.config.panel.list.body.item.volume.range.slider('option', 'value') + delta * self.elem.ui.config.panel.list.body.item.volume.range.slider('option', 'step');
				self.elem.ui.config.panel.list.body.item.volume.range.slider('option', 'value', value);
			});

			// reciter
			self.elem.ui.reciter.hover(function(ev) {
				self.ui.reciter.over(self, ev);
			}, function(ev) {
				self.ui.reciter.out(self, ev);
			});

			self.elem.ui.reciter.panel.list.body.item._mouseup(function(ev, data) {
				var me = jQuery(this);
				self.ui.reciter.select.from_item(self, me, ev, data);
			});

			self.elem.ui.reciter.panel.list.strip.item.radio._mouseup(function(ev, data) {
				var me = jQuery(this);
				self.ui.reciter.select.from_radio(self, me, ev, data);
			});

			// loop
			self.elem.ui.loop._mouseup(function(ev) {
				self.ui.loop.toggle(self, ev)
			});

			// sequence
			if (self.parent.setting.sequence)
				self.elem.ui.sequence.addClass('on');

			self.elem.ui.sequence._mouseup(function(ev) {
				self.ui.sequence.toggle(self, ev)
			});

			// open
			self.ui.expand(self);

			// start playing
			self.play();

			//console.timeEnd('audioPlayer instance');
		}
	};
	Quran.ui.content.audioPlayer.prototype.audioPlayer.prototype = {
		load: function() {
			var self = this;

			self.elem.audio.attr({ src: self.source() });
			self.audio.load();
		},
		play: function(start) {
			var self = this;

			self.ui.play.on(self);

			self.parent._key = self.key;
			jQuery.each(self.parent.instance, function(key, self) {
				if (self.key != self.parent._key && (self.state.emptied || self.state.play || self.state.loading || self.state.playing))
					self.pause();
			});
			delete self.parent._key;

			if (self.key != quran.state('key'))
				quran.change({ key: self.key, anchor: true }, 'audioPlayer');

			if (self.elem.audio.attr('src') != self.source() || self.state.loading || self.state.error || self.state.emptied)
				self.load();
			else
			if (start || self.state.ended)
				self.audio.currentTime = 0;

			self.audio.play();
		},
		pause: function(end) {
			var self = this;

			self.ui.play.off(self);

			if (end || self.state.ended) {
				self.state.add(['seeking', '_manual_seek']);
				self.audio.currentTime = self.audio.duration - 0.15;
				self.elem.ui.track.range.slider('option', 'value', self.elem.ui.track.range.slider('option', 'max'));
			}

			self.audio.pause();
		},
		source: function() {
			var self = this;

			return self.parent.config.host + self.parent.setting.reciter +'/'+ self.parent.config.format +'/'+ self.config.file +'.'+ self.parent.config.format;
		},
		ui: {
			expand: function(self) {
				self.open = true;
				self.elem.ui.instance.animate({ width: self.elem.ui.width() }, { duration: 500, complete: function() {
					self.elem.ui.instance.removeClass('init');
					self.elem.ui.instance.attr({ style: null });
				}});
			},
			collapse: function(self) {
				self.open = false;
			},
			play: {
				toggle: function(self, ev) {
					if (!self.elem.ui.play.hasClass('on'))
						self.play();
					else
						self.pause();
				},
				on: function(self) {
					self.elem.ui.play.addClass('on');
					self.elem.ui.play.icon.switchClass('play', 'pause');
				},
				off: function(self) {
					self.elem.ui.play.removeClass('on');
					self.elem.ui.play.icon.switchClass('pause', 'play');
				}
			},
			config: {
				over: function(self, ev) {
					var my = this;
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
				out: function(self, ev) {
					var my = this;
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
				over: function(self, ev) {
					var my = this;
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
				out: function(self, ev) {
					var my = this;
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
					from_item: function(self, me, ev, data) {
						var path = me.data('path'),
							code = me.data('code');
						me.addClass('selected').siblings().removeClass('selected').parent().siblings().children().removeClass('selected').children('input').removeAttr('checked').parent().filter('.'+ code).addClass('selected').children('input').attr({ checked: true });
						if (!(data && data.trigger)) {
							self.parent.setting.reciter = path;

							quran.session({ audio: { setting: { reciter: path } } });

							if (self.state.playing)
								self.play();
							jQuery.each(self.parent.instance, function(key, other) {
								if (key == self.key) return;
								other.elem.ui.reciter.panel.list.body.item.filter('.'+ code).trigger('mouseup', { trigger: true });
							});
						}
					},
					from_radio: function(self, me, ev, data) {
						var code = me.parent().data('code');
						me.parent().parent().prev().children().filter('.'+ code).trigger('mouseup');
					}
				}
			},
			loop: {
				toggle: function(self, ev) {
					self.setting.loop = Math.abs(self.setting.loop - 1);
					if (self.setting.loop)
						self.elem.ui.loop.addClass('on');
					else
						self.elem.ui.loop.removeClass('on');
				}
			},
			sequence: {
				toggle: function(self, ev) {
					self.parent.setting.sequence = Math.abs(self.parent.setting.sequence - 1);

					quran.session({ audio: { setting: { sequence: self.parent.setting.sequence } } });

					if (self.parent.setting.sequence) {
						jQuery.each(self.parent.instance, function(key, self) {
							self.elem.ui.sequence.addClass('on');
						});
						quran.ui.body.notificationSystem.message({ title: quran.localize('Audio Player: Sequencing Enabled'), content: quran.localize('Playback automatically transitions to the next ayah upon verse completion.')  });
					}
					else {
						jQuery.each(self.parent.instance, function(key, self) {
							self.elem.ui.sequence.removeClass('on');
						});
						quran.ui.body.notificationSystem.message({ title: quran.localize('Audio Player: Sequencing Disabled'), content: quran.localize('Playback will no longer transition to the next ayah upon verse completion.')  });
					}
				}
			}
		}
	};
}
})( Quran, jQuery );
