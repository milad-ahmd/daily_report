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
  'mongodb://milad:74626731@localhost:27017/daily_bot?authSource=admin'
)

mongoose.Promise = global.Promise
const CronJob = require('cron').CronJob;
const job = new CronJob({
  cronTime: '00 00 9 * * *',
  onTick: function() {
    User.find({ isActive: true,timeZone: 'Asia/Tehran' }).then(async docs => {
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
              if(!(usersComplete.indexOf(item._id.toString())>-1)){
                users.push(item);
                usersSlackId.push(item.slackId);
              }
            }
            for (let item of users) {
              await web.chat.postMessage({
                channel: item.channelId,
                text: 'Hey! Are you ready to have our *YapAiTek* daily meeting now?(y/n)',
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

const jobTurkey = new CronJob({
  cronTime: '00 00 9 * * *',
  onTick: function() {
    User.find({ isActive: true,timeZone: 'Europe/Istanbul' }).then(async docs => {
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
              if(!(usersComplete.indexOf(item._id.toString())>-1)){
                users.push(item);
                usersSlackId.push(item.slackId);
              }
            }
            for (let item of users) {
              await web.chat.postMessage({
                channel: item.channelId,
                text: 'Hey! Are you ready to have our *YapAiTek* daily meeting now?(y/n)',
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
  timeZone: 'Europe/Istanbul'
});
job.start();
jobTurkey.start();

app.listen("3001");
