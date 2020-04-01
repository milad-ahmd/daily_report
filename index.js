const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const slackRouter = require('./slack')
const http = require('http')
const mongoose = require('mongoose')

const server = http.createServer(app)

server.listen(port)

mongoose.connect(
  'mongodb://milad:74626731@localhost:27017/daily_bot?authSource=admin'
)

mongoose.Promise = global.Promise
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '50mb' }));

(async () => {
  console.log(`Listening for events on ${port}`)
})()

app.use('/api', slackRouter);
