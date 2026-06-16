import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import SettingsForm from '@components/Settings/SettingsForm';
import { toast } from 'sonner';
import { logout } from '@components/NavBar/helper';

// Mock dependencies
vi.mock('react-svg', () => ({ ReactSVG: () => <span data-testid="svg" /> }));
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));
vi.mock('@components/NavBar/helper', () => ({ logout: vi.fn() }));
vi.mock('@stores/sessionStore', () => ({
  getSession: vi.fn(() => ({ token: 'mock-token', isLoggedIn: true })),
}));
vi.mock('@components/Auth/PasswordStrengthMeter', () => ({
  PasswordStrengthMeter: ({ password }: { password: string }) => (
    <div data-testid="strength-meter" data-password={password} />
  ),
}));

const VALID_PASSWORD = 'ValidPass1';

function mockResponse({
  ok = true,
  status = 200,
  json = async () => ({}),
}: {
  ok?: boolean;
  status?: number;
  json?: () => Promise<unknown>;
} = {}) {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
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
  } as unknown as Response;
}

describe('SettingsForm', () => {
  const dialog = 'test-dialog';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse());

    Object.defineProperty(window, 'location', {
      value: { href: '', replace: vi.fn() },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });

    const mockDialog = { close: vi.fn() };
    vi.spyOn(document, 'getElementById').mockReturnValue(mockDialog as unknown as HTMLElement);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── SC-SETTINGS-1: Exactly 3 sections ────────────────────────────────────
  it('SC-SETTINGS-1: renders exactly 3 sections with correct headings', () => {
    render(<SettingsForm dialog={dialog} />);

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(3);
    expect(screen.getByText(/change username/i)).toBeInTheDocument();
    expect(screen.getByText(/change account password/i)).toBeInTheDocument();
    expect(screen.getByText(/generate game pin/i)).toBeInTheDocument();
  });

  // ── SC-SETTINGS-2: No PIN-change section ─────────────────────────────────
  it('SC-SETTINGS-2: no PIN-change or game-password-change section present', () => {
    render(<SettingsForm dialog={dialog} />);

    expect(screen.queryByText(/change.*pin|change.*game.*password/i)).not.toBeInTheDocument();
    // Old "Change Password" divider must not exist
    expect(screen.queryByText(/^change password$/i)).not.toBeInTheDocument();
  });

  // ── Username section ──────────────────────────────────────────────────────
  it('renders username input and save button', () => {
    render(<SettingsForm dialog={dialog} />);
    expect(screen.getByPlaceholderText('New Username')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument();
  });

  it('updates username input value', () => {
    render(<SettingsForm dialog={dialog} />);
    const usernameInput = screen.getByPlaceholderText('New Username');
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });
    expect(usernameInput).toHaveValue('newusername');
  });

  it('submits username change with correct endpoint, body and header', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse({ ok: true }));
    render(<SettingsForm dialog={dialog} />);

    fireEvent.change(screen.getByPlaceholderText('New Username'), {
      target: { value: 'newusername' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://api.evolutionygo.com/api/v1/users/change-username',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
          body: JSON.stringify({ username: 'newusername' }),
        }),
      );
      expect(logout).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        'Updated successfully, please login again',
        { position: 'bottom-center' },
      );
    });
  });

  it('shows username error on failure', async () => {
    const errorMessage = 'Username already exists';
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse({ ok: false, json: async () => ({ message: errorMessage }) }),
    );
    render(<SettingsForm dialog={dialog} />);

    fireEvent.change(screen.getByPlaceholderText('New Username'), {
      target: { value: 'existinguser' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows default error message when API returns no message for username change', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse({ ok: false, json: async () => ({}) }),
    );
    render(<SettingsForm dialog={dialog} />);

    fireEvent.change(screen.getByPlaceholderText('New Username'), {
      target: { value: 'testuser' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(screen.getByText('Error updating')).toBeInTheDocument();
    });
  });

  it('shows connection error on network failure for username change', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
    render(<SettingsForm dialog={dialog} />);

    fireEvent.change(screen.getByPlaceholderText('New Username'), {
      target: { value: 'testuser' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(screen.getByText('No connection to server')).toBeInTheDocument();
    });
  });

  it('clears form and closes modal on successful username submission', async () => {
    const mockClose = vi.fn();
    vi.spyOn(document, 'getElementById').mockReturnValue({
      close: mockClose,
    } as unknown as HTMLElement);
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse({ ok: true }));

    render(<SettingsForm dialog={dialog} />);

    fireEvent.change(screen.getByPlaceholderText('New Username'), {
      target: { value: 'testuser' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(mockClose).toHaveBeenCalled();
      expect(screen.getByPlaceholderText('New Username')).toHaveValue('');
    });
  });

  // ── Account Password section ──────────────────────────────────────────────
  it('renders current password, new password and confirm new password inputs', () => {
    render(<SettingsForm dialog={dialog} />);
    expect(screen.getByPlaceholderText('Current Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByTestId('strength-meter')).toBeInTheDocument();
  });

  // SC-SETTINGS-3: weak new password disables submit
  it('SC-SETTINGS-3: weak new password disables account password submit', () => {
    render(<SettingsForm dialog={dialog} />);

    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'oldPass1' },
    });
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'weakp' },
    });

    expect(screen.getByRole('button', { name: /save password/i })).toBeDisabled();
  });

  // SC-SETTINGS-4: confirm mismatch disables submit
  it('SC-SETTINGS-4: confirm mismatch disables account password submit', () => {
    render(<SettingsForm dialog={dialog} />);

    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'oldPass1' },
    });
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: VALID_PASSWORD },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), {
      target: { value: 'DifferentPass1' },
    });

    expect(screen.getByRole('button', { name: /save password/i })).toBeDisabled();
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  // SC-SETTINGS-5: account password happy path fetch call
  it('SC-SETTINGS-5: submits to change-account-password with correct body (no confirmNewPassword)', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse({ ok: true }));
    render(<SettingsForm dialog={dialog} />);

    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'oldPass1' },
    });
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: VALID_PASSWORD },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), {
      target: { value: VALID_PASSWORD },
    });

    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://api.evolutionygo.com/api/v1/users/change-account-password',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          }),
          body: JSON.stringify({ currentPassword: 'oldPass1', newPassword: VALID_PASSWORD }),
        }),
      );
    });

    const callBody = JSON.parse(
      (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body as string,
    );
    expect(callBody).not.toHaveProperty('confirmNewPassword');
    expect(callBody).not.toHaveProperty('confirmPassword');
  });

  // SC-SETTINGS-6: force logout on success
  it('SC-SETTINGS-6: calls logout and navigates to /login on password change success', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse({ ok: true }));
    render(<SettingsForm dialog={dialog} />);

    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'oldPass1' },
    });
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: VALID_PASSWORD },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), {
      target: { value: VALID_PASSWORD },
    });

    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
    });
  });

  // SC-SETTINGS-6b: sets a flash so /login can confirm the change after the redirect
  it('SC-SETTINGS-6b: stores a password-changed flash on success', async () => {
    sessionStorage.clear();
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse({ ok: true }));
    render(<SettingsForm dialog={dialog} />);

    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'oldPass1' },
    });
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: VALID_PASSWORD },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), {
      target: { value: VALID_PASSWORD },
    });

    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    await waitFor(() => {
      expect(sessionStorage.getItem('flash')).toBe('password-changed');
    });
  });

  // SC-SETTINGS-RESET: closing the dialog must not leave the one-time PIN on screen
  it('SC-SETTINGS-RESET: clears the generated PIN when the dialog closes', async () => {
    const realDialog = document.createElement('dialog');
    realDialog.id = dialog;
    document.body.appendChild(realDialog);
    (document.getElementById as ReturnType<typeof vi.fn>).mockImplementation(
      (id: string) => (id === dialog ? realDialog : null),
    );

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse({ ok: true, json: async () => ({ gamePassword: 'XK29' }) }),
    );
    render(<SettingsForm dialog={dialog} />);

    fireEvent.click(screen.getByRole('button', { name: /generate dueling pin/i }));
    await waitFor(() => expect(screen.getByTestId('game-pin-value')).toBeInTheDocument());

    await act(async () => {
      realDialog.dispatchEvent(new Event('close'));
    });

    expect(screen.queryByTestId('game-pin-value')).not.toBeInTheDocument();
    realDialog.remove();
  });

  // SC-SETTINGS-7: 401 wrong current password
  it('SC-SETTINGS-7: shows error on 401 without calling logout', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Current password is incorrect' }),
      }),
    );
    render(<SettingsForm dialog={dialog} />);

    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'wrongPass1' },
    });
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: VALID_PASSWORD },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), {
      target: { value: VALID_PASSWORD },
    });

    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    await waitFor(() => {
      expect(screen.getByText('Current password is incorrect')).toBeInTheDocument();
      expect(logout).not.toHaveBeenCalled();
    });
  });

  it('shows connection error on network failure for account password change', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
    render(<SettingsForm dialog={dialog} />);

    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'oldPass1' },
    });
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: VALID_PASSWORD },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), {
      target: { value: VALID_PASSWORD },
    });

    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    await waitFor(() => {
      expect(screen.getByText('No connection to server')).toBeInTheDocument();
    });
  });

  // ── Game PIN section ──────────────────────────────────────────────────────

  // SC-PIN-1: idle state
  it('SC-PIN-1: idle state shows Generate button, no PIN value visible, and shows explanatory paragraph', () => {
    render(<SettingsForm dialog={dialog} />);

    expect(screen.getByRole('button', { name: /generate dueling pin/i })).toBeInTheDocument();
    expect(screen.queryByTestId('game-pin-value')).not.toBeInTheDocument();
    expect(screen.getByText(/dueling pin lets external clients/i)).toBeInTheDocument();
  });

  // SC-PIN-2: click triggers fetch
  it('SC-PIN-2: clicking Generate PIN calls POST /users/game-password with Bearer, no body', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse({ ok: true, json: async () => ({ gamePassword: 'XK29' }) }),
    );
    render(<SettingsForm dialog={dialog} />);

    fireEvent.click(screen.getByRole('button', { name: /generate dueling pin/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://api.evolutionygo.com/api/v1/users/game-password',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Authorization': 'Bearer mock-token' }),
        }),
      );
    });

    const callOptions = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
    expect(callOptions.body).toBeUndefined();
  });

  // SC-PIN-3: button disabled while generating
  it('SC-PIN-3: button is disabled during generation', async () => {
    let resolveFetch!: (value: Response) => void;
    (fetch as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      new Promise<Response>((resolve) => { resolveFetch = resolve; }),
    );
    render(<SettingsForm dialog={dialog} />);

    const genBtn = screen.getByRole('button', { name: /generate dueling pin/i });
    fireEvent.click(genBtn);

    await waitFor(() => expect(genBtn).toBeDisabled());

    // Resolve to clean up pending promise
    await act(async () => {
      resolveFetch(mockResponse({ ok: true, json: async () => ({ gamePassword: 'XK29' }) }));
    });
    await waitFor(() => expect(screen.getByText('XK29')).toBeInTheDocument());
  });

  // SC-PIN-4: success shows PIN, copy button and shown-once warning
  it('SC-PIN-4: success shows PIN value, copy button, and shown-once warning', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse({ ok: true, json: async () => ({ gamePassword: 'XK29' }) }),
    );
    render(<SettingsForm dialog={dialog} />);

    fireEvent.click(screen.getByRole('button', { name: /generate dueling pin/i }));

    await waitFor(() => {
      expect(screen.getByText('XK29')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy|copiar/i })).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/this pin is shown only once/i)).toBeInTheDocument();
    });
  });

  // SC-PIN-5: copy button calls clipboard API
  it('SC-PIN-5: copy button calls navigator.clipboard.writeText with the PIN', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse({ ok: true, json: async () => ({ gamePassword: 'XK29' }) }),
    );
    render(<SettingsForm dialog={dialog} />);

    fireEvent.click(screen.getByRole('button', { name: /generate dueling pin/i }));
    await waitFor(() => expect(screen.getByText('XK29')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /copy|copiar/i }));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('XK29');
    });
  });

  // SC-PIN-6: regenerate re-calls endpoint and clears old PIN during generation
  it('SC-PIN-6: Regenerar button re-calls game-password and clears previous PIN', async () => {
    let resolveSecond!: (value: Response) => void;
    const secondFetch = new Promise<Response>((resolve) => { resolveSecond = resolve; });

    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(
        mockResponse({ ok: true, json: async () => ({ gamePassword: 'XK29' }) }),
      )
      .mockReturnValueOnce(secondFetch);

    render(<SettingsForm dialog={dialog} />);

    // First generate
    fireEvent.click(screen.getByRole('button', { name: /generate dueling pin/i }));
    await waitFor(() => expect(screen.getByText('XK29')).toBeInTheDocument());

    // Click Regenerate — old PIN should disappear during generation
    fireEvent.click(screen.getByRole('button', { name: /regenerate/i }));

    await waitFor(() => {
      expect(screen.queryByText('XK29')).not.toBeInTheDocument();
    });

    // Resolve second fetch
    await act(async () => {
      resolveSecond(mockResponse({ ok: true, json: async () => ({ gamePassword: 'AB42' }) }));
    });

    await waitFor(() => {
      expect(screen.getByText('AB42')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  // SC-PIN-7: API error shows error message
  it('SC-PIN-7: API error shows error message and component is in recoverable state', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse({ ok: false, status: 500, json: async () => ({}) }),
    );
    render(<SettingsForm dialog={dialog} />);

    fireEvent.click(screen.getByRole('button', { name: /generate dueling pin/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      // Generate button should be re-enabled (not in generating state)
      expect(screen.getByRole('button', { name: /generate dueling pin/i })).not.toBeDisabled();
    });
  });

  // SC-PIN-8: network failure
  it('SC-PIN-8: network failure shows No connection to server', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
    render(<SettingsForm dialog={dialog} />);

    fireEvent.click(screen.getByRole('button', { name: /generate dueling pin/i }));

    await waitFor(() => {
      expect(screen.getByText('No connection to server')).toBeInTheDocument();
    });
  });
});
