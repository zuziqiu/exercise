/**
 * Curve 曲线
 */
import { graphicBase } from './graphicCom'
import { cursor } from '../extensions/cursor'
export class Curve extends graphicBase {
  constructor({ data }) {
    super()
    // this._stroke = new.Stroke(klss)
    this.onPress = false
    this.id = this.store.getState().drawId
    if (data) {
      this.render(data)
    }
    let canvas = this.fabric
    let setting = this.store.getState().whiteboard
    let rgb = this.tools.color(setting.strokeColor, 'rgb')
    canvas.freeDrawingBrush.color = 'rgba(' + rgb + ',' + setting.strokeOpacity + ')'
    canvas.freeDrawingBrush.width = setting.strokeWidth
    canvas.freeDrawingCursor = cursor.draw
  }
  // 推送数据
  flush(data) {
    let cdata = this.toSerializable(data)
    super.flush(cdata)
  }
  // 产出｀c｀数据
  toCdata(klss) {
    // this._stroke._cmdToJson(klss.path)
    let whiteboard = this.store.getState().whiteboard
    //{"c":"d26|16711680|6|19,269.3,L,216.4,269.8|0.43"}
    // let _pathData = klss.path.toString()
    let pathToJson = this.serialize(klss.path)
    let cdata = {
      // nid: klss.id,
      id: klss.id,
      color: this.tools.color(whiteboard.strokeColor),
      strokeWidth: whiteboard.strokeWidth,
      visible: 1,
      pathData: pathToJson,
      opacity: whiteboard.strokeOpacity
    }
    return this.tools.objectToCdata(cdata)
  }
  // 序列化数据
  toSerializable(klss) {
    let cmd = {}
    let baseTpl = super.cmdTpl()
    cmd.x = baseTpl.x
    cmd.st = baseTpl.st
    cmd.n = klss.nid || baseTpl.n
    cmd.cid = klss.id
    cmd.hd = baseTpl.hd
    cmd.p = this.store.getState().page.currentPage || baseTpl.p
    cmd.t = this.STATIC.CURVE
    cmd.c = this.toCdata(klss)
    cmd._type = 'path'
    cmd.klss = klss
    return cmd
  }
  // 转入成为客户端需要的数据格式
  serialize(path) {
    let drawPath = []
    this.smooth(path, drawPath)
    let i = 0;
    let c = '';
    let item = {};
    for (i = 0; i < drawPath.length; i++) {
      item = drawPath[i];
      // M,M
      if (i == 0) {
        c += 'M,' + item.beginPoint.x + ',' + item.beginPoint.y;
        c += ',M,' + item.beginPoint.x + ',' + item.beginPoint.y;
      }
      // L
      // else if(i == 1){
      //     c += ',L,'+item.beginPoint.x+','+item.beginPoint.y;
      // }
      // L(最后)
      else if (i == (drawPath.length - 1)) {
        c += ',L,' + item.endPoint.x + ',' + item.endPoint.y;
      }
      // C(中间)
      else if ((i % 1) == 0) {
        c += ',C,' + item.beginPoint.x + ',' + item.beginPoint.y + ',' + item.controlPoint.x + ',' + item.controlPoint.y;
      } else {
        //丢弃掉一些点
      }
    }
    return c
  }
  // 平滑处理
  smooth(paths, drawPath) {
    // 取小数点后两位
    let pointerComputed = (points) => {
      let coords = Object.keys(points)
      let computedCoords = points
      coords.forEach((_key, index) => {
        let _p = computedCoords
        _p[_key].x = parseFloat(_p[_key].x.toFixed(2))
        _p[_key].y = parseFloat(_p[_key].y.toFixed(2))
      })
      return computedCoords
    }
    // copy fabricPath >>> commands
    paths.forEach((d, k) => {
      let o = {
        beginPoint: {
          x: 0,
          y: 0
        },
        controlPoint: {
          x: 0,
          y: 0
        },
        endPoint: {
          x: 0,
          y: 0
        }
      }
      if (d[0] === 'M') {
        o.beginPoint.x = d[1]
        o.beginPoint.y = d[2]

        o.controlPoint.x = d[1]
        o.controlPoint.y = d[1]

        o.endPoint.x = d[1]
        o.endPoint.y = d[1]
        o = pointerComputed(o)
      }
      else if (d[0] === 'Q') {
        o.beginPoint.x = d[1]
        o.beginPoint.y = d[2]

        o.controlPoint.x = d[3]
        o.controlPoint.y = d[4]

        o.endPoint.x = d[3]
        o.endPoint.y = d[4]
        o = pointerComputed(o)
      }
      else if (d[0] === 'L') {
        o.beginPoint.x = d[1]
        o.beginPoint.y = d[2]

        o.controlPoint.x = d[1]
        o.controlPoint.y = d[2]

        o.endPoint.x = d[1]
        o.endPoint.y = d[2]
        o = pointerComputed(o)
      }
      drawPath.push(o);
    })
  }
  // 转出成为标准格式
  cmdToJson(packPath) {
    let a = packPath.split(','),
      // objectId = cmdPaths[0],
      x = {
        data: []
      },
      item = {},
      scaleX = 1,
      scaleY = 1,
      index = 0;
    if (a[0] === 'M') {
      x.moveTo = {
        x: a[1] * scaleX,
        y: a[2] * scaleY
      };
      index = 3;
    }

    // M,L,L,C
    while (index < a.length) {
      switch (a[index]) {
        case 'M':
          item = {
            name: a[index],
            x: parseInt(a[index + 1]) * scaleX,
            y: parseInt(a[index + 2]) * scaleY
          };
          x.data.push(item);
          index += 3;
          break;
        case 'L':
          item = {
            name: a[index],
            x: parseInt(a[index + 1]) * scaleX,
            y: parseInt(a[index + 2]) * scaleY
          };
          x.data.push(item);
          index += 3;
          break;
        case 'C':
          item = {
            name: a[index],
            x: parseInt(a[index + 1]) * scaleX,
            y: parseInt(a[index + 2]) * scaleY,
            archX: parseInt(a[index + 3]) * scaleX,
            archY: parseInt(a[index + 4]) * scaleY
          };
          x.data.push(item);
          index += 5;
          break;
        default:
          break;
      }
    }

    // M,L,Q
    let path = '',
      data = x.data
    for (var i = 0; i < data.length; i++) {
      item = data[i];
      if (item.name === 'M') {
        path += ' M ' + item.x + ' ' + item.y;
      } else if (item.name === 'L') {
        path += ' L ' + item.x + ' ' + item.y;
      } else if (item.name === 'C') {
        path += ' Q ' + item.x + ',' + item.y + ',' + item.archX + ',' + item.archY;
      }
    }
    return path;
  }
  // create path
  pathCreate(klssPath) {
    let _path = klssPath.path
    let curUserId = this.store.getState().room.curUser ? this.store.getState().room.curUser.xid : 'me'
    if (_path) {
      _path.id = curUserId + '_' + new Date().getTime() + '_' + 'd' + this.id
      _path.nid = this.id
      _path.tid = this.STATIC.CURVE
      _path.xid = this.store.getState().room.curUser ? this.store.getState().room.curUser.xid : '',
        _path.hex = this.tools.color(this.store.getState().whiteboard.strokeColor)
      this.tools.disableKlssSelectable(_path, true)
      // px > 5
      if (_path.width >= 5 || _path.height >= 5) {
        this.flush(_path)
        this.id = super.getId()
      } else {
        this.tools.removeKlss(_path.id)
      }
    }
  }
  // cdata to klss
  createKlss(data) {
    this.Path = new fabric.Path(data.c.pathData, {
      id: data.c.id,
      stroke: this.tools.color(data.c.color),
      strokeWidth: parseInt(data.c.strokeWidth),
      opacity: data.c.opacity,
      fill: 'transparent',
      xid: data.x ? parseInt(data.x) : data.xid,
      hex: data.klss ? data.klss.hex : data.c.color,
      visible: data.c.visible == '0' ? false : true,
      strokeLineCap: this.store.getState().whiteboard.strokeLineCap,
      tid: this.STATIC.CURVE,
      selectable: false,
      selection: false
    })
    // this.defaultSetting(this.Path)
    this.fabric.add(this.Path)
  }
  // 渲染
  render(data) {
    let renderData = Object.assign({}, data)
    renderData.c = this.tools.CdataToObject(data.c, data.t)
    let cspliter = renderData.c.pathData
    if (cspliter) {
      renderData.c.pathData = this.cmdToJson(cspliter)
    } else {
      console.error(cspliter)
    }
    this.createKlss(renderData)
  }
  // down
  mouseDown() {
    if (!this.onPress) {
      this.onPress = true
      // this.fabric.freeDrawingBrush.opacity = 0.5
      //   this.fabric.renderAll()
    }
  }
  // move
  mouseMove() {
    // if (document.querySelector('.upper-canvas')) {
    //     document.querySelector('.upper-canvas').style.cursor = cursor.draw
    // }
    // if (this.onPress) {
    //   // todo...
    //   this.fabric.renderAll()
    // }
  }
  // up
  mouseUp(data) {
    // console.warn(data)
    // this.id = super.getId()
    this.onPress = false
  }
}