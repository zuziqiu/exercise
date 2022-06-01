/**
 * text 文字
 * @数据结构参考以下链接
 */
import { graphicBase } from './graphicCom'
import { STATIC } from '../states/staticState'
import { globalStore } from '../states/globalStore';
import { graphicTempObject } from '../core/graphicTempObject';
export class Text extends graphicBase {
  constructor({ data, fromClick, isEmpty }) {
    super()
    this.onPress = false
    this.Text = null
    this.render({ data, fromClick, isEmpty })
  }
  // 发送数据
  flush(data) {
    let cdata = this.toSerializable(data)
    this.tools.log('text flush...', cdata)
    super.flush(cdata)
  }
  // 默认设置
  defaultSetting(klss) {
    klss.fill = this.store.getState().whiteboard.strokeColor
    klss.stroke = this.store.getState().whiteboard.strokeColor
    klss.strokeLineCap = this.store.getState().whiteboard.strokeLineCap
    // klss.strokeWidth = this.store.getState().whiteboard.strokeWidth
    klss.selectable = false
    klss.selection = false
    klss.hasborder = false
  }
  // 发送给远端
  toServer() {
    // todo...远程接口
  }
  // 产出｀c｀数据
  toCdata(text) {
    // c 数据参数（ “|”分割 ）
    // 第一个参数：涂鸦实例名称
    // 第二个参数：文字（text）
    // 第三个参数：颜色值
    // 第四个参数：文字size
    // 第五个参数：是否显示（visible）
    // 第六个参数： （optType）
    // 第七个参数：矩阵［Matrix（a,b,c,d,tx,ty）］
    // 第八个参数：是否转码（isEncode）
    let whiteboard = this.store.getState().whiteboard
    let left = typeof text.left == 'number' ? text.left.toFixed(2) : null
    let top = typeof text.top == 'number' ? text.top.toFixed(2) : null
    let cdata = {
      id: text.id,
      text: escape(text.text),
      color: this.tools.color(whiteboard.strokeColor),
      fontSize: text.fontSize,
      visible: text.visible ? 1 : 0,
      optType: text.optType,
      matrix: '1,0,0,1,' + left + ',' + top,
      isEncode: 0
    }
    return this.tools.objectToCdata(cdata)
  }
  // 序列化数据
  toSerializable(klss) {
    let cmd = {}
    let baseTpl = super.cmdTpl()
    // let curUserId = this.store.getState().room.curUser ? this.store.getState().room.curUser.xid : 'me'
    cmd.x = baseTpl.x
    cmd.st = baseTpl.st
    cmd.n = klss.nid || baseTpl.n
    cmd.cid = klss.id
    cmd.hd = baseTpl.hd
    cmd.p = this.store.getState().page.currentPage || baseTpl.p
    cmd.t = STATIC.TEXT
    cmd.c = this.toCdata(klss)
    cmd._type = 'text'
    cmd.klss = klss
    return cmd
  }
  // 建立
  createKlss({ data, fromClick }) {
    let editingFlag = this.tools.textFocusArray().length > 0 ? true : false
    if (fromClick && !editingFlag) {
      new Promise((reslove, reject) => {
        // 如果接收的数据中带有klss(文字类型)则直接赋值对象属性（注意：data可能来自1、mouse:down;2、pageDrawData）
        if (data && data.target && data.target.isText) {
          this.Text = data.target
        } else {
          new Promise((reslove, reject) => {
            super.getId()
            reslove()
          }).then(() => {
            let fontSize = this.store.getState().whiteboard.brushData.fontSize
            this.Text = new fabric.IText('', {
              lockMovementX: true,
              lockMovementY: true,
              lockRotation: true,
              lockScalingFlip: true,
              lockScalingX: true,
              lockScalingY: true,
              hasControls: false,
              visible: true,
              fill: this.store.getState().whiteboard.strokeColor,
              stroke: this.store.getState().whiteboard.strokeColor,
              strokeLineCap: this.store.getState().whiteboard.strokeLineCap,
              selectable: true,
              selection: true,
              hasborder: false,
              isText: true,
              editable: true,
              fontFamily: 'Microsoft YaHei',
              fontWeight: '200',
              charSpacing: 36,
              lineHeight: 1.3
            })
            let curUserId = this.store.getState().room.curUser ? this.store.getState().room.curUser.xid : 'me'
            this.Text.set({
              left: data.pointer.x,
              top: data.pointer.y,
              fontSize: Number(fontSize),
              id: curUserId + '_' + new Date().getTime() + '_' + 't' + this.store.getState().drawId,
              nid: this.store.getState().drawId,
              xid: this.store.getState().room.curUser ? this.store.getState().room.curUser.xid : '',
              hex: this.tools.color(this.store.getState().whiteboard.strokeColor),
              tid: STATIC.TEXT,
              optType: 1
            })
            this.fabric.add(this.Text)
            this.fabric.renderAll()
          })
        }
        reslove()
      }).then(() => {
        // focus当前点击或者新创建的klss
        this.Text.enterEditing();
        graphicTempObject.currentFocusTextId = this.Text.id
      })
    } else {
      let that = this
      let _data = Object.assign({}, data)
      _data.c = that.tools.CdataToObject(data.c, data.t)
      // editable => 文字是否可以编辑的属性，目前只有讲师使用文字功能，所以不需要判断powerEnable
      let _editable = false
      // 纯画板时候的逻辑没有curUser（比如直播器）
      if (!that.store.getState().room.curUser) {
        _editable = true
      } else if (_data.x == that.store.getState().room.curUser.xid) {
        // 是自身创建的文字，假如powerEnable为true就允许编辑
        _editable = that.store.getState().room.powerEnable
      } else {
        // 非自身创建的文字不允许编辑
        _editable = false
      }
      // 强制转换 "回车：%0D" => "换行符：%0A"(兼容旧版直播器)
      let fillter = new RegExp('%0D', "g")
      _data.c.text = _data.c.text.replace(fillter, '%0A')

      that.Text = new fabric.IText(unescape(_data.c.text), {
        // 当前画笔类型是文字时设置可以移动的属性
        lockMovementX: that.store.getState().whiteboard.brushType === STATIC.TEXT ? false : true,
        lockMovementY: that.store.getState().whiteboard.brushType === STATIC.TEXT ? false : true,
        lockRotation: true,
        lockScalingFlip: true,
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false,
        visible: _data.c.visible == '0' ? false : true,
        fill: that.tools.color(_data.c.color),
        stroke: that.tools.color(_data.c.color),
        strokeLineCap: that.store.getState().whiteboard.strokeLineCap,
        // 当前画笔类型是文字时设置可以选中的属性
        selectable: that.store.getState().whiteboard.brushType === STATIC.TEXT ? true : false,
        selection: that.store.getState().whiteboard.brushType === STATIC.TEXT ? true : false,
        hasborder: false,
        isText: true,
        editable: _editable,
        fontFamily: 'Microsoft YaHei',
        fontWeight: '200',
        charSpacing: 36,
        lineHeight: 1.3
      })
      let matrix = _data.c.matrix.split(',')
      this.Text.set({
        left: parseInt(matrix[4]),
        top: parseInt(matrix[5]),
        scaleX: matrix[0],
        scaleY: matrix[3],
        fontSize: Number(_data.c.fontSize),
        id: _data.cid,
        nid: _data.n,
        xid: _data.x ? parseInt(_data.x) : _data.xid,
        hex: _data.klss && _data.klss.hex ? _data.klss.hex : _data.c.color,
        tid: STATIC.TEXT,
        optType: 1
      })
      this.fabric.add(this.Text)
      this.fabric.renderAll()
    }
  }
  setText(textObject, data) {
    if (data) {
      let _data = Object.assign({}, data)
      _data.c = this.tools.CdataToObject(data.c, data.t)
      let matrix = _data.c.matrix.split(',')

      // 强制转换 "回车：%0D" => "换行符：%0A"(兼容旧版直播器)
      let fillter = new RegExp('%0D', "g")
      _data.c.text = _data.c.text.replace(fillter, '%0A')

      textObject.set({
        left: matrix[4] == 'null' ? (this.fabric.width - textObject.width) / 2 : parseFloat(matrix[4]),
        top: matrix[5] == 'null' ? (this.fabric.height - textObject.height) / 2 : parseFloat(matrix[5]),
        scaleX: matrix[0],
        scaleY: matrix[3],
        visible: _data.c.visible == '0' ? false : true,
        fontSize: Number(_data.c.fontSize),
        text: unescape(_data.c.text)
      })
    } else {
      textObject.set({
        left: (this.fabric.width - textObject.width) / 2,
        top: (this.fabric.height - textObject.height) / 2
      })
    }
    this.fabric.renderAll()
  }
  // 渲染
  render({ data, fromClick, isEmpty }) {
    // _toSVG(待考察方法)
    // isEmpty 用于讲师端选中文字重新获取当前文字类时不渲染（true时不渲染）（为了取flush等属性方法）
    if (!isEmpty) {
      // 发起端选取文字指令时就要创建对象
      if (fromClick) {
        let p = data.pointer
        this.firstPoint = {}
        this.firstPoint.X = p.x
        this.firstPoint.Y = p.y
        this.createKlss({
          data,
          fromClick
        })
      } else {
        // 有文字数据时（一般作为接收端，比如刷新或者作为学员或者‘嘉宾主播端’（主播器特有））
        let _data = Object.assign({}, data)
        // cid不存在时中断（发起端失焦的时候可能会产生）
        if (!_data.cid) {
          return
        }
        _data.c = this.tools.CdataToObject(_data.c, _data.t)
        // 判断此id数据是否多次接收
        if (Object.keys(graphicTempObject.textList).includes(_data.c.id)) {
          // 如果存在klss就更新klss属性
          let klss = this.tools.findKlssById(_data.c.id)
          if (klss) {
            this.setText(klss, data)
          }
        } else {
          // 此id数据第一次接收，创建klss
          this.createKlss({
            data,
            fromClick
          })
        }
        // 记录当前id的文字最后一次操作
        graphicTempObject.textList[_data.c.id] = _data
      }
    }
  }
  // down
  mouseDown(data) {
    let p = data.pointer
    this.firstPoint = {}
    this.firstPoint.X = p.x
    this.firstPoint.Y = p.y
    if (data.target && data.target.isText) {
      data.target.set({
        lockMovementX: false,
        lockMovementY: false,
      })
    } else {
      // 在whiteboard mouse:down创建了文字对象
      // 文字在聚焦中，不允许修改颜色和字号
      this.tools.log(data.target, 'targe != text')
    }
  }
  // move
  mouseMove(data) {}
  // up
  mouseUp(data) {}
  objectModified(data) {
    this.flush(data.target)
  }
}