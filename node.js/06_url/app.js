var log4js = require('log4js')
log4js.configure({
  appenders: { cheese: { type: "file", filename: "cheese.log" } },
  categories: { default: { appenders: ["cheese"], level: "error" } }
});
var logger = log4js.getLogger('cheese')
logger.level = 'debug'

// const url = require('url')
// const urlString = 'https://www.baidu.cim:443/path/index.html?id=2#tag=3'
// logger.debug(url.parse(urlString))

// const urlObj = {
//   protocol: 'https:',
//   slashes: true,
//   auth: null,
//   host: 'www.baidu.cim:443',
//   port: '443',
//   hostname: 'www.baidu.cim',
//   hash: '#tag=3',
//   search: '?id=2',
//   query: 'id=2',
//   pathname: '/path/index.html',
//   path: '/path/index.html?id=2',
//   href: 'https://www.baidu.cim:443/path/index.html?id=2#tag=3'
// }
// logger.debug(url.format(urlObj))

// logger.debug(url.resolve('http://www.abc.com/a', '../')) // resolve可以解析路径
// logger.debug(url.resolve('http://www.abc.com/a', '/b'))
const urlString = 'https://www.baidu.cim:443/path/index.html?id=2#tag=3'

let url = new URL(urlString)
console.log(url)
const urlParams = new URLSearchParams(url.search)
logger.debug(urlParams)
logger.debug(urlParams.get('id'))