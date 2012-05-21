(function( Quran, jQuery ) {
	Quran.ui.content.ayahTools.lastmark = function(quran) {
		var self = this;

		quran.on('load', function(load) {
			self.setup(load.content);
		}, 3, 'ayahTools.lastmark');
	};
	Quran.ui.content.ayahTools.lastmark.prototype = {
		setup: function(elem) {
			var self = this;

			elem.one('mousemove', function() {
				self.init(this);
			});
		},
		init: function(elem) {
			var self = this,
				elem = jQuery(elem),
				key = elem.attr('data-key');

			elem.find('.ayahTools li.lastmark').click(function() {
				self.submit(elem, key);
			});
		},
		submit: function(elem, key) {
			var self = this,
				me = elem.find('.ayahTools li.lastmark'),
				siblings = elem.siblings('div.ayah').find('.ayahTools li.lastmark'),
				url = '/me/lastmark', params = {
							key : key,
					context : {
						range : window.location.pathname.replace(/^\/[^\/]+\/[\d]+\/([-\d]+)/,'/$1').replace(/\/$/,''), // quick hack
						state : quran.state('context')
					}
				};

			params.context.range = /^\/[-\d]+$/.test(params.context.range) ? params.context.range : '/'+ key.split(/:/)[1]; // quick hack

			jQuery.ajax({ url: url, type: 'POST', contentType: 'application/json', data: JSON.stringify(params), success: function(result) {
				if (result.action) {
					me.removeClass('selected');

					siblings.removeClass('selected');

					if (result.action == 'created' || result.action == 'updated')
						me.addClass('selected');

					quran.ui.body.notificationSystem.message({ title: quran.localize('Lastmark '+ result.action), content: result.action +' lastmark at '+ key });

					jQuery.extend(params, result);

					quran.run('ayahTools:lastmark:'+ result.action, params);
				}
			}});
		}
	};
})( Quran, jQuery );
