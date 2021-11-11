/* 
 * 这章讲爬虫
 */
const http = require('http')
const https = require('https')
const cheerio = require('cheerio')
function filterData(data) {
  const $ = cheerio.load(data) // cheerio可以为html字符串创建虚拟dom。使用方法像jq
  $('.section-item-box p').each((index, item) =>{
    console.log($(item).text())
  })
}
var server = http.createServer((request, response) => {
  let data = ''
  https.get('https://www.meizu.com', (result) => {
    result.on('data', (chunk) => {
      data += chunk
    })
    result.on('end', () => {
      filterData(data)
    })
  })
})

// console.log(myChunk([4, 5, 6, 7]))
server.listen(8090, 'localhost', () => {
  console.log('localhost: 8090')
})
