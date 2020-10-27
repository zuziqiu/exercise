import { action } from 'mobx';
export class counterAction {
  constructor( {counter} ) {
    this.counter = counter
  }
  @action add = () => {
    this.counter.counter ++;
  }
}