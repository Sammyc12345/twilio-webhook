const express = require('express');
const twilio = require('twilio');
const app = express();

app.use(express.urlencoded({ extended: false }));

app.post('/voice', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say('Hello, this is your AI assistant');
  
  res.type('text/xml');
  res.send(twiml.toString());
});

app.listen(process.env.PORT || 3000);
