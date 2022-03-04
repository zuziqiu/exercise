const { Sequelize, DataTypes, Model } = require('sequelize')
const sequelize = new Sequelize('exercise', 'root', '123456', {
  host: 'localhost',
  dialect: 'mysql' /* 选择 'mysql' | 'mariadb' | 'postgres' | 'mssql' 其一 */
})

try {
  ;(async function () {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
  })()
} catch (error) {
  console.error('Unable to connect to the database:', error)
}
class User extends Model {
  static classLevelMethod() {
    return 'foo';
  }
  instanceLevelMethod() {
    return 'bar';
  }
  getFullname() {
    return [this.firstname, this.lastname].join(' ');
  }
}
User.init({
  firstname: Sequelize.TEXT,
  lastname: Sequelize.TEXT
}, { sequelize });

console.log(User.classLevelMethod()); // 'foo'
const user = User.build({ firstname: 'Jane', lastname: 'Doe' });
console.log(user.instanceLevelMethod()); // 'bar'
console.log(user.getFullname()); // 'Jane Doe'

user.save()