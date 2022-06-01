## 欢拓 SDK v7.0 +

#### 生命周期
  - finishInterface 初始化接口请求成功之前
  - beforeSocket socket连接成功之前
  - finishSocket socket连接成功之后
  - (createdCameraPlayer 、createdVideoPlayer 、createdCoursewarePlayer) 创建相对应的播放模块之后，不耦合
  - mounted sdk完成初始化和socket连接，并且创建完播放器

#### 核心文件
  - src/core/liveControler 初始化播放逻辑入口
  - src/core/mediaControler 播放器逻辑相关
  - src/core/liveStats 统计模块
  - src/core/cmdHandle 客户端 & iframe 数据交互模块
  - src/core/liveStatis 统计模块汇集
  - src/mediaPlayer/flvPlayer flv播放器模块
  - src/mediaPlayer/hlsPlayer hls播放器模块
  - src/mediaPlayer/rtsPlayer rtc播放器模块

#### 同步机制
  - hls 8秒同步固定
  - flv 读取 SEI 数据
  - rts 固定500ms延迟
  - schedule.js 设立同步逻辑
  - 声画同步机制: `socekt收到指令 => 读取 cmd.delay（视频到本地延迟差）展示指令`

#### 超时机制
  - 视频设置5秒最大超时

#### [url可以接收的参数](./urlParam)

  