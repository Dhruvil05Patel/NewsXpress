


const { sync } = require('../authController');
const admin = require('../../config/firebaseAdmin');
const { findOrCreateProfileByAuthId } = require('../../services/ProfileService');


// Import necessary modules and functions
// Mock dependencies
jest.mock("../../config/firebaseAdmin", () => ({
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn(),
  }),
}));

jest.mock("../../services/ProfileService", () => ({
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
});