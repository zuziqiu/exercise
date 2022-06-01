// Filename: question.js
// define(function (require) {
  // import libs
  import map from "../utils/map"
  import room from "./room.init"
  import member from "./member"
  import STATIC from './mt.static'
  import tools from "../utils/tools"

  // question
  var question = {
    //问题列表所有QID
    allQids: {
      //list: new Set(),
      list: {},
      exists: function (qid) {
        return qid.toString() in this.list;
      },
      add: function (qid) {
        if (!this.list[qid]) {
          this.list[qid.toString()] = 1;
        }
      },
      del: function (qid) {
        if (this.list[qid]) {
          delete this.list[qid.toString()];
        }
      }
    },
    // access_token : room.getAccessToken()
    getList: function (access_token, callback) {
      var _access_token = room.getAccessToken();
      tools.debug('======> question list init', _access_token);
      var _ts = this;
      // 获取question列表
      tools.ajax({
        type: "GET",
        url: STATIC.APP_HOST + '/live/questions.php',
        dataType: 'jsonp',
        data: {
          'access_token': _access_token
        },
        success: function (retval) {
          if (retval.code === STATIC.EC_SUCCESS) {
            // tell the room callback
            tools.debug("获取问答列表成功...");
            for (var i in retval.data) {
              if (retval.data.hasOwnProperty(i) == true) {
                _ts.allQids.add(retval.data[i].qid);
              }
            }
            callback(retval)
          } else {
            // 获取视频失败
            map.get('live:question:error')(retval)
            callback(retval)
            return false
          }
        },
        error: function (res) {
          map.get("live:question:error")("问答获取超时,请重试...");
          callback(res)
        }
      });
    },
    // 获取问答byID
    getQuestionById: function (qid, callback) {
      var access_token = room.getAccessToken();
      tools.debug('======> question list by qid', access_token);
      var _ts = this;
      // 获取question列表
      tools.ajax({
        type: "GET",
        url: STATIC.APP_HOST + '/live/questions.php',
        dataType: 'jsonp',
        data: {
          'access_token': access_token,
          "qid": qid
        },
        success: function (retval) {
          if (retval.code === STATIC.EC_SUCCESS) {
            // tell the room callback
            tools.debug("Qid获取问答列表成功...");
            callback(retval);
          } else {
            // alert("获取问答列表失败");
            map.get('live:get:question:error')(retval)
            return false;
          }
        },
        error: function (res) {
          map.get("question:error", "问答连接超时,请重试...");
        }
      });
    },
    //问题答疑POST
    quesPost: function (type, param, callback) {
      tools.debug(type, param);
      var _ts = this,
        msg = encodeURIComponent(param.content),
        metadata = {},
        baseUrl = STATIC.APP_HOST + '/live/interaction.php';
      // 选择参数
      switch (type) {
        case "ask":
          // metadata+='action='+param.action+'&content='+msg;
          metadata = {
            "action": param.action,
            "content": msg
          };
          if (param.ext) {
            metadata = Object.assign(metadata, param.ext)
          }
          break;
        case "reply":
          // metadata+='action='+param.action+'&replyId='+param.replyId+'&content='+msg;
          metadata = {
            "action": param.action,
            "replyId": param.replyId,
            "content": msg
          };
          break;
        case "delqus":
          // metadata+='action='+param.action+'&qid='+param.qid;
          metadata = {
            "action": param.action,
            "qid": param.qid
          };
          break;
      }
      metadata.access_token = room.getAccessToken()
      tools.debug("question===>", baseUrl, metadata);
      //问答公告公共请求
      tools.ajax({
        type: "GET",
        url: baseUrl,
        dataType: 'jsonp',
        data: metadata,
        success: function (retval) {
          //发问题请求
          var date = new Date(),
            nowTime = date.getTime(),
            d = retval;
          _ts.lastPost = nowTime;
          tools.debug('Question response ==>', retval)
          // 错误提示
          if (d.code != STATIC.EC_SUCCESS) {
            map.get('live:question:error')(retval)
          }
          // 其他
          if (typeof (d) !== "undefined" && d !== null) {
            if (d.code == 21) {
              // 提交过快
              callback(d);
              return false;
            } else if (d.code == 20) {
              // 信息重复
              _ts.lastQuestion = msg;
              callback(d);
              return false;
            } else {
              switch (type) {
                case 'ask':
                  if (d.data && d.data.localInsert == 1) {
                    d.data = member.dealMemberAvatar(d.data);
                    _ts.allQids.add(d.data.qid);
                    if (tools.isMobileSDK() && tools.getSDKMode() == 2) {
                      window.SDK.broadcast({ cmd: "question:ask", args: d.data });
                    } else {
                      if (param.ext && param.ext.robotName) {
                      } else {
                        map.get('question:ask')(d.data);
                      }
                    }
                  }
                  break;
                default:
                  break;
              }
              callback(d);
            }
          }
        }
      });
    }
  };
  // exports
  export default question;
// });
