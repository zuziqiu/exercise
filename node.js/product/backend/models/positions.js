const { Positions } = require('../utils/db');

exports.add = (data) => {
  const position = new Positions(data);
  return position.save();
};

exports.list = () => {
  return Positions.find({});
};

exports.remove = (id) => {
  return Positions.deleteOne({ _id: id });
};

exports.update = (data) => {
  return Positions.findByIdAndUpdate(data.id, data);
};

exports.listOne = (id) => {
  return Positions.findOne({ _id: id });
};
