(function( Quran, jQuery ) {
	Quran.ui.content.ayahTools = function(quran) {
		var self = this;

		jQuery.extend(self, { quran : quran });

		quran.window.load(function() {
			self.elem.td.menu._mousemove(function() {
				var me = jQuery(this);
				self.init({ menu : true }, me);
			});
			self.elem.td.state._mousemove(function() {
				var me = jQuery(this);
				self.init({ state : true }, me);
			});
		});

		function markAyah(data) {
			//console.debug('ayahTools:'+ data.id, this, self, arguments);
			var url = '/u/'+ data.id, params = {
						key : data.key,
				context : {
					range : window.location.pathname.replace(/^\/[^\/]+\/[\d]+\/([-\d]+)/,'/$1').replace(/\/$/,''), // quick hack
					state : quran.state('context')
				}
			};

			params.context.range = /^\/[-\d]+$/.test(params.context.range) ? params.context.range : '/'+ data.key.split(/:/)[1]; // quick hack

			jQuery.ajax({ url: url, type: 'POST', contentType: 'application/json', data: JSON.stringify(params), success: function(result) {
				if (result.action) {
					if (result.action == 'deleted') {
						self.instance[data.key].elem.item.state[data.id].removeClass('active');
						self.instance[data.key].elem.item.menu[data.id].removeClass('active');
					} else
					if (result.action == 'created') {
						self.instance[data.key].elem.item.state[data.id].addClass('active');
						self.instance[data.key].elem.item.menu[data.id].addClass('active');
					} else
					if (result.action == 'updated') {
						if (data.id == 'lastmark') {
							self.elem.td.state.filter('[data-key != "'+ data.key +'"]').find('> div.wrap > ul > li.lastmark.active').removeClass('active');
							self.instance[data.key].elem.item.state[data.id].addClass('active');
							self.instance[data.key].elem.item.menu[data.id].addClass('active');
						}
					}
					quran.ui.body.notificationSystem.message({ title: quran.localize(data.id +' '+ result.action), content: '' });
					jQuery.extend(params, result);
					quran.trigger('ayahTools:'+ data.id +':'+ result.action, params);
				}
			}});
		};

		quran.bind('ayahTools:lastmark', markAyah);

		quran.bind('ayahTools:bookmark', markAyah);

		quran.bind('ayahTools:bookmark:created', function(data) {
			//console.debug('ayahTools:bookmark:created', this, self, arguments);
		});

		quran.bind('ayahTools:bookmark:updated', function(data) {
			//console.debug('ayahTools:bookmark:updated', this, self, arguments);
		});

		quran.bind('ayahTools:bookmark:deleted', function(data) {
			//console.debug('ayahTools:bookmark:deleted', this, self, arguments);
		});
	};
	Quran.ui.content.ayahTools.prototype = {
		elem: {
			td : {
				 menu : jQuery('#content div.ayah header td.ayahTools.menu'),
				state : jQuery('#content div.ayah header td.ayahTools.state')
			}
		},
		instance: {},
		init: function(from, me) {
			var self = this;
			var key = me.unbind('mousemove').attr('data-key');
			if (!self.instance[key]) {
				//console.time('ayahTools init');

				self.instance[key] = {
					key  : key,
					elem : {
						td : {
							 menu : ( from.menu  ? me : me.siblings('td.ayahTools.menu')  ),
							state : ( from.state ? me : me.siblings('td.ayahTools.state') )
						}
					},
					ui : {
						timeout : { enter: null, leave: null, clicked: null },
						  delay : { enter: 382,  leave: 618,  clicked: 1618 },
						 height : { start: 0 }
					}
				};

				var instance = self.instance[key];

				jQuery.extend(instance.elem, {
					menu : {
						head : instance.elem.td.menu.find('> div.wrap > div.head'),
						body : instance.elem.td.menu.find('> div.wrap > div.body'),
						list : instance.elem.td.menu.find('> div.wrap > div.body > menu')
					},
					item : {
						 menu : {},
						panel : {},
						state : {}
					}
				});

				instance.ui.height.end = instance.elem.menu.list.height();

				instance.elem.menu.list.find('> li').each(function() {
					var me = jQuery(this);
					instance.elem.item.menu[me.attr('data-id')] = me;
				});

				instance.elem.td.state.find('> div.wrap > ul > li').each(function() {
					var me = jQuery(this);
					instance.elem.item.state[me.attr('data-id')] = me;
				});

				window._instance = instance;
				window._self = self;

				self.ui.setup(self, instance);

				if (from.menu)
					instance.ui.timeout.enter = setTimeout(function() {
						self.ui.body.expand(self, instance);
					}, instance.ui.delay.enter);

				//console.timeEnd('ayahTools init');
			}
		},
		ui: {
			setup: function(self, instance) {
				//console.time('ayahTools setup');

				instance.elem.td.menu._mouseenter(function() {
					clearTimeout(instance.ui.timeout.enter);
					clearTimeout(instance.ui.timeout.leave);
					clearTimeout(instance.ui.timeout.clicked);
					if (!instance.elem.menu.head.hasClass('clicked')) {
						if (instance.elem.menu.body.hasClass('collapse'))
							self.ui.body.expand(self, instance);
						else {
							instance.ui.timeout.enter = setTimeout(function() {
								self.ui.body.expand(self, instance);
							}, instance.ui.delay.enter);
						}
					}

					self.quran.window._mousemove(function(ev) {
						if (!jQuery(ev.target).parents('td.ayahTools.menu').length) {
							self.quran.window.unbind('mousemove');
							instance.elem.td.menu.trigger('mouseleave');
						}
					});
				})._mouseleave(function() {
					clearTimeout(instance.ui.timeout.enter);
					clearTimeout(instance.ui.timeout.leave);
					clearTimeout(instance.ui.timeout.clicked);
					if (!instance.elem.menu.head.hasClass('clicked')) {
						if (instance.elem.menu.body.hasClass('expand'))
							self.ui.body.collapse(self, instance);
						else
							instance.ui.timeout.leave = setTimeout(function() {
								self.ui.body.collapse(self, instance);
							}, instance.ui.delay.leave);
					}
					else {
						instance.ui.timeout.clicked = setTimeout(function() {
							instance.elem.menu.head.removeClass('clicked');
							self.ui.body.collapse(self, instance);
						}, instance.ui.delay.clicked);
					}
				});

				instance.elem.menu.head._mousedown(function() {
					if (instance.elem.menu.head.hasClass('clicked') || instance.elem.menu.body.hasClass('open')) {
						instance.elem.menu.head.removeClass('clicked');
						self.ui.body.collapse(self, instance);
					}
					else {
						instance.elem.menu.head.addClass('clicked');
						self.ui.body.expand(self, instance);
					}
				});

				jQuery.each(instance.elem.item.menu, function(id, item) {
					item._mousedown(function() {
						if (!item.hasClass('disabled')) {
							var data = item.data();
							data.key = instance.key, data.clicked_from = 'menu';
							self.quran.trigger('ayahTools:'+ id, data);
							if (instance.elem.item.panel[id])
								if (instance.elem.item.panel[id].hasClass('open') || instance.elem.item.panel[id].hasClass('out'))
									self.ui.panel.slide.in_(self, instance, id);
								else
									self.ui.panel.slide.out(self, instance, id);
						}
					})._mouseenter(function() {
						item.find('> label').removeClass('hidden');
					})._mouseleave(function() {
						item.find('> label').addClass('hidden');
					});
				});
				jQuery.each(instance.elem.item.state, function(id, item) {
					item._mousedown(function() {
						if (!item.hasClass('disabled')) {
							var data = item.data();
							data.key = instance.key, data.clicked_from = 'state';
							self.quran.trigger('ayahTools:'+ id, data);
						}
					});
				});
				//console.timeEnd('ayahTools setup');
			},
			body: {
				duration : 3,
				expand: function(self, instance) {
					var height = instance.ui.height.end,
					  duration = self.ui.body.duration * (instance.ui.height.end - instance.elem.menu.body.height());
					instance.elem.menu.body.removeClass('collapse').addClass('expand').stop().animate({ height: height }, duration, 'swing', function() {
						instance.elem.menu.body.removeClass('expand').addClass('open');
					});
				},
				collapse: function(self, instance) {
					var height = 0, duration = self.ui.body.duration * instance.elem.menu.body.height();
					instance.elem.menu.body.removeClass('open').removeClass('expand').addClass('collapse').stop().animate({ height: height }, duration, 'swing', function() {
						instance.elem.menu.body.removeClass('collapse');
					});
				}
			},
			panel: {
				slide: {
					in_: function(self, instance, id) {
					},
					out: function(self, instance, id) {
					}
				}
			}
		}
	};
})( Quran, jQuery );
