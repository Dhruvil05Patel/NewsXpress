// Import the functions we want to test
const {
  findOrCreateSource,
  saveArticle,
  saveArticles,
  getArticles,
  getArticlesByTopic,
  getArticlesByPlace,
  searchArticles,
} = require('./ArticleService');

// Import the models this service uses
const { Article, Source, sequelize } = require('../config/db');
// We need 'Op' for the search test
const { Op } = require('sequelize');

// Mock all the models used by this service
jest.mock('../config/db', () => ({
  // We have to mock sequelize.Op because searchArticles uses it
  sequelize: {
    Op: {
      iLike: Symbol('iLike'),
      or: Symbol('or'),
    },
  },
  Article: {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  },
  Source: {
    findOrCreate: jest.fn(),
  },
}));

// Helper function to reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// --- Test Suite for ArticleService ---
describe('ArticleService', () => {

  // --- Tests for findOrCreateSource ---
  describe('findOrCreateSource', () => {
    it('should find or create a source', async () => {
      // 1. Arrange
      const mockSource = { id: 'source-uuid', name: 'Test Source' };
      Source.findOrCreate.mockResolvedValue([mockSource, true]); // [instance, created]

      // 2. Act
      const sourceId = await findOrCreateSource('Test Source');

      // 3. Assert
      expect(Source.findOrCreate).toHaveBeenCalledWith({
        where: { name: 'Test Source' },
        defaults: { name: 'Test Source', is_active: true },
      });
      expect(sourceId).toBe('source-uuid');
    });

    it('should return null if sourceName is invalid', async () => {
      const sourceId = await findOrCreateSource(null);
      expect(sourceId).toBeNull();
      expect(Source.findOrCreate).not.toHaveBeenCalled();
    });

    it('should handle errors during findOrCreate', async () => {
      Source.findOrCreate.mockRejectedValue(new Error('DB Error'));
      const sourceId = await findOrCreateSource('Test Source');
      expect(sourceId).toBeNull();
    });
  });

  // --- Tests for saveArticle ---
  describe('saveArticle', () => {
    it('should save a new article', async () => {
      // 1. Arrange
      const articleData = { title: 'Test', original_url: 'test.com', source: 'Test Source' };
      const mockArticle = { id: 'article-uuid', ...articleData };

      Article.findOne.mockResolvedValue(null); // Article does not exist
      Source.findOrCreate.mockResolvedValue([{ id: 'source-uuid' }, true]); // Mock the source helper
      Article.create.mockResolvedValue(mockArticle);

      // 2. Act
      const article = await saveArticle(articleData);

      // 3. Assert
      expect(Article.findOne).toHaveBeenCalledWith({ where: { original_url: 'test.com' } });
      expect(Article.create).toHaveBeenCalled();
      expect(article).toBe(mockArticle);
    });

    it('should return an existing article if found', async () => {
      // 1. Arrange
      const articleData = { title: 'Test', original_url: 'test.com' };
      const mockArticle = { id: 'article-uuid', ...articleData };
      
      Article.findOne.mockResolvedValue(mockArticle); // Article *does* exist

      // 2. Act
      const article = await saveArticle(articleData);

      // 3. Assert
      expect(Article.findOne).toHaveBeenCalled();
      expect(Article.create).not.toHaveBeenCalled(); // Create should not be called
      expect(article).toBe(mockArticle);
    });

    it('should handle errors during saving', async () => {
      Article.findOne.mockRejectedValue(new Error('DB Error'));
      const article = await saveArticle({ title: 'Test', original_url: 'test.com' });
      expect(article).toBeNull();
    });
  });
  
  // --- Tests for saveArticles ---
  // This test covers the loop and summary logging
  describe('saveArticles', () => {
    it('should save multiple articles and return a summary', async () => {
      // 1. Arrange
      const articlesArray = [
        { title: 'Article 1', original_url: 'a1.com', source: 'S1' },
        { title: 'Article 2', original_url: 'a2.com', source: 'S2' },
      ];
      
      // Mock the saveArticle function
      Article.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null); // Both are new
      Source.findOrCreate.mockResolvedValue([{ id: 'uuid' }, true]);
      Article.create.mockResolvedValueOnce({ title: 'Article 1' }).mockResolvedValueOnce({ title: 'Article 2' });

      // 2. Act
      const result = await saveArticles(articlesArray);

      // 3. Assert
      expect(result.saved.length).toBe(2);
      expect(result.errors.length).toBe(0);
      expect(result.count).toBe(2);
    });
  });

  // --- Tests for getArticles ---
  describe('getArticles', () => {
    it('should get articles with filters', async () => {
      // 1. Arrange
      const mockArticles = [{ title: 'Test' }];
      Article.findAll.mockResolvedValue(mockArticles);
      const filters = { topic: 'Tech', place: 'NY', language_code: 'en-IN', limit: 10 };

      // 2. Act
      const articles = await getArticles(filters);

      // 3. Assert
      expect(Article.findAll).toHaveBeenCalledWith({
        where: {
          topic: 'Tech',
          place: 'NY',
          language_code: 'en-IN',
        },
        include: expect.any(Array),
        order: [['published_at', 'DESC']],
        limit: 10,
      });
      expect(articles).toBe(mockArticles);
    });

    it('should handle errors during fetching', async () => {
      Article.findAll.mockRejectedValue(new Error('DB Error'));
      const articles = await getArticles();
      expect(articles).toEqual([]); // Should return an empty array on error
    });
  });

  // --- Tests for helper functions (getArticlesByTopic, etc.) ---
  describe('getArticlesByTopic', () => {
    it('should call getArticles with correct topic', async () => {
      Article.findAll.mockResolvedValue([]);
      await getArticlesByTopic('Sports', 20);
      expect(Article.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { topic: 'Sports' },
        limit: 20,
      }));
    });
  });

  describe('getArticlesByPlace', () => {
    it('should call getArticles with correct place', async () => {
      Article.findAll.mockResolvedValue([]);
      await getArticlesByPlace('London', 15);
      expect(Article.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { place: 'London' },
        limit: 15,
      }));
    });
  });
  
  // --- Tests for searchArticles ---
  describe('searchArticles', () => {
    it('should search articles by keyword', async () => {
      Article.findAll.mockResolvedValue([]);
      await searchArticles('crypto', 20);
      
      expect(Article.findAll).toHaveBeenCalledWith({
        where: {
          [Symbol('or')]: [ // We use the Symbol for Op.or
            { title: { [Symbol('iLike')]: '%crypto%' } },
            { summary: { [Symbol('iLike')]: '%crypto%' } },
          ],
        },
        include: expect.any(Array),
        order: [['published_at', 'DESC']],
        limit: 20,
      });
    });

    it('should handle errors during search', async () => {
      Article.findAll.mockRejectedValue(new Error('Search Error'));
      const articles = await searchArticles('test');
      expect(articles).toEqual([]);
    });
  });

});