"use strict";
/**
 * author:Marko xin;
 * version:v1.1.1.0;
 * uesfor: live.html(用于初始化渲染)
 * HTSDK 模块判断
 * 判断方式：先判断一个整体的模块功能是否开启，再判断模块功能下的其他子类小模块功能。
 * 且if...else if...else...成对出现，最后else 不执行任何方法。只作为方便代码的维护。
 */
var HTSDK = window.HTSDK || {};

HTSDK.modules = {
	
	// 具体模块拆分对象
	moduleBlocks: {},

	// 请求数据.获取模块
	modulesGetData: function(callback){
		//this 指向顶层，HTSDK.modules
		var that = this;
		$.ajax({
			type: "get",
			url: protocol+"open.talk-fun.com/live/init.php", 
			dataType: "jsonp",
			data: {
				access_token: window.access_token
			},
			success:function(ret){
				if(ret.code === 0){
					var modules = ret.modules;
					that.set(modules);
					callback(that.moduleBlocks);
				}
			}	
		});
	},
	// 模块切割(设置模块)
	set: function (modules) {
		var that = this;
		if(typeof(modules) !== "undefined"){
			for (var i in modules) {
				that.moduleBlocks[i] = modules[i];
			};
		}else{
			//do nothing
		}
	},
	// 获取模块(通过id this.modulesBlocks["name"])
	get: function(id) {
		return this.moduleBlocks[id] || false;
	},
	//判断模块
	judgeModules: function(){
		var that = this;
		//回调
	  	HTSDK.modules.modulesGetData(function(data){
	  		that.render(data);
	  	});
	},
	//模块判断执行
	render: function(ret){
		alert(ret);
		//拿到modules 对象里的值
		this.logo();
		this.logout();
		this._text();
		this.liveinfo();
		this.footer();
		this.application();
		this.information();
	},

	/*左侧 ———Start*/
	//logo功能
	logo: function(){
		var __modLogoEnable = HTSDK.modules.get("mod_logo_live").enable,
			__modLogoImg = HTSDK.modules.get("mod_logo_live").config.logo,
			__modLogoLink = HTSDK.modules.get("mod_logo_live").config.logoLink;
			if(__modLogoEnable == "1"){
				$(".head").show();
				$(".head").html("<a class='logo' target=_blank href='"+__modLogoLink+"'><img src='"+__modLogoImg+"' /></a>");
			}else if(__modLogoEnable == "0"){
				$(".head").hide();
			}else {
				//do nothing
			}
	},
	//主播信息功能
	information: function(){
		var __modInfoEnable = HTSDK.modules.get("mod_zhuboinfo_live").enable,
			__modInfoFlower = HTSDK.modules.get("mod_zhuboinfo_live").config.flowers.enable,
			__modIntro = HTSDK.modules.get("mod_zhuboinfo_live").config.intro.enable,
			__modName = HTSDK.modules.get("mod_zhuboinfo_live").config.name.enable,
			__modPortrait = HTSDK.modules.get("mod_zhuboinfo_live").config.portrait.enable,
			__modScore = HTSDK.modules.get("mod_zhuboinfo_live").config.score.enable;
			if(__modInfoEnable == "0"){
				$(".mod_user_info img").hide();
			}else {
				//do nothing 
			}
	},

	/*左侧 ———End*/

	/*中部 ———Start*/
	//退出功能
	logout:function(){
		var __modLogoutEnable = HTSDK.modules.get("mod_logout_live").enable,
			__modLogOutUrl = HTSDK.modules.get("mod_logout_live").config.logOutUrl;
			if(__modLogoutEnable == "1"){
				if(__modLogOutUrl == ""){
					$(".mod_head i a").remove();
					$(".mod_head i").on('click',function(){
							window.close();
					});
				}else{
					$(".mod_head i").show();
					$(".mod_head i").html("<a target=_blank style='width:13px;height:14px; float:left;' href='"+__modLogOutUrl+"'></a>");
					//当退出的链接为空的时候，即功能为关闭窗口；
				}
			}else if(__modLogoutEnable == "0"){
				$(".mod_head i").hide();
			}else{
				//do nothing
			}
	},

	/*底栏功能*/
	footer:function(){
		var __modFooterEnable = HTSDK.modules.get("mod_footer_live").enable,
			__modFooterHeight = HTSDK.modules.get("mod_footer_live").config.footerHeight;
			//console.info(__modFooterEnable,__modFooterHeight);
			if(__modFooterEnable == "1"){
				$(".mod_footer").show();
				$(".mod_footer").css('height',__modFooterHeight);
			}else if(__modFooterEnable == "0"){
				$(".mod_footer").hide();	
			}else{
				//do nothing
			}
	},

	//直播信息
	liveinfo: function(){
		var __modLiveinfoEnable = HTSDK.modules.get("mod_liveinfo_live").enable,
			__modLiveTimeEnable = HTSDK.modules.get("mod_liveinfo_live").config.liveTime.enable,
			__modThemeEnable =  HTSDK.modules.get("mod_liveinfo_live").config.theme.enable;
			if(__modLiveinfoEnable == "1"){
				if(__modLiveTimeEnable == 1){
					$("#live_time").show();
				}else if(__modLiveTimeEnable == 0){
					$("#live_time").hide();
				}else {
					//do nothing
				}
			}else if(__modLiveinfoEnable == "0"){
				$("#live_time").hide();
			}else{
				//do nothing
			}
	},
	/*中部 ———End*/

	/*右侧 用户应用 ———Start*/
	//鲜花功能————右侧
	application: function(){
		//先判断这个功能模块的是否开启，再判断config下包含的类目
		var __modUserApplication = HTSDK.modules.get("mod_visitoraction_live").enable,
			__modEvaluateEnable = HTSDK.modules.get("mod_visitoraction_live").config.evaluate.enable,
			__modSendFlowerEnable = HTSDK.modules.get("mod_visitoraction_live").config.sendFlower.enable;
			if(__modUserApplication == "1"){
				if(__modSendFlowerEnable == 0){
						$(".flower_btn").hide();
				}else if(__modSendFlowerEnable == 1){
						$(".flower_btn").show();
				}
			}else if(__modUserApplication == "0"){
				$(".flower_btn").hide();
			}else{
				//do nothing
			}
	},

	/*右侧 ———End*/

	//文字互动模块
	_text: function(){
		var __modTextEnable = HTSDK.modules.get("mod_text_live").enable,
			__modChatEnable = HTSDK.modules.get("mod_text_live").config.chat.enable,
			__modQaEnable = HTSDK.modules.get("mod_text_live").config.qa.enable;
			if(__modTextEnable == "1"){
				if(__modChatEnable == 1){
					$(".tab_n1").show();
				}else if(__modChatEnable == 0){
					$(".tab_n1").hide();
					$(".chat_tab_box").hide();
					$(".mod_chat_scroller").hide();
					$("#mod_chat_post").hide();
					$(".tab_n2").css('width','100%');
					$(".tab_n2").addClass("current");
					$(".membe_height").css('display','block');
					}else{
						//do nothing
					}
					if(__modQaEnable == 1){
						$("#mod_questions").show();
						$(".mod_question_post").show();
					}else if(__modQaEnable == 0){
						$("#mod_questions").hide();
						$(".mod_question_post").hide();
					}else{
						//do nothing
					}
				}else if(__modTextEnable == "0"){
					alert("222");
					$("#mod_col_main").addClass('r_hide l_hide');
					$("#mod_col_left").addClass("col_left_hide")
					$("#mod_col_right").hide();
					$(".carousel").hide();
				}else{
					//do thing
				}
	},
	//入口
	init:function(){
		var _ts = this;
		_ts.judgeModules();
	}
}
//执行
$(function(){
	HTSDK.modules.init();
});