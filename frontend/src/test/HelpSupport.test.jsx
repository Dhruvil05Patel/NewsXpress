import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import HelpSupport from '../components/HelpSupport';
import * as AuthContextModule from '../contexts/AuthContext'; // Adjust path if needed

// --- MOCKS ---
// 1. Mock AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// 2. Mock Lucide Icons (optional, but good for isolation)
vi.mock('lucide-react', () => ({
  HelpCircle: () => <span data-testid="icon-help">Help</span>,
  CheckCircle2: () => <span data-testid="icon-check">Check</span>,
  Mail: () => <span>Mail</span>,
  MessageSquare: () => <span>Message</span>,
  ExternalLink: () => <span>Link</span>,
}));

describe('HelpSupport Component', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: No user logged in
    AuthContextModule.useAuth.mockReturnValue({ user: null, profile: null });
    
    // Use fake timers for the countdown test
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- 1. RENDERING TESTS ---

  it('renders the form correctly (Guest User)', () => {
    render(<HelpSupport />);
    
    expect(screen.getByRole('heading', { name: /Help & Support/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Contact support/i })).toBeInTheDocument();
    
    // Inputs should be empty and editable (except the logic locks them if empty strings are passed as locked values)
    // Wait, your logic locks them if profile exists. If guest, they are empty but READONLY based on your code?
    // Let's check your logic:
    // value={formData.name} readOnly disabled
    // It seems your form forces readOnly on Name/Email even if empty? 
    // Let's verify that behavior.
    
    const nameInput = screen.getByPlaceholderText('Enter your name');
    const emailInput = screen.getByPlaceholderText('Enter your email');
    
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    // Based on your code: <input ... readOnly disabled ... />
    expect(nameInput).toHaveAttribute('readonly');
    expect(nameInput).toBeDisabled();
  });

  it('pre-fills form with Profile data', () => {
    const mockProfile = { full_name: 'Test User', email: 'test@user.com' };
    AuthContextModule.useAuth.mockReturnValue({ user: { uid: '123' }, profile: mockProfile });

    render(<HelpSupport />);

    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@user.com')).toBeInTheDocument();
  });

  it('pre-fills form with Firebase User data (fallback)', () => {
    const mockFirebaseUser = { displayName: 'Firebase User', email: 'fb@user.com' };
    AuthContextModule.useAuth.mockReturnValue({ user: mockFirebaseUser, profile: null });

    render(<HelpSupport />);

    expect(screen.getByDisplayValue('Firebase User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('fb@user.com')).toBeInTheDocument();
  });

  // --- 2. INTERACTION TESTS ---

  it('allows typing in the Message field', () => {
    render(<HelpSupport />);
    
    const msgInput = screen.getByPlaceholderText('How can we help?');
    fireEvent.change(msgInput, { target: { value: 'I need help with my account.' } });
    
    expect(msgInput.value).toBe('I need help with my account.');
  });

  it('does NOT allow typing in Name/Email fields (Locked)', () => {
    // Even if we try to fire change events, the state updater logic:
    // if (name === "message") { setFormData... }
    // prevents updates to other fields.
    
    render(<HelpSupport />);
    const nameInput = screen.getByPlaceholderText('Enter your name');
    
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    
    expect(nameInput.value).toBe(''); // Should remain empty (or default)
  });

  // --- 3. SUBMISSION TESTS ---

  it('handles form submission and shows success state', async () => {
    // Spy on console.log to verify submission payload
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const mockProfile = { full_name: 'Test User', email: 'test@user.com' };
    AuthContextModule.useAuth.mockReturnValue({ user: { uid: '123' }, profile: mockProfile });

    render(<HelpSupport />);

    // Fill message
    const msgInput = screen.getByPlaceholderText('How can we help?');
    fireEvent.change(msgInput, { target: { value: 'My issue details.' } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitBtn);

    // Assert Success State
    expect(screen.getByText(/Message sent/i)).toBeInTheDocument();
    expect(screen.getByText(/Returning to the form in 10 sec/i)).toBeInTheDocument();
    
    // Verify payload was logged correctly
    expect(consoleSpy).toHaveBeenCalledWith("📩 Form Submitted Data:", {
      name: 'Test User',
      email: 'test@user.com',
      message: 'My issue details.'
    });
  });

  // --- 4. TIMER TESTS ---

  it('counts down and resets the form', async () => {
    render(<HelpSupport />);

    // 1. Submit Form
    const msgInput = screen.getByPlaceholderText('How can we help?');
    fireEvent.change(msgInput, { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    // Check initial success state
    expect(screen.getByText(/Message sent/i)).toBeInTheDocument();
    expect(screen.getByText(/10 sec/i)).toBeInTheDocument();

    // 2. Fast-forward time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // Should show 5 sec
    expect(screen.getByText(/5 sec/i)).toBeInTheDocument();

    // 3. Fast-forward remaining time (total 10s + buffer)
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    // 4. Assert Form Reset
    // Success message gone
    expect(screen.queryByText(/Message sent/i)).not.toBeInTheDocument();
    // Form is back
    expect(screen.getByRole('heading', { name: /Contact support/i })).toBeInTheDocument();
    // Message field is cleared
    expect(screen.getByPlaceholderText('How can we help?').value).toBe('');
  });

});