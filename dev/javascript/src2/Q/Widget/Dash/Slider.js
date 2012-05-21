/*
 * @class Q.Controller.Widget.Dash.Slider
 * @inherits Q.Controller.Widget
 */
Q.Controller.Widget.extend('Q.Controller.Widget.Dash.Slider', {
	pluginName: 'q_dash_slider',
	defaults: {
		corner: 'all',
		data: {}
	},
	tag: 'span'
}, {
	setup: function() {
		var self = this;
		self._super.apply(self, arguments);

		self.data.store('ayahs', q.d('surah.ayahs'));
		self.data.store('surah', q.d('surah.surah_id'));
		self.data.store('scale', 1000);
		self.data.store('slider.max', ( self.data.store('ayahs') - 1 ) * self.data.store('scale'));

		jQuery.each(self.event, function(ns, object) {
			jQuery.each(object, function(name, fn) {
				self.event[ns][name] = jQuery.proxy(fn, self);
			});
		});
	},
	init: function() {
		var self = this;

		self._super();
		var x = q.state('action') == 'main/surah' ? q.state('ayah') - 1 : q.state('index');
		self.element.mxui_nav_slider({
			val: x * self.data.store('scale'), // TODO: set from hash or session
			max: self.data.store('slider.max'),
			min: 1, interval: 1
		});

		self.slider = self.element.controllers()[1];
		self.parent = self.element.parent();

		self.data.store('handle.width', self.element.outerWidth());

		self.parent.on('mousedown.slider', function(ev) {
			self.offset({ left: ev.clientX - self.data.store('handle.width') / 2 });
			self.event.parent.init(ev)
			ev.stopPropagation();
			return false;
		});

		self.element.on('dragdown', function(ev) {
			ev.stopPropagation();
			return false;
		});

		self.element.on('change changing', function(ev, value) {
			var surah = self.data.store('surah'), ayah = Math.round( value / self.data.store('scale') ) + 1;
			var key = surah +':'+ ayah;
			q.run('scroll', {
				key: key
			}, self.Class.fullName);
			if (ev.type == 'change') q.change({ key: key, anchor: true }, self.Class.fullName);
			self.element.css({ top: 0 }); // fix/workaround
		});

		q.on('change scroll', function(change, from) {
			if (from == self.Class.fullName) return;
			var x = change.action == 'main/surah' ? change.ayah - 1 : change.index;
			self.slider.value = x * self.data.store('scale');
			self.slider.updatePosition();
		}, 1, self.Class.fullName);
	},
	offset: function(offset) {
		var self = this;

		self.slider.getDimensions();

		var min = self.slider.leftStart, max = min + self.slider.widthToMove;

		if (offset.left < min)
			offset.left = min;
		else
		if (offset.left > max)
			offset.left = max;

		self.element.offset( offset );
		self.slider.determineValue();

		return offset;
	},
	event: {
		parent: {
			init: function(ev) {
				var self = this;
				self.event.parent.event = ev;
				self.event.parent.start = ev.vector();
				jQ.document.on('mouseup.slider',   self.event.parent.up);
				jQ.document.on('mousemove.slider', self.event.parent.move);
			},
			move: function(ev) {
				var self = this;
				var vector = ev.vector();
				if (vector.equals(self.event.parent.start)) return;
				else if (!self.event.parent.moving) {
					self.event.parent.moved = true;
					jQ.document.on('mousedown.slider', self.event.parent.down);
				}
				self.offset({ left: vector[0] - self.data.store('handle.width') / 2 });
				self.element.trigger('changing', self.slider.value)
			},
			up: function(ev) {
				var self = this;
				self.event.parent.end(ev);
			},
			down: function(ev) {
				var self = this;
				self.event.parent.end(ev);
			},
			end: function(ev) {
				var self = this;
				self.event.parent.moved = false;
				jQ.document.off('mousemove.slider mousedown.slider mouseup.slider');
				self.element.trigger('change', self.slider.value);
			}
		}
	},
	destroy: function() {
		var self = this;
		// stuff
		self._super();
	}
});
