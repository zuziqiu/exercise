import { eventModule } from "./eventModule";
class __eventStore {
  constructor() {
    this.callbackObj = {};
    this.temporaryData = {}
    this.hook();
  }
  hook() {
    eventModule.map((key) => {
      // 为定义好的每一个模块中的事件名注册方法
      this[key] = (res) => {
        // this.callbackObj[key]是数组时，说明已经有外部回调通过sdk.on方法传入了。
        if (Object.prototype.toString.call(this.callbackObj[key]) === '[object Array]') {
          this.callbackObj[key].forEach((callback) => {
            callback(res);
          });
        } else {
          // this.temporaryData 会在mounted之后置null。此后不需要再储存临时数据
          if (this.temporaryData) {
            // this.callbackObj[key] 不存在时要先把数据存起来，等待通过sdk.on方法传入的回调去执行
            if (!this.temporaryData[key]) {
              this.temporaryData[key] = []
            }
            this.temporaryData[key].push(res)
          }
        }
      };
    });
  }
  clear(target) {
    if (target) {
      this[target] = null;
      this.callbackObj[target] = [];
    } else {
      Object.keys(eventModule).map((key) => {
        this[key] = null;
        this.callbackObj[key] = [];
      });
    }
  }
  emit(key, ...args) {
    let __key = eventModule.find((event) => event === key);
    if (__key) {
      this[key](...args);
    } else {
      console.warn(`warning ==> sdk.emit(key, res) key:非法的${key}`);
    }
  }
  /**
   * @param {String} key
   * @param {Function} callback
   */
  on(key, callback) {
    // eventModule中有的key才允许保存到callbackObj[key]的callback数组，，key非法时只会得到警告
    let __key = eventModule.find((event) => event === key);
    if (__key) {
      if (Object.prototype.toString.call(callback) === "[object Function]") {
        // 判断事件名对象的存储callback数组的属性是否存在
        if (this.callbackObj[__key]) {
          this.callbackObj[__key].push(callback);
        }
        else {
          // 临时数据调取(可能未经过sdk.on注册时就已经有数据回来了。所以on传入的callback也执行一遍，同时清除on前数据)
          // this.temporaryData将会在socket success的时候被置null，不再作为临时保存数据的对象
          if (this.temporaryData && Object.prototype.toString.call(this.temporaryData[__key]) === '[object Array]') {
            // temporaryData 是sdk.on方法未传入回调时，sdk内部发送过来的数据先存起来，以期取出在sdk.on传入的回调中使用
            this.temporaryData[__key].map(item => {
              callback(item)
            })
          }
          this.callbackObj[__key] = [];
          this.callbackObj[__key].push(callback);
        }
      }
    } else {
      console.warn(`warning ==> sdk.on(key, callback) key:非法的${key}`);
    }
  }

  /**
   * 第三方注入
   * @param {String} key
   * @param {Function} callback
   */
  put(key, callback) {
    if (Object.prototype.toString.call(callback) === "[object Function]") {
      // 判断事件名对象的存储callback数组的属性是否存在
      if (!this.callbackObj[key]) {
        this.callbackObj[key] = [];
      }
      this.callbackObj[key].push(callback);
    }
  }
}
export const eventStore = new __eventStore();
