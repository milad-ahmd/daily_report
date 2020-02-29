const express = require('express')
const { WebClient } = require('@slack/web-api')
const config = require('../config')
app = express()
const User = require('../models/user')
const Message = require('../models/message')
const moment = require('moment')

const web = new WebClient(config.token)

const mongoose = require('mongoose')

mongoose.connect(
  'mongodb://localhost:27017/daily_bot'
)

mongoose.Promise = global.Promise
const CronJob = require('cron').CronJob;
const job = new CronJob({
  cronTime: '00 18 9 * * *',
  onTick: function() {
    console.log(1)
    User.find({ isActive: true }).then(async docs => {
      console.log(docs)
      if (docs.length > 0) {
        Message.find({date:moment(new Date()).format('YYYY/MM/DD'),complete:true}).then(async messages=>{
          let usersComplete=[];
          console.log(3)
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
            console.log(docs)
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
  },
  start: true,
  timeZone: 'Asia/Tehran'
});
job.start();

app.listen("3001");
