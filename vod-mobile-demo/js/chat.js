/**
 * @name chat.js
 * @note 聊天区模块
 * @author [liangh]
 * @version [v1.0.1]
 */
define(function(require, exports, module) {
    // 模版
    var TMOD = require("TMOD");
    var plugins = require("./plugins");
    var chapter = require("./chapter");
    var scrollTo = require("scrollTo");

    // 聊天模块
    var chat = {
        HT: "",
        isLoad : false,
        loadChatTemp : false,

        // 聊天
        messagesData : [],
        messagesDataObject : {},
        chatSliceObj :{},
        chatTimePoint : [],
        chatList : [],
        globalIsCanScroll : true,

        // 初始化
        init: function(HTSDK){
            chat.HT = HTSDK;
            /*this.binds();*/
        },
        //事件绑定
        binds: function(){
            var that = this;
            // 滚动
            $(".mod_chat_list").on("touchstart", function(){
                if(that.scrollTimer){
                    clearTimeout(that.scrollTimer);
                }
                that.globalIsCanScroll = false;

            });
            $(".mod_chat_list").on("touchend", function(){
                that.scrollTimer = setTimeout(function(){
                    that.globalIsCanScroll = true;
                }, 3000);
            });
        },

        /*聊天分段存储*/
        chatSlice: function(chatSlice){
            var  _that = this;
            var cuter = chatSlice;
            for (var i = 0; i < cuter.length; i++) {
                var nameSpace = "start_"+cuter[i].start+"_end_"+cuter[i].end;
                _that.chatSliceObj[nameSpace] = [];
                window.chatSliceObj = _that.chatSliceObj;
            }; 
        },

         // 滚动到当前聊天
        goCurChat: function(duration){
            var that = this;
            var _chatCurTime = parseInt(duration, 10);
            var $tg = $("body #chat_pos_"+_chatCurTime);
            if(_chatCurTime < 0){
                return  false;
            }
            // 判断区间段
            // 聊天模板加载完
            if(that.loadChatTemp){
                if($tg.length > 0 && that.globalIsCanScroll){
                    var offTop = $("#chat_hall").find(".pub_msg").eq(1).offset().top;
                    $(".mod_chat_list").scrollTo({
                        toT: $tg.offset().top - offTop
                    });
                }
            }  
        },

        //聊天列表
        renderList: function(msglist){
            var _that =  this;
            // if(chat.isLoad){
                // chat.isLoad = true;
                // 有数据情况下渲染聊天
                if(msglist.length === 0){
                    return false;
                }

                // 目标
                var $chatHall = $("#chat_hall");

                // 复制对象
                var msgLen = msglist.length - 1,
                    curChatData = _that.chatSliceObj["start_"+msglist[0].starttime+"_end_"+msglist[msgLen].starttime];
                
                // 已存在
                if(curChatData && curChatData.length > 0){
                    return false;
                }

                // 赋值
                _that.chatSliceObj["start_"+msglist[0].starttime+"_end_"+msglist[msgLen].starttime] = msglist;

                // 查找最接近时间点
                _that.chatTimePoint.push(parseInt(msglist[msgLen].starttime, 10));
                var appendPoint = plugins.closest(_that.chatTimePoint, chapter.__currentTime);

                // render & append to closer time point.
                if(msglist){
                    var msg = {
                        data: msglist //messagesDataObject[_pcurTime]
                    };
                    var tpls = TMOD("chat_msg_v2", msg);

                    // 插入对应位置
                    if($("#chat_pos_"+appendPoint).length > 0){
                        $("#chat_pos_"+appendPoint).after(tpls);
                    }else{
                        $chatHall.append(tpls);
                    }

                    _that.loadChatTemp = true;
 
                    var offTop = $("#chat_hall").find(".pub_msg").eq(1).offset().top;
                    
                    // scroll to bottom
                    setTimeout(function(){
                       $(".mod_chat_list").scrollTo($chatHall.height(), 200);
                    }, 200);
                }
            // }
        }
    };

    // 暴露接口
    module.exports = chat;
});

