const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  slackId:String,
  channelId:String,
  avatar:String,
  name:String,
  timeZone:{type:String,default:'Asia/Tehran'},
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('User', userSchema);
