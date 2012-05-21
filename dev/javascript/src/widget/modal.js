(function( Quran, jQuery ) {
	jQuery.widget('quran.modal', {
		options: {
			zIndex: 10000,
			zOverlay: 9998,
			resizable: {
				handles: 'all'
			},
			draggable: {}
		},
		_create: function() {
			var self = this,
				o = self.options;

			jQuery.extend(self, {
				css : {
					minWidth: o.minWidth ? o.minWidth : null,
					minHeight: o.minHeight ? o.minHeight : null,
					maxWidth: o.maxWidth ? o.maxWidth : null,
					maxHeight: o.maxHeight ? o.maxHeight : null,
					width: o.width ? o.width : null,
					height: o.height ? o.height : null,
					zIndex: o.zIndex ? o.zIndex : 1
				},
				jQ : {
					body : jQuery(document.body),
					window : jQuery(window),
					document : jQuery(document)
				}
			});

			window.__self = self;

			if (o.position === undefined)
				o.position = {
						 my : 'center top',
						 at : 'center bottom',
						 of : self.jQ.body.children().first(),
				 offset : '0 -46',
				};

			if (o.resizable) {
				jQuery.extend(o.resizable, {
					start: function(event, data) {
						data.originalPosition.top -= self.jQ.window.scrollTop();
						data.position.top -= self.jQ.window.scrollTop();
					}
				});
			}

			if (o.open)
				self.element.bind('open.modal', jQuery.proxy(o.open, self));

			self._buildModal();
		},
		_buildModal: function() {
			var self = this,
				o = self.options,
				css = jQuery.extend(self.css, { visibility: 'hidden' });

			self.modal = jQuery.tmpl('quran.modal').css(css);
			self.modal.find('a.close').bind('click.modal', jQuery.proxy(self, 'close'));

			if (o.className)
				self.modal.addClass(o.className);

			self._buildOverlay();
			self._buildData();
			self._buildContent();

			self.open('main');

			jQuery.extend(o.position, {
				collision: 'none none',
				using: function(position) {
					var scrollTop = self.jQ.window.scrollTop();
					position.top -= scrollTop;
					position.top += position.top < 0 ? scrollTop : 0;
					jQuery(this).css(position);
				}
			});
			self.modal.appendTo(self.jQ.body).position(o.position);

			if (o.resizable)
				self.modal.resizable(o.resizable);
			if (o.draggable)
				self.modal.draggable(o.draggable);

			self.modal.css({ visibility: 'visible' });
		},
		_buildOverlay: function() {
			var self = this,
				o = self.options,
				overlay = self.jQ.body.find('> div.overlay');

			self.overlay = overlay.length ? overlay : jQuery.tmpl('quran.overlay').appendTo(self.jQ.body);
			self.overlay.css({ zIndex: o.zOverlay? o.zOverlay : css.zIndex - 1 });
		},
		_buildData: function() {
			var self = this,
				o = self.options;

			self.data = {
				main: {
					title: o.title ? o.title : undefined,
					content: self.element,
					footer: o.footer ? o.footer : undefined
				}
			};

			if (o.sections)
				jQuery.each(o.sections, function(name, data) {
					self.data[name] = data;
				});
		},
		_buildContent: function() {
			var self = this,
				o = self.options;
				
			jQuery.each(self.data, function(name, data) {
				self.addSection(name, data);
			});
		},
		addSection: function(name, data) {
			var self = this,
				o = self.options,
				template = jQuery.tmpl('quran.modal.section', data, { name: name }),
				header = template.filter('header'),
				content = template.filter('section'),
				footer = template.filter('footer');

			if (data.title)
				if (typeof data.title == 'string')
					header.html(data.title);
				else if (typeof data.title == 'object' && data.title.jquery)
					header.append(data.title);
			if (data.content)
				if (typeof data.content == 'string')
					content.html(data.content);
				else if (typeof data.content == 'object' && data.content.jquery)
					content.append(data.content);
			if (data.footer) {
				if (data.footer.message)
					if (typeof data.footer.message == 'string')
						footer.find('.status .message').html(data.footer.message);
					else if (typeof data.footer.message == 'object' && data.footer.message.jquery)
						footer.find('.status .message').append(data.footer.message);

				if (data.footer.buttons)
					jQuery.each(data.footer.buttons, function(index, buttonData) {
						var button = jQuery.tmpl('quran.modal.footer.button', buttonData);
						if (buttonData.click)
							button.bind('click.modal', jQuery.proxy(buttonData.click, self));
						footer.find('.controls menu').append(button);
					});
			}

			template.appendTo(self.modal.find('> div.wrap')).hide();

			self.header = self.header ? self.header.add(header) : header;
			self.content = self.content ? self.content.add(content) : content;
			self.footer = self.footer ? self.footer.add(footer) : footer;
		},
		open: function(section) {
			var self = this,
				o = self.options;

			self.overlay.show();
			self.modal.show();

			if (section) {
				var header = self.header.filter('.'+ section),
					content = self.content.filter('.'+ section),
					footer = self.footer.filter('.'+ section);

				header = header.length ? header : self.header.filter('.main');
				content = content.length ? content : self.content.filter('.main');
				footer = footer.length ? footer : self.footer.filter('.main');

				header.show().siblings('header').hide();
				content.show().siblings('section').hide();
				footer.show().siblings('footer').hide();

				self.active = section;
			}

			self.element.trigger('open.modal');
		},
		close: function() {
			var self = this;

			self.overlay.hide();
			self.modal.hide();
		},
		toggle: function() {
			var self = this;

			if (self.modal.is(':visible'))
				self.close();
			else self.open();
		},
		destroy: function() {
			var self = this;

			jQuery.Widget.prototype.destroy.apply(self, arguments);

			self.overlay.hide();
			self.modal.remove();
		},
		mask: function() {
			var self = this;

			self.modal.find('.mask').show();
		},
		unmask: function() {
			var self = this;

			self.modal.find('.mask').hide();
		},
		status: function(code, message) {
			var self = this,
				status_elem = self.footer.filter('.'+ self.active).find('.status'),
				message_elem = status_elem.find('.message');

			status_elem.attr('class', 'status');

			if (message === undefined) {
				message_elem.html(null);
			}
			else {
				status_elem.addClass(code);
				message_elem.html(message)
			}
		}
	});

	jQuery.template('quran.modal.section', '\
		{{if title}}\
		<header class="${ $item.name }"></header>\
		{{/if}}\
		{{if content}}\
		<section class="${ $item.name }"></section>\
		{{/if}}\
		{{if footer}}\
		<footer class="${ $item.name }">\
			<table>\
				<tbody>\
					<tr>\
						<td class="status">\
							<span class="icon">\
								<img class="loading" src="/static/images/gif/status.loading.gif" alt="Loading"/>\
								<img class="error" src="/static/images/gif/status.error.gif" alt="Error"/>\
								<img class="ok" src="/static/images/gif/status.ok.gif" alt="OK"/>\
							</span>\
							<h2 class="message"></h2>\
						</td>\
						<td class="controls">\
							<menu>\
							</menu>\
						</td>\
					</tr>\
				</tbody>\
			</table>\
		</footer>\
		{{/if}}\
	');

	jQuery.template('quran.modal', '\
		<div class="modal">\
			<div class="wrap">\
				<div class="mask"></div>\
				<a class="close">X</a>\
			</div>\
		</div>\
	');

	jQuery.template('quran.modal.footer.button', '\
		<li>{{html label}}</li>\
	');

	jQuery.template('quran.overlay', '\
		<div class="overlay"></div>\
	');
})( Quran, jQuery );
