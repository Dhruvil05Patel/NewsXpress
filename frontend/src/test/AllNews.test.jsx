import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// ADJUSTED IMPORT: pointing to the correct component location
import AllNews from '../components/AllNews';
import notify from '../utils/toast';

// --- 1. Mock Child Components ---
// CRITICAL FIX: The paths here must point to where the REAL components are.
// Since this test is in 'src/test/', we go up one level (..) then into 'components'.
vi.mock('../components/NewsCard', () => ({
  default: ({ title, onCardClick }) => (
    <div data-testid="news-card" onClick={onCardClick}>
      {title}
    </div>
  ),
}));

vi.mock('../components/ReelView', () => ({
  default: ({ onClose }) => (
    <div data-testid="reel-view">
      <button data-testid="close-reel" onClick={onClose}>Close</button>
    </div>
  ),
}));

// --- 2. Mock External Utilities ---
vi.mock('../utils/toast', () => ({
  default: {
    info: vi.fn(),
  },
}));

// --- 3. Test Data ---
const mockNewsData = {
  summarizedNews: Array.from({ length: 10 }, (_, i) => ({
    id: `id-${i}`,
    title: `News Title ${i}`,
    summary: `Summary ${i}`,
    original_url: `http://example.com/${i}`,
    published_at: '2025-10-12T10:00:00Z',
    source: { name: 'CNN' },
    category: 'Tech',
  })),
};

describe('AllNews Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch to return our data
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockNewsData),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Test 1: Initial Loading State ---
  it('renders loading state initially', () => {
    const { container } = render(<AllNews userProfile={null} />);
    // Component uses skeleton loaders; assert skeleton present
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  // --- Test 2: Successful Fetch & Rendering (Guest User) ---
  it('renders news cards and limits to 6 for guest users', async () => {
    render(<AllNews userProfile={null} />);

    // 1. Wait for loading to disappear
    await waitFor(() => {
      expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
    });

    // Debug: If this fails, print what IS on the screen
    // screen.debug(); 

    // 2. Check if we hit the "No news" state by mistake
    const noNews = screen.queryByText(/No matching headlines/i);
    if (noNews) {
      console.error("TEST FAILURE DEBUG: Component rendered 'No news available'. Fetch might have failed.");
    }
    expect(noNews).not.toBeInTheDocument();

    // 3. Check for cards
    const cards = screen.getAllByTestId('news-card');
    expect(cards).toHaveLength(6);
    expect(cards[0]).toHaveTextContent('News Title 0');
  });

  // --- Test 3: View More Button Logic (Guest User) ---
  it('shows "View More" button for guests and handles click', async () => {
    const onLoginClickMock = vi.fn();
    render(<AllNews userProfile={null} onLoginClick={onLoginClickMock} />);

    await waitFor(() => screen.getByText('View More'));

    const viewMoreBtn = screen.getByText('View More');
    expect(viewMoreBtn).toBeInTheDocument();

    fireEvent.click(viewMoreBtn);

    expect(notify.info).toHaveBeenCalledWith(expect.stringContaining('Please login'));
    expect(onLoginClickMock).toHaveBeenCalled();
  });

  // --- Test 4: Authenticated User View ---
  it('renders ALL news cards for logged-in users', async () => {
    const userProfile = { name: 'Test User' };
    render(<AllNews userProfile={userProfile} />);

    await waitFor(() => {
      expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
    });

    const cards = screen.getAllByTestId('news-card');
    // Should show all 10 items
    expect(cards).toHaveLength(10);
    expect(screen.queryByText('View More')).not.toBeInTheDocument();
  });

  // --- Test 5: ReelView Interaction ---
  it('opens ReelView when a card is clicked and closes it', async () => {
    render(<AllNews userProfile={{ name: 'User' }} />);

    await waitFor(() => screen.getAllByTestId('news-card'));

    // Verify ReelView is hidden initially
    expect(screen.queryByTestId('reel-view')).not.toBeInTheDocument();

    // Click the first news card
    const cards = screen.getAllByTestId('news-card');
    fireEvent.click(cards[0]);

    // Verify ReelView appears
    expect(screen.getByTestId('reel-view')).toBeInTheDocument();

    // Click the close button inside the mock ReelView
    const closeBtn = screen.getByTestId('close-reel');
    fireEvent.click(closeBtn);

    // Verify ReelView is gone
    expect(screen.queryByTestId('reel-view')).not.toBeInTheDocument();
  });

  // --- Test 6: API Error Handling ---
  it('handles API fetch failure gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network Error')));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<AllNews userProfile={null} />);

    await waitFor(() => {
      expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
    });

    expect(screen.getByText('No matching headlines')).toBeInTheDocument();
  });
});