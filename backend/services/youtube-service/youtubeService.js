 const youtubeClient = require("./youtubeClient").youtubeClient;

const getLiveStreams = async (maxResults = 20, language = 'hi-IN') => {
  try {
    const response = await youtubeClient.get('/search', {
      params: {
        q: 'news',
        part: 'snippet',
        type: 'video',
        eventType: 'live',
        videoEmbeddable: 'true',
        relevanceLanguage: language,
        order: 'viewCount', 
      },    
    });
    
    return response.data.items;
  } catch (error) {
    console.error('Error fetching live streams:', error);
    throw error;
  }
}

module.exports = { getLiveStreams };