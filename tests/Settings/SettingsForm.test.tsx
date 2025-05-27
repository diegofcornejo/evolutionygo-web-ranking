import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import SettingsForm from '../../src/components/Settings/SettingsForm';
import { toast } from 'sonner';
import { logout } from '../../src/components/NavBar/helper';
import { getSession } from '../../src/stores/sessionStore';

// Mock dependencies
vi.mock('react-svg', () => ({ ReactSVG: () => <span data-testid="svg" /> }));
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));
vi.mock('../../src/components/NavBar/helper', () => ({ logout: vi.fn() }));
vi.mock('../../src/stores/sessionStore', () => ({ 
  getSession: vi.fn(() => ({ token: 'mock-token' })) 
}));

// Mock environment variable
Object.defineProperty(import.meta, 'env', {
  value: { PUBLIC_API_URL: 'https://api.evolutionygo.com/api/v1' },
  writable: true,
});

function mockResponse({ ok = true, statusText = '', json = async () => ({}) }) {
  return {
    ok,
    status: ok ? 200 : 400,
    statusText,
    json,
    headers: new Headers(),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    clone: function () { return this; },
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    text: async () => '',
    bytes: async () => new Uint8Array(),
  };
}

describe('SettingsForm', () => {
  const dialog = 'test-dialog';
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve(mockResponse({})));
    
    // Mock dialog element
    const mockDialog = {
      close: vi.fn(),
    };
    vi.spyOn(document, 'getElementById').mockReturnValue(mockDialog as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders username and password change sections', () => {
    render(<SettingsForm dialog={dialog} />);
    
    expect(screen.getByText('Change Username')).toBeInTheDocument();
    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Actual Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
  });

  it('renders save buttons for both forms', () => {
    render(<SettingsForm dialog={dialog} />);
    
    const saveButtons = screen.getAllByText('Save');
    expect(saveButtons).toHaveLength(2);
  });

  it('updates username input value', () => {
    render(<SettingsForm dialog={dialog} />);
    
    const usernameInput = screen.getByPlaceholderText('New Username');
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });
    
    expect(usernameInput).toHaveValue('newusername');
  });

  it('updates password input values', () => {
    render(<SettingsForm dialog={dialog} />);
    
    const actualPasswordInput = screen.getByPlaceholderText('Actual Password');
    const newPasswordInput = screen.getByPlaceholderText('New Password');
    
    fireEvent.change(actualPasswordInput, { target: { value: 'oldpass' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newp' } });
    
    expect(actualPasswordInput).toHaveValue('oldpass');
    expect(newPasswordInput).toHaveValue('newp');
  });

  it('enforces maxLength on new password input', () => {
    render(<SettingsForm dialog={dialog} />);
    
    const newPasswordInput = screen.getByPlaceholderText('New Password');
    expect(newPasswordInput).toHaveAttribute('maxLength', '4');
  });

  it('submits username change form successfully', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: true }));
    
    render(<SettingsForm dialog={dialog} />);
    
    const usernameInput = screen.getByPlaceholderText('New Username');
    const saveButtons = screen.getAllByText('Save');
    
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });
    fireEvent.click(saveButtons[0]);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://api.evolutionygo.com/api/v1/users/change-username',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          body: JSON.stringify({ username: 'newusername' }),
        })
      );
    });
    
    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        'Updated successfully, please login again',
        { position: 'bottom-center' }
      );
    });
  });

  it('submits password change form successfully', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: true }));
    
    render(<SettingsForm dialog={dialog} />);
    
    const actualPasswordInput = screen.getByPlaceholderText('Actual Password');
    const newPasswordInput = screen.getByPlaceholderText('New Password');
    const saveButtons = screen.getAllByText('Save');
    
    fireEvent.change(actualPasswordInput, { target: { value: 'oldpass' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newp' } });
    fireEvent.click(saveButtons[1]);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://api.evolutionygo.com/api/v1/users/change-password',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          body: JSON.stringify({ password: 'oldpass', newPassword: 'newp' }),
        })
      );
    });
    
    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        'Updated successfully, please login again',
        { position: 'bottom-center' }
      );
    });
  });

  it('shows error message on username change failure', async () => {
    const errorMessage = 'Username already exists';
    (fetch as any).mockResolvedValueOnce(
      mockResponse({ 
        ok: false, 
        json: async () => ({ message: errorMessage }) 
      })
    );
    
    render(<SettingsForm dialog={dialog} />);
    
    const usernameInput = screen.getByPlaceholderText('New Username');
    const saveButtons = screen.getAllByText('Save');
    
    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.click(saveButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows error message on password change failure', async () => {
    const errorMessage = 'Invalid current password';
    (fetch as any).mockResolvedValueOnce(
      mockResponse({ 
        ok: false, 
        json: async () => ({ message: errorMessage }) 
      })
    );
    
    render(<SettingsForm dialog={dialog} />);
    
    const actualPasswordInput = screen.getByPlaceholderText('Actual Password');
    const newPasswordInput = screen.getByPlaceholderText('New Password');
    const saveButtons = screen.getAllByText('Save');
    
    fireEvent.change(actualPasswordInput, { target: { value: 'wrongpass' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newp' } });
    fireEvent.click(saveButtons[1]);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows default error message when no message provided', async () => {
    (fetch as any).mockResolvedValueOnce(
      mockResponse({ 
        ok: false, 
        json: async () => ({}) 
      })
    );
    
    render(<SettingsForm dialog={dialog} />);
    
    const usernameInput = screen.getByPlaceholderText('New Username');
    const saveButtons = screen.getAllByText('Save');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(saveButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Error updating')).toBeInTheDocument();
    });
  });

  it('shows connection error on network failure', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));
    
    render(<SettingsForm dialog={dialog} />);
    
    const usernameInput = screen.getByPlaceholderText('New Username');
    const saveButtons = screen.getAllByText('Save');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(saveButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('No connection to server')).toBeInTheDocument();
    });
  });

  it('clears form and closes modal on successful submission', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: true }));
    const mockClose = vi.fn();
    vi.spyOn(document, 'getElementById').mockReturnValue({ close: mockClose } as any);
    
    render(<SettingsForm dialog={dialog} />);
    
    const usernameInput = screen.getByPlaceholderText('New Username');
    const saveButtons = screen.getAllByText('Save');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(saveButtons[0]);
    
    await waitFor(() => {
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it('prevents form submission when required fields are empty', () => {
    render(<SettingsForm dialog={dialog} />);
    
    const usernameInput = screen.getByPlaceholderText('New Username');
    const actualPasswordInput = screen.getByPlaceholderText('Actual Password');
    const newPasswordInput = screen.getByPlaceholderText('New Password');
    
    expect(usernameInput).toBeRequired();
    expect(actualPasswordInput).toBeRequired();
    expect(newPasswordInput).toBeRequired();
  });

  it('clears errors when form is cleaned', async () => {
    const errorMessage = 'Test error';
    (fetch as any).mockResolvedValueOnce(
      mockResponse({ 
        ok: false, 
        json: async () => ({ message: errorMessage }) 
      })
    );
    
    render(<SettingsForm dialog={dialog} />);
    
    const usernameInput = screen.getByPlaceholderText('New Username');
    const saveButtons = screen.getAllByText('Save');
    
    // Trigger error
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(saveButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    // Now test successful submission which should clear the error
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: true }));
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.click(saveButtons[0]);
    
    await waitFor(() => {
      expect(usernameInput).toHaveValue('');
    });
  });
}); 