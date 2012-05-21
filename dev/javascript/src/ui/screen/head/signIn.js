(function( Quran, jQuery ) {

	jQuery.template('quran.account.sign-in', '\
		<div>\
			<table>\
				<tbody>\
					<tr>\
						<td class="login">\
							<label>\
								<span>${ quran.localize("login:") }</span>\
								<input type="text" class="login" autofocus="autofocus"/>\
							</label>\
						</td>\
						<td class="password">\
							<label>\
								<span>${ quran.localize("password:") }</span>\
								<input type="password" class="password"/>\
							</label>\
						</td>\
					</tr>\
					<tr class="hint">\
						<td colspan="2">\
							<span class="login">${ quran.localize("account login (user alias) or email address") }</span>\
							<span class="password">${ quran.localize("your secret password") }</span>\
						</td>\
					</tr>\
				</tbody>\
			</table>\
		</div>\
	');

	jQuery.template('quran.account.signed-in', '\
		<div>\
			<h2>${ "Welcome back, "+ name +"!" }</h2>\
		</div>\
	');

	Quran.ui.head.signIn = function(quran) {
		var self = this;

		jQuery.extend(self, { quran: quran });

		self.elem.trigger.mouseup(function(ev) {
			if (!self.initialized)
				self.init();
			else self.element.modal('toggle');
		});
	};
	Quran.ui.head.signIn.prototype = {
		elem: {
			trigger : jQuery('#account > span.sign > b.in')
		},
		init: function() {
			var self = this;
			window._self = self; // debug

			self.element = jQuery.tmpl('quran.account.sign-in').modal({
				className: 'account sign-in',
				width: 620,
				minWidth: 560,
				title: 'Sign In',
				footer: {
					buttons: [{
						label: 'Cancel',
						click: function(event) {
							this.close();
						}
					}, {
						label: 'Sign In',
						click: function(event) {
							self.authenticate();
						}
					}]
				},
				open: function(event, data) {
					var that = this;
					setTimeout(function() {
						that.element.find('input.login').focus().focusin();
					}, 200);
				}
			});

			self.element.find('input').keypress(function(event) {
				if ((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13))
					self.authenticate();
			}).focusin(function(event) {
				self.element.addClass(jQuery(this).attr('class'));
			}).focusout(function(event) {
				self.element.removeClass(jQuery(this).attr('class'));
			});

			self.initialized = true;
		},
		authenticate: function(callback) {
			var self = this,
				params = {};

			self.element.find('input').each(function() {
				var me = jQuery(this),
					key = me.attr('class');

				params[key] = me.val();
			});

			params.login = params.login.toLowerCase();

			self.element.modal('mask');
			self.element.modal('status', 'loading', 'signing in');

			self.ajax = jQuery.ajax({
				url: '/sign/in', type: 'POST', contentType: 'application/json',
				data: JSON.stringify(params),
				success: jQuery.proxy(self, 'finish')
			});
		},
		finish: function(data) {
			var self = this;

			if (data.authenticated) {
				var buttons = [{
					label: 'Reload Page',
					click: function() {
						window.location.reload();
					}
				}];

				if (data.lastmark)
					buttons.unshift({
						label: 'Continue From Lastmark',
						click: function() {
							var mark = data.lastmark,
								part = mark.key.split(/:/),
								url = '/'+ quran.data('language').language_code +'/'+ part[0] + mark.context.range +'/#'+ part[1] + mark.context.state,
								this_path = url.replace(/#.*$/, '').replace(/\/$/,'').replace(/^\/[^\/]+/,''),
								that_path = window.location.pathname.replace(/\/$/,'').replace(/^\/[^\/]+/,'');

							if (this_path == that_path) {
								window.location.replace(url);
								window.location.reload();
							} else window.location.assign(url);
						}
					});

				self.element.modal('addSection', 'signed-in', {
					title: 'Signed in',
					content: jQuery.tmpl('quran.account.signed-in', data),
					footer: {
						buttons: buttons
					}
				});

				self.element.modal('open', 'signed-in');
				self.element.modal('status', 'ok', 'signed in');
			}
			else {
				self.element.modal('status', 'error', data.reason);
			}

			self.element.modal('unmask');
		}
	};
})( Quran, jQuery );
