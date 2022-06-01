const connect = [
  /**
   * @event connect 服务器连接成功
   * @example
   * TF.on('connect', function(data) {todo()})
   */
  'connect',

  /**
   * @event connect_failed 服务器连接失败
   * @example
   * TF.on('connect_failed', function(data) {todo()})
   */
  'connect_failed',

  /**
   * @event connect_error 服务器连接错误
   * @example
   * TF.on('connect_error', function(data) {todo()})
   */
  'connect_error',

  /**
   * @event disconnect 服务器连接断开
   * @example
   * TF.on('disconnect', function(data) {todo()})
   */
  'disconnect',

  /**
   * @event reconnect 服务器重连
   * @example
   * TF.on('reconnect', function(data) {todo()})
   */
  'reconnect',

  /**
   * @event reconnecting 服务器重新连接中
   * @example
   * TF.on('reconnecting', function(data) {todo()})
   */
  'reconnecting',

  /**
   * @event reconnect_error 服务器重连错误
   * @example
   * TF.on('reconnect_error', function(data) {todo()})
   */
  'reconnect_error',

  /**
   * @event reconnect_failed 服务器重连失败
   * @example
   * TF.on('reconnect_failed', function(data) {todo()})
   */
  'reconnect_failed'
]

const system = [
  /**
   * @event system:room:error 系统错误信息处理（token错误、被踢出、房间已满等）
   * @example
   * TF.on('system:room:error', function(data) {todo()})
   */
  'system:room:error',

  /**
   * @event system:socket:error 注册socket监听事件失败或者socket对象不存在
   * @example
   * TF.on('system:socket:error', function(data) {todo()})
   */
  'system:socket:error'
]

const live = [
  /**
   * @event live:start 直播开始
   * @example
   * TF.on('live:start', function(title) {todo()})
   */
  'live:start',

  /**
   * @event live:stop 直播停止
   * @example
   * TF.on('live:stop', function(data) {todo()})
   */
  'live:stop',

  /**
   * @event live:wait 未开播
   * @example
   * TF.on('live:wait', function(data) {todo()})
   */
  'live:wait',
  /**
   * @event live:video:onplay 桌面分享/视频播放中
   * @example
   * TF.on('live:video:onplay', function(data) {todo()})
   */
  'live:video:onplay',

  /**
   * @event live:camera:play 摄像头播放中
   * @example
   * TF.on('live:camera:play', function(data) {todo()})
   */
  'live:camera:play',

  /**
   * @event live:camera:pause 摄像头暂停
   * @example
   * TF.on('live:camera:pause', function(data) {todo()})
   */
  'live:camera:pause',

  /**
   * @event live:video:pause 桌面分享/视频暂停
   * @example
   * TF.on('live:video:pause', function(data) {todo()})
   */
  'live:video:pause',

  /**
   * @event live:set:page 课件翻页
   * @example
   * TF.on('live:set:page', function(data) {todo()})
   */
  'live:set:page',

  /**
   * @event live:has:whiteboard 初始化是否存在画板
   * @example
   * TF.on('live:has:whiteboard', function(data) {todo()})
   */
  'live:has:whiteboard',

  /**
   * @event live:room:configs 房间课程设置信息
   * @example
   * TF.on('live:room:configs', function(data) {todo()})
   */
  'live:room:configs',

  /**
   * @event live:robots:users 特殊用户（机器人）
   * @example
   * TF.on('live:robots:users', function(data) {todo()})
   */
  'live:robots:users',

  /**
   * @event live:data:update 直播相关信息
   * @example
   * TF.on('live:data:update', function(data) {todo()})
   */
  'live:data:update',

  /**
   * @event live:reward
   * @ignore
   * @deprecated  应该废弃
   * @example
   * TF.on('live:reward', function(data) {todo()})
   */
  'live:reward',
  //生活直播用到的指令
  'reward:success',
  /**
   * @event live:tech:order 切换媒体格式
   * @example
   * TF.on('live:tech:order', function(data) {todo()})
   */
  'live:tech:order',

  /**
   * @event live:media:play 播放模式
   * @deprecated live:mode:change替代
   * @example
   * TF.on('live:media:play', function(data) {todo()})
   */
  'live:media:play',

  /**
   * @event live:network:list 获取线路
   * @example
   * TF.on('live:network:list', function(data) {todo()})
   */
  'live:network:list',

  /**
   * @event live:mode:change 模式切换
   * @example
   * TF.on('live:mode:change', function(curMode, beformode, nativeMode) {todo()})
   */
  'live:mode:change',

  /**
   * @event live:power:change 权限切换
   * @example
   * TF.on('live:power:change', function(data) {todo()})
   */
  'live:power:change',

  /**
   * @event live:course 课程信息
   * @example
   * TF.on('live:course', function(data) {todo()})
   */
  'live:course',

  /**
   * @event live:room:modules 模块设置信息
   * @example
   * TF.on('live:room:modules', function(data) {todo()})
   */
  'live:room:modules',

  /**
   * @event live:course:access:error 信息错误未允许进入
   * @description  信息错误[1260-1263].include(data.code)未允许进入
   * @example
   * TF.on('live:course:access:error', function(data) {todo()})
   */
  'live:course:access:error',

  /**
   * @event live:definition 监听清晰度选择
   * @example
   * TF.on('live:definition', function(data) {todo()})
   */
  'live:definition',

  /**
   * @event livePlayerCallback
   * @deprecated flash方法，已废弃
   * @example
   * TF.on('livePlayerCallback', function(data) {todo()})
   */
  'livePlayerCallback',

  /**
   * @event live:camera:error 视频/摄像头播放错误
   * @example
   * TF.on('live:camera:error', function({code, src}) {todo()})
   */
  'live:camera:error',

  /**
   * @event live:video:fail 媒体断流超时
   * @example
   * TF.on('live:video:fail', function(data) {todo()})
   */
  'live:video:fail',

  /**
   * @event live:duration 当前播放时间
   * @ignore
   * @description  直播不需要
   * @example
   * TF.on('live:duration', function(data) {todo()})
   */
  'live:duration',

  /**
   * @event live:desktop:start 桌面分享/视频开启
   * @example
   * TF.on('live:desktop:start', function(data) {todo()})
   */
  'live:desktop:start',

  /**
   * @event live:video:timeout 桌面分享/视频播放超时
   * @example
   * TF.on('live:video:timeout', function(data) {todo()})
   */
  'live:video:timeout',

  /**
   * @event live:desktop:play 桌面分享/视频播放
   * @example
   * TF.on('live:desktop:play', function(data) {todo()})
   */
  'live:desktop:play',

  /**
   * @event live:desktop:pause 桌面分享/视频暂停
   * @example
   * TF.on('live:desktop:pause', function(data) {todo()})
   */
  'live:desktop:pause',

  /**
   * @event live:desktop:stop 桌面分享/视频停止
   * @example
   * TF.on('live:desktop:stop', function(data) {todo()})
   */
  'live:desktop:stop',

  /**
   * @event live:video:ratio 桌面分享/视频比例 or 摄像头比例
   * @example
   * TF.on('live:video:ratio', function({width, height, ratio}) {todo()})
   */
  'live:video:ratio',

  /**
   * @event live:camera:loadeddata 摄像头loadeddata事件
   * @example
   * TF.on('live:camera:loadeddata', function(data) {todo()})
   */
  'live:camera:loadeddata',

  /**
   * @event live:camera:abort 摄像头abort事件
   * @example
   * TF.on('live:camera:abort', function(data) {todo()})
   */
  'live:camera:abort',

  /**
   * @event live:video:abort 桌面分享/视频abort事件
   * @example
   * TF.on('live:video:abort', function(data) {todo()})
   */
  'live:video:abort',

  /**
   * @event live:video:error 桌面分享/视频error事件
   * @example
   * TF.on('live:video:error', function(data) {todo()})
   */
  'live:video:error',

  /**
   * @event live:camera:ended 摄像头ended事件
   * @example
   * TF.on('live:camera:ended', function(data) {todo()})
   */
  'live:camera:ended',

  /**
   * @event live:video:ended 桌面分享/视频ended事件
   * @example
   * TF.on('live:video:ended', function(data) {todo()})
   */
  'live:video:ended',

  /**
   * @event live:camera:suspend 摄像头suspend事件
   * @example
   * TF.on('live:camera:suspend', function(data) {todo()})
   */
  'live:camera:suspend',

  /**
   * @event live:video:suspend 桌面分享/视频suspend事件
   * @example
   * TF.on('live:video:suspend', function(data) {todo()})
   */
  'live:video:suspend',

  /**
   * @event live:video:stalled 桌面分享/视频stalled事件
   * @example
   * TF.on('live:video:stalled', function(data) {todo()})
   */
  'live:video:stalled',

  /**
   * @event live:camera:waiting 摄像头等待
   * @example
   * TF.on('live:camera:waiting', function(data) {todo()})
   */
  'live:camera:waiting',

  /**
   * @event live:video:waiting 桌面分享/视频等待
   * @example
   * TF.on('live:video:waiting', function(data) {todo()})
   */
  'live:video:waiting',

  /**
   * @event live:camera:timeupdate 摄像头更新时间
   * @example
   * TF.on('live:camera:timeupdate', function(data) {todo()})
   */
  'live:camera:timeupdate',

  /**
   * @event live:video:timeupdate 桌面分享/视频更新时间
   * @example
   * TF.on('live:video:timeupdate', function(data) {todo()})
   */
  'live:video:timeupdate',

  /**
   * @event live:camera:timeout 桌面分享/视频超时
   * @example
   * TF.on('live:camera:timeout', function(data) {todo()})
   */
  'live:camera:timeout',

  /**
   * @event live:media:timeout 桌面分享/视频超时
   * @example
   * TF.on('live:media:timeout', function(data) {todo()})
   */
  'live:media:timeout',

  /**
   * @event live:question:error 获取问答列表失败
   * @example
   * TF.on('live:question:error', function(data) {todo()})
   */
  'live:question:error',

  /**
   * @event live:get:question:error 获取问答byID error
   * @ignore
   * @description 不需要在文档对外声明
   * @example
   * TF.on('live:get:question:error', function(data) {todo()})
   */
  'live:get:question:error',

  /**
   * @event live:init:success 请求init接口成功
   * @deprecated 将废弃，建议使用生命周期函数finishInterface or mounted
   * @example
   * TF.on('live:init:success', function(data) {todo()})
   */
  'live:init:success',

  /**
   * @event live:video:loaded 桌面分享/视频loaded事件
   * @example
   * TF.on('live:video:loaded', function(data) {todo()})
   */
  'live:video:loaded',

  /**
   * @event live:video:loadeddata 桌面分享/视频loadeddata事件
   * @example
   * TF.on('live:video:loadeddata', function(data) {todo()})
   */
  'live:video:loadeddata',

  /**
   * @event live:video:metadata 桌面分享/视频metadata事件
   * @example
   * TF.on('live:video:metadata', function(data) {todo()})
   */
  'live:video:metadata',

  /**
   * @event live:video:loadstart 桌面分享/视频loadstart事件
   * @example
   * TF.on('live:video:loadstart', function(data) {todo()})
   */
  'live:video:loadstart',

  /**
   * @event live:video:playing 桌面分享/视频playing事件
   * @ignore
   * @description 与live:video:play重复
   * @example
   * TF.on('live:video:playing', function(data) {todo()})
   */
  'live:video:playing',

  /**
   * @event live:video:seeking 桌面分享/视频seeking事件
   * @ignore
   * @description 直播不需要
   * @example
   * TF.on('live:video:seeking', function(data) {todo()})
   */
  'live:video:seeking',

  /**
   * @event live:seek:finish 桌面分享/视频播放中
   * @ignore
   * @description 直播不需要，这个事件或将被废弃，2021/12/14
   * @example
   * TF.on('live:seek:finish', function(data) {todo()})
   */
  'live:seek:finish',

  /**
   * @event live:video:play 桌面分享/视频playing事件
   * @example
   * TF.on('live:video:play', function(data) {todo()})
   */
  'live:video:play',

  /**
   * @event live:video:durationchange 桌面分享/视频播放中
   * @ignore
   * @description  直播不需要，这个事件或将被废弃，2021/12/14
   * @example
   * TF.on('live:video:durationchange', function(data) {todo()})
   */
  'live:video:durationchange',

  /**
   * @event live:time 桌面分享/视频播放中
   * @ignore
   * @description 用于计算延迟时间，不需要在文档对外声明该事件
   */
  'live:time',

  /**
   * @event live:message:append
   * @ignore
   * @description 未明
   */
  'live:message:append',

  /**
   * @event live:seek:begin
   * @ignore
   * @description 未明
   */
  'live:seek:begin',

  /**
   * @event live:info 直播信息
   * @ignore
   * @description 未明如何使用
   */
  'live:info',

  /**
   * @event live:player:check:microphone:state 桌面分享/视频播放中
   * @ignore
   * @description 应该被丢弃了
   */
  'live:player:check:microphone:state',

  /**
   * @event live:player:size 监听player尺寸变化
   * @example
   * TF.on('live:player:size', function(data) {
   *    if (data.type == 'camera') todo();
   *    if (data.type == 'video') todo();
   * })
   */
  'live:player:size',
  /*
   * 直播器互动盒子用到的key
   */
  'liveStatus:update',
    /*
   * 直播器互动盒子用到的key
   */
  'zhubo:course:selected'
]

const camera = [
  /**
   * @event camera:start 摄像头开启
   * @example
   * TF.on('camera:start', function(data) {todo()})
   */
  'camera:start',

  /**
   * @event camera:stop 摄像头停止
   * @example
   * TF.on('camera:stop', function(data) {todo()})
   */
  'camera:stop',

  // /**
  //  * @event camera 桌面分享/视频播放中
  //  * @example
  //  * TF.on('camera', function(data) {todo()})
  //  */
  // "camera",

  /**
   * @event cameraCallback
   * @deprecated flash方法 废弃
   * @ignore
   * @example
   * TF.on('cameraCallback', function(data) {todo()})
   */
  'cameraCallback'
]

const whiteboard = [
  /**
   * @event whiteboard:close 课件关闭
   * @example
   * TF.on('whiteboard:close', function() {todo()})
   */
  'whiteboard:close',

  /**
   * @event whiteboard:open 课件打开
   * @example
   * TF.on('whiteboard:open', function() {todo()})
   */
  'whiteboard:open',

  /**
   * @event whiteboard:error 课件指令解析错误
   * @description sdk内部事件
   * @ignore
   */
  'whiteboard:error'
]

const member = [
  /**
   * @event member:list 获取初始化在线用户列表
   * @example
   * TF.on('member:list', function(data) {todo()})
   */
  'member:list',

  // /**
  //  * @event sdk:curuser
  //  * @example
  //  * TF.on('sdk:curuser', function(data) {todo()})
  //  */
  // "sdk:curuser",

  /**
   * @event member:total 监听在线用户人数
   * @example
   * TF.on('member:total', function(data) {todo()})
   */
  'member:total',

  /**
   * @event member:voice:power 改变用户语音权限
   * @example
   * TF.on('member:voice:power', function(xid, power) {
   *    HTSDK.voice.setVoicePower(xid, power);
   * })
   */
  'member:voice:power',

  /**
   * @event member:robots 广播设置特殊用户
   * @example
   * TF.on('member:robots', function(robot) {todo(robot?.robots)})
   */
  'member:robots',

  /**
   * @event member:join:other 其他用户加入
   * @example
   * TF.on('member:join:other', function(data) {todo()})
   */
  'member:join:other',

  /**
   * @event member:leave 其他用户离开
   * @example
   * TF.on('member:leave', function(data) {todo()})
   */
  'member:leave',

  /**
   * @event member:forceout 某用户强制退出（重复登录等）
   * @example
   * TF.on('member:forceout', function(data) {
   *    if (me) {
   *      window.location.href = xxx
   *    } else {
   *
   *    }
   * })
   */
  'member:forceout',

  /**
   * @event member:kick 用户踢出
   * @example
   * TF.on('member:kick', function(data) {
   *    if (me) {
   *      window.location.href = xxx
   *    } else {
   *
   *    }
   * })
   */
  'member:kick',

  /**
   * @event member:join:me 初始化在线列表
   * @ignore
   * @example
   * TF.on('member:join:me', function(data) {todo()})
   */
  'member:join:me',
  // 大班H5补充，未明作用
  'member:forbidden'
]

const core = [
  /**
   * @event core:initdata 桌面分享/视频播放中
   * @ignore
   * @deprecated 将废弃，建议使用生命周期函数finishInterface or mounted
   * @example
   * TF.on('core:initdata', function(data) {todo()})
   */
  'core:initdata',

  /**
   * @event core:whiteboard 桌面分享/视频播放中
   * @deprecated 将废弃，之前功能是坐PPT预览在助教页floor
   * @ignore
   * @example
   * TF.on('core:whiteboard', function(data) {todo()})
   */
  'core:whiteboard'
]

const chat = [
  /**
   * @event chat:send 接收聊天
   * @example
   * TF.on('chat:send', function(data) {todo()})
   */
  'chat:send',

  /**
   * @event chat:private 接收私聊
   * @example
   * TF.on('chat:private', function(data) {todo()})
   */
  'chat:private',

  /**
   * @event chat:del 删除聊天
   * @example
   * TF.on('chat:del', function(data) {todo()})
   */
  'chat:del',

  /**
   * @event chat:reply 聊天回复
   * @example
   * TF.on('chat:reply', function(data) {todo()})
   */
  'chat:reply',

  /**
   * @event chat:disable 禁止聊天
   * @example
   * TF.on('chat:disable', function(data) {todo()})
   */
  'chat:disable',

  /**
   * @event chat:enable 允许聊天
   * @example
   * TF.on('chat:enable', function(data) {todo()})
   */
  'chat:enable',

  /**
   * @event chat:disable:all 禁止全体聊天
   * @example
   * TF.on('chat:disable:all', function(data) {todo()})
   */
  'chat:disable:all',

  /**
   * @event chat:list 初始化聊天列表
   * @deprecated 将废弃，建议使用生命周期函数finishInterface or mounted
   * @example
   * TF.on('chat:list', function(data) {todo()})
   */
  'chat:list',
  // 常用语
  'chatPhrases:edit'
]

const sign = [
  /**
   * @event sign:new 初始化签到列表
   * @example
   * TF.on('sign:new', function(data) {todo()})
   */
  'sign:new',

  /**
   * @event sign:end 签到结束
   * @example
   * TF.on('sign:end', function(data) {todo()})
   */
  'sign:end'
]

const usercamera = [
  /**
   * @event usercamera:init
   * @deprecated 初始化小班模式
   * @ignore
   * @example
   * TF.on('usercamera:init', function(data) {todo()})
   */
  'usercamera:init'
]

const flash = [
  /**
   * @ignore
   */
  'flash:player:status'
]

const flower = [
  /**
   * @event flower:get:init 获取鲜花初始化状态
   * @example
   * TF.on('flower:get:init', function(data) {todo()})
   */
  'flower:get:init',

  /**
   * @event flower:send 送花
   * @example
   * TF.on('flower:send', function(data) {todo()})
   */
  'flower:send',

  /**
   * @event flower:total 鲜花总数
   * @example
   * TF.on('flower:total', function(data) {todo()})
   */
  'flower:total',

  /**
   * @event flower:time:left 获取第一朵鲜花时间
   * @example
   * TF.on('flower:time:left', function(data) {todo()})
   */
  'flower:time:left',

  /**
   * @event flower:load:error 获取鲜花错误
   * @ignore
   * @description skd内部方法
   * @example
   * TF.on('flower:load:error', function(data) {todo()})
   */
  'flower:load:error'
]

const lottery = [
  /**
   * @event lottery:start 开始抽奖
   * @example
   * TF.on('lottery:start', function(data) {todo()})
   */
  'lottery:start',

  /**
   * @event lottery:stop 结束抽奖
   * @example
   * TF.on('lottery:stop', function(data) {todo()})
   */
  'lottery:stop',

  /**
   * @event lottery:end 未明
   * @ignore
   * @example
   * TF.on('lottery:end', function(data) {todo()})
   */
  'lottery:end'
]

const announce = [
  /**
   * @event announce:notice 公告
   * @example
   * TF.on('announce:notice', function(data) {todo()})
   */
  'announce:notice',

  /**
   * @event announce:roll 滚动通知
   * @example
   * TF.on('announce:roll', function(data) {todo()})
   */
  'announce:roll'
]

const effect = [
  /**
   * @event effect:send 动效
   * @example
   * TF.on('effect:send', function(data) {todo()})
   */
  'effect:send'
]

const question = [
  /**
   * @event question:ask 接收提问
   * @example
   * TF.on('question:ask', function(data) {todo()})
   */
  'question:ask',

  /**
   * @event question:reply 接收提问的回复
   * @example
   * TF.on('question:reply', function(data) {todo()})
   */
  'question:reply',

  /**
   * @event question:delete 删除提问
   * @example
   * TF.on('question:delete', function(data) {todo()})
   */
  'question:delete',

  /**
   * @event question:update 更新回答中状态
   * @example
   * TF.on('question:update', function(data) {todo()})
   */
  'question:update',

  /**
   * @event question:audit 通过提问
   * @example
   * TF.on('question:audit', function(data) {todo()})
   */
  'question:audit'
]

const vote = [
  /**
   * @event vote:new 发起投票
   * @example
   * TF.on('vote:new', function(data) {todo()})
   */
  'vote:new',

  /**
   * @event vote:pub 公布投票结果
   * @example
   * TF.on('vote:pub', function(data) {todo()})
   */
  'vote:pub',
  // 投票成功
  'vote:post:success',
  // 获取投票成功
  'vote:getvote:success'
]

const course = [
  /**
   * @event course:expire
   * @deprecated 废弃
   * @ignore
   * @example
   * TF.on('course:expire', function(data) {todo()})
   */
  'course:expire'
]

const voice = [
  /**
   * @event voice:speaking:user 谁在说话
   * @ignore
   * @example
   * TF.on('voice:speaking:user', function(user) {todo()})
   */
  'voice:speaking:user',

  /**
   * @event voice:speaking:list 正在说话列表
   * @ignore
   * @example
   * TF.on('voice:speaking:list', function(list) {todo()})
   */
  'voice:speaking:list',

  /**
   * @event voice:connect:success 语音云启动成功
   * @example
   * TF.on('voice:connect:success', function() {todo()})
   */
  'voice:connect:success',

  /**
   * @event voice:disconnent 语音云未开启或中断
   * @example
   * TF.on('voice:disconnent', function() {todo()})
   */
  'voice:disconnent',

  /**
   * @event voice:power 语音云音量
   * @example
   * TF.on('voice:power', function(data) {todo()})
   */
  'voice:power',

  /**
   * @event voice:unlaunch 语音云未启动
   * @example
   * TF.on('voice:unlaunch', function(flag, times) {todo()})
   */
  'voice:unlaunch',

  /**
   * @event voice:mode:change 语音云模式切换监听
   * @example
   * TF.on('voice:mode:change', function(data) {todo()})
   */
  'voice:mode:change',

  /**
   * @event voice:model:init 语音模式初始化
   * @example
   * TF.on('voice:model:init', function(data) {todo()})
   */
  'voice:model:init',

  /**
   * @event voice:volume:output 输出的设备音量
   * @example
   * TF.on('voice:volume:output', function(data) {todo()})
   */
  'voice:volume:output',

  /**
   * @event voice:volume:input 输入的设备的音量
   * @example
   * TF.on('voice:volume:input', function(data) {todo()})
   */
  'voice:volume:input',

  /**
   * @event voice:power:forbid 禁止语音说话
   * @example
   * TF.on('voice:power:forbid', function(data) {todo()})
   */
  'voice:power:forbid',

  /**
   * @event voice:power:allow 允许语音说话
   * @example
   * TF.on('voice:power:allow', function(data) {todo()})
   */
  'voice:power:allow',

  /**
   * @event voice:chairman:list 主席用户列表
   * @example
   * TF.on('voice:chairman:list', function(data) {todo()})
   */
  'voice:chairman:list',

  /**
   * @event voice:queue:init 麦序初始化
   * @example
   * TF.on('voice:queue:init', function(data) {todo()})
   */
  'voice:queue:init',

  /**
   * @event voice:queue:vlist 麦序列表
   * @example
   * TF.on('voice:queue:vlist', function(data) {todo()})
   */
  'voice:queue:vlist',

  /**
   * @event voice:queue:control 麦序列表控制
   * @example
   * TF.on('voice:queue:control', function(data) {todo()})
   */
  'voice:queue:control',

  /**
   * @event voice:queue:change 麦序列表变化
   * @example
   * TF.on('voice:queue:change', function(data) {todo()})
   */
  'voice:queue:change',

  /**
   * @event voice:queue:leave 离开
   * @example
   * TF.on('voice:queue:leave', function(data) {todo()})
   */
  'voice:queue:leave',

  /**
   * @event voice:queue:clear 清空
   * @example
   * TF.on('voice:queue:clear', function(data) {todo()})
   */
  'voice:queue:clear',

  /**
   * @event voice:queue:join 加入队列
   * @example
   * TF.on('voice:queue:join', function(data) {todo()})
   */
  'voice:queue:join',

  /**
   * @event voice:queue:reset 麦序重设
   * @example
   * TF.on('voice:queue:reset', function(data) {todo()})
   */
  'voice:queue:reset',

  /**
   * @event voice:queue:countdown 倒计时
   * @example
   * TF.on('voice:queue:countdown', function(data) {todo()})
   */
  'voice:queue:countdown',

  /**
   * @event voice:hand:up 举手事件：举手
   * @example
   * TF.on('voice:hand:up', function(data) {todo()})
   */
  'voice:hand:up',

  /**
   * @event voice:hand:leave 举手事件：离开
   * @example
   * TF.on('voice:hand:leave', function(data) {todo()})
   */
  'voice:hand:leave',

  /**
   * @event voice:hand:remove 举手事件：移除
   * @example
   * TF.on('voice:hand:remove', function(data) {todo()})
   */
  'voice:hand:remove',

  /**
   * @event voice:hand:clear 举手事件：清空
   * @example
   * TF.on('voice:hand:clear', function(data) {todo()})
   */
  'voice:hand:clear',

  /**
   * @event voice:hand:reset 举手列表初始化
   * @example
   * TF.on('voice:hand:reset', function(data) {todo()})
   */
  'voice:hand:reset',

  /**
   * @event voice:hand:allow 举手事件：允许
   * @example
   * TF.on('voice:hand:allow', function(data) {todo()})
   */
  'voice:hand:allow',

  /**
   * @event voice:hand:forbid 举手事件：禁止
   * @example
   * TF.on('voice:hand:forbid', function(data) {todo()})
   */
  'voice:hand:forbid',

  /**
   * @event voice:hand:change 举手列表更改
   * @example
   * TF.on('voice:hand:change', function(data) {todo()})
   */
  'voice:hand:change'
]

const examination = [
  /**
   * @event examination:add 开讲学员加入考试
   * @ignore
   * @example
   * TF.on('examination:add', function(data) {todo()})
   */
  'examination:add',

  /**
   * @event examination:review 未明
   * @ignore
   * @example
   * TF.on('examination:review', function(data) {todo()})
   */
  'examination:review',

  /**
   * @event examination:finish 开讲学员完成考试
   * @ignore
   * @example
   * TF.on('examination:finish', function(data) {todo()})
   */
  'examination:finish',

  /**
   * @event examination:delete 开讲删除发布状态的考试
   * @ignore
   * @example
   * TF.on('examination:delete', function(data) {todo()})
   */
  'examination:delete',

  /**
   * @event examination:end 开讲结束作答随堂测试
   * @ignore
   * @example
   * TF.on('examination:end', function(data) {todo()})
   */
  'examination:end'
]

const rtc = [
  /**
   * @event rtc:invite 小班
   * @deprecated 小班方法将被废弃
   * @ignore
   */
  'rtc:invite',

  /**
   * @event rtc:zhujiang 小班
   * @deprecated 小班方法将被废弃
   * @ignore
   */
  'rtc:zhujiang',

  /**
   * @event rtc:init 小班
   * @deprecated 小班方法将被废弃
   * @ignore
   */
  'rtc:init',
  /*
   * 下面rtc指令待补充 mark
   */
  'rtc:start',
  'rtc:stop',
  'rtc:apply',
  'rtc:up',
  'rtc:respondinvite',
  'rtc:kick',
  'rtc:down',
  'rtc:cancel'
]

const room = [
  /**
   * @event room:mode:type 房间的模式
   * @example
   * TF.on('room:mode:type', function(data) {todo()})
   */
  'room:mode:type',

  /**
   * @event room:init 房间初始化完成
   * @example
   * TF.on('room:init', function(data) {todo()})
   */
  'room:init',
  /*
   * mini3.0  初始化数据分发，发送数据给客户端
   */
  'initData:load',
  /*
   * mini3.0 显示模块
   */
  'client:load',
  /*
   * mini3.0初始化
   */
  'on:init',
  /*
   * mini3.0子弹窗私聊
  */
  'child:chat:private',
  /*
   * mini3.0学员完成考试
  */
  'examination:submit',
  /*
   * mini3.0考试更新
  */
  'examination:updateSubmitCount',
  'chat:private:init',
  /*
   * mini3.0 语言包接收
  */
  'language:change',
  /*
   * mini3.0 子窗口更新语言包
  */
  'child:language:change',
  /*
   * mini3.0 子窗口初始化
  */
  'child:onload',
  /*
   * mini3.0 通知客户端mini-onload
  */
  'mini:onload',
  /*
   * mini3.0 控制重绘的gif开关
  */
  'gif:switch',
  /*
   * mini3.0
  */
  'm:member:list',
  /*
   * mini3.0 聊天区窗口 : 更新直播课信息
  */
  'liveInfo:update',
  /*
   * mini3.0
  */
  'get:live:status',
  /*
   * mini3.0 聊天区窗口 -> 更多窗口 : 同步 i18n 语言
  */
  'child:locale:get',
  /*
   * mini3.0 想弹窗发送私聊数据
  */
  'privatechat:on:ready',
  /*
   * mini3.0 向弹窗init数据
  */
  'get:initdata',
  'global:initdata',
  /*
   * mini3.0 向弹窗发送私聊数据
  */
  'privatechat:on:show',
  /*
   * mini3.0 解除禁言
  */
  'client:chat:enable',
  'chat:enable',
  'update:chat:enable',
  /*
   * mini3.0 禁言
  */
  'client:chat:disable',
  /*
   * mini3.0 更新禁言
  */
  'update:chat:disable',
  /*
   * mini3.0 
  */
  'child:onlone',
  'live:addrecord',
  /*
   * mini3.0 直播器新窗口打开一个页面
  */
  'client:show'
]

const common = [
  /**
   * @event broadcast 广播
   * @example
   * TF.on('broadcast', function(data) {todo()})
   */
  'broadcast',

  /**
   * @event network:status 网络状态
   * @example
   * TF.on('network:status', function(data) {todo()})
   */
  'network:status',

  /**
   * @event video:player 切换到了桌面分享
   * @example
   * TF.on('video:player', function(data) {todo()})
   */
  'video:player',

  /**
   * @event video:whiteboard 未明
   * @ignore
   * @example
   * TF.on('whiteboard', function(data) {todo()})
   */
  'video:whiteboard',

  // /**
  //  * @event mainPlayer
  //  */
  // "mainPlayer",

  /**
   * @event _liveIframe:broadcast 未明，sdk内部方法
   * @ignore
   * @example
   * TF.on('_liveIframe:broadcast', function(data) {todo()})
   */
  '_liveIframe:broadcast',

  /**
   * @event emit:error _HT.emit时检查到socket错误时
   * @example
   * TF.on('emit:error', function(data) {todo()})
   */
  'emit:error',

  /**
   * @event flash:load:error
   * @deprecated flash 废弃
   * @ignore
   */
  'flash:load:error',

  /**
   * @event mainPlayerCallback
   * @deprecated flash 废弃
   * @ignore
   */
  'mainPlayerCallback',

  /**
   * @event player:announce 桌面分享/视频播放中
   * @deprecated flash 废弃
   * @ignore
   */
  'player:announce',

  /**
   * @event ppt:player:loaded sdk内部方法，执行初始化doStep触发
   * @ignore
   * @example
   * TF.on('ppt:player:loaded', function(data) {todo()})
   */
  'ppt:player:loaded',

  /**
   * @event ppt:ratio 监听来自课件的ratio变化
   * @example
   * TF.on('ppt:ratio', function(data) {todo()})
   */
  'ppt:ratio',

  /**
   * @event question:error 获取问答byID error
   * @ignore
   * @description 不需要在文档对外声明
   * @example
   * TF.on('question:error', function(data) {todo()})
   */
  'question:error',

  /**
   * @event socket:on:error socket => 错误
   * @example
   * TF.on('socket:on:error', function() {todo()})
   */
  'socket:on:error',

  /**
   * @event third:broadcast 第三方广播
   * @example
   * TF.on('third:broadcast', function(data) {todo()})
   */
  'third:broadcast',

  /**
   * @event goods:put 更新上架商品
   * @example
   * TF.on('goods:put', function(data) {todo()})
   */
  'goods:put',

  /**
   * @event shopping:put 购买提示
   * @example
   * TF.on('shopping:put', function(data) {todo()})
   */
  'shopping:put',
  /**
   * @event live:on:fullscreen 未明
   * @ignore
   */
  'live:on:fullscreen'
]

const hongbao = [
  /**
   * @event hongbao:send
   * @deprecated 可能被抛弃
   * @ignore
   */
  'hongbao:send',

  /**
   * @event hongbao:received 桌面分享/视频播放中
   * @deprecated 可能被抛弃
   * @ignore
   */
  'hongbao:received',

  /**
   * @event hongbao:received:done 桌面分享/视频播放中
   * @deprecated 可能被抛弃
   * @ignore
   */
  'hongbao:received:done',
  /**
   * @event hongbao:send:success
   * @deprecated 可能被抛弃
   * @ignore
   */
  'hongbao:send:success'
]

const wx = [
  /**
   * @event wx:enter:fullscreen 监听微信摄像头进入全屏
   * @example
   * TF.on('wx:enter:fullscreen', function() {todo()})
   */
  'wx:enter:fullscreen',

  /**
   * @event wx:exit:fullscreen 监听微信摄像头退出全屏
   * @example
   * TF.on('wx:exit:fullscreen', function() {todo()})
   */
  'wx:exit:fullscreen'
]
// 生活直播用到的指令，未有时间查究作用
const goods = ['goods:add', 'goods:update', 'goods:edit']
// 生活直播用到的指令，未有时间查究作用
const popup = [
  'popup:put',
  /*
   *popup:upt是打卡的
   */
  'popup:upt',
  'popup:cancel',
  'popup:del',
  'popup:save'
]
// 生活直播点赞
const like = [
  // 生活直播用到的指令，未有时间查究作用
  'like:put'
]
export const eventModule = [
  ...hongbao,
  ...wx,
  ...whiteboard,
  ...rtc,
  ...room,
  ...member,
  ...live,
  ...core,
  ...connect,
  ...chat,
  ...system,
  ...sign,
  ...usercamera,
  ...flash,
  ...flower,
  ...lottery,
  ...announce,
  ...effect,
  ...question,
  ...vote,
  ...camera,
  ...course,
  ...voice,
  ...examination,
  ...common,
  ...goods,
  ...popup,
  ...like
]
