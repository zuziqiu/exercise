import { action } from 'mobx';
// import { pageAction } from './pageAction';
// import { hahaAction } from './hahaAction';
import { store } from './../store/index';


export class Action {
  @action hahaAction = () => {
    store.haha++;
  }

  @action pageAction = () => {
    store.page++;
  }
}

export const actions = new Action()