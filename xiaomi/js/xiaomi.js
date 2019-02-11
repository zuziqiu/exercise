$(function($) {
	

//var result = [];
//
//  var arr = [1, 11, 1, 11, 2, 3, 3, 5, 7, 7];
//
//  for (var i = 0; i < arr.length; i++) {
//
//      if (("|"+result.join("|")+"|").indexOf("|"+arr[i]+"|") == -1) {
//
//          result.push(arr[i]);
//
//      }
//
//  }
//
//  console.log(result);

	//随滚动条滚动的可关闭广告窗口
    $(window).scroll(function(){
        var st = $(this).scrollTop()+110;
        $(".introduce").css("top",st);
    });
    $(".introduce p").click(function(){
    	$(".introduce").animate({"right":"30px"});
    	$(".introduce .close").show();
    });
    $(".introduce").find("a").click(function(){
        $(".introduce").hide();
    });
	//购物车弹出隐藏
	$(".shopping").mouseover(function(){
		$(".shopping a").css("background-color", "white");
        $(".shopping_extend").stop(true,false);
        $(".shopping_extend").animate({"height":"100px"},200);
    });
    $(".shopping").mouseleave(function(){
        $(".shopping_extend").stop(true,false);
        $(".shopping_extend").animate({"height":"0px"},200,function(){$(".shopping a").css("background-color", "");});
    });
    $(".shopping_extend").mouseover(function(){
    	$(".shopping_extend").stop(true,false);
    });
    $(".shopping_extend").mouseleave(function(){
    	$(".shopping_extend").stop(true,false);
    	$(".shopping_extend").animate({"height":"0px"},200,function(){$(".shopping a").css("background-color", "");});
    });
	//搜索框默认显示/聚焦隐藏
	$(".input").focus(function() {
		$(".input").val("").css("outline","none")
	}).blur(function() {
		$(".input").val("小米项目官网")
	});
	//头部菜单下拉隐藏
	$(".header_mid ul li a").mouseover(function(){
		$(".header_footer").stop(true,false);
		$(".header_footer").slideDown();
		$(".header_footer").children().hide();
		$(".header_footer").children("."+$(this).data("type_extend")).show();
	});
	$(".header_mid").mouseleave(function(){
		$(".header_footer").stop(true,false);
		$(".header_footer").slideUp();
	});
	$(".header_footer").mouseover(function(){
		$(".header_footer").stop(true,false);
	});
	$(".header_footer").mouseleave(function(){
		$(".header_footer").stop(true,false);
		$(".header_footer").slideUp();
	});
	//左侧菜单栏弹出隐藏/样式改变		
	var index = 0;
	var $pages = $(".home_main_menu").children(".home_main_menu_left").find("li");
	$(".home_main_menu").children(".home_main_menu_left").find("li").hover(function() {
			index = $pages.index($(this));
			$(".home_main_menu_right").children(".b-item").eq(index).show().addClass("b-item-show").siblings().hide().removeClass("b-item-show");
			$(this).css("background-color", "orange").siblings().css("background-color", "");
			$(".b-item-show").hover(function() {
				$(".b-item-show").show()
			}, function() {
				$(".b-item-show").hide();
			});
		},
		function() {
			$(".home_main_menu_right").children(".b-item").eq(index).hide();
			$(this).css("background-color", "");
		});
	//home图片轮播功能
	var $num=$(".home_pic_num ul li a");
	var picw=992;
	var ride=0;
	$num.eq(0).css("background-color","red");
	$num.click(function(){
		ride=$(this).data("subscript");
		$num.css("background-color","");
		$(this).css("background-color","red");
		$(".home_pic_play ul").stop(true,false);
		$(".home_pic_play ul").animate({left:-ride*picw+"px"},300);
	});
	$(".pic_prev").click(chose("prev"));
	$(".pic_next").click(chose("next"));
	function chose(chosen){
		return function(){
			switch(chosen){
				case "prev": ride==0?ride=0:ride--;
				break;
				case "next": ride==3?ride=3:ride++;
				break;
			}
			$num.css("background-color","");
			$num.eq(ride).css("background-color","red");
			$(".home_pic_play ul").stop(true,false);
			$(".home_pic_play ul").animate({left:-ride*picw+"px"},300);
		};
	};
//	var a = 1;
//	var b = 4;
//	var index = 0;
//	var d = a - index + 1;
//	var f = 0;
//	var $page = $(".home_pic_num ul").children("li");
//	$page.eq(index).css("background-color", "blue").siblings().css("background-color", "#949292");
//	$(".pic_next").click(function() {
//		if(a == b) {
//			return false;
//		} else {
//			if(!$(".home_pic_play ul").is(":animated")) {
//				$(".home_pic_play ul").animate({
//					left: "-=" + 992+"px"
//				});
//				a++;
//				index++;
//			}
//		}
//		$page.eq(index).css("background-color", "blue").siblings().css("background-color", "#949292");
//	});
//	$(".pic_prev").click(function() {
//		if(a == 1) {
//			return false;
//		} else {
//			if(!$(".home_pic_play ul").is(":animated")) {
//				$(".home_pic_play ul").animate({
//					left: "+=" + "992px"
//				});
//				a--;
//				index--;
//			}
//		}
//		$page.eq(index).css("background-color", "blue").siblings().css("background-color", "#949292");
//	});
	//明星产品图片轮播
	var e=1;
	$(".btn_left").click(function() {
		if(e == 2) {
			return false;
		} else {
			if(!$(".star_pic ul").is(":animated")) {
				$(".star_pic ul").animate({
					left: "-=" + "1200px"
				});
				e++;
			}
		}
	});
	$(".btn_right").click(function() {
		if(e == 1) {
			return false;
		} else {
			if(!$(".star_pic ul").is(":animated")) {
				$(".star_pic ul").animate({
					left: "+=" + "1200px"
				});
				e--;
			}
		}
	});
	//配件上拉效果
	$(".pic_extend").mouseover(function(){
        $(this).children("div").stop(true,false);
        $(this).children("div").animate({"bottom":"0px"},100);
    });
    $(".pic_extend").mouseleave(function(){
        $(this).children("div").stop(true,false);
        $(this).children("div").animate({"bottom":"-110px"},100);
    });
    $(this).mouseover(function(){
    	$(this).children("div").stop(true,false);
    });
    $(".shopping_extend").mouseleave(function(){
    	$(this).children("div").stop(true,false);
    	$(this).children("div").animate({"bottom":"-110px"},100);
    });
	//内容图片轮播
	var $nuli=$(".content_btn li");
	$nuli.click(function(){
		var subscript=$(this).data("subscript");
		$(this).siblings().css("background-color","");
		$(this).css("background-color","red");
		$(this).parent().prev().stop(true,false);
		$(this).parent().prev().animate({left:-290*subscript+"px"},300);
	});
});