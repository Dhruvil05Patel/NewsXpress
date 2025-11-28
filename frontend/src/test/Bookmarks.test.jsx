import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Bookmarks from '../components/Bookmarks';
import * as api from '../services/api';
import notify from '../utils/toast';

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
      article_id: 'art-1', // <--- This is the ID the component uses
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
    // FIX: Set a profile so the component enters the async API fetch block.
    // This delay allows the "Loading" state to be visible to the test.
    window.localStorage.setItem('currentProfile', JSON.stringify(mockProfile));

    // Return a promise that never resolves immediately to hold the loading state
    api.getBookmarksForProfile.mockReturnValue(new Promise(() => { }));

    const { container } = render(<Bookmarks />);
    // Component shows skeleton loaders during loading
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
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

    const removeBtns = screen.getAllByText('Remove');
    fireEvent.click(removeBtns[0]);

    await waitFor(() => {
      // FIX: Expect 'art-1' (article_id), NOT 'interaction-1'
      expect(api.removeBookmarkApi).toHaveBeenCalledWith(mockProfile.id, 'art-1');
      expect(notify.success).toHaveBeenCalledWith('Bookmark removed');
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
      expect(api.removeBookmarkApi).not.toHaveBeenCalled();
      expect(notify.success).toHaveBeenCalledWith('Bookmark removed');
      expect(screen.queryByText('Local Article')).not.toBeInTheDocument();

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

    const textareas = screen.getAllByPlaceholderText('Add a private note...');
    const noteInput = textareas[0];

    fireEvent.change(noteInput, { target: { value: 'New Note Content' } });
    fireEvent.blur(noteInput);

    await waitFor(() => {
      // FIX: Expect 'art-1' (article_id), NOT 'interaction-1'
      expect(api.addBookmark).toHaveBeenCalledWith(mockProfile.id, 'art-1', 'New Note Content');
      expect(notify.success).toHaveBeenCalledWith('Note saved');
    });
  });

  it('prevents Save Note for Guest User', async () => {
    const localBookmarks = [{ id: 'local-1', title: 'Local Article', key: 'local-1' }];
    window.localStorage.setItem('bookmarks', JSON.stringify(localBookmarks));

    render(<Bookmarks />);
    await waitFor(() => screen.getByText('Local Article'));

    const noteInput = screen.getByPlaceholderText('Add a private note...');

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
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(<Bookmarks />);

    await waitFor(() => {
      expect(notify.error).toHaveBeenCalledWith(expect.stringContaining('Could not load bookmarks'));
      expect(screen.getByText(/You have no saved articles yet/i)).toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });

  it('handles API Error when removing bookmark', async () => {
    window.localStorage.setItem('currentProfile', JSON.stringify(mockProfile));
    api.getBookmarksForProfile.mockResolvedValue(mockBookmarks);
    api.removeBookmarkApi.mockRejectedValue(new Error('Delete Failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(<Bookmarks />);
    await waitFor(() => screen.getByText('Test Article 1'));

    const removeBtns = screen.getAllByText('Remove');
    fireEvent.click(removeBtns[0]);

    await waitFor(() => {
      expect(notify.error).toHaveBeenCalledWith(expect.stringContaining('Could not remove bookmark'));
    });
    consoleSpy.mockRestore();
  });

  it('handles Save Note API Error', async () => {
    window.localStorage.setItem('currentProfile', JSON.stringify(mockProfile));
    api.getBookmarksForProfile.mockResolvedValue(mockBookmarks);
    api.addBookmark.mockRejectedValue(new Error('Save Failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(<Bookmarks />);
    await waitFor(() => screen.getByText('Test Article 1'));

    const textareas = screen.getAllByPlaceholderText('Add a private note...');
    const noteInput = textareas[0];

    fireEvent.change(noteInput, { target: { value: 'Fail Note' } });
    fireEvent.blur(noteInput);

    await waitFor(() => {
      expect(notify.error).toHaveBeenCalledWith('Could not save note');
    });
    consoleSpy.mockRestore();
  });

  it('handles corrupt profile in localStorage', () => {
    window.localStorage.setItem('currentProfile', 'invalid-json{');
    render(<Bookmarks />);
    // Should behave as guest (no profile id)
    // If we have local bookmarks, they should show
    expect(screen.queryByText('My Bookmarks')).toBeInTheDocument();
  });

  it('falls back to local bookmarks when server fetch fails', async () => {
    window.localStorage.setItem('currentProfile', JSON.stringify(mockProfile));
    // Set local bookmarks
    const localBookmarks = [{ id: 'local-fallback', title: 'Fallback Article', newsUrl: 'http://fb.com' }];
    window.localStorage.setItem('bookmarks', JSON.stringify(localBookmarks));

    api.getBookmarksForProfile.mockRejectedValue(new Error('Network Error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(<Bookmarks />);

    await waitFor(() => {
      expect(notify.error).toHaveBeenCalledWith(expect.stringContaining('Could not load bookmarks'));
      // Should show the local bookmark
      expect(screen.getByText('Fallback Article')).toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });

  it('normalizes server data with missing fields', async () => {
    window.localStorage.setItem('currentProfile', JSON.stringify(mockProfile));
    const imperfectBookmarks = [{
      id: 'imp-1',
      // No article_id, use id
      bookmark_timestamp: '2025-01-01',
      article: {
        // No title, use headline or Untitled
        // No imageUrl
        // No url, use link or #
        // No source
      }
    }];
    api.getBookmarksForProfile.mockResolvedValue(imperfectBookmarks);

    render(<Bookmarks />);

    await waitFor(() => {
      expect(screen.getByText('Untitled')).toBeInTheDocument();
    });
  });

});