/**
 * Action 事件名定义
 */
// 身份
export const PAGE_BASE = 'PAGE_BASE' // 身份。主播：10002  嘉宾20002
// 画板属性相关
export const WHITEBOARD_CONTAINER_ID = 'WHITEBOARD_CONTAINER_ID' //画板容器
export const WHITEBOARD_BACKGROUND_COLOR = 'WHITEBOARD_BACKGROUND_COLOR' //背景色
export const WHITEBOARD_BRUSH_STROKE_COLOR = 'WHITEBOARD_BRUSH_STROKE_COLOR' //颜色
export const WHITEBOARD_BRUSH_STROKE_WIDTH = 'WHITEBOARD_BRUSH_STROKE_WIDTH' //画笔粗细
export const WHITEBOARD_BRUSH_OPACITY = 'WHITEBOARD_BRUSH_OPACITY' //透明度
export const WHITEBOARD_BRUSH_TYPE = 'WHITEBOARD_BRUSH_TYPE' //画笔类型 [曲线 直线 虚线 箭头 矩形 圆形 文字]
export const WHITEBOARD_BRUSH_DATA = 'WHITEBOARD_BRUSH_DATA' // 画笔数据 {src: 'xxx', fontSize: 'xxx', color: 'xxx'}
export const UPDATE_WHITEBOARD_DATA = 'UPDATE_WHITEBOARD_DATA' //更新画板属性数据
// 历史相关
export const HISTORY_ADD_BRANCH = 'HISTORY_ADD_BRANCH'
export const HISTORY_TYPE_UPDATE = 'HISTORY_TYPE_UPDATE'
export const WHITEBOARD_HISTORY_BACKWARE = 'WHITEBOARD_HISTORY_BACKWARE' //触发后退
export const WHITEBOARD_HISTORY_FORWARE = 'WHITEBOARD_HISTORY_FORWARE' //触发前进
export const HISTORY_BACKWARE_ACTION = 'HISTORY_BACKWARE_ACTION' //后退动作
export const HISTORY_FORWARE_ACTION = 'HISTORY_FORWARE_ACTION' //前进动作
export const HISTORY_CLEAN_ACTION = 'HISTORY_CLEAN_ACTION' //清空当前历史分支
export const WHITEBOARD_ERASER = 'WHITEBOARD_ERASER' //橡皮擦
export const UPDATE_PAGE_DRAW_DATA = 'UPDATE_PAGE_DRAW_DATA' //c更新本页涂鸦数据
// 翻页相关
export const UPDATE_PAGE_AMOUNT = 'UPDATE_PAGE_AMOUNT' //总
export const PAGE_PREV = 'PAGE_PREV' //上
export const PAGE_NEXT = 'PAGE_NEXT' //下
// 房间相关
export const UPDATE_ROOM_RELOAD = 'UPDATE_ROOM_RELOAD' // 是否显示刷新按钮
export const UPDATE_ROOM_SET_TOKEN = 'UPDATE_ROOM_SET_TOKEN' // 设置token
export const ROOM_MODE_CHANGE = 'ROOM_MODE_CHANGE' //房间模式切换[桌面分享 视频插播 ...]
export const ADD_DRAW_WHITEBOARD = 'ADD_DRAW_WHITEBOARD' //新增黑板
export const DELETE_WHITEBOARD = 'DELETE_WHITEBOARD' //删除黑板
export const ADD_DRAW_PPT = 'ADD_DRAW_PPT' //新增ppt
export const UPDATE_ROOM_MODE = 'UPDATE_ROOM_MODE' //模式更改
export const UPDATE_PPT_TYPE = 'UPDATE_PPT_TYPE' //0=>普通PPT 1=>动画PPT 
export const UPDATE_ROOM_DRAW_ENABLE = 'UPDATE_ROOM_DRAW_ENABLE' //powerEnable
export const UPDATE_ROOM_CURUSER = 'UPDATE_ROOM_CURUSER' // 当前用户身份信息
export const UPDATE_ROOM_HANDLER_XID = 'UPDATE_ROOM_HANDLER_XID' //更新操作者xid
export const UPDATE_NATIVE_GRAPHIC = 'UPDATE_NATIVE_GRAPHIC' // 直播器在画板2.4.9以上会用自己的原生涂鸦渲染层+画板的文档层，1=>原生涂鸦渲染层+画板的文档层，0=>画板涂鸦渲染层+画板的文档层
// 课件相关
// export const DOC_MODE_CHANGE = 'DOC_MODE_CHANGE' //课件类型切换
export const SWITCH_PAGE_STATUS = 'SWITCH_PAGE_STATUS' //切换PPT时的的进度状态
export const LIVE_SET_PAGE = 'LIVE_SET_PAGE' //课件切换
export const UPDATE_DOC_IMG = 'UPDATE_DOC_IMG' //课件图片切换
export const UPDATE_PAGE_DATA = 'UPDATE_PAGE_DATA' //更新页码数据
export const UPDATE_PPT_DATA = 'UPDATE_PPT_DATA' //更新PPT数据
export const ADD_PPT_PAGE = 'ADD_PPT_PAGE' //新增PPT页码
export const UPDATE_PPT_PAGE_SCALE = 'UPDATE_PPT_PAGE_SCALE' //更新PPT scale
// export const UPDATE_PPT_PAGE_OFFSET = 'UPDATE_PPT_PAGE_OFFSET' // 更新PPT的滚动距离
export const UPDATE_PPT_PAGE_POST_TOP = 'UPDATE_PPT_PAGE_POST_TOP' // 更新PPT发送的滚动距离
export const UPDATE_WHITEBOARD_PAGE = 'UPDATE_WHITEBOARD_PAGE' // 更新翻动过的页数 
export const WEBP_SUPPORT = 'WEBP_SUPPORT' // 更新支持jpeg的记录字段
// export const UPDATE_PPT_PAGEINDEX = 'UPDATE_PPT_PAGEINDEX'
// 客户端相关
export const CLIENT_DATA_TRANSPORT = 'CLIENT_DATA_TRANSPORT' //客户端数据传输
// 图形ID自增
export const DRAW_ID_INCREMENT = 'DRAW_ID_INCREMENT' // ID自增
// 显示/隐藏Test
// export const TEST_CONTROL_VISIBLE = 'TEST_CONTROL_VISIBLE'
export const FIRE_DEBUG_MODE = 'FIRE_DEBUG_MODE'
// 控制gif
export const GIF_SWITCH = 'GIF_SWITCH'
// 显示/隐藏滚动PPT的按钮
export const IS_SCROLL_PPT = 'IS_SCROLL_PPT'
// ppt图片数据
export const PPT_INFO_SOURCE = 'PPT_INFO_SOURCE'
// ppt加载的状态
export const PPT_LOAD_STATUS = 'PPT_LOAD_STATUS'
// 初始化逛滚动的postTop
export const PPT_SCROLL_POST_TOP_INFO = 'PPT_SCROLL_POST_TOP_INFO'
// 资源重试
// 更新域名组
export const UPDATE_HOST_GROUP = 'UPDATE_HOST_GROUP'
export const UPDATE_TRY_GROUP = 'UPDATE_TRY_GROUP'

// PPT动画对象
export const UPDATE_ANIMATION_PPT_DATA = 'UPDATE_ANIMATION_PPT_DATA'
export const UPDATE_ANIMATION_PPT_URL = 'UPDATE_ANIMATION_PPT_URL'
export const UPDATE_ANIMATION_PPT_STATE = 'UPDATE_ANIMATION_PPT_STATE'
export const UPDATE_PPT_ANIMATION_RESET = 'UPDATE_PPT_ANIMATION_RESET'

// resize
export const WHITEBOARD_RESIZE = 'WHITEBOARD_RESIZE'
// export const  CANVAS_RESIZE = 'CANVAS_RESIZE'
export const PPT_RESIZE = 'PPT_RESIZE'
