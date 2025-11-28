const { getLiveStreams } = require("./youtubeService");  

const fetchLiveStreams = async (req, res) => {
  try {
    const language = req.query.language || null;
    const liveStreams = await getLiveStreams(20);
    res.status(200).json(liveStreams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch live streams' });
  }
}

module.exports = { fetchLiveStreams };