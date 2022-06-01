// Filename: room.init.js
define(function (require) {

    // import
    var tools = require("@tools"),
        map = require("@map"),
        log = require("./log"),
        network = require("./network"),
        STATIC = require("./mt.static");

    // room.init
    var room = {
        // token
        access_token: null,
        // 获取access_token
        getAccessToken: function () {
            return this.access_token
        },
        course: null,
        setCourse: function (course) {
            this.course = course;
        },

        // 房间配置参数
        configs: null,

        // 初始化 sdk.core 模块
        init: function (access_token, callback, player) {
            tools.debug('room.init.js => module init.');

            if (player) {
                this.player = player;
            }

            var _ts = this,
                actoken = access_token;

            // ack 赋值
            this.access_token = access_token;
            // 获取room基本信息
            tools.ajax({
                type: "GET",
                url: STATIC.APP_HOST + '/live/init.php',
                dataType: 'jsonp',
                data: {
                    access_token: access_token
                },
                success: function (retval) {
                    // 错误统一暴露
                    if (retval.code != STATIC.CODE.SUCCESS) {
                        tools.error(retval)
                    }
                    // 成功
                    if (retval.code === STATIC.CODE.SUCCESS) {

                        var room = retval;

                        // 设置room
                        tools.setRoom(room);

                        // for test
                        // room['isVodLive'] = true

                        // 注册log信息 - log setting
                        log.init(room.log);

                        // Change-Protocol
                        try {
                            room = tools.detectProtocol(JSON.stringify(room));
                            room = JSON.parse(room);
                        } catch (err) {
                            tools.debug("room data parse Error " + err);
                        }

                        // _ts.access_token = access_token;
                        if (room.course && room.course.course_id) {
                            _ts.course = room.course;
                        }

                        if (room.ext.liveEndExpire > 0 && room.ext.liveEndJumpUrl.indexOf('http') === 0) {
                            //房间模式，检查是否被过期踢出过
                            if (window.localStorage) {
                                if (window.localStorage.getItem('liveEndExpireToken') == actoken) {
                                    window.location.href = room.ext.liveEndJumpUrl;
                                    return;
                                } else {
                                    window.localStorage.removeItem('liveEndExpireToken')
                                }
                            }
                        }

                        _ts.room = room;
                        network.addHostGroup(room.hostGroup || {});

                        // tell the room callback
                        tools.debug("房间验证成功====>", room);

                        // 房间callback
                        try {
                            callback(room);
                        } catch (err) {
                            console.error(err);
                        }
                    }
                    // code 课程范围[1260-1263]未允许进入
                    else if (retval.code >= STATIC.CODE.LIVE_COURSE_UNEXIST && retval.code <= STATIC.CODE.LIVE_COURSE_NOT_START) {
                        map.get("live:course:access:error")(retval);
                    }
                    // 系统错误信息
                    else {
                        map.get("system:room:error")(retval);
                    }
                },
                // 请求错误
                error: function () {
                    map.get("system:room:error")("room请求超时,请重试...");
                }
            });
        },
        //检查是否直播结束时间到设定时限，判断是否踢出
        liveEndExpieTimer: null,
        broadcastHandler: function (command) {
            var that = this;
            // 上课
            if (command.t == 'start') {
                if (that.liveEndExpieTimer) {
                    clearTimeout(that.liveEndExpieTimer);
                    that.liveEndExpieTimer = null;
                }
            }
            // 下课
            else if (command.t == 'stop') {
                if (that.room.ext.liveEndExpire > 0 && that.room.ext.liveEndJumpUrl.indexOf('http') === 0) {
                    that.liveEndExpieTimer = setTimeout(function () {
                        if (window.localStorage) {
                            window.localStorage.setItem('liveEndExpireToken', that.getAccessToken());
                        }
                        window.location.href = that.room.ext.liveEndJumpUrl;
                    }, that.room.ext.liveEndExpire * 1000);
                }
            }
        }
    };
    window.room = room
    return room;
});