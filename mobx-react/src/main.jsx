import { observable, action } from 'mobx';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';

class Store {
  @observable cache = {
    queue: [],
  }
  @observable bbb = 2
  @action.bound refresh() {
    this.cache.queue.push(1)
  }
}
const store = new Store();

// bar foo
@observer
class Bar extends Component {
  static propTypes = {
    queue: PropTypes.array
  };
  render() {
    const queue = this.props.queue;
    return <span>{queue.length}</span>;
  }
}
@observer
class Foo extends Component {
  static propTypes = {
    cache: PropTypes.object
  };
  render() {
    const cache = this.props.cache;
    return (<div>
      <button onClick={this.props.refresh}>Refresh</button>
      {null && <Bar  queue={cache.queue} />}
    </div>);
  }
}

ReactDOM.render(<Foo cache={store.cache} refresh={store.refresh} />, document.querySelector('#root'));
setTimeout(() => {
  store.cache.queue.push(1)
}, 5000);
// @name
// class hao {
//   sayHi() {
//     console.log(`My name is: ${this.name}`)
//   }
// }

// // 创建一个继承自hao的匿名类
// // 直接返回并替换原有的构造函数
// function name(target) {
//   return class extends target {
//     name = 'hao'
//   }
// }
// new hao().sayHi()