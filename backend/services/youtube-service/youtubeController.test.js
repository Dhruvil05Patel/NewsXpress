// Import the controller function we want to test
const { fetchLiveStreams } = require('./youtubeController');

// Import the service we need to mock
const { getLiveStreams } = require('./youtubeService');

// Mock the youtubeService
jest.mock('./youtubeService', () => ({
  getLiveStreams: jest.fn(),
}));

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// --- Test Suite for youtubeController ---
describe('youtubeController', () => {

  // --- Tests for fetchLiveStreams ---
  describe('fetchLiveStreams', () => {

    // Mock the Express req (request) and res (response) objects
    let req;
    let res;

    beforeEach(() => {
      // Create a fresh req object for each test
      req = {
        query: {
          language: 'en-US', // Default test case
        },
      };
      
      // Create a fresh res object with mock functions
      res = {
        status: jest.fn().mockReturnThis(), // .status() returns 'this' (the res object)
        json: jest.fn(),                    // .json() is the final call
      };
    });

    it('should fetch streams and return 200 on success', async () => {
      // 1. Arrange
      const mockStreams = [{ id: 'video1' }, { id: 'video2' }];
      getLiveStreams.mockResolvedValue(mockStreams);

      // 2. Act
      await fetchLiveStreams(req, res);

      // 3. Assert
      // Check that the service was called with the correct language
      expect(getLiveStreams).toHaveBeenCalledWith(20, 'en-US');
      // Check that the response was a 200
      expect(res.status).toHaveBeenCalledWith(200);
      // Check that the response sent the correct data
      expect(res.json).toHaveBeenCalledWith(mockStreams);
    });

    it('should return 500 if the service throws an error', async () => {
      // 1. Arrange
      const mockError = new Error('API Failure');
      getLiveStreams.mockRejectedValue(mockError);

      // 2. Act
      await fetchLiveStreams(req, res);

      // 3. Assert
      // Check that the service was called
      expect(getLiveStreams).toHaveBeenCalled();
      // Check that the response was a 500
      expect(res.status).toHaveBeenCalledWith(500);
      // Check that the response sent the correct error message
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch live streams' });
    });

    it('should use null for language if not provided', async () => {
      // 1. Arrange
      req.query.language = undefined; // No language provided
      getLiveStreams.mockResolvedValue([]); // Just return empty for this test

      // 2. Act
      await fetchLiveStreams(req, res);

      // 3. Assert
      // Check that the service was called with null for language
      expect(getLiveStreams).toHaveBeenCalledWith(20, null);
      expect(res.status).toHaveBeenCalledWith(200);
    });

  });
});