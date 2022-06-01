// 投票
// var map = require('@map'),
  // STATIC = require('@Static'),
  // room = require('../../vod.room'),
  // Store = require('@Store')['default'],
  // cmdHandle = require('../../core/cmd.handle'),
  // tools = require('@tools')
import map from '../../common/utils/map'
import tools from '../../common/utils/tools'
import sdkStore from '@/sdkStore';
// import STATIC from '../../mt.static'
import STATIC from '@/sdkStore/states/staticState'
// 插件
var vote = {
  voteUrl: STATIC.URL.APP_HOST + '/live/vote.php',
  access_token: null,
  ajax: tools.ajax,
  packet: null,
  // vote请求锁
  voteLock: false,
  // 发送选项
  postVote: function (param, callback) {
    var that = this
    var user = sdkStore.getState().global.data['user']
    if (that.voteLock) {
      return false
    }
    that.voteLock = false
    var opts = {
      vid: param.vid,
      action: 'vote',
      option: param.options,
      access_token: sdkStore.getState().room.access_token
    }
    tools.ajax({
      type: 'GET',
      url: that.voteUrl,
      data: opts,
      dataType: 'jsonp',
      success: function (ret) {
        tools.callback(callback, ret)
        //iframe跨域发送消息,发送投票消息
        // 学生ID
        var xid = user.xid || '-1'
        // 第三方ID
        var uid = user.uid || '-1'
        var vid = opts.vid
        var rightAns = ''
        if (that.packet) {
          // 某次投票的标识ID
          vid = that.packet.args.vid
          // 投票的正确答案
          rightAns = that.packet.args.info.answer
        }
        // 学生的选择是否正确,true正确，false,不正确
        var isRight = false
        // console.log(param)
        // var isRight = that.packet.args.info.answer === param.options
        // 学生选择的答案, -> 转成数组
        var optArr = JSON.parse(param.options)

        // 映射关系
        // [2,3] => [B,C]
        var options = []
        var letter = {
          1: 'A',
          2: 'B',
          3: 'C',
          4: 'D',
          5: 'E',
          6: 'F',
          7: 'G',
          8: 'H'
        }
        for (var i = 0; i < optArr.length; i++) {
          options.push(letter[optArr[i]])
        }

        // 对学生选择的答案数组进行默认排序
        options = options.sort()

        // 正确答案 =》 转换成数组
        var rightAnsArr = rightAns.split(',')

        // 对正确答案进行排序
        rightAnsArr = rightAnsArr.sort()

        // 判断学生是否回答正确
        // if(options.length !== rightAnsArr.length) {
        // 	isRight = false;
        // }else {
        // 	for(var j = 0 ; j < options.length ; j ++ ) {
        // 		if(options[j] !== rightAnsArr[j]) {
        // 			isRight = false;
        // 			break;
        // 		}else {
        // 			isRight = true;
        // 		}
        // 	}
        // }
        // 正确答案(callback) data.isRight => [0/1]
        if (ret.data) {
          // 如果老师没输入答案
          if (ret.data.answer.length === 0) {
            isRight = -1
          }
          // 按照正确答案返回
          else {
            if (ret.data.isRight) {
              isRight = true
            } else {
              isRight = false
            }
          }
        }
        var postObject = {
          t: 'vote:new',
          type: 'callback',
          args: {
            xid: xid,
            uid: uid,
            vid: vid,
            rightAns: rightAns || null,
            res: ret,
            isRight: isRight
          }
        }

        // 发送给 => postMessage 订阅者
        // cmdHandle['default'].send(postObject);

        // 解锁
        that.voteLock = false
      },
      error: function () {
        that.voteLock = false
      }
    })
  },
  // 获取投票结果
  getVoteDetail: function (vid, callback) {
    var that = this
    var opts = {
      vid: vid,
      access_token: sdkStore.getState().room.access_token
    }
    tools.ajax({
      type: 'GET',
      data: 'access_token=' + opts.access_token + '&action=getVoteList&vid=' + vid,
      url: that.voteUrl,
      dataType: 'jsonp',
      success: function (ret) {
        tools.callback(callback, ret)
      }
    })
  },
  setData: function (packet) {
    this.packet = packet
  },
  init: function (room) {
    this.room = room
  }
}
// exports
export default vote
