import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../components/LoginPage';
import * as authController from '../components/auth/controller/authController';
import { auth } from '../components/auth/firebase';
import notify from '../utils/toast';

// --- MOCKS ---
vi.mock('../utils/toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

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

vi.mock('../components/auth/controller/authController', () => ({
  loginUser: vi.fn(),
  resetPassword: vi.fn(),
}));

vi.mock('../services/api', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(true),
}));

describe('LoginPage Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSwitchToSignup = vi.fn();

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

  // --- 1. RENDERING & INTERACTION ---

  it('renders Login form correctly', () => {
    render(<LoginPage onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />);
    
    expect(screen.getByRole('heading', { name: /Login to/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('switches to Sign Up when link is clicked', () => {
    render(<LoginPage onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />);
    
    const signupLink = screen.getByText('Sign up');
    fireEvent.click(signupLink);

    expect(mockOnSwitchToSignup).toHaveBeenCalled();
  });

  it('toggles password visibility', () => {
    render(<LoginPage onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />);
    
    const passInput = screen.getByPlaceholderText(/Enter your password/i);
    const toggle = screen.getByLabelText(/Show Password/i);

    expect(passInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggle);
    expect(passInput).toHaveAttribute('type', 'text');
  });

  it('closes modal when close button is clicked', () => {
    render(<LoginPage onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />);
    const closeBtn = screen.getByText('×');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  // --- 2. LOGIN FLOWS ---

  it('handles successful login (Verified Email)', async () => {
    authController.loginUser.mockResolvedValue({ success: true, emailVerified: true });
    render(<LoginPage onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />);

    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'Pass123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(authController.loginUser).toHaveBeenCalledWith('user@test.com', 'Pass123!');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles successful login (Unverified Email) -> Opens Verification Modal', async () => {
    authController.loginUser.mockResolvedValue({ success: true, emailVerified: false, email: 'user@test.com' });
    render(<LoginPage onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />);

    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'Pass123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('📧 Verify Your Email')).toBeInTheDocument();
    });
  });

  it('handles failed login', async () => {
    authController.loginUser.mockResolvedValue({ success: false });
    render(<LoginPage onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />);

    // Bypass HTML5 validation
    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'Pass123!' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(authController.loginUser).toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  // --- 3. FORGOT PASSWORD ---

  it('shows error if Forgot Password clicked with empty email', () => {
    render(<LoginPage onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />);
    fireEvent.click(screen.getByText('Forgot Password?'));
    expect(notify.error).toHaveBeenCalledWith(expect.stringContaining('Enter your email'));
  });

  it('calls resetPassword if email is present', async () => {
    authController.resetPassword.mockResolvedValue(true);
    render(<LoginPage onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />);

    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'reset@test.com' } });
    fireEvent.click(screen.getByText('Forgot Password?'));

    await waitFor(() => {
      expect(authController.resetPassword).toHaveBeenCalledWith('reset@test.com');
      expect(notify.info).toHaveBeenCalled();
    });
  });

  // --- 4. VERIFICATION MODAL FLOWS ---

  it('handles "I\'ve Verified" Click -> Success', async () => {
    // 1. Setup unverified state
    authController.loginUser.mockResolvedValue({ success: true, emailVerified: false, email: 'u@t.com' });
    render(<LoginPage onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />);
    
    // 2. Login to open modal
    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'u@t.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'Pass123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => screen.getByText('📧 Verify Your Email'));

    // 3. Mock verification success
    auth.currentUser.reload.mockResolvedValue();
    Object.defineProperty(auth.currentUser, 'emailVerified', { value: true, configurable: true });

    // 4. Click Refresh
    const refreshBtn = screen.getByText("✓ I've Verified - Refresh");
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(notify.success).toHaveBeenCalledWith(expect.stringContaining('Email verified'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles "Resend Verification Email"', async () => {
    authController.loginUser.mockResolvedValue({ success: true, emailVerified: false, email: 'u@t.com' });
    render(<LoginPage onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />);
    
    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'u@t.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'Pass123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => screen.getByText('📧 Verify Your Email'));

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
    render(<LoginPage onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />);
    
    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'u@t.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'Pass123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => screen.getByText('📧 Verify Your Email'));

    const backBtn = screen.getByText('← Back to Login');
    fireEvent.click(backBtn);

    expect(screen.queryByText('📧 Verify Your Email')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Login to/i })).toBeInTheDocument();
  });

});