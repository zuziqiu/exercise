   /**
 * @name sdk.event.dispatch
 * @note sdk事件监听&执行
 * @author [Marko]
 * @version [v1.0.1]
 */

define(function(require, exports, module) {
    // 包引入
    // 每个模块单独新增文件
    var config = require("./global.config"), // 全局配置
        room = require("./room"), // 房间模块
        flower = require("./flower"), // 鲜花模块
        question = require("./question"), // 问答模块
        reward = require("./reward"), // 打赏模块
        set = require("./set"), // 设置模块
        chat = require("./chat"), // 聊天模块 = require
        barrager = require("./barrager"),
        vote = require("./vote"), // 投票模块
        lottery = require("./lottery"), // 抽奖模块
        plugins = require("./plugins"), // 扩展方法
        widgets = require("./widgets"), // 小插件
        desktop = require("./desktop"), // 桌面分享
        moduleSetting = require("./module_setting"),//模块
        camera = require("./camera"), // 视频模块
        sign = require("./sign");//用户签到
        classPreview = require('./class_preview'); //课程预告   

    // 兼容模式样式模块
    if(config.isCompatible){
        require.async("../css/wechat_compatiable.css");
    }
        
    // 事件执行 TODO...
    var HTCMD = {
        
        // 初始化加载
        isLoad: false,

        isLiveStart : false,

        initRoom: false,

        isHasPPT: false,//false表示没有ppt,true表示有ppt

        // 初始化
        fire: function(HTSDK){
            var that = this;
            window.HTSDK = HTSDK;
            // 直播开始
            HTSDK.on("live:start", function(title){
                room.stateChange("start");
               /* classPreview.heartBeat('start');*/
                classPreview.isHeartBeat('start');
                $("#priview_mask").hide();
                HTCMD.isLiveStart = true;
                if(HTCMD.isLiveStart){
                    if(config.cameraStatue == "wait"){
                        if(!HTCMD.initRoom){
                           room.init(HTSDK); 
                           HTCMD.initRoom = true; 
                           camera.whatSet("stop"); 
                        }    
                    }
                }

            });


            //普通用户签到
            HTSDK.on("sign:new",function(data){
                sign.showSignPop(data);
                sign.showNotice(data,"start");
            })

            //结束广播
            HTSDK.on("sign:end",function(data){
                sign.showNotice(data,"stop");
                sign.signPopHide();
            })

            // 错误反馈(onerror && code!==0)
            HTSDK.on("system:room:error", function(res){
                if(window.console && window.console.warn){
                    console.warn("###验证信息错误(请检查 access_token 是否传输正确) ==> ", res);
                }

                plugins.showError(res);
                //被踢出
                if(res.code == 10034){
                    window.location.href = 'http://open.talk-fun.com/open/maituo/live_tip.html?var=1'
                }
                //房间已满
                else if(res.code == 10035){
                    window.location.href = 'http://open.talk-fun.com/open/maituo/live_tip.html?var=2'
                }
            });

            // 禁止进入
            HTSDK.on("member:forbidden", function(res){
                plugins.showError(res);
            });

            //通过提问
            HTSDK.on("question:audit", function(retval){
                question.dealCallback('audit',retval);
            });

            //删除提问
            HTSDK.on("question:delete", function(retval){
                question.dealCallback('delete',retval);
            });

            // 课程错误
            HTSDK.on("live:course:access:error", function(res){
                plugins.showError(res);
            });
            //课程信息
            HTSDK.on("live:course",function(data){
                classPreview.classIntroAsync('dataReady',data);

            });
            //监听是否有ppt
            HTSDK.on("live:set:page", function(retval){
                // HTSDK.footer.isHasPPT = true;
            });

            //在线人数
            HTSDK.on('member:total', function(total){
                room.total = total;
                $("#total").html(total + room.robot);
            });

            // 初始化机器人
            HTSDK.on("live:robots:users", function (robobj) {
                if( robobj != null && robobj != undefined){
                    if(robobj.length>0){
                        room.robot.length = robobj.length;
                        room.SetRobot(robobj.length);
                    }else {
                        if(robobj.list.length > 0){
                            room.robot = robobj.total;
                            room.SetRobot(robobj.total);
                        }
                    }
                    
                }
            });
            
            // 广播设置特殊用户
            HTSDK.on("member:robots", function (robobj) {
                if( robobj != null && robobj != undefined){
                    if(robobj.robots.length>0){
                        room.robot = robobj.robots.length;
                        room.SetRobot(robobj.robots.length);
                    }else {
                        room.robot = robobj.robots.total;
                        room.SetRobot(robobj.robots.total);
                    }
                }
            });
            
            // 直播停止
            HTSDK.on("live:stop", function(){
                room.stateChange("stop");
                classPreview.heartBeat('stop');
                // classPreview.isHeartBeat('stop');
                var enable = HTSDK.serverRoom.modules.mod_theftproof_live.enable;
                widgets.aggregate("stop",enable);
            });

            // 直播未开始
            HTSDK.on("live:wait",function(){
                room.stateChange("wait");
                room.init(HTSDK);
            });
            
              //房间配置
            HTSDK.on("live:room:configs", function(room){
                chat.gagStatue = room.chat.disableall;
                window.sessionStorage.setItem("status",room.chat.disableall);
            });

            //摄像头是否已加载
            HTSDK.on("live:camera:loadeddata", function(){
               plugins.load = true;
               plugins.checkVideo();
               camera.appendCamera();
               $("#load_tips").hide();
            });

            // 摄像头是否播放
            HTSDK.on("live:camera:play", function() {
               plugins.play = true;
               plugins.checkVideo();
               camera.appendCamera();
                //play => 状态
                room.onCameraPlay();

                 // 摄像头是否播放
                if(config.screenMode == 0){
                    if(config.isCompatible){
                         return false;
                    }
                    camera.restCamera();
                } 
            });

            // 摄像头是否播放
            HTSDK.on("live:camera:pause", function() {
                //pause => 状态
                room.onCameraPause();
            });

            //监听当前视频自增量
            HTSDK.on("live:camera:timeupdate", function(time) {
            	room.onPlayerTimeUpdate(time);
            });
            
            // 摄像头出错
            HTSDK.on("live:camera:error", function() {
                $("#click_play").show();
                $("#load_tips").addClass("error");
                $("#load_tips").html("载入失败");
            });

            // 桌面分享播放
            HTSDK.on("live:video:playing", function(){
                desktop.onPlay();
            });

             // 桌面分享加载
            HTSDK.on("live:video:loadeddata", function(){
                    
            });

            //模块
            HTSDK.on("live:room:modules", function(modules){
                moduleSetting.init(modules);
                chat.modules = modules;
                if (modules.mod_role_live) {
                    var spadmin_name = modules.mod_role_live.config.list.spadmin.name;
                    var admin_name = modules.mod_role_live.config.list.admin.name;
                    var user_name = modules.mod_role_live.config.list.user.name;
                    config.role = {
                        user: user_name,
                        admin: admin_name,
                        spadmin: spadmin_name
                    };
                }

                if(window.partner_id == 20){
                   /* room.setName(modules);*/
                }
            });
            
            // 模式切换
            HTSDK.on("live:mode:change", function (mode) {
                // 0 => 课件模式 
                // 2 => 桌面分享和视频插播
                config.currentMode = mode.currentMode;
                desktop.changeOtherMode(mode);
                plugins.whatMode(mode);

                setTimeout(function() {
                    $("#click_play").show();
                }, 200);
            });

            // 摄像头开启
            HTSDK.on("camera:start", function(){
                if(HTCMD.isLiveStart){
                    config.cameraStatue = "start"; 
                   /* desktop.cstatue = "start";*/
                    config.mediaSwitch = "video";
                    if(!HTCMD.initRoom){
                       room.init(HTSDK); 
                       HTCMD.initRoom = true;    
                    }      
                }  
                // 兼容模式配置
                if(config.isCompatible){
                    // 兼容模式 =====> 有配置纯语音模式 (安卓 + 配置纯语音 + 用video标签播放) 的情况下:
                    if(config.getSysInfo().partform === "android"){
                        // 有摄像头, 自动切换摄像头在顶部模式
                        window.screenMode = "0";
                        config.screenMode = "0";
                        config.switchFlag = false;
                        if(plugins.isMobileStatus()== "vertical"){
                            var modeView_1 = require("./room.mode_view_1");
                            modeView_1.cameraTop();
                        }else{
                            horizontal = require("./room.horizontal"),
                            horizontal.cameraLeft();
                        }   
                    }
                    return;
                    
                }
                camera.whatSet("start");
                if(HTCMD.initRoom){

                    if(config.isCompatible){
                        $("#tab_video").show();
                    }

                    //大屏模式
                    if(config.screenMode == 0 && config.screenLocation == 0){
                        if(plugins.isMobileStatus()== "vertical"){
                            var modeView_1 = require("./room.mode_view_1");
                            modeView_1.cameraTop();
                        }else{
                            horizontal = require("./room.horizontal"),
                            horizontal.cameraLeft();
                        } 

                    }

                    //中小屏模式
                    if(config.screenLocation == 0){
                        if(config.screenMode == 1 || config.screenMode == 2){
                            var cw = "50%";
                            if(config.screenMode == 1){
                                cw = "50%";  
                            }else{
                                cw = "30%";
                            }
                            if(plugins.isMobileStatus()== "vertical"){
                                var modeView_2 = require("./room.mode_view_2");
                                modeView_2.cameraTop(cw);
                            }else{
                                horizontal = require("./room.horizontal"),
                                horizontal.cameraLeft();
                            } 
                        } 

                    }
                } 
            });

            // 摄像头关闭
            HTSDK.on("camera:stop", function(){ 

                // // 兼容模式配置
                // if(config.isCompatible){
                //     window.screenLocation = 1;
                // }

                 // 兼容模式配置
                if(config.isCompatible){
                    // 兼容模式 =====> 有配置纯语音模式 (安卓 + 配置纯语音 + 用video标签播放) 的情况下:
                    if(config.getSysInfo().partform === "android" && forceVoice[window.partner_id] && !config.forceAudio){
                        // 无摄像头, 将自动切换成小窗模式
                        window.screenMode = "2";
                        config.screenMode = "2";
                    }
                    $("#tab_video").hide();
                    
                }


                if(HTCMD.isLiveStart){
                    config.cameraStatue = "stop"; 
                    config.mediaSwitch = "auto";
                    if(!HTCMD.initRoom){
                       room.init(HTSDK); 
                       HTCMD.initRoom = true; 
                    }    
                } 
                camera.whatSet("stop");  

                if(HTCMD.initRoom){

                    if(config.isCompatible){
                        $("#tab_video").hide();
                        return false;
                    }
                    //大屏模式
                    if(config.screenMode == 0){
                        if(plugins.isMobileStatus()== "vertical"){
                            var modeView_1 = require("./room.mode_view_1");
                            modeView_1.cameraBottom();
                        }else{
                            horizontal = require("./room.horizontal"),
                            horizontal.cameraRight();
                        } 
                        plugins.currentTable("音频");

                    }

                    //中小屏模式
                    if(config.screenMode == 1 || config.screenMode == 2){
                        var cw = "50%";
                        if(config.screenMode == 1){
                            cw = "50%";  
                        }else{
                            cw = "30%";
                        }
                        if(plugins.isMobileStatus()== "vertical"){
                            var modeView_2 = require("./room.mode_view_2");
                            modeView_2.cameraBottom(cw);
                        }else{
                            horizontal = require("./room.horizontal"),
                            horizontal.cameraRight();
                        } 
                    } 
                                               
                }     
            });
                        
            // 接收聊天
            HTSDK.on("chat:send", function(ret){
                chat.onChat(ret);
            });

            // 鲜花初始化
            HTSDK.on("flower:get:init", function(retval){
                modFlower.flowerInit(retval);
            });

            // 送花成功
            HTSDK.on("flower:send", function(retval){
                modFlower.sendCallback(retval);
            });

            // 统计获取鲜花时长
            HTSDK.on("flower:total", function(flower) {
                modFlower.autoIncrease(flower);
            });

            // 剩余N秒获得一朵鲜花
            HTSDK.on("flower:time:left", function(sec){
                modFlower.flowerTimeleft(sec);
            });

            // 提问
            HTSDK.on("question:ask", function(retval){
                question.onQask(retval);
            });

            // 回答
            HTSDK.on("question:reply", function(retval){
               question.onQreq(retval);
            });

            // 删除问答
            /*HTSDK.on("question:delete", function(retval){
                question.delQus(retval);
            });*/
            
            // 公告
            HTSDK.on("announce:notice", function(retval){
                set.noticeContent(retval);
            });

            // 强制退出
            HTSDK.on('member:forceout', function(user){
                room.forceOut(user);
            });

            // 发起投票
            HTSDK.on("vote:new", function(retval){
                modVote.showVote(retval);
            });

            // 公布投票结果@弹窗
            HTSDK.on("vote:pub", function(retval){
                modVote.showResult(retval);
            });

            // 投票成功
            HTSDK.on("vote:post:success", function(retval){
                modVote.userVoteCallback(retval);
            });

            // 获取投票结果(聊天区)
            HTSDK.on("vote:getvote:success", function(retval){
                modVote.showGetVote(retval);
            });

            // 开始抽奖
            HTSDK.on("lottery:start", function(retval){
                lottery.startLottery(retval);
            });

            //T人
            HTSDK.on('member:kick', function(user){
                room.kick(user);
                plugins.modMessage("member:kick", user);
             });

            //广播
            HTSDK.on("broadcast", function(retval){
                plugins.diyBroadcast(retval);
            });


            // 禁止聊天
            HTSDK.on('chat:disable',function(retval){
                chat.chatAccess("chat:disable", retval);
            });

             //禁止全体隐天
            HTSDK.on('chat:disable:all',function(retval){
                 chat.allDisbleChat(retval);
                 chat.gagNotice(retval);
            });

            // 滚动通知
            HTSDK.on("announce:roll", function(retval){
                plugins.rollNotice(retval);
            });

            // 结束抽奖
            HTSDK.on("lottery:stop", function(retval){
                lottery.stopLottery(retval);
            });

            //数据更新
            HTSDK.on("live:data:update",function(retval){
                reward.liveid = retval.liveId;
            });
            
            // 打赏
            HTSDK.on("live:reward", function(ret){
                reward.rewardNotify(ret);
            });
            /**
             * 创建主播播放器
             * @mainPlayer(@容器ID, @播放器ID, @回调函数)
             */
            HTSDK.mainPlayer("mod_main_player", null, function(player){
                // todo...
            });

            HTSDK.on("member:join:me", function(data){
                if(data.member.chat.enable == 0){
                    window.forbid_chat = true;
                }
                var enable = HTSDK.serverRoom.modules.mod_theftproof_live.enable;
                widgets.aggregate("start", enable,data.member.uid);
            });

            /**
             * 创建摄像头am
             * @camera(@容器ID, @播放器ID, @回调函数)
             */
            HTSDK.camera("ht_camera_container", "mtAuthorPlayer", function(cameraPlay){
                camera.setCamera(cameraPlay);
            });

            // 房间初始化
            HTSDK.on("room:init", function(state){
                $(".mask_bg").hide();
                // 保证只初始化一次
                if(!that.isLoad){
                    that.isLoad = true;
                    plugins.init(HTSDK, camera);   
                    camera.init(HTSDK);//摄像头模块初始化
                    chat.init(HTSDK);//聊天模块初始化
                    question.init(HTSDK);//问题模块初始化
                    modFlower.init(HTSDK);//鲜花模块初始化
                    set.init(HTSDK);//设置模块初始化    
                    modVote.init(HTSDK);//投票模块初始化
                    lottery.init();//抽奖模块初始化 
                    sign.init();//用户签到功能
                }
            });


        }
    };

    // 暴露
    module.exports = HTCMD;

});















