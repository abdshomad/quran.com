(function( Quran, jQuery ) {
	Quran.ui.side.searchInput = function(quran) {
		var self = this;

		quran.one('init', function() {
			self.setup();
		}, 0, 'searchInput');
	};
	Quran.ui.side.searchInput.prototype = {
		setup: function() {
			var self = this,
				names = jQuery.map(quran.data('surahs'), function(surah) {
					return [surah.simple, surah.arabic];
				});

			self.element = jQuery('#side nav header.search');

			self.elem = {};

			jQuery.extend(self.elem, {
				query : {
					input : self.element.find('input.query')
				},
				type  : {
					input : self.element.find('input.type'),
					 menu : self.element.find('div.type')
				},
				find : {
					button : self.element.find('button.find')
				}
			});

			self.elem.query.input.autocomplete({ source: function(request, response) {
				var regex = new RegExp( jQuery.ui.autocomplete.escapeRegex( request.term ), 'i' ),
					results = jQuery.grep(names, function(name) {
						return regex.test(name) || regex.test(name.replace(/-/g, ' ').replace(/'/g, ''));
					}).sort(function(a, b) {
						return jQuery.levenshtein(request.term, a) - jQuery.levenshtein(request.term, b);
					});

				response( results );
				},
				appendTo: self.element
			});

			self.elem.query.input.keypress(function(event) {
				var me = jQuery(this),
					val = me.val().trim(),
					query = quran.data('query');

				if (((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13)) && (val == '' || val == query)) {
					event.preventDefault();
					me.val('').blur();
				}
			});

			self.elem.type.menu.dropdown({
				change: function(ev, data) {
					self.elem.type.input.val(data.value);
				}
			}).find('> * > li').hover(function() {
				var me = jQuery(this);
				me.addClass('hover').parent().siblings().find('> li').eq(me.index()).addClass('hover');
			}, function() {
				var me = jQuery(this);
				me.removeClass('hover').parent().siblings().find('> li').eq(me.index()).removeClass('hover');
			}).mousedown(function() {
				var me = jQuery(this);
				me.addClass('selected').siblings().removeClass('selected').parent().siblings().find('> li').eq(me.index()).addClass('selected').siblings().removeClass('selected');
				var value;
				if (me.parent().is('ul')) {
					value = me.attr('data-value');
				}
				else {
					value = me.parent().siblings().find('> li').eq(me.index()).attr('data-value');
				}
				self.elem.type.menu.trigger('change', { value : value });
			});

			self.elem.find.button.click(function() {
				var me = jQuery(this);
				var value = self.elem.query.input.val();
				if (value.length <= 2 || value == self.elem.query.input.attr('data-value-default'))
					self.elem.query.input.focus();
				else
					me.parents('form').submit();
			});
		}
	};
})( Quran, jQuery );
