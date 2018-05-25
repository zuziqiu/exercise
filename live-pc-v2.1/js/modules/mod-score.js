/**
 * Score 评分
 */
(function(win){
	var modBlock = "score";
	//评分
	var score = {
	    bindEvents: function(){
	        var $pop_layer = $("#pop_layer"),
	            $pop_score = $(".pop_score"),
	            $close = $pop_score.find(".pop_close"),
	            $dl_cont = $(".pop_socre_bd dl");
            
            //var iStar = 0;
            $close.on("click",function(){
                $pop_score.hide();
                $pop_layer.hide();
            });
            $(".pop_score_con").on("click",".cls_btn", function(){
                $(".pop_score_con").hide();
            })
	    },
	    init: function(){
	        var that = this;
            that.bindEvents();
            MTSDK.admin.score.init();
	    }
	}

	// 暴露
	var HTSDK = win.HTSDK || {};
	HTSDK.score = score;

})(window);
