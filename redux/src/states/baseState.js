/**
 * State 基础数据结构
 */
export const state = {
  // Start ----- 测试数据 ------ ###
  testObject: 1,
  testArray: [
    'http://lp2-4.talk-fun.com/doc/78/ce/7f/ab414c5698294bf981f29512da/5_1.jpeg',
    'http://lp2-4.talk-fun.com/doc/78/ce/7f/ab414c5698294bf981f29512da/4_1.jpeg'
  ],
  // End ----- 测试数据 ------ ###
  // 房间
  room: {
    mode: 'WHITEBOARD', //WHITEBOARD or PPT
    roomType: '1', //房间模式
    setPageData: {}, //翻页数据
    pptId: 0,
    whiteboardId: 0,
    version: '1.8.7' //版本号
  },
  // 画板属性
  whiteboard: {
    brushType: 'curve', //笔刷类型
    drawPower: true, //涂鸦权限
    backgroundColor: '#008000', //画板颜色
    strokeWidth: 4, // 涂鸦的粗细
    strokeColor: '#FFFFFF', //涂鸦颜色
    strokeOpacity: 1, //透明度
    strokeLineCap: 'round' //角样式
  },
  // 涂鸦数据
  pageDrawData: {
    // 画板
    WHITEBOARD: {
      // 默认 => 10002
      // '10002': {
      //   d1: 'xxx|xx|xx|xxx|xxx',
      //   d2: 'xx|xxx|xx|xx|xx|xxx|xxxx|xxdged'
    },
    // PPT数据
    PPT: {
      // 数据模版
      // '1': {
      //   d1: '132323|231231|!231231|1231|123123|123',
      //   l1: '3123|123123|123123|123123|!231231|123',
      // }
    }
  },
  // 画板数据
  WHITEBOARD: {
    // '10002': {
    //   backgroundColor: 'red'
    // }
  },
  // 课件图片资源
  PPT: {
    // '1': {
    //   url: 'http://placekitten.com/g/800/600',
    //   subPage: [
    //     {
    //       '1': 'http://fpoimg.com/800x600?bg_color=C2FCF3&text_color=000'
    //     },
    //     {
    //       '2': 'http://fpoimg.com/800x600?bg_color=C2FCF3&text_color=011'
    //     }
    //   ]
    // },
    // '2': {
    //   url: 'http://placeimg.com/800/600/nature'
    // },
    // '3': {
    //   url: 'http://placeimg.com/1280/600/nature'
    // }
  },
  // id计数
  // drawId: {
  //   line: 0,
  //   path: 0,
  //   circle: 0
  // },
  // DrawId 每次涂鸦自增
  drawId: 1,
  // 画板PageNumber
  // whiteboardId: 10002,
  // 操作类(临时建立)
  operation: {
    erase: false, //删除单条
    eraseAll: false, //删除全部

  },
  // 历史操作记录 20 次
  history: {
    type: 'holding',
    isSend: '',
    PPT: {},
    WHITEBOARD: {}
    // backward: [], //前进
    // forward: [] //后退
  },
  // 翻页数据
  page: {
    pageAmount: 0, //总页数
    currentPage: 0, //当前页
    currentSubPage: 0, //当前子页
    pageIndex: 0, //当前分页索引
    pageSubIndex: 0, //子页索引
    pageIndexs: [], //翻页索引
    // pptPages: [], //PPT翻页数据
    pageComputed: [], //总分页
    action: 'wait' //翻页动作
  },
  // 课件资源
  cousewareResource: {
    img: null, //当前ppt图片
  },
  // 课件信息资源
  pptInfoResource: {
    width: 0, //原始宽
    height: 0, //原始高
    ratio: 0, //原始比例
    scale: 0 //当前缩放比
  },
  // debug模式
  debugMode: 'true',
  // PPT滚动
  isScrollPPT: 'false',
}