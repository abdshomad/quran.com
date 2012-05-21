(function( Quran, jQuery ) {
	jQuery.widget('quran.autocomplete', {
		options: {
			mode: 'tags',
			addClass: null,
		},
		_create: function() {
			var self = this;

			window._test_ = self;
			
			self._createElement();
			self._extendDefault();
			self._extendElement();
			self._extendEvents();

		},
		_element: {},
		_createElement: function() {
			var self = this;

			self._element.wrap = self.element.wrap('<div class="autocomplete">').parent().addClass(self.options.mode).addClass(self.options.addClass);
			self._element.suggestion = jQuery('<div class="suggestion">').prependTo(self._element.wrap);
			self._element.input = jQuery('<div class="input">').prependTo(self._element.wrap);

			if (!self.options.appendTo)
				self.options.appendTo = self._element.wrap;
		},
		_extendDefault: function() {
			var self = this,
				create = self.options.create;

			delete self.options.create;

			var foo = jQuery.extend(new jQuery.ui.autocomplete(self.options, self.element), self);
			jQuery.extend(self, foo);

			self.options.create = create;
		},
		_extendElement: function() {
			var self = this;

			self._element.menu = self.menu.element;
		},
		_extendEvents: function() {
			var self = this,
				menuBlur = self.menu.options.blur;

			self.menu.options.blur = function(event, data) {
				menuBlur.apply(self, arguments);
				self._trigger('blur', event, self);
			};

			self.element.bind('input.autocomplete', function(event) {
				self._trigger('input', event, self);
			});

			self.element.bind('keyup.autocomplete', function(event) {
				self._trigger('keyup', event, self);
			});

			self.element.bind('keydown.autocomplete', function(event) {
				self._trigger('keydown', event, self);
			});

			self.element.bind('keypress.autocomplete', function(event) {
				self._trigger('keypress', event, self);
			});

			jQuery.each(self._on, function(ev, fn) {
				var originalFn = self.options[ev], returnVal;
				self.options[ev] = function(event, data) {
					if (originalFn)
						returnVal = originalFn.apply(self.element, arguments);
					if (returnVal !== false)
						fn.apply(self, arguments);

					event.stopPropagation();
				};
			});
		},
		_on: {
			keyup: function(event, data) {
				console.debug(event.type.replace(/autocomplete/, ''), data, this);
			},
			keydown: function(event, data) {
				console.debug(event.type.replace(/autocomplete/, ''), data, this);
			},
			keypress: function(event, data) {
				console.debug(event.type.replace(/autocomplete/, ''), data, this);
			},
			input: function(event, data) {
				console.debug(event.type.replace(/autocomplete/, ''), data, this);
				var self = this;

				self._element.input.text(self._value());
				self._element.suggestion.text(self._suggestion());
			},
			open: function(event, data) {
				console.debug(event.type.replace(/autocomplete/, ''), data, this);
				var self = this;

				self._element.suggestion.text(self._suggestion());
			},
			close: function(event, data) {
				console.debug(event.type.replace(/autocomplete/, ''), data, this);
				var self = this;

				self._element.suggestion.text('');
			},
			change: function(event, data) {
				console.debug(event.type.replace(/autocomplete/, ''), data, this);
				var self = this;

				self.element.val(self._trim(self.element.val()));
				self._trigger('input', event, self);
			},
			search: function(event, data) {
				console.debug(event.type.replace(/autocomplete/, ''), data, this);
				var self = this,
					value = self._value(),
					term = self._term(true);

				if (!self._continue()) {
					self.close();
					return false;
				}
			},
			focus: function(event, data) {
				console.debug(event.type.replace(/autocomplete/, ''), data, this);
				var self = this,
					terms = self._split(self.element.val());
					
				terms.pop();
				terms.push(data.item.value);

				self.element.val(terms.join(', '));
				self._trigger('input', event, self);

				return false;
			},
			blur: function(event, data) {
				console.debug(event.type.replace(/autocomplete/, ''), data, this);
				var self = this;

				self._trigger('input', event, self);
			},
			select: function(event, data) {
				console.debug(event.type.replace(/autocomplete/, ''), data, this);
				var self = this,
					terms = self._split(self.element.val());

				terms.pop();
				terms.push(data.item.value);
				terms.push('');

				self.element.val(terms.join(', '));
				self._trigger('input', event, self);

				return false;
			}
		},
		_split: function(val) {
			return val.split(/\W*,\W*/);
		},
		_trim: function(val) {
			return val.replace(/^[,\W]*/, '').replace(/[,\W]*$/, '');
		},
		_value: function(raw) {
			var self = this;

			if (raw) return self.element.val();
			else return self._trim(self.element.val());
		},
		_terms: function(raw) {
			var self = this;

			return self._split(self._value(raw));
		},
		_term: function(raw) {
			var self = this;

			return self._terms(raw).pop();
		},
		_suggestion: function() {
			var self = this,
				terms = self._terms(true),
				suggestions = self._suggestions(),
				suggestion = suggestions.shift(),
				term = terms.pop(),
				match = new RegExp(jQuery.ui.autocomplete.escapeRegex(term), 'i'),
				result = '';
				
			if (self._cursor_at_end() && term && suggestion && term != suggestion && jQuery.inArray(term, suggestions) == -1 && match.test(suggestion)) {
				terms.push(suggestion);
				result = terms.join(', ');
			}

			return result;
		},
		_continue: function() {
			var self = this,
				value = self._value(),
				terms = self._terms(true),
				suggestions = self._suggestions(),
				suggestion = suggestions.shift(),
				term = terms.pop(),
				match = new RegExp(jQuery.ui.autocomplete.escapeRegex(term), 'i');
	
			return term.length > 0 && value.length > 0 && (suggestions.length == 0 || suggestion && term && match.test(suggestion));
		},
		_suggestions: function() {
			var self = this,
				suggestions = [];

			if (self._element.menu.is(':visible'))
				self._element.menu.children('li').each(function() {
					var data = jQuery(this).data('item.autocomplete');
					if (data.value)
						suggestions.push(data.value);
				});

			return suggestions;
		},
		_cursor: function() {
			var self = this;

			return self.element.selectionEnd();
		},
		_cursor_at_end: function() {
			var self = this;

			return self._cursor() == self._value(true).length;
		}
	});
})( Quran, jQuery );
