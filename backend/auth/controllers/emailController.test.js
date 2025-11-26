// Import the controller functions
const { sendVerification, sendPasswordReset } = require('./emailController');

// Import dependencies to mock
const emailService = require('../service/emailService');
const firebaseService = require('../service/firebaseService');

// --- MOCKS ---
jest.mock('../service/emailService', () => ({
  sendVerificationEmail: jest.fn(),
  sendResetPasswordEmail: jest.fn(),
}));

jest.mock('../service/firebaseService', () => ({
  generateVerificationLink: jest.fn(),
  generatePasswordResetLink: jest.fn(),
}));

// Spy on console.error to keep test output clean
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Email Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset req/res objects
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(), // Allow chaining .status().json()
      json: jest.fn(),
    };
  });

  // ======================================================
  // 1. sendVerification
  // ======================================================
  describe('sendVerification', () => {
    
    it('should send a verification email successfully', async () => {
      // 1. Arrange
      req.body = { email: 'test@test.com', name: 'Test User' };
      firebaseService.generateVerificationLink.mockResolvedValue('http://verify.link');
      emailService.sendVerificationEmail.mockResolvedValue(true);

      // 2. Act
      await sendVerification(req, res);

      // 3. Assert
      expect(firebaseService.generateVerificationLink).toHaveBeenCalledWith('test@test.com');
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith('test@test.com', 'Test User', 'http://verify.link');
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Verification email sent' });
    });

    it('should return 400 if email is missing', async () => {
      // 1. Arrange (No email in body)
      req.body = { name: 'User' };

      // 2. Act
      await sendVerification(req, res);

      // 3. Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email is required' });
      expect(firebaseService.generateVerificationLink).not.toHaveBeenCalled();
    });

    it('should return 500 if service fails', async () => {
      // 1. Arrange
      req.body = { email: 'fail@test.com' };
      firebaseService.generateVerificationLink.mockRejectedValue(new Error('Firebase Error'));

      // 2. Act
      await sendVerification(req, res);

      // 3. Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Firebase Error' });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  // ======================================================
  // 2. sendPasswordReset
  // ======================================================
  describe('sendPasswordReset', () => {

    it('should send a password reset email successfully', async () => {
      // 1. Arrange
      req.body = { email: 'reset@test.com', name: 'Reset User' };
      firebaseService.generatePasswordResetLink.mockResolvedValue('http://reset.link');
      emailService.sendResetPasswordEmail.mockResolvedValue(true);

      // 2. Act
      await sendPasswordReset(req, res);

      // 3. Assert
      expect(firebaseService.generatePasswordResetLink).toHaveBeenCalledWith('reset@test.com');
      expect(emailService.sendResetPasswordEmail).toHaveBeenCalledWith('reset@test.com', 'Reset User', 'http://reset.link');
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Password reset email sent' });
    });

    it('should return 400 if email is missing', async () => {
      // 1. Arrange
      req.body = { name: 'User' };

      // 2. Act
      await sendPasswordReset(req, res);

      // 3. Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email is required' });
    });

    it('should return 500 if service fails', async () => {
      // 1. Arrange
      req.body = { email: 'fail@test.com' };
      // Mock failure at the email sending step
      firebaseService.generatePasswordResetLink.mockResolvedValue('http://link.com');
      emailService.sendResetPasswordEmail.mockRejectedValue(new Error('Email Service Down'));

      // 2. Act
      await sendPasswordReset(req, res);

      // 3. Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email Service Down' });
    });
  });

});