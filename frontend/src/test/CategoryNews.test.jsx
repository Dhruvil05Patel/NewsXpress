import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import CategoryNews from '../components/CategoryNews';

// --- MOCKS ---
// Mock child components to focus on CategoryNews logic
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

const mockCategoryData = {
  summarizedNews: [
    { id: '1', title: 'Tech News 1', category: 'technology' },
    { id: '2', title: 'Tech News 2', category: 'technology' },
  ],
};

describe('CategoryNews Component', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCategoryData),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- 1. RENDERING TESTS ---

  it('renders loading state with correct title', () => {
    const { container } = render(<CategoryNews category="technology" title="Technology News" />);
    // Component uses skeleton loaders; assert skeleton present
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders correct header title and subtitle', async () => {
    render(
      <CategoryNews
        category="technology"
        title="Technology"
        subtitle="Latest tech updates"
      />
    );

    await waitFor(() => {
      expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
    });

    expect(screen.getByRole('heading', { name: 'Technology' })).toBeInTheDocument();
    expect(screen.getByText('Latest tech updates')).toBeInTheDocument();
  });

  // --- 2. DATA FETCHING TESTS ---

  it('fetches data for the specific category', async () => {
    render(<CategoryNews category="sports" title="Sports" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/get-summarized-news/sports')
      );
    });
  });

  it('renders news cards on successful fetch', async () => {
    render(<CategoryNews category="technology" title="Tech" />);

    await waitFor(() => {
      expect(screen.getAllByTestId('news-card')).toHaveLength(2);
      expect(screen.getByText('Tech News 1')).toBeInTheDocument();
    });
  });

  it('handles Empty State (No News)', async () => {
    // Mock empty response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ summarizedNews: [] }),
      })
    );

    render(<CategoryNews category="science" title="Science" />);

    await waitFor(() => {
      expect(screen.getByText(/No matching science headlines\./i)).toBeInTheDocument();
    });
  });

  // --- 3. ERROR HANDLING ---

  it('handles API Error gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('API Failed')));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(<CategoryNews category="health" title="Health" />);

    await waitFor(() => {
      // Should fallback to empty state
      expect(screen.getByText(/No matching health headlines\./i)).toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });

  it('handles HTTP error response', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      ok: false,
      status: 500,
    }));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(<CategoryNews category="tech" title="Tech" />);

    await waitFor(() => {
      expect(screen.getByText(/No matching tech headlines\./i)).toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });

  it('handles malformed API response', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ summarizedNews: 'not-an-array' }),
    }));

    render(<CategoryNews category="tech" title="Tech" />);

    await waitFor(() => {
      expect(screen.getByText(/No matching tech headlines\./i)).toBeInTheDocument();
    });
  });

  // --- 4. INTERACTION TESTS ---

  it('opens ReelView when a card is clicked', async () => {
    render(<CategoryNews category="technology" title="Tech" />);

    await waitFor(() => screen.getAllByTestId('news-card'));

    // Click first card
    fireEvent.click(screen.getAllByTestId('news-card')[0]);

    expect(screen.getByTestId('reel-view')).toBeInTheDocument();
  });

  it('closes ReelView', async () => {
    render(<CategoryNews category="technology" title="Tech" />);
    await waitFor(() => screen.getAllByTestId('news-card'));

    // Open Reel
    fireEvent.click(screen.getAllByTestId('news-card')[0]);

    // Close Reel
    fireEvent.click(screen.getByTestId('close-reel'));

    expect(screen.queryByTestId('reel-view')).not.toBeInTheDocument();
  });

  it('opens ReelView with filtered results when search is active', async () => {
    render(<CategoryNews category="tech" title="Tech" searchQuery="Tech News 1" />);

    await waitFor(() => screen.getAllByTestId('news-card'));

    const cards = screen.getAllByTestId('news-card');
    fireEvent.click(cards[0]);

    expect(screen.getByTestId('reel-view')).toBeInTheDocument();
  });

  // --- 5. GUEST VS USER TESTS ---

  it('limits cards for guest users (mocking >6 items)', async () => {
    // Create mock data with 10 items
    const largeData = {
      summarizedNews: Array.from({ length: 10 }, (_, i) => ({ id: i, title: `News ${i}` }))
    };
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(largeData) }));

    render(<CategoryNews category="tech" title="Tech" userProfile={null} />);

    await waitFor(() => {
      // Should only show 6
      expect(screen.getAllByTestId('news-card')).toHaveLength(6);
      // Should show "View More" button
      expect(screen.getByText('View More')).toBeInTheDocument();
    });
  });

  it('shows all cards for logged-in users', async () => {
    const largeData = {
      summarizedNews: Array.from({ length: 10 }, (_, i) => ({ id: i, title: `News ${i}` }))
    };
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(largeData) }));

    render(<CategoryNews category="tech" title="Tech" userProfile={{ name: 'User' }} />);

    await waitFor(() => {
      // Should show ALL 10
      expect(screen.getAllByTestId('news-card')).toHaveLength(10);
      // Should NOT show "View More" button
      expect(screen.queryByText('View More')).not.toBeInTheDocument();
    });
  });

  it('calls onLoginClick when View More is clicked', async () => {
    const largeData = {
      summarizedNews: Array.from({ length: 10 }, (_, i) => ({ id: i, title: `News ${i}` }))
    };
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(largeData) }));

    const mockLoginClick = vi.fn();
    render(<CategoryNews category="tech" title="Tech" userProfile={null} onLoginClick={mockLoginClick} />);

    await waitFor(() => screen.getByText('View More'));

    fireEvent.click(screen.getByText('View More'));
    expect(mockLoginClick).toHaveBeenCalled();
  });

  // --- 6. NORMALIZATION & SEARCH ---

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

    render(<CategoryNews category="tech" title="Tech" />);

    await waitFor(() => {
      expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
    });

    const cards = screen.getAllByTestId('news-card');
    expect(cards).toHaveLength(2);

    // Check first card normalization
    const card1 = cards[0];
    expect(within(card1).getByTestId('card-source')).toHaveTextContent('String Source');
    expect(within(card1).getByTestId('card-time')).not.toBeEmptyDOMElement();

    // Check second card normalization
    const card2 = cards[1];
    expect(within(card2).getByTestId('card-source')).toHaveTextContent('Object Source');
    expect(within(card2).getByTestId('card-time')).toHaveTextContent('Recently');
  });

  it('filters news based on search query', async () => {
    render(<CategoryNews category="tech" title="Tech" searchQuery="Tech News 1" />);

    await waitFor(() => {
      expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
    });

    const cards = screen.getAllByTestId('news-card');
    expect(cards).toHaveLength(1);
    expect(within(cards[0]).getByTestId('card-title')).toHaveTextContent('Tech News 1');
  });

  it('filters news based on summary match', async () => {
    // Mock data needs summaries for this test
    const dataWithSummary = {
      summarizedNews: [
        { id: '1', title: 'Title A', summary: 'Summary Match' },
        { id: '2', title: 'Title B', summary: 'Other' },
      ],
    };
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(dataWithSummary) }));

    render(<CategoryNews category="tech" title="Tech" searchQuery="Match" />);

    await waitFor(() => {
      expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
    });

    const cards = screen.getAllByTestId('news-card');
    expect(cards).toHaveLength(1);
    expect(within(cards[0]).getByTestId('card-title')).toHaveTextContent('Title A');
  });

});