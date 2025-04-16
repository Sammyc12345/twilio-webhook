const express = require('express');
const twilio = require('twilio');
const axios = require('axios');
const app = express();

// Your Assistable API key
const ASSISTABLE_API_KEY = 'bus|1744707446048x686040107233094700|1744812257026x217402437667029160';

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Inbound webhook handler
app.post('/voice', async (req, res) => {
  console.log('Received call:', req.body);
  
  const twiml = new twilio.twiml.VoiceResponse();
  
  try {
    // For SIP Trunk integration, we need to connect the call to Assistable's SIP endpoint
    twiml.dial().sip('sip:importingnumbersintosystem.pstn.twilio.com');
    
    // Log the API key for debugging (make sure this is working)
    console.log('Using Assistable API Key:', ASSISTABLE_API_KEY);
    
    // Optional: Notify Assistable about the incoming call via their API
    try {
      await axios.post('https://api.assistable.ai/v2/calls', {
        from: req.body.From,
        to: req.body.To,
        callSid: req.body.CallSid,
        apiKey: ASSISTABLE_API_KEY
      }, {
        headers: {
          'Authorization': `Bearer ${ASSISTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (apiError) {
      // Continue even if API notification fails
      console.error('API notification error:', apiError.message);
    }
  } catch (error) {
    console.error('Error in webhook:', error);
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
