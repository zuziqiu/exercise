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
    pageBase: 10002,
    mode: 'WHITEBOARD', //WHITEBOARD or PPT
    roomType: '1', //房间模式
    pptType: 0, // 0=>普通PPT，1=>动画PPT
    setPageData: {}, //翻页数据
    pptId: 0,
    whiteboardId: 0,
    powerEnable: true,
    version: '2.5.2-11', //版本号
    curUser: null,
    // 包含id
    whiteboardContainerId: null
  },
  // debug模式
  debugMode: 'false',
  // 画板属性
  whiteboard: {
    container: null, //容器
    brushType: '25', //笔刷类型
    brushData: {
      // src在直播器中是本地图片
      src: '',
      // server_path在直播器中是flush的地址
      server_path: '',
      // 字体大小
      fontSize: '20',
    }, //画笔数据
    drawPower: false, //涂鸦权限
    backgroundColor: '#EEEEEE', //画板颜色
    strokeWidth: 4, // 涂鸦的粗细
    strokeColor: '#ff0000', //涂鸦颜色
    strokeOpacity: 1, //透明度
    strokeLineCap: 'round' //角样式
  },
  // clientDrawData: {
  //   // todo
  // },
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
    pages: {},
    path: null,
    serverPath: null,
    imageServerPath: null,
    suffix: '.jpg'
  },
  // 动画PPT
  animatePPT: {
    state: null,
    h5PPTUrl: null, //加载ppt-ifr
    pageAmount: 0, // 总页数
    curStep: 0, // 当前动画步骤
    curPage: 0, // 当前页
    pageIndex: 0, //当前下标
    pageComputed: [], //总页数
    pptType: 0 // 0=>普通PPT，1=>动画PPT
  },
  // DrawId 每次涂鸦自增
  drawId: 1,
  // 历史操作记录 20 次
  history: {
    type: 'holding',
    isSend: '',
    PPT: {},
    WHITEBOARD: {}
  },
  // 翻页数据
  page: {
    pptType: 0, // 1=>动画PPT，0=>静态PPT
    pageAmount: 0, //总页数
    currentPage: 0, //当前页
    currentSubPage: 0, //当前子页
    pageIndex: 0, //当前分页索引
    pageSubIndex: 0, //子页索引
    pageIndexs: [], //翻页索引
    // pptPages: [], //PPT翻页数据
    pageComputed: [], //总分页
    action: 'wait', //翻页动作
    status: 'done', // wait || loading || done 表示切换PPT时的状态
    isSend: 1 // 1表示要将当前的PPT数据发送出去（见于发起端），0表示不用发送（见于主播嘉宾接收端）
  },
  // 课件资源
  cousewareResource: {
    img: null //当前ppt图片
  },
  // 课件信息资源
  pptInfoResource: {
    width: 0, //原始宽
    height: 0, //原始高
    ratio: 0, //原始比例
    scale: 0, //当前缩放比
    loaded: 'false' // 当前PPT加载状态
  },
  // PPT滚动
  isScrollPPT: 'false',
  // 资源重试
  sourceReLoad: {
    hostGroup: [],
    // currentGroup: []
  },
}