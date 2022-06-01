// 画板属性
export const wbPropertyState = {
  container: null, //容器
  brushType: '25', //笔刷类型
  brushData: { //画笔数据
    // src在直播器中是本地图片
    src: '',
    // server_path在直播器中是flush的地址
    server_path: '',
    // 字体大小
    fontSize: '20',
  },
  backgroundColor: '#EEEEEE', //画板颜色
  strokeWidth: 4, // 涂鸦的粗细
  strokeColor: '#ff0000', //涂鸦颜色
  strokeOpacity: 1, //透明度
  strokeLineCap: 'round' //角样式
}