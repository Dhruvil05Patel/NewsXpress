import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import AllNews from '../components/AllNews';
import notify from '../utils/toast';

// --- 1. Mock Child Components ---
vi.mock('../components/NewsCard', () => ({
  default: (props) => (
    <div data-testid="news-card" onClick={props.onCardClick}>
      <span data-testid="card-title">{props.title}</span>
      <span data-testid="card-source">{props.source}</span>
      <span data-testid="card-time">{props.timestamp}</span>
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

    // 2. Check if we hit the "No news" state by mistake
    const noNews = screen.queryByText(/No matching headlines/i);
    expect(noNews).not.toBeInTheDocument();

    // 3. Check for cards
    const cards = screen.getAllByTestId('news-card');
    expect(cards).toHaveLength(6);
    expect(within(cards[0]).getByTestId('card-title')).toHaveTextContent('News Title 0');
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

  it('opens ReelView with filtered results when search is active', async () => {
    render(<AllNews userProfile={{ name: 'User' }} searchQuery="Title 5" />);

    await waitFor(() => screen.getAllByTestId('news-card'));

    const cards = screen.getAllByTestId('news-card');
    fireEvent.click(cards[0]);

    expect(screen.getByTestId('reel-view')).toBeInTheDocument();
  });

  // --- Test 6: API Error Handling ---
  it('handles API fetch failure gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network Error')));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(<AllNews userProfile={null} />);

    await waitFor(() => {
      expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
    });

    expect(screen.getByText('No matching headlines')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('handles HTTP error response', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      ok: false,
      status: 500,
    }));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(<AllNews userProfile={null} />);

    await waitFor(() => {
      expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
    });

    expect(screen.getByText('No matching headlines')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('handles malformed API response', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ summarizedNews: 'not-an-array' }),
    }));

    render(<AllNews userProfile={null} />);

    await waitFor(() => {
      expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
    });

    expect(screen.getByText('No matching headlines')).toBeInTheDocument();
  });

  // --- Test 7: Data Normalization ---
  it('normalizes imperfect data correctly', async () => {
    const imperfectData = {
      summarizedNews: [
        {
          // Missing id, title only
          title: 'Fallback ID Title',
          // Missing summary, use content_text
          content_text: 'Content Text Summary',
          // Missing imageUrl, use thumbnail
          thumbnail: 'http://thumb.jpg',
          // Missing newsUrl, use link
          link: 'http://link.com',
          // Source is string
          source: 'String Source',
          // Missing timestamp, use published_at
          published_at: '2025-01-01T12:00:00Z',
          // Missing category, use topic
          topic: 'Topic Category'
        },
        {
          // Minimal data
          title: 'Minimal',
          source: { name: 'Object Source' },
          // No timestamp or published_at -> "Recently"
        }
      ]
    };

    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(imperfectData),
    }));

    render(<AllNews userProfile={{ name: 'User' }} />);

    await waitFor(() => {
      expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
    });

    const cards = screen.getAllByTestId('news-card');
    expect(cards).toHaveLength(2);

    // Check first card normalization
    const card1 = cards[0];
    expect(within(card1).getByTestId('card-source')).toHaveTextContent('String Source');
    // timestamp formatting depends on locale, just check it exists
    expect(within(card1).getByTestId('card-time')).not.toBeEmptyDOMElement();

    // Check second card normalization
    const card2 = cards[1];
    expect(within(card2).getByTestId('card-source')).toHaveTextContent('Object Source');
    expect(within(card2).getByTestId('card-time')).toHaveTextContent('Recently');
  });

  // --- Test 8: Search Filtering ---
  it('filters news based on search query', async () => {
    render(<AllNews userProfile={{ name: 'User' }} searchQuery="Title 5" />);

    await waitFor(() => {
      expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
    });

    const cards = screen.getAllByTestId('news-card');
    expect(cards).toHaveLength(1);
    expect(within(cards[0]).getByTestId('card-title')).toHaveTextContent('News Title 5');
  });

  it('filters news based on summary match', async () => {
    render(<AllNews userProfile={{ name: 'User' }} searchQuery="Summary 3" />);

    await waitFor(() => {
      expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
    });

    const cards = screen.getAllByTestId('news-card');
    expect(cards).toHaveLength(1);
    expect(within(cards[0]).getByTestId('card-title')).toHaveTextContent('News Title 3');
  });

  it('shows no results message when search yields no matches', async () => {
    render(<AllNews userProfile={{ name: 'User' }} searchQuery="Nonexistent" />);

    await waitFor(() => {
      expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
    });

    expect(screen.getByText('No matching headlines')).toBeInTheDocument();
  });
});