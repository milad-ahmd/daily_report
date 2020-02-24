const express = require('express')
const router = express.Router()
const { WebClient } = require('@slack/web-api')
const config = require('./config')
const axios = require('axios')
const User = require('../models/user')
const mongoose = require('mongoose')
const Message = require('../models/message')

const BotMessages = ['Hey! Are you ready to have our YapAiTek daily meeting now?(y/n)',
  'Nice, this is your update for YapAiTek.Let\'s begin! What did you work on yesterday?',
  'Ok. What are you going to work on today?',
  'Great. Do you have any blockers? If so, just tell me. Otherwise please say \'no\'.',
  'Well done! This is all, you can continue with your work ']
const web = new WebClient(config.token)

router.post('/message', function (req, res) {
  if (req.body.event.channel_type === 'im' && req.body.event.type === 'message') {
    axios.get(`https://slack.com/api/conversations.history?token=${config.token}&channel=${req.body.event.channel}&limit=10`).then(async messages => {
      User.find({slackId:req.body.event.user}).then(async docs=>{
        if(docs.length>0){
          let lastBotMessage = null
          let lastMessage = messages.data.messages?messages.data.messages[0].text:null;
          let lastBotMessageIndex = 0
          let i=0;

          for (let item of messages.data.messages) {
            i++;
            if (item.bot_id==='BU4HJ558X'&&!lastBotMessage) {
              lastBotMessage = item.text
              lastBotMessageIndex=i-1;
              break
            }
          }
          if(lastBotMessageIndex!==0){
            if(lastMessage&&lastMessage==='daily'){
              await web.chat.postMessage({
                channel:req.body.event.channel ,
                text: BotMessages[0],
              })
              const message = new Message({
                _id: new mongoose.Types.ObjectId(),
                text: BotMessages[0],
                question: lastMessage,
                userId: docs[0]._id,
                userSlackId: req.body.event.user,
                channelId: req.body.event.channel,
                date: moment(new Date()).format('YYYY/MM/DD')
              })
              const message1 = new Message({
                _id: new mongoose.Types.ObjectId(),
                text: lastMessage,
                question: 'daily',
                userId: docs[0]._id,
                userSlackId: req.body.event.user,
                channelId: req.body.event.channel,
                date: moment(new Date()).format('YYYY/MM/DD')
              })
              message.save().then(result => {
              }).catch(err => {
                console.log(err)
              })
              message1.save().then(result => {
              }).catch(err => {
                console.log(err)
              })
            }else{

              await web.chat.postMessage({
                channel:req.body.event.channel,
                text: lastBotMessage?BotMessages[BotMessages.indexOf(lastBotMessage)+1]:BotMessages[0],
              })
              const message = new Message({
                _id: new mongoose.Types.ObjectId(),
                text: lastMessage,
                question: lastBotMessage,
                userId: docs[0]._id,
                userSlackId: req.body.event.user,
                channelId: req.body.event.channel,
                date: moment(new Date()).format('YYYY/MM/DD')
              })
              const message1 = new Message({
                _id: new mongoose.Types.ObjectId(),
                text: lastBotMessage?BotMessages[BotMessages.indexOf(lastBotMessage)+1]:BotMessages[0],
                question: lastMessage,
                userId: docs[0]._id,
                userSlackId: req.body.event.user,
                channelId: req.body.event.channel,
                date: moment(new Date()).format('YYYY/MM/DD')
              })
              message.save().then(result => {
              }).catch(err => {
                console.log(err)
              })
              message1.save().then(result => {
              }).catch(err => {
                console.log(err)
              })

              if(BotMessages.indexOf(lastBotMessage)+1===BotMessages.length-1){
                await web.chat.postMessage({
                  channel:'#daily',
                  text: `daily report complete by <${req.body.event.user}>`,
                })
              }
            }
          }else{
            if(lastMessage&&lastMessage==='daily'){
              await web.chat.postMessage({
                channel:req.body.event.channel ,
                text: BotMessages[0],
              })
              const message = new Message({
                _id: new mongoose.Types.ObjectId(),
                text: BotMessages[0],
                question: BotMessages[0],
                userId: docs[0]._id,
                userSlackId: req.body.event.user,
                channelId: req.body.event.channel,
                date: moment(new Date()).format('YYYY/MM/DD')
              })
              message.save().then(result => {
              }).catch(err => {
                console.log(err)
              })
            }
          }
        }else{
          const user = new User({
            _id: new mongoose.Types.ObjectId(),
            slackId:req.body.event.user,
            channelId:req.body.event.channel,
            isActive: true
          })
          user.save().then(async result => {
            await web.chat.postMessage({
              channel:req.body.event.channel ,
              text: BotMessages[0],
            })
            const message = new Message({
              _id: new mongoose.Types.ObjectId(),
              text: 'Hey! Are you ready to have our YapAiTek daily meeting now?(y/n)',
              question: 'Hey! Are you ready to have our YapAiTek daily meeting now?(y/n)',
              userId: user._id,
              userSlackId: req.body.event.user,
              channelId: req.body.event.channel,
              date: moment(new Date()).format('YYYY/MM/DD')
            })
            message.save().then(result => {
            }).catch(err => {
              console.log(err)
            })
          }).catch(err => {
            console.log(err)

          })
        }
      })



    })
  }
})

module.exports = router
