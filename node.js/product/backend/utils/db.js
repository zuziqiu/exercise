const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/lagou-admin', { useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var usersSchema = mongoose.Schema({
  username: String,
  password: String
});
usersSchema.methods.speak = function () {
  var greeting = this.password
    ? "Meow password is " + this.password
    : "I don't have a password";
  console.log(greeting);
}
/**
 * 创建集合users，都相当于sql的表table。
 * usersSchema是行号document的class，这里应该是全部行号，因为method和findOne已经在Users中可以调用给每一个行号document
 */
var Users = mongoose.model('users', usersSchema);

exports.Users = Users