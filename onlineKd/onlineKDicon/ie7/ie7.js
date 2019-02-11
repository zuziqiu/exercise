/* To avoid CSS expressions while still supporting IE 7 and IE 6, use this script */
/* The script tag referencing this file must be placed before the ending body tag. */

/* Use conditional comments in order to target IE 7 and older:
	<!--[if lt IE 8]><!-->
	<script src="ie7/ie7.js"></script>
	<!--<![endif]-->
*/

(function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'onlineKDicon\'">' + entity + '</span>' + html;
	}
	var icons = {
		'ic_check': '&#xe920;',
		'ic_dbarrowleft': '&#xe91d;',
		'ic_dbarrowright': '&#xe91e;',
		'ic_check_small': '&#xe907;',
		'ic_close_small': '&#xe908;',
		'ic_add': '&#xe909;',
		'ic_kdb': '&#xe90a;',
		'ic_kdb2': '&#xe90b;',
		'ic_setting': '&#xe90c;',
		'ic_smback': '&#xe90d;',
		'ic_voice': '&#xe90e;',
		'ic_warning': '&#xe90f;',
		'ic_rightarrow': '&#xe91f;',
		'ic_downarrow': '&#xe901;',
		'ic_link': '&#xe910;',
		'ic_img': '&#xe911;',
		'ic_qq': '&#xe912;',
		'ic_weibo': '&#xe913;',
		'ic_weixin': '&#xe914;',
		'ic_bannerctr_prv': '&#xe906;',
		'ic_bannerctr_nxt': '&#xe905;',
		'ic_menu': '&#xe902;',
		'ic_close': '&#xe900;',
		'ic_search': '&#xe903;',
		'ic_share': '&#xe904;',
		'ic_book': '&#xe915;',
		'ic_eyes': '&#xe916;',
		'ic_home': '&#xe917;',
		'ic_kdme': '&#xe918;',
		'ic_link2': '&#xe919;',
		'ic_myfollow': '&#xe91a;',
		'ic_password': '&#xe91b;',
		'ic_service': '&#xe91c;',
		'0': 0
		},
		els = document.getElementsByTagName('*'),
		i, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		c = el.className;
		c = c.match(/ic_[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
}());
