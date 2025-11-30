// Import the functions we want to test
const {
  trackInteraction,
  addBookmark,
  removeBookmark,
  getBookmarksByProfile,
  getUserTopCategories,
  getRecommendationsByCategory,
} = require('./UserInteractionService');

// Import the models this service uses
const { UserInteraction, Article, Profile } = require('../config/db');

// Mock the DB configuration and models
jest.mock('../config/db', () => ({
  // Mock sequelize operators
  sequelize: {
    Op: {
      not: Symbol('not'),
      in: Symbol('in'),
    },
  },
  // Mock Models
  UserInteraction: {
    findOrCreate: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
  },
  Article: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
  Profile: {
    findByPk: jest.fn(),
  },
}));

// Helper to reset mocks
beforeEach(() => {
  jest.clearAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {}); // Hide expected errors
  jest.spyOn(console, 'log').mockImplementation(() => {});   // Hide logs
});

describe('UserInteractionService', () => {

  // ======================================================
  // 1. trackInteraction (New Logic)
  // ======================================================
  describe('trackInteraction', () => {
    const profileId = 'p1';
    const articleId = 'a1';

    it('should throw error if Profile does not exist', async () => {
      Profile.findByPk.mockResolvedValue(null);
      await expect(trackInteraction(profileId, articleId, 10))
        .rejects.toThrow('NOT_FOUND: Profile');
    });

    it('should throw error if Article does not exist', async () => {
      Profile.findByPk.mockResolvedValue({ id: profileId });
      Article.findByPk.mockResolvedValue(null);
      await expect(trackInteraction(profileId, articleId, 10))
        .rejects.toThrow('NOT_FOUND: Article');
    });

    it('should CREATE a new interaction if none exists', async () => {
      Profile.findByPk.mockResolvedValue({ id: profileId });
      Article.findByPk.mockResolvedValue({ id: articleId });
      UserInteraction.findOne.mockResolvedValue(null); // No existing interaction
      
      const mockCreated = { id: 'i1', note: '' };
      UserInteraction.create.mockResolvedValue(mockCreated);

      await trackInteraction(profileId, articleId, 30.5, 'Tech');

      expect(UserInteraction.create).toHaveBeenCalledWith(expect.objectContaining({
        profile_id: profileId,
        article_id: articleId,
        // Check if note contains correct JSON string
        note: expect.stringContaining('"time_spent_seconds":31'),
        note: expect.stringContaining('"visits":1'),
        note: expect.stringContaining('"category":"Tech"'),
      }));
    });

    it('should UPDATE an existing interaction (accumulate time)', async () => {
      Profile.findByPk.mockResolvedValue({ id: profileId });
      Article.findByPk.mockResolvedValue({ id: articleId });

      // Existing note with 10 seconds
      const existingNote = JSON.stringify({ time_spent_seconds: 10, visits: 1, category: 'Tech' });
      const mockInteraction = { 
        id: 'i1', 
        note: existingNote, 
        save: jest.fn().mockResolvedValue(true) 
      };
      UserInteraction.findOne.mockResolvedValue(mockInteraction);

      // Add 20 seconds
      await trackInteraction(profileId, articleId, 20, 'Tech');

      expect(mockInteraction.save).toHaveBeenCalled();
      // 10 (existing) + 20 (new) = 30
      expect(mockInteraction.note).toContain('"time_spent_seconds":30');
      // 1 (existing) + 1 (new) = 2
      expect(mockInteraction.note).toContain('"visits":2');
    });

    it('should handle corrupted JSON in existing note gracefully', async () => {
      Profile.findByPk.mockResolvedValue({ id: profileId });
      Article.findByPk.mockResolvedValue({ id: articleId });

      const mockInteraction = { 
        id: 'i1', 
        note: '{ bad_json: ', // Corrupted
        save: jest.fn() 
      };
      UserInteraction.findOne.mockResolvedValue(mockInteraction);

      await trackInteraction(profileId, articleId, 10);

      // Should treat existing data as empty and just set the new 10s
      expect(mockInteraction.note).toContain('"time_spent_seconds":10');
      expect(mockInteraction.save).toHaveBeenCalled();
    });
  });

  // ======================================================
  // 2. addBookmark & removeBookmark (Previous Logic)
  // ======================================================
  describe('addBookmark', () => {
    it('creates new bookmark', async () => {
      UserInteraction.findOrCreate.mockResolvedValue([{ id: 'i1' }, true]);
      await addBookmark('p1', 'a1', 'note');
      expect(UserInteraction.findOrCreate).toHaveBeenCalled();
    });

    it('updates existing bookmark', async () => {
      const mockInt = { save: jest.fn() };
      UserInteraction.findOrCreate.mockResolvedValue([mockInt, false]);
      await addBookmark('p1', 'a1', 'note');
      expect(mockInt.save).toHaveBeenCalled();
      expect(mockInt.note).toBe('note');
    });

    it('handles errors', async () => {
      UserInteraction.findOrCreate.mockRejectedValue(new Error('DB Error'));
      await expect(addBookmark('p1', 'a1')).rejects.toThrow('Could not add bookmark');
    });
  });

  describe('removeBookmark', () => {
    it('removes bookmark if found', async () => {
      const mockInt = { save: jest.fn() };
      UserInteraction.findOne.mockResolvedValue(mockInt);
      await removeBookmark('p1', 'a1');
      expect(mockInt.bookmark_timestamp).toBeNull();
      expect(mockInt.save).toHaveBeenCalled();
    });

    it('returns null if not found', async () => {
      UserInteraction.findOne.mockResolvedValue(null);
      const res = await removeBookmark('p1', 'a1');
      expect(res).toBeNull();
    });

    it('handles errors', async () => {
      UserInteraction.findOne.mockRejectedValue(new Error('DB Error'));
      await expect(removeBookmark('p1', 'a1')).rejects.toThrow('Could not remove bookmark');
    });
  });

  describe('getBookmarksByProfile', () => {
    it('fetches bookmarks', async () => {
      UserInteraction.findAll.mockResolvedValue([]);
      await getBookmarksByProfile('p1');
      expect(UserInteraction.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { profile_id: 'p1' },
        include: expect.any(Array)
      }));
    });

    it('handles errors', async () => {
      UserInteraction.findAll.mockRejectedValue(new Error('DB Error'));
      await expect(getBookmarksByProfile('p1')).rejects.toThrow('Could not retrieve bookmarks');
    });
  });
// ======================================================
  // 3. getUserTopCategories (Analytics Logic)
  // ======================================================
  describe('getUserTopCategories', () => {
    it('correctly aggregates time per category', async () => {
      // Mock 3 interactions: 2 Tech, 1 Sports
      const interactions = [
        { note: JSON.stringify({ category: 'Tech', time_spent_seconds: 10 }) },
        { note: JSON.stringify({ category: 'Tech', time_spent_seconds: 20 }) },
        { note: JSON.stringify({ category: 'Sports', time_spent_seconds: 100 }) },
        { note: null }, // Should be ignored
      ];
      UserInteraction.findAll.mockResolvedValue(interactions);

      const result = await getUserTopCategories('p1');

      // Sports should be first (100s), Tech second (30s)
      expect(result[0].category).toBe('Sports');
      expect(result[0].total_time_seconds).toBe(100);
      
      expect(result[1].category).toBe('Tech');
      expect(result[1].total_time_seconds).toBe(30); // 10 + 20
    });

    // --- NEW TEST CASE FOR 100% COVERAGE ---
    it('handles corrupted/invalid JSON in notes gracefully', async () => {
      const interactions = [
        { note: 'INVALID_JSON_STRING' }, // This causes JSON.parse to throw
        { note: JSON.stringify({ category: 'Tech', time_spent_seconds: 10 }) }
      ];
      UserInteraction.findAll.mockResolvedValue(interactions);

      const result = await getUserTopCategories('p1');

      // It should skip the bad row and process the good one
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('Tech');
    });
    // ---------------------------------------

    it('handles errors', async () => {
      UserInteraction.findAll.mockRejectedValue(new Error('DB Error'));
      await expect(getUserTopCategories('p1')).rejects.toThrow('Could not retrieve user categories');
    });
  });

  // ======================================================
  // 4. getRecommendationsByCategory (Recommendation Logic)
  // ======================================================
  describe('getRecommendationsByCategory', () => {
    it('returns empty array if no user history found', async () => {
      // Mock getUserTopCategories internal call by mocking findAll for interactions
      UserInteraction.findAll.mockResolvedValue([]); // No history

      const recs = await getRecommendationsByCategory('p1');
      expect(recs).toEqual([]);
    });

    it('fetches articles based on top categories and excludes read ones', async () => {
      // 1. Mock History (Top Category: Tech)
      UserInteraction.findAll
        // First call: getUserTopCategories (History)
        .mockResolvedValueOnce([{ note: JSON.stringify({ category: 'Tech', time_spent_seconds: 100 }) }])
        // Second call: getRecommendationsByCategory (Articles already read)
        .mockResolvedValueOnce([{ article_id: 'read-1' }]);

      // 2. Mock Articles Found (One read, one unread)
      Article.findAll.mockResolvedValue([
        { id: 'read-1', title: 'Read Article', topic: 'Tech' },
        { id: 'unread-2', title: 'Unread Article', topic: 'Tech' },
      ]);

      const recs = await getRecommendationsByCategory('p1');

      // Should filter out 'read-1' and return only 'unread-2'
      expect(recs).toHaveLength(1);
      expect(recs[0].id).toBe('unread-2');
      expect(Article.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { topic: expect.anything() }
      }));
    });

    it('handles errors', async () => {
      // Fail on the first DB call
      UserInteraction.findAll.mockRejectedValue(new Error('DB Error'));
      await expect(getRecommendationsByCategory('p1')).rejects.toThrow('Could not get category-based recommendations');
    });
  });

});