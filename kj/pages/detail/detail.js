// pages/detail/detail.js
var global_data = getApp().globalData;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    size:{
      _windowWidth: 0,
      _windowHeight: 0
    },
    default_tab: true,
    render_data:{
      join_num: 0,
      courseInfo: {
        courseName: "这个是课程名称",
        startTimeStr: "这个是开始时间",
        courseDesc: "123",
        detail: ""
      },
      teacherInfo: {
        name: "豪",
        saleTotal: 100,
        studentCount: 101
      }
    }
  },
  // 跳转邀请卡
  invitation: function(){
    wx.navigateTo({
      url: './../invitation/invitation'
    })
  },
  // 切换tab
  changeTab: function(){
    this.setData({
      default_tab: !this.data.default_tab
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      size:{
        _windowWidth: global_data._windowWidth,
        _windowHeight: global_data._windowHeight
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})