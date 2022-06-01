
import member from "../member/member"
// 管理功能
let manager = {
	// 踢出房间
	memberKick: member.memberKick,
	// 解除踢出
	backoutKick: member.backoutKick,
	// 解除IP
	backoutKickIP: member.backoutKickIP
}
export default manager
