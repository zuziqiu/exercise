import { computed, observable, autorun, observe, toJS } from 'mobx';
import { counters } from './counter';
import { hahas } from './haha';

var _computed = ['count']

@addComputed({computed: _computed})
class Store {
  constructor() {
    autorun(() => {
      console.log(toJS(this))
    })
  }
  @observable haha = hahas.haha
  @observable counter = counters.counter
  @computed get total() {
    return (this.haha + this.counter)
  }
}
export const store = window.store = new Store()

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