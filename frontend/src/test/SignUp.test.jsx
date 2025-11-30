import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUp from '../components/SignUp';
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
  registerUser: vi.fn(),
}));

vi.mock('../services/api', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(true),
}));

describe('SignUp Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: User not verified
    auth.currentUser = {
      email: 'new@test.com',
      displayName: 'New User',
      emailVerified: false,
      reload: vi.fn(),
    };
  });

  // --- HELPER: Fill Form ---
  const fillForm = (overrides = {}) => {
    // Default Valid Data
    const data = {
      name: 'New User',
      user: 'newuser',
      dob: '2000-01-01',
      email: 'new@test.com',
      pass: 'Pass123!',
      conf: 'Pass123!',
      ...overrides
    };

    fireEvent.change(screen.getByPlaceholderText(/Enter your Full Name/i), { target: { value: data.name } });
    fireEvent.change(screen.getByPlaceholderText(/Choose a username/i), { target: { value: data.user } });

    const dobInput = document.querySelector('input[type="date"]');
    if (dobInput) {
      fireEvent.change(dobInput, { target: { value: data.dob } });
    }
    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: data.email } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: data.pass } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm your password/i), { target: { value: data.conf } });
  };

  // --- 1. RENDERING & INTERACTION ---

  it('renders Sign Up form correctly', () => {
    render(<SignUp onClose={mockOnClose} onSwitchToLogin={mockOnSwitchToLogin} />);

    expect(screen.getByRole('heading', { name: /Create an/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your Full Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  it('switches to Login when link is clicked', () => {
    render(<SignUp onClose={mockOnClose} onSwitchToLogin={mockOnSwitchToLogin} />);

    const loginLink = screen.getByText('Login');
    fireEvent.click(loginLink);

    expect(mockOnSwitchToLogin).toHaveBeenCalled();
  });

  it('closes modal when close button is clicked', () => {
    render(<SignUp onClose={mockOnClose} onSwitchToLogin={mockOnSwitchToLogin} />);
    const closeBtn = screen.getByText('×');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  // --- 2. VALIDATION LOGIC ---

  it('validates Age (Too Young)', () => {
    render(<SignUp onClose={mockOnClose} />);
    const today = new Date().toISOString().split('T')[0];

    const dobInputSingle = document.querySelector('input[type="date"]');
    if (dobInputSingle) {
      fireEvent.change(dobInputSingle, { target: { value: today } });
    }

    expect(screen.getByText(/Must be 13 years or older/i)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Sign Up' });
    expect(btn).toBeDisabled();

    // Try Submit (should block and toast)
    fireEvent.click(btn);
  });

  it('prevents submission with Age Error (Force Submit)', () => {
    render(<SignUp onClose={mockOnClose} />);
    const today = new Date().toISOString().split('T')[0];
    const dobInput = document.querySelector('input[type="date"]');
    if (dobInput) fireEvent.change(dobInput, { target: { value: today } });

    // Force submit form
    const form = document.querySelector('form');
    fireEvent.submit(form);

    expect(notify.error).toHaveBeenCalledWith(expect.stringContaining('at least 13 years old'));
  });

  it('validates Age Edge Case (Exactly 13 - 1 day)', () => {
    render(<SignUp onClose={mockOnClose} />);
    const today = new Date();
    // Create date strictly: 13 years ago, plus 1 day (so they are 12 years, 364 days old)
    const tooYoung = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate() + 1);

    // Format as YYYY-MM-DD manually to avoid timezone issues with toISOString
    const year = tooYoung.getFullYear();
    const month = String(tooYoung.getMonth() + 1).padStart(2, '0');
    const day = String(tooYoung.getDate()).padStart(2, '0');
    const dobStr = `${year}-${month}-${day}`;

    const dobInput = document.querySelector('input[type="date"]');
    if (dobInput) fireEvent.change(dobInput, { target: { value: dobStr } });

    expect(screen.getByText(/Must be 13 years or older/i)).toBeInTheDocument();
  });

  it('validates Password Mismatch', () => {
    render(<SignUp onClose={mockOnClose} />);

    const passInput = screen.getByPlaceholderText(/Enter your password/i);
    const confInput = screen.getByPlaceholderText(/Confirm your password/i);

    fireEvent.change(passInput, { target: { value: 'Pass123!' } });
    fireEvent.change(confInput, { target: { value: 'Different123!' } });

    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeDisabled();
  });

  it('prevents submission with Password Mismatch (Force Submit)', () => {
    render(<SignUp onClose={mockOnClose} />);

    // Fill valid DOB first to avoid Age error masking the Password error
    const today = new Date();
    const dobInput = document.querySelector('input[type="date"]');
    if (dobInput) fireEvent.change(dobInput, { target: { value: '2000-01-01' } });

    const passInput = screen.getByPlaceholderText(/Enter your password/i);
    const confInput = screen.getByPlaceholderText(/Confirm your password/i);

    fireEvent.change(passInput, { target: { value: 'Pass123!' } });
    fireEvent.change(confInput, { target: { value: 'Different123!' } });

    const form = document.querySelector('form');
    fireEvent.submit(form);

    expect(notify.error).toHaveBeenCalledWith(expect.stringContaining('Passwords do not match'));
  });

  it('validates Password Complexity (Weak Password)', () => {
    render(<SignUp onClose={mockOnClose} />);

    const passInput = screen.getByPlaceholderText(/Enter your password/i);
    fireEvent.change(passInput, { target: { value: 'weak' } });

    // Check for specific complexity errors
    expect(screen.getByText(/At least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/1 uppercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/1 number/i)).toBeInTheDocument();
    expect(screen.getByText(/1 special character/i)).toBeInTheDocument();
  });

  it('prevents submission with Weak Password (Fallback Check)', () => {
    render(<SignUp onClose={mockOnClose} />);
    fillForm({ pass: 'WeakPass1', conf: 'WeakPass1' }); // Missing special char

    const btn = screen.getByRole('button', { name: 'Sign Up' });
    // Button is NOT disabled by complexity in current implementation, so we can click it
    fireEvent.click(btn);

    expect(notify.error).toHaveBeenCalledWith(expect.stringContaining('satisfy all password requirements'));
    expect(authController.registerUser).not.toHaveBeenCalled();
  });

  it('toggles Show Password', () => {
    render(<SignUp onClose={mockOnClose} />);
    const passInput = screen.getByPlaceholderText(/Enter your password/i);
    const checkbox = screen.getByLabelText('Show Password');

    expect(passInput).toHaveAttribute('type', 'password');

    fireEvent.click(checkbox);
    expect(passInput).toHaveAttribute('type', 'text');

    fireEvent.click(checkbox);
    expect(passInput).toHaveAttribute('type', 'password');
  });

  it('validates Username Format (Invalid)', () => {
    render(<SignUp onClose={mockOnClose} />);

    const userInput = screen.getByPlaceholderText(/Choose a username/i);
    fireEvent.change(userInput, { target: { value: '.badstart' } });

    expect(screen.getByText(/Does not start or end with a period/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeDisabled();
  });

  it('validates Username Format (Valid)', () => {
    render(<SignUp onClose={mockOnClose} />);

    const userInput = screen.getByPlaceholderText(/Choose a username/i);
    fireEvent.change(userInput, { target: { value: 'good_user.1' } });

    expect(screen.getByText(/Username looks good/i)).toBeInTheDocument();
  });

  // --- 3. REGISTRATION FLOW ---

  it('handles Successful Registration -> Shows Verification', async () => {
    authController.registerUser.mockResolvedValue({ success: true, email: 'new@test.com' });
    render(<SignUp onClose={mockOnClose} />);

    fillForm(); // Fills with valid data

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(authController.registerUser).toHaveBeenCalledWith('new@test.com', 'Pass123!', {
        username: 'newuser',
        full_name: 'New User',
      });
      // Modal should change to verification
      expect(screen.getByText(/Verify Your Email/i)).toBeInTheDocument();
    });
  });

  it('handles Registration Failure', async () => {
    authController.registerUser.mockResolvedValue({ success: false, error: 'Email taken' });
    render(<SignUp onClose={mockOnClose} />);
    fillForm();

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(authController.registerUser).toHaveBeenCalled();
      // Should NOT show verification modal
      expect(screen.queryByText(/Verify Your Email/i)).not.toBeInTheDocument();
    });
  });

  // --- 4. VERIFICATION MODAL FLOWS ---

  it('handles Verification Refresh (Success)', async () => {
    authController.registerUser.mockResolvedValue({ success: true, email: 'new@test.com' });
    render(<SignUp onClose={mockOnClose} />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => screen.getByText(/Verify Your Email/i));

    auth.currentUser.reload.mockResolvedValue();
    Object.defineProperty(auth.currentUser, 'emailVerified', { value: true, configurable: true });

    const refreshBtn = screen.getByText("✓ I've Verified - Refresh");
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(notify.success).toHaveBeenCalledWith(expect.stringContaining('Email verified'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles Verification Refresh (Not Verified Yet)', async () => {
    authController.registerUser.mockResolvedValue({ success: true, email: 'new@test.com' });
    render(<SignUp onClose={mockOnClose} />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => screen.getByText(/Verify Your Email/i));

    auth.currentUser.reload.mockResolvedValue();
    Object.defineProperty(auth.currentUser, 'emailVerified', { value: false, configurable: true });

    const refreshBtn = screen.getByText("✓ I've Verified - Refresh");
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(notify.warn).toHaveBeenCalled();
    });
  });

  it('handles Resend Verification Email', async () => {
    authController.registerUser.mockResolvedValue({ success: true, email: 'new@test.com' });
    render(<SignUp onClose={mockOnClose} />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => screen.getByText(/Verify Your Email/i));

    const { sendVerificationEmail } = await import('../services/api');
    const resendBtn = screen.getByText(/Resend Verification Email/i);
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(sendVerificationEmail).toHaveBeenCalled();
      expect(notify.success).toHaveBeenCalled();
    });
  });

  it('handles Resend Verification Email (No Display Name)', async () => {
    authController.registerUser.mockResolvedValue({ success: true, email: 'new@test.com' });
    render(<SignUp onClose={mockOnClose} />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => screen.getByText(/Verify Your Email/i));

    // Mock currentUser with NO display name
    auth.currentUser.displayName = null;

    const { sendVerificationEmail } = await import('../services/api');
    const resendBtn = screen.getByText(/Resend Verification Email/i);
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(sendVerificationEmail).toHaveBeenCalledWith('new@test.com', 'User');
      expect(notify.success).toHaveBeenCalled();
    });
  });

  it('handles Resend Verification Error', async () => {
    authController.registerUser.mockResolvedValue({ success: true, email: 'new@test.com' });
    render(<SignUp onClose={mockOnClose} />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => screen.getByText(/Verify Your Email/i));

    const { sendVerificationEmail } = await import('../services/api');
    sendVerificationEmail.mockRejectedValue(new Error('Network Error'));

    const resendBtn = screen.getByText(/Resend Verification Email/i);
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(notify.error).toHaveBeenCalledWith(expect.stringContaining('Failed to resend email'));
    });
  });

  it('handles Back to Sign Up (Reset)', async () => {
    authController.registerUser.mockResolvedValue({ success: true, email: 'new@test.com' });
    render(<SignUp onClose={mockOnClose} />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => screen.getByText(/Verify Your Email/i));

    const backBtn = screen.getByText(/Back to Sign Up/i);
    fireEvent.click(backBtn);

    expect(screen.getByRole('heading', { name: /Create an/i })).toBeInTheDocument();
  });

});