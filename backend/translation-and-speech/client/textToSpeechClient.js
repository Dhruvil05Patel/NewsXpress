const textToSpeech = require('@google-cloud/text-to-speech');
require('dotenv').config();

const filePath = process.env.GOOGLE_APPLICATION_CREDENTIALS

const ttsClient = new textToSpeech.TextToSpeechClient({
  // Option 1: Use environment variable GOOGLE_APPLICATION_CREDENTIALS
    keyFilename: filePath, 
});

module.exports = ttsClient