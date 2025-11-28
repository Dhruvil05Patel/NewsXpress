import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SmartRecommendations from '../components/SmartRecommendations';
import * as interactionTimerHook from '../hooks/useInteractionTimer';

// --- MOCKS ---

// 1. Mock Custom Hook
vi.mock('../hooks/useInteractionTimer', () => ({
  useSmartRecommendations: vi.fn(),
}));

// 2. Mock Child Components
vi.mock('../components/NewsCard', () => ({
  default: ({ title }) => <div data-testid="news-card">{title}</div>,
}));

// 3. Mock Icons (Lucide)
vi.mock('lucide-react', () => ({
  BarChart3: () => <span data-testid="chart-icon">Chart</span>,
  Clock: () => <span>Clock</span>,
  BookOpen: () => <span>Book</span>,
}));

describe('SmartRecommendations Component', () => {
  const mockRefetch = vi.fn();
  const mockOnArticleClick = vi.fn();

  // Helper to set hook return value easily
  const setHookReturn = (overrides = {}) => {
    interactionTimerHook.useSmartRecommendations.mockReturnValue({
      recommendations: [],
      loading: false,
      error: null,
      analysis: null,
      refetch: mockRefetch,
      ...overrides,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setHookReturn(); // Default state
  });

  // --- 1. BASIC RENDERING TESTS ---

  it('returns NULL if userId is missing', () => {
    const { container } = render(<SmartRecommendations userId={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Loading state correctly', () => {
    setHookReturn({ loading: true });
    const { container } = render(<SmartRecommendations userId="u1" />);
    // The loading state renders skeleton placeholders (shimmer) but does NOT render the title text.
    // Check for skeleton pulse instead of title to match current component behavior.
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders Error/Empty state correctly', () => {
    setHookReturn({ error: new Error('Fail'), recommendations: [] });
    render(<SmartRecommendations userId="u1" />);

    expect(screen.getByText('Keep Reading to Get Personalized Recommendations')).toBeInTheDocument();
    expect(screen.getByText(/Read at least 5 articles/)).toBeInTheDocument();
  });

  it('renders Recommendations list on success', () => {
    setHookReturn({
      recommendations: [
        { id: '1', title: 'Rec 1', category: 'Tech' },
        { id: '2', title: 'Rec 2', category: 'Sports' },
      ],
      loading: false,
    });

    render(<SmartRecommendations userId="u1" />);

    expect(screen.getAllByTestId('news-card')).toHaveLength(2);
    expect(screen.getByText('Rec 1')).toBeInTheDocument();
    expect(screen.getByText('Showing 2 personalized articles')).toBeInTheDocument();
  });

  // --- 2. INTERACTION TESTS ---

  it('handles Refresh button click', async () => {
    setHookReturn({
      recommendations: [{ id: '1', title: 'Rec 1' }],
      loading: false,
    });

    render(<SmartRecommendations userId="u1" />);

    const refreshBtn = screen.getByText('Refresh');
    fireEvent.click(refreshBtn);

    expect(mockRefetch).toHaveBeenCalled();
    // Note: We can't easily test setLastUpdated as it's internal state, 
    // but calling refetch implies the flow works.
  });

  it('handles Analytics Toggle button', () => {
    setHookReturn({
      recommendations: [{ id: '1', title: 'Rec 1' }],
      analysis: { total_interaction_count: 5 }, // Analysis must exist to show button
    });

    render(<SmartRecommendations userId="u1" />);

    const analyticsBtn = screen.getByText('Analytics');

    // Initially analysis panel should be hidden
    expect(screen.queryByText('Your Reading Preferences')).not.toBeInTheDocument();

    // Click to Show
    fireEvent.click(analyticsBtn);
    expect(screen.getByText('Your Reading Preferences')).toBeInTheDocument();

    // Click to Hide
    fireEvent.click(analyticsBtn);
    expect(screen.queryByText('Your Reading Preferences')).not.toBeInTheDocument();
  });

  it('handles Article Click', () => {
    setHookReturn({
      recommendations: [{ id: '1', title: 'Rec 1', category: 'Tech' }],
    });

    render(<SmartRecommendations userId="u1" onArticleClick={mockOnArticleClick} />);

    const cardWrapper = screen.getByTestId('news-card').parentElement;
    fireEvent.click(cardWrapper);

    // Verify callback
    expect(mockOnArticleClick).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Rec 1', category: 'Tech' })
      ]),
      0 // Index
    );
  });

  // --- 3. ANALYTICS RENDERING & FORMATTING ---

  it('renders Analytics Data correctly', () => {
    setHookReturn({
      recommendations: [{ id: '1', title: 'Rec 1' }],
      analysis: {
        total_interaction_count: 10,
        total_time_spent_seconds: 3665, // 1h 1m 5s
        top_categories: [
          { category: 'Tech', article_count: 5, total_time_seconds: 300 },
          { category: 'Sports', article_count: 3, total_time_seconds: 65 },
        ]
      }
    });

    render(<SmartRecommendations userId="u1" />);

    // Open Analytics
    fireEvent.click(screen.getByText('Analytics'));

    // Check Categories
    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.getByText('Sports')).toBeInTheDocument();

    // Check Time Formatting (tests formatSeconds helper)
    expect(screen.getByText('1h 1m')).toBeInTheDocument(); // Total time
    expect(screen.getByText('1m 5s')).toBeInTheDocument();    // Sports (65s)
    expect(screen.getByText('5m 0s')).toBeInTheDocument();    // Tech (300s)
  });

  it('renders 0s for empty time analysis', () => {
    setHookReturn({
      recommendations: [{ id: '1', title: 'Rec 1' }],
      analysis: {
        total_interaction_count: 0,
        total_time_spent_seconds: 0,
        top_categories: []
      }
    });

    render(<SmartRecommendations userId="u1" />);
    fireEvent.click(screen.getByText('Analytics'));

    // Check specific zero stats
    // We look for text "0s" but scoped, or check the average calculation
    const avgTime = screen.getAllByText('0s');
    expect(avgTime.length).toBeGreaterThan(0);
  });

  it('handles singular/plural text correctly', () => {
    setHookReturn({
      recommendations: [{ id: '1', title: 'Rec 1' }],
      analysis: {
        top_categories: [{ category: 'Tech', article_count: 1, total_time_seconds: 60 }]
      }
    });

    render(<SmartRecommendations userId="u1" />);

    // Check "1 personalized article" (singular)
    expect(screen.getByText('Showing 1 personalized article')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Analytics'));
    // Check "1 article" in category stats
    expect(screen.getByText('1 article')).toBeInTheDocument();
  });

  it('normalizes article data correctly on click', () => {
    const rawArticle = {
      id: '1',
      title: 'Raw Title',
      summary: 'Raw Summary',
      image_url: 'http://img.com',
      original_url: 'http://orig.com', // url missing, use original_url
      // source missing -> default
      published_at: '2025-01-01T12:00:00Z',
      topic: 'Science' // category missing, use topic
    };

    setHookReturn({
      recommendations: [rawArticle],
    });

    render(<SmartRecommendations userId="u1" onArticleClick={mockOnArticleClick} />);

    const cardWrapper = screen.getByTestId('news-card').parentElement;
    fireEvent.click(cardWrapper);

    expect(mockOnArticleClick).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          newsUrl: 'http://orig.com',
          source: 'NewsXpress',
          category: 'Science',
          timestamp: expect.stringContaining('1/1/2025') // Depends on locale, but check partial match
        })
      ]),
      0
    );
  });

  it('formats seconds correctly (edge cases)', () => {
    // Test via UI rendering of analysis panel
    setHookReturn({
      recommendations: [{ id: '1', title: 'Rec 1' }],
      analysis: {
        total_interaction_count: 1,
        total_time_spent_seconds: 59, // < 1m -> 59s
        top_categories: [
          { category: 'A', article_count: 1, total_time_seconds: -10 }, // Negative -> 0s
          { category: 'B', article_count: 1, total_time_seconds: 3661 }, // > 1h -> 1h 1m
        ]
      }
    });

    render(<SmartRecommendations userId="u1" />);
    fireEvent.click(screen.getByText('Analytics'));

    // The component displays TOTAL time spent (59s) and AVG time (59 / 1 = 59s)
    // Since there are multiple '59s' (Total and Avg), we use getAllByText
    const times = screen.getAllByText('59s');
    expect(times.length).toBeGreaterThan(0);

    expect(screen.getByText('0s')).toBeInTheDocument(); // Negative handled
    expect(screen.getByText('1h 1m')).toBeInTheDocument();
  });

});