import request from '../../../common/utils/request'
import STATIC from '@/sdkStore/states/staticState'
import tools from '../../../common/utils/tools'
// 获取列表
export const getlist = (access_token) => {
  tools.debug('chat load start...')
  return request({
    method: 'GET',
    url: STATIC.URL.APP_HOST + `/playback/chat.php`,
    params: {
      access_token,
      "51test": window.location.href.indexOf('51test') > -1 ? 1 : null
    }
  })
}