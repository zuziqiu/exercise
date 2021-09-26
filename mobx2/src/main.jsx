import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { store } from './states/index';
import { actions } from './action/index';
import { transaction, reaction, toJS } from 'mobx';

/* 组件 */
import { Whiteboard } from './components/Whiteboard'


window.onload = function () {

  // configure({ enforceActions: 'observed' });

  @observer
  class Foo extends Component {
    constructor() {
      super()
      reaction(
        () => { return { haha: toJS(store.haha), page: toJS(store.page.pptType) } },
        ({ haha, page }) => {
          console.log('haha=>', haha, page)
        }
      )
    }
    static propTypes = {
      cache: PropTypes.object
    }
    abc() {
      actions.page.dispatch({
        type: 'UPDATE_PPT_TYPE',
        payload: 2
      })
    }
    render() {
      let that = this
      const page = this.props.store.page;
      const haha = this.props.store.haha;
      const total = this.props.store.total
      const func = function () {
        transaction(() => {
          // actions.page.dispatch({
          //   type: 'UPDATE_PPT_TYPE',
          //   payload: 1
          // })
          // transaction(() => {
          //   that.abc()
          // })
          setTimeout(() => {
            // transaction(() => {
            actions.haha.add()
          }, 0);

          actions.page.dispatch({
            type: 'UPDATE_PPT_TYPE',
            payload: 1
          })
          // })
        });
      }
      return (<div>
        <button onClick={func}>{page.pptType}</button>
        <div>{haha}</div>
        <Whiteboard total={total} />
      </div>);
    }
  }
  ReactDOM.render(<Foo store={store} />, document.querySelector('#root'));
}