const { Users } = require("../utils/db")


const findUser = (username) => {
  return Users.findOne({ username })
}
const signup = ({ username, password }) => {
  const users = new Users({
    username,
    password
  })
  return users.save(function (err, fluffy) {
    if (err) return console.error(err);
    // fluffy.speak()
  })
}

const findList = () => {
  return Users.find().sort({ _id: -1 })
}

const remove = (id) => {
  // return Users.deleteOne({ _id: id })
  return Users.findByIdAndRemove(id)
}

exports.signup = signup
exports.findUser = findUser
exports.findList = findList
exports.remove = remove