const mongoose = require('mongoose');

exports.RecordScheme = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created: Date
});

exports.Record = mongoose.model('Record', exports.RecordScheme);
