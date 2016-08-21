const mongoose = require('mongoose');

exports.UserScheme = new mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  openid: {
    unique: true,
    type: String,
    require: true
  },
  created: Date
});

exports.User = mongoose.model('User', exports.UserScheme);
