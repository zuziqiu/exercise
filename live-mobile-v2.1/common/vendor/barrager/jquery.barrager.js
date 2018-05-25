/*!
 *@name     jquery.barrager.js
 *@author   yaseng@uauc.net
 *@url      https://github.com/yaseng/jquery.barrager.js
 */

define(function(require, exports, module) {
	var $ = require('$');
	var animate = require("animate");
	$.fn.barrager = function(barrage) {
		barrage = $.extend({
			close:true,
			bottom: 0,
			speed: barrage.speed,
			color: '#fff',
			old_ie_color : '#000000'
		}, barrage || {});
		var time = new Date().getTime();
		var barrager_id = 'barrage_' + time;
		var id = '#' + barrager_id;

		var div_barrager = $("<div class='barrage' id='" + barrager_id + "'></div>").appendTo($(this));

		var window_height = $(this).height() - 40;
		var bottom = (barrage.bottom == 0) ? Math.floor(Math.random() * window_height) : barrage.bottom;
		div_barrager.css("bottom", bottom + "px");
		div_barrager_box = $("<div class='barrage_box cl'></div>").appendTo(div_barrager);
		
		div_barrager_box.append(" <div class='z p'></div>");
		if(barrage.close){

			div_barrager_box.append(" <div class='close z'></div>");

		}
		
		//过滤图片
		var content = $("<a title='' href='javascript:void(0)'></a>").appendTo(id + " .barrage_box .p");
		content.attr({
			'id': barrage.id
		}).empty().append(barrage.info);

		content.css('color', barrage.color);

		var window_width = $(window).width()+300;



		$(id).animate({right:""+window_width+"px"}, barrage.speed*1000,function(){
			$(id).remove();
		})
	}
 
	$.fn.barrager.removeAll=function(){

		 $('.barrage').remove();

	}

})
