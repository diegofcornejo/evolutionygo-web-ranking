import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { ResetPasswordForm } from '../../src/components/Auth/ResetPasswordForm';
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
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: false, statusText: 'fail', json: async () => ({}) }));
    render(<ResetPasswordForm token={token} />);
    fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('Repeat new password'), { target: { value: '1234' } });
    fireEvent.click(screen.getByText('Change Password'));
    await waitFor(() => expect(screen.getByText('fail')).toBeInTheDocument());
  });

  it('shows toast on successful reset', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: true, json: async () => ({}) }));
    render(<ResetPasswordForm token={token} />);
    fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('Repeat new password'), { target: { value: '1234' } });
    fireEvent.click(screen.getByText('Change Password'));
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });
}); 