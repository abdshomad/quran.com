(function( Quran, jQuery ) {

	jQuery.template('quran.account.sign-up', '\
		<div class="purchase">\
			<h3 class="about"><a style="display: none !important;">${ quran.localize("What can you do with a quran.com account? Click here to learn more.") }</a></h3>\
			<form>\
				<table class="validate">\
					<tbody class="name">\
						<tr>\
							<td class="label" rowspan="2"><span>${ quran.localize("Your name") }</span></td>\
							<td class="input"><input type="text" class="name"/></td>\
							<td class="status">\
								<span class="box ok"><a class="icon">&#10004;</a></span>\
								<span class="box not-ok"><a class="icon">&#10008;</a></span>\
							</td>\
						</tr>\
						<tr class="exception"><td class="message" colspan="2"><p></p></td></tr>\
					</tbody>\
					<tbody class="email">\
						<tr>\
							<td class="label" rowspan="2"><span>${ quran.localize("Email address") }</span></td>\
							<td class="input"><input type="text" class="email"/></td>\
							<td class="status">\
								<span class="box ok"><a class="icon">&#10004;</a></span>\
								<span class="box not-ok"><a class="icon">&#10008;</a></span>\
							</td>\
						</tr>\
						<tr class="exception"><td class="message" colspan="2"><p></p></td></tr>\
					</tbody>\
					<tbody class="login">\
						<tr>\
							<td class="label" rowspan="2"><span>${ quran.localize("Login name / alias") }</span></td>\
							<td class="form text"><input type="text" class="login"/></td>\
							<td class="status">\
								<span class="box ok"><a class="icon">&#10004;</a></span>\
								<span class="box not-ok"><a class="icon">&#10008;</a></span>\
							</td>\
						</tr>\
						<tr class="exception"><td class="message" colspan="2"><p></p></td></tr>\
					</tbody>\
					<tbody class="password">\
						<tr>\
							<td class="label" rowspan="2"><span>${ quran.localize("Account password") }</span></td>\
							<td class="input"><input type="password" class="password"/></td>\
							<td class="status">\
								<span class="box ok"><a class="icon">&#10004;</a></span>\
								<span class="box not-ok"><a class="icon">&#10008;</a></span>\
							</td>\
						</tr>\
						<tr class="exception"><td class="message" colspan="2"><p></p></td></tr>\
					</tbody>\
					<tbody class="confirm">\
						<tr>\
							<td class="label" rowspan="2"><span>${ quran.localize("Confirm password") }</span></td>\
							<td class="input"><input type="password" class="confirm"/></td>\
							<td class="status">\
								<span class="box ok"><a class="icon">&#10004;</a></span>\
								<span class="box not-ok"><a class="icon">&#10008;</a></span>\
							</td>\
						</tr>\
						<tr class="exception"><td class="message" colspan="2"><p></p></td></tr>\
					</tbody>\
				</table>\
				<div class="purchase-or-create">\
					<h2>${ quran.localize("Would you like to donate to support quran.com server costs?") }</h2>\
					<div class="option create selected">\
						<label>\
							<input class="create" type="radio" name="purchase" value="0" checked="checked"/>\
							<span>No, just create an account.</span>\
						</label>\
					</div>\
					<div class="option purchase">\
						<label>\
							<input class="purchase" type="radio" name="purchase" value="1"/>\
							<span>Yes, create an account and allow me to donate this amount:</span>\
						</label>\
						<abbr title="United States Dollars">$</abbr> <input name="payment" class="payment" type="text" value="10" /> <abbr title="United States Dollars">USD</abbr>.\
					</div>\
				</div>\
			</form>\
			<aside>\
				<p><strong>quran.com accounts are free</strong>, but if you would like to donate to support operating costs, then we thank you and it is appreciated, may Allah accept.</p>\
			</aside>\
		</div>\
	');

	jQuery.template('quran.account.sign-up.about', '\
		<div>\
			<p class="general">\
				${ quran.localize("Accounts at quran.com open the door to a broad spectrum of possible new features for all types of users. Our goal is to distribute Allah&#39;s book to the entire world, enabling both Arabic and non-Arabic speakers and Muslims and non-Muslims to more deeply understand, comprehend and interact with the Qur&#39;an. Our goal is not to create another social-networking site, yet we recognize that many aspects of social-networking can potentially provide immense benefit for both the casual reader or scholarly researcher.") }\
			</p>\
			<div class="features implemented">\
				<h3>${ quran.localize("Features implemented:") }</h3>\
				<ul>\
					<li>\
						<h4>${ quran.localize("Bookmark:") }</h4>\
						<p>Bookmark ayahs to share or lookup for future reference. <strong>Note:</strong> <em>Partially implemented</em>. Start collecting your favorite ayahs now so that you can share and refer to them later.</p>\
					</li>\
					<li>\
						<h4>${ quran.localize("Lastmark:") }</h4>\
						<p>${ quran.localize("Set a stopping point so that you know what ayah you left off at when you come back to continue reading later.") }</p>\
					</li>\
				</ul>\
			</div>\
			<div class="features in-development">\
				<h3>${ quran.localize("Under development:") }</h3>\
				<ul>\
					<li>\
						<h4>${ quran.localize("Notes:") }</h4>\
						<p>${ quran.localize("Attach and edit your own private notes to ayahs as you read along or mark them as public, viewable to other quran.com members who have chosen to follow you (e.g. like Twitter or Google Buzz).") }</p>\
					</li>\
					<li>\
						<h4>${ quran.localize("Tags:") }</h4>\
						<p>${ quran.localize("Tag ayahs with relevant keywords.") }</p>\
					</li>\
					<li>\
						<h4>${ quran.localize("Groups:") }</h4>\
						<p>${ quran.localize("Form private study groups for research and discussion with other quran.com members and join together to strengthen your understanding of the Qur&#39;an via discussions centered around specific surahs and ayahs.") }</p>\
					</li>\
					<li>\
						<h4>${ quran.localize("Share:") }</h4>\
						<p>${ quran.localize("Share and distribute the Qur&#39;an by re-sharing ayahs with or without translations or your own personal commentary to your accounts on social-networking sites such as Facebook, Google Buzz and Twitter.") }</p>\
					</li>\
				</ul>\
			</div>\
		</div>\
	');

	jQuery.template('quran.account.sign-up.signed-up', '\
		<div>\
			{{if purchase}}\
			<h2>Thank you for donating and creating your account, ${ name }.</h2>\
			{{else}}\
			<h2>Thank you for creating your account, ${ name }.</h2>\
			{{/if}}\
			<h3>We appreciate it. Your quran.com account is ready to use and we&#39;ve already signed you in.</h3>\
			{{if !purchase}}\
			<h4><blink>${ quran.localize("IMPORTANT") }</blink> : Please verify your email address. Just look for the email we just sent you with the subject line "Activate your quran.com account" and click on the provided link.</h4>\
			{{/if}}\
		</div>\
	');

	Quran.ui.head.signUp = function(quran) {
		var self = this;

		jQuery.extend(self, { quran: quran });

		self.elem.trigger.mouseup(function(ev) {
			if (!self.initialized)
				self.init();
			else self.element.modal('toggle');
		});
	};
	Quran.ui.head.signUp.prototype = {
		elem: {
			trigger : jQuery('#account > span.sign > b.up'),
		},
		init: function() {
			var self = this;

			self.element = jQuery.tmpl('quran.account.sign-up').modal({
				className: 'account sign-up',
				width: 700,
				minWidth: 700,
				title: 'Create New Account',
				footer: {
					message: '<img src="https://www.paypal.com/en_US/i/btn/btn_dg_pay_w_paypal.gif" alt="Pay with PayPal" style="position:absolute;top:-2px;right:10px;opacity:0.75;"/>',
					buttons: [{
						label: 'Cancel',
						click: function() {
							this.close();
						}
					}, {
						label: 'Create Account',
						click: function() {
							self.purchase_or_create();
						}
					}]
				},
				sections: {
					about: {
						title: 'About Quran.com Accounts',
						content: jQuery.tmpl('quran.account.sign-up.about'),
						footer: {
							buttons: [{
								label: 'Back',
								click: function() {
									this.open('main');
								}
							}]
						}
					}
				}
			});

			self.element.find('.about a').click(function() {
				self.element.modal('open', 'about');
			});

			self.element.find('.purchase-or-create .option input[name=purchase]').change(function() {
				var me = jQuery(this),
					option = me.closest('.option'),
					payment = option.parent().find('input.payment');

				option.addClass('selected').siblings('.option').removeClass('selected');

				if (me.hasClass('purchase')) {
					payment.attr('disabled', false);
					self.element.removeClass('create').addClass('purchase');
					self.element.modal('status', null, '<img src="https://www.paypal.com/en_US/i/btn/btn_dg_pay_w_paypal.gif" alt="Pay with PayPal" style="position:absolute;top:-2px;right:10px;opacity:0.75;"/>');
				}
				else {
					payment.attr('disabled', true);
					self.element.removeClass('purchase').addClass('create');
					self.element.modal('status', null, null);
				}
			});

			self.element.find('.purchase-or-create input.payment').change(function() {
				var me = jQuery(this);

				me.val(me.val().replace(/[^.\d]/g,'').replace(/[.]+/,'.').replace(/(\.[^.]*)\..*$/,'$1').replace(/(\.[\d])$/,'$1'+'0').replace(/(\.[\d]{2}).*/,'$1').replace(/^\./,'0.').replace(/^[0]*([\d])/,'$1').replace(/\.$/,''));

				if (me.val() == '0' || me.val() == '0.00' || me.val() == '')
					me.val(10).parent().siblings('.option.create').find('input[name=purchase]').attr({ checked: 'checked' }).trigger('change');
			});

			self.element.find('.validate input').keypress(function(event) {
				if ((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13))
					self.purchase_or_create();
			});

			self.initialized = true;
		},
		purchase_or_create: function() {
			var self = this;

			if (self.element.hasClass('create'))
				self.create();
			else if (self.element.hasClass('purchase'))
				self.purchase();
		},
		create: function() {
			var self = this;

			self.validate(self._purchase_or_create);
		},
		purchase: function() {
			var self = this;

			self.validate(function(params) {
				self.paypal.start(self, params);
			});
		},
		paypal: {
			start: function(self, params) {
				jQuery.extend(this, {
					  self : self,
					params : params
				});

				self.element.modal('status', 'loading', 'Starting PayPal');

				var $this = this;

				$script('https://www.paypalobjects.com/js/external/dg.js', function() {
					$this.dg = new PAYPAL.apps.DGFlow;
					$this.dg.startFlow('/sign/up/payment/start/'+ params.payment);
					self.elem.paypal = jQuery('iframe');
					self.elem.paypal.bind('load', function() {
						self.element.modal('status', 'ok', 'PayPal Started');
					});
				});
			},
			finish: function(params) {
				var self = this.self,
				  params = jQuery.extend(params, this.params);

				this.dg.closeFlow();

				self._purchase_or_create(params);
			},
			cancel: function() {
				var self = this.self,
				  params = this.params;

				this.dg.closeFlow();

				self.element.modal('status', undefined);
				self.element.modal('unmask');
			}
		},
		validate: function(callback) {
			var self = this,
				params = {};

			self.element.find('input').each(function() {
				var me = jQuery(this),
					key = me.attr('class');

				if (me.attr('name') != 'purchase')
					params[key] = me.val();
			});

			params.purchase = self.element.hasClass('purchase') ? 1 : 0;

			console.debug('params', params);

			self.element.modal('mask');
			self.element.modal('status', 'loading', 'validating...');

			self.ajax = jQuery.ajax({
				url: '/sign/up/validate', type: 'POST', contentType: 'application/json',
				data: JSON.stringify(params),
				success: function(data) {

					self.element.find('.validate tbody').removeClass('status-ok').removeClass('status-not-ok');

					if (data.exception) {
						jQuery.each(data.passed, function(i, fieldName) {
							self.element.find('.validate tbody.'+ fieldName).addClass('status-ok');
						})

						self.element.find('.validate tbody.'+ data.exception.field).addClass('status-not-ok').find('.exception .message p').text(quran.localize(data.exception.message));

						self.element.modal('unmask');
						self.element.modal('status', 'error', 'validation failed');
					}
					else {
						self.element.find('.validate tbody').addClass('status-ok');

						self.element.modal('status', undefined);

						callback.call(self, jQuery.extend(params, data));
					}
				}
			});
		},
		_purchase_or_create: function(params) {
			var self = this,
				message = params.purchase ? 'loading PayPal and creating account' : 'creating account',
				url = params.purchase ? '/sign/up/purchase' : '/sign/up/create';

			self.element.modal('status', 'loading', message);

			self.ajax = jQuery.ajax({
				url: url, type: 'POST', contentType: 'application/json',
				data: JSON.stringify(params),
				success: function(data) {
					self.finish(jQuery.extend(params, data));
				}
			});
		},
		finish: function(data) {
			var self = this;

			self.element.modal('unmask');

			if (data.created == 1 || data.purchased == 1) {
				self.element.modal('addSection', 'signed-up', {
					title: 'Account Created!',
					content: jQuery.tmpl('quran.account.sign-up.signed-up', data),
					footer: {
						buttons: [{
							label: 'Reload Page',
							click: function() {
								window.location.reload();
							}
						}]
					}
				});

				self.element.modal('open', 'signed-up');
				self.element.modal('status', 'ok', data.purchased ? 'account purchased' : 'account created');
			}
			else {
				if (data.created == 0)
					self.element.modal('status', 'error', 'could not create account');
				else if (data.purchased == 0)
					self.element.modal('status', 'error', 'transaction failed');
			}
		}
	};
})( Quran, jQuery );
