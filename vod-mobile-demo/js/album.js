//author: lianghua
//time: 2016-08-29
//用途：方法模块
define(function(require, exports, module){
	
	var album = {

		autoJumpTimer: null,

		// 是否存在剪辑
		isAlbum : false,

		//判断专辑是否存在
		isHasAlbum: function(){
			var _that = this;
			if($('#albums').length > 0){
				_that.isAlbum = true;
		        $("#tab_albums").show();
	    	}else{
	    		$("#tab_albums").hide();
	    	}
		},

		//专辑跳转
		alautoJumNext: function(duration, currentTime){
			var _that = this;
			// body...
	        if(_that.isAlbum ){
	            var nowTime = duration - currentTime,
	                clip_list = $("#album_ul li"),
	                liveClipIndex = null;

	                clip_list.each(function(){
	                    if($(this).hasClass('cur')){
	                        liveClipIndex = $(this).index()+1;
	                    }
	                });
	            // 30秒自动跳转下一个
	            if( nowTime <= 30 && liveClipIndex != clip_list.size()){
	                if(!_that.autoJumpTimer){
	                    if($('body').find('.jump_clip').size() <= 0){
	                        //是否横屏
	                        if(plugins.isMobileStatus() === "horizontal"){
	                            $('body').append("<div class='jump_clip cross'>即将为您播放下一章节...</div>");
	                        }else {
	                            $('body').append("<div class='jump_clip vertical'>即将为您播放下一章节...</div>");
	                        }
	                        _that.autoJumpTimer = setTimeout(function(){
	                            $('.jump_clip').hide();
	                        }, 5000);
	                    }else{
	                        $('.jump_clip').show();
	                        _that.autoJumpTimer = setTimeout(function(){
	                            $('.jump_clip').hide();
	                        }, 5000);
	                    }
	                }
	                if(Math.floor(duration) <= currentTime){
	                    var nextClipUrl = $("#album_ul li[class='cur']").next().find('a').attr('href');
	                    window.location.href = nextClipUrl;
	                }
	            }
	            else{
	                if(_that.autoJumpTimer){
	                    clearTimeout(_that.autoJumpTimer);
	                    _that.autoJumpTimer = null;
	                    if($('.jump_clip').size() > 0){
	                        $('.jump_clip').hide();
	                    }
	                }
	            }
	        }

		},

		init: function(){
			var that = this;
		}
	};
	//暴露
	module.exports = album;
});