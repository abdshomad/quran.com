(function( Quran, jQuery ) {
	jQuery(document).ready(function() {
		jQuery('#test-direction')._click(function(ev) { var me = jQuery(this), dir = me.attr('dir'), changeDir = dir == 'ltr' ? 'rtl' : 'ltr', targets = jQuery('[dir='+ dir +']:not(.fixed-dir)'); targets.attr('dir', changeDir); me.text(changeDir); });

		jQuery('#test-scrolling')._click(function() { var me = jQuery(this), el = jQuery('.ui-vscroll-div'); if (!el.data('toggle')) { el.data('toggle', true); el.scrollTop(100);  } else { el.data('toggle', false); el.scrollTop(0); } });

		var el = jQuery('.input-menu'), open = el.find('.input-menu-open'), wrap = el.find('.input-menu-wrap'), list = wrap.find('.input-menu-list');
		open._click(function() {
			if (!wrap.hasClass('open')) {
				wrap.animate({ height: list.height() }, function() {
					wrap.addClass('open');
				});
			} else {
				wrap.animate({ height: 0 }, function() {
					wrap.removeClass('open');
				});
			}
		});

		var div = jQuery('<div>').css({ overflow: 'scroll', visibility: 'hidden', left: -10000, top: -10000, position: 'absolute' }).appendTo(document.body), el = div.get(0), sw = el.offsetWidth - el.clientWidth; div.remove(); jQuery('<style type="text/css" scoped>.ui-vscroll-div[dir=ltr] { padding-right: '+ sw +'px; } .ui-vscroll-div[dir=rtl] { padding-left: '+ sw +'px; } </style>').prependTo(document.body);

		jQuery('#ayah-slider').slider({ min: 1, max: 286 });







	var html = jQuery('html'),
		doc = jQuery(document),
		body = jQuery(document.body),
		win = jQuery(window),
		elem = jQuery('.section.static.bottom'),
		dom = {
			html: html.get(0),
			doc: doc.get(0),
			body: body.get(0),
			win: win.get(0),
			elem: elem.get(0)
		};

	var touching = false;
	var posTimeout = null;

	function positionSet(type) {
		var scrollTop = dom.body.scrollTop;
		var scrollHeight = dom.body.scrollHeight;
		var viewHeight = dom.body.clientHeight;
		var elemHeight = dom.elem.clientHeight;
		var elemTop = scrollTop + viewHeight - elemHeight;
		elemTop = ( elemTop <= scrollHeight - elemHeight )? elemTop : scrollHeight - elemHeight;
		dom.elem.style.top = elemTop +'px';
		dom.elem.style.visibility = 'visible';
		console.debug('setPosition ('+ type +') - scrollTop:'+ scrollTop +' scrollHeight:'+ scrollHeight +' viewHeight:'+ viewHeight +' elemHeight:'+ elemHeight +' elemTop:'+ elemTop);
	};

	function setPosition(type) {
		clearTimeout(posTimeout);
		posTimeout = setTimeout(function() {
			positionSet(type);
		}, 1000);
	};

	jQuery.each(['touchstart', 'touchmove', 'touchend', 'touchcancel'], function(i, type) {
		jQuery('#body').bind(type, function(ev) {
			var event = ev.originalEvent,
				touch = event.changedTouches[0];

			if (ev.type == 'touchstart') {
				dom.elem.style.visibility = 'hidden';
				touching = true;
			} else
			if (ev.type == 'touchend' || ev.type == 'touchcancel') {
				touching = false;

				setPosition(ev.type);
			}
		});
	});









	});
})( Quran, jQuery );
