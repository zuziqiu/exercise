import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { observer, computed, configure, autorun, observe, toJS, action } from 'mobx-react';
// import { computed, configure, autorun, observe, toJS, action } from 'mobx';
import { store } from './store/index';
import { actions } from './action/index';

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
    // static propTypes = {
    //   cache: PropTypes.object
    // };
    render() {
      const counter = this.props.store.counter;
      const total = this.props.store.total
      return (<div>
        <button onClick={this.props.refresh}>{counter}</button>
        <Bar total={total} />
      </div>);
    }
  }

  // actions.counterAction();
  // actions.hahaAction();

  ReactDOM.render(<Foo store={store} refresh={actions.counterAction} />, document.querySelector('#root'));
}