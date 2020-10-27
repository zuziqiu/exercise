import { action } from 'mobx';
export class hahaAction {
  constructor( {haha} ) {
    this.haha = haha
  }
  @action add = () => {
    this.haha ++;
  }
}