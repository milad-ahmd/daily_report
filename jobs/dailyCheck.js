const cron = require('node-cron')
const express = require('express')
const { WebClient } = require('@slack/web-api')
const config = require('../config')
app = express()
const User = require('../models/user')
const mongoose = require('mongoose')
const Message = require('../models/message')
const moment = require('moment')
var schedule = require('node-schedule-tz');
const web = new WebClient(config.token)

schedule.scheduleJob('0 9 * * *','Asia/Tehran', function(){
  User.find({ isActive: true }).then(async docs => {
    if (docs.length > 0) {
      Message.find({date:moment(new Date()).format('YYYY/MM/DD'),complete:true}).then(async messages=>{
        let usersComplete=[];
        let users=[]
        let usersSlackId=[]
        if(messages){
          for(let sub of messages){
            usersComplete.push(sub.userId)
          }
          for (let item of docs) {
            if(!(usersComplete.indexOf(item._id)>-1)){
              users.push(item);
              usersSlackId.push(item.slackId);
            }
          }
          for (let item of docs) {
            await web.chat.postMessage({
              channel: item.channelId,
              text: 'Hey! Are you ready to have our YapAiTek daily meeting now?(y/n)',
            })
          }
        }
      })
    }
  }).catch(err => {
    console.log(err)
  })
});
cron.schedule("* 12 * * *", function() {

});
app.listen("3002");
