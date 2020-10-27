简体中文 | [English](./README.md) 

# Cax [![](https://img.shields.io/npm/v/cax.svg)](https://www.npmjs.com/package/cax) 

> 小程序、小游戏以及 Web 通用 Canvas 渲染引擎

* 微信小游戏

![你在画什么](https://github.com/dntzhang/cax/raw/master/asset/draw.png)

![点十消除](./asset/wegame.jpg)

* [Wechart by Cax![](./asset/hot.png)](https://github.com/dntzhang/wechart)
* Web DEMO & [→ Source Code](https://github.com/dntzhang/cax/tree/master/packages/cax/examples)
  * [Simple](https://dntzhang.github.io/cax) 
  * [Animation](https://dntzhang.github.io/cax/packages/cax/examples/to/) 
  * [Clip](https://dntzhang.github.io/cax/packages/cax/examples/clip/) 
  * [Clip Transform](https://dntzhang.github.io/cax/packages/cax/examples/clip-transform/) 
  * [Clip Transition](https://dntzhang.github.io/cax/packages/cax/examples/clip-transition/) 
  * [To2To Animate](https://dntzhang.github.io/cax/packages/cax/examples/to-animate/) 
  * [Swing](https://dntzhang.github.io/cax/packages/to/examples/swing/) 
  * [Cax + Matter](https://dntzhang.github.io/cax/packages/cax/examples/matter/) 
  * [Pie Chart](https://dntzhang.github.io/wechart/packages/pie/examples/simple/)
  * [To + Shape](https://dntzhang.github.io/cax/packages/cax/examples/to-shape/)
  * [Vision](https://dntzhang.github.io/cax/packages/cax/examples/vision/)
  * [Cache](https://dntzhang.github.io/cax/packages/cax/examples/cache/)
  * [Filter](https://dntzhang.github.io/cax/packages/cax/examples/filter/)
  * [SVG](https://dntzhang.github.io/wechart/packages/path/examples/man/)
  * [Graphics](https://dntzhang.github.io/cax/packages/cax/examples/graphics/)
  * [Composite Operation](http://dntzhang.github.io/cax/packages/cax/examples/composite-operation/)
  * [Cax + Dragonbones](https://dntzhang.github.io/wechart/packages/cax-dragonbones/examples/simple/index.html)
* 小程序线上产品 

![星球部落](./asset/xqbl.png)

![星球部落](./asset/ss1.png)![星球部落](./asset/ss3.png)


## 特性

* Learn Once, Write Anywhere(小程序、小游戏、PC Web、Mobile Web)
* Write Once, Run Anywhere(小程序、小游戏、Web只需要修改`new Stage`传入参数即可)
* 支持小程序、小游戏以及 Web 浏览器渲染
* 小程序、小游戏和 Web 拥有相同简洁轻巧的 API
* 高性能且松耦合的渲染架构
* 超轻量级的代码体积
* 支持 Canvas 元素管理
* 支持 Canvas 元素事件体系
* 图灵完备的 group 嵌套体系
* 内置 [to2to](https://github.com/dntzhang/cax/tree/master/packages/to) 的跨平台运动引擎
* 支持可以变形的 clip 裁剪体系
* 内置文本、位图、序列帧、绘图对象和多种矢量绘制对象
* 支持 SVG Path 渲染
* 支持几乎全部的 CSS 滤镜和其他常用滤镜
* 内置图片加载器
---

- [一分钟入门小程序 cax 使用](#一分钟入门小程序-cax-使用)
- [一分钟入门小游戏 cax 使用](#一分钟入门小游戏-cax-使用)
- [一分钟入门 Web cax 使用](#一分钟入门-web-cax-使用)
- [内置对象](#内置对象)
  - [Group](#group)
    - [Group 方法](#group-方法)
      - [add](#add)
      - [remove](#remove)
      - [empty](#empty)
      - [replace](#replace)
  - [Stage](#stage)
    - [Stage 方法](#stage-方法)
      - [update](#update)
      - [scaleEventPoint](#scaleeventpoint)
    - [Stage 属性](#stage-属性)  
      - [disableMoveDetection](#disablemovedetection)
      - [moveDetectionInterval](#movedetectioninterval)
  - [Bitmap](#bitmap)
  - [Sprite](#sprite)
      - [Sprite 方法](#sprite-方法)
        - [gotoAndPlay](#gotoandplay)
        - [gotoAndStop](#gotoandstop)
        - [gotoAndPlayOnce](#gotoandplayonce)
  - [Text](#text)
      - [Text 方法](#text-方法)
        - [getWidth](#getwidth)
  - [Graphics](#graphics)
  - [Shape](#shape)
	- [Rect](#rect)
	- [Circle](#circle)
	- [Ellipse](#ellipse)
  - [Element](#element)
	- [Button](#button)
- [属性](#属性)
  - [Transform](#transform)
  - [Alpha](#alpha)
  - [CompositeOperation](#compositeoperation)
  - [Cursor](#cursor)
  - [Fixed](#fixed)
  - [Shadow](#shadow)
  - [Stage](#stage-1)    
- [方法](#方法)  
  - [destroy](#destroy)
- [事件](#事件)
	- [小程序事件](#小程序事件) 
  - [Web 事件](#web-事件) 
- [运动](#运动)
- [裁剪](#裁剪)
- [自定义对象](#自定义对象)
	- [自定义 Shape](#自定义-shape) 
  - [自定义 Element](#自定义-element) 
- [图片加载器](#图片加载器)
- [谁在使用？](#谁在使用)
- [微信交流群](#微信交流群2)
- [License](#license)



## 一分钟入门小程序 cax 使用

到 GitHub [下载 cax 自定义组件](https://github.com/dntzhang/cax/tree/master/packages/cax-weapp)，然后小程序引入 cax 自定义组件:

```
└── cax
    ├── cax.js
    ├── cax.json  
    ├── cax.wxml  
    ├── cax.wxss
    └── index.js
```

在 page 或者 component 里声明依赖:

```json
{
  "usingComponents": {
    "cax":"../cax/cax"
  }
}
```

在的 wxml 里引入 cax 标签:

```html 
<cax id="myCanvas"></cax>
```

在 js 里渲染逻辑:

```js
import cax from '../cax/index'

Page({
  onLoad: function () {
    //比 web 里使用 cax 多传递 this，this 代表 Page 或 Component 的实例
    const stage = new cax.Stage(200, 200, 'myCanvas', this)
    const rect = new cax.Rect(100, 100, {
      fillStyle: 'black'
    })
    
    rect.originX = 50
    rect.originY = 50
    rect.x = 100
    rect.y = 100
    rect.rotation = 30

    rect.on('tap', () => {
      console.log('tap')
    })

    stage.add(rect)
    stage.update()
  }
})
```

效果如下所示:

![](./asset/demo.jpg)

除了 tap 事件，也可以帮 rect 绑定其他触摸事件：

```js
rect.on('touchstart', () => {
  console.log('touchstart')
})

rect.on('touchmove', () => {
  console.log('touchmove')
})

rect.on('touchend', () => {
  console.log('touchend')
})
```

主要，小程序事件触发是根据元素的矩形区域，所以需要设置 width 和 height 才能绑定触发事件。

## 一分钟入门小游戏 cax 使用

到 GitHub [下载 cax 小游戏示例](https://github.com/dntzhang/cax/tree/master/packages/cax-wegame)，目录结构和运行效果如下:

![](./asset/cax-wegame.png)

``` js
const stage = new cax.Stage()
```

和小程序以及 Web 不同的是，小游戏创建 Stage 不需要传任何参数。

## 一分钟入门 Web cax 使用

通过 npm 或者 CDN 获取:

``` bash
npm i cax
```

* [https://unpkg.com/cax@latest/dist/cax.min.js](https://unpkg.com/cax@latest/dist/cax.min.js)
* [https://unpkg.com/cax@latest/dist/cax.js](https://unpkg.com/cax@latest/dist/cax.js)

使用方法:

``` js
import cax from 'cax'

const stage = new cax.Stage(200, 200, 'body')

cax.loadImgs({
  imgs: ['./wepay-diy.jpg'],
  complete: (imgs) => {
    const img = imgs[0]
    const bitmap = new cax.Bitmap(img)

    bitmap.x = stage.width / 2
    bitmap.y = stage.height / 2
    bitmap.rotation = -10
    bitmap.originX = img.width / 2
    bitmap.originY = img.height / 2
    bitmap.filter('blur(10px)')

    stage.add(bitmap)
    stage.update()
  }
})
```

除了 Stage 构造函数比小程序第四个参数 `this`，其他使用方式都一样。执行上面代码你将看到如下效果:

![](./asset/getting-start.png)

## 内置对象

### Group

用于分组， group 也可以嵌套 group，父容器的属性会叠加在子属性上, 比如：

* group 的 x 是 100, group 里的 bitmap 的 x 是 200， 最后 bitmap 渲染到 stage 上的 x 是 300
* group 的 alpha 是 0.7, group 里的 bitmap 的 alpha 是 0.6, 最后 bitmap 渲染到 stage 上的 alpha 是 0.42

```js
const group = new cax.Group()
const rect = new cax.Rect(100, 100, {
  fillStyle: 'black'
})
group.add(rect)
stage.add(group)
stage.update()
```

group 拥有常用的 add 和 remove 方法进行元素的增加和删除。先 add 的会先绘制，所有后 add 的会盖在先 add 的上面。

#### Group 方法

##### add

添加对象

``` js
groupObj.add (child) 
```

##### remove

移除对象

``` js
groupObj.remove (child)
``` 

##### empty

清空子对象

``` js
groupObj.empty ()
``` 

##### replace

使用一个对象替代子对象

```js
groupObj.replace (current, pre)
```

### Stage

最大的顶层容器，继承自 Group，所以 Group 拥有的方法它全都有。

#### Stage 方法

##### update

任何元素添加到舞台上是看不到的，你必须执行 update 方法。

```js
stage.update()
```

任何元素属性的修改请执行 stage.update() 来更新舞台，或者放在定时器里:

```js
cax.tick(stage.update.bind(stage))
```

##### scaleEventPoint

当 canvas 的宽高 和 canvas 的像素不对应的时候，事件触发位置是不准确的，你可以使用 scaleEventPoint 方法使事件校正准确。

```js
//canvas 宽高是像素的一半
stage.scaleEventPoint(0.5, 0.5)
```

例子: https://github.com/dntzhang/cax/blob/master/packages/cax/examples/pie/main.js#L218-L220

#### Stage 属性

##### disableMoveDetection

是否禁用鼠标或触摸移动的事件检测。

```js
stage.disableMoveDetection = true
```

这里需要注意，Web 的 disableMoveDetection 默认是 false，微信小游戏默认是 true。所以微信小游戏想要监听 touchmove 和 drag 事件的话需要在创建完 Stage 之后执行下面代码开启监听:

```js
stage.disableMoveDetection = false
```

##### moveDetectionInterval

设置 touchmove 和 mousemove 检测的间隔 

```js
//每秒检测两次
stage.moveDetectionInterval = 500
```

### Bitmap

```js
const bitmap = new cax.Bitmap(img)
stage.add(bitmap)
stage.update()
```

如果只传 url 而不是 Image 对象的实例，需要这样:

```js
const bitmap = new cax.Bitmap('./wepay.png', ()=>{
  stage.update()
})
stage.add(bitmap)
```

这里需要注意小程序需要配置 downloadFile 需要配置合法域名才能正常加载到图片。

可以设置图片裁剪显示区域，和其他 transform 属性:

```js
bitmap.rect = [0, 0, 170, 140]
bitmap.x = 200
```

### Sprite

序列帧动画组件，可以把任意图片的任意区域组合成一串动画。

```js
const sprite = new cax.Sprite({
    framerate: 7,
    imgs: ['./mario-sheet.png'],
    frames: [
        // x, y, width, height, originX, originY ,imageIndex
        [0, 0, 32, 32],
        [32 * 1, 0, 32, 32],
        [32 * 2, 0, 32, 32],
        [32 * 3, 0, 32, 32],
        [32 * 4, 0, 32, 32],
        [32 * 5, 0, 32, 32],
        [32 * 6, 0, 32, 32],
        [32 * 7, 0, 32, 32],
        [32 * 8, 0, 32, 32],
        [32 * 9, 0, 32, 32],
        [32 * 10, 0, 32, 32],
        [32 * 11, 0, 32, 32],
        [32 * 12, 0, 32, 32],
        [32 * 13, 0, 32, 32],
        [32 * 14, 0, 32, 32]
    ],
    animations: {
        walk: {
            frames: [0, 1]
        },
        happy: {
            frames: [5, 6, 7, 8, 9]
        },
        win: {
            frames: [12]
        }
    },
    playOnce: false,
    currentAnimation: "walk",
    animationEnd: function () {

    }
});
```

#### Sprite 方法

##### gotoAndPlay

跳到当前 animationName 并开始播放

```js
spriteObj.gotoAndPlay(animationName)
```

##### gotoAndStop

跳到当前 animationName 并开始停止

```js
spriteObj.gotoAndStop(animationName)
```

##### gotoAndPlayOnce

跳到当前 animationName 并开始播放，播完一轮销毁自己。常用于爆炸

```js
spriteObj.gotoAndPlayOnce(animationName)
```

### Text

文本对象

``` js
const text = new cax.Text('Hello World', {
  font: '20px Arial',
  color: '#ff7700',
  baseline: 'top'
})
```

#### Text 方法

##### getWidth

获取文本宽度

```js
textObj.getWidth()
```

### Graphics

绘图对象，用于使用基本的连缀方式的 Canvas 指令绘制图形。

``` js
const graphics = new cax.Graphics()
graphics
    .beginPath()
    .arc(0, 0, 10, 0, Math.PI * 2)
    .closePath()
    .fillStyle('#f4862c')
    .fill()
    .strokeStyle('black')
    .stroke()

graphics.x = 100
graphics.y = 200

stage.add(graphics)
```

特别注意，如果你在某个循环中执行 graphics 连缀绘制操作，请务必加上 clear() 方法，不然路径叠加到你的浏览器不堪重负:

```js
cax.setInterval(function(){
  graphics
    .clear()
    .beginPath()
    .arc(0, 0, 10, 0, Math.PI * 2)
    .stroke()
}, 16)
```

### Shape

与 Graphics 不同的是， Shape 一般拥有有限的宽高，所以可以使用离屏 Canvas 进行缓存。下面这些属于 Shape。

#### Rect

``` js
const rect = new cax.Rect(200, 100, {
  fillStyle: 'black'
})
```

#### Circle

``` js
const circle = new cax.Circle(10)
```

#### Ellipse

``` js
const ellipse = new cax.Ellipse(120, 20)
```

注意：从技术上小游戏和 Web 可以离屏 Canvas，小程序不行，因为小程序不支持动态创建离屏 Canvas。

### Element

Element 是多种元素的组合，如 Bitmap、Group、 Text、 Shape 等混合起来的图像。

#### Button

``` js
const button = new cax.Button({
  width: 100,
  height: 40,
  text: "Click Me!"
})
```

## 属性

### Transform

|属性名      |描述   |
|---|---|
| x | 水平偏移 |
| y | 竖直偏移 |
| scaleX | 水平缩放 |
| scaleY | 竖直缩放 |
| scale | 同时设置或读取 scaleX 和 scaleY |
| rotation | 旋转 |
| skewX | 歪斜 X |
| skewY | 歪斜 Y |
| originX | 旋转基点 X |
| originY | 旋转基点 Y |

### Alpha

|属性名      |描述   |
|---|---|
| alpha | 元素的透明度 |

注意这里父子都设置了 alpha 会进行乘法叠加。

### compositeOperation 

|属性名      |描述   |
|---|---|
| compositeOperation | 源图像绘制到目标图像上的叠加模式 |

注意这里如果自身没有定义 compositeOperation 会进行向上查找，找到最近的定义了 compositeOperation 的父容器作为自己的 compositeOperation。

### Cursor

|属性名      |描述   |
|---|---|
| cursor | 鼠标移上去的形状 |

### Fixed

|属性名      |描述   |
|---|---|
| fixed | 是否固定定位，默认是 false 设置成 true 不会叠加祖辈们的 transform 属性|

### Shadow

|属性名      |描述   |
|---|---|
| shadow | 阴影|

使用方式:

```js
obj.shadow = {
    color: '#42B035',
    offsetX: -5,
    offsetY: 5,
    blur: 10
}
```

### Stage

|Name      |Describe   |
|---|---|
| stage |或者自己所在的 stage|

使用方式:

```js
obj.stage
```

## 方法

### destroy

销毁自己

``` js
obj.destroy()
```

## 事件

### 小程序事件

|事件名      |描述   |
|---|---|
| tap | 手指触摸后马上离开 |
| touchstart | 手指触摸动作开始 |
| touchmove | 手指触摸后移动 |
| touchend | 手指触摸动作结束 |
| drag | 拖拽 |

### Web 事件

|事件名      |描述   |
|---|---|
| click | 元素上发生点击时触发 |
| mousedown | 当元素上按下鼠标按钮时触发 |
| mousemove | 当鼠标指针移动到元素上时触发 |
| mouseup | 当在元素上释放鼠标按钮时触发 |
| mouseover | 当鼠标指针移动到元素上时触发 |
| mouseout | 当鼠标指针移出元素时触发 |
| tap | 手指触摸后马上离开 |
| touchstart | 手指触摸动作开始 |
| touchmove | 手指触摸后移动 |
| touchend | 手指触摸动作结束 |
| drag | 拖拽 |

## 运动

cax 内置了 to 的能力以连缀的方式写运动效果：

``` js
const easing = cax.To.easing.elasticInOut

cax.To.get(bitmap)
    .to({ y: 340, rotation: 240 }, 2000, easing)
    .begin(() => {
        console.log("Task one has began!")
    })
    .progress(() => {
        console.log("Task one is progressing!")
    })
    .end(() => {
        console.log("Task one has completed!")
    })
    .wait(500)
    .to()
    .rotation(0, 1400, easing)
    .begin(() => {
        console.log("Task two has began!")
    })
    .progress(() => {
        console.log("Task two is progressing!")
    })
    .end(() => {
        console.log("Task two has completed!")
    })
    .start();
```

* `to` 和 `to` 之间的是并行
* `to` 和 `wait` 之前的是串行
* `to` 和 `to` 之间的 与 下一个 `to` 和 `to` 之间的是串行

有点绕，但是很直观，慢慢体会。

当然，也可以通过 set 方法支持任意属性的运动，如:

``` js
.set('y', 240, 2000, cax.easing.elasticInOut)
``` 

等同于

``` js
.y(240, 2000, cax.easing.elasticInOut)
```

如果想要循环播放的话可以使用 `cycle` 方法:

``` js
cax.To.get(bitmap)
    .to()
    .y(340, 2000, cax.easing.elasticInOut)
    .to
    .y(0, 2000, cax.easing.elasticInOut)
    .cycle()
    .start()
```

* [→ 运动演示地址](http://dntzhang.github.io/cax/packages/cax/examples/to/)
* [→ 去 to2to 一看究竟](https://github.com/dntzhang/cax/tree/master/packages/to)
* [→ 看看 cax.To.easing 种类](http://tweenjs.github.io/tween.js/examples/03_graphs.html)

这里需要注意，和 tween.js 不同，cax 把 easing 命名全改成了一个单词的驼峰命名。如 Cubic.In 变成了 cubicIn。

## 裁剪

```js
const stage = new cax.Stage(600, 400, 'body')
const bitmap = new cax.Bitmap('./wepay-diy.jpg', () => {
    stage.update()
})
const clipPath = new cax.Graphics()
clipPath.arc(40, 40, 25, 0, Math.PI * 2)
bitmap.clip(clipPath)
stage.add(bitmap)
```

使用下面的代码可以得到同样的效果:

```js
const clipPath = new cax.Graphics()
clipPath.x = 40
clipPath.y = 40
clipPath.arc(0, 0, 25, 0, Math.PI * 2)
```

所以，裁剪区域也是支持所有 transform 属性(x,y,scaleX,scaleY,rotation,skewX,skewY,originX,originY)。

[→ 裁剪演示地址](http://dntzhang.github.io/cax/packages/cax/examples/clip/)

## 自定义对象

### 自定义 Shape

自定义 Shape 继承自 cax.Shape:

``` js
class Sector extends cax.Shape {
  constructor (r, from, to, option) {
    super()

    this.option = option || {}
    this.r = r
    this.from = from
    this.to = to
  }

  draw () {
    this.beginPath()
      .moveTo(0, 0)
      .arc(0, 0, this.r, this.from, this.to)
      .closePath()
      .fillStyle(this.option.fillStyle)
      .fill()
      .strokeStyle(this.option.strokeStyle)
      .lineWidth(this.option.lineWidth)
      .stroke()
  }
}
```

使用 Shape:

``` js
const sector = new Sector(10, 0, Math.PI/6, {
  fillStyle: 'red'
  lineWidth: 2
})
stage.add(sector)
stage.update()
```

### 自定义 Element

自定义 Element 继承自 cax.Group:

``` js
class Button extends cax.Group {
  constructor (option) {
    super()
    this.width = option.width
    this.roundedRect = new  cax.RoundedRect(option.width, option.height, option.r)
    this.text = new cax.Text(option.text, {
      font: option.font,
      color: option.color
    })

    this.text.x = option.width / 2 - this.text.getWidth() / 2 * this.text.scaleX
    this.text.y = option.height / 2 - 10 + 5 * this.text.scaleY
    this.add(this.roundedRect, this.text)
  }
}

export default Button
```

使用:

``` js
const button = new cax.Button({
  width: 100,
  height: 40,
  text: "Click Me!"
})
```

一般情况下，稍微复杂组合体都建议使用继承自 Group，这样利于扩展也方便管理自身内部的元件。
小游戏的 DEMO 里的 [Player、Bullet、Enemy、Background](https://github.com/dntzhang/cax/tree/master/packages/cax-wegame/js) 全都是继承自 Group。
[Wechart 的所有图表](https://github.com/dntzhang/wechart/tree/master/packages)全都是继承自 Group。

## 图片加载器

``` js
cax.loadImg({
  img: './a.png',
  complete: function(img){

  }
})
```

加载多张图片：

```js
cax.loadImgs({
  img: ['./a.png','./b.png'],
  progress: function(progress){
    console.log(progress) //0.5 and then 1
  },
  complete: function(imgs){
    console.log(imgs[0]) //Image(a.png)
    console.log(imgs[1]) //Image(b.png)
  }
})
```

## 谁在使用？

![Tencent Wechat](./asset/wx.png)  ![Tencent QQ](./asset/qq.png)

## 微信交流群【2】

![](https://github.com/dntzhang/wechart/raw/master/asset/g2.png)

## License

MIT
