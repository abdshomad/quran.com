(function( Quran, jQuery ) {
	jQuery.widget('quran.dropdown', {
		options: {},
		_timeout: {}, _delay: { enter: 382,  leave: 618,  click: 1618 },
		_create: function() {
			var self = this;

			var options = {
				factor : 3,
				target : {
					click : self.element.prev(),
					hover : self.element.prev().add(self.element)
				}
			};
			self.options = jQuery.extend({}, options, self.options);
			if (self.options.change)
				self.element.bind('change', self.options.change);

			self.element.find('> *').each(function() {
				var height = jQuery(this).outerHeight(true);
				if (!self._height)
					self._height = height;
				else
					self._height = self._height < height ? height : self._height;
			});

			self.options.target.click.mousedown(function() {
				if (self.options.target.click.hasClass('clicked') || self.element.hasClass('open')) {
					self.options.target.click.removeClass('clicked');
					self.close();
				}
				else {
					self.options.target.click.addClass('clicked');
					self.open();
				}
			})

			self.options.target.hover._mouseenter(function() {
				clearTimeout(self._timeout.enter);
				clearTimeout(self._timeout.leave);
				clearTimeout(self._timeout.click);
				if (!self.options.target.click.hasClass('clicked')) {
					if (self.element.hasClass('collapse'))
						self.open();
					else
						self._timeout.enter = setTimeout(function() {
							self.open();
						}, self._delay.enter);
				}
			})._mouseleave(function() {
				clearTimeout(self._timeout.enter);
				clearTimeout(self._timeout.leave);
				clearTimeout(self._timeout.click);
				if (!self.options.target.click.hasClass('clicked')) {
					if (self.element.hasClass('expand'))
						self.close();
					else
						self._timeout.leave = setTimeout(function() {
							self.close();
						}, self._delay.leave);
				}
				else
					self._timeout.click = setTimeout(function() {
						self.options.target.click.removeClass('clicked');
						self.close();
					}, self._delay.click);
			});
		},
		destroy: function() {
			jQuery.Widget.prototype.destroy.apply(this, arguments);
		},
		open: function() {
			var self = this;
			var duration = self.options.factor * (self._height - self.element.height());
			self.element.removeClass('collapse').addClass('expand').stop().animate({ height: self._height }, duration, 'swing', function() {
				self.element.removeClass('expand').addClass('open');
			});
		},
		close: function() {
			var self = this;
			var duration = self.options.factor * self.element.height();
			self.element.removeClass('open').removeClass('expand').removeClass('collapse').stop().animate({ height: 0 }, duration, 'swing', function() {
				self.element.removeClass('collapse');
			});
		}
	});
})( Quran, jQuery );
