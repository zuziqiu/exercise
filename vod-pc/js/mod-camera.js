/**
 * @点播摄像头模块
 * @author JT.Liu, Marko
 */

(function (root, nameSpace) {
  // .HT
  var HT = root.HT || {}
  root[nameSpace] = {}
  // camera 模块
  HT.modCamera = {

    // 第二步调用全屏
    FullScreen: function (id) {
      var that = this;
      //获取容器、video播放器
      // var camera_play = document.getElementById('camera_play');
      //获取播放器容器
      var video = document.querySelector(id);
      //判断是否有全屏类名
      if (''.indexOf.call(video.classList, 'FullScreenChange') != -1) {
        //删除全屏类名
        video.classList.remove('FullScreenChange');
        video.lastChild.classList.remove('change');
        //退出全屏模式
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {  //火狐
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { //谷歌
          document.webkitExitFullscreen();
        }
        // video.lastChild.style.width = "280px";
        // video.lastChild.style.height = "210px";

      } else {
        //添加类名 即代表摄像头全屏状态
        video.classList.add('FullScreenChange');
        video.lastChild.classList.add('change');
        //进入全屏状态
        if (video) {
          if (video.requestFullscreen) { //其它
            video.requestFullscreen();
          } else if (video.mozRequestFullScreen) { //火狐
            video.mozRequestFullScreen();
          } else if (video.webkitRequestFullScreen) { //谷歌
            video.webkitRequestFullScreen();
          } else if (video.msRequestFullscreen) { //IE
            video.msRequestFullscreen();
          }
        }

        //改变容器宽高 实现播放器全屏
        // video.lastChild.style.width = "100%";
        // video.lastChild.style.height = "100%";
      }

    },

    // 第一步 dom 插入到 camera 指定元素
    render: function (warpId, id) {
      // 如果目标节点为video，插入全屏按钮
      // todo...
      var play_content = document.querySelector(warpId),
        videoTagName = play_content.childNodes;

      //判断当前是flash还是h5 如果是flash，h5全屏按钮不显示
      // for(var i = 0;i<videoTagName.length;i++){
      // if(videoTagName[i].tagName === 'VIDEO'){
      var tepl = template(id);
      $(warpId).append(tepl);
      // }
      // }

      // append dom => camera
    },

    // 全屏功能
    screen_v: function (warpId, id) {
      var that = this;
      // 插入节点
      that.render(warpId, id)
      // 点击全屏
      $('#mod_camera_player').on('click', '.fullScreen_btn', function () {
        that.FullScreen(warpId);
      });
      // 双击全屏
      $('#camera_play').dblclick(function () {
        that.FullScreen(warpId);
      });
      //移入移出事件
      $('#mod_camera_player').on({
        mouseover: function () {
          $('.camera_fullScreen').removeClass('hidden');
        },
        mouseout: function () {
          $('.camera_fullScreen').addClass('hidden');
        }
      });
    },
    screen_ppt: function (warpId, id) {
      // if ($(warpId).find('video')) {
      //   $('.ppt_fullScreen').removeClass('hidden')
      // }
      var that = this
      that.render(warpId, id)
      // 点击全屏
      $('#mod_main_player').on('click', '.fullScreen_btn', function () {
        that.FullScreen(warpId);
      });
      // 双击全屏
      $('#mod_main_player').dblclick(function () {
        that.FullScreen(warpId);
      });
      $('#mod_main_player').on('contextmenu', function () {
        return false;
      })
    },
    // 禁止摄像头右键
    videoCamera: function () {
      var that = this;
      $('#mtAuthorPlayer_html5_api').on('contextmenu', function () {
        return false
      })
    },

    // 外部调用
    init: function (warpId, id) {
      if (warpId === '#mod_camera_player') {
        this.screen_v(warpId, id)
      } else {
        this.screen_ppt(warpId, id)
      }
      this.videoCamera();
    },
  }
  // 暴露 & 重写
  root.HT = HT
  // 定义命名空间 `modVodCamera`
})(window, 'modVodCamera')

// 调用
// window.modVodCamera.init('容器id')