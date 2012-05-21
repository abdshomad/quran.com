/*
* @class Q.Controller.Widget.ComboBox
* @inherits Q.Controller.Widget
*/
Q.Controller.Widget.extend('Q.Controller.Widget.ComboBox', {
}, {
	init: function(elem, option) {
		var self = this;

		self.tagName = self.source[0].tagName.toLowerCase();
		self.tagMethod = self.tagName == 'select' ? 'attr' : 'data';

		var selected = self.source.children().filter(function() {
			return jQuery(this)[self.tagMethod]('selected');
		}), selected = selected.length ? selected : self.source.children(':first'),
		value = selected[self.tagMethod]('value') ? selected.text() : '';

		self.input = jQuery('<input>');

		self.input.appendTo(self.element)
			.val(value)
			.autocomplete({
				delay: 0,
				minLength: 0,
				source: function(request, response) {
					var term = jQuery.ui.autocomplete.escapeRegex(request.term);
					var re = new RegExp(term, 'i');
					response( self.source.children().map(function() {
						var me = jQuery(this), text = me.text(), value = me[self.tagMethod]('value');
						if( value && ( !term || re.test( text ) ) )
							return {
								label: text.replace(
									new RegExp(
										'(?![^&;]+;)(?!<[^<>]*)('+ term +')(?![^<>]*>)(?![^&;]+;)', 'gi'
									),
									'<strong>$1</strong>'
								),
								value: text
							};
					}) );
				},
				create: function(ev, data) {
					self.autocomplete = self.input.data('autocomplete');
					self.menu = self.autocomplete.menu;
					self.menu.element.addClass(self.camelName({ append: 'menu' }));
				},
				open: function(ev, data) {
					self.input.addClass( 'q-state-open' );
				},
				close: function(ev, data) {
					self.input.removeClass( 'q-state-open' );
				},
				select: function(ev, data) {
					self.selected.apply(self, arguments);
				},
				change: function(ev, data) {
					self.changed.apply(self, arguments);
				}
			})
			.addClass( 'ui-widget ui-widget-content ui-corner-left' )
			.addClass( self.camelName({ append: 'input' }) );

		self.autocomplete._renderItem = function( ul, item ) {
			return jQuery( '<li></li>' )
				.data( 'item.autocomplete', item )
				.append( '<a>' + item.label + '</a>' )
				.appendTo( ul );
		};

		self.button = jQuery( '<button type="button">&nbsp;</button>' )
			.attr( 'tabIndex', -1 )
			.attr( 'title', 'Show All Items' )
			.insertAfter( self.input )
			.button({
				icons: {
					primary: 'ui-icon-triangle-1-s'
				},
				text: false
			})
			.removeClass( 'ui-corner-all' )
			.addClass( 'ui-corner-right ui-button-icon' )
			.addClass( self.camelName({ append: 'button' }) )
			.click(function() {
				if (self.autocomplete.widget().is(':visible'))
					return self.autocomplete.close();

				self.button.blur();

				self.autocomplete.search('');
				self.input.focus();
			});

		self._super();
	},
	selected: function(ev, data) {
		var self = this;
		data.item = self.current();
		self.element.trigger('selected', data);
		if (self.options.selected)
			return self.options.selected.call(self, data);
		else return data.item;
	},
	changed: function(ev, data) {
		var self = this;
		data.item = self.current();
		self.element.trigger('changed', data);
		if (self.options.changed)
			return self.options.changed.call(self, data);
		else return data.item;
	},
	current: function(val) {
		var self = this, setval = val ? true : false, val = val || self.input.val();
		var re = new RegExp(
			'^' + jQuery.ui.autocomplete.escapeRegex( val ) + '$', 'i'
		), found = false;
		self.source.children().each(function() {
			var me = jQuery(this);
			me[self.tagMethod]('selected', false);
		});
		self.source.children().each(function() {
			var me = jQuery(this), text = me.text();
			if (re.test(text)) found = true;
			me[self.tagMethod]('selected', found);
			if (found) {
				found = me;
				return false;
			}
		});
		if (found && setval)
			self.input.val(found.text());
		return found;
	},
	append: function(data) {
		var self = this;
		var item = self.tagName == 'select' ? jQuery('<option>') : jQuery('<li>');
		data.value = data.value || data.label;
		item[self.tagMethod]('value', data.value);
		item.text(data.label);
		if (data.data)  item.data(data.data);
		if (data.model) item.model(data.model);
		self.source.append(item);
		return item;
	},
	sort: function() {
		var self = this;
		self.source.children().sort(function(a,b) {
			return jQuery(a).text() > jQuery(b).text() ? 1 : -1;
		});
	},
	label: function(label) {
		var self = this;
		if (label) {
			label = jQuery.trim(label);
			self.input.val(label);
		} else label = jQuery.trim(self.input.val());
		return label;
	},
	value: function(value) {
		var self = this, item = self.current();
		if (!item) return;
		if (value) item[self.tagMethod]('value', value);
		else value = item[self.tagMethod]('value');
		return value;
	}
});
