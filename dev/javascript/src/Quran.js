var Quran = function Quran(data) { // constructor
	var self = this;

	self.window = jQuery(window);
	self.document = jQuery(document);
	self.body = jQuery(document.body);

	if (data) {
		self.data(data);

		if (self.data('session')) {
			self.data('session', self._copy(self.data('session')));
		}

		if (self.data('session.content')) {
			var cached = self._copy(self.data('session.content'));

			if (cached.quran.text) {
				var resource_code = cached.quran.text;
				cached.quran.text = {};
				cached.quran.text[resource_code] = 1;
			}

			self.data('content.cached', cached);
		}
	}

	self.window.bind('hashchange', function(event, data) {
		var hash = window.location.hash.replace(/^#/, '').split('/'),
			shift = hash.shift(),
			key = self.data('class') == 'main' ? self.page('surah') +':'+ parseInt(shift) : shift,
			key = /^\d+:\d+$/.test(key) ? key : self.state('key'),
			context = '/'+ jQuery.map(hash, function(a) { return a ? a : null; }).join('/'),
			params = { force: true },
			owner = data && data.trigger ? data.trigger : 'hash';

		if (owner != 'hash' || key != self.state('key') || context != self.state('context')) {

			if (owner != 'hash' || key != self.state('key'))
				jQuery.extend(params, { key: key, anchor: true });

			self.change(params, owner);
		}
	});

	self.state({
		key: jQuery('.ayah.container:nth(0)').attr('data-key')
	});

	self.window.load(function() {
		self.window.trigger('hashchange', { trigger: 'Quran' });
	});

	var modules = [];
	if (self.data('modules') == '*.*') {
		for (var section in Quran.ui) {
			for (var fn in Quran.ui[section]) {
				modules.push(section +'.'+ fn);
			}
		}
	} else
	if (self.data('modules')) {
		modules = self.data('modules');
	}
	jQuery.each(modules, function(i, module) {
		module = module.split(/\./);
		var section = module[0];
		if (module[1] == '*') {
			for (var fn in Quran.ui[section]) {
				console.time('Quran.ui.'+ section +'.'+ fn);
				self.ui[section][fn] = new Quran.ui[section][fn](self);
				console.timeEnd('Quran.ui.'+ section +'.'+ fn);
			}
		}
		else {
			var fn = module[1];
			console.time('Quran.ui.'+ section +'.'+ fn);
			self.ui[section][fn] = new Quran.ui[section][fn](self);
			console.timeEnd('Quran.ui.'+ section +'.'+ fn);
		}
	});
};

Quran.ui = { head: {}, body: {}, content: {}, side: {}, widget: {} };
