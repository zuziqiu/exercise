import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { observer, computed, configure, autorun, observe, toJS, action } from 'mobx-react';
import { store } from './store/index';
import { actions } from './action/index';
import {transaction} from 'mobx';


window.onload = function () {

  // configure({ enforceActions: 'observed' });
  @observer
  class Bar extends Component {
    // static propTypes = {
    //   queue: PropTypes.array
    // };
    render() {
      const total = this.props.total;
      return <span>{total}</span>;
    }
  }
  @observer
  class Foo extends Component {
    static propTypes = {
      cache: PropTypes.object
    };
    render() {
      const page = this.props.store.page;
      const haha = this.props.store.haha;
      const total = this.props.store.total
      const func = function() {
          transaction(() => {
            actions.pageAction()
            actions.hahaAction()
          });
      }
      return (<div>
        <button onClick={func}>{page}</button>
        <div>{haha}</div>
        <Bar total={total} />
      </div>);
    }
  }

  // actions.pageAction();
  // actions.hahaAction();

  ReactDOM.render(<Foo store={store} />, document.querySelector('#root'));
}