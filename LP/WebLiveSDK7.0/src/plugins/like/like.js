// 点赞
import { sdkStore } from '../../states'
import { STATIC } from '../../states/staticState'
import tools from "../../utils/tools"
export const like = {
  like(times, callback) {
    tools.ajax({
      type: 'GET',
      url: STATIC.APP_HOST + '/live/like.php?act=click',
      dataType: 'jsonp',
      data: {
        access_token: sdkStore.room.access_token,
        times
      },
      success: function (retval) {
        callback?.(retval)
      }
    })
  }
}