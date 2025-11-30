import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RecommendedArticles from '../components/RecommendedArticles';
import * as hooks from '../hooks/useRecommendations';
import recommendationService from '../services/recommendations';

// --- MOCKS ---

// 1. Mock Custom Hooks
vi.mock('../hooks/useRecommendations', () => ({
  useSimilarArticles: vi.fn(),
  useArticleTracking: vi.fn(),
}));

// 2. Mock Recommendation Service (for tracking)
vi.mock('../services/recommendations', () => ({
  default: {
    trackClick: vi.fn(),
  },
}));

// 3. Mock Child Component (NewsCard)
vi.mock('../components/NewsCard', () => ({
  default: ({ article }) => (
    <div data-testid="news-card">
      {article.title}
    </div>
  ),
}));

describe('RecommendedArticles Component', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default Mocks: No Op for tracking hook
    hooks.useArticleTracking.mockReturnValue({ trackClick: vi.fn() });
    
    // Default Mocks: Success state for data
    hooks.useSimilarArticles.mockReturnValue({
      recommendations: [
        { id: '1', title: 'Rec 1' },
        { id: '2', title: 'Rec 2' },
      ],
      loading: false,
      error: null,
    });
  });

  // --- 1. CONDITIONAL RENDERING TESTS ---

  it('returns NULL if currentArticleId is missing', () => {
    const { container } = render(<RecommendedArticles currentArticleId={null} userId="u1" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders LOADING state (Skeleton UI)', () => {
    hooks.useSimilarArticles.mockReturnValue({
      recommendations: [],
      loading: true,
      error: null,
    });

    const { container } = render(<RecommendedArticles currentArticleId="123" userId="u1" />);
    
    // Check for the loading container class
    expect(container.querySelector('.recommended-section')).toBeInTheDocument();
    // Check for skeleton pulse animation
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('returns NULL if Error occurs', () => {
    hooks.useSimilarArticles.mockReturnValue({
      recommendations: [],
      loading: false,
      error: new Error('Failed'),
    });

    const { container } = render(<RecommendedArticles currentArticleId="123" userId="u1" />);
    expect(container.firstChild).toBeNull();
  });

  it('returns NULL if Recommendations are empty', () => {
    hooks.useSimilarArticles.mockReturnValue({
      recommendations: [],
      loading: false,
      error: null,
    });

    const { container } = render(<RecommendedArticles currentArticleId="123" userId="u1" />);
    expect(container.firstChild).toBeNull();
  });

  // --- 2. SUCCESS RENDERING TESTS ---

  it('renders list of recommendations with default title', () => {
    render(<RecommendedArticles currentArticleId="123" userId="u1" />);

    // Check Title
    expect(screen.getByText('You May Also Like')).toBeInTheDocument();
    
    // Check Articles (via mock)
    expect(screen.getByText('Rec 1')).toBeInTheDocument();
    expect(screen.getByText('Rec 2')).toBeInTheDocument();
    
    // Verify Hook call
    expect(hooks.useSimilarArticles).toHaveBeenCalledWith('123', 6);
  });

  it('renders with custom title', () => {
    render(<RecommendedArticles currentArticleId="123" userId="u1" title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  // --- 3. INTERACTION TESTS ---

  it('handles Article Click (Tracking)', async () => {
    // Spy on the service function directly
    const trackSpy = vi.spyOn(recommendationService, 'trackClick');
    trackSpy.mockResolvedValue(true);

    render(<RecommendedArticles currentArticleId="123" userId="user-555" />);

    // Find the first article wrapper (the div with onClick)
    // Since our mock NewsCard renders text "Rec 1", we can find by text and get parent
    const card = screen.getByText('Rec 1');
    
    // The onClick is on the parent div of NewsCard
    fireEvent.click(card.parentElement);

    // Verify service call parameters
    expect(trackSpy).toHaveBeenCalledWith(
      '1', // article id
      'user-555', // user id
      'recommended_section',
      'content'
    );
  });

});
