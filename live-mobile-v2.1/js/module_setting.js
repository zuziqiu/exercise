//模块设置
"use strict";

define(function(require, exports, module){
	var TMOD = require("TMOD");

	var moduleSetting = {
		
		skinTemplate: 1,
	    //loadmodule
	    loadModules: function(modules){

	    	var rewardModule = this.hasModules(modules.module_reward_live) || false; // 打赏

		    	if(rewardModule){
		    		//打赏判断
		    		if( rewardModule.enable == "1"){
				        $(".post_con").removeClass("hide");        
		    		}else{
				        $(".post_con").addClass("hide");
		    		}
		    	}
	    },

	    loadVisitinfoMode: function(modules){
	    	var pvAll = this.hasModules(modules.mod_visitorinfo_live) || false; //访客信息
	    	
    		//访客人数
    		if(pvAll){
	    		if( pvAll.enable == "1" ){
		    		if( pvAll.config.visitorCount.enable == "1"){
		    			$(".online_total").show();
		    		}else{
		    			$(".online_total").hide();
		    		}
		    	}else{
		    		$(".online_total").hide();	
		    	}
	    	}
	    },

	    loadSkin: function(modules){
	    	var H5Skin = this.hasModules(modules.mod_mobile_style_live) || false; //皮肤信息
	    		if(H5Skin){
	    			if( H5Skin.config.template == "2"){
	    				moduleSetting.skinTemplate = 2;
	    				require.async("../../../common/css/h5-skin/live-darkBlue.css");
	    			}else{
	    				moduleSetting.skinTemplate = 1;
	    			}
	    		}

	    },

	    //判断是否存在
	    hasModules: function(modules){
	    	if(modules){
	    		return modules;
	    	}else{
	    		return null;
	    	}
	    },

    	//文字互动
        modTextLive: function(modules){
        	var H5Text = this.hasModules(modules.mod_text_live) || false; 
        		if(H5Text){
        			if( H5Text.enable == 1){
        				if( H5Text.config.chat.enable == "0"){
        					$('#tab_chat').hide();
                            $('#chat').hide();
        				}

        				if( H5Text.config.qa.enable== "0"){
        					$('#q_ask').hide();
                            $('#ask').hide();
        				}
        			}else {
        					$('#tab_chat').hide();
        					$('#q_ask').hide();
                            $('#chat').hide();
                            $('#ask').hide();
                            
        			}
        			
        		}
        },
        hasPpt : function (modules) {
        	var modulePptImage = modules.module_ppt_image;
        	if(this.hasModules(modulePptImage)){
        		return {
        			pptImage : modulePptImage.config.pptImage,
        			pptEnable : modulePptImage.enable
        		}
        	}
        },

        hasDefaultImg: function(modules){
			if(modules.module_ppt_image){
				if(modules.module_ppt_image.enable == 1){
					var str = '<img src="'+modules.module_ppt_image.config.pptImage+'"/>';
					$("#priview_mask").append(str);
					$("#priview_mask").show();
				}

			}
        },

	    init: function(modules){
	    	var that =  this;
	    		that.loadVisitinfoMode(modules);
	    		that.loadModules(modules);
	    		that.loadSkin(modules);
	    		that.modTextLive(modules);
	    		that.hasDefaultImg(modules);
	    }

	};
	module.exports = moduleSetting;
});