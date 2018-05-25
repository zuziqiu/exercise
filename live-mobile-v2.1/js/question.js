/**
 * @name question.js
 * @note 问答模块
 * @author [liagh]
 * @version [v1.0.1]
 */

define(function(require, exports, module) {

    // 模版
    var TMOD = require("TMOD"),
    	plugins = require("./plugins"),
		config = require("./global.config");
   /* var room = require("./room");*/
    // 问答模块
    var question = {
        // 发表限制
		sendTimeLimit: 2000,
		// 是否可回答
		canSend: true,

		//加载状态
		isLoad: false,

		_MT: null,
		// 父容器
		$target: $("#ask"),
		// 事件绑定
		events:[

		    {"click": ["#mod_ques_post .qsend", "emitQues"]}, // 发表问题
			{"keydown": ["#mod_ques_post textarea", "postQues"]}, //问答
			{"keyup" : ["#mod_ques_post textarea", "quesFocus"]}, //焦点
			//焦点
			{
				"focus": ["#mod_ques_post textarea", "onQuesFire"]
			},
			{
				"blur": ["#mod_ques_post textarea", "onQuesFire"]
			}
		],

		  // 绑定
        binds: function(){
            var that = this;
            MT.tools.bindEvent(that.$target, that, that.events);
        },


         //处理返回来的广播指令
	    dealCallback: function(string, ret){
	        var meId = MT.me.xid,
	            dealId = ret.qid,
	            that = this;
	            //删除
	            if( string == "delete"){
	                if(!$("#que_"+ret.qid).hasClass("xid_"+MT.me.xid)){
	                    $("#que_"+dealId).remove();
	                }
	            }
	            //通过后的操作
	            if( string == "audit"){
	            	if(MT.me.role != "admin" && MT.me.role != "spadmin"){
	            		if(!$("#que_"+ dealId).size()>0){
	                        that.onQask(ret,'audit');
	                    }
	            	}
	            }

	    },

		// 发布提问
		postQues: function(e){
			if(e.keyCode === 13){
				e.preventDefault();
				question.emitQues();
				return false;
			}
		},


		sHeight: window.document.body.scrollHeight,
		setScrollTopTimeFlag: null,
		// hack keyboard top
		onQuesFire: function (e) {
			var that = this
				setScrollTimes = 0; 
			if (plugins.isIos()) {
				var h = $("#mod_ques_post").height();
				if (e.type === "focus") {
					var _sTop = ((question.sHeight / 2) + h) + 5;
					if(!plugins.getPlatformInfo().version>=11){
						var _setScrollTop = function() {
							// 第一次优先执行
							window.document.body.scrollTop = _sTop;
							
							// 间隔 150 毫秒, 执行一次以下方法，执行5次
							that.setScrollTopTimeFlag = setInterval(function(){
								var _sTop = ((question.sHeight / 2) + h) + 5;
								window.document.body.scrollTop = _sTop;
								setScrollTimes ++;
							if(setScrollTimes == "5"){
									clearInterval(that.setScrollTopTimeFlag);
								}
							}, 150);
						};
	
						window.setTimeout(function () {
							_setScrollTop()
						}, 200);
					}
					else{
						document.getElementById("mod_ques_post").style.position = "absolute";
					}
				} else {
                    document.getElementById("mod_ques_post").style.position = "fixed";
					$("#mod_ques_post").removeAttr("style");
				}
				// var h = $("#mod_ques_post").height();
				// if (e.type === "focus") {
					
				// 	var _setScrollTop = function() {
				// 		// 第一次优先执行
				// 		var _sTop = ((question.sHeight / 2) + h) + 5;
				// 		window.document.body.scrollTop = _sTop;
						
				// 		// 间隔 150 毫秒, 执行一次以下方法，执行5次
				// 		that.setScrollTopTimeFlag = setInterval(function(){
				// 			var _sTop = ((question.sHeight / 2) + h) + 5;
				// 			window.document.body.scrollTop = _sTop;
				// 			setScrollTimes ++;
				// 			if(setScrollTimes == "5"){
				// 				clearInterval(that.setScrollTopTimeFlag);
				// 			}
				// 		}, 150);
				// 	};

				// 	window.setTimeout(function () {
				// 		_setScrollTop()
				// 	}, 200);

				// } else {
				// 	$("#mod_ques_post").removeAttr("style");
				// }
			}
		},
		// 问答焦点
		quesFocus: function(e){
			$("#mod_ques_post").addClass("touchsend");
			// 聊天焦点
			var target = $("#mode_question_post");
			$("#mod_ques_post").find(".qsend").removeClass("default");
		},
		// 问答区
		question: function(){
			// todo...
			var _ts = this,
				$ques = $('#mode_question_post'),
				$quesHall = $("#question_hall"),
				$replyBtn = $quesHall.find(".re_btn"),
				$quesBtn = $ques.find("button");
			// 发表问题
			$quesBtn.on(windowEvent, function(){
				var $type = $(this).data("type");
				_ts.emitQues();
			});
			// 问题问题
			$quesHall.on(windowEvent, '.re_btn', function(e){
				$quesHall.find('.re_btn').removeClass("active");
				if($(e.target).data("rid")){
					var $rid = $(e.target).data("rid"),
						$nickname = $(e.target).data("nickname");
					$quesBtn.data("type", "reply");
					$quesBtn.data("rid", $rid);
					$ques.find("textarea").attr("placeholder", "回答"+$nickname+"的问题:");
					$(e.target).addClass("active");
				}else{
					var $quesPost = $("#mode_question_post");
					$quesPost.find("textarea").attr("placeholder", "请输入文字...");
					$quesPost.find("button").data("rid", "0");
					$quesPost.find("button").data("type", "ask");
				};
				//_ts.emitQues();
			});
			// 接收问答
			// _ts.onQuestion();
		},
		// 提问
		onQask: function(retval, str){
			var _ts = this,
			$quesPost = $("#mode_question_post"),
			$quesHall = $("#question_inner_hall");
			// 自己，管理员可看
			if(plugins.isAdmin(retval.role) || MT.me.xid == retval.xid || plugins.isAdmin(MT.me.role)){
				retval.isShow = "";
			}else{
				retval.isShow = "hide";
			}
			//末读信息提示
			if(MT.me.xid != retval.xid && $("#q_ask").hasClass("selected")== false){
				if(plugins.isGroups(retval.gid)){
					$("#q_ask .c_num").show();
				}    
            }

            retval.avatar = plugins.setAvatar(retval);
			retval.roleAlias = config.role;

			var tpl = TMOD("tpl_add_ques", retval);
			if(plugins.isGroups(retval.gid)){
				$quesHall.append(tpl); 
		    }

		    //通过
            if(str && str === "audit"){
            	$("#que_"+retval.qid).removeClass("hide");
            }
			plugins.scrollToBottom("question");

			plugins.checkQuesSize();
			/*room.newMessageRemind(1);*/
		},
		// 回复
		onQreq: function(retval){
			var $quesHall = $("#question_inner_hall");
			var q = retval;
			q.roleAlias = config.role;
			var tpl = TMOD("tpl_res_ques", retval);
			$("#que_"+q.replyId).find(".re_list").append(tpl);
			$("#que_"+q.replyId).show();
			plugins.scrollToBottom("question");

			plugins.checkQuesSize();
			/*MTSDK.room.newMessageRemind(1);*/
		},
		// 删除
		delQus: function(retval){
			var qid = retval.qid;
			$(".que_"+qid).remove();
		},

		// 初始化获取问答列表
		getQuestionList: function(){
			var _ts = this,
				$quesHall = $("#question_inner_hall");
			// 未上课不获取问答列表
			var action = MT.getLiveState();
			if(!_ts.isLoad){
				_ts.isLoad = true;
				if(question._MT){
					question._MT.getQuestion(function(retval){
						var d = retval;
						d.roleAlias = config.role;
						d.self_gid = MT.me.gid;
						if(retval.code === 0 && typeof retval.data !== "undefined"){
							var tpl = TMOD("tpl_qulist", d);
							$quesHall.append(tpl);
							plugins.checkQuesSize();
						}
					});
				}
			}
			
		},





		clear: function(){
		// 清空问答列表
			var $quesHall = $("#question_inner_hall");
			$quesHall.html("");
		},
		// 发表问题
		emitQues: function(e){
			e.preventDefault();
			var $ques = $('#mod_ques_post'),
				$quesCon = $ques.find("textarea"),
				$quesVal = $.trim($quesCon.val()),
				$quesHall = $("#question_hall"),
				$button = $ques.find(".qsend"),
				that = question,
				action = MT.getLiveState(),
				type = $ques.find(".qsend").data("type"),
				rid = $ques.find(".qsend").data("rid");
			// action
			if(action !== "start"){
				plugins.showComtip($button, "qsend");
				return false;
			}
			// 发表时间限制
			if(!that.canSend){
				plugins.showComtip($button, "请2秒后再提问...");
				// 2s后取消限制
				if(!that.canSend){
					setTimeout(function(){
						that.canSend = true;
					}, that.sendTimeLimit);
				}
				return false;
			}
			// 禁止重复
			if($quesVal.length === 0){
				plugins.showComtip($button, "请输入内容...");
				return false;
			}
			that.canSend = false;
			// clear content
			$quesCon.val("");
			$quesVal = $quesVal.replace(/\r/g, "");
			// send chat pos
			if(type === "ask"){
				question._MT.emit("question:ask", {"msg": $quesVal}, function(retval){	
					$("#mod_ques_post").addClass("full");
					if(retval.code !== 0){
						plugins.showComtip($button, retval.msg);
					}
					$("#mod_ques_post").find(".qsend").addClass("default");
					$("#mod_ques_post").removeClass("touchsend");
					$quesCon.blur();
				});
			}else if(type === "reply"){
				question._MT.emit("question:reply", {msg: $quesVal, replyId: rid}, function(retval){
					if(retval.code !== 0){
						plugins.showComtip($button, retval.msg);
					}

				});
			}
			// 取消限制
			setTimeout(function(){
				that.canSend = true;
			}, that.sendTimeLimit);
		},
		// 初始化问答
		init: function(HTSDK){
			 question._MT = HTSDK;
			 this.binds();
			 plugins.helper();
		}

    };

    // 暴露接口
    module.exports = question;
});

