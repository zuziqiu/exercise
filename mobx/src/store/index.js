import { computed, observable } from 'mobx';
import { counter } from './counter';
import { haha } from './haha';

export const store = {
  haha: new haha,
  counter: new counter,
}