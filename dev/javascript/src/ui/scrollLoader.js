(function( Quran, jQuery ) {
	Quran.ui.scrollLoader = function(q) {
		var self = this;

		self.debug = false;

		self.d = {
			l: q.d('lookup'),
			k: q.d('keys'),
			n: q.d('namespace')
		};

		q.on('change', jQuery.proxy(self, 'change'), 3, 'scrollLoader');

		self.n = q.d('n.load', 0);

		q.on('load', function() {
			q.d('n.load', ++self.n);
		}, 0, 'scrollLoader');
	};
	Quran.ui.scrollLoader.prototype = {
		change: function(change, from) {
			var self = this;

			if (self.d.n != 'main') return; // TODO implement for search
			//if (from != 'load.window' && from != 'scrollAnchor') return;

			var x = {};

			x.ayah = change.ayah;
			x.page = self.d.l.ayah[x.ayah - 1];
			x.index = change.index;

			self.bar(jQuery.extend(x, { dir:  1 }), self.foo(x));
			self.bar(jQuery.extend(x, { dir: -1 }), self.foo(x));
		},
		foo: function(x) {
			var self = this;

			var z = jQuery.copy(x), k = self.d.k;

			if (self.debug) {
				console.debug('z before');
				console.dir(z);
			}

			if (z.index === undefined) {
				z.index = jQuery.inArray(q.d('surah.surah_id') +':'+ x.ayah, k)

				if (z.index == -1) {
					z.missing = 1;
					z.index = 0;
					jQuery.each(k, function(i, key) {
						var next = parseInt(key.split(/:/)[1]);
						if (z.ayah > next) {
							z.index = i + 1;
						} else return false;
					});

					k = jQuery.copy(k);
					var left = k.splice(0, z.index); left.push(q.d('surah.surah_id') +':'+ z.ayah); k = left.concat(k);
				}
			}

			if (!z.missing) {
				var i = 1;

				while (k[z.dir > 0 ? ++z.index : --z.index]) {
					var ayah = z.ayah + i * z.dir;
					var next = parseInt(k[z.index].split(/:/)[1]);

					i++;

					if (next == ayah)
						z.next = ayah;
					else break;
				}

				z.dir < 0 ? ++z.index : --z.index;

				if (z.next) {
					z.ayah = z.next;
					delete z.next;
				}
			}


			z.page = self.d.l.ayah[z.ayah - 1];
			z.range = [];

			if (self.d.l.ayah[z.ayah - 1 + z.dir]) {
				if (z.dir == 1) {
					z.range[0] = z.ayah + z.dir;
					z.range[1] = //z.page < self.d.l.surah[1] - 2 ? self.d.l.page[z.page + z.dir * 3][1] :
					             //z.page < self.d.l.surah[1] - 1 ? self.d.l.page[z.page + z.dir * 2][1] :
					             z.page < self.d.l.surah[1]     ? self.d.l.page[z.page + z.dir][1]     : self.d.l.page[z.page][1];
				} else
				if (z.dir == -1) {
					z.range[0] = //z.page > self.d.l.surah[0] + 2 ? self.d.l.page[z.page + z.dir * 3][0] :
					             //z.page > self.d.l.surah[0] + 1 ? self.d.l.page[z.page + z.dir * 2][0] :
					             z.page > self.d.l.surah[0]     ? self.d.l.page[z.page + z.dir][0]     : self.d.l.page[z.page][0];
					z.range[1] = z.ayah + z.dir;
				}

				if (k[z.index - 1])
					z.range[0] = Math.max(z.range[0], parseInt(k[z.index - 1].split(/:/)[1]) + 1);
				if (k[z.index + 1])
					z.range[1] = Math.min(z.range[1], parseInt(k[z.index + 1].split(/:/)[1]) - 1);
			}

			if (z.missing) {
				if (z.dir == -1) {
					if (z.range[0] === undefined)
						z.range[0] = z.ayah;
					z.range[1] = z.ayah;
				} else
				if (z.dir == 1)
					z.range[0] = z.ayah;
			}

			if (z.range[0] == z.range[1])
				z.range.shift();

			if (self.debug) {
				console.debug('z after');
				console.dir(z);
			}

			return z;
		},
		bar: function(x, y) {
			var self = this;

			var proximity = x.page == y.page; // anywhere on the last contingent page (i.e. contingency to the change.ayah)
			var existence = y.range.length; // more ayahs exist in the given direction

			if (self.debug) {
				console.debug('proximity', proximity, 'existence', existence, 'proximity && existence', proximity && existence, 'x', x, 'y', y);
			}

			if (proximity && existence) {
				q.load({ range: y.range }, 'scrollLoader');
			}
		}
	};
})( Quran, jQuery );
