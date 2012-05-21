/*
 * @class Q.Controller.Widget.Tree
 * @inherits Q.Controller.Widget
 * @requires Q.Controller.Widget.Tree.Menu
 * @requires Q.Controller.Widget.Tree.Content
 */
Q.Controller.Widget.extend('Q.Controller.Widget.Tree', {
	defaults: {
		menu: {
		},
		content: {
		}
	}
}, {
	init: function(element, options) {
		var self = this;

		var menu = jQuery('<div>').insertAfter(self.source).rf_tree_menu(self.options.menu).parent();
		var content = jQuery('<div>').insertAfter(menu).rf_tree_content(self.options.content).parent();

		self.elem = {
			menu: menu,
			content: content
		};

		self.ctrl = {
			menu: menu.controller(),
			content: content.controller()
		};

		self.ctrl.menu.extend({
			'.tree-node content': function(el, ev) {
				console.debug('this', el, ev);
				ev.stopPropagation();
			}
		});

		self._super();
	}
});
