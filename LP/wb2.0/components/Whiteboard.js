/**
 * 画板模块
 */
/**
 * ## Whiteboard 组件
 * ## 创建Fabric对象
 * ## 画板对象
 * ========== ## 涂鸦流程 ## ===========
 * 1、绘图
 * 2、转换data->string数据
 * 3、发送数据
 * 4、对应页码保存 => c数据
 */
 /**
  * ## 比例模式 ##
  * ===========================
  * 1 标准画板 4:3 [800 x 600]
  * 2 PPT 16:9 [1280 x 720]
  * 3 PDF 4:3 [800 x 600]
  * 4 DOC 4:3 [800 x 600]
  * 5 EXCEL 4:3 [800 x 600]
  * 6 IMG 随机比例
  */
import { h, render, Component } from 'preact'
import { fabric } from 'fabric'
import { STATIC } from '../states/staticState'
import { globalStore } from '../states/globalStore'
import { graphic } from '../graphic'
import * as tools from '../extensions/util'
import emitter from '../extensions/emitter'
import { addListener } from 'resize-detector'
import { Page } from '../core/page'
import { cursor } from '../extensions/cursor'
export class Whiteboard extends Component {
  // construstor
  constructor () {
    super()
    this.Page = new Page()
    this.canvasId = 'tf-whiteboard'
    this.canvasContainer = 'talkfun-client-whiteboard'
    this.canvasContainerInner = 'canvas-container-inner'
    this.canvasContext = null //fabric对象
    this.props = null //prop数据
    this.setting = null //设置项
    this.curBrushObject = null //当前画笔类型
    this.on()
  }
  on () {
    emitter.on("whiteboard:resize", () => {
      tools.log('画板重新计算尺寸==>setDimensions')
      this.setDimensions()
    })
  }
  // 监听
  listener () {
    // listener
    globalStore.listen(state => state.room.powerEnable, (dispatch, cur, prev) => {
      this.off(cur)
    })
    // Ratio Update
    globalStore.listen(state => state.pptInfoResource, (dispatch, cur, prev) => {
      if (cur !== prev) {
        // console.error(cur)
      }
    })
  }
  didUpdate (news, olds) {
    if (news.page.currentPage !== olds.page.currentPage) {
      if (tools.isWhiteboard(news.page.currentPage)) {
        this.flush(globalStore.reducerStore.getState())
      }
    }
  }
  // 封装指令
  // flush (PAGE, SUB_PAGE, pageData) {
  flush (news) {
    let currentPage = news.page.currentPage
    let subPage = news.page.currentSubPage
    let currentMode = tools.isWhiteboard(currentPage) ? 'WHITEBOARD' : 'PPT'
    let pageDrawData = news.pageDrawData[currentMode][currentPage]
    let _tpl = tools.getCmdTpl()
    let Qt = globalStore.getQt()
    let pageDataLen = Object.keys(pageDrawData || {})
    let path = tools.isWhiteboard(currentPage) ? "" : news.PPT.serverPath
    // console.error(tools.color(news.whiteboard.backgroundColor))
    let cdata = {
      url: path,
      page: currentPage,
      operationCode: 0,
      matrix: '1,0,0,1,0,0',
      color: tools.color(news.whiteboard.backgroundColor),
      idx: subPage
    }
    let ctpl = {
      st: _tpl.st,
      x: _tpl.x,
      p: currentPage,
      c: tools.objectToCdata(cdata),
      t: STATIC.PAGE,
      n: globalStore.getId(),
      hd: pageDataLen.length > 0 ? 't' : 'f'
    }
    tools.log('flush setpage(WHITEBOARD) post ==>', ctpl)
    this.Page.doFlush(ctpl)
    // emitter.emit('set:page', ctpl)
    // 发送Qt
    // console.error('news.whiteboard.backgroundColor',ctpl,news.whiteboard.backgroundColor)
    Qt.sendToQt(ctpl)
  }
  // render
  styleRender () {
    // todo...
    alert(333)
  }
  // mount once
  componentDidMount () {
    tools.log('Whiteboard mounted...')
    // let defaultSetting = this.props.data.whiteboard
    let canvasInitSetting = {
      width: STATIC.WHITEBOARD_BASE_WIDTH,
      height: STATIC.WHITEBOARD_BASE_HEIGHT,
      selection: false,
      selectable: false,
      isDrawingMode: false
    }
    // Canvas
    const canvas = new fabric.Canvas(this.canvasId, canvasInitSetting)
    this.canvasContext = canvas
    // 默认设置
    this.defaultSetting(canvas)
    // 初始化尺寸
    this.setDimensions()
    // 事件绑定
    this.eventFires(canvas)
    // 设置项
    this.setter()
    // render by init
    // this.renderInitData()
    // this.styleRender()
    // fabric save
    globalStore.fabric = this.canvasContext
    // 图形类设置
    graphic.init(this.props)
    // 渲染
    this.canvasContext.renderAll()
    // to win...
    window.__c__ = this.canvasContext
    this.listener()
    let store = globalStore.reducerStore.getState()
    // Listen Dom Resize
    if (document.querySelector(store.room.whiteboardContainerId)) {
      addListener(document.querySelector(store.room.whiteboardContainerId), (res) => {
        this.setDimensions(res)
      })
    }
    // resize
    window.addEventListener('resize', () => {
      setTimeout(() => {
        this.setDimensions()
      }, 250)
    }, false)
  }
  // 设置类
  setter () {
    tools.log('Setter...')
    // Setter
    let canvas = this.canvasContext
    let props = this.props.data
    let setting = props.whiteboard
    this.setting = setting
    // 画笔设置
    let isCanDrawing = setting.drawPower
    if (this.setting.brushType !== STATIC.CURVE) {
      isCanDrawing = false
    } else {
      isCanDrawing = globalStore.reducerStore.getState().room.powerEnable
      // if (!globalStore.reducerStore.getState().room.powerEnable) {
      //   isCanDrawing = false
      // }
    }
    canvas.isDrawingMode = isCanDrawing
    // 模式切换
    let curPage = props.page.currentPage
    // ## 画板模式
    if (tools.isWhiteboard(curPage)) {
      canvas.backgroundColor = setting.backgroundColor
    } 
    // ## 课件模式
    else {
      canvas.backgroundColor = 'transparent'
    }
    // 如果拥有画笔权限
    if (globalStore.reducerStore.getState().room.powerEnable) {
      // 操作类
      this.operation()
    }
  }
  // 操作类
  operation () {
    // 读取画笔类型
    this.curBrushObject = graphic.getBrushType({brush: this.props.data.whiteboard.brushType})
    // let canvas = this.canvasContext
    // let operation = this.props.data.whiteboard
  }
  // resize
  setDimensions () {
    let store = globalStore.reducerStore.getState()
    let currentPage = store.page.currentPage
    let canvas = this.canvasContext || globalStore.fabric
    // offset
    let sourceWidth = 0,
      $domBoundingData = null,
      _width = 0,
      _height = 0,
      scrollHeight = 0
    // 嵌套框架
    let $whiteboardCon = document.querySelector(store.room.whiteboardContainerId)
    if ($whiteboardCon) {
      $domBoundingData = $whiteboardCon.getBoundingClientRect()
      sourceWidth = $domBoundingData.width
      _width = $domBoundingData.width
      _height = $domBoundingData.width * STATIC.RATIO
      scrollHeight = $domBoundingData.height
      // console.warn($domBoundingData)
    } else {
      tools.log('Whiteboard-容器未定义!')
      return false
    }
    if (_height > scrollHeight) {
      _width = scrollHeight / STATIC.RATIO
      _height = scrollHeight
    }

    let offsetObj = {
      left: (sourceWidth - _width) / 2,
      top: (scrollHeight - _height) / 2
    }

    canvas.wrapperEl.style['width'] = _width + 'px'
    canvas.wrapperEl.style['height'] = _height + 'px'
    canvas.wrapperEl.style['z-index'] = '10'

    canvas.wrapperEl.style['margin-left'] = offsetObj.left + 'px'

    // 该dom是为了overflo:hidden限制涂鸦不超出范围所用
    document.querySelector('#' + this.canvasContainerInner).style['margin-top'] =  offsetObj.top + 'px'
    document.querySelector('#' + this.canvasContainerInner).style['overflow'] = 'hidden'
    document.querySelector('#' + this.canvasContainerInner).style['height'] = _width * STATIC.RATIO + 'px'
    // 画板
    /**
     * ## 标准画板逻辑 ##
     * @view: 用容器宽 * 0.75
     * @canvas: 800 x 600 作为坐标点
     */
    if (tools.isWhiteboard(currentPage)) {
      // let offsetObj = {
      //   left: (sourceWidth - _width) / 2,
      //   top: (scrollHeight - _height) / 2
      // }

      // canvas.wrapperEl.style['width'] = _width + 'px'
      // canvas.wrapperEl.style['height'] = _height + 'px'

      // canvas.wrapperEl.style['margin-left'] = offsetObj.left + 'px'
      // canvas.wrapperEl.style['margin-top'] =  offsetObj.top + 'px'

      // canvas.wrapperEl.style['position'] = 'absolute'
      // canvas.wrapperEl.style['z-index'] = '101'
      // canvas.wrapperEl.style['overflow'] = 'hidden'
      // canvas.wrapperEl.style['max-height'] = '100%'

      // canvas.upperCanvasEl.style['width'] = _width + 'px'
      // canvas.upperCanvasEl.style['height'] = _height + 'px'

      // canvas.lowerCanvasEl.style['width'] = _width + 'px'
      // canvas.lowerCanvasEl.style['height'] = _height + 'px'

      // canvas.upperCanvasEl.width = STATIC.WHITEBOARD_BASE_WIDTH * 1
      // canvas.upperCanvasEl.height = STATIC.WHITEBOARD_BASE_HEIGHT * 1
      // canvas.lowerCanvasEl.width = STATIC.WHITEBOARD_BASE_WIDTH * 1
      // canvas.lowerCanvasEl.height = STATIC.WHITEBOARD_BASE_HEIGHT * 1
      // canvs css 宽高
      // canvas.setDimensions({
      //   width: 100,
      //   height: 100
      // })
      
      // 设置view宽高
      canvas.setWidth(_width)
      canvas.setHeight(_height)

      // Canvas 宽高[800 x 600]
      canvas.setDimensions({
        width: STATIC.WHITEBOARD_BASE_WIDTH,
        height: STATIC.WHITEBOARD_BASE_HEIGHT
      }, {
        backstoreOnly: true
      })
      // canvas.setDimensions({
      //   width: 1000,
      //   height: 800
      // }, {
      //   cssOnly: true
      // })
    } 
    // PPT
    else {
      /**
       * ## 标准PPT逻辑 ##
       * @view: 用容器宽高 * 图片比例
       * @canvas: 用图片宽度 * 0.75 作为坐标点
       */
      // ppt_width = $domBoundingData.width * store.pptInfoResource.scale
      // ppt_height = $domBoundingData.height * store.pptInfoResource.scale
      // console.warn(store.pptInfoResource)
      // _width = ppt_width > 0 ? ppt_width : _width
      // _height = ppt_height > 0 ? ppt_height : _height
      // console.error('========',ppt_width, store.pptInfoResource)
      // console.error(store.pptInfoResource)
      // > 4:3
      // doc, pdf, excel ...
      if (store.pptInfoResource.ratio > STATIC.RATIO) {
        // console.warn(store.pptInfoResource)
        // let sourceWidth = window.document.body.clientWidth
        // let _width = window.document.body.clientWidth
        // let _height = window.document.body.clientWidth * STATIC.RATIO
        // let scrollHeight = window.document.documentElement.clientHeight
        // if (_height > scrollHeight) {
        //   _width = scrollHeight / STATIC.RATIO
        //   _height = scrollHeight
        // }
        // sourceWidth = window.document.body.clientWidth
        // _width = window.document.body.clientWidth
        // _height = window.document.body.clientWidth * STATIC.RATIO
        // scrollHeight = window.document.documentElement.clientHeight
        // if (_height > scrollHeight) {
        //   _width = scrollHeight / STATIC.RATIO
        //   _height = scrollHeight
        // }
        // let _leftOffset = (sourceWidth - _width) / 2
        // canvas.wrapperEl.style['width'] = _width + 'px'
        // canvas.wrapperEl.style['height'] = _height + 'px'
        // canvas.wrapperEl.style['margin-left'] = _leftOffset + 'px'
        // canvas.wrapperEl.style['margin-top'] = (scrollHeight - document.body.clientWidth * 0.75) / 2 + 'px'
        // canvas.wrapperEl.style['position'] = 'absolute'
        // canvas.wrapperEl.style['z-index'] = '101'
        // canvas.wrapperEl.style['overflow'] = 'hidden'
        // canvas.wrapperEl.style['max-height'] = '100%'
        // document.querySelectorAll('canvas').forEach(function(item, index){
        //   item.width = _width
        //   item.height = _height
        // })
        // canvas.setDimensions({
        //   width: _width,
        //   height: _height
        // }, {
        //   cssOnly: true
        // })
        // // pdf doc 比例
        // canvas.setWidth(store.pptInfoResource.width)
        // canvas.setHeight(store.pptInfoResource.height)
        let $wrapDom = canvas.wrapperEl.getBoundingClientRect()
        let wpRatio = ($wrapDom.width / store.pptInfoResource.width)
        // 设置view宽高
        canvas.setWidth(_width)
        canvas.setHeight(store.pptInfoResource.height * wpRatio)
        // Canvas 宽高[800 x 600]
        canvas.setDimensions({
          width: store.pptInfoResource.width,
          height: store.pptInfoResource.height
        }, {
          backstoreOnly: true
        })
      }
      // <= 4:3
      // 标准PPT模式
      else {
        // let sourceWidth = window.document.body.clientWidth
        // let _width = window.document.body.clientWidth
        // let _height = window.document.body.clientWidth * STATIC.RATIO
        // let scrollHeight = window.document.documentElement.clientHeight
        // if (_height > scrollHeight) {
        //   _width = scrollHeight / STATIC.RATIO
        //   _height = scrollHeight
        // }
        // sourceWidth = window.document.body.clientWidth
        // _width = window.document.body.clientWidth
        // _height = window.document.body.clientWidth * STATIC.RATIO
        // scrollHeight = window.document.documentElement.clientHeight
        // if (_height > scrollHeight) {
        //   _width = scrollHeight / STATIC.RATIO
        //   _height = scrollHeight
        // }
        // let _leftOffset = (sourceWidth - _width) / 2
        // canvas.wrapperEl.style['width'] = _width + 'px'
        // canvas.wrapperEl.style['height'] = _height + 'px'
        // canvas.wrapperEl.style['margin-left'] = _leftOffset + 'px'
        // canvas.wrapperEl.style['margin-top'] = (scrollHeight - _height) / 2 + 'px'
        // canvas.wrapperEl.style['position'] = 'absolute'
        // canvas.wrapperEl.style['z-index'] = '101'
        // canvas.wrapperEl.style['overflow'] = 'hidden'
        // canvas.wrapperEl.style['max-height'] = '100%'
        // canvas.setDimensions({
        //   width: _width,
        //   height: _height
        // }, {
        //   backstoreOnly: true
        // })
        // View
        canvas.setWidth(_width)
        canvas.setHeight(_height)
        // 像素点赋值
        canvas.setDimensions({
          width: store.pptInfoResource.width,
          height: store.pptInfoResource.width * STATIC.RATIO
        }, {
          backstoreOnly: true
        })
      }
    }
    // 重新计算 & 渲染
    canvas.calcOffset()
    canvas.renderAll()
  }
  // 事件解绑
  off (powerEnable){
    if (!powerEnable) {
      this.canvasContext.off('mouse:down')
      this.canvasContext.off('mouse:move')
      this.canvasContext.off('mouse:up')
      this.canvasContext.off('selection:created')
      this.canvasContext.off('selection:updated')
      this.canvasContext.off('path:created')
      // 事件解绑后默认的鼠标图形
      this.canvasContext.defaultCursor = cursor.initial
      this.canvasContext.hoverCursor = cursor.initial
    } else {
      this.eventFires(this.canvasContext)
    }
    // 画笔设置
    let isCanDrawing = this.setting.drawPower
    if (this.setting.brushType !== STATIC.CURVE) {
      isCanDrawing = false
    } else {
      isCanDrawing = powerEnable
    }
    this.canvasContext.isDrawingMode = isCanDrawing
    this.defaultSetting(this.canvasContext)
  }
  // 事件绑定
  eventFires (canvas) {
    if (!globalStore.reducerStore.getState().room.powerEnable) return
    // let canvas = this.canvasContext
    /** 以下事件需要绑定 **
     *  ##Doc Link => http://fabricjs.com/docs/fabric.Canvas.html
     * =========================================================
     * mouse:down
     * mouse:move
     * mouse:up
     * path:created
     */
    // Down
    canvas.on('mouse:down', (data) => {
      if (!this.curBrushObject) return
      if (this.curBrushObject.mouseDown) {
        this.curBrushObject.mouseDown(data)
      }
    })
    // Move
    canvas.on('mouse:move', (data) => {
      if (!this.curBrushObject) return
      if (this.curBrushObject.mouseMove) {
        this.curBrushObject.mouseMove(data)
      }
    })
    // Up
    canvas.on('mouse:up', (data) => {
      if (!this.curBrushObject) return      
      if (this.curBrushObject.mouseUp) {
        this.curBrushObject.mouseUp(data)
      }
    })
    // drap on object
    canvas.on('selection:created', (data) => {
      if (!this.curBrushObject) return      
      if (this.curBrushObject.onSelectionCreated) {
        this.curBrushObject.onSelectionCreated(data)
      }
    })
    // drap on object
    canvas.on('selection:updated', (data) => {
      if (!this.curBrushObject) return      
      if (this.curBrushObject.onSelectionCreated) {
        // this.curBrushObject.onSelectionCreated(data)
      }
    })
    // path序列化数据创建成功
    canvas.on('path:created', (klss) => {
      if (!this.curBrushObject) return      
      if (this.curBrushObject.pathCreate) {
        this.curBrushObject.pathCreate(klss)
      }
    })
  }
  // 初始化渲染TODO...
  renderInitData () {
    // let draws = window.localStorage.getItem('draws')
    // if (!draws) {
    //   return
    // }
    // let _ds = JSON.parse(draws)
    // _ds.map((d, k) => {
    //   let _p = new fabric.Path(d, {
    //     stroke: this.setting.strokeColor,
    //     fill: false,
    //     strokeWidth: this.setting.strokeWidth,
    //     strokeColor: this.setting.strokeColor,
    //     strokeLineCap: 'round',
    //     color: this.setting.strokeColor,
    //   })
    //   this.canvasContext.add(_p)
    // })
    // this.canvasContext.renderAll()
  }
  // 默认设置
  defaultSetting (canvas) {
    tools.disableKlssSelectable(canvas, true)
  }
  // ## Update状态 => 注意 ##
  // 本模块不能重复执行render, 否则 Fabric 模块会被重置
  shouldComponentUpdate (props, state) {
    // tools.log('=======================>>>>>>>')
    // tools.log('State update...\n', props.data)
    // tools.log('========================>>>>>>>')
    this.props = props
    // 设置
    this.setter()
    this.canvasContext.renderAll()
    // 更新尺寸
    this.setDimensions()
    // ## 此插件不能二次渲染 ##
    return false
  }
  // render
  render (props, state) {
    // 初始化需要用到 props
    this.props = props
    return (
      <div id={ this.canvasContainer }>
        <div id= { this.canvasContainerInner}>
          <canvas id={ this.canvasId }></canvas>
        </div>
      </div>
    )
  }
}
