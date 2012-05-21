Quran.ui.scrollAnchor = function(q) {
	var self = this;

	q.d(self, 'log.setting', {
		enabled: false,
		verbose: true,
		dir: true,
		clear: 2,
		count: 0,
	});

	self.log = q.d(self, 'log.setting.verbose') ? q._._ : q._;

	self.d = {
		k: q.d('keys'),
		a: q.d('surah.ayahs'),
		s: q.d('surah.surah_id'),
		n: q.d('namespace')
	};

	self.window = jQuery.window();
	self.viewport = jQuery.support.boxModel ? jQuery.viewport() : self.window;

	q.d(self, 'ayah.min', 1);
	q.d(self, 'ayah.max', q.d('surah.ayahs'));
	q.d(self, 'change.id', 'scrollAnchor');
	q.d(self, 'ayat', {});

	self.d.l = self.d.s + self.d.a;

	// this might be silly, this might be useful
	q.on('anchor:pre', function(change, from) {
		var range = self.contingent(change.key);
		jQuery.each(self.d.k, function(i, key) {
			var split = jQuery.copy(key.split(/:/));
			var id = '#ayah-'+ split.join('-');
			if (split[1] < range[0] || split[1] > range[1])
				q.jQ.ayah.filter(id).addClass('ui-hide');
			else q.jQ.ayah.filter(id).removeClass('ui-hide');
		});
		self.maybe();
	}, 0, 'scrollAnchor'); // end sillyness

	q.on('anchor', function(change, from) {
		var ayah, offset;
		if (change.index == 0)
			offset = 0;
		else {
			ayah = q.ayah(change, true);
			if (ayah && ayah.is(':visible'))
				offset = ayah[0].offsetTop - ( change.offset ? change.offset : 0 );
		}
		if (offset !== undefined)
			self.viewport.scrollTop(offset);
	}, 0, 'scrollAnchor');

	q.on('anchor:post', function(change, from) {
		q.d(self, 'change.id', null);
	}, 0, 'scrollAnchor');

	q.on('change:pre', function(change, from) {
		clearTimeout(change.timeout);

		jQuery.extend(q.d(self, 'change'), change);

		q.d(self, 'ayah.current', change.ayah);
		q.d(self, 'ayah.range', self.contingent(change.key));
	}, 0, 'scrollAnchor');

	q.on('change', function(change, from) {
		q.jQ.ayah.removeClass('active').filter('[data-key="'+ change.key +'"]').addClass('active');
	}, 2, 'scrollAnchor');

	q.on('change:post', function(change, from) {
		self.maybe();
	}, 0, 'scrollAnchor');

	q.on('load:pre', function() {
		self.maybe({ ready: false });
	}, 1, 'scrollAnchor');

	q.on('load', function() {
		self.maybe();
	}, 4, 'scrollAnchor');

	q.on('ready', function(ready) {
		self.maybe({ ready: true, force: true });
		if (!ready.timeout)
			self.scroll(jQuery.Event('ready'));
	}, 4, 'scrollAnchor');


	q.one('load', function() {
		q.d(self, 'update.timeout', setTimeout(function() {
			q.d(self, 'update.interval', setInterval(function() {
				self.update();
				self.setup();
			}, 2000));
		}, 5000));
	}, 5, 'scrollAnchor');

	self.window.resize(function() {
		self.maybe();
	});

	self.window.scroll(jQuery.proxy(self, 'scroll'));
};
Quran.ui.scrollAnchor.prototype = {

	update: function(set) {
		var self = this, set = set === undefined ? true : set, scroll = q.d(self, 'scroll') || q.d(self, 'scroll', {});

		if (self.viewport === self.window && jQuery.support.boxModel)
			self.viewport = jQuery.viewport();

		if (set) {
			delete scroll.last;

			if (scroll.set) {
				var copy = jQuery.copy(scroll);
				scroll.last = copy;
			}

			scroll.size   = self.viewport.scrollSize();
			scroll.range  = self.viewport.scrollRange();
			scroll.top    = self.viewport.scrollTop();
			scroll.height = self.viewport.scrollHeight();
			scroll.bottom = self.viewport.scrollBottom();
			scroll.max    = self.viewport.scrollMax();
			scroll.end    = scroll.top == 0 ? 'top' : scroll.bottom == 0 ? 'bottom' : 0;
			scroll.edge   = scroll.top <= 1 ? 'top' : scroll.bottom <= 1 ? 'bottom' : 0;
			scroll.up     = 0;
			scroll.down   = 0;

			if (scroll.last) {
				scroll.up   = scroll.last && scroll.last.top - scroll.top > 0 ? 1 : 0;
				scroll.down = scroll.last && scroll.last.top - scroll.top < 0 ? 1 : 0;
			}

			scroll.set    = 1;

			if (scroll.override) {
				var override = scroll.override;
				delete scroll.override;
				jQuery.extend(scroll, override);
			}
		}

		return scroll;
	}, // update:

	scroll: function(ev) {
		var self = this;

		var scroll = self.update();
		var current = self.current(scroll);
		var change = q.d(self, 'change');
		var ayah = q.d(self, 'ayah');
		var log = q.d(self, 'log.setting');
		var namespace = q.d('namespace');

		if ((scroll.down || scroll.up) && current && change.key && change.id == 'scrollAnchor') {
			ayah.original = ayah.current;
			ayah.outside = ayah.current < ayah.range[0] || ayah.current > ayah.range[1];

			if (scroll.edge || ayah.outside) {
				if (scroll.down)
					ayah.current++;
				if (scroll.up)
					ayah.current--;
				if ( scroll.edge === 'bottom' && scroll.down && ayah.current < current.ayah ||
						 scroll.edge === 'top'    && scroll.up   && ayah.current > current.ayah )
					ayah.current = current.ayah;
			}

			ayah.current = Math.max(Math.min(ayah.current, ayah.max), ayah.min);
			ayah.outside = ayah.current < ayah.range[0] || ayah.current > ayah.range[1];
			ayah.perimeter = ayah.current <= ayah.range[0] || ayah.current >= ayah.range[1];

			if (ayah.perimeter && ayah.current != ayah.original || change.ready && ayah.current != current.ayah) {
				if (!ayah.outside)
					ayah.current = current.ayah;

				jQuery.extend(current, {
					ayah: ayah.current,
					key: current.surah +':'+ ayah.current,
					context: q.state('context')
				});

				//q.hash({ key: current.key });

				q.run('scroll', {
					key: current.key
				}, 'scrollAnchor');

				clearTimeout(change.timeout);

				if (ayah.outside) {
					q.d(self, 'removed.class', false);
					if (!q.d(self, 'added.class')) {
						q.jQ.ayah.addClass('ui-hide-opacity');
						q.d(self, 'added.class', true);
					}

					q.change(jQuery.extend(current, { force: true, anchor: true }), 'scrollAnchor');
				}
				else {
					q.d(self, 'added.class', false);
					if (!q.d(self, 'removed.class')) {
						q.jQ.ayah.removeClass('ui-hide-opacity');
						q.d(self, 'removed.class', true);
					}

					change.timeout = setTimeout(function() {
						if (log.enabled)
							self.log.debug('timeout');
						q.change(current, 'scrollAnchor');
					}, 1000);
				}
			}
		} // end main block

		if (change.id != 'scrollAnchor')
			change.id = 'scrollAnchor';

		if (scroll.end || ayah.outside) {
			var params = { method: scroll.edge === 'top' ? 'scrollTop' : 'scrollBottom', offset: 1, override: {} };
			if (
					( scroll.last && scroll.last.edge === 'top'    && scroll.top > 1 )    ||
					( scroll.last && scroll.last.edge === 'bottom' && scroll.bottom > 1 ) ||
					( scroll.end )
			) jQuery.extend(params.override, { up: 0, down: 0 });

			self.scrollTo(params);
		}
	}, // scroll:

	scrollTo: function(params) {
		var self = this;

		var scroll = self.update(false);

		if (params.override)
			scroll.override = params.override;

		self.viewport[params.method]( params.offset );
	}, // scrollTo:

	maybe: function(params) {
		var self = this, params = jQuery.extend({}, params);

		var ayah = q.d(self, 'ayah');
		var ayat = q.d(self, 'ayat');
		var change = q.d(self, 'change');

		if (change.key)
			ayah.range = self.contingent(change.key);

		params.ready = params.ready !== undefined ? params.ready : change.ready;
		change.ready = false;

		var scroll = self.update();

		if (!scroll.last || scroll.height != scroll.last.height || ayah.range && ayat.range && (ayah.range[0] != ayat.range[0].ayah || ayah.range[1] != ayat.range[ayat.range.length - 1].ayah) || params.force)
			self.setup();

		change.ready = params.ready;

		return scroll;
	}, // maybe:

	setup: function(params) {
		var self = this;

		var ayah = q.d(self, 'ayah');
		var ayat = q.d(self, 'ayat');

		ayat.range = [];

		q.jQ.ayah.each(function() {
			var elem = jQuery(this), data = {
				ayah : elem.attr('data-ayah')
			};

			if (ayah.range) {
				if (data.ayah < ayah.range[0])
					return;
				if (data.ayah > ayah.range[1])
					return false;
			}

			ayat.range.push(jQuery.extend(data, {
					elem : elem,
					 key : elem.attr('data-key'),
				 surah : elem.attr('data-surah'),
				 range : elem.scrollRange(),
					size : elem.scrollSize()
			}));
		});
	}, // setup:

	contingent: function(key) {
		var self = this;

		var range = [];

		for (var i = 0; i <= 1; i++) {
			var index = jQuery.inArray(key, self.d.k);
			var j = 1;
			var start = parseInt(key.split(/:/)[1]);
			var extrema = start;
			while (self.d.k[i == 0 ? --index : ++index]) {
				var ayah = start + (i == 0 ? -1 * j : j);
				var next = parseInt(self.d.k[index].split(/:/)[1]);

				j++;

				if (ayah == next)
					extrema = next;
				else break;
			}
			range.push(extrema);
		}

		return range;
	}, // contingent:

	current: function(scroll) {
		var self = this, scroll = scroll ? scroll : self.update();

		var ayah = q.d(self, 'ayah');
		var ayat = q.d(self, 'ayat');
		var current = { edge: {} };
		var log = q.d(self, 'log.setting');

		if (!ayah.range || !ayat.range)
			return;

		jQuery.each(ayat.range, function(i, data) {
			var copy = jQuery.extend({}, data);
			delete copy.elem;
			copy = jQuery.copy(copy);
			copy.elem = data.elem;
			data = copy;

			if (data.range[0] - scroll.range[0] <= 0 && data.range[1] - scroll.range[1] >= 0) {
				data.loc = 'all';
				data.clip = scroll.size;
			} else
			if (data.range[0] >= scroll.range[0] && data.range[0] <= scroll.range[1] || data.range[1] <= scroll.range[1] && data.range[1] >= scroll.range[0]) {
				if (data.range[0] - scroll.range[0] <= 0) {
					data.loc = 'top';
					data.clip = data.size + data.range[0] - scroll.range[0];
				} else
				if (data.range[1] - scroll.range[1] >= 0) {
					data.loc = 'bottom';
					data.clip = data.size - (data.range[1] - scroll.range[1]);
				} else
				if (data.range[0] >= scroll.range[0] && data.range[1] <= scroll.range[1]) {
					data.loc = 'middle';
					data.clip = data.size;
					data.mid = ( data.range[0] + data.size * 0.382 ) - ( scroll.range[0] + scroll.size * 0.382 );
				}
			}
			if (data.loc) {
				data.vis = {
					elem: data.clip / data.size,
					view: data.clip / scroll.size
				};

				data.edge = data.ayah == ayah.range[0] ? 'top' : data.ayah == ayah.range[1] ? 'bottom' : 0;

				if (data.edge && data.vis.elem >= 0.5)
					current.edge[data.edge] = 1;

				if (data.loc == 'middle') {
					if (!current[data.loc])
						current[data.loc] = [];
					current[data.loc].push(data);
				} else current[data.loc] = data;
			}
		});

		if (log.enabled && log.clear) {
			if (--log.count <= 0) {
				self.log.clear();
				log.count = log.clear;
			}

			if (log.dir) {
				self.log.debug('#'+ log.count);
				self.log.dir({ scroll: jQuery.copy(scroll), ayah: jQuery.copy(ayah), ayat: ayat });
			}
		}

		if (current.all)
			current.best = current.all;
		else {
			var compare, iterate;
			iterate = function(i, loc) {
				if (current.best)
					return false;

				var data = current[loc];

				if (!data)
					return;

				if (loc === 'middle')
					jQuery.each(data, compare);
				else compare(i, data);
			};
			compare = function(i, data) {
				if (current.best)
					return false;
				if (data.edge && (data.vis.elem == 1 || data.vis.elem >= 0.85 && data.vis.view >= 0.62))
					current.best = data;
			};
			jQuery.each(['top', 'middle', 'bottom'], iterate);

			compare = function(i, data) {
				if (current.best)
					return false;
				if (data.vis.elem >= 0.85 && data.vis.view >= 0.38 && (data.loc === 'top' || data.vis.view >= 0.76 && data.loc !== 'bottom'))
					current.best = data;
			};

			jQuery.each(['top', 'middle', 'bottom'], iterate);

			if (!current.best) {
				if (current.middle) {
					var above = [], below = [], closest, compare = function(i, data) {
						var distance = Math.abs(data.mid);
						if (closest === undefined || distance < closest) {
							closest = distance;
							current.best = data;
						}
					};

					jQuery.each(current.middle, function(i, data) {
						if (data.mid <= 0)
							above.push(data);
						else below.push(data);
					});

					var first = current.edge.bottom && current.bottom.vis.elem >= 0.76 ? below : above, second = first === above ? below : above;

					jQuery.each(first, compare);
					if (!current.best)
						jQuery.each(second, compare);
				} else
				if (current.top && current.bottom) {
					if (current.top.vis.view >= 0.5)
						current.best = current.top;
					else current.best = current.bottom;
				} else
				if (current.top)
					current.best = current.top;
				else
				if (current.bottom)
					current.best = current.bottom;
			}
		}

		q.d(self.current, 'current', current);

		if (log.enabled) {
			if (log.dir)
				self.log.dir(current);
			if (!current.best)
				self.log.error('No current best!');
		}

		return current.best;
	} // current:

};
