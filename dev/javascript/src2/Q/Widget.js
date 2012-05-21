/*
* @class Q.Controller.Widget
* @inherits Q.Controller
*/
Q.Controller.extend('Q.Controller.Widget', {
	setup: function(Class, Name, Static, Prototype) {
		var self = this;
		Static.camelName = Static.camelName || Name.replace(/\.Controller\.Widget/, '');
		Static.pluginName = Static.pluginName || jQuery.String.underscore(Static.camelName.toLowerCase()).replace(/\W/g,'_');
		self.camelName = Static.camelName;
		self.pluginName = Static.pluginName;
		self._super.apply(self, arguments);
	},
	tag: 'div'
}, {
	setup: function(element, options) {
		var self = this;
		self.source = jQuery(element);
		self.source.wrapAll('<'+ self.Class.tag +' class="ui-widget q-widget">');
		self.element = self.source.parent();
		self.attrs = {};
		jQuery.each(self.source[0].attributes, function(index, attr) {
			self.attrs[attr.name] = attr.value;
		});
		jQuery.each(self.attrs, function(name, value) {
			try {
				self.source.attr(name, null);
			} catch(e) {}
			if (name == 'class')
				self.element.addClass(value);
			else self.element.attr(name, value);
		});
		self.source.hide();
		var init = self.init;
		self.init = function(element, options) {
			init.call(self, self.element[0], options);
		};
		self._super.call(self, self.element[0], options);
		jQuery.each(self.options, function(k, v) {
			if (typeof v == 'function')
				self.options[k] = jQuery.proxy(v, self);
		});
	},
	init: function() {
		var self = this;
		self.element.addClass(self.camelName());
		self.source.addClass(self.camelName({ append: 'source' }));
		if (self.options.label)
			self._label = jQuery('<label>'+ self.options.label +'</label>')
				.addClass(self.camelName({ append: 'label' }))
				.insertAfter(self.source);
		self._super();
	},
	destroy: function() {
		var self = this, element = self.element;
		self._super();
		element.replaceWith(self.source);
		jQuery.each(self.attrs, function(name, value) {
			try {
				self.source.attr(name, value);
			} catch(e) {}
		});
		self.source.show();
	},
	cloned: function(method, target) {
		var self = this, method = method || 'insertAfter', target = target || self.source;
		return self.source.clone(true, true).show()[method](target);
	},
	camelName: function(option) {
		var self = this;
		if (!option) option = {};
		if (!option.name) option.name = [];
		if (!option.class) option.class = self.Class;

		var camelName = jQuery.map(jQuery.String.rsplit(option.class.camelName, /\./), function(a, b) {
			return a == '.' ? undefined : jQuery.String.camelize(a);
		}).join('-');

		option.name.push( camelName + ( option.append ? '-'+ option.append : '' ) )

		if (self.options.camel) {
			var a = jQuery.grep(
				jQuery.String.rsplit( jQuery.String.camelize(self.options.camel), /\s+/ ),
				function(a,b) { return !/^\s*$/.test(a); }
			);
			jQuery.each(a, function(i) {
				var q = [];
				for (var j = 0; j <= i; j++) q.push(a[j]);
				option.name.push( camelName +'-'+ q.join('-') +( option.append ? '-'+ option.append : '' ) );
			});
		}

		if (option.class.namespace !== window && option.class.namespace.camelName) {
			option.class = option.class.namespace;
			return self.camelName(option);
		}
		else return self.util.uniq(option.name.sort(function(a,b) {
			return a.length < b.length ? -1 : 1;
		})).join(' ');
	}
});
