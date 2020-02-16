const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');

const slackSigningSecret = 'bb615790232e67387c61160aa98fd760';
const port = process.env.PORT || 3000;

// Initialize the adapter to trigger listeners with envelope data and headers
const slackEvents = createEventAdapter(slackSigningSecret, {
  includeBody: true,
  includeHeaders: true,
});

// Listeners now receive 3 arguments
slackEvents.on('message', (event, body, headers) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
  console.log(`The event ID is ${body.event_id} and time is ${body.event_time}`);
  if (headers['X-Slack-Retry-Num'] !== undefined) {
    console.log(`The delivery of this event was retried ${headers['X-Slack-Retry-Num']} times because ${headers['X-Slack-Retry-Reason']}`);
  }
});

(async () => {
  const server = await slackEvents.start(port);
  console.log(`Listening for events on ${server.address().port}`);
})();


//
//// Create a new instance of the WebClient class with the token read from your environment variable
//const web = new WebClient('xoxb-721157103719-944601703649-0cFBQvGv43dLYhxpqNkG5Loh');
//// The current date
//const currentTime = new Date().toTimeString();
//
//(async () => {
//
//  try {
//    // Use the `chat.postMessage` method to send a message from this app
//    await web.chat.postMessage({
//      channel: '#daily',
//      text: `The current time is ${currentTime}`,
//    });
//  } catch (error) {
//    console.log(error);
//  }
//
//  console.log('Message posted!');
//})();
