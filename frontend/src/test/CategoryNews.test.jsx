import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoryNews from '../components/CategoryNews';

// --- MOCKS ---
// Mock child components to focus on CategoryNews logic
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
    render(<CategoryNews category="technology" title="Technology News" />);
    // It should use the title prop in the loading message
    expect(screen.getByText(/Loading Technology News.../i)).toBeInTheDocument();
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
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Technology', level: 1 })).toBeInTheDocument();
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
      expect(screen.getByText(/No science news available/i)).toBeInTheDocument();
    });
  });

  // --- 3. ERROR HANDLING ---

  it('handles API Error gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('API Failed')));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<CategoryNews category="health" title="Health" />);

    await waitFor(() => {
      // Should fallback to empty state
      expect(screen.getByText(/No health news available/i)).toBeInTheDocument();
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

});