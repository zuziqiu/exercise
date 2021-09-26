import React, { Component } from 'react';
// import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { store } from '../states/index';
import { actions } from '../action/index';
import { transaction, reaction, toJS } from 'mobx';

@observer
export class Whiteboard extends Component {
  // static propTypes = {
  //   queue: PropTypes.array
  // };

  constructor() {
    super()
    reaction(
      () => {return {haha:toJS(store.haha), page:toJS(store.page.pptType)}},
      ({haha, page}) => {
        console.log('whiteboard=>', haha, page)
      },
    )
  }

  render() {
    const total = this.props.total;
    return <span>{total}</span>;
  }
}
// export class Whiteboard extends Component {
//   constructor() {

//   }
// }