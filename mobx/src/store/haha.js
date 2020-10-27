import { computed, observable, autorun, toJS } from 'mobx';
export class haha {
  constructor() {
    autorun(() => {
      // console.log(toJS(store))
      console.log(toJS(this.haha))
    })
  }
  @observable haha = 999;
}