(function( Quran, jQuery ) {
	jQuery.fn.tip = function(options) {
		var self = {
			options: jQuery.extend({
			}, options, {
			}),
			_buildJIT: function(me) {
				console.time('tip JIT');

				var match = jQuery.map(me.attr('class').split(/ /), function(className) {
						return className.match(/^tip-([a-z]+)-([a-z]+)$/);
					}),
					content = self.options.content || me.attr('title'),
					params = { event: match[1], location: match[2], content: content };

				self.tip = jQuery.tmpl('quran.tip', params).appendTo(me);

				me.removeClass(match[0]).removeAttr('title');

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
		<div class="tip ${location} ${event}">\
			<div class="outer">\
				<div class="inner">\
					<b class="tri"></b>\
					<span class="box">{{html content}}</span>\
				</div>\
			</div>\
		</div>\
	');


	Quran.ui.widget.tip = function(quran) {
		var self = this;

		quran.window.load(function() {
			console.time('tip init');
			self.init();
			console.timeEnd('tip init');
		});
	};
	Quran.ui.widget.tip.prototype = {
		init: function() {
			jQuery('[class|=tip-hover]').tip({
			});
		}
	};
})( Quran, jQuery );
