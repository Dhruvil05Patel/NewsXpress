import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ReelView from '../components/ReelView';
import ReelCard from '../components/ReelCard';

// --- MOCKS ---
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

  it('defaults initialIndex to 0 if not provided', () => {
    render(<ReelView news={mockNews} />);
    expect(screen.getByText('News 0')).toBeInTheDocument();
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

  it('ignores small swipes (< 50px)', () => {
    render(<ReelView news={mockNews} initialIndex={0} userProfile={{ id: 'u1' }} />);
    const closeBtn = screen.getByLabelText('Close reel view');
    const container = closeBtn.nextSibling;

    fireEvent.touchStart(container, { touches: [{ clientY: 100 }] });
    fireEvent.touchEnd(container, { changedTouches: [{ clientY: 60 }] }); // 40px diff

    const slider = container.firstChild;
    expect(slider).toHaveStyle('transform: translateY(-0%)');
  });

  it('triggers login when guest swipes past limit', () => {
    render(<ReelView news={mockNews} initialIndex={5} userProfile={null} onRequireLogin={mockOnRequireLogin} />);
    const closeBtn = screen.getByLabelText('Close reel view');
    const container = closeBtn.nextSibling;

    fireEvent.touchStart(container, { touches: [{ clientY: 300 }] });
    fireEvent.touchEnd(container, { changedTouches: [{ clientY: 100 }] }); // Swipe up

    expect(mockOnRequireLogin).toHaveBeenCalled();
    const slider = container.firstChild;
    expect(slider).toHaveStyle('transform: translateY(-500%)'); // Should stay at 5
  });

  // --- 5. CLOSING & AUDIO ---

  it('pauses audio players and closes on button click', () => {
    render(<ReelView news={mockNews} onClose={mockOnClose} />);

    const closeBtn = screen.getByLabelText('Close reel view');
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('pauses audio players when closed (verified)', () => {
    const pauseMock = vi.fn();

    // Update mock to register a player
    ReelCard.mockImplementation(({ audioPlayersRef }) => {
      // Simulate mounting a card and registering a player
      if (audioPlayersRef) {
        audioPlayersRef.current.push({ current: { pause: pauseMock } });
      }
      return <div>Card</div>;
    });

    render(<ReelView news={mockNews} onClose={mockOnClose} />);

    const closeBtn = screen.getByLabelText('Close reel view');
    fireEvent.click(closeBtn);

    expect(pauseMock).toHaveBeenCalled();
  });

  // --- 6. CHILD OVERLAY LOCK & THROTTLING ---

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

    // 2. Open overlay
    act(() => setOverlay(true));

    // 3. Try to scroll
    fireEvent.wheel(container, { deltaY: 100 });
    act(() => { vi.runAllTimers(); });

    // 4. Verify NO change
    const slider = container.firstChild;
    expect(slider).toHaveStyle('transform: translateY(-0%)');

    // 5. Try to swipe
    fireEvent.touchStart(container, { touches: [{ clientY: 300 }] });
    fireEvent.touchEnd(container, { changedTouches: [{ clientY: 100 }] });

    expect(slider).toHaveStyle('transform: translateY(-0%)');
  });

  it('throttles rapid wheel events', () => {
    render(<ReelView news={mockNews} initialIndex={0} />);
    const closeBtn = screen.getByLabelText('Close reel view');
    const container = closeBtn.nextSibling;

    // 1. First scroll -> moves to 1
    fireEvent.wheel(container, { deltaY: 100 });
    const slider = container.firstChild;
    expect(slider).toHaveStyle('transform: translateY(-100%)');

    // 2. Immediate second scroll -> ignored (still at 1)
    fireEvent.wheel(container, { deltaY: 100 });
    expect(slider).toHaveStyle('transform: translateY(-100%)');

    // 3. Advance timer -> throttle released
    act(() => { vi.advanceTimersByTime(500); });

    // 4. Third scroll -> moves to 2
    fireEvent.wheel(container, { deltaY: 100 });
    expect(slider).toHaveStyle('transform: translateY(-200%)');
  });

  it('handles edge cases for navigation bounds', () => {
    render(<ReelView news={mockNews} initialIndex={0} />);
    const closeBtn = screen.getByLabelText('Close reel view');
    const container = closeBtn.nextSibling;
    const slider = container.firstChild;

    // 1. Scroll UP at index 0 -> No change
    fireEvent.wheel(container, { deltaY: -100 });
    act(() => { vi.runAllTimers(); });
    expect(slider).toHaveStyle('transform: translateY(-0%)');
  });

  it('ignores scroll at max index', () => {
    render(<ReelView news={mockNews} initialIndex={9} userProfile={{ id: 'u1' }} />);
    const closeBtn = screen.getByLabelText('Close reel view');
    const container = closeBtn.nextSibling;
    const slider = container.firstChild;

    // Scroll DOWN at max index -> No change
    fireEvent.wheel(container, { deltaY: 100 });
    act(() => { vi.runAllTimers(); });
    // Should stay at 9 (900%)
    expect(slider).toHaveStyle('transform: translateY(-900%)');
  });

  it('ignores touchEnd without touchStart', () => {
    render(<ReelView news={mockNews} initialIndex={0} />);
    const closeBtn = screen.getByLabelText('Close reel view');
    const container = closeBtn.nextSibling;
    const slider = container.firstChild;

    // Dispatch touchEnd without prior touchStart
    fireEvent.touchEnd(container, { changedTouches: [{ clientY: 100 }] });

    expect(slider).toHaveStyle('transform: translateY(-0%)');
  });

});