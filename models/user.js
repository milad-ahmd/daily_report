const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  slackId:String,
  channelId:String,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('User', userSchema);