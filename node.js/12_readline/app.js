// Readline是Node.js里实现标准输入输出的封装好的模块，通过这个模块我们可以以逐行的方式读取数据流。使用require("readline")可以引用模块。
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 可以和控制台对话
rl.question('What do you think of Node.js? ', (answer) => {
  // TODO：执行操作
  console.log(`Thank you for your valuable feedback: ${answer}`);
  // 记录答案到数据库中
  // xxx
  rl.close();
});