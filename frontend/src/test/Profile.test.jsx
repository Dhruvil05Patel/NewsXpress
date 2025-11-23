import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Profile from '../components/Profile';
import * as api from '../services/api';
import * as authContext from '../contexts/AuthContext';
import notify from '../utils/toast';

// --- MOCKS ---
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/api', () => ({
  updateProfile: vi.fn(),
  checkUsernameAvailability: vi.fn(),
}));

vi.mock('../utils/toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

// --- TEST DATA ---
const mockUser = {
  id: 'user-123',
  full_name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  avatar_url: 'http://pic.com/avatar.jpg',
};

describe('Profile Component', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    // NOTE: We do NOT use fake timers globally here to avoid timeouts in async tests.
    // We will enable them only for the specific tests that need them.
    
    // Default: Logged in user
    authContext.useAuth.mockReturnValue({ profile: mockUser });
  });

  afterEach(() => {
    // Always ensure we reset to real timers after every test
    vi.useRealTimers();
  });

  // --- 1. RENDERING TESTS ---

  it('renders user profile information correctly', () => {
    render(<Profile />);
    
    // FIX: Use getAllByText because name/email appear in Profile Card AND Settings
    const names = screen.getAllByText('Test User');
    expect(names.length).toBeGreaterThan(0);
    expect(names[0]).toBeInTheDocument();

    const usernames = screen.getAllByText('@testuser');
    expect(usernames[0]).toBeInTheDocument();

    const emails = screen.getAllByText('test@example.com'); // Might appear as email field value too
    expect(emails[0]).toBeInTheDocument();
    
    const avatar = screen.getByAltText('Profile');
    expect(avatar).toHaveAttribute('src', 'http://pic.com/avatar.jpg');
  });

  it('renders Guest User state if no profile', () => {
    authContext.useAuth.mockReturnValue({ profile: null });
    render(<Profile />);
    
    expect(screen.getByText('Guest User')).toBeInTheDocument();
    expect(screen.getByText('@unknown')).toBeInTheDocument();
    expect(screen.getByText('G')).toBeInTheDocument(); 
  });

  // --- 2. NAVIGATION TESTS ---

  it('navigates to Bookmarks', () => {
    render(<Profile />);
    fireEvent.click(screen.getByText('Bookmarks'));
    expect(mockNavigate).toHaveBeenCalledWith('/bookmarks');
  });

  it('navigates to Personalized Feed', () => {
    render(<Profile />);
    fireEvent.click(screen.getByText('Personalized Feed'));
    expect(mockNavigate).toHaveBeenCalledWith('/feed/personalized');
  });

  // --- 3. EDIT NAME TESTS ---

  it('edits and saves Full Name successfully', async () => {
    api.updateProfile.mockResolvedValue(true);
    render(<Profile />);

    const editBtns = screen.getAllByText('Edit');
    fireEvent.click(editBtns[0]); // Edit Name

    const input = screen.getByLabelText('Edit full name');
    fireEvent.change(input, { target: { value: 'New Name' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(api.updateProfile).toHaveBeenCalledWith('user-123', { full_name: 'New Name' });
      expect(notify.success).toHaveBeenCalledWith('Full name updated');
      expect(screen.queryByLabelText('Edit full name')).not.toBeInTheDocument();
    });
  });

// --- 4. EDIT USERNAME TESTS (Complex - Uses Timers) ---

  it('checks availability and saves valid username', async () => {
    // 1. Enable Fake Timers to control the debounce
    vi.useFakeTimers();
    
    api.checkUsernameAvailability.mockResolvedValue({ available: true });
    api.updateProfile.mockResolvedValue(true);
    
    render(<Profile />);

    const editBtns = screen.getAllByText('Edit');
    fireEvent.click(editBtns[1]); // Edit Username

    const input = screen.getByLabelText('Edit username');
    fireEvent.change(input, { target: { value: 'new_handle' } });

    // 2. Fast-forward time to trigger the debounce (500ms + buffer)
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // 3. CRITICAL FIX: Switch back to Real Timers
    // This allows the async API call (Promise) to resolve and 'waitFor' to poll correctly.
    vi.useRealTimers();

    await waitFor(() => {
      expect(api.checkUsernameAvailability).toHaveBeenCalledWith('new_handle', 'user-123');
      expect(screen.getByText('✓ Username is available')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(api.updateProfile).toHaveBeenCalledWith('user-123', { username: 'new_handle' });
      expect(notify.success).toHaveBeenCalled();
    });
  });

  it('shows error if username is taken', async () => {
    // 1. Enable Fake Timers
    vi.useFakeTimers();

    api.checkUsernameAvailability.mockResolvedValue({ available: false });
    render(<Profile />);

    const editBtns = screen.getAllByText('Edit');
    fireEvent.click(editBtns[1]);

    const input = screen.getByLabelText('Edit username');
    fireEvent.change(input, { target: { value: 'taken_user' } });

    // 2. Fast-forward
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // 3. CRITICAL FIX: Switch back to Real Timers
    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByText('✗ Username is already taken')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeDisabled();
    });
  });

  // --- 5. ERROR HANDLING TESTS (Uses Real Timers) ---

  it('handles API error during update', async () => {
    // Ensure real timers are on so waitFor doesn't timeout
    vi.useRealTimers(); 
    
    api.updateProfile.mockRejectedValue(new Error('Network Error'));
    render(<Profile />);

    const editBtns = screen.getAllByText('Edit');
    fireEvent.click(editBtns[0]); // Edit Name

    const input = screen.getByLabelText('Edit full name');
    fireEvent.change(input, { target: { value: 'Error Name' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      // Verify the toast error was called
      expect(notify.error).toHaveBeenCalledWith('Failed to save full name');
    });
  });

});