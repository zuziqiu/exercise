import React from 'react';
import ReactDOM from 'react-dom';

let dom = React.createElement('span', null, 'hello')
ReactDOM.render(dom, document.querySelector('#root'))