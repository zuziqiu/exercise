import { action } from 'mobx';
// import { counterAction } from './counterAction';
// import { hahaAction } from './hahaAction';
import { store } from './../store/index';


export class Action {
  @action hahaAction = () => {
    store.haha++;
  }

  @action counterAction = () => {
    store.counter++;
  }
}

export const actions = new Action()