@name
class hao {
  constructor() {

  }
  sayHi() {
    console.log(`My name is: ${this.name}`)
  }
}

// 创建一个继承自hao的匿名类
// 直接返回并替换原有的构造函数
function name(target) {
  target.name = 'hao'
}
new hao().sayHi()