// 0=>上一步无别的操作  1=>上一步含有别的操作
const type = 1
// 应用静态ppt文档 
const applyPPT = [
  // 直播一开始未有画板时就直接应用静态PPT文档
  [{ "key": "LIVE_SET_PAGE", "isSend": "1", "data": { "pageIndex": "10002", "subIndex": "1", "id": "10002", "ret": { "backgroundColor": "#2B6846" }, "pageAmount": "1" } },
  { "key": "WHITEBOARD_BRUSH_TYPE", "type": "25", "data": "" },
  { "key": "WHITEBOARD_BRUSH_STROKE_COLOR", "data": "#FF4B4B" },
  { "key": "LIVE_SET_PAGE", "isSend": 1, "type": "pptx", "w_h": { "width": 1280, "height": 720 }, "data": { "pageIndex": "1", "subIndex": "1", "id": "1629319", "ret": { "suffix": ".jpg", "currentPage": "1", "serverPath": "https://s2.talk-fun.com/8/doc/44/c4/72/22e628c620f6338397976b1459/", "html5": "", "pages": { "3": { "subPage": [] }, "2": { "subPage": [] }, "1": { "subPage": [] } }, "path": "file:///E:\\CloudLive\\save\\doc\\44c47222e628c620f6338397976b1459" }, "pageAmount": "3" } }],
  // 已经有画板，再手动添加静态PPT文档
  [{ "key": "LIVE_SET_PAGE", "w_h": { "width": 1280, "height": 720 }, "data": { "pageIndex": "1", "pageAmount": "3", "id": "1629319", "ret": { "path": "file:///E:\\CloudLive\\save\\doc\\44c47222e628c620f6338397976b1459", "suffix": ".jpg", "pages": { "1": { "subPage": [] }, "3": { "subPage": [] }, "2": { "subPage": [] } }, "serverPath": "https://s2.talk-fun.com/8/doc/44/c4/72/22e628c620f6338397976b1459/", "html5": "", "currentPage": "1" }, "subIndex": "1" }, "type": "pptx", "isSend": 1 }]
]
//应用动态PPT文档
const applyTrendsPPT = [
  // 直播一开始未有画板时就直接应用静态PPT文档
  [{ "data": { "pageAmount": "1", "pageIndex": "10002", "id": "10002", "subIndex": "1", "ret": { "backgroundColor": "#2B6846" } }, "key": "LIVE_SET_PAGE", "isSend": "1" },
  { "data": "", "key": "WHITEBOARD_BRUSH_TYPE", "type": "25" },
  { "data": "#FF4B4B", "key": "WHITEBOARD_BRUSH_STROKE_COLOR" },
  { "data": { "ret": { "suffix": ".jpg", "serverPath": "https://s2.talk-fun.com/8/doc/29/5d/b1/8a934a6a5a5444d595422c6dc7/", "html5": { "html": "h5/ppt.html", "thumb": "https://s2.talk-fun.com/8/doc/29/5d/b1/8a934a6a5a5444d595422c6dc7/h5/thumb.jpg" }, "path": "file:///E:\\CloudLive\\save\\doc\\295db18a934a6a5a5444d595422c6dc7", "pages": { "17": { "subPage": [] }, "9": { "subPage": [] }, "24": { "subPage": [] }, "7": { "subPage": [] }, "13": { "subPage": [] }, "22": { "subPage": [] }, "18": { "subPage": [] }, "19": { "subPage": [] }, "8": { "subPage": [] }, "23": { "subPage": [] }, "2": { "subPage": ["1", "2", "3", "4", "5"] }, "16": { "subPage": [] }, "12": { "subPage": [] }, "4": { "subPage": [] }, "10": { "subPage": [] }, "1": { "subPage": [] }, "21": { "subPage": [] }, "25": { "subPage": [] }, "14": { "subPage": [] }, "3": { "subPage": [] }, "6": { "subPage": [] }, "11": { "subPage": [] }, "20": { "subPage": [] }, "15": { "subPage": [] }, "5": { "subPage": [] } }, "currentPage": "1" }, "pageIndex": "1", "pageAmount": "25", "id": "1621861", "subIndex": "1" }, "key": "LIVE_SET_PAGE", "isSend": 1, "type": "pptx", "w_h": { "width": 1280, "height": 720 } }],
  // 已经有画板，再手动添加动态PPT文档
  [{ "w_h": { "width": 1280, "height": 720 }, "key": "LIVE_SET_PAGE", "isSend": 1, "type": "pptx", "data": { "subIndex": "1", "pageIndex": "1", "id": "1621861", "pageAmount": "25", "ret": { "suffix": ".jpg", "serverPath": "https://s2.talk-fun.com/8/doc/29/5d/b1/8a934a6a5a5444d595422c6dc7/", "pages": { "4": { "subPage": [] }, "15": { "subPage": [] }, "10": { "subPage": [] }, "19": { "subPage": [] }, "3": { "subPage": [] }, "5": { "subPage": [] }, "25": { "subPage": [] }, "22": { "subPage": [] }, "21": { "subPage": [] }, "20": { "subPage": [] }, "18": { "subPage": [] }, "17": { "subPage": [] }, "8": { "subPage": [] }, "2": { "subPage": ["1", "2", "3", "4", "5"] }, "13": { "subPage": [] }, "24": { "subPage": [] }, "6": { "subPage": [] }, "12": { "subPage": [] }, "23": { "subPage": [] }, "16": { "subPage": [] }, "14": { "subPage": [] }, "9": { "subPage": [] }, "11": { "subPage": [] }, "7": { "subPage": [] }, "1": { "subPage": [] } }, "path": "file:///E:\\CloudLive\\save\\doc\\295db18a934a6a5a5444d595422c6dc7", "html5": { "thumb": "https://s2.talk-fun.com/8/doc/29/5d/b1/8a934a6a5a5444d595422c6dc7/h5/thumb.jpg", "html": "h5/ppt.html" }, "currentPage": "1" } } }]
];
// 应用pdf文档
const applyPdf = [
  // 直播一开始未有画板时就直接应用pdf文档
  [{ "data": { "id": "10002", "pageIndex": "10002", "subIndex": "1", "pageAmount": "1", "ret": { "backgroundColor": "#2B6846" } }, "key": "LIVE_SET_PAGE", "isSend": "1" },
  { "data": "", "key": "WHITEBOARD_BRUSH_TYPE", "type": "25" },
  { "data": "#FF4B4B", "key": "WHITEBOARD_BRUSH_STROKE_COLOR" },
  { "data": { "id": "1621993", "pageIndex": "1", "subIndex": "1", "pageAmount": "16", "ret": { "path": "file:///E:\\CloudLive\\save\\doc\\f0381e90ad379d479919a0a6d5fecbbe", "currentPage": "1", "serverPath": "https://s2.talk-fun.com/4/doc/f0/38/1e/90ad379d479919a0a6d5fecbbe/", "pages": { "8": { "subPage": [] }, "10": { "subPage": [] }, "4": { "subPage": [] }, "15": { "subPage": [] }, "16": { "subPage": [] }, "2": { "subPage": [] }, "7": { "subPage": [] }, "12": { "subPage": [] }, "3": { "subPage": [] }, "14": { "subPage": [] }, "6": { "subPage": [] }, "13": { "subPage": [] }, "5": { "subPage": [] }, "1": { "subPage": [] }, "9": { "subPage": [] }, "11": { "subPage": [] } }, "html5": "", "suffix": ".jpg" } }, "isSend": 1, "w_h": { "height": 1811, "width": 1280 }, "key": "LIVE_SET_PAGE", "type": "pdf" }],
  // 已经有画板，再手动添加pdf文档
  [{ "w_h": { "width": 1280, "height": 1811 }, "data": { "id": "1621993", "pageIndex": "1", "pageAmount": "16", "ret": { "suffix": ".jpg", "pages": { "2": { "subPage": [] }, "5": { "subPage": [] }, "10": { "subPage": [] }, "14": { "subPage": [] }, "11": { "subPage": [] }, "15": { "subPage": [] }, "16": { "subPage": [] }, "9": { "subPage": [] }, "13": { "subPage": [] }, "6": { "subPage": [] }, "1": { "subPage": [] }, "4": { "subPage": [] }, "3": { "subPage": [] }, "7": { "subPage": [] }, "12": { "subPage": [] }, "8": { "subPage": [] } }, "html5": "", "path": "file:///E:\\CloudLive\\save\\doc\\f0381e90ad379d479919a0a6d5fecbbe", "currentPage": "1", "serverPath": "https://s2.talk-fun.com/4/doc/f0/38/1e/90ad379d479919a0a6d5fecbbe/" }, "subIndex": "1" }, "key": "LIVE_SET_PAGE", "isSend": 1, "type": "pdf" }]
]
// 应用doc文档
const applyDoc = [
  // 直播一开始未有画板时就直接应用doc文档
  [{ "key": "LIVE_SET_PAGE", "isSend": "1", "data": { "id": "10002", "pageAmount": "1", "subIndex": "1", "pageIndex": "10002", "ret": { "backgroundColor": "#2B6846" } } },
  { "key": "WHITEBOARD_BRUSH_TYPE", "type": "25", "data": "" },
  { "key": "WHITEBOARD_BRUSH_STROKE_COLOR", "data": "#FF4B4B" },
  { "w_h": { "height": 1122, "width": 793 }, "key": "LIVE_SET_PAGE", "type": "docx", "isSend": 1, "data": { "id": "1627239", "pageAmount": "2", "pageIndex": "1", "subIndex": "1", "ret": { "path": "file:///E:\\CloudLive\\save\\doc\\93ca231afe8bb429d2ed9abe27abcf01", "pages": { "2": { "subPage": [] }, "1": { "subPage": [] } }, "serverPath": "https://s2.talk-fun.com/8/doc/93/ca/23/1afe8bb429d2ed9abe27abcf01/", "html5": "", "suffix": ".jpg", "currentPage": "1" } } }],
  // 已经有画板，再手动添加doc文档
  [{ "key": "LIVE_SET_PAGE", "isSend": 1, "type": "docx", "data": { "ret": { "suffix": ".jpg", "currentPage": "1", "pages": { "2": { "subPage": [] }, "1": { "subPage": [] } }, "path": "file:///E:\\CloudLive\\save\\doc\\93ca231afe8bb429d2ed9abe27abcf01", "serverPath": "https://s2.talk-fun.com/8/doc/93/ca/23/1afe8bb429d2ed9abe27abcf01/", "html5": "" }, "pageIndex": "1", "id": "1627239", "subIndex": "1", "pageAmount": "2" }, "w_h": { "height": 1122, "width": 793 } }]
]
export const qtClientData = [
  // 添加画板
  { "isSend": "1", "key": "LIVE_SET_PAGE", "data": { "id": "10002", "pageAmount": "1", "pageIndex": "10002", "subIndex": "1", "ret": { "backgroundColor": "#2B6846" } } },
  // 应用图片
  { "key": "WHITEBOARD_BRUSH_TYPE", "data": { "effect": 0, "src": "file:///E:\\CloudLive\\save\\pic\\e53d7d2090ab76c63bb9aafd1249bae8\\origin.jpg", "server_path": "https://s2.talk-fun.com/8/doc/e5/3d/7d/2090ab76c63bb9aafd1249bae8/origin.jpg" }, "type": "11", "isSend": "1" },
  { "key": "WHITEBOARD_BRUSH_TYPE", "data": "", "type": "25" },
  // 修改画板颜色后添加画板
  { "data": { "id": "10005", "pageAmount": "1", "ret": { "backgroundColor": "#1E2021" }, "subIndex": "1", "pageIndex": "10005" }, "isSend": "1", "key": "LIVE_SET_PAGE" },
  // 画板 ==> 画板 
  { "key": "LIVE_SET_PAGE", "isSend": "1", "data": { "ret": { "backgroundColor": "#2B6846" }, "pageAmount": "1", "pageIndex": "10006", "subIndex": "1", "id": "10006" } },
  // 应用海报
  { "key": "LIVE_SET_PAGE", "data": { "ret": { "backgroundColor": "#FFFFFF" }, "pageIndex": "10003", "pageAmount": "1", "id": "10003", "subIndex": "1" }, "isSend": "1" },
  { "key": "WHITEBOARD_BRUSH_TYPE", "type": "11", "data": { "server_path": "https://s2.talk-fun.com/8/doc/e5/3d/7d/2090ab76c63bb9aafd1249bae8/origin.jpg", "src": "file:///E:\\CloudLive\\save\\pic\\e53d7d2090ab76c63bb9aafd1249bae8\\origin.jpg", "effect": 1 }, "isSend": "1" },
  // 海报 ==> 画板
  { "key": "LIVE_SET_PAGE", "data": { "ret": { "backgroundColor": "#2B6846" }, "pageIndex": "10004", "pageAmount": "1", "id": "10004", "subIndex": "1" }, "isSend": "1" },
  // 画板 ==> 海报
  { "key": "LIVE_SET_PAGE", "data": { "ret": { "backgroundColor": "#FFFFFF" }, "pageIndex": "10005", "pageAmount": "1", "id": "10005", "subIndex": "1" }, "isSend": "1" },
  { "key": "WHITEBOARD_BRUSH_TYPE", "type": "11", "data": { "server_path": "https://s2.talk-fun.com/8/doc/e5/3d/7d/2090ab76c63bb9aafd1249bae8/origin.jpg", "src": "file:///E:\\CloudLive\\save\\pic\\e53d7d2090ab76c63bb9aafd1249bae8\\origin.jpg", "effect": 1 }, "isSend": "1" },
  // 应用静态ppt文档
  ...applyPPT[type],
  // 静态PPT翻页
  { "key": "LIVE_SET_PAGE", "data": { "pageIndex": "2", "pageAmount": "3", "id": "1629319", "subIndex": "1" }, "isSend": "1" },
  // ppt ==> 画板
  { "key": "LIVE_SET_PAGE", "isSend": "1", "data": { "id": "10002", "ret": { "backgroundColor": "#2B6846" }, "pageAmount": "1", "pageIndex": "10002", "subIndex": "1" } },
  // 画板 ==> ppt
  { "key": "LIVE_SET_PAGE", "isSend": "1", "data": { "id": "1629319", "pageAmount": "1", "pageIndex": "1", "subIndex": "1" } },
  // 应用动态PPT文档
  ...applyTrendsPPT[type],
  // 动态PPT翻页(鼠标与键盘翻页，直到动画完成后的第二页) 
  { "key": "LIVE_SET_PAGE", "isSend": "1", "data": { "subIndex": "1", "pageIndex": "2", "pageAmount": "25", "id": "1621861" } },
  { "key": "LIVE_SET_PAGE", "isSend": "1", "data": { "subIndex": "2", "pageIndex": "2", "pageAmount": "25", "id": "1621861" } },
  { "key": "LIVE_SET_PAGE", "isSend": "1", "data": { "subIndex": "3", "pageIndex": "2", "pageAmount": "25", "id": "1621861" } },
  { "key": "LIVE_SET_PAGE", "isSend": "1", "data": { "subIndex": "4", "pageIndex": "2", "pageAmount": "25", "id": "1621861" } },
  { "key": "LIVE_SET_PAGE", "isSend": "1", "data": { "subIndex": "5", "pageIndex": "2", "pageAmount": "25", "id": "1621861" } },
  { "key": "LIVE_SET_PAGE", "isSend": "1", "data": { "subIndex": "1", "pageIndex": "3", "pageAmount": "25", "id": "1621861" } },
  // 应用pdf文档
  ...applyPdf[type],
  // pdf ==> 动态PPT
  { "w_h": { "width": 1280, "height": 720 }, "data": { "id": "1621861", "pageIndex": "1", "pageAmount": "25", "ret": { "suffix": ".jpg", "pages": { "4": { "subPage": [] }, "17": { "subPage": [] }, "2": { "subPage": ["1", "2", "3", "4", "5"] }, "5": { "subPage": [] }, "10": { "subPage": [] }, "21": { "subPage": [] }, "11": { "subPage": [] }, "19": { "subPage": [] }, "15": { "subPage": [] }, "23": { "subPage": [] }, "16": { "subPage": [] }, "3": { "subPage": [] }, "7": { "subPage": [] }, "8": { "subPage": [] }, "22": { "subPage": [] }, "20": { "subPage": [] }, "6": { "subPage": [] }, "14": { "subPage": [] }, "9": { "subPage": [] }, "18": { "subPage": [] }, "13": { "subPage": [] }, "1": { "subPage": [] }, "12": { "subPage": [] }, "24": { "subPage": [] }, "25": { "subPage": [] } }, "html5": { "thumb": "https://s2.talk-fun.com/8/doc/29/5d/b1/8a934a6a5a5444d595422c6dc7/h5/thumb.jpg", "html": "h5/ppt.html" }, "path": "file:///E:\\CloudLive\\save\\doc\\295db18a934a6a5a5444d595422c6dc7", "currentPage": "1", "serverPath": "https://s2.talk-fun.com/8/doc/29/5d/b1/8a934a6a5a5444d595422c6dc7/" }, "subIndex": "1" }, "key": "LIVE_SET_PAGE", "isSend": 1, "type": "pptx" },
  // 应用pdf文档  -----为了下面能跑全
  ...applyPdf[type],
  // pdf ==> ppt
  { "w_h": { "width": 1680, "height": 945 }, "data": { "id": "1626959", "pageIndex": "1", "pageAmount": "1", "ret": { "suffix": ".jpg", "pages": { "1": { "subPage": [] } }, "html5": "", "path": "file:///E:\\CloudLive\\save\\doc\\d2c9cde6f23cb58c075db65a60ffe796", "currentPage": "1", "serverPath": "https://s2.talk-fun.com/7/doc/d2/c9/cd/e6f23cb58c075db65a60ffe796/" }, "subIndex": "1" }, "key": "LIVE_SET_PAGE", "isSend": 1, "type": "pptx" },
  // ppt ==> pdf
  { "w_h": { "width": 1280, "height": 1811 }, "data": { "id": "1621993", "pageIndex": "1", "pageAmount": "16", "ret": { "suffix": ".jpg", "pages": { "2": { "subPage": [] }, "5": { "subPage": [] }, "10": { "subPage": [] }, "14": { "subPage": [] }, "11": { "subPage": [] }, "15": { "subPage": [] }, "16": { "subPage": [] }, "9": { "subPage": [] }, "13": { "subPage": [] }, "6": { "subPage": [] }, "1": { "subPage": [] }, "4": { "subPage": [] }, "3": { "subPage": [] }, "7": { "subPage": [] }, "12": { "subPage": [] }, "8": { "subPage": [] } }, "html5": "", "path": "file:///E:\\CloudLive\\save\\doc\\f0381e90ad379d479919a0a6d5fecbbe", "currentPage": "1", "serverPath": "https://s2.talk-fun.com/4/doc/f0/38/1e/90ad379d479919a0a6d5fecbbe/" }, "subIndex": "1" }, "key": "LIVE_SET_PAGE", "isSend": 1, "type": "pdf" },
  // 应用doc文档
  ...applyDoc[type],
  // doc翻页（鼠标与键盘翻页都一样）
  { "key": "LIVE_SET_PAGE", "isSend": "1", "data": { "id": "1627239", "pageIndex": "2", "subIndex": "1", "pageAmount": "2" } },
  // // 修改涂鸦颜色
  // {"key": "WHITEBOARD_BRUSH_STROKE_COLOR", "data": "#2BDE7F"},
  // // 修改涂鸦大小
  // {"key": "WHITEBOARD_BRUSH_DATA", "data": {"fontSize": "24"}},
  // // 窗口或容器尺寸改变
  // {"key": "LIVE_SET_PAGE", "isSend": "1", "data": {"id": "1626959", "pageAmount": "1", "pageIndex": "1", "subIndex": "1"}},
  // {"key": "LIVE_SET_PAGE", "isSend": "1", "data": {"id": "10002", "ret": {"backgroundColor": "#2B6846"}, "pageAmount": "1", "pageIndex": "10002", "subIndex": "1"}},
  // // 画板全屏
  // // 点击全屏
  // {"data": {"id": "1621861", "pageIndex": "2", "pageAmount": "25", "subIndex": "1"}, "key": "LIVE_SET_PAGE", "isSend": "1"},
  // {"data": {"id": "1621861", "pageIndex": "1", "pageAmount": "25", "subIndex": "1"}, "key": "LIVE_SET_PAGE", "isSend": "1"},
  // // 取消全屏
  // {"data": {"id": "1621861", "pageIndex": "2", "pageAmount": "25", "subIndex": "1"}, "key": "LIVE_SET_PAGE", "isSend": "1"},
  // {"data": {"id": "1621861", "pageIndex": "1", "pageAmount": "25", "subIndex": "1"}, "key": "LIVE_SET_PAGE", "isSend": "1"},
]