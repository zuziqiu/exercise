import { action } from 'mobx';
export class pageAction {
  constructor( {page} ) {
    this.page = page
  }
  @action add = () => {
    this.page ++;
  }
}