# 一.Python调用前端接口
## 1.画板操作与属性
#### 直播器端点击以下按钮后将发送一个字符串类型的变量给前端。
### 1)操作
#### 画板操作有如下十种，直播器端将发送与该操作对应的英文单词给前端，默认初始操作为曲线。
#### (1)曲线：curve
#### (2)直线：line
#### (3)虚线：dotted_line
#### (4)箭头：arrow
#### (5)椭圆：circle
#### (6)矩形：rect
#### (7)文字：text
#### (8)橡皮擦：eraser
#### (9)撤销：back
#### (10)前进：forward
### 2)颜色
#### 线的颜色有8个可选色，分别为如下8个颜色，直播器端将发送与颜色对应的英文单词给前端，默认初始颜色为白色。
#### (1)红色：red
#### (2)黄色：yellow
#### (3)蓝色：blue
#### (4)白色：white
#### (5)绿色：green
#### (6)棕色：brown
#### (7)深蓝色：dark_blue
#### (8)黑色：black
### 3)粗细
#### 线的粗细有5个可选值，分别为2，4，6，8，10，直播器端将发送字符串“width=%d”给前端，其中%d为整数，默认初始值为2。
#### (1)width=2
#### (2)width=4
#### (3)width=6
#### (4)width=8
#### (5)width=10
### 4)透明度
#### 透明度的值为0-100的整数，直播器端将发送字符串“transparency=%d”给前端，其中%d为整数，范围为0-100，默认初始值为100。
### 图片类型

#### 涂鸦
    {
      key: 'docImage',
      data: 'c://xxxx.jpg'
    }

    {
      key: 'strokeColor',
      data: '#FFFFFF'
    }

    {
      key: 'strokeType',
      data: 'circle/line/draw'
    }

    {
      key: 'changeDocType',
      data: {
        type: 11,

      }
    }

    // 传输给客户端标准格式
    {
      key: 'CLIENT_DATA_TRANSPORT',
      data: {
        type: 'cmd', //类型
        payload: 'json数据'
      }
    }