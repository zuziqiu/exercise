// 插件入口
define(function (require) {
	// package
	let vote = require("./vote/vote")
	let lottery = require("./lottery/lottery")
	// let iframe = require("./iframe/iframe")
	let flower = require("./flower/flower")
	let marker = require('./marker/index')['default']
	// 插件
	var plugins = {
		// 投票
		vote: vote,
		// 鲜花
		flower: flower,
		// 抽奖
		lottery: lottery,
		// marker
		marker: marker
	}
	// exports
	return plugins;
});