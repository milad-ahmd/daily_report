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
  console.log(req.body);
  if (req.body.event.channel_type === 'im' && req.body.event.type === 'message') {
    axios.get(`https://slack.com/api/conversations.history?token=${config.token}&channel=${req.body.event.channel}&limit=10`).then(async messages => {
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
        }else{

            await web.chat.postMessage({
              channel:req.body.event.channel,
              text: lastBotMessage?BotMessages[BotMessages.indexOf(lastBotMessage)+1]:BotMessages[0],
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
        }
      }


    })
  }
})

module.exports = router
