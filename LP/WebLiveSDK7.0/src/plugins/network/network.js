/**
 * @name NetWork 网络选择模块
 * @author [Marko]
 */
import tools from '../../utils/tools'
import { STATIC } from '../../states/staticState'
import media from '../../core/mediaControler'
import * as TYPES from '../../action/action-types'
import { sdkAction } from '../../action'
import { sdkStore } from '../../states'

let network = {
  url: STATIC.APP_HOST + '/live/network.php',
  pullUrl: null,
  pullHost: null,

  // 切换类型
  pullHostType: {
    video: null,
    desktop: null
  },

  groupData: {},

  sourceSetting: {
    code: 0,
    data: [],
    buffer: 1,
    sourceName: '',
    curSourceStream: {},
    isDefaultSetting: true
  },

  //根据初始化信息，提取拉流域名和地址
  setPullInfo: function () {
    var that = this,
      pullInfo = []
    pullInfo.push('rtmp://')
    pullInfo.push(that.sourceSetting.curSourceStream.host)
    pullInfo.push(that.sourceSetting.curSourceStream.app)
    pullInfo.push(that.sourceSetting.curSourceStream.path)
    // // 设置 pullinfo 信息
    if (pullInfo) {
      that.pullUrl = pullInfo[0] + pullInfo[1] + '/' + pullInfo[2] + '/' + pullInfo[3]
      that.pullHost = pullInfo[1]
    }
    tools.debug('network pullUrl ===>' + that.pullUrl, pullInfo)
  },
  setGroup: function (copData) {
    var that = this,
      len = copData.length
    for (var i = 0; i < len; i++) {
      if (!that.sourceSetting.sourceName && copData[i].cur == 1) {
        that.sourceSetting.sourceName = copData[i].sourceName
      }
      that.groupData[copData[i].sourceName] = copData[i].stream
    }
  },

  // 获取运营商
  getOperators: function (callback, version) {
    var that = this,
      _version = 1
    that.setPullInfo()
    // 带有 version = 2 调用多CDN
    if (version) {
      _version = version
    }
    let mediaObj = media.getMediaList()
    tools.ajax({
      url: that.url,
      type: 'GET',
      data: {
        access_token: that.room.getAccessToken(),
        pullUrl: mediaObj.rtmp,
        act: 'list',
        version: _version
      },
      success: function (ret) {
        // 获取CDN资源数据

        // 设置分组数据
        if (ret.data?.length > 0) {
          that.setGroup(ret.data)
        }

        if (ret.code == 0) {
          ret.buffer = that.player.liveBuffer || 1
          // 获取成功
          if (tools.isInNative() && window.SDK) {
            SDK.call('getOperatorSuccess', ret)
          }
        } else {
          // Server获取失败
          if (tools.isInNative() && window.SDK) {
            SDK.call('getOperatorFail', ret)
          }
        }
        //
        if (typeof callback === 'function') {
          callback(ret)
        }
        // }
      },
      // 超时网络错误等..
      error: function () {
        // Server/物理错误
        if (tools.isInNative() && window.SDK) {
          SDK.call('getOperatorFail', {
            error: '-1'
          })
        }
        if (typeof callback === 'function') {
          callback({
            code: '-1'
          })
        }
      }
    })
  },
  // 重置(流程需要优化)
  reset: function () {
    this.groupData = {}
    this.sourceSetting = {
      isDefaultSetting: true
    }
  },
  curDefinition: 'fd',
  setDefinition: function (definition) {
    var that = this
    if (definition) {
      that.curDefinition = definition
    }

    if (definition && that.sourceSetting.sourceName == '') {
      that.getOperators(function () {
        that.setDefinition()
      }, 2)
      return
    }

    if (that.groupData[that.sourceSetting.sourceName]) {
      var stream = that.groupData[that.sourceSetting.sourceName]
      var streamExt = ''
      if (stream.definition?.[that.curDefinition]) {
        streamExt = stream.definition[that.curDefinition].streamExt || ''
      }

      var _path_tmp = stream.path
      stream = JSON.stringify(stream).replace(_path_tmp, _path_tmp + streamExt)
      stream = JSON.parse(stream)
      that.sourceSetting.curSourceStream = stream
    }
    that.sourceSetting.isDefaultSetting = false
    that.playBySetting(false, false)
  },

  playBySetting: function (packet) {
    var that = this
    //没有做过任何清晰度，网络选择

    if (packet?.streams) {
      var streams = []
      for (var i in packet.streams) {
        var tmp = {}
        tmp.cur = packet.streams[i].cur || 0
        tmp.sourceName = packet.streams[i].typeName || ''
        tmp.stream = packet.streams[i]
        streams.unshift(tmp)
        if (that.sourceSetting.isDefaultSetting && i == 0) {
          that.sourceSetting.sourceName = packet.streams[i].typeName
          if (packet.streams[i].definition) {
            for (var j in packet.streams[i].definition) {
              if (packet.streams[i].definition[j].isDefault) {
                that.definition = j
                break
              }
            }
          }
        }
      }
      that.setGroup(streams)
      that.setDefinition()
      return
    }

    that.setSource(that.sourceSetting)
  },
  // 设置运营商
  setOperator: function (opt, callback) {
    // opt.type = {"type": "telecom", buffer: 0/1}
    var that = this,
      _obj = {}
    // Native.
    if (tools.isMobileSDK()) {
      // string => JSON
      // {type: "telecom", sourceName: "wsCDN"}
      // @type: 运营商 @sourceName: CDN类型
      try {
        _obj = JSON.parse(opt)
      } catch (err) {
        SDK.call('setOperatorFail', err)
      }
    }
    // PC || H5
    else {
      if (typeof opt === 'string') {
        _obj.type = opt //运营商
        _obj.buffer = that.player.liveBuffer //PC极速模式
      } else if (typeof opt === 'object') {
        _obj = opt
      }
    }

    that.sourceSetting.buffer = _obj.buffer || 1
    that.sourceSetting.sourceName = _obj.sourceName || ''

    // 设置当前运营商
    tools.debug('network groupData ===> ', that.groupData[_obj.sourceName], _obj.sourceName)

    // 设置拉流信息
    that.setPullInfo()

    // set network.
    tools.ajax({
      url: that.url,
      type: 'GET',
      data: {
        access_token: that.room.getAccessToken(),
        act: 'get',
        type: _obj.type,
        sourceName: _obj.sourceName || ''
      },
      success: function (ret) {
        // 切换源
        // mobile
        if (tools.isMobileSDK()) {
          // SDK.call("setOperator", ret);
          // if (tools.getSDKMode() == 1) {
          //   if (callback) {
          //     callback(ret);
          //   }
          // }
        }
        // PC || H5
        else {
          // 成功设置PC参数
          if (ret.code == 0) {
            that.sourceSetting.data = ret.data
            that.sourceSetting.code = ret.code
            that.setDefinition()
            //that.setSource(that.sourceSetting, callback);
            callback?.(ret)
          } else {
            // if(callback){
            //     callback(ret);
            // }
          }
        }
      }
    })
  },
  // 切换源IP
  setSource: function (ret, callback) {
    var that = this
    that.sourceSetting.isDefaultSetting = false
    // H5
    if (tools.isMobile()) {
      that.player.changeSource(ret)
      if (callback) {
        callback(ret)
      }
    }
    // PC端 => Flash
    else {
      if (!that.player) {
        return false
      }
      // Flash参数
      var ipPacks = {
        t: 'flashInfo',
        ipList: ret.data,
        buffer: ret.buffer,
        sourceName: ret.sourceName,
        stream: ret.curSourceStream
      }
      ipPacks = JSON.stringify(ipPacks)

      // camera-设置IP
      that.player.getCameraPlayer(function (camera) {
        camera.cameraCommand(ipPacks)
        if (callback) {
          callback(ret.code)
        }
      })

      // player-设置IP
      that.player.getPlayer(function (player) {
        player.command(ipPacks)
        if (callback) {
          callback(ret.code)
        }
      })
    }
  },
  //cdn切换
  changeHost: function (callback) {
    var that = this
    that.setPullInfo()

    tools.ajax({
      url: that.url,
      type: 'GET',
      data: {
        access_token: that.room.getAccessToken(),
        act: 'changeHost',
        pullHost: that.pullHost
      },
      success: function (ret) {
        if (ret.code != 0 || ret.data.newPullHost == '') {
          if (callback) {
            callback({
              code: -1
            })
          }
          return false
        }
        var _obj = {
          _old: that.pullHost,
          _new: ret.data.newPullHost
        }
        that.pullUrl = that.pullUrl.replace(that.pullHost, ret.data.newPullHost)
        that.pullHost = ret.data.newPullHost

        var _data = {
          pullHost: _obj,
          type: 'hostChange'
        }

        if (!that.player) {
          return false
        }

        tools.debug('pullHost ===>', _data)
        that.player.changeHost(_data, callback)
      }
    })
  },

  // 初始化
  init: function (room, player) {
    this.room = room
    this.player = player
  },

  //资源失败重载
  hostReplace: {}, //记录失败域名对应的成功加载后的域名，下次加载其它资源时直接用成功的那个
  oriUrls: {}, //记录重试地址的原始地址
  hostGroup: [], //域名分组，重试域名只在包含本域名的组内重试

  // 保存域组
  addHostGroup: function (hg) {
    for (var i in hg) {
      this.hostGroup.push(hg[i])
    }
  },
  // 加载资源前，把URL传进来，看是否是失败过需要替换成新的
  getRetryUrl: function (url) {
    var that = this,
      _oriUrl = url

    var _host = _oriUrl.split('/')[2]
    if (typeof that.hostReplace[_host] !== 'undefined') {
      url = url.replace(_host, that.hostReplace[_host])
    }
    that.oriUrls[url] = _oriUrl
    return url
  },

  //加载失败后，把失败地址传进来，为失败的域名设置一个替换的新域名然后在callback里重新加载
  //重新加载再次走getRetryUrl即可拿到新的地址
  loadRetry: function (nowUrl, callback) {
    var that = this
    if (typeof that.oriUrls[nowUrl] === 'undefined') {
      return false
    }

    var _oriHost = that.oriUrls[nowUrl].split('/')[2]
    var _nowHost = nowUrl.split('/')[2]
    for (var g in that.hostGroup) {
      for (var h in that.hostGroup[g]) {
        if (that.hostGroup[g][h] == _oriHost) {
          var _group = [].concat(that.hostGroup[g])
          _group.splice(h, 1)
          if (typeof _group[_group.indexOf(_nowHost) + 1] !== 'undefined') {
            that.hostReplace[_oriHost] = _group[_group.indexOf(_nowHost) + 1]
            setTimeout(function () {
              callback(that.oriUrls[nowUrl])
            }, 1000)
          }
          return true
        }
      }
    }
    return false
  },
  //带重试功能的ajax
  ajax: function (params, callback) {
    var that = this
    params.url = that.getRetryUrl(params.url)
    params.error = function () {
      that.loadRetry(params.url, function (_oriUrl) {
        params.url = _oriUrl
        that.ajax(params, callback)
      })
    }
    if (callback) {
      params.success = function (ret) {
        callback(ret)
      }
    }
    tools.ajax(params)
  },
  testSpeed() {
    return new Promise((resolve) => {
      require(['network-speed'], async (NetworkSpeed) => {
        const baseUrl = `https://static-1.talk-fun.com/open/cms_v2/cms_v2_1/vue_dist/assets/font/fontawesome-webfont.ttf?timestamp=${new Date().getTime()}`
        const fileSizeInBytes = 152796
        const testNetworkSpeed = new NetworkSpeed()
        const speed = await testNetworkSpeed.checkDownloadSpeed(baseUrl, fileSizeInBytes),
          testSpeed = parseInt(speed.kbps)
        let recordSpeed = sdkStore.network.speed
        if (recordSpeed == 0) {
          recordSpeed = testSpeed
        } else {
          recordSpeed = Math.ceil((recordSpeed + testSpeed) / 2)
        }
        sdkAction.dispatch('network', {
          type: TYPES.UPDATE_NETWORK_SPEED,
          payload: {
            speed: recordSpeed
          }
        })
        tools.debug(`currentSpeedTest: ${recordSpeed}kb/s`)
        resolve({ recordSpeed })
      })
    })
  }
}

export default network
