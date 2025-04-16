const express = require('express');
const twilio = require('twilio');
const axios = require('axios');
const app = express();

// Your Assistable API key
const ASSISTABLE_API_KEY = 'bus|1744707446048x686040107233094700|1744812257026x217402437667029160';
const ASSISTABLE_API_URL = 'https://api.assistable.ai/v2'; // Updated to v2

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Inbound webhook handler
app.post('/voice', async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  
  try {
    // Log the incoming call details
    console.log('Incoming call from:', req.body.From);
    console.log('To:', req.body.To);
    console.log('Using API URL:', ASSISTABLE_API_URL);
    
    // Forward the call details to Assistable
    const assistableResponse = await axios.post(`${ASSISTABLE_API_URL}/calls`, {
      from: req.body.From,
      to: req.body.To,
      callSid: req.body.CallSid,
      direction: 'inbound'
    }, {
      headers: {
        'Authorization': `Bearer ${ASSISTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Connect the call to Assistable's voice service
    twiml.connect().stream({
      url: `${ASSISTABLE_API_URL}/stream?key=${ASSISTABLE_API_KEY}`,
    });
    
  } catch (error) {
    console.error('Error connecting to Assistable:', error);
    twiml.say('Sorry, we encountered an error connecting to the voice assistant.');
  }
  
  res.type('text/xml');
  res.send(twiml.toString());
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Twilio-Assistable webhook is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
