import { counterAction } from './counterAction';
import { hahaAction } from './hahaAction';
import { store } from './../store/index';

export const action = {
  hahaAction: new hahaAction(store),
  counterAction: new counterAction(store)
}