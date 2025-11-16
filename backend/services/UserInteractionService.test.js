// Import the functions we want to test
const {
  addBookmark,
  removeBookmark,
  getBookmarksByProfile,
} = require('./UserInteractionService');

// Import the models this service uses
const { UserInteraction, Article, Source, sequelize } = require('../config/db');
// We need Sequelize for the 'Op' operator (Op.not)
const { Sequelize } = require('sequelize');

// Mock all the models used by this service
jest.mock('../config/db', () => ({
  // We have to mock sequelize.Op because getBookmarksByProfile uses it
  sequelize: {
    Op: {
      not: Symbol('not'), // Mock for Op.not
    },
  },
  UserInteraction: {
    findOrCreate: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
  Article: {}, // Not called directly, but included by association
  Source: {},  // Not called directly, but included by association
}));

// Helper function to reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// --- Test Suite for UserInteractionService ---
describe('UserInteractionService', () => {

  // --- Tests for addBookmark ---
  describe('addBookmark', () => {
    it('should create a new interaction if one does not exist', async () => {
      // 1. Arrange
      const mockInteraction = {
        id: 'new-interaction-uuid',
        profile_id: 'prof-123',
        article_id: 'art-123',
        bookmark_timestamp: expect.any(Date),
        note: 'Test Note',
      };
      // Mock findOrCreate to return [instance, created]
      UserInteraction.findOrCreate.mockResolvedValue([mockInteraction, true]);

      // 2. Act
      const interaction = await addBookmark('prof-123', 'art-123', 'Test Note');

      // 3. Assert
      expect(UserInteraction.findOrCreate).toHaveBeenCalledWith({
        where: { profile_id: 'prof-123', article_id: 'art-123' },
        defaults: expect.objectContaining({
          note: 'Test Note',
        }),
      });
      expect(interaction).toBe(mockInteraction);
    });

    it('should update an existing interaction if one is found', async () => {
      // 1. Arrange
      const mockInteraction = {
        id: 'existing-uuid',
        profile_id: 'prof-123',
        article_id: 'art-123',
        bookmark_timestamp: null,
        note: null,
        save: jest.fn(), // We must mock the 'save' function
      };
      // Mock findOrCreate to return [instance, created=false]
      UserInteraction.findOrCreate.mockResolvedValue([mockInteraction, false]);
      mockInteraction.save.mockResolvedValue(true); // Mock the save call

      // 2. Act
      const interaction = await addBookmark('prof-123', 'art-123', 'Updated Note');

      // 3. Assert
      expect(UserInteraction.findOrCreate).toHaveBeenCalled();
      expect(mockInteraction.save).toHaveBeenCalled(); // Check that save was called
      expect(mockInteraction.note).toBe('Updated Note'); // Check that note was updated
      expect(mockInteraction.bookmark_timestamp).not.toBeNull(); // Check that timestamp was set
      expect(interaction).toBe(mockInteraction);
    });

    it('should handle errors during addBookmark', async () => {
      UserInteraction.findOrCreate.mockRejectedValue(new Error('DB Error'));
      await expect(addBookmark('p', 'a')).rejects.toThrow('Could not add bookmark.');
    });
  });

  // --- Tests for removeBookmark ---
  describe('removeBookmark', () => {
    it('should nullify bookmark fields on an existing interaction', async () => {
      // 1. Arrange
      const mockInteraction = {
        id: 'existing-uuid',
        bookmark_timestamp: new Date(),
        note: 'Some Note',
        save: jest.fn(),
      };
      UserInteraction.findOne.mockResolvedValue(mockInteraction);
      mockInteraction.save.mockResolvedValue(true);

      // 2. Act
      await removeBookmark('prof-123', 'art-123');

      // 3. Assert
      expect(UserInteraction.findOne).toHaveBeenCalledWith({
        where: { profile_id: 'prof-123', article_id: 'art-123' },
      });
      expect(mockInteraction.save).toHaveBeenCalled();
      expect(mockInteraction.bookmark_timestamp).toBeNull(); // Verify field was set to null
      expect(mockInteraction.note).toBeNull(); // Verify field was set to null
    });

    it('should return null if no interaction is found', async () => {
      UserInteraction.findOne.mockResolvedValue(null);
      const result = await removeBookmark('p', 'a');
      expect(result).toBeNull();
      expect(UserInteraction.findOne).toHaveBeenCalled();
    });

    it('should handle errors during removeBookmark', async () => {
      UserInteraction.findOne.mockRejectedValue(new Error('DB Error'));
      await expect(removeBookmark('p', 'a')).rejects.toThrow('Could not remove bookmark.');
    });
  });

  // --- Tests for getBookmarksByProfile ---
  describe('getBookmarksByProfile', () => {
    it('should return all bookmarked items for a profile', async () => {
      // 1. Arrange
      const mockBookmarks = [{ id: 'b1' }, { id: 'b2' }];
      UserInteraction.findAll.mockResolvedValue(mockBookmarks);

      // 2. Act
      const bookmarks = await getBookmarksByProfile('prof-123');

      // 3. Assert
      expect(UserInteraction.findAll).toHaveBeenCalledWith({
        where: {
          profile_id: 'prof-123',
          bookmark_timestamp: {
            [Symbol('not')]: null, // We use the Symbol for Op.not
          },
        },
        include: expect.any(Array),
        order: [['bookmark_timestamp', 'DESC']],
      });
      expect(bookmarks).toBe(mockBookmarks);
    });

    it('should handle errors during getBookmarksByProfile', async () => {
      UserInteraction.findAll.mockRejectedValue(new Error('DB Error'));
      await expect(getBookmarksByProfile('p')).rejects.toThrow('Could not retrieve bookmarks.');
    });
  });

});