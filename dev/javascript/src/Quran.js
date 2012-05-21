var Quran = function Quran(data) { // constructor
	var q = this;

	jQuery.extend(q, {
		jQ: {
			window: jQuery(window),
			document: jQuery(document),
			html: jQuery('html'),
			body: jQuery('body'),
			overlay: jQuery('#overlay'),
			scroll: jQuery('#scroll'),
			slider: jQuery('#slider'),
			ayat: jQuery('#ayat'),
			ayah: jQuery('.ayah'),
			fonts: jQuery('.fonts')
		}
	});

	window.jQ = q.jQ;
	window.setInterval(function() {
		jQuery.each(jQ, function(name, elem) {
			if (elem.selector) jQ[name] = jQuery(elem.selector);
		});
	}, 1000);


	var key = q.jQ.ayah.first().attr('data-key').split(/:/);
	jQuery.extend(data, {
		state: {
			namespace: data.namespace,
			action: data.action,
			key: key.join(':'),
			surah: parseInt(key[0]),
			ayah: parseInt(key[1]),
			context: '/'
		}
	});

	//q.d = q.d;

	q.d(q, jQuery.copy(data));

  for (var module in Quran.ui) {
		console.time('Quran.ui.'+ module);
		q.ui[module] = new Quran.ui[module](q);
		console.timeEnd('Quran.ui.'+ module);
  }

	q.on('load', function() {
		q.cached();
	}, 1, 'Quran');

	q.on('selectContent', function(result) {
		q.cached(result.cached);
	}, 0, 'Quran');

	jQuery.each(q.event, function(ev, fn) {
		q.event[ev] = jQuery.proxy(fn, q);
	});

	q.jQ.window.bind('load.window hashchange.window', q.event.init);

	q.on('scroll', function(change, from, timestamp) { // triggered from scrollAnchor
		var last = q.d('scroll.timestamp') || q.d('scroll.timestamp', timestamp);
		var state = q.state({ key: change.key, set: false });
		jQuery.extend(change, state);
		if (timestamp - last > 382) {
			q.hash( state );
			q.d('scroll.timestamp', timestamp);
		}
	}, -99, 'Quran');

	q.one('init', function() {
		jQ.slider.q_dash_slider();
	});
};

Quran.ui = {};

Quran.prototype =  {
	_: (function(console) {
		var shh = !window.debug || !window.console;
		var _;
		if (window.console) {
			var dir = jQuery.proxy(function(a) {
				this.dir(a ? q.d(a) : q.d());
			}, window.console);
			_ = shh ? function(){} : dir;
			_._ = dir;
		}
		else {
			_ = function(){};
			_._ = function(){};
		}
		_.nothing = _._.nothing = function(){};
		jQuery.each(['log','debug','info','warn','exception','assert','dir','dirxml','trace','group','groupEnd','groupCollapsed','profile','profileEnd','count','clear','time','timeEnd','timeStamp','table','error','memoryProfile','memoryProfileEnd'], function(i, fn) {
			_[fn] = !shh && window.console && window.console[fn] ? window.console[fn] : function(){};
			_._[fn] = window.console && window.console[fn] ? window.console[fn] : function(){};
		});
		_.alert = _._.alert = shh ? function(){} : function(msg) {
			window.alert(msg);
		};
		_.ie = _._.ie = function() {
			if (jQuery.browser.msie)
				q._.debug('msie', arguments);
		};
		return _;
	})(window.console),
	ui: { window: {}, head: {}, body: {}, content: {}, side : {}, widget: {} },
	event: {
		init: function(ev) {
			var q = this;
			q._._.debug('init called', ev.type);
			var hash = q.hash(), state = q.state(), from = ev.handleObj.type +'.window', change;

			if (hash.key != state.key || from == 'load.window')
				change = { key: hash.key, anchor: true };

			if (hash.context != state.context)
				change = jQuery.extend(change, { context: hash.context });

			if (change) {
				change = jQuery.extend(change, { force: true });
				if (from == 'load.window') {
					if (jQuery.inArray(change.key, q.d('keys')) >= 0) {
						q.run('load', q.jQ.ayah, from, function() {
							q.change(change, from);
						});
					}
					else {
						var last = q.jQ.ayah.length;
						jQuery.extend(change, {
							post: function() {
								q.one('ready:post', function() {
									setTimeout(function() {
										q.run('load', q.jQ.ayah.slice(0, last), from);
									}, 1000);
								}, 0, from);
							}
						});
						q.change(change, from);
					}
				}
				else {
					q.change(change, from);
				}
			}
		}
	},
	on: function(ev, fn, pr, id) {
		var q = this,
			on = q.d('on') || q.d('on', {}),
			pr = typeof pr == 'number' ? pr : 100;

		jQuery.each(jQuery.uniq(ev.split(/\s+/)), function(i, ev) {
			if (!on[ev])
				on[ev] = {};

			if (!on[ev][pr])
				on[ev][pr] = [];

			if (id)
				fn.id = id;

			on[ev][pr].push(fn);

			on[ev] = jQuery.sort(on[ev]);
		});
	},
	off: function(ev, params) {
		var q = this,
			on = q.d('on') || q.d('on', {}),
			params = jQuery.extend({}, params);

		if (ev) {
			jQuery.each(jQuery.uniq(ev.split(/\s+/)), function(i, ev) {
				if (params.priority === undefined && params.from === undefined && params.one === undefined) {
					delete on[ev];
				}
				else {
					for (var pr in on[ev]) {
						if (params.priority !== undefined) {
							if (params.priority == pr) {
								delete on[ev][pr];
							}
						}
						else {
							for (var i = 0; i < on[ev][pr].length; i++) {
								var fn = on[ev][pr][i];
								if (params.from) {
									if (params.from == fn.id) {
										if (params.one) {
											if (fn.one) {
												delete on[ev][pr][i];
											}
										}
										else {
											delete on[ev][pr][i];
										}
									}
								}
								else {
									if (params.one) {
										if (fn.one) {
											delete on[ev][pr][i];
										}
									}
									else {
										delete on[ev][pr][i];
									}
								}
							}
						}
					}
				}
			});
		}

		jQuery.each(on, function(ev, object) {
			var length = 0;
			for (var pr in on[ev]) {
				length = 1; break;
			}
			if (!length) {
				delete on[ev];
			}

			if (on[ev]) {
				jQuery.each(on[ev], function(pr, array) {
					on[ev][pr] = jQuery.grep(on[ev][pr], function(v, i) {
						return v !== undefined;
					});
					if (!on[ev][pr].length) {
						delete on[ev][pr];
					}
				});
			}
		});
	},
	one: function(ev, fn, pr, id) {
		var q = this,
			pr = typeof pr == 'number' ? pr : 100;

		fn.one = true;

		jQuery.each(jQuery.uniq(ev.split(/\s+/)), function(i, ev) {
			q.on(ev, fn, pr, id);
		});
	},
	run: function() {
		var q = this,
			on = q.d('on') || q.d('on', {}),
			args = jQuery.makeArray(arguments),
			ev = args.shift(), cb, id, params = {}, last = args[args.length - 1], first = args[0];

		if (typeof last == 'object' && last !== first) {
			params = args.pop();
			last = args[args.length - 1];
		}

		if (params.skip) {
			var hash = {};
			jQuery.each(params.skip.split(/\s+/), function(i, v) {
				hash[v] = true;
			});
			params.skip = hash;
		} else params.skip = {};

		if (typeof last == 'function' && last !== first) {
			cb = args.pop();
			last = args[args.length - 1];
		}

		if (typeof last == 'string')
			id = last;
		else id = 'unknown';

		args.push(new Date().getTime());

		var time = ' run : '+ ev;
		var limit = 28, chars = time.length;
			for (var j =  0; j < limit - chars; j++)
				time += ' ';
		time += ' from : '+ id;
		limit = 89, chars = time.length;
		for (var j =  0; j < limit - chars; j++)
			time += ' ';
		time += ' total ';

		var group = '  in : '+ id;
		limit = 29, chars = group.length;
			for (var j =  0; j < limit - chars; j++)
				group += ' ';
		group += ' run : '+ ev;
		limit = 56, chars = group.length;
		for (var j =  0; j < limit - chars; j++)
			group += ' ';
		group += ' passed : ';

		console.groupCollapsed(group, { args: args, params: params });
		console.time(time);

		function _skip(ev, id) {
			return ( params.skip[':pre:'+ id] && /:pre$/.test(ev) || params.skip[':post:'+ id] && /:post$/.test(ev) || params.skip[':'+ id] && !/:pre$|:post$/.test(ev) || params.skip['*:' +id] ) ? true : false;
		};

		function _id(fn) {
			return fn.id ? fn.id : 'unknown';
		};

		ev = jQuery.uniq(ev.split(/\s+/));

		jQuery.each(ev, function(i, ev) {
			if (!/:pre$|:post$/.test(ev))
				ev = ( params.skip[':pre'] ? '' : ev +':pre ' ) + ev + ( params.skip[':post'] ? '' : ' '+ ev +':post' );
			ev = ev.split(/\s+/);
			jQuery.each(ev, function(i, ev) {
				if (on[ev]) {
					for (var pr in on[ev]) {
						var length = on[ev][pr].length;
						if (on[ev][pr] === undefined) continue;
						for (var i = 0; i < length; i++) {
							if (on[ev][pr][i] === undefined) continue;
							var id = _id(on[ev][pr][i]);
							if (_skip(ev, id)) return;

							var time = '  on : '+ ev;
							var limit = 30, chars = time.length;
							for (var j =  0; j < limit - chars; j++)
								time += ' ';
							time +=' in : '+ id;
							limit = 60, chars = time.length;
							for (var j =  0; j < limit - chars; j++)
								time += ' ';
							time += ' pr : '+ pr +','+ i;
							limit = 90, chars = time.length;
							for (var j =  0; j < limit - chars; j++)
								time += ' ';
							time += ' time ';
							console.time(time);
							on[ev][pr][i].apply(self, args);
							console.timeEnd(time);
						}
						if (on[ev][pr] === undefined) continue;
						for (var i = 0; i < length; i++) {
							if (on[ev][pr][i] === undefined) continue;
							var id = _id(on[ev][pr][i]);
							if (_skip(ev, id)) return;
							if (on[ev][pr][i].one)
								delete on[ev][pr][i];
						}

						if (on[ev][pr])
							on[ev][pr] = jQuery.grep(on[ev][pr], function(value, index) {
								return value !== undefined;
							});
					}
				}
			});
		});

		if (cb) cb.apply(self, args);

		console.timeEnd(time);
		console.groupEnd();
	},
	notify: function(msg) {
		console.warn(msg);
	},
	localize: function(key) {
		var q = this;
		if (q.d('lexicon')[key] === undefined) {
			/*
			if (quran.data('account') && jQuery.inArray('developer', quran.data('account').roles) != -1) {
				jQuery.ajax({
					url: '/i18n/message', type: 'POST', contentType: 'application/json',
					data: JSON.stringify({
						key: key
					})
				});
			}
			q.d('lexicon')[key] = key;
			*/
			return key;
		}
		return q.d('lexicon')[key];
	},
	d: function(key, val) {
		var q = this, obj = q;

		if (typeof key == 'object' || typeof key == 'function') {
			var args = jQuery.makeArray(arguments);

			obj = args.shift(), key = args.shift(), val = args.shift();
		}

		if (!obj._d) obj._d = {};

		if (!q.d._d) q.d._d = {};
		if (!q.d._d.ref)
			q.d._d.ref = function(obj, key, val) {
				var keys = jQuery.copy(jQuery.grep(key.split(/[.\[\]]/), function(v,i) { return v !== ''; }));
				var ref = obj._d;
				jQuery.each(keys, function(i, _key) {
					if (i + 1 == keys.length) {
						key = _key;
						return false;
					}
					if (ref[_key] === undefined) ref[_key] = {};
					ref = ref[_key];
				});
				if (val !== undefined)
					ref[key] = val;
				return ref[key];
			};

		if (key !== undefined && val !== undefined) {
			if (/[.\[\]]/.test(key)) {
				val = q.d._d.ref(obj, key, val);
			}
			else obj._d[key] = val;
			return val;
		}
		else if (key === undefined)
			return obj._d;
		else if (val === undefined && typeof(key) == 'object')
			return jQuery.extend(obj._d, key);
		else if (val === undefined && typeof(key) == 'string') {
			if (obj._d[key] !== undefined)
				return obj._d[key];
			else if (/[.\[\]]/.test(key)) {
				var data = q.d._d.ref(obj, key);
				if (data !== undefined) return data;
				else return obj._d[key];
			}
		}
		else return obj._d[key];
	},
	cached: function(data) {
		var q = this,
			content = q.d('content') || q.d('content', {}),
			session = q.d('session');

		if (!data) {
			data = {};

			var copy = function() {};
			copy.prototype = jQuery.copy(session.content);

			if (copy.prototype.quran.text) {
				var resource_code = copy.prototype.quran.text;
				copy.prototype.quran.text = {};
				copy.prototype.quran.text[resource_code] = 1;
			}

			jQuery.each(q.d('keys'), function(index, key) {
				if (content.cached && content.cached[key])
					return;

				data[key] = new copy;
			});
		}

		if (!content.cached)
			content.cached = data;
		else q.extend(content.cached, data);

		return content.cached;
	},
	extend: function(data, extend) {
		var q = this;

		for (var key in extend) {
			if ((data[key] !== undefined && typeof data[key] == 'object' && !data[key].length && data[key] !== null) &&
				(extend[key] !== undefined && typeof extend[key] == 'object' && !extend[key].length && extend[key] !== null)) {
				var dataRef = data[key], extendRef = extend[key];
				q.extend(dataRef, extendRef);
			}
			else data[key] = extend[key];
		}

		return data;
	},
	ajax: function(url, params, options) {
		var q = this,
			ajax = q.d('ajax') || q.d('ajax', {}),
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
		var q = this,
			argument = arguments;

		if (argument[1] === undefined) {
			if (argument[0] === undefined) { // get
				return q.d('session');
			} else
			if (typeof argument[0] == 'string') {
				if (argument[0] == 'save') {  // set
					q.ajax('/session', { session: q.d('session') }); // existing data
				}
				else { // get
					return q.d('session.'+ argument[0]); // by key
				}
			}
			else {// set
				if (argument[0].content && argument[0].content.quran)
					q.d('session.content.quran', {});
				quran.extend(q.d('session'), argument[0]); // extend with object
				q.ajax('/session', { session: argument[0] }, { abort: true }); // save
			}
		}
		else { // set
			if (argument[0].content && argument[0].content.quran)
				q.d('session.content.quran', {});
			quran.extend(q.d('session'), argument[0]); // extend with object

			var params = jQuery.extend({ session: argument[0] }, argument[1]),
				options = argument[2] || {},
				url = options.url ? '/session'+ options.url : '/session';

			delete options.url;

			q.ajax(url, params, options) // save with possible callback
		}
	},
	ayah: function(p, jQ) {
		var q = this,
			index = p && p.index ? p.index : p.key ? jQuery.inArray(p.key, q.d('keys')) : -1;
		return index >= 0 ? jQ ? q.jQ.ayah.eq(index) : q.jQ.ayah[index] : undefined;
	},
	state: function(k, v) {
		var q = this;

		var d = q.d('state') || q.d('state', {
			key: q.jQ.ayah.first().attr('data-key'),
			context: '/'
		}), s;

		if (k !== undefined && typeof(k) == 'object') {
			if (v !== undefined && typeof(v) == 'string')
				d.id = v;
			if (k.set !== undefined && !k.set)
				d = jQuery.copy(d); // return state like object without actually setting state
			jQuery.extend(d, k);
		}
		else if (k !== undefined && typeof(k) == 'string' && v !== undefined) d[k] = v;

		var keys = q.d('keys');
		var split = jQuery.copy(d.key.split(/:/));

		d.surah = split[0];
		d.ayah = split[1];
		d.alt = split.join('-');
		d.index = jQuery.inArray(d.key, keys);

		var h = { key: 1, alt: 1, index: 1, surah: 1, ayah: 1, context: 1, id: 1, action: 1, namespace: 1 };

		for (var p in d) if (!h[p]) delete d[p];

		d.id = d.id ? d.id : 'unknown';

		if (k !== undefined && typeof(k) == 'string' && v === undefined) s = d[k];
		else s = jQuery.copy(d);

		return s;
	},

	hash: function(x) {
		var q = this, d = q.d('hash') || q.d('hash', {}), s = q.d('state');

		if (x === undefined) {
			var hash = window.location.hash.replace(/^#/, '').split('/');

			d.key = (function() {
				var key = hash.shift();
				key = s.namespace == 'main' ? s.surah +':'+ parseInt(key) : key;
				key = /^\d+:\d+$/.test(key) ? key : s.key;
				return key;
			})();
			d.ayah = parseInt(d.key.split(/:/)[1]);
			d.context = '/'+ jQuery.map(hash, function(a) { return a ? a : null; }).join('/');

			return d;
		} else
		if (typeof x === 'object') {
			x.ayah = x.ayah ? x.ayah : x.key ? parseInt(x.key.split(/:/)[1]) : d.ayah ? d.ayah : s.ayah;
			x.key = x.key ? x.key : x.ayah ? s.surah +':'+ x.ayah : d.key ? d.key : s.key;
			x.context = x.context ? x.context : d.context ? d.context : s.context;
			x.context = '/'+ jQuery.map(x.context.split(/\//), function(a) { return a ? a : null; }).join('/');

			if (x.key != d.key || x.context != d.context) {
				q.jQ.window.unbind('hashchange.window').one('hashchange.window', function() {
					clearTimeout(q.d('hashchange.timeout'));
					q.d('hashchange.timeout', setTimeout(function() {
						q.jQ.window.unbind('hashchange.window').bind('hashchange.window', q.event.init);
					}, 1000));
				});

				window.location.replace( // 20-25ms
					window.location.href.replace(/#.*$/,'') +'#'+
					(s.namespace == 'main' ? x.ayah : x.key)
					+ x.context
				);

				jQuery.extend(d, x);
			}

			return d;
		} else return d[x];
	}, // hash:

	change: function(change, from) {
		var q = this;

		//q._._.info('called', change.key, from);

		var last = q.state(), keys = q.d('keys'), namespace = q.d('namespace');

		if (!change.key)
			change.key = last.key;
		if (!change.context)
			change.context = last.context;

		q.change.debug = false;

		if (q.change.debug) {
			q._.debug('change', change, from);
		}

		change.index = jQuery.inArray(change.key, keys);
		var split = jQuery.copy(change.key.split(/:/));
		change.surah = split[0];
		change.ayah = split[1];

		if (change.force || change.next || change.prev || change.key != last.key || change.context != last.context) {
			if (change.index == -1) { // not in keys
				var surah = q.d('surah');
				if (namespace == 'main' && change.surah == surah.surah_id && change.ayah >= 1 && change.ayah <= surah.ayahs) {
					if (change.gently) return; // preventing possible infinite loop
					else return q.load({ key: change.key }, jQuery.extend(change, { force: true }), from);
				} else change.key = last.key;
			} else
			if (change.next) {
				if (keys[change.index + 1]) {
					change.key = keys[change.index + 1];
				} else
				if (change.cycle) {
					change.key = keys[0];
				}
			} else
			if (change.prev) {
				if (keys[change.index - 1]) {
					change.key = keys[change.index - 1];
				}
			}

			change.index = jQuery.inArray(change.key, keys);
		} else return;

		change.id = from;

		change = jQuery.extend(change, q.state(change));

		if (change.index == 0 || change.key != last.key || change.context != last.context || change.force) {
			q.one('change:pre', function(change, from) {
				q.load({ cancel: true });
				if (change.index >= 0 && change.anchor) {
					q.run('anchor', change, from); // 450-500ms
				}
			}, 0, from);

			q.run('change:pre', change, from);

			if (change.index == 0 || change.key != last.key || change.context != last.context) {
				q.one('change', function(change, from) {
					q.hash({ key: change.key, context: change.context });
					q._._.warn('changed', change.key, from);
				}, 0, from);

				if (change.post) q.one('change:post', change.post);

				q.run('change', change, from, { skip: ':pre :post' });
			}

			q.run('change:post', change, from);
		}
	},
	anchor: function(change, from, params) {
		var q = this, change = q.state(change, false);
		q.run('anchor', change, from, params);
	},
	/*
	 * perhaps when load is called, before we append to the dom we should
	 * remember the state (which ayah we're on) and set .ayah visibility to hidden or even opacity 0.5 for all ayahs except the current one,
	 * which instead has position absolute and top set to window.scrollTop
	 * then we alter the dom and when the new ayahs are ready remove the absolute positioning and hidden visibility
	 *
	 * if ayahs are loaded above current ayah at time of .load() and there is no change parameter set
	 * then add the change parameter manually because content inserted above will push the current ayah
	 * down
	 *
	 * don't run .change until ready
	 * in the meantime attempt the trickery above
	 * upon ready, undo the trickery above and run change
	 *
	 * if ayahs are loading below, don't allow changing past the last ayah already loaded until the loaded ayahs are ready
	 *
	 * scrollAnchor
	 * scrollLoader
	 * scrollReady
	 * scrollKeys
	 */
	load: function(load, change, from) {
		var q = this, load = jQuery.extend({}, load), d = q.d('load') || q.d('load', {});

		if (load.cancel || d.request) {
			if ( ( load.key && d.request.key == load.key ) || ( load.range && d.request.range && d.request.range[0] == load.range[0] && d.request.range[1] == load.range[1] ) )
				return;
			else {
				clearTimeout(d.timeout);
				if (d.request && d.request.readyState < 4) {
					d.request.abort();
					delete d.request;
					q.off('change change:pre change:post anchor anchor:pre anchor:post load load:pre load:post ready ready:pre ready:post', { from: 'load', one: true });
				}
				q.jQ.ayat.removeClass('loading ui-hide-opacity');
				q.jQ.ayah.removeClass('ui-hide-position');
				if (load.cancel) return;
			}
		}

		q.load.debug = false;

		if (q.load.debug) {
			q._.debug('load', arguments);
			q._(load);
		}

		if (typeof change == 'string') {
			from = change;
			change = undefined;
		} else
		if (typeof change == 'object') {
			change.anchor = true;
		} else change = undefined;

		if (q.d('namespace') != 'main') return; // TODO implement for search

		function run(ayahs) {
			var n = q.d('n');

			if (q.load.debug) {
				q._.debug('run called', ayahs);
			}

			if (change) {
				function go(change, ready) {
					if (ready && change.ready)
						q.one('ready:post', change.ready, 0, 'load');
					if (!(change.ceil && change.ceil > q.state('ayah'))) {
						change.gently = true;
						q.change(change, 'load');
					}
				};

				function ready(change) {
					if (n.load > n.ready)
						q.one('ready', function() { ready(change); }, 1, 'load');
					else go(change, true);
				};

				q.one('load', function() { go(change); }, 1, 'load');
				q.one('ready', function() { ready(change); }, 1, 'load');
			}

			q.one('load', function(ayah) { q.jQ.ayat.addClass('ui-hide-opacity'); ayah.removeClass('ui-hide-position'); }, 0, 'load');
			q.one('ready', function(ayah) { q.jQ.ayat.removeClass('ui-hide-opacity'); }, 2, 'load');
			q.one('load', function() { q.jQ.ayat.removeClass('loading'); }, 3, 'load');

			q.run('load', ayahs, from, { skip: ':pre' });
		};

		var keys = q.d('keys');

		if (load.key) {
			if (jQuery.inArray(load.key, keys) >= 0) {
				return;
			}
			else {
				var ayah = parseInt(load.key.split(/:/)[1]);

				var above = q.ui.scrollLoader.foo({
					ayah: ayah,
					dir: -1
				});

				var below = q.ui.scrollLoader.foo({
					ayah: ayah,
					dir: 1
				});

				if (above.range.length)
					load.range = above.range;
				else load.range = [];

				if (below.range.length)
					if (below.range[1])
						load.range[load.range.length ? 1 : 0] = below.range[1];
					else load.range[load.range.length ? 1 : 0] = below.range[0];
			}
		}

		if (load.range.length) {
			var url = '/'+ q.d('surah.surah_id') +'/'+ load.range[0] +( load.range[1] ? '-'+ load.range[1] : '' ) + '/ajax';

			if (q.load.debug) {
				q._.debug('load', url);
				q._(load);
			}

			q.jQ.ayat.addClass('loading');

			clearTimeout(d.timeout);
			d.timeout = setTimeout(function() {
				q.one('load:pre', function() {
					var state = q.state();

					var foo = {
						min: Math.min(load.range[0], load.range[1] || load.range[0]),
						max: Math.max(load.range[0], load.range[1] || load.range[0])
					};

					var ceil = foo.max <= state.ayah - 1? foo.max + 1 : undefined;

					if (change === undefined && ceil) { //( ceil || floor ) ) {
						change = { force: true, anchor: true };
						if (ceil)
							change.ceil = ceil;
						change.key = state.key;
						change.offset = q.ayah(change).offsetTop - q.jQ.window.scrollTop();
					}
				}, 0, 'load');

				d.request = q.ajax(url, load, {
					wait: true,
					success: function(r) {
						if (q.load.debug) {
							q._(r);
						}

						jQuery.each(r.fonts, function(id, css) {
							if (jQuery('#'+ id).length) {
								delete r.fonts[id];
								return;
							}
							else {
								r.fonts[id] = jQuery('<style type="text/css" id="'+ id +'" class="fonts" scoped="scoped">'+ css +'</style>');
								q.jQ.fonts.last().after(r.fonts[id]);
								q.jQ.fonts = q.jQ.fonts.add(r.fonts[id]);
							}
						});

						r.ayah = jQuery(r.ayah).filter('.ayah').addClass('ui-hide');

						jQuery.each(r.ayah, function(i, ayah) {
							ayah = jQuery(ayah);
							var id = ayah.attr('id');
							if (jQuery('#'+ id).length) {
								r.ayah = r.ayah.not('#'+ id);
								return;
							}
						});

						var k = q.d('keys'), j = r.keys;

						jQuery.each(j, function(i, jk) {
							if (jQuery.inArray(jk, k) >= 0) return;
							var ja = parseInt(jk.split(/:/)[1]), ki = 0;
							for (var i = 0; i < k.length; i++) {
								var ka = parseInt(k[i].split(/:/)[1]);

								if (ja > ka)
									ki = i + 1;
								else break;
							}

							var foo = k.splice(0, ki); foo.push(jk);
							for (var i = foo.length - 1; i >= 0; i--) {
								k.unshift(foo[i]);
							}

							jQuery.uniq(k, function(a, b) {
								var split = { a: jQuery.copy(a.split(/:/)), b: jQuery.copy(b.split(/:/)) };
								return split.a[0] >= split.b[0] && split.a[1] >= split.b[1] ? 1 : -1;
							});

							var rayah = r.ayah.filter('#ayah-'+ jk.split(/:/).join('-'));
							var rayah_num = parseInt(rayah.attr('data-key').split(/:/)[1]);
							var index;

							jQuery.each(q.jQ.ayah, function(i, ayah) {
								ayah = jQuery(ayah);
								var ayah_num = parseInt(ayah.attr('data-key').split(/:/)[1]);
								if (rayah_num > ayah_num) {
									index = i;
								} else return false;
							});

							if (index === undefined)
								q.jQ.ayah.eq(0).before(rayah);
							else q.jQ.ayah.eq(index).after(rayah);

							q.jQ.ayah = q.jQ.ayah.add(rayah);
						});

						r.ayah.addClass('ui-hide-position').removeClass('ui-hide');

						q.run('load:pre', r.ayah, from);

						run(r.ayah);

						delete d.request;
					}
				});

				d.request.key = load.key;
				d.request.range = load.range;
			}, 600);
		}
	}
};
