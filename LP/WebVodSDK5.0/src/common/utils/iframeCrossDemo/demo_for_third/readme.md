### iframeCross_client 说明文档

本方法用于嵌套iframe跨域通信

### 测试
    开启一个本地测试服务器
    ```bash
    npm install 
    node server.js
    ```

### 引入此js库文件
`//static-1.talk-fun.com/open/maituo_v2/dist/iframe_bridge/iframeCross-client-v1.0.js`

### 使用方法 IframePostMessage

	@创建一个实例:
	var talkfun_connector = new IframePostMessage(options);
	
	@options:
		@(String)[必需]options.targetUrl ==> 目标通信地址
        @(object)[选择]options.attrs ==> json字符串
        @(function)[选择]options.load ==> iframe onload onerror 时执行的回调函数
		@(Html-Element)[选择]options.insert ==> iframe插入位置，不传默认document.body

#### 发送消息 sendMessage
	
	@传递参数:
		@(String)cmd 为一个指令字符串
		@(Object/String) msg为一个字符串或者是JSON对象
        @(String)type broadcast/callback
	
	@使用
	talkfun_connector.sendMessage(cmd, msg);
	
	@example: 
	talkfun_connector.sendMessage('cmd',{'test1':'消息1','test2':'消息2'})

#### 接收消息 receiveMessage
	
	@msg接收参数:
		@(Object/String) data为一个JSON对象
			@(String) => data.cmd
			@(JSON/String) => data.msg
            @(String) => data.type
	
	@使用:
	talkfun_connector.receiveMessage(function(msg){
	​	console.log(msg)
	});
	
	注意: receiveMessage中的回调函数，只要有数据回调时才被触发。