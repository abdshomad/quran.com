// TODO
// - Make bookmarks menu sortable/filterable table, like New User Forms
(function( Quran, jQuery ) {
	jQuery.template('quran.bookmark', '\
		<div class="bookmark">\
			<input type="text" name="tags"/>\
			<button class="remove" style="display: none;">Remove Bookmark</button>\
			<input class="remove" type="hidden" value="0"/>\
			<label>Title: <input type="text" class="title"/></label>\
			<label>Ayah Context: <input type="text" class="context range start"/> <input type="text" class="context range end"/></label>\
		</div>\
	');

	Quran.ui.content.ayahTools.bookmark = function(quran) {
		var self = this;

		quran.on('load', function(load) {
			self.setup(load.content);
		}, 3, 'ayahTools.bookmark');
	};
	Quran.ui.content.ayahTools.bookmark.prototype = {
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

			elem.find('.ayahTools li.bookmark').box({
				toggle: function(event) {
					if (this.element.hasClass('selected'))
						return 'edit';
					else return 'create';
				},
				events: {
					open: function(event, data) {
						this._.input.remove.val(0);
						if (this.section == 'edit')
							this._.button.remove.show();
						else this._.button.remove.hide();
					},
					create: function(event, data) {
						self._setupTags(this.element);
						var that = this,
							me = this.element,
							data = me.closest('header').data(),
							button = {
								remove: me.find('button.remove')
							},
							input = {
								remove: me.find('input.remove'),
								tags: me.find('.tags input')
							},
							div = {
								tags: me.find('.tags')
							};

						this._ = { // scope should be self, not this
							element: me,
							params: data,
							input: input,
							div: div,
							button: button
						};

						if (this.element.hasClass('selected')) {
							this.section = 'edit';
							this._.button.remove.show();
						}

						this._.button.remove.click(function() {
							that._.input.remove.val(1);
							self.post2(that._);
						});
					}
				},
				mode: 'tip',
				addClass: 'bookmark se',
				css: {
					width: 400,
					minWidth: 400
				},
				resizable: false,
				draggable: false,
				position: false,
				section: {
					primary: 'create',
					create: {
						head: 'Create Bookmark',
						body: jQuery.tmpl('quran.bookmark'),
						foot: {
							control: {
								Cancel: function(event) {
									this.close();
								},
								'Create Bookmark': function(event) {
									self.post2(this._);
								}
							}
						},
					},
					edit: {
						head: 'Edit Bookmark',
						foot: {
							control: {
								Cancel: function(event) {
									this.close();
								},
								'Edit Bookmark': function(event) {
									self.post2(this._);
								}
							}
						}
					}
				}
			});
		},
		post2: function(data) {
			var self = this,
				params = jQuery.extend({
				}, data.params);

			if (parseInt(data.input.remove.val()))
				params.action = 'delete';

			params.tags = data.input.tags.val();

			self.post(data.element, params);
			
		},
		post: function(me, data) {
			var self = this,
				url = '/account/bookmark',
				params = jQuery.extend(data, {
					context : {
						range : window.location.pathname.replace(/^\/[^\/]+\/[\d]+\/([-\d]+)/,'/$1').replace(/\/$/,''), // quick hack
						state : quran.state('context')
					}
				});

			params.context.range = /^\/[-\d]+$/.test(params.context.range) ? params.context.range : '/'+ data.key.split(/:/)[1]; // quick hack

			jQuery.ajax({ url: url, type: 'POST', contentType: 'application/json', data: JSON.stringify(params), success: function(result) {
				if (result.action) {
					if (result.action == 'deleted')
						me.removeClass('selected');
					else if (result.action == 'created' || result.action == 'updated')
						me.addClass('selected');

					quran.ui.body.notificationSystem.message({ title: quran.localize('Bookmark '+ result.action), content: 'Added bookmark for ayah '+ data.key });

					jQuery.extend(params, result);

					quran.run('ayahTools:bookmark:'+ result.action, params);
				}

				me.box('close');
			}});
		},
		_setupTags: function(elem) {
			var self = this,
				input = elem.find('input[name=tags]'),
				ayah = elem.closest('header').data(),
				account = quran.data('account'),
				value = account && account.tags && account.tags[ayah.key] ? account.tags[ayah.key].join(', ') : '';

				input.val(value);

				input.autocomplete({
					mode: 'tags',
					addClass: 'bookmark',
					source: function(request, response) {
						jQuery.ajax({ url: '/account/tag', type: 'POST', contentType: 'application/json', data: JSON.stringify(request), success: function(result) {
							response(result);
						}});
					},
				});
		}
	};
})( Quran, jQuery );
