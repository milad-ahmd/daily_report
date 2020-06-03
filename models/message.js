const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  text:String,
  question:String,
  userId:String,
  userSlackId:String,
  channelId:String,
  complete:{type:Boolean,default:false},
  completeReport:{type:Boolean,default:false},
  date:String
});

module.exports = mongoose.model('Message', messageSchema);
