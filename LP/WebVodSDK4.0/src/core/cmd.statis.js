/**
 * [description] 公共统计模块
 * @function => start stop
 * @return void
 */
define(function (require) {

    var log = require('./log')
    var core = require('./player.core')

    var statis = {
        
        room: null,
        liveData: null,
        playNumber: 0,
        bn: 0,
        action: 'wait',
        logTimer: null,
        cid: 0,

        // 设置
        setData: function (data) {
            
            this.room = data

            // action
            if (data.InitData && data.InitData.action) {
                this.action = data.InitData.action
            }

            // liveid
            if (data.live && data.live.id) {
                this.liveid = data.live.id
            }

            // 课程
            if (data.course) {
                this.liveData = data.course
            }
        },

        // 开始统计
        start: function (argument) {
            this.liveStatis()
        },

        // 停止统计
        stop: function (argument) {
            if (this.logTimer) {
                window.clearInterval(this.logTimer)
            }
        },

        // 直播统计
        liveStatis: function() {
            var that = this,
                user = this.room.user,
                pf = "";

            // 平台判断
            var ua = navigator.userAgent.toLowerCase();
            // ios
            if(ua.indexOf("ios-sdk") > -1){
                pf = "ios-sdk";
            }
            // android
            else if(ua.indexOf("android-sdk") > -1){
                pf = "android-sdk";
            }
            // html
            else{
                pf = "html";
            }

            // var course_id = 0;
            // if(that.sdkRoom.course && that.sdkRoom.course.course_id){
            //     course_id = that.sdkRoom.course.course_id;
            // }

            // 统计
            log.play({
                xid: user.xid,
                uid: user.uid,
                pid: user.partner_id,
                rid: user.roomid,
                cid: that.liveid,
                courseId: that.liveData && that.liveData.course_id || 0,
                pf: pf,
                pt: 1,
                pl: that.action === 'start' ? 1 : 0,
                cbt: 0,
                bn: that.bn || 0,
                ba: that.ba || 0,
                type: core.playStatus,
                pn: that.playNumber
            });
            
            that.bn = 0;
            that.ba = 0;

            that.logTimer = setTimeout(function() {
                ++that.playNumber;
                that.liveStatis();
            }, (that.room.heartbeatInterval) * 1000 || 180 * 1000);
        }
    }
    window.ss = statis
    // exprose
    return statis
})


