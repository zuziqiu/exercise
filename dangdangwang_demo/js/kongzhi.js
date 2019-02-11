$(function($){
	$("#menu_one").mouseenter(function(){
		$("#dd_menu_down").slideDown(1000);
	}).mouseleave(function(){
		$("#dd_menu_down").slideUp(1000);
	});
//	关闭广告
   	$(window).scroll(function(){
        var st = $(this).scrollTop()+50;
        $("#right").css("top",st);
    });
	$("#dd_close").click(function(){
		$(".right").hide();
	});
	//图片轮换
	function changeImg(){
		var index=0;
		var stop=false;
		var $li=$("#main_mid_top_start").find("#main_mid_top_pic").children("li");
		var $page=$("#main_mid_top_start").find("#main_mid_top_num").children("li");
		$page.eq(index).addClass("main_mid_top_start_over").stop(true,true).siblings().removeClass("main_mid_top_start_over");
		$page.mouseover(function(){
			stop=true;
			index=$page.index($(this));
			$li.eq(index).stop(true,true).fadeIn().siblings().fadeOut();
			$(this).addClass("main_mid_top_start_over").stop(true,true).siblings().removeClass("main_mid_top_start_over");
		}).mouseout(function(){
			stop=false;
		});
		  setInterval(function(){
            if(stop) return;
            index++;
            if(index>=$li.length){
                index=0;
            }
            $li.eq(index).stop(true,true).fadeIn().siblings().fadeOut();
            $page.eq(index).addClass("main_mid_top_start_over").stop(true,true).siblings().removeClass("main_mid_top_start_over");
        },3000);
	}
	changeImg();
	$(".book_tab").children(".book_new").find("[id]").mouseover(function(){
		var id="#book_"+$(this).attr("id");
		$(".book_tab").children("#wocao").find("[id]").hide();
		$(id).show();
		$(this).addClass("gaibian").siblings().removeClass("gaibian");
	});
	$("#wocao").children("#book_class").find("dd").mouseover(function(){
		$(this).css("border","2px solid #F96");
		}).mouseout(function(){
        	$(this).css("border","2px solid #FFFFFF");
	});
	  function movedome(){
        var marginTop=0;
          var stop=false;
        var interval=setInterval(function(){
              if(stop) return;
            $(".book_roll_one").children("li").first().animate({"margin-top":marginTop--},0,function(){
                var $first=$(this);
                if(!$first.is(":animated")){
                    if((-marginTop)>25){
                        $first.css({"margin-top":0}).appendTo($(".book_roll_one"));
                        marginTop=0;
                    }
                }
            });
        },50);
        $(".book_roll_one").mouseover(function(){
            stop=true;
        }).mouseout(function(){
            stop=false;
        });
    }
    movedome();
});


