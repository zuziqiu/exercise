// 评分
import map from "../../utils/map"
import STATIC from '../../core/mt.static'
import room from "../../core/room.init"
import member from "../../core/member"
import tools from "../../utils/tools"

// 评分模块
// 评分项、提交评分
var score = {
	scoreUrl: STATIC.APP_HOST + '/live/score.php',
	access_token: room.getAccessToken(),
	// 评分项
	getScoreItme () {
		return tools.getRoom().zhubo.scoreConfig
	},
	// 提交评分
	submitScore (data, callback) {
		var that = this
		// 检验传入的数据是否都有接口返回的评分项
		var scoreItme = this.getScoreItme()
		for (var key in scoreItme) {
			if (data[key] === undefined) {
				callback && callback({
					msg: `评分项不合法`,
					code: -1
				})
				return
			}
		}
		tools.ajax({
			type: 'GET',
			url: that.scoreUrl,
			dataType: 'jsonp',
			data: {
				access_token: room.getAccessToken(),
				...data,
				msg: data.msg || ''
			},
			success: function (retval) {
				callback && callback(retval)
			}
		})
	}
}
export default score