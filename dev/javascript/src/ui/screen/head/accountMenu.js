(function( Quran, jQuery ) {
	Quran.ui.head.accountMenu = function(quran) {
		var self = this;

		jQuery.extend(self, { quran : quran });

		if (quran.data('account')) {
			quran.window.load(function() {
				self.init();
			});
			self.elem.accountMenu.one('mousemove', function() {
				self.setup();
			});
		}

		quran.bind('ayahTools:lastmark', function(data) {
			//console.debug('ayahTools:lastmark from accountMenu', this, self, arguments);
			if (!self.initialized) self.init();
		});
		quran.bind('ayahTools:lastmark:deleted', function(data) {
			//console.debug('ayahTools:lastmark:deleted');
			self.elem.item.lastmark.addClass('disabled').find('> .tip').text('empty (no lastmark)');
		});
		function update_lastmark(data) {
			//console.debug('ayahTools:lastmark:updated|created');
			self.elem.item.lastmark.removeClass('disabled').data('x', data).find('> .tip').text(data.key);
		};
		quran.bind('ayahTools:lastmark:created', update_lastmark);
		quran.bind('ayahTools:lastmark:updated', update_lastmark);

		quran.bind('accountMenu:bookmarks', function(data) {
			//console.time('accountMenu:bookmarks');
			window._self = self;
			if (!self.elem.panel_content_initialized.bookmarks) {
				self.elem.panel_content_initialized.bookmarks = true;
				self.elem.panel_content.bookmarks.append(quran.template(self.template.bookmarks, data));
				var elem = {
					    surah : self.elem.panel_content.bookmarks.find('> .left > .wrap > .surahs > .surah'),
					bookmarks : self.elem.panel_content.bookmarks.find('> div.right > table > tbody > tr.bottom > td > div.wrap > ul.surahs > li.surah'),
					   scroll : {
					       up : self.elem.panel_content.bookmarks.find('> .left > .up'),
					     down : self.elem.panel_content.bookmarks.find('> .left > .down')
					}
				};
				elem.active = elem.surah.filter('.active');
				if (!elem.active.length)
					elem.active = elem.surah.first().addClass('active');
				elem.surahs = elem.active.parent();
				elem.wrap   = elem.surahs.parent();
				var scroll = {
					increment : elem.active.height(),
					max : 0,
					up : function() {
						clearTimeout(scroll.timeout.stop);
						jQuery(window)._mouseup(scroll.stop);
						if (scroll.position + scroll.increment <= scroll.max) {
							scroll.position     += scroll.increment;
							scroll.timeout.delay = scroll.timeout.delay <= 20 ? 20 : scroll.timeout.delay - scroll.timeout.delay * 0.2;
							scroll.timeout.go    = setTimeout(scroll.up,       scroll.timeout.delay);
							scroll.timeout.stop  = setTimeout(scroll.stop, 2 * scroll.timeout.delay);
						}
						else {
							scroll.position = scroll.max;
							scroll.stop();
						}
						scroll.go();
					},
					down : function() {
						clearTimeout(scroll.timeout.stop);
						jQuery(window)._mouseup(scroll.stop);
						if (scroll.position - scroll.increment >= scroll.min) {
							scroll.position     -= scroll.increment;
							scroll.timeout.delay = scroll.timeout.delay <= 20 ? 20 : scroll.timeout.delay - scroll.timeout.delay * 0.2;
							scroll.timeout.go    = setTimeout(scroll.down,     scroll.timeout.delay);
							scroll.timeout.stop  = setTimeout(scroll.stop, 2 * scroll.timeout.delay);
						}
						else {
							scroll.position = scroll.min;
							scroll.stop();
						}
						scroll.go();
					},
					stop : function() {
						scroll.timeout.delay = 200,
						clearTimeout(scroll.timeout.go);
						clearTimeout(scroll.timeout.stop);
						jQuery(window).unbind('mouseup');
					},
					go : function() {
						elem.surahs.css({ top : scroll.position });
						if (scroll.position == scroll.min)
							elem.scroll.down.addClass('disabled');
						else
							elem.scroll.down.removeClass('disabled');
						if (scroll.position == scroll.max)
							elem.scroll.up.addClass('disabled');
						else
							elem.scroll.up.removeClass('disabled');
					},
					timeout : { go: null, stop: null, delay: 200 }
				};
				scroll.min = -1 * (scroll.increment * (elem.surah.length - (elem.wrap.height() - 2 * scroll.increment) / scroll.increment));
				scroll.position = -1 * elem.active.position().top + scroll.increment;
				scroll.go();
				elem.scroll.up._mousedown(scroll.up)._mouseup(scroll.stop);
				elem.scroll.down._mousedown(scroll.down)._mouseup(scroll.stop);

				elem.surah._mousedown(function() {
					var me = jQuery(this);
					me.addClass('active').siblings('.active').removeClass('active');
					elem.bookmarks.filter('[data-id='+ me.attr('data-id') +']').addClass('active').siblings('.active').removeClass('active');
					//console.debug(me.attr('data-id'), elem.bookmarks.filter('[data-id='+ me.attr('data-id') +']'));
				});
			}
			//console.timeEnd('accountMenu:bookmarks');
		});

		quran.bind('accountMenu:lastmark', function(data) { // TODO: next task
			//console.debug('accountMenu:lastmark', this, self, arguments);
			var lastmark = data.item.key.split(/:/);
			if (lastmark[0] == quran.page('surah') && lastmark[1] >= quran.page('first') && lastmark[1] <= quran.page('last')) {
				quran.change({ key: data.item.key, context: data.item.context.state, anchor: true });
			}
			else window.location.assign('/'+ quran.data('language').language_code +'/'+ lastmark[0] + data.item.context.range +'#'+ lastmark[1] + data.item.context.state);
		});

		quran.bind('accountMenu:sign-out', function() {
			//console.debug('accountMenu:sign-out', this, self, arguments);
			window.location.replace('/sign/out');
		});
	};
	Quran.ui.head.accountMenu.prototype = {
		elem: {
			accountMenu : jQuery('#account > div.menu')
		},
		template: {
			bookmarks: '\
				<div class="left">\
					<button class="scroll up">\
						<span class="icon up"><b><s class="s1"></s><s class="s2"></s><s class="s3"></s></b></span>\
					</button>\
					<div class="wrap">\
						<ul class="surahs">\
							<% for (var surah in item) { %>\
							<li class="surah<%= quran.page("surah") == surah ? " active" : "" %>" data-id="<%= surah %>"><%= quran.localize("Surat") +" "+ quran.localize(quran.data("surahs")[surah - 1].simple) %></li>\
							<% } %>\
						</ul>\
					</div>\
					<button class="scroll down">\
						<span class="icon down"><b><s class="s1"></s><s class="s2"></s><s class="s3"></s></b></span>\
					</button>\
				</div>\
				<div class="right">\
					<table>\
						<tbody>\
							<tr class="top">\
								<td class="search"></td>\
							</tr>\
							<tr class="bottom">\
								<td>\
									<div class="wrap">\
										<ul class="surahs">\
											<% for (var surah in item) { %>\
											<li class="surah<%= quran.page("surah") == surah ? " active" : "" %>" data-id="<%= surah %>">\
												<ul class="ayahs">\
													<% for (var ayah in item[surah]) { %>\
													<li class="ayah" data-id="<%= ayah %>"><a href="<%= "/"+ surah + item[surah][ayah].context.range +"#"+ ayah + item[surah][ayah].context.state %>"><%= quran.localize(ayah) %></a></li>\
													<% } %>\
												</ul>\
											</li>\
											<% } %>\
										</ul>\
									</div>\
								</td>\
							</tr>\
						</tbody>\
					</table>\
				</div>\
				<div class="preview"></div>\
			',
		},
		init: function() {
			//console.time('accountMenu init');
			var self = this;

			jQuery.extend(self.elem, {
				head : self.elem.accountMenu.find('> div.head'),
				name : self.elem.accountMenu.find('> div.head > label.name'),
				body : self.elem.accountMenu.find('> div.body'),
				menu : self.elem.accountMenu.find('> div.body > menu'),
				item_ : self.elem.accountMenu.find('> div.body > menu > li'),
				item : {}, panel : {}, panel_content : {}, panel_content_initialized: {}
			});

			if (quran.data('account')) {
				self.elem.name.text(quran.data('account').info.name);

				if (quran.data('account').bookmarks !== undefined)
					self.elem.item_.filter('.bookmarks').removeClass('disabled');
				if (quran.data('account').lastmark !== undefined)
					self.elem.item_.filter('.lastmark').removeClass('disabled').find('> .tip').text(quran.data('account').lastmark.key);
			}

			self.elem.item_.each(function() {
				var me = jQuery(this);
				self.elem.item[me.attr('data-id')] = me;
			});

			self.elem.accountMenu.find('> div.body > div.panel').each(function() {
				var me = jQuery(this);
				var id = me.attr('data-id');
				self.elem.panel[id] = me;
				self.elem.panel_content[id] = me.find('> div.content');
				self.elem.panel_content[id].width(self.elem.panel_content[id].width());
			});

			self.ui.body.height = { end: self.elem.menu.height(), start: 0 };

			if (!self.initialized) self.initialized = true;
			//console.timeEnd('accountMenu init');
		},
		setup: function() {
			console.time('accountMenu setup');
			var self = this;

			var timeout = { enter: null, leave: null, leave_clicked: null },
			      delay = { enter: 382,  leave: 618,  leave_clicked: 1618 };

			timeout.enter = setTimeout(function() {
				self.ui.body.expand(self);
			}, delay.enter);

			self.elem.accountMenu._mouseenter(function() {
				if (!self.elem.head.hasClass('clicked')) {
					clearTimeout(timeout.leave);
					if (self.elem.body.hasClass('collapse'))
						self.ui.body.expand(self);
					else
						timeout.enter = setTimeout(function() {
							self.ui.body.expand(self);
						}, delay.enter);
				}
				else
					clearTimeout(timeout.leave_clicked);
			})._mouseleave(function() {
				clearTimeout(timeout.enter);
				if (!self.elem.head.hasClass('clicked')) {
					if (self.elem.body.hasClass('expand'))
						self.ui.body.collapse(self);
					else
						timeout.leave = setTimeout(function() {
							self.ui.body.collapse(self);
						}, delay.leave);
				}
				else {
					timeout.leave_clicked = setTimeout(function() {
						self.elem.head.removeClass('clicked');
						self.ui.body.collapse(self);
					}, delay.leave_clicked);
				}
			});

			self.elem.head._mousedown(function() {
				if (self.elem.head.hasClass('clicked') || self.elem.body.hasClass('open')) {
					self.elem.head.removeClass('clicked');
					self.ui.body.collapse(self);
				}
				else {
					self.elem.head.addClass('clicked');
					self.ui.body.expand(self);
				}
			});

			jQuery.each(self.elem.item, function(id, item) {
				var data = self.quran.data('account')[id];
				if (data) {
					data = jQuery.sort(data);
					for (var key in data)
						if (typeof(data[key]) == 'object' && data[key].length === undefined)
							data[key] = jQuery.sort(data[key]);
					item.data({ item: data });
				}
				item._mousedown(function() {
					if (!item.hasClass('disabled')) {
						self.quran.trigger('accountMenu:'+ id, item.data());
						if (self.elem.panel[id])
							if (self.elem.panel[id].hasClass('open') || self.elem.panel[id].hasClass('out'))
								self.ui.panel.slide.in_(self, id);
							else
								self.ui.panel.slide.out(self, id);
					}
				});
			});

			console.timeEnd('accountMenu setup');
		},
		ui: {
			body: {
				factor: 3,
				expand: function(self) {
					var body = self.elem.body;
					var height = this.height.end, duration = this.factor * (this.height.end - body.height());
					body.removeClass('collapse').addClass('expand').stop().animate({ height: height }, duration, 'swing', function() {
						body.removeClass('expand').addClass('open');
					});
				},
				collapse: function(self) {
					var body = self.elem.body;
					var height = 0, duration = this.factor * body.height();
					body.removeClass('open').removeClass('expand').addClass('collapse').stop().animate({ height: height }, duration, 'swing', function() {
						body.removeClass('collapse');
					});
				}
			},
			panel: {
				slide: {
					left: {}, width: {},
					factor: 2,
					out: function(self, id) {
						if (this.current && this.current != id)
							self.ui.panel.slide.in_(self, this.current);
						this.current = id;
						this.width[id] = this.width[id] || {};
						this.width[id].start = this.width[id].start || self.elem.body.width();
						this.width[id].end = this.width[id].end || self.elem.panel[id].find('> .content').width();
						this.left[id] = this.left[id] || {};
						this.left[id].start = 0;
						this.left[id].end = this.left[id].end || this.width[id].start;
						var duration = {
							 left : (this.left[id].end - self.elem.panel[id].position().left) / this.factor,
							width : (this.width[id].end - self.elem.panel[id].width()) / this.factor
						};
						var that = this;
						self.elem.panel[id].removeClass('in').addClass('out').stop().animate({ width: this.width[id].end }, duration.width, 'linear', function() {
							self.elem.panel[id].animate({ left: that.left[id].end }, duration.left, 'linear', function() {
								self.elem.panel[id].removeClass('out').addClass('open');
							});
						});
					},
					in_: function(self, id) {
						this.current = null;
						var duration = {
							 left : (self.elem.panel[id].position().left - this.left[id].start) / this.factor,
							width : (self.elem.panel[id].width() - this.width[id].start) / this.factor
						};
						var that = this;
						self.elem.panel[id].removeClass('open').removeClass('out').addClass('in').stop().animate({ left: this.left[id].start }, duration.left, 'linear', function() {
							self.elem.panel[id].animate({ width: that.width[id].start }, duration.width, 'linear', function() {
								self.elem.panel[id].removeClass('in');
							});
						});
					}
				}
			}
		}
	};
})( Quran, jQuery );
