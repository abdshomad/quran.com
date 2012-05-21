(function( Quran, jQuery ) {
	Quran.ui.content.markAyah = function(quran) {
		var self = this;

		jQuery.extend(self, { quran : quran });

		self.elem.mark._mousedown(function(ev) {
			var me = jQuery(this);
			var type = me.hasClass('bookmark') ? 'bookmark' : me.hasClass('lastmark') ? 'lastmark' : false;
			if (type) {
				var url = '/u/'+ type, params = {
					    key : me.data('key'),
					context : {
						range : window.location.pathname.replace(/^\/[^\/]+\/[\d]+\/([-\d]+)/,'/$1').replace(/\/$/,''), // quick hack
						state : quran.state('context')
					}
				};

				params.context.range = /^\/[-\d]+$/.test(params.context.range) ? params.context.range : '/'+ data.key.split(/:/)[1]; // quick hack

				jQuery.ajax({ url: url, type: 'POST', contentType: 'application/json', data: JSON.stringify(params), success: function(result) {
					if (result.action) {
						if (result.action == 'deleted')
							me.removeClass('selected');
						else
						if (result.action == 'created')
							me.addClass('selected');
						else
						if (result.action == 'updated') {
							if (type == 'lastmark') {
								self.elem.mark.filter('.lastmark.selected').removeClass('selected');
								me.addClass('selected');
							}
						}
						//quran.ui.message.notify('foo '+ type +' '+ result.action +' '+ params.key +' '+ params.context.range +' '+ params.context.state);
						jQuery.extend(params, result);
						quran.trigger('markAyah:'+ type, params);
					}
				}});
			}
		});
	};
	Quran.ui.content.markAyah.prototype = {
		elem: {
			mark : jQuery('#content > div.container > div.top > table.partition > tbody > tr > td.ayahTools.menu > div.wrap > div.body > menu > li.mark')
		}
	};
})( Quran, jQuery );
