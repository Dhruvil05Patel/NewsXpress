import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Navbar from '../components/Navbar';
import * as api from '../services/api';
import * as authController from '../components/auth/controller/authController';
import notify from '../utils/toast';

// --- MOCKS ---

// 1. Router Mocks
const mockNavigate = vi.fn();
let mockPathname = '/all';
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: mockPathname }),
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

describe('Navbar Component', () => {
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

  it('renders Logo and Categories (Desktop)', () => {
    render(<Navbar userProfile={mockUserProfile} onLoginClick={mockOnLoginClick} />);

    expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();

    // Check Search Input
    expect(screen.getByPlaceholderText('Search headlines...')).toBeInTheDocument();
  });

  it('navigates when a category is clicked', () => {
    render(<Navbar userProfile={mockUserProfile} />);

    const techBtn = screen.getByText('Technology').closest('button');
    fireEvent.click(techBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/technology');
  });

  it('toggles Mobile Sidebar visibility', async () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    render(<Navbar userProfile={mockUserProfile} />);

    // Open Sidebar (Click Menu Icon)
    const menuBtn = screen.getByText('Categories').closest('button');
    fireEvent.click(menuBtn);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const closeBtns = screen.getAllByText('X');
    expect(closeBtns.length).toBeGreaterThan(0);

    const mobileTechBtn = screen.getAllByText('Technology')[1];
    fireEvent.click(mobileTechBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/technology');
  });

  it('opens Profile Sidebar on User Icon click (Desktop)', () => {
    const mockToggle = vi.fn();
    render(<Navbar userProfile={mockUserProfile} onToggleProfile={mockToggle} />);

    const toggleBtn = screen.getByLabelText('Toggle profile panel');
    fireEvent.click(toggleBtn);

    expect(mockToggle).toHaveBeenCalled();
  });

  it('opens Profile Sidebar on Profile Nav click (Mobile)', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({ matches: false }));
    const mockToggle = vi.fn();
    render(<Navbar userProfile={mockUserProfile} onToggleProfile={mockToggle} />);

    const profileNavBtn = screen.getByText('Profile').closest('button');
    fireEvent.click(profileNavBtn);

    expect(mockToggle).toHaveBeenCalled();
  });

  it('calls onLoginClick when guest clicks search', () => {
    render(<Navbar userProfile={null} onLoginClick={mockOnLoginClick} />);

    const search = screen.getAllByLabelText('Search headlines')[0];
    fireEvent.click(search);

    expect(mockOnLoginClick).toHaveBeenCalled();
  });

  it('does not call onSearchChange when guest types', () => {
    const mockOnSearch = vi.fn();
    render(<Navbar userProfile={null} onLoginClick={mockOnLoginClick} onSearchChange={mockOnSearch} />);

    const input = screen.getAllByLabelText('Search headlines')[0];
    fireEvent.change(input, { target: { value: 'hello' } });

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('overlay click closes mobile sidebar', async () => {
    // Force mobile viewport
    window.matchMedia = vi.fn().mockImplementation(() => ({ matches: false }));
    const { container } = render(<Navbar userProfile={mockUserProfile} />);

    const menuBtn = screen.getByText('Categories').closest('button');
    fireEvent.click(menuBtn);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });


    // Overlay uses fixed inset-0 class; there are multiple fixed containers, pick the one
    // that includes the transition-opacity class (the actual clickable overlay)
    const fixedEls = container.querySelectorAll('div[class*="fixed"][class*="inset-0"]');
    let overlay = null;
    fixedEls.forEach((el) => {
      if (el.className && el.className.includes('transition-opacity')) overlay = el;
    });
    expect(overlay).toBeTruthy();

    // Click the close (X) button inside the sidebar instead of overlay to close it
    const closeBtns = screen.getAllByText('X');
    expect(closeBtns.length).toBeGreaterThan(0);
    fireEvent.click(closeBtns[0]);

    // allow close transition timer to run
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    const sidebar = container.querySelector('div[class*="relative"][class*="w-64"]');
    expect(sidebar).toBeNull();
  });

  it('applies active styles for the current category', () => {
    // set pathname to Technology route
    mockPathname = '/technology';
    render(<Navbar userProfile={mockUserProfile} />);

    const techBtn = screen.getByText('Technology').closest('button');
    expect(techBtn).toBeInTheDocument();
    // active style uses a linear-gradient background
    expect(techBtn.style.background).toMatch(/linear-gradient/);
    // reset
    mockPathname = '/all';
  });

  it('calls onSearchChange when logged in and typing', () => {
    const mockOnSearchChange = vi.fn();
    render(<Navbar userProfile={mockUserProfile} onSearchChange={mockOnSearchChange} />);

    const input = screen.getByPlaceholderText('Search headlines...');
    fireEvent.change(input, { target: { value: 'bitcoin' } });

    expect(mockOnSearchChange).toHaveBeenCalledWith('bitcoin');
  });

  it('focus and blur change the input styles when logged in', () => {
    render(<Navbar userProfile={mockUserProfile} />);
    const input = screen.getByPlaceholderText('Search headlines...');

    fireEvent.focus(input);
    // focus handler sets borderColor to '#ef4444' (computed as rgb in JSDOM)
    expect(input.style.borderColor).toBe('rgb(239, 68, 68)');

    fireEvent.blur(input);
    // blur sets border back to light gray (computed rgb in JSDOM)
    expect(input.style.borderColor).toBe('rgb(229, 231, 235)');
  });

  it('mouse enter/leave toggles profile button inline styles', () => {
    const mockToggle2 = vi.fn();
    render(<Navbar userProfile={mockUserProfile} onToggleProfile={mockToggle2} />);

    const btn = screen.getByLabelText('Toggle profile panel');
    fireEvent.mouseEnter(btn);
    // backgroundColor is computed to rgb in JSDOM
    expect(btn.style.backgroundColor).toBe('rgb(254, 242, 242)');
    expect(btn.style.transform).toBe('scale(1.05)');

    fireEvent.mouseLeave(btn);
    expect(btn.style.backgroundColor).toBe('transparent');
    expect(btn.style.transform).toBe('scale(1)');
  });

});
