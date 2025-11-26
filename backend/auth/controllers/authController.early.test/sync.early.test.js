const { sync } = require('../authController'); // This is fine (sibling folder)

// CHANGE 1: Go up 3 levels to find config
const admin = require('../../../config/firebaseAdmin'); 

// CHANGE 2: Go up 3 levels to find services
const { findOrCreateProfileByAuthId } = require('../../../services/ProfileService');


// Import necessary modules and functions
// Mock dependencies

// CHANGE 3: Update mock path
jest.mock("../../../config/firebaseAdmin", () => ({
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn(),
  }),
}));

// CHANGE 4: Update mock path
jest.mock("../../../services/ProfileService", () => ({
  findOrCreateProfileByAuthId: jest.fn(),
}));

describe('sync() sync method', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // Happy path tests
  describe('Happy paths', () => {
    it('should verify token and sync profile successfully', async () => {
      // Arrange
      req.body.idToken = 'validToken';
      const decodedToken = { uid: '123', name: 'John Doe', picture: 'url' };
      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      const profile = { id: 'profileId', name: 'John Doe', picture: 'url' };
      findOrCreateProfileByAuthId.mockResolvedValue(profile);

      // Act
      await sync(req, res);

      // Assert
      expect(admin.auth().verifyIdToken).toHaveBeenCalledWith('validToken');
     expect(findOrCreateProfileByAuthId).toHaveBeenCalledWith('123', { avatar_url: 'url', full_name: 'John Doe', username: 'John Doe' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Synced', profile });
    });
  });

  // Edge case tests
  describe('Edge cases', () => {
    it('should return 400 if idToken is missing', async () => {
      // Arrange
      req.body.idToken = undefined;

      // Act
      await sync(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'idToken is required' });
    });

    it('should return 401 if token verification fails', async () => {
      // Arrange
      req.body.idToken = 'invalidToken';
      admin.auth().verifyIdToken.mockRejectedValue(new Error('Token verification failed'));

      // Act
      await sync(req, res);

      // Assert
      expect(admin.auth().verifyIdToken).toHaveBeenCalledWith('invalidToken');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired ID token' });
    });

    it('should return 400 if uid is missing in decoded token', async () => {
      // Arrange
      req.body.idToken = 'validToken';
      const decodedToken = { name: 'John Doe', picture: 'url' };
      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);

      // Act
      await sync(req, res);

      // Assert
      expect(admin.auth().verifyIdToken).toHaveBeenCalledWith('validToken');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token: missing uid' });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      // Arrange
      req.body.idToken = 'validToken';
      const decodedToken = { uid: '123', name: 'John Doe', picture: 'url' };
      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      findOrCreateProfileByAuthId.mockRejectedValue(new Error('Unexpected error'));

      // Act
      await sync(req, res);

      // Assert
     expect(findOrCreateProfileByAuthId).toHaveBeenCalledWith('123', { avatar_url: 'url', full_name: 'John Doe', username: 'John Doe' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
  // ==========================================================
  // NEW: Tests for Username/Fullname Resolution (Lines 35-36)
  // ==========================================================
  describe('Username & Profile Resolution', () => {
    
    it('should use the username provided in the request body', async () => {
      // Arrange
      req.body.idToken = 'validToken';
      // WE PROVIDE A CUSTOM USERNAME HERE
      req.body.username = 'custom_user_123'; 
      req.body.full_name = 'Custom Name';

      const decodedToken = { uid: '123', email: 'test@test.com' }; // No name in token
      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      
      findOrCreateProfileByAuthId.mockResolvedValue({ id: 'p1' });

      // Act
      await sync(req, res);

      // Assert
      expect(findOrCreateProfileByAuthId).toHaveBeenCalledWith('123', expect.objectContaining({
        username: 'custom_user_123', // Should match req.body
        full_name: 'Custom Name'
      }));
    });

    it('should fallback to token name if request username is missing', async () => {
      // Arrange
      req.body.idToken = 'validToken';
      req.body.username = undefined; // MISSING

      // Token has a name with spaces
      const decodedToken = { uid: '123', name: 'John Doe Smith', email: 'test@test.com' };
      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      
      findOrCreateProfileByAuthId.mockResolvedValue({ id: 'p1' });

      // Act
      await sync(req, res);

      // Assert
      expect(findOrCreateProfileByAuthId).toHaveBeenCalledWith('123', expect.objectContaining({
        username: 'JohnDoeSmith', // Should be token name with spaces removed
        full_name: 'John Doe Smith'
      }));
    });

    it('should fallback to email if both username and name are missing', async () => {
        // Arrange
        req.body.idToken = 'validToken';
        req.body.username = undefined;
  
        const decodedToken = { uid: '123', name: null, email: 'fallback@test.com' };
        admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
        
        findOrCreateProfileByAuthId.mockResolvedValue({ id: 'p1' });
  
        // Act
        await sync(req, res);
  
        // Assert
        expect(findOrCreateProfileByAuthId).toHaveBeenCalledWith('123', expect.objectContaining({
          username: 'fallback', // Should be email prefix
        }));
      });
  });
});