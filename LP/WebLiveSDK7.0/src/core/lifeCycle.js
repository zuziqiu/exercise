/*
 * 生命周期函数文件
 */
import { toJS } from "mobx";
import { sdkStore } from "../states";
import tools from "../utils/tools";
export const lifeCycle = {
  // 生命函数控制器
  lifeControler: {},
  // 加入生命周期队列
  join: function (key, callback) {
    tools.debug("lifeCycle receive ==>", key);
    if (this[key]) {
      if (!this.lifeControler[key]) {
        this.lifeControler[key] = this[key](callback); // 迭代器
      } else {
        tools.debug(`lifeCycle ${key} multiple defined`);
      }
    }
  },
  // // 在请求init.php之前
  // * beforeInterface(callback) {
  //   tools.debug('sdk => beforeInterface')
  //   callback?.()
  // },
  // 在请求init.php之后
  *finishInterface(callback) {
    tools.debug("sdk => finishInterface");
    callback?.();
  },
  // 初始化socket之前
  *beforeSocket(callback) {
    tools.debug("sdk => beforeSocket");
    callback?.();
  },
  // socket连接成功之后
  *finishSocket(callback) {
    tools.debug("sdk => finishSocket");
    callback?.();
  },
  // 摄像头播放器创建成功
  *createdCameraPlayer(callback) {
    tools.debug("sdk => createdCameraPlayer");
    callback?.();
  },
  // 桌面分享/视频播放的播放器创建成功
  *createdVideoPlayer(callback) {
    tools.debug("sdk => createdVideoPlayer");
    callback?.();
  },
  // 课件播放器创建成功
  *createdCoursewarePlayer(callback) {
    tools.debug("sdk => createdCoursewarePlayer");
    callback?.();
  },
  /**
   * mounted 需要执行两次yield才能真正勾起mounted,分别是socket连接成功和playerSchedule的注册的播放器都执行完毕，但是两者顺序不定
   */
  *mounted(callback) {
    // 一个函数生成器
    try {
      yield "step1";
      yield callback(toJS(sdkStore.room.initData));
    } catch (e) {
      tools.debug(e);
    }
  },
};
