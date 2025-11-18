import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import LoginPage from '../components/LoginPage'; // Ensure this points to your App.jsx file
import * as authController from '../components/auth/controller/authController';
import { auth } from '../components/auth/firebase';
import notify from '../utils/toast';

// --- MOCKING DEPENDENCIES ---

// 1. Mock Toast Notifications
vi.mock('../utils/toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// 2. Mock Firebase Auth
vi.mock('../components/auth/firebase', () => ({
  auth: {
    currentUser: {
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: false,
      reload: vi.fn(),
    },
  },
}));

// 3. Mock Auth Controller
vi.mock('../components/auth/controller/authController', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  resetPassword: vi.fn(),
}));

// 4. Mock API Service (for Resend Verification)
vi.mock('../services/api', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(true),
}));

describe('LoginPage Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset auth mock state
    auth.currentUser = {
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: false,
      reload: vi.fn(),
    };
  });

  // --- 1. RENDERING & TOGGLES ---

  it('renders Login form by default', () => {
    render(<LoginPage onClose={mockOnClose} />);
    expect(screen.getByRole('heading', { name: /Login to/i })).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('switches to Sign Up form and back', () => {
    render(<LoginPage onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Sign up'));
    expect(screen.getByRole('heading', { name: /Create an/i })).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Login'));
    expect(screen.getByRole('heading', { name: /Login to/i })).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    render(<LoginPage onClose={mockOnClose} />);
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const toggleCheckbox = screen.getByLabelText('Show Password');

    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleCheckbox);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('closes modal on close button click', () => {
    render(<LoginPage onClose={mockOnClose} />);
    const closeBtn = screen.getByText('×');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  // --- 2. LOGIN FLOWS ---

  it('handles successful login (Verified Email)', async () => {
    authController.loginUser.mockResolvedValue({ success: true, emailVerified: true });
    render(<LoginPage onClose={mockOnClose} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Pass123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles successful login (Unverified Email) -> Opens Verification Modal', async () => {
    // Hits lines 112-113
    authController.loginUser.mockResolvedValue({ success: true, emailVerified: false, email: 'user@test.com' });
    render(<LoginPage onClose={mockOnClose} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Pass123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('📧 Verify Your Email')).toBeInTheDocument();
    });
  });

  it('handles failed login', async () => {
    authController.loginUser.mockResolvedValue({ success: false });
    render(<LoginPage onClose={mockOnClose} />);

    // Bypass HTML5 validation by filling inputs
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Pass123!' } });

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(authController.loginUser).toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  // --- 3. FORGOT PASSWORD FLOWS (Lines 370-385) ---

  it('shows error if Forgot Password clicked with empty email', () => {
    render(<LoginPage onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Forgot Password?'));
    expect(notify.error).toHaveBeenCalledWith(expect.stringContaining('Enter your email'));
  });

  it('calls resetPassword if email is provided', async () => {
    authController.resetPassword.mockResolvedValue(true);
    render(<LoginPage onClose={mockOnClose} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'reset@test.com' } });
    fireEvent.click(screen.getByText('Forgot Password?'));

    await waitFor(() => {
      expect(authController.resetPassword).toHaveBeenCalledWith('reset@test.com');
      expect(notify.info).toHaveBeenCalled();
    });
  });

  // --- 4. SIGNUP FLOWS & VALIDATION (Lines 127-159, 526-551) ---

  const fillSignupForm = (overrides = {}) => {
    fireEvent.click(screen.getByText('Sign up'));
    fireEvent.change(screen.getByPlaceholderText('Enter your Full Name'), { target: { value: 'New User' } });
    fireEvent.change(screen.getByPlaceholderText('Choose a username'), { target: { value: 'newuser123' } });
    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '2000-01-01' } }); // Valid age
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Pass123!' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'Pass123!' } });

    if (overrides.dob) fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: overrides.dob } });
    if (overrides.pass) fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: overrides.pass } });
    if (overrides.conf) fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: overrides.conf } });
    if (overrides.user) fireEvent.change(screen.getByPlaceholderText('Choose a username'), { target: { value: overrides.user } });
  };

  it('validates Age (Too Young)', () => {
    // Hits isOldEnough logic and lines 127-133
    render(<LoginPage onClose={mockOnClose} />);
    const today = new Date().toISOString().split('T')[0];
    
    fillSignupForm({ dob: today }); // 0 years old
    
    // Check UI Error
    expect(screen.getByText('❌ Must be 13 years or older.')).toBeInTheDocument();
    
    // Try clicking (though button should be disabled)
    const btn = screen.getByRole('button', { name: 'Sign Up' });
    expect(btn).toBeDisabled(); // Hits line 546 condition
    
    // Force click via fireEvent just to trigger the handler logic for coverage
    fireEvent.click(btn); 
    // Note: If disabled, click might not fire in browser, but in JSDOM sometimes we need to be sure
  });

  it('validates Password Mismatch', () => {
    // Hits lines 136-140
    render(<LoginPage onClose={mockOnClose} />);
    fillSignupForm({ pass: 'Pass123!', conf: 'Different123!' });

    expect(screen.getByText('❌ Passwords do not match')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeDisabled();
  });

  it('validates Weak Password', () => {
    // Hits lines 143-147
    render(<LoginPage onClose={mockOnClose} />);
    fillSignupForm({ pass: 'weak', conf: 'weak' }); // Matches, but weak

    // Check rule list
    expect(screen.getByText('❌ At least 8 characters')).toBeInTheDocument();
    
    // Try Submit - Use fireEvent to bypass HTML5 validation if needed, or check button
    const btn = screen.getByRole('button', { name: 'Sign Up' });
    fireEvent.click(btn);
    
    expect(notify.error).toHaveBeenCalledWith(expect.stringContaining('satisfy all password requirements'));
  });

  it('validates Username Format', () => {
    render(<LoginPage onClose={mockOnClose} />);
    fillSignupForm({ user: '.baduser' }); // Invalid start
    expect(screen.getByText('❌ Does not start or end with a period')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeDisabled();
  });

  it('handles Successful Registration', async () => {
    // Hits lines 150-159
    authController.registerUser.mockResolvedValue({ success: true, email: 'new@test.com' });
    render(<LoginPage onClose={mockOnClose} />);
    fillSignupForm();

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(authController.registerUser).toHaveBeenCalled();
      expect(screen.getByText('📧 Verify Your Email')).toBeInTheDocument();
    });
  });

  // --- 5. VERIFICATION MODAL TESTS (Lines 177-275) ---

  it('handles "I\'ve Verified" Click -> Success', async () => {
    // Setup: Render verification screen directly by mocking unverified login
    authController.loginUser.mockResolvedValue({ success: true, emailVerified: false, email: 'u@t.com' });
    render(<LoginPage onClose={mockOnClose} />);
    
    // Login to show modal
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'u@t.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'P@ss1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => screen.getByText('📧 Verify Your Email'));

    // Mock Firebase reload to simulate verification
    auth.currentUser.reload.mockResolvedValue();
    Object.defineProperty(auth.currentUser, 'emailVerified', { value: true, configurable: true });

    // Click Refresh Button
    const refreshBtn = screen.getByText("✓ I've Verified - Refresh");
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(notify.success).toHaveBeenCalledWith(expect.stringContaining('Email verified'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles "I\'ve Verified" Click -> Still Unverified', async () => {
    authController.loginUser.mockResolvedValue({ success: true, emailVerified: false, email: 'u@t.com' });
    render(<LoginPage onClose={mockOnClose} />);
    
    // Login to show modal
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'u@t.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'P@ss1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => screen.getByText('📧 Verify Your Email'));

    // Mock Firebase: Still unverified
    auth.currentUser.reload.mockResolvedValue();
    Object.defineProperty(auth.currentUser, 'emailVerified', { value: false, configurable: true });

    const refreshBtn = screen.getByText("✓ I've Verified - Refresh");
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(notify.warn).toHaveBeenCalled();
    });
  });

  it('handles "Resend Verification Email"', async () => {
    authController.loginUser.mockResolvedValue({ success: true, emailVerified: false, email: 'u@t.com' });
    render(<LoginPage onClose={mockOnClose} />);
    
    // Login to show modal
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'u@t.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'P@ss1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => screen.getByText('📧 Verify Your Email'));

    // Import mocked API service
    const { sendVerificationEmail } = await import('../services/api');

    const resendBtn = screen.getByText('📧 Resend Verification Email');
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(sendVerificationEmail).toHaveBeenCalled();
      expect(notify.success).toHaveBeenCalled();
    });
  });

  it('handles "Back to Login" from Verification', async () => {
    authController.loginUser.mockResolvedValue({ success: true, emailVerified: false, email: 'u@t.com' });
    render(<LoginPage onClose={mockOnClose} />);
    
    // Login to show modal
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'u@t.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'P@ss1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => screen.getByText('📧 Verify Your Email'));

    const backBtn = screen.getByText('← Back to Login');
    fireEvent.click(backBtn);

    expect(screen.getByRole('heading', { name: /Login to/i })).toBeInTheDocument();
  });
});