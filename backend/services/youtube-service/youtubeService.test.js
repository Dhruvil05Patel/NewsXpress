// Import the function we want to test
const { getLiveStreams } = require('./youtubeService');

// Import the client we need to mock
const { youtubeClient } = require('./youtubeClient');

// Mock the youtubeClient
jest.mock('./youtubeClient', () => ({
  youtubeClient: {
    get: jest.fn(), // We only need to mock the 'get' function
  },
}));

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// --- Test Suite for youtubeService ---
describe('youtubeService', () => {

  // --- Tests for getLiveStreams ---
  describe('getLiveStreams', () => {

    it('should call the youtubeClient with correct parameters', async () => {
      // 1. Arrange
      // This is the fake response we want the client to return
      const mockResponse = { data: { items: [{ id: 'video1' }] } };
      youtubeClient.get.mockResolvedValue(mockResponse);

      // 2. Act
      await getLiveStreams(10, 'en-US');

      // 3. Assert
      // Check that the 'get' function was called with the correct path and params
      expect(youtubeClient.get).toHaveBeenCalledWith('/search', {
        params: {
          q: 'news',
          part: 'snippet',
          type: 'video',
          eventType: 'live',
          videoEmbeddable: 'true',
          relevanceLanguage: 'en-US', // Check if language param is used
          order: 'viewCount',
        },
      });
    });

    it('should return the items from the response on success', async () => {
      // 1. Arrange
      const mockResponse = { data: { items: [{ id: 'video1' }, { id: 'video2' }] } };
      youtubeClient.get.mockResolvedValue(mockResponse);

      // 2. Act
      const items = await getLiveStreams();

      // 3. Assert
      expect(items).toEqual([{ id: 'video1' }, { id: 'video2' }]);
    });

    it('should throw an error if the youtubeClient fails', async () => {
      // 1. Arrange
      const mockError = new Error('API Error');
      youtubeClient.get.mockRejectedValue(mockError);

      // 2. Act & 3. Assert
      // We check that the function throws the error
      await expect(getLiveStreams()).rejects.toThrow('API Error');
    });

  });
});