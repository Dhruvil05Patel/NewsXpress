// FetchingNews.test.js (inside backend/__tests__/)

// FIX: Use '../' to go up one level to find the file in the root folder
const { fetchNews, fetchNewsBySerpAPI } = require('../FetchingNews');

// Mock 'node-fetch'
jest.mock('node-fetch', () => ({
  default: jest.fn(),
}));

const fetch = require('node-fetch').default;

describe('FetchingNews Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SERPAPI_API_KEY = 'test-key';
  });

  // --- 1. fetchNewsBySerpAPI TESTS ---

  describe('fetchNewsBySerpAPI', () => {
    
    it('fetches and maps news successfully', async () => {
      const mockResponseData = {
        news_results: [
          {
            title: 'Test Title',
            link: 'http://test.com',
            source: { name: 'Test Source' },
            date: '2h ago',
            snippet: 'Snippet',
            thumbnail: 'img.jpg',
            position: 1
          }
        ]
      };

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponseData),
      });

      const result = await fetchNewsBySerpAPI('query', 5);

      // Check correct URL construction
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('https://serpapi.com/search.json'));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('q=query'));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('num=5'));
      
      // Check mapping
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Title');
    });

    it('handles API Error response', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ error: 'API Limit' }),
      });
      const result = await fetchNewsBySerpAPI('query');
      expect(result).toEqual([]);
    });

    it('handles Network Errors', async () => {
      fetch.mockRejectedValue(new Error('Network Down'));
      const result = await fetchNewsBySerpAPI('query');
      expect(result).toEqual([]);
    });
  });

  // --- 2. fetchNews TESTS ---

  describe('fetchNews', () => {
    it('constructs correct query for "all"', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ news_results: [] }),
      });

      await fetchNews('all', 10);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('q=India+latest+news'));
    });

    it('constructs correct query for specific category', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ news_results: [] }),
      });

      await fetchNews('Sports', 10);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('q=India+Sports+news'));
    });
  });
});