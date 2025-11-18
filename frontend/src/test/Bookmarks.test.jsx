import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Bookmarks from '../components/Bookmarks';
import * as api from '../services/api'; // Adjust path if needed
import notify from '../utils/toast'; // Adjust path if needed

// --- MOCKS ---
vi.mock('../services/api', () => ({
  getBookmarksForProfile: vi.fn(),
  addBookmark: vi.fn(),
  removeBookmarkApi: vi.fn(),
}));

vi.mock('../utils/toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock LocalStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Bookmarks Component', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  // --- HELPER: Mock Profile ---
  const mockProfile = { id: 'user-123', full_name: 'Test User' };
  const mockBookmarks = [
    {
      id: 'interaction-1',
      article_id: 'art-1',
      bookmark_timestamp: '2025-01-01',
      note: 'My Note',
      article: {
        title: 'Test Article 1',
        imageUrl: 'img1.jpg',
        url: 'http://test1.com',
        source: 'CNN',
      },
    },
    {
      id: 'interaction-2',
      article_id: 'art-2',
      bookmark_timestamp: '2025-01-02',
      note: '',
      article: {
        title: 'Test Article 2',
        imageUrl: null,
        url: 'http://test2.com',
        source: 'BBC',
      },
    },
  ];

  // --- 1. RENDERING TESTS ---

  it('renders Loading state initially', () => {
    render(<Bookmarks />);
    expect(screen.getByText(/Loading bookmarks.../i)).toBeInTheDocument();
  });

  it('renders Empty State if no bookmarks found', async () => {
    window.localStorage.setItem('currentProfile', JSON.stringify(mockProfile));
    api.getBookmarksForProfile.mockResolvedValue([]);

    render(<Bookmarks />);

    await waitFor(() => {
      expect(screen.getByText(/You have no saved articles yet/i)).toBeInTheDocument();
    });
  });

  it('renders Bookmarks list for Logged-in User', async () => {
    window.localStorage.setItem('currentProfile', JSON.stringify(mockProfile));
    api.getBookmarksForProfile.mockResolvedValue(mockBookmarks);

    render(<Bookmarks />);

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument();
      expect(screen.getByText('Test Article 2')).toBeInTheDocument();
      expect(screen.getAllByText('Remove')).toHaveLength(2);
    });
  });

  it('renders Bookmarks from LocalStorage for Guest User', async () => {
    // No profile in localStorage
    const localBookmarks = [
      { id: 'local-1', title: 'Local Article', newsUrl: 'http://local.com' }
    ];
    window.localStorage.setItem('bookmarks', JSON.stringify(localBookmarks));

    render(<Bookmarks />);

    await waitFor(() => {
      expect(screen.getByText('Local Article')).toBeInTheDocument();
    });
  });

  // --- 2. INTERACTION TESTS (Remove) ---

  it('handles Remove Bookmark (Logged-in User)', async () => {
    window.localStorage.setItem('currentProfile', JSON.stringify(mockProfile));
    api.getBookmarksForProfile.mockResolvedValue(mockBookmarks);
    api.removeBookmarkApi.mockResolvedValue(true);

    render(<Bookmarks />);

    await waitFor(() => screen.getByText('Test Article 1'));

    // Click Remove on first item
    const removeBtns = screen.getAllByText('Remove');
    fireEvent.click(removeBtns[0]);

    await waitFor(() => {
      // Verify API was called with correct IDs
      // Note: Your component uses item.id (which is interaction ID for server bookmarks)
      expect(api.removeBookmarkApi).toHaveBeenCalledWith(mockProfile.id, 'interaction-1');
      expect(notify.success).toHaveBeenCalledWith('Bookmark removed');
      // Item should disappear from UI
      expect(screen.queryByText('Test Article 1')).not.toBeInTheDocument();
    });
  });

  it('handles Remove Bookmark (Guest User)', async () => {
    const localBookmarks = [{ id: 'local-1', title: 'Local Article', key: 'local-1' }];
    window.localStorage.setItem('bookmarks', JSON.stringify(localBookmarks));

    render(<Bookmarks />);
    await waitFor(() => screen.getByText('Local Article'));

    const removeBtn = screen.getByText('Remove');
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(api.removeBookmarkApi).not.toHaveBeenCalled(); // API should NOT be called
      expect(notify.success).toHaveBeenCalledWith('Bookmark removed');
      expect(screen.queryByText('Local Article')).not.toBeInTheDocument();
      
      // Verify localStorage was updated
      const stored = JSON.parse(window.localStorage.getItem('bookmarks'));
      expect(stored).toHaveLength(0);
    });
  });

  // --- 3. INTERACTION TESTS (Notes) ---

  it('handles Save Note (Logged-in User)', async () => {
    window.localStorage.setItem('currentProfile', JSON.stringify(mockProfile));
    api.getBookmarksForProfile.mockResolvedValue(mockBookmarks);
    api.addBookmark.mockResolvedValue(true);

    render(<Bookmarks />);
    await waitFor(() => screen.getByText('Test Article 1'));

    // Find the textarea for the first article
    const textareas = screen.getAllByPlaceholderText('Add a private note...');
    const noteInput = textareas[0];

    // Type note and blur (trigger save)
    fireEvent.change(noteInput, { target: { value: 'New Note Content' } });
    fireEvent.blur(noteInput);

    await waitFor(() => {
      expect(api.addBookmark).toHaveBeenCalledWith(mockProfile.id, 'interaction-1', 'New Note Content');
      expect(notify.success).toHaveBeenCalledWith('Note saved');
    });
  });

  it('prevents Save Note for Guest User', async () => {
    // Guest user setup
    const localBookmarks = [{ id: 'local-1', title: 'Local Article', key: 'local-1' }];
    window.localStorage.setItem('bookmarks', JSON.stringify(localBookmarks));

    render(<Bookmarks />);
    await waitFor(() => screen.getByText('Local Article'));

    const noteInput = screen.getByPlaceholderText('Add a private note...');
    
    // Try to save
    fireEvent.change(noteInput, { target: { value: 'Guest Note' } });
    fireEvent.blur(noteInput);

    await waitFor(() => {
      expect(api.addBookmark).not.toHaveBeenCalled();
      expect(notify.info).toHaveBeenCalledWith(expect.stringContaining('Login to save notes'));
    });
  });

  // --- 4. ERROR HANDLING ---

  it('handles API Error when fetching bookmarks', async () => {
    window.localStorage.setItem('currentProfile', JSON.stringify(mockProfile));
    api.getBookmarksForProfile.mockRejectedValue(new Error('Network Error'));
    
    // Spy on console.error to suppress noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Bookmarks />);

    await waitFor(() => {
      expect(notify.error).toHaveBeenCalledWith(expect.stringContaining('Could not load bookmarks'));
      // Should fall back to empty list or local
      expect(screen.getByText(/You have no saved articles yet/i)).toBeInTheDocument();
    });
  });

  it('handles API Error when removing bookmark', async () => {
    window.localStorage.setItem('currentProfile', JSON.stringify(mockProfile));
    api.getBookmarksForProfile.mockResolvedValue(mockBookmarks);
    api.removeBookmarkApi.mockRejectedValue(new Error('Delete Failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Bookmarks />);
    await waitFor(() => screen.getByText('Test Article 1'));

    const removeBtns = screen.getAllByText('Remove');
    fireEvent.click(removeBtns[0]);

    await waitFor(() => {
      expect(notify.error).toHaveBeenCalledWith(expect.stringContaining('Could not remove bookmark'));
      // Item should technically reappear or not disappear (UI logic handles this by setting state back)
    });
  });

});