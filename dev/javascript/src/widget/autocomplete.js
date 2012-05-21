// TODO
// - Three modes: search, tags, and jump
//   - Correspond to three types: query, tag, and link
// - Set mode when mode changes
// - Add 'empty' class to some element when input is empty for css purposes
// - CSS ?
// - preventDefault on tab until response
(function( Quran, jQuery ) {
	jQuery.template('quran.widget.autocomplete', '\
		<div class="autocomplete">\
			<table>\
				<tbody>\
					<tr>\
						<td class="l">\
							<div class="wrap">\
							</div>\
						</td>\
						<td class="c">\
							<div class="wrap">\
								<div class="cursor"><a></a></div>\
								<div class="input"></div>\
								<div class="suggest"></div>\
								<div class="pre"></div>\
							</div>\
						</td>\
						<td class="r">\
							<div class="wrap">\
							</div>\
						</td>\
					</tr>\
				</tbody>\
			</table>\
			<ul></ul>\
		</div>\
	');

	jQuery.widget('quran.autocomplete', {
		options: {
			mode: 'search',
			addClass: null,
			autoFocus: false,
			delay: 0,
			minLength: 1,
			source: null,
			// callbacks
			focus: null,
			input: null,
			open: null,
			search: null,
			response: null,
			select: null,
			blur: null,
			change: null,
			close: null
		},
		_create: function() {
			var self = this,
				menuOptions = {};

			jQuery.extend(self, {
				_element: {},
				_cache: {},
				_pending: {
					count: 0,
					terms: {}
				},
				_timeout: {},
				_interval: {},
				_last: {}
			});

			// build widget
			self.widget = jQuery.tmpl('quran.widget.autocomplete')
				.insertAfter(self.element)
				.addClass(self.options.mode)
				.addClass(self.options.addClass)
			;

			self.widget.find('> table > tbody > tr > .c > .wrap').prepend(self.element);

			// setup element
			self.element.attr({
				autocomplete: 'off',
				role: 'textbox',
				'aria-autocomplete': 'list',
				'aria-haspopup': 'true'
			});

			// bind events
			jQuery.each(self._bind, function(ev, fn) {
				self.element.bind(ev +'.autocomplete', jQuery.proxy(fn, self));
			});

			// sibling accessors
			self.sibling = {
				input: self.element.siblings('.input'),
				cursor: self.element.siblings('.cursor'),
				suggest: self.element.siblings('.suggest'),
				pre: self.element.siblings('.pre')
			};

			// setup menu
			self.menu = self.widget.find('> ul')
				.menu({
					focus: function(event, data) {
						self._suggest(data.item.data('item.autocomplete').suggest);
					},
					blur: function(event, data) {
						self._suggest(true);
					},
					selected: function(event, data) {
						self._select(event);
					}
				})
				.hide()
				.data('menu')
			;

			// init value
			self._value();
		},
		_trigger: function(ev, event, data) {
			var self = this,
				fn = self.options[ev],
				event = jQuery.Event(event || ev),
				data = data || {};

			return jQuery.isFunction(fn) ? fn.call(self, event, data) : undefined;
		},
		_source: function(request, response) {
			var self = this;

			if (request.term in self._cache)
				response(self._cache[request.term]);
			else self.options.source.apply(self, arguments);
		},
		//
		// callbacks
		//
		_focus: function(event) {
			var self = this,
				term = self._term(),
				suggest = self._suggest(),
				mode = self._mode(),
				val = self._value(),
				value = term ? term + (mode == 'tags' ? ', ' : '') : '',
				element = self.element.get(0),
				params = { term: term, suggest: suggest, mode: mode, val: val, value: value };

			delete self._last.select;

			self._last.term = term;

			self._cursor(event);

			if (self._trigger('focus', event, params) === false)
				return;

			if (typeof params.suggest == 'string')
				self._suggest(params.suggest);

			if (typeof params.value == 'string') {
				self._value(params.value);

				if (element.setSelectionRange) { // hack for setting cursor pos
					element.setSelectionRange(2 * value.length, 2 * value.length);
					element.scrollTop = 999999;
				}

				self._cursor(event);
			}
		},
		_input: function(event) {
			var self = this,
				value = self._value();

			if (self._last.keypress == 'ESCAPE') {
				if (self._last.select) {
					self._value(self._last.select.val);
					self._suggest(self._last.select.suggest);
				}
				if (self._comma_at_end()) {
					self._value(self._term());
					self._suggest(null);
					if (self._cached())
						self._search(event);
					else self._search(event, self.options.delay || 1);
					self._cursor(event);
					return event.preventDefault();
				}
				if (self.menu.element.is(':visible')) {
					self._close(event);
					self._suppressKey = true;
					return event.preventDefault();
				}
			}
			else {
				self._suggest(null);
				self._value(value);
				delete self._last.select;
			}

			if (self._char_at_end() && (self._cursor_at_end() || self._cached()))
				self._search(event);
			else self._close(event);

			self._trigger('input', event);
			self._cursor(event);
		},
		_keypress: function(event) {
			var self = this,
				params = {
					key: event.codeKey
				};

			self._last.keypress = event.codeKey;
			self._suppressKey = false;

			if (self._trigger('keypress', event, params) === false)
				return (self._suppressKey = true) && event.preventDefault();

			switch (event.codeKey) {
				case 'PAGE_UP':
					self._move('previousPage', event);
					self._suppressKey = true;
				break;
				case 'PAGE_DOWN':
					self._move('nextPage', event);
					self._suppressKey = true;
				break;
				case 'UP':
					self._move('previous', event);
					self._suppressKey = true;
				break;
				case 'DOWN':
					self._move('next', event);
					self._suppressKey = true;
				break;
				case 'ENTER':
				case 'NUMPAD_ENTER':
					if (self._suggest())
						self._select(event);
				break;
				case 'TAB':
					if (self._suggest())
						self._select(event);
				break;
				case 'RIGHT':
					if (self._cursor_at_end())
						if (self._suggest())
							self._select(event);
						else if (self._char_at_end())
							self._search(event);
				break;
			}

			if (self._suppressKey)
				return event.preventDefault();

			self._cursor(event);
		},
		_open: function(event, items) { // TODO: filter out tags
			var self = this;

			if (items) {
				self.menu.element.empty();
				self.menu.element.data('item.autocomplete', null);

				jQuery.each(items, function(index, item) {
					if (index == 0)
						self.menu.element.data('item.autocomplete', item);

					jQuery('<li>')
						.data('item.autocomplete', item)
						.append(jQuery('<a>').html(item.label))
						.appendTo(self.menu.element)
						.mousedown(jQuery.proxy(self.menu.select, self.menu))
					;
				});
			}

			self.menu.deactivate();
			self.menu.refresh();

			if (document.activeElement === self.element.get(0)) {
				self.menu.element.show();

				if (self.options.autoFocus)
					self.menu.next(new jQuery.Event('mouseover'));

				self._suggest(true);
				self._trigger('open', event, { items: items });
			}
		},
		_search: function(event, delay) {
			var self = this,
				term = self._term(),
				delay = typeof delay == 'number' ? delay : self._cached() ? 0 : self.options.delay;

			if (delay > 0) {
				self._timeout.search = setTimeout(function() {
					self._search(event, 0);
				}, delay);
				return;
			}
			else {
				if (term.length >= self.options.minLength) {
					if (!self._pending.terms[term]) {
						self.widget.addClass('loading');
						self._pending.terms[term] = 1;
						self._pending.count++;
					}
					self._source({ term: term }, function(data) {
						self._response(event, term, data);
					});
					self._trigger('search', event, { term: term });
				} else self._close(event);
			}
		},
		_response: function(event, term, data) {
			var self = this;

			self._pending.count--;
			delete self._pending.terms[term];

			if (data) {
				data = self._normalize(data, term);
				self._cache[term] = data;
			}

			if (self._mode() == 'tags')
				data = jQuery.grep(data, function(item) {
					return jQuery.inArray(item.value, self._tags()) == -1;
				});

			if (term == self._term()) {
				if(data && data.length)
					self._open(event, data);
				else self._close();
			}

			if (!self._pending.count) {
				self.widget.removeClass('loading');
				self._pending.terms = {};
			}

			self._trigger('response', event, { content: data });
		},
		_select: function(event) {
			var self = this,
				term = self._term(),
				suggest = self._suggest(),
				mode = self._mode(),
				val = self._value(),
				value = term + suggest + (mode == 'tags' ? ', ' : ''),
				params = { term: term, suggest: suggest, mode: mode, val: val, value: value, key: event.codeKey };

			if (document.activeElement !== self.element.get(0))
				self.element.focus();

			event.preventDefault();

			if (event.originalEvent)
				event.originalEvent.preventDefault();

			self._cursor(event);

			if (self._trigger('select', event, params) === false)
				return;

			if (typeof params.value == 'string')
				self._value(params.value);

			self._last.select = params;

			self._close(event);
		},
		_blur: function(event) {
			var self = this;

			clearTimeout(self._timeout.search);

			self._suppressKey = true;
			self._change(event);
			self._close(event);
			self._cursor(event);
			self._trigger('blur', event);
		},
		_change: function(event) {
			var self = this,
				term = self._term();

			self._suggest(null);
			self._value(term);

			if (term != self._last.term)
				self._trigger('change', event, { term: term });
		},
		_close: function(event) {
			var self = this;

			if (self.menu.element.is(':visible')) {
				self.menu.element.hide();
				self.menu.deactivate();
				self._trigger('close', event);
			}

			self._suggest(null);
		},
		//
		// internal
		//
		_suggest: function(suggest) {
			var self = this,
				suggest =
					suggest === null ? '' :
					suggest === true ? self.menu.element.data('item.autocomplete').suggest :
					typeof suggest == 'object' ? suggest.suggest :
					typeof suggest == 'string' ? suggest : undefined;

			if (suggest === undefined)
				return self._last.suggest;

			self.sibling.suggest.text(suggest);

			if (suggest)
				self.sibling.suggest.css('left', self.sibling.input.width()).show();

			self._last.suggest = suggest;

			return suggest;
		},
		_item: function(value, term) {
			var self = this,
				value = value ? value : self._value(),
				term = term ? term : self._term();

			if (typeof value == "string") return {
				label: self._label(value, term),
				value: value
			};
			else return jQuery.extend({
				label: value.label || self._label(value.value, term),
				value: value.value || value.label
			}, value);
		},
		_normalize: function(data, term) {
			var self = this,
				term = term ? term : self._term();

			if (data.length && data[0].label && data[0].value)
				return data;

			return jQuery.map(data, function(value) {
				return self._item(value, term);
			});
		},
		_label: function(value, term) { // TODO: make this regex
			return value.substring(0, value.toLowerCase().indexOf(term.toLowerCase())) +'<b>'+ value.substr(value.toLowerCase().indexOf(term.toLowerCase()), term.length) +'</b>'+ value.substring(value.toLowerCase().indexOf(term.toLowerCase()) + term.length);
		},
		_split: function(value) {
			return value.split(/\s*,\s*/);
		},
		_trim: function(value) {
			return value.replace(/^\s*/, '').replace(/\s*$/, '').replace(/\s*,\s*/g, ', ').replace(/\s+/g, ' ').replace(/[,\s]+$/, '').replace(/^[,\s]+/, '');
		},
		_term: function() {
			return this._trim(this._value());
		},
		_tags: function() {
			return this._split(this._term());
		},
		_value: function(value) {
			var self = this;

			if (typeof value == 'string') {
				self.element.attr('value', value);
				self._last.value = value;
			} else value = self.element.val();

			self.sibling.input.text(value);

			return value;
		},
		_cached: function(term) {
			term = typeof term == 'string' ? term : this._term();
			return this._cache[term] ? true : false;
		},
		_move: function(cmd, event) {
			var self = this;

			if (self.menu.element.is(':visible'))
				if (self.menu.first() && /^prev/.test(cmd) || self.menu.last() && /^next/.test(cmd))
					return self.menu.deactivate();
				else return self.menu[cmd](event);
			else if (self._char_at_end())
				return self._search(event);
		},
		_cursor: function(event) {
			var self = this,
				start = self.element.selectionStart(),
				end = self.element.selectionEnd(),
				type = start != end ? 'selection' : event.type,
				value = self._value(),
				show = false, blink = function() {
					clearInterval(self._interval.cursor);

					self._interval.cursor = setInterval(function() {
						self.sibling.cursor.toggle();
					}, 500);
				};

			switch (type) {
				case 'value':
				case 'focus':
				case 'keypress':
				case 'input':
				case 'keyup':
				case 'mouseup':
					show = true;
				break;
			}

			if (show) {
				clearTimeout(self._timeout.cursor);

				self.sibling.cursor.css('left', self.sibling.pre.text(value.substr(0, end)).width());
				self.sibling.cursor.show();

				self._timeout.cursor = setTimeout(blink, 100);
			}
			else {
				clearTimeout(self._timeout.cursor);
				clearInterval(self._interval.cursor);

				self.sibling.cursor.hide();
			}
		},
		_cursor_at_end: function() {
			var self = this,
				start = self.element.selectionStart(),
				end = self.element.selectionEnd(),
				length = self._value().length;

			return start == end && end == length;
		},
		_char_at_end: function() {
			var self = this,
				value = self._value();

			return /[^,\s]/.test(value.charAt(value.length - 1));
		},
		_comma_at_end: function(value) {
			var self = this,
				value = value || self._value();

			return /,[\s]*$/.test(value);
		},
		_mode: function() {
			return /,/.test(this._value()) ? 'tags' : this.options.mode;
		},
		//
		// events
		//
		_bind: {
			mousedown: function(event) {
				var self = this;

				self._cursor(event);
			},
			mouseup: function(event) { 
				var self = this;

				self._cursor(event);
			},
			focus: function(event) {
				var self = this;

				self._focus(event);
			},
			keypress: function(event) {
				var self = this;

				event.codeKey = jQuery.ui.codeKey[event.keyCode];

				self._keypress(event);
			},
			input: function(event) {
				var self = this;

				event.codeKey = jQuery.ui.codeKey[event.keyCode];

				if (self._suppressKey)
					return event.preventDefault();
				else self._suppressKey = true;

				self._input(event);
			},
			keyup: function(event) {
				var self = this;

				event.codeKey = jQuery.ui.codeKey[event.keyCode];

				if (self._suppressKey)
					return event.preventDefault();

				self._cursor(event);
			},
			blur: function(event) {
				var self = this;

				self._blur(event);
			}
		},
		//
		// public
		//
		close: function() {
			var self = this,
				event = new jQuery.Event('public');

			self._close(event);
		}





	});
})( Quran, jQuery );
