(function(jQuery){
	jQuery.ui.codeKey = {};
	for (var key in jQuery.ui.keyCode)
		jQuery.ui.codeKey[jQuery.ui.keyCode[key]] = key;

	jQuery.toJSON = function(object) {
		return JSON.stringify(object);
	};

	/*
  jQuery.fn.cursor = function(start, end) {
		start = typeof start == 'number' ? start : this.selectionStart ? this.selectionStart : this.createTextRange ?
		end = typeof end == 'number' ? end : this.selectionEnd ? this.selectionEnd : this.createTextRange ?

    if (this.setSelectionRange) {
      this.setSelectionRange(pos, pos);
    } else if (this.createTextRange) {
      var range = this.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  };
	*/

	jQuery.fn.selectionStart = function() {
		var o = this.get(0);

		if (o.createTextRange) {
			var r = document.selection.createRange().duplicate()
			r.moveEnd('character', o.value.length)
			if (r.text == '') return o.value.length
			return o.value.lastIndexOf(r.text)
		} else return o.selectionStart
	};

	jQuery.fn.selectionEnd = function() {
		var o = this.get(0);

		if (o.createTextRange) {
			var r = document.selection.createRange().duplicate()
			r.moveStart('character', -o.value.length)
			return r.text.length
		} else return o.selectionEnd
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

	jQuery.levenshtein = function levenshtein(s1, s2) {
		if (s1 == s2) return 0;

		var s1_len = s1.length;
		var s2_len = s2.length;

		if (s1_len === 0) return s2_len;
		if (s2_len === 0) return s1_len;

		var split = false;

		try { split = !('0')[0]; } catch (e) { split = true; }

		if (split) {
			s1 = s1.split('');
			s2 = s2.split('');
		}

		var v0 = new Array(s1_len + 1);
		var v1 = new Array(s1_len + 1); 
		var s1_idx = 0, s2_idx = 0, cost = 0;

		for (s1_idx = 0; s1_idx < s1_len + 1; s1_idx++)
			v0[s1_idx] = s1_idx;

		var char_s1 = '', char_s2 = '';

		for (s2_idx = 1; s2_idx <= s2_len; s2_idx++) {
			v1[0] = s2_idx;
			char_s2 = s2[s2_idx - 1];

			for (s1_idx = 0; s1_idx < s1_len; s1_idx++) {
				char_s1 = s1[s1_idx];
				cost = (char_s1 == char_s2) ? 0 : 1;

				var m_min = v0[s1_idx + 1] + 1;
				var b = v1[s1_idx] + 1;
				var c = v0[s1_idx] + cost;

				if (b < m_min) m_min = b;

				if (c < m_min) m_min = c;

				v1[s1_idx + 1] = m_min;
			}

			var v_tmp = v0;

			v0 = v1;
			v1 = v_tmp;
		}

		return v0[s1_len];
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
