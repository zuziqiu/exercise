/*=============================================================================
#     FileName: chat.js
#         Desc: 聊天模块
#       Author: lee, Marko
#        Email: luoliuyou@talk-fun.com
#        Phone: 13602436266
#      Version: 0.0.1
#   LastChange: 2015-11-12 10:28:04
#      History:
=============================================================================*/
// define(function (require) {
  var room = require('./room.init')
  
  // imports
  import map from "@map"
  import STATIC from './mt.static'
  import tools from "@tools"
  import Store from '@Store'
  import socket from './socket.init'
  import * as TYPES from './store/types'

  const chat = {
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
    // 查看大图
    showImageFullSize: function (source, callback) {
      if (source && callback && typeof callback === "function") {
        var imgUrl = source.replace(/_s/g, "");
        callback(imgUrl);
      }
    },
    // 获取聊天列表
    getList: function () {
      return Store.dispatch(TYPES.GET_CHAT_LIST).then(res => {
        if (res && res.data) {
          if (res.data.length > 0) {
            res.data.forEach(function (item) {
              socket.dealMemberAvatar(item)
            })
          }
          map.get('chat:list')(res.data)
        }
      })
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
          callback && callback(JSON.parse(xhr.responseText));
        } else {
          callback && callback("Error! Upload failed");
        }
      };
      xhr.onerror = function () {
        callback && callback("Error! Upload failed. Can not connect to server.");
      };
      xhr.open("POST", STATIC.PROTOCOL + "fp2.talk-fun.com/live/api/uploadImage.php?access_token=" + room.getAccessToken(), true);
      xhr.send(fd);
    },
    // 聊天扩展
    /*dispatch: function(flag, packet, player) {
        switch(flag){
            // 弹幕
            case "danmaku":
                this.danmaku(packet);
                break;        
        }
    },*/
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
            mainPlayer.jsCallFlash("danmaku:set:color", { color: packet.data.color });
          });
      };
    },
    // 弹幕
    danmaku: function (packet, player) {
      if (tools.isMobile()) {
        return false;
      }
      var msg = packet.args.msg || packet.args.data.msg,
        temAry = [],
        obj = { "c": msg };
      temAry.push(obj);
      temAry = JSON.stringify(temAry);
      player.getPlayer(function (mainPlayer) {
        mainPlayer.jsCallFlash("user:chat:data", temAry);
      });
    }
  };

  // return chat;
  export default chat
// });
