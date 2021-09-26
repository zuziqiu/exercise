import { action } from 'mobx';
import { pageAction } from './pageAction';
import { hahaAction } from './hahaAction';
import { store } from '../states/index';


class Action {
  // @action hahaAction = () => {
  //   store.haha++;
  // }

  // @action pageAction = () => {
  //   store.page++;
  // }
  constructor() {
    // this.actionArray = [new pageAction(store), new hahaAction(store)]
    this.page = new pageAction(store)
    this.haha = new hahaAction(store)
  }
}

export const actions = new Action()