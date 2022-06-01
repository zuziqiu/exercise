### 画板SDK
#### v3.0 新版本画板目录
- src 
  - Action 存放mobx状态库的action，示例：[action各示例](./action注册接口.md)
  - assets  静态资源文件，有自动化测试数据 (异步加载)、图片和css
  - components 组件目录
    - Animation 模块组件：动态ppt组件
    - ErrorBoundary 错误处理组件 (暂时不用)
    - index 组件入口 (在这里给组件注入store)
    - Main 各模块组件容器
    - Poster 模块组件：海报
    - PPT 模块组件：课件
    - Test 模块组件：调试、单元测试面板
    - Whiteboard 模块组件：白板
  - core 核心文件目录
    - graphicTempObject 缓存操作对象的工具 (比如异步并且可移动的图片、可修改属性的文字和激光笔)
    - history 历史笔画 (基本不用了)
    - page  (核心文件，解析直播器或者socket传入的指令、更新store，更新并执行翻页)
  - doc 补充备注的文档目录
  - extensions 扩展功能的存放目录
    - cursor 鼠标光标的样式
    - hostMachine 域名切换机器 (资源重试)
    - useSchedule 定时列表 (跑异步任务)
    - util 工具文件 (颜色转换、数据和对象互转、计算课件src等)
    - webCommandApi (直播器、app通信js)
  - graphic 图形类目录
    - arrow 箭头 (暂时不用)
    - circle 圆圈 (用椭圆指令代替)
    - curve 自由涂鸦 (贝塞尔曲线)
    - dottedLine 虚线
    - ellipse (椭圆)
    - erase (单个擦除、全部擦除)
    - graphicCom (涂鸦对象的基础类)
    - image (图片)
    - index (入口)
    - line (直线)
    - pointer-v2 (激光笔v2)
    - pointer (激光笔)
    - rectangle (矩形)
    - text (文字)
    - triangle (空心三角形)
  - service (刷新重load数据)
  - states (数据库目录)
    - animatePPT (动态ppt数据)
    - courseWareResource (ppt图片src数据)
    - globalStore (全局store数据)
    - history (历史数据)
    - index (入口文件)
    - page (翻页的页数状态数据)
    - pageDrawData (各页涂鸦数据)
    - PPT (描述ppt页数的数据，{子叶:{分页}}等)
    - pptInfoResource (ppt属性数据，宽高、比例、加载状态)
    - room (房间信息数据，drawId、token、版本等)
    - sourceReload (资源重试的域名组数据)
    - staticState (静态数据)
    - wbProperty (白板属性的数据、线宽、颜色等)
    - whiteboard (白板页数的数据)
  - unitTest (单元测试目录)
    - bClassPassiveData (测试大班接收端数据)
    - graphicPassiveData (测试涂鸦接收端数据)
    - index (入口文件)
    - qtClientData (测试直播器发起端接收的数据，比如主动涂鸦)
    - qtPassiveData (测试直播器接收端端接收的数据，比如被动接收涂鸦)
    - xClassClientData (测试小班主播端数据)
    - xClassPassiveData (测试小班观看端数据)
  - vender (改造过的插件)
    - fabric (见下注意1)
    - emittery (发送数据的工具)
  - main 入口文件 [入口文件注册的接口说明](./main注册接口.md)



注意1：fabric.js  原版本在全屏时iText无法编辑，处理方式是在initHiddenTextarea方法中替换以下逻辑
// fabric.document.body.appendChild(this.hiddenTextarea);
this.canvas.wrapperEl.appendChild(this.hiddenTextarea);

urlParams（url地址栏生效）
| key     | value | description                   |
| ------- | ----- | ----------------------------- |
| wbDebug | true  | 开调试面板                    |
| ws      | true  | 挂在window.__wbStore (数据库) |

todo: ppt模块可以使用hook react ，给img标签绑定数据，同时缓存该img组件，使其不重渲染，达到绑定数据滚动的目的