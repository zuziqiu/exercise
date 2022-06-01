/**
 * image 图片
 * @数据结构参考以下链接
 * https://gitlab.talk-fun.com/website-backend/api-docs/blob/master/client/client-cmd-template.md#%E7%9B%B4%E7%BA%BF-18
 */
import { graphicBase } from './graphicCom'
import { STATIC } from '../states/staticState'
import { cursor } from '../extensions/cursor';
import { graphicTempObject } from '../core/graphicTempObject'
import * as tools from '../extensions/util'
import * as TYPES from '../Action/action-types'
import emitter from '../extensions/emitter'
import { hostMachine } from '../extensions/hostMachine'
export class Image extends graphicBase {
  constructor({ data: data, isEmpty: isEmpty, isRefresh: isRefresh }) {
    super()
    this.onPress = false
    this.onMove = false
    this.Image = null
    // if (arguments[0]) {
    this.render({ data: data, isEmpty: isEmpty, isRefresh: isRefresh })
    // }
  }
  // 发送数据
  flush(data) {
    let cdata = this.toSerializable(data)
    this.tools.log('image flush...', cdata)
    super.flush(cdata)
  }
  // 默认设置
  defaultSetting() {
    super.defaultSetting(this.Image)
  }
  // 发送给远端
  toServer() {
    // todo...远程接口
  }
  // 产出｀c｀数据
  toCdata(image) {
    // c 数据参数（ “|”分割 ）
    // 第零个参数：涂鸦实例名称
    // 第一个参数：服务器路径地址（serverPath）
    // 第二个参数：是否显示（visible）
    // 第三个参数：（optType @String | 1 or 2. optType=2 的时候。移动位置,optType==1的时候,visible==1 =>增；visible==0 =>删）
    // 第四个参数：矩阵［Matrix（a,b,c,d,tx,ty）］
    let whiteboard = this.store.getState().whiteboard
    let left = typeof image.left == 'number' ? image.left.toFixed(2) : null
    let top = typeof image.top == 'number' ? image.top.toFixed(2) : null
    let cdata = {
      id: image.id,
      src: image.serverPath,
      visible: image.visible ? 1 : 0,
      // optType: image.optType,
      optType: '1', // 创建和移动都发1
      // matrix: '1,0,0,1,' + left + ',' + top
      matrix: `${image.scaleX ? Number(image.scaleX, 2).toFixed(2) : 1},0,0,${image.scaleY ? Number(image.scaleY).toFixed(2) : 1},${left},${top}`
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
    cmd.t = STATIC.IMAGE
    cmd.c = klss ? this.toCdata(klss) : ''
    cmd._type = 'image'
    cmd.klss = klss
    return cmd
  }
  // 建立
  // {"st":473.77,"p":10002,"c":"p21|http://lp7-4.talk-fun.com/doc/c4/0e/7b/ee8717204f1a4fdfc00a8ad6ad/origin.jpg|1|1|0.7540056705474854,0,0,0.7547169327735901,170.75,224.5","n":23,"x":"38186793","t":11}
  createKlss({ data, isFlush }) {
    let that = this
    // console.error("data==>", data)
    let curUserId = that.props.room.curUser ? that.props.room.curUser.xid : 'me'
    // that.Image = new fabric.Image()

    let imageSrc = ''
    let serverPath = ''
    if (data) {
      let _data = Object.assign({}, data)
      _data.c = that.tools.CdataToObject(data.c, data.t)
      imageSrc = _data.c.src
      serverPath = _data.c.src
      // 设置有数据时的图片属性
      that.Image = {
        id: _data.c.id,
        nid: _data.n,
        xid: _data.x ? parseInt(_data.x) : _data.xid,
        tid: that.STATIC.IMAGE,
        visible: _data.c.visible == '0' ? false : true,
        isPicture: true,
        optType: Number(_data.c.optType)
      }
    } else {
      imageSrc = that.store.getState().whiteboard.brushData.src.replace(/\\/g, '/')
      serverPath = that.store.getState().whiteboard.brushData.server_path
      // 设置没有数据时图片默认属性
      that.Image = {
        id: curUserId + '_' + new Date().getTime() + '_' + 'i' + that.props.drawId,
        nid: that.props.drawId,
        xid: that.props.room.curUser ? that.props.room.curUser.xid : '',
        tid: that.STATIC.IMAGE,
        visible: true,
        isPicture: true,
        optType: 1
      }
    }
    //支持webp的，改为加载web
    if (that.store.getState().page.isWebpSupport) {
      imageSrc = imageSrc.replace('.jpg', '.jpeg');
    }
    this.createImgObj(imageSrc, serverPath, data, isFlush)
  }
  createImgObj(imageSrc, serverPath, data, isFlush) {
    let that = this
    fabric.Image.fromURL(imageSrc, function (imgObj) {
      if (imgObj && imgObj._element) {
        // 由于图片异步加载，加载完成后合并对象（that.Image是对外暴露的操作类，包含了canvas中的图片klss对象）
        that.Image = Object.assign(imgObj, that.Image)
        // 计算图片的尺寸
        // fabric object set attribute
        let Image = that.defaultSetting(that.Image)
        // 消除边框
        that.Image.strokeWidth = 0
        // 允许选中（双击的时候解锁拖拽）
        that.Image.selectable = tools.isUser() ? false : true
        that.Image.selection = tools.isUser() ? false : true
        that.Image.lockMovementX = true
        that.Image.lockMovementY = true
        that.Image.lockRotation = true
        that.Image.lockScalingFlip = true
        that.Image.lockScalingX = true
        that.Image.lockScalingY = true
        that.Image.electionBackgroundColor = 'rgba(0, 0, 0, 0.6)'
        that.Image.hasControls = false
        that.Image.hoverCursor = cursor.initial
        that.Image.serverPath = serverPath

        that.imageResize(that.Image, data)
        that.setImage(that.Image, data)
        that.fabric.add(that.Image);
        that.fabric.renderAll()
        // 计算图片的定位（居中）
        // 存在缓存的移动操作时就执行
        Object.keys(graphicTempObject.imgList).map((id) => {
          if (id == that.Image.id) {
            that.setImage(that.Image, graphicTempObject.imgList[id])
          }
        })

        // 处理图片的Zindex
        // 获取所有klss对象
        let klssAllObject = that.fabric.getObjects()
        // 获取所有图片klss对象
        let klssAllImage = klssAllObject.filter(item => item.isPicture)
        // 获取除了当前图片对象外的所有其他图片对象
        let klssOtherImage = klssAllObject.filter(item => item.isPicture && item.id != that.Image.id)
        // Zindex的差值 = allKlss.length - allImageKlss.length
        let offsetZindex = klssAllObject.length - klssAllImage.length
        // 把当前的图片klss对象设置到涂鸦笔画的下一层
        for (var i = 0; i <= offsetZindex; i++) {
          that.fabric.sendBackwards(that.Image)
        }
        // 除了当前图片对象外的其他所有图片对象全部设置再下一层（为了给当前图片对象留出Zindex位置）
        klssOtherImage.map((item) => {
          that.fabric.sendBackwards(item)
        })

        // 新创建的image，执行发送和ID自增
        if (isFlush) {
          new Promise((resolve, rejects) => {
            that.store.dispatch({
              type: TYPES.WHITEBOARD_BRUSH_TYPE,
              payload: ''
            })
            resolve()
          }).then(() => {
            that.flush(that.Image)
            that.getId()
          })
        }
      } else {
        hostMachine.process({
          time: 0,
          type: 'error',
          oriUrl: imageSrc,
          callback: function (newSrc) {
            setTimeout(() => {
              that.createImgObj(newSrc, serverPath, data, isFlush)
            }, 500);
          }
        })
        // emitter.emit('whiteboard:image:error', { url: imageSrc })
      }
    });
  }
  imageResize(imgObj, data) {
    if (data) {
      let _data = Object.assign({}, data)
      _data.c = this.tools.CdataToObject(data.c, data.t)
      let matrix = _data.c.matrix.split(',')
      imgObj.scale(matrix[0])
    } else {
      // imageHeight / imageWidth >= 3:4(STATIC.RATIO) ==>如果高度溢出则高度占满、宽度自适应
      let _width = imgObj.width
      let _height = imgObj.height
      if (_height / _width >= STATIC.RATIO) {
        if (_height >= this.fabric.height) {
          imgObj.scale(this.fabric.height / _height)
          // imgObj.scaleX = imgObj.scaleY = this.fabric.height / _height.toFixed(2)
          // 设置宽高不生效，先注释,用scale替代
          // imgObj.set({
          //   height: this.fabric.height,
          //   width: this.fabric.height / STATIC.RATIO
          // })
        }
      } else {
        // imageHeight / imageWidth < 3:4 ==>如果宽度溢出则宽度占满、高度自适应
        if (_width >= this.fabric.width) {
          imgObj.scale(this.fabric.width / _width)
          // imgObj.scaleX = imgObj.scaleY = this.fabric.width / _width.toFixed(2)
          // 设置宽高不生效，先注释,用scale替代
          // imgObj.set({
          //   width: this.fabric.width,
          //   height: this.fabric.width / STATIC.RATIO
          // })
        }
      }
    }
    this.fabric.renderAll()
  }
  // 此方法可以设置边距和隐藏/显示
  setImage(imgObj, data) {
    // console.error(imgObj)
    // let currentPage = globalStore.reducerStore.getState().page.currentPage
    // if (tools.isWhiteboard(currentPage)) {
    //   let container = document.querySelector('#canvas-container-inner')
    //   let containerData = container.getBoundingClientRect()
    // }
    let _width = imgObj.scaleX ? imgObj.width * imgObj.scaleX : imgObj.width
    let _height = imgObj.scaleY ? imgObj.height * imgObj.scaleY : imgObj.height
    let _left = 0
    let _top = 0
    if (data) {
      let _data = Object.assign({}, data)
      _data.c = this.tools.CdataToObject(data.c, data.t)
      let matrix = _data.c.matrix.split(',')
      if (_data.c.visible == '0') {
        // 擦除或者撤销后需要清空该对象在缓存中的数据，否则前进操作时存在该数据则不会重新创建上一步被删除的klss对象
        graphicTempObject.clear('imgList', imgObj.cid)
        // 设为在画板上不可见状态
        imgObj.set({
          visible: false,
        })
      } else {
        // 设为在画板上可见状态
        imgObj.set({
          visible: true,
        })
      }
      _left = matrix[4] == 'null' ? (this.fabric.width - _width) / 2 : parseFloat(matrix[4])
      _top = matrix[5] == 'null' ? (this.fabric.height - _height) / 2 : parseFloat(matrix[5])
    } else {
      _left = (this.fabric.width - _width) / 2
      _top = (this.fabric.height - _height) / 2
    }
    imgObj.set({
      left: _left,
      top: _top
    })
    this.fabric.renderAll()
  }
  // 渲染
  render(objData) {
    // -------------数据说明-------------
    // id: cArray[0],
    // src: cArray[1],
    // visible: cArray[2],
    // optType: cArray[3],
    // matrix: cArray[4],
    // isEmpty 用于讲师端双击图片重新实例化当前图片类时不渲染（true时不渲染）（为了取flush等属性方法,另外klss属性已经在双击事件里赋值）
    if (!objData.isEmpty) {
      if (objData.data) {
        // 有图片数据时（一般作为接收端，比如刷新或者作为学员）
        let _data = Object.assign({}, objData.data)
        _data.c = this.tools.CdataToObject(_data.c, _data.t)
        // 判断此id数据是否多次接收
        if (Object.keys(graphicTempObject.imgList).includes(_data.c.id)) {
          // 如果存在klss就更新klss属性
          let klss = this.tools.findKlssById(_data.c.id)
          if (klss) {
            this.setImage(klss, objData.data)
          }
        } else {
          // 此id数据第一次接收，创建klss
          this.createKlss({
            data: objData.data,
            isFlush: false
          })
        }
        // 记录当前id的图片最后一次操作
        graphicTempObject.imgList[_data.c.id] = Object.assign({}, objData.data)
      } else {
        // 无图片数据，直接创建klss(一般从本地发起)
        this.createKlss({
          isFlush: true
        })
        graphicTempObject.imgList[this.Image.id] = this.toSerializable(this.Image)
      }
    }
  }
  // down
  mouseDown(data) {
    // if (!this.onPress && data.target && data.target.isPicture) {
    //   this.onPress = true
    // }
  }
  // move
  mouseMove(data) {
    // if (this.onPress) {
    //   this.onMove = true
    // }
  }
  // up
  mouseUp(data) {
    // if (this.onMove) {
    //   // data.target.set({
    //   //   optType: 2
    //   // })
    //   this.flush(data.target)
    //   this.onPress = false
    //   this.onMove = false
    // }
  }
  objectModified(data) {
    this.flush(data.target)
  }
}