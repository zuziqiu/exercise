//index.js
//获取应用实例
const app = getApp()
const global_data = app.globalData;

Page({
  data: {
    size:{
      _windowWidth: 0,
      _windowHeight: 0
    },
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: './../detail/detail'
    })
  },
  video: function(){
    wx.navigateTo({
      url: './../video/video'
    })
  },
  voice: function(){
    wx.navigateTo({
      url: './../voice/voice'
    })
  },
  onLoad: function () {
    this.setData({
      size:{
        _windowWidth: global_data._windowWidth,
        _windowHeight: global_data._windowHeight
      }
    });
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
