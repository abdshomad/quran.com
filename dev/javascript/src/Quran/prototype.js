Quran.prototype =  {
	ui: { head: {}, body: {}, content: {}, side : {}, widget: {} },
	_devel: true,
	_cache: {},
	_bind: {},
	_data: {},
	_page: {},
	_state: { context: '/' },
	_onchange: {},
	bind: function(ev, fn) {
		if (!this._bind[ev])
			this._bind[ev] = [];
		this._bind[ev].push(fn);
	},
	trigger: function(ev, data) {
		if (this._bind[ev])
			for (var i=0; i < this._bind[ev].length; i++)
				this._bind[ev][i].call(this, data)
	},
	template: function(str, data, id) {
		var self = this;

		if (data && typeof(data) == 'string') {
			id = data;
			data = {};
		} else data = data || {};

		if (id && self._cache[id])
			return self._cache[id];

		var fn = new Function(
			"obj",
			"var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('" +
				jQuery.trim(str
					.replace(/[\r\t\n]/g, " ")
					.split("<%").join("\t")
					.replace(/((^|%>)[^\t]*)'/g, "$1\r")
					.replace(/\t=(.*?)%>/g, "',$1,'")
					.split("\t").join("');")
					.split("%>").join("p.push('")
					.split("\r").join("\\'")
					.replace(/>[\s]{2,}</g,'><')
					.replace(/[\s]{2,}/g, ' ')) +
			"');}return p.join('');"
		);

		var r = fn(data);

		if (id) self._cache[id] = r;

		return r;
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
	_copy: function(object_or_array) {
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
				if (thing.length !== undefined)
					new_thing = [];
				else
					new_thing = {};
				for (var key in thing) {
					new_thing[key] = get_copy(thing[key]);
				}
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
			else
				this._data[key] = val;
			return val;
		}
		else if (key === undefined)
			return this._data;
		else if (val === undefined && typeof(key) == 'object')
			return jQuery.extend(this._data, key);
		else if (val === undefined && typeof(key) == 'string' && this._data[key])
			return this._data[key];
		else {
			var data;
			try {
				data = eval('this._data.'+ key);
			} catch(e) {}
			if (data)
				return data;
			else
				return;
		}
	},
	ajax: function(url, params, options) {
		var self = this,
			options = jQuery.extend({ type: 'POST' }, options, { url: url, contentType: 'application/json', data: JSON.stringify(params) });

		if (self._ajax[url] === undefined)
			self._ajax[url] = jQuery.ajax(options);
		else {
			if (options.abort)
				self._ajax[url].abort();
			self._ajax[url] = jQuery.ajax(options);
		}
	},
	_ajax: {},
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
				jQuery.extend(self.data('session'), argument[0]); // extend with object
				self.ajax('/session', { session: argument[0] }, { abort: true }); // save
			}
		}
		else { // set
			jQuery.extend(self.data('session'), argument[0]); // extend with object

			var params = jQuery.extend({ session: argument[0] }, argument[1]),
				options = argument[2] || {},
				url = options.url ? '/session'+ options.url : '/session';

			delete options.url;

			self.ajax(url, params, options) // save with possible callback
		}
	},
	state: function(state, val) {
		var self = this,
			part;

		if (state !== undefined && typeof(state) == 'object')
			jQuery.extend(self._state, state);
		else if (state !== undefined && typeof(state) == 'string' && val !== undefined)
			self._state[state] = val;
		else if (state !== undefined && typeof(state) == 'string' && val === undefined)
			return self._state[state];

		return self._copy(self._state);
	},
	page: function(key) {
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
	change: function(params, owner) {
		var self = this,
			params = jQuery.extend({}, params),
			href = window.location.href.replace(/#.*$/,''),
			hash = window.location.hash.replace(/^#/,''),
			keys = self.data('keys'),
			state = self.state(),
			view = self.data('class'),
			change = { key : params.key ? params.key : state.key },
			index = jQuery.inArray(change.key, keys),
			part = change.key.split(/:/),
			match = hash.match(/^[^\/]+(\/.*)?$/),
			range, url, result;


		if (owner == 'Quran' || params.force || params.next || params.prev || change.key != state.key || params.context && params.context != self.state('context')) {
			if (params.context)
				change.context = params.context;
			else if (match && match[2])
				change.context = match[2];
			else change.context = state.context;

			change.context = '/'+ jQuery.map(change.context.split('/'), function(a) { return a ? a : null; }).join('/');

			if (index == -1) {
				change.key = state.key;
			} else
			if (params.next) {
				if (keys[index + 1]) {
					change.key = keys[index + 1];
				} else
				if (params.cycle) {
					change.key = keys[0];
				} else
				if (view == 'main' && change.key == self.page('last') && self.page('next')) {
					if (self.page('next').first != self.page('next').last)
						range = self.page('next').first +'-'+ self.page('next').last;
					else range = self.page('next').first;

					url = '/'+ self.data('language').language_code +'/'+ self.page('next').surah + '/'+ range +'/#'+ (parseInt(part[1]) + 1) + change.context;

					window.location.assign(url);
					return;
				}
			} else
			if (params.prev) {
				if (keys[index - 1]) {
					change.key = keys[index - 1];
				} else
				if (view == 'main' && change.key == self.page('first') && self.page('prev')) {
					if (self.page('prev').first != self.page('prev').last)
						range = self.page('prev').first +'-'+ self.page('prev').last;
					else range = self.page('prev').first;

					url = '/'+ self.data('language').language_code +'/'+ self.page('prev').surah + '/'+ range +'/#'+ (parseInt(part[1]) - 1) + change.context;

					window.location.assign(url);
					return;
				}
			}

			change.index = jQuery.inArray(change.key, keys);
		} else return;

		result = self.state(change);

		window.location.replace(href +'#'+ (view == 'main' ? result.key.split(/:/)[1] : result.key) + result.context);

		if (params.anchor) {
			if ((view == 'main' && !self.page('prev') && change.index == 0) || (view == 'search' && change.index == 0))
				self.window.scrollTop(0);
			else self.window.scrollTop(Math.round(jQuery('#anchor-'+ (change.key.split(/:/).join('-'))).offset().top));
		}

		if (owner == 'Quran' || params.force || change.index == 0 || change.key != state.key) {
			self._last_change_from = owner;
			//console.debug('change from', owner ? owner : 'anonymous');
			//console.dir(result);
			//console.time(result.key + ' callbacks');
			jQuery.each(self._onchange, function(priority, stack) {
				jQuery.each(stack, function(index, callback) {
					callback.call(self, result, owner);
				});
			});
			//console.timeEnd(result.key + ' callbacks');
		}

	},
	/* quran.onchange
	 *  description - binds a callback function to a change in the application's state
	 *  usage examples -
	 *   quran.onchange(function(state) {
	 *      alert('ayah number: '+ state.ayah);
	 *      alert('ayah id: '+ state.id);
	 *      alert('ayah surah: '+ state.surah);
	 *   });
	 */
	onchange: function(callback, priority) {
		if (!priority)
			priority = 100;
		if (!this._onchange[priority])
			this._onchange[priority] = [];
		this._onchange[priority].push(callback);

		this._onchange = jQuery.sort(this._onchange);
	}
};
