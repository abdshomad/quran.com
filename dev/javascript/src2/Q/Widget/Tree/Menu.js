/*
 * @class Q.Controller.Widget.Tree.Menu
 * @inherits Q.Controller.Widget
 * @requires Q.Factory.TreeNode
 */
Q.Controller.Widget.extend('Q.Controller.Widget.Tree.Menu', {
	defaults: {
		cookie: 'q-tree-menu',
		prefix: {
			root: 'tree-root',
			node: 'tree-node'
		},
		root: 'RadioField',
		config: {
			plugins: ['json_data', 'ui', 'themeroller', 'types', 'contextmenu', 'crrm'],
			themeroller: {
				item: 'ui-state-undefined'
			},
			contextmenu: {
				select_node: true,
				show_at_node: false,
				items: function() { return {} }
			}
		}
	}
}, {
	setup: function() {
		var self = this;
		self._super.apply(self, arguments);
		self.prefix = jQuery.extend({}, self.Class.defaults.prefix, self.options.prefix);
		self.options.root = jQuery.extend({}, { name: self.Class.defaults.root }, {
			class: self.prefix.root +' root',
			id: self.prefix.root,
			state: 'opened',
			type: 'root'
		}, typeof self.options.root == 'string' ? { name: self.options.root } : self.options.root);
	},
	init: function() {
		var self = this;

		self.element.on('init.jstree', function(ev, data) {
			self.tree = data.inst;
		}).jstree(jQuery.extend({}, self.Class.defaults.config, {
			core: {
				animation: 0,
				open_parents: false,
				initially_open: [ self.prefix.root ],
			},
			ui: {
				initially_select: [ self.prefix.root ]
			},
			json_data: {
				correct_state: true,
				progressive_render: false,
				progressive_unload: false,
				data: function() {
					return self._build_node.apply(self, arguments);
				}
			}
		}, self.options.config))
		.on('reopen.jstree', function(ev, data) {
			ev.stopPropagation();
			var elem = jQuery(this),
					opened = self.cookie.store('state.node.opened') || self.cookie.store('state.node.opened', []),
					selected = self.cookie.store('state.node.selected');

			self.open_node();
			self.select_node();

			setTimeout(function() {
				self.element.trigger('init.menu');
			}, 100);

			var current = self.tree.get_selected();
			current.trigger('content.hook', current.data().meta);

			elem.on('rename.jstree', function(ev, data) {
				console.debug('rename', ev, data);
			});
			elem.on('correct_state.jstree load_node.jstree open_node.jstree close_node.jstree select_node.jstree deselect_node.jstree', function(ev, data) {
				ev.stopPropagation();
				var elem = data.rslt.obj, data = elem.data(), id = {}, children = elem.find('.tree-node');

				id[elem[0].id] = 1;
				children.each(function(i, child) {
					id[child.id] = 1;
				});

				var opened = self.cookie.store('state.node.opened') || self.cookie.store('state.node.opened', []),
					opened_length = opened.length,
					selected = self.cookie.store('state.node.selected'),
					selected_orig = selected;

				switch (ev.type) {
					case 'load_node':
						self.open_node();
						self.select_node();
					break;
					case 'correct_state':
					case 'open_node':
						jQuery.each(id, function(id) {
							if (self.tree.is_open('#'+ id))
								opened.push( id );
						});
					break;
					case 'close_node':
						opened = jQuery.grep(opened, function(v) {
							return id[v] ? false : true;
						});
					break;
					case 'select_node':
						selected = elem[0].id;
					break;
					case 'deselect_node':
						selected = null;
					break;
				}

				opened = self.util.uniq( opened );

				if (opened.length != opened_length)
					self.cookie.store('state.node.opened', opened);

				if (selected != selected_orig)
					self.cookie.store('state.node.selected', selected);

				if (ev.type == 'select_node') {
					var ev = new jQuery.Event('content');
					elem.trigger(ev, data.meta);
				}
			});
		});
		self._super();
	},
	_build_tree: function(type, node, root) {
		var self = this, type = /^\d+$/.test(type) ? null : type, root = root ? root : new TreeNode ( self.options.root );

		if (typeof node != 'object' && typeof node != 'function') return;
		if (typeof node.length == 'undefined') { // object or function
			jQuery.each(node, function(type, object) {
				if (type == 'menu') return;
				if (typeof object != 'object' && typeof object != 'function') return;
				var p = { type: type == root.node.type ? ['sub-', type, 's'].join('') : [type, 's'].join('') };
				p.name = jQuery.String.capitalize( p.type );
				console.debug(p.name);
				var child = new TreeNode(jQuery.extend({}, {
					id: [root.options.id, self.prefix.node, p.type].join('-'),
					class: [self.prefix.node, p.type].join(' '),
					name: p.name,
					type: p.type,
					state: 'closed',
					data: typeof object == 'function' ? root.options.data : object,
					load: typeof object == 'function' ? object : null,
					menu: object.menu ? object.menu : null
				}));

				root.append( child );
				if (typeof object != 'function')
					self._build_tree( type, object, child );
			});
		}
		else { // array
			jQuery.each(node, function(i, object) {
				var p = { type: type || (typeof object == 'object' ? object.type : 'default') };
				p.name = jQuery.String.capitalize(
					typeof object == 'string' ? object
					: object.name ? object.name
					: object.title ? object.title
					: object.type ? object.type
					: p.type
				);
				var child = new TreeNode(jQuery.extend({}, {
					data: object
				}, object, {
					id: [root.options.id, self.prefix.node, p.type, object.id].join('-'),
					class: [self.prefix.node, p.type].join(' '),
					type: p.type,
					name: p.name,
					state: 'closed'
				}));

				root.append( child );
				self._build_tree( type, object, child );
			});
		}

		return root;
	},
	_build_node: function(elem, callback) {
		var self = this;
		if (elem === -1) {
			var root = self._build_tree( null, self.options.tree );
			callback( root.node );
		}
		else {
			var load = elem.data('load');

			if (typeof load == 'function') {
				var node = elem.data('node')();
				load(callback, { menu: self, node: node, elem: elem });
			}
			else setTimeout(function() {
				callback();
			}, 382);
		}
	},
	select_node: function(id) {
		var self = this;
		id = id || self.cookie.store('state.node.selected');
		if (!id) return;
		id = id.replace(/^#/, '');
		if (self.tree.is_selected() && self.tree.get_selected().attr('id') == id)
			return;
		id = '#'+ id;
		if (!jQuery(id).length) return;
		self.tree.deselect_all();
		return self.tree.select_node(id);
	},
	open_node: function(id) {
		var self = this;
		id = id || self.cookie.store('state.node.opened') || self.cookie.store('state.node.opened', []);
		if (typeof id == 'string') id = [id];
		jQuery.each(id, function(i, id) {
			id = id.replace(/^#/, '');
			id = '#'+ id;
			if (self.tree.is_closed(id))
				self.tree.open_node(id);
		});
	},
	reselect: function(callback) {
		var self = this;
		function reselect() {
			var node = self.tree.get_selected();
			var data = node.data();
			self.tree.deselect_all();
			self.tree.select_node(node);
			callback();
		};
		if (self.tree) reselect();
		else self.element.one('init.menu', reselect);
	}
});
