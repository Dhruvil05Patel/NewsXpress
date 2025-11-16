const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const youtubeClient = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3',
  params: {
    key: process.env.YOUTUBE_API_KEY,
  },
});

module.exports = { youtubeClient };
