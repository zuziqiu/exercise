import { computed, configure, autorun, observe, toJS } from 'mobx';
import { store } from './store/index';
import { action } from './action/index';
configure({ enforceActions: 'observed' })
window.onload = function () {
  // function render(state) {
  //   document.getElementById('counter').textContent = state.counter;
  // }

  document.getElementById('button').addEventListener('click', function () {
    action.counterAction.add();
    action.hahaAction.add();
  });
  // (function () {
    // autorun(() => {
    //   // console.log(toJS(store))
    //   console.log(toJS(store.counter))
    // })
  // })();
  // (function () {
  //   autorun(() => {
  //     // console.log(toJS(store))
  //     console.log(toJS(store.haha))
  //   })
  // })();
}
