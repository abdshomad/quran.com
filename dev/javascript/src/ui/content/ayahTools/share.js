/*
FB.api('/me/quran_com:read', 'post', { surah: 'http://pre-alpha.quran.com/1' }, function(response) {
console.dir(response);
});
FB.api('/me/feed', 'post', { message: 'http://pre-alpha.quran.com/1' }, function(response) {
console.dir(response);
});
*/
(function( Quran, jQuery ) {
	Quran.ui.content.ayahTools.share = function(quran) {
		var self = this;

		self.data = quran.data('share', {
			auth: {
				ready: {},
				child: {}
			}
		});

		jQuery.each(self.auth, function(key, fn) {
			self.auth[key] = jQuery.proxy(fn, self);
		});

		quran.on('load', function(load) {
			self.setup(load.content);
		}, 3, 'ayahTools.share');
	};

	Quran.ui.content.ayahTools.share.prototype = {
		setup: function(content) {
			var self = this;

			content.one('mousemove', function() {
				self.init(this);
			});
		},
		init: function(node) {
			var self = this,
				node = jQuery(node),
				share = node.find('.account > .share');

			share.click(jQuery.proxy(self, 'click'));
		},
		click: function() {
			var self = this;

			quran.ajax('/me/share/auth', null, {
				success: function(result) {
					console.dir(result);
					jQuery.each(result, function(key, data) {
						if (data.enabled) {
							if (data.authorized) {
								self.auth.ready(key);
							}
							else {
								self.auth.queue(key);
							}
						}
					});
					jQuery.each(result, function(key, data) {
						if (data.enabled) {
							if (!data.authorized) {
								if (data.expired && data.refresh) {
									// needs refresh, 'client-side' or 'server-side'
									self.auth.renew(key, data.refresh);
								}
								else {
									// needs re-auth
									// should be opt-in, but open immediately for the time being
									self.auth.start(key);
								}
							}
						}
					});
					var foo = setInterval(function() {
						if (self.auth.done()) {
							clearInterval(foo);
							quran.notify('done');
							self.api.comment();
						}
						else {
							quran.notify('not done');
						}
					}, 1000);
				}
			});
		},
		api: {
			comment: function() {
				var self = this;

				console.debug('comment', self);

				quran.ajax('/me/share/comment', {
					ayah: '2:255',
					comment: 'foo bar baz',
					language: 'en',
					resource: 'translation:arberry'
				}, {
					success: function(result) {
						console.dir(result);
					}
				});
			}
		},
		auth: {
			done: function() {
				var self = this,
					done = true;

				jQuery.each(self.data.auth.ready, function(key, value) {
					return (done = value);
				});

				return done;
			},
			ready: function(key) {
				var self = this;

				console.debug('ready', self, key);

				self.data.auth.ready[key] = true;
			},
			queue: function(key) {
				var self = this;

				console.debug('queue', self, key);

				self.data.auth.ready[key] = false;
			},
			trash: function(key) {
				var self = this;

				console.debug('trash', self, key);

				delete self.data.auth.ready[key];
			},
			renew: function(key, where) {
				var self = this;

				console.debug('renew', self, key, where);

				if (where == 'browser') {
					self.auth.open(key, 'iframe');
				} else
				if (where == 'server') {
					quran.ajax('/me/share/auth/'+ key +'/refresh', null, {
						success: function(result) {
							console.dir(result);
							self.auth.ready(key);
						}
					});
				}
				else {
					self.auth.cancel(key);
				}
			},
			start: function(key) {
				var self = this;

				console.debug('start', self, key);

				self.auth.open(key, 'window');
			},
			finish: function(key) {
				var self = this;

				console.debug('finish', self, key);

				self.auth.close(key);
				self.auth.ready(key);
			},
			cancel: function(key) {
				var self = this;

				console.debug('cancel', self, key);

				self.auth.close(key);
				self.auth.trash(key);
			},
			open: function(key, type) {
				var self = this,
					child = self.data.auth.child[key];

				console.debug('open', self, key);

				if (!child) {
					self.data.auth.child[key] = {
						uri: '/me/share/auth/'+ key +'/redirect',
						type: type,
						object: null,
						window: null,
						repeat: null,
						counts: 0,
					};

					child = self.data.auth.child[key];
				}

				if (child.type == 'iframe') {
					child.object = jQuery('<iframe src="'+ child.uri +'">').addClass('hidden').appendTo(document.body);
					child.repeat = setInterval(function() {
						try {
							child.window = child.object.get(0).contentWindow;

							with (child.window.location) {
								if (hostname.match(/quran\.com$/) && pathname == child.uri.replace(/redirect/, 'return')) {
									self.auth.finish(key);
								}
							}
						} catch(e) {
							if (++child.counts >= 3) {
								self.auth.close(key);
								self.auth.open(key, 'window'); // fallback
							}
						}
					}, 1000);
				}
				else {
					child.object = jQuery(window.open(child.uri, key, 'width=1024,height=768,location=yes,toolbar=yes,menubar=yes'));
					child.repeat = setInterval(function() {
						try {
							child.window = child.object.get(0).window;

							with (child.window.location) {
								if (hostname.match(/quran\.com$/) && pathname == child.uri.replace(/redirect/, 'return')) {
									self.auth.finish(key);
								}
							}
						} catch(e) {
							if (!child.window) {
								quran.notify('We need to open a new window.');
							} else
							if (child.window.closed) {
								self.auth.cancel(key);
							}
							if (++child.counts >= 20) {
								quran.notify('Please authenticate '+ key);
								child.counts = 0;
							}
						}
					}, 1000);
				}
			},
			close: function(key) {
				var self = this;
					child = self.data.auth.child[key];

				console.debug('close', self, key);

				if (!child)
					return;

				clearInterval(child.repeat);

				if (child.type == 'iframe') {
					child.object.remove();
					child.object.attr('src', null);
				}
				else {
					child.window.close();
				}

				delete self.data.auth.child[key];
			}
		},
		/*
		 * s/frame/auth/
		 * s/key/api_key/
		 *	cancel
		 *	 	facebook
		 *			../return?error
		 *		google
		 *			../return?error
		 *		twitter
		 *			../return?denied
		 *	finish
		 *		facebook
		 *			../return?code
		 *		google
		 *			../return?code
		 *		twitter
		 *			../return?oauth_token
		 */
	};
})( Quran, jQuery );
