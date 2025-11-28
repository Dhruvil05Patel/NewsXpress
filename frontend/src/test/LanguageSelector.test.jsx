import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSelector from '../components/LanguageSelector';

// --- MOCKS ---
vi.mock('lucide-react', () => ({
  X: () => <span data-testid="close-icon">X</span>,
}));

// Mock the languages utility
vi.mock('../utils/languages', () => ({
  languages: [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'hi', name: 'Hindi' },
  ],
}));

describe('LanguageSelector Component', () => {
  const mockOnSelectLanguage = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial state', () => {
    render(<LanguageSelector onSelectLanguage={mockOnSelectLanguage} onClose={mockOnClose} />);

    expect(screen.getByText('Select Language')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search languages')).toBeInTheDocument();
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();

    // Should display all mocked languages initially
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('Hindi')).toBeInTheDocument();
  });

  it('filters languages based on search input', () => {
    render(<LanguageSelector onSelectLanguage={mockOnSelectLanguage} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText('Search languages');

    // Search for "Span"
    fireEvent.change(searchInput, { target: { value: 'Span' } });

    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.queryByText('English')).not.toBeInTheDocument();
    expect(screen.queryByText('French')).not.toBeInTheDocument();

    // Search for "en" (should match English and French - if "French" contains "en"? No, "French" has "en". "German" has "en"?)
    fireEvent.change(searchInput, { target: { value: 'en' } });
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument();
    expect(screen.queryByText('German')).not.toBeInTheDocument(); // German doesn't have 'en'
    expect(screen.queryByText('Spanish')).not.toBeInTheDocument();
  });

  it('calls onSelectLanguage when a language is clicked', () => {
    render(<LanguageSelector onSelectLanguage={mockOnSelectLanguage} onClose={mockOnClose} />);

    const spanishBtn = screen.getByText('Spanish');
    fireEvent.click(spanishBtn);

    expect(mockOnSelectLanguage).toHaveBeenCalledWith('es');
  });

  it('calls onClose when close button is clicked', () => {
    render(<LanguageSelector onSelectLanguage={mockOnSelectLanguage} onClose={mockOnClose} />);

    const closeBtn = screen.getByTestId('close-icon').closest('button');
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking the overlay', () => {
    const { container } = render(<LanguageSelector onSelectLanguage={mockOnSelectLanguage} onClose={mockOnClose} />);

    // The overlay is the outermost div with onClick={onClose}
    const overlay = container.firstChild;
    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does NOT call onClose when clicking inside the modal content', () => {
    render(<LanguageSelector onSelectLanguage={mockOnSelectLanguage} onClose={mockOnClose} />);

    const modalTitle = screen.getByText('Select Language');
    fireEvent.click(modalTitle);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('stops propagation on wheel and touch events to prevent background scrolling', () => {
    const { container } = render(<LanguageSelector onSelectLanguage={mockOnSelectLanguage} onClose={mockOnClose} />);

    const overlay = container.firstChild;

    // Test Wheel on Overlay
    fireEvent.wheel(overlay);
    fireEvent.touchMove(overlay);

    // Find modal content (inner div)
    // The structure is Overlay -> Modal Div -> Header Div -> H3
    const modalDiv = container.querySelector('div[class*="rounded-lg"]');

    fireEvent.click(modalDiv);
    fireEvent.wheel(modalDiv);
    fireEvent.touchMove(modalDiv);

    const list = screen.getByRole('list');
    fireEvent.wheel(list);
    fireEvent.touchMove(list);
  });

  it('handles input focus and blur styles', () => {
    render(<LanguageSelector onSelectLanguage={mockOnSelectLanguage} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText('Search languages');

    fireEvent.focus(input);
    expect(input.style.boxShadow).toContain('rgba(255,29,80,0.35)');

    fireEvent.blur(input);
    expect(input.style.boxShadow).toContain('rgba(255,29,80,0.15)');
  });

  it('handles language item hover styles', () => {
    render(<LanguageSelector onSelectLanguage={mockOnSelectLanguage} onClose={mockOnClose} />);

    const langBtn = screen.getByText('English').closest('button');

    fireEvent.mouseEnter(langBtn);
    expect(langBtn.style.background).toContain('linear-gradient');

    fireEvent.mouseLeave(langBtn);
    expect(langBtn.style.background).toContain('rgba(255, 255, 255, 0.05)');
  });

  it('handles close button hover styles', () => {
    render(<LanguageSelector onSelectLanguage={mockOnSelectLanguage} onClose={mockOnClose} />);

    const closeBtn = screen.getByTestId('close-icon').closest('button');

    fireEvent.mouseEnter(closeBtn);
    expect(closeBtn.style.background).toContain('rgba(255, 255, 255, 0.3)');

    fireEvent.mouseLeave(closeBtn);
    expect(closeBtn.style.background).toContain('rgba(255, 255, 255, 0.15)');
  });
});