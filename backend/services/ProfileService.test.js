// Import the functions we want to test
const {
  updateProfile,
  getProfileById,
  createProfile,
  findOrCreateProfileByAuthId,
} = require('./ProfileService');

// Import the Profile model (which we will be faking)
const { Profile } = require('../config/db');

// This line "mocks" (fakes) the Profile model for all tests.
// We are faking the functions our service calls: findByPk, create, and findOne.
jest.mock('../config/db', () => ({
  Profile: {
    findByPk: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(), // findOrCreateProfileByAuthId might use this
  },
}));

// This helper function resets the mocks before each test
beforeEach(() => {
  jest.clearAllMocks(); // Resets call counts for .toHaveBeenCalled()
});

// Test Suite for the entire ProfileService
describe('ProfileService', () => {
  
  // --- Tests for getProfileById ---
  describe('getProfileById', () => {
    it('should return the correct profile when found', async () => {
      // 1. Arrange
      const mockProfile = { id: 'real-id', full_name: 'Jane Doe' };
      Profile.findByPk.mockResolvedValue(mockProfile);

      // 2. Act
      const profile = await getProfileById('real-id');

      // 3. Assert
      expect(Profile.findByPk).toHaveBeenCalledWith('real-id');
      expect(profile).toBe(mockProfile);
    });

    it('should return null if profile is not found', async () => {
      // 1. Arrange
      Profile.findByPk.mockResolvedValue(null);

      // 2. Act
      const profile = await getProfileById('fake-id');

      // 3. Assert
      expect(profile).toBeNull();
    });

    it('should throw an error if the database fails', async () => {
      // 1. Arrange
      Profile.findByPk.mockRejectedValue(new Error('DB Error'));

      // 2. Act & 3. Assert
      await expect(getProfileById('real-id')).rejects.toThrow('Could not retrieve profile.');
    });
  });

  // --- Tests for createProfile ---
  describe('createProfile', () => {
    it('should create a new profile with the correct data', async () => {
      // 1. Arrange
      const inputData = { fullName: 'Test User', username: 'test_user', authId: 'test-auth-id' };
      const expectedOutput = { id: 'new-uuid', ...inputData };
      Profile.create.mockResolvedValue(expectedOutput);

      // 2. Act
      const profile = await createProfile(inputData);

      // 3. Assert
      expect(Profile.create).toHaveBeenCalledWith(expect.objectContaining({
        full_name: 'Test User',
      }));
      expect(profile).toBe(expectedOutput);
    });

    it('should throw an error if create fails', async () => {
      // 1. Arrange
      Profile.create.mockRejectedValue(new Error('DB Error'));

      // 2. Act & 3. Assert
      await expect(createProfile({})).rejects.toThrow('Could not create profile.');
    });
  });

  // --- Tests for updateProfile ---
  describe('updateProfile', () => {
    // We create a base mock profile for all update tests
    const mockProfile = {
      id: 'test-id',
      full_name: 'Test User',
      topic: null,
      place: null,
      actor: [],
      avatar_url: null,
      username: 'testuser',
      save: jest.fn(),
    };

    // Reset mocks before each 'updateProfile' test
    beforeEach(() => {
      Profile.findByPk.mockResolvedValue(mockProfile);
      mockProfile.save.mockResolvedValue(true); // Make save work
    });

    it('should correctly update all fields', async () => {
      // 1. Arrange
      const updateData = {
        full_name: 'Updated Name',
        username: 'newuser',
        avatar_url: 'new.png',
        topic: 'Technology',
        place: 'New York',
        actor: ['Tom Hanks'],
      };

      // 2. Act
      await updateProfile('test-id', updateData);

      // 3. Assert
      expect(Profile.findByPk).toHaveBeenCalledWith('test-id');
      expect(mockProfile.full_name).toBe('Updated Name');
      expect(mockProfile.username).toBe('newuser');
      expect(mockProfile.avatar_url).toBe('new.png');
      expect(mockProfile.topic).toBe('Technology');
      expect(mockProfile.place).toBe('New York');
      expect(mockProfile.actor).toEqual(['Tom Hanks']);
      expect(mockProfile.save).toHaveBeenCalled();
    });

    it('should throw an error if profile is not found', async () => {
      // 1. Arrange
      Profile.findByPk.mockResolvedValue(null);

      // 2. Act & 3. Assert
      await expect(updateProfile('fake-id', {})).rejects.toThrow('Profile not found.');
    });

    it('should throw an error if save fails', async () => {
      // 1. Arrange
      mockProfile.save.mockRejectedValue(new Error('Save Error'));

      // 2. Act & 3. Assert
      await expect(updateProfile('test-id', { topic: 'test' })).rejects.toThrow('Could not update profile.');
    });
  });

  // --- Tests for findOrCreateProfileByAuthId ---
  describe('findOrCreateProfileByAuthId', () => {
    
    it('should find and return an existing profile', async () => {
      // 1. Arrange
      const mockProfile = { id: 'uuid-from-firebase-uid', full_name: 'Existing User' };
      Profile.findByPk.mockResolvedValue(mockProfile);

      // 2. Act
      const profile = await findOrCreateProfileByAuthId('firebase-uid-123', {});

      // 3. Assert
      expect(Profile.findByPk).toHaveBeenCalled();
      expect(Profile.create).not.toHaveBeenCalled(); // Create should NOT be called
      expect(profile).toBe(mockProfile);
    });

    it('should create a new profile if one is not found', async () => {
      // 1. Arrange
      const newProfileData = { full_name: 'New User', avatar_url: 'pic.png' };
      const mockCreatedProfile = { id: 'uuid-from-firebase-uid', ...newProfileData };

      Profile.findByPk.mockResolvedValue(null); // Step 1: Find fails
      Profile.create.mockResolvedValue(mockCreatedProfile); // Step 2: Create succeeds

      // 2. Act
      const profile = await findOrCreateProfileByAuthId('firebase-uid-456', newProfileData);

      // 3. Assert
      expect(Profile.findByPk).toHaveBeenCalled(); // Find was called
      expect(Profile.create).toHaveBeenCalled(); // Create WAS called
      expect(profile).toBe(mockCreatedProfile);
    });

    it('should throw an error if authId is not provided', async () => {
      // 2. Act & 3. Assert
      await expect(findOrCreateProfileByAuthId(null, {})).rejects.toThrow('authId is required');
    });
  });

});