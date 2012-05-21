(function( Quran, jQuery ) {
	jQuery.fn.tip = function(options) {
		var self = {
			element: this,
			options: jQuery.extend({ // default
				place: 'n',
				content: null,
				events: {}
			}, options, { // override
			}),
			_buildJIT: function(me) {
				console.time('tip JIT');
				var self = this,
					params = {}, tip, content;

				/*
				if (!self.options.event && !self.options.placement) {
					var match = jQuery.map(me.attr('class').split(/ /), function(className) {
						return className.match(/^tip-([a-z]+)-([a-z]+)$/);
					});

					params.event = match[1];
					params.placement= match[2];

					me.removeClass(match[0]);
				}
				else {
					params.event = self.options.event;
					params.placement = self.options.placement;
				}
				*/

				content = self.options.content || me.attr('title') || me.data('title');

				me.data('title', me.attr('title'));
				me.removeAttr('title');

				tip = jQuery.tmpl('quran.tip', self.options).appendTo(me);

				if (typeof content == 'string')
					tip.find('.content').html(content);
				else if (typeof content == 'object' && content.jquery)
					tip.find('.content').append(content.clone(true, true));

				/*
				if (params.event != 'hover')
					me.bind(params.event, function() {
						tip.toggle();
					});
				*/

				jQuery.each(self.options.events, function(ev, fn) {
					me.bind(ev, function(event, data) {
						data = jQuery.extend(data, {
							tip: tip
						});
						fn.call(this, event, data);
					});
					tip.bind(ev, function(event, data) {
						event.stopPropagation();
					});
				});

				console.timeEnd('tip JIT');
			}
		};

		return this.each(function() {
			var me = jQuery(this),
				JIT = me.parent().parent(),
				JIT = JIT.length ? JIT : me.parent(),
				JIT = JIT.length ? JIT : me;

				JIT.one('mousemove', function() {
					self._buildJIT.call(self, me);
				});
		});
	};

	jQuery.template('quran.tip', '\
		<div class="tip ${place}">\
			<div class="outer">\
				<div class="inner">\
					<b class="tri"></b>\
					<div class="content"></div>\
				</div>\
			</div>\
		</div>\
	');
})( Quran, jQuery );
