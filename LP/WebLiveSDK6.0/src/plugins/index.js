// 插件入口
// define(function (require) {
// 	// package
// 	var vote = require("./vote/vote"),
// 		lottery = require("./lottery/lottery"),
// 		iframe = require("./iframe/iframe"),
// 		flower = require("./flower/flower");
// 	// 插件
// 	var plugins = {
// 		// 投票
// 		vote: vote,
// 		// 鲜花
// 		flower: flower,
// 		// 抽奖
// 		lottery: lottery,
// 		//iframe
// 		iframe: iframe
// 	}
// 	// exports
// 	return plugins;
// });
import vote_v2 from './vote/vote'
import vote from './vote/vote_v2'

import flower from './flower/flower'
import lottery from './lottery/lottery'
import iframe from './iframe/iframe'
import marker from './marker'
import score from './score/score.js'
export default {
	// 投票
	vote_v2: vote_v2, // 新版本
	vote: vote, // 旧版本
	// 鲜花
	flower: flower,
	// 抽奖
	lottery: lottery,
	//iframe
	iframe: iframe,
	// 水印
	marker: marker,
	score // 评分
}