var global_data = getApp().globalData;

Page({
  data: {
    render_data:{
      tips:"提示",
      price: "10",
      free: global_data.free,
      _windowWidth: global_data._windowWidth,
      _windowHeight: global_data._windowHeight
    }
  },
  onLoad: function () {
    var that = this;
    console.log(that.data.render_data._windowWidth)
    // this.data.view = getApp().data.res;
  }
})