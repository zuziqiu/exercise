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
import React, { PureComponent } from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx'
import { fabric } from 'fabric'
import { STATIC } from '../states/staticState'
import { globalStore } from '../states/globalStore'
import { graphic } from '../graphic'
import * as tools from '../extensions/util'
import wbEmitter from '../extensions/wbEmitter'
import { addListener } from 'resize-detector'
import { cursor } from '../extensions/cursor'
import * as TYPES from '../Action/action-types'
import { graphicTempObject } from '../core/graphicTempObject'
import { page } from '../core/page'
// import textBoxExtend from '../fabricPlugins/textBox'
@observer
export class Whiteboard extends PureComponent {
  // construstor
  constructor() {
    super()
    this.canvasId = 'tf-whiteboard'
    this.canvasContainer = 'talkfun-client-whiteboard'
    this.canvasContainerInner = 'canvas-container-inner'
    this.canvasContext = null //fabric对象
    this.setting = null //设置项
    this.curBrushObject = null //当前画笔类型
    this.imageInstanceObjectList = {} //
    // this.beforeSetDimenstion = null // window onresize的回调方法的壳
    this.on()
  }
  on() {
    let that = this
    // 重新计算画板尺寸
    wbEmitter.on(TYPES.WHITEBOARD_RESIZE, () => {
      tools.log('画板重新计算尺寸 ==> computeCanvasSize')
      that.computeCanvasSize()
    })
  }
  // 监听
  listener() {
    // 监听涂鸦权限
    globalStore.listen(
      () => { return { powerEnable: toJS(globalStore.store.room.powerEnable) } },
      ({ powerEnable }) => {
        this.eventFires(powerEnable)
      }
    )
    // 监听画笔类型
    globalStore.listen(
      () => { return { brushType: toJS(globalStore.store.wbProperty.brushType) } },
      ({ brushType }) => {
        // 创建新的画笔实例
        this.setter()
        this.operation(brushType)
      }
    )
    // 监听线宽变化
    globalStore.listen(
      () => { return { strokeWidth: toJS(globalStore.store.wbProperty.strokeWidth) } },
      ({ strokeWidth }) => {
        // 创建新的画笔实例
        this.canvasContext.freeDrawingBrush.width = strokeWidth
      }
    )
    globalStore.listen(
      () => { return { strokeColor: toJS(globalStore.store.wbProperty.strokeColor) } },
      ({ strokeColor }) => {
        // 创建新的画笔实例
        this.canvasContext.freeDrawingBrush.color = strokeColor
      }
    )
    // 监听翻页
    globalStore.listen(
      () => { return { currentPage: toJS(globalStore.store.page.currentPage) } },
      ({ currentPage }) => {
        // 模式切换
        // ## 画板模式
        if (tools.isWhiteboard(currentPage)) {
          let backgroundColor = globalStore.store.whiteboard[currentPage] ? globalStore.store.whiteboard[currentPage].backgroundColor : globalStore.store.wbProperty.backgroundColor
          this.canvasContext.backgroundColor = backgroundColor
          // 每次翻动白板时都要重置PPT加载的状态
          globalStore.actions.dispatch('pptInfoResource', {
            type: TYPES.PPT_INFO_SOURCE,
            payload: {
              pptInfoResource: {
                loaded: 'false'
              }
            }
          })
          // effect == 1表示是海报，在poster中处理flush，whiteboard.js只处理普通白板flush
          if (globalStore.store.whiteboard[currentPage] && globalStore.store.whiteboard[currentPage].effect == 1) {
            // 海报时强制canvas透明
            this.canvasContext.backgroundColor = 'rgba(0, 0, 0, 0)'
          } else {
            // 接收端是不用再发送出去的
            if (globalStore.store.page.isSend != 0) {
              this.flush()
            }
          }
        }
        // ## 课件模式
        else {
          // ppt页数变化时还不能setDimensions，需要在loaded中进行
          this.canvasContext.backgroundColor = 'rgba(0, 0, 0, 0)'
        }
        // computeCanvasSize中有调用fabric的renderAll方法
        this.computeCanvasSize()
      }
    )
    // 监听ppt图片加载完成
    globalStore.listen(
      () => { return { loaded: toJS(globalStore.store.pptInfoResource.loaded) } },
      ({ loaded }) => {
        if (loaded == 'true') {
          // computeCanvasSize中有调用fabric的renderAll方法
          this.computeCanvasSize()
        }
      }
    )
    // 监听画板背景颜色变化
    globalStore.listen(
      () => { return { backgroundColor: toJS(globalStore.store.wbProperty.backgroundColor) } },
      ({ backgroundColor }) => {
        // ## 画板模式
        if (tools.isWhiteboard(globalStore.store.page.currentPage)) {
          // effect = 1是海报，海报固定透明背景色，不用更新
          if (globalStore.store.whiteboard[globalStore.store.page.currentPage].effect != 1) {
            // 更新 -> whiteboard 列表数据
            globalStore.actions.dispatch('whiteboard', {
              type: TYPES.UPDATE_WHITEBOARD_DATA,
              payload: {
                data: {
                  id: globalStore.store.page.currentPage,
                  backgroundColor: backgroundColor
                }
              }
            })
            this.canvasContext.backgroundColor = backgroundColor
            if (globalStore.store.page.isSend != 0) {
              this.flush()
            }
          }
        }
        // ## 课件模式
        else {
          this.canvasContext.backgroundColor = 'rgba(0, 0, 0, 0)'
        }
        this.canvasContext.renderAll()
      }
    )
  }
  // 封装指令
  flush() {
    let webCommand = globalStore.getCommandApi()
    let cmdTpl = tools.getFlushData({ type: 'whiteboard', operationCode: 0 })
    // 发送Qt
    webCommand && webCommand.sendToQt(cmdTpl)
    // 发送操作（发给小班的）
    tools.log('whiteboard doFlush ==>', cmdTpl)
    wbEmitter.emit('set:page', cmdTpl)
  }
  // 组件已经完全挂载到网页上才会调用被执行
  componentDidMount() {
    let canvasInitSetting = {
      width: STATIC.WHITEBOARD_BASE_WIDTH,
      height: STATIC.WHITEBOARD_BASE_HEIGHT,
      selection: false,
      selectable: false,
      isDrawingMode: false,
      enableRetinaScaling: false
    }
    // textBox的空格换行问题要重写fabric的属性
    // textBoxExtend(fabric)
    // Canvas
    this.canvasContext = new fabric.Canvas(this.canvasId, canvasInitSetting)
    // 默认设置
    this.defaultSetting(this.canvasContext)
    // 初始化尺寸
    this.computeCanvasSize()
    // 事件绑定
    this.eventBind(this.canvasContext)
    // 设置项
    this.setter()
    // fabric save
    globalStore.fabric = this.canvasContext
    // // 图形类设置
    // 渲染
    this.canvasContext.renderAll()

    // to win...
    this.listener()
    // Listen Dom Resize
    if (document.querySelector(`#${globalStore.store.room.wbContainerId}`)) {
      addListener(document.querySelector(`#${globalStore.store.room.wbContainerId}`), (res) => {
        this.computeCanvasSize(res)
      })
    }
    // resize
    this.beforeSetDimenstion = this.computeCanvasSize.bind(this)
    window.addEventListener('resize', this.beforeSetDimenstion, false)

    // 初始化画笔类型
    let brushType = globalStore.store.wbProperty.brushType
    this.operation(brushType)

    /* 
     * reload重新触发componentDidMount，重渲染canvas后重绘当前页涂鸦 
     * 初始化没有页数，下面的判断不会通过
    */
    let PAGE = globalStore.store.page.currentPage
    let MODE = tools.isWhiteboard(PAGE) ? STATIC.WHITEBOARD : STATIC.PPT
    let pageDrawData = globalStore.store.pageDrawData[MODE][PAGE]
    // 清空涂鸦
    tools.removeKlss()
    // 如果当前页存在 & 有涂鸦数据 => 渲染当前页涂鸦
    if (pageDrawData) {
      page.render(pageDrawData)
    }
  }

  // 默认设置
  defaultSetting(canvas) {
    tools.disableKlssSelectable(canvas, true)
  }
  // 设置类
  setter() {
    // 画笔设置
    let isCanDrawing = null
    if (globalStore.store.wbProperty.brushType == STATIC.CURVE) {
      // 如果当前是曲线指令，是否开启自由笔画则听从powerEnable
      isCanDrawing = globalStore.store.room.powerEnable
    } else {
      // 如果当前非曲线指令就要关闭自由笔画
      isCanDrawing = false
    }
    // 设置自由画笔 @true | false
    this.canvasContext.isDrawingMode = isCanDrawing
    // 设置保持层级(比如选中图层时，被选中元素不会被置顶)
    this.canvasContext.preserveObjectStacking = true

    /* 
      以下处理初始化的时候画板背景色逻辑
     */
    // ## 白板模式
    if (tools.isWhiteboard(globalStore.store.page.currentPage)) {
      // 是否有应用过的白板
      if (globalStore.store.whiteboard[globalStore.store.page.currentPage]) {
        // 是否海报
        if (globalStore.store.whiteboard[globalStore.store.page.currentPage].effect == 1) {
          this.canvasContext.backgroundColor = 'rgba(0, 0, 0, 0)'
        } else {
          this.canvasContext.backgroundColor = globalStore.store.whiteboard[globalStore.store.page.currentPage].backgroundColor
        }
      } else {
        // 没有应用过白板就使用画板的默认白板背景
        this.canvasContext.backgroundColor = globalStore.store.wbProperty.backgroundColor
      }
    }
    // ## 课件模式
    else {
      this.canvasContext.backgroundColor = 'rgba(0, 0, 0, 0)'
    }
  }
  // 操作类
  operation(brushType) {
    let that = this
    tools.setCursor({ 'brushType': brushType })
    // 读取画笔类型
    // 文字类型另行实例化（在mouse:down时）
    if (brushType && brushType == STATIC.TEXT) {
      // 选中文字画笔类型时锁住所有图片的移动属性，否则在图片上编辑文字失焦确认的时候会令图片移动，从而触发object:modified监听,把图片对象传递到文字实例中被发送出去
      // that.lockAllImage()
      that.lockKlssObj(STATIC.IMAGE, { lockMove: true })
      // ==================================开始处理文字逻辑=============================================
      // 置空（不置空的话会调用上一次的不确定性的某个实例，因为文字在mouse:down时实例化而不在此方法中实例化）
      that.curBrushObject = null
      // 获取所有klss对象
      // let klssAllObject = that.canvasContext.getObjects()
      // 获取所有文字klss对象
      // let klssAllText = klssAllObject.filter(item => item.isText)
      // 选中了文字画笔类型时，所有文字涂鸦都设置为可拖拽|可选中编辑的状态
      // 设置所有text类型的Klss为可以选中&移动状态
      that.lockKlssObj(STATIC.TEXT, {
        lockMove: false,
        select: true,
        edit: true
      })
    } else {
      // ==================================开始处理选中非文字时的文字改动逻辑=============================================
      // 如果当前存在活动对象(例如选中的图片),应用画笔类型的时候释放当前活动对象(文字和图片一起拖？)
      // 检查有没有聚焦的文字klss,有的话就失焦
      // 必须在that.curBrushObject的update前进行，因为侧边栏切换画笔类型失焦时触发modify的监听中要用到文字的that.curBrushObject
      if (graphicTempObject.currentFocusTextId && graphicTempObject.get({ id: graphicTempObject.currentFocusTextId })) {
        graphicTempObject.get({ id: graphicTempObject.currentFocusTextId }).class.Text.exitEditing()
        graphicTempObject.currentFocusTextId = ''
      }
      // 切换画笔类型（核心，此处切换画笔类型）
      // 如果是激光笔笔画类型的额外处理逻辑
      if (brushType === STATIC.POINTER) {
        // if (Object.keys(graphicTempObject.pointerList).length > 0) {
        //   that.curBrushObject = graphicTempObject.pointerList[Object.keys(graphicTempObject.pointerList)[0]].class
        // } else {
        that.curBrushObject = graphic.getBrushType({
          brush: brushType
        })
        // // =============================开始保存激光笔逻辑================================
        // // 如果画笔是激光笔类型则存储到临时变量
        // graphicTempObject.set({
        //   id: that.curBrushObject.Pointer.id,
        //   data: {
        //     class: that.curBrushObject
        //   }
        // })
        // }
      } else {
        that.curBrushObject = graphic.getBrushType({
          brush: brushType
        })
        // 如果是图片笔画类型的额外处理逻辑
        if (brushType === STATIC.IMAGE) {
          // ============================开始保存图片逻辑==================================
          // 如果画笔是图片类型则存储到临时变量（否则应用新的画笔类型时，双击选中图片无法找到对应图片画笔类型）
          // that.imageInstanceObjectList[that.curBrushObject.Image.id] = that.curBrushObject
          graphicTempObject.set({
            id: that.curBrushObject.Image.id,
            data: {
              class: that.curBrushObject
            }
          })
        }
      }

      // 从图片类型切换至其他类型时有必要处理对象的移动属性？
      let activeObject = that.canvasContext.getActiveObject()
      if (activeObject) {
        // 预先锁住所有图片的移动
        // that.lockAllImage()
        that.lockKlssObj(STATIC.IMAGE, { lockMove: true })
        // 解锁当前活动对象的移动
        that.changeKlssMoveLock([activeObject], false)
        that.canvasContext.discardActiveObject().renderAll()
      }

      // 非erase（erase需要设置selection === selectable === true）时，所有文字涂鸦都设置‘不可选中’的状态
      // erase时不修改文字涂鸦的‘选中’属性。因为擦除的时候要选取目标
      if (brushType !== STATIC.ERASE && brushType !== STATIC.TEXT) {
        // 获取所有klss对象
        // let klssAllObject = that.canvasContext.getObjects()
        // 获取所有文字klss对象
        // let klssAllText = klssAllObject.filter(item => item.isText)
        // 设置所有text类型的Klss为不可以选中&移动状态
        // klssAllText.forEach((item, index) => {
        //   item.lockMovementX = true
        //   item.lockMovementY = true
        //   item.selectable = false
        //   item.selection = false
        //   item.editable = false
        // })
        that.lockKlssObj(STATIC.TEXT, {
          lockMove: true,
          select: false,
          edit: false
        })
      }
    }
  }
  // resize
  computeCanvasSize() {
    let store = globalStore.store
    let currentPage = store.page.currentPage
    let canvas = this.canvasContext || globalStore.fabric
    // offset
    let sourceWidth = 0,
      _width = 0,
      _height = 0,
      scrollHeight = 0,
      // 嵌套框架
      $wbCon = document.querySelector(`#${store.room.wbContainerId}`)
    if ($wbCon) {
      // $wbCon.getBoundingClientRect()
      sourceWidth = $wbCon.clientWidth
      _width = $wbCon.clientWidth
      _height = $wbCon.clientWidth * STATIC.RATIO
      scrollHeight = $wbCon.clientHeight
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
    canvas.wrapperEl.style['margin-top'] = '0px'
    canvas.wrapperEl.style['margin-left'] = offsetObj.left + 'px'
    canvas.wrapperEl.style['position'] = 'relative'

    // 该dom是为了overflo:hidden限制涂鸦不超出范围所用
    let _canvasContainerInner = document.querySelector(`#${this.canvasContainerInner}`)
    if (_canvasContainerInner) {
      _canvasContainerInner.style['margin-top'] = offsetObj.top + 'px'
      _canvasContainerInner.style['overflow'] = 'hidden'
      _canvasContainerInner.style['height'] = _width * STATIC.RATIO + 'px'
      _canvasContainerInner.style['display'] = 'block'
    }
    // 画板
    /**
     * ## 标准画板逻辑 ##
     * @view: 用容器宽 * 0.75
     * @canvas: 800 x 600 作为坐标点
     */
    // currentPage 大于0才意味应用过翻页，需要setDimensions
    if (currentPage > 0) {
      if (tools.isWhiteboard(currentPage)) {
        // 海报
        if (store.whiteboard[currentPage].server_path) {
          // 海报有ratio的时候表示图片加载成功，用海报的尺寸计算白板矩阵
          if (store.whiteboard[currentPage].ratio) {
            /* 
             * _canvasContainerInner 在海报中要求占满外部容器，这里重设
             * canvas.wrapperEl的上下居中由flex控制，不再和其他模式一样用margin
            */
            if (_canvasContainerInner) {
              _canvasContainerInner.style['margin-top'] = '0px'
              _canvasContainerInner.style['overflow'] = 'hidden'
              _canvasContainerInner.style['height'] = '100%'
            }
            canvas.wrapperEl.style.removeProperty('margin-top')
            canvas.wrapperEl.style.removeProperty('margin-left')
            canvas.wrapperEl.style['position'] = 'absolute' // 脱离文档流，以在flex空间不够时仍能居中

            /* 
             * 因为海报采用的是object-fix，所以要根据外部容器获取海报宽高
             * 需要先判断外部容器，再判断3:4容器（该容器是像素点容器，因为各端都是这个比例，所以要判断这个比例去设置canvas）
             */
            let refDom = document.querySelector(`#${this.canvasContainerInner}`),
              referenceRatio = refDom.clientHeight / refDom.clientWidth
            // 海报宽度占满容器
            if (referenceRatio >= store.whiteboard[currentPage].ratio) {
              // 3:4 >= 海报ratio，则根据海报宽度占满3:4容器，根据宽度计算canvas高度
              if (STATIC.RATIO >= store.whiteboard[currentPage].ratio) {
                canvas.setWidth(refDom.clientWidth)
                canvas.setHeight(refDom.clientWidth * STATIC.RATIO)
              } else {
                // 先根据容器计算出需要的canvas高度
                let cHeight = refDom.clientWidth * store.whiteboard[currentPage].ratio
                // 3:4 < 海报ratio，则根据海报高度占满3:4容器，根据cHeight高度计算canvas宽度
                canvas.setWidth(cHeight / STATIC.RATIO)
                canvas.setHeight(cHeight)
              }

            } else {
              // 3:4 >= 海报ratio，则根据海报宽度占满3:4容器，根据宽度计算canvas高度
              if (STATIC.RATIO >= store.whiteboard[currentPage].ratio) {
                let cWidth = refDom.clientHeight / store.whiteboard[currentPage].ratio
                canvas.setWidth(cWidth)
                canvas.setHeight(cWidth * STATIC.RATIO)
              } else {
                // 先根据容器计算出需要的canvas宽度
                let cWidth = refDom.clientHeight / STATIC.RATIO
                // 3:4 < 海报ratio，则根据海报高度占满3:4容器，根据cHeight高度计算canvas宽度
                canvas.setWidth(cWidth)
                canvas.setHeight(refDom.clientHeight)
              }
            }
            // 上下居中
            _canvasContainerInner.style['display'] = 'flex'
            _canvasContainerInner.style['align-items'] = 'center'
            _canvasContainerInner.style['justify-content'] = 'center'
          }
          // 海报没有ratio时候，可能图片加载过久或失败，这时需要应用正常白板的矩阵
          else {
            // 设置view宽高
            canvas.setWidth(_width)
            canvas.setHeight(_height)
          }

          // Canvas 宽高[800 x 600]
          canvas.setDimensions({
            width: STATIC.WHITEBOARD_BASE_WIDTH,
            height: STATIC.WHITEBOARD_BASE_HEIGHT
          }, {
            backstoreOnly: true
          })
        }
        // 白板
        else {
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
        }
      }
      // PPT
      else {
        /**
         * ## 标准PPT逻辑 ##
         * @view: 用容器宽高 * 图片比例
         * @canvas: 用图片宽度 * 0.75 作为坐标点
         */
        // > 4:3
        // doc, pdf, excel ...
        if (store.pptInfoResource.ratio != 0) {
          if (store.pptInfoResource.ratio > STATIC.RATIO) {
            let $wrapDom = {
              width: canvas.wrapperEl.clientWidth,
              height: canvas.wrapperEl.clientHeight
            }
            // canvas.wrapperEl.getBoundingClientRect()
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
          // == 4:3
          else if (store.pptInfoResource.ratio == STATIC.RATIO) {
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
          // < 4:3
          // 标准PPT模式
          else {
            let _container = document.querySelector(`#${this.canvasContainerInner}`)
            let containerData = {
              width: _container.clientWidth,
              height: _container.clientHeight
            }
            // _container.getBoundingClientRect()
            let _containerRatio = containerData.height / containerData.width
            // let origin_width = _width
            let origin_height = _height
            if (_containerRatio > STATIC.PPT_RATIO) {
              // 图片宽度占满容器
              let cache_ratio = containerData.width / _width
              _width = _width * cache_ratio
              _height = _height * cache_ratio
            } else {
              // 图片高度占满容器
              let cache_height = _width * STATIC.PPT_RATIO
              let cache_ratio = _height / cache_height
              _width = _width * cache_ratio
              _height = _height * cache_ratio
            }
            canvas.setWidth(_width)
            canvas.setHeight(_height)
            // 像素点赋值
            canvas.setDimensions({
              width: store.pptInfoResource.width,
              height: store.pptInfoResource.width * STATIC.RATIO
            }, {
              backstoreOnly: true
            })
            canvas.wrapperEl.style['margin-left'] = (sourceWidth - _width) / 2 + 'px'
            canvas.wrapperEl.style['margin-top'] = (origin_height - _height) / 2 + 'px'
          }
        }
      }
    }
    // 需要经过异步再处理renderAll。否则在mac中第一次应用的画板会偏移。
    setTimeout(() => {
      // 重新计算 & 渲染
      canvas.calcOffset()
      canvas.renderAll()
    }, 300);
  }
  // 事件解绑
  eventFires(powerEnable) {
    if (!powerEnable) {
      this.canvasContext.off('mouse:down')
      this.canvasContext.off('mouse:move')
      this.canvasContext.off('mouse:up')
      this.canvasContext.off('mouse:dblclick')
      this.canvasContext.off('selection:created')
      this.canvasContext.off('selection:updated')
      this.canvasContext.off('path:created')
      // 事件解绑后默认的鼠标图形
      tools.setCursor({ 'brushType': 'eventOff' })
    } else {
      this.eventBind(this.canvasContext)
    }
    // 画笔设置
    let isCanDrawing = null
    if (globalStore.store.wbProperty.brushType == STATIC.CURVE) {
      // 如果当前是曲线指令，是否开启自由笔画则听从powerEnable
      isCanDrawing = powerEnable
    } else {
      // 如果当前非曲线指令就要关闭自由笔画
      isCanDrawing = false
    }
    this.canvasContext.isDrawingMode = isCanDrawing
    this.defaultSetting(this.canvasContext)
  }
  // 事件绑定
  eventBind(canvas) {
    let that = this
    if (!globalStore.store.room.powerEnable) return
    // let canvas = this.canvasContext
    /** 以下事件需要绑定 **
     *  ##Doc Link => http://fabricjs.com/docs/fabric.Canvas.html
     * =========================================================
      mouse:over
      mouse:out
      mouse:down
      mouse:up
      mouse:move
      mouse:wheel
      
      object:added — 已添加 - 在添加对象后触发
      object:modified — 修改对象后移动（移动，缩放，旋转）
      object:moving — 在物体移动过程中连续发射
      object:over — 鼠标悬停在对象上时过度触发（参见下面的示例）
      object:out — 当鼠标移离对象时触发（参见下面的示例）
      object:removed — 删除对象时触发
      object:rotating — 在物体旋转过程中连续发射
      object:scaling — 在对象缩放期间连续触发
      object:selected — 选择对象时触发
    */

    canvas.on('mouse:out', (data) => {
      // 离开canvas或者klss都会触发，target为null说明离开页面
      if (!data.target) {
        this.curBrushObject && this.curBrushObject.mouseOut && this.curBrushObject.mouseOut()
      }
    })
    canvas.on('mouse:dblclick', (data) => {
      // 只有管理员才拥有操作图片的权限，用户赋予drawPower也不能操作图片
      if (!tools.isUser()) {
        if (data.target && data.target.isPicture) {
          // 更新cursor
          tools.setCursor({ 'target': this.canvasContext, '_cursor': 'initial' })
          tools.setCursor({ brushType: STATIC.IMAGE })
          // 更新brushType
          globalStore.actions.dispatch('wbProperty', {
            type: TYPES.WHITEBOARD_BRUSH_TYPE,
            payload: ''
          })
          // 预先锁住所有图片的移动
          // that.lockAllImage()
          that.lockKlssObj(STATIC.IMAGE, { lockMove: true })
          // 解锁当前活动对象的移动
          that.changeKlssMoveLock([data.target], false)
          // hover时显示可移动的光标
          // data.target.hoverCursor = cursor.move
          // 双击是判断选中的klss在imageInstanceObjectList的属性中则使用该图片实例
          if (graphicTempObject.get({ id: data.target.id }) && graphicTempObject.get({ id: data.target.id }).class) {
            // that.curBrushObject重新赋值
            that.curBrushObject = graphicTempObject.get({ id: data.target.id }).class
          }
          else {
            // 如果讲师端页面刷新后graphicTempObject实例数组被清空，重新判断klssd.isPicture创建实例。existKlss: true =>不需要再创建klss和渲染，只为了创建实例
            that.curBrushObject = graphic.getBrushType({
              brush: STATIC.IMAGE,
              existKlss: true
            })
            // 创建的实例赋值klss属性,
            that.curBrushObject.Image = data.target
            // console.error('创建图片画笔类型实例并加入到graphicTempObject（缓存数组）中 == >', that.curBrushObject)
            // that.graphicTempObject[that.curBrushObject.Image.id] = that.curBrushObject
            graphicTempObject.set({
              id: that.curBrushObject.Image.id,
              data: {
                class: that.curBrushObject
              }
            })
          }
          wbEmitter.emit('is:imageBrushType', true)
        }
      }
    })
    // Down
    canvas.on('mouse:down', (data) => {
      // console.error('mouse:down', data.target)
      // if (!this.curBrushObject) return.
      new Promise((resolve, reject) => {
        // 处理文字的即时创建逻辑（点击触发）
        if (globalStore.store.wbProperty.brushType === STATIC.TEXT) {
          new Promise((resolve) => {
            // target为空(选择画笔 && 点击画板空白地方)
            if (!data.target) {
              // 如果当前有文字编辑则退出该聚焦
              // if (textEditingArray.length > 0) {
              //   textEditingArray[0].exitEditing()
              //   graphicTempObject.currentFocusTextId = ''
              // } else {
              if (this.curBrushObject) {
                this.curBrushObject.Text.exitEditing()
                this.curBrushObject = null
                graphicTempObject.currentFocusTextId = ''
              } else {
                // 如果没有文字在编辑则创建新的文字
                // new text
                this.curBrushObject = graphic.getBrushType({
                  brush: STATIC.TEXT,
                  data: data,
                  fromClick: true
                })
                resolve()
              }
            } else {
              // 获取所有文字klss聚焦数组
              let textEditingArray = tools.textFocusArray()
              if (data.target.isText) {
                // 当前对象无状态=>选中；选中=>编辑；编辑=>再次点击。三种都会进入该判断
                if (!data.target.isEditing) {
                  // 如果当前有别的文字在编辑状态则退出编辑
                  if (textEditingArray.length > 0) {
                    // 非当前聚焦的文字被点击时候失焦处理
                    textEditingArray[0].exitEditing()
                    graphicTempObject.currentFocusTextId = ''
                  }
                }
                if (graphicTempObject.get({ id: data.target.id }) && graphicTempObject.get({ id: data.target.id }).class) {
                  // this.curBrushObject重新赋值
                  this.curBrushObject = graphicTempObject.get({ id: data.target.id }).class
                } else {
                  // 如果存在klss但是缓存中没有的话就创建实例并赋属性:klss(传入klss的时候就不需要再创建klss直接合并属性)
                  // existKlss 用于讲师端选中文字重新获取当前文字类时不渲染（true时不渲染）（为了取flush等属性方法）
                  this.curBrushObject = graphic.getBrushType({ brush: STATIC.TEXT, existKlss: true })
                  this.curBrushObject.Text = data.target
                }
                resolve()
              } else {
                // 场景：点击非文字类型（画笔或者图片上）
                // 如果当前有文字编辑则退出该聚焦
                if (textEditingArray.length > 0) {
                  textEditingArray[0].exitEditing()
                  graphicTempObject.currentFocusTextId = ''
                } else {
                  // new text
                  this.curBrushObject = graphic.getBrushType({
                    brush: STATIC.TEXT,
                    data: data,
                    fromClick: true
                  })
                  resolve()
                }
              }
            }
          }).then(() => {
            let canvas = this.canvasContext || globalStore.fabric
            if (canvas.wrapperEl.querySelectorAll('textarea').length > 0) {
              // fabric.js会在编辑文字时插入textarea,会顶起canvas导致变形，需要让textarea脱离文档
              canvas.wrapperEl.querySelectorAll('textarea').forEach((item) => {
                item.style.position = 'fixed'
              })
              // canvas.wrapperEl.querySelector('textarea').style.position = 'fixed'
            }
            // graphicTempObject.currentFocusTextId = data.target.id
            graphicTempObject.set({
              id: this.curBrushObject.Text.id,
              data: {
                class: this.curBrushObject
              }
            })
          })
        }
        resolve()
      }).then(() => {
        if (this.curBrushObject && this.curBrushObject.mouseDown) {
          this.curBrushObject.mouseDown(data)
        }
      })
    })
    // Move
    canvas.on('mouse:move', (data) => {
      // if (!this.curBrushObject) return
      if (this.curBrushObject && this.curBrushObject.mouseMove) {
        this.curBrushObject.mouseMove(data)
      }
    })
    // Up
    canvas.on('mouse:up', (data) => {
      // if (!this.curBrushObject) return      
      if (this.curBrushObject && this.curBrushObject.mouseUp) {
        this.curBrushObject.mouseUp(data)
      }
    })
    canvas.on('text:changed', (data) => {
      // if (!this.curBrushObject) return      
      if (this.curBrushObject && this.curBrushObject.onInput) {
        this.curBrushObject.onInput(data)
      }
    })
    canvas.on('object:modified', (data) => {
      if (this.curBrushObject && this.curBrushObject.objectModified) {
        this.curBrushObject.objectModified(data)
      }
    })
    // drap on object
    canvas.on('selection:created', (data) => {
      // if (!this.curBrushObject) return      
      if (this.curBrushObject && this.curBrushObject.onSelectionCreated) {
        this.curBrushObject.onSelectionCreated(data)
      }
    })
    // drap on object
    // canvas.on('selection:updated', (data) => {
    //   // if (!this.curBrushObject) return      
    //   if (this.curBrushObject && this.curBrushObject.onSelectionCreated) {
    //     // this.curBrushObject.onSelectionCreated(data)
    //   }
    // })
    // path序列化数据创建成功
    canvas.on('path:created', (klss) => {
      // if (!this.curBrushObject) return      
      if (this.curBrushObject && this.curBrushObject.pathCreate) {
        this.curBrushObject.pathCreate(klss)
      }
    })
    // 释放的对象
    canvas.on('selection:cleared', (data) => {
      // if (this.curBrushObject && this.curBrushObject.selectionCleared) {
      //   this.curBrushObject.selectionCleared(data)
      // }
      if (data.deselected && data.deselected.length > 0) {
        this.changeKlssMoveLock(data.deselected, true)
      }
    })
  }
  lockKlssObj(klssType, { lockMove, select, edit }) {
    let that = this
    // 获取所有klss对象
    let klssAllObject = that.canvasContext.getObjects()
    // 获取所有目标对象
    let klssAllTarget = null
    klssAllTarget = klssAllObject.filter(item => item.tid == klssType)
    // 设置所有筛选类型的Klss的移动状态 || 选中 || 编辑
    klssAllTarget.forEach((item, index) => {
      if (typeof lockMove == 'boolean') item.lockMovementX = lockMove
      if (typeof lockMove == 'boolean') item.lockMovementY = lockMove
      if (typeof select == 'boolean') item.selectable = select
      if (typeof select == 'boolean') item.selection = select
      if (typeof edit == 'boolean') item.editable = edit
    })
  }
  lockAllImage() {
    // 全部图片类型的对象锁住移动
    Object.keys(this.imageInstanceObjectList).forEach((item) => {
      // 因为fabric加载图片也是需要onlaod，还没loaded的时候klss对象还没合并到this.imageInstanceObjectList[item].Image
      this.imageInstanceObjectList[item].Image.set && this.imageInstanceObjectList[item].Image.set({
        lockMovementX: true,
        lockMovementY: true,
      })
    })
  }
  // 变更当前操作对象的移动属性
  changeKlssMoveLock(data, lock) {
    data.forEach((klss) => {
      klss.set({
        lockMovementX: lock,
        lockMovementY: lock,
        hoverCursor: cursor.initial
      })
      if (lock) {
        klss.set({
          hoverCursor: cursor.initial
        })
      }
    })
  }
  // render
  render() {
    let wrapStyle = {
      position: 'relative',
      width: '100%',
      height: '100%',
      zIndex: '22',
      overflow: 'hidden'
    }
    return (
      <div style={wrapStyle} id={this.canvasContainer} >
        <div id={this.canvasContainerInner}>
          <canvas id={this.canvasId}></canvas>
        </div>
      </div>
    )
  }
}