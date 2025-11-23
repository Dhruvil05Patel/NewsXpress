import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoryOnboarding from '../components/CategoryOnboarding';
import * as api from '../services/api'; // Adjust path if needed
import * as fcm from '../utils/getFCMToken'; // Adjust path if needed

// --- MOCKS ---
vi.mock('../services/api', () => ({
  updateProfile: vi.fn(),
}));

vi.mock('../utils/getFCMToken', () => ({
  getFCMToken: vi.fn(),
}));

// Mock window.dispatchEvent for 'profile-updated'
const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
// Mock window.alert
const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('CategoryOnboarding Component', () => {
  const mockProfile = { id: 'user-123' };
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- 1. RENDERING TESTS ---

  it('renders all default categories', () => {
    render(<CategoryOnboarding profile={mockProfile} onClose={mockOnClose} />);
    
    expect(screen.getByText('Choose your notification categories')).toBeInTheDocument();
    
    // Check for a few known categories
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Sports')).toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();
  });

  it('pre-selects initial categories', () => {
    const initial = ['Technology', 'Sports'];
    render(
      <CategoryOnboarding 
        profile={mockProfile} 
        onClose={mockOnClose} 
        initialSelected={initial} 
      />
    );

    // Helper: Find the checkbox associated with the label
    const techCheckbox = screen.getByLabelText('Technology');
    const sportsCheckbox = screen.getByLabelText('Sports');
    const healthCheckbox = screen.getByLabelText('Health');

    expect(techCheckbox).toBeChecked();
    expect(sportsCheckbox).toBeChecked();
    expect(healthCheckbox).not.toBeChecked();
  });

  // --- 2. INTERACTION TESTS (Selection) ---

  it('toggles category selection on click', () => {
    render(<CategoryOnboarding profile={mockProfile} onClose={mockOnClose} />);
    
    const techCheckbox = screen.getByLabelText('Technology');
    
    // Initially unchecked
    expect(techCheckbox).not.toBeChecked();
    
    // Click to check
    fireEvent.click(techCheckbox);
    expect(techCheckbox).toBeChecked();
    
    // Click to uncheck
    fireEvent.click(techCheckbox);
    expect(techCheckbox).not.toBeChecked();
  });

  // --- 3. SAVING LOGIC ---

  it('handles "Confirm" - Success with FCM Token', async () => {
    // Mock successful API calls
    fcm.getFCMToken.mockResolvedValue('test-fcm-token');
    api.updateProfile.mockResolvedValue(true);

    render(<CategoryOnboarding profile={mockProfile} onClose={mockOnClose} />);

    // Select a category
    fireEvent.click(screen.getByLabelText('Technology'));

    // Click Confirm
    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmBtn);

    // Button should show loading state
    expect(confirmBtn).toHaveTextContent('Saving...');
    expect(confirmBtn).toBeDisabled();

    await waitFor(() => {
      // Verify FCM was requested
      expect(fcm.getFCMToken).toHaveBeenCalled();
      
      // Verify Update Profile called with correct payload
      // Categories should be lowercase per your component logic
      expect(api.updateProfile).toHaveBeenCalledWith('user-123', {
        categories: ['technology'],
        fcm_token: 'test-fcm-token'
      });

      // Verify event dispatch
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
      
      // Verify modal closed
      expect(mockOnClose).toHaveBeenCalledWith(['Technology']);
    });
  });

  it('handles "Confirm" - Success without FCM Token (Token Fail)', async () => {
    // Mock FCM failure (should not block saving)
    fcm.getFCMToken.mockRejectedValue(new Error('Permission denied'));
    api.updateProfile.mockResolvedValue(true);

    render(<CategoryOnboarding profile={mockProfile} onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText('Business'));
    
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      // Should still save categories
      expect(api.updateProfile).toHaveBeenCalledWith('user-123', {
        categories: ['business'] 
        // No fcm_token field
      });
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles API Error during save', async () => {
    fcm.getFCMToken.mockResolvedValue('token');
    // Mock API failure
    api.updateProfile.mockRejectedValue(new Error('Network Error'));

    render(<CategoryOnboarding profile={mockProfile} onClose={mockOnClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(api.updateProfile).toHaveBeenCalled();
      // Alert should be shown
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to save'));
      // Modal should NOT close
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  // --- 4. SKIP LOGIC ---

  it('handles "Skip" button', () => {
    render(<CategoryOnboarding profile={mockProfile} onClose={mockOnClose} />);
    
    const skipBtn = screen.getByRole('button', { name: 'Skip' });
    fireEvent.click(skipBtn);

    // Should close with null
    expect(mockOnClose).toHaveBeenCalledWith(null);
    // API should NOT be called
    expect(api.updateProfile).not.toHaveBeenCalled();
  });

});