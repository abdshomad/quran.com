jQuery.sort = function(_object_) {
	var array = [], object = {};
	for (var key in _object_)
		array.push(key);

	array = array.sort(function(a, b) { return a - b; });

	for (var i in array)
		object[array[i]] = _object_[array[i]];

	return object;
};

jQuery.uniq = function(array, sort) {
	array.sort(sort);
	var length = array.length;
	var splice = array.splice(0, length);
	var hash = {};
	for (var i = 0; i < length; i++) {
		var val = splice.shift();
		if (!hash[val]) {
			hash[val] = true;
			array.push(val);
		}
	}
	return array;
};

jQuery.copy = function(object) {
	var copy;

	if (typeof(object) == 'object')
		if (object.length !== undefined)
			copy = [];
		else copy = {};
	else return;

	function get(value) {
		if (typeof value == 'number' || typeof value == 'boolean' || typeof value == 'function') {
			return value;
		} else
		if (typeof value == 'string') {
			if (value.match(/^[\d]+$/))
				return parseInt(value);
			else return value;
		} else
		if (typeof value == 'object') {
			var copy;

			if (value === null)
				copy = null;
			else if (value.length !== undefined)
				copy = [];
			else copy = {};

			for (var key in value)
				copy[key] = get(value[key]);

			return copy;
		}
	};

	for (var key in object)
		copy[key] = get(object[key]);

	return copy;
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

jQuery.sprintf = (function() {
	function get_type(variable) {
		return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
	}
	function str_repeat(input, multiplier) {
		for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
		return output.join('');
	}

	var str_format = function() {
		if (!str_format.cache.hasOwnProperty(arguments[0])) {
			str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
		}
		return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
	};

	str_format.format = function(parse_tree, argv) {
		var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
		for (i = 0; i < tree_length; i++) {
			node_type = get_type(parse_tree[i]);
			if (node_type === 'string') {
				output.push(parse_tree[i]);
			}
			else if (node_type === 'array') {
				match = parse_tree[i]; // convenience purposes only
				if (match[2]) { // keyword argument
					arg = argv[cursor];
					for (k = 0; k < match[2].length; k++) {
						if (!arg.hasOwnProperty(match[2][k])) {
							throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
						}
						arg = arg[match[2][k]];
					}
				}
				else if (match[1]) { // positional argument (explicit)
					arg = argv[match[1]];
				}
				else { // positional argument (implicit)
					arg = argv[cursor++];
				}

				if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
					throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
				}
				switch (match[8]) {
					case 'b': arg = arg.toString(2); break;
					case 'c': arg = String.fromCharCode(arg); break;
					case 'd': arg = parseInt(arg, 10); break;
					case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
					case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
					case 'o': arg = arg.toString(8); break;
					case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
					case 'u': arg = Math.abs(arg); break;
					case 'x': arg = arg.toString(16); break;
					case 'X': arg = arg.toString(16).toUpperCase(); break;
				}
				arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
				pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
				pad_length = match[6] - String(arg).length;
				pad = match[6] ? str_repeat(pad_character, pad_length) : '';
				output.push(match[5] ? arg + pad : pad + arg);
			}
		}
		return output.join('');
	};

	str_format.cache = {};

	str_format.parse = function(fmt) {
		var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
		while (_fmt) {
			if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
				parse_tree.push(match[0]);
			}
			else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
				parse_tree.push('%');
			}
			else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
				if (match[2]) {
					arg_names |= 1;
					var field_list = [], replacement_field = match[2], field_match = [];
					if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
						field_list.push(field_match[1]);
						while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
							if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
								field_list.push(field_match[1]);
							}
							else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
								field_list.push(field_match[1]);
							}
							else {
								throw('[sprintf] huh?');
							}
						}
					}
					else {
						throw('[sprintf] huh?');
					}
					match[2] = field_list;
				}
				else {
					arg_names |= 2;
				}
				if (arg_names === 3) {
					throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
				}
				parse_tree.push(match);
			}
			else {
				throw('[sprintf] huh?');
			}
			_fmt = _fmt.substring(match[0].length);
		}
		return parse_tree;
	};

	return str_format;
})();

jQuery.each(['focusin', 'focusout', 'mousedown', 'mouseup', 'change', 'click', 'mouseenter', 'mouseleave', 'mousemove', 'mousewheel', 'scroll', 'resize', 'dblclick'], function(i, bind) {
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

jQuery.ui.codeKey = {};
for (var key in jQuery.ui.keyCode)
	jQuery.ui.codeKey[jQuery.ui.keyCode[key]] = key;

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


jQuery.each(['viewport', 'window', 'document'], function(i, fn) {
	jQuery[fn] = function(elem) {
		var object, element;
		if (!jQuery[fn].object) {
			object = !i ? window.document.documentElement ? jQuery(window.document.documentElement) : jQuery(window.document.body) : jQuery(window[fn]);
			element = object[0];
			if (jQuery.support.boxModel) {
				jQuery[fn].object = object;
				jQuery[fn].element = element;
			}
		}
		else {
			object = jQuery[fn].object;
			element = jQuery[fn].element;
		}
		return elem ? element : object;
	};
});

jQuery.isViewport = function(elem) {
	elem = elem.jquery ? elem[0] : elem;
	return elem && elem === jQuery.viewport()[0];
};

jQuery.fn.isViewport = function() {
	return jQuery.isViewport(this[0]);
};

jQuery.fn.isWindow = function() {
	return jQuery.isWindow(this[0]);
};

jQuery.isDocument = function(elem) {
	elem = elem.jquery ? elem[0] : elem;
	return elem && elem.nodeType === 9;
};

jQuery.fn.isDocument = function() {
	return jQuery.isDocument(this[0]);
};

jQuery.fn.scrollHeight = function() {
	if (!this[0]) return;
	var elem = this.isWindow() || this.isDocument() ? jQuery.viewport()[0] : this[0];
	return elem.scrollHeight;
};

jQuery.fn.scrollMax = function() {
	if (!this[0]) return;
	var elem = this.isWindow() || this.isDocument() ? jQuery.viewport()[0] : this[0];
	return elem.scrollHeight - elem.offsetHeight;
};

jQuery.fn.scrollSize = function() {
	if (!this[0]) return;
	var elem = this.isWindow() || this.isDocument() ? jQuery.viewport()[0] : this[0];
	return elem.offsetHeight;
};

jQuery.fn.scrollRange = function() {
	if (!this[0]) return;
	var viewport = this.isWindow() || this.isDocument() || this.isViewport();
	var elem = viewport ? jQuery.viewport()[0] : this[0];
	var offset = viewport ? elem.scrollTop : this.offsetTop();
	return [ offset, offset + elem.offsetHeight ];
};

jQuery.fn.scrollBottom = function(val) {
	if (!this[0]) return;
	var elem = this.isWindow() || this.isDocument() ? jQuery.viewport()[0] : this[0];
	return val === undefined ? -1 * ( elem.scrollTop - ( elem.scrollHeight - elem.offsetHeight ) ) : this.each(function() {
		var viewport = jQuery.isWindow(this) || jQuery.isDocument(this) || jQuery.isViewport(this);
		var elem = viewport ? jQuery.viewport()[0] : this;
		val =  -1 * ( val - ( elem.scrollHeight - elem.offsetHeight ) );
		if ( viewport ) {
			window.scrollTo( elem.scrollLeft, val );
		} else {
			elem.scrollTop = val;
		}
	});
};

jQuery.fn.offsetTop = function() {
	if (!this[0]) return;
	var elem = this[0];
	var offsetTop = elem.offsetTop;
	var ref = elem.offsetParent;
	while (ref) {
		offsetTop += ref.offsetTop;
		ref = ref.offsetParent;
	}
	return offsetTop;
};

jQuery.fn.offsetBottom = function() {
	if (!this[0]) return;
	var obj = this;
	var elem = obj[0];
	var view = jQuery.viewport()[0];
	var offsetTop = obj.offsetTop();
	var offsetHeight = elem.offsetHeight;
	var scrollTop = offsetTop + offsetHeight;
	var offsetBottom = view.scrollHeight - scrollTop;
	return offsetBottom;
};

jQuery.fn.offsetSum = function() {
	var sum = 0;
	this.each(function() {
		sum += this.offsetHeight;
	});
	return sum;
};
