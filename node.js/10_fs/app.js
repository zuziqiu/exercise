const fs = require('fs')
// 创建文件夹，回调中的参数是错误优先，操作文件时io操作，是异步
fs.mkdir('logs', (error) => { if (error) throw error; console.log('文件夹创建成功') })
// 删除文件夹
fs.rmdir('./log', () => { console.log('文件夹删除成功') })
// 修改文件夹或者文件名称
fs.rename('./logs', './log', () => { console.log('文件夹修改成功') })
// 读取文件夹
fs.readdir('./logs', (error, result) => {
  console.log(result) // 文件夹没有文件时输出的是空数组
  result.forEach((value, index) => {
    // stat是可以读到文件信息
    fs.stat(`./${value}`, (err, stats) => {
      if (stats.isDirectory()) {
        console.log(value)
      }
    })
  });
})
// 写文件
fs.writeFile('./logs/log1.log', 'hello \nworld', (err) => { console.log('done') })
// 追加内容
fs.appendFile('./logs/log1.log', '！！！', (err) => { console.log('done') })
// 删除文件
fs.unlink('./logs/log1.log', (error) => { console.log('done') })
// // 读取文件，输出的是二进制流，要用utf-8或者toString()
fs.readFile('./logs/log1.log', 'utf-8', (error, content) => { console.log(content) })
fs.readFile('./logs/log1.log', (error, content) => { console.log(content.toString()) })
// 同步读取文件
const content = fs.readFileSync('./logs/log1.log'); console.log(content.toString())
// 监听文件变化，watch有兼容性问题，最好用watchFile
fs.watch('./logs/log1.log', (type, name) => { console.log(type, name) })
fs.watchFile('./logs/log1.log', (cur, pre) => { console.log(cur, pre) })
// fsPromises这个api在执行操作后会返回promise，要求10+版本
const fsPromises = require('fs/promises')
  ; (async () => {
    let result = await fsPromises.readFile('./logs/log1.log')
    console.log(result.toString())
  })()