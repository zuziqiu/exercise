/**
 * @author [xin]
 * @version [0.0.1]
 * @module [轤ｹ謦ｭ讓｡蝮余
 */
define(function(require, exports, module){


	moduleSetting = {

		room : null,

		//文字互动
	    modTextLive: function(){
	    	var H5Text = window.modules_config.mod_playbackinfo_playback,
	    		that = this;
	    		if(H5Text){
	    			if( H5Text.enable == 1){
	    				//H5Text.config.chat.enable = "0"
	    				if( H5Text.config.chat.enable == "0"){
	    					//that.room.changeTab('chapter');
	    					$('#tab_chat').hide();
	                        $('#chat').hide();
	    				}
	    				if( H5Text.config.qa.enable== "0"){
	    					$('#tab_ask').hide();
	                        $('#ask').hide();
	    				}
	    			}else {
    					$('#tab_chat').hide();
    					$('#tab_ask').hide();
                        $('#chat').hide();
                        $('#ask').hide();
                        //that.room.changeTab('chapter');
	    			}
	    			
	    		}
	    },

		setSkin: function(){
			var moduleConfig = window.modules_config;
			if( moduleConfig && moduleConfig.mod_visitoraction_playback){
				if(moduleConfig.mod_visitoraction_playback.enable == "1"){
					require.async("../../../common/css/h5-skin/live-darkBlue.css");
				}
			}
		},

		init: function(room){
			var that = this;
				//that.setSkin();
				that.room = room;
				that.modTextLive();

		}
	};

	module.exports = moduleSetting;
});