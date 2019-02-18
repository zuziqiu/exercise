import { counterAction } from './counterAction';
import { store } from './../store/index';

export const action = {
  counterAction: new counterAction(store)
}