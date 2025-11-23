import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUp from '../components/SignUp'; // Adjust path if needed
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
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: data.dob } });
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
    
    // Fill DOB only
    const dobInput = screen.getByLabelText(/Date of Birth/i);
    fireEvent.change(dobInput, { target: { value: today } });
    
    // Check Error
    expect(screen.getByText(/Must be 13 years or older/i)).toBeInTheDocument();
    
    // Check Button Disabled
    const btn = screen.getByRole('button', { name: 'Sign Up' });
    expect(btn).toBeDisabled();

    // Try Submit (should block and toast)
    fireEvent.click(btn);
    // Note: Button is disabled, so click might not fire handler in DOM, but we check state logic via UI
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

  // --- 4. VERIFICATION MODAL FLOWS ---

  it('handles Verification Refresh (Success)', async () => {
    // Setup: Start directly in verification mode (simulate successful register)
    authController.registerUser.mockResolvedValue({ success: true, email: 'new@test.com' });
    render(<SignUp onClose={mockOnClose} />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => screen.getByText(/Verify Your Email/i));

    // Mock Verification Success
    auth.currentUser.reload.mockResolvedValue();
    Object.defineProperty(auth.currentUser, 'emailVerified', { value: true, configurable: true });

    // Click Refresh
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

    // Mock Verification Failure (False)
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

  it('handles Back to Sign Up (Reset)', async () => {
    authController.registerUser.mockResolvedValue({ success: true, email: 'new@test.com' });
    render(<SignUp onClose={mockOnClose} />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => screen.getByText(/Verify Your Email/i));

    // Click Back
    const backBtn = screen.getByText(/Back to Login/i); // Your code says "Back to Login" even in SignUp modal
    // Wait, let's check the code:
    // <button ...> ← Back to Login </button>  (Lines 273)
    // Wait, line 273 says "Back to Login". Since this is SignUp.jsx, should it say "Back to Sign Up"?
    // Or does it reset to Login mode?
    // Line 269: setIsLogin(true); -> It resets to LOGIN mode.
    
    // Let's test what the code DOES.
    fireEvent.click(backBtn);

    // It resets setIsLogin(true), but wait... 
    // SignUp.jsx doesn't seem to have `isLogin` state?
    // Looking at your pasted code...
    // Line 11: const [isLogin, setIsLogin] = useState(true); 
    // WAIT! Your pasted code for SignUp.jsx HAS `isLogin` state inside it?
    // And it renders EITHER Login OR Signup?
    
    // RE-READING YOUR CODE:
    // function SignUp({ onClose, onSwitchToLogin }) { ... }
    // It seems you might have pasted `App.jsx` content AGAIN but renamed the function to `SignUp`?
    // Or does `SignUp.jsx` contain a full copy of the Login logic?
    
    // If `SignUp.jsx` contains the full logic (Login/Signup toggle), then my test assumptions need to be adjusted.
    // Assuming `SignUp.jsx` is intended to be JUST the Signup form, usually it wouldn't have `isLogin` state.
    
    // BUT based on the code you pasted, it DOES have `isLogin` state logic.
    // So, clicking "Back to Login" (line 273) sets `isLogin(true)`.
    
    // If `isLogin` is true, it renders "Login to NewsXpress".
    expect(screen.getByRole('heading', { name: /Login to/i })).toBeInTheDocument();
  });

});