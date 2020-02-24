const cron = require('node-cron')
const express = require('express')
const { WebClient } = require('@slack/web-api')
const config = require('../config')
app = express()
const User = require('../models/user')
const mongoose = require('mongoose')
const Message = require('../models/message')

const web = new WebClient(config.token)

cron.schedule('* 9 * * *', function () {
  User.find({ isActive: true }).then(async docs => {
    if (docs.length > 0) {
      for (let item of docs) {
        await web.chat.postMessage({
          channel: item.channelId,
          text: 'Hey! Are you ready to have our YapAiTek daily meeting now?(y/n)',
        })
        const message = new Message({
          _id: new mongoose.Types.ObjectId(),
          text: 'Hey! Are you ready to have our YapAiTek daily meeting now?(y/n)',
          question: 'Hey! Are you ready to have our YapAiTek daily meeting now?(y/n)',
          userId: item._id,
          userSlackId: item.slackId,
          channelId: item.channelId,
          date: moment(new Date()).format('YYYY/MM/DD')
        })
        message.save().then(result => {

        }).catch(err => {
          console.log(err)

        })
      }
    }
  }).catch(err => {
    console.log(err)
  })
})
app.listen("3001");
