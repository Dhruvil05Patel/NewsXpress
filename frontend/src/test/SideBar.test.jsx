import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import SideBar from '../components/SideBar'; // Adjust filename if it is Sidebar.jsx
import * as api from '../services/api';
import * as authController from '../components/auth/controller/authController';
import notify from '../utils/toast';

// --- MOCKS ---

// 1. Router Mocks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/all' }),
}));

// 2. API Mocks
vi.mock('../services/api', () => ({
  updateProfile: vi.fn(),
  checkUsernameAvailability: vi.fn(),
}));

// 3. Auth Controller Mocks
vi.mock('../components/auth/controller/authController', () => ({
  logoutUser: vi.fn(),
}));

// 4. Toast Mock
vi.mock('../utils/toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// 5. Icon Mocks (Lucide)
vi.mock('lucide-react', () => ({
  Laptop: () => <span>Laptop</span>,
  Vote: () => <span>Vote</span>,
  Trophy: () => <span>Trophy</span>,
  TrendingUp: () => <span>TrendingUp</span>,
  Film: () => <span>Film</span>,
  Heart: () => <span>Heart</span>,
  Microscope: () => <span>Microscope</span>,
  Shield: () => <span>Shield</span>,
  Leaf: () => <span>Leaf</span>,
  Menu: () => <span>Menu</span>,
  X: () => <span>X</span>,
  Bookmark: () => <span>Bookmark</span>,
  User: () => <span>User</span>,
  Search: () => <span>Search</span>,
  Home: () => <span>Home</span>,
  Bell: () => <span>Bell</span>,
}));

// 6. Window Mocks
const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

describe('SideBar Component', () => {
  const mockOnLoginClick = vi.fn();
  const mockUserProfile = {
    id: 'u1',
    full_name: 'Test User',
    username: 'testuser',
    email: 'test@test.com',
    avatar_url: 'http://pic.com/avatar.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers(); // Essential for username debounce & sidebar animations
    
    // Mock matchMedia for Desktop by default
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query.includes('min-width: 1024px') ? true : false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- 1. RENDERING & BASIC NAVIGATION ---

  it('renders Logo and Categories (Desktop)', () => {
    render(<SideBar userProfile={mockUserProfile} onLoginClick={mockOnLoginClick} />);
    
    expect(screen.getByAltText(/Today's Headlines Logo/i)).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    
    // Check Search Input
    expect(screen.getByPlaceholderText('Search headlines...')).toBeInTheDocument();
  });

  it('navigates when a category is clicked', () => {
    render(<SideBar userProfile={mockUserProfile} />);
    
    const techBtn = screen.getByText('Technology').closest('button');
    fireEvent.click(techBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/technology');
  });

  // --- 2. MOBILE SIDEBAR INTERACTIONS ---

  it('toggles Mobile Sidebar visibility', async () => {
    // Simulate Mobile View
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false, 
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    render(<SideBar userProfile={mockUserProfile} />);

    // Open Sidebar (Click Menu Icon)
    const menuBtn = screen.getByText('Categories').closest('button');
    fireEvent.click(menuBtn);

    // Wait for animation state update
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Verify sidebar content is visible (Check for X button inside sidebar)
    const closeBtns = screen.getAllByText('X');
    expect(closeBtns.length).toBeGreaterThan(0);

    // Navigate inside mobile sidebar
    const mobileTechBtn = screen.getAllByText('Technology')[1]; // 0 is desktop hidden, 1 is mobile visible
    fireEvent.click(mobileTechBtn);
    
    expect(mockNavigate).toHaveBeenCalledWith('/technology');
  });

  // --- 3. PROFILE SIDEBAR (Right Side) ---

  it('opens Profile Sidebar on User Icon click (Desktop)', () => {
    render(<SideBar userProfile={mockUserProfile} />);
    
    // Click User Icon (Desktop)
    const toggleBtn = screen.getByLabelText('Toggle profile and settings');
    fireEvent.click(toggleBtn);

    // Check for Profile Header
    expect(screen.getByText('Profile & Settings')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  it('opens Profile Sidebar on Profile Nav click (Mobile)', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({ matches: false }));
    render(<SideBar userProfile={mockUserProfile} />);
    
    // Click 'Profile' in bottom nav
    const profileNavBtn = screen.getByText('Profile').closest('button');
    fireEvent.click(profileNavBtn);

    expect(screen.getByText('Profile & Settings')).toBeInTheDocument();
  });

  // --- 4. AUTH STATE (Guest vs User) ---

  it('shows Login button for Guest and calls handler', () => {
    render(<SideBar userProfile={null} onLoginClick={mockOnLoginClick} />);
    
    // Open Profile
    const toggleBtn = screen.getByLabelText('Toggle profile and settings');
    fireEvent.click(toggleBtn);

    expect(screen.getByText('Guest User')).toBeInTheDocument();
    
    // Click Login
    const loginBtn = screen.getByText('Login to Save Preferences');
    fireEvent.click(loginBtn);

    expect(mockOnLoginClick).toHaveBeenCalled();
  });

  it('shows Logout button for User and calls API', async () => {
    render(<SideBar userProfile={mockUserProfile} />);
    
    // Open Profile
    fireEvent.click(screen.getByLabelText('Toggle profile and settings'));

    const logoutBtn = screen.getByText('Logout');
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(authController.logoutUser).toHaveBeenCalled();
    });
  });

  // --- 5. PROFILE ACTIONS (Bookmarks, Help) ---

  it('navigates to Bookmarks and Personalized Feed', () => {
    render(<SideBar userProfile={mockUserProfile} />);
    fireEvent.click(screen.getByLabelText('Toggle profile and settings'));

    // Bookmarks
    fireEvent.click(screen.getByText('Bookmarks').closest('button'));
    expect(mockNavigate).toHaveBeenCalledWith('/bookmarks');

    // Personalized
    fireEvent.click(screen.getByText('Personalized Feed').closest('button'));
    expect(mockNavigate).toHaveBeenCalledWith('/feed/personalized');
  });

  it('navigates to Help & Support', () => {
    render(<SideBar userProfile={mockUserProfile} />);
    fireEvent.click(screen.getByLabelText('Toggle profile and settings'));

    // Expand Settings Panel
    fireEvent.click(screen.getByText('Open'));
    
    // Click Help
    fireEvent.click(screen.getByText('Help & Support'));
    expect(mockNavigate).toHaveBeenCalledWith('/help');
    expect(notify.info).toHaveBeenCalled();
  });

  // --- 6. PROFILE EDITING (Name) ---

  it('edits and saves Full Name', async () => {
    api.updateProfile.mockResolvedValue(true);
    render(<SideBar userProfile={mockUserProfile} />);
    
    // Open Profile -> Open Settings
    fireEvent.click(screen.getByLabelText('Toggle profile and settings'));
    fireEvent.click(screen.getByText('Open'));

    // Click Edit (Name is the first "Edit" button)
    const editBtns = screen.getAllByText('Edit');
    fireEvent.click(editBtns[0]);

    // Change Input
    const input = screen.getByLabelText('Edit full name');
    fireEvent.change(input, { target: { value: 'New Name' } });

    // Click Save
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(api.updateProfile).toHaveBeenCalledWith('u1', { full_name: 'New Name' });
      expect(notify.success).toHaveBeenCalledWith('Full name updated');
      expect(dispatchEventSpy).toHaveBeenCalled(); // profile-updated event
    });
  });

  // --- 7. PROFILE EDITING (Username with Debounce) ---

  it('checks username availability and saves', async () => {
    api.checkUsernameAvailability.mockResolvedValue({ available: true });
    api.updateProfile.mockResolvedValue(true);

    render(<SideBar userProfile={mockUserProfile} />);
    
    // Open Profile -> Open Settings
    fireEvent.click(screen.getByLabelText('Toggle profile and settings'));
    fireEvent.click(screen.getByText('Open'));

    // Click Edit (Username is the second "Edit" button)
    const editBtns = screen.getAllByText('Edit');
    fireEvent.click(editBtns[1]);

    // Change Input
    const input = screen.getByLabelText('Edit username');
    fireEvent.change(input, { target: { value: 'new_handle' } });

    // Advance Timer (Debounce 500ms)
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Switch to real timers for async API to resolve
    vi.useRealTimers();

    await waitFor(() => {
      expect(api.checkUsernameAvailability).toHaveBeenCalledWith('new_handle', 'u1');
      expect(screen.getByText('✓ Username is available')).toBeInTheDocument();
    });

    // Click Save
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(api.updateProfile).toHaveBeenCalledWith('u1', { username: 'new_handle' });
      expect(notify.success).toHaveBeenCalledWith('Username updated successfully');
    });
  });

  it('handles taken username error', async () => {
    api.checkUsernameAvailability.mockResolvedValue({ available: false });
    
    render(<SideBar userProfile={mockUserProfile} />);
    fireEvent.click(screen.getByLabelText('Toggle profile and settings'));
    fireEvent.click(screen.getByText('Open'));
    
    const editBtns = screen.getAllByText('Edit');
    fireEvent.click(editBtns[1]);

    const input = screen.getByLabelText('Edit username');
    fireEvent.change(input, { target: { value: 'taken' } });

    act(() => {
      vi.advanceTimersByTime(600);
    });
    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByText('✗ Username is already taken')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeDisabled();
    });
  });

});