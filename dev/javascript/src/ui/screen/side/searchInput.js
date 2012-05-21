(function( Quran, jQuery ) {
	Quran.ui.side.searchInput = function(quran) {
		var self = this;

		quran.window.load(function() {
			self.setup();
		});
	};
	Quran.ui.side.searchInput.prototype = {
		elem: {
			query : {
				input : jQuery('#side nav header.search input.query'),
			},
			type  : {
				input : jQuery('#side nav header.search input.type'),
				 menu : jQuery('#side nav header.search div.type')
			},
			find : {
				button : jQuery('#side nav header.search button.find')
			}
		},
		setup: function() {
			//console.time('searchInput setup');
			var self = this;

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

			//console.timeEnd('searchInput setup');
		}
	};
})( Quran, jQuery );
