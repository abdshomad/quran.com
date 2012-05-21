// TODO
// - Spinners to apply tags to surrounding context ayahs, i.e. "also apply to 'n' through 'n'"
// * Submit on enter and close box
// * Focus input on open
(function( Quran, jQuery ) {
	jQuery.template('quran.tags', '\
		<div class="tags">\
			<input type="text" name="tags"/>\
		</div>\
	');

	Quran.ui.content.ayahTools.tags = function(quran) {
		var self = this;

		quran.on('load', function(load) {
			self.setup(load.content);
		}, 3, 'ayahTools.tags');
	};
	Quran.ui.content.ayahTools.tags.prototype = {
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

			elem.find('.ayahTools li.tags').box({
				toggle: 'click',
				events: {
					open: function(event, data) {
						this.element.find('input[name=tags]').focus();
					},
					create: function(event, data) {
						self.autoComplete(this.element);
					}
				},
				mode: 'tip',
				addClass: 'tags se',
				css: {
					width: 400,
					minWidth: 400
				},
				resizable: false,
				draggable: false,
				position: false,
				head: 'Edit Tags',
				body: jQuery.tmpl('quran.tags'),
				foot: {
					control: {
						Cancel: function(event) {
							this.close();
						},
						Update: function(event) {
							self.submit(this.element);
						}
					}
				},
			});
		},
		autoComplete: function(elem) {
			var self = this,
				input = elem.find('input[name=tags]'),
				ayah = elem.closest('header').data(),
				account = quran.data('account'),
				value = account && account.tags && account.tags[ayah.key] ? account.tags[ayah.key].join(', ') : '';

				input.val(value);

				input.autocomplete({
					mode: 'tags',
					addClass: 'tags',
					source: function(request, response) {
						jQuery.ajax({ url: '/account/tag', type: 'POST', contentType: 'application/json', data: JSON.stringify(request), success: function(result) {
							response(result);
						}});
					},
					keypress: function(event, data) {
						if (data.key == 'ENTER') {
							this.element.blur();
							self.submit(elem);
							return false;
						}
						if (data.key == 'TAB') {
							if (!this._suggest()) {
								event.preventDefault();
								elem.find('menu button:first-child').focus();
							}
						}
					},
					focus: function(event, data) {
						console.debug('focus', arguments, self._last);
						if (self._last && data.val == '')
							data.suggest = self._last;
					}
				});
		},
		submit: function(elem) {
			var self = this,
				url = '/account/tag',
				data = elem.closest('header').data(),
				term = elem.find('input[name=tags]').data('autocomplete')._term(),
				params = jQuery.extend(data, {
					tags: term
				});

			self._last = term;

			jQuery.ajax({ url: url, type: 'PUT', contentType: 'application/json', data: JSON.stringify(params), success: function(result) {
				if (result.action) {
					if (result.action == 'deleted')
						elem.removeClass('selected');
					else if (result.action == 'created' || result.action == 'updated')
						elem.addClass('selected');

					quran.ui.body.notificationSystem.message({ title: quran.localize('Tags '+ result.action), content: 'Added tags for ayah '+ params.key });

					jQuery.extend(params, result);

					quran.run('ayahTools:tags:'+ result.action, params);
				}

				elem.box('close');
			}});
		},
	};
})( Quran, jQuery );
