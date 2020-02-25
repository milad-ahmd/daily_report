const cron = require('node-cron')
const express = require('express')
const { WebClient } = require('@slack/web-api')
const config = require('../config')
app = express()
const User = require('../models/user')
const mongoose = require('mongoose')
const Message = require('../models/message')
const moment = require('moment')

const web = new WebClient(config.token)

cron.schedule("* 12 * * *", function() {
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
          await web.chat.postMessage({
            channel: '#daily_report_report',
            text: 'these users doesnt complete their daily report \n'+`${usersSlackId.join(' , ')}`,
          })
          const message = new Message({
            _id: new mongoose.Types.ObjectId(),
            text: 'these users doesnt complete their daily report \n'+`${usersSlackId.join(' , ')}`,
            question: 'these users doesnt complete their daily report \n'+`${usersSlackId.join(' , ')}`,
            userId: '#daily_report',
            userSlackId: '#daily_report',
            channelId: '#daily_report',
            date: moment(new Date()).format('YYYY/MM/DD')
          })
          message.save().then(result => {

          }).catch(err => {
            console.log(err)
          })
        }
      })
    }
  }).catch(err => {
    console.log(err)
  })
});
app.listen("3002");
