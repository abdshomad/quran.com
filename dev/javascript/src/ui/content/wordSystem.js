Quran.ui.wordSystem = function(quran) {
	var self = this;

	self.elem ='#ayat > .ayah'; // '#content div.ayah';

	self.data = { init: {} };

	self.template = '\
		<div class="hover" dir="ltr">\
			<div class="wrap">\
				<div class="tip"></div>\
				<div class="outside">\
					<div class="inside"><%= content %></div>\
				</div>\
			</div>\
		</div>\
	';

	quran.on('load', function(elem, from, timestamp) {
		q._._.debug('load', arguments);
		self.setup(elem);
	}, 3, 'wordSystem');

	quran.on('selectContent', function() {
		self.setup(jQuery(self.elem));
	}, 2, 'wordSystem');


};

Quran.ui.wordSystem.prototype = {
	setup: function(elem) {
		var self = this;

		if (!quran.session('content.quran.words'))
			return;

		elem.one('mousemove', function() {
			self.init(this);
		});
	},
	init: function(elem) {
		var self = this,
			elem = jQuery(elem),
			key = elem.attr('data-key');

		q._._.debug('init');

		if (self.data.init[key])
			return;
		else self.data.init[key] = true;

		var b = elem.find( '.quran-panel > .glyph' ), z = b.length;
		q._._.debug('b is ', b);

		b.each(function() {
			var me = jQuery(this),
				wordSystem = {};

			me.css({ 'z-index': z-- });

			if (me.hasClass('word')) {
				wordSystem.hover = jQuery(
					new jQuery.EJS({ text: self.template }).render({
						content: me.attr('data-translation')
					}).replace(/>\s+</g,'><').replace(/^\s+/, '').replace(/\s+$/, '')
				);

				me.attr('title', null);
				me.append(wordSystem.hover);
			}
		});
	}
};
