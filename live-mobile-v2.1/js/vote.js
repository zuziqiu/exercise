/**
 * @name set.js
 * @note  投票模块
 * @author [liangh]
 * @version [v1.0.1]
 */
define(function(require, exports, module) {
    // 模版
    var TMOD = require("TMOD");
    /*var room = require("./room");*/
    var plugins = require("./plugins");

    //一起作业网
    var voteList = ["11386"],
        voteTitle = "投票";
    if(voteList.indexOf(window.partner_id)>-1){
        voteTitle = "答题";
    }

    /**
 * @投票模块
*/
modVote = {
    // 投票
    curVote: {}, //当前投票对象
    opAry: [],//当前选项
    _MT: null,
    myAnswers: {},
    voteLetter: ["A","B","C","D","E","F","G","H","I","J"],
    
    // 显示投票选项
    showVote: function(ret){
        this.opAry.splice(0, this.opAry.length);
        this.curVote = ret;
        $("#mtAuthorPlayer").addClass('onepx');
        ret.letter = this.voteLetter;
        ret.voteTitle = voteTitle;
        sessionStorage.setItem("opAry",""); 
        var _tpl_showVote = TMOD("show_vote_options", ret);
            //HTSDK.plugins.popBox(_tpl_showVote);
        var notify = '管理员 <i class="vote"></i><em>'+ret.info.nickname+'</em> 在'+ret.info.startTime+'发起了一个<span class="state">'+voteTitle+'</span>！';
        plugins.chatNotify(notify);
        //普通用户投票
        if(!plugins.isAdmin()){
           plugins.popBox(_tpl_showVote);
           $(".vote_mask_bg").show();
           $(".mod_modules").addClass("st");
           plugins.isVideo();
        }
    },
    // 自动关闭
    autoClose: function(duration){
        var $popBox = $("#pop_box"),
            that = this;
        setTimeout(function(){
            $popBox.html("").hide();
            $(".pop_cloud_background").hide();
            $(".mod_modules").removeClass("st");
             $(".vote_mask_bg").hide();
            plugins.voiceOrVideo();//判断是语音模式还是摄像头模式
            if(MT.getSDKMode() == 1){
                 SDK.cameraShow();
            }
        }, duration);
       
    },
    //从sessionStorage获取存储的答案
    getAnswerData: function(){
        var answersData =  JSON.parse(sessionStorage.getItem("myAnswers"));
        return answersData;
    },

    //存储自己选择的答案到sessionStorage
    setAnswerData: function(ret){
        var that = this;
        
        if(!that.myAnswers[ret.info.vid]){
            that.myAnswers[ret.info.vid] = ret.info.myAnswer;
            sessionStorage.setItem("myAnswers",JSON.stringify(that.myAnswers));
        }
    },

    // 显示投票结果
    showResult: function(ret){
        that = this;
        var isShow = parseInt(ret.isShow, 10);
        that.switchWord(ret);
        that.mySwitchWord(ret);
        that.setAnswerData(ret);

        // 是否显示投票结果
        if(isShow > 0 || ret.info.answer.length>0){
            ret.letter = this.voteLetter;
            ret.voteTitle = voteTitle;
            var _tpl_showResult = TMOD("show_vote_result",ret);
            plugins.popBox(_tpl_showResult);
            var notify = '管理员<i class="vote"></i><em>'+ret.info.nickname+'</em> 在'+ret.info.startTime+'结束了'+voteTitle+'。<a class="getvote" data-vid="'+ret.info.vid+'">查看结果</a>';
            plugins.chatNotify(notify);
            // 如果是管理员
            if(!plugins.isAdmin()){
                plugins.popBox(_tpl_showResult);
                 $(".vote_mask_bg").show();
                $(".mod_modules").addClass("st");
                plugins.isVideo();
            }
        }else{
            $("#pop_box").hide();
            $(".vote_mask_bg").hide();
        }
    },

    mySwitchWord: function(ret){
        if(sessionStorage.getItem("opAry")!=null){
            var opAry = sessionStorage.getItem("opAry"),
                that = this;  
            ret.info.myAnswer = "";    
            if(opAry.length > 0){
                var op = opAry.split(",");
                for(var i=0;i < op.length; i++){
                    if(op.length == 1){
                         ret.info.myAnswer = that.voteLetter[op[i]-1];
                    }else if(op.length > 1){
                         ret.info.myAnswer += that.voteLetter[op[i]-1]+"、"; 

                    }      
               }
            }else{
                ret.info.myAnswer = "";
            }
            if(opAry.length>1){
               ret.info.myAnswer =  ret.info.myAnswer.substr(0,ret.info.myAnswer.length-1);
            }
        }else{
            ret.info.myAnswer="";
        }
    },

     //将数字转化成字母
    switchWord: function(ret){
        var answer = ret.info.answer.split(",");
        ret.info.rightAnswer = "";
        if(ret.info.answer.length > 0){
            for(var i = 0; i< answer.length;i++){
                if(answer.length == 1){
                     ret.info.rightAnswer = modVote.voteLetter[answer[i]];
                }else if(answer.length>1){
                     ret.info.rightAnswer += modVote.voteLetter[answer[i]]+"、"; 

                }     
            }
        }else{
            ret.info.rightAnswer = "";
        }
        if(answer.length>1){
           ret.info.rightAnswer =  ret.info.rightAnswer.substr(0,ret.info.rightAnswer.length-1);
        }
    },
    // 显示获取投票内容
    showGetVote: function(ret){
        if( MT.getSDKMode() == 2){
            return false;
        }
        ret.letter = this.voteLetter;
        that.switchWord(ret);
        that.mySwitchWord(ret);
        $(".vote_mask_bg").show();
        ret.voteTitle = voteTitle;
        var selectAnswer = that.getAnswerData();
        if(selectAnswer[ret.info.vid]){
            ret.info.myAnswer = selectAnswer[ret.info.vid];
        }
        
        var _tpl_showGetvote = TMOD("show_vote_getvote", ret);
        plugins.popBox(_tpl_showGetvote);
        $(".mod_modules").addClass("st");
    },
    // 投票TODO...
    postVote: function(el){
        var that = this,
            opt = that.curVote;
        var _options = that.opAry.sort().toString();
        var param = {
            vid: opt.vid,
            options: "["+_options+"]"
        };
        var check = that.checkItems();
        var _MT = modVote._MT;
        if(check){
            // 发送投票
            _MT.plugins("vote").postVote(param, function(retval){
                modVote.userVoteCallback(retval);   
            });
            this.autoClose(3000);
        }
    },
    // 获取投票详情
    getVoteDetail: function(vid){
        var _MT = modVote._MT;
        // 获取投票
        _MT.plugins("vote").getVoteDetail(vid,function(retval){
            modVote.showGetVote(retval);
        });
    },
    // 验证选项
    checkItems: function(){
        var that = this,
            flag = false,
            opt = that.curVote,
            optional = opt.optional,
            len = that.opAry.length;
        // 判断选项长度
        if(parseInt(optional) === 1 && len === 1){
            flag = true;
        }else if(parseInt(optional) > 1 && len >= 1){
            flag = true;
        }else{
            flag = false;
        }
        return flag;
    },
    // 获取投票选项
    getOptions: function(tsEl){
        var options = "",
            optional = this.curVote.optional,
            $target = $(tsEl.currentTarget),
            that = this;
        // 多选操作
        if(optional > 1){
            $('.multiple').find('li').each(function(i, e) {
                    var opVal = $(this).data("value");
                if($(e).hasClass('db_check')){
                    that.opAry.push(opVal);
                }
            });
        }
        // 单选操作
        else if(optional == 1){
            $('.single').find('li').each(function(i, e) {
                    var opVal = $(this).data("value");
                if($(e).hasClass('check')){
                    that.opAry.push(opVal);
                }
            });
        }
        return that.opAry;

    },
    // 投票回调
    userVoteCallback: function(data){
        var ret = {
            code: data.code || 0,
            callback: true,
            msg: data.msg || ""
        };

        ret.voteTitle = voteTitle;
        var _tpl_voteCallback = TMOD("show_vote_callback", ret);
        plugins.popBox(_tpl_voteCallback);
    },

    //转屏关闭图片预览
    closePreview: function(){
        $("#pop_box .vo_image").removeClass("zoom_image");
        $("#pop_box .vo_image img").addClass("dcw");
        $("#pop_box .close_vote").hide();
        $("#pop_box .vo_image img").css({
            marginTop: 0,
            marginLeft: 0
        });
        //模屏
        if($("body").hasClass("landscape")){
            $(".vo_image").css({
                marginTop: 20,
                marginRight: 10
            });
            $("#pop_box .vo_image img").css({
                marginTop: 0,
                marginLeft: 0
            });
        }   
     }, 

    //事件绑定
    binds:function(){
        var that = this;
        // 发表投票
        $("#pop_box").on("click", ".selt_vote_option .btn", function(e){
            var sinValue = $(".selt_vote_option ").find('.opt_value').data("value");
            if( sinValue == 1){
                modVote.getOptions(e);
            }else{
                modVote.getOptions(e);
            }
            //1233333
            sessionStorage.setItem("opAry", that.opAry); 
            modVote.postVote(e);
        });

        //单选 投票选项
        $("#pop_box").on("click", ".single li", function(e){
            $(this).addClass('check').siblings().removeClass('check');
            $(".btn").addClass('has_check');
        });

        //关闭
        $("#pop_box").on("click", ".close_vote", function(e){
            $("#pop_box .vo_image").removeClass("zoom_image");
            $("#pop_box .vo_image img").addClass("dcw");
            $("#pop_box .close_vote").hide();
            $("#pop_box .vo_image img").css({
                marginTop: 0,
                marginLeft: 0
            });
            //模屏
            if($("body").hasClass("landscape")){
                $(".vo_image").css({
                    marginTop: 20,
                    marginRight: 10
                });
                $("#pop_box .vo_image img").css({
                    marginTop: 0,
                    marginLeft: 0
                });
            }   
        });


        //图片放大
        $("#pop_box").on("click", ".vo_image img", function(e){
            $("#pop_box .vo_image").addClass("zoom_image");
            $("#pop_box .close_vote").show();
            $(this).removeClass("dcw");
            $(this).css({
                marginTop: -($(this).height()/2),
                marginLeft: -($(this).width()/2)
            });
            //模屏
            if($("body").hasClass("landscape")){
                $(".vo_image").css({
                    marginTop: 0,
                    marginRight:0
                });

                $(this).css({
                    marginTop: -($(this).height()/2),
                    marginLeft: -($(this).width()/2)
                });
             }    
        });
        
        //双选
        $("#pop_box").on("click", ".multiple li", function(e){
            $(this).toggleClass('db_check');
            var optLength = $(".db_check").length,
                sinValue = $(".selt_vote_option ").find('.opt_value').data("value");

                if( optLength > sinValue){
                    $(this).removeClass("db_check");
                }
                if($('.db_check').size() > 0){
                    $(".btn").addClass('has_check');
                }else{
                    $(".btn").removeClass('has_check');
                    return false;
                }
        });

        //关闭
        $("#pop_box").on('click',".cls",function(){  
            $(".pop_cloud_background").hide();
            $(".vote_mask_bg").hide();
            modVote.autoClose();                 
            $(".mod_modules").removeClass("st");
            if( MT.getSDKMode() == 1){
                SDK.cameraShow();
            }
        });

        //投票结果
        $(".mod_chat_hall").on("touchend", ".getvote", function(e){
            var vid = $(this).data("vid");
                plugins.isVideo();
                $("#mod_ppt").addClass("st");
                modVote.getVoteDetail(vid);
                if( MT.getSDKMode() == 1){
                    SDK.cameraHide();
                }
        });
    },
    //init
    init:function(HTSDK){
        var that = this;
            that.binds();     
        modVote._MT = HTSDK;    
    }
};
    // 暴露接口
    module.exports = modVote;
});

