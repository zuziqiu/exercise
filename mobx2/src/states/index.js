import { computed, observable, autorun, observe, toJS, when, reaction, configure } from 'mobx';
// import baseState from './baseState'
import { pageState } from './page';
import { hahas } from './haha';
import { colors } from './color';
// import { actions } from '../action/index';
configure({ enforceActions: 'observed' })

var _computed = ['count']

// @addComputed({computed: _computed})
class Store {
  constructor() {
    // autorun(() => {
    //   console.log(toJS(this))
    // })

  }
  @observable haha = hahas.haha
  @observable page = pageState
  @observable color = colors.color
  @computed get total() {
    return (this.haha + this.page.pptType)
  }

  // dispatch() {
  //   actions.page
  // }
}
export const store = window.store = new Store()
// reaction(
//   () => toJS(store.page.pptType),
//   (target)=> {
//     console.log(target)
//   }
// )
// reaction(
//   () => toJS(store.haha),
//   (target)=> {
//     console.log(target)
//   }
// )
// function addComputed({computed}) {
//   return function (target) {
//     if(Array.isArray(computed)) {
//       computed.forEach(function(item, index) {
//         target.prototype[item] = 12345678
//       }) 

//       // target.prototype.logger = () => `${text}，${target.name} 被调用`

//     }
//   }
// }