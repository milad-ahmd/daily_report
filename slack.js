const express = require('express')
const router = express.Router()
const { WebClient } = require('@slack/web-api')
const config = require('./config')
const axios = require('axios')
const User = require('./models/user')
const mongoose = require('mongoose')
const Message = require('./models/message')
const moment = require('moment')

const BotMessages = ['Hey! Are you ready to have our *YapAiTek* daily meeting now?(y/n)',
  'Nice, this is your update for *YapAiTek* .Let\'s begin! What did you work on *yesterday*?',
  'Ok. What are you going to work on *today*?',
  'Great. Do you have any *blockers*? If so, just tell me. Otherwise please say (*no*).',
  'Well done! This is all, you can continue with your work ']

const web = new WebClient(config.token)

sendMessage = async (userId, userSlackId, text, question, channel) => {
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
              if(botMessageIndex>=1){
                await web.chat.postMessage({
                  channel: req.body.event.channel,
                  text: BotMessages[botMessageIndex],
                })

              }
              if(botMessageIndex>1){
                await this.sendMessage(docs[0]._id,req.body.event.user,lastMessage,BotMessages[botMessageIndex-1],req.body.event.channel);
              }
              if (botMessageIndex === BotMessages.length - 1) {
                Message.find({userId:docs[0]._id,userSlackId:req.body.event.user,channelId:req.body.event.channel,date:moment(new Date()).format('YYYY/MM/DD')}).then(async reports=>{
                  var text=`Daily Report by <@${req.body.event.user}>`;
                  let blocks=[
                    {
                      'fallback': 'Required plain-text summary of the attachment.',
                      'color': '#a8a6a8',
                      "author_name": `${docs[0].name}`,
                      "author_icon":`${docs[0].avatar}`
                    },{
                      "type": "divider"
                    }]
                  for(let item of reports){
                    if(item.question===BotMessages[1]){
                      blocks.push({
                        'fallback': 'Required plain-text summary of the attachment.',
                        'color': '#000feb',
                        "fields": [
                          {
                            "title": '*Yesterdays Progress*',
                            "value": item.text,
                            "short": false
                          }
                        ]
                      })
                    }
                    if(item.question===BotMessages[2]){
                      blocks.push({
                        'fallback': 'Required plain-text summary of the attachment.',
                        'color': '#36a64f',
                        "fields": [
                          {
                            "title": '*Plans for today*',
                            "value": item.text,
                            "short": false
                          }
                        ]
                      })
                    }
                    if(item.question===BotMessages[3]&& item.text!=='no'){
                      blocks.push({
                        'fallback': 'Required plain-text summary of the attachment.',
                        'color': '#eb0008',
                        "fields": [
                          {
                            "title": '*Any Blockers*',
                            "value": item.text,
                            "short": false
                          }
                        ]
                      })
                    }
                  }
                  await web.chat.postMessage({
                    channel: '#daily',
                    text:text,
                    attachments: blocks,
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
        }
        else if (!req.body.event.bot_id) {
          axios.get(`https://slack.com/api/users.info?token=${config.token}&user=${req.body.event.user}`).then(userInfo=>{
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              slackId: req.body.event.user,
              channelId: req.body.event.channel,
              name:userInfo.data.user.profile.real_name_normalized,
              avatar:userInfo.data.user.profile.image_original,
              isActive: true
            })
            user.save().then(async result => {
              await web.chat.postMessage({
                channel: req.body.event.channel,
                text: BotMessages[1],
              })
            }).catch(err => {
              console.log(err)
            })
          })

        }
      })

    })
  }
})

module.exports = router
