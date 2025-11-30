import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PersonalizedFeed from '../components/PersonalizedFeed';
import * as hooks from '../hooks/useRecommendations'; // Adjust path if needed

// --- MOCKS ---

// 1. Mock the Custom Hook
vi.mock('../hooks/useRecommendations', () => ({
  usePersonalizedRecommendations: vi.fn(),
}));

// 2. Mock Services
vi.mock('../services/recommendations', () => ({
  default: {
    trackClick: vi.fn(),
  },
}));

// 3. Mock Child Components
// We mock SmartRecommendations to simulate clicking an article
vi.mock('../components/SmartRecommendations', () => ({
  default: ({ title, onArticleClick }) => (
    <div data-testid="smart-recs">
      <h1>{title}</h1>
      <button 
        onClick={() => onArticleClick([{ title: 'News 1' }], 0)}
        data-testid="open-reel-btn"
      >
        Open Reel
      </button>
    </div>
  ),
}));

// We mock ReelView to simulate closing it
vi.mock('../components/ReelView', () => ({
  default: ({ onClose, news }) => (
    <div data-testid="reel-view">
      <span>Showing {news.length} articles</span>
      <button onClick={onClose} data-testid="close-reel-btn">Close</button>
    </div>
  ),
}));

describe('PersonalizedFeed Component', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Default hook return
    hooks.usePersonalizedRecommendations.mockReturnValue({
      recommendations: [],
      loading: false,
      error: null
    });
  });

  // --- 1. GUEST USER TESTS ---

  it('renders "Sign in" message if userId is missing', () => {
    render(<PersonalizedFeed userId={null} />);

    expect(screen.getByText('Recommended For You')).toBeInTheDocument();
    expect(screen.getByText(/Please sign in/i)).toBeInTheDocument();
    
    // SmartRecommendations should NOT be rendered
    expect(screen.queryByTestId('smart-recs')).not.toBeInTheDocument();
  });

  // --- 2. LOGGED IN USER TESTS ---

  it('renders SmartRecommendations if userId is provided', () => {
    render(<PersonalizedFeed userId="user-123" />);

    // Check for the mock component
    expect(screen.getByTestId('smart-recs')).toBeInTheDocument();
    
    // Verify the hook was called with correct params
    expect(hooks.usePersonalizedRecommendations).toHaveBeenCalledWith('user-123', 10, 'hybrid');
  });

  it('passes custom props (method, topN) to the hook', () => {
    render(<PersonalizedFeed userId="user-123" method="collaborative" topN={20} />);

    expect(hooks.usePersonalizedRecommendations).toHaveBeenCalledWith('user-123', 20, 'collaborative');
  });

  // --- 3. REEL VIEW INTERACTION TESTS ---

  it('opens ReelView when an article is clicked in SmartRecommendations', () => {
    render(<PersonalizedFeed userId="user-123" />);

    // ReelView should be hidden initially
    expect(screen.queryByTestId('reel-view')).not.toBeInTheDocument();

    // Click the button in our mocked SmartRecommendations
    fireEvent.click(screen.getByTestId('open-reel-btn'));

    // ReelView should now appear
    expect(screen.getByTestId('reel-view')).toBeInTheDocument();
    expect(screen.getByText('Showing 1 articles')).toBeInTheDocument();
  });

  it('closes ReelView when close button is clicked', () => {
    render(<PersonalizedFeed userId="user-123" />);

    // Open it first
    fireEvent.click(screen.getByTestId('open-reel-btn'));
    expect(screen.getByTestId('reel-view')).toBeInTheDocument();

    // Click Close
    fireEvent.click(screen.getByTestId('close-reel-btn'));

    // Should disappear
    expect(screen.queryByTestId('reel-view')).not.toBeInTheDocument();
  });

});