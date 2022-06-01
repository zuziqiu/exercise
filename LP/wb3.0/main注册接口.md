## 画板main.dispatch(data: {modules, type, payload})，关于type的描述
|  type  |  data  |  说明 |
|  ----  |  ----  |  ----  |
| FIRE_DEBUG_MODE | "payload":{"visible":"true"}} | 是否开启debug模式
| UPDATE_ROOM_CURUSER | "payload":{xid: xxx, .....} | 设置画板用户身份（直播器没有身份）
| UPDATE_ROOM_HANDLER_XID | "payload":"483374643" | 记录操作者id
| "WHITEBOARD_BRUSH_TYPE" | "payload":"18"} | 切换画笔类型
| "PAGE_PREV" | "payload":1 | 上一页
| "PAGE_NEXT" | "payload":1 | 下一页
| "WHITEBOARD_BRUSH_DATA" | "payload":{"fontSize":36}} | 设置画笔类型的数据（文字和图片）
| "WHITEBOARD_BRUSH_STROKE_COLOR" | "payload":"#fbd504"} | 设置画笔颜色
| "WHITEBOARD_BRUSH_STROKE_WIDTH" | "payload":"10"} | 设置画笔线宽
| "WHITEBOARD_BACKGROUND_COLOR" | "payload":"#7A40FF"} | 白板背景颜色

<br/> 
<br/> 

## 画板main.emit(key, command, callback)，关于key的描述
|  key  |  说明 |
|  ----  |  ----  |
| "wb:page:socketUpdatePage" | 接收socket翻页数据
| "UPDATE_PAGE_DRAW_DATA" | 接收涂鸦数据
| "WHITEBOARD_RESIZE" | 白板resize
| "PPT_RESIZE" | ppt resize
| "wb:page:applyWhiteboard" | 监听画板外部传入的新增白板指令(client)
| "wb:page:computedPages" | 重新计算page
| "wb:page:doSetPage" | 监听画板外部传入的应用PPT指令(小班讲师或助教应用PPT)
| "wb:page:clientUpdatePage" | 监听画板外部传入的翻页指令(client)