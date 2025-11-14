// Import the functions we want to test
const { updateProfile, getProfileById, createProfile } = require('./ProfileService');

// Import the Profile model (which we will be faking)
const { Profile } = require('../config/db');

// This line "mocks" (fakes) the Profile model.
// Jest will replace the real model with a fake one.
jest.mock('../config/db', () => ({
  Profile: {
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

// This is a "Test Suite" - a block of tests for one feature
describe('ProfileService: updateProfile', () => {

  // This is a "Test Case"
  it('should correctly update a profile with new topic and place', async () => {
    
    // 1. ARRANGE (Set up the fake data)
    
    // Create a fake profile object that "pretends" to be from the database
    const mockProfile = {
      id: 'test-profile-id',
      full_name: 'Test User',
      topic: null,
      place: null,
      actor: [],
      save: jest.fn(), // We must mock the 'save' function
    };

    // Tell our fake database (the mock) to return this fake profile
    // when the 'findByPk' function is called.
    Profile.findByPk.mockResolvedValue(mockProfile);

    // This is the new data we will send
    const updateData = {
      topic: 'Technology',
      place: 'New York'
    };

    // 2. ACT (Run the function we are testing)
    await updateProfile('test-profile-id', updateData);

    // 3. ASSERT (Check if the function did its job)
    
    // Check if the 'save' function was called
    expect(mockProfile.save).toHaveBeenCalled();

    // Check if the profile object was updated correctly *before* saving
    expect(mockProfile.topic).toBe('Technology');
    expect(mockProfile.place).toBe('New York');
  });

  describe('getProfileById', () => {
    it('should return the correct profile when found', async () => {
      // 1. Arrange: Create a fake profile to return
      const mockProfile = {
        id: 'real-profile-id',
        full_name: 'Jane Doe',
        topic: 'Sports',
      };
      
      // Tell the fake database to return this profile
      Profile.findByPk.mockResolvedValue(mockProfile);

      // 2. Act: Run the function
      const profile = await getProfileById('real-profile-id');

      // 3. Assert: Check the results
      expect(Profile.findByPk).toHaveBeenCalledWith('real-profile-id');
      expect(profile).toBe(mockProfile);
      expect(profile.topic).toBe('Sports');
    });

    it('should return null if profile is not found', async () => {
      // 1. Arrange: Tell the fake database to return nothing
      Profile.findByPk.mockResolvedValue(null);

      // 2. Act: Run the function
      const profile = await getProfileById('fake-id');

      // 3. Assert: Check the results
      expect(Profile.findByPk).toHaveBeenCalledWith('fake-id');
      expect(profile).toBeNull();
    });
  });

  describe('createProfile', () => {
    it('should create a new profile with the correct data', async () => {
      // 1. Arrange: Define the input data and the expected output
      const inputData = {
        fullName: 'Test User',
        username: 'test_user',
        authId: 'test-auth-id'
      };
      
      const expectedOutput = {
        id: 'new-uuid',
        full_name: 'Test User',
        username: 'test_user',
        auth_id: 'test-auth-id'
      };

      // Tell the fake 'create' function to return this object
      Profile.create.mockResolvedValue(expectedOutput);

      // 2. Act: Run the function
      const profile = await createProfile(inputData);

      // 3. Assert: Check the results
      // Check if 'create' was called with the correct data
      expect(Profile.create).toHaveBeenCalledWith(expect.objectContaining({
        full_name: 'Test User',
        username: 'test_user',
        auth_id: 'test-auth-id'
      }));
      
      // Check if the function returned the new profile
      expect(profile).toBe(expectedOutput);
    });
  });

});