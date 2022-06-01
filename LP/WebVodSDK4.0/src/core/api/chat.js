import request from '@Request'
import Store from '@Store'
import STATIC from '@Static'
import tools from '@tools'
// 获取列表
export const getlist = () => {
  tools.debug('chat load start...')
  return request({
    method: 'GET',
    url: STATIC.APP_HOST + `/playback/chat.php`,
    params: {
      access_token: Store.state().token,
      "51test": window.location.href.indexOf('51test') > -1 ? 1 : null
    }
  })
}
