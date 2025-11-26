const {
  getProfileById,
  updateProfile,
  findOrCreateProfileByAuthId,
  createProfile,
  isUsernameTaken
} = require('./ProfileService');

const { Profile } = require('../config/db');
const crypto = require('crypto');

// --- MOCKS ---
jest.mock('../config/db', () => ({
  Profile: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

// Helper to reset mocks
beforeEach(() => {
  jest.clearAllMocks();
});

describe('ProfileService', () => {

  // --- 1. isUsernameTaken TESTS ---
  describe('isUsernameTaken', () => {
    it('returns FALSE if username is empty', async () => {
      const result = await isUsernameTaken(null);
      expect(result).toBe(false);
    });

    it('returns TRUE if username exists', async () => {
      Profile.findOne.mockResolvedValue({ id: 'other-user' });
      const result = await isUsernameTaken('taken_user');
      expect(Profile.findOne).toHaveBeenCalledWith({ where: { username: 'taken_user' } });
      expect(result).toBe(true);
    });

    it('returns FALSE if username does not exist', async () => {
      Profile.findOne.mockResolvedValue(null);
      const result = await isUsernameTaken('new_user');
      expect(result).toBe(false);
    });

    it('returns FALSE if username belongs to the same user (excludeProfileId)', async () => {
      Profile.findOne.mockResolvedValue({ id: 'my-id' });
      const result = await isUsernameTaken('my_user', 'my-id');
      expect(result).toBe(false);
    });
  });

  // --- 2. getProfileById TESTS ---
  describe('getProfileById', () => {
    it('returns profile on success', async () => {
      const mockProfile = { id: '123' };
      Profile.findByPk.mockResolvedValue(mockProfile);
      const result = await getProfileById('123');
      expect(result).toBe(mockProfile);
    });

    it('throws error on failure', async () => {
      Profile.findByPk.mockRejectedValue(new Error('DB Error'));
      await expect(getProfileById('123')).rejects.toThrow('Could not retrieve profile');
    });
  });

  // --- 3. updateProfile TESTS (Complex Logic) ---
  describe('updateProfile', () => {
    const mockProfile = {
      id: 'p1',
      full_name: 'Old Name',
      username: 'olduser',
      categories: [],
      fcm_token: null,
      save: jest.fn(),
    };

    beforeEach(() => {
      Profile.findByPk.mockResolvedValue(mockProfile);
      Profile.findOne.mockResolvedValue(null); // Default: username not taken
    });

    it('throws error if profile not found', async () => {
      Profile.findByPk.mockResolvedValue(null);
      await expect(updateProfile('p1', {})).rejects.toThrow('Profile not found');
    });

    it('updates basic fields (Name, Avatar)', async () => {
      await updateProfile('p1', { full_name: 'New Name', avatar_url: 'pic.jpg' });
      
      expect(mockProfile.full_name).toBe('New Name');
      expect(mockProfile.avatar_url).toBe('pic.jpg');
      expect(mockProfile.save).toHaveBeenCalled();
    });

    it('updates Username if available', async () => {
      await updateProfile('p1', { username: 'NewUser' });
      
      expect(mockProfile.username).toBe('newuser'); // Lowercase check
      expect(mockProfile.save).toHaveBeenCalled();
    });

    it('throws error if Username is taken', async () => {
      // Mock that 'newuser' is taken by someone else
      Profile.findOne.mockResolvedValue({ id: 'other-p2' });
      
      await expect(updateProfile('p1', { username: 'NewUser' }))
        .rejects.toThrow('Username is already taken');
      
      expect(mockProfile.save).not.toHaveBeenCalled();
    });

    it('updates Categories (from String)', async () => {
      await updateProfile('p1', { categories: 'Tech, Sports, ' });
      
      expect(mockProfile.categories).toEqual(['tech', 'sports']); // Trimmed & Lowercase
    });

    it('updates Categories (from Array)', async () => {
      await updateProfile('p1', { categories: ['Tech', 'Sports'] });
      
      expect(mockProfile.categories).toEqual(['tech', 'sports']);
    });

    it('updates FCM Token', async () => {
      await updateProfile('p1', { fcm_token: 'token-123' });
      
      expect(mockProfile.fcm_token).toBe('token-123');
    });

    it('updates Preferences (Actor, Place, Topic)', async () => {
      await updateProfile('p1', { 
        actor: ['Tom'], 
        place: 'NY', 
        topic: 'News' 
      });
      
      expect(mockProfile.actor).toEqual(['Tom']);
      expect(mockProfile.place).toBe('NY');
      expect(mockProfile.topic).toBe('News');
    });
    
    it('handles DB Error during save', async () => {
        mockProfile.save.mockRejectedValue(new Error('Save failed'));
        await expect(updateProfile('p1', { full_name: 'Test' }))
            .rejects.toThrow('Could not update profile');
    });
  });

  // --- 4. findOrCreateProfileByAuthId TESTS ---
  describe('findOrCreateProfileByAuthId', () => {
    it('throws error if authId missing', async () => {
      await expect(findOrCreateProfileByAuthId(null)).rejects.toThrow('authId is required');
    });

    it('returns existing profile if found', async () => {
      const existing = { id: 'found-id', auth_id: 'firebase-123' };
      Profile.findByPk.mockResolvedValue(existing);

      const result = await findOrCreateProfileByAuthId('firebase-123');
      
      expect(Profile.create).not.toHaveBeenCalled();
      expect(result).toBe(existing);
    });

    it('creates NEW profile if not found', async () => {
      Profile.findByPk.mockResolvedValue(null);
      const newProfile = { id: 'new-id' };
      Profile.create.mockResolvedValue(newProfile);

      const result = await findOrCreateProfileByAuthId('firebase-123', { 
        full_name: 'User', 
        username: 'user1' 
      });

      expect(Profile.create).toHaveBeenCalledWith(expect.objectContaining({
        full_name: 'User',
        username: 'user1'
      }));
      expect(result).toBe(newProfile);
    });

    it('generates NEW username if requested one is taken', async () => {
      Profile.findByPk.mockResolvedValue(null); // Profile doesn't exist
      
      // Mock username check: First time taken, then available (implicitly handled by loop logic or just once in your code)
      // Your code handles it once: checks isUsernameTaken. If true -> appends suffix.
      
      // 1. Profile not found by ID
      // 2. Check username 'takenuser' -> Returns found profile
      Profile.findOne.mockResolvedValue({ id: 'other' }); 

      // 3. Create should be called with modified username
      const newProfile = { id: 'new' };
      Profile.create.mockResolvedValue(newProfile);

      await findOrCreateProfileByAuthId('firebase-123', { username: 'takenuser' });

      expect(Profile.create).toHaveBeenCalledWith(expect.objectContaining({
        // Expect username to contain 'takenuser' AND some digits
        username: expect.stringMatching(/^takenuser\d{4}$/) 
      }));
    });
    
    it('handles Errors gracefully', async () => {
        Profile.findByPk.mockRejectedValue(new Error('DB Error'));
        await expect(findOrCreateProfileByAuthId('uid')).rejects.toThrow('Could not create or retrieve profile');
    });
  });

  // --- 5. createProfile TESTS ---
  describe('createProfile', () => {
    it('creates a profile with generated UUID', async () => {
      const mockCreated = { id: 'generated-id' };
      Profile.create.mockResolvedValue(mockCreated);

      const result = await createProfile({ fullName: 'Test', username: 'test' });

      expect(Profile.create).toHaveBeenCalledWith(expect.objectContaining({
        id: expect.any(String), // Checks that a UUID was generated
        full_name: 'Test',
        username: 'test'
      }));
      expect(result).toBe(mockCreated);
    });
    
    it('handles Errors', async () => {
        Profile.create.mockRejectedValue(new Error('DB Fail'));
        await expect(createProfile({})).rejects.toThrow('Could not create profile');
    });
  });

});