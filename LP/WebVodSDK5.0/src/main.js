// /**
//  * ## 点播入口文件 ##
//  */
// import '@babel/polyfill'
// import sdkCore from './sdk.vod.core'
// export default {
//   SDK: sdkCore
// }
/* 
 * MT 是为了兼容旧版sdk(sdk5.0以前)使用,以后将会废弃
 */
import sdkCore from './sdk.vod.core'
export const MT = {
  SDK: sdkCore
}
/* 
 * TFSDK 是未来版本(sdk5.0起)
 */
export { TFSDK } from './sdkClass'
