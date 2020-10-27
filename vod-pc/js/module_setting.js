"use strict";
/**
 * author: Marko Xin Lianghua;
 * version: v1.2;
 * note: 用于抽离后台模块设置数据切割
 * 配置说明：点播||直播设置全局变量: 
 * window.__vod__ = true;
 * window.__live__ = true;
 */

var HTSDK = window.HTSDK || {};
// 模块分离
HTSDK.modules = {
  // 具体模块拆分对象
  moduleBlocks: {},
  setModulesDatas: function (data) {
    if (data) {
      this.moduleBlocks = data;
    }
    this.live.init();
  },
  // 直播(心)
  live: {
    data: this.moduleBlocks,
    init: function () {
      var _modeData = this.moduleBlocks || window.modules_config || {};
      HTSDK.modules.set(_modeData);
    }
  },

  // 点播(华)
  vod: {
    /*Parent: HTSDK,*/
    data: this.moduleBlocks,
    init: function () {
      var that = this.Parent;
      HTSDK.modules.set(window.modules_config);
    }

  },
  // 模块切割(设置模块)
  set: function (modules) {
    var that = this;
    if (typeof (modules) !== "undefined") {
      for (var i in modules) {
        that.moduleBlocks[i] = modules[i];
      }

    } else {
      //do nothing
    }
  },
  // 获取模块(通过id this.modulesBlocks["name"])
  get: function (id) {
    return this.moduleBlocks[id] || false;
  },
  //判断模块
  judgeModules: function () {
    var that = this;
    //回调
    HTSDK.modules.modulesGetData(function (data) {
      that.render(data);
    });
  },

  /*左侧 ———Start*/
  //主播信息功能
  information: function (mationId) {
    var __modInfoEnable = HTSDK.modules.get(mationId).enable;
    return {
      mationEnable: __modInfoEnable //主播信息总开关
    }
  },

  /*底栏功能*/
  footerbar: function (barId) {
    /*var __modFooterEnable = HTSDK.modules.get(barId).enable,
      __modFooterHeight = HTSDK.modules.get(barId).config.footerHeight;
      return {
        enable: __modFooterEnable,      //底栏总开关
        footerHeight: __modFooterHeight //底栏高度
      }*/
  },

  /*回放信息*/
  playback: function () {
    return {
      enable: window.playBackVideo ? window.playBackVideo.modules.mod_playbackinfo_playback.enable : '1',         //回放信息总开关
      chatEnable: window.playBackVideo ? window.playBackVideo.modules.mod_playbackinfo_playback.config.chat.enable : '1',  //聊天开关
      qaEnable: window.playBackVideo ? window.playBackVideo.modules.mod_playbackinfo_playback.config.qa.enable : '1',      //问答开关
    }
  },

  //直播信息
  liveinfo: function (liveId) {
    var __modLiveinfoEnable = HTSDK.modules.get(liveId).enable,
      __modLiveTimeEnable = HTSDK.modules.get(liveId).config.liveTime.enable,
      __modThemeEnable = HTSDK.modules.get(liveId).config.theme.enable;
    return {
      enable: __modLiveinfoEnable,
      liveTime: __modLiveTimeEnable,
      Theme: __modThemeEnable,
    }
  },
  /*右侧 ———End*/

  //文字互动模块
  _text: function (text) {
    var __modTextEnable = HTSDK.modules.get(text).enable,
      __modChatEnable = HTSDK.modules.get(text).config.chat.enable,
      __modQaEnable = HTSDK.modules.get(text).config.qa.enable;
    return {
      enable: __modTextEnable,
      chat: __modChatEnable,
      qa: __modQaEnable
    }
  },

  // 打赏
  _reward: function (reward) {
    var __rewardRewardEnable = HTSDK.modules.get(reward).enable;
    return {
      enable: __rewardRewardEnable
    }
  },
  _playRate: function (text) {
    // return;
    var __modPlayRate = HTSDK.modules.get(text).enable;
    return {
      enable: __modPlayRate
    }
  },

  //入口
  init: function () {
    var that = this;
    var vod = window.__vod__ || false,
      live = window.__live__ || false;
    this.vod.data = this.moduleBlocks;
    this.live.data = this.moduleBlocks;
    if (vod) {
      HTSDK.modules.vod.init();
    } else {
      HTSDK.modules.live.init();
    }
  }
};

$(function () {
  // 总入口
  HTSDK.modules.init();
});



