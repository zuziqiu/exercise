import React from 'react'
import ReactDOM from 'react-dom'
// import './index.css'
// import App from './App'

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// )
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
const First = () => <p>页面1</p>
const name = 'echo'
const h1 = (
  <Router>
    <h1>hello {name}</h1>
    {/* 指定路由入口 */}
    <Link to="/first">第一个页面</Link>
    {/* 指定路由出口 */}
    <Routes>
      <Route path="/first" element={<First />} />
    </Routes>
  </Router>
)
ReactDOM.render(h1, document.querySelector('#root'))
