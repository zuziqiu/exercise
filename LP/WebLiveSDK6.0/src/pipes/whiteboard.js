"use strict";
/**!
 *  socket管道代理
 */
define(function(require){

	// import pack
	let socket = require("../CloudLive/module/socket"),
		map = require("../utils/map");

	// whiteboard
	let whiteboard = {

		// 外部监听(sdk-bridge:whiteboard:live:start)
		cmdType: 'sdk-bridge:whiteboard:live:',
		
		// 代理
		delegate: null,

		// 播放器监听whiteboard 调用该方法 => 控制主播放器：白板模式 @retval.args.t:客户端状态
        whiteBoard: function(packet) {
            var retval = packet.args,
                that = this;

            // get live info
            // if (command.t === "start") {
            //     var liveData = {
            //         liveId: command.liveid || 0,
            //         courseId: command.course_id || 0
            //     };
            //     that.liveData = liveData;

            //     // map.get("live:data:update")(liveData);
            //     that.events('live:data:update')(liveData)
            // }

            //show options
            if (retval) {
                if (retval.t) {
                    // start
                    if (retval.t === 'start' || retval.t === 'stop' || retval.t === 'pause') {
            			that.events(retval.t, retval);
                    }
                    
                }
            }
        },

		// 对外暴露事件
		events: function(event, res){
			map.get(event)(res)
		}

	}

	return whiteboard;
});
