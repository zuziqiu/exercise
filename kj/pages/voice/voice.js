var global_data = getApp().globalData;

Page({
  data: {
    size:{
      _windowWidth: 0,
      _windowHeight: 0
    },
    render_data:{
      tips:"提示",
      price: "10",
      free: true,
      audioIntro: "音频介绍不为空啊"
    }
  },
  onLoad: function () {
    this.setData({
      size:{
        _windowWidth: global_data._windowWidth,
        _windowHeight: global_data._windowHeight
      }
    })
  }
})