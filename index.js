const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const slackRouter = require("./slack");
const http = require('http');


const server = http.createServer(app);

server.listen(port);


app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

(async () => {
  console.log(`Listening for events on ${port}`);
})();

app.use("/api", slackRouter);


(async () => {

  try {
    // Use the `chat.postMessage` method to send a message from this app
//    await web.chat.postMessage({
//      channel: '#daily',
//      text: `The current time is ${currentTime}`,
//    });
  } catch (error) {
    console.log(error);
  }

  console.log('Message posted!');
})();
