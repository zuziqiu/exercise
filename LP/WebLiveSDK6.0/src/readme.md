## 云直播 Web-Live-SDK v2.1(todo...)

#### 生命周期
开始 => 初始化 => 销毁

#### 核心文件
- src/core/h5.player-core 初始化播放逻辑入口
- src/core/mediaCore 播放器逻辑相关
- src/core/member 用户管理相关
- src/core/log 统计模块
- src/core/flv.player flv播放器模块
- src/core/hls.player hls播放器模块
- src/core/rts.player rtc播放器模块
- src/core/flash.player flash播放器模块
- src/core/cmd.handle 客户端 & iframe 数据交互模块
- src/core/mt.static 常量模块
- src/core/cmd.statis 统计模块汇集

#### 同步机制
- hls 8秒同步固定
- flv 读取 SEI 数据
- rts 固定500ms延迟
- schedule.js 设立同步逻辑
- 声画同步机制: `socekt收到指令 => 读取 cmd.delay（视频到本地延迟差）展示指令`

#### 超时机制
- PPT 错误机制
- PPT 超时报错
- 视频设置5秒最大超时

  