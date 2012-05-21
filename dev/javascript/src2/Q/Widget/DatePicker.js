/*
 * @class Q.Controller.Widget.DatePicker
 * @inherits Q.Controller.Widget
 */
Q.Controller.Widget.extend('Q.Controller.Widget.DatePicker', {
}, {
	init: function(element, option) {
		var self = this;

		if (self.options.type == 'range') {
			var nextElem = self.element.next('input[type=text]'),
			    prevElem = self.element.prev('input[type=text]'), otherElem, otherType;

			self.input = self.cloned('insertAfter', self.source);
			if (prevElem.length) {
				otherElem = prevElem;
				otherType = 'from';
				otherElem.insertBefore(self.input);
			}
			else {
				otherElem = nextElem.length ? nextElem : jQuery('<input type="text">');
				otherType = 'to';
				otherElem.insertAfter(self.input);
			}
			if (otherType == 'from') {
				self.input.attr('placeholder', 'to');
				otherElem.attr('placeholder', 'from');
			}
			else {
				self.input.attr('placeholder', 'from');
				otherElem.attr('placeholder', 'to');
			}
			self.input = self.input.add(otherElem);
			self.input.eq(0).addClass(self.camelName({ append: 'input-from' })).attr('name', 'from');
			self.input.eq(1).addClass(self.camelName({ append: 'input-to' })).attr('name', 'to');
		}
		var config = {
			defaultDate: "+1w",
			changeMonth: true,
			numberOfMonths: 1,
			dateFormat: 'yy-mm-dd'
		};
		jQuery.extend(config, self.options.config);
		if (self.options.type == 'range') {
			var onSelect = config.onSelect, onClose = config.onClose;
			var setRange = function(date) {
				var me = jQuery(this), boundary = me.hasClass('q-datePicker-input-from') ? 'minDate' : 'maxDate', widget = me.data('datepicker');
				if (date) {
					date = jQuery.datepicker.parseDate(widget.settings.dateFormat, date, widget.settings);
					self.input.not(me).datepicker('option', boundary, date);
				}

				if (onSelect) onSelect.apply(this, arguments);
				if (onClose)   onClose.apply(this, arguments);
			};

			config.onSelect = setRange;
			config.onClose  = setRange;
		}
		self.input
			.datepicker(config)
			.addClass(self.camelName({ append: 'input' }))
			.addClass('ui-corner-all ui-widget ui-widget-content');

		self._super();
	},
	range: function(want) {
		var self = this;
		if (self.options.type != 'range') return;
		return [self.from(want), self.to(want)];
	},
	from: function(want) {
		var self = this;
		if (self.options.type != 'range') return;
		var elem = self.input.filter('[name="from"]');
		return want ? elem : elem.val();
	},
	to: function(want) {
		var self = this;
		if (self.options.type != 'range') return;
		var elem = self.input.filter('[name="to"]');
		return want ? elem : elem.val();
	}
});
