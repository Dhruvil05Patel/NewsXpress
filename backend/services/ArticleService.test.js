const {
  findOrCreateSource,
  saveArticle,
  saveArticles,
  getArticles,
  getArticlesByTopic,
  getArticlesByPlace,
  searchArticles
} = require('./ArticleService');

const { Article, Source } = require('../config/db');

// --- MOCKS ---

// 1. Mock the Database Models
jest.mock('../config/db', () => ({
  Article: {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  },
  Source: {
    findOrCreate: jest.fn(),
  },
}));

// 2. Mock 'sequelize' for searchArticles
jest.mock('sequelize', () => ({
  Op: {
    iLike: 'iLike', 
    or: 'or',
  }
}));

// 3. Spy on console to suppress logs
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('ArticleService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- 1. findOrCreateSource ---
  describe('findOrCreateSource', () => {
    it('returns null for invalid inputs', async () => {
      expect(await findOrCreateSource(null)).toBeNull();
      expect(await findOrCreateSource('Unknown Source')).toBeNull();
    });

    it('creates a new source if not found', async () => {
      Source.findOrCreate.mockResolvedValue([{ id: 's1' }, true]);
      const result = await findOrCreateSource('CNN');
      expect(result).toBe('s1');
    });

    it('returns existing source id', async () => {
      Source.findOrCreate.mockResolvedValue([{ id: 's2' }, false]);
      const result = await findOrCreateSource('BBC');
      expect(result).toBe('s2');
    });

    it('handles DB errors', async () => {
      Source.findOrCreate.mockRejectedValue(new Error('DB Fail'));
      const result = await findOrCreateSource('CNN');
      expect(result).toBeNull();
    });
  });

  // --- 2. saveArticle ---
  describe('saveArticle', () => {
    const mockData = { title: 'T', original_url: 'u' };

    it('returns existing article if URL exists', async () => {
      Article.findOne.mockResolvedValue({ id: 'a1' });
      const result = await saveArticle(mockData);
      expect(result).toEqual({ id: 'a1' });
    });

    it('creates new article', async () => {
      Article.findOne.mockResolvedValue(null);
      Source.findOrCreate.mockResolvedValue([{ id: 's1' }, true]);
      Article.create.mockResolvedValue({ id: 'new-1' });

      const result = await saveArticle(mockData);
      expect(result).toEqual({ id: 'new-1' });
    });

    it('throws error on DB failure', async () => {
      Article.findOne.mockRejectedValue(new Error('DB Fail'));
      await expect(saveArticle(mockData)).rejects.toThrow('DB Fail');
    });
  });

  // --- 3. saveArticles ---
  describe('saveArticles', () => {
    it('saves some articles and catches errors for others', async () => {
      const input = [
        { title: 'Good', original_url: 'g' },
        { title: 'Bad', original_url: 'b' }
      ];

      // Mock 1st call (Good): Success
      Article.findOne.mockResolvedValueOnce(null);
      Source.findOrCreate.mockResolvedValue([{ id: 's' }]);
      Article.create.mockResolvedValueOnce({ id: '1' });

      // Mock 2nd call (Bad): Fail (DB Error inside saveArticle)
      Article.findOne.mockRejectedValueOnce(new Error('Fail'));

      const result = await saveArticles(input);

      expect(result.saved).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].article).toBe('Bad');
    });
  });
  
  // --- 4. getArticles ---
  describe('getArticles', () => {
    it('fetches with all filters', async () => {
      Article.findAll.mockResolvedValue([]);
      await getArticles({ topic: 'T', place: 'P', language_code: 'en' });
      
      expect(Article.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { topic: 'T', place: 'P', language_code: 'en' }
      }));
    });

    it('handles empty filters', async () => {
      Article.findAll.mockResolvedValue([]);
      await getArticles();
      expect(Article.findAll).toHaveBeenCalled();
    });

    it('returns empty array on error', async () => {
      Article.findAll.mockRejectedValue(new Error('Fail'));
      const res = await getArticles();
      expect(res).toEqual([]);
    });
  });

  // --- 5. Helpers ---
  describe('Helpers', () => {
    it('getArticlesByTopic calls getArticles', async () => {
      Article.findAll.mockResolvedValue([]);
      await getArticlesByTopic('Tech');
      expect(Article.findAll).toHaveBeenCalled();
    });

    it('getArticlesByPlace calls getArticles', async () => {
      Article.findAll.mockResolvedValue([]);
      await getArticlesByPlace('NY');
      expect(Article.findAll).toHaveBeenCalled();
    });
  });

  // --- 6. searchArticles ---
  describe('searchArticles', () => {
    it('searches successfully', async () => {
      Article.findAll.mockResolvedValue([]);
      await searchArticles('crypto');
      expect(Article.findAll).toHaveBeenCalled();
    });

    it('returns empty array on error', async () => {
      Article.findAll.mockRejectedValue(new Error('Fail'));
      const res = await searchArticles('q');
      expect(res).toEqual([]);
    });
  });
});