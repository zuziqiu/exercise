import { action } from 'mobx';
export class hahaAction {
  constructor( store ) {
    this.store = store
  }
  @action add = () => {
    this.store.haha ++;
  }
}