/*
#     FileName: chat.js
#         Desc: 聊天模块
#       Author: lee, Marko
*/
// define(function (require) {
import room from '../../core/roomModule'
// import map from "../utils/map"
import { STATIC } from '../../states/staticState'
import tools from "../../utils/tools"
// import store from '../core/store'
import { sdkStore } from '../../states';

let chat = {
  // 最后截图对象
  latestParseObj: {},
  // 解析html为UBB
  toUBB: function (msg) {
    //<img src="url"/>  => [IMG]url[IMG]
    msg = msg.replace(/<img.*?src="(.*)?".*?\/>/, "[IMG]$1[/IMG]");
    return msg;
  },
  // 解析UBB为html 格式：[IMG]xxx.png[/IMG] => <img src="url" />
  toHTML: function (msg) {
    // msg = msg.replace(/\[IMG\]([^\[]*)\[\/IMG\]/ig, '<img data-fullsize="" class="clip" src="$1" />');
    msg = msg.replace(/\[IMG\]([^\[]*)\[\/IMG\]/ig, function (match, thumb) {
      //var fullsize = thumb.replace(/_s/g, "");
      return '<img class="clip" src="' + thumb + '" />';
    });
    return msg;
  },
  // 删除
  // https://gitlab.talk-fun.com/docs/api-docs/blob/master/backend/open/live/interaction.md#%E5%88%A0%E9%99%A4%E8%81%8A%E5%A4%A9
  delete(delOjb) {
    if (delOjb) {
      tools.ajax({
        type: 'GET',
        url: STATIC.APP_HOST + '/live/interaction.php',
        data: {
          access_token: sdkStore.room.access_token,
          action: 'delChat',
          xid: delOjb.xid,
          time: delOjb.time,
          uuid: delOjb.uuid || 0
        },
        success: delOjb.callback,
        error: delOjb.callback
      })
    }
  },
  // 回复
  // https://gitlab.talk-fun.com/docs/api-docs/blob/master/backend/open/live/interaction.md#%E5%9B%9E%E5%A4%8D%E8%81%8A%E5%A4%A9
  reply(replyObj) {
    if (replyObj) {
      var atAry = '[]'
      if (replyObj.at) {
        if (tools._typeof(replyObj.at) === 'array') {
          atAry = JSON.stringify(replyObj.at)
        }
      }
      tools.ajax({
        type: 'POST',
        url: STATIC.APP_HOST + '/live/interaction.php',
        data: {
          // access_token: store.getters('getToken'),
          access_token: sdkStore.room.access_token,
          action: 'replyChat',
          at: atAry, // @的用户，二维数组[[xid,nickname],[123,wesin],...]
          msg: replyObj.msg,
          quoteMsg: replyObj.quoteMsg
        },
        success: replyObj.callback,
        error: replyObj.callback
      })
    }
  },
  // 查看大图
  showImageFullSize: function (source, callback) {
    if (source && callback && typeof callback === "function") {
      var imgUrl = source.replace(/_s/g, "");
      callback(imgUrl);
    }
  },
  // 粘贴图片
  onpaste: function (e, callback) {
    var that = this;
    var URLObj = window.URL || window.webkitURL;
    var items = (e.clipboardData || e.originalEvent.clipboardData).items;
    // 贴图
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.type.indexOf("image") > -1) {
        var blob = item.getAsFile(),
          source = URLObj.createObjectURL(blob),
          reader = new FileReader();
        that.latestParseObj = blob;
        // 监听粘贴图片
        callback(source);
        reader.readAsDataURL(blob);
      }
    }
  },
  // 截图请求
  postClipPhoto: function (callback) {
    if (callback && typeof callback === "function") {
      this.uploadFile(this.latestParseObj, callback);
    }
  },
  // 上传图片
  uploadFile: function (file, callback) {
    var fd = new FormData();
    fd.append("Filedata", file);
    // files 上传
    var xhr = new XMLHttpRequest();
    xhr.upload.onprogress = function (e) {
      var percentComplete = (e.loaded / e.total) * 100;
      tools.debug("chat image Uploaded " + percentComplete + "%");
    };
    xhr.onload = function () {
      if (xhr.status == 200) {
        callback?.(JSON.parse(xhr.responseText));
      } else {
        callback?.("Error! Upload failed");
      }
    };
    xhr.onerror = function () {
      callback?.("Error! Upload failed. Can not connect to server.");
    };
    let initData = sdkStore.room.initData
    xhr.open("POST", initData.chatImageUploadUrl || STATIC.PROTOCOL + "fp2.talk-fun.com/live/api/uploadImage.php?access_token=" + room.getAccessToken(), true);
    xhr.send(fd);
  },
  // 弹幕操作
  danmakuHandle: function (packet, player) {
    switch (packet.eventName) {
      // 开启
      case "danmaku:open":
        player.getPlayer(function (mainPlayer) {
          mainPlayer.jsCallFlash("danmaku:open", "");
        });
        break;
      // 关闭
      case "danmaku:close":
        player.getPlayer(function (mainPlayer) {
          mainPlayer.jsCallFlash("danmaku:close", "");
        });
        break;
      // 设置颜色
      case "danmaku:set:color":
        player.getPlayer(function (mainPlayer) {
          mainPlayer.jsCallFlash("danmaku:set:color", {
            color: packet.data.color
          });
        });
    };
  },
  // 弹幕
  danmaku: function (packet, player) {
    return false
    var msg = packet.args.msg || packet.args.data.msg,
      temAry = [],
      obj = {
        "c": msg
      };
    temAry.push(obj);
    temAry = JSON.stringify(temAry);
    player.getPlayer(function (mainPlayer) {
      mainPlayer.jsCallFlash("user:chat:data", temAry);
    });
  },
  // 私聊
  private (chatObj) {
    if (chatObj) {
      tools.ajax({
        type: 'GET',
        dataType: 'jsonp',
        timeout: 5000,
        url: STATIC.APP_HOST + '/live/interaction.php',
        data: {
          access_token: chatObj.token,
          action: 'privateChat',
          xid: chatObj.xid || 0
        },
        success: chatObj.callback,
        error: chatObj.callback
      })
    }
  }
};
export default chat;
// });