import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NewsCard from '../components/NewsCard';
import * as badImageCache from '../utils/badImageCache'; // Adjust path if needed

// --- MOCKS ---

// 1. Mock the bad image cache utility
vi.mock('../utils/badImageCache', () => ({
  isBadImage: vi.fn(),
  markBadImage: vi.fn(),
}));

// 2. Mock the Default Image import
vi.mock('../components/Default.png', () => ({
  default: 'default-image-stub',
}));

// 3. Mock Lucide Icons
vi.mock('lucide-react', () => ({
  SquareArrowOutUpRight: () => <span data-testid="icon-arrow">Arrow</span>,
}));

describe('NewsCard Component', () => {
  const mockOnCardClick = vi.fn();
  
  const defaultProps = {
    title: 'Test Title',
    summary: 'Test Summary',
    imageUrl: 'http://valid-image.com/pic.jpg',
    newsUrl: 'http://news.com',
    source: 'CNN',
    timestamp: '2 hours ago',
    category: 'Tech',
    onCardClick: mockOnCardClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: Image is NOT bad
    badImageCache.isBadImage.mockReturnValue(false);
  });

  // --- 1. RENDERING & TRUNCATION TESTS ---

  it('renders basic info correctly', () => {
    render(<NewsCard {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Summary')).toBeInTheDocument();
    expect(screen.getByText('CNN')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('Tech')).toBeInTheDocument();
  });

  it('truncates long title (limit: 9 words)', () => {
    const longTitle = 'One Two Three Four Five Six Seven Eight Nine Ten Eleven';
    render(<NewsCard {...defaultProps} title={longTitle} />);

    // Should contain the first 9 words + "…"
    // "One ... Nine" is 9 words. "Ten" should be cut.
    expect(screen.getByText(/One Two Three Four Five Six Seven Eight Nine…/)).toBeInTheDocument();
    expect(screen.queryByText(/Ten/)).not.toBeInTheDocument();
  });

  it('truncates long summary (limit: 20 words)', () => {
    // Generate a 25 word string
    const longSummary = Array.from({ length: 25 }, (_, i) => `Word${i}`).join(' ');
    render(<NewsCard {...defaultProps} summary={longSummary} />);

    const truncated = longSummary.split(' ').slice(0, 20).join(' ') + '…';
    
    expect(screen.getByText(truncated)).toBeInTheDocument();
  });

  it('does NOT truncate short text', () => {
    const shortTitle = 'Short Title';
    render(<NewsCard {...defaultProps} title={shortTitle} />);
    
    // Should verify exact text match without ellipsis
    // Using a regex to ensure no ellipsis exists at the end
    expect(screen.getByText(/^Short Title$/)).toBeInTheDocument();
  });

  it('handles null/empty text gracefully', () => {
    render(<NewsCard {...defaultProps} title={null} summary={""} />);
    
    // Should render without crashing
    // The title prop defaults to "Article" in the alt text logic, but h2 will be empty
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
  });

  // --- 2. IMAGE HANDLING TESTS ---

  it('renders provided image if valid', () => {
    render(<NewsCard {...defaultProps} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'http://valid-image.com/pic.jpg');
  });

  it('renders Default Image if imageUrl is missing', () => {
    render(<NewsCard {...defaultProps} imageUrl={null} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'default-image-stub');
  });

  it('renders Default Image if isBadImage returns true', () => {
    badImageCache.isBadImage.mockReturnValue(true);
    render(<NewsCard {...defaultProps} />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'default-image-stub');
  });

  it('switches to Default Image on Error event', () => {
    render(<NewsCard {...defaultProps} />);
    const img = screen.getByRole('img');

    // Initial state
    expect(img).toHaveAttribute('src', 'http://valid-image.com/pic.jpg');

    // Simulate Image Error (broken link)
    fireEvent.error(img);

    // Should switch to default
    expect(img).toHaveAttribute('src', 'default-image-stub');
    // Should mark this URL as bad in cache
    expect(badImageCache.markBadImage).toHaveBeenCalledWith('http://valid-image.com/pic.jpg');
  });

  // --- 3. INTERACTION TESTS ---

  it('calls onCardClick when the card body is clicked', () => {
    render(<NewsCard {...defaultProps} />);
    
    // Click the article container
    const article = screen.getByRole('article');
    fireEvent.click(article);

    expect(mockOnCardClick).toHaveBeenCalled();
  });

  it('does NOT call onCardClick when "Read More" is clicked (Propagation)', () => {
    render(<NewsCard {...defaultProps} />);
    
    const readMoreLink = screen.getByText('Read More').closest('a');
    
    // Click the link
    fireEvent.click(readMoreLink);

    // The click should have been stopped
    expect(mockOnCardClick).not.toHaveBeenCalled();
    
    // Verify the link has correct href
    expect(readMoreLink).toHaveAttribute('href', 'http://news.com');
  });

});