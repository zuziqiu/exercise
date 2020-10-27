/* 
* @Author: anchen
* @Date:   2015-10-23 14:21:41
* @Last Modified by:   anchen
* @Last Modified time: 2017-02-15 18:29:33
*/

/**
 * pc-点播
 * 
 */
var HT = window.HT || {};
var __Event = "click";
// MTCMS 初始化
HT.vod = {
  // CDN验证
  getCDNPath: function (res) {
    if (window.TF_getStaticHost) {
      return window.TF_getStaticHost(res);
    } else {
      return res;
    }
  },
  // 初始化
  init: function (sdk) {
    var that = this;
    this.backInfor();
    //this.bottomBar();   
    this.mationInfor();
    this.marker(sdk);
  },
  // markid
  marker: function (sdk) {
    var mark = HTSDK.modules.get('mod_theftproof_playback')
    if (mark.enable > 0) {
      if (sdk.plugins().marker) {
        sdk.plugins().marker.init('#mod_ppt_player')
      }
    }
  },

  /*底栏*/
  bottomBar: function () {
    var that = this;
    var bottom_info = HTSDK.modules.footerbar("mod_footer_playback");
    if (bottom_info.enable == 1) {
      $(".mod_footer").show();
      $(".mod_footer").css('height', bottom_info.footerHeight);
    } else {
      $(".mod_footer").hide();
    }

  },

  /*主播信息*/
  mationInfor: function () {
    var that = this;
    var vod_info = HTSDK.modules.information("mod_zhuboinfo_playback");
    if (vod_info.mationEnable == 1) {
      $("#camera_play").on("mouseover", function (e) {
        if (!isChangeVideo) {
          $(".teach_infor").show();
        }
      });
      $("#camera_play").on("mouseout", function (e) {
        $(".teach_infor").hide();
      });
    } else {
      $(".teach_infor").hide();
    }

  },

  /*回放信息*/
  backInfor: function () {
    var that = this;
    var vod_info = HTSDK.modules.playback("mod_playbackinfo_playback");
    if (vod_info.enable == 1) {//总开关开
      if (vod_info.chatEnable == 0 && vod_info.qaEnable == 0) {  //聊天、提问关闭时
        $("#mod_col_right").hide();
        $("#room").addClass("close_right");
        $(".carousel").addClass("active");
        $(".right").hide();
      } else if (vod_info.chatEnable == 1 && vod_info.qaEnable == 0) { //聊天开、提问关
        $("#chat_nav .tab_n2").hide();
        $("#chat_nav .tab_n1").addClass("onlyone");
        $("#chat_nav .tab_n1").removeClass("current");
      } else if (vod_info.chatEnable == 0 && vod_info.qaEnable == 1) { //聊天关、提问开
        $("#question_list").show();
        $("#chat_nav .tab_n1").hide();
        $("#chat_list").hide()
        $("#chat_nav .tab_n2").addClass("onlyone");
        $("#chat_nav .tab_n2").removeClass("current");
        HT.baseExecute.isLoadQuestion = 1;
      }
    } else {//总开关关

      $("#mod_col_right").hide();
      $("#room").addClass("close_right");
      $(".carousel").addClass("active");
      $(".right").hide();
    }
  },
};

/*黑板*/
function notFind(obj) {
  obj.src = "http://static-1.talk-fun.com/open/cooperation/default/vod-pc/css/img/error.png";
  $(obj).addClass('bord');
  $(obj).parent().siblings('.playing_text').html("黑板");
}



