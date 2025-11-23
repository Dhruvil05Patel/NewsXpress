import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSelector from '../components/LanguageSelector';

// --- MOCKS ---

// 1. Mock the languages data
vi.mock('../utils/languages', () => ({
  languages: [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
  ],
}));

// 2. Mock Icons
vi.mock('lucide-react', () => ({
  X: () => <span data-testid="close-icon">X</span>,
}));

describe('LanguageSelector Component', () => {
  const mockOnSelect = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- 1. RENDERING & FILTERING ---

  it('renders the search input and full list initially', () => {
    render(<LanguageSelector onSelectLanguage={mockOnSelect} onClose={mockOnClose} />);

    expect(screen.getByText('Select language')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search languages')).toBeInTheDocument();
    
    // Check that mock languages are present
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('German')).toBeInTheDocument();
  });

  it('filters the list based on search input', () => {
    render(<LanguageSelector onSelectLanguage={mockOnSelect} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText('Search languages');

    // Type "Sp" (should match Spanish)
    fireEvent.change(input, { target: { value: 'Sp' } });

    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.queryByText('English')).not.toBeInTheDocument();
    expect(screen.queryByText('French')).not.toBeInTheDocument();
  });

  it('shows empty list if search finds nothing', () => {
    render(<LanguageSelector onSelectLanguage={mockOnSelect} onClose={mockOnClose} />);
    
    const input = screen.getByPlaceholderText('Search languages');
    fireEvent.change(input, { target: { value: 'Japanese' } }); // Not in mock

    expect(screen.queryByText('English')).not.toBeInTheDocument();
    // List should be empty (no buttons)
    const buttons = screen.queryAllByRole('button');
    // Only the Close 'X' button should remain
    expect(buttons).toHaveLength(1); 
  });

  // --- 2. INTERACTION TESTS ---

  it('calls onSelectLanguage when a language is clicked', () => {
    render(<LanguageSelector onSelectLanguage={mockOnSelect} onClose={mockOnClose} />);

    const frenchBtn = screen.getByText('French');
    fireEvent.click(frenchBtn);

    expect(mockOnSelect).toHaveBeenCalledWith('fr');
    // Note: The component doesn't auto-close on select in the code provided,
    // so we don't expect onClose here unless logic changes.
  });

  it('calls onClose when Close (X) button is clicked', () => {
    render(<LanguageSelector onSelectLanguage={mockOnSelect} onClose={mockOnClose} />);

    const closeBtn = screen.getByTestId('close-icon').closest('button');
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });

  // --- 3. EVENT PROPAGATION & SCROLL LOCK TESTS ---
  // These tests are crucial for 100% coverage of the `stopPropagation` logic

  it('calls onClose when clicking the overlay', () => {
    const { container } = render(
      <LanguageSelector onSelectLanguage={mockOnSelect} onClose={mockOnClose} />
    );

    // The first div is the overlay
    const overlay = container.firstChild;
    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does NOT call onClose when clicking inside the modal content', () => {
    render(<LanguageSelector onSelectLanguage={mockOnSelect} onClose={mockOnClose} />);

    // Click the header inside the modal
    const header = screen.getByText('Select language');
    fireEvent.click(header);

    // Should catch bubbling and NOT close
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('prevents scroll (wheel) on overlay', () => {
    const { container } = render(
      <LanguageSelector onSelectLanguage={mockOnSelect} onClose={mockOnClose} />
    );
    const overlay = container.firstChild;

    // Create a mock event
    const wheelEvent = new Event('wheel', { bubbles: true, cancelable: true });
    const stopSpy = vi.spyOn(wheelEvent, 'stopPropagation');
    const preventSpy = vi.spyOn(wheelEvent, 'preventDefault');

    // Fire it
    overlay.dispatchEvent(wheelEvent);

    // Assert that the handlers defined in JSX were executed
    expect(stopSpy).toHaveBeenCalled();
    expect(preventSpy).toHaveBeenCalled();
  });

  it('stops propagation of scroll (wheel/touch) inside the modal', () => {
    // This covers the `onWheel={(e) => e.stopPropagation()}` on the inner div and ul
    render(<LanguageSelector onSelectLanguage={mockOnSelect} onClose={mockOnClose} />);

    const modalContent = screen.getByText('Select language').closest('div').parentElement;
    // The `ul` also has stopPropagation
    const list = screen.getByRole('list'); 

    // Test Wheel on Modal
    const wheelEvent = new Event('wheel', { bubbles: true });
    const stopSpy = vi.spyOn(wheelEvent, 'stopPropagation');
    modalContent.dispatchEvent(wheelEvent);
    expect(stopSpy).toHaveBeenCalled();

    // Test TouchMove on Modal
    const touchEvent = new Event('touchmove', { bubbles: true });
    const touchSpy = vi.spyOn(touchEvent, 'stopPropagation');
    modalContent.dispatchEvent(touchEvent);
    expect(touchSpy).toHaveBeenCalled();

    // Test Wheel on List
    const listWheel = new Event('wheel', { bubbles: true });
    const listStop = vi.spyOn(listWheel, 'stopPropagation');
    list.dispatchEvent(listWheel);
    expect(listStop).toHaveBeenCalled();
  });

});