(function(jQuery){
	jQuery.toJSON = function(object) {
		return JSON.stringify(object);
	};

	jQuery.sort = function(_object_) {
		var array = [], object = {};
		for (var key in _object_)
			array.push(key);
		array = array.sort(function(a, b) {
			return a - b;
		});
		for (var i in array)
			object[array[i]] = _object_[array[i]];

		return object;
	};

	var bind = ['focusin', 'focusout', 'mousedown', 'mouseup', 'change', 'click', 'mouseenter', 'mouseleave', 'mousemove', 'mousewheel', 'scroll', 'resize', 'dblclick'];
	jQuery.each(bind, function(i, bind) {
		var method = '_'+ bind;
		jQuery.fn[method] = function(fn, bln) {
			var data;
			if (bln === undefined) bln = false;
			else if (typeof(bln) == 'function' && typeof(fn) == 'object') {
				data = fn;
				fn = bln;
				bln = false;
			}
			var _fn = function() {
				fn.apply(this, arguments);
				return bln;
			};
			return this.each(function() {
				if (!data)
					jQuery(this).unbind(bind).bind(bind, _fn);
				else
					jQuery(this).unbind(bind).bind(bind, data, _fn);
			});
		};
	});
})(jQuery);
