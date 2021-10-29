const https = require('https')
https.get('https://m.maoyan.com/ajax/moreClassicList?sortId=1&showType=3&limit=10&offset=30&optimus', (res) => {
  console.log(res)
  let str = ''
  res.on('data', (chunk) => {
    str += chunk
  })
  res.on('end', () => {
    console.log(str)
  })
})