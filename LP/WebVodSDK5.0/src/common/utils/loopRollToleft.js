'use strict';
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory)
  } else if (typeof exports === 'object') {
    // CMD
    console.warn('just support browser environment')
    module.exports = factory()
  } else {

    // window.loopRollToLeft.roll(el, options) 开始
    // window.loopRollToLeft.hide() 停止
    root.loopRollToLeft = factory()
  }
}(this, function () {

  /**
   * @method 向左循环滚动方法
   * @param {HTMLElement} insertPoint 插入点，原生dom，非zepto,非jquery对象
   * @param {Object} options 配置参数 对象
   *  @param {String} options.content 滚动显示的主体内容
   *  @param {String} options.link 配置在新窗口打开的链接
   *  @param {String} options.circleTime 配置 多少 秒后自动关闭滚动提示 单位：秒
   *  @param {String} options.moveTime 设置定时器循环的间隔时间，影响滚动速度，越小越快，单位：毫秒，默认10毫秒
   * 如果要修改 滚动条样式，可以直接修改或者添加 这里面的 css 对象的属性，或者写在样式表里用 !important优先级覆盖
   */
  return (function () {

    // 模板
    var template

    // 滚动模块的最外层元素，用于获取屏幕宽度
    var rollBox
    
    // rollBoxInner
    var rollBoxInner

    // 添加到rollBoxInner (a元素) 上的链接
    var rollBoxInnerLink

    // 屏幕宽度
    var screenWidth

    // 滚动的内容元素
    var rollTarget

    // 滚动的内容元素的内容
    var rollTargetContent

    // 滚动的内容元素的宽
    var rollTargetWidth

    // 关闭按钮
    var closeBtn

    // css[id]  id 为 dom ID 用于 document.getElementById() 获取dom
    // 修改样式可以直接改此处或者在样式表里 使用 !important 优先级
    var css = {
      rollBox: {
        width: '100%',
        height: '24px',
        'background-color': '#333',
        color: '#fff',
        position: 'absolute',
        left: 0,
        bottom: 0,
        overflow: 'hidden'
      },
      closeBtn: {
        'font-size': '14px',
        'line-height': '24px',
        'text-align': 'center',
        position: 'absolute',
        right: 0,
        top: 0,
        'z-index': 1,
        'padding-left': '4px',
        'padding-right': '4px',
        'background-color': '#333',
        color: '#fff',
        cursor: 'pointer'
      },
      rollBoxInner: {
        width: '1000%',
        display: 'block',
        height: '24px',
        'line-height': '24px',
        color: '#fff',
        'text-decoration': 'none'
      },
      htRollLeft: {
        float: 'left',
        position: 'relative',
        'font-size': '12px'
      },
      htRollRight: {
        overflow: 'hidden',
        position: 'relative',
        width: '98%',
        height: '24px',
        'font-size': '12px'
      },
      rollContent: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '24px',
        'line-height': '24px',
      },
      iconNotice: {
        'background-image': 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAYCAMAAADat72NAAAATlBMVEUAAAD2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTr2rTooExwDAAAAGXRSTlMA7gXykb3LnoJ2TS356dvOp4lEMSMVDGxraDBcHAAAAIdJREFUKM+d0tkKwyAQhWFn1CxN9/28/4tWocxUsDmQ/yaED8FlQtstS9Lwp/sZpUsfH2mPmoSazuMvPqeIb/V3GSCO+j5UcBYMi/MRaHmcbYfXU0DLniYBWs475wQYW5Ox9Bi2Hl3O6xyLxPLZxplsjRyMXwu7VPIknr46D0rGgQwTH0UyyB+p6CCY2ln0JwAAAABJRU5ErkJggg==)',
        'width': '20px',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        'background-size': '20px',
        'background-repeat': 'no-repeat',
        'background-position': 'left center'
      },
      noticeContent: {
        'padding-left': '22px'
      }
    }

    function getStyle(el, style) {
      if (!(el instanceof HTMLElement)) throw new Error('getStyle接收一个原生DOM对象')
      if (style) {
        if (window.getComputedStyle) {
          return window.getComputedStyle(el, null)[style]
        } else {
          return el.currentStyle[style]
        }
      } else {
        if (window.getComputedStyle) {
          return window.getComputedStyle(el, null)
        } else {
          return el.currentStyle
        }
      }
    }
    function transformCase(str){
      var reg=/-(\w)/g
      return str.replace(reg, function($0,$1) {
          return $1.toUpperCase()
      })
    }
    function setStyle(el, obj) {
      var styleName
      for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
          styleName = transformCase(k)
          el.style[styleName] = obj[k]
        }
      }
    }
    function createRollTemplate() {
      var str =
        '<div class="close_btn" id="closeBtn">X</div>' +
        '<a href="javascript:;" class="ht_roll_main" id="rollBoxInner" target="_blank">' +
        '<div class="ht_roll_left" id="htRollLeft">' +
        '<i class="icon_notice" id="iconNotice"></i>' +
        '<span class="notice_content" id="noticeContent">通知</span>' +
        '</div>' +
        '<div class="ht_roll_right" id="htRollRight">' +
        '<span class="ht_roll_content" id="rollContent"></span>' +
        '</div>' +
        '</a>';
      var div = document.createElement('div')
      div.innerHTML = str
      div.className = 'ht_roll_box'
      div.id = 'rollBox'

      return div
    }
    function resetRollStatus() {
      if (!rollTarget || !rollBox) return false
      rollBox.style.display = 'none'
      rollTarget.style.left = screenWidth + 'px'
    }
    function rollToLeft(el, target, begin, circleTime, moveTime) {
      clearInterval(el.timer)
      clearInterval(el.circleTimer)
      var step = target > el.offsetLeft ?
        1 :
        -1
      el.timer = setInterval(function() {
        var distance = target - el.offsetLeft
        el.style.left = el.offsetLeft + step + 'px'
        if (Math.abs(distance) <= Math.abs(step)) {

          // clearInterval(el.timer)
          if (begin) {
            el.style.left = getStyle(rollBox, 'width')
          } else {
            el.style.left = '100%'
          }
        }
      }, moveTime || 10)
      if (circleTime) {
        el.circleTimer = setInterval(function() {
          circleTime--
          if (circleTime <= 0) {
            clearInterval(el.timer)
            clearInterval(el.circleTimer)
            resetRollStatus()
          }
        }, 1000)
      }
    }
    function addEvent() {
      if (!closeBtn) return false
      closeBtn.addEventListener('click', function(e) {
        e.cancelBubble = true
        e.stopPropagation()
        hide()
      })
    }
    function hide() {
      if (!rollBox || !rollTarget) return false
      rollBox.style.display = 'none'
      clearInterval(rollTarget.timer)
      clearInterval(rollTarget.circleTimer)
    }
    function roll(insertPoint, opt) {
      var insert = insertPoint || document.body
      var options = opt || {}
      if (!template) {

        // 获取模板
        template = createRollTemplate()
        insertPoint.appendChild(template)
        rollTarget = document.getElementById('rollContent')
        rollBox = document.getElementById('rollBox')
        rollBoxInner = document.getElementById('rollBoxInner')
        closeBtn = document.getElementById('closeBtn')

        // 添加css属性
        for (var id in css) {
          var curDom = document.getElementById(id)
          var styles = css[id]
          // console.log(curDom)
          setStyle(curDom, styles)
        }
        addEvent()
      }
      if (!(rollTargetContent === options.content)) {
        rollTargetContent = options.content
        rollTarget.innerHTML = options.content
      }
      if (!(rollBoxInnerLink === options.link)) {
        rollBoxInnerLink = options.link
        rollBoxInner.setAttribute('href', options.link)
      }
      rollTargetWidth = parseInt(getStyle(rollTarget, 'width'))
      screenWidth = parseInt(getStyle(rollBox, 'width'))
      rollTarget.style.left = screenWidth + 'px'
      rollBox.style.display = 'block'
      rollToLeft(rollTarget, -rollTargetWidth, screenWidth, options.circleTime, options.moveTime)
    }
    return {
      roll: roll,
      hide: hide 
    }
  }())
}))