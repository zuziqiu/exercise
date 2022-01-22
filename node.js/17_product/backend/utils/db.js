const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/lagou-admin", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

var usersSchema = mongoose.Schema({
  username: String,
  password: String,
});
usersSchema.methods.speak = function () {
  var greeting = this.password
    ? "Meow password is " + this.password
    : "I don't have a password";
  console.log(greeting);
};

/**
 * 创建集合users，都相当于sql的表table。
 * usersSchema是行号document(sql的row)的class，因为已经可以调用methods和findOne
 */
var Users = mongoose.model("users", usersSchema);

var positionsSchema = mongoose.Schema({
  companyLogo: {
    type: String,
    required: true, // 要求该域必须要传
  },
  companyName: String,
  positionsName: String,
  city: String,
  createTime: String,
  salary: String,
});
var Positions = mongoose.model("positions", positionsSchema);

exports.Users = Users;
exports.Positions = Positions;
