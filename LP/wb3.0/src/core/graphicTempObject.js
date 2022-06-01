import { STATIC } from '../states/staticState'
export const graphicTempObject = {
  imgList: [],
  textList: [
    // id: {
    //   sourceData: '',
    //   newestData: '',
    //   instanceOject: new xx
    // }
  ],
  pointerList: [],
  currentFocusTextId: '',
  actionEvent: [],
  loading: false,
  // fetchListOnKey: function({key}) {
  //   return this[key]
  // },
  get: function ({ id }) {
    // 图片标志
    if (id.includes('i') && Object.keys(this.imgList).includes(id)) {
      return this.imgList[id]
    }
    // 文字标志
    if (id.includes('t') && Object.keys(this.textList).includes(id)) {
      return this.textList[id]
    }
    // 教棍标志
    if (id.includes('p') && Object.keys(this.pointerList).includes(id)) {
      return this.pointerList[id]
    }
  },
  set: function ({ id, data }) {
    // 图片标志
    if (id.includes('i')) {
      if (data) {
        Object.keys(data).map((item) => {
          if (Object.prototype.toString.call(this.imgList[id]) !== "[object Object]") {
            this.imgList[id] = {}
          }
          this.imgList[id][item] = data[item]
        })
      }
    }
    // 文字标志
    if (id.includes('t')) {
      if (data) {
        Object.keys(data).map((item) => {
          if (Object.prototype.toString.call(this.textList[id]) !== "[object Object]") {
            this.textList[id] = {}
          }
          this.textList[id][item] = data[item]
        })
      }
    }
    // 教棍标志
    if (id.includes('p')) {
      if (data) {
        Object.keys(data).map((item) => {
          if (Object.prototype.toString.call(this.pointerList[id]) !== "[object Object]") {
            this.pointerList[id] = {}
          }
          this.pointerList[id][item] = data[item]
        })
      }
    }
  },
  clear: function (type, id) {
    // 判断类型
    if (type) {
      // 该类型的下id指向的对象数据被置空
      if (id) {
        this[type][id] = null
      } else {
        // 不指定id则置空该类型
        this[type] = []
      }
    } else {
      // 不注定指定类型则置空图片和文字类型
      this.imgList = []
      this.textList = []
      this.pointerList = []
    }
  }
}