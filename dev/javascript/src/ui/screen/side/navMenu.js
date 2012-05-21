(function( Quran, jQuery ) {
	jQuery.widget('quran.navMenu', {
		options: {
			headers: '> header',
			event: 'click',
			active: [0],
			fillHeight: true,
			expand: [2,0,1],
			collapse: [0,2,1],
			minHeight: 85
		},
		_create: function() {
			var self = this;

			self.window = jQuery(window);
			self.document = jQuery(document);

			self.animating = false;

			self.headers = self.element.find(self.options.headers);

			self.element.attr('role', 'tablist');
			self.headers.attr('role', 'tab').next().attr('role', 'tabpanel');

			self.active = self._findActive(self.options.active);

			self.headers.addClass('open').next().addClass('open').prev().not(self.active).attr({
				'aria-expanded': 'false',
				'aria-selected': 'false',
				'tabindex': -1
			}).removeClass('open').next().removeClass('open').hide();

			if (!self.active.length)
				self.headers.eq(0).attr('tabindex', 0);
			else
				self.active.attr({
					'aria-expanded': 'true',
					'aria-selected': 'true',
					tabindex: 0
				});

			self._setupEvents(self.options.event);

			if (self.options.on.resize) {
				self.element.bind('resize.navMenu', self.options.on.resize);

				var proxy = jQuery.proxy(self, '_resize');

				self.document.ready(proxy);
				self.window.resize(proxy);
			} else
			if (self.options.fillHeight)
				self.document.ready(jQuery.proxy(function() {
					var self = this;

					self._fillHeight();
				}, self));

			if (self.options.on.toggle)
				self.element.bind('toggle.navMenu', self.options.on.toggle);

			if (self.options.on.created)
				self.element.bind('created.navMenu', self.options.on.created);

			self.element.trigger('created.navMenu');
		},
		_resize: function(event, data) {
			var self = this;

			self.element.trigger('resize.navMenu');

			if (self.options.fillHeight)
				self._fillHeight();
		},
		_findActive: function(selected) {
			var self = this,
				active = jQuery();

			if (typeof selected == 'object' && selected.length && !selected.jquery)
				jQuery.each(selected, function(i, val) {
					active = active.add(self.headers.eq(val));
				});
			else
			if (typeof selected == 'number')
				active = self.headers.eq(selected);
			else
				active = active.add(self.headers.filter(selected));

			return active;
		},
		_setupEvents: function(event) {
			var self = this;

			if (event)
				self.headers.bind(event.split(/ /).join('.navMenu ') +'.navMenu', jQuery.proxy(self, '_eventHandler'));
		},
		_eventHandler: function(event) {
			var self = this,
			clicked = jQuery(event.currentTarget);
			collapsing = self.active.filter(clicked).length ? true : false,
			params = {
				hide: collapsing ? clicked.next() : jQuery(),
				show: collapsing ? jQuery() : clicked.next()
			},
			self.options.active = collapsing && self.active.length == 1 ? jQuery() : self.headers.index(clicked),
			self.active = collapsing ? self.active.not(clicked) : self.active.add(clicked);

			event.preventDefault();

			self._toggle(params);
		},
		_innerHeight: function(element) {
			var self = this,
				innerHeight = element.data('innerHeight') || 0;

			if (innerHeight)
				return innerHeight;

			function _innerHeight() {
				element.children().each(function() {
					var me = jQuery(this);
					if (me.is(':visible'))
						innerHeight += me.outerHeight(true);
				});
			};

			if (element.is(':hidden')) {
				element.css({ display: 'block', visibility: 'hidden', position: 'absolute', right: -10000 });
				_innerHeight();
				element.css({ display: 'none', visibility: '', position: '', right: '' });
			}
			else _innerHeight();

			if (element.get(0) !== self.element.get(0))
				element.data('innerHeight', innerHeight);

			return innerHeight;
		},
		_availableHeight: function(params) {
			var self = this,
				params = params || {},
				availableHeight = self.element.height() - self._innerHeight(self.element);

			if (params.show && params.show.length) {
				if (params.show.is(':hidden')) {
					availableHeight -= params.show.outerHeight(true);
				}
			} else
			if (params.hide && params.hide.length) {
				if (params.hide.is(':visible')) {
					availableHeight += params.hide.outerHeight(true);
				}
			}

			return availableHeight;
		},
		_toggle: function(params) {
			var self = this;

			if (self.options.fillHeight)
				self._fillHeight(params);

			if (self.options.animation)
				self._animate(params);
			else {
				params.show.show();
				params.hide.hide();
				self._complete(params);
			}
		},
		_fillHeight: function(params) {
			var self = this,
				availableHeight = self._availableHeight(params),
				originalAvailable = availableHeight;

			var cascade = {
				collapse: function(i, index) {
					if (availableHeight < 0) {
						var panel = self.headers.eq(index).next(),
							oldHeight = panel.height(),
							outerHeight = panel.outerHeight(true),
							collapseHeight = availableHeight + outerHeight,
							targetHeight = availableHeight + oldHeight,
							innerHeight = self._innerHeight(panel),
							minHeight = innerHeight < self.options.minHeight ? innerHeight : self.options.minHeight,
							newHeight = collapseHeight > minHeight ? targetHeight : minHeight;
						if (newHeight >= innerHeight)
							panel.css('height', '');
						else panel.height(newHeight);
						availableHeight = self._availableHeight(params);
						if (self.options.collapse[++i] !== undefined)
							cascade.collapse(i, self.options.collapse[i]);
					}
					else cascade.expand(0, self.options.expand[0]);
				},
				expand: function(i, index) {
					if (availableHeight > 0) {
						var panel = self.headers.eq(index).next(),
							oldHeight = panel.height(),
							outerHeight = panel.outerHeight(true),
							expandHeight = availableHeight + outerHeight,
							targetHeight = availableHeight + oldHeight,
							innerHeight = self._innerHeight(panel),
							maxHeight = innerHeight,
							newHeight = expandHeight < maxHeight ? targetHeight : maxHeight;
						if (newHeight == innerHeight)
							panel.css('height', '');
						else panel.height(newHeight);
						availableHeight = self._availableHeight(params);
						if (self.options.expand[++i] !== undefined)
							cascade.expand(i, self.options.expand[i]);
					} else return;
				}
			};

			cascade.collapse(0, self.options.collapse[0]);

			return params;
		},
		_animate: function(params) {
			var self = this,
				animation = self.options.animation,
				params = jQuery.extend(params, self.options.animation.params),
				extend = {
					complete: function() {
						self.animating = false;
						self._complete(params);
						setTimeout(function() {
							if (params.show && params.show.length)
								params.show.removeClass('animating');
							if (params.hide && params.hide.length)
								params.hide.removeClass('animating');
						}, 200);
					}
				};

				self.animating = true;
				if (params.show && params.show.length)
					params.show.addClass('animating');
				if (params.hide && params.hide.length)
					params.hide.addClass('animating');

				jQuery.quran.navMenu.animations[animation.name](params, extend, self);
		},
		_complete: function(params) {
			var self = this,
				showing = params.show && params.show.length;

			self.animating = false;

			if (showing)
				params.show.addClass('open').prev().addClass('open').attr({
					'aria-expanded': 'true',
					'aria-selected': 'true',
					'tabindex': 0
				}).focus();
			else
				params.hide.removeClass('open').prev().removeClass('open').attr({
					'aria-expanded': 'false',
					'aria-selected': 'false',
					'tabindex': -1
				}).blur();

			self.element.trigger('toggle.navMenu', { active: self.active, toggled: showing ? params.show : params.hide });
		},
		_last: {}
	});

	jQuery.extend(jQuery.quran.navMenu, {
		animations: {
			slide: function(params, extend, self) {

				if (params.show && params.show.length) {
					params.show.animate({
						height: params.height || 'show',
					}, {
						duration: params.duration * (params.height || params.show.height()),
						easing: 'linear',
						complete: function() {
							if (params.complete)
								params.complete();
							if (extend.complete)
								extend.complete();
						}
					});
					return;
				}
				if (params.hide && params.hide.length) {
					params.hide.animate({
						height: params.height || 'hide',
					}, {
						duration: params.duration * (params.height || params.hide.height()),
						easing: 'linear',
						complete: function() {
							if (params.complete)
								params.complete();
							if (extend.complete)
								extend.complete();
						}
					});
					return;
				}
			}
		}
	});

	jQuery.template('navMenu.resource', '\
		<tr id="resource-${ type }-${ resource_code }-${ key.split(/:/).join("-") }" class="${ type == resource_code ? type : type +" "+ resource_code }" data-priority="${ priority }">\
			<th title="${ author.name == "Unknown" ? name : author.name }"><h2>${ name }</h2></th>\
			<td><p>{{html text }}</p></td>\
		</tr>\
	');

	jQuery.template('navMenu.words', '\
		<p class="words" data-key="${ key }">{{each words}}{{if $value.type == "word"}} {{/if}}<b class="${ $value.type } p${ $value.page }" dir="${ quran.data("language").direction }" data-glyph-id="${ $value.glyph_id }"{{if $value.type == "word"}} data-word-id="${ $value.word_id }"{{if $value.translation}} title="${ $value.translation }"{{/if}}{{/if}}>${ $value.code }</b>{{/each}}</p>\
	');

	jQuery.template('navMenu.images', '\
		<p class="images"><img src="${ images.url }" alt="${ images.alt }" width="${ images.width }" /></p>\
	');

	jQuery.template('navMenu.text', '\
		<p class="text ${ text.resource_code }">${ text.text }</p>\
	');

	Quran.ui.side.navMenu = function(quran) {
		var self = this;

		quran.document.ready(function() {
			console.time('navMenu init');
			self._init();
			console.timeEnd('navMenu init');
		});
	};
	Quran.ui.side.navMenu.prototype = {
		element: jQuery('#side > nav'),
		_init: function() {
			var self = this;

			self._setupHeaders();
			self._setupSections();
			self._restoreSession();
			self._createWidget();
		},
		_createWidget: function() {
			var self = this,
				active = quran.session('navMenu.active') || '.surahs';

			self.element.navMenu({
				headers: 'header.panel',
				active: active,
				on: {
					resize: jQuery.proxy(self, '_resizeHandler'),
					toggle: jQuery.proxy(self, '_toggleHandler'),
					created: jQuery.proxy(self, '_selectSurah')
				},
			});
		},
		_resizeHandler: function(event, data) {
			event.preventDefault();
			event.stopPropagation();

			var self = this,
				newHeight = quran.window.height() - (self.element.offset().top - quran.window.scrollTop()) - 117;

			self.element.height(newHeight);
		},
		_toggleHandler: function(event, data) {
			event.preventDefault();
			event.stopPropagation();

			var self = this
				classNames = [],
				selector = (function() {
					data.active.each(function() {
						classNames.push(jQuery(this).attr('class').split(/ /)[0]);
					});
					return classNames.length ? '.'+ classNames.join(', .') : '';
				})();

			quran.session({ navMenu: { active: selector } });
		},
		_restoreSession: function() {
			var self = this,
				sortOrder = quran.session('navMenu.sortOrder'),
				textSize = quran.session('navMenu.textSize');

			if (sortOrder)
				self._sortSurahs(sortOrder);

			if (textSize && textSize.quran)
				self.header.quran.find('input.textSize').val(parseInt(textSize.quran));
			else
				self.header.quran.find('input.textSize').val(100);

			if (textSize && textSize.resources)
				self.header.resources.find('input.textSize').val(parseInt(textSize.resources));
			else
				self.header.resources.find('input.textSize').val(100);

			self._restoreSelections();
		},
		_restoreSelections: function() {
			var self = this,
				selected = quran.session('content'),
				language = quran.data('language'),
				resources = selected.resources[language.language_code];

			self.input.quran.prop('checked', false);
			self.input.resources.prop('checked', false);

			if (selected.quran.text) {
				self.input.quran.filter('.text.key').prop('checked', true).val(selected.quran.text).prev().find('span.value').text(self._tanzilTextLabel(selected.quran.text));
				self.section.quran.find('input.text.val.'+ selected.quran.text).prop('checked', true).closest('li').addClass('selected');
			}
			else self.section.quran.find('input.text.val[checked]').prop('checked', true).closest('li').addClass('selected');

			if (selected.quran.words)
				self.input.quran.filter('.words').prop('checked', true);
			else
			if (selected.quran.images)
				self.input.quran.filter('.images').prop('checked', true);

			if (resources.transliteration)
				self.input.resources.filter('.transliteration').prop('checked', true);
			else
				self.input.resources.filter('.transliteration').prop('checked', false);
			if (resources.translation)
				jQuery.each(resources.translation, function(resource_code, selected) {
					if (selected)
						self.input.resources.filter('.translation.'+ resource_code).prop('checked', true);
					else
						self.input.resources.filter('.translation.'+ resource_code).prop('checked', false);
				});
		},
		_setupHeaders: function() {
			var self = this;

			self.header = {
				resources : self.element.find('> header.resources'),
				   surahs : self.element.find('> header.surahs'),
				    quran : self.element.find('> header.quran'),
			};

			self.header.surahs.find('button.sort').bind('click.navMenu', jQuery.proxy(self, '_sortHandler'));
			self.header.quran.add(self.header.resources).find('button.size').bind('click.navMenu', jQuery.proxy(self, '_sizeHandler'));
		},
		_setupSections: function() {
			var self = this;

			self.section = {
				resources : self.element.find('> section.resources'),
				   surahs : self.element.find('> section.surahs'),
				    quran : self.element.find('> section.quran')
			};

			self.input = {
				resources : self.section.resources.find('input'),
				    quran : self.section.quran.find('input')
			};

			self._setupTanzilMenu();
			self._setupSelection();
		},
		_setupTanzilMenu: function() {
			var self = this;

			self.section.quran.find('li.text span.toggle').bind('click.navMenu', jQuery.proxy(self, '_tanzilMenuToggleHandler'));
			self.section.quran.find('li.text')
				.bind('mouseleave.navMenu', jQuery.proxy(self, '_tanzilMenuMouseHandler'))
				.bind('mouseenter.navMenu', jQuery.proxy(self, '_tanzilMenuMouseHandler'));
			self.section.quran.find('li.text menu li').bind('click.navMenu', jQuery.proxy(self, '_tanzilMenuSelectHandler'));
		},
		_tanzilMenuToggleHandler: function(event, data) {
			event.preventDefault();
			event.stopPropagation();

			var self = this,
				target = jQuery(event.currentTarget),
				menu = target.parent().next();

			self._tanzilMenuToggle(menu);
		},
		_tanzilMenuToggle: function(menu, params) {
			var self = this,
				params = jQuery.extend({}, params),
				h2 = menu.toggle().prev(),
				input = h2.find('input.text.key'),
				className = 'open',
				addClass = menu.is(':visible') ? true : false;

			if (addClass) {
				menu.addClass(className);
				h2.addClass(className);
			}
			else {
				menu.removeClass(className);
				h2.removeClass(className);
				if (!params.mouseleave && !input.is(':checked'))
					input.prop('checked', true).trigger('change');
			}
		},
		_tanzilMenuMouseHandler: function(event, data) {
			event.preventDefault();
			event.stopPropagation();

			var self = this,
				target = jQuery(event.currentTarget),
				menu = target.find('menu');

			if (event.type == 'mouseleave')
				self._tanzilMenuTimeout.mouseleave = setTimeout(function() {
					if (menu.is(':visible'))
						self._tanzilMenuToggle(menu, { mouseleave: true });
				}, 400);
			else
			if (event.type == 'mouseenter')
				clearTimeout(self._tanzilMenuTimeout.mouseleave);
		},
		_tanzilMenuTimeout: {},
		_tanzilMenuSelectHandler: function(event, data) {
			event.preventDefault();
			event.stopPropagation();

			var self = this,
				li = jQuery(event.currentTarget),
				menu = li.parent(),
				h2 = menu.prev(),
				childInput = li.find('input.text.val'),
				parentInput = h2.find('input.text.key'),
				labelSpan = h2.find('span.value'),
				newValue = childInput.val(),
				newLabel = self._tanzilTextLabel(newValue);

			li.addClass('selected').siblings('.selected').removeClass('selected');
			labelSpan.text(newLabel);
			childInput.val(newValue).prop('checked', true);
			parentInput.val(newValue).prop('checked', true).trigger('change');

			self._tanzilMenuToggle(menu);
		},
		_tanzilTextLabel: function(value) {
			var label = [];
			jQuery.each(value.split(/_/, 2), function(i, word) {
				var match = word.match(/^(.)(.*)$/);
				label.push(match[1].toUpperCase() + match[2]);
			});
			return label.join(' ');
		},
		_setupSelection: function() {
			var self = this;

			self.inputData = {
				         keys : quran.data('keys'),
				       cached : quran.data('content.cached'),
				language_code : quran.data('language').language_code
			};

			self.input.resources.filter('.ajax').bind('change.navMenu', jQuery.proxy(self, '_selectResourceHandler'));
			self.input.quran.filter('.ajax').bind('change.navMenu', jQuery.proxy(self, '_selectQuranHandler'));
		},
		_selectResourceHandler: function(event, data) {
			event.preventDefault();
			event.stopPropagation();

			var self = this,
				input = jQuery(event.currentTarget),
				type = input.data('type'),
				resource_code = input.attr('name'),
				value = input.is(':checked') ? 1 : 0,
				sessionData = (function() {
					var data = {}, ref = data, keys = ['content', 'resources', self.inputData.language_code, type, resource_code];
					for (var i = 0; i < keys.length; i++) {
						ref[keys[i]] = i == keys.length - 1 ? value : {};
						ref = ref[keys[i]];
					}
					return data;
				})();

			jQuery.each(self.inputData.keys, function(index, key) {
				var content = jQuery('#resource-'+ type +'-'+ resource_code +'-'+ key.split(/:/).join('-'));

				if (value)
					content.removeClass('hidden');
				else content.addClass('hidden');
			});

			self._last_key = quran.state('key');

			quran.session(sessionData, self.inputData, { url: '/content', abort: true, success: jQuery.proxy(self, '_selectResourceCallback') });
		},
		_selectResourceCallback: function(result) {
			var self = this;

			if (result.saved) {
				if (result.content && result.content.resources) {
					jQuery.each(result.content.resources, function (key, data) {
						jQuery.each(data, function(index, data) {
							jQuery.extend(data, { key: key });
							var content = jQuery.tmpl('navMenu.resource', data),
								append = jQuery('#ayah-'+ key.split(/:/).join('-') +' > section.resources > table > tbody'),
								before = append.find('> tr').filter(function(index) {
									return data.priority < jQuery(this).attr('data-priority');
								}).first();
								if (before.length)
									before.before(content);
								else
									append.append(content);
						});
					});
				}
				if (result.cached)
					self.inputData.cached = result.cached;

				quran.window.triggerHandler('resize');
				quran.change({ key: self._last_key, force: true, anchor: true }, 'navMenu:_selectResourceCallback');
			}
		},
		_selectQuranHandler: function(event, data) {
			event.preventDefault();
			event.stopPropagation();

			var self = this,
				input = jQuery(event.currentTarget),
				type = input.data('type'),
				value = type == 'text' ? input.val() : 1,
				sessionData = (function() {
					var data = {}, ref = data, keys = ['content', 'quran', type];
					for (var i = 0; i < keys.length; i++) {
						ref[keys[i]] = i == keys.length - 1 ? value : {};
						ref = ref[keys[i]];
					}
					return data;
				})();

			if (self.inputData.cached.quran[type] && (type != 'text' || self.inputData.cached.quran[type][value])) {
				jQuery('#content section.quran div.content p').filter('.'+ type + ( type == 'text' ? '.'+ value : '' )).removeClass('hidden').siblings().addClass('hidden');
			}

			self._last_key = quran.state('key');

			quran.session(sessionData, self.inputData, { url: '/content', abort: true, success: jQuery.proxy(self, '_selectQuranCallback') });
		},
		_selectQuranCallback: function(result) {
			var self = this;

			if (result.saved) {
				if (result.content && result.content.quran) {
					jQuery.each(result.content.quran, function (key, data) {
						jQuery.extend(data, { key: key });
						var content, append = jQuery('#ayah-'+ key.split(/:/).join('-') +' > section.quran > div.content');
						if (data.words)
							type = 'words', content = jQuery.tmpl('navMenu.words', data);
						else if (data.images)
							type = 'images', content = jQuery.tmpl('navMenu.images', data);
						else if (data.text)
							type = 'text', content = jQuery.tmpl('navMenu.text', data);
						if (content)
							content.appendTo(append).siblings().addClass('hidden');
					});
				}
				if (result.cached)
					self.inputData.cached = result.cached;

				quran.ui.content.wordSystem.setup();
				quran.ui.content.noFOUT.check();

				quran.window.triggerHandler('resize');
				quran.change({ key: self._last_key, force: true, anchor: true }, 'navMenu:_selectQuranCallback');
			}
		},
		_sortSurahs: function(sortOrder) {
			var self = this,
				menu = self.section.surahs.find('> menu'),
				li = menu.find('> li'),
				oldOrder = self.currentOrder || 'number',
				sortOrder = sortOrder ? sortOrder : oldOrder == 'number' ? 'revelation' : 'number',
				newClass = 'sorted-by-'+ sortOrder,
				oldClass = 'sorted-by-'+ oldOrder,
				sorted;

				if (sortOrder != oldOrder) {
					sorted = li.sort(function(a, b) {
						return a.getAttribute('data-'+ sortOrder) - b.getAttribute('data-'+ sortOrder);
					}),

					menu.empty().append(sorted);

					self.header.surahs.removeClass(oldClass).addClass(newClass).next().removeClass(oldClass).addClass(newClass);
				}

			self.currentOrder = sortOrder;

			self._selectSurah();

			return sortOrder;
		},
		_sortHandler: function(event, data) {
			event.preventDefault();
			event.stopPropagation();

			var self = this,
				sortOrder = self._sortSurahs();

			quran.session({ navMenu: { sortOrder: sortOrder } });
		},
		_selectSurah: function() {
			var self = this,
				surah = quran.data('class') == 'main' ? quran.page('surah') : null,
				selected = surah ? self.section.surahs.find('li[data-number='+ surah +']') : jQuery(),
				scrollTop = selected.length ? selected.position().top : 0;

			selected.addClass('selected').children('a').removeClass('href');
			self.section.surahs.scrollTop(scrollTop);
		},
		_sizeHandler: function(event, data) {
			event.preventDefault();
			event.stopPropagation();

			var self = this,
				button = jQuery(event.currentTarget),
				params = button.data();

			self._last_key = quran.state('key');

			if (!params._sizeParams)
				params = self._sizeParams(button);

			params.sizeMethod(params);

			self._sizeFinish(params);
		},
		_sizeParams: function(button) {
			var self = this,
				input = button.parent().next(),
				contentClass = input.attr('class').split(/[\s]+/)[1],
				buttonClass = button.attr('class').split(/[\s]+/)[1],
				params = {
					_sizeParams: true,
					input: input,
					inc: parseInt(input.attr('data-inc')),
					min: parseInt(input.attr('data-min')),
					max: parseInt(input.attr('data-max')),
					className: contentClass,
					content: jQuery('#content > div.container > section.'+ contentClass),
					sizeMethod: buttonClass == 'minus' ? jQuery.proxy(self, '_sizeMinus') : jQuery.proxy(self, '_sizePlus')
				};

			button.data(params);

			return params;
		},
		_sizePlus: function(params) {
			var self = this;

			params.val = parseInt(params.input.val());

			if (params.val == params.max) return;

			if (params.val + params.inc >= params.max)
				params.val = params.max;
			else params.val += params.inc;

			params.input.val(params.val);
			params.content.css({ 'font-size': params.val +'%' });
		},
		_sizeMinus: function(params) {
			var self = this;

			params.val = parseInt(params.input.val());

			if (params.val == params.min) return;

			if (params.val - params.inc <= params.min)
				params.val = params.min;
			else params.val -= params.inc;

			params.input.val(params.val);
			params.content.css({ 'font-size': params.val +'%' });
		},
		_sizeFinish: function(params) {
			var self = this,
				textSize = quran.session('navMenu.textSize') || {};

			textSize[params.className] = params.val;

			quran.session({ navMenu: { textSize: textSize } });

			quran.window.triggerHandler('resize');
			quran.change({ key: self._last_key, force: true, anchor: true }, 'navMenu:_sizeFinish');
		}
	};
})( Quran, jQuery );
