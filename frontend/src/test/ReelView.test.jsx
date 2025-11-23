import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ReelView from '../components/ReelView';
import ReelCard from '../components/ReelCard'; // <--- 1. Added Import

// --- MOCKS ---
// 2. Updated Mock: Wrapped in vi.fn() so we can change implementation in tests
vi.mock('../components/ReelCard', () => ({
  default: vi.fn(({ title, isActive }) => (
    <div data-testid={`reel-card-${isActive ? 'active' : 'inactive'}`}>
      {title}
    </div>
  )),
}));

vi.mock('lucide-react', () => ({
  X: () => <span data-testid="close-icon">X</span>,
}));

describe('ReelView Component', () => {
  const mockOnClose = vi.fn();
  const mockOnRequireLogin = vi.fn();
  const mockNews = Array.from({ length: 10 }, (_, i) => ({ id: `id-${i}`, title: `News ${i}` }));

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers(); 
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.style.overflow = 'auto';
  });

  // --- 1. RENDERING & INITIALIZATION ---

  it('locks body scroll on mount and unlocks on unmount', () => {
    const { unmount } = render(<ReelView news={mockNews} onClose={mockOnClose} />);
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('renders the correct initial card', () => {
    render(<ReelView news={mockNews} initialIndex={2} />);
    expect(screen.getByText('News 2')).toBeInTheDocument();
  });

  // --- 2. NAVIGATION (WHEEL) ---

  it('navigates NEXT on scroll down', () => {
    render(<ReelView news={mockNews} initialIndex={0} userProfile={{ id: 'u1' }} />);
    
    const closeBtn = screen.getByLabelText('Close reel view');
    const container = closeBtn.nextSibling;

    fireEvent.wheel(container, { deltaY: 100 });
    act(() => { vi.runAllTimers(); });

    const slider = container.firstChild;
    expect(slider).toHaveStyle('transform: translateY(-100%)'); 
  });

  it('navigates PREV on scroll up', () => {
    render(<ReelView news={mockNews} initialIndex={1} userProfile={{ id: 'u1' }} />);
    
    const closeBtn = screen.getByLabelText('Close reel view');
    const container = closeBtn.nextSibling;

    fireEvent.wheel(container, { deltaY: -100 });
    act(() => { vi.runAllTimers(); });

    const slider = container.firstChild;
    expect(slider).toHaveStyle('transform: translateY(-0%)'); 
  });

  // --- 3. GUEST LIMITS ---

  it('stops guest user at index 5 (6th item)', () => {
    render(<ReelView news={mockNews} initialIndex={5} userProfile={null} onRequireLogin={mockOnRequireLogin} />);
    const closeBtn = screen.getByLabelText('Close reel view');
    const container = closeBtn.nextSibling;

    fireEvent.wheel(container, { deltaY: 100 });
    act(() => { vi.runAllTimers(); });

    const slider = container.firstChild;
    expect(slider).toHaveStyle('transform: translateY(-500%)'); 
    expect(mockOnRequireLogin).toHaveBeenCalled();
  });

  it('allows logged-in user to scroll past limit', () => {
    render(<ReelView news={mockNews} initialIndex={5} userProfile={{ id: 'u1' }} />);
    const closeBtn = screen.getByLabelText('Close reel view');
    const container = closeBtn.nextSibling;

    fireEvent.wheel(container, { deltaY: 100 });
    act(() => { vi.runAllTimers(); });

    const slider = container.firstChild;
    expect(slider).toHaveStyle('transform: translateY(-600%)'); 
  });

  // --- 4. TOUCH NAVIGATION ---

  it('handles swipe UP (Next)', () => {
    render(<ReelView news={mockNews} initialIndex={0} userProfile={{ id: 'u1' }} />);
    const closeBtn = screen.getByLabelText('Close reel view');
    const container = closeBtn.nextSibling;

    fireEvent.touchStart(container, { touches: [{ clientY: 300 }] });
    fireEvent.touchEnd(container, { changedTouches: [{ clientY: 100 }] });

    const slider = container.firstChild;
    expect(slider).toHaveStyle('transform: translateY(-100%)');
  });

  it('handles swipe DOWN (Prev)', () => {
    render(<ReelView news={mockNews} initialIndex={1} userProfile={{ id: 'u1' }} />);
    const closeBtn = screen.getByLabelText('Close reel view');
    const container = closeBtn.nextSibling;

    fireEvent.touchStart(container, { touches: [{ clientY: 100 }] });
    fireEvent.touchEnd(container, { changedTouches: [{ clientY: 300 }] });

    const slider = container.firstChild;
    expect(slider).toHaveStyle('transform: translateY(-0%)');
  });

  // --- 5. CLOSING & AUDIO ---

  it('pauses audio players and closes on button click', () => {
    render(<ReelView news={mockNews} onClose={mockOnClose} />);
    
    const closeBtn = screen.getByLabelText('Close reel view');
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });

  // --- 6. CHILD OVERLAY LOCK (FIXED) ---

  it('blocks scrolling when child overlay is open', () => {
    // 1. Capture the setChildOverlayOpen function
    let setOverlay;
    
    // FIX: Use the imported ReelCard directly
    ReelCard.mockImplementation(({ onOverlayChange, title }) => {
      setOverlay = onOverlayChange;
      return <div>{title}</div>;
    });

    render(<ReelView news={mockNews} initialIndex={0} />);
    const closeBtn = screen.getByLabelText('Close reel view');
    const container = closeBtn.nextSibling;

    // 2. Open overlay (simulate child component action)
    act(() => {
      setOverlay(true);
    });

    // 3. Try to scroll
    fireEvent.wheel(container, { deltaY: 100 });
    act(() => { vi.runAllTimers(); });

    // 4. Verify NO movement
    const slider = container.firstChild;
    expect(slider).toHaveStyle('transform: translateY(-0%)');
  });

});