/*
 * @class Q.Controller.Widget.Tree.Content
 * @inherits Q.Controller.Widget
 */
Q.Controller.Widget.extend('Q.Controller.Widget.Tree.Content', {
	defaults: {
		data: {}
	}
}, {
	init: function() {
		var self = this;
		self._super();
	},
	page: function(elem, ev, option) {
		ev.stopPropagation();
		var self = this,
		    option = option || {},
		    data = jQuery.extend({}, option.data),
		    uid = option.uid ? option.uid : elem.data('uid') ? elem.data('uid') : (function() {
		      elem.data('uid', (((1+Math.random())*0x10000)|0).toString(16).substring(1));
		      return elem.data('uid');
		    })(),
		    id = option.id ? option.id : 'page',
		    page = self.data.store( uid ),
		    template = option.template;

		if (!page) {
			if (!template) return;

			page = jQuery(jQuery.View(template, {
				data: data,
				self: self,
				uid: uid,
				id: id
			}));

			page.rf(); // Initialize an Q controller
			var controller = page.controller();

			if (option.init)
				option.init.call(self, page, controller);
		}

		self.element.children().detach();
		self.element.append(page);
		self.data.store(uid, page);

		if (option.after)
			option.after.apply(self, page);
	}
});
