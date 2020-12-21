import { computed, observable, autorun, observe, toJS, when, reaction } from 'mobx';
import { pages } from './page';
import { hahas } from './haha';
import { colors } from './color';

var _computed = ['count']

@addComputed({computed: _computed})
class Store {
  constructor() {
    // autorun(() => {
    //   console.log(toJS(this))
    // })

  }
  @observable haha = hahas.haha
  @observable page = pages.page
  @observable color = colors.color
  @computed get total() {
    return (this.haha + this.page)
  }
}
export const store = window.store = new Store()
reaction(
  () => [toJS(store.color), store.page, store.haha],
  (data)=> console.log(data)
)
function addComputed({computed}) {
  return function (target) {
    if(Array.isArray(computed)) {
      computed.forEach(function(item, index) {
        target.prototype[item] = 12345678
      }) 

      // target.prototype.logger = () => `${text}，${target.name} 被调用`

    }
  }
}