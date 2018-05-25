# H5直播模版说明文档
	1、本模版采用Seajs引擎加载(http://yslove.net/seajs/)
	2、模版技术采用 Tmodjs 模版引擎(https://github.com/aui/tmodjs)
	3、依赖 JQuery 库(https://jquery.com/)
	4、CSS采用 LESS-CSS 插件编写(http://lesscss.cn/)

## 调试说明
	@ Windows平台下, 请尽量用真机测试(PC-Chrome网页调试会产生以下报错, 因为Chrome不支持hls文件格式播放)
		`Uncaught (in promise) DOMException: The play() request was interrupted by a new load request.`
	
	@ MacOS 可以用 Safari 模拟手机调试

## JS模块说明(./js/目录)
	@global.config.js 全局配置参数
	@barrager.js 弹幕模块
	@camera.js 摄像头模块
	@chat.js 聊天模块
	@class_preview.js 课程预告模块
	@desktop.js 桌面分享模块
	@flower.js 鲜花模块
	@lottery.js 抽奖模块
	@main.js seajs入口文件
	@plugins.js 插件
	@question.js 问答模块
	@reward.js 打赏模块
	@room.core.js 房间模块(废弃)
	@room.js 房间模块
	@room.mode_view_[1/2/3] 房间模式模块[分别为1，2，3]模式
	@sdk.event.dispatch.js 指令分发
	@sdk.init.js 入口{配置}文件
	@set.js 设置模块
	@sign.js 点名模块
	@vote.js 投票模块
	@widgets.js 小部件模块
	
## 模版模块说明(tpls/template.html)
	各模版模块说明，可在文件注释内查询
	
## seajs配置文件
	(seajs-配置文件存放路径) ==> /common/js/live-core.js
	[live-core.js] 是由 seajs.js + seajs-config.js 两个文件的(gulp)合并而成（客户可以自由拆分）
	
	主要配置参数:
	@seajs.resPath ==> CDN资源path
	@seajs.baseConfig.templateUrl ==> 模块模版路径
	@seajs.baseConfig.SDK_PACK ==> JS-SDK包路径
	@seajs.baseConfig.commonPath ==> 组件路径
		
		
		
		
		
	
	
	
