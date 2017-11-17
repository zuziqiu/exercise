var global_data = getApp().data.global_data;

Page({
  data: {
    render_data:{
      tips:"提示",
      price: "10",
      free: global_data.free
    }
  },
  onLoad: function () {
    var that = this;
    // this.data.view = getApp().data.res;
  }
})