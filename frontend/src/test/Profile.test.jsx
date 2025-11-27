import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
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

// Mock logoutUser (used by the component)
vi.mock('../components/auth/controller/authController', () => ({
  logoutUser: vi.fn(),
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
    render(<Profile userProfile={mockUser} />);
    
    // FIX: Use getAllByText because name/email appear in Profile Card AND Settings
    const names = screen.getAllByText('Test User');
    expect(names.length).toBeGreaterThan(0);
    expect(names[0]).toBeInTheDocument();

    const usernames = screen.getAllByText('@testuser');
    expect(usernames[0]).toBeInTheDocument();

    const emails = screen.getAllByText('test@example.com'); // Might appear as email field value too
    expect(emails[0]).toBeInTheDocument();
    
    const avatars = screen.getAllByAltText('Profile');
    expect(avatars[0]).toHaveAttribute('src', 'http://pic.com/avatar.jpg');
  });

  it('renders Guest User state if no profile', () => {
    authContext.useAuth.mockReturnValue({ profile: null });
    render(<Profile userProfile={null} />);
    
    const guestNames = screen.getAllByText('Guest User');
    expect(guestNames[0]).toBeInTheDocument();
    const unknowns = screen.getAllByText('@unknown');
    expect(unknowns[0]).toBeInTheDocument();
    const initials = screen.getAllByText('G');
    expect(initials[0]).toBeInTheDocument();
  });

  // --- 2. NAVIGATION TESTS ---

  it('navigates to Bookmarks', () => {
    render(<Profile userProfile={mockUser} />);
    const btn = screen.getAllByText('Bookmarks')[0].closest('button');
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith('/bookmarks');
  });

  it('navigates to Personalized Feed', () => {
    render(<Profile userProfile={mockUser} />);
    const feedBtn = screen.getAllByText('Personalized Feed')[0].closest('button');
    fireEvent.click(feedBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/feed/personalized');
  });

  // --- 3. EDIT NAME TESTS ---

  it('edits and saves Full Name successfully', async () => {
    api.updateProfile.mockResolvedValue(true);
    render(<Profile userProfile={mockUser} />);

    // Open the settings panel first so Edit buttons become visible
    // Multiple "Open" buttons exist (mobile + desktop). Click the first one.
    const openBtns = screen.getAllByText('Open');
    // Click the desktop variant (second in DOM) to reliably open settings
    fireEvent.click(openBtns[1]);
    await waitFor(() => screen.getAllByText('Edit'));
    const editBtns = screen.getAllByText('Edit');
    fireEvent.click(editBtns[0]); // Edit Name

    const input = screen.getAllByLabelText('Edit full name')[0];
    fireEvent.change(input, { target: { value: 'New Name' } });

    const saveBtn = screen.getAllByText('Save')[1];
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.updateProfile).toHaveBeenCalledWith('user-123', { full_name: 'New Name' });
      expect(notify.success).toHaveBeenCalledWith('Full name updated');
      expect(screen.queryByLabelText('Edit full name')).not.toBeInTheDocument();
    });
  });

// --- 4. EDIT USERNAME TESTS (Complex - Uses Timers) ---

  it('checks availability and saves valid username', async () => {
    // Use real timers (avoid fake timers for the debounce here)
    vi.useRealTimers();
    
    api.checkUsernameAvailability.mockResolvedValue({ available: true });
    api.updateProfile.mockResolvedValue(true);
    
    render(<Profile userProfile={mockUser} />);
    // Open the settings panel (use the same reliable approach as the Name test)
    const openBtns = screen.getAllByText('Open');
    fireEvent.click(openBtns[1]);
    await waitFor(() => screen.getAllByText('Username')[1]);

    const usernameRow = screen.getAllByText('Username')[1].parentElement; // header container
    const editBtn = within(usernameRow).getByText('Edit');
    fireEvent.click(editBtn);

    const input = screen.getAllByLabelText('Edit username')[1];
    fireEvent.change(input, { target: { value: 'new_handle' } });

    // Wait for the debounce (component uses 500ms). Use a slightly generous timeout.
    await waitFor(() => {
      expect(api.checkUsernameAvailability).toHaveBeenCalledWith('new_handle', 'user-123');
      expect(screen.getAllByText('✓ Username is available')[1]).toBeInTheDocument();
    }, { timeout: 5000 });

    const saveBtn2 = screen.getAllByText('Save')[1];
    fireEvent.click(saveBtn2);

    await waitFor(() => {
      expect(api.updateProfile).toHaveBeenCalledWith('user-123', { username: 'new_handle' });
      expect(notify.success).toHaveBeenCalled();
    });
  }, 10000);

  it('shows error if username is taken', async () => {
    // Use real timers to allow the component debounce to run naturally
    vi.useRealTimers();

    api.checkUsernameAvailability.mockResolvedValue({ available: false });
    render(<Profile userProfile={mockUser} />);
    const openBtns2 = screen.getAllByText('Open');
    fireEvent.click(openBtns2[1]);
    await waitFor(() => screen.getAllByText('Username')[1]);
    const usernameRow2 = screen.getAllByText('Username')[1].parentElement; // header container
    const editBtn2 = within(usernameRow2).getByText('Edit');
    fireEvent.click(editBtn2);

    const input = screen.getAllByLabelText('Edit username')[1];
    fireEvent.change(input, { target: { value: 'taken_user' } });

    // Wait for debounce to complete and the UI to reflect availability
    await waitFor(() => {
      const saveBtn3 = screen.getAllByText('Save')[1];
      expect(screen.getAllByText('✗ Username is already taken')[1]).toBeInTheDocument();
      expect(saveBtn3).toBeDisabled();
    }, { timeout: 5000 });
  }, 10000);

  // --- 5. ERROR HANDLING TESTS (Uses Real Timers) ---

  it('handles API error during update', async () => {
    // Ensure real timers are on so waitFor doesn't timeout
    vi.useRealTimers(); 
    
    api.updateProfile.mockRejectedValue(new Error('Network Error'));
    render(<Profile userProfile={mockUser} />);
    const openBtns4 = screen.getAllByText('Open');
    fireEvent.click(openBtns4[1]);
    await waitFor(() => screen.getAllByText('Edit'));
    const editBtns = screen.getAllByText('Edit');
    fireEvent.click(editBtns[0]); // Edit Name

    const input = screen.getAllByLabelText('Edit full name')[0];
    fireEvent.change(input, { target: { value: 'Error Name' } });

    const saveBtn4 = screen.getAllByText('Save')[1];
    fireEvent.click(saveBtn4);
    await waitFor(() => {
      // Verify the toast error was called
      expect(notify.error).toHaveBeenCalledWith('Failed to save full name');
    });
  });

  it('calls logoutUser on Logout button click', async () => {
    const authController = await import('../components/auth/controller/authController');
    authController.logoutUser.mockResolvedValue();

    const { container } = render(<Profile userProfile={mockUser} />);
    const aside = container.querySelector('aside');
    const logoutBtn = within(aside).getByText('Logout').closest('button');

    await act(async () => {
      fireEvent.click(logoutBtn);
    });

    expect(authController.logoutUser).toHaveBeenCalled();
  });

});