// 投票 => 新版本
import STATIC from '../../core/mt.static'
import room from '../../core/room.init'
import store from '../../core/store'
import tools from '../../utils/tools'
export default {
	voteUrl: STATIC.APP_HOST + '/live/vote.php',
	userVoteUrl: STATIC.APP_HOST + '/live/liveEvent.php',
	voteImgUrl: STATIC.APP_HOST + '/live/vote.php?action=uploadPic',
	room: null,
	packet: null,
	setData: function (packet) {
		this.packet = packet;
	},
	init: function (room) {
		this.room = room;
	},
	// 请求
	voteAjax(url, params, callback) {
		tools.ajax({
			type: 'GET',
			data: params,
			url: url,
			dataType: "jsonp",
			success: function (ret) {
				tools.callback(callback, ret);
			}
		})
	},
	// 发布投票
	publish(data) {
		let that = this
		// 发布投票
		// action: addVoteEvent
		// title: 111
		// type: 0
		// optional: 1
		// op: {
		//   "0": "1",
		//   "1": "1",
		//   "2": "1"
		// }
		// label: 测试
		// imageUrl:
		//   answer: 0
		return new Promise((resolve, reject) => {
			that.voteAjax(that.voteUrl, {
				'access_token': room.getAccessToken(),
				'action': 'addVoteEvent',
				'title': data.title ? data.title : '',
				'label': data.label ? data.label : '',
				'type': data.type ? data.type : 1,
				'optional': data.optional ? data.optional : 1,
				'op': data.op ? data.op : '',
				'imageUrl': data.imageUrl ? data.imageUrl : '',
				'answer': data.answer ? data.answer : ''
			}, (res) => {
				if (res && res.code == 0) {
					resolve(res)
				} else {
					reject(res)
				}
			})
		})
	},
	// 发布预设投票
	publishPreVote(data) {
		// 发布已保存的投票
		let that = this
		// access_token action: emitVoteEvent vid
		return new Promise((resolve, reject) => {
			that.voteAjax(that.voteUrl, {
				'access_token': room.getAccessToken(),
				'action': 'emitVoteEvent',
				'vid': data.vid
			}, (res) => {
				if (res && res.code == 0) {
					resolve(res)
				} else {
					reject(res)
				}
			})
		})
	},
	// 保存投票
	saveVote(data) {
		let that = this
		// 保存投票
		// access_token action: saveVoteEvent title label type optional op imageUrl answer
		return new Promise((resolve, reject) => {
			that.voteAjax(that.voteUrl, {
				'access_token': room.getAccessToken(),
				'action': 'saveVoteEvent',
				'title': data.title ? data.title : '',
				'label': data.label ? data.label : '',
				'type': data.type ? data.type : 1,
				'optional': data.optional ? data.optional : 1,
				'op': data.op ? data.op : '',
				'imageUrl': data.imageUrl ? data.imageUrl : '',
				'answer': data.answer ? data.answer : ''
			}, (res) => {
				if (res && res.code == 0) {
					resolve(res)
				} else {
					reject(res)
				}
			})
		})
	},
	// 修改投票
	editVote(data) {
		// 修改投票
		let that = this
		// access_token action: saveVoteEvent vid title label type optional op imageUrl answer
		return new Promise((resolve, reject) => {
			that.voteAjax(that.voteUrl, {
				'access_token': room.getAccessToken(),
				'action': 'saveVoteEvent',
				'title': data.title ? data.title : '',
				'label': data.label ? data.label : '',
				'type': data.type ? data.type : 1,
				'optional': data.optional ? data.optional : 1,
				'op': data.op ? data.op : '',
				'vid': data.vid,
				'imageUrl': data.imageUrl ? data.imageUrl : '',
				'answer': data.answer ? data.answer : ''
			}, (res) => {
				if (res && res.code == 0) {
					resolve(res)
				} else {
					reject(res)
				}
			})
		})
	},
	// 图片投票
	uploadImg(img) {
		// 图片投票上传图片
		// access_token, image
		let that = this
		return new Promise((resolve, reject) => {
			that.voteAjax(that.voteImgUrl, {
				'access_token': room.getAccessToken(),
				'image': img
			}, (res) => {
				if (res.code == 0) {
					resolve(res)
				} else {
					reject(res)
				}
			})
		})
	},
	// 获取投票列表 这个的身份可能需要改....
	voteList() {
		let that = this
		// let role = store.getters('getInitData').user.role
		// if (role === 'spadmin' || role === 'admin') {
		if(1) {
			return new Promise((resolve, reject) => {
				that.voteAjax(that.voteUrl, {
					'access_token': room.getAccessToken(),
					'action': 'getVoteEvent'
				}, (res) => {
					if(res.code == 0) {
						resolve(res)
					} else {
						reject(res)
					}
				})
			})
		} else {
			return new Promise((resolve, reject) => {
				that.voteAjax(that.userVoteUrl, {
					'access_token': room.getAccessToken(),
					'type': 'vote',
					'time': -1,
					'status': [1, 2]
				}, (res) => {
					if (res && res.code == 0) {
						resolve(res)
					} else {
						reject(res)
					}
				})
			})
		}
	},
	// 获取投票详情
	voteDetail(data) {
		let that = this
		return new Promise((resolve, reject) => {
			that.voteAjax(that.voteUrl, {
				'access_token': room.getAccessToken(),
				'action': 'getVoteList',
				'vid': data.vid || '',
				'page': data.page || 1
			}, (res) => {
				if (res && res.code == 0) {
					resolve(res)
				} else {
					reject(res)
				}
			})
		})
	},
	// 学生投票
	postVote(data) {
		// vid: 49120
		// action: vote
		// option: [2]
		// access_token:
		let that = this
		return new Promise((resolve, reject) => {
			that.voteAjax(that.voteUrl, {
				'access_token': room.getAccessToken(),
				'action': 'vote',
				'option': '[' + data.option.join(',') + ']' || '',
				'vid': data.vid
			}, (res) => {
				if (res && res.code == 0) {
					resolve(res)
				} else {
					reject(res)
				}
			})
		})
	},
	endVote(data) {
		// action: endVoteEvent
		// vid: 49121
		// publicVote: 1
		let that = this
		return new Promise((resolve, reject) => {
			that.voteAjax(that.voteUrl, {
				'access_token': room.getAccessToken(),
				'action': 'endVoteEvent',
				'publicVote': data.publicVote || 0,
				'vid': data.vid
			}, (res) => {
				if (res && res.code == 0) {
					resolve(res)
				} else {
					reject(res)
				}
			})
		})
	},
	// 删除投票
	delVote(data) {
		let that = this
		return new Promise((resolve, reject) => {
			that.voteAjax(that.voteUrl, {
				'access_token': room.getAccessToken(),
				'action': 'delVote',
				'vid': data.vid
			}, (res) => {
				if (res && res.code == 0) {
					resolve(res)
				} else {
					reject(res)
				}
			})
		})
	}
}