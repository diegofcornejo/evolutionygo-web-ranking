import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { UpgradePasswordForm } from '@components/Auth/UpgradePasswordForm';
import { updateSession } from '@stores/sessionStore';

vi.mock('react-svg', () => ({ ReactSVG: () => <span data-testid="svg" /> }));
vi.mock('@stores/sessionStore', () => ({
  updateSession: vi.fn(),
  getSession: vi.fn(() => ({
    token: 'current-tok',
    isLoggedIn: true,
    mustUpgrade: true,
    user: { id: '1', username: 'u' },
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

const VALID_PASSWORD = 'ValidPass1';

describe('UpgradePasswordForm', () => {
  const replaceMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve(mockResponse({})));
    Object.defineProperty(window, 'location', {
      value: { href: '', replace: replaceMock },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // SC-UPGRADE-4 — weak password disables submit button
  it('disables submit when password does not pass policy (SC-UPGRADE-4)', () => {
    render(<UpgradePasswordForm />);
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'abc' } });
    expect(screen.getByRole('button', { name: /set password/i })).toBeDisabled();
  });

  // SC-UPGRADE-5 — confirm mismatch blocks submit and shows error
  it('disables submit and shows mismatch error when passwords do not match (SC-UPGRADE-5)', () => {
    render(<UpgradePasswordForm />);
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'ValidPass2' } });
    expect(screen.getByRole('button', { name: /set password/i })).toBeDisabled();
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  // SC-UPGRADE-6 — happy path: correct fetch body and Bearer header
  it('sends POST with correct body and Authorization header (SC-UPGRADE-6)', async () => {
    render(<UpgradePasswordForm />);
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /set password/i }));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('users/upgrade-password'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer current-tok' }),
          body: JSON.stringify({ password: VALID_PASSWORD }),
        })
      );
    });
    // confirmPassword must not appear in the body
    const callArgs = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(JSON.parse(callArgs.body)).not.toHaveProperty('confirmPassword');
  });

  // SC-UPGRADE-7 — success: updateSession(token, mustUpgrade:false) + replace('/')
  it('updates session with new token and mustUpgrade:false then redirects to / (SC-UPGRADE-7)', async () => {
    (fetch as any).mockResolvedValueOnce(
      mockResponse({ ok: true, status: 200, json: async () => ({ id: 1, username: 'u', token: 'newTok' }) })
    );
    render(<UpgradePasswordForm />);
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /set password/i }));
    await waitFor(() => {
      expect(updateSession).toHaveBeenCalledWith(
        expect.objectContaining({ token: 'newTok', mustUpgrade: false })
      );
      expect(replaceMock).toHaveBeenCalledWith('/');
    });
  });

  // SC-UPGRADE-8 — 409: shows error message, no redirect
  it('shows error message on 409 without navigating (SC-UPGRADE-8)', async () => {
    (fetch as any).mockResolvedValueOnce(
      mockResponse({ ok: false, status: 409, json: async () => ({ message: 'Already upgraded' }) })
    );
    render(<UpgradePasswordForm />);
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /set password/i }));
    await waitFor(() => {
      expect(screen.getByText('Already upgraded')).toBeInTheDocument();
    });
    expect(replaceMock).not.toHaveBeenCalled();
  });

  // SC-UPGRADE-9 — network failure: 'No connection to server', no redirect
  it('shows "No connection to server" on network failure (SC-UPGRADE-9)', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));
    render(<UpgradePasswordForm />);
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /set password/i }));
    await waitFor(() => {
      expect(screen.getByText('No connection to server')).toBeInTheDocument();
    });
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
