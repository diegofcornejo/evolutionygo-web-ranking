import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { ResetAccountPasswordForm } from '@components/Auth/ResetAccountPasswordForm';
import { updateSession } from '@stores/sessionStore';

vi.mock('react-svg', () => ({ ReactSVG: () => <span data-testid="svg" /> }));
vi.mock('@stores/sessionStore', () => ({
  updateSession: vi.fn(),
  getSession: vi.fn(() => ({
    token: '',
    isLoggedIn: false,
    user: { id: '', username: '' },
  })),
}));

function mockResponse({ ok = true, status = 200, json = async () => ({}) }) {
  return {
    ok,
    status,
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

const VALID_PASSWORD = 'Secure9pass';
const RECOVERY_TOKEN = 'recov-tok';

describe('ResetAccountPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve(mockResponse({})));
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // SC-RESET-2 — weak password disables submit
  it('disables submit when password does not pass policy (SC-RESET-2)', () => {
    render(<ResetAccountPasswordForm token={RECOVERY_TOKEN} />);
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: '12345678' } });
    expect(screen.getByRole('button', { name: /reset password/i })).toBeDisabled();
  });

  // REQ-RESET-4 — confirm mismatch blocks submit (implied by policy gate)
  it('disables submit and shows mismatch error when passwords do not match', () => {
    render(<ResetAccountPasswordForm token={RECOVERY_TOKEN} />);
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'Differ1pass' } });
    expect(screen.getByRole('button', { name: /reset password/i })).toBeDisabled();
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  // SC-RESET-3 — happy path fetch call: correct endpoint, Bearer header, body {password} only
  it('sends POST with correct body and Authorization Bearer token (SC-RESET-3)', async () => {
    render(<ResetAccountPasswordForm token={RECOVERY_TOKEN} />);
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('users/reset-account-password'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: `Bearer ${RECOVERY_TOKEN}` }),
          body: JSON.stringify({ password: VALID_PASSWORD }),
        })
      );
    });
    const callArgs = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(JSON.parse(callArgs.body)).not.toHaveProperty('confirmPassword');
  });

  // SC-RESET-4 — auto-login on success: updateSession with token + mustUpgrade:false, redirect to /
  it('calls updateSession with new token and mustUpgrade:false then redirects to / (SC-RESET-4)', async () => {
    (fetch as any).mockResolvedValueOnce(
      mockResponse({
        ok: true,
        status: 200,
        json: async () => ({ id: 3, username: 'u3', token: 'newTok', migrated: true }),
      })
    );
    render(<ResetAccountPasswordForm token={RECOVERY_TOKEN} />);
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
    await waitFor(() => {
      expect(updateSession).toHaveBeenCalledWith(
        expect.objectContaining({ token: 'newTok', mustUpgrade: false })
      );
      expect(window.location.href).toBe('/');
    });
  });

  // SC-RESET-5 — 401 renders error, no session update
  it('shows error message on 401 without updating session (SC-RESET-5)', async () => {
    (fetch as any).mockResolvedValueOnce(
      mockResponse({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid or expired token' }),
      })
    );
    render(<ResetAccountPasswordForm token={RECOVERY_TOKEN} />);
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
    await waitFor(() => {
      expect(screen.getByText('Invalid or expired token')).toBeInTheDocument();
    });
    expect(updateSession).not.toHaveBeenCalled();
  });

  // SC-RESET-6 — network failure: 'No connection to server', no session update
  it('shows "No connection to server" on network failure (SC-RESET-6)', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));
    render(<ResetAccountPasswordForm token={RECOVERY_TOKEN} />);
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
    await waitFor(() => {
      expect(screen.getByText('No connection to server')).toBeInTheDocument();
    });
    expect(updateSession).not.toHaveBeenCalled();
  });
});
