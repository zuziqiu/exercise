/* 
 * MT 是为了兼容旧版sdk(sdk7.0以前)使用,以后将会废弃
 */
import sdkCore from './sdk.core'
export const MT = {
  SDK: sdkCore
}
/* 
 * TFSDK 是未来版本(sdk7.0起)
 */
export { TFSDK } from './sdkClass'
