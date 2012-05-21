/*
 * @class Q.Controller.Widget.Button
 * @inherits Q.Controller.Widget
 */
Q.Controller.Widget.extend('Q.Controller.Widget.Button', {
	defaults: {
		corner: 'all'
	},
	tag: 'span'
}, {
	init: function() {
		var self = this;

		self._super();

		self.button = self.cloned('insertAfter', self.source).attr('tabIndex', -1).addClass(self.camelName({ append: 'button' }));

		if (self.source.is('input[type=checkbox]') || self.options.type == 'checkbox') {
			self.checkbox = self.button.addClass(self.camelName({ append: 'checkbox' }));;
			self.button = self.button.wrapAll('<span>').parent().addClass(self.camelName({ append: 'checkbox-wrap' }));
		}

		if (self.options.title || self.options.text)
			self.button.attr('title', self.options.title || self.options.text);

		if (self.options.text) {
			self.options.label = self.options.text;
			self.options.text = true;
		}
		else {
			self.options.label = self.source.text() || '&nbsp;';
			self.options.text = false;
		}

		self.options.icons = jQuery.extend({}, self.options.icons);

		if (self.options.left)
			self.options.icons.primary = self.options.left;
		if (self.options.right)
			self.options.icons.secondary = self.options.right;

		if (self.options.icon) {
			if (!self.options.icons.primary)
				self.options.icons.primary = self.options.icon;
			else self.options.icons.secondary = self.options.icon;
		}

		self.button
			.button(jQuery.extend({}, self.options, {
			})).click(function() {
				jQuery(this).blur();
			})
			.removeClass('ui-corner-all')
			.addClass('ui-corner-'+ self.options.corner)
		;

		self.button.show();

		if (self.checkbox) {
			self.checkbox.appendTo(self.button);
			self.checkbox.on('click', function(ev) {
				ev.stopPropagation();
				jQuery(this).blur();
			});
			self.button.on('click', function() {
				self.checkbox.attr('checked', !self.checkbox.attr('checked'));
			});
		}
	},
	destroy: function() {
		var self = this;
		self.button.button('destroy');
		self._super();
	}
});
