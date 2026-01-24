import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { ResetPasswordForm } from '@components/Auth/ResetPasswordForm';
import { toast } from 'sonner';

vi.mock('react-svg', () => ({ ReactSVG: () => <span data-testid="svg" /> }));
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

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

describe('ResetPasswordForm', () => {
  const token = 'test-token';
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve(mockResponse({})));
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders password fields', () => {
    render(<ResetPasswordForm token={token} />);
    expect(screen.getByPlaceholderText('New password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repeat new password')).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    render(<ResetPasswordForm token={token} />);
    fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('Repeat new password'), { target: { value: '4321' } });
    fireEvent.click(screen.getByText('Change Password'));
    await waitFor(() => expect(screen.getByText('Passwords do not match')).toBeInTheDocument());
  });

  it('shows error on failed reset', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: false, json: async () => ({ message: 'Token expired' }) }));
    render(<ResetPasswordForm token={token} />);
    fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('Repeat new password'), { target: { value: '1234' } });
    fireEvent.click(screen.getByText('Change Password'));
    await waitFor(() => expect(screen.getByText('Token expired')).toBeInTheDocument());
  });

  it('shows default error when response has no message', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: false, json: async () => ({}) }));
    render(<ResetPasswordForm token={token} />);
    fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('Repeat new password'), { target: { value: '1234' } });
    fireEvent.click(screen.getByText('Change Password'));
    await waitFor(() => expect(screen.getByText('Invalid or expired token')).toBeInTheDocument());
  });

  it('shows toast and redirects on successful reset', async () => {
    const originalLocation = globalThis.location;
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: { href: 'http://localhost:3000/' },
    });
    vi.useFakeTimers();
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: true, json: async () => ({}) }));
    render(<ResetPasswordForm token={token} />);
    fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('Repeat new password'), { target: { value: '1234' } });
    fireEvent.click(screen.getByText('Change Password'));
    await vi.runAllTimersAsync();
    expect(toast.success).toHaveBeenCalled();
    expect(globalThis.location.href).toContain('/login');
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('shows connection error on network failure', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));
    render(<ResetPasswordForm token={token} />);
    fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('Repeat new password'), { target: { value: '1234' } });
    fireEvent.click(screen.getByText('Change Password'));
    await waitFor(() => expect(screen.getByText('No connection to server')).toBeInTheDocument());
  });
});
