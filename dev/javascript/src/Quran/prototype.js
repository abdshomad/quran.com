Quran.prototype =  {
	ui: { window: {}, head: {}, body: {}, content: {}, side : {}, widget: {} },
	_data: {},
	on: function(ev, fn, pr, id) {
		var self = this,
			on = self.data('on') || self.data('on', {}),
			pr = typeof pr == 'number' ? pr : 100;

		if (!on[ev])
			on[ev] = {};

		if (!on[ev][pr])
			on[ev][pr] = [];

		if (id)
			fn.id = id;

		on[ev][pr].push(fn);

		on[ev] = jQuery.sort(on[ev]);
	},
	one: function(ev, fn, pr, id) {
		var self = this,
			pr = typeof pr == 'number' ? pr : 100;

		fn.one = true;

		self.on(ev, fn, pr, id);
	},
	run: function() {
		var self = this,
			on = self.data('on') || self.data('on', {}),
			args = jQuery.makeArray(arguments),
			ev = args.shift();

		var debug_id;

		if (typeof args[args.length - 1] == 'string')
			debug_id = args[args.length - 1];
		else debug_id = 'unknown';

		console.groupCollapsed('(in)', debug_id, '=>', '(run)', ev, args);

		if (on[ev])
			for (var pr in on[ev]) {
				var length = on[ev][pr].length;
				for (var i = 0; i < length; i++) {
					if (on[ev][pr][i].id)
						debug_id = on[ev][pr][i].id;
					else debug_id = 'unknown';

					console.time('(in) '+ debug_id +' => (on) '+ ev);
					/*console.debug('(in)', debug_id, '=>', '(on)', ev, args);*/

					on[ev][pr][i].apply(self, args);
					console.timeEnd('(in) '+ debug_id +' => (on) '+ ev);
				}

				for (var i = 0; i < length; i++)
					if (on[ev][pr][i].one)
						delete on[ev][pr][i];

				on[ev][pr] = jQuery.grep(on[ev][pr], function(value, index) {
					return value !== undefined;
				});
			}

		console.groupEnd();
	},
	notify: function(msg) {
		console.warn(msg);
	},
	localize: function(key) {
		var self = this;
		if (self.data('lexicon')[key] === undefined) {
			/*
			if (quran.data('account') && jQuery.inArray('developer', quran.data('account').roles) != -1) {
				jQuery.ajax({
					url: '/i18n/message', type: 'POST', contentType: 'application/json',
					data: JSON.stringify({
						key: key
					})
				});
			}
			self.data('lexicon')[key] = key;
			*/
			return key;
		}
		return self.data('lexicon')[key];
	},
	copy: function(object_or_array) {
		var copy;
		if (typeof(object_or_array) == 'object')
			if (object_or_array.length !== undefined)
				copy = [];
			else
				copy = {};
		else
				return;
		function get_copy(thing) {
			if (typeof thing == 'number') {
				return thing;
			} else
			if (typeof thing == 'string') {
				if (thing.match(/^[\d]+$/))
					return parseInt(thing);
				else
					return thing;
			} else
			if (typeof thing == 'function') {
				return new thing;
			} else
			if (typeof thing == 'object') {
				var new_thing;

				if (thing === null)
					new_thing = null;
				else if (thing.length !== undefined)
					new_thing = [];
				else new_thing = {};

				for (var key in thing)
					new_thing[key] = get_copy(thing[key]);

				return new_thing;
			}
		};
		for (var key in object_or_array) {
			copy[key] = get_copy(object_or_array[key]);
		}
		return copy;
	},
	data: function(key, val) {
		if (key !== undefined && val !== undefined) {
			if (key.match(/([^.]+)\.([^.]+)/)) {
				var keys = key.split(/\./);
				var ref = this._data;
				jQuery.each(keys, function(i, _key) {
					if (i == keys.length - 1)
						return false;
					if (!ref[_key])
						ref[_key] = {};
					ref = ref[_key];
				});
				ref[keys.pop()] = val;
			}
			else this._data[key] = val;
			return val;
		}
		else if (key === undefined)
			return this._data;
		else if (val === undefined && typeof(key) == 'object')
			return jQuery.extend(this._data, key);
		else if (val === undefined && typeof(key) == 'string') {
			if (this._data[key])
				return this._data[key];
			else if (/^[^.]+\./.test(key)) {
				var data;
				try { data = eval('this._data.'+ key); } catch(e) {}
				if (data)
					return data;
				else return this._data[key];
			}
		}
		else return this._data[key];
	},
	cached: function(data) {
		var self = this,
			content = self.data('content') || self.data('content', {}),
			session = self.data('session');

		if (!data) {
			data = {};

			var copy = function() {};
			copy.prototype = self.copy(session.content);

			if (copy.prototype.quran.text) {
				var resource_code = copy.prototype.quran.text;
				copy.prototype.quran.text = {};
				copy.prototype.quran.text[resource_code] = 1;
			}

			jQuery.each(self.data('keys'), function(index, key) {
				if (content.cached && content.cached[key])
					return;

				data[key] = new copy;
			});
		}

		if (!content.cached)
			content.cached = data;
		else self.extend(content.cached, data);

		return content.cached;
	},
	extend: function(data, extend) {
		var self = this;

		for (var key in extend) {
			if ((data[key] !== undefined && typeof data[key] == 'object' && !data[key].length && data[key] !== null) &&
				(extend[key] !== undefined && typeof extend[key] == 'object' && !extend[key].length && extend[key] !== null)) {
				var dataRef = data[key], extendRef = extend[key];
				self.extend(dataRef, extendRef);
			}
			else data[key] = extend[key];
		}

		return data;
	},
	ajax: function(url, params, options) {
		var self = this,
			ajax = self.data('ajax') || self.data('ajax', {}),
			params = typeof params == 'object' && params !== null ? params : {},
			options = jQuery.extend({ type: 'POST' }, options, {
				url: url, contentType: 'text/javascript', dataType: 'json', data: JSON.stringify(params),
				complete: function() {
					delete ajax[url];
				}
			});

		if (ajax[url] && ajax[url].readyState < 4) {
			if (options.wait)
				return ajax[url];
			else if (options.abort)
				ajax[url].abort();
		}

		ajax[url] = jQuery.ajax(options);

		return ajax[url];
	},
	session: function() {
		var self = this,
			argument = arguments;

		if (argument[1] === undefined) {
			if (argument[0] === undefined) { // get
				return self.data('session');
			} else
			if (typeof argument[0] == 'string') {
				if (argument[0] == 'save') {  // set
					self.ajax('/session', { session: self.data('session') }); // existing data
				}
				else { // get
					return self.data('session.'+ argument[0]); // by key
				}
			}
			else {// set
				if (argument[0].content && argument[0].content.quran)
					self.data('session.content.quran', {});
				quran.extend(self.data('session'), argument[0]); // extend with object
				self.ajax('/session', { session: argument[0] }, { abort: true }); // save
			}
		}
		else { // set
			if (argument[0].content && argument[0].content.quran)
				self.data('session.content.quran', {});
			quran.extend(self.data('session'), argument[0]); // extend with object

			var params = jQuery.extend({ session: argument[0] }, argument[1]),
				options = argument[2] || {},
				url = options.url ? '/session'+ options.url : '/session';

			delete options.url;

			self.ajax(url, params, options) // save with possible callback
		}
	},
	state: function(state, val) { // deprecated ?
		var self = this,
			data = self.data('state');

		if (state !== undefined && typeof(state) == 'object')
			jQuery.extend(data, state);
		else if (state !== undefined && typeof(state) == 'string' && val !== undefined)
			data[state] = val;
		else if (state !== undefined && typeof(state) == 'string' && val === undefined)
			return data[state];

		return self.copy(data);
	},
	page: function(key) { // deprecated
		var self = this,
			key = 'page' + (key ? '.'+ key : '');

		return self.data(key);
	},
	/* quran.change
	 *  description - changes the application's state wrt surah/ayah/id variables,
	 *                and follows by firing an onchange event callback handler
	 *  usage examples -
	 *   quran.change({ ayah: 1 }); // change to specific ayah if within the scope of the page
	 *   quran.change({ ayah: 'next' }); // change to next ayah
	 *   quran.change({ ayah: 'previous'||'prev' }); // change to previous ayah
	 *   quran.change({ ayah: 'next', cycle: true }); // change to next ayah but return to the first ayah on that page if the next ayah is out of the page's scope
	 *   anchor: boolean // TODO changes ayah with scrolling/anchoring to respective ayah number
	 */
	change: function(params, from) {
		var self = this,
			params = jQuery.extend({}, params),
			href = window.location.href.replace(/#.*$/,''),
			hash = window.location.hash.replace(/^#/,''),
			keys = self.data('keys'),
			prior = self.state(),
			view = self.data('view'),
			change = { key : params.key ? params.key : prior.key },
			index = jQuery.inArray(change.key, keys),
			part = change.key.split(/:/),
			match = hash.match(/^[^\/]+(\/.*)?$/),
			last = quran.data('last') || quran.data('last', {}),
			range, url, state;

		if (params.force || params.next || params.prev || change.key != prior.key || params.context && params.context != self.state('context')) {
			if (params.context)
				change.context = params.context;
			else if (match && match[2])
				change.context = match[2];
			else change.context = prior.context;

			change.context = '/'+ jQuery.map(change.context.split('/'), function(a) { return a ? a : null; }).join('/');

			if (index == -1) {
				var split = change.key.split(/:/),
					surah = parseInt(split[0]),
					ayah = parseInt(split[1]),
					ayahs = self.data('surahs['+ (surah - 1) +'].ayahs'),
					valid = view == 'main' && surah == self.data('page.surah') && ayah >= 1 && ayah <= ayahs;
				if (valid) {
					if (from == 'load')
						return;
					else return self.load({ key: change.key, change: jQuery.extend(params, change) }, 'change');
				} else change.key = prior.key;
			} else
			if (params.next) {
				if (keys[index + 1]) {
					change.key = keys[index + 1];
				} else
				if (params.cycle) {
					change.key = keys[0];
				}/* else
				if (view == 'main' && change.key == self.page('last') && self.page('next')) {
					if (self.page('next').first != self.page('next').last)
						range = self.page('next').first +'-'+ self.page('next').last;
					else range = self.page('next').first;

					url = '/'+ self.data('language').language_code +'/'+ self.page('next').surah + '/'+ range +'/#'+ (parseInt(part[1]) + 1) + change.context;

					window.location.assign(url);
					return;
				}*/
			} else
			if (params.prev) {
				if (keys[index - 1]) {
					change.key = keys[index - 1];
				}/* else
				if (view == 'main' && change.key == self.page('first') && self.page('prev')) {
					if (self.page('prev').first != self.page('prev').last)
						range = self.page('prev').first +'-'+ self.page('prev').last;
					else range = self.page('prev').first;

					url = '/'+ self.data('language').language_code +'/'+ self.page('prev').surah + '/'+ range +'/#'+ (parseInt(part[1]) - 1) + change.context;

					window.location.assign(url);
					return;
				}*/
			}

			change.index = jQuery.inArray(change.key, keys);
		} else return;

		state = self.state(change);

		window.location.replace(href +'#'+ (view == 'main' ? state.key.split(/:/)[1] : state.key) + state.context);

		if (index >= 0) {
			if (params.anchor) {
				if (change.index == 0)
					self.window.scrollTop(0);
				else self.window.scrollTop(Math.round(jQuery('#anchor-'+ (change.key.split(/:/).join('-'))).offset().top));
			}
		}

		if (params.force && change.key != prior.key || change.index == 0 || change.key != prior.key) {
			self.run('change', state, from);
		}
	},
	// TODO: implement 'load' method, and refactor 'trigger' and 'bind' to 'event' and 'on'
	load: function(params, from) {
		var self = this,
			view = self.data('view'), // search or main
			change = params.change ? jQuery.extend(params.change, { anchor: true, force: true }) : null;

		if (view != 'main') // only main view supported atm
			return;

		function run(content) {
			var count = self.data('count');

			count.load++;

			if (change) {
				function ready(change) {
					if (count.load > count.ready)
						self.one('ready', function() { ready(change); }, 2, 'load');
					else self.change(change, 'load');
				};

				self.change(change, 'load');

				self.one('load', function() {
					self.change(change, 'load');
				}, 4, 'load');

				self.one('ready', function() { ready(change); }, 2, 'load');
			}

			setTimeout(function() {
				self.run('load', { params: params, content: content }, from);
			}, 100);
		};

		var page = self.data('page'),
			surah = page.surah,
			range, url;

		if (params.key) {
			if (jQuery.inArray(params.key, self.data('keys')) >= 0)
				return run(jQuery(self.data('content.selector')));

			var key = params.key.split(/:/),
				ayah = parseInt(key[1]);
			
			range = [ayah, ayah];
		} else
		if (params.range) {
			range = params.range;
		}
		if (params.page && params.page == 'next') {

			if (page.next)
				range = [page.next.first, page.next.last];
		}

		url = surah && range ? '/'+ surah +'/'+ ( range[0] == range[1] ? range[0] : range[0] +'-'+ range[1] ) +'/ajax' : null;

		if (url) {
			var pages = self.data('pages'),
				keys = self.data('keys');

			self.ajax(url, params, {
				wait: true,
				success: function(response) {
					var after,
						fonts = jQuery(),
						content = jQuery(response.content);

					jQuery.each(response.fonts, function(id, font) {
						if (jQuery('#'+ id).length)
							return;
						else fonts = fonts.add(jQuery(font));
					});

					jQuery.extend(response, {
						fonts: fonts,
						content : content,
						page : quran.copy(response.page)
					});


					jQuery.each(keys, function(index, value) {
						if (range[0] > parseInt(value.split(/:/)[1]))
							after = index;
						else return false;
					});

					after = keys[after].split(/:/);

					jQuery('#ayah-'+ after[0] +'-'+ after[1]).after(content);

					jQuery('#content').find('style').last().after(fonts);

					jQuery.merge(pages, response.pages);
					jQuery.merge(keys, response.keys);

					keys = keys.sort(function(a,b) { return parseInt(a.split(/:/)[1]) > parseInt(b.split(/:/)[1]); })

					if (response.page.last > page.last)
						page.last = response.page.last;

					if (response.page.next && page.next) {
						if (response.page.next.first > page.next.first && response.page.next.last > page.next.last)
							page.next = response.page.next;
					} else page.next = undefined;

					if (from == 'Quran')
						run(jQuery(self.data('content.selector')));
					else run(content.filter(self.data('content.selector')));

					var before = range[0],
						after = parseInt(after[1]);

					if (before - after > 1) {
						self.load({ range: [ after + 1, before - 1 ], change: params.change }, 'load');
					}

					if (params.success)
						params.success.apply(self, arguments);
				}
			});
		}
	}
};
