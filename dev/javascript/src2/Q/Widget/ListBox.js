/*
 * @class Q.Controller.Widget.ListBox
 * @inherits Q.Controller.Widget
 */
Q.Controller.Widget.extend('Q.Controller.Widget.ListBox', {
}, {
	init: function(element, option) {
		var self = this;

		self.item = jQuery();
		self.menu = jQuery('<ul></ul').addClass(self.camelName({ append: 'menu' })).hide();

		self.menu.appendTo(self.element).show();
		self.menu = self.menu.menu({
		}).data('menu');
		self.source.children().each(function() {
			var me = jQuery(this);
			var item = {
				data: me.data(),
				model: me.model(),
				label: me.text(),
				value: this.value || me.attr('value') || me.attr('data-value')
			};
			self.append(item);
		});
		self.menu.refresh();
		self._super();
	},
	append: function(data) {
		var self = this;
		var anchor = jQuery('<a></a>').text(data.label).addClass(self.camelName({ append: 'item-anchor' }));

		var item = jQuery('<li></li>')
			.data('item', jQuery.extend({}, {
				label: data.label,
				value: data.value || data.label
			}))
			.append(anchor)
			.appendTo(self.menu.element)
			.addClass(self.camelName({ append: 'item' }))
		;
		if (data.data)  item.data(data.data);
		if (data.model) item.model(data.model);

		if (self.options.buttons)
			jQuery.each(self.options.buttons, function(title, config) {
				self.button(item, jQuery.extend(config, { title: title }));
			});

		self.menu.refresh();
		self.item.push(item[0]);

		return item;
	},
	remove: function(item) {
		var self = this, item = item.length ? item : jQuery(item), index = [];
		jQuery.each(item, function(i, item) {
			i = jQuery.inArray(item, self.item);
			if (i >= 0) index.push(i);
		});
		self.item = jQuery(jQuery.grep(self.item, function(item, i) {
			if (jQuery.inArray(i, index) >= 0) {
				jQuery(item).detach();
				return false;
			}
			return true;
		}));
	},
	current: function(item) {
		var self = this;
		if (item && item.length) {
			self._current = item;
		}
		self._current = self.item.filter(self._current);
		return self._current.length ? self._current : false;
	},
	toggle: function(item) {
		var self = this;
		if (item) self.current(item);
		if (!self._current) return;
		if (self._current.hasClass('.q-state-active')) {
			self._current.removeClass('.q-state-active').children('a').removeClass('ui-state-active').blur();
			self._current = undefined;
		}
		else {
			self._current.addClass('.q-state-active').siblings().removeClass('.q-state-active').children('a').removeClass('ui-state-active').blur();
			self._current.children('a').addClass('ui-state-active').blur();
		}
	},
	button: function(item, config) {
		var self = this;
		var button = jQuery('<button type="button">')
			.addClass(self.camelName({ append: 'item-button' }))
			.appendTo(item.children())
			.rf_button(config);
		return button;
	}
});
