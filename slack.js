const express = require('express')
const router = express.Router()
const { WebClient } = require('@slack/web-api')
const config = require('./config')
const axios = require('axios')
const User = require('./models/user')
const mongoose = require('mongoose')
const Message = require('./models/message')
const moment = require('moment')

const BotMessages = ['Hey! Are you ready to have our YapAiTek daily meeting now?(y/n)',
  'Nice, this is your update for YapAiTek.Let\'s begin! What did you work on yesterday?',
  'Ok. What are you going to work on today?',
  'Great. Do you have any blockers? If so, just tell me. Otherwise please say \'no\'.',
  'Well done! This is all, you can continue with your work ']

const web = new WebClient(config.token)

sendMessage = async (userId, userSlackId, text, question, channel) => {
  await web.chat.postMessage({
    channel: channel,
    text: text,
  })
  const message = new Message({
    _id: new mongoose.Types.ObjectId(),
    text: text,
    question: question,
    userId: userId,
    userSlackId: userSlackId,
    channelId: channel,
    date: moment(new Date()).format('YYYY/MM/DD')
  })
  message.save().then(result => {
  }).catch(err => {
    console.log(err)
  })
}

router.post('/message', function (req, res) {
  if (req.body.event.channel_type === 'im' && req.body.event.type === 'message') {
    console.log(req.body.event)
    axios.get(`https://slack.com/api/conversations.history?token=${config.token}&channel=${req.body.event.channel}&limit=10`).then(async messages => {
      User.find({ slackId: req.body.event.user }).then(async docs => {
        if (docs.length > 0&&!req.body.event.bot_id) {
          let lastBotMessage = null
          let lastMessage = messages.data.messages ? messages.data.messages[0].text : null
          let lastBotMessageIndex = 0
          let i = 0

          for (let item of messages.data.messages) {
            i++
            if (item.bot_id && !lastBotMessage) {
              lastBotMessage = item.text
              lastBotMessageIndex = i - 1
              break
            }
          }

          if (lastBotMessageIndex !== 0) {
            if (lastMessage && lastMessage === 'daily') {
              await web.chat.postMessage({
                channel: req.body.event.channel,
                text: BotMessages[0],
              })
            } else {
              let botMessageIndex = lastBotMessage ? BotMessages.indexOf(lastBotMessage) + 1 : 0
              if (botMessageIndex === 1 && lastMessage === 'n') {
                return await web.chat.postMessage({
                  channel: req.body.event.channel,
                  text: 'ok you can complete your daily report if you have been ready with send daily word to bot!.',
                })
              }
              await this.sendMessage(docs[0]._id,req.body.event.user,BotMessages[botMessageIndex],botMessageIndex===0?'daily':BotMessages[botMessageIndex]);
              if (botMessageIndex === BotMessages.length - 1) {
                Message.find({userId:docs[0]._id,userSlackId:req.body.event.user,channelId:req.body.event.channel,date:moment(new Date()).format('YYYY/MM/DD')}).then(async reports=>{
                  var text='';
                  for(let item of reports){
                    text+=item.question+'\n'
                    text+=item.text+'\n'
                  }
                  text+='author: '+`#<${req.body.event.user}>`
                  await web.chat.postMessage({
                    channel: '#daily',
                    text: text,
                  })
                })

              }
            }
          } else {
            if (lastMessage && lastMessage === 'daily') {
              await web.chat.postMessage({
                channel: req.body.event.channel,
                text: BotMessages[0],
              })
            }
          }
        } else if (!req.body.event.bot_id) {
          const user = new User({
            _id: new mongoose.Types.ObjectId(),
            slackId: req.body.event.user,
            channelId: req.body.event.channel,
            isActive: true
          })
          user.save().then(async result => {
            await web.chat.postMessage({
              channel: req.body.event.channel,
              text: BotMessages[0],
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
