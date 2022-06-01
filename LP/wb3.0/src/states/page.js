// page
export const pageState = {
  // 翻页数据
  pptId: 0,
  whiteboardId: 0,
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
  isSend: 1, // 1表示要将当前的PPT数据发送出去（见于发起端），0表示不用发送（见于主播嘉宾接收端）
  isWebpSupport: null,
  turnPages: [] // 翻动过的页数
}
