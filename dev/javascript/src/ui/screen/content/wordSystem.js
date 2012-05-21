(function( Quran, jQuery ) {
	Quran.ui.content.wordSystem = function(quran) {
		var self = this;

		jQuery.extend(self, {
			   quran : quran,
			  corpus : quran.data('corpus'),
			language : quran.data('language')
		});

		quran.window.load(function() {
			self.setup();
		});
	};
	Quran.ui.content.wordSystem.prototype = {
		elem: {
			words : jQuery('#content section.quran div.content p.words'),
		}, initialized: {},
		template: {
			tooltip: '\
				<div class="system hover tooltip" dir="<%= direction %>">\
					<div class="wrap">\
						<div class="tip"></div>\
						<div class="outside">\
							<div class="inside"><%= translation %></div>\
						</div>\
					</div>\
				</div>',
			metabox: '\
				<div class="system metabox tooltip" dir="ltr">\
					<div class="wrap">\
						<div class="tip"></div>\
						<div class="outside">\
							<div class="title"><label><%= quran.localize("Close") %></label><a class="close" title="Close">X</a></div>\
							<div class="inside left">\
								<h1><%= corpus.arabic %></h1>\
								<h2><%= corpus.lemma %></h2>\
								<h3><%= corpus.root %></h3>\
								<h2><%= language.unicode %></h2>\
								<p><%= corpus.translation[language.language_code] %></p>\
								<a href="http://corpus.quran.com/wordmorphology.jsp?location=(<%= key %>:<%= corpus.position %>)" target="top"><%= quran.localize("Word Grammar & Morphology") %></a>\
							</div>\
						</div>\
					</div>\
				</div>',
		},
		setup: function() {
			console.time('wordSystem setup');
			var self = this;
			if (self.language.language_code != 'ar') {
				var words = self.elem.words.length ? self.elem.words : jQuery(self.elem.words.selector);
				words.one('mousemove', function() {
					var me = jQuery(this);
					self.init(me);
				});
			}
			console.timeEnd('wordSystem setup');
		},
		init: function(me) {
			console.time('wordSystem init');
			var self = this;

			var key = me.attr('data-key');
			if (!self.initialized[key]) {
				var glyphs = me.find('> b');
				var z_index = glyphs.length;

				glyphs.each(function() {
					var me = jQuery(this);
					me.css({ 'z-index': z_index-- });

					if (me.hasClass('word')) {
						var system = {
							tooltip: null,
							metabox: null
						};

						system.tooltip = jQuery(self.quran.template(self.template.tooltip, {
							direction  : me.attr('dir'),
							translation: me.attr('title')
						}));

						me.attr('title', null);
						me.append(system.tooltip);
						/*
						 * metabox
						 * disable for now
						 *//*
						var hide = function(metabox) {
							metabox.removeClass('show');
							clearTimeout(metabox.data('timeout'));
							metabox.siblings('.tooltip').removeClass('hidden');
						};

						var show = function(metabox) {
							metabox.addClass('show');
							metabox.data('timeout', setTimeout(function() {
								hide(metabox);
							}, 3000));
							metabox.siblings('.tooltip').addClass('hidden');
						};

						me._mousedown(function() {
							if (!self.elem[key]) self.elem[key] = {};
							if (!(system.metabox = me.data('system.metabox'))) {
								system.metabox = jQuery(self.quran.template(self.template.metabox, {
										corpus : self.corpus[me.attr('data-id')],
									language : self.language,
									     key : key
								}));

								system.metabox._mouseenter(function(ev) {
									clearTimeout(system.metabox.data('timeout'));
								})._mouseleave(function(ev) {
									system.metabox.data('timeout', setTimeout(function() {
										hide(system.metabox);
									}, 3000));
								});

								system.metabox.find('> .outside > .title > a.close')._click(function(ev) {
									hide(system.metabox);
								});

								me.append(system.metabox).data('system.metabox', system.metabox);

								if (!self.elem[key].metabox)  self.elem[key].metabox = system.metabox;
								else self.elem[key].metabox = self.elem[key].metabox.add(system.metabox);
							}

							if (!system.metabox.hasClass('show')) {
								self.elem[key].metabox.each(function() {
									hide(jQuery(this));
								});
								show(system.metabox);
							} else hide(system.metabox);
						});
						*/
					}
				});

				self.initialized[key] = true;
			}
			console.timeEnd('wordSystem init');
		}
	};
})( Quran, jQuery );
