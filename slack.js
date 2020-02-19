const express = require('express')
const router = express.Router()
const { WebClient } = require('@slack/web-api')
const config = require('./config')
const axios = require('axios')
const BotMessages = ['Hey! Are you ready to have our YapAiTek daily meeting now?(y/n)',
  'Nice, this is your update for YapAiTek.Let\'s begin! What did you work on yesterday?',
  'Ok. What are you going to work on today?',
  'Great. Do you have any blockers? If so, just tell me. Otherwise please say \'no\'.',
  'Well done! This is all, you can continue with your work ']
const web = new WebClient(config.token)

router.post('/message', function (req, res) {
  if (req.body.event.channel_type === 'im' && req.body.event.type === 'message') {
    axios.get(`https://slack.com/api/conversations.history?token=${config.token}&channel=${req.body.event.channel}&limit=10`).then(async messages => {
      let lastBotMessage = null
      for (let item of messages.data.messages) {
        if (item.user !== req.body.event.channel_type) {
          lastBotMessage = item.text
          break
        }
      }
      await web.chat.postMessage({
        channel:req.body.event.channel ,
        text: lastBotMessage?BotMessages[BotMessages.indexOf(lastBotMessage)+1]:BotMessages[0],
      })

    })
  }
})

module.exports = router
