import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReelCard from '../components/ReelCard';
import notify from '../utils/toast';
import * as badImageCache from '../utils/badImageCache';

// --- IMPORTS FOR MOCK SETUP ---
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useTranslation } from '../hooks/useTranslation';
import { useInteractionTimer } from '../hooks/useInteractionTimer';

// --- MOCKS ---

// 1. Mock Custom Hooks
vi.mock('../hooks/useTextToSpeech', () => ({
  useTextToSpeech: vi.fn(),
}));
vi.mock('../hooks/useTranslation', () => ({
  useTranslation: vi.fn(),
}));
vi.mock('../hooks/useInteractionTimer', () => ({
  useInteractionTimer: vi.fn(),
}));

// 2. Mock Child Components
vi.mock('../components/LanguageSelector', () => ({
  default: ({ onSelectLanguage, onClose }) => (
    <div data-testid="lang-selector">
      <button onClick={() => onSelectLanguage('es')}>Select Spanish</button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// 3. Mock Utils
vi.mock('../utils/toast', () => ({
  default: {
    success: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../utils/badImageCache', () => ({
  isBadImage: vi.fn(),
  markBadImage: vi.fn(),
}));

// 4. Mock Lucide Icons
vi.mock('lucide-react', () => ({
  SquareArrowOutUpRight: () => <span>Arrow</span>,
  Languages: () => <span>LangIcon</span>,
  Volume2: () => <span>VolIcon</span>,
  VolumeX: () => <span>MuteIcon</span>,
  LoaderCircle: () => <span>LoadIcon</span>,
  Bookmark: () => <span>BookmarkIcon</span>,
  Clock: () => <span>ClockIcon</span>,
}));

// 5. Mock LocalStorage
const localStorageMock = (() => {
  let store = {};
  return {
    // We mock this as a jest function so we can change its return value per test
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('ReelCard Component', () => {
  
  // Default Props
  const defaultProps = {
    title: 'Test Title',
    summary: 'Test Summary',
    imageUrl: 'http://img.com/1.jpg',
    newsUrl: 'http://news.com',
    source: 'CNN',
    timestamp: '2h ago',
    category: 'Tech',
    userProfile: { id: 'u1' },
    isActive: true,
    audioPlayersRef: { current: [] },
    cardIndex: 0,
    onOverlayChange: vi.fn(),
    articleId: 'art-1',
  };

  // Mock Hook Returns
  const mockTTS = {
    isSpeaking: false,
    isFetchingAudio: false,
    handleListen: vi.fn(),
    audioPlayer: { current: { pause: vi.fn() } },
  };

  const mockTranslation = {
    isTranslated: false,
    translatedContent: {},
    isTranslating: false,
    selectedLanguage: 'en',
    isLangSelectorOpen: false,
    setIsLangSelectorOpen: vi.fn(),
    handleTranslateClick: vi.fn(),
    performTranslation: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    
    // CRITICAL FIX: Reset getItem to return null by default.
    // This ensures 'isBookmarked' starts as false for every test.
    localStorageMock.getItem.mockReturnValue(null);
    
    // Reset default mock implementations
    useTextToSpeech.mockReturnValue(mockTTS);
    useTranslation.mockReturnValue(mockTranslation);
    useInteractionTimer.mockReturnValue({ timeSpent: 125 });
    badImageCache.isBadImage.mockReturnValue(false);
  });

  // --- 1. RENDERING TESTS ---

  it('renders article content correctly', () => {
    render(<ReelCard {...defaultProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Summary')).toBeInTheDocument();
    expect(screen.getByText('CNN')).toBeInTheDocument();
    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.getByText('2m 5s')).toBeInTheDocument();
  });

  it('renders TRANSLATED content if isTranslated is true', () => {
    useTranslation.mockReturnValue({
      ...mockTranslation,
      isTranslated: true,
      translatedContent: { title: 'Titulo', summary: 'Resumen' },
    });

    render(<ReelCard {...defaultProps} />);
    
    expect(screen.getByText('Titulo')).toBeInTheDocument();
    expect(screen.getByText('Resumen')).toBeInTheDocument();
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('renders Default Image on Error', () => {
    render(<ReelCard {...defaultProps} />);
    const img = screen.getByRole('img');
    fireEvent.error(img); // Trigger onError

    expect(badImageCache.markBadImage).toHaveBeenCalledWith('http://img.com/1.jpg');
  });

  // --- 2. AUDIO & TTS TESTS ---

  it('registers audio player ref on mount', () => {
    render(<ReelCard {...defaultProps} />);
    expect(defaultProps.audioPlayersRef.current[0]).toBe(mockTTS.audioPlayer);
  });

  it('pauses audio when card becomes inactive', () => {
    const pauseSpy = vi.fn();
    const ttsMock = { 
      ...mockTTS, 
      isSpeaking: true, 
      audioPlayer: { current: { pause: pauseSpy } } 
    };
    useTextToSpeech.mockReturnValue(ttsMock);

    const { rerender } = render(<ReelCard {...defaultProps} isActive={true} />);
    expect(pauseSpy).not.toHaveBeenCalled();

    rerender(<ReelCard {...defaultProps} isActive={false} />);
    
    expect(pauseSpy).toHaveBeenCalled();
    expect(ttsMock.handleListen).toHaveBeenCalled();
  });

  it('shows loading spinner when fetching audio', () => {
    useTextToSpeech.mockReturnValue({ ...mockTTS, isFetchingAudio: true });
    render(<ReelCard {...defaultProps} />);
    expect(screen.getByText('LoadIcon')).toBeInTheDocument();
  });

  it('handles Listen Click (Auth Guard)', async () => {
    render(<ReelCard {...defaultProps} userProfile={null} />);
    
    const listenBtn = screen.getByLabelText('Listen to news summary');
    fireEvent.click(listenBtn);

    expect(notify.warn).toHaveBeenCalledWith(expect.stringContaining('login to use text-to-speech'));
    expect(mockTTS.handleListen).not.toHaveBeenCalled();
  });

  it('handles Listen Click (Success)', async () => {
    render(<ReelCard {...defaultProps} />);
    const listenBtn = screen.getByLabelText('Listen to news summary');
    fireEvent.click(listenBtn);
    expect(mockTTS.handleListen).toHaveBeenCalledWith(expect.stringContaining('Test Summary'));
  });

  // --- 3. TRANSLATION TESTS ---

  it('handles Translate Click (Auth Guard)', () => {
    render(<ReelCard {...defaultProps} userProfile={null} />);
    const translateBtn = screen.getByLabelText('Translate news');
    fireEvent.click(translateBtn);
    expect(notify.warn).toHaveBeenCalledWith(expect.stringContaining('login to use translation'));
  });

  it('opens Language Selector and handles selection', () => {
    useTranslation.mockReturnValue({
      ...mockTranslation,
      isLangSelectorOpen: true,
    });

    render(<ReelCard {...defaultProps} />);
    expect(screen.getByTestId('lang-selector')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Select Spanish'));
    expect(mockTranslation.performTranslation).toHaveBeenCalledWith('Test Title', 'Test Summary', 'es');
  });

  it('notifies parent on overlay change', () => {
    const { rerender } = render(<ReelCard {...defaultProps} />);
    useTranslation.mockReturnValue({ ...mockTranslation, isLangSelectorOpen: true });
    rerender(<ReelCard {...defaultProps} />);
    expect(defaultProps.onOverlayChange).toHaveBeenCalledWith(true);
  });

  // --- 4. BOOKMARK TESTS ---

  it('handles Bookmark Click (Auth Guard)', () => {
    render(<ReelCard {...defaultProps} userProfile={null} />);
    const bookmarkBtn = screen.getByLabelText('Add bookmark');
    fireEvent.click(bookmarkBtn);
    expect(notify.warn).toHaveBeenCalledWith(expect.stringContaining('login to bookmark'));
  });

  it('opens Bookmark Modal on click (Add)', () => {
    render(<ReelCard {...defaultProps} />);
    const bookmarkBtn = screen.getByLabelText('Add bookmark');
    fireEvent.click(bookmarkBtn);

    expect(screen.getByText('Save Bookmark')).toBeInTheDocument();
    // FIX: Updated placeholder matcher to match your code
    expect(screen.getByPlaceholderText(/Great insight on AI trends/i)).toBeInTheDocument();
  });

  it('removes Bookmark if already bookmarked', () => {
    // Manually set return value for THIS test only
    const existing = [{ title: 'Test Title', note: 'Old Note' }];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existing));

    render(<ReelCard {...defaultProps} />);
    
    // FIX: Label should be 'Remove bookmark' because localStorage found it
    const removeBtn = screen.getByLabelText('Remove bookmark');
    fireEvent.click(removeBtn);

    expect(notify.success).toHaveBeenCalledWith(expect.stringContaining('Bookmark removed'));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('bookmarks', '[]');
  });

  it('saves Bookmark with Note', () => {
    render(<ReelCard {...defaultProps} />);
    
    // 1. Open Modal
    fireEvent.click(screen.getByLabelText('Add bookmark'));

    // 2. Type Note (Updated Placeholder)
    const textarea = screen.getByPlaceholderText(/Great insight/i);
    fireEvent.change(textarea, { target: { value: 'My Note' } });

    // 3. Save
    fireEvent.click(screen.getByText('Save'));

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'bookmarks', 
      expect.stringContaining('"note":"My Note"')
    );
    expect(notify.success).toHaveBeenCalledWith(expect.stringContaining('Added to bookmarks'));
    expect(screen.queryByText('Save Bookmark')).not.toBeInTheDocument();
  });

  it('closes Bookmark Modal on Cancel', () => {
    render(<ReelCard {...defaultProps} />);
    
    fireEvent.click(screen.getByLabelText('Add bookmark'));
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(screen.queryByText('Save Bookmark')).not.toBeInTheDocument();
  });

});