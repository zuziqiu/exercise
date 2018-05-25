"use strict";
/**
 * author:xin
 * version: v1.1.0
 */
var HTSDK = window.HTSDK || {};

HTSDK.live = {

	datas: {},

	modules: {},

	// 设置源模块
	setModules: function(mods){
		this.modules = mods;
		this.render();
	},

	// get modules by id
	getter: function(id){
		
		if(window.modules_config[id]){
			return {
				enable: (window.modules_config[id].enable) == 1 ? true : false,
				data: window.modules_config[id]
			}
		}else{
			return {
				enable: false,
				data: null
			};
		}
	},

	// 设置开关(#0 => 关 | #1 => 开)
	setClass: function(mod, state){
		
		var $body = $("body"),
			_class = $(".m-" + mod + state);
		
		// 添加模块类
		if(!$body.hasClass(_class)){
			$body.addClass("m-" + mod + "-" + state);
		}
	},

	// 渲染
	render: function(){
		
		var mod = this.modules,
			$body = $("body");
		
		// logo?
		var logo = this.getter("mod_logo_live");
		if(!logo.enable){
			this.setClass("logo", logo.data.enable);
		}

		// chat & memberlist
		var chat = this.getter("mod_text_live");
		var memberlist = this.getter("mod_visitorinfo_live");
		
		// 右侧关闭
		if(!chat.enable || this.getter("mod_text_live").data.config.chat.enable == 0){
			this.setClass("right", "0");
			// 收缩右侧删除
			$(".carousel.right").remove();
		}else{
			this.setClass("chat", chat.data.enable);
			this.setClass("memberlist", memberlist.data.enable);
		}

		// 聊天
		if(!chat.enable){
			// $(".tab_change .tab_n1").remove();
			// $(".chat_wrap").remove();
		}

	},

	// set data in body
	setData: function(key, value){
		this.datas[key] = value.toString();
		$("body").data(key, value);
	},

	getData: function(id){
		return this.datas[id];
	},

	// 鲜花功能
	_liveFlower:function(){
		var appData = HTSDK.modules.application("mod_visitoraction_live");
		if(appData.enable == "1"){
			if(appData.sendFlower == 1){
				$(".flower_btn").show();
			}else{
				$(".flower_btn").hide();
			}
		}
		if(appData.enable == "0"){
			$(".flower_btn").hide();
		}
	},
	
	// 退出功能
	_liveOut:function(){
		var outData = HTSDK.modules.logout("mod_logout_live");
		if(outData.enable == "1"){
			$(".live_uinfo i").show();
			if(outData.logOutUrl == ""){
				$(".live_uinfo i ").hide();
			}else{
				$(".live_uinfo i").show();
				$(".live_uinfo i").html('<a id="mod_leave_room" style="width:13px;height:14px; float:left;" href="'+outData.logOutUrl+'"></a>');
			}
		}else if(outData.enable == "0"){
			$(".live_uinfo i").hide();
		}
	},

	// 直播用户信息
	_liveinfo:function(){
		var _infoData = HTSDK.modules.liveinfo("mod_liveinfo_live");
			//直播时间
		if(_infoData.enable == "1"){
			$(".mod_head").show();
			//直播时间
			if(_infoData.liveTime == 1){
				$("#live_time").show();
			}else{
				$("#live_time").hide();
			}
			//直播信息
			if( _infoData.Theme == 0){
				setTimeout(function(){
					$('#live_title').html("");
				},1000);	
			}
		//主题
		}else{
			setTimeout(function(){
				$('#live_title').html("");
			},1000);	
			$("#live_time").hide();
		}
	},
	
	// 主播信息
	_zhuboinfo: function(){
		var _zhuboData = HTSDK.modules.information("mod_zhuboinfo_live");
		
		// 直播信息
		if(_zhuboData.mationEnable == "1"){
			
			// que_config
			var que_config = "";

			//针对特殊的合作做处理
			if(que_config.indexOf(window.partner_id)>-1){
				$(".mod_user_info").hide();
			}else{
				$(".mod_user_info").show();
			}	
		}
		
		// 直播状态
		if(_zhuboData.mationEnable == "0"){
			$(".mod_user_info").hide();
			$(".mod_sider_top").css("height",0);
			$(".mod_sider_top").addClass("camera");
			$(".mod_question_wrap .mod_ques_hall").css("top",90);
		}
	},
	
	// logo功能
	_logo: function(){
		var that = this,
			_logoData = HTSDK.modules.getlogo("mod_logo_live");

		if(_logoData.enable == "1"){
			
			//第三方直播  logo  
			var third = HTSDK.room.roomSet.thirdRtmp;

			// 替换资源
			if(window.TF_getStaticHost){
				_logoData.logoImgUrl = window.TF_getStaticHost(_logoData.logoImgUrl);
			}

			if(third == 1){
				$("#mod_col_right").append("<div class='head'><a class='logo' target=_blank href='"+_logoData.logolink+"'><img src='"+_logoData.logoImgUrl+"' /></a></div>").addClass('third');
			}else{
				$(".head").html("<a class='logo' target=_blank href='"+_logoData.logolink+"'><img src='"+_logoData.logoImgUrl+"' /></a>");
			}
		}
		if(_logoData.enable == "0"){
			$(".head").hide();
			$('.col_left_side').addClass('logo_hide');
		}

		that.setData("logo", _logoData.enable);

	},
	//左侧隐藏 屏幕铺左
	_left: function(){
		//logo
		var _logoData = HTSDK.modules.getlogo("mod_logo_live").enable,
			//问答
			_modQaEnable = HTSDK.modules.get("mod_text_live").config.qa.enable,
			//问答聊天
			_modTextEnable = HTSDK.modules.get("mod_text_live").enable,
			//主播信息
			_zhuboData = HTSDK.modules.information("mod_zhuboinfo_live").mationEnable,
			//直播pc摄像头
			_pcLiveCamera = HTSDK.modules.getlogo("44").enable;
			
		if( _zhuboData == "0" && _logoData == "0" && _pcLiveCamera == "0"){

			if(_modTextEnable == "0"){
				$('.carousel.left').hide();
				
				$('#mod_col_main .mod_head').css('left','10px');
				$('#mod_col_main .mod_main_player_wp').css('left','10px');
				$('#mod_col_main .mod_footer').css('left','10px');
			}else if(_modTextEnable == "1"){
				if(_modQaEnable == "0"){
					$('.carousel.left').hide();
					$('#mod_col_main .mod_head').css('left','10px');
					$('#mod_col_main .mod_main_player_wp').css('left','10px');
					$('#mod_col_main .mod_footer').css('left','10px');

				}
			}
		}
	},
	
	// 聊天
	_textInt: function(){
		
		var _modTextEnable = HTSDK.modules.get("mod_text_live").enable,
			_modChatEnable = HTSDK.modules.get("mod_text_live").config.chat.enable,
			_modQaEnable = HTSDK.modules.get("mod_text_live").config.qa.enable;
			
		//文字互动--关
		if(_modTextEnable == 0){
			$("#mod_col_main").addClass('r_hide l_hide');
			$("#mod_col_left").addClass("col_left_hide")
			$("#mod_col_right").hide();
			$(".carousel right").hide();
			$(".carousel").hide();
			//问答
			$("#mod_questions").hide();
			$('.mod_question_post').hide();

			$('#mod_col_main .mod_head').css('right','10px');
			$('#mod_col_main .mod_main_player_wp').css('right','10px');
			$('#mod_col_main .mod_footer').css('right','10px');
		}
		//文字互动--开
		if(_modTextEnable == 1){
			//聊天
			if(_modChatEnable == "1"){
				$('#mod_col_right').show();
				$('.carousel.right').show();
			}else if(_modChatEnable == "0"){
				$("#mod_col_main").addClass('r_hide l_hide');
				$("#mod_col_left").addClass("col_left_hide")
				$("#mod_col_right").hide();
				$(".carousel right").hide();
				$('#mod_col_main .mod_head').css('right','10px');
				$('#mod_col_main .mod_main_player_wp').css('right','10px');
				$('#mod_col_main .mod_footer').css('right','10px');
			}
			//问答
			if(_modQaEnable == "1"){
				$('#mod_col_left').show();
				$('.carousel.left').show();
			}else if( _modQaEnable == "0"){
				$("#mod_questions").hide();
				$('.mod_question_post').hide();
			}
		}else{
			//聊天为0右边屏幕拉伸
			$('.carousel.right').hide();
			$('#mod_col_main .mod_head').css('right','10px');
			$('#mod_col_main .mod_main_player_wp').css('right','10px');
			$('#mod_col_main .mod_footer').css('right','10px');
			//doNothing
		}
		this.setData("chat", _modTextEnable);
	},

	//底栏
	_footer: function(){
		var _modFooterEnable = HTSDK.modules.get("mod_footer_live").enable,
			_modFooterHeight = HTSDK.modules.get("mod_footer_live").config.footerHeight;
		if(_modFooterEnable == "1"){
			$(".mod_footer").show();
			$(".mod_footer").css('height',_modFooterHeight);
		}else if(_modFooterEnable == "0"){
			$(".mod_footer").hide();	
		}else{
			//do nothing
		}
	},
	
	// 用户列表
	_visInfo:function(){
		var _modVisEnable = HTSDK.modules.get("mod_visitorinfo_live").enable,
			_modListEnable = HTSDK.modules.get("mod_visitorinfo_live").config.visitorList.enable,
			_modCountEnable = HTSDK.modules.get("mod_visitorinfo_live").config.visitorCount.enable;
		if(_modVisEnable == 1){
			$('.tab_n2').show();
		}
		if(_modVisEnable == 0){
			$('.tab_n2').hide();
			$('.tab_n1').css('width',"298px");
			$('.tab_n1 span').css('text-align','center');
			$('.tab_n1').removeClass("current");
		}
		if(_modCountEnable == 0){
			$('.tab_n2 #members').remove();	
		}
		this.setData("memberlist", _modVisEnable);
	},

	//打赏
	rewardStatus: function(){
		var rewardEnable = HTSDK.modules.get('module_reward_live').enable;
		
			if( rewardEnable == "1"){
				$(".reward_btn").show();
			}else {
				$(".reward_btn").hide();
			}
	},

	// 公告，投票，滚动通知，等...
	_plugins: function(){
		var plugins = HTSDK.modules.get("mod_zhuboaction_live");
	},

	_alerror:function(){
		// loading mask
		setTimeout(function(){
			$("#mod_mask").fadeOut();
			$("#left_mask").fadeOut();
		}, 300);
	},

	//第三方直播
	_thirdPartners:function(){
		var third = HTSDK.room.roomSet.thirdRtmp;
		if(third == 1){
			HTSDK.view.roomView.toggleFlex($('.carousel').eq(0));
			$('#mod_col_main .carousel').eq(0).hide();
			$('#room').addClass('close_left_side thirdLogoStyle');
			$('.head').addClass('third_head');
		}
	},
	//ppt区域图片修改
	_pptImage:function(){
		if(!HTSDK.room.roomSetMsg['module_ppt_image']){
			return false;
		}
		var __modPptEnable = HTSDK.room.roomSetMsg['module_ppt_image'].enable,
			__modPptImageUrl = HTSDK.room.roomSetMsg['module_ppt_image'].config.pptImage;
		if(__modPptEnable == "1"){
			if(__modPptImageUrl){
				$('#mod_live_preview').css({'background-image':'url('+__modPptImageUrl+')','background-size':'100% 100%}'}).addClass('has_diy');
			}
		}else{
			//do nothing
		}
	},
	//课前课后聊天 mod_afterclass_live mod_beforeclass_live
	_classChat:function(){

		var action = HTSDK.room._HT.getLiveState();

		// 课前
		if(!this.getter("mod_beforeclass_live").enable){
			// todo...
		}
		// 课后
		if(this.getter("mod_afterclass_live").enable){
			// todo...
		}

		if(!this.getter("mod_afterclass_live").enable){
			return false;
		}
		var afterLesson = HTSDK.modules.get("mod_afterclass_live").enable,
		    isAfter = HTSDK.modules.get("mod_afterclass_live").config.chat.enable,
		    isBefore = HTSDK.modules.get("mod_beforeclass_live").config.chat.enable,
			beforeLesson = HTSDK.modules.get("mod_beforeclass_live").enable;

		// 课后
		if(action == "stop" ){
			if( afterLesson == '1' && isAfter == '1'){
		        return true ;
		    }else {
		    	return false ;
		    }
		}
		// 课前
		else if(action == "wait" ){
		    if( beforeLesson == '1' && isBefore == '1'){
		        return true ;
		    }else {
		    	return false ;
		    }
		}
	},
	//执行
	init: function(){
		
		var that = this;
		
		// init all modules
		try{
			that._liveFlower();
			that._pptImage();
			that._logo();
			that._liveOut();
			that._liveinfo();
			that._zhuboinfo();
			that._textInt();
			that._visInfo();
			that._plugins();
			that._thirdPartners();
			that._left();
			that.rewardStatus();
		}catch(e){
			that._alerror();
		}

		that._alerror();

		//loader %
	}
};
//总入口